import React from "react";
import PolicyManagement from "@/components/admin/PolicyManagement";
import { PolicyAssignment } from "@/types/api.types";

export default function PoliciesPage() {
  const handleAssignSurveyor = async (assignment: PolicyAssignment) => {
    try {
      // TODO: Call API to assign surveyor
      console.log("Assigning surveyor:", assignment);
      // await assignSurveyor(assignment);
      alert("Surveyor assigned successfully!");
    } catch (error) {
      console.error("Failed to assign surveyor:", error);
      alert("Failed to assign surveyor. Please try again.");
    }
  };

  const handleReviewSubmission = async (
    policyId: string, 
    decision: 'approved' | 'rejected', 
    notes: string
  ) => {
    try {
      // TODO: Call API to review submission
      console.log("Reviewing submission:", { policyId, decision, notes });
      // await reviewSubmission(policyId, decision, notes);
      alert(`Submission ${decision} successfully!`);
    } catch (error) {
      console.error("Failed to review submission:", error);
      alert("Failed to review submission. Please try again.");
    }
  };

  return (
    <div className="p-6">
      <PolicyManagement
        onAssignSurveyor={handleAssignSurveyor}
        onReviewSubmission={handleReviewSubmission}
      />
    </div>
  );
}