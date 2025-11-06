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
  CheckCircle,
  Building,
  Shield,
  TrendingUp
} from 'lucide-react';

interface MergedReportDetailsModalProps {
  reportId: string;
  isOpen: boolean;
  onClose: () => void;
}

interface SurveyorContact {
  name: string;
  email: string;
  phone: string;
  licenseNumber: string;
}

interface ReportDetails {
  reportId: string;
  status: string;
  downloadCount: number;
  canDownload: boolean;
  finalRecommendation?: 'approve' | 'reject' | 'request_more_info';
  conflictDetected: boolean;
  conflictResolved: boolean;
  propertyDetails: {
    address: string;
    propertyType: string;
  };
  surveyorContacts?: {
    ammc?: SurveyorContact;
    nia?: SurveyorContact;
  };
  individualReports?: {
    ammcReportId?: string;
    niaReportId?: string;
  };
}

const MergedReportDetailsModal: React.FC<MergedReportDetailsModalProps> = ({
  reportId,
  isOpen,
  onClose
}) => {
  const [reportDetails, setReportDetails] = useState<ReportDetails | null>(null);
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

      if (response.success) {
        setReportDetails(response.data);
      } else {
        setError(response.message || 'Failed to fetch report details');
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  const handleDownload = async () => {
    try {
      const response = await userReportAPI.downloadReport(reportId);
      if (response.success) {
        alert('Merged report downloaded successfully');
        fetchReportDetails();
      } else {
        alert('Failed to download merged report');
      }
    } catch (error) {
      console.error('Error downloading merged report:', error);
      alert('Failed to download merged report');
    }
  };

  const handleDownloadAMMC = async () => {
    try {
      if (!reportDetails?.individualReports?.ammcReportId) {
        alert('AMMC report not available');
        return;
      }
      const response = await userReportAPI.downloadAMMCReport(reportDetails.individualReports.ammcReportId);
      if (response.success) {
        alert('AMMC report downloaded successfully');
      } else {
        alert('Failed to download AMMC report');
      }
    } catch (error) {
      console.error('Error downloading AMMC report:', error);
      alert('Failed to download AMMC report');
    }
  };

  const handleDownloadNIA = async () => {
    try {
      if (!reportDetails?.individualReports?.niaReportId) {
        alert('NIA report not available');
        return;
      }
      const response = await userReportAPI.downloadNIAReport(reportDetails.individualReports.niaReportId);
      if (response.success) {
        alert('NIA report downloaded successfully');
      } else {
        alert('Failed to download NIA report');
      }
    } catch (error) {
      console.error('Error downloading NIA report:', error);
      alert('Failed to download NIA report');
    }
  };

  const getRecommendationBadge = (recommendation: string) => {
    switch (recommendation) {
      case 'approve':
        return <Badge className="bg-green-100 text-green-800">APPROVE</Badge>;
      case 'reject':
        return <Badge className="bg-red-100 text-red-800">REJECT</Badge>;
      case 'request_more_info':
        return <Badge className="bg-yellow-100 text-yellow-800">REQUEST MORE INFO</Badge>;
      default:
        return <Badge className="bg-gray-100 text-gray-800">{recommendation}</Badge>;
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