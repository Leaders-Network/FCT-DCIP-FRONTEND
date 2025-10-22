
"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Users, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical } from 'lucide-react';
import { PolicyRequest, Surveyor } from '@/types/api.types';
import { adminApi, withErrorHandling, reviewSubmission, deletePolicyRequest } from '@/services/api';
import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';
import AssignSurveyorModal from './AssignSurveyorModal';

interface PolicyManagementProps { }

const PolicyManagement: React.FC<PolicyManagementProps> = ({ }) => {
  const router = useRouter();
  const { user } = useAuth();
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedPolicySubmissions, setSelectedPolicySubmissions] = useState<any[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'assigned' | 'surveyed' | 'requires_more_info' | 'rejected'>('all');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<PolicyRequest | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);

  const handleFetchDocumentUrl = async (document: any) => {
    if (typeof document === 'string') {
      const response = await adminApi.getSurveyDocumentDownloadUrl(document);
      setDocumentUrl(response.data.url);
    } else if (document && document.cloudinaryUrl) {
      setDocumentUrl(document.cloudinaryUrl);
    }
  };

  const fetchPoliciesAndSurveyors = async () => {
    const fetcher = withErrorHandling(async () => {
      const [policiesResponse, surveyorsResponse] = await Promise.all([
        adminApi.getPolicies({ status: 'all', page: 1, limit: 100 }),
        adminApi.getSurveyors(),
      ]);
      setPolicies(policiesResponse.data.policyRequests);
      setSurveyors(surveyorsResponse.data);
    });
    fetcher();
  };

  useEffect(() => {
    fetchPoliciesAndSurveyors();
  }, []);

  const filteredPolicies = Array.isArray(policies)
    ? policies.filter(policy => activeTab === 'all' ? true : policy.status === activeTab)
    : [];

  const handleReviewSubmission = withErrorHandling(async (decision: 'approved' | 'rejected' | 'requires_more_info') => {
    if (!selectedPolicy || selectedPolicySubmissions.length === 0) return;

    const submissionId = selectedPolicySubmissions[0]._id;

    await reviewSubmission(submissionId, decision, reviewNotes);
    setPolicies(prev =>
      prev.map(p =>
        p._id === selectedPolicy._id
          ? { ...p, status: decision }
          : p
      )
    );
    setShowReviewModal(false);
    setReviewNotes("");
    const actionText = decision === 'approved' ? 'approved' :
      decision === 'rejected' ? 'rejected' :
        'marked as requiring more information';
    alert(`Submission ${actionText} successfully!`);
  });

  const handleSendToUser = withErrorHandling(async (ammcId: string) => {
    await adminApi.sendPolicyToUser(ammcId);
    setPolicies(prev =>
      prev.map(p =>
        p._id === ammcId
          ? { ...p, status: 'sent_to_user' }
          : p
      )
    );
    alert('Policy sent to user successfully!');
  });

  const handleDeletePolicy = withErrorHandling(async (policy: PolicyRequest) => {
    try {
      await deletePolicyRequest(policy._id);
      setPolicies(prev => prev.filter(p => p._id !== policy._id));
      setShowDeleteModal(false);
      setPolicyToDelete(null);
      alert('Policy deleted successfully!');
    } catch (error) {
      console.error('Delete policy error:', error);
      alert('Failed to delete policy');
    }
  });

  const getStatusBadge = (status: string) => {
    const badges = {
      submitted: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Submitted" },
      assigned: { color: "bg-blue-100 text-blue-800", icon: Users, text: "Assigned" },
      surveyed: { color: "bg-purple-100 text-purple-800", icon: Eye, text: "Surveyed" },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Rejected" },
      requires_more_info: { color: "bg-orange-100 text-orange-800", icon: Clock, text: "Requires More Info" },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle, text: "Completed" },
      sent_to_user: { color: "bg-cyan-100 text-cyan-800", icon: CheckCircle, text: "Sent to User" }
    };

    const badge = badges[status as keyof typeof badges] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Policy Management</h2>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Policies', count: Array.isArray(policies) ? policies.length : 0 },
            { key: 'submitted', label: 'Submitted', count: Array.isArray(policies) ? policies.filter(p => p?.status === 'submitted').length : 0 },
            { key: 'assigned', label: 'Assigned', count: Array.isArray(policies) ? policies.filter(p => p?.status === 'assigned').length : 0 },
            { key: 'surveyed', label: 'Surveyed', count: Array.isArray(policies) ? policies.filter(p => p?.status === 'surveyed').length : 0 },
            { key: 'requires_more_info', label: 'Needs More Info', count: Array.isArray(policies) ? policies.filter(p => p?.status === 'requires_more_info').length : 0 },
            { key: 'rejected', label: 'Rejected', count: Array.isArray(policies) ? policies.filter(p => p?.status === 'rejected').length : 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
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

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Contact</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies?.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.propertyDetails.propertyType}</p>
                      <p className="text-sm text-gray-500 truncate max-w-xs">{policy.propertyDetails.address}</p>
                      <p className="text-xs text-gray-400">₦{policy.propertyDetails.buildingValue.toLocaleString()}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{policy.contactDetails.fullName}</p>
                      <p className="text-sm text-gray-500">{policy.contactDetails.email}</p>
                      <p className="text-sm text-gray-500">{policy.contactDetails.phoneNumber}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">{policy.requestDetails.coverageType}</p>
                      <p className="text-sm text-gray-500">{policy.requestDetails.policyDuration}</p>
                    </div>
                  </td>
                  <td className="px-6 py-4">{getStatusBadge(policy.status)}</td>
                  <td className="px-6 py-4 text-sm text-gray-500">{new Date(policy.createdAt).toLocaleDateString()}</td>
                  <td className="px-6 py-4 text-sm font-medium">
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
                                setSelectedPolicy(policy);
                                setShowActionsDropdown(null);
                              }}
                              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                            >
                              <Eye className="mr-3 h-4 w-4" />
                              View Details
                            </button>
                            {policy.status === 'submitted' && (
                              <button
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setShowAssignModal(true);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                              >
                                <Users className="mr-3 h-4 w-4" />
                                Assign Surveyor
                              </button>
                            )}
                            {policy.status === 'surveyed' && (
                              <button
                                onClick={async () => {
                                  setSelectedPolicy(policy);
                                  const response = await adminApi.getSurveySubmissions({ ammcId: policy._id });
                                  setSelectedPolicySubmissions(response.data.submissions);
                                  setShowReviewModal(true);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 w-full text-left"
                              >
                                <CheckCircle className="mr-3 h-4 w-4" />
                                Review Submission
                              </button>
                            )}
                            {policy.status === 'approved' && (
                              <button
                                onClick={() => {
                                  handleSendToUser(policy._id);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                              >
                                <CheckCircle className="mr-3 h-4 w-4" />
                                Send to User
                              </button>
                            )}
                            {['submitted', 'assigned', 'rejected'].includes(policy.status) && (
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
                            )}
                          </div>
                        </div>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModal && (
        <AssignSurveyorModal
          show={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedPolicy={selectedPolicy}
          onAssignmentCreated={fetchPoliciesAndSurveyors}
          onAssignmentReassigned={fetchPoliciesAndSurveyors}
        />
      )}

      {showReviewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Review Survey Submission</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setDocumentUrl(null);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedPolicy.surveyDocument && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Survey Document</label>
                  {!documentUrl && (
                    <button onClick={() => handleFetchDocumentUrl(selectedPolicy.surveyDocument)} className="text-blue-600 hover:text-blue-800">Show Document</button>
                  )}
                  {documentUrl && (
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Document</a>
                  )}
                </div>
              )}

              {selectedPolicy.surveyNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surveyor Notes</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedPolicy.surveyNotes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button
                  onClick={() => {
                    if (!reviewNotes) {
                      alert('Please provide feedback in the review notes when rejecting a submission.');
                      return;
                    }
                    handleReviewSubmission('rejected');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (!reviewNotes) {
                      alert('Please provide feedback in the review notes when requesting more information.');
                      return;
                    }
                    handleReviewSubmission('requires_more_info');
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Request More Info
                </button>
                <button onClick={() => handleReviewSubmission('approved')} className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700">Approve</button>
              </div>
            </div>
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

export default PolicyManagement;
