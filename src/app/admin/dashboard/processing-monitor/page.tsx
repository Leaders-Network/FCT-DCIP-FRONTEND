"use client";
import React, { useState, useEffect } from 'react';
// Import token setup for development
import '@/utils/tokenSetup';
import { processingMonitorService, ProcessingOverview, ActiveProcessing, PerformanceMetrics, SystemHealth, RecentActivity } from '@/services/processingMonitor';
import {
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    Eye,
    Download,
    Filter,
    Search,
    Activity,
    Zap,
    TrendingUp,
    AlertCircle,
    Server,
    Database,
    Users,
    BarChart3
} from 'lucide-react';

const AMMCProcessingMonitorPage = () => {
    const [overview, setOverview] = useState<ProcessingOverview | null>(null);
    const [activeProcessing, setActiveProcessing] = useState<ActiveProcessing | null>(null);
    const [performanceMetrics, setPerformanceMetrics] = useState<PerformanceMetrics | null>(null);
    const [systemHealth, setSystemHealth] = useState<SystemHealth | null>(null);
    const [recentActivity, setRecentActivity] = useState<RecentActivity | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [filters, setFilters] = useState({
        timeframe: '24h',
        organization: 'AMMC' // Changed from NIA to AMMC
    });
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchAllData();

        // Set up auto-refresh every 30 seconds
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchAllData, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh, filters.timeframe, filters.organization]);

    const fetchAllData = async () => {
        try {
            setLoading(true);
            setError(null);

            // Fetch all monitoring data in parallel
            const [
                overviewResponse,
                activeResponse,
                performanceResponse,
                healthResponse,
                activityResponse
            ] = await Promise.all([
                processingMonitorService.getOverview(filters.organization, filters.timeframe),
                processingMonitorService.getActiveProcessing(filters.organization),
                processingMonitorService.getPerformanceMetrics(filters.timeframe, filters.organization),
                processingMonitorService.getSystemHealth(),
                processingMonitorService.getRecentActivity(50, filters.organization)
            ]);

            if (overviewResponse.success) {
                setOverview(overviewResponse.data);
            }

            if (activeResponse.success) {
                setActiveProcessing(activeResponse.data);
            }

            if (performanceResponse.success) {
                setPerformanceMetrics(performanceResponse.data);
            }

            if (healthResponse.success) {
                setSystemHealth(healthResponse.data);
            }

            if (activityResponse.success) {
                setRecentActivity(activityResponse.data);
            }

            // If any request failed, show error but don't block the UI
            const failedRequests = [
                overviewResponse,
                activeResponse,
                performanceResponse,
                healthResponse,
                activityResponse
            ].filter(response => !response.success);

            if (failedRequests.length > 0) {
                console.warn('Some monitoring data failed to load:', failedRequests);
            }

        } catch (error) {
            console.error('Failed to fetch monitoring data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load monitoring data');

            // Fallback to empty state
            setOverview(null);
            setActiveProcessing(null);
            setPerformanceMetrics(null);
            setSystemHealth(null);
            setRecentActivity(null);
        } finally {
            setLoading(false);
        }
    };

    const formatDuration = (milliseconds?: number) => {
        if (!milliseconds) return 'N/A';
        const seconds = Math.floor(milliseconds / 1000);
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const getSystemStatusColor = (status: string) => {
        switch (status) {
            case 'healthy': return 'text-green-600';
            case 'warning': return 'text-yellow-600';
            case 'critical': return 'text-red-600';
            default: return 'text-gray-600';
        }
    };

    const getSystemStatusIcon = (status: string) => {
        switch (status) {
            case 'healthy': return <CheckCircle className="h-5 w-5 text-green-500" />;
            case 'warning': return <AlertTriangle className="h-5 w-5 text-yellow-500" />;
            case 'critical': return <AlertCircle className="h-5 w-5 text-red-500" />;
            default: return <Server className="h-5 w-5 text-gray-500" />;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-24"></div>
                        ))}
                    </div>
                    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                        {[1, 2, 3].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border h-48"></div>
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
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Processing Monitor</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchAllData}
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
                    <h1 className="text-2xl font-bold text-gray-900">Automatic Processing Monitor</h1>
                    <p className="text-gray-600 mt-1">
                        Monitor automatic report merging and conflict detection processes (AMMC)
                    </p>
                </div>
                <div className="flex items-center space-x-3">
                    <div className="flex items-center space-x-2">
                        <select
                            value={filters.timeframe}
                            onChange={(e) => setFilters(prev => ({ ...prev, timeframe: e.target.value }))}
                            className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="1h">Last Hour</option>
                            <option value="24h">Last 24 Hours</option>
                            <option value="7d">Last 7 Days</option>
                            <option value="30d">Last 30 Days</option>
                        </select>
                    </div>
                    <div className="flex items-center space-x-2">
                        <input
                            type="checkbox"
                            id="autoRefresh"
                            checked={autoRefresh}
                            onChange={(e) => setAutoRefresh(e.target.checked)}
                            className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                        />
                        <label htmlFor="autoRefresh" className="text-sm text-gray-700">
                            Auto-refresh
                        </label>
                    </div>
                    <button
                        onClick={fetchAllData}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* System Health Alert */}
            {systemHealth && systemHealth.systemStatus !== 'healthy' && (
                <div className={`p-4 rounded-lg border ${systemHealth.systemStatus === 'critical'
                    ? 'bg-red-50 border-red-200'
                    : 'bg-yellow-50 border-yellow-200'
                    }`}>
                    <div className="flex items-center">
                        {getSystemStatusIcon(systemHealth.systemStatus)}
                        <div className="ml-3">
                            <h3 className={`text-sm font-medium ${getSystemStatusColor(systemHealth?.systemStatus)}`}>
                                System Status: {systemHealth?.systemStatus?.toUpperCase() || 'UNKNOWN'}
                            </h3>
                            {systemHealth?.alerts?.length > 0 && (
                                <div className="mt-2">
                                    <ul className="text-sm text-gray-600 space-y-1">
                                        {systemHealth.alerts.map((alert, index) => (
                                            <li key={index}>• {alert}</li>
                                        ))}
                                    </ul>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Overview Stats */}
            {overview && (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-blue-100 rounded-lg">
                                <Activity className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{overview?.overview?.totalDualAssignments || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <FileText className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Merged Reports</p>
                                <p className="text-2xl font-bold text-gray-900">{overview?.overview?.totalMergedReports || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <AlertTriangle className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Conflict Flags</p>
                                <p className="text-2xl font-bold text-gray-900">{overview?.overview?.totalConflictFlags || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <Users className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">User Inquiries</p>
                                <p className="text-2xl font-bold text-gray-900">{overview?.overview?.totalUserInquiries || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                {performanceMetrics && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Processing Performance</h3>
                            <TrendingUp className="h-5 w-5 text-green-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Avg Processing Time:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {performanceMetrics?.processingPerformance?.avgProcessingTime
                                        ? formatDuration(performanceMetrics.processingPerformance.avgProcessingTime)
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Total Reports:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {performanceMetrics?.processingPerformance?.totalReports || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Released Reports:</span>
                                <span className="text-sm font-medium text-green-600">
                                    {performanceMetrics?.successRates?.released || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {overview && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">Conflict Detection</h3>
                            <AlertTriangle className="h-5 w-5 text-orange-500" />
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Critical:</span>
                                <span className="text-sm font-medium text-red-600">
                                    {overview?.activeConflictsBySeverity?.critical || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">High:</span>
                                <span className="text-sm font-medium text-orange-600">
                                    {overview?.activeConflictsBySeverity?.high || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Medium:</span>
                                <span className="text-sm font-medium text-yellow-600">
                                    {overview?.activeConflictsBySeverity?.medium || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Low:</span>
                                <span className="text-sm font-medium text-green-600">
                                    {overview?.activeConflictsBySeverity?.low || 0}
                                </span>
                            </div>
                        </div>
                    </div>
                )}

                {systemHealth && (
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                            {getSystemStatusIcon(systemHealth?.systemStatus || 'unknown')}
                        </div>
                        <div className="space-y-3">
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">System Status:</span>
                                <span className={`text-sm font-medium ${getSystemStatusColor(systemHealth?.systemStatus || 'unknown')}`}>
                                    {systemHealth?.systemStatus
                                        ? systemHealth.systemStatus.charAt(0).toUpperCase() + systemHealth.systemStatus.slice(1)
                                        : 'Unknown'
                                    }
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Recent Activity:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {systemHealth?.metrics?.recentActivity || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Stuck Processing:</span>
                                <span className={`text-sm font-medium ${(systemHealth?.metrics?.stuckProcessing || 0) > 0 ? 'text-red-600' : 'text-green-600'}`}>
                                    {systemHealth?.metrics?.stuckProcessing || 0}
                                </span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-sm text-gray-600">Last Check:</span>
                                <span className="text-sm font-medium text-gray-900">
                                    {systemHealth?.lastChecked
                                        ? new Date(systemHealth.lastChecked).toLocaleTimeString()
                                        : 'N/A'
                                    }
                                </span>
                            </div>
                        </div>
                    </div>
                )}
            </div>

            {/* Active Processing */}
            {activeProcessing && (
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Active Assignments</h3>
                        {(activeProcessing?.activeAssignments?.length || 0) === 0 ? (
                            <p className="text-gray-600 text-center py-8">No active assignments</p>
                        ) : (
                            <div className="space-y-3">
                                {activeProcessing?.activeAssignments?.slice(0, 5).map((assignment) => (
                                    <div key={assignment._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{assignment.policyId}</p>
                                            <p className="text-xs text-gray-600">
                                                Status: {assignment.assignmentStatus} • {assignment.completionStatus}% complete
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <div className={`w-3 h-3 rounded-full ${assignment.completionStatus === 100 ? 'bg-green-500' :
                                                assignment.completionStatus === 50 ? 'bg-yellow-500' : 'bg-gray-300'
                                                }`}></div>
                                        </div>
                                    </div>
                                ))}
                                {(activeProcessing?.activeAssignments?.length || 0) > 5 && (
                                    <p className="text-sm text-gray-600 text-center">
                                        +{(activeProcessing?.activeAssignments?.length || 0) - 5} more assignments
                                    </p>
                                )}
                            </div>
                        )}
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Pending Reports</h3>
                        {(activeProcessing?.pendingReports?.length || 0) === 0 ? (
                            <p className="text-gray-600 text-center py-8">No pending reports</p>
                        ) : (
                            <div className="space-y-3">
                                {activeProcessing?.pendingReports?.slice(0, 5).map((report) => (
                                    <div key={report._id} className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                                        <div>
                                            <p className="text-sm font-medium text-gray-900">{report.policyId}</p>
                                            <p className="text-xs text-gray-600">
                                                Status: {report.releaseStatus} • {new Date(report.createdAt).toLocaleString()}
                                            </p>
                                        </div>
                                        <div className="flex items-center space-x-2">
                                            <Clock className="h-4 w-4 text-yellow-500" />
                                        </div>
                                    </div>
                                ))}
                                {(activeProcessing?.pendingReports?.length || 0) > 5 && (
                                    <p className="text-sm text-gray-600 text-center">
                                        +{(activeProcessing?.pendingReports?.length || 0) - 5} more reports
                                    </p>
                                )}
                            </div>
                        )}
                    </div>
                </div>
            )}

            {/* Recent Activity */}
            {recentActivity && (
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Recent Activity</h3>
                        <div className="text-sm text-gray-600">
                            Last updated: {recentActivity?.lastUpdated
                                ? new Date(recentActivity.lastUpdated).toLocaleTimeString()
                                : 'N/A'
                            }
                        </div>
                    </div>
                    {(recentActivity?.activities?.length || 0) === 0 ? (
                        <p className="text-gray-600 text-center py-8">No recent activity</p>
                    ) : (
                        <div className="space-y-3">
                            {recentActivity?.activities?.slice(0, 10).map((activity, index) => (
                                <div key={index} className="flex items-start space-x-3 p-3 bg-gray-50 rounded-lg">
                                    <div className={`p-1 rounded-full ${activity.type === 'report_merged' ? 'bg-green-100' :
                                        activity.type === 'conflict_detected' ? 'bg-orange-100' :
                                            'bg-blue-100'
                                        }`}>
                                        {activity.type === 'report_merged' ? (
                                            <FileText className="h-4 w-4 text-green-600" />
                                        ) : activity.type === 'conflict_detected' ? (
                                            <AlertTriangle className="h-4 w-4 text-orange-600" />
                                        ) : (
                                            <Users className="h-4 w-4 text-blue-600" />
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-sm text-gray-900">{activity.details}</p>
                                        <div className="flex items-center space-x-2 mt-1">
                                            <p className="text-xs text-gray-600">
                                                {activity.propertyAddress}
                                            </p>
                                            <span className="text-xs text-gray-400">•</span>
                                            <p className="text-xs text-gray-600">
                                                {new Date(activity.timestamp).toLocaleString()}
                                            </p>
                                        </div>
                                    </div>
                                </div>
                            ))}
                            {(recentActivity?.activities?.length || 0) > 10 && (
                                <p className="text-sm text-gray-600 text-center">
                                    +{(recentActivity?.activities?.length || 0) - 10} more activities
                                </p>
                            )}
                        </div>
                    )}
                </div>
            )}
        </div>
    );
};

export default AMMCProcessingMonitorPage;