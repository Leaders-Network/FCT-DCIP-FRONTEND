"use client";
import React, { useState, useEffect } from 'react';
// Import token setup for development
import '@/utils/tokenSetup';
import { NIATokenProvider } from '@/components/nia-admin/NIATokenProvider';
import {
    Users,
    FileText,
    Clock,
    CheckCircle,
    AlertTriangle,
    TrendingUp,
    Building2,
    UserCheck,
    ClipboardList,
    X
} from 'lucide-react';
import NIADashboardStats from '@/components/nia-admin/NIADashboardStats';
import NIARecentAssignments from '@/components/nia-admin/NIARecentAssignments';
import NIADualAssignmentOverview from '@/components/nia-admin/NIADualAssignmentOverview';

interface DashboardStats {
    totalNIASurveyors: number;
    activeNIASurveyors: number;
    niaAssignments: number;
    dualAssignments: {
        totalDualAssignments: number;
        niaAssigned: number;
        fullyAssigned: number;
        partiallyComplete: number;
        fullyComplete: number;
    };
    assignmentStats: {
        assigned?: number;
        accepted?: number;
        'in-progress'?: number;
        completed?: number;
    };
    recentAssignments: Array<{
        _id: string;
        assignmentStatus: string;
        completionStatus: number;
        priority: string;
        createdAt: string;
    }>;
}

