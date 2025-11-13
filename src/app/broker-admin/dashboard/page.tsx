'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { brokerAdminAPI } from '@/services/api';
import {
    FileText,
    Clock,
    CheckCircle,
    XCircle,
    TrendingUp,
    AlertCircle,
    Search,
    Filter,
    Eye,
    RefreshCw
} from 'lucide-react';
import type { BrokerDashboardData, BrokerPolicyRequest, BrokerClaimFilters } from '@/types/api.types';

interface StatCardProps {
    icon: React.ComponentType<{ className?: string }>;
    label: string;
    value: number;
    color: string;
    trend?: string;
}

const StatCard: React.FC<StatCardProps> = ({ icon: Icon, label, value, color, trend }) => (
    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
        <div className="flex items-center justify-between">
            <div>
                <p className="text-sm font-medium text-gray-600">{label}</p>
                <p className="text-3xl font-bold text-gray-900 mt-2">{value}</p>
                {trend && (
                    <p className="text-xs text-gray-500 mt-1">{trend}</p>
                )}
            </div>
            <div className={`p-3 rounded-full bg-${color}-100`}>
                <Icon className={`w-6 h-6 text-${color}-600`} />
            </div>
        </div>
    </div>
);

export default function BrokerAdminDashboard() {
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null);
    const [claims, setClaims] = useState<BrokerPolicyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'rejected' | 'completed'>('all');
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchClaims();
    }, [statusFilter]);

    const fetchDashboardData = async () => {
        try {
            const response = await brokerAdminAPI.getDashboardData();
            if (response.success && response.data) {
                setDashboardData(response.data);
            }
        } catch (err) {
            console.error('Failed to fetch dashboard data:', err);
        }
    };

    const fetchClaims = async () => {
        try {
            setLoading(true);
            const filters: BrokerClaimFilters = {
                status: statusFilter,
                page: 1,
                limit: 10
            };

            if (searchQuery) {
                filters.policyNumber = searchQuery;
            }

            const response = await brokerAdminAPI.getClaims(filters);
            if (response.success) {
                setClaims(response.claims);
            }
        } catch (err) {
            console.error('Failed to fetch claims:', err);
            setError('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchDashboardData(), fetchClaims()]);
        setRefreshing(false);
    };

    const handleSearch = () => {
        fetchClaims();
    };

    const getStatusBadge = (status: string) => {
        const badges = {
            pending: 'bg-yellow-100 text-yellow-800',
            under_review: 'bg-blue-100 text-blue-800',
            rejected: 'bg-red-100 text-red-800',
            completed: 'bg-green-100 text-green-800'
        };
        return badges[status as keyof typeof badges] || 'bg-gray-100 text-gray-800';
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    if (loading && !dashboardData) {
        return (
            <div className="min-h-screen flex items-center justify-center">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h1 className="text-2xl font-bold text-gray-900">Broker Admin Dashboard</h1>
                            <p className="text-sm text-gray-600 mt-1">Manage insurance claims and policy requests</p>
                        </div>
                        <button
                            onClick={handleRefresh}
                            disabled={refreshing}
                            className="inline-flex items-center px-4 py-2 border border-gray-300 rounded-md shadow-sm text-sm font-medium text-gray-700 bg-white hover:bg-gray-50 disabled:opacity-50"
                        >
                            <RefreshCw className={`w-4 h-4 mr-2 ${refreshing ? 'animate-spin' : ''}`} />
                            Refresh
                        </button>
                    </div>
                </div>
            </div>

            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {/* Statistics */}
                {dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6 mb-8">
                        <StatCard
                            icon={FileText}
                            label="Total Claims"
                            value={dashboardData.statistics.total}
                            color="blue"
                        />
                        <StatCard
                            icon={Clock}
                            label="Pending"
                            value={dashboardData.statistics.pending}
                            color="yellow"
                        />
                        <StatCard
                            icon={TrendingUp}
                            label="Under Review"
                            value={dashboardData.statistics.under_review}
                            color="indigo"
                        />
                        <StatCard
                            icon={CheckCircle}
                            label="Completed"
                            value={dashboardData.statistics.completed}
                            color="green"
                        />
                        <StatCard
                            icon={XCircle}
                            label="Rejected"
                            value={dashboardData.statistics.rejected}
                            color="red"
                        />
                    </div>
                )}

                {/* Filters and Search */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                    <div className="flex flex-col md:flex-row gap-4">
                        <div className="flex-1">
                            <div className="relative">
                                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                                <input
                                    type="text"
                                    placeholder="Search by policy number..."
                                    value={searchQuery}
                                    onChange={(e) => setSearchQuery(e.target.value)}
                                    onKeyPress={(e) => e.key === 'Enter' && handleSearch()}
                                    className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                                />
                            </div>
                        </div>
                        <div className="flex gap-2">
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value as typeof statusFilter)}
                                className="px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            >
                                <option value="all">All Status</option>
                                <option value="pending">Pending</option>
                                <option value="under_review">Under Review</option>
                                <option value="rejected">Rejected</option>
                                <option value="completed">Completed</option>
                            </select>
                            <button
                                onClick={handleSearch}
                                className="inline-flex items-center px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700"
                            >
                                <Filter className="w-4 h-4 mr-2" />
                                Apply
                            </button>
                        </div>
                    </div>
                </div>

                {/* Claims Table */}
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
                    <div className="px-6 py-4 border-b border-gray-200">
                        <h2 className="text-lg font-semibold text-gray-900">Recent Claims</h2>
                    </div>

                    {error && (
                        <div className="px-6 py-4 bg-red-50 border-b border-red-200">
                            <div className="flex items-center text-red-800">
                                <AlertCircle className="w-5 h-5 mr-2" />
                                <span>{error}</span>
                            </div>
                        </div>
                    )}

                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Policy Number
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Property
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Submitted
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {claims.length > 0 ? (
                                    claims.map((claim) => (
                                        <tr key={claim._id} className="hover:bg-gray-50">
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {claim.policyNumber || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="max-w-xs truncate">
                                                    {claim.propertyDetails.address}
                                                </div>
                                                <div className="text-xs text-gray-500">
                                                    {claim.propertyDetails.propertyType}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div>{claim.contactDetails.fullName}</div>
                                                <div className="text-xs text-gray-500">
                                                    {claim.contactDetails.email}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap">
                                                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(claim.brokerStatus || 'pending')}`}>
                                                    {(claim.brokerStatus || 'pending').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {formatDate(claim.createdAt)}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    onClick={() => router.push(`/broker-admin/claims/${claim._id}`)}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View
                                                </button>
                                            </td>
                                        </tr>
                                    ))
                                ) : (
                                    <tr>
                                        <td colSpan={6} className="px-6 py-12 text-center text-gray-500">
                                            <FileText className="w-12 h-12 mx-auto text-gray-400 mb-4" />
                                            <p>No claims found</p>
                                        </td>
                                    </tr>
                                )}
                            </tbody>
                        </table>
                    </div>
                </div>
            </div>
        </div>
    );
}
