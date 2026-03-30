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
    Mail,
    Eye,
    TrendingUp,
    Award
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
    // Avoid dynamic Tailwind classes so production builds keep the styles.
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
        <div className="flex items-center">
            <div
                className={[
                    "p-2 rounded-lg flex-shrink-0",
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
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    </div>
);

const UnifiedSurveyorDashboard = () => {
    const [assignments, setAssignments] = useState<Assignment[]>([]);
    const [surveyor, setSurveyor] = useState({ firstName: '', lastName: '' });
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
                    console.error("Failed to parse surveyorInfo cookie:", error);
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
                console.error("Failed to hydrate surveyor name:", error);
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
            // Fetch surveyor's assignments using surveyor-specific endpoint
            const assignmentsResponse = await getSurveyorAssignments({ status: 'all', page: 1, limit: 100 });

            const fetchedAssignments = assignmentsResponse?.data?.assignments || [];
            if (fetchedAssignments.length) {
                setAssignments(fetchedAssignments);

                // Calculate stats
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
                    rating: 4.5 // This should come from surveyor profile
                });
            } else {
                setAssignments([]);
                setFriendlyError("No surveyor assignments found. If this seems wrong, please contact the Gladfaith team.");
            }

        } catch (err) {
            console.error("Failed to fetch surveyor data:", err);
            setError("Failed to load dashboard data. Please try again later.");
            setFriendlyError("We couldn't load your survey dashboard right now. Please refresh or contact the Gladfaith team.");
        } finally {
            setLoading(false);
        }
    };

    const firstName = surveyorName.split(" ")[0];

    const recentAssignments = assignments.slice(0, 5);

    const getStatusBadge = (status: string) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";

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
            <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${priorityConfig[priority] || priorityConfig.medium}`}>
                {priority?.toUpperCase() || 'MEDIUM'}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
                    {[...Array(5)].map((_, i) => (
                        <div key={i} className="bg-gray-200 p-6 rounded-lg h-24"></div>
                    ))}
                </div>
                <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
        );
    }

    if (error && !friendlyError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-medium text-red-800">An error occurred</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
                <button
                    onClick={fetchSurveyorData}
                    className="mt-4 px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                >
                    Retry
                </button>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {friendlyError && (
                <DashboardErrorBanner message={friendlyError} />
            )}
            {/* Header */}
            <div className="bg-gradient-to-r from-green-600 to-blue-600 rounded-lg p-6 text-white">
                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
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
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Unified Assignment System</h3>
                        <p className="text-sm text-blue-800">
                            You're now part of a unified surveyor pool with LGA-based automated assignment.
                            Assignments are distributed using round-robin based on your location coverage.
                        </p>
                    </div>
                </div>
            </div>

            {/* Stats Grid */}
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4 sm:gap-6">
                <StatCard
                    icon={FileText}
                    label="Total Assignments"
                    value={stats.total}
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    label="New Assignments"
                    value={stats.assigned}
                    color="yellow"
                />
                <StatCard
                    icon={ClipboardList}
                    label="In Progress"
                    value={stats.inProgress}
                    color="purple"
                />
                <StatCard
                    icon={CheckCircle}
                    label="Completed"
                    value={stats.completed}
                    color="green"
                />
                <StatCard
                    icon={Award}
                    label="Rating"
                    value={`${stats.rating}/5.0`}
                    color="orange"
                    subtitle="Performance score"
                />
            </div>

            {/* Recent Assignments */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-4 sm:px-6 py-4 border-b border-gray-200 flex items-center justify-between gap-3">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                    <Link href="/surveyor/dashboard/assignments" className="text-green-600 hover:text-green-700 text-sm font-medium">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-200">
                    {recentAssignments.length > 0 ? (
                        recentAssignments.map((assignment) => (
                            <div key={assignment._id} className="p-4 sm:p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <Building className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex flex-wrap items-center gap-2">
                                                    <h3 className="text-md font-semibold text-gray-900 break-words">
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
                                        <div className="mb-3 p-3 bg-gray-50 rounded-lg">
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
                                            className="text-green-600 hover:text-green-700 text-sm font-medium flex items-center"
                                        >
                                            <Eye className="w-4 h-4 mr-1" />
                                            View Details
                                        </Link>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 sm:gap-6">
                <Link href="/surveyor/dashboard/assignments" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-green-500 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-green-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-green-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">View All Assignments</h3>
                            <p className="text-sm text-gray-500">Manage your assignments</p>
                        </div>
                    </div>
                </Link>

                <Link href="/surveyor/dashboard/settings" className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 hover:border-blue-500 transition-colors">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div>
                            <h3 className="font-semibold text-gray-900">Profile Settings</h3>
                            <p className="text-sm text-gray-500">Update your information</p>
                        </div>
                    </div>
                </Link>

                <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200">
                    <div className="flex items-center space-x-3">
                        <div className="p-3 bg-purple-100 rounded-lg">
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
