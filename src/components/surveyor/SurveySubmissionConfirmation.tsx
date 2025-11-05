"use client";
import React from "react";
import { CheckCircle, Users, Mail, Phone, Clock, FileText, AlertCircle, Shield } from "lucide-react";

interface SurveySubmissionConfirmationProps {
    submissionResult: {
        submission: any;
        dualAssignmentInfo?: {
            completionStatus: number;
            assignmentStatus: string;
            isDualSurveyor: boolean;
        };
        otherSurveyorNotified?: boolean;
        organization: string;
    };
    policy: any;
    onClose: () => void;
}

const SurveySubmissionConfirmation: React.FC<SurveySubmissionConfirmationProps> = ({
    submissionResult,
    policy,
    onClose
}) => {
    const { submission, dualAssignmentInfo, otherSurveyorNotified, organization } = submissionResult;
    const isDualSurveyor = dualAssignmentInfo?.isDualSurveyor;
    const completionStatus = dualAssignmentInfo?.completionStatus ?? 0;

    // Debug logging
    console.log('SurveySubmissionConfirmation - Debug Info:', {
        submissionResult,
        dualAssignmentInfo,
        completionStatus,
        isDualSurveyor,
        organization
    });
    const otherOrganization = organization === 'AMMC' ? 'NIA' : 'AMMC';

    const getProgressMessage = () => {
        if (!isDualSurveyor) {
            return "Your survey report has been submitted successfully.";
        }

        // For dual surveyor assignments, we know at least one report is submitted (this one)
        // So if completionStatus is 0, it's likely a data issue - treat as 50%
        const effectiveCompletionStatus = completionStatus === 0 && isDualSurveyor ? 50 : completionStatus;

        if (effectiveCompletionStatus === 50) {
            return `Your ${organization} survey report has been submitted. Waiting for ${otherOrganization} surveyor to complete their assessment.`;
        } else if (effectiveCompletionStatus === 100) {
            return "Both survey reports have been submitted! The system will automatically merge the reports within 5 minutes.";
        }

        return "Your survey report has been submitted successfully.";
    };

    const getNextSteps = () => {
        if (!isDualSurveyor) {
            return [
                "Your report is being processed",
                "You will be notified when review is complete",
                "Check your dashboard for updates"
            ];
        }

        // For dual surveyor assignments, we know at least one report is submitted (this one)
        const effectiveCompletionStatus = completionStatus === 0 && isDualSurveyor ? 50 : completionStatus;

        if (effectiveCompletionStatus === 50) {
            return [
                `${otherOrganization} surveyor has been notified of your submission`,
                "Automatic report merging will begin once both reports are submitted",
                "You will be notified when the merged report is ready",
                "Monitor your dashboard for progress updates"
            ];
        } else if (effectiveCompletionStatus === 100) {
            return [
                "Automatic report merging is in progress",
                "Both surveyors will be notified when merging is complete",
                "The policy owner will receive the merged report",
                "Check for any conflict notifications in your dashboard"
            ];
        }

        return [
            "Your report is being processed",
            "Check your dashboard for updates"
        ];
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-xl shadow-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                {/* Success Header */}
                <div className="bg-gradient-to-r from-green-500 to-green-600 text-white p-6">
                    <div className="flex items-center">
                        <div className="bg-white bg-opacity-20 rounded-full p-3 mr-4">
                            <CheckCircle className="h-8 w-8" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Survey Submitted Successfully!</h1>
                            <p className="opacity-90 mt-1">
                                {isDualSurveyor ? `${organization} Survey Report` : 'Survey Report'} - Policy #{policy._id}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="p-6 space-y-6">
                    {/* Submission Details */}
                    <div className="bg-gray-50 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                            <FileText className="h-5 w-5 mr-2 text-blue-600" />
                            Submission Details
                        </h3>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                            <div>
                                <span className="font-medium text-gray-700">Submitted At:</span>
                                <p className="text-gray-600">{new Date(submission.submissionTime || submission.createdAt).toLocaleString()}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Organization:</span>
                                <p className="text-gray-600">
                                    <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${organization === 'AMMC' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                                        }`}>
                                        {organization}
                                    </span>
                                </p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Recommendation:</span>
                                <p className="text-gray-600 capitalize">{submission.recommendedAction?.replace('_', ' ')}</p>
                            </div>
                            <div>
                                <span className="font-medium text-gray-700">Status:</span>
                                <p className="text-gray-600">
                                    <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">
                                        <CheckCircle className="w-3 h-3 mr-1" />
                                        Submitted
                                    </span>
                                </p>
                            </div>
                        </div>
                    </div>

                    {/* Dual-Surveyor Progress */}
                    {isDualSurveyor && (
                        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
                            <h3 className="text-lg font-semibold text-indigo-900 mb-3 flex items-center">
                                <Shield className="h-5 w-5 mr-2" />
                                Dual-Surveyor Progress
                            </h3>

                            <div className="space-y-4">
                                {/* Progress Bar */}
                                <div>
                                    {(() => {
                                        // For dual surveyor assignments, we know at least one report is submitted (this one)
                                        const effectiveCompletionStatus = completionStatus === 0 && isDualSurveyor ? 50 : completionStatus;

                                        return (
                                            <>
                                                <div className="flex items-center justify-between text-sm text-indigo-700 mb-2">
                                                    <span className="font-medium">Overall Completion</span>
                                                    <span className="font-semibold">{effectiveCompletionStatus}% Complete</span>
                                                </div>
                                                <div className="w-full bg-indigo-200 rounded-full h-3">
                                                    <div
                                                        className={`h-3 rounded-full transition-all duration-500 ${effectiveCompletionStatus >= 100 ? 'bg-green-500' :
                                                            effectiveCompletionStatus >= 50 ? 'bg-yellow-500' :
                                                                effectiveCompletionStatus > 0 ? 'bg-indigo-600' : 'bg-gray-400'
                                                            }`}
                                                        style={{ width: `${Math.max(effectiveCompletionStatus, 0)}%` }}
                                                    ></div>
                                                </div>
                                                <div className="flex justify-between text-xs text-indigo-600 mt-1">
                                                    <span>0%</span>
                                                    <span>50% (One Report)</span>
                                                    <span>100% (Both Reports)</span>
                                                </div>
                                                {/* Debug info - remove in production */}
                                                <div className="text-xs text-gray-500 mt-1">
                                                    Debug: raw={completionStatus}%, effective={effectiveCompletionStatus}%, isDual={isDualSurveyor ? 'true' : 'false'}
                                                </div>
                                            </>
                                        );
                                    })()}
                                </div>

                                {/* Organization Status */}
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex items-center">
                                            <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                            <span className="font-medium text-gray-900">{organization}</span>
                                        </div>
                                        <span className="text-green-600 font-medium">✓ Submitted</span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-white rounded border">
                                        <div className="flex items-center">
                                            <div className={`w-3 h-3 ${(completionStatus === 0 && isDualSurveyor ? 50 : completionStatus) === 100 ? 'bg-green-500' : 'bg-yellow-400'
                                                } rounded-full mr-3`}></div>
                                            <span className="font-medium text-gray-900">{otherOrganization}</span>
                                        </div>
                                        <span className={`font-medium ${(completionStatus === 0 && isDualSurveyor ? 50 : completionStatus) === 100 ? 'text-green-600' : 'text-yellow-600'
                                            }`}>
                                            {(completionStatus === 0 && isDualSurveyor ? 50 : completionStatus) === 100 ? '✓ Submitted' : '⏳ Pending'}
                                        </span>
                                    </div>
                                </div>

                                {/* Notification Status */}
                                {otherSurveyorNotified && (
                                    <div className="flex items-center p-3 bg-blue-50 border border-blue-200 rounded">
                                        <Mail className="h-4 w-4 text-blue-600 mr-2" />
                                        <span className="text-blue-800 text-sm">
                                            {otherOrganization} surveyor has been notified of your submission
                                        </span>
                                    </div>
                                )}

                                {/* Automatic Merging Status */}
                                {(completionStatus === 0 && isDualSurveyor ? 50 : completionStatus) === 100 && (
                                    <div className="flex items-center p-3 bg-green-50 border border-green-200 rounded">
                                        <Clock className="h-4 w-4 text-green-600 mr-2" />
                                        <span className="text-green-800 text-sm">
                                            Automatic report merging will begin within 5 minutes
                                        </span>
                                    </div>
                                )}
                            </div>
                        </div>
                    )}

                    {/* Progress Message */}
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h3 className="text-lg font-semibold text-blue-900 mb-2">What Happens Next?</h3>
                        <p className="text-blue-800 mb-3">{getProgressMessage()}</p>

                        <div className="space-y-2">
                            {getNextSteps().map((step, index) => (
                                <div key={index} className="flex items-start">
                                    <div className="w-2 h-2 bg-blue-600 rounded-full mt-2 mr-3 flex-shrink-0"></div>
                                    <span className="text-blue-800 text-sm">{step}</span>
                                </div>
                            ))}
                        </div>
                    </div>

                    {/* Important Notes */}
                    {isDualSurveyor && (
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <div className="flex items-start">
                                <AlertCircle className="h-5 w-5 text-yellow-600 mr-3 mt-0.5 flex-shrink-0" />
                                <div>
                                    <h4 className="font-medium text-yellow-900 mb-2">Important Notes</h4>
                                    <ul className="text-yellow-800 text-sm space-y-1">
                                        <li>• Both survey reports must be submitted before automatic merging begins</li>
                                        <li>• You will be notified if any conflicts are detected between the reports</li>
                                        <li>• The merged report will be available to the policy owner immediately after processing</li>
                                        <li>• Check your dashboard regularly for updates and notifications</li>
                                    </ul>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Action Buttons */}
                    <div className="flex justify-between items-center pt-4 border-t border-gray-200">
                        <button
                            onClick={onClose}
                            className="px-6 py-2 text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                        >
                            Close
                        </button>
                        <div className="space-x-3">
                            <button
                                onClick={() => window.location.href = '/surveyor/dashboard/assignments'}
                                className="px-6 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500 transition-colors"
                            >
                                View All Assignments
                            </button>
                            <button
                                onClick={() => window.location.href = '/surveyor/dashboard'}
                                className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 transition-colors"
                            >
                                Back to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveySubmissionConfirmation;