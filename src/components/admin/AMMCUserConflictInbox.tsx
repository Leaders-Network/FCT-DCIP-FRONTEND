"use client";
import React, { useState, useEffect } from 'react';
import {
  Inbox,
  Search,
  Filter,
  AlertTriangle,
  Clock,
  User,
  MessageSquare,
  CheckCircle,
  XCircle,
  ArrowUp,
  Eye,
  Reply,
  UserCheck,
  FileText,
  Calendar,
  Phone,
  Mail,
  MoreVertical,
  Tag,
  TrendingUp,
  Users,
  Activity
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
    propertyDetails: any;
    contactDetails: any;
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

const AMMCUserConflictInbox: React.FC = () => {
  console.log('AMMCUserConflictInbox component rendering...');
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
    organization: 'AMMC'
  });
  const [searchTerm, setSearchTerm] = useState('');
  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);

  // Response form state
  const [responseForm, setResponseForm] = useState({
    response: '',
    method: 'email',
    internalNote: '',
    followUpRequired: false,
    followUpDate: ''
  });

  useEffect(() => {
    fetchInquiries();
  }, [filters, currentPage, searchTerm]);

  const fetchInquiries = async () => {
    try {
      console.log('Fetching inquiries...');
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

      console.log('API Response status:', response.status);

      if (response.ok) {
        const data = await response.json();
        console.log('API Response data:', data);
        setInquiries(data.data?.inquiries || []);
        setStats(data.data?.stats || { open: 0, in_progress: 0, resolved: 0, closed: 0 });
        setTotalPages(data.data?.pagination?.pages || 1);
      } else {
        const errorText = await response.text();
        console.error('API Error:', response.status, errorText);
        // Set empty state on error
        setInquiries([]);
        setStats({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
        setTotalPages(1);
      }
    } catch (error) {
      console.error('Network Error fetching inquiries:', error);
      // Set empty state on error
      setInquiries([]);
      setStats({ open: 0, in_progress: 0, resolved: 0, closed: 0 });
      setTotalPages(1);
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
        body: JSON.stringify({ organization: 'AMMC' })
      });

      if (response.ok) {
        fetchInquiries();
        if (selectedInquiry?._id === inquiryId) {
          const updatedInquiry = inquiries.find(i => i._id === inquiryId);
          if (updatedInquiry) {
            setSelectedInquiry(updatedInquiry);
          }
        }
      }
    } catch (error) {
      console.error('Error assigning inquiry:', error);
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
        // Add internal note if provided
        if (responseForm.internalNote.trim()) {
          await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/user-conflict-inquiries/admin/${selectedInquiry._id}/add-note`, {
            method: 'PUT',
            headers: {
              'Content-Type': 'application/json',
              'Authorization': `Bearer ${localStorage.getItem('token')}`,
              'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
            },
            body: JSON.stringify({
              note: responseForm.internalNote,
              noteType: 'follow_up'
            })
          });
        }

        setShowResponseModal(false);
        setResponseForm({
          response: '',
          method: 'email',
          internalNote: '',
          followUpRequired: false,
          followUpDate: ''
        });
        fetchInquiries();
      }
    } catch (error) {
      console.error('Error sending response:', error);
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
              <Inbox className="w-8 h-8 text-blue-600 mr-3" />
              User Conflict Inquiries (AMMC)
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
                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Urgency</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>

          <select
            value={filters.conflictType}
            onChange={(e) => setFilters(prev => ({ ...prev, conflictType: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
            <p className="text-gray-600 mt-2">Loading inquiries...</p>
          </div>
        ) : inquiries.length === 0 ? (
          <div className="p-12 text-center">
            <div className="max-w-md mx-auto">
              <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
                <MessageSquare className="w-10 h-10 text-blue-600" />
              </div>

              <h3 className="text-xl font-semibold text-gray-900 mb-3">
                User Conflict Inquiry Management
              </h3>

              <p className="text-gray-600 mb-6 leading-relaxed">
                This page manages all user-submitted conflict inquiries and disputes related to survey reports.
                When users raise concerns about their merged survey reports, they will appear here for AMMC administrators to review and respond.
              </p>

              <div className="bg-blue-50 border border-blue-200 rounded-lg p-6 mb-6">
                <h4 className="text-sm font-semibold text-blue-900 mb-3">What you can manage here:</h4>
                <div className="text-left space-y-2 text-sm text-blue-800">
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>User complaints about survey findings or recommendations</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Technical errors or missing information in reports</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Surveyor conduct issues and clarification requests</span>
                  </div>
                  <div className="flex items-start space-x-2">
                    <CheckCircle className="w-4 h-4 text-blue-600 mt-0.5 flex-shrink-0" />
                    <span>Conflicts between AMMC and NIA survey recommendations</span>
                  </div>
                </div>
              </div>

              <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <p className="text-sm text-gray-600">
                  <strong>No inquiries at the moment.</strong> When users submit conflict inquiries through their dashboard,
                  they will appear here with options to assign, respond, and track resolution progress.
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
                          <div className="h-8 w-8 rounded-full bg-blue-100 flex items-center justify-center">
                            <User className="w-4 h-4 text-blue-600" />
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
                          className="text-blue-600 hover:text-blue-900"
                          title="View Details"
                        >
                          <Eye className="w-4 h-4" />
                        </button>
                        {inquiry.inquiryStatus === 'open' && (
                          <button
                            onClick={() => handleAssignToSelf(inquiry._id)}
                            className="text-green-600 hover:text-green-900"
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
            {/* Pagination */}
            {totalPages > 1 && (
              <div className="bg-white px-4 py-3 border-t border-gray-200 sm:px-6">
                <div className="flex items-center justify-between">
                  <div className="flex-1 flex justify-between sm:hidden">
                    <button
                      onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                      disabled={currentPage === 1}
                      className="relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Previous
                    </button>
                    <button
                      onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                      disabled={currentPage === totalPages}
                      className="ml-3 relative inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                    >
                      Next
                    </button>
                  </div>
                  <div className="hidden sm:flex-1 sm:flex sm:items-center sm:justify-between">
                    <div>
                      <p className="text-sm text-gray-700">
                        Page <span className="font-medium">{currentPage}</span> of{' '}
                        <span className="font-medium">{totalPages}</span>
                      </p>
                    </div>
                    <div>
                      <nav className="relative z-0 inline-flex rounded-md shadow-sm -space-x-px">
                        <button
                          onClick={() => setCurrentPage(prev => Math.max(prev - 1, 1))}
                          disabled={currentPage === 1}
                          className="relative inline-flex items-center px-2 py-2 rounded-l-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Previous
                        </button>
                        <button
                          onClick={() => setCurrentPage(prev => Math.min(prev + 1, totalPages))}
                          disabled={currentPage === totalPages}
                          className="relative inline-flex items-center px-2 py-2 rounded-r-md border border-gray-300 bg-white text-sm font-medium text-gray-500 hover:bg-gray-50 disabled:opacity-50"
                        >
                          Next
                        </button>
                      </nav>
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        )}
      </div>

      {/* Inquiry Details Modal */}
      {showDetails && selectedInquiry && (
        <InquiryDetailsModal
          inquiry={selectedInquiry}
          onClose={() => {
            setShowDetails(false);
            setSelectedInquiry(null);
          }}
          onAssign={() => handleAssignToSelf(selectedInquiry._id)}
          onRespond={() => {
            setShowDetails(false);
            setShowResponseModal(true);
          }}
        />
      )}

      {/* Response Modal */}
      {showResponseModal && selectedInquiry && (
        <ResponseModal
          inquiry={selectedInquiry}
          responseForm={responseForm}
          setResponseForm={setResponseForm}
          onClose={() => {
            setShowResponseModal(false);
            setResponseForm({
              response: '',
              method: 'email',
              internalNote: '',
              followUpRequired: false,
              followUpDate: ''
            });
          }}
          onSubmit={handleSendResponse}
        />
      )}
    </div>
  );
};

// Inquiry Details Modal Component
const InquiryDetailsModal: React.FC<{
  inquiry: ConflictInquiry;
  onClose: () => void;
  onAssign: () => void;
  onRespond: () => void;
}> = ({ inquiry, onClose, onAssign, onRespond }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-blue-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Inquiry Details</h2>
              <p className="text-blue-100 mt-1">{inquiry.referenceId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-blue-100 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Left Column */}
            <div className="space-y-6">
              {/* Basic Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Basic Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Conflict Type</label>
                    <p className="text-sm text-gray-900">{inquiry.conflictType.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Description</label>
                    <p className="text-sm text-gray-900">{inquiry.description}</p>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="text-sm font-medium text-gray-600">Urgency</label>
                      <p className="text-sm text-gray-900 capitalize">{inquiry.urgency}</p>
                    </div>
                    <div>
                      <label className="text-sm font-medium text-gray-600">Priority</label>
                      <p className="text-sm text-gray-900 capitalize">{inquiry.priority}</p>
                    </div>
                  </div>
                </div>
              </div>

              {/* User Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">User Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Name</label>
                    <p className="text-sm text-gray-900">{inquiry.userId.fullName}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Email</label>
                    <p className="text-sm text-gray-900">{inquiry.userId.email}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Phone</label>
                    <p className="text-sm text-gray-900">{inquiry.userContact.phone || 'Not provided'}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Preferred Contact</label>
                    <p className="text-sm text-gray-900 capitalize">{inquiry.contactPreference}</p>
                  </div>
                  {inquiry.userContact.preferredTime && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Preferred Time</label>
                      <p className="text-sm text-gray-900">{inquiry.userContact.preferredTime}</p>
                    </div>
                  )}
                </div>
              </div>
            </div>

            {/* Right Column */}
            <div className="space-y-6">
              {/* Status Information */}
              <div>
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Status Information</h3>
                <div className="space-y-3">
                  <div>
                    <label className="text-sm font-medium text-gray-600">Current Status</label>
                    <p className="text-sm text-gray-900 capitalize">{inquiry.inquiryStatus.replace('_', ' ')}</p>
                  </div>
                  <div>
                    <label className="text-sm font-medium text-gray-600">Assigned Organization</label>
                    <p className="text-sm text-gray-900">{inquiry.assignedOrganization}</p>
                  </div>
                  {inquiry.assignedAdminId && (
                    <div>
                      <label className="text-sm font-medium text-gray-600">Assigned Admin</label>
                      <p className="text-sm text-gray-900">
                        {inquiry.assignedAdminId.firstname} {inquiry.assignedAdminId.lastname}
                      </p>
                    </div>
                  )}
                  <div>
                    <label className="text-sm font-medium text-gray-600">Created</label>
                    <p className="text-sm text-gray-900">
                      {new Date(inquiry.createdAt).toLocaleDateString()} ({inquiry.daysSinceCreation} days ago)
                    </p>
                  </div>
                </div>
              </div>

              {/* Internal Notes */}
              {inquiry.internalNotes.length > 0 && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Internal Notes</h3>
                  <div className="space-y-3 max-h-48 overflow-y-auto">
                    {inquiry.internalNotes.map((note, index) => (
                      <div key={index} className="bg-gray-50 p-3 rounded-lg">
                        <p className="text-sm text-gray-900">{note.note}</p>
                        <p className="text-xs text-gray-500 mt-1">
                          By {note.addedBy.firstname} {note.addedBy.lastname} on{' '}
                          {new Date(note.addedAt).toLocaleDateString()}
                        </p>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Admin Response */}
              {inquiry.adminResponse && (
                <div>
                  <h3 className="text-lg font-semibold text-gray-900 mb-4">Admin Response</h3>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-sm text-gray-900">{inquiry.adminResponse}</p>
                    <p className="text-xs text-gray-500 mt-2">
                      Sent via {inquiry.responseMethod}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Close
            </button>
            {inquiry.inquiryStatus === 'open' && (
              <button
                onClick={onAssign}
                className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700"
              >
                Assign to Me
              </button>
            )}
            {inquiry.inquiryStatus === 'in_progress' && (
              <button
                onClick={onRespond}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
              >
                Send Response
              </button>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};

// Response Modal Component
const ResponseModal: React.FC<{
  inquiry: ConflictInquiry;
  responseForm: any;
  setResponseForm: (form: any) => void;
  onClose: () => void;
  onSubmit: () => void;
}> = ({ inquiry, responseForm, setResponseForm, onClose, onSubmit }) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
      <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
        <div className="bg-purple-600 text-white p-6">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-xl font-bold">Send Response</h2>
              <p className="text-purple-100 mt-1">{inquiry.referenceId}</p>
            </div>
            <button
              onClick={onClose}
              className="text-purple-100 hover:text-white"
            >
              <XCircle className="w-6 h-6" />
            </button>
          </div>
        </div>

        <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
          <div className="space-y-6">
            {/* Response Method */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Method
              </label>
              <select
                value={responseForm.method}
                onChange={(e) => setResponseForm(prev => ({ ...prev, method: e.target.value }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
              >
                <option value="email">Email</option>
                <option value="phone">Phone Call</option>
                <option value="in_person">In Person</option>
              </select>
            </div>

            {/* Response Text */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Response Message *
              </label>
              <textarea
                value={responseForm.response}
                onChange={(e) => setResponseForm(prev => ({ ...prev, response: e.target.value }))}
                rows={8}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Provide a detailed response to the user's inquiry..."
                required
              />
            </div>

            {/* Internal Note */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Internal Note (Optional)
              </label>
              <textarea
                value={responseForm.internalNote}
                onChange={(e) => setResponseForm(prev => ({ ...prev, internalNote: e.target.value }))}
                rows={3}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
                placeholder="Add any internal notes for other administrators..."
              />
            </div>

            {/* User Contact Information */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <h4 className="text-sm font-medium text-blue-900 mb-2">User Contact Information</h4>
              <div className="space-y-1 text-sm text-blue-800">
                <p><strong>Name:</strong> {inquiry.userId.fullName}</p>
                <p><strong>Email:</strong> {inquiry.userId.email}</p>
                {inquiry.userContact.phone && (
                  <p><strong>Phone:</strong> {inquiry.userContact.phone}</p>
                )}
                <p><strong>Preferred Contact:</strong> {inquiry.contactPreference}</p>
                {inquiry.userContact.preferredTime && (
                  <p><strong>Preferred Time:</strong> {inquiry.userContact.preferredTime}</p>
                )}
              </div>
            </div>
          </div>
        </div>

        <div className="border-t border-gray-200 p-6">
          <div className="flex items-center justify-end space-x-3">
            <button
              onClick={onClose}
              className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200"
            >
              Cancel
            </button>
            <button
              onClick={onSubmit}
              disabled={!responseForm.response.trim()}
              className="px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send Response
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AMMCUserConflictInbox;