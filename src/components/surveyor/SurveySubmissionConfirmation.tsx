"use client";

import React, { useState } from "react";
import { CheckCircle, FileText, Users, Clock, ArrowRight, Download, X } from "lucide-react";
import { SurveySubmissionResult, PolicyRequest } from "@/types/api.types";
import { downloadSubmissionZip } from "@/services/api";
import {
    Dialog,
    DialogContent,
    DialogDescription,
    DialogHeader,
    DialogTitle,
} from "@/components/ui/dialog";

interface SurveySubmissionConfirmationProps {
    submissionResult: SurveySubmissionResult;
    policy: PolicyRequest;
    isOpen: boolean;
    onClose: () => void;
}

const SurveySubmissionConfirmation: React.FC<SurveySubmissionConfirmationProps> = ({
    submissionResult,
    policy,
    isOpen,
    onClose,
}) => {
    const [isDownloading, setIsDownloading] = useState(false);
    const isDualSurveyor = submissionResult.dualAssignmentInfo?.isDualSurveyor || false;

    const handleDownloadDocs = async () => {
        setIsDownloading(true);
        try {
            await downloadSubmissionZip(submissionResult.submission._id);
        } finally {
            setIsDownloading(false);
        }
    };

    const completionStatus = submissionResult.dualAssignmentInfo?.completionStatus || 0;
    const otherSurveyorNotified = submissionResult.otherSurveyorNotified || false;

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    if (!isOpen) return null;

    return (
        <Dialog open={isOpen} onOpenChange={handleOpenChange}>
            <DialogContent
                hideCloseButton
                className="!w-[min(96vw,56rem)] !max-h-[92vh] !overflow-hidden !rounded-[1.75rem] !border !border-slate-200 !bg-white !p-0 !shadow-2xl"
            >
                <div className="flex max-h-[92vh] flex-col">
                    <DialogHeader className="shrink-0 bg-gradient-to-r from-emerald-600 via-green-600 to-teal-600 px-6 py-5 text-left text-white sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <DialogTitle className="flex items-center gap-3 text-xl font-bold text-white sm:text-2xl">
                                    <CheckCircle className="h-8 w-8 shrink-0" />
                                    Survey Submitted Successfully!
                                </DialogTitle>
                                <DialogDescription className="mt-2 text-sm text-emerald-50">
                                    Your survey report has been received and processed.
                                </DialogDescription>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-white/20 bg-white/10 text-white transition-colors hover:bg-white/20"
                                aria-label="Close confirmation dialog"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-y-auto px-6 py-6 sm:px-8">
                        <div className="space-y-6">
                            <section>
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">Submission Details</h3>
                                <div className="rounded-2xl bg-gray-50 p-4">
                                    <div className="space-y-2">
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Builder:</span>
                                            <span className="font-medium text-gray-900">
                                                {policy.builder?.nameOfBuilder || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Project Address:</span>
                                            <span className="font-medium text-gray-900">
                                                {policy.project?.address || policy.builder?.address || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Project LGA:</span>
                                            <span className="font-medium text-gray-900">
                                                {policy.project?.lga || "N/A"}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Submission ID:</span>
                                            <span className="font-medium text-gray-900">
                                                {submissionResult.submission._id}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Organization:</span>
                                            <span className="font-medium text-gray-900">
                                                {submissionResult.organization}
                                            </span>
                                        </div>
                                        <div className="flex justify-between gap-4">
                                            <span className="text-gray-600">Submitted:</span>
                                            <span className="font-medium text-gray-900">
                                                {new Date(submissionResult.submission.submissionTime).toLocaleString()}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            </section>

                            {isDualSurveyor && (
                                <section>
                                    <h3 className="mb-3 flex items-center gap-2 text-lg font-semibold text-gray-900">
                                        <Users className="h-5 w-5" />
                                        Dual Surveyor Assignment Status
                                    </h3>
                                    <div className="rounded-2xl border border-blue-200 bg-blue-50 p-4">
                                        <div className="mb-3 flex items-center justify-between gap-4">
                                            <span className="font-medium text-blue-900">Overall Progress</span>
                                            <span className="font-bold text-blue-900">{completionStatus}% Complete</span>
                                        </div>

                                        <div className="mb-4 h-3 w-full rounded-full bg-blue-200">
                                            <div
                                                className={`h-3 rounded-full transition-all duration-500 ${
                                                    completionStatus === 100
                                                        ? "bg-green-500"
                                                        : completionStatus === 50
                                                            ? "bg-yellow-500"
                                                            : "bg-blue-400"
                                                }`}
                                                style={{ width: `${completionStatus}%` }}
                                            />
                                        </div>

                                        <div className="space-y-2 text-sm">
                                            {completionStatus === 100 ? (
                                                <div className="flex items-center text-green-700">
                                                    <CheckCircle className="mr-2 h-4 w-4" />
                                                    <span>
                                                        Both AMMC and NIA surveys completed. Reports will be automatically merged.
                                                    </span>
                                                </div>
                                            ) : completionStatus === 50 ? (
                                                <div className="flex items-center text-yellow-700">
                                                    <Clock className="mr-2 h-4 w-4" />
                                                    <span>
                                                        Your survey is complete. Waiting for the partner surveyor to submit their report.
                                                    </span>
                                                </div>
                                            ) : (
                                                <div className="flex items-center text-blue-700">
                                                    <FileText className="mr-2 h-4 w-4" />
                                                    <span>Survey assignment in progress.</span>
                                                </div>
                                            )}

                                            {otherSurveyorNotified && (
                                                <div className="mt-2 flex items-center text-blue-700">
                                                    <ArrowRight className="mr-2 h-4 w-4" />
                                                    <span>Partner surveyor has been notified of your submission.</span>
                                                </div>
                                            )}
                                        </div>
                                    </div>
                                </section>
                            )}

                            <section>
                                <h3 className="mb-3 text-lg font-semibold text-gray-900">What Happens Next?</h3>
                                <div className="space-y-3">
                                    {isDualSurveyor ? (
                                        completionStatus === 100 ? (
                                            <>
                                                <div className="flex items-start">
                                                    <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                                                        <span className="text-sm font-bold text-green-600">1</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Automatic Report Merging</p>
                                                        <p className="text-sm text-gray-600">
                                                            Both surveys will be automatically merged into a comprehensive report.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                        <span className="text-sm font-bold text-blue-600">2</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Quality Review</p>
                                                        <p className="text-sm text-gray-600">
                                                            The merged report will undergo quality review and conflict detection.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-purple-100">
                                                        <span className="text-sm font-bold text-purple-600">3</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Client Notification</p>
                                                        <p className="text-sm text-gray-600">
                                                            The client will be notified when the final report is ready.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        ) : (
                                            <>
                                                <div className="flex items-start">
                                                    <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-yellow-100">
                                                        <span className="text-sm font-bold text-yellow-600">1</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Waiting for Partner Survey</p>
                                                        <p className="text-sm text-gray-600">
                                                            The partner surveyor will complete their assessment.
                                                        </p>
                                                    </div>
                                                </div>
                                                <div className="flex items-start">
                                                    <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                        <span className="text-sm font-bold text-blue-600">2</span>
                                                    </div>
                                                    <div>
                                                        <p className="font-medium text-gray-900">Automatic Processing</p>
                                                        <p className="text-sm text-gray-600">
                                                            Once both surveys are complete, reports will be automatically merged.
                                                        </p>
                                                    </div>
                                                </div>
                                            </>
                                        )
                                    ) : (
                                        <>
                                            <div className="flex items-start">
                                                <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-blue-100">
                                                    <span className="text-sm font-bold text-blue-600">1</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Administrative Review</p>
                                                    <p className="text-sm text-gray-600">
                                                        Your survey will be reviewed by the administrative team.
                                                    </p>
                                                </div>
                                            </div>
                                            <div className="flex items-start">
                                                <div className="mr-3 mt-0.5 flex h-6 w-6 shrink-0 items-center justify-center rounded-full bg-green-100">
                                                    <span className="text-sm font-bold text-green-600">2</span>
                                                </div>
                                                <div>
                                                    <p className="font-medium text-gray-900">Client Notification</p>
                                                    <p className="text-sm text-gray-600">
                                                        The client will be notified of the survey results.
                                                    </p>
                                                </div>
                                            </div>
                                        </>
                                    )}
                                </div>
                            </section>

                            <section className="rounded-2xl border border-amber-200 bg-amber-50 p-4">
                                <h4 className="mb-2 font-medium text-amber-900">Important Notes:</h4>
                                <ul className="space-y-1 text-sm text-amber-800">
                                    <li>- You can track the status of this assignment in your dashboard</li>
                                    <li>- Any updates or questions will be communicated through the system</li>
                                    <li>- Keep your contact information updated for important notifications</li>
                                    {isDualSurveyor && (
                                        <li>- You may be contacted if there are any conflicts between the two survey reports</li>
                                    )}
                                </ul>
                            </section>
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-slate-200 bg-white px-6 py-4 sm:px-8">
                        <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                            <button
                                onClick={handleDownloadDocs}
                                disabled={isDownloading}
                                className="inline-flex items-center justify-center gap-2 rounded-lg border border-[#028835] px-5 py-3 font-medium text-[#028835] transition-colors hover:bg-green-50 disabled:cursor-not-allowed disabled:opacity-60"
                            >
                                <Download className="h-4 w-4" />
                                {isDownloading ? "Downloading..." : "Download Survey Documents"}
                            </button>
                            <button
                                onClick={onClose}
                                className="rounded-lg bg-[#028835] px-5 py-3 font-medium text-white transition-colors hover:bg-green-700"
                            >
                                Return to Dashboard
                            </button>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default SurveySubmissionConfirmation;
