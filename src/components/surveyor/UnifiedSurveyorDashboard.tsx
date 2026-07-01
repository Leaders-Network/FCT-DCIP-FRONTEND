"use client";
import React, { useState, useEffect } from "react";
import {
    FileText,
    Clock,
    CheckCircle,
    Users,
    Calendar,
    MapPin,
    ClipboardList,
    AlertCircle,
    Building,
    Phone,
    Eye,
    TrendingUp,
    Award,
    Calculator
} from "lucide-react";
import Link from "next/link";
import { getSurveyorAssignments, getSurveyorProfile } from "@/services/api";
import { getCookie } from "@/utils/cookies";
import DashboardErrorBanner from "@/components/shared/DashboardErrorBanner";

interface Assignment {
    _id: string;
    policyId: {
        _id: string;
        policyNumber: string;
        builder: {
            nameOfBuilder: string;
            customerEmail: string;
            address: string;
            telNo?: string;
        };
        project: {
            lga: string;
            district?: string;
            address: string;
        };
        status: string;
        createdAt: string;
    };
    surveyorId: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
    };
    status: string;
    priority: string;
    deadline: string;
    assignedAt: string;
    location: {
        address: string;
        lga?: string;
        district?: string;
        contactPerson?: {
            name: string;
            phone: string;
            email: string;
        };
    };
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color: 'blue' | 'yellow' | 'purple' | 'green' | 'orange';
    subtitle?: string;
}

const StatCard = ({ icon, label, value, color, subtitle }: StatCardProps) => (
    <div className="group relative overflow-hidden rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:shadow-2xl hover:shadow-emerald-100/60">
        <div className="flex items-center">
            <div
                className={[
                    "flex-shrink-0 rounded-2xl p-3 transition-transform duration-300 group-hover:scale-105",
                    color === "blue" ? "bg-blue-100" : "",
                    color === "yellow" ? "bg-yellow-100" : "",
                    color === "purple" ? "bg-purple-100" : "",
                    color === "green" ? "bg-green-100" : "",
                    color === "orange" ? "bg-orange-100" : ""
                ].filter(Boolean).join(" ")}
            >
                {React.createElement(icon, {
                    className: [
                        "h-6 w-6",
                        color === "blue" ? "text-blue-600" : "",
                        color === "yellow" ? "text-yellow-600" : "",
                        color === "purple" ? "text-purple-600" : "",
                        color === "green" ? "text-green-600" : "",
                        color === "orange" ? "text-orange-600" : ""
                    ].filter(Boolean).join(" ")
                })}
            </div>
            <div className="ml-4 flex-1">
                <p className="text-sm font-medium text-gray-500">{label}</p>
                <p className="text-2xl font-bold tracking-tight text-gray-900">{value}</p>
                {subtitle && <p className="mt-1 text-xs text-gray-500">{subtitle}</p>}
            </div>
        </div>
    </div>
);

