'use client';

import React, { useState, useEffect } from 'react';
import {
    Download,
    Eye,
    AlertTriangle,
    CheckCircle,
    Clock,
    FileText,
    Calendar,
    MapPin,
    User,
    Building
} from 'lucide-react';

interface ReportData {
    reportId: string;
    policyId: string;
    releaseStatus: string;
    releasedAt: string;
    finalRecommendation: string;
    paymentEnabled: boolean;
    conflictDetected: boolean;
    conflictResolved: boolean;
    conflictDetails?: {
        conflictType: string;
        conflictSeverity: string;
        ammcRecommendation: string;
        niaRecommendation: string;
        ammcValue?: number;
        niaValue?: number;
        discrepancyPercentage?: number;
    };
    reportSections: {
        ammc: {
            propertyCondition: string;
            structuralAssessment: string;
            riskFactors: string;
            recommendations: string;
            estimatedValue: number;
            surveyorName: string;
            surveyorLicense: string;
            submissionDate: string;
            photos: Array<{
                url: string;
                description: string;
                timestamp: string;
            }>;
        };
        nia: {
            propertyCondition: string;
            structuralAssessment: string;
            riskFactors: string;
            recommendations: string;
            estimatedValue: number;
            surveyorName: string;
            surveyorLicense: string;
            submissionDate: string;
            photos: Array<{
                url: string;
                description: string;
                timestamp: string;
            }>;
        };
    };
    mergingMetadata: {
        mergedAt: string;
        processingTime: number;
        qualityScore: number;
    };
    isMerged: boolean;
}

interface IndividualReportData extends Omit<ReportData, 'reportSections' | 'mergingMetadata' | 'conflictDetails'> {
    propertyDetails: any;
}

interface ReportViewerProps {
    reportId: string;
}

