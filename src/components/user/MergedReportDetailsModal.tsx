'use client';

import React, { useState, useEffect } from 'react';
import { userReportAPI } from '@/services/api';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import {
  X,
  Download,
  FileText,
  AlertTriangle,
  Building,
  Shield,
  TrendingUp
} from 'lucide-react';
import {
  ReportDetailsExtended,
  RecommendationAction
} from '@/types/api.types';
import { normalizeError, getErrorMessage } from '@/utils/errorHandling';
import { toast } from "sonner"

interface MergedReportDetailsModalProps {
  reportId: string;
  isOpen: boolean;
  onClose: () => void;
}

const MergedReportDetailsModal: React.FC<MergedReportDetailsModalProps> = ({
  reportId,
  isOpen,
  onClose
}) => {
  const [reportDetails, setReportDetails] = useState<ReportDetailsExtended | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && reportId) {
      fetchReportDetails();
    }
  }, [isOpen, reportId]);

  const fetchReportDetails = async () => {
    try {
      setLoading(true);
      setError(null);
      const response = await userReportAPI.getReportDetails(reportId);

      if (response.success && response.data) {
        setReportDetails(response.data as ReportDetailsExtended);
      } else {
        setError(response.message || 'Failed to fetch report details');
      }
    } catch (err) {
      const normalizedError = normalizeError(err);
      setError(getErrorMessage(normalizedError));
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await userReportAPI.downloadReport(reportId);
      if (response.success && response.data) {
        // Generate a formatted HTML report that can be printed as PDF
        const reportData = response.data;
        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
  <meta charset="UTF-8" />
  <title>Merged Survey Report - ${reportId}</title>

  <style>
    body {
      font-family: Arial, sans-serif;
      margin: 40px;
      line-height: 1.6;
    }

    h1 {
      color: #028835;
      border-bottom: 3px solid #028835;
      padding-bottom: 10px;
    }

    h2 {
      color: #333;
      margin-top: 30px;
      border-bottom: 2px solid #ddd;
      padding-bottom: 5px;
    }

    h3 {
      color: #555;
      margin-top: 20px;
    }

    .section {
      margin: 20px 0;
      padding: 15px;
      background: #f9f9f9;
      border-left: 4px solid #028835;
    }

    .info-row {
      display: flex;
      margin: 10px 0;
    }

    .label {
      font-weight: bold;
      width: 200px;
      color: #555;
    }

    .value {
      flex: 1;
    }

    .recommendation {
      padding: 15px;
      margin: 20px 0;
      border-radius: 5px;
      font-weight: bold;
    }

    .approve {
      background: #d4edda;
      color: #155724;
      border: 1px solid #c3e6cb;
    }

    .reject {
      background: #f8d7da;
      color: #721c24;
      border: 1px solid #f5c6cb;
    }

    .conflict {
      background: #fff3cd;
      color: #856404;
      border: 1px solid #ffeaa7;
      padding: 15px;
      margin: 20px 0;
    }

    table {
      width: 100%;
      border-collapse: collapse;
      margin: 15px 0;
    }

    th, td {
      padding: 10px;
      text-align: left;
      border: 1px solid #ddd;
    }

    th {
      background: #028835;
      color: white;
    }

    .footer {
      margin-top: 40px;
      padding-top: 20px;
      border-top: 2px solid #ddd;
      text-align: center;
      color: #777;
    }
  </style>
</head>

<body>

  <h1>Merged Dual Survey Report</h1>

  <div class="section">
    <h2>Report Information</h2>

    <div class="info-row">
      <span class="label">Report ID:</span>
      <span class="value">${reportData.reportId || 'N/A'}</span>
    </div>

    <div class="info-row">
      <span class="label">Policy ID:</span>
      <span class="value">${'policyId' in reportData ? (reportData as Record<string, unknown>).policyId as string : 'N/A'}</span>
    </div>

    <div class="info-row">
      <span class="label">Property Address:</span>
      <span class="value">${reportData.propertyDetails?.address || 'N/A'}</span>
    </div>

    <div class="info-row">
      <span class="label">Property Type:</span>
      <span class="value">${reportData.propertyDetails?.propertyType || 'N/A'}</span>
    </div>

    <div class="info-row">
      <span class="label">Report Status:</span>
      <span class="value">${'status' in reportData ? (reportData as Record<string, unknown>).status as string : 'N/A'}</span>
    </div>

    <div class="info-row">
      <span class="label">Released Date:</span>
      <span class="value">
        ${reportData.releasedAt
            ? new Date(reportData.releasedAt).toLocaleString()
            : 'N/A'
          }
      </span>
    </div>

    <div class="info-row">
      <span class="label">Download Count:</span>
      <span class="value">${reportData.downloadCount || 0}</span>
    </div>
  </div>

  <div class="recommendation ${reportData.finalRecommendation === 'approve'
            ? 'approve'
            : reportData.finalRecommendation === 'reject'
              ? 'reject'
              : ''
          }">
    <h2>
      Final Recommendation: ${(reportData.finalRecommendation || 'N/A').toUpperCase()}
    </h2>

    ${reportData.paymentEnabled
            ? `<p>✓ Payment Enabled</p>`
            : `<p>✗ Payment Not Enabled</p>`
          }
  </div>

  ${reportData.conflictDetected
            ? `
      <div class="conflict">
        <h3>⚠️ Conflict Detected</h3>
        <p>Status: ${'conflictResolved' in reportData && (reportData as Record<string, unknown>).conflictResolved ? 'Resolved' : 'Pending Resolution'
            }</p>

        ${'conflictDetails' in reportData && (reportData as Record<string, unknown>).conflictDetails
              ? `<p>Details: ${JSON.stringify((reportData as Record<string, unknown>).conflictDetails)}</p>`
              : ''
            }
      </div>
      `
            : ''
          }

  <div class="section">
    <h2>Report Sections</h2>

    ${reportData.reportSections
            ? Object.entries(reportData.reportSections)
              .map(
                ([key, value]) => `
                <h3>${key.replace(/([A-Z])/g, ' $1').trim()}</h3>
                <pre>${typeof value === 'object'
                    ? JSON.stringify(value, null, 2)
                    : value}</pre>
              `
              )
              .join('')
            : `<p>No report sections available</p>`
          }
  </div>

  <div class="footer">
    <p>Generated on ${new Date().toLocaleString()}</p>
    <p>Builders-Liability-AMMC — Dual Survey Report System</p>
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
        fetchReportDetails();
      } else {
        toast.error('Failed to download merged report');
      }
    } catch (error) {
      toast.error('Failed to download merged report');
    }
  };

  const handleDownloadAMMC = async () => {
    try {
      if (!reportDetails?.individualReports?.ammcReportId) {
        toast.error('AMMC report not available');
        return;
      }
      const response = await userReportAPI.downloadAMMCReport(reportDetails.individualReports.ammcReportId);
      if (response.success && response.data) {
        // Check if there's a direct download URL for the PDF
        if (response.data.downloadUrl) {
          // Create a temporary link to download the PDF
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          // Extract filename from URL or use default
          const filename = response.data.downloadUrl.split('/').pop() || `ammc-report-${Date.now()}.pdf`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('AMMC report opened in new tab. If download didn\'t start, please check your browser\'s download settings.');
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
          toast.success('AMMC report opened in new tab.');
        } else {
          toast.error('No AMMC report document available for download');
        }
      } else {
        toast.error('Failed to download AMMC report: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Failed to download AMMC report');
    }
  };

  const handleDownloadNIA = async () => {
    try {
      if (!reportDetails?.individualReports?.niaReportId) {
        toast.error('NIA report not available');
        return;
      }
      const response = await userReportAPI.downloadNIAReport(reportDetails.individualReports.niaReportId);
      if (response.success && response.data) {
        // Check if there's a direct download URL for the PDF
        if (response.data.downloadUrl) {
          // Create a temporary link to download the PDF
          const link = document.createElement('a');
          link.href = response.data.downloadUrl;
          link.target = '_blank';
          link.rel = 'noopener noreferrer';
          // Extract filename from URL or use default
          const filename = response.data.downloadUrl.split('/').pop() || `nia-report-${Date.now()}.pdf`;
          link.download = filename;
          document.body.appendChild(link);
          link.click();
          document.body.removeChild(link);
          toast.success('NIA report opened in new tab. If download didn\'t start, please check your browser\'s download settings.');
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
          toast.success('NIA report opened in new tab.');
        } else {
          toast.error('No NIA report document available for download');
        }
      } else {
        toast.error('Failed to download NIA report: ' + (response.message || 'Unknown error'));
      }
    } catch (error) {
      toast.error('Failed to download NIA report');
    }
  };

  const getRecommendationBadge = (recommendation: RecommendationAction | string) => {
    switch (recommendation) {
      case 'approve':
        return <Badge className="bg-green-100 text-green-800">APPROVE</Badge>;
      case 'reject':
        return <Badge className="bg-red-100 text-red-800">REJECT</Badge>;
      case 'request_more_info':
        return <Badge className="bg-yellow-100 text-yellow-800">REQUEST MORE INFO</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{String(recommendation).toUpperCase()}</Badge>;
    }
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between p-6 border-b">
          <div className="flex items-center gap-3">
            <FileText className="w-6 h-6 text-blue-600" />
            <h2 className="text-xl font-semibold text-gray-900">Merged Report Details</h2>
          </div>
          <button
            onClick={onClose}
            className="text-gray-400 hover:text-gray-600 transition-colors"
          >
            <X className="w-6 h-6" />
          </button>
        </div>

        <div className="p-6">
          {loading && (
            <div className="flex items-center justify-center py-12">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
            </div>
          )}

          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-6">
              <div className="flex items-center gap-2 text-red-800">
                <AlertTriangle className="w-5 h-5" />
                <span className="font-medium">Error</span>
              </div>
              <p className="text-red-700 mt-1">{error}</p>
            </div>
          )}

          {reportDetails && (
            <div className="space-y-6">
              <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-center justify-between mb-3">
                  <div className="flex items-center gap-2">
                    <Shield className="w-5 h-5 text-blue-600" />
                    <h3 className="font-semibold text-blue-900">Dual Surveyor Assessment</h3>
                  </div>
                  {reportDetails.finalRecommendation && getRecommendationBadge(reportDetails.finalRecommendation)}
                </div>
                <p className="text-blue-800 text-sm">
                  This report combines assessments from both AMMC and NIA surveyors.
                </p>

                {reportDetails.conflictDetected && (
                  <div className="mt-3 p-3 bg-orange-50 border border-orange-200 rounded">
                    <div className="flex items-center gap-2 text-orange-800">
                      <AlertTriangle className="w-4 h-4" />
                      <span className="font-medium">
                        {reportDetails.conflictResolved ? 'Conflict Resolved' : 'Conflict Detected'}
                      </span>
                    </div>
                  </div>
                )}
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Building className="w-4 h-4" />
                    Property Details
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Address:</span>
                      <p className="text-gray-900">{reportDetails.propertyDetails?.address}</p>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Type:</span>
                      <span className="ml-2 text-gray-900">{reportDetails.propertyDetails?.propertyType}</span>
                    </div>
                  </div>
                </div>

                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <TrendingUp className="w-4 h-4" />
                    Report Information
                  </h4>
                  <div className="space-y-2 text-sm">
                    <div>
                      <span className="font-medium text-gray-600">Status:</span>
                      <span className="ml-2">
                        <Badge className="bg-green-100 text-green-800">{reportDetails.status?.toUpperCase()}</Badge>
                      </span>
                    </div>
                    <div>
                      <span className="font-medium text-gray-600">Downloads:</span>
                      <span className="ml-2 text-gray-900">{reportDetails.downloadCount}</span>
                    </div>
                  </div>
                </div>
              </div>

              {/* Surveyor Contacts */}
              {reportDetails.surveyorContacts && (
                <div className="bg-gray-50 rounded-lg p-4">
                  <h4 className="font-semibold text-gray-900 mb-3 flex items-center gap-2">
                    <Shield className="w-4 h-4" />
                    Surveyor Contacts
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    {reportDetails.surveyorContacts.ammc && (
                      <div className="border border-blue-200 rounded p-3">
                        <h5 className="font-medium text-blue-900 mb-2">AMMC Surveyor</h5>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Name:</span> {reportDetails.surveyorContacts.ammc.name}</div>
                          <div><span className="font-medium">Email:</span> {reportDetails.surveyorContacts.ammc.email}</div>
                          <div><span className="font-medium">Phone:</span> {reportDetails.surveyorContacts.ammc.phone}</div>
                          <div><span className="font-medium">License:</span> {reportDetails.surveyorContacts.ammc.licenseNumber}</div>
                        </div>
                      </div>
                    )}
                    {reportDetails.surveyorContacts.nia && (
                      <div className="border border-green-200 rounded p-3">
                        <h5 className="font-medium text-green-900 mb-2">NIA Surveyor</h5>
                        <div className="space-y-1 text-sm">
                          <div><span className="font-medium">Name:</span> {reportDetails.surveyorContacts.nia.name}</div>
                          <div><span className="font-medium">Email:</span> {reportDetails.surveyorContacts.nia.email}</div>
                          <div><span className="font-medium">Phone:</span> {reportDetails.surveyorContacts.nia.phone}</div>
                          <div><span className="font-medium">License:</span> {reportDetails.surveyorContacts.nia.licenseNumber}</div>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              )}

              <div className="flex flex-col gap-4 pt-4 border-t">
                {/* Individual Report Downloads */}
                {reportDetails.individualReports && (
                  <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <h4 className="font-medium text-blue-900 mb-3">Individual Report Downloads</h4>
                    <div className="flex flex-wrap gap-2">
                      {reportDetails.individualReports.ammcReportId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadAMMC}
                          className="border-blue-300 text-blue-700 hover:bg-blue-100"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download AMMC Report
                        </Button>
                      )}
                      {reportDetails.individualReports.niaReportId && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={handleDownloadNIA}
                          className="border-green-300 text-green-700 hover:bg-green-100"
                        >
                          <Download className="w-4 h-4 mr-1" />
                          Download NIA Report
                        </Button>
                      )}
                    </div>
                  </div>
                )}

                {/* Main Action Buttons */}
                <div className="flex justify-end gap-3">
                  <Button variant="outline" onClick={onClose}>
                    Close
                  </Button>
                  {reportDetails.canDownload && (
                    <Button onClick={handleDownload}>
                      <Download className="w-4 h-4 mr-2" />
                      Download Merged Report
                    </Button>
                  )}
                </div>
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default MergedReportDetailsModal;