"use client";
import React from "react";
import AssignmentManagement from "@/components/AssignmentManagement";
import { Assignment } from "@/types/api.types";
import { adminApi } from "@/services/api";

const AssignmentsPage = () => {
  const handleCreateAssignment = async (assignmentData: Partial<Assignment>) => {
    try {
      const result = await adminApi.createAssignment(assignmentData);
      console.log('Assignment created:', result);
      alert('Assignment created successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to create assignment: ${err.message}`);
    }
  };

  const handleUpdateAssignment = async (id: string, assignmentData: Partial<Assignment>) => {
    try {
      const result = await adminApi.updateAssignment(id, assignmentData);
      console.log('Assignment updated:', result);
      alert('Assignment updated successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to update assignment: ${err.message}`);
    }
  };

  const handleReassignSurveyor = async (assignmentId: string, newSurveyorId: string) => {
    try {
      const result = await adminApi.reassignSurveyor(assignmentId, newSurveyorId);
      console.log('Surveyor reassigned:', result);
      alert('Surveyor reassigned successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to reassign surveyor: ${err.message}`);
    }
  };

  return (
    <AssignmentManagement
      viewMode="admin"
      className="p-6"
    />
  );
};

export default AssignmentsPage;