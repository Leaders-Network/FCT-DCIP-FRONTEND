"use client";
import React, { useState, useEffect } from "react";
import { Download, ExternalLink, CheckCircle, Clock, FileText, XCircle, Trash2, MoreVertical, Shield, Eye, AlertTriangle } from "lucide-react";
import { PolicyRequest, UserReport } from "@/types/api.types";
import { getUserPolicyRequests, deletePolicyRequest, userReportAPI } from "@/services/api";
import MergedReportDetailsModal from "@/components/user/MergedReportDetailsModal";

interface PolicyCompletionProps { }

const PolicyCompletion: React.FC<PolicyCompletionProps> = () => {
  const [completedPolicies, setCompletedPolicies] = useState<PolicyRequest[]>([]);
  const [mergedReports, setMergedReports] = useState<UserReport[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<PolicyRequest | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);
  const [selectedReportId, setSelectedReportId] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showClaimModal, setShowClaimModal] = useState(false);
  const [selectedPolicyForClaim, setSelectedPolicyForClaim] = useState<string | null>(null);
  const [claimSubmitting, setClaimSubmitting] = useState(false);

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showActionsDropdown && !target.closest('.dropdown-container')) {
        setShowActionsDropdown(null);
      }
    };

    if (showActionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsDropdown]);

  useEffect(() => {
    const fetchCompletedData = async () => {
      setLoading(true);
      try {
        // Fetch both old completed policies and new merged reports
        const [approvedResponse, surveyedResponse, rejectedResponse, completedResponse, reportsResponse] = await Promise.all([
          getUserPolicyRequests("approved", 1, 100),
          getUserPolicyRequests("surveyed", 1, 100),
          getUserPolicyRequests("rejected", 1, 100),
          getUserPolicyRequests("completed", 1, 100),
          userReportAPI.getUserReports(1, 100)
        ]);

        const approved = approvedResponse.data.policyRequests || [];
        const surveyed = surveyedResponse.data.policyRequests || [];
        const rejected = rejectedResponse.data.policyRequests || [];
        const completed = completedResponse.data.policyRequests || [];

        setCompletedPolicies([...approved, ...surveyed, ...rejected, ...completed]);

        // Set merged reports (these are the new dual surveyor reports)
        if (reportsResponse.success) {
          setMergedReports(reportsResponse.data?.reports || []);
        }
      } catch (error) {
        console.error("Failed to fetch completed data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedData();
  }, []);

  const handleDownloadSurvey = (documentUrl: string) => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDeletePolicy = async (policy: PolicyRequest) => {
    try {
      await deletePolicyRequest(policy._id);
      setCompletedPolicies(prev => prev.filter(p => p._id !== policy._id));
      setShowDeleteModal(false);
      setPolicyToDelete(null);
      alert('Policy deleted successfully!');
    } catch (error) {
      console.error('Delete policy error:', error);
      alert('Failed to delete policy');
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

  const handleRequestClaim = (policyId: string) => {
    setSelectedPolicyForClaim(policyId);
    setShowClaimModal(true);
  };

  const handleSubmitClaim = async () => {
    if (!selectedPolicyForClaim) return;

    try {
      setClaimSubmitting(true);

      // Find the report to get property and contact details
      const report = mergedReports.find(r => r.policyId === selectedPolicyForClaim);
      if (!report) {
        alert('Report not found');
        return;
      }

      // Create a claim request using the policy data
      const response = await fetch('/api/v1/policy-requests', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${localStorage.getItem('token')}`
        },
        body: JSON.stringify({
          policyNumber: selectedPolicyForClaim.substring(0, 12),
          propertyDetails: {
            address: report.propertyAddress,
            propertyType: report.propertyType,
            buildingValue: 0, // Will be filled from policy data
          },
          contactDetails: {
            fullName: '', // Will be filled from user data
            email: '',
            phoneNumber: '',
          },
          requestDetails: {
            coverageType: 'Standard Coverage',
            policyDuration: '1 year',
          }
        })
      });

      if (response.ok) {
        alert('Claim request submitted successfully! The broker admin will review your claim.');
        setShowClaimModal(false);
        setSelectedPolicyForClaim(null);
      } else {
        const error = await response.json();
        alert(error.message || 'Failed to submit claim request');
      }
    } catch (error) {
      console.error('Claim submission error:', error);
      alert('Failed to submit claim request');
    } finally {
      setClaimSubmitting(false);
    }
  };

  // const handleProceedToPayment = (policy: PolicyRequest) => {
  //   // Redirect to the external payment verification URL
  //   const userId = localStorage.getItem("userId");
  //   const paymentUrl = `https://askniid.org/VerifyBuildersPolicy.aspx?ammcId=${policy._id}&userId=${userId}`;
  //   window.open(paymentUrl, '_blank', 'noopener,noreferrer');
  // };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="animate-pulse">
          <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="bg-white p-6 rounded-lg border border-gray-200">
            <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-start">
        <div>
          <h2 className="text-xl font-bold text-gray-900">Completed Permits</h2>
          <p className="text-gray-600">Download your approved survey reports, verify policies, and access AMMC verified permits.</p>
        </div>
        <button
          onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
          className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
        >
          <Shield className="h-4 w-4 mr-2" />
          Verify Policy
        </button>
      </div>

      {/* Merged Reports Section (New Dual Surveyor System) */}
      {mergedReports.length > 0 && (
        <div className="space-y-4 mb-8">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
              <Shield className="w-5 h-5 text-blue-600" />
              Dual Surveyor Assessment Reports
            </h3>
            <p className="text-sm text-gray-600 mt-1">
              Comprehensive reports combining assessments from both AMMC and NIA surveyors
            </p>
          </div>

          {mergedReports.map((report) => (
            <div key={report.reportId} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div className="flex-1">
                    <div className="flex items-center gap-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {report.propertyAddress}
                      </h3>
                      {report.isMerged && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                          <FileText className="w-3 h-3 mr-1" />
                          Merged Report
                        </span>
                      )}
                      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${report.status === 'released' ? 'bg-green-100 text-green-800' :
                        report.status === 'pending' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {report.status === 'released' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                          report.status === 'pending' ? <Clock className="w-3 h-3 mr-1" /> :
                            <XCircle className="w-3 h-3 mr-1" />}
                        {report.status === 'released' ? 'Released' :
                          report.status === 'pending' ? 'Processing' : 'Under Review'}
                      </span>
                      {report.conflictDetected && (
                        <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                          <AlertTriangle className="w-3 h-3 mr-1" />
                          Conflict Detected
                        </span>
                      )}
                    </div>
                    <p className="text-gray-600 mb-2">{report.propertyType}</p>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">Policy ID:</span>
                        <br />
                        {report.policyId.substring(0, 8)}...
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
                      <div>
                        <span className="font-medium">Status:</span>
                        <br />
                        Dual Assessment Complete
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
                            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${report.finalRecommendation === 'approve' ? 'bg-green-100 text-green-800' :
                              report.finalRecommendation === 'reject' ? 'bg-red-100 text-red-800' :
                                'bg-yellow-100 text-yellow-800'
                              }`}>
                              {report.finalRecommendation.replace('_', ' ').toUpperCase()}
                            </span>
                          </div>
                        )}
                      </div>
                    )}
                  </div>

                  <div className="flex items-center space-x-3">
                    <button
                      onClick={() => handleRequestClaim(report.policyId)}
                      className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors"
                    >
                      <FileText className="w-4 h-4 mr-2" />
                      Request Claim
                    </button>
                    <button
                      onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
                      className="flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-lg text-blue-700 bg-blue-50 hover:bg-blue-100"
                    >
                      <Shield className="h-4 w-4 mr-2" />
                      Verify Policy
                    </button>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Legacy Completed Policies Section */}
      {completedPolicies.length > 0 && (
        <div className="space-y-4">
          <div className="border-b border-gray-200 pb-4">
            <h3 className="text-lg font-semibold text-gray-900">Legacy Single Surveyor Reports</h3>
            <p className="text-sm text-gray-600 mt-1">
              Older reports from the single surveyor system
            </p>
          </div>

          {completedPolicies.map((policy) => (
            <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
              <div className="p-6">
                <div className="flex items-start justify-between mb-4">
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      {policy.propertyDetails.propertyType}
                    </h3>
                    <p className="text-gray-600">{policy.propertyDetails.address}</p>
                  </div>
                  <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${policy.status === 'approved' ? 'bg-green-100 text-green-800' :
                      policy.status === 'rejected' ? 'bg-red-100 text-red-800' :
                        policy.status === 'completed' ? 'bg-orange-100 text-orange-800' :
                          'bg-blue-100 text-blue-800'
                      }`}>
                      {policy.status === 'approved' ? <CheckCircle className="w-4 h-4 mr-1" /> :
                        policy.status === 'rejected' ? <XCircle className="w-4 h-4 mr-1" /> :
                          policy.status === 'completed' ? <Clock className="w-4 h-4 mr-1" /> :
                            <FileText className="w-4 h-4 mr-1" />}
                      {policy.status === 'approved' ? 'Approved' :
                        policy.status === 'rejected' ? 'Rejected' :
                          policy.status === 'completed' ? 'Completed' :
                            'Surveyed'}
                    </span>
                    {(policy.status === 'rejected' || policy.status === 'completed') && (
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setShowActionsDropdown(showActionsDropdown === policy._id ? null : policy._id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {showActionsDropdown === policy._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setPolicyToDelete(policy);
                                  setShowDeleteModal(true);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                              >
                                <Trash2 className="mr-3 h-4 w-4" />
                                Delete Permit
                              </button>
                            </div>
                          </div>
                        )}
                      </div>
                    )}
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Policy Details</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Coverage:</span> {policy.requestDetails.coverageType}</p>
                      <p><span className="font-medium">Duration:</span> {policy.requestDetails.policyDuration}</p>
                      <p><span className="font-medium">Building Value:</span> ₦{policy.propertyDetails.buildingValue.toLocaleString()}</p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-medium text-gray-900 mb-2">Survey Information</h4>
                    <div className="space-y-1 text-sm text-gray-600">
                      <p><span className="font-medium">Survey Date:</span> {new Date(policy.updatedAt).toLocaleDateString()}</p>
                      <p><span className="font-medium">Status:</span> {policy.status === 'approved' ? 'Approved by Admin' : 'Surveyed'}</p>
                    </div>
                  </div>
                </div>

                {policy.surveyNotes && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Survey Notes</h4>
                    <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                      {policy.surveyNotes}
                    </p>
                  </div>
                )}

                {policy.adminNotes && (
                  <div className="mb-6">
                    <h4 className="font-medium text-gray-900 mb-2">Admin Notes</h4>
                    <p className="text-sm text-gray-600 bg-blue-50 p-3 rounded">
                      {policy.adminNotes}
                    </p>
                  </div>
                )}

                <div className="flex flex-col sm:flex-row gap-3 pt-4 border-t border-gray-200">
                  {/* Verify Policy Button - Always Available */}
                  <button
                    onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
                    className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
                  >
                    <Shield className="h-4 w-4 mr-2" />
                    Verify Policy
                  </button>

                  {policy.surveyDocument && (
                    <button
                      onClick={() => handleDownloadSurvey(
                        typeof policy.surveyDocument === 'string'
                          ? policy.surveyDocument
                          : policy.surveyDocument!.url
                      )}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Survey Report
                    </button>
                  )}

                  {policy.status === 'approved' ? (
                    <button
                      onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
                      className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#028835] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Download Permit
                    </button>
                  ) : policy.status === 'rejected' ? (
                    <div className="inline-flex items-center px-6 py-2 border border-red-300 text-sm font-medium rounded-md text-red-700 bg-red-50">
                      <XCircle className="h-4 w-4 mr-2" />
                      Permit Rejected - Permit verification unavailable
                    </div>
                  ) : policy.status === 'completed' ? (
                    <div className="inline-flex items-center px-6 py-2 border border-orange-300 text-sm font-medium rounded-md text-orange-700 bg-orange-50">
                      <Clock className="h-4 w-4 mr-2" />
                      Policy Completed - Permit verification unavailable
                    </div>
                  ) : (
                    <div className="inline-flex items-center px-6 py-2 border border-yellow-300 text-sm font-medium rounded-md text-yellow-700 bg-yellow-50">
                      <Clock className="h-4 w-4 mr-2" />
                      Awaiting Admin Approval
                    </div>
                  )}
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Empty State */}
      {mergedReports.length === 0 && completedPolicies.length === 0 && (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FileText className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No completed reports</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your completed assessment reports will appear here once the dual surveyor process is complete.
          </p>
          <div className="mt-4">
            <button
              onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
              className="inline-flex items-center px-4 py-2 border border-blue-300 shadow-sm text-sm font-medium rounded-md text-blue-700 bg-blue-50 hover:bg-blue-100 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500"
            >
              <Shield className="h-4 w-4 mr-2" />
              Verify Policy
            </button>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && policyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Permit Request</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the permit request for "{policyToDelete.propertyDetails.address}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPolicyToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePolicy(policyToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Permit
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Merged Report Details Modal */}
      {selectedReportId && (
        <MergedReportDetailsModal
          reportId={selectedReportId}
          isOpen={isModalOpen}
          onClose={handleCloseModal}
        />
      )}

      {/* Claim Request Modal */}
      {showClaimModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-green-100">
                <FileText className="h-6 w-6 text-green-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Request Insurance Claim</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to submit a claim request for this completed policy?
                This will notify the broker admin to review your claim.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowClaimModal(false);
                    setSelectedPolicyForClaim(null);
                  }}
                  disabled={claimSubmitting}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleSubmitClaim}
                  disabled={claimSubmitting}
                  className="px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 flex items-center"
                >
                  {claimSubmitting ? (
                    <>
                      <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>
                      Submitting...
                    </>
                  ) : (
                    'Submit Claim Request'
                  )}
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default PolicyCompletion;
