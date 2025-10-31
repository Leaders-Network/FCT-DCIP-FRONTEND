"use client";
import React, { useState, useEffect } from 'react';
// Import token setup for development
import '@/utils/tokenSetup';
import { userConflictInquiriesService, UserInquiry, InquiryFilters } from '@/services/userConflictInquiries';
import {
    AlertTriangle,
    MessageCircle,
    Clock,
    CheckCircle,
    User,
    Mail,
    Phone,
    FileText,
    Calendar,
    Filter,
    Search,
    Eye,
    Reply,
    Archive,
    Flag,
    Plus,
    Edit3,
    ArrowUp
} from 'lucide-react';

// UserInquiry interface is now imported from the service

const UserInquiriesPage = () => {
    const [inquiries, setInquiries] = useState<UserInquiry[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedInquiry, setSelectedInquiry] = useState<UserInquiry | null>(null);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [showNoteModal, setShowNoteModal] = useState(false);
    const [responseText, setResponseText] = useState('');
    const [noteText, setNoteText] = useState('');
    const [noteType, setNoteType] = useState<'general' | 'follow_up' | 'escalation' | 'resolution'>('general');
    const [submitting, setSubmitting] = useState(false);
    const [stats, setStats] = useState({
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
    });
    const [pagination, setPagination] = useState({
        current: 1,
        pages: 1,
        total: 0
    });
    const [filters, setFilters] = useState<InquiryFilters>({
        status: 'all',
        urgency: 'all',
        conflictType: 'all',
        organization: 'NIA',
        page: 1,
        limit: 20
    });
    const [searchTerm, setSearchTerm] = useState('');

    useEffect(() => {
        fetchInquiries();
    }, [filters]);

    useEffect(() => {
        const delayedSearch = setTimeout(() => {
            if (searchTerm !== filters.search) {
                setFilters(prev => ({ ...prev, search: searchTerm, page: 1 }));
            }
        }, 500);

        return () => clearTimeout(delayedSearch);
    }, [searchTerm]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            setError(null);

            const response = await userConflictInquiriesService.getInquiries(filters);

            if (response.success) {
                setInquiries(response.data.inquiries);
                setStats(response.data.stats);
                setPagination(response.data.pagination);
            } else {
                throw new Error(response.message || 'Failed to fetch inquiries');
            }
        } catch (error) {
            console.error('Failed to fetch inquiries:', error);
            setError(error instanceof Error ? error.message : 'Failed to load inquiries');

            // Fallback to empty state instead of mock data
            setInquiries([]);
            setStats({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
            setPagination({ current: 1, pages: 1, total: 0 });
        } finally {
            setLoading(false);
        }
    };

    const getUrgencyColor = (urgency: string) => {
        switch (urgency) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'in_progress': return 'bg-purple-100 text-purple-800 border-purple-200';
            case 'resolved': return 'bg-green-100 text-green-800 border-green-200';
            case 'closed': return 'bg-gray-100 text-gray-800 border-gray-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getConflictTypeLabel = (type: string) => {
        const labels: Record<string, string> = {
            'disagreement_findings': 'Disagreement with Findings',
            'recommendation_concern': 'Recommendation Concerns',
            'surveyor_conduct': 'Surveyor Conduct',
            'technical_error': 'Technical Error',
            'missing_information': 'Missing Information',
            'clarification_needed': 'Clarification Needed',
            'other': 'Other Concerns'
        };
        return labels[type] || type;
    };

    const handleAssignToSelf = async (inquiryId: string) => {
        try {
            setSubmitting(true);
            const response = await userConflictInquiriesService.assignInquiry(inquiryId, 'NIA');

            if (response.success) {
                setInquiries(prev => prev.map(inquiry =>
                    inquiry._id === inquiryId ? response.data : inquiry
                ));
            } else {
                throw new Error('Failed to assign inquiry');
            }
        } catch (error) {
            console.error('Failed to assign inquiry:', error);
            setError(error instanceof Error ? error.message : 'Failed to assign inquiry');
        } finally {
            setSubmitting(false);
        }
    };

    const handleSendResponse = async () => {
        if (!selectedInquiry || !responseText.trim()) return;

        try {
            setSubmitting(true);
            const response = await userConflictInquiriesService.respondToInquiry(
                selectedInquiry._id,
                responseText,
                'email'
            );

            if (response.success) {
                setInquiries(prev => prev.map(inquiry =>
                    inquiry._id === selectedInquiry._id ? response.data : inquiry
                ));

                setShowResponseModal(false);
                setResponseText('');
                setSelectedInquiry(null);
            } else {
                throw new Error('Failed to send response');
            }
        } catch (error) {
            console.error('Failed to send response:', error);
            setError(error instanceof Error ? error.message : 'Failed to send response');
        } finally {
            setSubmitting(false);
        }
    };

    const handleAddNote = async () => {
        if (!selectedInquiry || !noteText.trim()) return;

        try {
            setSubmitting(true);
            const response = await userConflictInquiriesService.addInternalNote(
                selectedInquiry._id,
                noteText,
                noteType
            );

            if (response.success) {
                setInquiries(prev => prev.map(inquiry =>
                    inquiry._id === selectedInquiry._id ? response.data : inquiry
                ));

                setShowNoteModal(false);
                setNoteText('');
                setNoteType('general');
                setSelectedInquiry(null);
            } else {
                throw new Error('Failed to add note');
            }
        } catch (error) {
            console.error('Failed to add note:', error);
            setError(error instanceof Error ? error.message : 'Failed to add note');
        } finally {
            setSubmitting(false);
        }
    };

    const handleCloseInquiry = async (inquiryId: string, reason?: string) => {
        try {
            setSubmitting(true);
            const response = await userConflictInquiriesService.closeInquiry(inquiryId, reason);

            if (response.success) {
                setInquiries(prev => prev.map(inquiry =>
                    inquiry._id === inquiryId ? response.data : inquiry
                ));
            } else {
                throw new Error('Failed to close inquiry');
            }
        } catch (error) {
            console.error('Failed to close inquiry:', error);
            setError(error instanceof Error ? error.message : 'Failed to close inquiry');
        } finally {
            setSubmitting(false);
        }
    };

    // Filtering is now handled by the backend API
    const filteredInquiries = inquiries;

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="space-y-4">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-32"></div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Inquiries</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchInquiries}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">User Conflict Inquiries</h1>
                    <p className="text-gray-600 mt-1">
                        Manage and respond to user-raised conflicts about survey reports
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="bg-blue-50 px-3 py-1 rounded-full">
                        <span className="text-sm font-medium text-blue-700">
                            {filteredInquiries.length} inquiries
                        </span>
                    </div>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <AlertTriangle className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Open Inquiries</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.open}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <Clock className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.in_progress}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.resolved}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <Flag className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">High Priority</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {inquiries.filter(i => i.urgency === 'high').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                placeholder="Search by name, reference, or description..."
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value, page: 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="open">Open</option>
                            <option value="in_progress">In Progress</option>
                            <option value="resolved">Resolved</option>
                            <option value="closed">Closed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Urgency</label>
                        <select
                            value={filters.urgency}
                            onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value, page: 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Urgencies</option>
                            <option value="high">High</option>
                            <option value="medium">Medium</option>
                            <option value="low">Low</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Type</label>
                        <select
                            value={filters.conflictType}
                            onChange={(e) => setFilters(prev => ({ ...prev, conflictType: e.target.value, page: 1 }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Types</option>
                            <option value="disagreement_findings">Disagreement with Findings</option>
                            <option value="technical_error">Technical Error</option>
                            <option value="clarification_needed">Clarification Needed</option>
                            <option value="surveyor_conduct">Surveyor Conduct</option>
                            <option value="other">Other</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Inquiries List */}
            <div className="space-y-4">
                {filteredInquiries.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                        <MessageCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No inquiries found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status !== 'all' || filters.urgency !== 'all' || filters.conflictType !== 'all'
                                ? 'Try adjusting your filters to see more results.'
                                : 'User conflict inquiries will appear here when submitted.'}
                        </p>
                    </div>
                ) : (
                    filteredInquiries.map((inquiry) => (
                        <div key={inquiry._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {getConflictTypeLabel(inquiry.conflictType)}
                                        </h3>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getUrgencyColor(inquiry.urgency)}`}>
                                            {inquiry.urgency.toUpperCase()}
                                        </span>
                                        <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(inquiry.inquiryStatus)}`}>
                                            {inquiry.inquiryStatus.replace('_', ' ').toUpperCase()}
                                        </span>
                                    </div>
                                    <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                        <div className="flex items-center">
                                            <User className="h-4 w-4 mr-1" />
                                            {inquiry.userId.fullName}
                                        </div>
                                        <div className="flex items-center">
                                            <Calendar className="h-4 w-4 mr-1" />
                                            {new Date(inquiry.createdAt).toLocaleDateString()}
                                        </div>
                                        <div className="flex items-center">
                                            <FileText className="h-4 w-4 mr-1" />
                                            Ref: {inquiry.referenceId}
                                        </div>
                                    </div>
                                </div>
                            </div>

                            <div className="mb-4">
                                <p className="text-gray-700 leading-relaxed">
                                    {inquiry.description}
                                </p>
                            </div>

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div className="flex items-center">
                                        <Mail className="h-4 w-4 mr-1" />
                                        {inquiry.userContact.email}
                                    </div>
                                    {inquiry.userContact.phone && (
                                        <div className="flex items-center">
                                            <Phone className="h-4 w-4 mr-1" />
                                            {inquiry.userContact.phone}
                                        </div>
                                    )}
                                    <div className="text-xs">
                                        Prefers: {inquiry.contactPreference}
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    {inquiry.inquiryStatus === 'open' && (
                                        <button
                                            onClick={() => handleAssignToSelf(inquiry._id)}
                                            disabled={submitting}
                                            className="px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            Assign to Me
                                        </button>
                                    )}

                                    {(inquiry.inquiryStatus === 'in_progress' || inquiry.inquiryStatus === 'open') && (
                                        <button
                                            onClick={() => {
                                                setSelectedInquiry(inquiry);
                                                setResponseText('');
                                                setShowResponseModal(true);
                                            }}
                                            className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors"
                                        >
                                            <Reply className="h-4 w-4 mr-1" />
                                            Respond
                                        </button>
                                    )}

                                    <button
                                        onClick={() => {
                                            setSelectedInquiry(inquiry);
                                            setNoteText('');
                                            setShowNoteModal(true);
                                        }}
                                        className="flex items-center px-3 py-1 bg-purple-600 text-white text-sm rounded-md hover:bg-purple-700 transition-colors"
                                    >
                                        <Plus className="h-4 w-4 mr-1" />
                                        Add Note
                                    </button>

                                    {inquiry.adminResponse && (
                                        <button
                                            onClick={() => {
                                                setSelectedInquiry(inquiry);
                                                setResponseText(inquiry.adminResponse || '');
                                                setShowResponseModal(true);
                                            }}
                                            className="flex items-center px-3 py-1 bg-gray-600 text-white text-sm rounded-md hover:bg-gray-700 transition-colors"
                                        >
                                            <Eye className="h-4 w-4 mr-1" />
                                            View Response
                                        </button>
                                    )}

                                    {inquiry.inquiryStatus !== 'closed' && (
                                        <button
                                            onClick={() => handleCloseInquiry(inquiry._id, 'Closed by admin')}
                                            disabled={submitting}
                                            className="flex items-center px-3 py-1 bg-red-600 text-white text-sm rounded-md hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                        >
                                            <Archive className="h-4 w-4 mr-1" />
                                            Close
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Pagination */}
            {pagination.pages > 1 && (
                <div className="bg-white px-6 py-4 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between">
                        <div className="text-sm text-gray-600">
                            Showing {((pagination.current - 1) * (filters.limit || 20)) + 1} to {Math.min(pagination.current * (filters.limit || 20), pagination.total)} of {pagination.total} inquiries
                        </div>
                        <div className="flex items-center space-x-2">
                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: Math.max(1, pagination.current - 1) }))}
                                disabled={pagination.current === 1}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Previous
                            </button>

                            {Array.from({ length: Math.min(5, pagination.pages) }, (_, i) => {
                                const page = i + Math.max(1, pagination.current - 2);
                                if (page > pagination.pages) return null;

                                return (
                                    <button
                                        key={page}
                                        onClick={() => setFilters(prev => ({ ...prev, page }))}
                                        className={`px-3 py-1 border rounded-md text-sm ${page === pagination.current
                                            ? 'bg-blue-600 text-white border-blue-600'
                                            : 'border-gray-300 hover:bg-gray-50'
                                            }`}
                                    >
                                        {page}
                                    </button>
                                );
                            })}

                            <button
                                onClick={() => setFilters(prev => ({ ...prev, page: Math.min(pagination.pages, pagination.current + 1) }))}
                                disabled={pagination.current === pagination.pages}
                                className="px-3 py-1 border border-gray-300 rounded-md text-sm hover:bg-gray-50 disabled:opacity-50 disabled:cursor-not-allowed"
                            >
                                Next
                            </button>
                        </div>
                    </div>
                </div>
            )}

            {/* Response Modal */}
            {showResponseModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                {selectedInquiry.adminResponse ? 'View Response' : 'Respond to Inquiry'}
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Reference: {selectedInquiry.referenceId} • {selectedInquiry.userId.fullName}
                            </p>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="mb-4">
                                <h4 className="font-medium text-gray-900 mb-2">User's Inquiry:</h4>
                                <div className="bg-gray-50 p-4 rounded-lg">
                                    <p className="text-gray-700">{selectedInquiry.description}</p>
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    {selectedInquiry.adminResponse ? 'Previous Response:' : 'Your Response:'}
                                </label>
                                <textarea
                                    value={responseText}
                                    onChange={(e) => setResponseText(e.target.value)}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Type your response to the user's inquiry..."
                                    readOnly={!!selectedInquiry.adminResponse}
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowResponseModal(false);
                                    setResponseText('');
                                    setSelectedInquiry(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                {selectedInquiry.adminResponse ? 'Close' : 'Cancel'}
                            </button>
                            {!selectedInquiry.adminResponse && (
                                <button
                                    onClick={handleSendResponse}
                                    disabled={!responseText.trim() || submitting}
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                                >
                                    {submitting ? 'Sending...' : 'Send Response'}
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Add Note Modal */}
            {showNoteModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Add Internal Note
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Reference: {selectedInquiry.referenceId} • {selectedInquiry.userId.fullName}
                            </p>
                        </div>

                        <div className="p-6">
                            <div className="mb-4">
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note Type
                                </label>
                                <select
                                    value={noteType}
                                    onChange={(e) => setNoteType(e.target.value as any)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                >
                                    <option value="general">General Note</option>
                                    <option value="follow_up">Follow-up Required</option>
                                    <option value="escalation">Escalation</option>
                                    <option value="resolution">Resolution Note</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Note Content
                                </label>
                                <textarea
                                    value={noteText}
                                    onChange={(e) => setNoteText(e.target.value)}
                                    rows={4}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Add your internal note here..."
                                />
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowNoteModal(false);
                                    setNoteText('');
                                    setNoteType('general');
                                    setSelectedInquiry(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleAddNote}
                                disabled={!noteText.trim() || submitting}
                                className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                {submitting ? 'Adding...' : 'Add Note'}
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default UserInquiriesPage;