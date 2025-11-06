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
  TrendingUp
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
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed'>('in-progress');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [inProgressPolicies, setInProgressPolicies] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInProgressPolicies();
  }, []);

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
      <div className="p-6">
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
    <div className="p-6">
      {/* Header */}
      <div className="mb-6">
        <h1 className="text-2xl font-bold text-gray-900 mb-2">Policy Management</h1>
        <p className="text-gray-600">
          Track your policy requests through the dual-surveyor assessment process
        </p>
      </div>

      {/* Tabs */}
      <div className="border-b border-gray-200 mb-6">
        <nav className="-mb-px flex space-x-8">
          <button
            onClick={() => setActiveTab('in-progress')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'in-progress'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            In Progress ({inProgressPolicies.length})
          </button>
          <button
            onClick={() => setActiveTab('completed')}
            className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === 'completed'
              ? 'border-blue-500 text-blue-600'
              : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
          >
            Completed (2)
          </button>
        </nav>
      </div>

      {/* Tab Content */}
      {activeTab === 'in-progress' ? (
        <div className="space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-6 rounded-lg border border-gray-200 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-24"></div>
                  </div>
                  <div className="h-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : inProgressPolicies.length > 0 ? (
            <div className="space-y-6">
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
                        <div className="flex items-center space-x-3">
                          <button
                            onClick={() => setSelectedPolicyId(policy._id)}
                            className="flex items-center px-3 py-2 text-sm font-medium text-blue-600 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors"
                          >
                            <Eye className="w-4 h-4 mr-2" />
                            View Details
                          </button>
                          <button
                            onClick={() => {
                              setSelectedPolicyId(policy._id);
                              setShowEnhancedView(true);
                            }}
                            className="flex items-center px-3 py-2 text-sm font-medium text-green-600 bg-green-50 rounded-lg hover:bg-green-100 transition-colors"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            Enhanced View
                          </button>
                        </div>
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
      ) : (
        <PolicyCompletion />
      )}
    </div>
  );
}
