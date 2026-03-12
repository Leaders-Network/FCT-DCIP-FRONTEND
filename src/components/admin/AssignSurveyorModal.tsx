
"use client";

import React, { useState, useEffect } from 'react';
import { X } from 'lucide-react';
import { PolicyRequest, Surveyor } from '@/types/api.types';
import { adminApi } from '@/services/api';
import { useAuth } from '@/context/useAuth';

interface AssignSurveyorModalProps {
  show: boolean;
  onClose: () => void;
  selectedPolicy: PolicyRequest | null;
  isReassign?: boolean;
  onAssignmentCreated: () => void;
  onAssignmentReassigned: () => void;
}

const AssignSurveyorModal: React.FC<AssignSurveyorModalProps> = ({
  show,
  onClose,
  selectedPolicy,
  isReassign = false,
  onAssignmentCreated,
  onAssignmentReassigned,
}) => {
  const { user } = useAuth();
  const [availableSurveyors, setAvailableSurveyors] = useState<Surveyor[]>([]);
  const [newAssignmentData, setNewAssignmentData] = useState({
    surveyorId: '',
    priority: 'normal',
    deadline: '',
    instructions: '',
  });
  const [error, setError] = useState<string | null>(null);

  const normalizeSurveyor = (surveyor: Surveyor | Record<string, unknown>): Surveyor => {
    const safeSurveyor = surveyor as Surveyor & { userId?: { firstname?: string; lastname?: string; email?: string; phonenumber?: string } };
    return {
      ...safeSurveyor,
      firstname: safeSurveyor.firstname || safeSurveyor.userId?.firstname || '',
      lastname: safeSurveyor.lastname || safeSurveyor.userId?.lastname || '',
      email: safeSurveyor.email || safeSurveyor.userId?.email || '',
      phonenumber: safeSurveyor.phonenumber || safeSurveyor.userId?.phonenumber || ''
    };
  };

  useEffect(() => {
    const fetchSurveyors = async () => {
      try {
        const response = await adminApi.getSurveyors({ status: 'active' });
        if (response?.data) {
          const normalized = Array.isArray(response.data)
            ? response.data.map(normalizeSurveyor)
            : [];
          setAvailableSurveyors(normalized);
        } else {
          setAvailableSurveyors([]);
        }
      } catch (error) {
        setAvailableSurveyors([]);
      }
    };

    if (show) {
      fetchSurveyors();
    }
  }, [show]);

  const handleCreateAssignment = async () => {
    if (!newAssignmentData.deadline) {
      setError('Please select a deadline.');
      return;
    }
    if (!newAssignmentData.surveyorId) {
      setError('Please select an AMMC surveyor.');
      return;
    }
    try {
      const assignmentData = {
        ammcId: selectedPolicy!._id,
        surveyorId: newAssignmentData.surveyorId,
        assignedBy: user?._id,
        deadline: new Date(newAssignmentData.deadline).toISOString(),
        priority: newAssignmentData.priority as "low" | "medium" | "high" | "urgent",
        instructions: newAssignmentData.instructions || 'N/A',
      };
      await adminApi.createAssignment(assignmentData);
      onAssignmentCreated();
      onClose();
    } catch (error: unknown) {
      const errorMessage = error instanceof Error ? error.message : 'Unknown error occurred';
      setError(`Failed to create assignment: ${errorMessage}`);
    }
  };

  const handleReassignSurveyor = async () => {
    try {
      const assignmentResponse = await adminApi.getAssignmentById(selectedPolicy!.assignmentId!);
      if (!assignmentResponse.success || !assignmentResponse.data) {
        setError('Could not find assignment for the selected policy.');
        return;
      }
      const assignment = assignmentResponse.data;
      const response = await adminApi.reassignSurveyor(
        assignment._id,
        newAssignmentData.surveyorId,
        newAssignmentData.instructions, // reason
        newAssignmentData.deadline,
        newAssignmentData.priority
      );
      if (response.success) {
        onAssignmentReassigned();
        onClose();
      } else {
        setError(response.message || 'Failed to re-assign AMMC surveyor');
      }
    } catch (error) {
      setError('Failed to re-assign AMMC surveyor. Please try again.');
    }
  };

  if (!show) {
    return null;
  }

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-white rounded-lg w-full max-w-lg p-6 overflow-y-auto max-h-[90vh]">
        <div className="flex items-start justify-between">
          <h3 className="text-lg font-semibold mb-4">{isReassign ? 'Re-assign AMMC Surveyor' : 'Assign AMMC Surveyor'}</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-gray-600">
            <X className="w-6 h-6" />
          </button>
        </div>
        {error && <div className="bg-red-100 text-red-700 p-3 rounded-md mb-4">{error}</div>}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-6">
          <div>
            <label className="block text-sm font-medium text-gray-700">Policy Holder</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPolicy?.contactDetails?.fullName}</p>
          </div>
          <div>
            <label className="block text-sm font-medium text-gray-700">Property Address</label>
            <p className="mt-1 text-sm text-gray-900">{selectedPolicy?.propertyDetails?.address}</p>
          </div>
        </div>
        <div className="space-y-4">
          <div>
            <label htmlFor="surveyor" className="block text-sm font-medium text-gray-700">Select AMMC Surveyor(s)</label>
            <div className="mt-2 h-60 overflow-y-auto border border-gray-300 rounded-md">
              {Array.isArray(availableSurveyors) && availableSurveyors.map(s => (
                <div key={s._id} className="flex items-center p-2">
                  <input
                    id={`surveyor-${s._id}`}
                    name="surveyor"
                    type="radio"
                    value={s._id}
                    checked={newAssignmentData.surveyorId === s._id}
                    onChange={e => setNewAssignmentData(prev => ({ ...prev, surveyorId: e.target.value }))}
                    className="h-4 w-4 text-indigo-600 border-gray-300 rounded-full focus:ring-indigo-500"
                  />
                  <label htmlFor={`surveyor-${s._id}`} className="ml-3 text-sm text-gray-700">
                    {s.firstname || 'N/A'} {s.lastname || 'N/A'} ({s.email || 'N/A'}) - {s.profile?.specialization?.join(', ') || 'N/A'}
                  </label>
                </div>
              ))}
            </div>
          </div>
          <div>
            <label htmlFor="instructions" className="block text-sm font-medium text-gray-700">Instructions</label>
            <textarea
              id="instructions"
              value={newAssignmentData.instructions}
              onChange={e => setNewAssignmentData({ ...newAssignmentData, instructions: e.target.value })}
              className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
            />
          </div>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label htmlFor="priority" className="block text-sm font-medium text-gray-700">Priority</label>
              <select
                id="priority"
                value={newAssignmentData.priority}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, priority: e.target.value })}
                className="mt-1 block w-full pl-3 pr-10 py-2 text-base border-gray-300 focus:outline-none focus:ring-indigo-500 focus:border-indigo-500 sm:text-sm rounded-md"
              >
                <option value="normal">Normal</option>
                <option value="urgent">Urgent</option>
                <option value="high">High</option>
                <option value="medium">Medium</option>
                <option value="low">Low</option>
              </select>
            </div>
            <div>
              <label htmlFor="deadline" className="block text-sm font-medium text-gray-700">Deadline</label>
              <input
                type="date"
                id="deadline"
                value={newAssignmentData.deadline}
                onChange={e => setNewAssignmentData({ ...newAssignmentData, deadline: e.target.value })}
                className="mt-1 focus:ring-indigo-500 focus:border-indigo-500 block w-full shadow-sm sm:text-sm border-gray-300 rounded-md"
              />
            </div>
          </div>
        </div>
        <div className="flex justify-end space-x-2 mt-6">
          <button
            onClick={onClose}
            className="px-4 py-2 text-gray-600 border border-gray-300 rounded hover:bg-gray-50"
          >Cancel</button>
          <button
            onClick={isReassign ? handleReassignSurveyor : handleCreateAssignment}
            className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700"
          >{isReassign ? 'Re-assign' : 'Assign'}</button>
        </div>
      </div>
    </div>
  );
};

export default AssignSurveyorModal;
