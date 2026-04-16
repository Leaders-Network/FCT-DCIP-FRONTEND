"use client";
import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    Plus,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    RefreshCw,
    Filter,
    Search,
    FileText,
    Mail,
    Phone,
    Calendar,
    User,
    ArrowRight,
    XCircle
} from 'lucide-react';
import ConflictRaiseInterface from './ConflictRaiseInterface';

interface Inquiry {
    _id: string;
    referenceId: string;
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    inquiryStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
    contactPreference: string;
    userContact: {
        email: string;
        phone: string;
    };
    policyId?: {
        _id: string;
        propertyDetails: {
            address: string;
            propertyType: string;
        };
    };
    adminResponse?: string;
    responseMethod?: string;
    assignedAdminId?: {
        firstname: string;
        lastname: string;
    };
    resolutionDetails?: {
        resolvedBy?: {
            firstname: string;
            lastname: string;
        };
        resolvedAt?: string;
        resolutionType?: string;
    };
    createdAt: string;
    updatedAt: string;
}

interface InquiryStats {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

const UserInquiriesHub: React.FC = () => {
    const [inquiries, setInquiries] = useState<Inquiry[]>([]);
    const [stats, setStats] = useState<InquiryStats>({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<Inquiry | null>(null);
    const [showNewInquiry, setShowNewInquiry] = useState(false);
    const [filter, setFilter] = useState('all');
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchInquiries();
    }, [filter, currentPage]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                status: filter,
                page: currentPage.toString(),
                limit: '10'
            });

            // Import the api instance for proper token handling
            const { default: api } = await import('@/services/api');

            const response = await api.get(`/user-conflict-inquiries/my-inquiries?${queryParams}`);

