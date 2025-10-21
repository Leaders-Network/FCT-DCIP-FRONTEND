"use client";
import React, { useState, useEffect } from "react";
import { Download, ExternalLink, CheckCircle, Clock, FileText, XCircle, Trash2, MoreVertical } from "lucide-react";
import { PolicyRequest } from "@/types/api.types";
import { downloadFile } from "@/services/fileService";
import { getUserPolicyRequests } from "@/services/api";

interface PolicyCompletionProps {}

const PolicyCompletion: React.FC<PolicyCompletionProps> = () => {
  const [completedPolicies, setCompletedPolicies] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<PolicyRequest | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);

  useEffect(() => {
    const fetchCompletedPolicies = async () => {
      setLoading(true);
      try {
        const [approvedResponse, surveyedResponse, rejectedResponse] = await Promise.all([
          getUserPolicyRequests("approved", 1, 100),
          getUserPolicyRequests("surveyed", 1, 100),
          getUserPolicyRequests("rejected", 1, 100),
        ]);
        const approved = approvedResponse.data.policyRequests || [];
        const surveyed = surveyedResponse.data.policyRequests || [];
        const rejected = rejectedResponse.data.policyRequests || [];
        setCompletedPolicies([...approved, ...surveyed, ...rejected]);
      } catch (error) {
        console.error("Failed to fetch completed policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchCompletedPolicies();
  }, []);

  const handleDownloadSurvey = (documentUrl: string) => {
    window.open(documentUrl, '_blank', 'noopener,noreferrer');
  };

  const handleDeletePolicy = async (policy: PolicyRequest) => {
    try {
      const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL}/policy/${policy._id}`, {
        method: 'DELETE',
        headers: {
          'Authorization': `Bearer ${localStorage.getItem('token')}`,
          'Content-Type': 'application/json',
          'apiKey': process.env.NEXT_PUBLIC_API_KEY || ''
        }
      });

      if (response.ok) {
        setCompletedPolicies(prev => prev.filter(p => p._id !== policy._id));
        setShowDeleteModal(false);
        setPolicyToDelete(null);
      } else {
        const errorData = await response.json();
        alert(errorData.message || 'Failed to delete policy');
      }
    } catch (error) {
      console.error('Delete policy error:', error);
      alert('Failed to delete policy');
    }
  };

  // const handleProceedToPayment = (policy: PolicyRequest) => {
  //   // Redirect to the external payment verification URL
  //   const userId = localStorage.getItem("userId");
  //   const paymentUrl = `https://askniid.org/VerifyBuildersPolicy.aspx?policyId=${policy._id}&userId=${userId}`;
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
      <div>
        <h2 className="text-xl font-bold text-gray-900">Completed Policies</h2>
        <p className="text-gray-600">Download your approved survey reports and proceed to payment.</p>
      </div>

      {completedPolicies.length > 0 ? (
        <div className="space-y-4">
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
                    <span className={`inline-flex items-center px-3 py-1 rounded-full text-sm font-medium ${policy.status === 'approved' ? 'bg-green-100 text-green-800' : policy.status === 'rejected' ? 'bg-red-100 text-red-800' : 'bg-blue-100 text-blue-800'}`}>
                      {policy.status === 'approved' ? <CheckCircle className="w-4 h-4 mr-1" /> : policy.status === 'rejected' ? <XCircle className="w-4 h-4 mr-1" /> : <FileText className="w-4 h-4 mr-1" />}
                      {policy.status === 'approved' ? 'Approved' : policy.status === 'rejected' ? 'Rejected' : 'Surveyed'}
                    </span>
                    {policy.status === 'rejected' && (
                      <div className="relative">
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
                                Delete Policy
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
                  {policy.surveyDocument && (
                    <button
                      onClick={() => handleDownloadSurvey(policy.surveyDocument!)}
                      className="inline-flex items-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download Survey Report
                    </button>
                  )}
                  
                  <button
                    onClick={() => window.open("https://askniid.org/verifypolicy.aspx", "_blank")}
                    disabled={policy.status === 'rejected'}
                    className="inline-flex items-center px-6 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-[#028835] hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] disabled:bg-gray-400 disabled:cursor-not-allowed"
                  >
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Proceed to Payment
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="text-center py-12">
          <div className="mx-auto h-12 w-12 text-gray-400">
            <FileText className="h-full w-full" />
          </div>
          <h3 className="mt-2 text-sm font-medium text-gray-900">No completed policies</h3>
          <p className="mt-1 text-sm text-gray-500">
            Your approved policies will appear here once the survey and admin review process is complete.
          </p>
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
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Policy Request</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the policy request for "{policyToDelete.propertyDetails.address}"? This action cannot be undone.
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
                  Delete Policy
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
