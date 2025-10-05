"use client";
import React from "react";
import AssignmentManagement from "@/components/AssignmentManagement";
import { Assignment } from "@/types/api.types";
import { adminApi, withErrorHandling } from "@/services/adminApi";

const AssignmentsPage = () => {
  const handleCreateAssignment = withErrorHandling(
    async (assignmentData: Partial<Assignment>) => {
      const result = await adminApi.createAssignment(assignmentData);
      console.log('Assignment created:', result);
      alert('Assignment created successfully!');
    },
    (error) => {
      alert(`Failed to create assignment: ${error.message}`);
    }
  );

  const handleUpdateAssignment = withErrorHandling(
    async (id: string, assignmentData: Partial<Assignment>) => {
      const result = await adminApi.updateAssignment(id, assignmentData);
      console.log('Assignment updated:', result);
      alert('Assignment updated successfully!');
    },
    (error) => {
      alert(`Failed to update assignment: ${error.message}`);
    }
  );

  const handleReassignSurveyor = withErrorHandling(
    async (assignmentId: string, newSurveyorId: string) => {
      const result = await adminApi.reassignSurveyor(assignmentId, newSurveyorId);
      console.log('Surveyor reassigned:', result);
      alert('Surveyor reassigned successfully!');
    },
    (error) => {
      alert(`Failed to reassign surveyor: ${error.message}`);
    }
  );

  return (
    <AssignmentManagement
      viewMode="admin"
      className="p-6"
    />
  );
};

export default AssignmentsPage;