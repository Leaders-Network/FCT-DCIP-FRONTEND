
'use client';

import Link from 'next/link';
import { useState, useEffect } from 'react'
import { useSearchParams } from 'next/navigation';
import {
  MapPin,
  Clock,
  User,
  AlertTriangle,
  CheckCircle,
  Calendar,
  FileText,
  MessageSquare,
  Camera,
  Star,
  Filter,
  Search,
  Plus,
  RefreshCw,
  Eye,
  Edit,
  Trash2,
  X
} from 'lucide-react';
import {
  getSurveyorAssignmentsNew,
  acceptAssignment,
  startAssignment,
  updateAssignmentProgress,
  completeAssignment,
} from '@/services/api';
import { adminApi } from '@/services/api';
import { Assignment, Surveyor, ContactLogEntry } from '@/types/api.types';
import { useAuth } from '../context/useAuth';
import DocumentManager from './FileUpload/DocumentManager';
import AssignSurveyorModal from './admin/AssignSurveyorModal';

interface AssignmentManagementProps {
  className?: string;
  viewMode?: 'admin' | 'surveyor';
  surveyorId?: string;
}

interface AssignmentFilters {
  status: string;
  priority: string;
  surveyorId: string;
  search: string;
}

const AssignmentManagement: React.FC<AssignmentManagementProps> = ({
  className = '',
  viewMode = 'admin',
  surveyorId
}) => {
  const { user } = useAuth();
  const searchParams = useSearchParams();
  const ammcId = searchParams.get('ammcId');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [isReassignMode, setIsReassignMode] = useState(false);

  const [filters, setFilters] = useState<AssignmentFilters>({
    status: 'all',
    priority: 'all',
    surveyorId: surveyorId || 'all',
    search: ''
  });

  const [assignedPolicies, setAssignedPolicies] = useState<any[]>([]);

  const fetchAssignedPolicies = async () => {
    try {
      const response = await adminApi.getPolicies({ status: 'assigned', page: 1, limit: 100 });
      if (response?.data) {
        setAssignedPolicies(response.data.policyRequests);
      } else {
        setAssignedPolicies([]);
      }
    } catch (error) {
      setAssignedPolicies([]);
    }
  };

  useEffect(() => {
    fetchData();
    fetchPolicies();
    fetchAssignedPolicies();

    if (ammcId) {
      const fetchPolicy = async () => {
        try {
          const response = await adminApi.getPolicyById(ammcId);
          if (response?.data) {
            setSelectedPolicy(response.data);
            setShowAssignModal(true);
          }
        } catch (error) {
          console.error("Failed to fetch policy:", error);
        }
      };
      fetchPolicy();
    }
  }, [filters, surveyorId, ammcId]);

  const fetchPolicies = async () => {
    try {
      const response = await adminApi.getPolicies({ status: 'submitted', page: 1, limit: 100 });
      if (response?.data) {
        setPolicies(response.data.policyRequests);
      } else {
        setPolicies([]);
      }
    } catch (error) {
      setPolicies([]);
    }
  };

  const fetchData = async () => {
    setLoading(true);
    setError(null);

    try {
      let assignmentsResponse;
      if (viewMode === 'admin') {
        assignmentsResponse = await adminApi.getAssignments({
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          surveyorId: filters.surveyorId !== 'all' ? filters.surveyorId : undefined,
          page: 1,
          limit: 50
        } as any);
      } else {
        assignmentsResponse = await getSurveyorAssignmentsNew({
          status: filters.status !== 'all' ? filters.status : undefined,
          priority: filters.priority !== 'all' ? filters.priority : undefined,
          page: 1,
          limit: 50
        });
      }

      if (assignmentsResponse.success && assignmentsResponse.data && Array.isArray(assignmentsResponse.data.assignments)) {
        setAssignments(assignmentsResponse.data.assignments);
      } else {
        setAssignments([]);
      }

      if (viewMode === 'admin') {
        const surveyorsResponse = await adminApi.getSurveyors({ limit: 100 });
        if (surveyorsResponse.success) {
          setSurveyors(surveyorsResponse.data.surveyors || []);
        }
      }

    } catch (error: unknown) {
      setError('Failed to load assignments. Please try again.');
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, action: 'accept' | 'start' | 'complete', data?: Record<string, unknown>) => {
    try {
      let response;

      switch (action) {
        case 'accept':
          response = await acceptAssignment(assignmentId);
          break;
        case 'start':
          response = await startAssignment(assignmentId);
          break;
        case 'complete':
          response = await completeAssignment(assignmentId, data);
          break;
      }

      if (response.success) {
        fetchData();
        setSelectedAssignment(null);
      } else {
        setError(response.message || 'Failed to update assignment');
      }
    } catch (error: unknown) {
      setError('Failed to update assignment. Please try again.');
    }
  };

  const updateProgress = async (assignmentId: string, progressData: Record<string, unknown>) => {
    try {
      const response = await updateAssignmentProgress(assignmentId, progressData);

      if (response.success) {
        fetchData();
      } else {
        setError(response.message || 'Failed to update progress');
      }
    } catch (error: unknown) {
      setError('Failed to update progress. Please try again.');
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'assigned':
        return 'bg-yellow-100 text-yellow-800 border-yellow-200';
      case 'accepted':
        return 'bg-blue-100 text-blue-800 border-blue-200';
      case 'in_progress':
        return 'bg-purple-100 text-purple-800 border-purple-200';
      case 'completed':
        return 'bg-green-100 text-green-800 border-green-200';
      case 'rejected':
        return 'bg-red-100 text-red-800 border-red-200';
      case 'cancelled':
        return 'bg-gray-100 text-gray-800 border-gray-200';
      default:
        return 'bg-gray-100 text-gray-800 border-gray-200';
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return 'bg-red-500 text-white';
      case 'high':
        return 'bg-orange-500 text-white';
      case 'medium':
        return 'bg-yellow-500 text-white';
      case 'low':
        return 'bg-green-500 text-white';
      default:
        return 'bg-gray-500 text-white';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString() + ' ' + date.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
  };

  const isOverdue = (deadline: string, status: string) => {
    if (status === 'completed') return false;
    return new Date(deadline) < new Date();
  };

  if (loading) {
    return (
      <div className={`space-y-6 ${className}`}>
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[1, 2, 3, 4, 5, 6].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="space-y-3">
                  <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                  <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                  <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className={`space-y-6 ${className}`}>
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            {viewMode === 'admin' ? 'AMMC Surveyor Assignment Management' : 'My AMMC Assignments'}
          </h2>
          <p className="text-gray-600 mt-1">
            Manage AMMC surveyor assignments and track progress
          </p>
        </div>
      </div>

      <div className="flex items-center space-x-3">
        <button
          onClick={fetchData}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
        >
          <RefreshCw className="w-4 h-4" />
          <span>Refresh</span>
        </button>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative md:col-span-2">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={filters.search}
              onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            {filters.search && (
              <button
                onClick={() => setFilters(prev => ({ ...prev, search: '' }))}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="w-4 h-4" />
              </button>
            )}
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Status</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters(prev => ({ ...prev, priority: e.target.value }))}
            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
          >
            <option value="all">All Priority</option>
            <option value="urgent">Urgent</option>
            <option value="high">High</option>
            <option value="medium">Medium</option>
            <option value="low">Low</option>
          </select>
        </div>
        {viewMode === 'admin' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
            <select
              value={filters.surveyorId}
              onChange={(e) => setFilters(prev => ({ ...prev, surveyorId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All AMMC Surveyors</option>
              {(surveyors || []).map((surveyor) => (
                <option key={surveyor?._id} value={surveyor?._id}>
                  {(surveyor?.userId as any)?.firstname} {(surveyor?.userId as any)?.lastname}
                </option>))}
            </select>

            <button
              onClick={() => setFilters({
                status: 'all',
                priority: 'all',
                surveyorId: surveyorId || 'all',
                search: ''
              })}
              className="px-4 py-2 text-gray-600 hover:text-gray-800 transition-colors"
            >
              Clear Filters
            </button>
          </div>
        )}
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Submitted Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="p-4 border-b border-gray-200 min-w-0">
                <div className="flex items-start justify-between mb-2 min-w-0">
                  <div className="flex items-center space-x-2 min-w-0 flex-1">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border bg-yellow-100 text-yellow-800 border-yellow-200 whitespace-nowrap flex-shrink-0`}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </span>
                    <span className="truncate text-sm text-gray-600">{policy?.propertyDetails?.address}</span>
                  </div>
                </div>
              </div>
              <div className="p-4 space-y-3 min-w-0">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center min-w-0">
                    <User className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{policy?.contactDetails?.fullName}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">Submitted: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
                <button
                  onClick={() => {
                    setSelectedPolicy(policy);
                    setIsReassignMode(false);
                    setShowAssignModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-900"
                >
                  Assign AMMC Surveyor
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Assigned Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedPolicies.map((policy) => (
            <div key={policy._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden">
              <div className="p-4 border-b border-gray-200 min-w-0">
                <div className="flex items-start justify-between mb-2 min-w-0 gap-2">
                  <div className="flex items-center space-x-2 min-w-0">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border bg-blue-100 text-blue-800 border-blue-200 whitespace-nowrap flex-shrink-0`}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setIsReassignMode(true);
                      setShowAssignModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900 text-sm whitespace-nowrap flex-shrink-0"
                  >
                    Re-assign AMMC Surveyor
                  </button>
                </div>
                <div className="flex items-center text-gray-600 text-sm min-w-0">
                  <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
                  <span className="truncate">{policy?.propertyDetails?.address}</span>
                </div>
              </div>
              <div className="p-4 space-y-3 min-w-0">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center min-w-0">
                    <User className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">{policy?.contactDetails?.fullName}</span>
                  </div>
                  <div className="flex items-center min-w-0">
                    <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
                    <span className="truncate">Submitted: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {showAssignModal && (
        <AssignSurveyorModal
          show={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedPolicy={selectedPolicy}
          isReassign={isReassignMode}
          onAssignmentCreated={fetchData}
          onAssignmentReassigned={fetchData}
        />
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {(Array.isArray(assignments) ? assignments : []).map((assignment) => (
          <AssignmentCard
            key={assignment._id}
            assignment={assignment}
            viewMode={viewMode}
            onView={() => setSelectedAssignment(assignment)}
            onStatusUpdate={handleStatusUpdate}
            getStatusColor={getStatusColor}
            getPriorityColor={getPriorityColor}
            formatDate={formatDate}
            isOverdue={isOverdue}
          />
        ))}
      </div>

      {assignments.length === 0 && !loading && (
        <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
          <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No assignments found</h3>
          <p className="text-gray-600">
            {filters.search || filters.status !== 'all' || filters.priority !== 'all'
              ? 'Try adjusting your filters to see more assignments.'
              : 'No assignments have been created yet.'}
          </p>
        </div>
      )}

      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          viewMode={viewMode}
          onClose={() => setSelectedAssignment(null)}
          onStatusUpdate={handleStatusUpdate}
          onProgressUpdate={updateProgress}
          getStatusColor={getStatusColor}
          getPriorityColor={getPriorityColor}
          formatDate={formatDate}
        />
      )}
    </div>
  );
};


// Assignment Card Component
interface AssignmentCardProps {
  assignment: Assignment;
  viewMode: 'admin' | 'surveyor';
  onView: () => void;
  onStatusUpdate: (id: string, action: 'accept' | 'start' | 'complete', data?: Record<string, unknown>) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: string) => string;
  isOverdue: (deadline: string, status: string) => boolean;
}

const AssignmentCard: React.FC<AssignmentCardProps> = ({
  assignment,
  viewMode,
  onView,
  onStatusUpdate,
  getStatusColor,
  getPriorityColor,
  formatDate,
  isOverdue
}) => {
  return (
    <div
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow min-w-0 overflow-hidden ${isOverdue(assignment.deadline, assignment.status) ? 'border-red-300 bg-red-50' : 'border-gray-200'
        }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200 min-w-0">
        <div className="flex items-start justify-between mb-2 min-w-0">
          <div className="flex items-center space-x-2 min-w-0 flex-1">
            <span className={`text-xs px-2 py-1 rounded-full font-medium border whitespace-nowrap ${getStatusColor(assignment.status)}`}>
              {assignment.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium whitespace-nowrap ${getPriorityColor(assignment.priority)}`}>
              {assignment.priority.toUpperCase()}
            </span>
          </div>

          <button
            onClick={onView}
            className="text-gray-400 hover:text-gray-600 transition-colors flex-shrink-0 ml-2"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-gray-600 text-sm min-w-0">
          <MapPin className="w-4 h-4 mr-1 flex-shrink-0" />
          <span className="truncate">{assignment.location?.address || 'No address provided'}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3 min-w-0">
        {/* Instructions */}
        {assignment.instructions && (
          <div className="min-w-0">
            <p className="text-sm text-gray-700 line-clamp-2 break-words">{assignment.instructions}</p>
          </div>
        )}

        {/* Timeline Info */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center min-w-0">
            <Calendar className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">Assigned: {formatDate(assignment.assignedAt)}</span>
          </div>

          <div className={`flex items-center min-w-0 ${isOverdue(assignment.deadline, assignment.status) ? 'text-red-600' : ''
            }`}>
            <Clock className="w-3 h-3 mr-2 flex-shrink-0" />
            <span className="truncate">Deadline: {formatDate(assignment.deadline)}</span>
            {isOverdue(assignment.deadline, assignment.status) && (
              <AlertTriangle className="w-3 h-3 ml-1 flex-shrink-0" />
            )}
          </div>

          {assignment.progressTracking.startedAt && (
            <div className="flex items-center text-blue-600 min-w-0">
              <CheckCircle className="w-3 h-3 mr-2 flex-shrink-0" />
              <span className="truncate">Started: {formatDate(assignment.progressTracking.startedAt)}</span>
            </div>
          )}
        </div>

        {/* Progress Bar */}
        {assignment.status === 'in_progress' && (
          <div className="space-y-1">
            <div className="flex justify-between text-xs">
              <span>Progress</span>
              <span>{assignment.progressTracking.milestones.length} milestones</span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-600 h-2 rounded-full transition-all"
                style={{
                  width: `${Math.min(100, (assignment.progressTracking.milestones.length / 5) * 100)}%`
                }}
              ></div>
            </div>
          </div>
        )}

        {/* Documents Count */}
        {assignment.documents && assignment.documents.length > 0 && (
          <div className="flex items-center text-sm text-gray-600 min-w-0">
            <FileText className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{assignment.documents.length} document{assignment.documents.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Messages Count */}
        {assignment.communication.messages.length > 0 && (
          <div className="flex items-center text-sm text-gray-600 min-w-0">
            <MessageSquare className="w-4 h-4 mr-1 flex-shrink-0" />
            <span className="truncate">{assignment.communication.messages.length} message{assignment.communication.messages.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between min-w-0 gap-2">
          {viewMode === 'surveyor' ? (
            <div className="flex space-x-2 min-w-0">
              {assignment.status === 'assigned' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'accept')}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors whitespace-nowrap"
                >
                  Accept
                </button>
              )}

              {assignment.status === 'accepted' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'start')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors whitespace-nowrap"
                >
                  Start Survey
                </button>
              )}

              {assignment.status === 'in_progress' && (
                <button
                  onClick={onView}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors whitespace-nowrap"
                >
                  Update Progress
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-gray-600 min-w-0">
              <User className="w-3 h-3 flex-shrink-0" />
              <span className="truncate">Assigned to Surveyor</span>
            </div>
          )}

          {viewMode === 'surveyor' ? (
            <Link href={`/surveyor/dashboard/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0">
              View Details
            </Link>
          ) : (
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors whitespace-nowrap flex-shrink-0"
            >
              View Details
            </button>
          )}
        </div>
      </div>
    </div>
  );
};

// Assignment Detail Modal Component
interface AssignmentDetailModalProps {
  assignment: Assignment;
  viewMode: 'admin' | 'surveyor';
  onClose: () => void;
  onStatusUpdate: (id: string, action: 'accept' | 'start' | 'complete', data?: Record<string, unknown>) => void;
  onProgressUpdate: (id: string, data: Record<string, unknown>) => void;
  getStatusColor: (status: string) => string;
  getPriorityColor: (priority: string) => string;
  formatDate: (date: string) => string;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  viewMode,
  onClose,
  onStatusUpdate,
  onProgressUpdate,
  getStatusColor,
  getPriorityColor,
  formatDate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'survey' | 'documents' | 'communication'>('details');


  const formatTimeAgo = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(minutes / 60);
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days} day${days > 1 ? 's' : ''} ago`;
    if (hours > 0) return `${hours} hour${hours > 1 ? 's' : ''} ago`;
    if (minutes > 0) return `${minutes} minute${minutes > 1 ? 's' : ''} ago`;
    return 'Just now';
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Assignment Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Policy #{typeof assignment.ammcId === 'object' ? (assignment.ammcId as any)._id : assignment.ammcId}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <X className="w-6 h-6" />
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(assignment.status)}`}>
                {assignment.status.replace('_', ' ').toUpperCase()}
              </span>
              <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(assignment.priority)}`}>
                {assignment.priority.toUpperCase()}
              </span>
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Deadline:</span> {formatDate(assignment.deadline)}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {(['details', 'survey', 'documents', 'communication'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {tab === 'survey' ? 'Survey Results' : tab.charAt(0).toUpperCase() + tab.slice(1)}
                {tab === 'communication' && assignment.communication.messages.length > 0 && (
                  <span className="ml-1 bg-blue-100 text-blue-600 text-xs rounded-full px-2 py-0.5">
                    {assignment.communication.messages.length}
                  </span>
                )}
                {tab === 'documents' && assignment.documents.length > 0 && (
                  <span className="ml-1 bg-green-100 text-green-600 text-xs rounded-full px-2 py-0.5">
                    {assignment.documents.length}
                  </span>
                )}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'details' && (
            <AssignmentDetailsTab assignment={assignment} />
          )}

          {activeTab === 'survey' && (
            <AssignmentSurveyTab assignment={assignment} />
          )}

          {activeTab === 'documents' && (
            <AssignmentDocumentsTab
              assignment={assignment}
              viewMode={viewMode}
            />
          )}

          {activeTab === 'communication' && (
            <AssignmentCommunicationTab
              assignment={assignment}
              formatTimeAgo={formatTimeAgo}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Assignment ID: {assignment._id}
            </div>

            <div className="flex items-center space-x-3">
              {viewMode === 'surveyor' && assignment.status === 'assigned' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'accept')}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                >
                  Accept Assignment
                </button>
              )}

              {viewMode === 'surveyor' && assignment.status === 'accepted' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'start')}
                  className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Start Survey
                </button>
              )}

              <button
                onClick={onClose}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
              >
                Close
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

// Individual Tab Components
const AssignmentDetailsTab: React.FC<{ assignment: Assignment }> = ({ assignment }) => (
  <div className="space-y-6">
    {/* Basic Info */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Location Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-start">
            <MapPin className="w-4 h-4 text-gray-400 mr-2 mt-0.5" />
            <span className="text-gray-700">{assignment?.location?.address}</span>
          </div>
          {assignment.location.accessInstructions && (
            <div className="ml-6 text-gray-600">
              <strong>Access:</strong> {assignment?.location?.accessInstructions}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {assignment?.location?.contactPerson?.name}</div>
          <div><strong>Phone:</strong> {assignment?.location?.contactPerson?.phone}</div>
          <div><strong>Email:</strong> {assignment?.location?.contactPerson?.email}</div>
          {assignment?.location?.contactPerson?.availableHours && (
            <div><strong>Available:</strong> {assignment?.location?.contactPerson?.availableHours}</div>
          )}
        </div>
      </div>
    </div>

    {/* Instructions */}
    {assignment.instructions && (
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Instructions</h4>
        <p className="text-gray-700 text-sm bg-gray-50 p-3 rounded-lg">{assignment.instructions}</p>
      </div>
    )}

    {/* Special Requirements */}
    {assignment.specialRequirements.length > 0 && (
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Special Requirements</h4>
        <ul className="list-disc list-inside space-y-1 text-sm text-gray-700">
          {(assignment?.specialRequirements || []).map((req, index) => (
            <li key={index}>{req}</li>
          ))}
        </ul>
      </div>
    )}

    {/* Timeline */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Timeline</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span>Assigned:</span>
            <span className="text-gray-600">{new Date(assignment.assignedAt).toLocaleDateString()}</span>
          </div>
          <div className="flex justify-between">
            <span>Deadline:</span>
            <span className="text-gray-600">{new Date(assignment.deadline).toLocaleDateString()}</span>
          </div>
          {assignment.estimatedDuration && (
            <div className="flex justify-between">
              <span>Est. Duration:</span>
              <span className="text-gray-600">{assignment.estimatedDuration} hours</span>
            </div>
          )}
        </div>
      </div>

      {/* {assignment.expenses && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Survey Expenses</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Transportation:</span>
              <span>₦{(assignment.expenses.transportation || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Accommodation:</span>
              <span>₦{(assignment.expenses.accommodation || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Meals:</span>
              <span>₦{(assignment.expenses.meals || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Equipment:</span>
              <span>₦{(assignment.expenses.equipment || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span>₦{(assignment.expenses.other || 0).toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1 mt-2">
              <span>Total:</span>
              <span>₦{(assignment.expenses.totalExpenses || 0).toLocaleString()}</span>
            </div>
          </div>
        </div>
      )} */}
    </div>
  </div>
);

// Survey Results Tab Component
const AssignmentSurveyTab: React.FC<{ assignment: Assignment }> = ({ assignment }) => {
  // We need to fetch the survey submission data for this assignment
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        console.log('Fetching survey data for assignment:', assignment._id);
        console.log('Assignment status:', assignment.status);

        // Import the API function
        const { getSubmissionByAssignment } = await import('@/services/api');

        // Fetch survey submission data using the existing endpoint
        const response = await getSubmissionByAssignment(assignment._id);
        console.log('Survey data response:', response);
        console.log('Response structure:', JSON.stringify(response, null, 2));

        if (response && response.success && response.data && response.data.submission) {
          console.log('Survey data loaded:', response.data.submission);
          setSurveyData(response.data.submission);
        } else if (response && response.data && response.data.submission) {
          // Handle case where success field might be missing
          console.log('Survey data loaded (fallback):', response.data.submission);
          setSurveyData(response.data.submission);
        } else if (response && response.submission) {
          // Handle case where data is directly in response
          console.log('Survey data loaded (direct):', response.submission);
          setSurveyData(response.submission);
        } else {
          console.log('No survey data found. Response:', response);
        }
      } catch (error) {
        console.error('Failed to fetch survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    if (assignment.status === 'completed') {
      fetchSurveyData();
    } else {
      setLoading(false);
    }
  }, [assignment._id, assignment.status]);

  if (assignment.status !== 'completed') {
    return (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey not completed yet</p>
        <p className="text-sm">Survey results will appear here once the assignment is completed.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading survey data...</p>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <AlertTriangle className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey data not found</p>
        <p className="text-sm">Unable to load survey results for this assignment.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Survey Document */}
      {surveyData.surveyDocument && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-5 w-5 text-blue-600 mr-2" />
              <div>
                <h4 className="font-medium text-blue-900">Survey Document</h4>
                <p className="text-sm text-blue-700">Completed survey report</p>
              </div>
            </div>
            <a
              href={surveyData.surveyDocument}
              target="_blank"
              rel="noopener noreferrer"
              className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
            >
              Download PDF
            </a>
          </div>
        </div>
      )}

      {/* Survey Assessment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Property Condition</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.propertyCondition || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Structural Assessment</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.structuralAssessment || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.riskFactors || 'No risk factors identified'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.recommendations || 'No recommendations provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Notes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Additional Survey Notes</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            {surveyData.surveyNotes || 'No additional notes provided'}
          </p>
        </div>
      </div>

      {/* Final Recommendation */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Final Recommendation</h4>
        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${surveyData.recommendedAction === 'approve'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : surveyData.recommendedAction === 'reject'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
          {surveyData.recommendedAction === 'approve' && '✅ Approve Policy'}
          {surveyData.recommendedAction === 'reject' && '❌ Reject Policy'}
          {surveyData.recommendedAction === 'request_more_info' && '📋 Request More Information'}
        </div>
      </div>

      {/* Contact Log */}
      {surveyData.contactLog && surveyData.contactLog.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Log</h4>
          <div className="space-y-3">
            {surveyData.contactLog.map((entry: ContactLogEntry, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="capitalize font-medium">{entry.method}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {entry.successful ? 'Success' : 'Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};



const AssignmentDocumentsTab: React.FC<{ assignment: Assignment; viewMode: 'admin' | 'surveyor' }> = ({
  assignment,
  viewMode
}) => {
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        if (assignment.status === 'completed') {
          const { getSubmissionByAssignment } = await import('@/services/api');
          const response = await getSubmissionByAssignment(assignment._id);
          if (response.success && response.data.submission) {
            setSurveyData(response.data.submission);
          }
        }
      } catch (error) {
        console.error('Failed to fetch survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [assignment._id, assignment.status]);

  const handleDocumentsChange = (documents: File[]) => {
    console.log('Documents updated:', documents);
    // Handle document updates
  }

  if (loading && assignment.status === 'completed') {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">Assignment Documents</h4>

      {/* Survey Document */}
      {surveyData?.surveyDocument && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <FileText className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-blue-900">Survey Report</h5>
                <p className="text-sm text-blue-700">Completed survey document (PDF)</p>
                <p className="text-xs text-blue-600 mt-1">
                  Submitted: {surveyData.submissionTime ? new Date(surveyData.submissionTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={surveyData.surveyDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View PDF
              </a>
              <a
                href={surveyData.surveyDocument}
                download
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Other Assignment Documents */}
      {assignment?.documents?.length > 0 && (
        <div>
          <h5 className="text-sm font-medium text-gray-700 mb-3">Other Documents</h5>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {(assignment?.documents || []).map((doc) => (
              <div key={doc._id} className="border border-gray-200 rounded-lg p-3">
                <div className="flex items-start space-x-3">
                  <FileText className="w-5 h-5 text-gray-400 mt-0.5" />
                  <div className="flex-1 min-w-0">
                    <p className="font-medium text-gray-900 truncate">{doc.fileName}</p>
                    <p className="text-sm text-gray-500">{doc.category} • {doc.documentType}</p>
                    <p className="text-xs text-gray-400 mt-1">
                      Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                    </p>
                  </div>
                  <a
                    href={doc.cloudinaryUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800 text-sm font-medium"
                  >
                    View
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* No Documents Message */}
      {!surveyData?.surveyDocument && (!assignment?.documents || assignment.documents.length === 0) && (
        <div className="text-center py-8 text-gray-500">
          <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No documents available</p>
          <p className="text-sm">Documents will appear here once the survey is completed.</p>
        </div>
      )}

      {/* Document Upload for Surveyors */}
      {viewMode === 'surveyor' && assignment.status !== 'completed' && (
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Upload Documents</h5>
          <DocumentManager
            onDocumentsChange={handleDocumentsChange}
            title="Survey Documents"
            showCategories={true}
          />
        </div>
      )}
    </div>
  )
};

const AssignmentCommunicationTab: React.FC<{
  assignment: Assignment;
  formatTimeAgo: (date: string) => string;
}> = ({ assignment, formatTimeAgo }) => {
  const [surveyData, setSurveyData] = useState<any>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        if (assignment.status === 'completed') {
          const { getSubmissionByAssignment } = await import('@/services/api');
          const response = await getSubmissionByAssignment(assignment._id);
          if (response.success && response.data.submission) {
            setSurveyData(response.data.submission);
          }
        }
      } catch (error) {
        console.error('Failed to fetch survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [assignment._id, assignment.status]);

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading communication data...</p>
      </div>
    );
  }

  return (
    <div className="space-y-4">
      <h4 className="font-medium text-gray-900">Contact Log & Communication</h4>

      {/* Survey Contact Log */}
      {surveyData?.contactLog && surveyData.contactLog.length > 0 ? (
        <div className="space-y-4">
          <h5 className="text-sm font-medium text-gray-700">Survey Contact Attempts</h5>
          <div className="space-y-3 max-h-96 overflow-y-auto">
            {surveyData.contactLog.map((entry: ContactLogEntry, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className="font-medium text-gray-900">Contact Attempt</span>
                    <span className={`text-xs px-2 py-1 rounded-full ${entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                      }`}>
                      {entry.successful ? 'Successful' : 'Failed'}
                    </span>
                  </div>
                  <div className="flex items-center space-x-2 text-xs text-gray-500">
                    <Calendar className="h-3 w-3" />
                    <span>{new Date(entry.date).toLocaleDateString()}</span>
                    <span className="capitalize">{entry.method}</span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      ) : (
        <div className="text-center py-8 text-gray-500">
          <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No contact attempts recorded</p>
          <p className="text-sm">Contact log will appear here once survey is completed.</p>
        </div>
      )}

      {/* Assignment Messages (if any) */}
      {assignment?.communication?.messages?.length > 0 && (
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Assignment Messages</h5>
          <div className="space-y-3">
            {assignment.communication.messages.map((message) => (
              <div key={message._id} className="bg-gray-50 p-3 rounded-lg">
                <div className="flex items-start justify-between mb-2">
                  <span className="font-medium text-gray-900 text-sm">System Message</span>
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full ${message.type === 'question' ? 'bg-blue-100 text-blue-800' :
                      message.type === 'status_update' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                      }`}>
                      {message.type.replace('_', ' ')}
                    </span>
                    <span className="text-xs text-gray-500">
                      {formatTimeAgo(message.timestamp)}
                    </span>
                  </div>
                </div>
                <p className="text-gray-700 text-sm">{message.message}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;
