"use client";
import React, { useState, useEffect } from 'react';
// Import token setup for development
import '@/utils/tokenSetup';
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
    AlertCircle
} from 'lucide-react';

interface ProcessingJob {
    _id: string;
    policyId: string;
    ammcReportId: string;
    niaReportId: string;
    mergedReportId?: string;
    processingStatus: 'pending' | 'processing' | 'completed' | 'failed';
    conflictDetected: boolean;
    conflictSeverity?: 'low' | 'medium' | 'high';
    conflictFlags?: string[];
    processingStartedAt: string;
    processingCompletedAt?: string;
    processingDuration?: number; // in seconds
    errorMessage?: string;
    userNotified: boolean;
    policyDetails: {
        propertyType: string;
        address: string;
        userEmail: string;
        userName: string;
    };
}

const ProcessingMonitorPage = () => {
    const [processingJobs, setProcessingJobs] = useState<ProcessingJob[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedJob, setSelectedJob] = useState<ProcessingJob | null>(null);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [filters, setFilters] = useState({
        status: 'all',
        conflictDetected: 'all',
        search: ''
    });
    const [autoRefresh, setAutoRefresh] = useState(true);

    useEffect(() => {
        fetchProcessingJobs();

        // Set up auto-refresh every 30 seconds
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchProcessingJobs, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const fetchProcessingJobs = async () => {
        try {
            setLoading(true);
            // Try multiple token keys for flexibility
            const token = localStorage.getItem('niaAdminToken') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');

            if (!token) {
                console.warn('No authentication token found, using mock data');
                console.log('Available localStorage keys:', Object.keys(localStorage));
                // Continue with mock data instead of throwing error
            } else {
                console.log('Found authentication token');
            }

            // Mock data for demonstration - replace with actual API call
            const mockJobs: ProcessingJob[] = [
                {
                    _id: '1',
                    policyId: 'POL-2024-001',
                    ammcReportId: 'AMMC-RPT-001',
                    niaReportId: 'NIA-RPT-001',
                    mergedReportId: 'MR-2024-001',
                    processingStatus: 'completed',
                    conflictDetected: true,
                    conflictSeverity: 'medium',
                    conflictFlags: ['Property Value Discrepancy', 'Structural Assessment Difference'],
                    processingStartedAt: new Date(Date.now() - 10 * 60 * 1000).toISOString(),
                    processingCompletedAt: new Date(Date.now() - 7 * 60 * 1000).toISOString(),
                    processingDuration: 180, // 3 minutes
                    userNotified: true,
                    policyDetails: {
                        propertyType: 'Residential Building',
                        address: '123 Garki District, Abuja',
                        userEmail: 'john.adebayo@email.com',
                        userName: 'John Adebayo'
                    }
                },
                {
                    _id: '2',
                    policyId: 'POL-2024-002',
                    ammcReportId: 'AMMC-RPT-002',
                    niaReportId: 'NIA-RPT-002',
                    processingStatus: 'processing',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 2 * 60 * 1000).toISOString(),
                    userNotified: false,
                    policyDetails: {
                        propertyType: 'Commercial Building',
                        address: '456 Wuse II, Abuja',
                        userEmail: 'sarah.okafor@email.com',
                        userName: 'Sarah Okafor'
                    }
                },
                {
                    _id: '3',
                    policyId: 'POL-2024-003',
                    ammcReportId: 'AMMC-RPT-003',
                    niaReportId: 'NIA-RPT-003',
                    processingStatus: 'failed',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 15 * 60 * 1000).toISOString(),
                    errorMessage: 'Report format validation failed - NIA report missing required sections',
                    userNotified: false,
                    policyDetails: {
                        propertyType: 'Industrial Facility',
                        address: '789 Jabi District, Abuja',
                        userEmail: 'michael.okonkwo@email.com',
                        userName: 'Michael Okonkwo'
                    }
                },
                {
                    _id: '4',
                    policyId: 'POL-2024-004',
                    ammcReportId: 'AMMC-RPT-004',
                    niaReportId: 'NIA-RPT-004',
                    mergedReportId: 'MR-2024-004',
                    processingStatus: 'completed',
                    conflictDetected: false,
                    processingStartedAt: new Date(Date.now() - 45 * 60 * 1000).toISOString(),
                    processingCompletedAt: new Date(Date.now() - 42 * 60 * 1000).toISOString(),
                    processingDuration: 120, // 2 minutes
                    userNotified: true,
                    policyDetails: {
                        propertyType: 'Residential Building',
                        address: '321 Maitama District, Abuja',
                        userEmail: 'fatima.abdullahi@email.com',
                        userName: 'Fatima Abdullahi'
                    }
                }
            ];

            setProcessingJobs(mockJobs);
        } catch (error) {
            console.error('Failed to fetch processing jobs:', error);
            setError(error instanceof Error ? error.message : 'Failed to load processing jobs');
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'pending': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'processing': return 'bg-blue-100 text-blue-800 border-blue-200';
            case 'completed': return 'bg-green-100 text-green-800 border-green-200';
            case 'failed': return 'bg-red-100 text-red-800 border-red-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'pending': return <Clock className="h-4 w-4" />;
            case 'processing': return <RefreshCw className="h-4 w-4 animate-spin" />;
            case 'completed': return <CheckCircle className="h-4 w-4" />;
            case 'failed': return <AlertTriangle className="h-4 w-4" />;
            default: return <Clock className="h-4 w-4" />;
        }
    };

    const getConflictSeverityColor = (severity?: string) => {
        switch (severity) {
            case 'high': return 'bg-red-100 text-red-800 border-red-200';
            case 'medium': return 'bg-yellow-100 text-yellow-800 border-yellow-200';
            case 'low': return 'bg-green-100 text-green-800 border-green-200';
            default: return 'bg-gray-100 text-gray-800 border-gray-200';
        }
    };

    const formatDuration = (seconds?: number) => {
        if (!seconds) return 'N/A';
        const minutes = Math.floor(seconds / 60);
        const remainingSeconds = seconds % 60;
        return `${minutes}m ${remainingSeconds}s`;
    };

    const handleRetryProcessing = async (jobId: string) => {
        try {
            // Retry failed processing job
            setProcessingJobs(prev => prev.map(job =>
                job._id === jobId
                    ? { ...job, processingStatus: 'pending', errorMessage: undefined }
                    : job
            ));
        } catch (error) {
            console.error('Failed to retry processing:', error);
        }
    };

    const filteredJobs = processingJobs.filter(job => {
        const matchesStatus = filters.status === 'all' || job.processingStatus === filters.status;
        const matchesConflict = filters.conflictDetected === 'all' ||
            (filters.conflictDetected === 'true' && job.conflictDetected) ||
            (filters.conflictDetected === 'false' && !job.conflictDetected);
        const matchesSearch = filters.search === '' ||
            job.policyDetails.userName.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.policyDetails.propertyType.toLowerCase().includes(filters.search.toLowerCase()) ||
            job.policyId.toLowerCase().includes(filters.search.toLowerCase());

        return matchesStatus && matchesConflict && matchesSearch;
    });

    const stats = {
        total: processingJobs.length,
        pending: processingJobs.filter(j => j.processingStatus === 'pending').length,
        processing: processingJobs.filter(j => j.processingStatus === 'processing').length,
        completed: processingJobs.filter(j => j.processingStatus === 'completed').length,
        failed: processingJobs.filter(j => j.processingStatus === 'failed').length,
        withConflicts: processingJobs.filter(j => j.conflictDetected).length,
        avgProcessingTime: processingJobs
            .filter(j => j.processingDuration)
            .reduce((acc, j) => acc + (j.processingDuration || 0), 0) /
            processingJobs.filter(j => j.processingDuration).length || 0
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
                <h3 className="text-lg font-medium text-red-800 mb-2">Error Loading Processing Jobs</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchProcessingJobs}
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
                        Monitor automatic report merging and conflict detection processes
                    </p>
                </div>
                <div className="flex items-center space-x-3">
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
                        onClick={fetchProcessingJobs}
                        className="flex items-center px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <RefreshCw className="h-4 w-4 mr-2" />
                        Refresh
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Activity className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Jobs</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <Clock className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Processing</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {stats.pending + stats.processing}
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
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.completed}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <AlertCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">With Conflicts</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.withConflicts}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Performance Metrics */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Processing Performance</h3>
                        <TrendingUp className="h-5 w-5 text-green-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Avg Processing Time:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {formatDuration(Math.round(stats.avgProcessingTime))}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Success Rate:</span>
                            <span className="text-sm font-medium text-green-600">
                                {stats.total > 0 ? Math.round((stats.completed / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Failed Jobs:</span>
                            <span className="text-sm font-medium text-red-600">{stats.failed}</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">Conflict Detection</h3>
                        <AlertTriangle className="h-5 w-5 text-orange-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Conflict Rate:</span>
                            <span className="text-sm font-medium text-orange-600">
                                {stats.total > 0 ? Math.round((stats.withConflicts / stats.total) * 100) : 0}%
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">High Severity:</span>
                            <span className="text-sm font-medium text-red-600">
                                {processingJobs.filter(j => j.conflictSeverity === 'high').length}
                            </span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Auto-Resolved:</span>
                            <span className="text-sm font-medium text-green-600">0</span>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">System Health</h3>
                        <Zap className="h-5 w-5 text-blue-500" />
                    </div>
                    <div className="space-y-3">
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">System Status:</span>
                            <span className="text-sm font-medium text-green-600">Healthy</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Queue Length:</span>
                            <span className="text-sm font-medium text-gray-900">{stats.pending}</span>
                        </div>
                        <div className="flex justify-between">
                            <span className="text-sm text-gray-600">Last Update:</span>
                            <span className="text-sm font-medium text-gray-900">
                                {new Date().toLocaleTimeString()}
                            </span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white p-6 rounded-lg shadow-sm border">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Search</label>
                        <div className="relative">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
                            <input
                                type="text"
                                value={filters.search}
                                onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                                placeholder="Search by policy, user, or property..."
                                className="pl-10 w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                        </div>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                            value={filters.status}
                            onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Statuses</option>
                            <option value="pending">Pending</option>
                            <option value="processing">Processing</option>
                            <option value="completed">Completed</option>
                            <option value="failed">Failed</option>
                        </select>
                    </div>

                    <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Conflicts</label>
                        <select
                            value={filters.conflictDetected}
                            onChange={(e) => setFilters(prev => ({ ...prev, conflictDetected: e.target.value }))}
                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        >
                            <option value="all">All Jobs</option>
                            <option value="true">With Conflicts</option>
                            <option value="false">No Conflicts</option>
                        </select>
                    </div>
                </div>
            </div>

            {/* Processing Jobs List */}
            <div className="space-y-4">
                {filteredJobs.length === 0 ? (
                    <div className="bg-white p-12 rounded-lg shadow-sm border text-center">
                        <Activity className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No processing jobs found</h3>
                        <p className="text-gray-600">
                            {filters.search || filters.status !== 'all' || filters.conflictDetected !== 'all'
                                ? 'Try adjusting your filters to see more results.'
                                : 'Processing jobs will appear here when reports are submitted for merging.'}
                        </p>
                    </div>
                ) : (
                    filteredJobs.map((job) => (
                        <div key={job._id} className="bg-white p-6 rounded-lg shadow-sm border hover:shadow-md transition-shadow">
                            <div className="flex items-start justify-between mb-4">
                                <div className="flex-1">
                                    <div className="flex items-center space-x-3 mb-2">
                                        <h3 className="text-lg font-semibold text-gray-900">
                                            {job.policyDetails.propertyType}
                                        </h3>
                                        <span className={`flex items-center px-2 py-1 rounded-full text-xs font-medium border ${getStatusColor(job.processingStatus)}`}>
                                            {getStatusIcon(job.processingStatus)}
                                            <span className="ml-1">{job.processingStatus.toUpperCase()}</span>
                                        </span>
                                        {job.conflictDetected && (
                                            <span className={`px-2 py-1 rounded-full text-xs font-medium border ${getConflictSeverityColor(job.conflictSeverity)}`}>
                                                CONFLICT {job.conflictSeverity?.toUpperCase()}
                                            </span>
                                        )}
                                    </div>
                                    <div className="text-sm text-gray-600 mb-2">
                                        <p><strong>User:</strong> {job.policyDetails.userName}</p>
                                        <p><strong>Address:</strong> {job.policyDetails.address}</p>
                                        <p><strong>Policy ID:</strong> {job.policyId}</p>
                                    </div>
                                </div>
                            </div>

                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
                                <div>
                                    <p className="text-xs text-gray-500">Started</p>
                                    <p className="text-sm font-medium text-gray-900">
                                        {new Date(job.processingStartedAt).toLocaleString()}
                                    </p>
                                </div>
                                {job.processingCompletedAt && (
                                    <div>
                                        <p className="text-xs text-gray-500">Completed</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {new Date(job.processingCompletedAt).toLocaleString()}
                                        </p>
                                    </div>
                                )}
                                {job.processingDuration && (
                                    <div>
                                        <p className="text-xs text-gray-500">Duration</p>
                                        <p className="text-sm font-medium text-gray-900">
                                            {formatDuration(job.processingDuration)}
                                        </p>
                                    </div>
                                )}
                            </div>

                            {job.errorMessage && (
                                <div className="mb-4 p-3 bg-red-50 border border-red-200 rounded-lg">
                                    <p className="text-sm text-red-800">
                                        <strong>Error:</strong> {job.errorMessage}
                                    </p>
                                </div>
                            )}

                            {job.conflictFlags && job.conflictFlags.length > 0 && (
                                <div className="mb-4">
                                    <p className="text-xs text-gray-500 mb-2">Detected Conflicts:</p>
                                    <div className="flex flex-wrap gap-2">
                                        {job.conflictFlags.map((flag, index) => (
                                            <span key={index} className="px-2 py-1 bg-orange-100 text-orange-800 text-xs rounded-full">
                                                {flag}
                                            </span>
                                        ))}
                                    </div>
                                </div>
                            )}

                            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                                <div className="flex items-center space-x-4 text-sm text-gray-600">
                                    <div>
                                        User Notified: {job.userNotified ?
                                            <span className="text-green-600">Yes</span> :
                                            <span className="text-red-600">No</span>
                                        }
                                    </div>
                                </div>

                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => {
                                            setSelectedJob(job);
                                            setShowDetailsModal(true);
                                        }}
                                        className="flex items-center px-3 py-1 bg-blue-600 text-white text-sm rounded-md hover:bg-blue-700 transition-colors"
                                    >
                                        <Eye className="h-4 w-4 mr-1" />
                                        Details
                                    </button>

                                    {job.processingStatus === 'failed' && (
                                        <button
                                            onClick={() => handleRetryProcessing(job._id)}
                                            className="flex items-center px-3 py-1 bg-orange-600 text-white text-sm rounded-md hover:bg-orange-700 transition-colors"
                                        >
                                            <RefreshCw className="h-4 w-4 mr-1" />
                                            Retry
                                        </button>
                                    )}

                                    {job.mergedReportId && (
                                        <button className="flex items-center px-3 py-1 bg-green-600 text-white text-sm rounded-md hover:bg-green-700 transition-colors">
                                            <Download className="h-4 w-4 mr-1" />
                                            Download
                                        </button>
                                    )}
                                </div>
                            </div>
                        </div>
                    ))
                )}
            </div>

            {/* Details Modal */}
            {showDetailsModal && selectedJob && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                        <div className="p-6 border-b border-gray-200">
                            <h3 className="text-lg font-semibold text-gray-900">
                                Processing Job Details
                            </h3>
                            <p className="text-sm text-gray-600 mt-1">
                                Policy: {selectedJob.policyId} • {selectedJob.policyDetails.userName}
                            </p>
                        </div>

                        <div className="p-6 max-h-[60vh] overflow-y-auto">
                            <div className="space-y-4">
                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Processing Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Status:</span>
                                            <span className={`text-sm font-medium ${selectedJob.processingStatus === 'completed' ? 'text-green-600' :
                                                selectedJob.processingStatus === 'failed' ? 'text-red-600' :
                                                    'text-blue-600'
                                                }`}>
                                                {selectedJob.processingStatus.toUpperCase()}
                                            </span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">Started:</span>
                                            <span className="text-sm text-gray-900">
                                                {new Date(selectedJob.processingStartedAt).toLocaleString()}
                                            </span>
                                        </div>
                                        {selectedJob.processingCompletedAt && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Completed:</span>
                                                <span className="text-sm text-gray-900">
                                                    {new Date(selectedJob.processingCompletedAt).toLocaleString()}
                                                </span>
                                            </div>
                                        )}
                                        {selectedJob.processingDuration && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Duration:</span>
                                                <span className="text-sm text-gray-900">
                                                    {formatDuration(selectedJob.processingDuration)}
                                                </span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                <div>
                                    <h4 className="font-medium text-gray-900 mb-2">Report Information</h4>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">AMMC Report:</span>
                                            <span className="text-sm text-gray-900">{selectedJob.ammcReportId}</span>
                                        </div>
                                        <div className="flex justify-between">
                                            <span className="text-sm text-gray-600">NIA Report:</span>
                                            <span className="text-sm text-gray-900">{selectedJob.niaReportId}</span>
                                        </div>
                                        {selectedJob.mergedReportId && (
                                            <div className="flex justify-between">
                                                <span className="text-sm text-gray-600">Merged Report:</span>
                                                <span className="text-sm text-gray-900">{selectedJob.mergedReportId}</span>
                                            </div>
                                        )}
                                    </div>
                                </div>

                                {selectedJob.conflictDetected && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Conflict Information</h4>
                                        <div className="bg-orange-50 p-4 rounded-lg">
                                            <div className="flex justify-between mb-2">
                                                <span className="text-sm text-gray-600">Severity:</span>
                                                <span className={`text-sm font-medium ${selectedJob.conflictSeverity === 'high' ? 'text-red-600' :
                                                    selectedJob.conflictSeverity === 'medium' ? 'text-yellow-600' :
                                                        'text-green-600'
                                                    }`}>
                                                    {selectedJob.conflictSeverity?.toUpperCase()}
                                                </span>
                                            </div>
                                            {selectedJob.conflictFlags && (
                                                <div>
                                                    <p className="text-sm text-gray-600 mb-2">Detected Issues:</p>
                                                    <ul className="list-disc list-inside space-y-1">
                                                        {selectedJob.conflictFlags.map((flag, index) => (
                                                            <li key={index} className="text-sm text-gray-700">{flag}</li>
                                                        ))}
                                                    </ul>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                )}

                                {selectedJob.errorMessage && (
                                    <div>
                                        <h4 className="font-medium text-gray-900 mb-2">Error Details</h4>
                                        <div className="bg-red-50 p-4 rounded-lg">
                                            <p className="text-sm text-red-800">{selectedJob.errorMessage}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        </div>

                        <div className="p-6 border-t border-gray-200 flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDetailsModal(false);
                                    setSelectedJob(null);
                                }}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
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

export default ProcessingMonitorPage;