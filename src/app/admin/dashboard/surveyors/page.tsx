"use client";
import React from "react";
import SurveyorManagement from "@/components/admin/SurveyorManagement";
import { Surveyor } from "@/types/api.types";
import { adminApi } from "@/services/api";
import { toast } from "sonner";

const SurveyorsPage = () => {
  const handleCreateSurveyor = async (surveyorData: Partial<Surveyor>) => {
    try {
      // Create surveyor without organization field (single surveyor system)
      const result = await adminApi.createSurveyor(surveyorData);
      toast.success('Surveyor created successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Failed to create surveyor: ${err.message}`);
    }
  };

  const handleUpdateSurveyor = async (id: string, surveyorData: Partial<Surveyor>) => {
    try {
      const result = await adminApi.updateSurveyor(id, surveyorData);
      toast.success('Surveyor updated successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Failed to update surveyor: ${err.message}`);
    }
  };

  const handleDeleteSurveyor = async (id: string) => {
    try {
      await adminApi.deleteSurveyor(id);
      toast.success('Surveyor deleted successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Failed to delete surveyor: ${err.message}`);
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