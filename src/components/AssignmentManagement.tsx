'use client';

import Link from 'next/link';
import { useState, useEffect} from 'react' 
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
import { Assignment, Surveyor } from '@/types/api.types';
import { useAuth } from '../context/useAuth';
import DocumentManager from './DocumentManager';

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
  const policyId = searchParams.get('policyId');
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [policies, setPolicies] = useState<any[]>([]);
  // Available surveyors for assignment
  const [availableSurveyors, setAvailableSurveyors] = useState<Surveyor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [selectedPolicy, setSelectedPolicy] = useState<any | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);

  const [isReassign, setIsReassign] = useState(false);



  const [newAssignmentData, setNewAssignmentData] = useState({
    policyId: '',
    surveyorIds: [] as string[],
    assignedBy: '',
    status: 'assigned',
    priority: 'normal',
    deadline: '',
    instructions: '',
  });


  // Handle assignment creation
  const handleCreateAssignment = async () => {
    if (!newAssignmentData.deadline) {
      setError('Please select a deadline.');
      return;
    }
    try {
      for (const surveyorId of newAssignmentData.surveyorIds) {
        const assignmentData = {
          policyId: selectedPolicy._id,
          surveyorId: surveyorId,
          assignedBy: user?._id,
          deadline: new Date(newAssignmentData.deadline),
          priority: newAssignmentData.priority,
          instructions: newAssignmentData.instructions || "N/A",
        };
        console.log("Creating assignment with data:", assignmentData);
        await adminApi.createAssignment(assignmentData);
      }

      setShowCreateModal(false);
      setShowAssignModal(false);
      setSelectedPolicy(null);
      setNewAssignmentData({
        policyId: '',
        surveyorIds: [], // Reset to an empty array
        assignedBy: '',
        status: 'assigned',
        priority: 'normal',
        deadline: '',
        instructions: ''
      });
      fetchData();
      fetchPolicies();
    } catch (error: any) {
      console.error("Failed to create assignment:", error);
      setError(`Failed to create assignment: ${error.message}`);
    }
  };
  const handleReassignSurveyor = async () => {
    try {
      const assignmentResponse = await adminApi.getAssignmentByPolicyId(selectedPolicy._id);
      if (!assignmentResponse.success || !assignmentResponse.data) {
        setError("Could not find assignment for the selected policy.");
        return;
      }
      const assignment = assignmentResponse.data;
      const response = await adminApi.reassignSurveyor(
        assignment._id, 
        newAssignmentData.surveyorIds[0],
        newAssignmentData.instructions, // reason
        newAssignmentData.deadline,
        newAssignmentData.priority
      ); 
      if (response.success) {
        setShowAssignModal(false);
        setSelectedPolicy(null);
        setNewAssignmentData({
          policyId: '',
          surveyorIds: [],
          assignedBy: '',
          status: 'assigned',
          priority: 'normal',
          deadline: '',
          instructions: ''
        });
        fetchData();
        fetchPolicies();
        fetchAssignedPolicies();
      } else {
        setError(response.message || 'Failed to re-assign surveyor');
      }
    } catch (error) {
      console.error("Failed to re-assign surveyor:", error);
      setError('Failed to re-assign surveyor. Please try again.');
    }
  };

  // Filters and Search
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

    const fetchSurveyors = async () => {
      try {
        const response = await adminApi.getSurveyors({ status: 'active' }); // Fetch only active surveyors
        console.log("Response from getSurveyors:", response);
              if (response?.data) {
                setAvailableSurveyors(response.data);
                console.log("Available Surveyors:", response.data);
              } else {          setAvailableSurveyors([]);
        }
      } catch (error) {
        setAvailableSurveyors([]);
      }
    };

    if (policyId) {
      const fetchPolicyAndSurveyors = async () => {
        try {
          await fetchSurveyors();
          const response = await adminApi.getPolicyById(policyId);
          if (response?.data) {
            setSelectedPolicy(response.data);
            setShowAssignModal(true);
          }
        } catch (error) {
          console.error("Failed to fetch policy:", error);
        }
      };
      fetchPolicyAndSurveyors();
    } else {
      fetchSurveyors();
    }
  }, [filters, surveyorId, policyId]);

  const fetchPolicies = async () => {
    try {
      const response = await adminApi.getPolicies({ status: 'submitted', page: 1, limit: 100 }); // Use adminApi.getPolicies
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
          search: filters.search || undefined,
          page: 1,
          limit: 50
        });
      } else {
        assignmentsResponse = await getSurveyorAssignmentsNew({
          status: filters.status !== 'all' ? filters.status : undefined,
          page: 1,
          limit: 50
        });
      }

      console.log('assignmentsResponse', assignmentsResponse);
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

    } catch (error: any) {
      setError('Failed to load assignments. Please try again.');
      console.error('Error fetching assignments:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleStatusUpdate = async (assignmentId: string, action: 'accept' | 'start' | 'complete', data?: any) => {
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
        // Refresh assignments
        fetchData();
        setSelectedAssignment(null);
      } else {
        setError(response.message || 'Failed to update assignment');
      }
    } catch (error: any) {
      setError('Failed to update assignment. Please try again.');
    }
  };

  const updateProgress = async (assignmentId: string, progressData: any) => {
    try {
      const response = await updateAssignmentProgress(assignmentId, progressData);
      
      if (response.success) {
        fetchData();
      } else {
        setError(response.message || 'Failed to update progress');
      }
    } catch (error: any) {
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
                <h2 className="text-2xl font-bold text-gray-900">
                  {viewMode === 'admin' ? 'Assignment Management' : 'My Assignments'}
                </h2>
                <p className="text-gray-600 mt-1">
                  Manage surveyor assignments and track progress
                </p>
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

      {/* Error Message */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex items-center">
            <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
            <p className="text-red-700">{error}</p>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          {/* Search */}
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

          {/* Status Filter */}
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

          {/* Priority Filter */}
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
            {/* Surveyor Filter (Admin only) */}
            <select
              value={filters.surveyorId}
              onChange={(e) => setFilters(prev => ({ ...prev, surveyorId: e.target.value }))}
              className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            >
              <option value="all">All Surveyors</option>
              {(surveyors || []).map((surveyor) => (
                <option key={surveyor?._id} value={surveyor?._id}>
                  {surveyor?.firstname} {surveyor?.lastname}
                </option>
              ))}
            </select>

            {/* Clear Filters */}
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

      {/* Submitted Policies */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Submitted Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {policies.map((policy) => (
            <div key={policy._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border bg-yellow-100 text-yellow-800 border-yellow-200`}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setShowAssignModal(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Assign Surveyor
                  </button>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">{policy.propertyDetails.address}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-2" />
                    <span>{policy.contactDetails.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>Submitted: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Assigned Policies */}
      <div className="bg-white border border-gray-200 rounded-lg p-4">
        <h3 className="text-lg font-semibold mb-4">Assigned Policies</h3>
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {assignedPolicies.map((policy) => (
            <div key={policy._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
              <div className="p-4 border-b border-gray-200">
                <div className="flex items-start justify-between mb-2">
                  <div className="flex items-center space-x-2">
                    <span className={`text-xs px-2 py-1 rounded-full font-medium border bg-blue-100 text-blue-800 border-blue-200`}>
                      {policy.status.replace('_', ' ').toUpperCase()}
                    </span>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicy(policy);
                      setShowAssignModal(true);
                      setIsReassign(true);
                    }}
                    className="text-indigo-600 hover:text-indigo-900"
                  >
                    Re-assign Surveyor
                  </button>
                </div>
                <div className="flex items-center text-gray-600 text-sm">
                  <MapPin className="w-4 h-4 mr-1" />
                  <span className="truncate">{policy.propertyDetails.address}</span>
                </div>
              </div>
              <div className="p-4 space-y-3">
                <div className="space-y-2 text-xs text-gray-600">
                  <div className="flex items-center">
                    <User className="w-3 h-3 mr-2" />
                    <span>{policy.contactDetails.fullName}</span>
                  </div>
                  <div className="flex items-center">
                    <Calendar className="w-3 h-3 mr-2" />
                    <span>Submitted: {formatDate(policy.createdAt)}</span>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md p-6">
            <h3 className="text-lg font-semibold mb-4">Create New Assignment</h3>
            <div className="space-y-3">
              <select
                value={newAssignmentData.policyId}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, policyId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Policy</option>
                {Array.isArray(availablePolicies) && availablePolicies.map(policy => (
                  <option key={policy._id} value={policy._id}>
                    {policy.policyNumber ? `${policy.policyNumber} - ${policy.propertyDetails.address}` : policy.propertyDetails.address}
                  </option>
                ))}
              </select>
              <select
                value={newAssignmentData.surveyorId}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, surveyorId: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="">Select Surveyor</option>
                {Array.isArray(availableSurveyors) && availableSurveyors.map(s => (
                  <option key={s._id} value={s._id}>{s.firstname} {s.lastname} ({s.email}) - {s.profile?.specialization?.join(', ') || 'N/A'}</option>
                ))}
              </select>
              <input
                type="text"
                placeholder="Assigned By (optional)"
                value={newAssignmentData.assignedBy}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, assignedBy: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
              <select
                value={newAssignmentData.status}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, status: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="assigned">Assigned</option>
                <option value="accepted">Accepted</option>
                <option value="in_progress">In Progress</option>
                <option value="completed">Completed</option>
              </select>
              <select
                value={newAssignmentData.priority}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, priority: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
              <input
                type="date"
                value={newAssignmentData.deadline}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, deadline: e.target.value })}
                className="w-full border border-gray-300 rounded px-3 py-2"
              />
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => setShowCreateModal(false)}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={handleCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
                disabled={!newAssignmentData.policyId || !newAssignmentData.surveyorId}
              >Create</button>
            </div>
          </div>
        </div>
      )}

      {/* Assign Surveyor Modal */}
      {showAssignModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
            <div className="flex items-start justify-between">
              <h3 className="text-lg font-semibold mb-4">{isReassign ? 'Re-assign Surveyor' : 'Assign Surveyor'}</h3>
              <button onClick={() => {
                setShowAssignModal(false);
                setIsReassign(false);
              }} className="text-gray-400 hover:text-gray-600">
                <X className="w-6 h-6" />
              </button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
              <div>
                <label className="block text-sm font-medium text-gray-700">Policy Holder</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPolicy.contactDetails.fullName}</p>
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700">Property Address</label>
                <p className="mt-1 text-sm text-gray-900">{selectedPolicy.propertyDetails.address}</p>
              </div>
            </div>
            <div className="space-y-4">
              <div>
                <label htmlFor="surveyor" className="block text-sm font-medium text-gray-700">Select Surveyor(s)</label>
                <div className="mt-2 h-60 overflow-y-auto border border-gray-300 rounded-md">
                  {Array.isArray(availableSurveyors) && availableSurveyors.map(s => {
                    return (
                      <div key={s._id} className="flex items-center p-2">
                        <input
                          id={`surveyor-${s._id}`}
                          name="surveyors"
                          type="checkbox"
                          value={s._id}
                          checked={newAssignmentData.surveyorIds.includes(s._id)}
                          onChange={e => {
                            const surveyorId = e.target.value;
                            const isChecked = e.target.checked;
                            setNewAssignmentData(prev => {
                              const surveyorIds = isChecked
                                ? [...prev.surveyorIds, surveyorId]
                                : prev.surveyorIds.filter(id => id !== surveyorId);
                              console.log("Selected Surveyor IDs:", surveyorIds);
                              return { ...prev, surveyorIds: surveyorIds };
                            });
                          }}
                          className="h-4 w-4 text-indigo-600 border-gray-300 rounded focus:ring-indigo-500"
                        />
                        <label htmlFor={`surveyor-${s._id}`} className="ml-3 text-sm text-gray-700">
                          {(s.userId?.firstname || 'N/A')} {(s.userId?.lastname || 'N/A')} ({(s.userId?.email || 'N/A')}) - {s.profile?.specialization?.join(', ') || 'N/A'}
                        </label>
                      </div>
                    );
                  })}
                </div>
              </div>
              <div>
                <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
                <textarea
                  id="instructions"
                  value={newAssignmentData.instructions}
                  onChange={e => setNewAssignmentData({ ...newAssignmentData, instructions: e.target.value })}
                  className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                />
              </div>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div>
                  <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
                  <select
                    id="priority"
                    value={newAssignmentData.priority}
                    onChange={e => setNewAssignmentData({ ...newAssignmentData, priority: e.target.value })}
                    className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
                  >
                    <option value="normal">Normal</option>
                    <option value="urgent">Urgent</option>
                    <option value="high">High</option>
                    <option value="medium">Medium</option>
                    <option value="low">Low</option>
                  </select>
                </div>
                <div>
                  <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
                  <input
                    type="date"
                    id="deadline"
                    value={newAssignmentData.deadline}
                    onChange={e => setNewAssignmentData({ ...newAssignmentData, deadline: e.target.value })}
                    className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
                  />
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-2 mt-6">
              <button
                onClick={() => {
                  setShowAssignModal(false);
                  setSelectedPolicy(null);
                }}
                className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
              >Cancel</button>
              <button
                onClick={isReassign ? handleReassignSurveyor : handleCreateAssignment}
                className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
              >{isReassign ? 'Re-assign' : 'Assign'}</button>
            </div>
          </div>
        </div>
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

      {/* Empty State */}
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

      {/* Assignment Detail Modal */}
      {selectedAssignment && (
        <AssignmentDetailModal
          assignment={selectedAssignment}
          viewMode={viewMode}
          onClose={() => setSelectedAssignment(null)}
          onStatusUpdate={handleStatusUpdate}
          onProgressUpdate={updateProgress}
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
  onStatusUpdate: (id: string, action: 'accept' | 'start' | 'complete', data?: any) => void;
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
      className={`bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow ${
        isOverdue(assignment.deadline, assignment.status) ? 'border-red-300 bg-red-50' : 'border-gray-200'
      }`}
    >
      {/* Card Header */}
      <div className="p-4 border-b border-gray-200">
        <div className="flex items-start justify-between mb-2">
          <div className="flex items-center space-x-2">
            <span className={`text-xs px-2 py-1 rounded-full font-medium border ${getStatusColor(assignment.status)}`}>
              {assignment.status.replace('_', ' ').toUpperCase()}
            </span>
            <span className={`text-xs px-2 py-1 rounded-full font-medium ${getPriorityColor(assignment.priority)}`}>
              {assignment.priority.toUpperCase()}
            </span>
          </div>
          
          <button
            onClick={onView}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <Eye className="w-4 h-4" />
          </button>
        </div>

        <div className="flex items-center text-gray-600 text-sm">
          <MapPin className="w-4 h-4 mr-1" />
          <span className="truncate">{assignment.location?.address}</span>
        </div>
      </div>

      {/* Card Body */}
      <div className="p-4 space-y-3">
        {/* Instructions */}
        {assignment.instructions && (
          <p className="text-sm text-gray-700 line-clamp-2">{assignment.instructions}</p>
        )}

        {/* Timeline Info */}
        <div className="space-y-2 text-xs text-gray-600">
          <div className="flex items-center">
            <Calendar className="w-3 h-3 mr-2" />
            <span>Assigned: {formatDate(assignment.assignedAt)}</span>
          </div>
          
          <div className={`flex items-center ${
            isOverdue(assignment.deadline, assignment.status) ? 'text-red-600' : ''
          }`}>
            <Clock className="w-3 h-3 mr-2" />
            <span>Deadline: {formatDate(assignment.deadline)}</span>
            {isOverdue(assignment.deadline, assignment.status) && (
              <AlertTriangle className="w-3 h-3 ml-1" />
            )}
          </div>

          {assignment.progressTracking.startedAt && (
            <div className="flex items-center text-blue-600">
              <CheckCircle className="w-3 h-3 mr-2" />
              <span>Started: {formatDate(assignment.progressTracking.startedAt)}</span>
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
          <div className="flex items-center text-sm text-gray-600">
            <FileText className="w-4 h-4 mr-1" />
            <span>{assignment.documents.length} document{assignment.documents.length > 1 ? 's' : ''}</span>
          </div>
        )}

        {/* Messages Count */}
        {assignment.communication.messages.length > 0 && (
          <div className="flex items-center text-sm text-gray-600">
            <MessageSquare className="w-4 h-4 mr-1" />
            <span>{assignment.communication.messages.length} message{assignment.communication.messages.length > 1 ? 's' : ''}</span>
          </div>
        )}
      </div>

      {/* Card Actions */}
      <div className="p-4 border-t border-gray-200 bg-gray-50 rounded-b-lg">
        <div className="flex items-center justify-between">
          {viewMode === 'surveyor' ? (
            <div className="flex space-x-2">
              {assignment.status === 'assigned' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'accept')}
                  className="px-3 py-1 bg-green-600 text-white text-xs rounded hover:bg-green-700 transition-colors"
                >
                  Accept
                </button>
              )}
              
              {assignment.status === 'accepted' && (
                <button
                  onClick={() => onStatusUpdate(assignment._id, 'start')}
                  className="px-3 py-1 bg-blue-600 text-white text-xs rounded hover:bg-blue-700 transition-colors"
                >
                  Start Survey
                </button>
              )}
              
              {assignment.status === 'in_progress' && (
                <button
                  onClick={onView}
                  className="px-3 py-1 bg-purple-600 text-white text-xs rounded hover:bg-purple-700 transition-colors"
                >
                  Update Progress
                </button>
              )}
            </div>
          ) : (
            <div className="flex items-center space-x-2 text-xs text-gray-600">
              <User className="w-3 h-3" />
              <span>Assigned to Surveyor</span>
            </div>
          )}

          {viewMode === 'surveyor' ? (
            <Link href={`/surveyor/dashboard/assignments/${assignment._id}`} className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors">
                View Details
            </Link>
          ) : (
            <button
              onClick={onView}
              className="text-blue-600 hover:text-blue-800 text-sm font-medium transition-colors"
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
interface CompletionData {
  surveyNotes: string;
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
}

interface AssignmentDetailModalProps {
  assignment: Assignment;
  viewMode: 'admin' | 'surveyor';
  onClose: () => void;
  onStatusUpdate: (id: string, action: 'accept' | 'start' | 'complete', data?: any) => void;
  onProgressUpdate: (id: string, data: any) => void;
}

const AssignmentDetailModal: React.FC<AssignmentDetailModalProps> = ({
  assignment,
  viewMode,
  onClose,
  onStatusUpdate,
  onProgressUpdate
}) => {
  const [activeTab, setActiveTab] = useState<'details' | 'progress' | 'documents' | 'communication'>('details');
  const [progressNote, setProgressNote] = useState('');
  const [completionData, setCompletionData] = useState<CompletionData>({
    surveyNotes: '',
    recommendedAction: 'approve'
  });

  const handleProgressSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!progressNote.trim()) return;

    const checkpoint = {
      timestamp: new Date().toISOString(),
      notes: progressNote,
      photos: [] // Would be populated from photo upload
    };

    onProgressUpdate(assignment._id, {
      checkpoints: [checkpoint],
      lastUpdate: new Date().toISOString()
    });

    setProgressNote('');
  };

  const handleComplete = () => {
    onStatusUpdate(assignment._id, 'complete', {
      surveyNotes: completionData.surveyNotes,
      recommendedAction: completionData.recommendedAction
    });
  };

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
              <p className="text-sm text-gray-500 mt-1">Policy #{assignment.policyId}</p>
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
            {(['details', 'progress', 'documents', 'communication'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 rounded-t-lg font-medium text-sm transition-colors ${
                  activeTab === tab
                    ? 'bg-white text-blue-600'
                    : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                }`}
              >
                {tab.charAt(0).toUpperCase() + tab.slice(1)}
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

          {activeTab === 'progress' && (
            <AssignmentProgressTab
              assignment={assignment}
              viewMode={viewMode}
              progressNote={progressNote}
              setProgressNote={setProgressNote}
              completionData={completionData}
              setCompletionData={setCompletionData}
              onProgressSubmit={handleProgressSubmit}
              onComplete={handleComplete}
            />
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
            <span className="text-gray-700">{assignment.location.address}</span>
          </div>
          {assignment.location.accessInstructions && (
            <div className="ml-6 text-gray-600">
              <strong>Access:</strong> {assignment.location.accessInstructions}
            </div>
          )}
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>
        <div className="space-y-2 text-sm">
          <div><strong>Name:</strong> {assignment.location.contactPerson.name}</div>
          <div><strong>Phone:</strong> {assignment.location.contactPerson.phone}</div>
          <div><strong>Email:</strong> {assignment.location.contactPerson.email}</div>
          {assignment.location.contactPerson.availableHours && (
            <div><strong>Available:</strong> {assignment.location.contactPerson.availableHours}</div>
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

      {assignment.expenses && (
        <div>
          <h4 className="font-medium text-gray-900 mb-2">Expenses</h4>
          <div className="space-y-1 text-sm">
            <div className="flex justify-between">
              <span>Transportation:</span>
              <span>₦{assignment.expenses.transportation.toLocaleString()}</span>
            </div>
            <div className="flex justify-between">
              <span>Other:</span>
              <span>₦{assignment.expenses.other.toLocaleString()}</span>
            </div>
            <div className="flex justify-between font-medium border-t pt-1">
              <span>Total:</span>
              <span>₦{assignment.expenses.totalExpenses.toLocaleString()}</span>
            </div>
          </div>
        </div>
      )}
    </div>
  </div>
);

interface ProgressTabProps {
  assignment: Assignment;
  viewMode: 'admin' | 'surveyor';
  progressNote: string;
  setProgressNote: (note: string) => void;
  completionData: {
    surveyNotes: string;
    recommendedAction: 'approve' | 'reject' | 'request_more_info';
  };
  setCompletionData: (data: any) => void;
  onProgressSubmit: (e: React.FormEvent) => void;
  onComplete: () => void;
}

const AssignmentProgressTab: React.FC<ProgressTabProps> = ({
  assignment,
  viewMode,
  progressNote,
  setProgressNote,
  completionData,
  setCompletionData,
  onProgressSubmit,
  onComplete
}) => (
  <div className="space-y-6">
    {/* Progress Overview */}
    <div>
      <h4 className="font-medium text-gray-900 mb-4">Progress Overview</h4>
      
      {/* Milestones */}
      {assignment.progressTracking.milestones.length > 0 && (
        <div className="space-y-3">
          <h5 className="text-sm font-medium text-gray-700">Completed Milestones</h5>
          {(assignment?.progressTracking?.milestones || []).map((milestone, index) => (
            <div key={index} className="flex items-start space-x-3 bg-green-50 p-3 rounded-lg">
              <CheckCircle className="w-5 h-5 text-green-600 mt-0.5" />
              <div className="flex-1">
                <p className="font-medium text-green-900">{milestone.name}</p>
                <p className="text-sm text-green-700">{milestone.notes}</p>
                <p className="text-xs text-green-600 mt-1">
                  Completed: {new Date(milestone.completedAt).toLocaleString()}
                </p>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Checkpoints */}
      {assignment.progressTracking.checkpoints.length > 0 && (
        <div className="space-y-3 mt-4">
          <h5 className="text-sm font-medium text-gray-700">Progress Checkpoints</h5>
          {(assignment?.progressTracking?.checkpoints || []).map((checkpoint, index) => (
            <div key={index} className="flex items-start space-x-3 bg-blue-50 p-3 rounded-lg">
              <Clock className="w-4 h-4 text-blue-600 mt-1" />
              <div className="flex-1">
                <p className="text-sm text-blue-900">{checkpoint.notes}</p>
                <p className="text-xs text-blue-600 mt-1">
                  {new Date(checkpoint.timestamp).toLocaleString()}
                </p>
                {checkpoint.photos.length > 0 && (
                  <div className="flex items-center mt-1 text-xs text-blue-600">
                    <Camera className="w-3 h-3 mr-1" />
                    {checkpoint.photos.length} photo{checkpoint.photos.length > 1 ? 's' : ''}
                  </div>
                )}
              </div>
            </div>
          ))}
        </div>
      )}
    </div>

    {/* Add Progress Update (Surveyor only) */}
    {viewMode === 'surveyor' && assignment.status === 'in_progress' && (
      <>
        <form onSubmit={onProgressSubmit} className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Add Progress Update</h5>
          <div className="space-y-3">
            <textarea
              value={progressNote}
              onChange={(e) => setProgressNote(e.target.value)}
              placeholder="Describe your progress..."
              rows={3}
              className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            />
            <button
              type="submit"
              disabled={!progressNote.trim()}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
            >
              Add Progress Update
            </button>
          </div>
        </form>

        {/* Complete Assignment */}
        <div className="border-t pt-4">
          <h5 className="text-sm font-medium text-gray-700 mb-3">Complete Assignment</h5>
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Final Survey Notes
              </label>
              <textarea
                value={completionData.surveyNotes}
                onChange={(e) => setCompletionData((prev: CompletionData) => ({ ...prev, surveyNotes: e.target.value }))}
                placeholder="Provide your final survey summary and findings..."
                rows={4}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Recommended Action
              </label>
              <select
                value={completionData.recommendedAction}
                onChange={(e) => setCompletionData((prev: CompletionData) => ({ ...prev, recommendedAction: e.target.value as 'approve' | 'reject' | 'request_more_info' }))}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              >
                <option value="approve">Approve Policy</option>
                <option value="reject">Reject Policy</option>
                <option value="request_more_info">Request More Information</option>
              </select>
            </div>

            <button
              onClick={onComplete}
              className="w-full px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
            >
              Complete Assignment
            </button>
          </div>
        </div>
      </>
    )}
  </div>
);

const AssignmentDocumentsTab: React.FC<{ assignment: Assignment; viewMode: 'admin' | 'surveyor' }> = ({
  assignment,
  viewMode
}) => {

  const handleDocumentsChange = (documents: any) => {
    console.log('Documents updated:', documents);
    // Handle document updates
  }

  return (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Assignment Documents</h4>
    
    {/* Existing Documents */}
    {assignment.documents.length > 0 ? (
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
    ) : (
      <div className="text-center py-8 text-gray-500">
        <FileText className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No documents uploaded yet</p>
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
)};

const AssignmentCommunicationTab: React.FC<{ 
  assignment: Assignment; 
  formatTimeAgo: (date: string) => string; 
}> = ({ assignment, formatTimeAgo }) => (
  <div className="space-y-4">
    <h4 className="font-medium text-gray-900">Messages & Communication</h4>
    
    {assignment.communication.messages.length > 0 ? (
      <div className="space-y-4 max-h-96 overflow-y-auto">
        {(assignment?.communication?.messages || []).map((message) => (
          <div key={message._id} className="bg-gray-50 p-4 rounded-lg">
            <div className="flex items-start justify-between mb-2">
              <span className="font-medium text-gray-900">Message</span>
              <div className="flex items-center space-x-2">
                <span className={`text-xs px-2 py-1 rounded-full ${
                  message.type === 'question' ? 'bg-blue-100 text-blue-800' :
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
    ) : (
      <div className="text-center py-8 text-gray-500">
        <MessageSquare className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>No messages yet</p>
      </div>
    )}
  </div>
);

export default AssignmentManagement;