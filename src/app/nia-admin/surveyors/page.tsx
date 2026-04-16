"use client";

import React from 'react';
import SurveyorManagement from '@/components/admin/SurveyorManagement';
import { adminApi } from '@/services/api';

const NIASurveyorsPage = () => {
    const handleCreateSurveyor = async (surveyorData: any) => {
        try {
            const response = await adminApi.createSurveyor(surveyorData);
            if (response.success) {
            }
        } catch (error) {
            throw error;
        }
    };

    const handleUpdateSurveyor = async (id: string, surveyorData: any) => {
        try {
            const response = await adminApi.updateSurveyor(id, surveyorData);
            if (response.success) {
            }
        } catch (error) {
            throw error;
        }
    };

    const handleDeleteSurveyor = async (id: string) => {
        try {
            const response = await adminApi.deleteSurveyor(id);
            if (response.success) {
            }
        } catch (error) {
            throw error;
        }
    };

    return (
        <div className="space-y-6">
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                <h3 className="font-semibold text-blue-900 mb-2">Unified Surveyor System</h3>
                <p className="text-sm text-blue-800">
                    NIA and AMMC now share the same surveyor pool with LGA-based automated assignment.
                    All surveyors are managed through a unified system with round-robin distribution.
                </p>
            </div>

            <SurveyorManagement
                onCreateSurveyor={handleCreateSurveyor}
                onUpdateSurveyor={handleUpdateSurveyor}
                onDeleteSurveyor={handleDeleteSurveyor}
            />
        </div>
    );
};

export default NIASurveyorsPage;
