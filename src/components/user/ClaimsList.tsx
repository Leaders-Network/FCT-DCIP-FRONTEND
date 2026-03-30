'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    AlertCircle,
    Calendar,
    Home,
    DollarSign,
    RefreshCw,
    Eye
} from 'lucide-react';
import api from '@/services/api';
import type { BrokerPolicyRequest } from '@/types/api.types';

// Use the proper type from api.types.ts
type Claim = BrokerPolicyRequest;

interface ClaimsListProps {
    refreshTrigger?: number;
}

export const ClaimsList: React.FC<ClaimsListProps> = ({ refreshTrigger }) => {
    const [claims, setClaims] = useState<Claim[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [refreshing, setRefreshing] = useState(false);
    const [selectedClaim, setSelectedClaim] = useState<Claim | null>(null);
    const [claimDetails, setClaimDetails] = useState<any>(null);
    const [loadingDetails, setLoadingDetails] = useState(false);

    useEffect(() => {
        fetchClaims();

        // Set up polling for real-time updates (every 30 seconds)
        const interval = setInterval(fetchClaims, 30000);

        return () => clearInterval(interval);
    }, []);

    // Handle external refresh trigger
    useEffect(() => {
        if (refreshTrigger && refreshTrigger > 0) {
            fetchClaims();
        }
    }, [refreshTrigger]);

    const fetchClaims = async () => {
        try {
            if (!refreshing) setLoading(true);

            const response = await api.get<{
                success: boolean;
                count?: number;
                claims?: Claim[];
            }>('/claims/user');

            if (response.data.success) {
                setClaims(response.data.claims || []);
            }
        } catch (err) {
            console.error('Failed to fetch claims:', err);
            setError('Failed to load claims');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchClaims();
    };

    const handleViewDetails = async (claim: Claim) => {
        setSelectedClaim(claim);
        setLoadingDetails(true);

        try {
            // Try to fetch detailed claim information
            const response = await api.get(`/claims/${claim._id}`);
            if (response.data.success) {
                setClaimDetails(response.data.claim);
            } else {
                // If detailed endpoint doesn't work, use the claim from list
                setClaimDetails(claim);
            }
        } catch (error) {
            console.error('Failed to fetch claim details:', error);
            // Fallback to using the claim from list
            setClaimDetails(claim);
        } finally {
            setLoadingDetails(false);
        }
    };

    const closeModal = () => {
        setSelectedClaim(null);
        setClaimDetails(null);
    };

    const getStatusConfig = (status: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed') => {
        const configs = {
            pending: {
                bg: 'bg-yellow-50',
                border: 'border-yellow-200',
                text: 'text-yellow-800',
                icon: Clock,
                label: 'Pending Review',
                description: 'Your claim is waiting to be reviewed by the broker'
            },
            under_review: {
                bg: 'bg-blue-50',
                border: 'border-blue-200',
                text: 'text-blue-800',
                icon: FileText,
                label: 'Under Review',
                description: 'Your claim is currently being reviewed'
            },
            approved: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                icon: CheckCircle,
                label: 'Approved',
                description: 'Your claim has been approved'
            },
            rejected: {
                bg: 'bg-red-50',
                border: 'border-red-200',
                text: 'text-red-800',
                icon: XCircle,
                label: 'Rejected',
                description: 'Your claim has been rejected'
            },
            completed: {
                bg: 'bg-green-50',
                border: 'border-green-200',
                text: 'text-green-800',
                icon: CheckCircle,
                label: 'Completed',
                description: 'Your claim has been processed successfully'
            }
        };
        return configs[status] || configs.pending;
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'long',
            day: 'numeric',
            hour: '2-digit',
            minute: '2-digit'
        });
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    if (loading && !refreshing) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                    <p className="text-gray-500 mt-4">Loading your claims...</p>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <div className="flex items-center text-red-800">
                    <AlertCircle className="w-5 h-5 mr-2" />
                    <span>{error}</span>
                </div>
            </div>
        );
    }

    if (claims.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-12 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Claims Yet</h3>
                <p className="text-gray-600">You haven't submitted any insurance claims.</p>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-2xl font-bold text-gray-900">My Claims</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Track the status of your insurance claims
                    </p>
                </div>
                <button
                    onClick={handleRefresh}
                    disabled={refreshing}
                    className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                >
                    <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                    Refresh
                </button>
            </div>

            {/* Claims Grid */}
            <div className="grid grid-cols-1 gap-6">
                {claims.map((claim) => {
                    // Use brokerStatus for claim status, fallback to status if not available
                    const claimStatus = claim.brokerStatus || claim.status || 'pending';
                    const statusConfig = getStatusConfig(claimStatus as any);
                    const StatusIcon = statusConfig.icon;

                    // Get the latest update from broker status history
                    const lastUpdate = claim.brokerStatusHistory && claim.brokerStatusHistory.length > 0
                        ? claim.brokerStatusHistory[claim.brokerStatusHistory.length - 1]
                        : null;

                    return (
                        <div
                            key={claim._id}
                            className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
                        >
                            <div className="p-6">
                                {/* Header */}
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center gap-3 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                Policy {claim.policyNumber}
                                            </h3>
                                            <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium border ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border}`}>
                                                <StatusIcon className="w-4 h-4 mr-1" />
                                                {statusConfig.label}
                                            </span>
                                        </div>
                                        <p className="text-sm text-gray-600">{statusConfig.description}</p>
                                    </div>
                                </div>

                                {/* Property Info */}
                                <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4 pb-4 border-b border-gray-200">
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-blue-50 rounded-lg">
                                            <Home className="w-5 h-5 text-blue-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Property</p>
                                            <p className="text-sm font-medium text-gray-900 line-clamp-2">
                                                {claim.address || 'N/A'}
                                            </p>
                                            <p className="text-xs text-gray-600">
                                                {claim.coverageType || 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-green-50 rounded-lg">
                                            <DollarSign className="w-5 h-5 text-green-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Building Value</p>
                                            <p className="text-sm font-semibold text-gray-900">
                                                {claim.buildingValue ? formatCurrency(claim.buildingValue) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                    <div className="flex items-start gap-3">
                                        <div className="p-2 bg-purple-50 rounded-lg">
                                            <Calendar className="w-5 h-5 text-purple-600" />
                                        </div>
                                        <div>
                                            <p className="text-xs text-gray-500 mb-1">Submitted</p>
                                            <p className="text-sm font-medium text-gray-900">
                                                {claim.submissionDate
                                                    ? new Date(claim.submissionDate).toLocaleDateString('en-US', {
                                                        month: 'short',
                                                        day: 'numeric',
                                                        year: 'numeric'
                                                    })
                                                    : 'N/A'}
                                            </p>
                                        </div>
                                    </div>
                                </div>

                                {/* Last Update */}
                                {lastUpdate && (
                                    <div className={`p-4 rounded-lg mb-4 ${statusConfig.bg} border ${statusConfig.border}`}>
                                        <div className="flex items-start justify-between">
                                            <div className="flex-1">
                                                <p className="text-sm font-medium text-gray-900 mb-1">
                                                    Latest Update
                                                </p>
                                                {lastUpdate.notes && (
                                                    <p className="text-sm text-gray-700 mb-2">
                                                        {lastUpdate.notes}
                                                    </p>
                                                )}
                                                <p className="text-xs text-gray-600">
                                                    {formatDate(lastUpdate.changedAt)}
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}

                                {/* Actions */}
                                <div className="flex items-center justify-between">
                                    <p className="text-xs text-gray-500">
                                        Last updated: {lastUpdate
                                            ? formatDate(lastUpdate.changedAt)
                                            : formatDate(claim.submissionDate || claim.updatedAt)}
                                    </p>
                                    <button
                                        onClick={() => handleViewDetails(claim)}
                                        className="inline-flex items-center px-4 py-2 text-sm font-medium text-blue-600 hover:text-blue-700 hover:bg-blue-50 rounded-md transition-colors"
                                    >
                                        <Eye className="w-4 h-4 mr-2" />
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    );
                })}
            </div>

            {/* Claim Detail Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h3 className="text-xl font-bold text-gray-900">
                                    Claim Details
                                </h3>
                                <button
                                    onClick={() => setSelectedClaim(null)}
                                    className="text-gray-400 hover:text-gray-600"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>

                            {/* Claim Information */}
                            {loadingDetails ? (
                                <div className="flex items-center justify-center py-8">
                                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                    <span className="ml-2 text-gray-600">Loading details...</span>
                                </div>
                            ) : claimDetails ? (
                                <div className="space-y-6">
                                    {/* Basic Information */}
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Policy Number</label>
                                            <p className="text-sm text-gray-900">{claimDetails.policyNumber}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${getStatusConfig(claimDetails.brokerStatus || claimDetails.status).bg} ${getStatusConfig(claimDetails.brokerStatus || claimDetails.status).text}`}>
                                                {getStatusConfig(claimDetails.brokerStatus || claimDetails.status).label}
                                            </span>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Submission Date</label>
                                            <p className="text-sm text-gray-900">{formatDate(claimDetails.submissionDate)}</p>
                                        </div>
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                                            <p className="text-sm text-gray-900">{claimDetails.coverageType}</p>
                                        </div>
                                    </div>

                                    {/* Claim Reason */}
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-2">Claim Reason</label>
                                        <div className="bg-gray-50 rounded-lg p-4">
                                            <p className="text-sm text-gray-900 whitespace-pre-wrap">{claimDetails.claimReason}</p>
                                        </div>
                                    </div>

                                    {/* Property Details */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Property Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Address</label>
                                                <p className="text-sm text-gray-900">{claimDetails.propertyDetails?.address || claimDetails.address || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Building Value</label>
                                                <p className="text-sm text-gray-900">{claimDetails.propertyDetails?.buildingValue ? formatCurrency(claimDetails.propertyDetails.buildingValue) : 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Details */}
                                    <div>
                                        <h4 className="text-sm font-semibold text-gray-900 mb-3">Contact Information</h4>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Name</label>
                                                <p className="text-sm text-gray-900">{claimDetails.contactDetails?.name || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Email</label>
                                                <p className="text-sm text-gray-900">{claimDetails.contactDetails?.email || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <label className="block text-sm font-medium text-gray-700 mb-1">Phone</label>
                                                <p className="text-sm text-gray-900">{claimDetails.contactDetails?.phone || 'N/A'}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Documents */}
                                    {claimDetails.documents && claimDetails.documents.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Supporting Documents</h4>
                                            <div className="space-y-2">
                                                {claimDetails.documents.map((doc: any, index: number) => (
                                                    <div key={index} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            <FileText className="w-5 h-5 text-gray-600" />
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900">{doc.fileName}</p>
                                                                <p className="text-xs text-gray-600">{doc.fileType} • {(doc.fileSize / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                    </div>
                                                ))}
                                            </div>
                                        </div>
                                    )}

                                    {/* Status History */}
                                    {claimDetails.brokerStatusHistory && claimDetails.brokerStatusHistory.length > 0 && (
                                        <div>
                                            <h4 className="text-sm font-semibold text-gray-900 mb-3">Status History</h4>
                                            <div className="space-y-3">
                                                {claimDetails.brokerStatusHistory.map((history: any, index: number) => {
                                                    const config = getStatusConfig(history.status);
                                                    const HistoryIcon = config.icon;
                                                    return (
                                                        <div key={index} className={`p-4 rounded-lg border ${config.bg} ${config.border}`}>
                                                            <div className="flex items-start gap-3">
                                                                <HistoryIcon className={`w-5 h-5 ${config.text} flex-shrink-0 mt-0.5`} />
                                                                <div className="flex-1">
                                                                    <div className="flex items-center justify-between mb-1">
                                                                        <span className={`font-semibold ${config.text}`}>
                                                                            {config.label}
                                                                        </span>
                                                                        <span className="text-xs text-gray-600">
                                                                            {formatDate(history.timestamp || history.changedAt)}
                                                                        </span>
                                                                    </div>
                                                                    {history.notes && (
                                                                        <p className="text-sm text-gray-700">
                                                                            {history.notes}
                                                                        </p>
                                                                    )}
                                                                </div>
                                                            </div>
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <AlertCircle className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <p className="text-gray-600">Unable to load claim details</p>
                                </div>
                            )}

                            <button
                                onClick={() => setSelectedClaim(null)}
                                className="w-full px-4 py-2 bg-gray-100 text-gray-700 rounded-md hover:bg-gray-200"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default ClaimsList;
