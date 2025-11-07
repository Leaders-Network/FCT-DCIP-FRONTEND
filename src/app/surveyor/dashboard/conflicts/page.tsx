'use client';

import React, { useState, useEffect } from 'react';
import { AlertTriangle, Shield, Eye, MessageSquare, RefreshCw } from 'lucide-react';
import Link from 'next/link';
import { getSurveyorDualAssignments } from '@/services/api';

interface ConflictAssignment {
  _id: string;
  policyDetails: {
    propertyType: string;
    address: string;
    buildingValue: number;
  };
  currentSurveyorOrganization: 'AMMC' | 'NIA';
  partnerSurveyorInfo: {
    organization: 'AMMC' | 'NIA';
    contact: {
      name: string;
      email: string;
      phone: string;
    };
  };
  conflictDetected: boolean;
  completionStatus: number;
  createdAt: string;
}

const ConflictsPage: React.FC = () => {
  const [conflicts, setConflicts] = useState<ConflictAssignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    fetchConflicts();
  }, []);

  const fetchConflicts = async () => {
    try {
      setLoading(true);
      const response = await getSurveyorDualAssignments({
        status: 'conflicts',
        page: 1,
        limit: 50
      });

      if (response.data?.dualAssignments) {
        const conflictAssignments = response.data.dualAssignments.filter(
          (assignment: { conflictDetected: boolean }) => assignment.conflictDetected
        );
        setConflicts(conflictAssignments);
      }
    } catch (err) {
      console.error('Error fetching conflicts:', err);
      setError(err instanceof Error ? err.message : 'Unknown error');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-6">
          <div className="h-8 bg-gray-300 rounded w-1/3"></div>
          {[...Array(3)].map((_, i) => (
            <div key={i} className="bg-white rounded-lg shadow-sm border p-6">
              <div className="space-y-3">
                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                <div className="h-4 bg-gray-300 rounded w-2/3"></div>
              </div>
            </div>
          ))}
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-lg shadow-sm border p-6">
          <div className="flex items-center space-x-3 text-red-600 mb-4">
            <AlertTriangle className="w-6 h-6" />
            <span className="font-medium">Error Loading Conflicts</span>
          </div>
          <p className="text-sm text-gray-600 mb-4">{error}</p>
          <button
            onClick={fetchConflicts}
            className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
          >
            <RefreshCw className="w-4 h-4" />
            <span>Try Again</span>
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 flex items-center">
          <AlertTriangle className="w-8 h-8 text-orange-600 mr-3" />
          Survey Conflicts
        </h1>
        <p className="text-gray-600 mt-2">
          Assignments with discrepancies between AMMC and NIA survey reports
        </p>
      </div>

      {conflicts.length > 0 ? (
        <div className="space-y-6">
          {conflicts.map((conflict) => (
            <div key={conflict._id} className="bg-white rounded-lg shadow-sm border border-orange-200">
              <div className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-3">
                      <Shield className="w-5 h-5 text-orange-600" />
                      <h3 className="text-lg font-semibold text-gray-900">
                        {conflict.policyDetails.propertyType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                        <AlertTriangle className="w-3 h-3 mr-1" />
                        Conflict Detected
                      </span>
                    </div>

                    <div className="text-sm text-gray-600 mb-4">
                      <p className="mb-2">📍 {conflict.policyDetails.address}</p>
                      <p className="mb-2">💰 Building Value: ₦{conflict.policyDetails.buildingValue.toLocaleString()}</p>
                      <p>📅 Created: {new Date(conflict.createdAt).toLocaleDateString()}</p>
                    </div>

                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4 mb-4">
                      <h4 className="font-medium text-orange-900 mb-2">Conflict Details</h4>
                      <p className="text-sm text-orange-800">
                        The survey reports from AMMC and NIA surveyors contain significant discrepancies
                        that require review and resolution.
                      </p>
                    </div>
                  </div>

                  <div className="flex flex-col space-y-2 ml-6">
                    <button className="inline-flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm">
                      <MessageSquare className="w-4 h-4" />
                      <span>Discuss</span>
                    </button>

                    <Link
                      href={`/surveyor/dashboard/dual-assignments`}
                      className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                    >
                      <Eye className="w-4 h-4" />
                      <span>View</span>
                    </Link>
                  </div>
                </div>
              </div>
            </div>
          ))}
        </div>
      ) : (
        <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
          <AlertTriangle className="w-16 h-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Conflicts Found</h3>
          <p className="text-gray-600">
            Great! All your dual surveyor assignments are in agreement.
          </p>
        </div>
      )}
    </div>
  );
};

export default ConflictsPage;