const NIAAdminDashboard = () => {
    const [stats, setStats] = useState<DashboardStats | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showNIAAdminModal, setShowNIAAdminModal] = useState(false);

    useEffect(() => {
        fetchDashboardData();
    }, []);

    const fetchDashboardData = async () => {
        try {
            setLoading(true);
            // Try multiple token keys for flexibility
            const token = localStorage.getItem('niaAdminToken') ||
                localStorage.getItem('adminToken') ||
                localStorage.getItem('token') ||
                localStorage.getItem('authToken');

            if (!token) {
                console.warn('No authentication token found, using fallback data');
                // Set fallback stats instead of throwing error
                setStats({
                    totalNIASurveyors: 0,
                    activeNIASurveyors: 0,
                    niaAssignments: 0,
                    dualAssignments: {
                        totalDualAssignments: 0,
                        niaAssigned: 0,
                        fullyAssigned: 0,
                        partiallyComplete: 0,
                        fullyComplete: 0
                    },
                    assignmentStats: {
                        assigned: 0,
                        accepted: 0,
                        'in-progress': 0,
                        completed: 0
                    },
                    recentAssignments: []
                });
                setLoading(false);
                return;
            }

            const apiUrl = `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/nia-admin/dashboard`;
            console.log('🔍 Fetching NIA dashboard data from:', apiUrl);
            console.log('🔍 Using token:', token ? `${token.substring(0, 20)}...` : 'No token');

            const response = await fetch(apiUrl, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json',
                    'apikey': process.env.NEXT_PUBLIC_API_KEY || ''
                }
            });

            console.log('🔍 Response status:', response.status);

            if (!response.ok) {
                const errorText = await response.text();
                console.error('🔍 Response error:', errorText);
                throw new Error(`Failed to fetch dashboard data: ${response.status} ${errorText}`);
            }

            const data = await response.json();
            console.log('🔍 Dashboard data received:', data);

            if (data.success) {
                // Transform the backend response to match frontend expectations
                const transformedStats = {
                    totalNIASurveyors: data.data.overview?.totalNIASurveyors || 0,
                    activeNIASurveyors: data.data.overview?.activeNIASurveyors || 0,
                    niaAssignments: data.data.overview?.niaAssignments || 0,
                    dualAssignments: data.data.overview?.dualAssignments || {
                        totalDualAssignments: 0,
                        niaAssigned: 0,
                        fullyAssigned: 0,
                        partiallyComplete: 0,
                        fullyComplete: 0
                    },
                    assignmentStats: data.data.assignmentStats || {},
                    recentAssignments: data.data.recentAssignments || []
                };
                setStats(transformedStats);
            } else {
                throw new Error(data.message || 'Failed to load dashboard data');
            }
        } catch (error) {
            console.error('Dashboard data fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load dashboard data');
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
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        <div className="bg-white p-6 rounded-lg shadow-sm border h-64"></div>
                        <div className="bg-white p-6 rounded-lg shadow-sm border h-64"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
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

    const adminInfo = JSON.parse(localStorage.getItem('niaAdminInfo') || '{}');
    const adminName = adminInfo.name || 'NIA Admin';

    return (
        <NIATokenProvider>
            <div className="space-y-6">
                {/* Welcome Header */}
                <div className="bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg p-6 text-white">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold mb-2">Welcome back, {adminName}!</h1>
                            <p className="text-blue-100">
                                Manage Nigerian Insurers Association surveyors and dual-surveyor assignments from your dashboard
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
                                <Users className="h-6 w-6 text-blue-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Total NIA Surveyors</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.totalNIASurveyors || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-green-100 rounded-lg">
                                <UserCheck className="h-6 w-6 text-green-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Active Surveyors</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.activeNIASurveyors || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-purple-100 rounded-lg">
                                <FileText className="h-6 w-6 text-purple-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">NIA Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.niaAssignments || 0}</p>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white p-6 rounded-lg shadow-sm border">
                        <div className="flex items-center">
                            <div className="p-2 bg-orange-100 rounded-lg">
                                <ClipboardList className="h-6 w-6 text-orange-600" />
                            </div>
                            <div className="ml-4">
                                <p className="text-sm font-medium text-gray-600">Dual Assignments</p>
                                <p className="text-2xl font-bold text-gray-900">{stats?.dualAssignments?.totalDualAssignments || 0}</p>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Dual Assignment Overview */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Dual-Surveyor Assignment Overview</h2>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <div className="text-center p-4 bg-gray-50 rounded-lg">
                            <div className="text-2xl font-bold text-gray-900">{stats?.dualAssignments?.niaAssigned || 0}</div>
                            <div className="text-sm text-gray-600">NIA Assigned</div>
                        </div>
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">{stats?.dualAssignments?.fullyAssigned || 0}</div>
                            <div className="text-sm text-gray-600">Fully Assigned</div>
                        </div>
                        <div className="text-center p-4 bg-yellow-50 rounded-lg">
                            <div className="text-2xl font-bold text-yellow-600">{stats?.dualAssignments?.partiallyComplete || 0}</div>
                            <div className="text-sm text-gray-600">50% Complete</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">{stats?.dualAssignments?.fullyComplete || 0}</div>
                            <div className="text-sm text-gray-600">100% Complete</div>
                        </div>
                    </div>
                </div>

                {/* Assignment Status Breakdown */}
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">NIA Assignment Status</h3>
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-yellow-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Assigned</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats?.assignmentStats?.assigned || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-blue-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Accepted</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats?.assignmentStats?.accepted || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-purple-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">In Progress</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats?.assignmentStats?.['in-progress'] || 0}
                                </span>
                            </div>
                            <div className="flex items-center justify-between">
                                <div className="flex items-center">
                                    <div className="w-3 h-3 bg-green-500 rounded-full mr-3"></div>
                                    <span className="text-sm text-gray-600">Completed</span>
                                </div>
                                <span className="text-sm font-medium text-gray-900">
                                    {stats?.assignmentStats?.completed || 0}
                                </span>
                            </div>
                        </div>
                    </div>

                    <div className="bg-white rounded-lg shadow-sm border p-6">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Recent NIA Assignments</h3>
                        <div className="space-y-3">
                            {stats?.recentAssignments && stats.recentAssignments.length > 0 ? (
                                stats.recentAssignments.slice(0, 5).map((assignment: any, index) => (
                                    <div key={assignment._id || index} className="flex items-center justify-between py-2 border-b border-gray-100 last:border-b-0">
                                        <div className="flex-1 min-w-0">
                                            <p className="text-sm font-medium text-gray-900 truncate">
                                                {assignment.ammcId?.propertyDetails?.propertyType || assignment.policyId?.propertyDetails?.propertyType || 'Property Survey'}
                                            </p>
                                            <p className="text-xs text-gray-500 truncate">
                                                {assignment.ammcId?.propertyDetails?.address || assignment.policyId?.propertyDetails?.address || 'No address'}
                                            </p>
                                        </div>
                                        <div className="ml-4 flex-shrink-0">
                                            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${assignment.status === 'completed' || assignment.assignmentStatus === 'completed' ? 'bg-green-100 text-green-800' :
                                                assignment.status === 'in-progress' || assignment.assignmentStatus === 'in-progress' ? 'bg-purple-100 text-purple-800' :
                                                    assignment.status === 'accepted' || assignment.assignmentStatus === 'accepted' ? 'bg-blue-100 text-blue-800' :
                                                        'bg-yellow-100 text-yellow-800'
                                                }`}>
                                                {assignment.status || assignment.assignmentStatus}
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



                {/* NIA Admin Management */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <div className="flex items-center justify-between mb-4">
                        <h3 className="text-lg font-semibold text-gray-900">NIA Administrator Management</h3>
                        <button
                            onClick={() => setShowNIAAdminModal(true)}
                            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors flex items-center space-x-2"
                        >
                            <UserCheck className="h-4 w-4" />
                            <span>Add NIA Admin</span>
                        </button>
                    </div>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                        <div className="text-center p-4 bg-blue-50 rounded-lg">
                            <div className="text-2xl font-bold text-blue-600">3</div>
                            <div className="text-sm text-gray-600">Total NIA Admins</div>
                        </div>
                        <div className="text-center p-4 bg-green-50 rounded-lg">
                            <div className="text-2xl font-bold text-green-600">2</div>
                            <div className="text-sm text-gray-600">Active Admins</div>
                        </div>
                        <div className="text-center p-4 bg-orange-50 rounded-lg">
                            <div className="text-2xl font-bold text-orange-600">1</div>
                            <div className="text-sm text-gray-600">Pending Approval</div>
                        </div>
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="bg-white rounded-lg shadow-sm border p-6">
                    <h3 className="text-lg font-semibold text-gray-900 mb-4">Quick Actions</h3>
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                        <a href="/nia-admin/surveyors" className="flex items-center p-4 bg-blue-50 rounded-lg hover:bg-blue-100 transition-colors">
                            <Users className="h-6 w-6 text-blue-600 mr-3" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900">Manage Surveyors</div>
                                <div className="text-sm text-gray-600">Add, edit, or view NIA surveyors</div>
                            </div>
                        </a>

                        <a href="/nia-admin/assignments" className="flex items-center p-4 bg-green-50 rounded-lg hover:bg-green-100 transition-colors">
                            <ClipboardList className="h-6 w-6 text-green-600 mr-3" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900">View Assignments</div>
                                <div className="text-sm text-gray-600">Manage dual-surveyor assignments</div>
                            </div>
                        </a>

                        <a href="/nia-admin/user-inquiries" className="flex items-center p-4 bg-orange-50 rounded-lg hover:bg-orange-100 transition-colors">
                            <AlertTriangle className="h-6 w-6 text-orange-600 mr-3" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900">User Inquiries</div>
                                <div className="text-sm text-gray-600">Handle user conflict inquiries</div>
                            </div>
                        </a>

                        <a href="/nia-admin/processing-monitor" className="flex items-center p-4 bg-purple-50 rounded-lg hover:bg-purple-100 transition-colors">
                            <FileText className="h-6 w-6 text-purple-600 mr-3" />
                            <div className="text-left">
                                <div className="font-medium text-gray-900">Processing Monitor</div>
                                <div className="text-sm text-gray-600">Monitor automatic processing</div>
                            </div>
                        </a>
                    </div>
                </div>
            </div>

            {/* NIA Admin Creation Modal */}
            {showNIAAdminModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full">
                        <div className="bg-blue-600 text-white p-6 rounded-t-lg">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Add NIA Administrator</h2>
                                <button
                                    onClick={() => setShowNIAAdminModal(false)}
                                    className="text-blue-100 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <div className="p-6">
                            <form className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter first name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Last Name *
                                    </label>
                                    <input
                                        type="text"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter last name"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email Address *
                                    </label>
                                    <input
                                        type="email"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter email address"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Phone Number *
                                    </label>
                                    <input
                                        type="tel"
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        placeholder="Enter phone number"
                                        required
                                    />
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" defaultChecked />
                                            <span className="text-sm">Manage Surveyors</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" defaultChecked />
                                            <span className="text-sm">Manage Assignments</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input type="checkbox" className="mr-2" />
                                            <span className="text-sm">System Administration</span>
                                        </label>
                                    </div>
                                </div>
                            </form>
                        </div>

                        <div className="border-t border-gray-200 p-6 bg-gray-50 rounded-b-lg">
                            <div className="flex justify-end space-x-3">
                                <button
                                    onClick={() => setShowNIAAdminModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create NIA Admin
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </NIATokenProvider>
    );
};

export default NIAAdminDashboard;