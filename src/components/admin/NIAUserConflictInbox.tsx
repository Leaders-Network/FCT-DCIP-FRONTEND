"use client";
import React, { useState, useEffect } from 'react';
import {
    Inbox,
    Search,
    AlertTriangle,
    Clock,
    User,
    CheckCircle,
    XCircle,
    ArrowUp,
    Eye,
    Reply,
    UserCheck,
    MessageSquare,
    FileText
} from 'lucide-react';

interface ConflictInquiry {
    _id: string;
    referenceId: string;
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    inquiryStatus: 'open' | 'in_progress' | 'resolved' | 'closed';
    contactPreference: 'email' | 'phone' | 'both';
    userContact: {
        email: string;
        phone: string;
        preferredTime: string;
    };
    userId: {
        _id: string;
        fullName: string;
        email: string;
        phoneNumber: string;
    };
    policyId: {
        _id: string;
        propertyDetails: {
            address: string;
            propertyType: string;
            buildingValue: number;
        };
        contactDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        };
        status: string;
    };
    assignedAdminId?: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    assignedOrganization: 'AMMC' | 'NIA' | 'BOTH';
    adminResponse?: string;
    responseMethod?: string;
    internalNotes: Array<{
        note: string;
        addedBy: {
            firstname: string;
            lastname: string;
        };
        addedAt: string;
        noteType: string;
    }>;
    escalationLevel: number;
    priority: 'low' | 'normal' | 'high' | 'urgent';
    createdAt: string;
    updatedAt: string;
    daysSinceCreation: number;
    responseTimeHours?: number;
}

interface InquiryStats {
    open: number;
    in_progress: number;
    resolved: number;
    closed: number;
}

