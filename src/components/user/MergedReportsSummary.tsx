'use client';

import React, { useState, useEffect } from 'react';
import { userReportAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { toast } from 'sonner';
import {
    FileText,
    CheckCircle,
    Clock,
    AlertTriangle,
    Download,
    Eye,
    TrendingUp,
    DollarSign
} from 'lucide-react';
// Using alert for notifications to match existing codebase
import Link from 'next/link';
import { UserReport } from '@/types/api.types';

interface ReportSummary {
    totalReports: number;
    releasedReports: number;
    pendingReports: number;
    withheldReports: number;
    completedReports: number;
}

interface RecentReport {
    reportId?: string;
    policyId: string;
    propertyAddress?: string;
    propertyType?: string;
    status: string;
    finalRecommendation: string;
    paymentEnabled: boolean;
    conflictDetected: boolean;
    createdAt: string;
    canDownload: boolean;
}

const MergedReportsSummary: React.FC = () => {
    const [summary, setSummary] = useState<ReportSummary | null>(null);
    const [recentReports, setRecentReports] = useState<RecentReport[]>([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        fetchData();
    }, []);

    const fetchData = async () => {
        try {
            setLoading(true);

            // Fetch summary statistics
            const summaryResponse = await userReportAPI.getReportSummary();
            if (summaryResponse.success && summaryResponse.data) {
                setSummary(summaryResponse.data);
            }

            // Fetch recent reports (first 3)
            const reportsResponse = await userReportAPI.getUserReports(1, 3);
            if (reportsResponse.success && reportsResponse.data?.reports) {
                setRecentReports(reportsResponse.data.reports.map((report: UserReport) => ({
                    ...report,
                    reportId: (report.reportId || report._id) as string,
                    finalRecommendation: report.finalRecommendation || 'pending',
                    paymentEnabled: report.paymentEnabled || false,
                    conflictDetected: report.conflictDetected || false,
                    canDownload: report.canDownload || false
                })));
            }

        } catch (error) {
            console.error('Error fetching report data:', error);
            toast.error('Failed to load report summary');
        } finally {
            setLoading(false);
        }
    };

    const getStatusIcon = (status: string) => {
        switch (status) {
            case 'released':
                return <CheckCircle className="w-4 h-4 text-green-600" />;
            case 'pending':
                return <Clock className="w-4 h-4 text-yellow-600" />;
            case 'withheld':
                return <AlertTriangle className="w-4 h-4 text-red-600" />;
            default:
                return <FileText className="w-4 h-4 text-gray-600" />;
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'released':
                return <Badge className="bg-green-100 text-green-800">Released</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800">Processing</Badge>;
            case 'withheld':
                return <Badge className="bg-red-100 text-red-800">Under Review</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-200 rounded w-1/3 mb-4"></div>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                        {[...Array(4)].map((_, i) => (
                            <div key={i} className="h-24 bg-gray-200 rounded"></div>
                        ))}
                    </div>
                    <div className="h-48 bg-gray-200 rounded"></div>
                </div>
            </div>
        );
    }

    if (!summary) {
        return null;
    }

    return (
        <div className="space-y-6">
            <div className="flex items-center justify-between">
                <h2 className="text-xl font-semibold text-gray-900">Assessment Reports</h2>
                <Link href="/dashboard/reports">
                    <Button variant="outline" size="sm">
                        View All Reports
                    </Button>
                </Link>
            </div>

            {/* Summary Statistics */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Total Reports</p>
                                <p className="text-2xl font-bold text-gray-900">{summary.totalReports}</p>
                            </div>
                            <FileText className="w-8 h-8 text-blue-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Released</p>
                                <p className="text-2xl font-bold text-green-600">{summary.releasedReports}</p>
                            </div>
                            <CheckCircle className="w-8 h-8 text-green-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Processing</p>
                                <p className="text-2xl font-bold text-yellow-600">{summary.pendingReports}</p>
                            </div>
                            <Clock className="w-8 h-8 text-yellow-600" />
                        </div>
                    </CardContent>
                </Card>

                <Card>
                    <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                            <div>
                                <p className="text-sm text-gray-600">Under Review</p>
                                <p className="text-2xl font-bold text-red-600">{summary.withheldReports}</p>
                            </div>
                            <AlertTriangle className="w-8 h-8 text-red-600" />
                        </div>
                    </CardContent>
                </Card>
            </div>

            {/* Recent Reports */}
            {recentReports.length > 0 && (
                <Card>
                    <CardHeader>
                        <CardTitle className="text-lg">Recent Reports</CardTitle>
                    </CardHeader>
                    <CardContent>
                        <div className="space-y-4">
                            {recentReports.map((report) => (
                                <div key={report.reportId} className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                                    <div className="flex items-center space-x-4">
                                        {getStatusIcon(report.status)}
                                        <div>
                                            <h4 className="font-medium text-gray-900">
                                                {report.propertyAddress}
                                            </h4>
                                            <div className="flex items-center space-x-2 mt-1">
                                                {getStatusBadge(report.status)}
                                                {report.conflictDetected && (
                                                    <Badge className="bg-yellow-100 text-yellow-800">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        Conflict
                                                    </Badge>
                                                )}
                                                {report.paymentEnabled && (
                                                    <Badge className="bg-green-100 text-green-800">
                                                        <DollarSign className="w-3 h-3 mr-1" />
                                                        Payment Ready
                                                    </Badge>
                                                )}
                                            </div>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Created: {new Date(report.createdAt).toLocaleDateString()}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="flex space-x-2">
                                        <Link href={`/dashboard/reports?reportId=${report.reportId}`}>
                                            <Button variant="outline" size="sm">
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>
                                        </Link>
                                        {report.canDownload && (
                                            <Button size="sm">
                                                <Download className="w-4 h-4 mr-1" />
                                                Download
                                            </Button>
                                        )}
                                    </div>
                                </div>
                            ))}
                        </div>

                        {recentReports.length === 3 && (
                            <div className="mt-4 text-center">
                                <Link href="/dashboard/reports">
                                    <Button variant="outline">
                                        View All {summary.totalReports} Reports
                                    </Button>
                                </Link>
                            </div>
                        )}
                    </CardContent>
                </Card>
            )}

            {/* No Reports State */}
            {summary.totalReports === 0 && (
                <Card>
                    <CardContent className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Yet</h3>
                        <p className="text-gray-600 mb-4">
                            Your property assessment reports will appear here once surveys are completed and processed.
                        </p>
                        <Link href="/dashboard/insurance">
                            <Button>
                                View My Policies
                            </Button>
                        </Link>
                    </CardContent>
                </Card>
            )}
        </div>
    );
};

export default React.memo(MergedReportsSummary);