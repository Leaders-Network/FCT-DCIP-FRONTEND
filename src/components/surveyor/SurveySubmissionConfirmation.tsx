import React from 'react';
import { CheckCircle, FileText, Users, Clock, ArrowRight } from 'lucide-react';
import { SurveySubmissionResult, PolicyRequest } from '@/types/api.types';

interface SurveySubmissionConfirmationProps {
    submissionResult: SurveySubmissionResult;
    policy: PolicyRequest;
    onClose: () => void;
}

const SurveySubmissionConfirmation: React.FC<SurveySubmissionConfirmationProps> = ({
    submissionResult,
    policy,
    onClose
}) => {
    const isDualSurveyor = submissionResult.dualAssignmentInfo?.isDualSurveyor || false;
    const completionStatus = submissionResult.dualAssignmentInfo?.completionStatus || 0;
    const otherSurveyorNotified = submissionResult.otherSurveyorNotified || false;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50 overflow-y-auto">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full my-8 max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div className="bg-green-600 text-white p-6 rounded-t-lg">
                    <div className="flex items-center">
                        <CheckCircle className="w-8 h-8 mr-3" />
                        <div>
                            <h2 className="text-xl font-bold">Survey Submitted Successfully!</h2>
                            <p className="text-green-100 mt-1">
                                Your survey report has been received and processed
                            </p>
                        </div>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6">
                    {/* Submission Details */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Submission Details</h3>
                        <div className="bg-gray-50 rounded-lg p-4 space-y-2">
                            <div className="flex justify-between">
                                <span className="text-gray-600">Property:</span>
                                <span className="font-medium text-gray-900">{policy.propertyDetails.address}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Property Type:</span>
                                <span className="font-medium text-gray-900">{policy.propertyDetails.propertyType}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Submission ID:</span>
                                <span className="font-medium text-gray-900">{submissionResult.submission._id}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Organization:</span>
                                <span className="font-medium text-gray-900">{submissionResult.organization}</span>
                            </div>
                            <div className="flex justify-between">
                                <span className="text-gray-600">Submitted:</span>
                                <span className="font-medium text-gray-900">
                                    {new Date(submissionResult.submission.submissionTime).toLocaleString()}
                                </span>
                            </div>
                        </div>
                    </div>

                    {/* Dual Assignment Status */}
                    {isDualSurveyor && (
                        <div className="mb-6">
                            <h3 className="text-lg font-semibold text-gray-900 mb-3 flex items-center">
                                <Users className="w-5 h-5 mr-2" />
                                Dual Surveyor Assignment Status
                            </h3>
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-center justify-between mb-3">
                                    <span className="text-blue-900 font-medium">Overall Progress</span>
                                    <span className="text-blue-900 font-bold">{completionStatus}% Complete</span>
                                </div>

                                <div className="w-full bg-blue-200 rounded-full h-3 mb-4">
                                    <div
                                        className={`h-3 rounded-full transition-all duration-500 ${completionStatus === 100
                                            ? 'bg-green-500'
                                            : completionStatus === 50
                                                ? 'bg-yellow-500'
                                                : 'bg-blue-400'
                                            }`}
                                        style={{ width: `${completionStatus}%` }}
                                    ></div>
                                </div>

                                <div className="space-y-2 text-sm">
                                    {completionStatus === 100 ? (
                                        <div className="flex items-center text-green-700">
                                            <CheckCircle className="w-4 h-4 mr-2" />
                                            <span>Both AMMC and NIA surveys completed! Reports will be automatically merged.</span>
                                        </div>
                                    ) : completionStatus === 50 ? (
                                        <div className="flex items-center text-yellow-700">
                                            <Clock className="w-4 h-4 mr-2" />
                                            <span>Your survey is complete. Waiting for the partner surveyor to submit their report.</span>
                                        </div>
                                    ) : (
                                        <div className="flex items-center text-blue-700">
                                            <FileText className="w-4 h-4 mr-2" />
                                            <span>Survey assignment in progress.</span>
                                        </div>
                                    )}

                                    {otherSurveyorNotified && (
                                        <div className="flex items-center text-blue-700 mt-2">
                                            <ArrowRight className="w-4 h-4 mr-2" />
                                            <span>Partner surveyor has been notified of your submission.</span>
                                        </div>
                                    )}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Next Steps */}
                    <div className="mb-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">What Happens Next?</h3>
                        <div className="space-y-3">
                            {isDualSurveyor ? (
                                completionStatus === 100 ? (
                                    <>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-green-600 text-sm font-bold">1</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Automatic Report Merging</p>
                                                <p className="text-gray-600 text-sm">Both surveys will be automatically merged into a comprehensive report.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-blue-600 text-sm font-bold">2</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Quality Review</p>
                                                <p className="text-gray-600 text-sm">The merged report will undergo quality review and conflict detection.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-purple-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-purple-600 text-sm font-bold">3</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Client Notification</p>
                                                <p className="text-gray-600 text-sm">The client will be notified when the final report is ready.</p>
                                            </div>
                                        </div>
                                    </>
                                ) : (
                                    <>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-yellow-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-yellow-600 text-sm font-bold">1</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Waiting for Partner Survey</p>
                                                <p className="text-gray-600 text-sm">The partner surveyor will complete their assessment.</p>
                                            </div>
                                        </div>
                                        <div className="flex items-start">
                                            <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                                <span className="text-blue-600 text-sm font-bold">2</span>
                                            </div>
                                            <div>
                                                <p className="font-medium text-gray-900">Automatic Processing</p>
                                                <p className="text-gray-600 text-sm">Once both surveys are complete, reports will be automatically merged.</p>
                                            </div>
                                        </div>
                                    </>
                                )
                            ) : (
                                <>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-blue-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-blue-600 text-sm font-bold">1</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Administrative Review</p>
                                            <p className="text-gray-600 text-sm">Your survey will be reviewed by the administrative team.</p>
                                        </div>
                                    </div>
                                    <div className="flex items-start">
                                        <div className="flex-shrink-0 w-6 h-6 bg-green-100 rounded-full flex items-center justify-center mr-3 mt-0.5">
                                            <span className="text-green-600 text-sm font-bold">2</span>
                                        </div>
                                        <div>
                                            <p className="font-medium text-gray-900">Client Notification</p>
                                            <p className="text-gray-600 text-sm">The client will be notified of the survey results.</p>
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>

                    {/* Important Notes */}
                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-4 mb-6">
                        <h4 className="font-medium text-amber-900 mb-2">Important Notes:</h4>
                        <ul className="text-sm text-amber-800 space-y-1">
                            <li>• You can track the status of this assignment in your dashboard</li>
                            <li>• Any updates or questions will be communicated through the system</li>
                            <li>• Keep your contact information updated for important notifications</li>
                            {isDualSurveyor && (
                                <li>• You may be contacted if there are any conflicts between the two survey reports</li>
                            )}
                        </ul>
                    </div>

                    {/* Action Button */}
                    <div className="flex justify-center">
                        <button
                            onClick={onClose}
                            className="px-6 py-3 bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors font-medium"
                        >
                            Return to Dashboard
                        </button>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default SurveySubmissionConfirmation;