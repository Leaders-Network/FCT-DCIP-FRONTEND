"use client";
import React, { useState, useEffect } from "react";
import { Clock, MapPin, Calendar, Eye, AlertCircle } from "lucide-react";
import Link from "next/link";
import { getSurveyorAssignments, exportSurveyorCsv, triggerCsvDownload } from "@/services/api";
import ExportCsvPanel from "@/components/shared/ExportCsvPanel";

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
        project: {
            lga: string;
            address: string;
            projectType?: string;
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
            console.log('🔍 Fetching assignments with filter:', filter);
            console.log('🔍 Current path:', window.location.pathname);

            const response = await getSurveyorAssignments({
                status: filter === "all" ? undefined : filter,
                page: 1,
                limit: 50
            });

            console.log('📋 Assignments API response:', response);

            if (response.success) {
                const assignments = response.data.assignments || [];
                console.log('✅ Assignments received:', assignments.length);
                console.log('📄 First assignment:', assignments[0]);
                setAssignments(assignments);
            } else {
                console.error('❌ API response not successful:', response);
                setAssignments([]);
            }
        } catch (error: unknown) {
            const err = error as { message?: string; response?: { status?: number; data?: unknown } };
            console.error("❌ Failed to fetch assignments:", error);
            console.error("Error details:", {
                message: err.message,
                status: err.response?.status,
                data: err.response?.data
            });
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
                    <h1 className="text-2xl font-bold text-gray-900">My Assignments</h1>
                </div>
                <div className="animate-pulse space-y-4">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg border border-gray-200">
                            <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        </div>
                    ))}
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                <h1 className="text-xl sm:text-2xl font-bold text-gray-900">My Assignments</h1>
                <div className="flex items-center space-x-2">
                    <select
                        value={filter}
                        onChange={(e) => setFilter(e.target.value)}
                        className="w-full sm:w-auto px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
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
                <div className="bg-white rounded-lg border border-gray-200 p-12 text-center">
                    <AlertCircle className="h-12 w-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-semibold text-gray-900 mb-2">No assignments found</h3>
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
                            className="bg-white rounded-lg border border-gray-200 shadow-sm hover:shadow-md transition-shadow"
                        >
                            <div className="p-4 sm:p-6">
                                <div className="flex flex-col lg:flex-row lg:items-start lg:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex flex-wrap items-center gap-2 mb-2">
                                            <h3 className="text-lg font-semibold text-gray-900 break-words">
                                                {assignment.policyId?.project?.projectType || "Builder Liability Survey"}
                                            </h3>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusColor(assignment.status)}`}>
                                                {assignment.status.replace("_", " ").toUpperCase()}
                                            </span>
                                            <span className={`px-2.5 py-0.5 rounded-full text-xs font-medium ${getPriorityColor(assignment.priority)}`}>
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
                                                Builder: {assignment.policyId?.builder?.nameOfBuilder || "N/A"}
                                            </span>
                                        </div>
                                    </div>

                                    <div className="lg:ml-6">
                                        <Link
                                            href={`/surveyor/dashboard/assignments/${assignment._id}`}
                                            className="inline-flex w-full lg:w-auto justify-center items-center px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors"
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
