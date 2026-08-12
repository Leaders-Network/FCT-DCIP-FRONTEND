"use client";

import React, { useEffect, useState } from "react";
import {
    X,
    User,
    Mail,
    CheckCircle,
    AlertTriangle,
    RefreshCw,
    UserPlus,
} from "lucide-react";
import { PolicyRequest, Surveyor } from "@/types/api.types";
import { adminApi } from "@/services/api";
import { useAuth } from "@/context/useAuth";
import {
    Dialog,
    DialogContent,
    DialogHeader,
    DialogTitle,
    DialogDescription,
} from "@/components/ui/dialog";

interface AssignSurveyorModalProps {
    show: boolean;
    onClose: () => void;
    selectedPolicy: PolicyRequest | null;
    isReassign?: boolean;
    onAssignmentCreated: () => void;
    onAssignmentReassigned: () => void;
}

const PRIORITY_CFG: Record<
    string,
    { label: string; bg: string; border: string; text: string }
> = {
    urgent: { label: "Urgent", bg: "bg-red-50", border: "border-red-200", text: "text-red-700" },
    high: { label: "High", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" },
    medium: { label: "Medium", bg: "bg-amber-50", border: "border-amber-200", text: "text-amber-700" },
    low: { label: "Low", bg: "bg-emerald-50", border: "border-emerald-200", text: "text-emerald-700" },
};

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
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [newAssignmentData, setNewAssignmentData] = useState({
        surveyorId: "",
        priority: "medium",
        deadline: "",
        instructions: "",
    });
    const [error, setError] = useState<string | null>(null);

    const normalizeSurveyor = (surveyor: Surveyor | Record<string, unknown>): Surveyor => {
        const safeSurveyor = surveyor as Surveyor & {
            userId?: {
                firstname?: string;
                lastname?: string;
                email?: string;
                phonenumber?: string;
            };
        };

        return {
            ...safeSurveyor,
            firstname: safeSurveyor.firstname || safeSurveyor.userId?.firstname || "",
            lastname: safeSurveyor.lastname || safeSurveyor.userId?.lastname || "",
            email: safeSurveyor.email || safeSurveyor.userId?.email || "",
            phonenumber: safeSurveyor.phonenumber || safeSurveyor.userId?.phonenumber || "",
        };
    };

    useEffect(() => {
        const fetchSurveyors = async () => {
            try {
                setLoading(true);
                const response = await adminApi.getSurveyors({ status: "active" });
                if (response?.data) {
                    const normalized = Array.isArray(response.data)
                        ? response.data.map(normalizeSurveyor)
                        : [];
                    setAvailableSurveyors(normalized);
                } else {
                    setAvailableSurveyors([]);
                }
            } catch {
                setAvailableSurveyors([]);
            } finally {
                setLoading(false);
            }
        };

        if (show) {
            fetchSurveyors();
            setNewAssignmentData({
                surveyorId: "",
                priority: "medium",
                deadline: "",
                instructions: "",
            });
            setError(null);
        }
    }, [show]);

    const handleCreateAssignment = async () => {
        if (!newAssignmentData.deadline) return setError("Please select a deadline.");
        if (!newAssignmentData.surveyorId) return setError("Please select an AMMC surveyor.");

        try {
            setAssigning(true);
            const assignmentData = {
                policyId: selectedPolicy!._id,
                surveyorId: newAssignmentData.surveyorId,
                assignedBy: user?._id,
                deadline: new Date(newAssignmentData.deadline).toISOString(),
                priority: newAssignmentData.priority as "low" | "medium" | "high" | "urgent",
                instructions: newAssignmentData.instructions || "N/A",
            };

            await adminApi.createAssignment(assignmentData);
            onAssignmentCreated();
            onClose();
        } catch (error: unknown) {
            const errorMessage =
                error && typeof error === "object" && "response" in error && (error as any).response?.data?.message
                    ? (error as any).response.data.message
                    : error instanceof Error
                        ? error.message
                        : "Unknown error occurred";
            setError(`Failed to create assignment: ${errorMessage}`);
        } finally {
            setAssigning(false);
        }
    };

    const handleReassignSurveyor = async () => {
        if (!newAssignmentData.deadline) return setError("Please select a deadline.");
        if (!newAssignmentData.surveyorId) return setError("Please select an AMMC surveyor.");
        if (!newAssignmentData.instructions) return setError("Please provide a reason for reassignment.");

        try {
            setAssigning(true);
            const assignmentResponse = await adminApi.getAssignmentByPolicyId(selectedPolicy!._id);
            if (!assignmentResponse.success || !assignmentResponse.data) {
                setError("Could not find assignment for the selected policy.");
                setAssigning(false);
                return;
            }

            const assignment = assignmentResponse.data;
            const response = await adminApi.reassignSurveyor(
                assignment._id,
                newAssignmentData.surveyorId,
                newAssignmentData.instructions,
                newAssignmentData.deadline,
                newAssignmentData.priority
            );

            if (response.success) {
                onAssignmentReassigned();
                onClose();
            } else {
                setError(response.message || "Failed to re-assign AMMC surveyor");
            }
        } catch {
            setError("Failed to re-assign AMMC surveyor. Please try again.");
        } finally {
            setAssigning(false);
        }
    };

    const handleOpenChange = (open: boolean) => {
        if (!open) {
            onClose();
        }
    };

    if (!show) return null;

    const selectedSurveyorInfo = availableSurveyors.find(
        (s) => s._id === newAssignmentData.surveyorId
    );
    const policyLabel = selectedPolicy?.policyNumber || selectedPolicy?._id?.substring(0, 8) || "N/A";
    const selectedPriority = PRIORITY_CFG[newAssignmentData.priority] || PRIORITY_CFG.medium;

    return (
        <Dialog open={show} onOpenChange={handleOpenChange}>
            <DialogContent
                hideCloseButton
                className="!w-[min(96vw,80rem)] !max-h-[94vh] !overflow-hidden !rounded-[2rem] !border !border-white/70 !bg-white/95 !p-0 !shadow-[0_32px_120px_rgba(15,23,42,0.25)] backdrop-blur-xl"
            >
                <div className="flex max-h-[94vh] flex-col">
                    <div className="h-1.5 w-full shrink-0 bg-gradient-to-r from-[#028835] via-emerald-500 to-teal-400" />

                    <DialogHeader className="shrink-0 border-b border-slate-100 px-6 py-5 text-left sm:px-8">
                        <div className="flex items-start justify-between gap-4">
                            <div className="min-w-0">
                                <p className="text-[10px] font-semibold uppercase tracking-[0.2em] text-emerald-600">
                                    {isReassign ? "Manual Reassignment" : "Initial Assignment"}
                                </p>
                                <DialogTitle className="mt-1 text-xl font-bold text-slate-900">
                                    {isReassign ? "Reassign Surveyor" : "Assign AMMC Surveyor"}
                                </DialogTitle>
                                <DialogDescription className="mt-0.5 text-sm text-slate-500">
                                    Policy #{policyLabel}
                                </DialogDescription>
                            </div>
                            <button
                                type="button"
                                onClick={onClose}
                                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:border-slate-300 hover:text-slate-600"
                                aria-label="Close assignment dialog"
                            >
                                <X className="h-4 w-4" />
                            </button>
                        </div>
                    </DialogHeader>

                    <div className="min-h-0 flex-1 overflow-hidden">
                        <div className="grid h-full min-h-0 grid-cols-1 md:grid-cols-[minmax(0,1fr)_24rem]">
                            <div className="flex min-h-0 min-w-0 flex-col overflow-hidden border-b border-slate-100 bg-slate-50/30 md:border-b-0 md:border-r md:border-slate-100">
                                <div className="shrink-0 border-b border-slate-100 p-5">
                                    <label className="text-xs font-semibold uppercase tracking-[0.15em] text-slate-500">
                                        Select Surveyor
                                    </label>
                                </div>

                                <div className="min-h-0 flex-1 overflow-y-auto p-4">
                                    {error && (
                                        <div className="mb-4 flex items-center gap-2.5 rounded-2xl border border-red-200 bg-red-50 px-4 py-3">
                                            <AlertTriangle className="h-4 w-4 shrink-0 text-red-500" />
                                            <p className="text-sm text-red-700">{error}</p>
                                        </div>
                                    )}

                                    {loading ? (
                                        <div className="flex items-center justify-center py-12">
                                            <RefreshCw className="h-6 w-6 animate-spin text-slate-300" />
                                        </div>
                                    ) : availableSurveyors.length > 0 ? (
                                        <div className="space-y-3">
                                            {availableSurveyors.map((surveyor) => {
                                                const isSelected = newAssignmentData.surveyorId === surveyor._id;

                                                return (
                                                    <button
                                                        key={surveyor._id}
                                                        type="button"
                                                        onClick={() =>
                                                            setNewAssignmentData((prev) => ({
                                                                ...prev,
                                                                surveyorId: isSelected ? "" : surveyor._id,
                                                            }))
                                                        }
                                                        className={`w-full rounded-2xl border p-4 text-left transition-all duration-200 hover:-translate-y-0.5 hover:shadow-md ${
                                                            isSelected
                                                                ? "border-emerald-300 bg-emerald-50/80 shadow-[0_0_0_2px_rgba(5,150,105,0.15)]"
                                                                : "border-slate-200 bg-white hover:border-emerald-200"
                                                        }`}
                                                    >
                                                        <div className="flex items-start gap-3">
                                                            <div
                                                                className={`flex h-10 w-10 shrink-0 items-center justify-center rounded-xl text-sm font-bold text-white shadow-sm ${
                                                                    isSelected ? "bg-emerald-600" : "bg-slate-400"
                                                                }`}
                                                            >
                                                                {surveyor.firstname?.[0] || "?"}
                                                                {surveyor.lastname?.[0] || "?"}
                                                            </div>
                                                            <div className="min-w-0 flex-1">
                                                                <div className="flex items-center justify-between gap-3">
                                                                    <p className="truncate text-sm font-semibold text-slate-900">
                                                                        {surveyor.firstname} {surveyor.lastname}
                                                                    </p>
                                                                    {isSelected && <CheckCircle className="h-4 w-4 text-emerald-600" />}
                                                                </div>
                                                                <div className="mt-1 flex items-center gap-1.5 text-xs text-slate-500">
                                                                    <Mail className="h-3 w-3" />
                                                                    <span className="truncate">{surveyor.email}</span>
                                                                </div>
                                                                {surveyor.profile?.specialization &&
                                                                    surveyor.profile.specialization.length > 0 && (
                                                                        <div className="mt-2 flex flex-wrap gap-1">
                                                                            {surveyor.profile.specialization.slice(0, 2).map((sp, i) => (
                                                                                <span
                                                                                    key={i}
                                                                                    className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600"
                                                                                >
                                                                                    {sp}
                                                                                </span>
                                                                            ))}
                                                                            {surveyor.profile.specialization.length > 2 && (
                                                                                <span className="rounded-full border border-slate-200 bg-white px-2 py-0.5 text-[10px] font-medium text-slate-600">
                                                                                    +{surveyor.profile.specialization.length - 2} more
                                                                                </span>
                                                                            )}
                                                                        </div>
                                                                    )}
                                                            </div>
                                                        </div>
                                                    </button>
                                                );
                                            })}
                                        </div>
                                    ) : (
                                        <div className="flex flex-col items-center py-10 text-center">
                                            <User className="mb-2 h-8 w-8 text-slate-300" />
                                            <p className="text-sm font-semibold text-slate-600">No surveyors available</p>
                                        </div>
                                    )}
                                </div>
                            </div>

                            <div className="flex min-h-0 flex-col overflow-hidden">
                                <div className="min-h-0 flex-1 overflow-y-auto p-6">
                                    <div className="space-y-6">
                                        <div className="rounded-2xl border border-slate-100 bg-slate-50 p-4 space-y-3">
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Policy Holder
                                                </label>
                                                <p className="mt-0.5 text-sm font-medium text-slate-800">
                                                    {selectedPolicy?.contactDetails?.fullName || "N/A"}
                                                </p>
                                            </div>
                                            <div>
                                                <label className="text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">
                                                    Address
                                                </label>
                                                <p className="mt-0.5 text-sm leading-relaxed text-slate-600">
                                                    {selectedPolicy?.propertyDetails?.address ||
                                                        selectedPolicy?.propertyDetails?.fullAddress ||
                                                        "N/A"}
                                                </p>
                                            </div>
                                        </div>

                                        <div className="space-y-4">
                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                    Priority Level
                                                </label>
                                                <select
                                                    value={newAssignmentData.priority}
                                                    onChange={(e) =>
                                                        setNewAssignmentData((prev) => ({
                                                            ...prev,
                                                            priority: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                                                >
                                                    <option value="normal">Normal</option>
                                                    <option value="urgent">Urgent</option>
                                                    <option value="high">High</option>
                                                    <option value="medium">Medium</option>
                                                    <option value="low">Low</option>
                                                </select>
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                    Deadline
                                                </label>
                                                <input
                                                    type="date"
                                                    min={new Date().toISOString().split("T")[0]}
                                                    value={newAssignmentData.deadline}
                                                    onChange={(e) =>
                                                        setNewAssignmentData((prev) => ({
                                                            ...prev,
                                                            deadline: e.target.value,
                                                        }))
                                                    }
                                                    className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2.5 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                                                />
                                            </div>

                                            <div>
                                                <label className="mb-1.5 block text-xs font-semibold text-slate-700">
                                                    {isReassign ? "Reason for Reassignment" : "Instructions (Optional)"}
                                                    {isReassign && <span className="ml-1 text-red-500">*</span>}
                                                </label>
                                                <textarea
                                                    rows={4}
                                                    value={newAssignmentData.instructions}
                                                    onChange={(e) =>
                                                        setNewAssignmentData((prev) => ({
                                                            ...prev,
                                                            instructions: e.target.value,
                                                        }))
                                                    }
                                                    placeholder={
                                                        isReassign
                                                            ? "Why is this being reassigned?"
                                                            : "Any specific instructions for the surveyor?"
                                                    }
                                                    className="w-full resize-none rounded-xl border border-slate-200 bg-white p-3 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
                                                />
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="shrink-0 border-t border-slate-100 px-6 py-4 sm:px-8">
                        <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                            <div className="flex items-center gap-2">
                                {selectedSurveyorInfo ? (
                                    <>
                                        <div className="flex h-8 w-8 items-center justify-center rounded-xl bg-emerald-100 text-xs font-bold text-emerald-700">
                                            {selectedSurveyorInfo.firstname?.[0] || "?"}
                                            {selectedSurveyorInfo.lastname?.[0] || "?"}
                                        </div>
                                        <div>
                                            <p className="text-xs font-semibold text-slate-800">Selected</p>
                                            <p className="text-xs text-slate-500">
                                                {selectedPriority.label} priority
                                            </p>
                                        </div>
                                    </>
                                ) : (
                                    <span className="text-xs text-slate-400">No surveyor selected</span>
                                )}
                            </div>

                            <div className="flex shrink-0 items-center gap-2">
                                <button
                                    onClick={onClose}
                                    className="rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-semibold text-slate-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={isReassign ? handleReassignSurveyor : handleCreateAssignment}
                                    disabled={
                                        !newAssignmentData.surveyorId ||
                                        !newAssignmentData.deadline ||
                                        (isReassign && !newAssignmentData.instructions) ||
                                        assigning
                                    }
                                    className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-[#028835] to-emerald-600 px-4 py-2.5 text-sm font-bold text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                                >
                                    {assigning ? (
                                        <>
                                            <div className="h-4 w-4 animate-spin rounded-full border-2 border-white border-t-transparent" />
                                            {isReassign ? "Reassigning..." : "Assigning..."}
                                        </>
                                    ) : (
                                        <>
                                            <UserPlus className="h-4 w-4" />
                                            {isReassign ? "Reassign Surveyor" : "Assign Surveyor"}
                                        </>
                                    )}
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default AssignSurveyorModal;
