"use client";

import React, { useEffect, useState } from "react";
import { ArrowLeft, AlertTriangle } from "lucide-react";
import { useRouter } from "next/navigation";
import SurveySubmissionModal from "./SurveySubmissionModal";
import SurveySubmissionConfirmation from "./SurveySubmissionConfirmation";
import { Assignment, SurveySubmissionResult } from "@/types/api.types";
import type { BuilderLiabilityPolicy } from "@/types/builderLiabilityPolicy.types";

interface SurveyAssessmentReportPageProps {
  assignmentId: string;
}

interface EnhancedAssignment extends Omit<Assignment, "policyId"> {
  policyId: BuilderLiabilityPolicy | string;
}

const SurveyAssessmentReportPage: React.FC<SurveyAssessmentReportPageProps> = ({
  assignmentId,
}) => {
  const router = useRouter();
  const [assignment, setAssignment] = useState<EnhancedAssignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [submissionResult, setSubmissionResult] =
    useState<SurveySubmissionResult | null>(null);
  const [showConfirmation, setShowConfirmation] = useState(false);

  useEffect(() => {
    const fetchAssignment = async () => {
      setLoading(true);
      setError(null);
      try {
        const { getSurveyorAssignmentById } = await import("@/services/api");
        const response = await getSurveyorAssignmentById(assignmentId);
        if (response.success) {
          setAssignment(response.data);
        } else {
          setError("Unable to load this survey assignment.");
        }
      } catch (fetchError) {
        setError("Unable to load this survey assignment.");
      } finally {
        setLoading(false);
      }
    };

    fetchAssignment();
  }, [assignmentId]);

  const handleBack = () => {
    router.push(`/surveyor/dashboard/assignments/${assignmentId}`);
  };

  const handleSurveySubmission = async (submission: FormData) => {
    if (!assignment) {
      throw new Error("No assignment selected for submission.");
    }

    const { submitSurvey } = await import("@/services/api");
    const policyId =
      typeof assignment.policyId === "object"
        ? (assignment.policyId as BuilderLiabilityPolicy)._id
        : assignment.policyId;

    submission.append("policyId", policyId);
    submission.append("assignmentId", assignmentId || "");

    const result = await submitSurvey(submission);
    setSubmissionResult(result.data);
    setShowConfirmation(true);

    setTimeout(async () => {
      try {
        const { getSurveyorAssignmentById } = await import("@/services/api");
        const response = await getSurveyorAssignmentById(assignmentId);
        if (response.success) {
          setAssignment(response.data);
        }
      } catch {
        // Keep the current data if refresh fails.
      }
    }, 1000);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-10 w-56 animate-pulse rounded-full bg-slate-200/80" />
        <div className="space-y-4 rounded-[1.5rem] border border-slate-200 bg-white p-6 shadow-sm">
          <div className="h-40 animate-pulse rounded-[1.25rem] bg-slate-200/80" />
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-slate-200/80" />
            <div className="h-28 animate-pulse rounded-[1.25rem] bg-slate-200/80" />
          </div>
        </div>
      </div>
    );
  }

  if (error || !assignment) {
    return (
      <div className="mx-auto flex min-h-[50vh] w-full max-w-3xl items-center justify-center">
        <div className="rounded-[1.75rem] border border-red-200 bg-white p-8 text-center shadow-sm">
          <AlertTriangle className="mx-auto h-10 w-10 text-red-500" />
          <h1 className="mt-4 text-xl font-semibold text-slate-900">
            Survey report unavailable
          </h1>
          <p className="mt-2 text-sm text-slate-600">
            {error || "We couldn't load this assignment right now."}
          </p>
          <button
            type="button"
            onClick={handleBack}
            className="mt-6 inline-flex items-center gap-2 rounded-full bg-[#028835] px-5 py-2.5 text-sm font-medium text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:bg-green-700 hover:shadow-lg"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to Assignment
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="mx-auto w-full max-w-6xl min-w-0 space-y-4 sm:space-y-5">
      <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
        <button
          type="button"
          onClick={handleBack}
          className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-4 py-2 text-sm font-medium text-slate-700 shadow-sm transition-all duration-300 hover:-translate-y-0.5 hover:border-emerald-200 hover:bg-emerald-50 hover:shadow-md"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to Assignment
        </button>
        <div className="inline-flex items-center rounded-full border border-emerald-200 bg-emerald-50 px-3 py-1 text-[11px] font-semibold uppercase tracking-[0.2em] text-emerald-700">
          Survey Assessment Report
        </div>
      </div>

      <SurveySubmissionModal
        variant="page"
        policy={assignment.policyId as any}
        assignment={assignment as Assignment}
        isOpen={true}
        onSubmit={handleSurveySubmission}
        onClose={handleBack}
      />

      {submissionResult && showConfirmation && (
        <SurveySubmissionConfirmation
          submissionResult={submissionResult}
          policy={assignment.policyId as any}
          onClose={() => {
            setShowConfirmation(false);
            setSubmissionResult(null);
            router.push(`/surveyor/dashboard/assignments/${assignmentId}`);
          }}
        />
      )}
    </div>
  );
};

export default SurveyAssessmentReportPage;
