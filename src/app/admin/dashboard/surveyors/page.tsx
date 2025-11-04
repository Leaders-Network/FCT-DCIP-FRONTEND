"use client";
import React from "react";
import SurveyorManagement from "@/components/admin/SurveyorManagement";
import { Surveyor } from "@/types/api.types";
import { adminApi, withErrorHandling } from "@/services/api";

const SurveyorsPage = () => {
  const handleCreateSurveyor = withErrorHandling(
    async (surveyorData: Partial<Surveyor>) => {
      // Ensure AMMC organization is set for surveyors created through AMMC admin
      const ammcSurveyorData = {
        ...surveyorData,
        organization: 'AMMC'
      };
      const result = await adminApi.createSurveyor(ammcSurveyorData);
      console.log('AMMC Surveyor created:', result);
      alert('AMMC Surveyor created successfully!');
    },
    (error) => {
      alert(`Failed to create surveyor: ${error.message}`);
    }
  );

  const handleUpdateSurveyor = withErrorHandling(
    async (id: string, surveyorData: Partial<Surveyor>) => {
      const result = await adminApi.updateSurveyor(id, surveyorData);
      console.log('Surveyor updated:', result);
      alert('Surveyor updated successfully!');
    },
    (error) => {
      alert(`Failed to update surveyor: ${error.message}`);
    }
  );

  const handleDeleteSurveyor = withErrorHandling(
    async (id: string) => {
      await adminApi.deleteSurveyor(id);
      console.log('Surveyor deleted successfully');
      alert('Surveyor deleted successfully!');
    },
    (error) => {
      alert(`Failed to delete surveyor: ${error.message}`);
    }
  );

  return (
    <SurveyorManagement
      onCreateSurveyor={handleCreateSurveyor}
      onUpdateSurveyor={handleUpdateSurveyor}
      onDeleteSurveyor={handleDeleteSurveyor}
    />
  );
};

export default SurveyorsPage;