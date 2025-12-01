'use client';

import React, { useEffect, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import { ArrowLeft, FileText, Calendar, User, CheckCircle, AlertCircle, Clock } from 'lucide-react';
import { brokerAdminAPI } from '@/services/api';
import type { BrokerPolicyRequest, BrokerStatusUpdateRequest } from '@/types/api.types';

function formatDate(dateString?: string): string {
    if (!dateString) return 'N/A';
    try {
        return new Date(dateString).toLocaleString();
    } catch {
        return dateString;
    }
}

function formatCurrency(amount?: number): string {
    if (amount == null) return 'N/A';
    return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
}

export default function BrokerClaimPage() {
    const params = useParams();
    const router = useRouter();
    const claimId = (params as { claimId?: string })?.claimId;

    const [claim, setClaim] = useState<BrokerPolicyRequest | null>(null);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    const fetchClaim = async () => {
        if (!claimId) return;
        setLoading(true);
        setError(null);
        try {
            const res = await brokerAdminAPI.getClaimById(claimId);
            if (res && res.claim) {
                setClaim(res.claim);
                setNotes(res.claim.brokerNotes || '');
            } else {
                setError('Claim not found');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to load claim');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchClaim();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [claimId]);

    const updateStatus = async (status: 'under_review' | 'rejected' | 'completed') => {
        if (!claimId) return;

        if (status === 'rejected' && !reason.trim()) {
            setError('Please provide a reason for rejection');
            return;
        }

        setUpdating(true);
        setError(null);
        try {
            const payload: BrokerStatusUpdateRequest = { status };
            if (notes.trim()) payload.notes = notes.trim();
            if (reason.trim()) payload.reason = reason.trim();

            const res = await brokerAdminAPI.updateClaimStatus(claimId, payload);
            if (res && res.claim) {
                setClaim(res.claim);
                setSuccessMessage(res.message || 'Status updated successfully');
                setReason('');
                setTimeout(() => setSuccessMessage(null), 4000);
            } else {
                setError('Failed to update status');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    if (!claimId) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <p className="text-red-600">No claim ID provided in route.</p>
            </div>
        );
    }

    if (loading) {
        return (
            <div className="flex items-center justify-center h-64">
                <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-gray-600" />
                <p className="ml-4">Loading claim details…</p>
            </div>
        );
    }

    if (error && !claim) {
        return (
            <div className="max-w-7xl mx-auto px-4 py-8">
                <div className="mb-4">
                    <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900">
                        <ArrowLeft className="w-4 h-4" /> Back to claims
                    </button>
                </div>
                <div className="rounded-md bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <div>
                            <p className="text-red-800 font-medium">Error loading claim</p>
                            <p className="text-sm text-red-700">{error}</p>
                        </div>
                    </div>
                </div>
                <div className="mt-4">
                    <button onClick={fetchClaim} className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700">
                        Try again
                    </button>
                </div>
            </div>
        );
    }

    if (!claim) {
        return (
            <div className="max-w-7xl mx-auto p-6">
                <p>No claim details available.</p>
            </div>
        );
    }

    const currentStatus = claim.brokerStatus || 'pending';

    return (
        <div className="max-w-7xl mx-auto px-4 py-8">
            <div className="mb-6">
                <button onClick={() => router.back()} className="inline-flex items-center gap-2 text-sm text-gray-700 hover:text-gray-900 mb-4">
                    <ArrowLeft className="w-4 h-4" /> Back to claims
                </button>
                <h1 className="text-3xl font-bold text-gray-900">Claim Details</h1>
            </div>

            {successMessage && (
                <div className="mb-6 rounded-md bg-green-50 border border-green-200 p-4">
                    <div className="flex items-center gap-3">
                        <CheckCircle className="w-5 h-5 text-green-400" />
                        <p className="text-green-800">{successMessage}</p>
                    </div>
                </div>
            )}

            {error && (
                <div className="mb-6 rounded-md bg-red-50 border border-red-200 p-4">
                    <div className="flex items-center gap-3">
                        <AlertCircle className="w-5 h-5 text-red-400" />
                        <p className="text-red-800">{error}</p>
                    </div>
                </div>
            )}

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <FileText className="w-5 h-5" />
                    Claim Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Claim ID</p>
                        <p className="font-medium">{claim._id}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Policy Number</p>
                        <p className="font-medium">{claim.policyNumber || 'N/A'}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Status</p>
                        <p className="font-medium">
                            <span className={`inline-flex px-2 py-1 text-xs rounded-full ${currentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                currentStatus === 'rejected' ? 'bg-red-100 text-red-800' :
                                    currentStatus === 'under_review' ? 'bg-blue-100 text-blue-800' :
                                        'bg-yellow-100 text-yellow-800'
                                }`}>
                                {currentStatus.replace('_', ' ').toUpperCase()}
                            </span>
                        </p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600 flex items-center gap-1">
                            <Calendar className="w-4 h-4" /> Submitted
                        </p>
                        <p className="font-medium">{formatDate(claim.createdAt)}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Coverage Type</p>
                        <p className="font-medium">{claim.requestDetails.coverageType}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Building Value</p>
                        <p className="font-medium">{formatCurrency(claim.propertyDetails.buildingValue)}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6 mb-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <User className="w-5 h-5" />
                    Contact Information
                </h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                        <p className="text-sm text-gray-600">Name</p>
                        <p className="font-medium">{claim.contactDetails.fullName}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Email</p>
                        <p className="font-medium">{claim.contactDetails.email}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Phone</p>
                        <p className="font-medium">{claim.contactDetails.phoneNumber}</p>
                    </div>
                    <div>
                        <p className="text-sm text-gray-600">Property Address</p>
                        <p className="font-medium">{claim.propertyDetails.address}</p>
                    </div>
                </div>
            </div>

            <div className="bg-white shadow rounded-lg p-6">
                <h2 className="text-xl font-semibold mb-4 flex items-center gap-2">
                    <Clock className="w-5 h-5" />
                    Update Status
                </h2>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Notes (Optional)
                    </label>
                    <textarea
                        value={notes}
                        onChange={(e) => setNotes(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        rows={3}
                        placeholder="Add any notes about this claim..."
                    />
                </div>

                <div className="mb-4">
                    <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rejection Reason {currentStatus === 'pending' && '(Required for rejection)'}
                    </label>
                    <textarea
                        value={reason}
                        onChange={(e) => setReason(e.target.value)}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                        rows={2}
                        placeholder="Provide reason if rejecting..."
                    />
                </div>

                <div className="flex gap-3 flex-wrap">
                    {currentStatus === 'pending' && (
                        <button
                            onClick={() => updateStatus('under_review')}
                            disabled={updating}
                            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {updating ? 'Updating...' : 'Start Review'}
                        </button>
                    )}

                    {currentStatus === 'under_review' && (
                        <>
                            <button
                                onClick={() => updateStatus('completed')}
                                disabled={updating}
                                className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating ? 'Updating...' : 'Complete'}
                            </button>
                            <button
                                onClick={() => updateStatus('rejected')}
                                disabled={updating}
                                className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                {updating ? 'Updating...' : 'Reject'}
                            </button>
                        </>
                    )}

                    {(currentStatus === 'completed' || currentStatus === 'rejected') && (
                        <p className="text-gray-600 italic">
                            This claim has been {currentStatus}. No further actions available.
                        </p>
                    )}
                </div>
            </div>
        </div>
    );
}
