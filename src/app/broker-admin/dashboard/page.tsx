'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { brokerAdminAPI } from '@/services/api';
import type { BrokerDashboardData } from '@/types/api.types';

export default function BrokerAdminDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState('');
    const [autoRefresh, setAutoRefresh] = useState(true);

    const fetchDashboardData = async () => {
        try {
            const response = await brokerAdminAPI.getDashboardData();
            if (response.success && response.data) {
                setDashboardData(response.data);
                setError('');
            }
        } catch (err: any) {
            console.error('Error fetching dashboard data:', err);
            if (err.response?.status === 401) {
                router.push('/broker-admin/login');
            } else {
                setError('Failed to load dashboard data');
            }
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchDashboardData();

        // Auto-refresh every 30 seconds if enabled
        let interval: NodeJS.Timeout;
        if (autoRefresh) {
            interval = setInterval(fetchDashboardData, 30000);
        }

        return () => {
            if (interval) clearInterval(interval);
        };
    }, [autoRefresh]);

    const handleLogout = () => {
        localStorage.removeItem('brokerAdminToken');
        localStorage.removeItem('brokerAdminInfo');
        router.push('/broker-admin/login');
    };

    if (loading) {
        return (
            <div className="min-h-screen flex items-center justify-center bg-gray-50">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600 mx-auto"></div>
                    <p className="mt-4 text-gray-600">Loading dashboard...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <header className="bg-white shadow">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
                    <div className="flex justify-between items-center">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Broker Admin Dashboard</h1>
                            <p className="text-sm text-gray-500 mt-1">Manage insurance claims</p>
                        </div>
                        <div className="flex items-center space-x-4">
                            <label className="flex items-center text-sm text-gray-600">
                                <input
                                    type="checkbox"
                                    checked={autoRefresh}
                                    onChange={(e) => setAutoRefresh(e.target.checked)}
                                    className="mr-2 rounded"
                                />
                                Auto-refresh
                            </label>
                            <button
                                onClick={handleLogout}
                                className="px-4 py-2 text-sm font-medium text-white bg-indigo-600 rounded-md hover:bg-indigo-700"
                            >
                                Logout
                            </button>
                        </div>
                    </div>
                </div>
            </header>

            <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {error && (
                    <div className="mb-6 rounded-md bg-red-50 p-4">
                        <p className="text-sm text-red-800">{error}</p>
                    </div>
                )}

                {/* Statistics Cards */}
                <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-4 mb-8">
                    <StatCard
                        title="Pending"
                        value={dashboardData?.statistics.pending || 0}
                        color="yellow"
                        icon="clock"
                    />
                    <StatCard
                        title="Under Review"
                        value={dashboardData?.statistics.under_review || 0}
                        color="blue"
                        icon="eye"
                    />
                    <StatCard
                        title="Rejected"
                        value={dashboardData?.statistics.rejected || 0}
                        color="red"
                        icon="x"
                    />
                    <StatCard
                        title="Completed"
                        value={dashboardData?.statistics.completed || 0}
                        color="green"
                        icon="check"
                    />
                </div>

                {/* Metrics */}
                <div className="bg-white rounded-lg shadow p-6 mb-8">
                    <h2 className="text-lg font-semibold text-gray-900 mb-4">Performance Metrics</h2>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <div>
                            <p className="text-sm text-gray-500">Average Processing Time</p>
                            <p className="text-3xl font-bold text-indigo-600 mt-2">
                                {dashboardData?.averageProcessingTime || 0} days
                            </p>
                        </div>
                        <div>
                            <p className="text-sm text-gray-500">Total Claims</p>
                            <p className="text-3xl font-bold text-gray-900 mt-2">
                                {dashboardData?.statistics.total || 0}
                            </p>
                        </div>
                    </div>
                </div>

                {/* Recent Activity */}
                <div className="bg-white rounded-lg shadow">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Activity</h2>
                    </div>
                    <div className="divide-y divide-gray-200">
                        {dashboardData?.recentActivity && dashboardData.recentActivity.length > 0 ? (
                            dashboardData.recentActivity.map((activity, index) => (
                                <div key={index} className="px-6 py-4 hover:bg-gray-50">
                                    <div className="flex justify-between items-start">
                                        <div className="flex-1">
                                            <p className="text-sm font-medium text-gray-900">
                                                {activity.action}
                                            </p>
                                            <p className="text-sm text-gray-500 mt-1">
                                                Policy: {activity.policyNumber || activity.claimId}
                                            </p>
                                            <p className="text-xs text-gray-400 mt-1">
                                                By: {activity.performedBy}
                                            </p>
                                        </div>
                                        <span className="text-xs text-gray-500">
                                            {new Date(activity.timestamp).toLocaleString()}
                                        </span>
                                    </div>
                                </div>
                            ))
                        ) : (
                            <div className="px-6 py-8 text-center text-gray-500">
                                No recent activity
                            </div>
                        )}
                    </div>
                </div>

                {/* Quick Actions */}
                <div className="mt-8">
                    <button
                        onClick={() => router.push('/broker-admin/claims')}
                        className="w-full sm:w-auto px-6 py-3 bg-indigo-600 text-white font-medium rounded-md hover:bg-indigo-700 transition-colors"
                    >
                        View All Claims
                    </button>
                </div>
            </main>
        </div>
    );
}

interface StatCardProps {
    title: string;
    value: number;
    color: 'yellow' | 'blue' | 'red' | 'green';
    icon: 'clock' | 'eye' | 'x' | 'check';
}

function StatCard({ title, value, color, icon }: StatCardProps) {
    const colorClasses = {
        yellow: 'bg-yellow-100 text-yellow-800',
        blue: 'bg-blue-100 text-blue-800',
        red: 'bg-red-100 text-red-800',
        green: 'bg-green-100 text-green-800'
    };

    const icons = {
        clock: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
            />
        ),
        eye: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M15 12a3 3 0 11-6 0 3 3 0 016 0z M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"
            />
        ),
        x: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M6 18L18 6M6 6l12 12"
            />
        ),
        check: (
            <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M5 13l4 4L19 7"
            />
        )
    };

    return (
        <div className="bg-white rounded-lg shadow p-6">
            <div className="flex items-center justify-between">
                <div>
                    <p className="text-sm font-medium text-gray-500">{title}</p>
                    <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                </div>
                <div className={`p-3 rounded-full ${colorClasses[color]}`}>
                    <svg className="h-6 w-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                        {icons[icon]}
                    </svg>
                </div>
            </div>
        </div>
    );
}