const NIAUserConflictInbox: React.FC = () => {
    const [inquiries, setInquiries] = useState<ConflictInquiry[]>([]);
    const [stats, setStats] = useState<InquiryStats>({
        open: 0,
        in_progress: 0,
        resolved: 0,
        closed: 0
    });
    const [loading, setLoading] = useState(true);
    const [selectedInquiry, setSelectedInquiry] = useState<ConflictInquiry | null>(null);
    const [showDetails, setShowDetails] = useState(false);
    const [showResponseModal, setShowResponseModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        urgency: 'all',
        conflictType: 'all',
        organization: 'NIA' // NIA organization filter
    });
    const [searchTerm, setSearchTerm] = useState('');
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    // Response form state
    const [responseForm, setResponseForm] = useState({
        response: '',
        method: 'email',
        internalNote: ''
    });

    useEffect(() => {
        fetchInquiries();
    }, [filters, currentPage, searchTerm]);

    const fetchInquiries = async () => {
        try {
            setLoading(true);
            const queryParams = new URLSearchParams({
                ...filters,
                page: currentPage.toString(),
                limit: '10'
            });

            if (searchTerm) {
                queryParams.append('search', searchTerm);
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-conflict-inquiries/admin?${queryParams}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || '',
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                const data = await response.json();
                setInquiries(data.data.inquiries);
                setStats(data.data.stats);
                setTotalPages(data.data.pagination.pages);
            }
        } catch (error) {
        } finally {
            setLoading(false);
        }
    };

    const handleAssignToSelf = async (inquiryId: string) => {
        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-conflict-inquiries/admin/${inquiryId}/assign`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                },
                body: JSON.stringify({ organization: 'NIA' })
            });

            if (response.ok) {
                fetchInquiries();
            }
        } catch (error) {
        }
    };

    const handleSendResponse = async () => {
        if (!selectedInquiry || !responseForm.response.trim()) return;

        try {
            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-conflict-inquiries/admin/${selectedInquiry._id}/respond`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                },
                body: JSON.stringify({
                    response: responseForm.response,
                    method: responseForm.method
                })
            });

            if (response.ok) {
                setShowResponseModal(false);
                setResponseForm({
                    response: '',
                    method: 'email',
                    internalNote: ''
                });
                fetchInquiries();
            }
        } catch (error) {
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'open': return 'bg-red-100 text-red-800';
            case 'in_progress': return 'bg-yellow-100 text-yellow-800';
            case 'resolved': return 'bg-green-100 text-green-800';
            case 'closed': return 'bg-gray-100 text-gray-800';
            default: return 'bg-gray-100 text-gray-800';
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

    const getPriorityIcon = (priority: string) => {
        switch (priority) {
            case 'urgent': return <ArrowUp className="w-4 h-4 text-red-600" />;
            case 'high': return <ArrowUp className="w-4 h-4 text-orange-600" />;
            default: return null;
        }
    };

    const conflictTypeLabels: { [key: string]: string } = {
        'disagreement_findings': 'Disagreement with Findings',
        'recommendation_concern': 'Recommendation Concern',
        'surveyor_conduct': 'Surveyor Conduct',
        'technical_error': 'Technical Error',
        'missing_information': 'Missing Information',
        'clarification_needed': 'Clarification Needed',
        'other': 'Other'
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 flex items-center">
                            <Inbox className="w-8 h-8 text-green-600 mr-3" />
                            User Conflict Inquiries (NIA)
                        </h1>
                        <p className="text-gray-600 mt-1">
                            Manage and respond to user-submitted conflict inquiries and disputes about survey reports.
                            All user inquiries or conflicts raised will be managed on this page.
                        </p>
                    </div>
                </div>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-6">
                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <AlertTriangle className="w-6 h-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Open</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.open}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="w-6 h-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">In Progress</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.in_progress}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <CheckCircle className="w-6 h-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Resolved</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.resolved}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow p-6">
                    <div className="flex items-center">
                        <div className="p-2 bg-gray-100 rounded-lg">
                            <XCircle className="w-6 h-6 text-gray-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Closed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.closed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters and Search */}
            <div className="bg-white rounded-lg shadow mb-6 p-4">
                <div className="flex flex-wrap items-center gap-4">
                    <div className="flex-1 min-w-64">
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search by reference ID, user name, or description..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                            />
                        </div>
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Status</option>
                        <option value="open">Open</option>
                        <option value="in_progress">In Progress</option>
                        <option value="resolved">Resolved</option>
                        <option value="closed">Closed</option>
                    </select>

                    <select
                        value={filters.urgency}
                        onChange={(e) => setFilters(prev => ({ ...prev, urgency: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Urgency</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>

                    <select
                        value={filters.conflictType}
                        onChange={(e) => setFilters(prev => ({ ...prev, conflictType: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    >
                        <option value="all">All Types</option>
                        {Object.entries(conflictTypeLabels).map(([key, label]) => (
                            <option key={key} value={key}>{label}</option>
                        ))}
                    </select>
                </div>
            </div>

            {/* Inquiries List */}
            <div className="bg-white rounded-lg shadow">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600 mx-auto"></div>
                        <p className="text-gray-600 mt-2">Loading inquiries...</p>
                    </div>
                ) : inquiries.length === 0 ? (
                    <div className="p-12 text-center">
                        <div className="max-w-md mx-auto">
                            <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-6">
                                <MessageSquare className="w-10 h-10 text-green-600" />
                            </div>

                            <h3 className="text-xl font-semibold text-gray-900 mb-3">
                                NIA User Conflict Inquiry Management
                            </h3>

                            <p className="text-gray-600 mb-6 leading-relaxed">
                                This page manages all user-submitted conflict inquiries and disputes related to survey reports.
                                When users raise concerns about their merged survey reports, they will appear here for NIA administrators to review and respond.
                            </p>

                            <div className="bg-green-50 border border-green-200 rounded-lg p-6 mb-6">
                                <h4 className="text-sm font-semibold text-green-900 mb-3">What you can manage here:</h4>
                                <div className="text-left space-y-2 text-sm text-green-800">
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>User complaints about survey findings or recommendations</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Technical errors or missing information in reports</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Surveyor conduct issues and clarification requests</span>
                                    </div>
                                    <div className="flex items-start space-x-2">
                                        <CheckCircle className="w-4 h-4 text-green-600 mt-0.5 flex-shrink-0" />
                                        <span>Conflicts between AMMC and NIA survey recommendations</span>
                                    </div>
                                </div>
                            </div>

                            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                <p className="text-sm text-gray-600">
                                    <strong>No inquiries at the moment.</strong> When users submit conflict inquiries through their dashboard,
                                    they will appear here with options to assign, respond, and track resolution progress.
                                </p>
                                <p className="text-xs text-gray-500 mt-2">
                                    Users can raise conflicts by clicking "Raise Conflict" on their merged survey reports when they disagree with findings or need clarification.
                                </p>
                            </div>

                            <div className="mt-6 flex items-center justify-center space-x-4 text-sm text-gray-500">
                                <div className="flex items-center space-x-1">
                                    <Clock className="w-4 h-4" />
                                    <span>Real-time updates</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <User className="w-4 h-4" />
                                    <span>User notifications</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                    <FileText className="w-4 h-4" />
                                    <span>Response tracking</span>
                                </div>
                            </div>
                        </div>
                    </div>
                ) : (
                    <div className="overflow-hidden">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Inquiry Details
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        User
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Priority
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Age
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {inquiries.map((inquiry) => (
                                    <tr key={inquiry._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4">
                                            <div>
                                                <div className="flex items-center">
                                                    {getPriorityIcon(inquiry.priority)}
                                                    <p className="text-sm font-medium text-gray-900 ml-2">
                                                        {inquiry.referenceId}
                                                    </p>
                                                </div>
                                                <p className="text-sm text-gray-600 mt-1">
                                                    {conflictTypeLabels[inquiry.conflictType]}
                                                </p>
                                                <p className="text-xs text-gray-500 mt-1 line-clamp-2">
                                                    {inquiry.description}
                                                </p>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-8 w-8">
                                                    <div className="h-8 w-8 rounded-full bg-green-100 flex items-center justify-center">
                                                        <User className="w-4 h-4 text-green-600" />
                                                    </div>
                                                </div>
                                                <div className="ml-3">
                                                    <p className="text-sm font-medium text-gray-900">
                                                        {inquiry.userId.fullName}
                                                    </p>
                                                    <p className="text-xs text-gray-500">
                                                        {inquiry.userId.email}
                                                    </p>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${getStatusColor(inquiry.inquiryStatus)}`}>
                                                {inquiry.inquiryStatus.replace('_', ' ')}
                                            </span>
                                            <p className={`text-xs mt-1 ${getUrgencyColor(inquiry.urgency)}`}>
                                                {inquiry.urgency} urgency
                                            </p>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center">
                                                {inquiry.priority === 'urgent' && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-red-100 text-red-800">
                                                        Urgent
                                                    </span>
                                                )}
                                                {inquiry.escalationLevel > 0 && (
                                                    <span className="inline-flex px-2 py-1 text-xs font-semibold rounded-full bg-orange-100 text-orange-800 ml-1">
                                                        Escalated
                                                    </span>
                                                )}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 text-sm text-gray-900">
                                            {inquiry.daysSinceCreation} days
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center space-x-2">
                                                <button
                                                    onClick={() => {
                                                        setSelectedInquiry(inquiry);
                                                        setShowDetails(true);
                                                    }}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                {inquiry.inquiryStatus === 'open' && (
                                                    <button
                                                        onClick={() => handleAssignToSelf(inquiry._id)}
                                                        className="text-blue-600 hover:text-blue-900"
                                                        title="Assign to Me"
                                                    >
                                                        <UserCheck className="w-4 h-4" />
                                                    </button>
                                                )}
                                                {inquiry.inquiryStatus === 'in_progress' && (
                                                    <button
                                                        onClick={() => {
                                                            setSelectedInquiry(inquiry);
                                                            setShowResponseModal(true);
                                                        }}
                                                        className="text-purple-600 hover:text-purple-900"
                                                        title="Send Response"
                                                    >
                                                        <Reply className="w-4 h-4" />
                                                    </button>
                                                )}
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Simple modals would go here - keeping this component focused */}
            {showDetails && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Inquiry Details - {selectedInquiry.referenceId}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="font-medium">Type:</label>
                                <p>{conflictTypeLabels[selectedInquiry.conflictType]}</p>
                            </div>
                            <div>
                                <label className="font-medium">Description:</label>
                                <p>{selectedInquiry.description}</p>
                            </div>
                            <div>
                                <label className="font-medium">User:</label>
                                <p>{selectedInquiry.userId.fullName} ({selectedInquiry.userId.email})</p>
                            </div>
                            <div>
                                <label className="font-medium">Status:</label>
                                <p className="capitalize">{selectedInquiry.inquiryStatus.replace('_', ' ')}</p>
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowDetails(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Close
                            </button>
                            {selectedInquiry.inquiryStatus === 'open' && (
                                <button
                                    onClick={() => {
                                        handleAssignToSelf(selectedInquiry._id);
                                        setShowDetails(false);
                                    }}
                                    className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
                                >
                                    Assign to Me
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {showResponseModal && selectedInquiry && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full p-6">
                        <h3 className="text-lg font-bold mb-4">Send Response - {selectedInquiry.referenceId}</h3>
                        <div className="space-y-4">
                            <div>
                                <label className="block font-medium mb-2">Response Method:</label>
                                <select
                                    value={responseForm.method}
                                    onChange={(e) => setResponseForm(prev => ({ ...prev, method: e.target.value }))}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                >
                                    <option value="email">Email</option>
                                    <option value="phone">Phone</option>
                                    <option value="in_person">In Person</option>
                                </select>
                            </div>
                            <div>
                                <label className="block font-medium mb-2">Response:</label>
                                <textarea
                                    value={responseForm.response}
                                    onChange={(e) => setResponseForm(prev => ({ ...prev, response: e.target.value }))}
                                    rows={6}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500"
                                    placeholder="Type your response..."
                                />
                            </div>
                        </div>
                        <div className="mt-6 flex justify-end space-x-3">
                            <button
                                onClick={() => setShowResponseModal(false)}
                                className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSendResponse}
                                disabled={!responseForm.response.trim()}
                                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50"
                            >
                                Send Response
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NIAUserConflictInbox;