"use client";
import React, { useState, useEffect } from "react";
import { ArrowLeft, MapPin, Calendar, User, Phone, Mail, FileText, Upload } from "lucide-react";
import { Assignment, SurveySubmission } from "@/types/api.types";
import { useRouter } from "next/navigation";
import SurveySubmissionForm from "./SurveySubmissionForm";

interface AssignmentDetailProps {
  assignmentId: string;
}

const AssignmentDetail: React.FC<AssignmentDetailProps> = ({ assignmentId }) => {
  const [assignment, setAssignment] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [showSurveyForm, setShowSurveyForm] = useState(false);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const { getSurveyorAssignmentById } = await import("@/services/api");
        const response = await getSurveyorAssignmentById(assignmentId);
        if (response.success) {
          setAssignment(response.data);
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

  const handleSurveySubmission = async (submission: Omit<SurveySubmission, 'surveyorId'> & { surveyDocument: File }) => {
    try {
      const { submitSurvey } = await import("@/services/api");
      
      const formData = new FormData();
      formData.append('policyId', submission.policyId);
      formData.append('assignmentId', assignmentId || '');
      formData.append('surveyNotes', submission.surveyNotes);
      formData.append('recommendedAction', submission.recommendedAction);
      formData.append('surveyDocument', submission.surveyDocument);
      submission.contactLog.forEach((log, index) => {
        formData.append(`contactLog[${index}][date]`, log.date);
        formData.append(`contactLog[${index}][method]`, log.method);
        formData.append(`contactLog[${index}][notes]`, log.notes);
        formData.append(`contactLog[${index}][successful]`, log.successful.toString());
      });

      await submitSurvey(formData);
      alert("Survey submitted successfully!");
      setShowSurveyForm(false);
      router.push("/surveyor/dashboard/assignments");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      throw error;
    }
  };

  const handleContactUser = (method: 'phone' | 'email') => {
    if (!assignment) return;

    if (method === 'phone') {
      window.open(`tel:${assignment.policyId.contactDetails.phoneNumber}`);
    } else if (method === 'email') {
      window.open(`mailto:${assignment.policyId.contactDetails.email}`);
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

  if (showSurveyForm) {
    return (
      <SurveySubmissionForm
        policy={assignment.policyId}
        onSubmit={handleSurveySubmission}
        onCancel={() => setShowSurveyForm(false)}
      />
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center">
          <button
            onClick={() => router.back()}
            className="mr-4 p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-full"
          >
            <ArrowLeft className="h-5 w-5" />
          </button>
          <div>
            <h1 className="text-2xl font-bold text-gray-900">Assignment Details</h1>
            <p className="text-gray-600">Review property information and contact details</p>
          </div>
        </div>
        {assignment.status === 'assigned' && (
          <button
            onClick={() => setShowSurveyForm(true)}
            className="bg-[#028835] text-white px-4 py-2 rounded-md hover:bg-green-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-[#028835]"
          >
            Start Survey
          </button>
        )}
      </div>

      {/* Property Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Property Information</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Property Type</h3>
              <p className="text-base text-gray-900">{assignment.policyId.propertyDetails.propertyType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Construction Material</h3>
              <p className="text-base text-gray-900">{assignment.policyId.propertyDetails.constructionMaterial}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Building Value</h3>
              <p className="text-base text-gray-900">₦{assignment.policyId.propertyDetails.buildingValue.toLocaleString()}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Year Built</h3>
              <p className="text-base text-gray-900">{assignment.policyId.propertyDetails.yearBuilt}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Square Footage</h3>
              <p className="text-base text-gray-900">{assignment.policyId.propertyDetails.squareFootage.toLocaleString()} sq ft</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Assignment Date</h3>
              <p className="text-base text-gray-900 flex items-center">
                <Calendar className="h-4 w-4 mr-1" />
                {new Date(assignment.policyId.createdAt).toLocaleDateString()}
              </p>
            </div>
          </div>
          
          <div className="mt-6">
            <h3 className="text-sm font-medium text-gray-500 mb-2">Address</h3>
            <p className="text-base text-gray-900 flex items-start">
              <MapPin className="h-4 w-4 mr-2 mt-1 flex-shrink-0" />
              {assignment.policyId.propertyDetails.address}
            </p>
          </div>
        </div>
      </div>

      {/* Contact Information */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Contact Information</h2>
        </div>
        <div className="p-6">
          <div className="flex items-start justify-between">
            <div className="space-y-4">
              <div className="flex items-center">
                <User className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Property Owner</p>
                  <p className="text-base text-gray-900">{assignment.policyId.contactDetails.fullName}</p>
                </div>
              </div>
              
              <div className="flex items-center">
                <Phone className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Phone Number</p>
                  <p className="text-base text-gray-900">{assignment.policyId.contactDetails.phoneNumber}</p>
                  {assignment.policyId.contactDetails.alternatePhone && (
                    <p className="text-sm text-gray-600">Alt: {assignment.policyId.contactDetails.alternatePhone}</p>
                  )}
                </div>
              </div>
              
              <div className="flex items-center">
                <Mail className="h-5 w-5 text-gray-400 mr-3" />
                <div>
                  <p className="text-sm font-medium text-gray-500">Email Address</p>
                  <p className="text-base text-gray-900">{assignment.policyId.contactDetails.email}</p>
                </div>
              </div>
            </div>
            
            <div className="flex flex-col space-y-2">
              <button
                onClick={() => handleContactUser('phone')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Phone className="h-4 w-4 mr-1" />
                Call
              </button>
              <button
                onClick={() => handleContactUser('email')}
                className="inline-flex items-center px-3 py-2 border border-gray-300 shadow-sm text-sm leading-4 font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50"
              >
                <Mail className="h-4 w-4 mr-1" />
                Email
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* Coverage Requirements */}
      <div className="bg-white rounded-lg border border-gray-200 shadow-sm">
        <div className="px-6 py-4 border-b border-gray-200">
          <h2 className="text-lg font-semibold text-gray-900">Coverage Requirements</h2>
        </div>
        <div className="p-6">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Coverage Type</h3>
              <p className="text-base text-gray-900">{assignment.policyId.requestDetails.coverageType}</p>
            </div>
            <div>
              <h3 className="text-sm font-medium text-gray-500 mb-1">Policy Duration</h3>
              <p className="text-base text-gray-900">{assignment.policyId.requestDetails.policyDuration}</p>
            </div>
          </div>
          
          {assignment.policyId.requestDetails.additionalCoverage && assignment.policyId.requestDetails.additionalCoverage.length > 0 && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Additional Coverage</h3>
              <div className="flex flex-wrap gap-2">
                {assignment.policyId.requestDetails.additionalCoverage.map((coverage, index) => (
                  <span
                    key={index}
                    className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                  >
                    {coverage}
                  </span>
                ))}
              </div>
            </div>
          )}
          
          {assignment.policyId.requestDetails.specialRequests && (
            <div className="mt-4">
              <h3 className="text-sm font-medium text-gray-500 mb-2">Special Requests</h3>
              <p className="text-base text-gray-700 bg-gray-50 p-3 rounded">
                {assignment.policyId.requestDetails.specialRequests}
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Survey Guidelines */}
      <div className="bg-blue-50 rounded-lg border border-blue-200">
        <div className="p-6">
          <h2 className="text-lg font-semibold text-blue-900 mb-4 flex items-center">
            <FileText className="h-5 w-5 mr-2" />
            Survey Guidelines
          </h2>
          <div className="space-y-2 text-sm text-blue-800">
            <p>• Conduct a thorough inspection of the property structure and surroundings</p>
            <p>• Document any existing damages, hazards, or risk factors</p>
            <p>• Verify property details match the information provided</p>
            <p>• Take photographs of key areas (exterior, interior, special features)</p>
            <p>• Assess compliance with local building codes and safety standards</p>
            <p>• Provide detailed recommendations based on your findings</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AssignmentDetail;