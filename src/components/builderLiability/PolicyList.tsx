"use client";

import React, { useEffect, useState } from 'react';
import { useBuilderLiabilityPolicies } from '@/hooks/useBuilderLiabilityPolicy';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { BuilderLiabilityPolicy, BuilderLiabilityPolicyStatus } from '@/types/builderLiabilityPolicy.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyDetailsModal } from './PolicyDetailsModal';
import { PremiumDetailsModal } from './PremiumDetailsModal';
import {
    Eye,
    Search,
    Filter,
    Calendar,
    Building,
    User,
    MapPin,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    CreditCard
} from 'lucide-react';
import { toast } from "sonner"

// Load Egolepay SDK dynamically (singleton)
type SdkLoadError = Error & { tried?: string[] };

const loadEgolePaySDK = (sdkUrl?: string) => {
    const resolvedSdkUrl = process.env.NEXT_PUBLIC_EGOLEPAY_SDK_URL || sdkUrl;

    return new Promise<void>((resolve, reject) => {
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        if ((window as any).EgolePay) return resolve();
        if (!resolvedSdkUrl) {
            const err: SdkLoadError = Object.assign(new Error('Missing Egolepay SDK URL'), { tried: [] });
            reject(err);
            return;
        }

        const script = document.createElement('script');
        script.src = resolvedSdkUrl;
        script.async = true;
        script.onload = () => {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((window as any).EgolePay) {
                resolve();
                return;
            }
            script.remove();
            const err: SdkLoadError = Object.assign(new Error('Egolepay SDK loaded without EgolePay global'), { tried: [resolvedSdkUrl] });
            reject(err);
        };
        script.onerror = () => {
            script.remove();
            const err: SdkLoadError = Object.assign(new Error('Failed to load Egolepay SDK'), { tried: [resolvedSdkUrl] });
            reject(err);
        };
        document.body.appendChild(script);
    });
};

interface PolicyListProps {
    isAdmin?: boolean;
    onPolicySelect?: (policy: BuilderLiabilityPolicy) => void;
}