            if (response.data?.success) {
                setInquiries(response.data?.data?.inquiries || []);
                setStats(response.data?.data?.stats || { open: 0, in_progress: 0, resolved: 0, closed: 0 });
                setTotalPages(response.data?.data?.pagination?.pages || 1);
            } else {
                // If no inquiries yet, show empty state
                setInquiries([]);
                setStats({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
                setTotalPages(1);
            }
        } catch (error: unknown) {
            // Handle 404 gracefully - means no inquiries exist yet
            const axiosError = error as { response?: { status?: number } };
            if (axiosError?.response?.status === 404) {
                setInquiries([]);
                setStats({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
                setTotalPages(1);
            }
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-yellow-100 text-yellow-800';
            case 'in_progress': return 'bg-blue-100 text-blue-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'open': return <AlertTriangle className="w-4 h-4" />;
            case 'in_progress': return <Clock className="w-4 h-4" />;
            case 'resolved': return <CheckCircle className="w-4 h-4" />;
            case 'closed': return <XCircle className="w-4 h-4" />;
            default: return <Clock className="w-4 h-4" />;
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'text-red-600';
            case 'medium': return 'text-yellow-600';
            case 'low': return 'text-green-600';
            default: return 'text-gray-600';
        }
    };

    const conflictTypeLabels: { [key: string]: string } = {
        'disagreement_findings': 'Disagreement with Findings',
        'recommendation_concern': 'Recommendation Concern',
        'surveyor_conduct': 'Surveyor Conduct Issue',
        'technical_error': 'Technical Error',
        'missing_information': 'Missing Information',
        'clarification_needed': 'Clarification Needed',
        'other': 'Other'
    };

    const filteredInquiries = inquiries.filter(inquiry =>
        inquiry.referenceId.toLowerCase().includes(searchTerm.toLowerCase()) ||
        inquiry.description.toLowerCase().includes(searchTerm.toLowerCase())
    );

    return (
        <div className="p-4 sm:p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
                    <div>
                        <h1 className="text-xl sm:text-2xl font-bold text-gray-900 flex items-center">
                            <MessageSquare className="w-6 h-6 sm:w-8 sm:h-8 text-blue-600 mr-2 sm:mr-3" />
                            My Inquiries
                        </h1>
                        <p className="text-sm text-gray-600 mt-1">
                            Track and manage your conflict inquiries and disputes
                        </p>
                    </div>
                    <button
                        onClick={() => setShowNewInquiry(true)}
                        className="flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Raise New Inquiry
                    </button>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-3 sm:gap-4 mb-6">
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Open</p>
                            <p className="text-lg font-bold text-gray-900">{stats.open}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Clock className="w-5 h-5 text-blue-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">In Progress</p>
                            <p className="text-lg font-bold text-gray-900">{stats.in_progress}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Resolved</p>
                            <p className="text-lg font-bold text-gray-900">{stats.resolved}</p>
                        </div>
                    </div>
                </div>
                <div className="bg-white rounded-lg shadow-sm p-4">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <XCircle className="w-5 h-5 text-gray-600" />
                        </div>
                        <div className="ml-3">
                            <p className="text-xs font-medium text-gray-600">Closed</p>
                            <p className="text-lg font-bold text-gray-900">{stats.closed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white rounded-lg shadow-sm mb-6 p-4">
                <div className="flex flex-col sm:flex-row gap-3">
                    <div className="flex-1">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by reference ID or description..."
                                value={searchTerm}
                                onChange={(e: React.ChangeEvent<HTMLInputElement>) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                            />
                        </div>
                    </div>
                    <select
                        value={filter}
                        onChange={(e: React.ChangeEvent<HTMLSelectElement>) => { setFilter(e.target.value); setCurrentPage(1); }}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 text-sm"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>
                    <button
                        onClick={fetchInquiries}
                        className="flex items-center justify-center px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 text-sm"
                    >
                        <RefreshCw className="w-4 h-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Inquiries List */}
            <div className="bg-white rounded-lg shadow-sm">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2 text-sm">Loading inquiries...</p>
                    </div>
                ) : filteredInquiries.length === 0 ? (
                    <div className="p-8 sm:p-12 text-center">
                        <div className="w-16 h-16 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-4">
                            <MessageSquare className="w-8 h-8 text-blue-600" />
                        </div>
                        <h3 className="text-lg font-semibold text-gray-900 mb-2">No Inquiries Yet</h3>
                        <p className="text-gray-600 mb-6 text-sm max-w-md mx-auto">
                            You haven't raised any conflict inquiries. If you have concerns about your survey reports or policy decisions, you can raise an inquiry here.
                        </p>
                        <button
                            onClick={() => setShowNewInquiry(true)}
                            className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm font-medium"
                        >
                            <Plus className="w-4 h-4 mr-2" />
                            Raise Your First Inquiry
                        </button>
                    </div>
                ) : (
                    <div className="divide-y divide-gray-200">
                        {filteredInquiries.map((inquiry) => (
                            <div
                                key={inquiry._id}
                                className="p-4 sm:p-6 hover:bg-gray-50 cursor-pointer transition-colors"
                                onClick={() => setSelectedInquiry(inquiry)}
                            >
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-3">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <span className="font-mono text-sm font-semibold text-gray-900">
                                                {inquiry.referenceId}
                                            </span>
                                            <span className={`inline-flex items-center px-2 py-0.5 rounded-full text-xs font-medium ${getStatusColor(inquiry.inquiryStatus)}`}>
                                                {getStatusIcon(inquiry.inquiryStatus)}
                                                <span className="ml-1">{inquiry.inquiryStatus.replace('_', ' ')}</span>
                                            </span>
                                            <span className={`text-xs font-medium ${getUrgencyColor(inquiry.urgency)}`}>
                                                {inquiry.urgency} urgency
                                            </span>
                                        </div>
                                        <p className="text-sm font-medium text-gray-800 mb-1">
                                            {conflictTypeLabels[inquiry.conflictType] || inquiry.conflictType}
                                        </p>
                                        <p className="text-sm text-gray-600 line-clamp-2 mb-2">
                                            {inquiry.description}
                                        </p>
                                        <div className="flex flex-wrap items-center gap-3 text-xs text-gray-500">
                                            <span className="flex items-center">
                                                <Calendar className="w-3 h-3 mr-1" />
                                                {new Date(inquiry.createdAt).toLocaleDateString()}
                                            </span>
                                            {inquiry.policyId && (
                                                <span className="flex items-center">
                                                    <FileText className="w-3 h-3 mr-1" />
                                                    {inquiry.policyId.propertyDetails?.propertyType}
                                                </span>
                                            )}
                                        </div>
                                    </div>
                                    <div className="flex items-center">
                                        {inquiry.adminResponse && (
                                            <span className="inline-flex items-center px-2 py-1 bg-green-50 text-green-700 rounded text-xs mr-2">
                                                <CheckCircle className="w-3 h-3 mr-1" />
                                                Response Available
                                            </span>
                                        )}
                                        <ArrowRight className="w-5 h-5 text-gray-400" />
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                )}

                {/* Pagination */}
                {totalPages > 1 && (
                    <div className="px-4 py-3 border-t border-gray-200 flex items-center justify-between">
                        <button
                            onClick={() => setCurrentPage(p => Math.max(1, p - 1))}
                            disabled={currentPage === 1}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            Previous
                        </button>
                        <span className="text-sm text-gray-600">
                            Page {currentPage} of {totalPages}
                        </span>
                        <button
                            onClick={() => setCurrentPage(p => Math.min(totalPages, p + 1))}
                            disabled={currentPage === totalPages}
                            className="px-3 py-1 border border-gray-300 rounded text-sm disabled:opacity-50"
                        >
                            Next
                        </button>
                    </div>
                )}
            </div>


            {/* Inquiry Details Modal */}
            {selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-blue-600 text-white p-4 sm:p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-lg font-bold">Inquiry Details</h2>
                                    <p className="text-blue-100 text-sm mt-1">{selectedInquiry.referenceId}</p>
                                </div>
                                <button
                                    onClick={() => setSelectedInquiry(null)}
                                    className="text-blue-100 hover:text-white"
                                >
                                    <XCircle className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-4 sm:p-6 overflow-y-auto max-h-[calc(90vh-180px)]">
                            {/* Status Badge */}
                            <div className="flex flex-wrap items-center gap-2 mb-4">
                                <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${getStatusColor(selectedInquiry.inquiryStatus)}`}>
                                    {getStatusIcon(selectedInquiry.inquiryStatus)}
                                    <span className="ml-1 capitalize">{selectedInquiry.inquiryStatus.replace('_', ' ')}</span>
                                </span>
                                <span className={`text-sm font-medium ${getUrgencyColor(selectedInquiry.urgency)}`}>
                                    {selectedInquiry.urgency} urgency
                                </span>
                            </div>

                            {/* Inquiry Details */}
                            <div className="space-y-4">
                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Type</label>
                                    <p className="text-sm text-gray-900 mt-1">
                                        {conflictTypeLabels[selectedInquiry.conflictType] || selectedInquiry.conflictType}
                                    </p>
                                </div>

                                <div>
                                    <label className="text-xs font-medium text-gray-500 uppercase">Description</label>
                                    <p className="text-sm text-gray-900 mt-1 whitespace-pre-wrap">
                                        {selectedInquiry.description}
                                    </p>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Submitted</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {new Date(selectedInquiry.createdAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-xs font-medium text-gray-500 uppercase">Last Updated</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {new Date(selectedInquiry.updatedAt).toLocaleDateString()}
                                        </p>
                                    </div>
                                </div>

                                {selectedInquiry.policyId && (
                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <label className="text-xs font-medium text-gray-500 uppercase">Related Policy</label>
                                        <p className="text-sm text-gray-900 mt-1">
                                            {selectedInquiry.policyId.propertyDetails?.propertyType} - {selectedInquiry.policyId.propertyDetails?.address}
                                        </p>
                                    </div>
                                )}

                                {selectedInquiry.assignedAdminId && (
                                    <div className="bg-blue-50 rounded-lg p-4">
                                        <label className="text-xs font-medium text-blue-600 uppercase">Assigned To</label>
                                        <p className="text-sm text-blue-900 mt-1 flex items-center">
                                            <User className="w-4 h-4 mr-2" />
                                            {selectedInquiry.assignedAdminId.firstname} {selectedInquiry.assignedAdminId.lastname}
                                        </p>
                                    </div>
                                )}

                                {/* Admin Response Section */}
                                {selectedInquiry.adminResponse && (
                                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                        <div className="flex items-center mb-2">
                                            <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                            <label className="text-sm font-semibold text-green-800">Admin Response</label>
                                        </div>
                                        <p className="text-sm text-green-900 whitespace-pre-wrap">
                                            {selectedInquiry.adminResponse}
                                        </p>
                                        {selectedInquiry.responseMethod && (
                                            <p className="text-xs text-green-700 mt-2 flex items-center">
                                                {selectedInquiry.responseMethod === 'email' ? (
                                                    <Mail className="w-3 h-3 mr-1" />
                                                ) : (
                                                    <Phone className="w-3 h-3 mr-1" />
                                                )}
                                                Sent via {selectedInquiry.responseMethod}
                                            </p>
                                        )}
                                        {selectedInquiry.resolutionDetails?.resolvedAt && (
                                            <p className="text-xs text-green-700 mt-1">
                                                Resolved on {new Date(selectedInquiry.resolutionDetails.resolvedAt).toLocaleDateString()}
                                                {selectedInquiry.resolutionDetails.resolvedBy && (
                                                    <> by {selectedInquiry.resolutionDetails.resolvedBy.firstname} {selectedInquiry.resolutionDetails.resolvedBy.lastname}</>
                                                )}
                                            </p>
                                        )}
                                    </div>
                                )}

                                {/* Pending Response Notice */}
                                {!selectedInquiry.adminResponse && selectedInquiry.inquiryStatus !== 'closed' && (
                                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                                        <div className="flex items-center">
                                            <Clock className="w-5 h-5 text-yellow-600 mr-2" />
                                            <div>
                                                <p className="text-sm font-medium text-yellow-800">Awaiting Response</p>
                                                <p className="text-xs text-yellow-700 mt-1">
                                                    Your inquiry is being reviewed. Expected response time: 24-48 hours.
                                                </p>
                                            </div>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="border-t border-gray-200 p-4 flex justify-end">
                            <button
                                onClick={() => setSelectedInquiry(null)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 text-sm font-medium"
                            >
                                Close
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* New Inquiry Modal */}
            <ConflictRaiseInterface
                isOpen={showNewInquiry}
                onClose={() => setShowNewInquiry(false)}
                onSubmit={() => {
                    setShowNewInquiry(false);
                    fetchInquiries();
                }}
            />
        </div>
    );
};

export default UserInquiriesHub;
