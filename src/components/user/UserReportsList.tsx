'use client';

import React, { useState, useEffect } from 'react';
import {
    FileText,
    Download,
    Eye,
    Calendar,
    MapPin,
    CheckCircle,
    Clock,
    AlertTriangle,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import { Badge } from '@/components/ui/badge';
import { UserReport, UserReportsResponse } from '@/types/api.types';

interface UserReportsListProps {
    refreshTrigger?: number;
}

const UserReportsList: React.FC<UserReportsListProps> = ({ refreshTrigger }) => {
    const [reports, setReports] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [page, setPage] = useState(1);
    const [hasMore, setHasMore] = useState(true);

    useEffect(() => {
        fetchReports();
    }, [refreshTrigger]);

    const fetchReports = async (pageNum = 1) => {
        try {
            setLoading(pageNum === 1);

            const { userReportAPI } = await import('@/services/api');
            const response: UserReportsResponse = await userReportAPI.getUserReports(pageNum, 10);

            if (response.success && response.data) {
                const formattedReports: UserReport[] = response.data.reports.map((report: UserReport) => ({
                    _id: report._id || report.reportId,
                    reportId: report.reportId,
                    policyId: report.policyId,
                    propertyAddress: report.propertyAddress,
                    propertyType: report.propertyType,
                    status: report.status,
                    createdAt: report.createdAt,
                    downloadCount: report.downloadCount,
                    canDownload: report.canDownload,
                    isMerged: report.isMerged || false,
                    finalRecommendation: report.finalRecommendation,
                    paymentEnabled: report.paymentEnabled || false,
                    conflictDetected: report.conflictDetected || false
                }));

                if (pageNum === 1) {
                    setReports(formattedReports);
                } else {
                    setReports(prev => [...prev, ...formattedReports]);
                }

                setHasMore(response.data.pagination.currentPage < response.data.pagination.totalPages);
                setError(null);
            } else {
                throw new Error(response.message || 'Failed to fetch reports');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleLoadMore = () => {
        const nextPage = page + 1;
        setPage(nextPage);
        fetchReports(nextPage);
    };

    const getStatusIcon = (status: UserReport['status'], conflictDetected: boolean) => {
        if (status === 'released') {
            return conflictDetected ?
                <AlertTriangle className="w-5 h-5 text-yellow-500" /> :
                <CheckCircle className="w-5 h-5 text-green-500" />;
        } else if (status === 'withheld') {
            return <AlertTriangle className="w-5 h-5 text-red-500" />;
        } else {
            return <Clock className="w-5 h-5 text-blue-500" />;
        }
    };

    const getStatusColor = (status: UserReport['status'], conflictDetected: boolean) => {
        if (status === 'released') {
            return conflictDetected ? 'bg-yellow-100 text-yellow-800' : 'bg-green-100 text-green-800';
        } else if (status === 'withheld') {
            return 'bg-red-100 text-red-800';
        } else {
            return 'bg-blue-100 text-blue-800';
        }
    };

    const getStatusText = (status: UserReport['status'], conflictDetected: boolean) => {
        if (status === 'released') {
            if (conflictDetected) {
                return 'Released with Conflicts';
            } else {
                return 'Available';
            }
        } else if (status === 'withheld') {
            return 'Under Review';
        } else {
            return 'Processing';
        }
    };

    const getRecommendationColor = (recommendation: string) => {
        switch (recommendation) {
            case 'approve':
                return 'bg-green-100 text-green-800';
            case 'reject':
                return 'bg-red-100 text-red-800';
            case 'request_more_info':
                return 'bg-yellow-100 text-yellow-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading && reports.length === 0) {
        return (
            <div className="space-y-4">
                {[...Array(3)].map((_, index) => (
                    <div key={index} className="bg-white rounded-lg shadow-sm border p-6 animate-pulse">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                <div className="w-10 h-10 bg-gray-300 rounded"></div>
                                <div>
                                    <div className="h-4 bg-gray-300 rounded w-32 mb-2"></div>
                                    <div className="h-3 bg-gray-300 rounded w-24"></div>
                                </div>
                            </div>
                            <div className="h-8 bg-gray-300 rounded w-20"></div>
                        </div>
                        <div className="h-3 bg-gray-300 rounded w-3/4 mb-2"></div>
                        <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                    </div>
                ))}
            </div>
        );
    }

    if (error && reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-6 text-center">
                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-red-800 mb-2">Error Loading Reports</h3>
                <p className="text-red-600 mb-4">{error}</p>
                <button
                    onClick={() => fetchReports()}
                    className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                >
                    Try Again
                </button>
            </div>
        );
    }

    if (reports.length === 0) {
        return (
            <div className="bg-white rounded-lg shadow-sm border p-8 text-center">
                <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-semibold text-gray-900 mb-2">No Reports Available</h3>
                <p className="text-gray-600">
                    Your property assessment reports will appear here once they are completed and released.
                </p>
            </div>
        );
    }

    return (
        <div className="space-y-4">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Your Assessment Reports</h2>
                <button
                    onClick={() => fetchReports()}
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Refresh</span>
                </button>
            </div>

            <div className="space-y-4">
                {reports.map((report) => (
                    <div key={report.reportId} className="bg-white rounded-lg shadow-sm border p-6">
                        <div className="flex items-center justify-between mb-4">
                            <div className="flex items-center space-x-3">
                                {getStatusIcon(report.status, report.conflictDetected || false)}
                                <div>
                                    <div className="flex items-center">
                                        <h3 className="font-medium text-gray-900">Policy {report.policyId}</h3>
                                        {report.isMerged && <Badge className="ml-2 bg-blue-100 text-blue-800">Merged</Badge>}
                                    </div>
                                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                                        <MapPin className="w-4 h-4" />
                                        <span>{report.propertyAddress}</span>
                                    </div>
                                </div>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className={`px-2 py-1 rounded-full text-xs font-medium ${getStatusColor(report.status, report.conflictDetected || false)}`}>
                                    {getStatusText(report.status, report.conflictDetected || false)}
                                </span>

                                {report.finalRecommendation && (
                                    <span className={`px-2 py-1 rounded-full text-xs font-medium ${getRecommendationColor(report.finalRecommendation)}`}>
                                        {report.finalRecommendation.replace('_', ' ').toUpperCase()}
                                    </span>
                                )}
                            </div>
                        </div>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm text-gray-600 mb-4">
                            <div className="flex items-center space-x-2">
                                <Calendar className="w-4 h-4" />
                                <span>Created: {new Date(report.createdAt).toLocaleDateString()}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span>Downloads: {report.downloadCount}</span>
                            </div>

                            <div className="flex items-center space-x-2">
                                <span className={`inline-flex items-center space-x-1 ${report.paymentEnabled ? 'text-green-600' : 'text-yellow-600'}`}>
                                    {report.paymentEnabled ? <CheckCircle className="w-4 h-4" /> : <Clock className="w-4 h-4" />}
                                    <span>Payment {report.paymentEnabled ? 'Enabled' : 'Pending'}</span>
                                </span>
                            </div>
                        </div>

                        {/* Conflict indicator */}
                        {report.conflictDetected && (
                            <div className="mb-4 p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
                                <div className="flex items-center space-x-2">
                                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                                    <span className="text-sm font-medium text-yellow-800">
                                        Conflicts Detected
                                    </span>
                                </div>
                                <p className="text-sm text-yellow-700 mt-1">
                                    Differences between surveyor assessments were detected and noted in the report.
                                </p>
                            </div>
                        )}

                        {/* Actions */}
                        <div className="flex items-center justify-between pt-4 border-t">
                            <div className="text-sm text-gray-500">
                                Report ID: {report.reportId}
                            </div>

                            <div className="flex items-center space-x-3">
                                {report.canDownload && (
                                    <>
                                        <Link
                                            href={`/user/dashboard/reports/${report.reportId}`}
                                            className="inline-flex items-center space-x-1 text-sm text-blue-600 hover:text-blue-800"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Report</span>
                                        </Link>

                                        <button
                                            onClick={async () => {
                                                try {
                                                    const { userReportAPI } = await import('@/services/api');
                                                    const response = await userReportAPI.downloadReport((report.reportId || report._id) as string);

                                                    if (response.success) {
                                                        // For now, just show success message
                                                        // In future, this would trigger actual PDF download
                                                        alert('Report download initiated successfully!');
                                                        // Refresh the reports list to update download count
                                                        fetchReports();
                                                    } else {
                                                        alert('Failed to download report: ' + response.message);
                                                    }
                                                } catch (error) {
                                                    console.error('Download failed:', error);
                                                    alert('Failed to download report. Please try again.');
                                                }
                                            }}
                                            className="inline-flex items-center space-x-1 text-sm text-green-600 hover:text-green-800"
                                        >
                                            <Download className="w-4 h-4" />
                                            <span>Download</span>
                                        </button>
                                    </>
                                )}

                                {report.paymentEnabled && (
                                    <button className="px-3 py-1 bg-green-600 text-white text-sm rounded hover:bg-green-700">
                                        Pay Now
                                    </button>
                                )}

                                {!report.canDownload && (
                                    <span className="text-sm text-gray-500">
                                        {report.status === 'pending' ? 'Processing...' : 'Under Review'}
                                    </span>
                                )}
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Load more button */}
            {hasMore && (
                <div className="text-center pt-4">
                    <button
                        onClick={handleLoadMore}
                        disabled={loading}
                        className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                    >
                        {loading ? 'Loading...' : 'Load More Reports'}
                    </button>
                </div>
            )}
        </div>
    );
};

export default UserReportsList;
