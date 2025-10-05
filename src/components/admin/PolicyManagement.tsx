"use client";
import React, { useState, useEffect } from "react";
import { Eye, Users, Calendar, CheckCircle, XCircle, Clock } from "lucide-react";
import { PolicyRequest, Surveyor, PolicyAssignment } from "@/types/api.types";

interface PolicyManagementProps {
  onAssignSurveyor: (assignment: PolicyAssignment) => Promise<void>;
  onReviewSubmission: (policyId: string, decision: 'approved' | 'rejected', notes: string) => Promise<void>;
}

const PolicyManagement: React.FC<PolicyManagementProps> = ({
  onAssignSurveyor,
  onReviewSubmission,
}) => {
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [selectedSurveyors, setSelectedSurveyors] = useState<string[]>([]);
  const [assignmentNotes, setAssignmentNotes] = useState("");
  const [reviewNotes, setReviewNotes] = useState("");
  const [priority, setPriority] = useState<'low' | 'medium' | 'high'>('medium');
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'assigned' | 'surveyed'>('all');

  // Fetch real data from API
  useEffect(() => {
    const fetchPoliciesAndSurveyors = async () => {
      try {
        const { getPolicyRequests, getAdminSurveyors } = await import("@/services/api");
        
        // Fetch policies and surveyors in parallel
        const [policiesResponse, surveyorsResponse] = await Promise.allSettled([
          getPolicyRequests('all', 1, 100),
          getAdminSurveyors()
        ]);
        
        // Handle policies response
        if (policiesResponse.status === 'fulfilled' && policiesResponse.value?.data) {
          setPolicies(policiesResponse.value.data);
        } else {
          setPolicies([]);
        }
        
        // Handle surveyors response
        if (surveyorsResponse.status === 'fulfilled' && surveyorsResponse.value?.data) {
          setSurveyors(surveyorsResponse.value.data);
        } else {
          setSurveyors([]);
        }
        
      } catch (error) {
        console.error("Failed to fetch policies and surveyors:", error);
        setPolicies([]);
        setSurveyors([]);
      }
    };

    fetchPoliciesAndSurveyors();
  }, []);

  // Mock data removed - now using real API calls above
  // Mock surveyors data removed - now using real API call above

  const filteredPolicies = policies.filter(policy => {
    if (activeTab === 'all') return true;
    return policy.status === activeTab;
  });

  const handleAssignSurveyors = async () => {
    if (!selectedPolicy || selectedSurveyors.length === 0) return;

    const assignment: PolicyAssignment = {
      policyId: selectedPolicy._id,
      surveyorIds: selectedSurveyors,
      assignedBy: "current_admin_id", // Get from auth context
      priority,
      instructions: assignmentNotes,
      deadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
    };

    try {
      await onAssignSurveyor(assignment);
      // Update local state
      setPolicies(prev => 
        prev.map(p => 
          p._id === selectedPolicy._id 
            ? { ...p, status: 'assigned', assignedSurveyors: selectedSurveyors }
            : p
        )
      );
      setShowAssignModal(false);
      setSelectedSurveyors([]);
      setAssignmentNotes("");
    } catch (error) {
      console.error("Failed to assign surveyors:", error);
    }
  };

  const handleReviewSubmission = async (decision: 'approved' | 'rejected') => {
    if (!selectedPolicy) return;

    try {
      await onReviewSubmission(selectedPolicy._id, decision, reviewNotes);
      // Update local state
      setPolicies(prev => 
        prev.map(p => 
          p._id === selectedPolicy._id 
            ? { ...p, status: decision === 'approved' ? 'approved' : 'rejected' }
            : p
        )
      );
      setShowReviewModal(false);
      setReviewNotes("");
    } catch (error) {
      console.error("Failed to review submission:", error);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      submitted: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Submitted" },
      assigned: { color: "bg-blue-100 text-blue-800", icon: Users, text: "Assigned" },
      surveyed: { color: "bg-purple-100 text-purple-800", icon: Eye, text: "Surveyed" },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Rejected" },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle, text: "Completed" }
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

      {/* Tab Navigation */}
      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Policies', count: policies.length },
            { key: 'submitted', label: 'Submitted', count: policies.filter(p => p.status === 'submitted').length },
            { key: 'assigned', label: 'Assigned', count: policies.filter(p => p.status === 'assigned').length },
            { key: 'surveyed', label: 'Surveyed', count: policies.filter(p => p.status === 'surveyed').length }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as any)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${
                activeTab === tab.key
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

      {/* Policies Table */}
      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Property Details
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Contact
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Coverage
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Status
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Date
                </th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                  Actions
                </th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.map((policy) => (
                <tr key={policy._id} className="hover:bg-gray-50">
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.propertyDetails.address}
                      </p>
                      <p className="text-xs text-gray-400">
                        ₦{policy.propertyDetails.buildingValue.toLocaleString()}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {policy.contactDetails.fullName}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.contactDetails.email}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.contactDetails.phoneNumber}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div>
                      <p className="text-sm font-medium text-gray-900">
                        {policy.requestDetails.coverageType}
                      </p>
                      <p className="text-sm text-gray-500">
                        {policy.requestDetails.policyDuration}
                      </p>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {getStatusBadge(policy.status)}
                  </td>
                  <td className="px-6 py-4 text-sm text-gray-500">
                    {new Date(policy.createdAt).toLocaleDateString()}
                  </td>
                  <td className="px-6 py-4 text-sm font-medium space-x-2">
                    <button
                      onClick={() => setSelectedPolicy(policy)}
                      className="text-[#028835] hover:text-green-700"
                    >
                      View
                    </button>
                    {policy.status === 'submitted' && (
                      <button
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowAssignModal(true);
                        }}
                        className="text-blue-600 hover:text-blue-900"
                      >
                        Assign
                      </button>
                    )}
                    {policy.status === 'surveyed' && (
                      <button
                        onClick={() => {
                          setSelectedPolicy(policy);
                          setShowReviewModal(true);
                        }}
                        className="text-purple-600 hover:text-purple-900"
                      >
                        Review
                      </button>
                    )}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Assign Surveyor Modal */}
      {showAssignModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Assign Surveyors</h3>
              <button
                onClick={() => setShowAssignModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Select Surveyors
                </label>
                {surveyors.map((surveyor) => (
                  <label key={surveyor._id} className="flex items-center mb-2">
                    <input
                      type="checkbox"
                      className="mr-2"
                      checked={selectedSurveyors.includes(surveyor._id)}
                      onChange={(e) => {
                        if (e.target.checked) {
                          setSelectedSurveyors([...selectedSurveyors, surveyor._id]);
                        } else {
                          setSelectedSurveyors(selectedSurveyors.filter(id => id !== surveyor._id));
                        }
                      }}
                    />
                    <div>
                      <p className="text-sm font-medium">
                        {surveyor.firstname} {surveyor.lastname}
                      </p>
                      <p className="text-xs text-gray-500">
                        {surveyor.specializations?.join(", ") || 'No specializations'} • Rating: {surveyor.rating}/5
                      </p>
                    </div>
                  </label>
                ))}
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Priority
                </label>
                <select
                  value={priority}
                  onChange={(e) => setPriority(e.target.value as any)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="low">Low</option>
                  <option value="medium">Medium</option>
                  <option value="high">High</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={assignmentNotes}
                  onChange={(e) => setAssignmentNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Any special instructions for the surveyors..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => setShowAssignModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleAssignSurveyors}
                  disabled={selectedSurveyors.length === 0}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Assign Surveyors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Review Submission Modal */}
      {showReviewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Review Survey Submission</h3>
              <button
                onClick={() => setShowReviewModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedPolicy.surveyDocument && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Survey Document
                  </label>
                  <a
                    href={`/documents/${selectedPolicy.surveyDocument}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-blue-600 hover:text-blue-800"
                  >
                    View Document ({typeof selectedPolicy.surveyDocument === 'string' ? selectedPolicy.surveyDocument : 'Document'})
                  </a>
                </div>
              )}

              {selectedPolicy.surveyNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Surveyor Notes
                  </label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedPolicy.surveyNotes}
                  </p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Review Notes
                </label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => setShowReviewModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleReviewSubmission('rejected')}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReviewSubmission('approved')}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  Approve
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