"use client";
import React, { useState, useEffect } from 'react';
import {
    Users,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    Building2,
    UserCheck,
    ClipboardList,
    TrendingUp
} from 'lucide-react';
import { adminApi } from '@/services/api';
import DashboardErrorBanner from '@/components/shared/DashboardErrorBanner';

interface DashboardStats {
    totalSurveyors: number;
    activeSurveyors: number;
    totalPolicies: number;
    totalAssignments: number;
    assignmentsByStatus: {
        assigned: number;
        accepted: number;
        in_progress: number;
        completed: number;
    };
    recentAssignments: any[];
}

const NIAAdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats>({
        totalSurveyors: 0,
        activeSurveyors: 0,
        totalPolicies: 0,
        totalAssignments: 0,
        assignmentsByStatus: {
            assigned: 0,
            accepted: 0,
            in_progress: 0,
            completed: 0
        },
        recentAssignments: []
    });
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [friendlyError, setFriendlyError] = useState<string | null>(null);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            setError(null);
            setFriendlyError(null);

            // Fetch surveyors
            const surveyorsResponse = await adminApi.getSurveyors({});
            const totalSurveyors = surveyorsResponse?.data?.length || 0;
            const activeSurveyors = surveyorsResponse?.data?.filter((s: any) => s.status === 'active').length || 0;

            // Fetch policies
            const policiesResponse = await adminApi.getPolicies({ page: 1, limit: 1 });
            const totalPolicies = policiesResponse?.data?.pagination?.totalRecords || policiesResponse?.data?.length || 0;

            // Fetch assignments
            const assignmentsResponse = await adminApi.getAssignments({ page: 1, limit: 100 });
            const assignments = assignmentsResponse?.data?.assignments || [];
            const totalAssignments = assignmentsResponse?.data?.pagination?.totalRecords || 0;

            // Calculate assignment stats
            const assignmentsByStatus = {
                assigned: 0,
                accepted: 0,
                in_progress: 0,
                completed: 0
            };

            assignments.forEach((assignment: any) => {
                if (assignment.status === 'assigned') assignmentsByStatus.assigned++;
                else if (assignment.status === 'accepted') assignmentsByStatus.accepted++;
                else if (assignment.status === 'in_progress') assignmentsByStatus.in_progress++;
                else if (assignment.status === 'completed') assignmentsByStatus.completed++;
            });

            setStats({
                totalSurveyors,
                activeSurveyors,
                totalPolicies,
                totalAssignments,
                assignmentsByStatus,
                recentAssignments: assignments.slice(0, 5)
            });

        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
            setFriendlyError('We could not load the NIA admin dashboard. Please refresh, and contact the Gladfaith team if it persists.');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                        {[1, 2, 3, 4].map((i) => (
                            <div key={i} className="bg-white p-6 rounded-lg shadow-sm border">
                                <div className="h-4 bg-gray-300 rounded w-3/4 mb-2"></div>
                                <div className="h-8 bg-gray-300 rounded w-1/2"></div>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        );
    }

    if (error && !friendlyError) {
        return (
            <div className="flex flex-col items-center justify-center h-64 bg-red-50 border border-red-200 rounded-lg">
                <AlertTriangle className="h-12 w-12 text-red-500 mb-4" />
                <h3 className="text-lg font-medium text-red-800 mb-2">Dashboard Error</h3>
                <p className="text-sm text-red-600 text-center mb-4">{error}</p>
                <button
                    onClick={fetchDashboardData}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 transition-colors"
                >
                    Retry
                </button>
            </div>
        );
    }

    const adminInfo = typeof window !== 'undefined' ? JSON.parse(localStorage.getItem('niaAdminInfo') || '{}') : {};
    const adminName = adminInfo.name || 'NIA Admin';

    return (
            <div className="space-y-6">
            {friendlyError && (
                <DashboardErrorBanner message={friendlyError} />
            )}
            {/* Welcome Header */}
            <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold mb-2">Welcome back, {adminName}!</h1>
                        <p className="text-blue-100">
                            Manage Builder Liability policies, surveyors, and automated assignments
                        </p>
                    </div>
                    <div className="hidden md:block">
                        <div className="bg-white/10 p-3 rounded-full">
                            <Building2 className="h-8 w-8 text-white" />
                        </div>
                    </div>
                </div>
            </div>

            {/* Stats Overview */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <FileText className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Policies</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalPolicies}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <Users className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Surveyors</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.activeSurveyors}</p>
                            <p className="text-xs text-gray-500">of {stats.totalSurveyors} total</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-purple-100 rounded-lg">
                            <ClipboardList className="h-6 w-6 text-purple-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Assignments</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.totalAssignments}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-orange-100 rounded-lg">
                            <CheckCircle className="h-6 w-6 text-orange-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Completed</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.assignmentsByStatus.completed}</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Unified System Notice */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start">
                    <TrendingUp className="h-5 w-5 text-blue-600 mt-0.5 mr-3" />
                    <div>
                        <h3 className="font-semibold text-blue-900 mb-1">Unified Admin System</h3>
                        <p className="text-sm text-blue-800">
                            NIA and AMMC now share the same Builder Liability policies, surveyor pool, and automated assignment system.
                            All surveyors are managed through LGA-based round-robin distribution.
                        </p>
                    </div>
                </div>
            </div>

            {/* Assignment Status Breakdown */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Status</h3>
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600">Assigned</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats.assignmentsByStatus.assigned}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600">Accepted</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats.assignmentsByStatus.accepted}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600">In Progress</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats.assignmentsByStatus.in_progress}
                            </span>
                        </div>
                        <div className="flex items-center justify-between">
                            <div className="flex items-center">
                                <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                <span className="text-sm text-gray-600">Completed</span>
                            </div>
                            <span className="text-sm font-medium text-gray-900">
                                {stats.assignmentsByStatus.completed}
                            </span>
                        </div>
                    </div>
                </div>

                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent Assignments</h3>
                    <div className="space-y-3">
                        {stats.recentAssignments && stats.recentAssignments.length > 0 ? (
                            stats.recentAssignments.map((assignment, index) => (
                                <div key={assignment._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                    <div className="flex-1 min-w-0">
                                        <p className="text-sm font-medium text-gray-900 truncate">
                                            {assignment.policyId?.policyNumber || 'Policy'}
                                        </p>
                                        <p className="text-xs text-gray-500 truncate">
                                            {assignment.policyId?.builder?.nameOfBuilder || 'Builder'}
                                        </p>
                                    </div>
                                    <div className="ml-4 flex-shrink-0">
                                        <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'completed' ? 'bg-green-100 text-green-800' :
                                            assignment.status === 'in_progress' ? 'bg-purple-100 text-purple-800' :
                                                assignment.status === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                                    'bg-yellow-100 text-yellow-800'
                                            }`}>
                                            {assignment.status}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="text-center py-4 text-gray-500">
                                <FileText className="h-8 w-8 mx-auto mb-2 opacity-50" />
                                <p className="text-sm">No recent assignments</p>
                            </div>
                        )}
                    </div>
                </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-lg shadow-sm border p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                    <a href="/nia-admin/dashboard/policies" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                        <FileText className="h-6 w-6 text-blue-600 mr-3 flex-shrink-0" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Policies</div>
                            <div className="text-sm text-gray-600">View Builder Liability policies</div>
                        </div>
                    </a>

                    <a href="/nia-admin/surveyors" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                        <Users className="h-6 w-6 text-green-600 mr-3 flex-shrink-0" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Surveyors</div>
                            <div className="text-sm text-gray-600">Manage surveyors</div>
                        </div>
                    </a>

                    <a href="/nia-admin/assignments" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                        <ClipboardList className="h-6 w-6 text-purple-600 mr-3 flex-shrink-0" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Assignments</div>
                            <div className="text-sm text-gray-600">View automated assignments</div>
                        </div>
                    </a>

                    <a href="/nia-admin/administrators" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                        <UserCheck className="h-6 w-6 text-orange-600 mr-3 flex-shrink-0" />
                        <div className="text-left">
                            <div className="font-medium text-gray-900">Administrators</div>
                            <div className="text-sm text-gray-600">Manage NIA admins</div>
                        </div>
                    </a>
                </div>
            </div>
        </div>
    );
};

export default NIAAdminDashboard;
