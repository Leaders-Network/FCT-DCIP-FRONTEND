'use client';

import React, { useState, useEffect } from 'react';
import { Clock, CheckCircle, AlertCircle, Download, RefreshCw, Eye } from 'lucide-react';
import { ConflictDetails } from '@/types/api.types';

interface ProcessingStatus {
    status: 'not_started' | 'awaiting_surveys' | 'processing' | 'processing_delayed' | 'under_review' | 'completed' | 'unknown';
    message: string;
    progress?: number;
    estimatedCompletion?: string;
    processingProgress?: number;
    conflictDetails?: ConflictDetails;
    completedAt?: string;
    reportId?: string;
}

interface ReportProcessingStatusProps {
    policyId: string;
    onReportReady?: (reportId: string) => void;
    refreshInterval?: number;
}

const ReportProcessingStatus: React.FC<ReportProcessingStatusProps> = ({
    policyId,
    onReportReady,
    refreshInterval = 30000 // 30 seconds default
}) => {
    const [status, setStatus] = useState<ProcessingStatus | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [lastUpdated, setLastUpdated] = useState<Date>(new Date());

    const fetchStatus = async () => {
        try {
            const response = await fetch(`/api/v1/report-release/status/${policyId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch processing status');
            }

            const data = await response.json();
            setStatus(data.data);
            setError(null);
            setLastUpdated(new Date());

            // Notify parent if report is ready
            if (data.data.status === 'completed' && data.data.reportId && onReportReady) {
                onReportReady(data.data.reportId);
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchStatus();

        // Set up polling for active statuses
        let interval: NodeJS.Timeout | null = null;

        if (status?.status && ['awaiting_surveys', 'processing', 'processing_delayed'].includes(status.status)) {
            interval = setInterval(fetchStatus, refreshInterval);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [policyId, status?.status, refreshInterval]);

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'not_started':
                return <Clock className="w-5 h-5 text-gray-500" />;
            case 'awaiting_surveys':
                return <Clock className="w-5 h-5 text-blue-500" />;
            case 'processing':
                return <RefreshCw className="w-5 h-5 text-blue-500 animate-spin" />;
            case 'processing_delayed':
                return <AlertCircle className="w-5 h-5 text-orange-500" />;
            case 'under_review':
                return <Eye className="w-5 h-5 text-yellow-500" />;
            case 'completed':
                return <CheckCircle className="w-5 h-5 text-green-500" />;
            default:
                return <AlertCircle className="w-5 h-5 text-gray-500" />;
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'not_started':
                return 'bg-gray-100 text-gray-800';
            case 'awaiting_surveys':
                return 'bg-blue-100 text-blue-800';
            case 'processing':
                return 'bg-blue-100 text-blue-800';
            case 'processing_delayed':
                return 'bg-orange-100 text-orange-800';
            case 'under_review':
                return 'bg-yellow-100 text-yellow-800';
            case 'completed':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    const formatEstimatedTime = (estimatedCompletion: string) => {
        const now = new Date();
        const completion = new Date(estimatedCompletion);
        const diffMs = completion.getTime() - now.getTime();

        if (diffMs <= 0) {
            return 'Any moment now';
        }

        const diffMinutes = Math.ceil(diffMs / (1000 * 60));

        if (diffMinutes < 60) {
            return `~${diffMinutes} minute${diffMinutes !== 1 ? 's' : ''}`;
        }

        const diffHours = Math.ceil(diffMinutes / 60);
        return `~${diffHours} hour${diffHours !== 1 ? 's' : ''}`;
    };

    if (loading) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-5 h-5 bg-gray-300 rounded"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                    </div>
                    <div className="h-3 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 text-red-600">
                    <AlertCircle className="w-5 h-5" />
                    <span className="font-medium">Error loading status</span>
                </div>
                <p className="text-sm text-gray-600 mt-2">{error}</p>
                <button
                    onClick={fetchStatus}
                    className="mt-3 text-sm text-blue-600 hover:text-blue-800"
                >
                    Try again
                </button>
            </div>
        );
    }

    if (!status) {
        return null;
    }

    return (
        <div className="bg-white rounded-lg shadow-sm border p-6">
            <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-3">
                    {getStatusIcon(status.status)}
                    <div>
                        <h3 className="font-medium text-gray-900">Report Processing Status</h3>
                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(status.status)}`}>
                            {status.status.replace('_', ' ').toUpperCase()}
                        </span>
                    </div>
                </div>

                <div className="text-right">
                    <p className="text-xs text-gray-500">Last updated</p>
                    <p className="text-xs text-gray-700">{lastUpdated.toLocaleTimeString()}</p>
                </div>
            </div>

            <div className="space-y-4">
                <div>
                    <p className="text-sm text-gray-700">{status.message}</p>
                </div>

                {/* Progress bar for surveys */}
                {status.progress !== undefined && (
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Survey Progress</span>
                            <span>{status.progress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${status.progress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Processing progress bar */}
                {status.processingProgress !== undefined && (
                    <div>
                        <div className="flex justify-between text-sm text-gray-600 mb-1">
                            <span>Processing Progress</span>
                            <span>{status.processingProgress}%</span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                                className="bg-green-600 h-2 rounded-full transition-all duration-300"
                                style={{ width: `${status.processingProgress}%` }}
                            ></div>
                        </div>
                    </div>
                )}

                {/* Estimated completion time */}
                {status.estimatedCompletion && (
                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <Clock className="w-4 h-4" />
                        <span>Estimated completion: {formatEstimatedTime(status.estimatedCompletion)}</span>
                    </div>
                )}

                {/* Conflict details for under review status */}
                {status.status === 'under_review' && status.conflictDetails && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <div className="flex items-center space-x-2 mb-2">
                            <AlertCircle className="w-4 h-4 text-yellow-600" />
                            <span className="text-sm font-medium text-yellow-800">Manual Review Required</span>
                        </div>
                        <p className="text-sm text-yellow-700">
                            Conflicts were detected between surveyor reports and require manual review by administrators.
                            You will be notified once the review is complete.
                        </p>
                    </div>
                )}

                {/* Completed status with download option */}
                {status.status === 'completed' && status.reportId && (
                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <CheckCircle className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-medium text-green-800">Report Ready</span>
                            </div>
                            <button
                                onClick={() => window.location.href = `/user/dashboard/reports/${status.reportId}`}
                                className="inline-flex items-center space-x-1 text-sm text-green-700 hover:text-green-900"
                            >
                                <Download className="w-4 h-4" />
                                <span>View Report</span>
                            </button>
                        </div>
                        <p className="text-sm text-green-700 mt-1">
                            Your property assessment report is ready for download and review.
                        </p>
                    </div>
                )}

                {/* Auto-refresh indicator for active statuses */}
                {['awaiting_surveys', 'processing', 'processing_delayed'].includes(status.status) && (
                    <div className="flex items-center justify-center space-x-2 text-xs text-gray-500 pt-2 border-t">
                        <RefreshCw className="w-3 h-3" />
                        <span>Auto-refreshing every {refreshInterval / 1000} seconds</span>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ReportProcessingStatus;