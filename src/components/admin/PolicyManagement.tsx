
"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Users, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical, DollarSign } from 'lucide-react';
import { PolicyRequest, Surveyor } from '@/types/api.types';
import { adminApi, reviewSubmission, deletePolicyRequest } from '@/services/api';
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
  const [showDetailsModal, setShowDetailsModal] = useState(false);

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

  const handleFetchDocumentUrl = async (document: string | { cloudinaryUrl: string } | { name: string; url: string; publicId: string }) => {
    if (typeof document === 'string') {
      const response = await adminApi.getSurveyDocumentDownloadUrl(document);
      setDocumentUrl(response.data.url);
    } else if (document && 'cloudinaryUrl' in document) {
      setDocumentUrl(document.cloudinaryUrl);
    } else if (document && 'url' in document) {
      setDocumentUrl(document.url);
    }
  };

  const fetchPoliciesAndSurveyors = async () => {
    try {
      const [policiesResponse, surveyorsResponse] = await Promise.all([
        adminApi.getPolicies({ status: 'all', page: 1, limit: 100 }),
        adminApi.getSurveyors(),
      ]);
      setPolicies(policiesResponse.data.policyRequests);
      setSurveyors(surveyorsResponse.data);
    } catch (error) {
      console.error('Failed to fetch policies and surveyors:', error);
    }
  };

  useEffect(() => {
    fetchPoliciesAndSurveyors();
  }, []);

  const filteredPolicies = Array.isArray(policies)
    ? policies.filter(policy => activeTab === 'all' ? true : policy.status === activeTab)
    : [];

  const handleReviewSubmission = async (decision: 'approved' | 'rejected' | 'requires_more_info') => {
    try {
      if (!selectedPolicy || selectedPolicySubmissions.length === 0) return;

      const submissionId = selectedPolicySubmissions[0]._id;

      await reviewSubmission(submissionId, decision as 'approved' | 'rejected', reviewNotes);
      setPolicies(prev =>
        prev.map(p =>
          p._id === selectedPolicy._id
            ? { ...p, status: decision as any }
            : p
        )
      );
      setShowReviewModal(false);
      setReviewNotes("");
      const actionText = decision === 'approved' ? 'approved' :
        decision === 'rejected' ? 'rejected' :
          'marked as requiring more information';
      alert(`Submission ${actionText} successfully!`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to review submission: ${err.message}`);
    }
  };

  const handleSendToUser = async (ammcId: string) => {
    try {
      await adminApi.sendPolicyToUser(ammcId);
      setPolicies(prev =>
        prev.map(p =>
          p._id === ammcId
            ? { ...p, status: 'sent_to_user' as any }
            : p
        )
      );
      alert('Policy sent to user successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to send policy: ${err.message}`);
    }
  };

  const handleConfirmPayment = async (policy: PolicyRequest) => {
    const confirmed = window.confirm(
      `Confirm payment received for policy:\n\n` +
      `Property: ${policy.propertyDetails.propertyType}\n` +
      `Owner: ${policy.contactDetails.fullName}\n` +
      `Value: ₦${policy.propertyDetails.buildingValue.toLocaleString()}\n\n` +
      `This will mark the policy as COMPLETED and finalize the workflow.`
    );

    if (!confirmed) return;

    try {
      const { updatePolicyRequest } = await import('@/services/api');
      await updatePolicyRequest(policy._id, {
        status: 'completed',
        adminNotes: `Payment confirmed on ${new Date().toLocaleDateString()}`
      });

      setPolicies(prev =>
        prev.map(p =>
          p._id === policy._id
            ? { ...p, status: 'completed' as any }
            : p
        )
      );

      alert('Payment confirmed! Policy marked as completed.');
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to confirm payment: ${err.message}`);
    }
  };

  const handleDeletePolicy = async (policy: PolicyRequest) => {
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
  };

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
            { key: 'requires_more_info', label: 'Needs More Info', count: Array.isArray(policies) ? policies.filter(p => (p?.status as any) === 'requires_more_info').length : 0 },
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
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Builder/Contractor</th>
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
                      <p className="text-xs text-gray-400">RC: {policy.contactDetails.rcNumber || 'N/A'}</p>
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
                                setSelectedPolicy(policy);
                                setShowDetailsModal(true);
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
                              <>
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
                                <button
                                  onClick={() => {
                                    handleConfirmPayment(policy);
                                    setShowActionsDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                                >
                                  <DollarSign className="mr-3 h-4 w-4" />
                                  Confirm Payment
                                </button>
                              </>
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
                    <button onClick={() => selectedPolicy.surveyDocument && handleFetchDocumentUrl(selectedPolicy.surveyDocument)} className="text-blue-600 hover:text-blue-800">Show Document</button>
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

      {/* Policy Details Modal */}
      {showDetailsModal && selectedPolicy && (
        <PolicyDetailsModal
          policy={selectedPolicy}
          getStatusBadge={getStatusBadge}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}
    </div>
  );
};

// Policy Details Modal Component
interface PolicyDetailsModalProps {
  policy: PolicyRequest;
  getStatusBadge: (status: string) => JSX.Element;
  onClose: () => void;
}

const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({ policy, getStatusBadge, onClose }) => {
  const [surveyData, setSurveyData] = useState<import('@/types/survey.types').SurveyDataType | null>(null);
  const [assignmentData, setAssignmentData] = useState<import('@/types/survey.types').AssignmentDataType | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'survey' | 'documents'>('details');

  useEffect(() => {
    const fetchPolicyData = async () => {
      try {
        // If policy has been surveyed, fetch survey data
        if (policy.status === 'surveyed' || policy.status === 'approved' || policy.status === 'rejected') {
          // First get the assignment for this policy
          const assignmentResponse = await adminApi.getAssignmentByAmmcId(policy._id);

          if (assignmentResponse.success && assignmentResponse.data) {
            const assignment = assignmentResponse.data;
            setAssignmentData(assignment);

            // Then get the survey submission
            const { getSubmissionByAssignment } = await import('@/services/api');
            const surveyResponse = await getSubmissionByAssignment(assignment._id);
            if (surveyResponse.success && surveyResponse.data.submission) {
              setSurveyData(surveyResponse.data.submission);
            }
          }
        }
      } catch (error) {
        console.error('Failed to fetch policy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
  }, [policy._id, policy.status]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Policy Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Policy #{policy._id} • {policy.propertyDetails.propertyType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              {getStatusBadge(policy.status)}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Submitted:</span> {new Date(policy.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {(['details', 'survey', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {tab === 'survey' ? 'Survey Results' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {activeTab === 'details' && (
            <PolicyDetailsTab policy={policy} assignmentData={assignmentData} />
          )}

          {activeTab === 'survey' && (
            <PolicySurveyTab
              policy={policy}
              surveyData={surveyData}
              loading={loading}
            />
          )}

          {activeTab === 'documents' && (
            <PolicyDocumentsTab
              policy={policy}
              surveyData={surveyData}
              loading={loading}
            />
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Policy ID: {policy._id}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

// Policy Details Tab
interface AssignmentData {
  _id: string;
  surveyorId: string | null;
  status: string;
  assignedAt?: string;
  deadline?: string;
  priority?: string;
}

const PolicyDetailsTab: React.FC<{ policy: PolicyRequest; assignmentData: AssignmentData | null }> = ({
  policy,
  assignmentData
}) => (
  <div className="space-y-6">
    {/* Property Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Property Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.propertyType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium text-gray-900">₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Year Built:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.yearBuilt || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Square Footage:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.squareFootage?.toLocaleString() || 'N/A'} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Construction:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.constructionMaterial || 'N/A'}</span>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-gray-600 text-sm">Address:</span>
          <p className="text-sm text-gray-900 mt-1">{policy.propertyDetails.address}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Property Builder/Contractor</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Builder/Contractor:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.phoneNumber}</span>
          </div>
          {policy.contactDetails.alternatePhone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Alt Phone:</span>
              <span className="font-medium text-gray-900">{policy.contactDetails.alternatePhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">RC Number:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.rcNumber || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Coverage Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Coverage Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Coverage Type:</span>
            <span className="font-medium text-gray-900">{policy.requestDetails.coverageType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">1 Year</span>
          </div>
        </div>
        {policy.requestDetails.additionalCoverage && policy.requestDetails.additionalCoverage.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-600 text-sm">Additional Coverage:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {policy.requestDetails.additionalCoverage.map((coverage, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {coverage}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {assignmentData && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned:</span>
              <span className="font-medium text-gray-900">
                {assignmentData.assignedAt ? new Date(assignmentData.assignedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deadline:</span>
              <span className="font-medium text-gray-900">
                {assignmentData.deadline ? new Date(assignmentData.deadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className={`font-medium ${assignmentData.priority === 'urgent' ? 'text-red-600' :
                assignmentData.priority === 'high' ? 'text-orange-600' :
                  assignmentData.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                }`}>
                {assignmentData?.priority ? assignmentData.priority.toUpperCase() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Special Requests */}
    {policy.requestDetails.specialRequests && (
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">{policy.requestDetails.specialRequests}</p>
        </div>
      </div>
    )}
  </div>
);

// Policy Survey Tab
interface SurveyData {
  surveyDetails?: {
    propertyCondition?: string;
    structuralAssessment?: string;
    riskFactors?: string;
    recommendations?: string;
    estimatedValue?: number;
  };
  surveyNotes?: string;
  recommendedAction?: string;
  contactLog?: Array<{
    date: string;
    method: string;
    notes: string;
    successful: boolean;
  }>;
  documents?: Array<{
    fileName: string;
    cloudinaryUrl: string;
    category: string;
  }>;
  surveyDocument?: string;
  submissionTime?: string;
}

const PolicySurveyTab: React.FC<{
  policy: PolicyRequest;
  surveyData: SurveyData | null;
  loading: boolean;
}> = ({ policy, surveyData, loading }) => {
  if (policy.status === 'submitted' || policy.status === 'assigned') {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey not completed yet</p>
        <p className="text-sm">Survey results will appear here once the survey is completed.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading survey data...</p>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey data not found</p>
        <p className="text-sm">Unable to load survey results for this policy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Survey Assessment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Property Condition</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.propertyCondition || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Structural Assessment</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.structuralAssessment || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.riskFactors || 'No risk factors identified'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.recommendations || 'No recommendations provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Notes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Additional Survey Notes</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            {surveyData.surveyNotes || 'No additional notes provided'}
          </p>
        </div>
      </div>

      {/* Final Recommendation */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Final Recommendation</h4>
        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${surveyData.recommendedAction === 'approve'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : surveyData.recommendedAction === 'reject'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
          {surveyData.recommendedAction === 'approve' && '✅ Approve Policy'}
          {surveyData.recommendedAction === 'reject' && '❌ Reject Policy'}
          {surveyData.recommendedAction === 'request_more_info' && '📋 Request More Information'}
        </div>
      </div>

      {/* Contact Log */}
      {surveyData.contactLog && surveyData.contactLog.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Log</h4>
          <div className="space-y-3">
            {surveyData.contactLog?.map((entry, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="capitalize font-medium">{entry.method}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {entry.successful ? 'Success' : 'Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Policy Documents Tab
const PolicyDocumentsTab: React.FC<{
  policy: PolicyRequest;
  surveyData: SurveyData | null;
  loading: boolean;
}> = ({ policy, surveyData, loading }) => {
  if (loading && (policy.status === 'surveyed' || policy.status === 'approved' || policy.status === 'rejected')) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading documents...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">Policy Documents</h4>

      {/* Survey Document */}
      {(surveyData as any)?.surveyDocument && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-blue-900">Survey Report</h5>
                <p className="text-sm text-blue-700">Completed survey document (PDF)</p>
                <p className="text-xs text-blue-600 mt-1">
                  Submitted: {surveyData?.submissionTime ? new Date(surveyData.submissionTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={(surveyData as any)?.surveyDocument || '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View PDF
              </a>
              <a
                href={(surveyData as any)?.surveyDocument || '#'}
                download
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* No Documents Message */}
      {!surveyData?.surveyDocument && (
        <div className="text-center py-8 text-gray-500">
          <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
          <p>No documents available</p>
          <p className="text-sm">Documents will appear here once the survey is completed.</p>
        </div>
      )}
    </div>
  );
};

export default PolicyManagement;
