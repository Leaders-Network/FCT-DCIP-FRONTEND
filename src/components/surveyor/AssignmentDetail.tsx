"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, FileText, Upload, CheckCircle, Clock, Camera, RefreshCw } from "lucide-react";
import { Assignment, SurveySubmissionData, SurveySubmissionResult, DualAssignment } from "@/types/api.types";
import { useRouter } from "next/navigation";
import SurveySubmissionModal from "./SurveySubmissionModal";
import SurveySubmissionConfirmation from "./SurveySubmissionConfirmation";

interface AssignmentDetailProps {
  assignmentId: string;
}

// Use PolicyRequest directly from types
type PolicyDetails = import('@/types/api.types').PolicyRequest;

interface OtherSurveyorInfo {
  name?: string;
  fullName?: string;
  phone?: string;
  phonenumber?: string;
  email?: string;
  licenseNumber?: string;
  organization?: 'AMMC' | 'NIA';
}

interface DualAssignmentInfo {
  completionStatus: 0 | 50 | 100;
  assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
  priority: 'low' | 'medium' | 'high' | 'urgent';
  otherSurveyor?: OtherSurveyorInfo;
}

// Helper type: DualAssignmentInfo | DualAssignment union,
// but we need a common base that allows otherSurveyor for render time access
type DualAssignmentLike = DualAssignmentInfo | (DualAssignment & { otherSurveyor?: OtherSurveyorInfo });

