'use client';

import React, { useState, useEffect } from 'react';
import {
    Shield,
    Users,
    Clock,
    CheckCircle,
    AlertTriangle,
    Eye,
    MessageSquare,
    Building,
    Calendar,
    MapPin,
    FileText,
    RefreshCw
} from 'lucide-react';
import Link from 'next/link';
import DualAssignmentCoordination from './DualAssignmentCoordination';

interface DualAssignment {
    _id: string;
    policyId: string;
    ammcAssignmentId: string;
    niaAssignmentId: string;
    completionStatus: number;
    assignmentStatus: string;
    conflictDetected: boolean;
    mergedReportId?: string;
    currentSurveyorOrganization: 'AMMC' | 'NIA';
    policyDetails: {
        propertyType: string;
        address: string;
        buildingValue: number;
    };
    currentSurveyorInfo: {
        assignmentId: string;
        contact: {
            name: string;
            email: string;
            phone: string;
        };
    };
    partnerSurveyorInfo: {
        assignmentId: string;
        organization: 'AMMC' | 'NIA';
        contact: {
            name: string;
            email: string;
            phone: string;
            licenseNumber?: string;
        };
    };
    partnerSurveyor: {
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
    };
    createdAt: string;
    updatedAt: string;
}

const DualAssignmentsList: React.FC = () => {
    const [assignments, setAssignments] = useState<DualAssignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [selectedAssignment, setSelectedAssignment] = useState<string | null>(null);
    const [currentSurveyorOrg, setCurrentSurveyorOrg] = useState<'AMMC' | 'NIA'>('AMMC');
    const [filter, setFilter] = useState<'all' | 'active' | 'completed' | 'conflicts'>('all');

    useEffect(() => {
        // Get surveyor organization from localStorage
        const organization = localStorage.getItem('surveyorOrganization') as 'AMMC' | 'NIA' || 'AMMC';
        setCurrentSurveyorOrg(organization);

        fetchDualAssignments();
    }, []);

    const fetchDualAssignments = async () => {
        try {
            setLoading(true);

            // Import the API function
            const { getSurveyorDualAssignments } = await import('@/services/api');

            const response = await getSurveyorDualAssignments({
                status: filter,
                page: 1,
                limit: 50
            });

            if (response.success) {
                setAssignments(response.data.dualAssignments || []);
            } else {
                throw new Error(response.message || 'Failed to fetch dual assignments');
            }
        } catch (err) {
            console.error('Error fetching dual assignments:', err);
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'completed':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </span>
                );
            case 'in-progress':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                        <Clock className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            case 'assigned':
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
                        <Clock className="w-3 h-3 mr-1" />
                        Assigned
                    </span>
                );
            default:
                return (
                    <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
                        {status}
                    </span>
                );
        }
    };

    const getProgressColor = (percentage: number) => {
        if (percentage >= 100) return 'bg-green-500';
        if (percentage >= 75) return 'bg-blue-500';
        if (percentage >= 50) return 'bg-yellow-500';
        return 'bg-gray-400';
    };

    const filteredAssignments = assignments.filter(assignment => {
        switch (filter) {
            case 'active':
                return assignment.completionStatus < 100;
            case 'completed':
                return assignment.completionStatus === 100;
            case 'conflicts':
                return assignment.conflictDetected;
            default:
                return true;
        }
    });

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/4 mb-4"></div>
                    {[...Array(3)].map((_, i) => (
                        <div key={i} className="bg-white rounded-lg shadow-sm border p-6 mb-4">
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
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <div className="flex items-center space-x-3 text-red-600 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">Error Loading Dual Assignments</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <button
                    onClick={fetchDualAssignments}
                    className="inline-flex items-center space-x-2 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Filter Tabs */}
            <div className="bg-white rounded-lg shadow-sm border">
                <div className="border-b border-gray-200">
                    <nav className="flex space-x-8 px-6">
                        {[
                            { key: 'all', label: 'All Assignments', count: assignments.length },
                            { key: 'active', label: 'Active', count: assignments.filter(a => a.completionStatus < 100).length },
                            { key: 'completed', label: 'Completed', count: assignments.filter(a => a.completionStatus === 100).length },
                            { key: 'conflicts', label: 'Conflicts', count: assignments.filter(a => a.conflictDetected).length }
                        ].map((tab) => (
                            <button
                                key={tab.key}
                                onClick={() => setFilter(tab.key as any)}
                                className={`py-4 px-1 border-b-2 font-medium text-sm ${filter === tab.key
                                    ? 'border-blue-500 text-blue-600'
                                    : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                                    }`}
                            >
                                {tab.label} ({tab.count})
                            </button>
                        ))}
                    </nav>
                </div>
            </div>

            {/* Assignments List */}
            {filteredAssignments.length > 0 ? (
                <div className="space-y-4">
                    {filteredAssignments.map((assignment) => (
                        <div key={assignment._id} className="bg-white rounded-lg shadow-sm border">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-2">
                                            <Shield className="w-5 h-5 text-indigo-600" />
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {assignment.policyDetails.propertyType}
                                            </h3>
                                            {assignment.conflictDetected && (
                                                <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
                                                    <AlertTriangle className="w-3 h-3 mr-1" />
                                                    Conflict
                                                </span>
                                            )}
                                        </div>

                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mb-3">
                                            <div className="flex items-center">
                                                <MapPin className="w-4 h-4 mr-1" />
                                                {assignment.policyDetails.address}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="w-4 h-4 mr-1" />
                                                {new Date(assignment.createdAt).toLocaleDateString()}
                                            </div>
                                        </div>

                                        {/* Progress Bar */}
                                        <div className="mb-4">
                                            <div className="flex justify-between text-sm text-gray-700 mb-2">
                                                <span className="font-medium">Overall Progress</span>
                                                <span className="font-semibold">{assignment.completionStatus}% Complete</span>
                                            </div>
                                            <div className="w-full bg-gray-200 rounded-full h-3">
                                                <div
                                                    className={`h-3 rounded-full transition-all duration-500 ${getProgressColor(assignment.completionStatus)}`}
                                                    style={{ width: `${assignment.completionStatus}%` }}
                                                ></div>
                                            </div>
                                            <div className="flex justify-between text-xs text-gray-500 mt-1">
                                                <span>0%</span>
                                                <span>50% (One Report)</span>
                                                <span>100% (Both Reports)</span>
                                            </div>
                                            <div className="text-xs text-gray-600 mt-1">
                                                {assignment.completionStatus === 100
                                                    ? '✅ Both organizations have submitted their reports'
                                                    : assignment.completionStatus === 50
                                                        ? '⏳ One organization has submitted, waiting for partner'
                                                        : '📋 No reports submitted yet'
                                                }
                                            </div>
                                        </div>

                                        {/* Surveyor Status */}
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <div className={`flex items-center justify-between p-3 rounded-lg ${assignment.currentSurveyorOrganization === 'AMMC' ? 'bg-blue-100 border-2 border-blue-300' : 'bg-blue-50'
                                                }`}>
                                                <div className="flex items-center space-x-2">
                                                    <Building className="w-4 h-4 text-blue-600" />
                                                    <span className="text-sm font-medium text-blue-900">
                                                        AMMC: {assignment.currentSurveyorOrganization === 'AMMC'
                                                            ? assignment.currentSurveyorInfo.contact?.name || 'You'
                                                            : assignment.partnerSurveyorInfo.contact?.name || 'Partner'
                                                        }
                                                    </span>
                                                    {assignment.currentSurveyorOrganization === 'AMMC' && (
                                                        <span className="text-xs bg-blue-200 text-blue-800 px-1 rounded">You</span>
                                                    )}
                                                </div>
                                                {getStatusBadge(assignment.assignmentStatus)}
                                            </div>

                                            <div className={`flex items-center justify-between p-3 rounded-lg ${assignment.currentSurveyorOrganization === 'NIA' ? 'bg-green-100 border-2 border-green-300' : 'bg-green-50'
                                                }`}>
                                                <div className="flex items-center space-x-2">
                                                    <Building className="w-4 h-4 text-green-600" />
                                                    <span className="text-sm font-medium text-green-900">
                                                        NIA: {assignment.currentSurveyorOrganization === 'NIA'
                                                            ? assignment.currentSurveyorInfo.contact?.name || 'You'
                                                            : assignment.partnerSurveyorInfo.contact?.name || 'Partner'
                                                        }
                                                    </span>
                                                    {assignment.currentSurveyorOrganization === 'NIA' && (
                                                        <span className="text-xs bg-green-200 text-green-800 px-1 rounded">You</span>
                                                    )}
                                                </div>
                                                {getStatusBadge(assignment.assignmentStatus)}
                                            </div>
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        <button
                                            onClick={() => setSelectedAssignment(
                                                selectedAssignment === assignment._id ? null : assignment._id
                                            )}
                                            className="inline-flex items-center space-x-2 px-4 py-2 bg-indigo-600 text-white rounded-lg hover:bg-indigo-700 text-sm"
                                        >
                                            <Users className="w-4 h-4" />
                                            <span>Coordinate</span>
                                        </button>

                                        <Link
                                            href={`/surveyor/dashboard/assignments/${assignment.currentSurveyorInfo.assignmentId}`}
                                            className="inline-flex items-center space-x-2 px-4 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                                        >
                                            <Eye className="w-4 h-4" />
                                            <span>View Assignment</span>
                                        </Link>
                                    </div>
                                </div>

                                {/* Expanded Coordination Panel */}
                                {selectedAssignment === assignment._id && (
                                    <div className="mt-6 pt-6 border-t border-gray-200">
                                        <DualAssignmentCoordination
                                            assignmentId={assignment.currentSurveyorInfo.assignmentId}
                                            dualAssignmentId={assignment._id}
                                            currentSurveyorOrg={assignment.currentSurveyorOrganization}
                                        />
                                    </div>
                                )}
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="bg-white rounded-lg shadow-sm border p-12 text-center">
                    <Shield className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                        {filter === 'all' ? 'No Dual Assignments' : `No ${filter} Assignments`}
                    </h3>
                    <p className="text-gray-600">
                        {filter === 'all'
                            ? 'You don\'t have any dual surveyor assignments yet.'
                            : `No assignments match the ${filter} filter.`
                        }
                    </p>
                </div>
            )}
        </div>
    );
};

export default DualAssignmentsList;