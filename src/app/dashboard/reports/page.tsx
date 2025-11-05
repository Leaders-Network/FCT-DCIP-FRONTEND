'use client';

import React, { useState, useEffect } from 'react';
import { userReportAPI } from '@/services/api';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Download, Eye, Clock, CheckCircle, AlertTriangle, FileText } from 'lucide-react';
// Using alert for notifications to match existing codebase

interface UserReport {
    reportId: string;
    policyId: string;
    propertyAddress: string;
    propertyType: string;
    status: string;
    createdAt: string;
    downloadCount: number;
    canDownload: boolean;
}

interface ReportDetails {
    reportId: string;
    policyId: string;
    propertyDetails: any;
    status: string;
    finalRecommendation: string;
    paymentEnabled: boolean;
    conflictDetected: boolean;
    conflictResolved: boolean;
    conflictDetails?: any;
    reportSections: {
        ammc: any;
        nia: any;
    };
    mergingMetadata: any;
    createdAt: string;
    releasedAt: string;
    downloadCount: number;
    canDownload: boolean;
}

export default function UserReportsPage() {
    const [reports, setReports] = useState<UserReport[]>([]);
    const [selectedReport, setSelectedReport] = useState<ReportDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [detailsLoading, setDetailsLoading] = useState(false);
    const [currentPage, setCurrentPage] = useState(1);
    const [totalPages, setTotalPages] = useState(1);

    useEffect(() => {
        fetchReports();
    }, [currentPage]);

    const fetchReports = async () => {
        try {
            setLoading(true);
            const response = await userReportAPI.getUserReports(currentPage, 10);

            if (response.success) {
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

    const viewReportDetails = async (reportId: string) => {
        try {
            setDetailsLoading(true);
            const response = await userReportAPI.getReportDetails(reportId);

            if (response.success) {
                setSelectedReport(response.data);
            } else {
                alert('Failed to fetch report details');
            }
        } catch (error) {
            console.error('Error fetching report details:', error);
            alert('Failed to fetch report details');
        } finally {
            setDetailsLoading(false);
        }
    };

    const downloadReport = async (reportId: string) => {
        try {
            const response = await userReportAPI.downloadReport(reportId);

            if (response.success) {
                alert('Report downloaded successfully');
                // Refresh the reports list to update download count
                fetchReports();
            } else {
                alert('Failed to download report');
            }
        } catch (error) {
            console.error('Error downloading report:', error);
            alert('Failed to download report');
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'released':
                return <Badge className="bg-green-100 text-green-800"><CheckCircle className="w-3 h-3 mr-1" />Released</Badge>;
            case 'pending':
                return <Badge className="bg-yellow-100 text-yellow-800"><Clock className="w-3 h-3 mr-1" />Processing</Badge>;
            case 'withheld':
                return <Badge className="bg-red-100 text-red-800"><AlertTriangle className="w-3 h-3 mr-1" />Under Review</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{status}</Badge>;
        }
    };

    const getRecommendationBadge = (recommendation: string) => {
        switch (recommendation) {
            case 'approve':
                return <Badge className="bg-green-100 text-green-800">Approved</Badge>;
            case 'reject':
                return <Badge className="bg-red-100 text-red-800">Rejected</Badge>;
            case 'request_more_info':
                return <Badge className="bg-yellow-100 text-yellow-800">More Info Required</Badge>;
            default:
                return <Badge className="bg-gray-100 text-gray-800">{recommendation}</Badge>;
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
                <h1 className="text-2xl font-bold text-gray-900 mb-2">My Assessment Reports</h1>
                <p className="text-gray-600">View and download your property assessment reports</p>
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
                <div className="grid gap-6">
                    {/* Reports List */}
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
                                                {getStatusBadge(report.status)}
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
                                        </div>

                                        <div className="flex gap-2 ml-4">
                                            <Button
                                                variant="outline"
                                                size="sm"
                                                onClick={() => viewReportDetails(report.reportId)}
                                                disabled={detailsLoading}
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View
                                            </Button>

                                            {report.canDownload && (
                                                <Button
                                                    size="sm"
                                                    onClick={() => downloadReport(report.reportId)}
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Download
                                                </Button>
                                            )}
                                        </div>
                                    </div>
                                </CardContent>
                            </Card>
                        ))}
                    </div>

                    {/* Pagination */}
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

            {/* Report Details Modal */}
            {selectedReport && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6 border-b">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Assessment Report Details</h2>
                                <Button
                                    variant="outline"
                                    onClick={() => setSelectedReport(null)}
                                >
                                    Close
                                </Button>
                            </div>
                        </div>

                        <div className="p-6 space-y-6">
                            {/* Report Summary */}
                            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Final Recommendation</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        {getRecommendationBadge(selectedReport.finalRecommendation)}
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Payment Status</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <Badge className={selectedReport.paymentEnabled ? "bg-green-100 text-green-800" : "bg-yellow-100 text-yellow-800"}>
                                            {selectedReport.paymentEnabled ? "Enabled" : "Pending"}
                                        </Badge>
                                    </CardContent>
                                </Card>

                                <Card>
                                    <CardHeader className="pb-2">
                                        <CardTitle className="text-sm">Quality Score</CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <span className="text-lg font-semibold">
                                            {selectedReport.mergingMetadata?.qualityScore || 'N/A'}%
                                        </span>
                                    </CardContent>
                                </Card>
                            </div>

                            {/* Conflict Information */}
                            {selectedReport.conflictDetected && (
                                <Card className="border-yellow-200">
                                    <CardHeader>
                                        <CardTitle className="text-yellow-800 flex items-center">
                                            <AlertTriangle className="w-5 h-5 mr-2" />
                                            Conflict Detected
                                        </CardTitle>
                                    </CardHeader>
                                    <CardContent>
                                        <div className="space-y-2">
                                            <p><strong>Type:</strong> {selectedReport.conflictDetails?.conflictType}</p>
                                            <p><strong>Severity:</strong> {selectedReport.conflictDetails?.conflictSeverity}</p>
                                            <p><strong>Status:</strong> {selectedReport.conflictResolved ? "Resolved" : "Under Review"}</p>
                                        </div>
                                    </CardContent>
                                </Card>
                            )}

                            {/* AMMC Report Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>AMMC Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <strong>Surveyor:</strong> {selectedReport.reportSections.ammc.surveyorName}
                                    </div>
                                    <div>
                                        <strong>Property Condition:</strong> {selectedReport.reportSections.ammc.propertyCondition}
                                    </div>
                                    <div>
                                        <strong>Estimated Value:</strong> ₦{selectedReport.reportSections.ammc.estimatedValue?.toLocaleString()}
                                    </div>
                                    <div>
                                        <strong>Recommendations:</strong> {selectedReport.reportSections.ammc.recommendations}
                                    </div>
                                </CardContent>
                            </Card>

                            {/* NIA Report Section */}
                            <Card>
                                <CardHeader>
                                    <CardTitle>NIA Assessment</CardTitle>
                                </CardHeader>
                                <CardContent className="space-y-3">
                                    <div>
                                        <strong>Surveyor:</strong> {selectedReport.reportSections.nia.surveyorName}
                                    </div>
                                    <div>
                                        <strong>Property Condition:</strong> {selectedReport.reportSections.nia.propertyCondition}
                                    </div>
                                    <div>
                                        <strong>Estimated Value:</strong> ₦{selectedReport.reportSections.nia.estimatedValue?.toLocaleString()}
                                    </div>
                                    <div>
                                        <strong>Recommendations:</strong> {selectedReport.reportSections.nia.recommendations}
                                    </div>
                                </CardContent>
                            </Card>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}