export const BuilderLiabilityPolicyList: React.FC<PolicyListProps> = ({
    isAdmin = false,
    onPolicySelect
}) => {
    const { policies, loading, error, fetchPolicies } = useBuilderLiabilityPolicies(isAdmin);

    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<string>('all');
    const [priorityFilter, setPriorityFilter] = useState<string>('all');
    const [selectedPolicy, setSelectedPolicy] = useState<BuilderLiabilityPolicy | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [showPremiumModal, setShowPremiumModal] = useState(false);
    const [premiumState, setPremiumState] = useState<Record<string, {
        premiumDetails: any;
        nextAction?: { url: string; method: string; label?: string; type?: string };
    }>>({});
    const [calculatingPremium, setCalculatingPremium] = useState<string | null>(null);
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [premiumModalPolicyId, setPremiumModalPolicyId] = useState<string | null>(null);

    // Seed premium state from already-calculated policies so buttons don't regress on reload
    useEffect(() => {
        setPremiumState((prev) => {
            const next = { ...prev };
            policies.forEach((policy) => {
                const calculatedAmount = (policy as any)?.paymentInfo?.amount;
                if (calculatedAmount && !next[policy._id]) {
                    next[policy._id] = {
                        premiumDetails: {
                            amount: calculatedAmount,
                            currency: 'NGN',
                            invoiceNumber: (policy as any)?.paymentInfo?.niipInvoice || (policy as any)?.niipPayload?.invoiceNumber || null,
                            transactionReference: (policy as any)?.paymentInfo?.niipReference || (policy as any)?.niipPayload?.transactionReference || null,
                            builder: {
                                name: policy.builder.nameOfBuilder,
                                email: policy.builder.customerEmail,
                                phone: policy.builder.telNo
                            },
                            estimates: {
                                declaredProjectSum: policy.project.totalEstimateSum,
                                surveyorEstimate: (policy as any)?.surveyorEstimatedValue || null
                            }
                        },
                        nextAction: {
                            label: 'Proceed to payment',
                            method: 'POST',
                            url: `/payment/Egolepay/initialize/${policy._id}`
                        }
                    };
                }
            });
            return next;
        });
    }, [policies]);

    const handleCalculatePremium = async (policy: BuilderLiabilityPolicy) => {
        try {
            setCalculatingPremium(policy._id);

            console.log('💳 Calculating premium via NIIP...');

            const api = (await import('@/services/api')).default;

            // Step 1–2: calculate premium via NIIP
            const premiumResponse = await api.post(`/payment/calculate-premium/${policy._id}`);
            const premiumData = premiumResponse.data;

            console.log('Premium Response:', premiumData);

            if (!premiumData.success || !premiumData.data) {
                throw new Error(premiumData.message || 'Premium calculation failed');
            }

            const premiumDetails = premiumData.data.premiumDetails || { amount: premiumData.data.premiumAmount };
            const nextAction = premiumData.data.nextAction
                ? { ...premiumData.data.nextAction, url: normalizeApiPath(premiumData.data.nextAction.url) }
                : undefined;

            setPremiumState(prev => ({
                ...prev,
                [policy._id]: {
                    premiumDetails,
                    nextAction
                }
            }));

            setPremiumModalPolicyId(policy._id);
            setShowPremiumModal(true);
        } catch (error: any) {
            console.error('Payment error:', error);
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process payment';
            toast.error(`❌ Payment Error\n\n${errorMessage}\n\nPlease try again or contact support.`);
        } finally {
            setCalculatingPremium(null);
        }
    };

    const normalizeApiPath = (path?: string) => {
        if (!path) return '';
        // Remove any leading /api/v1 since the axios baseURL already includes it
        const cleaned = path.replace(/^\/?api\/v1/, '');
        return cleaned.startsWith('/') ? cleaned : `/${cleaned}`;
    };

    const handleProceedToPayment = async (policy: BuilderLiabilityPolicy) => {
        const state = premiumState[policy._id];
        const amount = state?.premiumDetails?.amount || (policy as any)?.paymentInfo?.amount;
        const email = policy.builder.customerEmail;
        const referenceNumber = `BL_${policy.policyNumber || policy._id}_${Date.now()}`;
        const sdkUrl = process.env.NEXT_PUBLIC_EGOLEPAY_SDK_URL;
        const apiKey = process.env.NEXT_PUBLIC_EGOLEPAY_BROWSER_KEY || process.env.NEXT_PUBLIC_EGOLEPAY_PUBLIC_KEY;

        try {
            setProcessingPayment(policy._id);

            if (!amount || !email) {
                throw new Error('Premium amount or email missing; calculate premium first.');
            }
            if (!sdkUrl) {
                throw new Error('Egolepay SDK URL is not configured');
            }
            if (!apiKey) {
                throw new Error('Egolepay browser key is not configured');
            }

            await loadEgolePaySDK(sdkUrl);

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const EgolePay = (window as any).EgolePay;
            if (!EgolePay) {
                throw new Error('Egolepay SDK failed to load');
            }

            const api = (await import('@/services/api')).default;

            new EgolePay({
                apiKey,
                referenceNumber,
                amount,
                email,
                onSuccess: async () => {
                    try {
                        await api.post('/payment/Egolepay/verify', {
                            reference: referenceNumber,
                            policyId: policy._id,
                            amount
                        });
                        toast.success('Payment completed!');
                        fetchPolicies();
                    } catch (verifyErr: any) {
                        const msg = verifyErr?.response?.data?.message || verifyErr?.message || 'Verification failed';
                        toast.error(`Verification error\n\n${msg}`);
                    }
                },
                onError: (sdkError: { message?: string }) => {
                    toast.error(sdkError?.message || 'Egolepay checkout failed');
                },
                onClose: () => {
                    toast.info('Payment window closed');
                }
            });
        } catch (error: any) {
            console.error('Payment error:', error);
            const attempted = error?.tried ? `\nTried: ${error.tried.join(', ')}` : '';
            const errorMessage = error.response?.data?.message || error.message || 'Failed to process payment';
            toast.error(`Payment Error\n\n${errorMessage}${attempted ? '\n\n' + attempted : ''}\n\nPlease try again or contact support.`);
        } finally {
            setProcessingPayment(null);
        }
    };

    const handleViewDetails = async (policy: BuilderLiabilityPolicy) => {
        try {
            // Fetch the complete policy data by ID to get all fields
            const response = await builderLiabilityPolicyAPI.getPolicyById(policy._id);
            const fullPolicy = response.data.policy;

            setSelectedPolicy(fullPolicy);
            setShowDetailsModal(true);
            if (onPolicySelect) {
                onPolicySelect(fullPolicy);
            }
        } catch (error) {
            console.error('Failed to fetch full policy details:', error);
            // Fallback to showing partial data if fetch fails
            setSelectedPolicy(policy);
            setShowDetailsModal(true);
            if (onPolicySelect) {
                onPolicySelect(policy);
            }
        }
    };

    const handleCloseModal = () => {
        setShowDetailsModal(false);
        setSelectedPolicy(null);
    };

    // Helper function to get the actual current status from statusHistory if available
    const getActualStatus = (policy: BuilderLiabilityPolicy): string => {
        // If statusHistory exists and has entries, use the most recent status
        if (policy.statusHistory && policy.statusHistory.length > 0) {
            const latestStatus = policy.statusHistory[policy.statusHistory.length - 1];
            return latestStatus.status;
        }
        // Otherwise, use the policy status field
        return policy.status || 'draft';
    };

    // Filter policies based on search and filters
    const filteredPolicies = policies.filter(policy => {
        const matchesSearch = !searchQuery ||
            policy.builder.nameOfBuilder.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.builder.customerEmail.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.policyNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
            policy.builder.rcNumber.toLowerCase().includes(searchQuery.toLowerCase());

        const matchesStatus = statusFilter === 'all' || getActualStatus(policy) === statusFilter;
        const matchesPriority = priorityFilter === 'all' || policy.priority === priorityFilter;

        return matchesSearch && matchesStatus && matchesPriority;
    });

    const getStatusBadge = (status: BuilderLiabilityPolicyStatus) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
            submitted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Submitted' },
            assigned: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Assigned' },
            surveyed: { color: 'bg-purple-100 text-purple-800', icon: Eye, label: 'Surveyed' },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
            payment_pending: { color: 'bg-orange-100 text-orange-800', icon: CreditCard, label: 'Payment Pending' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
            requires_more_info: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            revision_required: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
            sent_to_user: { color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle, label: 'Sent to User' }
        };

        const config = statusConfig[status] || statusConfig.submitted;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig = {
            low: 'bg-green-100 text-green-800',
            medium: 'bg-yellow-100 text-yellow-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };

        return (
            <Badge className={priorityConfig[priority as keyof typeof priorityConfig] || priorityConfig.medium}>
                {priority?.toUpperCase() || 'MEDIUM'}
            </Badge>
        );
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="space-y-4">
                {[1, 2, 3].map((i) => (
                    <Card key={i} className="animate-pulse">
                        <CardContent className="p-6">
                            <div className="flex items-start justify-between">
                                <div className="flex-1 space-y-2">
                                    <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                                </div>
                                <div className="h-6 bg-gray-300 rounded w-20"></div>
                            </div>
                        </CardContent>
                    </Card>
                ))}
            </div>
        );
    }

    if (error) {
        return (
            <Card>
                <CardContent className="p-6 text-center">
                    <XCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Policies</h3>
                    <p className="text-gray-600 mb-4">{error}</p>
                    <Button onClick={() => fetchPolicies()}>Try Again</Button>
                </CardContent>
            </Card>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row gap-4 items-start sm:items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">Builder Liability Policies</h2>
                    <p className="text-gray-600">
                        {isAdmin ? 'Manage all Builder Liability Policy applications' : 'Your Builder Liability Policy applications'}
                    </p>
                </div>
                <div className="flex items-center gap-2">
                    <Badge variant="outline" className="text-sm">
                        {filteredPolicies.length} of {policies.length} policies
                    </Badge>
                </div>
            </div>

            {/* Filters */}
            <Card>
                <CardContent className="p-4">
                    <div className="flex flex-col sm:flex-row gap-4">
                        <div className="flex-1 relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <Input
                                placeholder="Search by builder name, email, policy number, or RC number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                className="pl-10"
                            />
                        </div>
                        <Select value={statusFilter} onValueChange={setStatusFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by status" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Statuses</SelectItem>
                                <SelectItem value="draft">Draft</SelectItem>
                                <SelectItem value="submitted">Submitted</SelectItem>
                                <SelectItem value="assigned">Assigned</SelectItem>
                                <SelectItem value="surveyed">Surveyed</SelectItem>
                                <SelectItem value="approved">Approved</SelectItem>
                                <SelectItem value="payment_pending">Payment Pending</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                            </SelectContent>
                        </Select>
                        <Select value={priorityFilter} onValueChange={setPriorityFilter}>
                            <SelectTrigger className="w-full sm:w-48">
                                <SelectValue placeholder="Filter by priority" />
                            </SelectTrigger>
                            <SelectContent>
                                <SelectItem value="all">All Priorities</SelectItem>
                                <SelectItem value="low">Low</SelectItem>
                                <SelectItem value="medium">Medium</SelectItem>
                                <SelectItem value="high">High</SelectItem>
                                <SelectItem value="urgent">Urgent</SelectItem>
                            </SelectContent>
                        </Select>
                    </div>
                </CardContent>
            </Card>

            {/* Policy List */}
            {filteredPolicies.length === 0 ? (
                <Card>
                    <CardContent className="p-12 text-center">
                        <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">
                            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'No matching policies found'
                                : 'No policies yet'}
                        </h3>
                        <p className="text-gray-600">
                            {searchQuery || statusFilter !== 'all' || priorityFilter !== 'all'
                                ? 'Try adjusting your search or filters'
                                : 'Builder Liability Policy applications will appear here'}
                        </p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-4">
                    {filteredPolicies.map((policy) => (
                        <Card key={policy._id} className="hover:shadow-md transition-shadow">
                            <CardContent className="p-4 sm:p-6">
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Header */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                                    {policy.builder.nameOfBuilder}
                                                </h3>
                                                <p className="text-xs sm:text-sm text-gray-600 break-words">
                                                    Policy #{policy.policyNumber}
                                                </p>
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end sm:flex-none">
                                                {getStatusBadge(getActualStatus(policy) as BuilderLiabilityPolicyStatus)}
                                                {getPriorityBadge(policy.priority || 'medium')}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 sm:gap-4 text-xs sm:text-sm">
                                            <div className="flex items-start gap-2 min-w-0">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Builder</p>
                                                    <p className="font-medium break-words">
                                                        {policy.builder.nameOfBuilder}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <Building className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Project Value</p>
                                                    <p className="font-medium break-words">
                                                        {formatCurrency(policy.project.totalEstimateSum)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-medium break-words">
                                                        {policy.builder.address}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Submitted</p>
                                                    <p className="font-medium break-words">
                                                        {new Date(policy.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between pt-2 border-t border-gray-100">
                                            <div className="flex flex-wrap items-center gap-2 sm:gap-4 text-xs sm:text-sm text-gray-600">
                                                <span className="break-all">RC: {policy.builder.rcNumber}</span>
                                                <span className="break-words">
                                                    Coverage: {policy.project.coverTypeIdxDetails}
                                                </span>
                                                {policy.project.extraHazardous && (
                                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                                        Extra Hazardous
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end">
                                                {/* Show payment button only if survey is completed and approved */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'approve' && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => premiumState[policy._id]
                                                                ? handleProceedToPayment(policy)
                                                                : handleCalculatePremium(policy)}
                                                            disabled={processingPayment === policy._id || calculatingPremium === policy._id}
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            {processingPayment === policy._id
                                                                ? 'Processing...'
                                                                : premiumState[policy._id]
                                                                    ? 'Proceed to Payment'
                                                                    : calculatingPremium === policy._id
                                                                        ? 'Calculating...'
                                                                        : 'Calculate Premium'}
                                                        </Button>
                                                        {premiumState[policy._id] && (
                                                            <Button
                                                                size="sm"
                                                                variant="outline"
                                                                onClick={() => {
                                                                    setPremiumModalPolicyId(policy._id);
                                                                    setShowPremiumModal(true);
                                                                }}
                                                            >
                                                                View Premium
                                                            </Button>
                                                        )}
                                                    </>
                                                )}
                                                {/* Show rejection message if rejected */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'reject' && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Policy Rejected
                                                    </Badge>
                                                )}
                                                {/* Show info needed message */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'request_more_info' && (
                                                    <Badge className="bg-amber-100 text-amber-800">
                                                        <AlertCircle className="w-3 h-3 mr-1" />
                                                        More Info Required
                                                    </Badge>
                                                )}
                                                <Button
                                                    size="sm"
                                                    variant="outline"
                                                    onClick={() => handleViewDetails(policy)}
                                                >
                                                    <Eye className="w-4 h-4 mr-2" />
                                                    View Details
                                                </Button>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    ))}
                </div>
            )}

            {/* Policy Details Modal */}
            <PolicyDetailsModal
                policy={selectedPolicy}
                isOpen={showDetailsModal}
                onClose={handleCloseModal}
            />
            <PremiumDetailsModal
                isOpen={showPremiumModal}
                onClose={() => setShowPremiumModal(false)}
                premiumDetails={premiumModalPolicyId ? premiumState[premiumModalPolicyId]?.premiumDetails : null}
                policy={premiumModalPolicyId ? policies.find(p => p._id === premiumModalPolicyId) || null : null}
                onProceed={() => {
                    if (!premiumModalPolicyId) return;
                    const policy = policies.find(p => p._id === premiumModalPolicyId);
                    if (policy) {
                        handleProceedToPayment(policy);
                    }
                }}
                loading={processingPayment === premiumModalPolicyId}
            />
        </div>
    );
};

export default BuilderLiabilityPolicyList;

