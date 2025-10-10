"use client";
import React, { useState, useEffect } from "react";
import { FileText, Download, Eye, Calendar, CheckCircle, Clock, XCircle } from "lucide-react";
import { PolicyRequest } from "@/types/api.types";
import { downloadFile } from "@/services/fileService";
import { getSurveyorSubmissions } from "@/services/api";

const SubmissionsList = () => {
  const [submissions, setSubmissions] = useState<PolicyRequest[]>([]);
  const [filter, setFilter] = useState<'all' | 'pending' | 'approved' | 'rejected'>('all');
  const [loading, setLoading] = useState(true);
   const filteredSubmissions = (submissions || []).filter(submission => {
    if (filter === 'all') return submission?.status !== 'assigned';
    if (filter === 'pending') return submission?.status === 'surveyed';
    if (filter === 'approved') return submission?.status === 'approved';
    if (filter === 'rejected') return submission?.status === 'rejected';
    return true;
  });

  useEffect(() => {
    const fetchSubmissions = async () => {
      setLoading(true);
      try {
        const response = getSurveyorSubmissions(filter)
        const data = response?.data
        setSubmissions(Array.isArray(data) ? data : []);

      } catch (error) {
        setLoading(false)
        console.log(error)
      }finally{
        setLoading(false)
      }
      // Simulate API call
      // await new Promise(resolve => setTimeout(resolve, 1000));
      
      // const mockSubmissions: PolicyRequest[] = [
      //   {
      //     _id: "1",
      //     userId: "user1",
      //     propertyDetails: {
      //       address: "123 Main St, Wuse 2, Abuja, FCT",
      //       propertyType: "Residential House",
      //       buildingValue: 50000000,
      //       yearBuilt: 2020,
      //       squareFootage: 2500,
      //       constructionMaterial: "Concrete Block"
      //     },
      //     contactDetails: {
      //       fullName: "John Doe",
      //       email: "john.doe@email.com",
      //       phoneNumber: "+234 801 234 5678"
      //     },
      //     requestDetails: {
      //       coverageType: "Comprehensive Coverage",
      //       policyDuration: "2 Years",
      //       additionalCoverage: ["Flood Coverage", "Theft Protection"]
      //     },
      //     status: "approved",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     surveyDocument: {
      //       name: "survey_report_1.pdf",
      //       url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/survey-documents/survey_report_1.pdf",
      //       publicId: "survey-documents/survey_report_1"
      //     },
      //     surveyNotes: "Property is in excellent condition. No major risks identified. Recommend approval for comprehensive coverage.",
      //     adminNotes: "Survey approved. Well documented report.",
      //     createdAt: "2024-09-15T10:00:00Z",
      //     updatedAt: "2024-09-20T15:30:00Z"
      //   },
      //   {
      //     _id: "2",
      //     userId: "user2",
      //     propertyDetails: {
      //       address: "456 Commercial Ave, Garki, Abuja, FCT",
      //       propertyType: "Commercial Building",
      //       buildingValue: 150000000,
      //       yearBuilt: 2018,
      //       squareFootage: 5000,
      //       constructionMaterial: "Steel Frame"
      //     },
      //     contactDetails: {
      //       fullName: "Jane Smith",
      //       email: "jane.smith@business.com",
      //       phoneNumber: "+234 803 456 7890"
      //     },
      //     requestDetails: {
      //       coverageType: "All Risk Coverage",
      //       policyDuration: "3 Years",
      //       additionalCoverage: ["Business Interruption", "Equipment Coverage"]
      //     },
      //     status: "surveyed",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     surveyDocument: {
      //       name: "survey_report_2.pdf",
      //       url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/survey-documents/survey_report_2.pdf",
      //       publicId: "survey-documents/survey_report_2"
      //     },
      //     surveyNotes: "Commercial property with modern safety systems. Some minor electrical issues noted but overall good condition.",
      //     createdAt: "2024-09-28T14:30:00Z",
      //     updatedAt: "2024-10-02T11:20:00Z"
      //   },
      //   {
      //     _id: "3",
      //     userId: "user3",
      //     propertyDetails: {
      //       address: "789 Industrial Rd, Jikwoyi, Abuja, FCT",
      //       propertyType: "Industrial Facility",
      //       buildingValue: 300000000,
      //       yearBuilt: 2015,
      //       squareFootage: 10000,
      //       constructionMaterial: "Mixed Materials"
      //     },
      //     contactDetails: {
      //       fullName: "Mike Johnson",
      //       email: "mike.j@factory.com",
      //       phoneNumber: "+234 804 567 8901"
      //     },
      //     requestDetails: {
      //       coverageType: "Fire and Allied Perils",
      //       policyDuration: "5 Years",
      //       additionalCoverage: ["Equipment Coverage", "Liability Coverage"]
      //     },
      //     status: "rejected",
      //     assignedSurveyors: ["current_surveyor_id"],
      //     surveyDocument: {
      //       name: "survey_report_3.pdf",
      //       url: "https://res.cloudinary.com/demo/raw/upload/v1234567890/survey-documents/survey_report_3.pdf",
      //       publicId: "survey-documents/survey_report_3"
      //     },
      //     surveyNotes: "Several safety violations noted. Fire safety systems need major upgrades before approval can be considered.",
      //     adminNotes: "Survey rejected due to safety concerns. Property owner needs to address fire safety issues.",
      //     createdAt: "2024-09-10T08:00:00Z",
      //     updatedAt: "2024-09-18T16:45:00Z"
      //   }
      // ];

      // setSubmissions(mockSubmissions);
      // setLoading(false);
    };

    fetchSubmissions();
  }, []);

 

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'surveyed':
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
            { key: 'pending', label: 'Pending Review', count: submissions.filter(s => s.status === 'surveyed').length },
            { key: 'approved', label: 'Approved', count: submissions.filter(s => s.status === 'approved').length },
            { key: 'rejected', label: 'Rejected', count: submissions.filter(s => s.status === 'rejected').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setFilter(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                filter === tab.key
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
                    {submission.propertyDetails.propertyType}
                  </h3>
                  <p className="text-gray-600 mt-1">{submission.propertyDetails.address}</p>
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
                    <p><span className="font-medium">Value:</span> ₦{submission.propertyDetails.buildingValue.toLocaleString()}</p>
                    <p><span className="font-medium">Coverage:</span> {submission.requestDetails.coverageType}</p>
                    <p><span className="font-medium">Owner:</span> {submission.contactDetails.fullName}</p>
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
                      {submission.status === 'surveyed' ? 'Under Review' :
                       submission.status === 'approved' ? 'Approved by Admin' :
                       submission.status === 'rejected' ? 'Rejected by Admin' : submission.status}
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
                  <p className={`text-sm p-3 rounded ${
                    submission.status === 'approved' ? 'bg-green-50 text-green-700' :
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