const ReportViewer: React.FC<ReportViewerProps> = ({ reportId }) => {
    const [report, setReport] = useState<ReportData | IndividualReportData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [downloading, setDownloading] = useState(false);

    useEffect(() => {
        fetchReport();
    }, [reportId]);

    const fetchReport = async () => {
        try {
            const { userReportAPI } = await import('@/services/api');
            const response = await userReportAPI.getReportDetails(reportId);

            if (response.success) {
                setReport(response.data);
            } else {
                throw new Error(response.message || 'Failed to fetch report');
            }
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleDownload = async () => {
        try {
            setDownloading(true);

            const response = await fetch(`/api/v1/report-release/download/${reportId}`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to initiate download');
            }

            const data = await response.json();

            // Open download URL in new tab
            window.open(data.data.downloadUrl, '_blank');

        } catch (err) {
            console.error('Download failed:', err);
            alert('Download failed. Please try again.');
        } finally {
            setDownloading(false);
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

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    if (loading) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="animate-pulse space-y-6">
                    <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="h-64 bg-gray-300 rounded"></div>
                        <div className="h-64 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="max-w-6xl mx-auto p-6">
                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-lg font-semibold text-red-800 mb-2">Error Loading Report</h2>
                    <p className="text-red-600">{error}</p>
                    <button
                        onClick={fetchReport}
                        className="mt-4 px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    if (!report) {
        return null;
    }

    if (report.isMerged) {
        const mergedReport = report as ReportData;
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Property Assessment Report</h1>
                            <p className="text-gray-600">Report ID: {mergedReport.reportId}</p>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className={`px-3 py-1 rounded-full text-sm font-medium ${getRecommendationColor(mergedReport.finalRecommendation)}`}>
                                {mergedReport.finalRecommendation.replace('_', ' ').toUpperCase()}
                            </span>
                            <button
                                onClick={handleDownload}
                                disabled={downloading}
                                className="inline-flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
                            >
                                <Download className="w-4 h-4" />
                                <span>{downloading ? 'Downloading...' : 'Download PDF'}</span>
                            </button>
                        </div>
                    </div>

                    {/* Report metadata */}
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        <div className="flex items-center space-x-2">
                            <Calendar className="w-4 h-4 text-gray-500" />
                            <span>Released: {new Date(mergedReport.releasedAt).toLocaleDateString()}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <Clock className="w-4 h-4 text-gray-500" />
                            <span>Processing: {mergedReport.mergingMetadata.processingTime}ms</span>
                        </div>
                        <div className="flex items-center space-x-2">
                            <CheckCircle className="w-4 h-4 text-gray-500" />
                            <span>Quality Score: {mergedReport.mergingMetadata.qualityScore}%</span>
                        </div>
                    </div>

                    {/* Payment status */}
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-2">
                                <span className="font-medium">Payment Status:</span>
                                <span className={`px-2 py-1 rounded text-sm ${mergedReport.paymentEnabled ? 'bg-green-100 text-green-800' : 'bg-yellow-100 text-yellow-800'}`}>
                                    {mergedReport.paymentEnabled ? 'Enabled' : 'Pending Review'}
                                </span>
                            </div>
                            {mergedReport.paymentEnabled && (
                                <button className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700">
                                    Proceed to Payment
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Conflict indicator */}
                {mergedReport.conflictDetected && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-6">
                        <div className="flex items-center space-x-3 mb-3">
                            <AlertTriangle className="w-5 h-5 text-yellow-600" />
                            <h3 className="font-medium text-yellow-800">
                                {mergedReport.conflictResolved ? 'Conflicts Resolved' : 'Conflicts Detected'}
                            </h3>
                        </div>

                        {mergedReport.conflictDetails && (
                            <div className="space-y-2 text-sm">
                                <p className="text-yellow-700">
                                    <strong>Type:</strong> {mergedReport.conflictDetails.conflictType.replace('_', ' ')}
                                </p>
                                <p className="text-yellow-700">
                                    <strong>Severity:</strong> {mergedReport.conflictDetails.conflictSeverity}
                                </p>
                                {mergedReport.conflictDetails.discrepancyPercentage && (
                                    <p className="text-yellow-700">
                                        <strong>Discrepancy:</strong> {mergedReport.conflictDetails.discrepancyPercentage.toFixed(1)}%
                                    </p>
                                )}
                            </div>
                        )}

                        <p className="text-yellow-700 mt-2">
                            {mergedReport.conflictResolved
                                ? 'All conflicts have been reviewed and resolved by administrators.'
                                : 'Differences between surveyor assessments have been noted and are under review.'
                            }
                        </p>
                    </div>
                )}

                {/* Survey sections */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    {/* AMMC Section */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-blue-50 px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Building className="w-5 h-5 text-blue-600" />
                                    <div>
                                        <h3 className="font-semibold text-blue-900">AMMC Assessment</h3>
                                        <p className="text-sm text-blue-700">Abuja Municipal Area Council</p>
                                    </div>
                                </div>
                                <button className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200">
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{mergedReport.reportSections.ammc.surveyorName}</span>
                                </div>
                                <p className="text-sm text-gray-600">License: {mergedReport.reportSections.ammc.surveyorLicense}</p>
                                <p className="text-sm text-gray-600">
                                    Submitted: {new Date(mergedReport.reportSections.ammc.submissionDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Property Condition</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.ammc.propertyCondition}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Structural Assessment</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.ammc.structuralAssessment}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Risk Factors</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.ammc.riskFactors}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Recommendations</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.ammc.recommendations}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-medium mb-2">Estimated Value</h4>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(mergedReport.reportSections.ammc.estimatedValue)}
                                </p>
                            </div>

                            {mergedReport.reportSections.ammc.photos.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Photos ({mergedReport.reportSections.ammc.photos.length})</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {mergedReport.reportSections.ammc.photos.slice(0, 4).map((photo, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.description}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                                {index === 3 && mergedReport.reportSections.ammc.photos.length > 4 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                                        <span className="text-white text-sm">
                                                            +{mergedReport.reportSections.ammc.photos.length - 4} more
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* NIA Section */}
                    <div className="bg-white rounded-lg shadow-sm border">
                        <div className="bg-green-50 px-6 py-4 border-b">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Building className="w-5 h-5 text-green-600" />
                                    <div>
                                        <h3 className="font-semibold text-green-900">NIA Assessment</h3>
                                        <p className="text-sm text-green-700">Nigerian Institution of Architects</p>
                                    </div>
                                </div>
                                <button className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200">
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">{mergedReport.reportSections.nia.surveyorName}</span>
                                </div>
                                <p className="text-sm text-gray-600">License: {mergedReport.reportSections.nia.surveyorLicense}</p>
                                <p className="text-sm text-gray-600">
                                    Submitted: {new Date(mergedReport.reportSections.nia.submissionDate).toLocaleDateString()}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Property Condition</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.nia.propertyCondition}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Structural Assessment</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.nia.structuralAssessment}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Risk Factors</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.nia.riskFactors}</p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Recommendations</h4>
                                <p className="text-sm text-gray-700">{mergedReport.reportSections.nia.recommendations}</p>
                            </div>

                            <div className="bg-gray-50 p-4 rounded">
                                <h4 className="font-medium mb-2">Estimated Value</h4>
                                <p className="text-lg font-semibold text-green-600">
                                    {formatCurrency(mergedReport.reportSections.nia.estimatedValue)}
                                </p>
                            </div>

                            {mergedReport.reportSections.nia.photos.length > 0 && (
                                <div>
                                    <h4 className="font-medium mb-2">Photos ({mergedReport.reportSections.nia.photos.length})</h4>
                                    <div className="grid grid-cols-2 gap-2">
                                        {mergedReport.reportSections.nia.photos.slice(0, 4).map((photo, index) => (
                                            <div key={index} className="relative">
                                                <img
                                                    src={photo.url}
                                                    alt={photo.description}
                                                    className="w-full h-24 object-cover rounded"
                                                />
                                                {index === 3 && mergedReport.reportSections.nia.photos.length > 4 && (
                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                                        <span className="text-white text-sm">
                                                            +{mergedReport.reportSections.nia.photos.length - 4} more
                                                        </span>
                                                    </div>
                                                )}
                                            </div>
                                        ))}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>
                </div>
            </div>
        );
    } else {
        const individualReport = report as IndividualReportData;
        return (
            <div className="max-w-6xl mx-auto p-6 space-y-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h1 className="text-2xl font-bold text-gray-900">Individual Assessment Report</h1>
                    <p className="text-gray-600">Report ID: {individualReport.reportId}</p>
                    <div className="mt-4 p-4 bg-gray-50 rounded-lg">
                        <p>This is a completed individual report. The merged report is not yet available.</p>
                    </div>
                </div>
            </div>
        );
    }
};

export default ReportViewer;