"use client";
import React, { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import SurveySubmissionForm from "@/components/surveyor/SurveySubmissionForm";
import { submitSurvey, getSurveyorAssignmentById } from "@/services/api";
import { PolicyRequest, SurveySubmission } from "@/types/api.types";

interface SurveyPageProps {
  params: {
    id: string;
  };
}

export default function SurveyPage({ params }: SurveyPageProps) {
  const [policy, setPolicy] = useState<PolicyRequest | null>(null);
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      try {
        const response = await getSurveyorAssignmentById(params.id);
        setPolicy(response.data.policyId);
      } catch (error) {
        console.error("Failed to fetch assignment:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [params.id]);

  const handleSurveySubmission = async (submission: Omit<SurveySubmission, 'surveyorId' | 'policyId'> & { surveyDocument: File }) => {
    try {
      const formData = new FormData();
      formData.append('policyId', policy!._id);
      formData.append('assignmentId', params.id);
      formData.append('surveyNotes', submission.surveyNotes);
      formData.append('recommendedAction', submission.recommendedAction);
      formData.append('contactLog', JSON.stringify(submission.contactLog));
      formData.append('surveyDetails', JSON.stringify(submission.surveyDetails));
      if (submission.surveyDocument) {
        formData.append('surveyDocument', submission.surveyDocument);
      }

      await submitSurvey(formData);

      alert("Survey submitted successfully!");
      router.push("/surveyor/dashboard/assignments");
    } catch (error) {
      console.error("Failed to submit survey:", error);
      throw error;
    }
  };

  const handleCancel = () => {
    router.back();
  };

  if (loading) {
    return (
      <div className="p-6">
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
      </div>
    );
  }

  if (!policy) {
    return (
      <div className="p-6">
        <div className="text-center py-12">
          <h2 className="text-xl font-semibold text-gray-900">Policy not found</h2>
          <p className="text-gray-600 mt-2">The policy you're looking for doesn't exist.</p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex-1 h-full">
      <SurveySubmissionForm
        policy={policy}
        onSubmit={handleSurveySubmission}
        onCancel={handleCancel}
      />
    </div>
  );
}