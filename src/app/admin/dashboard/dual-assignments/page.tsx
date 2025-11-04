"use client";
import React, { useState, useEffect } from 'react';
import {
    Search,
    RefreshCw,
    FileText,
    AlertTriangle,
    CheckCircle,
    Eye,
    UserPlus,
    X
} from 'lucide-react';
import AMMCAssignmentManagement from '@/components/admin/AMMCAssignmentManagement';

interface DualAssignment {
    _id: string;
    policyId: {
        _id: string;
        propertyDetails: {
            propertyType: string;
            address: string;
            buildingValue: number;
        };
        contactDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        };
        status: string;
    };
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    completionStatus: 0 | 50 | 100;
    ammcSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
        experience?: number;
        specialization?: string[];
    };
    niaSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
        experience?: number;
        specialization?: string[];
    };
    priority: string;
    estimatedCompletion: {
        overallDeadline: string;
    };
    createdAt: string;
}

const AMMCDualAssignmentsPage = () => {
    const [assignments, setAssignments] = useState<DualAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAssignmentModal, setShowAssignmentModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedAssignment, setSelectedAssignment] = useState<DualAssignment | null>(null);
    const [filters, setFilters] = useState({
        assignmentStatus: 'all',
        completionStatus: 'all',
        priority: 'all',
        search: ''
    });

    useEffect(() => {
        fetchAssignments();
    }, [filters]);

    const fetchAssignments = async () => {
        try {
            setLoading(true);

            // Try multiple token sources for AMMC admin
            const token = localStorage.getItem('adminToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            console.log('Using token for dual assignments:', token ? 'Token found' : 'No token');

            const queryParams = new URLSearchParams();
            if (filters.assignmentStatus !== 'all') queryParams.append('assignmentStatus', filters.assignmentStatus);
            if (filters.completionStatus !== 'all') queryParams.append('completionStatus', filters.completionStatus);
            if (filters.priority !== 'all') queryParams.append('priority', filters.priority);

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/dual-assignment?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch dual assignments');
            }

            const data = await response.json();

            if (data.success) {
                let filteredAssignments = data.data.dualAssignments || [];

                // Apply search filter
                if (filters.search) {
                    filteredAssignments = filteredAssignments.filter((assignment: DualAssignment) =>
                        assignment.policyId?.propertyDetails?.address?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        assignment.policyId?.contactDetails?.fullName?.toLowerCase().includes(filters.search.toLowerCase()) ||
                        assignment.policyId?.propertyDetails?.propertyType?.toLowerCase().includes(filters.search.toLowerCase())
                    );
                }

                setAssignments(filteredAssignments);
            } else {
                throw new Error(data.message || 'Failed to load dual assignments');
            }
        } catch (error) {
            console.error('Dual assignments fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load dual assignments');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'unassigned':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Unassigned</span>;
            case 'partially_assigned':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Partially Assigned</span>;
            case 'fully_assigned':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fully Assigned</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getCompletionBadge = (completion: number) => {
        switch (completion) {
            case 0:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Not Started (0%)</span>;
            case 50:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Partially Complete (50%)</span>;
            case 100:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Fully Complete (100%)</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{completion}%</span>;
        }
    };

    const canAssignAMMCSurveyor = (assignment: DualAssignment) => {
        return !assignment.ammcSurveyorContact;
    };

    const handleAssignSurveyor = (assignment: DualAssignment) => {
        setSelectedAssignment(assignment);
        setShowAssignmentModal(true);
    };

    const handleAssignmentComplete = () => {
        fetchAssignments(); // Refresh the assignments list
        setShowAssignmentModal(false);
        setSelectedAssignment(null);
    };

    const handleCloseModal = () => {
        setShowAssignmentModal(false);
        setSelectedAssignment(null);
    };

    const handleViewDetails = (assignment: DualAssignment) => {
        setSelectedAssignment(assignment);
        setShowDetailsModal(true);
    };

    const handleCloseDetailsModal = () => {
        setShowDetailsModal(false);
        setSelectedAssignment(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">AMMC Dual Assignment Management</h1>
                    <p className="text-gray-600 mt-1">Manage dual-surveyor assignments and coordinate with NIA</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchAssignments}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search assignments..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                        />
                    </div>

                    <select
                        value={filters.assignmentStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, assignmentStatus: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    >
                        <option value="all">All Assignment Status</option>
                        <option value="unassigned">Unassigned</option>
                        <option value="partially_assigned">Partially Assigned</option>
                        <option value="fully_assigned">Fully Assigned</option>
                    </select>

                    <select
                        value={filters.completionStatus}
                        onChange={(e) => setFilters(prev => ({ ...prev, completionStatus: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    >
                        <option value="all">All Completion</option>
                        <option value="0">Not Started (0%)</option>
                        <option value="50">Partially Complete (50%)</option>
                        <option value="100">Fully Complete (100%)</option>
                    </select>

                    <select
                        value={filters.priority}
                        onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                    >
                        <option value="all">All Priority</option>
                        <option value="urgent">Urgent</option>
                        <option value="high">High</option>
                        <option value="medium">Medium</option>
                        <option value="low">Low</option>
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Assignments Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3, 4, 5, 6].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : assignments.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {assignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            {/* Card Header */}
                            <div className="p-4 border-b border-gray-200">
                                <div className="flex items-start justify-between mb-2">
                                    <div className="flex items-center space-x-2">
                                        {getStatusBadge(assignment.assignmentStatus)}
                                        {getCompletionBadge(assignment.completionStatus)}
                                    </div>
                                    <button
                                        onClick={() => handleViewDetails(assignment)}
                                        className="text-gray-400 hover:text-gray-600 transition-colors"
                                        title="View Details"
                                    >
                                        <Eye className="w-4 h-4" />
                                    </button>
                                </div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {assignment.policyId?.propertyDetails?.propertyType || 'Property Survey'}
                                </h3>
                                <p className="text-sm text-gray-600 truncate">
                                    {assignment.policyId?.propertyDetails?.address || 'No address provided'}
                                </p>
                            </div>

                            {/* Card Body */}
                            <div className="p-4 space-y-3">
                                {/* Property Value */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Property Value:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        ₦{assignment.policyId?.propertyDetails?.buildingValue?.toLocaleString() || 'N/A'}
                                    </span>
                                </div>

                                {/* Contact Info */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Contact:</span>
                                    <span className="text-sm font-medium text-gray-900 truncate">
                                        {assignment.policyId?.contactDetails?.fullName || 'No contact'}
                                    </span>
                                </div>

                                {/* Surveyor Status */}
                                <div className="space-y-2">
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">AMMC Surveyor:</span>
                                        <span className={`text-xs font-medium ${assignment.ammcSurveyorContact?.name ? 'text-green-600' : 'text-gray-400'}`}>
                                            {assignment.ammcSurveyorContact?.name || 'Not Assigned'}
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between">
                                        <span className="text-xs text-gray-500">NIA Surveyor:</span>
                                        <span className={`text-xs font-medium ${assignment.niaSurveyorContact?.name ? 'text-blue-600' : 'text-gray-400'}`}>
                                            {assignment.niaSurveyorContact?.name || 'Not Assigned'}
                                        </span>
                                    </div>
                                </div>

                                {/* Deadline */}
                                <div className="flex items-center justify-between">
                                    <span className="text-sm text-gray-600">Deadline:</span>
                                    <span className="text-sm font-medium text-gray-900">
                                        {new Date(assignment.estimatedCompletion.overallDeadline).toLocaleDateString()}
                                    </span>
                                </div>
                            </div>

                            {/* Card Actions */}
                            <div className="p-4 border-t border-gray-200 bg-gray-50">
                                <div className="flex items-center justify-between">
                                    {canAssignAMMCSurveyor(assignment) ? (
                                        <button
                                            onClick={() => handleAssignSurveyor(assignment)}
                                            className="flex items-center space-x-2 px-3 py-1 bg-[#028835] text-white text-sm rounded hover:bg-green-700 transition-colors"
                                        >
                                            <UserPlus className="w-4 h-4" />
                                            <span>Assign AMMC Surveyor</span>
                                        </button>
                                    ) : (
                                        <div className="flex items-center space-x-2 text-xs text-gray-500">
                                            <CheckCircle className="w-3 h-3" />
                                            <span>AMMC Surveyor Assigned</span>
                                        </div>
                                    )}

                                    <button
                                        onClick={() => handleViewDetails(assignment)}
                                        className="text-[#028835] hover:text-green-700 text-sm font-medium transition-colors"
                                    >
                                        View Details
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                    <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No dual assignments found</h3>
                    <p className="text-gray-600">
                        {filters.search || filters.assignmentStatus !== 'all' || filters.completionStatus !== 'all' || filters.priority !== 'all'
                            ? 'Try adjusting your filters to see more assignments.'
                            : 'Dual-surveyor assignments will appear here when policies are submitted.'}
                    </p>
                </div>
            )}

            {/* Assignment Management Modal */}
            {showAssignmentModal && selectedAssignment && (
                <AMMCAssignmentManagement
                    assignment={selectedAssignment}
                    onAssignmentComplete={handleAssignmentComplete}
                    onClose={handleCloseModal}
                />
            )}

            {/* Assignment Details Modal */}
            {showDetailsModal && selectedAssignment && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                        {/* Header */}
                        <div className="bg-[#028835] text-white p-6">
                            <div className="flex items-center justify-between">
                                <div>
                                    <h2 className="text-xl font-bold">Assignment Details</h2>
                                    <p className="text-green-100 mt-1">
                                        {selectedAssignment.policyId.propertyDetails.propertyType} - {selectedAssignment.policyId.propertyDetails.address}
                                    </p>
                                </div>
                                <button
                                    onClick={handleCloseDetailsModal}
                                    className="text-green-100 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        {/* Content */}
                        <div className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                                {/* Property Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Property Information
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Property Type</label>
                                            <p className="text-gray-900">{selectedAssignment.policyId.propertyDetails.propertyType}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Address</label>
                                            <p className="text-gray-900">{selectedAssignment.policyId.propertyDetails.address}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Property Value</label>
                                            <p className="text-gray-900">₦{selectedAssignment.policyId.propertyDetails.buildingValue.toLocaleString()}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Priority</label>
                                            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${selectedAssignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                                selectedAssignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                                    selectedAssignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                }`}>
                                                {selectedAssignment.priority}
                                            </span>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Deadline</label>
                                            <p className="text-gray-900">{new Date(selectedAssignment.estimatedCompletion.overallDeadline).toLocaleDateString()}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Contact Information
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Client Name</label>
                                            <p className="text-gray-900">{selectedAssignment.policyId.contactDetails.fullName}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Email</label>
                                            <p className="text-gray-900">{selectedAssignment.policyId.contactDetails.email}</p>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Phone Number</label>
                                            <p className="text-gray-900">{selectedAssignment.policyId.contactDetails.phoneNumber}</p>
                                        </div>
                                    </div>
                                </div>

                                {/* Assignment Status */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Assignment Status
                                    </h3>

                                    <div className="space-y-3">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Overall Status</label>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedAssignment.assignmentStatus === 'unassigned' ? 'bg-gray-100 text-gray-800' :
                                                    selectedAssignment.assignmentStatus === 'partially_assigned' ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {selectedAssignment.assignmentStatus === 'unassigned' ? 'Unassigned' :
                                                        selectedAssignment.assignmentStatus === 'partially_assigned' ? 'Partially Assigned' :
                                                            'Fully Assigned'}
                                                </span>
                                            </div>
                                        </div>

                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Completion Status</label>
                                            <div className="mt-1">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${selectedAssignment.completionStatus === 0 ? 'bg-gray-100 text-gray-800' :
                                                    selectedAssignment.completionStatus === 50 ? 'bg-yellow-100 text-yellow-800' :
                                                        'bg-green-100 text-green-800'
                                                    }`}>
                                                    {selectedAssignment.completionStatus === 0 ? 'Not Started (0%)' :
                                                        selectedAssignment.completionStatus === 50 ? 'Partially Complete (50%)' :
                                                            'Fully Complete (100%)'}
                                                </span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                {/* Surveyor Information */}
                                <div className="space-y-4">
                                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                        Assigned Surveyors
                                    </h3>

                                    <div className="space-y-4">
                                        {/* AMMC Surveyor */}
                                        <div className="p-3 bg-green-50 rounded-lg">
                                            <h4 className="font-medium text-green-800 mb-2">AMMC Surveyor</h4>
                                            {selectedAssignment.ammcSurveyorContact ? (
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-medium">Name:</span> {selectedAssignment.ammcSurveyorContact.name}</p>
                                                    <p><span className="font-medium">Email:</span> {selectedAssignment.ammcSurveyorContact.email}</p>
                                                    <p><span className="font-medium">Phone:</span> {selectedAssignment.ammcSurveyorContact.phone}</p>
                                                    {selectedAssignment.ammcSurveyorContact.licenseNumber && (
                                                        <p><span className="font-medium">License:</span> {selectedAssignment.ammcSurveyorContact.licenseNumber}</p>
                                                    )}
                                                    {selectedAssignment.ammcSurveyorContact.experience && (
                                                        <p><span className="font-medium">Experience:</span> {selectedAssignment.ammcSurveyorContact.experience} years</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600">Not assigned</p>
                                            )}
                                        </div>

                                        {/* NIA Surveyor */}
                                        <div className="p-3 bg-blue-50 rounded-lg">
                                            <h4 className="font-medium text-blue-800 mb-2">NIA Surveyor</h4>
                                            {selectedAssignment.niaSurveyorContact ? (
                                                <div className="space-y-1 text-sm">
                                                    <p><span className="font-medium">Name:</span> {selectedAssignment.niaSurveyorContact.name}</p>
                                                    <p><span className="font-medium">Email:</span> {selectedAssignment.niaSurveyorContact.email}</p>
                                                    <p><span className="font-medium">Phone:</span> {selectedAssignment.niaSurveyorContact.phone}</p>
                                                    {selectedAssignment.niaSurveyorContact.licenseNumber && (
                                                        <p><span className="font-medium">License:</span> {selectedAssignment.niaSurveyorContact.licenseNumber}</p>
                                                    )}
                                                    {selectedAssignment.niaSurveyorContact.experience && (
                                                        <p><span className="font-medium">Experience:</span> {selectedAssignment.niaSurveyorContact.experience} years</p>
                                                    )}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-600">Not assigned</p>
                                            )}
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-6 bg-gray-50">
                            <div className="flex justify-end">
                                <button
                                    onClick={handleCloseDetailsModal}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Close
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default AMMCDualAssignmentsPage;