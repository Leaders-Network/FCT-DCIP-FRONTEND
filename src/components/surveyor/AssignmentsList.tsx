"use client";
import React, { useState, useEffect } from "react";
import { Clock, MapPin, Calendar, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getSurveyorAssignments, exportSurveyorCsv, triggerCsvDownload } from "@/services/api";
import ExportCsvPanel from "@/components/shared/ExportCsvPanel";
import { getDisplayValue, getPolicyDisplayTitle } from "@/utils/builderLiability";

interface Assignment {
    _id: string;
    policyId: {
        _id: string;
        policyNumber: string;
        builder: {
            nameOfBuilder: string;
            customerEmail: string;
            address: string;
        };
        client?: {
            name?: string;
        };
        project: {
            lga: string;
            address: string;
            projectType?: string;
            projectTitle?: string;
            projectName?: string;
            cadastralZone?: string;
        };
        status: string;
        createdAt: string;
    };
    status: string;
    priority: string;
    deadline: string;
    assignedAt: string;
}

const AssignmentsList = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [loading, setLoading] = useState(true);
    const [filter, setFilter] = useState<string>("all");

    useEffect(() => {
        fetchAssignments();
    }, [filter]);

    const fetchAssignments = async () => {
        setLoading(true);
        try {

            const response = await getSurveyorAssignments({
                status: filter === "all" ? undefined : filter,
                page: 1,
                limit: 50
            });

            if (response.success) {
                const assignments = response.data.assignments || [];
                setAssignments(assignments);
            } else {
                setAssignments([]);
            }
        } catch (error: unknown) {
            const err = error as { message?: string; response?: { status?: number; data?: unknown } };
            setAssignments([]);
        } finally {
            setLoading(false);
        }
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case "assigned":
                return "bg-yellow-100 text-yellow-800";
            case "in_progress":
            case "in-progress":
                return "bg-blue-100 text-blue-800";
            case "completed":
                return "bg-green-100 text-green-800";
            default:
                return "bg-gray-100 text-gray-800";
        }
    };

    const getPriorityColor = (priority: string) => {
        switch (priority) {
            case "urgent":
                return "bg-red-100 text-red-800";
            case "high":
                return "bg-orange-100 text-orange-800";
            case "medium":
                return "bg-yellow-100 text-yellow-800";
            default:
                return "bg-green-100 text-green-800";
        }
    };

    if (loading) {
        return (
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <h1 className="text-2xl font-bold tracking-tight text-gray-900">My Assignments</h1>
                </div>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="rounded-3xl border border-gray-200 bg-white/80 p-6">
                            <div className="mb-4 h-6 w-1/3 rounded-full bg-gray-300"></div>
                            <div className="h-4 w-1/2 rounded-full bg-gray-300"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {/* Header */}
            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-5 shadow-sm backdrop-blur-xl sm:p-6">
                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-xl font-bold tracking-tight text-gray-900 sm:text-2xl">My Assignments</h1>
                        <p className="mt-1 text-sm text-gray-500">Review, filter, and open your assigned surveys.</p>
                    </div>
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full rounded-full border border-white/70 bg-white/90 px-4 py-3 text-sm shadow-sm transition-all duration-300 focus:border-[#028835] focus:outline-none focus:ring-2 focus:ring-[#028835]/20 sm:w-auto"
                    >
                        <option value="all">All Assignments</option>
                        <option value="assigned">Assigned</option>
                        <option value="in_progress">In Progress</option>
                        <option value="completed">Completed</option>
                    </select>
                </div>
            </div>

            {/* CSV Export Panel */}
            <ExportCsvPanel
                onExport={async (startDate, endDate) => {
                    const csv = await exportSurveyorCsv(startDate, endDate);
                    triggerCsvDownload(csv, 'my_assignments.csv');
                }}
                buttonLabel="Export Assignments CSV"
            />

            {/* Assignments List */}
            {assignments.length === 0 ? (
                <div className="rounded-[2rem] border border-white/70 bg-white/85 p-12 text-center shadow-sm backdrop-blur-xl">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="mb-2 text-lg font-semibold text-gray-900">No assignments found</h3>
                    <p className="text-gray-600">
                        {filter === "all"
                            ? "You don't have any assignments yet."
                            : `No ${filter.replace("_", " ")} assignments found.`
                        }
                    </p>
                </div>
            ) : (
                <div className="space-y-4">
                    {assignments.map((assignment) => (
                        <div
                            key={assignment._id}
                            className="group overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold tracking-tight text-gray-900 break-words">
                                                {getPolicyDisplayTitle(assignment.policyId as any)}
                                            </h3>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace("_", " ").toUpperCase()}
                                            </span>
                                            <span className={`rounded-full px-3 py-1 text-xs font-medium shadow-sm ${getPriorityColor(assignment.priority)}`}>
                                                {assignment.priority.toUpperCase()}
                                            </span>
                                        </div>

                                        <div className="space-y-2 text-sm text-gray-600">
                                            <div className="flex items-center">
                                                <MapPin className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>{assignment.policyId?.project?.address || "Address not available"}</span>
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>
                                                    Deadline: {new Date(assignment.deadline).toLocaleDateString()}
                                                    {new Date(assignment.deadline) < new Date() && (
                                                        <span className="ml-2 text-red-600 font-medium">(Overdue)</span>
                                                    )}
                                                </span>
                                            </div>
                                            <div className="flex items-center">
                                                <Clock className="h-4 w-4 mr-2 flex-shrink-0" />
                                                <span>Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}</span>
                                            </div>
                                        </div>

                                        <div className="mt-3 flex flex-col sm:flex-row sm:items-center gap-1 sm:gap-4 text-sm">
                                            <span className="text-gray-500 break-words">
                                                Policy #{assignment.policyId?.policyNumber || "N/A"}
                                            </span>
                                            <span className="text-gray-500 break-words">
                                                LGA: {assignment.policyId?.project?.lga || "N/A"}
                                            </span>
                                            <span className="text-gray-500 break-words">
                                                Zone: {getDisplayValue(assignment.policyId?.project?.cadastralZone)}
                                            </span>
                                            <span className="text-gray-500 break-words">
                                                Builder: {assignment.policyId?.builder?.nameOfBuilder || "N/A"}
                                            </span>
                                            <span className="text-gray-500 break-words">
                                                Contractor: {getDisplayValue(assignment.policyId?.builder?.nameOfBuilder)}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="lg:ml-6">
                                        <Link
                                            href={`/surveyor/dashboard/assignments/${assignment._id}`}
                                            className="inline-flex w-full items-center justify-center rounded-full bg-gradient-to-r from-[#028835] to-emerald-700 px-5 py-2.5 text-white shadow-md shadow-emerald-200/60 transition-all duration-300 hover:-translate-y-0.5 hover:shadow-lg lg:w-auto"
                                        >
                                            <Eye className="h-4 w-4 mr-2" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AssignmentsList;
