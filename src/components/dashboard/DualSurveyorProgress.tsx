"use client";
import React from 'react';
import {
    Clock,
    CheckCircle,
    Users,
    Building2,
    AlertTriangle,
    Calendar,
    Progress,
    User
} from 'lucide-react';

interface DualSurveyorProgressProps {
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    completionStatus: 0 | 50 | 100;
    ammcSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
    };
    niaSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
    };
    estimatedCompletion?: {
        overallDeadline: string;
    };
    priority?: string;
}

const DualSurveyorProgress: React.FC<DualSurveyorProgressProps> = ({
    assignmentStatus,
    completionStatus,
    ammcSurveyorContact,
    niaSurveyorContact,
    estimatedCompletion,
    priority = 'medium'
}) => {
    const getProgressColor = () => {
        switch (completionStatus) {
            case 0:
                return 'bg-gray-200';
            case 50:
                return 'bg-yellow-400';
            case 100:
                return 'bg-green-500';
            default:
                return 'bg-gray-200';
        }
    };

    const getProgressText = () => {
        switch (completionStatus) {
            case 0:
                return 'Survey Not Started';
            case 50:
                return 'Survey 50% Complete';
            case 100:
                return 'Survey Complete';
            default:
                return 'Unknown Status';
        }
    };

    const getAssignmentStatusText = () => {
        switch (assignmentStatus) {
            case 'unassigned':
                return 'Awaiting Surveyor Assignment';
            case 'partially_assigned':
                return 'One Surveyor Assigned';
            case 'fully_assigned':
                return 'Both Surveyors Assigned';
            default:
                return 'Unknown Assignment Status';
        }
    };

    const getAssignmentStatusColor = () => {
        switch (assignmentStatus) {
            case 'unassigned':
                return 'text-gray-600 bg-gray-100';
            case 'partially_assigned':
                return 'text-yellow-700 bg-yellow-100';
            case 'fully_assigned':
                return 'text-green-700 bg-green-100';
            default:
                return 'text-gray-600 bg-gray-100';
        }
    };

    const getPriorityColor = () => {
        switch (priority) {
            case 'urgent':
                return 'text-red-700 bg-red-100';
            case 'high':
                return 'text-orange-700 bg-orange-100';
            case 'medium':
                return 'text-blue-700 bg-blue-100';
            case 'low':
                return 'text-gray-700 bg-gray-100';
            default:
                return 'text-blue-700 bg-blue-100';
        }
    };

    return (
        <div className="bg-white border border-gray-200 rounded-lg p-6 space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div className="flex items-center space-x-3">
                    <div className="p-2 bg-blue-100 rounded-lg">
                        <Users className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                        <h3 className="text-lg font-semibold text-gray-900">Dual-Surveyor Progress</h3>
                        <p className="text-sm text-gray-600">Track your survey progress with both organizations</p>
                    </div>
                </div>
                <div className="flex items-center space-x-2">
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getAssignmentStatusColor()}`}>
                        {getAssignmentStatusText()}
                    </span>
                    <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor()}`}>
                        {priority.charAt(0).toUpperCase() + priority.slice(1)} Priority
                    </span>
                </div>
            </div>

            {/* Progress Bar */}
            <div className="space-y-3">
                <div className="flex items-center justify-between">
                    <span className="text-sm font-medium text-gray-700">{getProgressText()}</span>
                    <span className="text-sm font-bold text-gray-900">{completionStatus}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                    <div
                        className={`h-3 rounded-full transition-all duration-300 ${getProgressColor()}`}
                        style={{ width: `${completionStatus}%` }}
                    ></div>
                </div>
                <div className="flex justify-between text-xs text-gray-500">
                    <span>Start</span>
                    <span>50% (One Survey)</span>
                    <span>100% (Both Surveys)</span>
                </div>
            </div>

            {/* Timeline Steps */}
            <div className="space-y-4">
                <h4 className="text-sm font-medium text-gray-900">Survey Timeline</h4>
                <div className="space-y-3">
                    {/* Step 1: Assignment */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${assignmentStatus !== 'unassigned' ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                            {assignmentStatus !== 'unassigned' ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Surveyor Assignment</p>
                            <p className="text-xs text-gray-600">
                                {assignmentStatus === 'unassigned'
                                    ? 'Waiting for surveyors to be assigned'
                                    : assignmentStatus === 'partially_assigned'
                                        ? 'One surveyor assigned, waiting for second'
                                        : 'Both surveyors assigned'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Step 2: Survey Execution */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completionStatus > 0 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                            {completionStatus > 0 ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Survey Execution</p>
                            <p className="text-xs text-gray-600">
                                {completionStatus === 0
                                    ? 'Surveys not yet started'
                                    : completionStatus === 50
                                        ? 'One survey completed, one in progress'
                                        : 'Both surveys completed'
                                }
                            </p>
                        </div>
                    </div>

                    {/* Step 3: Report Generation */}
                    <div className="flex items-center space-x-3">
                        <div className={`w-6 h-6 rounded-full flex items-center justify-center ${completionStatus === 100 ? 'bg-green-500 text-white' : 'bg-gray-300 text-gray-600'
                            }`}>
                            {completionStatus === 100 ? (
                                <CheckCircle className="w-4 h-4" />
                            ) : (
                                <Clock className="w-4 h-4" />
                            )}
                        </div>
                        <div className="flex-1">
                            <p className="text-sm font-medium text-gray-900">Report Generation</p>
                            <p className="text-xs text-gray-600">
                                {completionStatus === 100
                                    ? 'Reports being merged and reviewed'
                                    : 'Waiting for surveys to complete'
                                }
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Surveyor Assignment Status */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* AMMC Surveyor */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-green-600" />
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-gray-900">AMMC Surveyor</h5>
                            <p className="text-xs text-gray-600">Abuja Municipal Area Council</p>
                        </div>
                    </div>
                    {ammcSurveyorContact ? (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{ammcSurveyorContact.name}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>{ammcSurveyorContact.email}</p>
                                <p>{ammcSurveyorContact.phone}</p>
                            </div>
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                Assigned
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-3">
                            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">Awaiting assignment</p>
                        </div>
                    )}
                </div>

                {/* NIA Surveyor */}
                <div className="border border-gray-200 rounded-lg p-4">
                    <div className="flex items-center space-x-3 mb-3">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Building2 className="h-5 w-5 text-blue-600" />
                        </div>
                        <div>
                            <h5 className="text-sm font-medium text-gray-900">NIA Surveyor</h5>
                            <p className="text-xs text-gray-600">Nigerian Institute of Architects</p>
                        </div>
                    </div>
                    {niaSurveyorContact ? (
                        <div className="space-y-2">
                            <div className="flex items-center space-x-2">
                                <User className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{niaSurveyorContact.name}</span>
                            </div>
                            <div className="text-xs text-gray-600">
                                <p>{niaSurveyorContact.email}</p>
                                <p>{niaSurveyorContact.phone}</p>
                            </div>
                            <div className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
                                Assigned
                            </div>
                        </div>
                    ) : (
                        <div className="text-center py-3">
                            <Clock className="w-6 h-6 text-gray-400 mx-auto mb-2" />
                            <p className="text-xs text-gray-600">Awaiting assignment</p>
                        </div>
                    )}
                </div>
            </div>

            {/* Estimated Completion */}
            {estimatedCompletion && (
                <div className="bg-gray-50 rounded-lg p-4">
                    <div className="flex items-center space-x-3">
                        <Calendar className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Estimated Completion</p>
                            <p className="text-sm text-gray-600">
                                {new Date(estimatedCompletion.overallDeadline).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric'
                                })}
                            </p>
                        </div>
                    </div>
                </div>
            )}

            {/* Status Indicators */}
            <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                <div className="flex items-center space-x-4">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">AMMC Organization</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">NIA Organization</span>
                    </div>
                </div>
                <div className="text-xs text-gray-500">
                    Last updated: {new Date().toLocaleDateString()}
                </div>
            </div>
        </div>
    );
};

export default DualSurveyorProgress;