interface EnhancedAssignment extends Omit<Assignment, 'ammcId' | 'dualAssignmentInfo'> {
  ammcId: PolicyDetails | string;
  dualAssignmentInfo?: DualAssignmentLike;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ assignmentId }) => {
  const [assignment, setAssignment] = useState<EnhancedAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const [submissionResult, setSubmissionResult] = useState<SurveySubmissionResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const { getSurveyorAssignmentById } = await import("@/services/api");
        const response = await getSurveyorAssignmentById(assignmentId);
        if (response.success) {
          setAssignment(response.data);
          console.log('Assignment data:', response.data);
        } else {
          // Handle error
        }
      } catch (error) {
        // Handle error
      }
      setLoading(false);
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleSurveySubmission = async (submission: FormData) => {
    try {
      if (!assignment) {
        throw new Error("No assignment selected for submission.");
      }

      const { submitSurvey } = await import("@/services/api");

      const ammcId = typeof assignment.ammcId === 'object' ? (assignment.ammcId as PolicyDetails)._id : assignment.ammcId;

      submission.append('ammcId', ammcId);
      submission.append('assignmentId', assignmentId || '');

      // The 'submission' FormData object now also includes the files from the modal

      const result = await submitSurvey(submission);

      // Store submission result for confirmation display
      setSubmissionResult(result.data);
      setShowSurveyForm(false);
      setShowConfirmation(true);

      // Refresh assignment data to show updated progress
      setTimeout(async () => {
        try {
          const { getSurveyorAssignmentById } = await import("@/services/api");
          const response = await getSurveyorAssignmentById(assignmentId);
          if (response.success) {
            setAssignment(response.data);
          }
        } catch (refreshError) {
          console.error("Failed to refresh assignment data:", refreshError);
        }
      }, 1000); // Small delay to allow backend processing
    } catch (error) {
      console.error("Failed to submit survey:", error);
      throw error;
    }
  };

  const handleContactUser = (method: 'phone' | 'email') => {
    if (!assignment || typeof assignment.ammcId === 'string') return;

    const policy = assignment.ammcId as PolicyDetails;
    if (method === 'phone') {
      window.open(`tel:${policy.contactDetails.phoneNumber}`);
    } else if (method === 'email') {
      window.open(`mailto:${policy.contactDetails.email}`);
    }
  };

  if (loading) {
    return (
      <div className="animate-pulse space-y-6">
        <div className="h-8 bg-gray-300 rounded w-1/3"></div>
        <div className="bg-white p-6 rounded-lg border border-gray-200">
          <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
          <div className="space-y-2">
            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
          </div>
        </div>
      </div>
    );
  }

  if (!assignment) {
    return (
      <div className="text-center py-12">
        <h2 className="text-xl font-semibold text-gray-900">Assignment not found</h2>
        <p className="text-gray-600 mt-2">The assignment you're looking for doesn't exist.</p>
      </div>
    );
  }



  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="p-6">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <button
                onClick={() => router.back()}
                className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
              >
                <ArrowLeft className="h-5 w-5" />
              </button>
              <div>
                <h1 className="text-2xl font-bold text-gray-900">AMMC Survey Assignment Details</h1>
                <p className="text-gray-600 mt-1">
                  {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.propertyType || 'AMMC Property Survey'}
                </p>
                <p className="text-sm text-gray-500 mt-1">
                  Assignment ID: {assignment._id}
                </p>
              </div>
            </div>
            <div className="flex items-center space-x-4">
              <div className="text-right">
                <div className="flex items-center space-x-2 mb-2">
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'assigned' ? 'bg-yellow-100 text-yellow-800' :
                    assignment.status === 'in_progress' ? 'bg-blue-100 text-blue-800' :
                      assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                        'bg-gray-100 text-gray-800'
                    }`}>
                    {assignment.status === 'assigned' ? <Clock className="w-3 h-3 mr-1" /> :
                      assignment.status === 'in_progress' ? <FileText className="w-3 h-3 mr-1" /> :
                        assignment.status === 'completed' ? <CheckCircle className="w-3 h-3 mr-1" /> :
                          <FileText className="w-3 h-3 mr-1" />}
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                  <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                    assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                      assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                        'bg-green-100 text-green-800'
                    }`}>
                    {assignment.priority.toUpperCase()} PRIORITY
                  </span>
                </div>
                <div className="text-sm text-gray-500">
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              {assignment.status === 'assigned' && (
                <button
                  onClick={() => setShowSurveyForm(true)}
                  className="bg-[#028835] text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] font-medium"
                >
                  Start Survey
                </button>
              )}
            </div>
          </div>
        </div>
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
            <span className="text-sm text-gray-500">
              Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
            </span>
          </div>
        </div>
        <div className="p-6">
          {/* Property Overview */}
          <div className="mb-6 p-4 bg-gray-50 rounded-lg">
            <div className="flex items-start justify-between">
              <div className="flex-1">
                <h3 className="text-lg font-semibold text-gray-900">
                  {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.propertyType || 'Property'}
                </h3>
                <p className="text-gray-600 mt-1 flex items-start">
                  <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
                  {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.address || assignment.location?.address || 'Address not available'}
                </p>
                <div className="flex items-center text-sm text-gray-500 mt-2">
                  <Calendar className="h-4 w-4 mr-1" />
                  Policy Request: {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.createdAt
                    ? new Date((assignment.ammcId as PolicyDetails).createdAt).toLocaleDateString()
                    : 'N/A'}
                </div>
              </div>
              <div className="text-right">
                <div className="text-lg font-semibold text-gray-900">
                  ₦{typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.buildingValue?.toLocaleString() || 'N/A'}
                </div>
                <div className="text-sm text-gray-500">Property Value</div>
              </div>
            </div>
          </div>

          {/* Property Details Grid */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Construction Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Material:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.constructionMaterial || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Year Built:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.yearBuilt || 'N/A'}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Square Footage:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.squareFootage?.toLocaleString() || 'N/A'} sq ft
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Assignment Timeline</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Assigned:</span>
                  <span className="font-medium text-gray-900">
                    {new Date(assignment.assignedAt).toLocaleDateString()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Deadline:</span>
                  <span className={`font-medium ${new Date(assignment.deadline) < new Date() ? 'text-red-600' : 'text-gray-900'
                    }`}>
                    {new Date(assignment.deadline).toLocaleDateString()}
                  </span>
                </div>
                {assignment.estimatedDuration && (
                  <div className="flex justify-between">
                    <span className="text-gray-600">Est. Duration:</span>
                    <span className="font-medium text-gray-900">
                      {assignment.estimatedDuration} hours
                    </span>
                  </div>
                )}
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Survey Requirements</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Priority:</span>
                  <span className={`font-medium ${assignment.priority === 'urgent' ? 'text-red-600' :
                    assignment.priority === 'high' ? 'text-orange-600' :
                      assignment.priority === 'medium' ? 'text-yellow-600' :
                        'text-green-600'
                    }`}>
                    {assignment.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span className="text-gray-600">Status:</span>
                  <span className="font-medium text-gray-900">
                    {assignment.status.replace('_', ' ').toUpperCase()}
                  </span>
                </div>
                {assignment.instructions && (
                  <div className="mt-2">
                    <span className="text-gray-600 text-xs">Special Instructions:</span>
                    <p className="text-xs text-gray-700 mt-1 bg-yellow-50 p-2 rounded">
                      {assignment.instructions}
                    </p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Dual Assignment Information */}
      {assignment.dualAssignmentInfo && (
        <div className="bg-indigo-50 rounded-lg border border-indigo-200 shadow-sm">
          <div className="px-6 py-4 border-b border-indigo-200">
            <div className="flex items-center justify-between">
              <h2 className="text-lg font-semibold text-indigo-900 flex items-center">
                <User className="h-5 w-5 mr-2" />
                Dual Surveyor Assignment
              </h2>
              <div className="flex items-center space-x-2">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.dualAssignmentInfo.completionStatus === 100 ? 'bg-green-100 text-green-800' :
                  assignment.dualAssignmentInfo.completionStatus === 50 ? 'bg-yellow-100 text-yellow-800' :
                    'bg-gray-100 text-gray-800'
                  }`}>
                  {assignment.dualAssignmentInfo.completionStatus}% Complete
                </span>
                <button
                  onClick={async () => {
                    try {
                      const { getSurveyorAssignmentById } = await import("@/services/api");
                      const response = await getSurveyorAssignmentById(assignmentId);
                      if (response.success) {
                        setAssignment(response.data);
                      }
                    } catch (error) {
                      console.error("Failed to refresh:", error);
                    }
                  }}
                  className="p-1 text-indigo-600 hover:text-indigo-800 hover:bg-indigo-50 rounded"
                  title="Refresh progress"
                >
                  <RefreshCw className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
          <div className="p-6">
            <div className="mb-4 p-4 bg-white rounded-lg border border-indigo-100">
              <h3 className="text-sm font-medium text-indigo-900 mb-2">Assignment Overview</h3>
              <p className="text-sm text-indigo-700 mb-4">
                This property requires dual surveyor assessment from both AMMC and NIA organizations.
                Coordinate with your partner surveyor to ensure comprehensive coverage.
              </p>

              {/* Progress Bar */}
              <div className="mb-4">
                <div className="flex justify-between text-sm text-indigo-700 mb-2">
                  <span className="font-medium">Overall Progress</span>
                  <span className="font-semibold">{assignment.dualAssignmentInfo.completionStatus}% Complete</span>
                </div>
                <div className="w-full bg-indigo-200 rounded-full h-3">
                  <div
                    className={`h-3 rounded-full transition-all duration-500 ${assignment.dualAssignmentInfo.completionStatus === 100
                      ? 'bg-green-500'
                      : assignment.dualAssignmentInfo.completionStatus === 50
                        ? 'bg-yellow-500'
                        : 'bg-indigo-400'
                      }`}
                    style={{ width: `${assignment.dualAssignmentInfo.completionStatus}%` }}
                  ></div>
                </div>
                <div className="flex justify-between text-xs text-indigo-600 mt-1">
                  <span>0%</span>
                  <span>50% (One Report)</span>
                  <span>100% (Both Reports)</span>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                <div>
                  <span className="text-indigo-600 font-medium">Status:</span>
                  <p className="text-indigo-800">{assignment.dualAssignmentInfo.assignmentStatus.replace('_', ' ').toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-indigo-600 font-medium">Priority:</span>
                  <p className="text-indigo-800">{assignment.dualAssignmentInfo.priority.toUpperCase()}</p>
                </div>
                <div>
                  <span className="text-indigo-600 font-medium">Completion:</span>
                  <p className="text-indigo-800">
                    {assignment.dualAssignmentInfo.completionStatus === 100
                      ? 'Both reports submitted'
                      : assignment.dualAssignmentInfo.completionStatus === 50
                        ? 'One report submitted'
                        : 'No reports submitted'
                    }
                  </p>
                </div>
              </div>
            </div>

            {assignment.dualAssignmentInfo && 'otherSurveyor' in assignment.dualAssignmentInfo && (
              <div className="bg-white rounded-lg border border-indigo-100 p-4">
                <h3 className="text-sm font-medium text-indigo-900 mb-3">
                  Partner Surveyor ({(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.organization || 'Unknown'})
                </h3>


                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-3">
                    <div className="flex items-center">
                      <User className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm font-medium text-gray-900">
                          {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.name ||
                            (assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.fullName ||
                            'Name not available'}
                        </p>
                        <p className="text-xs text-gray-500">
                          {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.organization || 'Unknown'} Surveyor
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Phone className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.phone ||
                            (assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.phonenumber ||
                            'Phone not available'}
                        </p>
                        <p className="text-xs text-gray-500">Primary Contact</p>
                      </div>
                    </div>

                    <div className="flex items-center">
                      <Mail className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                      <div>
                        <p className="text-sm text-gray-900">
                          {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.email || 'Email not available'}
                        </p>
                        <p className="text-xs text-gray-500">Email Address</p>
                      </div>
                    </div>

                    {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.licenseNumber && (
                      <div className="flex items-center">
                        <FileText className="h-4 w-4 text-indigo-500 mr-3 flex-shrink-0" />
                        <div>
                          <p className="text-sm text-gray-900">
                            {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor!.licenseNumber}
                          </p>
                          <p className="text-xs text-gray-500">License Number</p>
                        </div>
                      </div>
                    )}
                  </div>

                  <div className="space-y-2">
                    <h4 className="text-xs font-medium text-gray-500 uppercase tracking-wide">Contact Actions</h4>
                    <div className="space-y-2">
                      <button
                        onClick={() => {
                          const phone = (assignment.dualAssignmentInfo as DualAssignmentInfo)?.otherSurveyor?.phone ||
                            (assignment.dualAssignmentInfo as DualAssignmentInfo)?.otherSurveyor?.phonenumber;
                          if (phone) {
                            window.open(`tel:${phone}`);
                          } else {
                            alert('Phone number not available');
                          }
                        }}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Phone className="h-4 w-4 mr-2" />
                        Call Partner
                      </button>
                      <button
                        onClick={() => {
                          const email = (assignment.dualAssignmentInfo as DualAssignmentInfo)?.otherSurveyor?.email;
                          if (email) {
                            window.open(`mailto:${email}`);
                          } else {
                            alert('Email address not available');
                          }
                        }}
                        className="w-full inline-flex items-center justify-center px-3 py-2 border border-indigo-300 shadow-sm text-sm font-medium rounded-md text-indigo-700 bg-white hover:bg-indigo-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
                      >
                        <Mail className="h-4 w-4 mr-2" />
                        Email Partner
                      </button>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Coordination Guidelines */}
            <div className="mt-4 bg-amber-50 border border-amber-200 rounded-lg p-4">
              <h3 className="text-sm font-medium text-amber-900 mb-2">Coordination Guidelines</h3>
              <ul className="text-sm text-amber-800 space-y-1">
                <li>• Contact your partner surveyor before site visit to coordinate timing</li>
                <li>• Share findings and observations to ensure comprehensive assessment</li>
                <li>• Both surveyors must submit reports for complete evaluation</li>
                <li>• Reports will be automatically merged once both are submitted</li>
              </ul>
            </div>
          </div>
        </div>
      )}

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Property Builder/Contractor Details */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Property Builder/Contractor</h4>
              <div className="space-y-3">
                <div className="flex items-center">
                  <User className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-base font-medium text-gray-900">
                      {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.contactDetails?.fullName || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Property Builder/Contractor</p>
                  </div>
                </div>

                <div className="flex items-center">
                  <Phone className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div className="flex-1">
                    <p className="text-base text-gray-900">
                      {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.contactDetails?.phoneNumber || 'N/A'}
                    </p>
                    {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.contactDetails?.alternatePhone && (
                      <p className="text-sm text-gray-600">
                        Alt: {(assignment.ammcId as PolicyDetails).contactDetails.alternatePhone}
                      </p>
                    )}
                  </div>
                </div>

                <div className="flex items-center">
                  <Mail className="h-5 w-5 text-gray-400 mr-3 flex-shrink-0" />
                  <div>
                    <p className="text-base text-gray-900">
                      {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.contactDetails?.email || 'N/A'}
                    </p>
                    <p className="text-sm text-gray-500">Primary Email</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Contact Actions & Site Contact */}
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Contact Actions</h4>
              <div className="space-y-3">
                <div className="flex space-x-2">
                  <button
                    onClick={() => handleContactUser('phone')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    <Phone className="h-4 w-4 mr-2" />
                    Call Owner
                  </button>
                  <button
                    onClick={() => handleContactUser('email')}
                    className="flex-1 inline-flex items-center justify-center px-4 py-2 border border-gray-300 shadow-sm text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
                  >
                    <Mail className="h-4 w-4 mr-2" />
                    Email Owner
                  </button>
                </div>

                {/* Site Contact Information */}
                {assignment.location?.contactPerson && (
                  <div className="mt-4 p-3 bg-blue-50 rounded-lg">
                    <h5 className="text-sm font-medium text-blue-900 mb-2">Site Contact Person</h5>
                    <div className="space-y-1 text-sm">
                      <p className="text-blue-800">
                        <span className="font-medium">Name:</span> {assignment.location.contactPerson.name}
                      </p>
                      <p className="text-blue-800">
                        <span className="font-medium">Phone:</span> {assignment.location.contactPerson.phone}
                      </p>
                      {assignment.location.contactPerson.email && (
                        <p className="text-blue-800">
                          <span className="font-medium">Email:</span> {assignment.location.contactPerson.email}
                        </p>
                      )}
                      {assignment.location.contactPerson.availableHours && (
                        <p className="text-blue-800">
                          <span className="font-medium">Available:</span> {assignment.location.contactPerson.availableHours}
                        </p>
                      )}
                    </div>
                  </div>
                )}

                {/* Access Instructions */}
                {assignment.location?.accessInstructions && (
                  <div className="mt-3 p-3 bg-yellow-50 rounded-lg">
                    <h5 className="text-sm font-medium text-yellow-900 mb-1">Access Instructions</h5>
                    <p className="text-sm text-yellow-800">{assignment.location.accessInstructions}</p>
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Requirements & Policy Details */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Policy & Coverage Requirements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Coverage Details</h4>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-gray-600">Coverage Type:</span>
                  <span className="font-medium text-gray-900">
                    {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.requestDetails?.coverageType || 'N/A'}
                  </span>
                </div>
                {/* Policy Duration removed - always 1 year */}
                <div className="flex justify-between">
                  <span className="text-gray-600">Property Value:</span>
                  <span className="font-medium text-gray-900">
                    ₦{typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.propertyDetails?.buildingValue?.toLocaleString() || 'N/A'}
                  </span>
                </div>
              </div>
            </div>

            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-3">Survey Focus Areas</h4>
              <div className="space-y-1 text-sm text-gray-600">
                <p>• Structural integrity assessment</p>
                <p>• Fire safety compliance</p>
                <p>• Security measures evaluation</p>
                <p>• Environmental risk factors</p>
                <p>• Building code compliance</p>
              </div>
            </div>
          </div>

          {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.requestDetails?.additionalCoverage && (assignment.ammcId as PolicyDetails).requestDetails.additionalCoverage!.length > 0 && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Additional Coverage Requested</h4>
              <div className="flex flex-wrap gap-2">
                {(assignment.ammcId as PolicyDetails).requestDetails.additionalCoverage!.map((coverage: string, index: number) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-3 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800 border border-blue-200"
                  >
                    {coverage}
                  </span>
                ))}
              </div>
            </div>
          )}

          {typeof assignment.ammcId === 'object' && (assignment.ammcId as PolicyDetails)?.requestDetails?.specialRequests && (
            <div className="mb-4">
              <h4 className="text-sm font-medium text-gray-500 mb-2">Special Requests from Client</h4>
              <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
                <p className="text-sm text-amber-800">
                  {(assignment.ammcId as PolicyDetails).requestDetails.specialRequests}
                </p>
              </div>
            </div>
          )}

          {assignment.specialRequirements && assignment.specialRequirements.length > 0 && (
            <div>
              <h4 className="text-sm font-medium text-gray-500 mb-2">Survey Requirements</h4>
              <div className="bg-green-50 border border-green-200 rounded-lg p-3">
                <ul className="space-y-1 text-sm text-green-800">
                  {assignment.specialRequirements.map((req, index) => (
                    <li key={index} className="flex items-start">
                      <span className="mr-2">•</span>
                      <span>{req}</span>
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Survey Guidelines & Checklist */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-blue-50 rounded-lg border border-blue-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
              <FileText className="h-5 w-5 mr-2" />
              AMMC Survey Guidelines
            </h2>
            <div className="space-y-3 text-sm text-blue-800">
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Conduct thorough inspection of property structure and surroundings</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Document existing damages, hazards, or risk factors with photos</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Verify property details match the information provided</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Assess compliance with local building codes and safety standards</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Interview property builder/contractor about construction history</span>
              </div>
              <div className="flex items-start">
                <CheckCircle className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Provide detailed recommendations based on findings</span>
              </div>
            </div>
          </div>
        </div>

        <div className="bg-green-50 rounded-lg border border-green-200">
          <div className="p-6">
            <h2 className="text-lg font-semibold text-green-900 mb-4 flex items-center">
              <Upload className="h-5 w-5 mr-2" />
              Required Documentation
            </h2>
            <div className="space-y-3 text-sm text-green-800">
              <div className="flex items-start">
                <Camera className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Exterior photos (all sides, roof, foundation)</span>
              </div>
              <div className="flex items-start">
                <Camera className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Interior photos (main rooms, electrical, plumbing)</span>
              </div>
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Detailed survey report with findings</span>
              </div>
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Risk assessment and recommendations</span>
              </div>
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Contact log with property builder/contractor</span>
              </div>
              <div className="flex items-start">
                <FileText className="h-4 w-4 mr-2 mt-0.5 flex-shrink-0" />
                <span>Compliance verification checklist</span>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Actions */}
      {assignment.status === 'assigned' && (
        <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
          <div className="p-6">
            <h3 className="text-lg font-semibold text-gray-900 mb-4">Ready to Start?</h3>
            <div className="flex flex-col sm:flex-row gap-4">
              <button
                onClick={() => {
                  console.log('Start Survey Process clicked');
                  setShowSurveyForm(true);
                }}
                className="flex-1 bg-[#028835] text-white px-6 py-3 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835] font-medium flex items-center justify-center"
              >
                <FileText className="h-5 w-5 mr-2" />
                Start Survey Process
              </button>
              <button
                onClick={() => handleContactUser('phone')}
                className="flex-1 bg-blue-600 text-white px-6 py-3 rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 font-medium flex items-center justify-center"
              >
                <Phone className="h-5 w-5 mr-2" />
                Contact Builder/Contractor
              </button>
            </div>
            <p className="text-sm text-gray-500 mt-3 text-center">
              Make sure to contact the property builder/contractor before visiting the site
            </p>
          </div>
        </div>
      )}

      {/* Survey Submission Modal */}
      {assignment && typeof assignment.ammcId === 'object' && (
        <SurveySubmissionModal
          policy={assignment.ammcId as PolicyDetails}
          assignment={assignment as Assignment}
          isOpen={showSurveyForm}
          onSubmit={handleSurveySubmission}
          onClose={() => setShowSurveyForm(false)}
        />
      )}

      {/* Submission Confirmation Modal */}
      {submissionResult && showConfirmation && assignment && typeof assignment.ammcId === 'object' && (
        <SurveySubmissionConfirmation
          submissionResult={submissionResult}
          policy={assignment.ammcId as PolicyDetails}
          onClose={() => {
            setShowConfirmation(false);
            setSubmissionResult(null);
            router.push("/surveyor/dashboard/assignments");
          }}
        />
      )}
    </div>
  );
};

export default AssignmentDetail;