const UnifiedSurveyorDashboard = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        assigned: 0,
        inProgress: 0,
        completed: 0,
        rating: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [friendlyError, setFriendlyError] = useState<string | null>(null);
    const [surveyorName, setSurveyorName] = useState("Surveyor");

    useEffect(() => {
        fetchSurveyorData();
    }, []);

    useEffect(() => {
        const safeName = (value?: string) => {
            const name = (value || "").trim().replace(/\s+/g, " ");
            if (!name || name.toLowerCase() === "surveyor") return null;
            return name;
        };

        const applyName = (value?: string) => {
            const name = safeName(value);
            if (name) {
                setSurveyorName(name);
                localStorage.setItem("surveyorName", name);
                return true;
            }
            return false;
        };

        const hydrateName = async () => {
            const fromStorage = localStorage.getItem("surveyorName");
            if (applyName(fromStorage || undefined)) return;

            const infoCookie = getCookie("surveyorInfo");
            if (infoCookie) {
                try {
                    const parsed = JSON.parse(infoCookie) as { name?: string };
                    if (applyName(parsed?.name)) return;
                } catch (error) {
                    // ignore
                }
            }

            const nameCookie = getCookie("surveyorName");
            if (applyName(nameCookie || undefined)) return;

            try {
                const profileResponse = await getSurveyorProfile();
                const surveyor = profileResponse?.data;
                const firstName = surveyor?.userId?.firstname || "";
                const lastName = surveyor?.userId?.lastname || "";
                applyName(`${firstName} ${lastName}`);
            } catch (error) {
                // ignore
            }
        };

        const onNameUpdated = () => {
            const value = localStorage.getItem("surveyorName");
            applyName(value || undefined);
        };

        hydrateName();
        window.addEventListener("surveyor-name-updated", onNameUpdated);
        return () => window.removeEventListener("surveyor-name-updated", onNameUpdated);
    }, []);

    const fetchSurveyorData = async () => {
        setLoading(true);
        setError(null);
        setFriendlyError(null);

        try {
            const assignmentsResponse = await getSurveyorAssignments({ status: 'all', page: 1, limit: 100 });

            const fetchedAssignments = assignmentsResponse?.data?.assignments || [];
            if (fetchedAssignments.length) {
                setAssignments(fetchedAssignments);

                const total = fetchedAssignments.length;
                const assigned = fetchedAssignments.filter((a: Assignment) => a.status === 'assigned').length;
                const inProgress = fetchedAssignments.filter((a: Assignment) =>
                    a.status === 'accepted' || a.status === 'in_progress'
                ).length;
                const completed = fetchedAssignments.filter((a: Assignment) => a.status === 'completed').length;

                setStats({
                    total,
                    assigned,
                    inProgress,
                    completed,
                    rating: 4.5
                });
            } else {
                setAssignments([]);
                setFriendlyError("No surveyor assignments found. If this seems wrong, please contact the Gladfaith team.");
            }
        } catch (err) {
            setError("Failed to load dashboard data. Please try again later.");
            setFriendlyError("We couldn't load your survey dashboard right now. Please refresh or contact the Gladfaith team.");
        } finally {
            setLoading(false);
        }
    };

    const firstName = surveyorName.split(" ")[0];
    const recentAssignments = assignments.slice(0, 5);

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm";

        switch (status) {
            case 'assigned':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                        <Clock className="w-3 h-3 mr-1" />
                        New Assignment
                    </span>
                );
            case 'accepted':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                    </span>
                );
            case 'in_progress':
                return (
                    <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
                        <ClipboardList className="w-3 h-3 mr-1" />
                        In Progress
                    </span>
                );
            case 'completed':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                    </span>
                );
            case 'cancelled':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800`}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelled
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                        {status}
                    </span>
                );
        }
    };

    const getPriorityBadge = (priority: string) => {
        const priorityConfig: Record<string, string> = {
            low: 'bg-gray-100 text-gray-800',
            medium: 'bg-blue-100 text-blue-800',
            high: 'bg-orange-100 text-orange-800',
            urgent: 'bg-red-100 text-red-800'
        };

        return (
            <span className={`inline-flex items-center rounded-full border px-3 py-1 text-xs font-medium shadow-sm ${priorityConfig[priority] || priorityConfig.medium}`}>
                {priority?.toUpperCase() || 'MEDIUM'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 w-1/3 rounded-2xl bg-gray-200"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="h-24 rounded-3xl bg-gray-200 p-6"></div>
                    ))}
                </div>
                <div className="h-64 rounded-3xl bg-gray-200"></div>
            </div>
        );
    }

    if (error && !friendlyError) {
        return (
            <div className="flex h-64 flex-col items-center justify-center rounded-3xl border border-red-200 bg-red-50/80 shadow-sm">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-medium text-red-800">An error occurred</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchSurveyorData}
                    className="mt-4 rounded-full bg-red-600 px-5 py-2 text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-red-700 hover:shadow-lg"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-6 sm:space-y-8">
            {friendlyError && (
                <DashboardErrorBanner message={friendlyError} />
            )}

            {/* Header */}
            <div className="relative overflow-hidden rounded-[2rem] bg-gradient-to-br from-emerald-600 via-green-600 to-teal-600 p-6 text-white shadow-[0_24px_80px_rgba(16,185,129,0.22)]">
                <div className="pointer-events-none absolute inset-0 bg-white/10" />
                <div className="relative z-10 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
                    <div>
                        <h1 className="text-2xl sm:text-3xl font-bold">Welcome back, {firstName}!</h1>
                        <p className="mt-1 opacity-90">
                            Unified Surveyor Dashboard - LGA-Based Assignment System
                        </p>
                    </div>
                    <div className="sm:text-right">
                        <div className="flex items-center sm:justify-end space-x-2">
                            <Award className="w-5 h-5" />
                            <span className="text-xl font-bold">{stats.rating}</span>
                            <span className="text-sm opacity-75">/5.0</span>
                        </div>
                        <p className="text-sm mt-1 opacity-75">Your Rating</p>
                    </div>
                </div>
            </div>

            {/* Unified System Notice */}
            <div className="rounded-3xl border border-blue-200/70 bg-blue-50/80 p-4 shadow-sm backdrop-blur">
                <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Unified Assignment System</h3>
                        <p className="text-sm text-blue-800">
                            {"You're now part of a unified surveyor pool with LGA-based automated assignment. Assignments are distributed using round-robin based on your location coverage."}
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <StatCard icon={FileText} label="Total Assignments" value={stats.total} color="blue" />
                <StatCard icon={Clock} label="New Assignments" value={stats.assigned} color="yellow" />
                <StatCard icon={ClipboardList} label="In Progress" value={stats.inProgress} color="purple" />
                <StatCard icon={CheckCircle} label="Completed" value={stats.completed} color="green" />
                <StatCard icon={Award} label="Rating" value={`${stats.rating}/5.0`} color="orange" subtitle="Performance score" />
            </div>

            {/* Recent Assignments */}
            <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/85 shadow-sm backdrop-blur-xl">
                <div className="flex items-center justify-between gap-3 border-b border-white/70 px-4 py-4 sm:px-6">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                    <Link href="/surveyor/dashboard/assignments" className="text-sm font-medium text-emerald-600 transition-colors hover:text-emerald-700">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-100">
                    {recentAssignments.length > 0 ? (
                        recentAssignments.map((assignment) => (
                            <div key={assignment._id} className="group p-4 transition-all duration-300 hover:bg-emerald-50/40 sm:p-6">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="rounded-2xl bg-gray-100 p-3 transition-transform duration-300 group-hover:scale-105">
                                                <Building className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-md font-semibold tracking-tight text-gray-900 break-words">
                                                        Policy #{assignment.policyId?.policyNumber}
                                                    </h3>
                                                    {getPriorityBadge(assignment.priority)}
                                                </div>
                                                <p className="text-sm text-gray-600 font-medium break-words">
                                                    {assignment.policyId?.builder?.nameOfBuilder}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Location Information */}
                                        <div className="mb-3 rounded-2xl border border-gray-100 bg-gray-50/80 p-3 transition-all duration-300 group-hover:border-emerald-100 group-hover:bg-emerald-50/60">
                                            <div className="flex items-start">
                                                <MapPin className="w-4 h-4 text-gray-500 mt-0.5 mr-2" />
                                                <div className="flex-1">
                                                    <p className="text-sm text-gray-700 break-words">
                                                        {assignment.location?.address || assignment.policyId?.project?.address || assignment.policyId?.builder?.address || 'Address not available'}
                                                    </p>
                                                    {(assignment.location?.lga || assignment.policyId?.project?.lga) && (
                                                        <p className="text-xs text-gray-500 mt-1">
                                                            LGA: {assignment.location?.lga || assignment.policyId?.project?.lga}
                                                            {(assignment.location?.district || assignment.policyId?.project?.district) &&
                                                                ` • District: ${assignment.location?.district || assignment.policyId?.project?.district}`
                                                            }
                                                        </p>
                                                    )}
                                                </div>
                                            </div>
                                        </div>

                                        {/* Contact Information */}
                                        <div className="flex items-center flex-wrap gap-4 text-sm text-gray-500">
                                            {assignment.policyId?.builder?.nameOfBuilder && (
                                                <div className="flex items-center">
                                                    <Users className="h-4 w-4 mr-1.5" />
                                                    {assignment.policyId.builder.nameOfBuilder}
                                                </div>
                                            )}
                                            {(assignment.policyId?.builder?.telNo || assignment.location?.contactPerson?.phone) && (
                                                <div className="flex items-center">
                                                    <Phone className="h-4 w-4 mr-1.5" />
                                                    {assignment.policyId?.builder?.telNo || assignment.location?.contactPerson?.phone}
                                                </div>
                                            )}
                                            {assignment.assignedAt && (
                                                <div className="flex items-center">
                                                    <Calendar className="h-4 w-4 mr-1.5" />
                                                    Assigned: {new Date(assignment.assignedAt).toLocaleDateString()}
                                                </div>
                                            )}
                                            {assignment.deadline && (
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1.5" />
                                                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-row sm:flex-col items-start sm:items-end gap-3 sm:gap-2">
                                        {getStatusBadge(assignment.status)}
                                        <Link
                                            href={`/surveyor/dashboard/assignments/${assignment._id}`}
                                            className="inline-flex items-center rounded-full bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 transition-all duration-300 hover:-translate-y-0.5 hover:bg-emerald-600 hover:text-white hover:shadow-lg"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="m-4 rounded-3xl border border-dashed border-gray-200 bg-slate-50/70 p-12 text-center text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                New assignments will appear here when they are assigned to you
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Quick Actions */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 sm:gap-6">
                <Link href="/surveyor/dashboard/assignments" className="group rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-emerald-200 hover:shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-2xl bg-emerald-100 p-3 transition-transform duration-300 group-hover:scale-105">
                            <ClipboardList className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">View All Assignments</h3>
                            <p className="text-sm text-gray-500">Manage your assignments</p>
                        </div>
                    </div>
                </Link>

                <Link href="/surveyor/dashboard/premium-calculator" className="group rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-[#028835]/30 hover:shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-2xl border border-green-200 bg-green-50 p-3 transition-transform duration-300 group-hover:scale-105">
                            <Calculator className="h-6 w-6 text-[#028835]" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Premium Calculator</h3>
                            <p className="text-sm text-gray-500">Calculate policy premiums</p>
                        </div>
                    </div>
                </Link>

                <Link href="/surveyor/dashboard/settings" className="group rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl transition-all duration-300 hover:-translate-y-1 hover:border-blue-200 hover:shadow-2xl">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-2xl bg-blue-100 p-3 transition-transform duration-300 group-hover:scale-105">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                            <p className="text-sm text-gray-500">Update your information</p>
                        </div>
                    </div>
                </Link>

                <div className="rounded-3xl border border-white/70 bg-white/85 p-6 shadow-sm backdrop-blur-xl">
                    <div className="flex items-center space-x-3">
                        <div className="rounded-2xl bg-purple-100 p-3">
                            <Award className="h-6 w-6 text-purple-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Performance</h3>
                            <p className="text-sm text-gray-500">Rating: {stats.rating}/5.0</p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default UnifiedSurveyorDashboard;
