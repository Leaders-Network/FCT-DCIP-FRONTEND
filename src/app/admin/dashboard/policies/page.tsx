"use client";
import React from "react";
import PolicyManagement from "@/components/admin/PolicyManagement";
import { PolicyAssignment } from "@/types/api.types";
import { adminApi, withErrorHandling } from "@/services/adminApi";

export default function PoliciesPage() {
  const handleAssignSurveyor = withErrorHandling(
    async (assignment: PolicyAssignment) => {
      await adminApi.assignSurveyorToPolicy(assignment);
      alert("Surveyor assigned successfully!");
    },
    (error) => {
      alert(`Failed to assign surveyor: ${error.message}`);
    }
  );

  const handleReviewSubmission = withErrorHandling(
    async (policyId: string, decision: 'approved' | 'rejected', notes: string) => {
      await adminApi.reviewPolicySubmission(policyId, decision, notes);
      alert(`Submission ${decision} successfully!`);
    },
    (error) => {
      alert(`Failed to review submission: ${error.message}`);
    }
  );

  return (
    <PolicyManagement
      onAssignSurveyor={handleAssignSurveyor}
      onReviewSubmission={handleReviewSubmission}
    />
  );
}