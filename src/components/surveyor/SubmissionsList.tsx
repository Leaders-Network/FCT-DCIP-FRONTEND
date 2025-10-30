"use client";
import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { PolicyRequest } from "@/types/api.types";
import { downloadFile } from "@/services/fileService";
import { getSurveyorSubmissions } from "@/services/api";

const SubmissionsList = () => {
  const [submissions, setSubmissions] = useState<PolicyRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected' | 'revision_required'>('all');
  const [loading, setLoading] = useState(true);
  const filteredSubmissions = (submissions || []).filter(submission => {
    if (filter === 'all') return submission?.status !== 'assigned';
    if (filter === 'pending') return (submission?.status as any) === 'submitted' || (submission?.status as any) === 'under_review';
    if (filter === 'approved') return submission?.status === 'approved';
    if (filter === 'rejected') return submission?.status === 'rejected';
    if (filter === 'revision_required') return (submission?.status as any) === 'revision_required';
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = await getSurveyorSubmissions(filter);
        console.log("Submissions List Response:", response);
        const data = response.data.submissions;
        setSubmissions(Array.isArray(data) ? data : []);
      } catch (error) {
        console.log(error);
      } finally {
        setLoading(false);
      }
    };

    fetchSubmissions();
  }, [filter]);



  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
      case 'under_review':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Review
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved
          </span>
        );
      case 'rejected':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
            <XCircle className="w-3 h-3 mr-1" />
            Rejected
          </span>
        );
      case 'revision_required':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Eye className="w-3 h-3 mr-1" />
            Requesting More Info
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const handleDownloadReport = async (documentInfo: any) => {
    try {
      // If documentInfo contains publicId (from Cloudinary), use backend download service
      if (typeof documentInfo === 'object' && documentInfo.publicId) {
        await downloadFile(documentInfo.publicId, documentInfo.name);
      } else {
        // Fallback for old format (string filename)
        const documentName = typeof documentInfo === 'string' ? documentInfo : 'survey-report.pdf';
        const link = document.createElement('a');
        link.href = `/api/documents/download/${documentName}`;
        link.download = documentName;
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
      }
    } catch (error) {
      console.error('Download error:', error);
      alert('Failed to download file. Please try again or contact support.');
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
              </div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-2xl font-bold text-gray-900">My Submissions</h1>
          <p className="text-gray-600">Track your submitted survey reports and their status</p>
        </div>
      </div>

      {/* Filter Tabs */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Submissions', count: submissions.filter(s => s.status !== 'assigned').length },
            { key: 'pending', label: 'Pending Review', count: submissions.filter(s => (s.status as any) === 'submitted' || (s.status as any) === 'under_review').length },
            { key: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length },
            { key: 'revision_required', label: 'Revision Required', count: submissions.filter(s => (s.status as any) === 'revision_required').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                ? 'border-[#028835] text-[#028835]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      {/* Submissions List */}
      <div className="space-y-4">
        {filteredSubmissions.map((submission) => (
          <div key={submission._id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {(submission as any).ammcId.propertyDetails.propertyType}
                  </h3>
                  <p className="text-gray-600 mt-1">{(submission as any).ammcId.propertyDetails.address}</p>
                  <div className="flex items-center text-sm text-gray-500 mt-2">
                    <Calendar className="h-4 w-4 mr-1" />
                    Submitted: {new Date(submission.updatedAt).toLocaleDateString()}
                  </div>
                </div>
                <div className="flex items-center space-x-3">
                  {getStatusBadge(submission.status)}
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Property Details</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Value:</span> ₦{(submission as any).ammcId.propertyDetails.buildingValue.toLocaleString()}</p>
                    <p><span className="font-medium">Coverage:</span> {(submission as any).ammcId.requestDetails.coverageType}</p>
                    <p><span className="font-medium">Owner:</span> {(submission as any).ammcId.contactDetails.fullName}</p>
                  </div>
                </div>

                <div>
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Survey Information</h4>
                  <div className="space-y-1 text-sm text-gray-600">
                    <p><span className="font-medium">Report:</span> {
                      submission.surveyDocument
                        ? (typeof submission.surveyDocument === 'string'
                          ? submission.surveyDocument
                          : submission.surveyDocument.name)
                        : 'Not available'
                    }</p>
                    <p><span className="font-medium">Status:</span>
                      {(submission.status as any) === 'submitted' || (submission.status as any) === 'under_review' ? 'Under Review' :
                        submission.status === 'approved' ? 'Approved by Admin' :
                          submission.status === 'rejected' ? 'Rejected by Admin' :
                            (submission.status as any) === 'revision_required' ? 'Revision Required by Admin' : submission.status}
                    </p>
                  </div>
                </div>
              </div>

              {submission.surveyNotes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Survey Notes</h4>
                  <p className="text-sm text-gray-700 bg-gray-50 p-3 rounded">
                    {submission.surveyNotes}
                  </p>
                </div>
              )}

              {submission.adminNotes && (
                <div className="mb-4">
                  <h4 className="text-sm font-medium text-gray-500 mb-2">Admin Feedback</h4>
                  <p className={`text-sm p-3 rounded ${submission.status === 'approved' ? 'bg-green-50 text-green-700' :
                    submission.status === 'rejected' ? 'bg-red-50 text-red-700' :
                      'bg-blue-50 text-blue-700'
                    }`}>
                    {submission.adminNotes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t border-gray-200">
                {submission.surveyDocument && (
                  <button
                    onClick={() => handleDownloadReport(submission.surveyDocument!)}
                    className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
                  >
                    <Download className="h-4 w-4 mr-1" />
                    Download Report
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSubmissions.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FileText className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No submissions found</h3>
          <p className="mt-1 text-sm text-gray-500">
            {filter === 'all'
              ? "You haven't submitted any surveys yet."
              : `No ${filter} submissions found.`
            }
          </p>
        </div>
      )}
    </div>
  );
};

export default SubmissionsList;