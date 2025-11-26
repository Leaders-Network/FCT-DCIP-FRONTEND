'use client';

import { useState, useEffect } from 'react';
import { brokerAdminAPI } from '@/services/api';
import {
    FileText,
    AlertCircle,
    Search,
    Filter,
    Eye,
    RefreshCw,
    X,
    Calendar,
    User,
    CheckCircle,
    Clock
} from 'lucide-react';
import type {
    BrokerPolicyRequest,
    BrokerClaimFilters,
    BrokerStatusUpdateRequest
} from '@/types/api.types';

export default function BrokerClaimsListPage() {
    const [claims, setClaims] = useState<BrokerPolicyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'rejected' | 'completed'>('all');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [totalClaims, setTotalClaims] = useState(0);
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [selectedClaim, setSelectedClaim] = useState<BrokerPolicyRequest | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchClaims();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter, currentPage]);

    const fetchClaims = async () => {
        try {
            setLoading(true);
            setError(null);
            const filters: BrokerClaimFilters = {
                status: statusFilter,
                page: currentPage,
                limit: 15
            };

            if (searchQuery) {
                filters.policyNumber = searchQuery;
            }

            const response = await brokerAdminAPI.getClaims(filters);
            if (response.success) {
                setClaims(response.claims);
                setTotalPages(response.totalPages || 1);
                setTotalClaims(response.total || 0);
            }
        } catch (err) {
            console.error('Failed to fetch claims:', err);
            setError('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await fetchClaims();
        setRefreshing(false);
    };

    const handleSearch = () => {
        setCurrentPage(1);
        fetchClaims();
    };

    const handleKeyDown = (e: React.KeyboardEvent<HTMLInputElement>) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const handlePageChange = (newPage: number) => {
        if (newPage >= 1 && newPage <= totalPages) {
            setCurrentPage(newPage);
        }
    };

    const handleViewClaim = async (claimId: string) => {
        console.log('🔍 handleViewClaim called with claimId:', claimId);
        setModalLoading(true);
        setModalError(null);
        try {
            console.log('📡 Fetching claim details...');
            const res = await brokerAdminAPI.getClaimById(claimId);
            console.log('✅ Claim fetched:', res);
            if (res && res.claim) {
                setSelectedClaim(res.claim);
                setNotes(res.claim.brokerNotes || '');
                console.log('✅ Modal should open now');
            } else {
                setModalError('Claim not found');
            }
        } catch (err) {
            console.error('❌ Error fetching claim:', err);
            setModalError(err instanceof Error ? err.message : 'Failed to load claim');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedClaim(null);
        setModalError(null);
        setSuccessMessage(null);
        setNotes('');
        setReason('');
    };

    const updateStatus = async (status: 'under_review' | 'rejected' | 'completed') => {
        if (!selectedClaim) return;

        if (status === 'rejected' && !reason.trim()) {
            setModalError('Please provide a reason for rejection');
            return;
        }

        setUpdating(true);
        setModalError(null);
        try {
            const payload: BrokerStatusUpdateRequest = { status };
            if (notes.trim()) payload.notes = notes.trim();
            if (reason.trim()) payload.reason = reason.trim();

            const res = await brokerAdminAPI.updateClaimStatus(selectedClaim._id, payload);
            if (res && res.claim) {
                setSelectedClaim(res.claim);
                setSuccessMessage(res.message || 'Status updated successfully');
                setReason('');
                setTimeout(() => setSuccessMessage(null), 4000);
                // Refresh the claims list
                fetchClaims();
            } else {
                setModalError('Failed to update status');
            }
        } catch (err) {
            setModalError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount?: number) => {
        if (amount == null) return 'N/A';
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    if (loading) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Claims Management</h1>
                        <p className="text-sm text-gray-600 mt-1">View and manage all insurance claims ({totalClaims} total)</p>
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
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex flex-col md:flex-row gap-4">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by policy number..."
                                value={searchQuery}
                                onChange={(e) => setSearchQuery(e.target.value)}
                                onKeyDown={handleKeyDown}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>
                    </div>
                    <div className="flex gap-2">
                        <select
                            value={statusFilter}
                            onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                            className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                        >
                            <option value="all">All Status</option>
                            <option value="pending">Pending</option>
                            <option value="under_review">Under Review</option>
                            <option value="rejected">Rejected</option>
                            <option value="completed">Completed</option>
                        </select>
                        <button
                            onClick={handleSearch}
                            className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                        >
                            <Filter className="w-4 h-4 mr-2" />
                            Apply
                        </button>
                    </div>
                </div>
            </div>

            {/* Claims Table */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                <div className="px-6 py-4 border-b border-gray-200">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
                </div>

                {error && (
                    <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                        <div className="flex items-center text-red-800">
                            <AlertCircle className="w-5 h-5 mr-2" />
                            <span>{error}</span>
                        </div>
                    </div>
                )}

                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Policy Number
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Property
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Contact
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Status
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Submitted
                                </th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    Actions
                                </th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {claims.length > 0 ? (
                                claims.map((claim) => (
                                    <tr key={claim._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                            {claim.policyNumber || 'N/A'}
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div className="max-w-xs truncate">
                                                {claim.propertyDetails.address}
                                            </div>
                                            <div className="text-xs text-gray-500">
                                                {claim.propertyDetails.propertyType}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            <div>{claim.contactDetails.fullName}</div>
                                            <div className="text-xs text-gray-500">
                                                {claim.contactDetails.email}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(claim.brokerStatus || 'pending')}`}>
                                                {(claim.brokerStatus || 'pending').replace('_', ' ').toUpperCase()}
                                            </span>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                            {formatDate(claim.createdAt)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <button
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleViewClaim(claim._id);
                                                }}
                                                className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </button>
                                        </td>
                                    </tr>
                                ))
                            ) : (
                                <tr>
                                    <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                        <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                        <p>No claims found</p>
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <div className="text-sm text-gray-700">
                            Page {currentPage} of {totalPages}
                        </div>
                        <div className="flex gap-2">
                            <button
                                onClick={() => handlePageChange(currentPage - 1)}
                                disabled={currentPage === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>
                            <button
                                onClick={() => handlePageChange(currentPage + 1)}
                                disabled={currentPage === totalPages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {/* Claim Detail Modal */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {modalLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <p className="text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            )}

                            {modalError && (
                                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-800">{modalError}</p>
                                    </div>
                                </div>
                            )}

                            {!modalLoading && (
                                <>
                                    {/* Claim Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Claim Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Claim ID</p>
                                                <p className="font-medium">{selectedClaim._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Policy Number</p>
                                                <p className="font-medium">{selectedClaim.policyNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedClaim.brokerStatus || 'pending')}`}>
                                                    {(selectedClaim.brokerStatus || 'pending').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" /> Submitted
                                                </p>
                                                <p className="font-medium">{formatDate(selectedClaim.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Coverage Type</p>
                                                <p className="font-medium">{selectedClaim.requestDetails.coverageType}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Building Value</p>
                                                <p className="font-medium">{formatCurrency(selectedClaim.propertyDetails.buildingValue)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Contact Information */}
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Name</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Property Address</p>
                                                <p className="font-medium">{selectedClaim.propertyDetails.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    {/* Status Update Section */}
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Update Status
                                        </h3>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                rows={2}
                                                placeholder="Add any notes..."
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rejection Reason {selectedClaim.brokerStatus === 'pending' && '(Required for rejection)'}
                                            </label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                rows={2}
                                                placeholder="Provide reason if rejecting..."
                                            />
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {selectedClaim.brokerStatus === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus('under_review')}
                                                    disabled={updating}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Updating...' : 'Start Review'}
                                                </button>
                                            )}

                                            {selectedClaim.brokerStatus === 'under_review' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus('completed')}
                                                        disabled={updating}
                                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {updating ? 'Updating...' : 'Complete'}
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus('rejected')}
                                                        disabled={updating}
                                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {updating ? 'Updating...' : 'Reject'}
                                                    </button>
                                                </>
                                            )}

                                            {(selectedClaim.brokerStatus === 'completed' || selectedClaim.brokerStatus === 'rejected') && (
                                                <p className="text-gray-600 italic text-sm">
                                                    This claim has been {selectedClaim.brokerStatus}. No further actions available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}
