"use client";

import React, { useState } from 'react';
import { useBuilderLiabilityPolicies } from '@/hooks/useBuilderLiabilityPolicy';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { BuilderLiabilityPolicy, BuilderLiabilityPolicyStatus } from '@/types/builderLiabilityPolicy.types';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { PolicyDetailsModal } from './PolicyDetailsModal';
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
    const [processingPayment, setProcessingPayment] = useState<string | null>(null);

    const handleProceedToPayment = async (policy: BuilderLiabilityPolicy) => {
        try {
            setProcessingPayment(policy._id);

            // Make request to NIIP payment gateway
            const response = await fetch('http://uat.niip.ng/api/payment/initiate', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                },
                body: JSON.stringify({
                    policyNumber: policy.policyNumber,
                    policyId: policy._id,
                    amount: policy.project.totalEstimateSum,
                    builderName: policy.builder.nameOfBuilder,
                    builderEmail: policy.builder.customerEmail,
                    builderPhone: policy.builder.telNo,
                    rcNumber: policy.builder.rcNumber
                })
            });

            if (!response.ok) {
                throw new Error('Failed to initiate payment');
            }

            const data = await response.json();

            if (data.success && data.transactionId) {
                // Redirect to payment page or open payment modal
                window.location.href = `http://uat.niip.ng/payment/${data.transactionId}`;
            } else {
                throw new Error(data.message || 'Payment initiation failed');
            }
        } catch (error) {
            console.error('Payment error:', error);
            alert('Failed to initiate payment. Please try again or contact support.');
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
                            <CardContent className="p-6">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1 space-y-3">
                                        {/* Header */}
                                        <div className="flex items-start justify-between">
                                            <div>
                                                <h3 className="text-lg font-semibold text-gray-900">
                                                    {policy.builder.nameOfBuilder}
                                                </h3>
                                                <p className="text-sm text-gray-600">
                                                    Policy #{policy.policyNumber}
                                                </p>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {getStatusBadge(getActualStatus(policy) as BuilderLiabilityPolicyStatus)}
                                                {getPriorityBadge(policy.priority || 'medium')}
                                            </div>
                                        </div>

                                        {/* Details Grid */}
                                        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 text-sm">
                                            <div className="flex items-center gap-2">
                                                <User className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">Builder</p>
                                                    <p className="font-medium">{policy.builder.nameOfBuilder}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Building className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">Project Value</p>
                                                    <p className="font-medium">{formatCurrency(policy.project.totalEstimateSum)}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <MapPin className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">Location</p>
                                                    <p className="font-medium truncate">{policy.builder.address}</p>
                                                </div>
                                            </div>
                                            <div className="flex items-center gap-2">
                                                <Calendar className="w-4 h-4 text-gray-400" />
                                                <div>
                                                    <p className="text-gray-600">Submitted</p>
                                                    <p className="font-medium">
                                                        {new Date(policy.createdAt).toLocaleDateString()}
                                                    </p>
                                                </div>
                                            </div>
                                        </div>

                                        {/* Additional Info */}
                                        <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                                            <div className="flex items-center gap-4 text-sm text-gray-600">
                                                <span>RC: {policy.builder.rcNumber}</span>
                                                <span>Coverage: {policy.project.coverTypeIdxDetails}</span>
                                                {policy.project.extraHazardous && (
                                                    <Badge variant="outline" className="text-xs">
                                                        Extra Hazardous
                                                    </Badge>
                                                )}
                                            </div>
                                            <div className="flex items-center gap-2">
                                                {/* Show payment button only if survey is completed and approved */}
                                                {getActualStatus(policy) === 'completed' && (policy as any).surveyorRecommendation === 'approve' && (
                                                    <Button
                                                        size="sm"
                                                        className="bg-green-600 hover:bg-green-700"
                                                        onClick={() => handleProceedToPayment(policy)}
                                                        disabled={processingPayment === policy._id}
                                                    >
                                                        <CreditCard className="w-4 h-4 mr-2" />
                                                        {processingPayment === policy._id ? 'Processing...' : 'Proceed to Payment'}
                                                    </Button>
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
        </div>
    );
};

export default BuilderLiabilityPolicyList;