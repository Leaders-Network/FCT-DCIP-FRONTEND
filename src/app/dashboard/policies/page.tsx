"use client";
import React, { useState, useEffect } from "react";
import PolicyCompletion from "@/components/dashboard/PolicyCompletion";
import PolicyDetailsWithDualSurveyor from "@/components/dashboard/PolicyDetailsWithDualSurveyor";
import EnhancedPolicyDetails from "@/components/dashboard/EnhancedPolicyDetails";
import DualSurveyorProgress from "@/components/dashboard/DualSurveyorProgress";

import {
  FileText,
  Clock,
  Users,
  Eye,
  ArrowRight,
  Building,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle
} from "lucide-react";
import { getUserPolicyRequests } from "@/services/api";

interface PolicyRequest {
  _id: string;
  propertyDetails: {
    propertyType: string;
    address: string;
    buildingValue: number;
  };
  contactDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'rejected'>('in-progress');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [inProgressPolicies, setInProgressPolicies] = useState<PolicyRequest[]>([]);
  const [completedPolicies, setCompletedPolicies] = useState<PolicyRequest[]>([]);
  const [rejectedPolicies, setRejectedPolicies] = useState<PolicyRequest[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInProgressPolicies();
    fetchCompletedPolicies();
    fetchRejectedPolicies();
  }, []);

  const fetchCompletedPolicies = async () => {
    try {
      const [approvedResponse, surveyedResponse, completedResponse] = await Promise.all([
        getUserPolicyRequests("approved", 1, 100),
        getUserPolicyRequests("surveyed", 1, 100),
        getUserPolicyRequests("completed", 1, 100),
      ]);

      const approved = approvedResponse.data.policyRequests || [];
      const surveyed = surveyedResponse.data.policyRequests || [];
      const completed = completedResponse.data.policyRequests || [];

      const allCompleted = [...approved, ...surveyed, ...completed];
      setCompletedPolicies(allCompleted);
      setCompletedCount(allCompleted.length);
    } catch (error) {
      console.error("Failed to fetch completed policies:", error);
    }
  };

  const fetchRejectedPolicies = async () => {
    try {
      console.log('🔍 Fetching rejected policies...');
      const response = await getUserPolicyRequests("rejected", 1, 100);
      console.log('📊 Rejected policies response:', response);
      const rejected = response.data?.policyRequests || [];
      console.log(`✅ Found ${rejected.length} rejected policies`);
      setRejectedPolicies(rejected);
      setRejectedCount(rejected.length);
    } catch (error) {
      console.error("❌ Failed to fetch rejected policies:", error);
      setRejectedPolicies([]);
      setRejectedCount(0);
    }
  };

  const fetchInProgressPolicies = async () => {
    try {
      setLoading(true);
      const [submittedResponse, assignedResponse] = await Promise.all([
        getUserPolicyRequests("submitted", 1, 100),
        getUserPolicyRequests("assigned", 1, 100),
      ]);

      const submitted = submittedResponse.data.policyRequests || [];
      const assigned = assignedResponse.data.policyRequests || [];

      setInProgressPolicies([...submitted, ...assigned]);
    } catch (error) {
      console.error("Failed to fetch in-progress policies:", error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Assignment
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Users className="w-3 h-3 mr-1" />
            Survey In Progress
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

  const getMockDualSurveyorData = (policy: PolicyRequest) => {
    // Mock data for demonstration - in real implementation this would come from API
    const isAssigned = policy.status === 'assigned';

    return {
      assignmentStatus: isAssigned ? 'partially_assigned' as const : 'unassigned' as const,
      completionStatus: 0 as const,
      ammcSurveyorContact: isAssigned ? {
        name: 'John Adebayo',
        email: 'j.adebayo@ammc.gov.ng',
        phone: '+234 803 123 4567'
      } : undefined,
      niaSurveyorContact: undefined,
      priority: 'medium',
      estimatedCompletion: {
        overallDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  };

  if (selectedPolicyId) {
    return (
      <div className="p-0">
        {showEnhancedView ? (
          <EnhancedPolicyDetails
            policyId={selectedPolicyId}
            onBack={() => {
              setSelectedPolicyId(null);
              setShowEnhancedView(false);
            }}
          />
        ) : (
          <PolicyDetailsWithDualSurveyor
            policyId={selectedPolicyId}
            onBack={() => setSelectedPolicyId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Header with Stats */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Policies</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your insurance policy requests
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{inProgressPolicies.length}</div>
              <div className="text-[10px] sm:text-xs text-blue-600 font-medium">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-[10px] sm:text-xs text-green-600 font-medium">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-[10px] sm:text-xs text-red-600 font-medium">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-4 sm:mb-6 flex flex-wrap sm:inline-flex">
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'in-progress'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">In Progress</span>
            <span className="sm:hidden">Progress</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {inProgressPolicies.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'completed'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Completed</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {completedCount}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'rejected'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Rejected</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {rejectedCount}
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'in-progress' ? (
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-20 sm:w-24"></div>
                  </div>
                  <div className="h-24 sm:h-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : inProgressPolicies.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {inProgressPolicies.map((policy) => {
                const dualSurveyorData = getMockDualSurveyorData(policy);

                return (
                  <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6">
                      {/* Policy Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {policy.propertyDetails.propertyType}
                            </h3>
                            {getStatusBadge(policy.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{policy.propertyDetails.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Submitted {new Date(policy.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <button
                          onClick={() => {
                            setSelectedPolicyId(policy._id);
                            setShowEnhancedView(true);
                          }}
                          className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                        >
                          <TrendingUp className="w-4 h-4 mr-2" />
                          View Progress
                        </button>
                      </div>

                      {/* Dual Surveyor Progress - Compact Version */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Survey Progress</h4>
                          <span className="text-sm font-bold text-gray-900">
                            {dualSurveyorData.completionStatus}%
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${dualSurveyorData.completionStatus === 0 ? 'bg-gray-200' :
                              dualSurveyorData.completionStatus === 50 ? 'bg-yellow-400' :
                                'bg-green-500'
                              }`}
                            style={{ width: `${dualSurveyorData.completionStatus}%` }}
                          ></div>
                        </div>

                        <div className="grid grid-cols-2 gap-4">
                          {/* AMMC Surveyor Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dualSurveyorData.ammcSurveyorContact ? 'bg-green-100' : 'bg-gray-100'
                              }`}>
                              <Building className={`w-4 h-4 ${dualSurveyorData.ammcSurveyorContact ? 'text-green-600' : 'text-gray-400'
                                }`} />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-900">AMMC Surveyor</div>
                              <div className="text-xs text-gray-600">
                                {dualSurveyorData.ammcSurveyorContact ? 'Assigned' : 'Not Assigned'}
                              </div>
                            </div>
                          </div>

                          {/* NIA Surveyor Status */}
                          <div className="flex items-center space-x-3">
                            <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dualSurveyorData.niaSurveyorContact ? 'bg-blue-100' : 'bg-gray-100'
                              }`}>
                              <Building className={`w-4 h-4 ${dualSurveyorData.niaSurveyorContact ? 'text-blue-600' : 'text-gray-400'
                                }`} />
                            </div>
                            <div>
                              <div className="text-xs font-medium text-gray-900">NIA Surveyor</div>
                              <div className="text-xs text-gray-600">
                                {dualSurveyorData.niaSurveyorContact ? 'Assigned' : 'Not Assigned'}
                              </div>
                            </div>
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            Status: {
                              dualSurveyorData.assignmentStatus === 'unassigned' ? 'Awaiting Assignment' :
                                dualSurveyorData.assignmentStatus === 'partially_assigned' ? 'Partially Assigned' :
                                  'Fully Assigned'
                            }
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedPolicyId(policy._id)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Progress
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                            <button
                              onClick={() => {
                                setSelectedPolicyId(policy._id);
                                setShowEnhancedView(true);
                              }}
                              className="flex items-center text-xs text-green-600 hover:text-green-800 transition-colors"
                            >
                              Enhanced
                              <TrendingUp className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText className="h-full w-full" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">No policies in progress</h3>
              <p className="mt-1 text-sm text-gray-500">
                Your submitted policies will appear here as they progress through the dual-surveyor assessment.
              </p>
            </div>
          )}
        </div>
      ) : activeTab === 'completed' ? (
        <div className="space-y-6">
          {completedPolicies.length > 0 ? (
            completedPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {policy.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Completed {new Date(policy.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy._id);
                      setShowEnhancedView(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No completed policies</h3>
              <p className="mt-1 text-sm text-gray-500">
                Completed policies will appear here.
              </p>
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {rejectedPolicies.length > 0 ? (
            rejectedPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Rejected {new Date(policy.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy._id);
                      setShowEnhancedView(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">No rejected policies</h3>
              <p className="mt-1 text-sm text-gray-500">
                Rejected policies will appear here.
              </p>
            </div>
          )}
        </div>
      )}
    </div>
  );
}
