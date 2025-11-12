"use client";
import React from "react";
import SurveyorManagement from "@/components/admin/SurveyorManagement";
import { Surveyor } from "@/types/api.types";
import { adminApi } from "@/services/api";

const SurveyorsPage = () => {
  const handleCreateSurveyor = async (surveyorData: Partial<Surveyor>) => {
    try {
      // Ensure AMMC organization is set for surveyors created through AMMC admin
      const ammcSurveyorData = {
        ...surveyorData,
        organization: 'AMMC'
      };
      const result = await adminApi.createSurveyor(ammcSurveyorData);
      console.log('AMMC Surveyor created:', result);
      alert('AMMC Surveyor created successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to create surveyor: ${err.message}`);
    }
  };

  const handleUpdateSurveyor = async (id: string, surveyorData: Partial<Surveyor>) => {
    try {
      const result = await adminApi.updateSurveyor(id, surveyorData);
      console.log('Surveyor updated:', result);
      alert('Surveyor updated successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to update surveyor: ${err.message}`);
    }
  };

  const handleDeleteSurveyor = async (id: string) => {
    try {
      await adminApi.deleteSurveyor(id);
      console.log('Surveyor deleted successfully');
      alert('Surveyor deleted successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to delete surveyor: ${err.message}`);
    }
  };

  return (
    <SurveyorManagement
      onCreateSurveyor={handleCreateSurveyor}
      onUpdateSurveyor={handleUpdateSurveyor}
      onDeleteSurveyor={handleDeleteSurveyor}
    />
  );
};

export default SurveyorsPage;