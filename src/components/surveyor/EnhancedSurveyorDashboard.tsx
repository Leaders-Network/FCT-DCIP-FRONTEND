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
    User,
    Eye,
    MessageSquare,
    Shield,
    TrendingUp
} from "lucide-react";
import { Assignment, DualAssignment } from "@/types/api.types";
import Link from "next/link";
import { getSurveyorDashboard, getSurveyorAssignments, getSurveyorDualAssignments } from "@/services/api";
import { debugAuthState, clearAllAuthData, getCurrentAuthType } from "@/utils/debug-auth";

interface DualAssignmentInfo {
    _id: string;
    policyId: string | {
        _id: string;
        contactDetails?: {
            fullName: string;
            phoneNumber: string;
            email: string;
        };
    };
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    completionStatus: 0 | 50 | 100;
    createdAt: string;
    priority: 'low' | 'medium' | 'high' | 'urgent';
    estimatedCompletion: {
        overallDeadline: string;
    };
    policyDetails?: {
        address: string;
    };
    currentSurveyorInfo?: {
        assignmentId: Assignment;
    };
    partnerSurveyorInfo?: {
        name: string;
        organization: string;
        email: string;
        phone: string;
    };
    currentSurveyorOrganization?: 'AMMC' | 'NIA';
    conflictDetected?: boolean;
    otherSurveyor?: {
        name: string;
        organization: string;
        email: string;
        phone: string;
        license?: string;
        licenseNumber?: string;
        address?: string;
        emergencyContact?: string;
        specialization?: string[];
        experience?: number;
        rating?: number;
    };
}

interface EnhancedAssignment extends Omit<Assignment, 'dualAssignmentInfo'> {
    // Accept DualAssignmentInfo with otherSurveyor OR DualAssignment with partner info
    dualAssignmentInfo?: DualAssignmentInfo | (DualAssignment & { otherSurveyor?: { name: string; organization: string; email: string; phone: string; license?: string; licenseNumber?: string }; conflictDetected?: boolean });
    organization: 'AMMC' | 'NIA';
    isDualSurveyor: boolean;
}

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: string | number;
    color: string;
    subtitle?: string;
}

const StatCard = ({
    icon,
    label,
    value,
    color,
    subtitle
}: StatCardProps) => (
    <div className="bg-white p-6 rounded-lg shadow-sm border border-gray-200 min-w-0 overflow-hidden">
        <div className="flex items-center min-w-0">
            <div className={`p-2 bg-${color}-100 rounded-lg flex-shrink-0`}>
                {React.createElement(icon, { className: `h-6 w-6 text-${color}-600` })}
            </div>
            <div className="ml-4 flex-1 min-w-0">
                <p className="text-sm font-medium text-gray-600 truncate">{label}</p>
                <p className="text-2xl font-bold text-gray-900">{value}</p>
                {subtitle && <p className="text-xs text-gray-500 mt-1">{subtitle}</p>}
            </div>
        </div>
    </div>
);

