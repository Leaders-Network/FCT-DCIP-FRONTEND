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
import {
    getClientName,
    getDisplayValue,
    getProjectAddress,
    getProjectDistrict,
    getProjectEstimateBand,
    getProjectLga,
    getProjectTitle
} from '@/utils/builderLiability';
import { PolicyDetailsModal } from './PolicyDetailsModal';
import { PremiumDetailsModal } from './PremiumDetailsModal';
import PaymentResultModal, { PaymentConfirmationResult } from './PaymentResultModal';
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
    CreditCard,
    RefreshCw
} from 'lucide-react';
import { toast } from "sonner"

type EgolePayConfig = {
    apiKey: string;
    amount: number;
    email: string;
    reference: string;
    customerName?: string;
    phone?: string;
    metadata?: Record<string, string>;
    onSuccess?: (response: unknown) => void;
    onCancel?: (info: unknown) => void;
    onError?: (error: { message?: string }) => void;
    onClose?: (info: unknown) => void;
    onStepChange?: (step: unknown) => void;
};

type EgolePayCtor = new (config: EgolePayConfig) => unknown;

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
    }>>({});
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);
    const [processingPremium, setProcessingPremium] = useState<string | null>(null);
    const [premiumModalPolicyId, setPremiumModalPolicyId] = useState<string | null>(null);
    const [retryLoading, setRetryLoading] = useState<string | null>(null);
    const [pendingPaymentConfirmation, setPendingPaymentConfirmation] = useState<{
        reference: string;
        policyId: string;
    } | null>(null);
    const [paymentResultModal, setPaymentResultModal] = useState<{
        isOpen: boolean;
        result: PaymentConfirmationResult;
        policyId?: string;
    } | null>(null);
    const egolePayApiKey = process.env.NEXT_PUBLIC_EGOLEPAY_API_KEY || '';
    const egolePayMerchantId =
        process.env.NEXT_PUBLIC_EGOLEPAY_MERCHANT_ID ||
        '22C811B4-EF62-48DA-8F35-E714F3992BC4';

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
                        }
                    };
                }
            });
            return next;
        });
    }, [policies]);

    useEffect(() => {
        if (!pendingPaymentConfirmation?.reference) return;

        let intervalId: number | null = null;
        let active = true;

        const pollPaymentStatus = async () => {
            try {
                const result = await builderLiabilityPolicyAPI.verifyEgolepayPayment(
                    pendingPaymentConfirmation.reference
                );

                if (!active) return;

                if (result.pending) {
                    return;
                }

                setPendingPaymentConfirmation(null);
                await fetchPolicies();

                if (result.success) {
                    toast.success('EgolePay payment confirmed');
                    setPaymentResultModal({
                        isOpen: true,
                        result: result as PaymentConfirmationResult,
                        policyId: pendingPaymentConfirmation.policyId
                    });
                    return;
                }

                toast.error(result.message || 'EgolePay payment verification failed');
                setPaymentResultModal({
                    isOpen: true,
                    result: result as PaymentConfirmationResult,
                    policyId: pendingPaymentConfirmation.policyId
                });
            } catch (error: any) {
                if (error?.response?.status === 404) {
                    toast.error('EgolePay payment reference was not found during retry verification.');
                    setPendingPaymentConfirmation(null);
                    return;
                }
            }
        };

        pollPaymentStatus();
        intervalId = window.setInterval(pollPaymentStatus, 300000);

        return () => {
            active = false;
            if (intervalId !== null) {
                window.clearInterval(intervalId);
            }
        };
    }, [pendingPaymentConfirmation, fetchPolicies]);

    const ensureEgolePaySdkLoaded = () =>
        new Promise<void>((resolve, reject) => {
            const existing = (window as Window & { EgolePay?: EgolePayCtor }).EgolePay;
            if (existing) {
                resolve();
                return;
            }

            const sdkUrl =
                process.env.NEXT_PUBLIC_EGOLEPAY_SDK_URL ||
                'https://pulsebridge.egolepay.com/pulsebridge-v0.0.js';

            const currentScript = document.querySelector(`script[src="${sdkUrl}"]`) as HTMLScriptElement | null;
            if (currentScript) {
                currentScript.addEventListener('load', () => resolve(), { once: true });
                currentScript.addEventListener('error', () => reject(new Error('Failed to load EgolePay SDK')), { once: true });
                return;
            }

            const script = document.createElement('script');
            script.src = sdkUrl;
            script.async = true;
            script.onload = () => resolve();
            script.onerror = () => reject(new Error('Failed to load EgolePay SDK'));
            document.body.appendChild(script);
        });

    const openPaymentModal = (policy: BuilderLiabilityPolicy) => {
        if (!premiumState[policy._id]) {
            setPremiumState((prev) => ({
                ...prev,
                [policy._id]: {
                    premiumDetails: {
                        amount: Number((policy as any)?.paymentInfo?.amount || 100),
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
                    }
                }
            }));
        }

        setPremiumModalPolicyId(policy._id);
        setShowPremiumModal(true);
    };

    const handleCalculatePremium = async (policy: BuilderLiabilityPolicy) => {
        try {
            setProcessingPremium(policy._id);
            const response = await builderLiabilityPolicyAPI.calculatePremium(policy._id);
            const premiumDetails = response.data?.premiumDetails;

            setPremiumState((prev) => ({
                ...prev,
                [policy._id]: {
                    premiumDetails: {
                        amount: premiumDetails?.amount ?? response.data?.premiumAmount ?? 0,
                        currency: premiumDetails?.currency || 'NGN',
                        invoiceNumber: premiumDetails?.invoiceNumber || null,
                        transactionReference: premiumDetails?.transactionReference || null,
                        builder: {
                            name: policy.builder.nameOfBuilder,
                            email: policy.builder.customerEmail,
                            phone: policy.builder.telNo
                        },
                        estimates: {
                            declaredProjectSum: policy.project.totalEstimateSum,
                            surveyorEstimate: (policy as any)?.surveyorEstimatedValue || null
                        }
                    }
                }
            }));

            toast.success(response.message || 'Premium calculated successfully');
            setPremiumModalPolicyId(policy._id);
            setShowPremiumModal(true);
            await fetchPolicies();
        } catch (error: any) {
            toast.error(
                error?.response?.data?.message ||
                error?.message ||
                'Failed to calculate premium'
            );
        } finally {
            setProcessingPremium(null);
        }
    };

    const getPaymentPayload = (
        policy: BuilderLiabilityPolicy,
        payload?: {
            reference: string;
            amount: number;
            email: string;
        }
    ) => {
        const premiumDetails = premiumState[policy._id]?.premiumDetails;
        const amount = Number(payload?.amount ?? premiumDetails?.amount ?? (policy as any)?.paymentInfo?.amount ?? 100);
        const generatedReference = `TXN_${policy.policyNumber}_${Date.now()}`;
        const reference = String(payload?.reference || generatedReference)
            .replace(/[^a-zA-Z0-9_-]/g, '_')
            .slice(0, 50);
        const email =
            payload?.email ||
            premiumDetails?.builder?.email ||
            policy.builder.customerEmail ||
            'customer@example.com';
        const customerName =
            premiumDetails?.builder?.name ||
            policy.builder.nameOfBuilder ||
            email.split('@')[0] ||
            'testuser';
        const phone =
            premiumDetails?.builder?.phone ||
            policy.builder.telNo ||
            '';

        return {
            amount,
            reference,
            email,
            customerName,
            phone,
            metadata: {
                source: 'builders_liability_modal',
                user_id: policy._id,
                merchant_id: egolePayMerchantId
            }
        };
    };

    const startPayment = (
        policy: BuilderLiabilityPolicy,
        payload?: {
            reference: string;
            amount: number;
            email: string;
        }
    ) => {
        const { amount, reference, email, customerName, phone, metadata } = getPaymentPayload(policy, payload);
        const launchPayment = async () => {
            setProcessingPayment(policy._id);

            try {
                if (!egolePayApiKey) {
                    throw new Error('EgolePay API key is missing. Add NEXT_PUBLIC_EGOLEPAY_API_KEY to the frontend env file.');
                }

                if (!amount || Number(amount) <= 0) {
                    throw new Error('Enter a valid amount before continuing.');
                }

                await ensureEgolePaySdkLoaded();
                const EgolePay = (window as Window & { EgolePay?: EgolePayCtor }).EgolePay;
                if (!EgolePay) {
                    throw new Error('EgolePay SDK failed to load.');
                }

                setShowPremiumModal(false);

                new EgolePay({
                    apiKey: egolePayApiKey,
                    amount: Number(amount),
                    email,
                    reference,
                    customerName,
                    phone,
                    metadata,
                    onSuccess: async (response) => {
                        try {
                            const responseObj = (response as Record<string, unknown>) || {};
                            const transactionItemsRaw = (responseObj as any)?.transactionItems;
                            const firstItem = Array.isArray(transactionItemsRaw) ? transactionItemsRaw[0] : null;
                            const pickRef = (...candidates: any[]) => {
                                for (const candidate of candidates) {
                                    if (Array.isArray(candidate)) {
                                        const found = candidate.find((val) => val != null && String(val).trim() !== '');
                                        if (found != null && String(found).trim() !== '') {
                                            return found;
                                        }
                                        continue;
                                    }
                                    if (candidate != null && String(candidate).trim() !== '') {
                                        return candidate;
                                    }
                                }
                                return undefined;
                            };
                            const normalizedGatewayResponse = {
                                ...responseObj,
                                transactionReference: pickRef(
                                    (responseObj as any)?.transactionReference,
                                    (responseObj as any)?.data?.transactionReference,
                                    (responseObj as any)?.Data?.TransactionReference,
                                    (responseObj as any)?.TxnRef,
                                    firstItem?.TxnRef,
                                    firstItem?.txnRef
                                ),
                                paymentReference: pickRef(
                                    (responseObj as any)?.Data?.PaymentRef,
                                    (responseObj as any)?.data?.PaymentRef,
                                    (responseObj as any)?.PaymentRef,
                                    firstItem?.PaymentRef,
                                    firstItem?.paymentRef
                                ),
                                transactionItems: Array.isArray(transactionItemsRaw) ? transactionItemsRaw : undefined
                            };
                            const result = await builderLiabilityPolicyAPI.confirmEgolepayPayment(
                                reference,
                                normalizedGatewayResponse,
                                policy._id
                            );

                            if (result.pending) {
                                setPendingPaymentConfirmation({ reference, policyId: policy._id });
                                toast.message(
                                    'Payment is pending confirmation. Verification will retry automatically.'
                                );
                                return;
                            }

                            if (result.niipWithdrawal?.success) {
                                // Both payment + NIIP succeeded — just show a brief toast
                                toast.success('Payment confirmed and NIIP wallet withdrawal completed');
                            } else {
                                // Any non-full-success case — open the rich modal
                                setPaymentResultModal({
                                    isOpen: true,
                                    result: result as PaymentConfirmationResult,
                                    policyId: policy._id,
                                });
                            }

                            await fetchPolicies();
                        } catch (confirmError: any) {
                            const errorMessage =
                                confirmError.response?.data?.message ||
                                confirmError.message ||
                                'Payment succeeded, but backend confirmation failed';
                            toast.error(errorMessage);
                        }
                    },
                    onCancel: () => {
                        toast.message('EgolePay payment was cancelled');
                    },
                    onError: (error) => {
                        toast.error(error?.message || 'EgolePay payment failed');
                    },
                    onClose: () => {
                        setProcessingPayment(null);
                    }
                });

                toast.success('EgolePay checkout opened');
            } catch (error: any) {
                const errorMessage = error.response?.data?.message || error.message || 'Failed to process payment';
                toast.error(`Payment Error\n\n${errorMessage}\n\nPlease try again.`);
            } finally {
                setProcessingPayment(null);
            }
        };

        void launchPayment();
    };

    const handleRetryNiipWithdrawal = async (policy: BuilderLiabilityPolicy) => {
        try {
            setRetryLoading(policy._id);
            const response = await builderLiabilityPolicyAPI.retryNiipWithdrawal(policy._id);

            if (response.niipWithdrawal?.success) {
                toast.success(response.message || "NIIP wallet withdrawal successful");
                // Refresh policies to update status to 'completed'
                await fetchPolicies();
            } else {
                // Show the result modal even on partial failure so they can see the HTML error
                setPaymentResultModal({
                    isOpen: true,
                    result: {
                        ...response,
                        // Ensure success is true if NIIP failed but payment is known-good (which it is for retries)
                        success: true 
                    },
                    policyId: policy._id,
                });
            }
        } catch (error: any) {
            toast.error(error.response?.data?.message || "Failed to retry NIIP withdrawal");
        } finally {
            setRetryLoading(null);
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
        const latestStatus =
            policy.statusHistory && policy.statusHistory.length > 0
                ? policy.statusHistory[policy.statusHistory.length - 1]?.status
                : policy.status;

        const paymentAlreadyCompleted =
            policy.paymentInfo?.status === 'paid' || Boolean(policy.paymentInfo?.paidAt);

        // Backward-compatibility for older records that were marked completed
        // immediately after survey submission, before the payment flow ran.
        if (latestStatus === 'completed' && !paymentAlreadyCompleted) {
            if ((policy as any).surveyorRecommendation === 'approve') {
                return 'payment_pending';
            }
            if ((policy as any).surveyorRecommendation === 'reject') {
                return 'rejected';
            }
            if ((policy as any).surveyorRecommendation === 'request_more_info') {
                return 'requires_more_info';
            }
        }

        return latestStatus || 'draft';
    };

    const getResolvedAction = (policy: BuilderLiabilityPolicy) =>
        policy.primaryAction ||
        policy.nextAction ||
        policy.workflow?.nextAction ||
        policy.availableActions?.[0] ||
        null;

    const shouldShowCalculatePremium = (policy: BuilderLiabilityPolicy) => {
        const action = getResolvedAction(policy);
        return Boolean(
            policy.showCalculatePremiumButton ||
            (policy.canCalculatePremium && !policy.premiumCalculated) ||
            action?.type === 'calculate_premium' ||
            (getActualStatus(policy) === 'approved' &&
                (policy as any).surveyorRecommendation === 'approve' &&
                !policy.premiumCalculated)
        );
    };

    const shouldShowProceedToPayment = (policy: BuilderLiabilityPolicy) => {
        const action = getResolvedAction(policy);
        return Boolean(
            policy.canProceedToPayment ||
            action?.type === 'initialize_payment' ||
            getActualStatus(policy) === 'payment_pending'
        );
    };

    // Filter policies based on search and filters
    const filteredPolicies = policies.filter(policy => {
        const normalizedSearch = searchQuery.toLowerCase();
        const clientName = getClientName(policy.client)?.toLowerCase() || '';
        const projectTitle = getProjectTitle(policy.project)?.toLowerCase() || '';
        const cadastralZone = policy.project?.cadastralZone?.toLowerCase() || '';

        const matchesSearch = !searchQuery ||
            policy.builder.nameOfBuilder.toLowerCase().includes(normalizedSearch) ||
            policy.builder.customerEmail.toLowerCase().includes(normalizedSearch) ||
            policy.policyNumber.toLowerCase().includes(normalizedSearch) ||
            policy.builder.rcNumber.toLowerCase().includes(normalizedSearch) ||
            clientName.includes(normalizedSearch) ||
            projectTitle.includes(normalizedSearch) ||
            cadastralZone.includes(normalizedSearch);

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
            payment_pending: { color: 'bg-orange-100 text-orange-800', icon: CreditCard, label: 'Awaiting Payment' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
            requires_more_info: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            revision_required: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
            sent_to_user: { color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle, label: 'Sent to User' },
            paid_niip_failed: { color: 'bg-rose-100 text-rose-800', icon: AlertCircle, label: 'Payment OK, NIIP Failed' }
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
                    <h2 className="text-2xl font-bold text-gray-900">Builders Liability Policies</h2>
                    <p className="text-gray-600">
                        {isAdmin ? 'Manage all Builders Liability Policy applications' : 'Your Builders Liability Policy applications'}
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
                                placeholder="Search by contractor, client, property title, cadastral zone, policy number, or RC number..."
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
                                <SelectItem value="payment_pending">Awaiting Payment</SelectItem>
                                <SelectItem value="rejected">Rejected</SelectItem>
                                <SelectItem value="completed">Completed</SelectItem>
                                <SelectItem value="paid_niip_failed">NIIP Failed</SelectItem>
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
                                {(() => {
                                    const projectTitle = getProjectTitle(policy.project);
                                    const clientName = getClientName(policy.client);
                                    const projectAddress = getProjectAddress(policy.project, policy.builder);
                                    const projectLga = getProjectLga(policy.project);
                                    const projectDistrict = getProjectDistrict(policy.project);
                                    const projectEstimateBand = getProjectEstimateBand(policy.project);

                                    return (
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                                    <div className="flex-1 min-w-0 space-y-3">
                                        {/* Header */}
                                        <div className="flex flex-col gap-2 sm:flex-row sm:items-start sm:justify-between">
                                            <div className="min-w-0">
                                                <h3 className="text-base sm:text-lg font-semibold text-gray-900 break-words">
                                                    {projectTitle || policy.builder.nameOfBuilder}
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
                                                    <p className="text-gray-600">Contractor</p>
                                                    <p className="font-medium break-words">
                                                        {policy.builder.nameOfBuilder}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Client</p>
                                                    <p className="font-medium break-words">
                                                        {getDisplayValue(clientName)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <Building className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Estimated Sum Range</p>
                                                    <p className="font-medium break-words">
                                                        {getDisplayValue(projectEstimateBand)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 break-words">
                                                        Stored ceiling: {formatCurrency(policy.project.totalEstimateSum)}
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start gap-2 min-w-0">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div className="min-w-0">
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-medium break-words">
                                                        {getDisplayValue(projectAddress)}
                                                    </p>
                                                    <p className="text-[11px] text-gray-500 break-words">
                                                        {[projectDistrict, projectLga].filter(Boolean).join(', ') || getDisplayValue(policy.project?.cadastralZone)}
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
                                                    Property: {getDisplayValue(projectTitle)}
                                                </span>
                                                <span className="break-words">
                                                    Coverage: {policy.project.coverTypeIdxDetails}
                                                </span>
                                                {policy.project?.cadastralZone && (
                                                    <span className="break-words">
                                                        Zone: {policy.project.cadastralZone}
                                                    </span>
                                                )}
                                                {policy.project.extraHazardous && (
                                                    <Badge variant="outline" className="text-[10px] sm:text-xs">
                                                        Extra Hazardous
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex flex-wrap items-center gap-2 justify-end">
                                                {/* Show payment button only once the survey is approved and awaiting payment */}
                                                {shouldShowCalculatePremium(policy) && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-amber-600 hover:bg-amber-700"
                                                        onClick={() => handleCalculatePremium(policy)}
                                                        disabled={processingPremium === policy._id}
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        {processingPremium === policy._id
                                                            ? 'Calculating...'
                                                            : 'Calculate Premium'}
                                                    </Button>
                                                )}
                                                {shouldShowProceedToPayment(policy) && (
                                                    <>
                                                        <Button
                                                            size="sm"
                                                            className="bg-green-600 hover:bg-green-700"
                                                            onClick={() => openPaymentModal(policy)}
                                                            disabled={processingPayment === policy._id || processingPremium === policy._id}
                                                        >
                                                            <CreditCard className="w-4 h-4 mr-2" />
                                                            {processingPayment === policy._id
                                                                ? 'Processing...'
                                                                : 'Proceed to Payment'}
                                                        </Button>
                                                    </>
                                                )}
                                                {getActualStatus(policy) === 'paid_niip_failed' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-orange-600 hover:bg-orange-700"
                                                        onClick={() => handleRetryNiipWithdrawal(policy)}
                                                        disabled={retryLoading === policy._id}
                                                    >
                                                        <RefreshCw className={`w-4 h-4 mr-2 ${retryLoading === policy._id ? 'animate-spin' : ''}`} />
                                                        {retryLoading === policy._id
                                                            ? 'Retrying...'
                                                            : 'Retry NIIP Withdrawal'}
                                                    </Button>
                                                )}
                                                {/* Show rejection message if rejected */}
                                                {getActualStatus(policy) === 'rejected' && (policy as any).surveyorRecommendation === 'reject' && (
                                                    <Badge className="bg-red-100 text-red-800">
                                                        <XCircle className="w-3 h-3 mr-1" />
                                                        Policy Rejected
                                                    </Badge>
                                                )}
                                                {/* Show info needed message */}
                                                {getActualStatus(policy) === 'requires_more_info' && (policy as any).surveyorRecommendation === 'request_more_info' && (
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
                                    );
                                })()}
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
                onProceed={(payload) => {
                    if (!premiumModalPolicyId) return;
                    const policy = policies.find(p => p._id === premiumModalPolicyId);
                    if (policy) {
                        startPayment(policy, payload);
                    }
                }}
                loading={processingPayment === premiumModalPolicyId}
            />
            {paymentResultModal && (
                <PaymentResultModal
                    isOpen={paymentResultModal.isOpen}
                    result={paymentResultModal.result}
                    onClose={() => setPaymentResultModal(null)}
                    onRetry={() => {
                        const policy = policies.find(p => p._id === paymentResultModal.policyId);
                        if (policy) handleRetryNiipWithdrawal(policy);
                    }}
                    retryLoading={paymentResultModal.policyId ? retryLoading === paymentResultModal.policyId : false}
                />
            )}
        </div>
    );
};

export default BuilderLiabilityPolicyList;
