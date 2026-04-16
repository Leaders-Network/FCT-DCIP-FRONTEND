"use client";

import React, { useState, useEffect } from 'react';
import {
  Search,
  RefreshCw,
  MapPin,
  Users,
  Clock,
  CheckCircle,
  AlertTriangle,
  Eye,
  UserCheck,
  Building
} from 'lucide-react';
import { adminApi } from '@/services/api';

interface Assignment {
  _id: string;
  policyId: {
    _id: string;
    policyNumber: string;
    builder: {
      nameOfBuilder: string;
      customerEmail: string;
      address: string;
    };
    status: string;
    priority: string;
  };
  surveyorId: {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
  };
  status: string;
  priority: string;
  deadline: string;
  assignedAt: string;
  location: {
    address: string;
  };
}

interface AssignmentStats {
  total: number;
  byStatus: Record<string, number>;
  byPriority: Record<string, number>;
  overdueCount: number;
}

const NIAAutomatedAssignmentsPage = () => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [stats, setStats] = useState<AssignmentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [filters, setFilters] = useState({
    status: 'all',
    priority: 'all',
    search: ''
  });
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  useEffect(() => {
    fetchAssignments();
  }, [filters]);

  const buildStatsFromAssignments = (items: Assignment[]): AssignmentStats => {
    const byStatus: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    let overdueCount = 0;
    for (const item of items) {
      byStatus[item.status] = (byStatus[item.status] || 0) + 1;
      byPriority[item.priority] = (byPriority[item.priority] || 0) + 1;
      if (new Date(item.deadline) < new Date() && item.status !== 'completed' && item.status !== 'cancelled') {
        overdueCount += 1;
      }
    }

    return {
      total: items.length,
      byStatus,
      byPriority,
      overdueCount
    };
  };

  const fetchAssignments = async () => {
    try {
      setLoading(true);
      setError(null);

      interface AssignmentParams {
        page: number;
        limit: number;
        sortBy: string;
        sortOrder: string;
        status?: string;
        priority?: string;
        search?: string;
      }

      const params: AssignmentParams = {
        page: 1,
        limit: 200,
        sortBy: 'assignedAt',
        sortOrder: 'desc'
      };

      if (filters.priority !== 'all') {
        params.priority = filters.priority;
      }
      if (filters.search) {
        params.search = filters.search;
      }

      // Some backend deployments default to returning only `completed` when `status` is omitted.
      // To ensure the "All Statuses" view actually shows everything, explicitly fetch each status and merge.
      if (filters.status === 'all') {
        const statuses: Array<Assignment['status']> = ['assigned', 'accepted', 'in_progress', 'completed', 'rejected', 'cancelled'];

        const responses = await Promise.all(
          statuses.map((status) => adminApi.getAssignments({ ...params, status }))
        );

        const firstError = responses.find((r) => !r?.success);
        if (firstError && !firstError.success) {
          throw new Error(firstError.message || 'Failed to load assignments');
        }

        const merged = new Map<string, Assignment>();
        for (const r of responses) {
          for (const item of (r?.data?.assignments || []) as Assignment[]) {
            merged.set(item._id, item);
          }
        }

        const mergedAssignments = Array.from(merged.values()).sort(
          (a, b) => new Date(b.assignedAt).getTime() - new Date(a.assignedAt).getTime()
        );

        setAssignments(mergedAssignments);
        setStats(buildStatsFromAssignments(mergedAssignments));
      } else {
        const response = await adminApi.getAssignments({ ...params, status: filters.status });

        if (!response.success) {
          throw new Error(response.message || 'Failed to load assignments');
        }

        const list = (response.data.assignments || []) as Assignment[];
        setAssignments(list);

        // Prefer server-side stats when available; fall back to local stats otherwise.
        const statusBreakdown = response.data.statistics?.statusBreakdown || [];
        const priorityBreakdown = response.data.statistics?.priorityBreakdown || [];

        if (statusBreakdown.length || priorityBreakdown.length) {
          const byStatus: Record<string, number> = {};
          statusBreakdown.forEach((item: { _id: string; count: number }) => {
            byStatus[item._id] = item.count;
          });

          const byPriority: Record<string, number> = {};
          priorityBreakdown.forEach((item: { _id: string; count: number }) => {
            byPriority[item._id] = item.count;
          });

          setStats({
            total: response.data.pagination?.totalRecords || list.length,
            byStatus,
            byPriority,
            overdueCount: response.data.statistics?.overdueAssignments || 0
          });
        } else {
          setStats(buildStatsFromAssignments(list));
        }
      }
    } catch (error) {
      setError(error instanceof Error ? error.message : 'Failed to load assignments');
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    const statusConfig: Record<string, { color: string; label: string; icon: React.ComponentType<{ className?: string }> }> = {
      assigned: { color: 'bg-blue-100 text-blue-800', label: 'Assigned', icon: UserCheck },
      accepted: { color: 'bg-green-100 text-green-800', label: 'Accepted', icon: CheckCircle },
      in_progress: { color: 'bg-yellow-100 text-yellow-800', label: 'In Progress', icon: Clock },
      completed: { color: 'bg-emerald-100 text-emerald-800', label: 'Completed', icon: CheckCircle },
      rejected: { color: 'bg-orange-100 text-orange-800', label: 'Rejected', icon: AlertTriangle },
      cancelled: { color: 'bg-red-100 text-red-800', label: 'Cancelled', icon: AlertTriangle }
    };

    const config = statusConfig[status] || statusConfig.assigned;
    const Icon = config.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {config.label}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const priorityConfig: Record<string, string> = {
      low: 'bg-gray-100 text-gray-800',
      medium: 'bg-blue-100 text-blue-800',
      high: 'bg-orange-100 text-orange-800',
      urgent: 'bg-red-100 text-red-800'
    };

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
        {priority?.toUpperCase() || 'MEDIUM'}
      </span>
    );
  };

  const formatDate = (date: string) => {
    return new Date(date).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric'
    });
  };

  const isOverdue = (deadline: string, status: string) => {
    if (status === 'completed' || status === 'cancelled') return false;
    return new Date(deadline) < new Date();
  };

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      {/* Header */}
      <div className="mb-6">
        <div className="flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">NIA Automated Assignments</h1>
            <p className="text-gray-600 mt-1">
              LGA-based surveyor assignments with round-robin distribution
            </p>
          </div>
          <button
            onClick={fetchAssignments}
            className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
          >
            <RefreshCw className="w-4 h-4" />
            Refresh
          </button>
        </div>
      </div>

      {/* Statistics Cards */}
      {stats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-6">
          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                <p className="text-2xl font-bold text-gray-900 mt-1">{stats.total}</p>
              </div>
              <div className="bg-blue-100 rounded-full p-3">
                <Users className="w-6 h-6 text-blue-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">In Progress</p>
                <p className="text-2xl font-bold text-yellow-600 mt-1">
                  {(stats.byStatus?.in_progress || 0) + (stats.byStatus?.accepted || 0)}
                </p>
              </div>
              <div className="bg-yellow-100 rounded-full p-3">
                <Clock className="w-6 h-6 text-yellow-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Completed</p>
                <p className="text-2xl font-bold text-green-600 mt-1">
                  {stats.byStatus?.completed || 0}
                </p>
              </div>
              <div className="bg-green-100 rounded-full p-3">
                <CheckCircle className="w-6 h-6 text-green-600" />
              </div>
            </div>
          </div>

          <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm font-medium text-gray-600">Overdue</p>
                <p className="text-2xl font-bold text-red-600 mt-1">{stats.overdueCount || 0}</p>
              </div>
              <div className="bg-red-100 rounded-full p-3">
                <AlertTriangle className="w-6 h-6 text-red-600" />
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Filters */}
      <div className="bg-white rounded-lg shadow p-4 mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <input
              type="text"
              placeholder="Search by builder name, email, or address..."
              value={filters.search}
              onChange={(e) => setFilters({ ...filters, search: e.target.value })}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
          </div>

          <select
            value={filters.status}
            onChange={(e) => setFilters({ ...filters, status: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Statuses</option>
            <option value="assigned">Assigned</option>
            <option value="accepted">Accepted</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="rejected">Rejected</option>
            <option value="cancelled">Cancelled</option>
          </select>

          <select
            value={filters.priority}
            onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
            className="px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
            <option value="urgent">Urgent</option>
          </select>
        </div>
      </div>

      {/* Assignments List */}
      <div className="bg-white rounded-lg shadow overflow-hidden">
        {loading ? (
          <div className="p-12 text-center">
            <RefreshCw className="w-8 h-8 text-gray-400 animate-spin mx-auto mb-4" />
            <p className="text-gray-600">Loading assignments...</p>
          </div>
        ) : error ? (
          <div className="p-12 text-center">
            <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">Error Loading Assignments</h3>
            <p className="text-gray-600 mb-4">{error}</p>
            <button
              onClick={fetchAssignments}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Try Again
            </button>
          </div>
        ) : assignments.length === 0 ? (
          <div className="p-12 text-center">
            <Building className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-semibold text-gray-900 mb-2">No Assignments Found</h3>
            <p className="text-gray-600">
              {filters.search || filters.status !== 'all' || filters.priority !== 'all'
                ? 'Try adjusting your filters'
                : 'Assignments will appear here once policies are submitted'}
            </p>
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-gray-200">
              <thead className="bg-gray-50">
                <tr>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Policy / Builder
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Surveyor
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Location
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Status
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Priority
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Deadline
                  </th>
                  <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                    Actions
                  </th>
                </tr>
              </thead>
              <tbody className="bg-white divide-y divide-gray-200">
                {assignments.map((assignment) => (
                  <tr key={assignment._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <div className="text-sm font-medium text-gray-900">
                          {assignment.policyId?.policyNumber || 'N/A'}
                        </div>
                        <div className="text-sm text-gray-500">
                          {assignment.policyId?.builder?.nameOfBuilder || 'Unknown Builder'}
                        </div>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {assignment.surveyorId
                          ? `${assignment.surveyorId.firstname} ${assignment.surveyorId.lastname}`
                          : 'Unassigned'}
                      </div>
                      <div className="text-sm text-gray-500">
                        {assignment.surveyorId?.email || ''}
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center text-sm text-gray-900">
                        <MapPin className="w-4 h-4 mr-1 text-gray-400" />
                        <span className="truncate max-w-xs">
                          {assignment.location?.address || assignment.policyId?.builder?.address || 'N/A'}
                        </span>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      {getStatusBadge(assignment.status)}
                    </td>
                    <td className="px-6 py-4">
                      {getPriorityBadge(assignment.priority)}
                    </td>
                    <td className="px-6 py-4">
                      <div className="text-sm text-gray-900">
                        {formatDate(assignment.deadline)}
                      </div>
                      {isOverdue(assignment.deadline, assignment.status) && (
                        <div className="flex items-center text-xs text-red-600 mt-1">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Overdue
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4">
                      <button
                        onClick={() => {
                          setSelectedAssignment(assignment);
                          setShowDetailsModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-800 font-medium text-sm flex items-center gap-1"
                      >
                        <Eye className="w-4 h-4" />
                        View
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-start justify-between">
                <div>
                  <h3 className="text-xl font-semibold text-gray-900">Assignment Details</h3>
                  <p className="text-sm text-gray-600 mt-1">
                    Policy #{selectedAssignment.policyId?.policyNumber}
                  </p>
                </div>
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <span className="sr-only">Close</span>
                  <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                  </svg>
                </button>
              </div>
            </div>

            <div className="p-6 space-y-6">
              {/* Builder Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Builder Information</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">{selectedAssignment.policyId?.builder?.nameOfBuilder}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedAssignment.policyId?.builder?.customerEmail}</p>
                  </div>
                  <div className="col-span-2">
                    <span className="text-gray-600">Address:</span>
                    <p className="font-medium">{selectedAssignment.policyId?.builder?.address}</p>
                  </div>
                </div>
              </div>

              {/* Surveyor Information */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Assigned Surveyor</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Name:</span>
                    <p className="font-medium">
                      {selectedAssignment.surveyorId
                        ? `${selectedAssignment.surveyorId.firstname} ${selectedAssignment.surveyorId.lastname}`
                        : 'Not assigned'}
                    </p>
                  </div>
                  <div>
                    <span className="text-gray-600">Email:</span>
                    <p className="font-medium">{selectedAssignment.surveyorId?.email || 'N/A'}</p>
                  </div>
                </div>
              </div>

              {/* Assignment Details */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <span className="text-gray-600">Status:</span>
                    <div className="mt-1">{getStatusBadge(selectedAssignment.status)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Priority:</span>
                    <div className="mt-1">{getPriorityBadge(selectedAssignment.priority)}</div>
                  </div>
                  <div>
                    <span className="text-gray-600">Assigned Date:</span>
                    <p className="font-medium">{formatDate(selectedAssignment.assignedAt)}</p>
                  </div>
                  <div>
                    <span className="text-gray-600">Deadline:</span>
                    <p className="font-medium">{formatDate(selectedAssignment.deadline)}</p>
                  </div>
                </div>
              </div>
            </div>

            <div className="p-6 border-t border-gray-200 flex justify-end">
              <button
                onClick={() => setShowDetailsModal(false)}
                className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
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

export default NIAAutomatedAssignmentsPage;
