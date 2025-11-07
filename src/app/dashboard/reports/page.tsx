'use client';

import React, { useState, useEffect } from 'react';
import { userReportAPI } from '@/services/api';
import { UserReport } from '@/types/api.types';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle, FileText, RefreshCw } from 'lucide-react';
import MergedReportDetailsModal from '@/components/user/MergedReportDetailsModal';

export default function UserReportsPage() {
    const [reports, setReports] = useState<UserReport[]>([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);
    const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
    const [isModalOpen, setIsModalOpen] = useState(false);
    const [summary, setSummary] = useState<{
        totalReports: number;
        releasedReports: number;
        pendingReports: number;
        withheldReports: number;
        completedReports: number;
    } | null>(null);

    useEffect(() => {
        fetchReports();
        fetchSummary();
    }, [currentPage]);

    const fetchSummary = async () => {
        try {
            const response = await userReportAPI.getReportSummary();
            if (response.success) {
                setSummary(response.data);
            }
        } catch (error) {
            console.error('Error fetching summary:', error);
        }
    };

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await userReportAPI.getUserReports(currentPage, 10);

            if (response.success && response.data) {
                setReports(response.data.reports);
                setTotalPages(response.data.pagination.totalPages);
            } else {
                alert('Failed to fetch reports');
            }
        } catch (error) {
            console.error('Error fetching reports:', error);
            alert('Failed to fetch reports');
        } finally {
            setLoading(false);
        }
    };



    const handleViewDetails = (reportId: string) => {
        setSelectedReportId(reportId);
        setIsModalOpen(true);
    };

    const handleCloseModal = () => {
        setIsModalOpen(false);
        setSelectedReportId(null);
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
            <div className="container mx-auto p-6">
                <div className="flex items-center justify-center h-64">
                    <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                </div>
            </div>
        );
    }

    return (
        <div className="container mx-auto p-6">
            <div className="mb-6">
                <div className="flex items-center justify-between mb-2">
                    <h1 className="text-2xl font-bold text-gray-900">My Assessment Reports</h1>
                    <Button onClick={() => { fetchReports(); fetchSummary(); }} variant="outline" size="sm">
                        <RefreshCw className="w-4 h-4 mr-1" />
                        Refresh
                    </Button>
                </div>
                <p className="text-gray-600">View and download your property assessment reports</p>

                {summary && (
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-4">
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-blue-600">{summary.totalReports}</div>
                            <div className="text-sm text-blue-800">Total Reports</div>
                        </div>
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-green-600">{summary.completedReports}</div>
                            <div className="text-sm text-green-800">Completed</div>
                        </div>
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-yellow-600">{summary.pendingReports}</div>
                            <div className="text-sm text-yellow-800">Pending</div>
                        </div>
                        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                            <div className="text-2xl font-bold text-red-600">{summary.withheldReports}</div>
                            <div className="text-sm text-red-800">Under Review</div>
                        </div>
                    </div>
                )}
            </div>

            {reports.length === 0 ? (
                <Card>
                    <CardContent className="text-center py-12">
                        <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h3 className="text-lg font-medium text-gray-900 mb-2">No Reports Available</h3>
                        <p className="text-gray-600">Your assessment reports will appear here once they are completed.</p>
                    </CardContent>
                </Card>
            ) : (
                <div className="space-y-6">
                    <div className="grid gap-4">
                        {reports.map((report) => (
                            <Card key={report.reportId} className="hover:shadow-md transition-shadow">
                                <CardContent className="p-6">
                                    <div className="flex items-center justify-between">
                                        <div className="flex-1">
                                            <div className="flex items-center gap-3 mb-2">
                                                <h3 className="font-semibold text-gray-900">
                                                    {report.propertyAddress}
                                                </h3>
                                                {report.isMerged && (
                                                    <Badge className="bg-blue-100 text-blue-800">
                                                        <FileText className="w-3 h-3 mr-1" />
                                                        Merged Report
                                                    </Badge>
                                                )}
                                                {getStatusBadge(report.status)}
                                                {report.conflictDetected && (
                                                    <Badge className="bg-orange-100 text-orange-800">
                                                        <AlertTriangle className="w-3 h-3 mr-1" />
                                                        Conflict
                                                    </Badge>
                                                )}
                                            </div>

                                            <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                                                <div>
                                                    <span className="font-medium">Policy ID:</span>
                                                    <br />
                                                    {report.policyId.substring(0, 8)}...
                                                </div>
                                                <div>
                                                    <span className="font-medium">Property Type:</span>
                                                    <br />
                                                    {report.propertyType}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Created:</span>
                                                    <br />
                                                    {new Date(report.createdAt).toLocaleDateString()}
                                                </div>
                                                <div>
                                                    <span className="font-medium">Downloads:</span>
                                                    <br />
                                                    {report.downloadCount}
                                                </div>
                                            </div>

                                            {report.isMerged && (
                                                <div className="mt-3 p-3 bg-blue-50 border border-blue-200 rounded">
                                                    <h4 className="font-medium text-blue-900 mb-1">Dual Surveyor Assessment</h4>
                                                    <p className="text-sm text-blue-800">
                                                        This report combines assessments from both AMMC and NIA surveyors,
                                                        including risk factors, property conditions, and recommendations.
                                                    </p>
                                                    {report.finalRecommendation && (
                                                        <div className="mt-2">
                                                            <span className="text-sm font-medium text-blue-900">Final Recommendation: </span>
                                                            <Badge className={
                                                                report.finalRecommendation === 'approve' ? 'bg-green-100 text-green-800' :
                                                                    report.finalRecommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                                                        'bg-yellow-100 text-yellow-800'
                                                            }>
                                                                {report.finalRecommendation.replace('_', ' ').toUpperCase()}
                                                            </Badge>
                                                        </div>
                                                    )}
                                                </div>
                                            )}
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => handleViewDetails(report.reportId)}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Details
                                            </Button>
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {totalPages > 1 && (
                        <div className="flex justify-center gap-2">
                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.max(1, prev - 1))}
                                disabled={currentPage === 1}
                            >
                                Previous
                            </Button>

                            <span className="flex items-center px-4 py-2 text-sm text-gray-600">
                                Page {currentPage} of {totalPages}
                            </span>

                            <Button
                                variant="outline"
                                onClick={() => setCurrentPage(prev => Math.min(totalPages, prev + 1))}
                                disabled={currentPage === totalPages}
                            >
                                Next
                            </Button>
                        </div>
                    )}
                </div>
            )}

            {selectedReportId && (
                <MergedReportDetailsModal
                    reportId={selectedReportId}
                    isOpen={isModalOpen}
                    onClose={handleCloseModal}
                />
            )}
        </div>
    );
}