const EnhancedSurveyorDashboard = () => {
    const [assignments, setAssignments] = useState<EnhancedAssignment[]>([]);
    const [stats, setStats] = useState({
        total: 0,
        pending: 0,
        inProgress: 0,
        completed: 0,
        dualAssignments: 0,
        conflictsDetected: 0
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [surveyorOrganization, setSurveyorOrganization] = useState<'AMMC' | 'NIA'>('AMMC');

    useEffect(() => {
        const fetchSurveyorData = async () => {
            setLoading(true);
            setError(null);

            // Debug authentication state
            debugAuthState();

            try {
                // Get surveyor organization from localStorage or API
                const organization = localStorage.getItem('surveyorOrganization') as 'AMMC' | 'NIA' || 'AMMC';
                setSurveyorOrganization(organization);

                const [dashboardResponse, assignmentsResponse, dualAssignmentsResponse] = await Promise.allSettled([
                    getSurveyorDashboard(),
                    getSurveyorAssignments({ status: "all", page: 1, limit: 10 }),
                    getSurveyorDualAssignments({ status: "all", page: 1, limit: 10 })
                ]);

                let fetchedAssignments: Assignment[] = [];
                let dualAssignments: DualAssignmentInfo[] = [];

                // Process dashboard response
                if (dashboardResponse.status === 'fulfilled' && dashboardResponse.value?.data) {
                    const dashboardData = dashboardResponse.value.data;
                    if (dashboardData.recentAssignments) {
                        fetchedAssignments = dashboardData.recentAssignments;
                    }
                    if (dashboardData.statistics) {
                        setStats(prev => ({
                            ...prev,
                            total: dashboardData.statistics.total || 0,
                            pending: dashboardData.statistics.pending || 0,
                            inProgress: dashboardData.statistics.inProgress || 0,
                            completed: dashboardData.statistics.completed || 0,
                            dualAssignments: dashboardData.statistics.dualAssignments || 0,
                            conflictsDetected: dashboardData.statistics.conflictsDetected || 0
                        }));
                    }
                }

                // Process dual assignments response (prioritize these)
                if (dualAssignmentsResponse.status === 'fulfilled' && dualAssignmentsResponse.value?.data?.dualAssignments) {
                    dualAssignments = dualAssignmentsResponse.value.data.dualAssignments;
                    console.log('Dual assignments fetched:', dualAssignments.length);
                }

                // Fallback to regular assignments if no dual assignments
                if (dualAssignments.length === 0 && fetchedAssignments.length === 0 && assignmentsResponse.status === 'fulfilled' && assignmentsResponse.value?.data?.assignments) {
                    fetchedAssignments = assignmentsResponse.value.data.assignments;
                    console.log('Regular assignments fetched:', fetchedAssignments.length);
                }

                // Process dual assignments first (these are the new system)
                let enhancedAssignments: EnhancedAssignment[] = [];

                if (dualAssignments.length > 0) {
                    // Convert dual assignments to enhanced assignments
                    enhancedAssignments = dualAssignments.map((dualAssignment) => {
                        // Use the current surveyor's assignment from the dual assignment
                        const currentAssignment = dualAssignment.currentSurveyorInfo?.assignmentId || {} as Assignment;
                        const partnerInfo = dualAssignment.partnerSurveyorInfo || {};

                        return {
                            ...currentAssignment,
                            _id: currentAssignment._id || dualAssignment._id,
                            status: currentAssignment.status || 'assigned',
                            assignedAt: dualAssignment.createdAt,
                            deadline: currentAssignment.deadline,
                            priority: dualAssignment.priority,
                            ammcId: typeof dualAssignment.policyId === 'string' ? dualAssignment.policyId : dualAssignment.policyId._id,
                            location: {
                                address: dualAssignment.policyDetails?.address || 'Address not available',
                                contactPerson: {
                                    name: typeof dualAssignment.policyId === 'object' ? dualAssignment.policyId.contactDetails?.fullName || 'Contact not available' : 'Contact not available',
                                    phone: typeof dualAssignment.policyId === 'object' ? dualAssignment.policyId.contactDetails?.phoneNumber : undefined,
                                    email: typeof dualAssignment.policyId === 'object' ? dualAssignment.policyId.contactDetails?.email : undefined
                                }
                            },
                            organization: (['AMMC', 'NIA'].includes(dualAssignment.currentSurveyorOrganization || '') ? dualAssignment.currentSurveyorOrganization : 'AMMC') as 'AMMC' | 'NIA',
                            isDualSurveyor: true,
                            dualAssignmentId: dualAssignment._id,
                            dualAssignmentInfo: dualAssignment
                        } as EnhancedAssignment;
                    });
                } else {
                    // Fallback to regular assignments with dual-surveyor enhancement
                    enhancedAssignments = await Promise.all(
                        fetchedAssignments.map(async (assignment) => {
                            const enhanced: EnhancedAssignment = {
                                ...assignment,
                                organization: (assignment.organization || organization) as 'AMMC' | 'NIA',
                                isDualSurveyor: !!assignment.dualAssignmentId
                            };

                            // Fetch dual assignment info if it exists
                            if (assignment.dualAssignmentId) {
                                try {
                                    const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://Builders-Liability-AMMC-backend.vercel.app/api/v1";
                                    const dualResponse = await fetch(`${API_BASE_URL}/dual-assignment/${assignment.dualAssignmentId}`, {
                                        headers: {
                                            'Authorization': `Bearer ${localStorage.getItem('token')}`
                                        }
                                    });

                                    if (dualResponse.ok) {
                                        const dualData = await dualResponse.json();
                                        enhanced.dualAssignmentInfo = dualData.data;
                                    }
                                } catch (err) {
                                    console.error('Failed to fetch dual assignment info:', err);
                                }
                            }

                            return enhanced;
                        })
                    );
                }

                // Set the enhanced assignments
                setAssignments(enhancedAssignments);

                // Update stats if not already set from dashboard
                if (dashboardResponse.status !== 'fulfilled' || !dashboardResponse.value?.data?.statistics) {
                    const dualAssignments = enhancedAssignments.filter(a => a.isDualSurveyor).length;
                    const conflictsDetected = enhancedAssignments.filter(a =>
                        a.dualAssignmentInfo && 'conflictDetected' in a.dualAssignmentInfo &&
                        (a.dualAssignmentInfo as { conflictDetected?: boolean }).conflictDetected
                    ).length;

                    setStats(prev => ({
                        ...prev,
                        dualAssignments,
                        conflictsDetected,
                        total: enhancedAssignments.length,
                        pending: enhancedAssignments.filter(a => a.status === 'assigned' || a.status === 'accepted').length,
                        inProgress: enhancedAssignments.filter(a => a.status === 'in_progress').length,
                        completed: enhancedAssignments.filter(a => a.status === 'completed').length
                    }));
                }

            } catch (err) {
                console.error("Failed to fetch surveyor data:", err);
                setError("Failed to load dashboard data. Please try again later.");
            } finally {
                setLoading(false);
            }
        };

        fetchSurveyorData();
    }, []);

    const surveyorName = typeof window !== 'undefined' ? localStorage.getItem("surveyorName") || "Surveyor" : "Surveyor";
    const firstName = surveyorName.split(" ")[0];

    const recentAssignments = assignments.slice(0, 3);

    const getStatusBadge = (status: string, isDualSurveyor: boolean = false) => {
        const baseClasses = "inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium";
        const dualIndicator = isDualSurveyor ? (
            <Shield className="w-3 h-3 ml-1" />
        ) : null;

        switch (status) {
            case 'assigned':
                return (
                    <span className={`${baseClasses} bg-yellow-100 text-yellow-800`}>
                        <Clock className="w-3 h-3 mr-1" />
                        New Assignment
                        {dualIndicator}
                    </span>
                );
            case 'accepted':
                return (
                    <span className={`${baseClasses} bg-blue-100 text-blue-800`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Accepted
                        {dualIndicator}
                    </span>
                );
            case 'in-progress':
                return (
                    <span className={`${baseClasses} bg-purple-100 text-purple-800`}>
                        <ClipboardList className="w-3 h-3 mr-1" />
                        In Progress
                        {dualIndicator}
                    </span>
                );
            case 'completed':
                return (
                    <span className={`${baseClasses} bg-green-100 text-green-800`}>
                        <CheckCircle className="w-3 h-3 mr-1" />
                        Completed
                        {dualIndicator}
                    </span>
                );
            case 'rejected':
                return (
                    <span className={`${baseClasses} bg-red-100 text-red-800`}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Rejected
                        {dualIndicator}
                    </span>
                );
            case 'cancelled':
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                        <AlertCircle className="w-3 h-3 mr-1" />
                        Cancelled
                        {dualIndicator}
                    </span>
                );
            default:
                return (
                    <span className={`${baseClasses} bg-gray-100 text-gray-800`}>
                        {status}
                        {dualIndicator}
                    </span>
                );
        }
    };

    const getOrganizationBadge = (org: 'AMMC' | 'NIA') => {
        return (
            <span className={`inline-flex items-center px-2 py-1 rounded text-xs font-medium ${org === 'AMMC' ? 'bg-blue-100 text-blue-800' : 'bg-green-100 text-green-800'
                }`}>
                <Building className="w-3 h-3 mr-1" />
                {org}
            </span>
        );
    };

    if (loading) {
        return (
            <div className="space-y-6 animate-pulse">
                <div className="h-8 bg-gray-300 rounded w-1/3"></div>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                    {[...Array(6)].map((_, i) => (
                        <div key={i} className="bg-gray-200 p-6 rounded-lg h-24"></div>
                    ))}
                </div>
                <div className="bg-gray-200 rounded-lg h-64"></div>
            </div>
        );
    }

    if (error) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertCircle className="h-12 w-12 text-red-500" />
                <h3 className="mt-4 text-lg font-medium text-red-800">An error occurred</h3>
                <p className="mt-1 text-sm text-red-600">{error}</p>
            </div>
        );
    }

    return (
        <div className="space-y-8">
            {/* Header with Organization Context */}
            <div className="bg-gradient-to-r from-blue-600 to-green-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-3xl font-bold">Welcome back, {firstName}!</h1>
                        <p className="mt-1 opacity-90">
                            {surveyorOrganization} Surveyor Dashboard - Dual Surveyor System
                        </p>
                    </div>
                    <div className="text-right">
                        {getOrganizationBadge(surveyorOrganization)}
                        <p className="text-sm mt-2 opacity-75">
                            Collaborating with {surveyorOrganization === 'AMMC' ? 'NIA' : 'AMMC'} surveyors
                        </p>
                    </div>
                </div>
            </div>

            {/* Enhanced Stats Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6">
                <StatCard
                    icon={FileText}
                    label="Total Assignments"
                    value={stats.total}
                    color="blue"
                />
                <StatCard
                    icon={Clock}
                    label="Pending"
                    value={stats.pending}
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
                    icon={Shield}
                    label="Dual Assignments"
                    value={stats.dualAssignments}
                    color="indigo"
                    subtitle="Collaborative surveys"
                />
                <StatCard
                    icon={AlertCircle}
                    label="Conflicts Detected"
                    value={stats.conflictsDetected}
                    color="red"
                    subtitle="Requiring attention"
                />
            </div>

            {/* Recent Assignments with Dual-Surveyor Info */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
                <div className="px-6 py-4 border-b border-gray-200 flex justify-between items-center">
                    <h2 className="text-lg font-semibold text-gray-900">Recent Assignments</h2>
                    <Link href="/surveyor/dashboard/assignments" className="text-[#028835] hover:text-green-700 text-sm font-medium">
                        View All
                    </Link>
                </div>

                <div className="divide-y divide-gray-200">
                    {recentAssignments.length > 0 ? (
                        recentAssignments.map((assignment) => (
                            <div key={assignment._id} className="p-6 hover:bg-gray-50 transition-colors">
                                <div className="flex items-start justify-between">
                                    <div className="flex-1">
                                        <div className="flex items-center space-x-3 mb-3">
                                            <div className="p-2 bg-gray-100 rounded-lg">
                                                <MapPin className="h-5 w-5 text-gray-600" />
                                            </div>
                                            <div className="flex-1">
                                                <div className="flex items-center space-x-2">
                                                    <h3 className="text-md font-semibold text-gray-900">
                                                        {typeof assignment.ammcId === 'object' && assignment.ammcId?.propertyDetails?.propertyType || 'Assignment'}
                                                    </h3>
                                                    {assignment.isDualSurveyor && (
                                                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-indigo-100 text-indigo-800">
                                                            <Shield className="w-3 h-3 mr-1" />
                                                            Dual Survey
                                                        </span>
                                                    )}
                                                </div>
                                                <p className="text-sm text-gray-500">
                                                    {typeof assignment.ammcId === 'object' && assignment.ammcId?.propertyDetails?.address || assignment.location?.address || 'Location not specified'}
                                                </p>
                                            </div>
                                        </div>

                                        {/* Dual Surveyor Information */}
                                        {assignment.isDualSurveyor && assignment.dualAssignmentInfo && 'otherSurveyor' in assignment.dualAssignmentInfo && (
                                            <div className="mb-4 p-3 bg-blue-50 border border-blue-200 rounded-lg">
                                                <h4 className="text-sm font-medium text-blue-900 mb-2 flex items-center">
                                                    <Users className="w-4 h-4 mr-2" />
                                                    Collaborating Surveyor ({(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.organization})
                                                </h4>
                                                <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-sm">
                                                    <div className="flex items-center text-blue-800">
                                                        <User className="w-4 h-4 mr-2" />
                                                        {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.name}
                                                    </div>
                                                    <div className="flex items-center text-blue-800">
                                                        <Mail className="w-4 h-4 mr-2" />
                                                        {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.email}
                                                    </div>
                                                    <div className="flex items-center text-blue-800">
                                                        <Phone className="w-4 h-4 mr-2" />
                                                        {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.phone}
                                                    </div>
                                                    <div className="flex items-center text-blue-800">
                                                        <FileText className="w-4 h-4 mr-2" />
                                                        License: {(assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.licenseNumber || (assignment.dualAssignmentInfo as DualAssignmentInfo).otherSurveyor?.license || 'Not provided'}
                                                    </div>
                                                </div>

                                                {/* Progress Indicator */}
                                                <div className="mt-3">
                                                    <div className="flex items-center justify-between text-xs text-blue-700 mb-1">
                                                        <span>Dual Survey Progress</span>
                                                        <span>{assignment.dualAssignmentInfo.completionStatus}%</span>
                                                    </div>
                                                    <div className="w-full bg-blue-200 rounded-full h-2">
                                                        <div
                                                            className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                                                            style={{ width: `${assignment.dualAssignmentInfo.completionStatus}%` }}
                                                        ></div>
                                                    </div>
                                                </div>

                                                {/* Conflict Indicator */}
                                                {(assignment.dualAssignmentInfo as DualAssignmentInfo).conflictDetected && (
                                                    <div className="mt-2 flex items-center text-orange-600">
                                                        <AlertCircle className="w-4 h-4 mr-2" />
                                                        <span className="text-xs font-medium">Conflict detected - requires attention</span>
                                                    </div>
                                                )}
                                            </div>
                                        )}

                                        <div className="flex items-center space-x-6 text-sm text-gray-500">
                                            <div className="flex items-center">
                                                <Users className="h-4 w-4 mr-1.5" />
                                                {typeof assignment.ammcId === 'object' && assignment.ammcId?.contactDetails?.fullName || assignment.location?.contactPerson?.name || 'Contact not available'}
                                            </div>
                                            <div className="flex items-center">
                                                <Calendar className="h-4 w-4 mr-1.5" />
                                                {new Date(assignment.assignedAt).toLocaleDateString()}
                                            </div>
                                            {assignment.deadline && (
                                                <div className="flex items-center">
                                                    <Clock className="h-4 w-4 mr-1.5" />
                                                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                                                </div>
                                            )}
                                        </div>
                                    </div>

                                    <div className="flex flex-col items-end space-y-2">
                                        {getStatusBadge(assignment.status, assignment.isDualSurveyor)}
                                        <div className="flex items-center space-x-2">
                                            {assignment.isDualSurveyor && (
                                                <button className="text-blue-600 hover:text-blue-800 text-sm font-medium flex items-center">
                                                    <MessageSquare className="w-4 h-4 mr-1" />
                                                    Contact Partner
                                                </button>
                                            )}
                                            <Link
                                                href={`/surveyor/dashboard/assignments/${assignment._id}`}
                                                className="text-[#028835] hover:text-green-700 text-sm font-medium flex items-center"
                                            >
                                                <Eye className="w-4 h-4 mr-1" />
                                                View Details
                                            </Link>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        ))
                    ) : (
                        <div className="p-12 text-center text-gray-500">
                            <FileText className="mx-auto h-12 w-12 text-gray-400" />
                            <h3 className="mt-4 text-lg font-medium text-gray-900">No assignments yet</h3>
                            <p className="mt-1 text-sm text-gray-500">
                                New {surveyorOrganization} survey assignments will appear here.
                            </p>
                        </div>
                    )}
                </div>
            </div>

            {/* Enhanced Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                <h2 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h2>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <Link href="/surveyor/dashboard/assignments" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <FileText className="h-7 w-7 text-blue-600" />
                        <div className="ml-4">
                            <p className="text-md font-medium text-gray-900">All Assignments</p>
                            <p className="text-sm text-gray-500">View complete list</p>
                        </div>
                    </Link>

                    <Link href="/surveyor/dashboard/dual-assignments" className="flex items-center p-4 bg-indigo-50 rounded-lg hover:bg-indigo-100 transition-colors">
                        <Shield className="h-7 w-7 text-indigo-600" />
                        <div className="ml-4">
                            <p className="text-md font-medium text-gray-900">Dual Surveys</p>
                            <p className="text-sm text-gray-500">Collaborative assignments</p>
                        </div>
                    </Link>

                    <Link href="/surveyor/dashboard/conflicts" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <AlertCircle className="h-7 w-7 text-orange-600" />
                        <div className="ml-4">
                            <p className="text-md font-medium text-gray-900">Conflicts</p>
                            <p className="text-sm text-gray-500">Review discrepancies</p>
                        </div>
                    </Link>

                    <Link href="/surveyor/dashboard/settings" className="flex items-center p-4 bg-gray-50 rounded-lg hover:bg-gray-100 transition-colors">
                        <Users className="h-7 w-7 text-purple-600" />
                        <div className="ml-4">
                            <p className="text-md font-medium text-gray-900">Profile Settings</p>
                            <p className="text-sm text-gray-500">Update information</p>
                        </div>
                    </Link>
                </div>
            </div>

            {/* Dual-Surveyor Performance Summary */}
            {stats.dualAssignments > 0 && (
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4 flex items-center">
                        <TrendingUp className="w-5 h-5 mr-2" />
                        Dual-Surveyor Performance
                    </h2>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
                        <div className="text-center">
                            <div className="text-2xl font-bold text-indigo-600">{stats.dualAssignments}</div>
                            <div className="text-sm text-gray-600">Total Collaborative Surveys</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-green-600">
                                {stats.dualAssignments > 0 ? Math.round(((stats.dualAssignments - stats.conflictsDetected) / stats.dualAssignments) * 100) : 0}%
                            </div>
                            <div className="text-sm text-gray-600">Agreement Rate</div>
                        </div>
                        <div className="text-center">
                            <div className="text-2xl font-bold text-orange-600">{stats.conflictsDetected}</div>
                            <div className="text-sm text-gray-600">Conflicts to Resolve</div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default EnhancedSurveyorDashboard;
