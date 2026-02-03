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
import { toast } from "sonner";

interface ReportPhoto {
    url: string;
    description: string;
    timestamp: string;
}

interface ReportSection {
    propertyCondition: string;
    structuralAssessment: string;
    riskFactors: string;
    recommendations: string;
    surveyorName: string;
    surveyorLicense: string;
    submissionDate: string;
    photos: ReportPhoto[];
}

interface ConflictDetails {
    conflictType: string;
    conflictSeverity: 'low' | 'medium' | 'high' | 'critical';
    ammcRecommendation: string;
    niaRecommendation: string;
    ammcValue?: number;
    niaValue?: number;
    discrepancyPercentage?: number;
}

interface MergingMetadata {
    mergedAt: string;
    processingTime: number;
    qualityScore: number;
}

interface IndividualReports {
    ammcReportId?: string;
    niaReportId?: string;
    ammcSubmission?: {
        submittedAt: string;
        surveyData?: {
            propertyCondition?: string;
            structuralAssessment?: string;
            riskFactors?: string;
            photos?: Array<string | ReportPhoto>;
        };
        surveyorNotes?: string;
    };
    niaSubmission?: {
        submittedAt: string;
        surveyData?: {
            propertyCondition?: string;
            structuralAssessment?: string;
            riskFactors?: string;
            photos?: Array<string | ReportPhoto>;
        };
        surveyorNotes?: string;
    };
}

interface SurveyorContacts {
    ammc?: {
        name: string;
        licenseNumber: string;
    };
    nia?: {
        name: string;
        licenseNumber: string;
    };
}

interface ReportData {
    reportId: string;
    policyId: string;
    releaseStatus: 'pending' | 'withheld' | 'released';
    releasedAt: string;
    finalRecommendation: 'approve' | 'reject' | 'request_more_info';
    paymentEnabled: boolean;
    conflictDetected: boolean;
    conflictResolved: boolean;
    conflictDetails?: ConflictDetails;
    reportSections?: {
        ammc: ReportSection;
        nia: ReportSection;
    };
    mergingMetadata: MergingMetadata;
    isMerged: boolean;
    individualReports?: IndividualReports;
    surveyorContacts?: SurveyorContacts;
}

interface PropertyDetails {
    address: string;
    propertyType: string;
    buildingValue: number;
    yearBuilt: number;
    squareFootage: number;
    constructionMaterial: string;
}

interface IndividualReportData extends Omit<ReportData, 'reportSections' | 'mergingMetadata' | 'conflictDetails'> {
    propertyDetails: PropertyDetails;
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
                // response.data comes from the API and may be a slightly different shape than
                // our local ReportData/IndividualReportData types. Narrow by casting here.
                setReport(response.data as unknown as ReportData | IndividualReportData);
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

            const { userReportAPI } = await import('@/services/api');
            const response = await userReportAPI.downloadReport(reportId);

