"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  FileText,
  CheckCircle,
  Clock,
  AlertTriangle,
  TrendingUp,
  Calendar,
  MapPin,
  Star,
  Activity,
  RefreshCw,
  Bell
} from "lucide-react";
import { useRouter } from "next/navigation";
import {
  getAdminDashboardData,
  getQuickStats,
  getAdminAlerts,
  getAdminSurveyors
} from '@/services/api';
import {
  DashboardData,
  QuickStats,
  AdminAlert,
  Surveyor
} from '@/types/api.types';
import { toast } from "sonner";

interface SurveyorPerformance {
  id: string;
  name: string;
  completedSurveys: number;
  averageRating: number;
  onTimeDelivery: number;
  currentAssignments: number;
}

const AdminDashboard: React.FC = () => {
  const router = useRouter();
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // API Data States
  const [dashboardData, setDashboardData] = useState<DashboardData | null>(null);
  const [quickStats, setQuickStats] = useState<QuickStats | null>(null);
  const [alerts, setAlerts] = useState<AdminAlert[]>([]);
  const [topPerformers, setTopPerformers] = useState<SurveyorPerformance[]>([]);

  // UI State
  const [activeTab, setActiveTab] = useState<'overview' | 'alerts'>('overview');

  useEffect(() => {
    fetchDashboardData();
  }, []);

  const fetchDashboardData = async () => {
    setLoading(true);
    setError(null);

    try {
      // Fetch all dashboard data from the new API endpoints
      const [
        dashboardResponse,
        quickStatsResponse,
        alertsResponse,
        surveyorsResponse
      ] = await Promise.allSettled([
        getAdminDashboardData(),
        getQuickStats(),
        getAdminAlerts(),
        getAdminSurveyors({ status: 'active', limit: 5 })
      ]);

      // Handle dashboard data
      if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value.success) {
        setDashboardData(dashboardResponse.value.data);
      }

      // Handle quick stats
      if (quickStatsResponse.status === 'fulfilled' && quickStatsResponse.value.success) {
        setQuickStats(quickStatsResponse.value.data);
      }

      // Handle alerts
      if (alertsResponse.status === 'fulfilled' && alertsResponse.value.success) {
        setAlerts(alertsResponse.value.data || []);
      }

      // Handle top performers
      if (surveyorsResponse.status === 'fulfilled' && surveyorsResponse.value.success) {
        // Only use surveyors with status 'active' and availability 'available'
        const activeAvailableSurveyors = surveyorsResponse.value.data.filter((s: Surveyor) => s.status === 'active' && s.profile?.availability === 'available');
        const performers = activeAvailableSurveyors.map((surveyor: Surveyor) => ({
          id: surveyor._id,
          name: `${surveyor.firstname} ${surveyor.lastname}`,
          completedSurveys: surveyor.statistics?.completedSurveys || 0,
          averageRating: surveyor.statistics?.averageRating || 0,
          onTimeDelivery: surveyor.statistics?.onTimeDeliveryRate || 0,
          currentAssignments: surveyor.statistics?.currentWorkload || 0
        }));
        setTopPerformers(performers);
      }

    } catch (error: unknown) {
      console.error('Failed to fetch dashboard data:', error);
      setError('Failed to load dashboard data. Please try refreshing.');
    } finally {
      setLoading(false);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    await fetchDashboardData();
    setRefreshing(false);
  };

  const getActivityIcon = (type: string) => {
    switch (type) {
      case 'policy_submitted':
        return <FileText className="h-4 w-4 text-blue-500" />;
      case 'surveyor_assigned':
        return <Users className="h-4 w-4 text-purple-500" />;
      case 'survey_completed':
        return <CheckCircle className="h-4 w-4 text-green-500" />;
      case 'policy_approved':
        return <CheckCircle className="h-4 w-4 text-emerald-500" />;
      default:
        return <Activity className="h-4 w-4 text-gray-500" />;
    }
  };

  const getAlertSeverityColor = (severity: string) => {
    switch (severity) {
      case 'high':
        return 'bg-red-100 border-red-200 text-red-800';
      case 'medium':
        return 'bg-yellow-100 border-yellow-200 text-yellow-800';
      case 'low':
        return 'bg-blue-100 border-blue-200 text-blue-800';
      default:
        return 'bg-gray-100 border-gray-200 text-gray-800';
    }
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

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 p-6">
        <div className="max-w-7xl mx-auto">
          <div className="animate-pulse">
            <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
              {[1, 2, 3, 4].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                  <div className="h-4 bg-gray-300 rounded w-1/2 mb-2"></div>
                  <div className="h-8 bg-gray-300 rounded w-3/4"></div>
                </div>
              ))}
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              <div className="lg:col-span-2 bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-1/4"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-6 h-6 bg-gray-300 rounded"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
              <div className="bg-white rounded-lg shadow-sm border">
                <div className="p-6 border-b border-gray-200">
                  <div className="h-6 bg-gray-300 rounded w-1/3"></div>
                </div>
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center space-x-3">
                      <div className="w-8 h-8 bg-gray-300 rounded-full"></div>
                      <div className="flex-1 space-y-1">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50 p-6">
      <div className="max-w-7xl mx-auto">
        {/* Header */}
        <div className="mb-8 flex items-center justify-between">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
            <p className="text-gray-600 mt-2">Overview of policy requests and surveyor operations</p>
          </div>

          <div className="flex items-center space-x-4">
            {/* Alerts Badge */}
            {alerts.length > 0 && (
              <button
                onClick={() => setActiveTab(activeTab === 'alerts' ? 'overview' : 'alerts')}
                className="relative flex items-center space-x-2 px-4 py-2 bg-red-100 text-red-700 rounded-lg hover:bg-red-200 transition-colors"
              >
                <Bell className="w-4 h-4" />
                <span className="text-sm font-medium">{alerts.length} Alert{alerts.length > 1 ? 's' : ''}</span>
                {alerts.filter(a => a.severity === 'high').length > 0 && (
                  <span className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"></span>
                )}
              </button>
            )}

            {/* Refresh Button */}
            <button
              onClick={handleRefresh}
              disabled={refreshing}
              className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            >
              <RefreshCw className={`w-4 h-4 ${refreshing ? 'animate-spin' : ''}`} />
              <span className="text-sm font-medium">Refresh</span>
            </button>
          </div>
        </div>

        {/* Error Message */}
        {error && (
          <div className="mb-6 bg-red-50 border border-red-200 rounded-lg p-4">
            <div className="flex items-center">
              <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
              <p className="text-red-700">{error}</p>
            </div>
          </div>
        )}

        {/* Alerts Panel */}
        {activeTab === 'alerts' && alerts.length > 0 && (
          <div className="mb-8 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                <Bell className="w-5 h-5 mr-2" />
                System Alerts
              </h3>
            </div>
            <div className="p-6 space-y-4">
              {alerts.map((alert, index) => (
                <div
                  key={index}
                  className={`p-4 rounded-lg border ${getAlertSeverityColor(alert.severity)}`}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1">
                      <h4 className="font-medium">{alert.title}</h4>
                      <p className="text-sm mt-1 opacity-80">{alert.message}</p>
                      <p className="text-xs mt-2 opacity-60">{formatTimeAgo(alert.timestamp)}</p>
                    </div>
                    <span className={`text-xs px-2 py-1 rounded-full font-medium ${alert.severity === 'high' ? 'bg-red-200 text-red-800' :
                      alert.severity === 'medium' ? 'bg-yellow-200 text-yellow-800' :
                        'bg-blue-200 text-blue-800'
                      }`}>
                      {alert.severity.toUpperCase()}
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>
        )}

        {/* Quick Stats Grid */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-blue-100 rounded-lg flex-shrink-0">
                <FileText className="h-6 w-6 text-blue-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Today's Policies</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quickStats?.todayPolicies || dashboardData?.summary.policies.total || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-yellow-100 rounded-lg flex-shrink-0">
                <Clock className="h-6 w-6 text-yellow-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Pending Assignments</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {quickStats?.pendingAssignments || dashboardData?.summary.assignments.active || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-green-100 rounded-lg flex-shrink-0">
                <Users className="h-6 w-6 text-green-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Active Surveyors</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.summary.surveyors.active || 0}
                </p>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border min-w-0 overflow-hidden">
            <div className="flex items-center min-w-0">
              <div className="p-2 bg-purple-100 rounded-lg flex-shrink-0">
                <CheckCircle className="h-6 w-6 text-purple-600" />
              </div>
              <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">Completed Surveys</p>
                <p className="text-2xl font-semibold text-gray-900">
                  {dashboardData?.summary.assignments.completed || 0}
                </p>
              </div>
            </div>
          </div>
        </div>

        {/* Main Dashboard Stats */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Total Policies</h3>
              <FileText className="h-5 w-5 text-blue-500" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.policies.total || 0}</p>
              <div className="flex items-center text-sm">
                <span className="text-green-500 mr-1">↗</span>
                <span className="text-green-600 font-medium">+{dashboardData?.summary.policies.growth || 0}%</span>
                <span className="text-gray-500 ml-1">this month</span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Pending: {dashboardData?.summary.policies.pending || 0}</span>
                  <span>Approved: {dashboardData?.summary.policies.approved || 0}</span>
                  <span>Rejected: {dashboardData?.summary.policies.rejected || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Assignment Status</h3>
              <Clock className="h-5 w-5 text-yellow-500" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.assignments.total || 0}</p>
              <div className="flex items-center text-sm">
                <span className="text-blue-500 mr-1">⚡</span>
                <span className="text-blue-600 font-medium">{(dashboardData?.summary.assignments.completionRate || 0).toFixed(2)}%</span>
                <span className="text-gray-500 ml-1">completion rate</span>
              </div>
              <div className="text-xs text-gray-500 space-y-1">
                <div className="flex justify-between">
                  <span>Active: {dashboardData?.summary.assignments.active || 0}</span>
                  <span>Overdue: {dashboardData?.summary.assignments.overdue || 0}</span>
                </div>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">Surveyor Network</h3>
              <Users className="h-5 w-5 text-green-500" />
            </div>
            <div className="space-y-2">
              <p className="text-2xl font-bold text-gray-900">{dashboardData?.summary.surveyors.total || 0}</p>
              <div className="flex items-center text-sm">
                <span className="text-green-500 mr-1">●</span>
                <span className="text-green-600 font-medium">{dashboardData?.summary.surveyors.active || 0} active</span>
              </div>
              <div className="text-xs text-gray-500">
                <span>Available: {dashboardData?.summary.surveyors.available || 0}</span>
              </div>
            </div>
          </div>

          <div className="bg-white p-6 rounded-lg shadow-sm border">
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-sm font-medium text-gray-600">System Health</h3>
              <TrendingUp className="h-5 w-5 text-purple-500" />
            </div>
            <div className="space-y-2">
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Overdue Rate:</span>
                <span className={`ml-2 font-medium ${(dashboardData?.analytics.systemHealth.overdueRate || 0) < 5 ? 'text-green-600' : 'text-red-600'
                  }`}>
                  {dashboardData?.analytics.systemHealth.overdueRate || 0}%
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Utilization:</span>
                <span className="ml-2 font-medium text-blue-600">
                  {dashboardData?.analytics.systemHealth.surveyorUtilization || 0}%
                </span>
              </div>
              <div className="flex items-center text-sm">
                <span className="text-gray-600">Avg. Processing:</span>
                <span className="ml-2 font-medium text-purple-600">
                  {dashboardData?.analytics.systemHealth.avgProcessingTime || 0}d
                </span>
              </div>
            </div>
          </div>
        </div>

        {/* Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-4 gap-8">
          {/* Recent Activity */}
          <div className="lg:col-span-3 bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
            </div>
            <div className="p-6">
              <div className="space-y-6">
                {/* Recent Policies */}
                {dashboardData?.recentActivity.policies && dashboardData.recentActivity.policies.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <FileText className="w-4 h-4 mr-2 text-blue-500" />
                      Recent Policy Requests
                    </h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivity.policies.slice(0, 3).map((policy) => (
                        <div key={policy._id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              New policy request from <span className="font-medium">{policy.contactDetails.fullName}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              {policy.propertyDetails?.propertyType} • {formatTimeAgo(policy.createdAt)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${policy.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                            policy.status === 'assigned' ? 'bg-blue-100 text-blue-800' :
                              policy.status === 'approved' ? 'bg-green-100 text-green-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {policy.status}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Assignments */}
                {dashboardData?.recentActivity.assignments && dashboardData.recentActivity.assignments.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <Users className="w-4 h-4 mr-2 text-purple-500" />
                      Recent Assignments
                    </h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivity.assignments.slice(0, 3).map((assignment) => (
                        <div key={assignment._id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              Assignment {assignment.status === 'completed' ? 'completed' : 'updated'} -
                              <span className="font-medium"> {assignment.location?.address}</span>
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Priority: {assignment.priority} • {formatTimeAgo(assignment.updatedAt)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                            assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                              assignment.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {assignment.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* Recent Submissions */}
                {dashboardData?.recentActivity.submissions && dashboardData.recentActivity.submissions.length > 0 && (
                  <div>
                    <h4 className="text-sm font-medium text-gray-700 mb-3 flex items-center">
                      <CheckCircle className="w-4 h-4 mr-2 text-green-500" />
                      Recent Submissions
                    </h4>
                    <div className="space-y-2">
                      {dashboardData.recentActivity.submissions.slice(0, 3).map((submission) => (
                        <div key={submission._id} className="flex items-start space-x-3 p-2 rounded hover:bg-gray-50">
                          <div className="flex-1 min-w-0">
                            <p className="text-sm text-gray-900">
                              Survey submission {submission.status === 'approved' ? 'approved' : 'received'}
                            </p>
                            <p className="text-xs text-gray-500 mt-1">
                              Action: {submission.recommendedAction} • {formatTimeAgo(submission.submissionTime)}
                            </p>
                          </div>
                          <span className={`text-xs px-2 py-1 rounded-full font-medium ${submission.status === 'approved' ? 'bg-green-100 text-green-800' :
                            submission.status === 'submitted' ? 'bg-blue-100 text-blue-800' :
                              submission.status === 'under_review' ? 'bg-yellow-100 text-yellow-800' :
                                'bg-gray-100 text-gray-800'
                            }`}>
                            {submission.status.replace('_', ' ')}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* No recent activity fallback */}
                {(!dashboardData?.recentActivity.policies?.length &&
                  !dashboardData?.recentActivity.assignments?.length &&
                  !dashboardData?.recentActivity.submissions?.length) && (
                    <div className="text-center py-8 text-gray-500">
                      <Activity className="w-12 h-12 mx-auto mb-3 opacity-30" />
                      <p>No recent activity</p>
                    </div>
                  )}
              </div>
            </div>
          </div>

          {/* Notifications */}
          <div className="bg-white rounded-lg shadow-sm border">
            <div className="p-6 border-b border-gray-200">
              <div className="flex items-center justify-between">
                <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                  <Bell className="w-5 h-5 mr-2" />
                  Notifications
                </h3>
                <button className="text-sm text-blue-600 hover:text-blue-800">
                  View All
                </button>
              </div>
            </div>
            <div className="p-6">
              <div className="space-y-4 max-h-96 overflow-y-auto">
                {/* Policy Notifications */}
                <div className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-blue-100 rounded-full">
                      <FileText className="h-4 w-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">New Policy Request</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Policy request from John Doe for residential property requires assignment.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Assignment Notifications */}
                <div className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-yellow-100 rounded-full">
                      <Clock className="h-4 w-4 text-yellow-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Assignment Overdue</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Survey assignment for Property ID: A012D30 is overdue by 2 days.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">4 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* Survey Completion */}
                <div className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-green-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Survey Completed</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Surveyor Mike Johnson completed survey for Property ID: B045X21.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">6 hours ago</p>
                    </div>
                  </div>
                </div>

                {/* System Alert */}
                <div className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-red-100 rounded-full">
                      <AlertTriangle className="h-4 w-4 text-red-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">System Alert</p>
                      <p className="text-xs text-gray-500 mt-1">
                        High volume of pending assignments detected. Consider assigning more surveyors.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>

                {/* Surveyor Status */}
                <div className="border-b border-dashed border-gray-200 pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-purple-100 rounded-full">
                      <Users className="h-4 w-4 text-purple-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Surveyor Available</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Sarah Wilson is now available for new assignments.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">1 day ago</p>
                    </div>
                  </div>
                </div>

                {/* Policy Approval */}
                <div className="pb-3">
                  <div className="flex items-start space-x-3">
                    <div className="p-1 bg-emerald-100 rounded-full">
                      <CheckCircle className="h-4 w-4 text-emerald-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900">Policy Approved</p>
                      <p className="text-xs text-gray-500 mt-1">
                        Policy for Property ID: C078M15 has been approved and is now active.
                      </p>
                      <p className="text-xs text-gray-400 mt-1">2 days ago</p>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Quick Actions */}
        <div className="mt-8 bg-white rounded-lg shadow-sm border p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <button
              onClick={() => router.push('/admin/dashboard/policies')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <FileText className="h-6 w-6 text-blue-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Policies</p>
              <p className="text-xs text-gray-500">View and assign policies</p>
            </button>

            <button
              onClick={() => router.push('/admin/dashboard/surveyors')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <Users className="h-6 w-6 text-green-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Manage Surveyors</p>
              <p className="text-xs text-gray-500">View surveyor profiles</p>
            </button>

            <button
              onClick={() => router.push('/admin/dashboard/assignments')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <CheckCircle className="h-6 w-6 text-purple-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">View Assignments</p>
              <p className="text-xs text-gray-500">Manage surveyor tasks</p>
            </button>

            <button
              onClick={() => router.push('/admin/dashboard/policies?tab=surveyed')}
              className="p-4 border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors"
            >
              <TrendingUp className="h-6 w-6 text-orange-600 mx-auto mb-2" />
              <p className="text-sm font-medium text-gray-900">Review Surveys</p>
              <p className="text-xs text-gray-500">Approve submissions</p>
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AdminDashboard;