            if (response.success && response.data) {
                // Generate a formatted HTML report that can be printed as PDF
                const reportData = response.data as unknown as Record<string, unknown>; // API download payload may have additional fields
                const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Merged Survey Report - ${reportId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #028835; border-bottom: 3px solid #028835; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        h3 { color: #555; margin-top: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #028835; }
        .info-row { display: flex; margin: 10px 0; }
        .label { font-weight: bold; width: 200px; color: #555; }
        .value { flex: 1; }
        .recommendation { padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold; }
        .approve { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .reject { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .conflict { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #777; }
    </style>
</head>
<body>
    <h1>Merged Dual Survey Report</h1>
    
    <div class="section">
        <h2>Report Information</h2>
        <div class="info-row"><span class="label">Report ID:</span><span class="value">${(reportData.reportId as string) || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Policy ID:</span><span class="value">${(reportData.policyId as string) || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Property Address:</span><span class="value">${((reportData.propertyDetails as Record<string, unknown>)?.address as string) || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Property Type:</span><span class="value">${((reportData.propertyDetails as Record<string, unknown>)?.propertyType as string) || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Report Status:</span><span class="value">${(reportData.status as string) || (reportData.releaseStatus as string) || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Released Date:</span><span class="value">${reportData.releasedAt ? new Date(reportData.releasedAt as string).toLocaleString() : 'N/A'}</span></div>
        <div class="info-row"><span class="label">Download Count:</span><span class="value">${(reportData.downloadCount as number) || 0}</span></div>
    </div>

    <div class="recommendation ${(reportData.finalRecommendation as string) === 'approve' ? 'approve' : (reportData.finalRecommendation as string) === 'reject' ? 'reject' : ''}">
        <h2>Final Recommendation: ${((reportData.finalRecommendation as string) || 'N/A').toUpperCase()}</h2>
        ${reportData.paymentEnabled ? '<p>✓ Payment Enabled</p>' : '<p>✗ Payment Not Enabled</p>'}
    </div>

    ${reportData.conflictDetected ? `
    <div class="conflict">
        <h3>⚠️ Conflict Detected</h3>
        <p>Status: ${reportData.conflictResolved ? 'Resolved' : 'Pending Resolution'}</p>
        ${reportData.conflictDetails ? `<p>Details: ${JSON.stringify(reportData.conflictDetails)}</p>` : ''}
    </div>
    ` : ''}

    <div class="section">
        <h2>Report Sections</h2>
        ${reportData.reportSections ? Object.entries(reportData.reportSections).map(([key, value]) => `
            <h3>${key.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <p>${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</p>
        `).join('') : '<p>No report sections available</p>'}
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>Builders-Liability-AMMC - Dual Survey Report System</p>
    </div>
</body>
</html>`;

                // Create blob and download
                const blob = new Blob([htmlContent], { type: 'text/html' });
                const url = URL.createObjectURL(blob);
                const link = document.createElement('a');
                link.href = url;
                link.download = `merged-report-${reportId}-${Date.now()}.html`;
                document.body.appendChild(link);
                link.click();
                document.body.removeChild(link);
                URL.revokeObjectURL(url);

                toast.success('Merged report downloaded successfully. Open the HTML file and print to PDF from your browser.');
            } else {
                throw new Error(response.message || 'Failed to download report');
            }

        } catch (err) {
            console.error('Download failed:', err);
            toast.error('Download failed. Please try again.');
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
                                <button
                                    onClick={async () => {
                                        if (mergedReport.individualReports?.ammcReportId) {
                                            try {
                                                const { userReportAPI } = await import('@/services/api');
                                                const response = await userReportAPI.downloadAMMCReport(mergedReport.individualReports.ammcReportId);

                                                if (response.success && response.data) {
                                                    // Check if there's a direct download URL for the PDF
                                                    if (response.data.downloadUrl) {
                                                        // Create a temporary link to download the PDF
                                                        const link = document.createElement('a');
                                                        link.href = response.data.downloadUrl;
                                                        link.target = '_blank';
                                                        link.rel = 'noopener noreferrer';
                                                        const filename = response.data.downloadUrl.split('/').pop() || `ammc-report-${Date.now()}.pdf`;
                                                        link.download = filename;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        toast.success('AMMC report opened in new tab.');
                                                    } else if (response.data.documents && response.data.documents.length > 0) {
                                                        // Download the first available document
                                                        const doc = response.data.documents[0];
                                                        const link = document.createElement('a');
                                                        link.href = doc.cloudinaryUrl;
                                                        link.target = '_blank';
                                                        link.rel = 'noopener noreferrer';
                                                        const filename = doc.cloudinaryUrl.split('/').pop() || `ammc-report-${Date.now()}.pdf`;
                                                        link.download = filename;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        toast.success('AMMC report downloaded successfully.');
                                                    } else {
                                                        toast.error('No AMMC report document available for download');
                                                    }
                                                } else {
                                                    toast.error('Failed to download AMMC report: ' + (response.message || 'Unknown error'));
                                                }
                                            } catch (error) {
                                                console.error('Error downloading AMMC report:', error);
                                                toast.error('Failed to download AMMC report');
                                            }
                                        }
                                    }}
                                    disabled={!mergedReport.individualReports?.ammcReportId}
                                    className="inline-flex items-center space-x-2 px-3 py-1 bg-blue-100 text-blue-800 rounded-md hover:bg-blue-200 disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">
                                        {mergedReport.reportSections?.ammc?.surveyorName ||
                                            mergedReport.surveyorContacts?.ammc?.name ||
                                            'AMMC Surveyor'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    License: {mergedReport.reportSections?.ammc?.surveyorLicense ||
                                        mergedReport.surveyorContacts?.ammc?.licenseNumber ||
                                        'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Submitted: {mergedReport.reportSections?.ammc?.submissionDate ?
                                        new Date(mergedReport.reportSections.ammc.submissionDate).toLocaleDateString() :
                                        mergedReport.individualReports?.ammcSubmission?.submittedAt ?
                                            new Date(mergedReport.individualReports.ammcSubmission.submittedAt).toLocaleDateString() :
                                            'N/A'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Property Condition</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.ammc?.propertyCondition ||
                                        mergedReport.individualReports?.ammcSubmission?.surveyData?.propertyCondition ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Structural Assessment</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.ammc?.structuralAssessment ||
                                        mergedReport.individualReports?.ammcSubmission?.surveyData?.structuralAssessment ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Risk Factors</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.ammc?.riskFactors ||
                                        mergedReport.individualReports?.ammcSubmission?.surveyData?.riskFactors ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Recommendations</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.ammc?.recommendations ||
                                        mergedReport.individualReports?.ammcSubmission?.surveyorNotes ||
                                        'Recommendations not available'}
                                </p>
                            </div>



                            {((mergedReport.reportSections?.ammc?.photos?.length || 0) > 0 ||
                                (mergedReport.individualReports?.ammcSubmission?.surveyData?.photos?.length || 0) > 0) && (
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Photos ({mergedReport.reportSections?.ammc?.photos?.length ||
                                                mergedReport.individualReports?.ammcSubmission?.surveyData?.photos?.length || 0})
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(mergedReport.reportSections?.ammc?.photos ||
                                                mergedReport.individualReports?.ammcSubmission?.surveyData?.photos || [])
                                                .slice(0, 4).map((photo, index) => {
                                                    const photoUrl = typeof photo === 'string' ? photo : photo?.url;
                                                    const photoDesc = typeof photo === 'string' ? undefined : photo?.description;
                                                    return (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={photoUrl}
                                                                alt={photoDesc || `AMMC Photo ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded"
                                                            />
                                                            {index === 3 && (mergedReport.reportSections?.ammc?.photos?.length ||
                                                                mergedReport.individualReports?.ammcSubmission?.surveyData?.photos?.length || 0) > 4 && (
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                                                        <span className="text-white text-sm">
                                                                            +{(mergedReport.reportSections?.ammc?.photos?.length ||
                                                                                mergedReport.individualReports?.ammcSubmission?.surveyData?.photos?.length || 0) - 4} more
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                })}
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
                                <button
                                    onClick={async () => {
                                        if (mergedReport.individualReports?.niaReportId) {
                                            try {
                                                const { userReportAPI } = await import('@/services/api');
                                                const response = await userReportAPI.downloadNIAReport(mergedReport.individualReports.niaReportId);

                                                if (response.success && response.data) {
                                                    // Check if there's a direct download URL for the PDF
                                                    if (response.data.downloadUrl) {
                                                        // Create a temporary link to download the PDF
                                                        const link = document.createElement('a');
                                                        link.href = response.data.downloadUrl;
                                                        link.target = '_blank';
                                                        link.rel = 'noopener noreferrer';
                                                        const filename = response.data.downloadUrl.split('/').pop() || `nia-report-${Date.now()}.pdf`;
                                                        link.download = filename;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        toast.success('NIA report downloaded successfully.');
                                                    } else if (response.data.documents && response.data.documents.length > 0) {
                                                        // Download the first available document
                                                        const doc = response.data.documents[0];
                                                        const link = document.createElement('a');
                                                        link.href = doc.cloudinaryUrl;
                                                        link.target = '_blank';
                                                        link.rel = 'noopener noreferrer';
                                                        const filename = doc.cloudinaryUrl.split('/').pop() || `nia-report-${Date.now()}.pdf`;
                                                        link.download = filename;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        toast.success('NIA report downloaded successfully.');
                                                    } else {
                                                        toast.error('No NIA report document available for download');
                                                    }
                                                } else {
                                                    toast.error('Failed to download NIA report: ' + (response.message || 'Unknown error'));
                                                }
                                            } catch (error) {
                                                console.error('Error downloading NIA report:', error);
                                                toast.error('Failed to download NIA report');
                                            }
                                        }
                                    }}
                                    disabled={!mergedReport.individualReports?.niaReportId}
                                    className="inline-flex items-center space-x-2 px-3 py-1 bg-green-100 text-green-800 rounded-md hover:bg-green-200 disabled:opacity-50"
                                >
                                    <Download className="w-4 h-4" />
                                    <span>Download</span>
                                </button>
                            </div>
                        </div>

                        <div className="p-6 space-y-4">
                            <div>
                                <div className="flex items-center space-x-2 mb-2">
                                    <User className="w-4 h-4 text-gray-500" />
                                    <span className="font-medium">
                                        {mergedReport.reportSections?.nia?.surveyorName ||
                                            mergedReport.surveyorContacts?.nia?.name ||
                                            'NIA Surveyor'}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-600">
                                    License: {mergedReport.reportSections?.nia?.surveyorLicense ||
                                        mergedReport.surveyorContacts?.nia?.licenseNumber ||
                                        'N/A'}
                                </p>
                                <p className="text-sm text-gray-600">
                                    Submitted: {mergedReport.reportSections?.nia?.submissionDate ?
                                        new Date(mergedReport.reportSections.nia.submissionDate).toLocaleDateString() :
                                        mergedReport.individualReports?.niaSubmission?.submittedAt ?
                                            new Date(mergedReport.individualReports.niaSubmission.submittedAt).toLocaleDateString() :
                                            'N/A'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Property Condition</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.nia?.propertyCondition ||
                                        mergedReport.individualReports?.niaSubmission?.surveyData?.propertyCondition ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Structural Assessment</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.nia?.structuralAssessment ||
                                        mergedReport.individualReports?.niaSubmission?.surveyData?.structuralAssessment ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Risk Factors</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.nia?.riskFactors ||
                                        mergedReport.individualReports?.niaSubmission?.surveyData?.riskFactors ||
                                        'Assessment data not available'}
                                </p>
                            </div>

                            <div>
                                <h4 className="font-medium mb-2">Recommendations</h4>
                                <p className="text-sm text-gray-700">
                                    {mergedReport.reportSections?.nia?.recommendations ||
                                        mergedReport.individualReports?.niaSubmission?.surveyorNotes ||
                                        'Recommendations not available'}
                                </p>
                            </div>



                            {((mergedReport.reportSections?.nia?.photos?.length || 0) > 0 ||
                                (mergedReport.individualReports?.niaSubmission?.surveyData?.photos?.length || 0) > 0) && (
                                    <div>
                                        <h4 className="font-medium mb-2">
                                            Photos ({mergedReport.reportSections?.nia?.photos?.length ||
                                                mergedReport.individualReports?.niaSubmission?.surveyData?.photos?.length || 0})
                                        </h4>
                                        <div className="grid grid-cols-2 gap-2">
                                            {(mergedReport.reportSections?.nia?.photos ||
                                                mergedReport.individualReports?.niaSubmission?.surveyData?.photos || [])
                                                .slice(0, 4).map((photo, index) => {
                                                    const photoUrl = typeof photo === 'string' ? photo : photo?.url;
                                                    const photoDesc = typeof photo === 'string' ? undefined : photo?.description;
                                                    return (
                                                        <div key={index} className="relative">
                                                            <img
                                                                src={photoUrl}
                                                                alt={photoDesc || `NIA Photo ${index + 1}`}
                                                                className="w-full h-24 object-cover rounded"
                                                            />
                                                            {index === 3 && (mergedReport.reportSections?.nia?.photos?.length ||
                                                                mergedReport.individualReports?.niaSubmission?.surveyData?.photos?.length || 0) > 4 && (
                                                                    <div className="absolute inset-0 bg-black bg-opacity-50 flex items-center justify-center rounded">
                                                                        <span className="text-white text-sm">
                                                                            +{(mergedReport.reportSections?.nia?.photos?.length ||
                                                                                mergedReport.individualReports?.niaSubmission?.surveyData?.photos?.length || 0) - 4} more
                                                                        </span>
                                                                    </div>
                                                                )}
                                                        </div>
                                                    );
                                                })}
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