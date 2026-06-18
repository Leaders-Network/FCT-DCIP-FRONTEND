'use client';

import type React from 'react';
import { useState, useEffect, useCallback } from 'react';
import { brokerAdminAPI, triggerCsvDownload } from '@/services/api';
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
    RefreshCw,
    X,
    Calendar,
    User,
    Shield,
    Layers,
    DollarSign,
    ClipboardList,
    Images,
    Download,
    Building2,
    ChevronLeft,
    ChevronRight
} from 'lucide-react';
import DashboardErrorBanner from '@/components/shared/DashboardErrorBanner';
import {
    getDisplayValue,
    getProfessionalBody,
    getProfessionalRegistrationNumber,
    getProjectAddress,
    getProjectDistrict,
    getProjectEstimateBand,
    getProjectLga,
    getProjectTitle
} from '@/utils/builderLiability';
import type {
    BrokerDashboardData,
    BrokerPolicyRequest,
    BrokerClaimFilters,
    BrokerStatusUpdateRequest,
    BrokerCompletedPolicy
} from '@/types/api.types';

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
    const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null);
    const [claims, setClaims] = useState<BrokerPolicyRequest[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [dashboardError, setDashboardError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'rejected' | 'completed'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [selectedClaim, setSelectedClaim] = useState<BrokerPolicyRequest | null>(null);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    // ── Completed Policies state ──────────────────────────────────────────────
    const [completedPolicies, setCompletedPolicies] = useState<BrokerCompletedPolicy[]>([]);
    const [completedLoading, setCompletedLoading] = useState(false);
    const [completedError, setCompletedError] = useState<string | null>(null);
    const [completedPage, setCompletedPage] = useState(1);
    const [completedTotalPages, setCompletedTotalPages] = useState(1);
    const [completedTotal, setCompletedTotal] = useState(0);
    const [selectedCompletedPolicy, setSelectedCompletedPolicy] = useState<BrokerCompletedPolicy | null>(null);
    const [completedPolicyModalOpen, setCompletedPolicyModalOpen] = useState(false);
    const [completedPolicyModalLoading, setCompletedPolicyModalLoading] = useState(false);
    const [completedPolicyModalError, setCompletedPolicyModalError] = useState<string | null>(null);
    // Completed policies filters
    const [cpSearch, setCpSearch] = useState('');
    const [cpCompanyName, setCpCompanyName] = useState('');
    const [cpDateFrom, setCpDateFrom] = useState('');
    const [cpDateTo, setCpDateTo] = useState('');
    // Applied filter values (only sent when "Apply" is clicked)
    const [appliedCpSearch, setAppliedCpSearch] = useState('');
    const [appliedCpCompanyName, setAppliedCpCompanyName] = useState('');
    const [appliedCpDateFrom, setAppliedCpDateFrom] = useState('');
    const [appliedCpDateTo, setAppliedCpDateTo] = useState('');
    const [csvExporting, setCsvExporting] = useState(false);

    useEffect(() => {
        fetchDashboardData();
        fetchClaims();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [statusFilter]);

    // Fetch completed policies whenever applied filters or page changes
    useEffect(() => {
        fetchCompletedPolicies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedCpSearch, appliedCpCompanyName, appliedCpDateFrom, appliedCpDateTo, completedPage]);

    const fetchDashboardData = async () => {
        try {
            setDashboardError(null);
            const response = await brokerAdminAPI.getDashboardData();
            if (response.success && response.data) {
                setDashboardData(response.data);
            } else {
                setDashboardError(response.message || 'Failed to fetch dashboard data.');
            }
        } catch (err) {
            setDashboardError('Unable to load broker dashboard data. Please contact the Gladfaith team if this persists.');
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
            setError('Failed to load claims');
        } finally {
            setLoading(false);
        }
    };

    const handleRefresh = async () => {
        setRefreshing(true);
        await Promise.all([fetchDashboardData(), fetchClaims(), fetchCompletedPolicies()]);
        setRefreshing(false);
    };

    const handleSearch = () => {
        fetchClaims();
    };

    // ── Completed Policies helpers ────────────────────────────────────────────
    const fetchCompletedPolicies = useCallback(async () => {
        setCompletedLoading(true);
        setCompletedError(null);
        try {
            const res = await brokerAdminAPI.getCompletedPolicies({
                search: appliedCpSearch || undefined,
                companyName: appliedCpCompanyName || undefined,
                dateFrom: appliedCpDateFrom || undefined,
                dateTo: appliedCpDateTo || undefined,
                page: completedPage,
                limit: 10
            });
            if (res.success) {
                setCompletedPolicies(res.policies ?? []);
                setCompletedTotal(res.total ?? 0);
                setCompletedTotalPages(res.totalPages ?? 1);
            } else {
                setCompletedError('Failed to load completed policies.');
            }
        } catch {
            setCompletedError('Failed to load completed policies.');
        } finally {
            setCompletedLoading(false);
        }
    // eslint-disable-next-line react-hooks/exhaustive-deps
    }, [appliedCpSearch, appliedCpCompanyName, appliedCpDateFrom, appliedCpDateTo, completedPage]);

    const handleApplyCpFilters = () => {
        setAppliedCpSearch(cpSearch);
        setAppliedCpCompanyName(cpCompanyName);
        setAppliedCpDateFrom(cpDateFrom);
        setAppliedCpDateTo(cpDateTo);
        setCompletedPage(1);
    };

    const handleClearCpFilters = () => {
        setCpSearch('');
        setCpCompanyName('');
        setCpDateFrom('');
        setCpDateTo('');
        setAppliedCpSearch('');
        setAppliedCpCompanyName('');
        setAppliedCpDateFrom('');
        setAppliedCpDateTo('');
        setCompletedPage(1);
    };

    const handleExportCompletedCsv = async () => {
        setCsvExporting(true);
        try {
            const csvData = await brokerAdminAPI.exportCompletedPoliciesCsv(
                appliedCpDateFrom || undefined,
                appliedCpDateTo || undefined,
                appliedCpCompanyName || undefined
            );
            triggerCsvDownload(csvData, 'completed_policies.csv');
        } catch {
            setCompletedError('Failed to export CSV.');
        } finally {
            setCsvExporting(false);
        }
    };

    const handleViewCompletedPolicy = async (policyId: string) => {
        setCompletedPolicyModalOpen(true);
        setCompletedPolicyModalLoading(true);
        setCompletedPolicyModalError(null);
        setSelectedCompletedPolicy(null);

        try {
            const res = await brokerAdminAPI.getCompletedPolicyById(policyId);
            if (res.success && res.policy) {
                setSelectedCompletedPolicy(res.policy);
            } else {
                setCompletedPolicyModalError('Completed policy not found.');
            }
        } catch (err) {
            setCompletedPolicyModalError(err instanceof Error ? err.message : 'Failed to load policy details.');
        } finally {
            setCompletedPolicyModalLoading(false);
        }
    };

    const closeCompletedPolicyModal = () => {
        setCompletedPolicyModalOpen(false);
        setSelectedCompletedPolicy(null);
        setCompletedPolicyModalError(null);
        setCompletedPolicyModalLoading(false);
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

    const handleViewClaim = async (claimId: string) => {
        setModalLoading(true);
        setModalError(null);
        try {
            const res = await brokerAdminAPI.getClaimById(claimId);
            if (res && res.claim) {
                setSelectedClaim(res.claim);
                setNotes(res.claim.brokerNotes || '');
            } else {
                setModalError('Claim not found');
            }
        } catch (err) {
            setModalError(err instanceof Error ? err.message : 'Failed to load claim');
        } finally {
            setModalLoading(false);
        }
    };

    const handleCloseModal = () => {
        setSelectedClaim(null);
        setModalError(null);
        setSuccessMessage(null);
        setNotes('');
        setReason('');
    };

    const updateStatus = async (status: 'under_review' | 'rejected' | 'completed') => {
        if (!selectedClaim) return;

        if (status === 'rejected' && !reason.trim()) {
            setModalError('Please provide a reason for rejection');
            return;
        }

        setUpdating(true);
        setModalError(null);
        try {
            const payload: BrokerStatusUpdateRequest = { status };
            if (notes.trim()) payload.notes = notes.trim();
            if (reason.trim()) payload.reason = reason.trim();

            const res = await brokerAdminAPI.updateClaimStatus(selectedClaim._id, payload);
            if (res && res.claim) {
                setSelectedClaim(res.claim);
                setSuccessMessage(res.message || 'Status updated successfully');
                setReason('');
                setTimeout(() => setSuccessMessage(null), 4000);
                // Refresh data
                fetchDashboardData();
                fetchClaims();
            } else {
                setModalError('Failed to update status');
            }
        } catch (err) {
            setModalError(err instanceof Error ? err.message : 'Failed to update status');
        } finally {
            setUpdating(false);
        }
    };

    const formatCurrency = (amount?: number) => {
        if (amount == null) return 'N/A';
        return new Intl.NumberFormat('en-NG', { style: 'currency', currency: 'NGN' }).format(amount);
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleDateString('en-US', {
            year: 'numeric',
            month: 'short',
            day: 'numeric'
        });
    };

    const formatStatus = (status?: string) => status ? status.replace(/_/g, ' ').toUpperCase() : 'N/A';

    if (loading && !dashboardData) {
        return (
            <div className="flex items-center justify-center py-12">
                <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-indigo-600"></div>
            </div>
        );
    }

    return (
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
            {/* Header */}
            <div className="mb-6">
                <div className="flex items-center justify-between">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900">Broker Admin Dashboard</h1>
                        <p className="text-sm text-gray-600 mt-1">Manage insurance claims and track completed policies</p>
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

            {/* Statistics */}
            {dashboardError ? (
                <DashboardErrorBanner message={dashboardError} className="mb-8" />
            ) : (
                dashboardData && (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                        <StatCard
                            icon={Shield}
                            label="Completed Policies"
                            value={dashboardData.statistics.completedPolicies}
                            color="green"
                        />
                    </div>
                )
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
                                onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
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
                                                type="button"
                                                onClick={(e) => {
                                                    e.preventDefault();
                                                    e.stopPropagation();
                                                    handleViewClaim(claim._id);
                                                }}
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


            {/* Completed Policies Section */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden mt-8">
                {/* Section header */}
                <div className="px-6 py-4 border-b border-gray-200 flex items-center justify-between">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900 flex items-center gap-2">
                            <CheckCircle className="w-5 h-5 text-green-600" />
                            Completed Policies (NIIP)
                        </h2>
                        <p className="text-sm text-gray-500 mt-0.5">
                            All paid and completed policies, filterable by date range and insurer name.
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <span className="text-sm text-gray-600">{completedTotal} record{completedTotal !== 1 ? 's' : ''}</span>
                        <button
                            onClick={handleExportCompletedCsv}
                            disabled={csvExporting}
                            className="inline-flex items-center gap-2 px-4 py-2 bg-green-600 text-white rounded-md hover:bg-green-700 disabled:opacity-50 text-sm font-medium"
                        >
                            {csvExporting ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Download className="w-4 h-4" />
                            )}
                            {csvExporting ? 'Exporting...' : 'Download CSV'}
                        </button>
                    </div>
                </div>

                {/* Filter bar */}
                <div className="px-6 py-4 border-b border-gray-100 bg-gray-50">
                    <div className="flex flex-col md:flex-row gap-3 flex-wrap">
                        {/* Search */}
                        <div className="relative flex-1 min-w-[180px]">
                            <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Search policy number or builder..."
                                value={cpSearch}
                                onChange={(e) => setCpSearch(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCpFilters()}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Broker company name filter */}
                        <div className="relative flex-1 min-w-[200px]">
                            <Building2 className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="text"
                                placeholder="Insurance company name..."
                                value={cpCompanyName}
                                onChange={(e) => setCpCompanyName(e.target.value)}
                                onKeyDown={(e) => e.key === 'Enter' && handleApplyCpFilters()}
                                className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date From */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={cpDateFrom}
                                onChange={(e) => setCpDateFrom(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Date To */}
                        <div className="relative">
                            <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                            <input
                                type="date"
                                value={cpDateTo}
                                onChange={(e) => setCpDateTo(e.target.value)}
                                className="pl-9 pr-3 py-2 border border-gray-300 rounded-md text-sm focus:ring-2 focus:ring-indigo-500 focus:border-indigo-500"
                            />
                        </div>

                        {/* Apply / Clear */}
                        <div className="flex gap-2">
                            <button
                                onClick={handleApplyCpFilters}
                                className="inline-flex items-center gap-1 px-4 py-2 bg-indigo-600 text-white rounded-md hover:bg-indigo-700 text-sm font-medium"
                            >
                                <Filter className="w-4 h-4" />
                                Apply
                            </button>
                            {(appliedCpSearch || appliedCpCompanyName || appliedCpDateFrom || appliedCpDateTo) && (
                                <button
                                    onClick={handleClearCpFilters}
                                    className="inline-flex items-center gap-1 px-3 py-2 border border-gray-300 text-gray-700 rounded-md hover:bg-gray-50 text-sm"
                                >
                                    <X className="w-4 h-4" />
                                    Clear
                                </button>
                            )}
                        </div>
                    </div>
                </div>

                {/* Error */}
                {completedError && (
                    <div className="px-6 py-3 bg-red-50 border-b border-red-100 flex items-center gap-2 text-red-700 text-sm">
                        <AlertCircle className="w-4 h-4 flex-shrink-0" />
                        {completedError}
                    </div>
                )}

                {/* Table */}
                <div className="overflow-x-auto">
                    <table className="min-w-full divide-y divide-gray-200">
                        <thead className="bg-gray-50">
                            <tr>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Policy Number</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Builder Name</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Email</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">LGA</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Estimated Sum Range</th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                    <span className="flex items-center gap-1"><Building2 className="w-3.5 h-3.5" />Insurance Company</span>
                                </th>
                                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Completed At</th>
                                <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
                            </tr>
                        </thead>
                        <tbody className="bg-white divide-y divide-gray-200">
                            {completedLoading ? (
                                <tr>
                                    <td colSpan={8} className="px-6 py-10 text-center">
                                        <div className="flex justify-center">
                                            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-indigo-600" />
                                        </div>
                                    </td>
                                </tr>
                            ) : completedPolicies.length > 0 ? (
                                completedPolicies.map((policy) => {
                                    const brokerCompany = policy.brokerCompanyName || '';
                                    return (
                                        <tr
                                            key={policy._id}
                                            className="hover:bg-gray-50 cursor-pointer"
                                            onClick={() => handleViewCompletedPolicy(policy._id)}
                                            onKeyDown={(event) => {
                                                if (event.key === 'Enter' || event.key === ' ') {
                                                    event.preventDefault();
                                                    handleViewCompletedPolicy(policy._id);
                                                }
                                            }}
                                            tabIndex={0}
                                        >
                                            <td className="px-6 py-4 whitespace-nowrap text-sm font-medium text-gray-900">
                                                {policy.policyNumber || policy._id}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {policy.builder.nameOfBuilder || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {policy.builder.customerEmail || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-600">
                                                {policy.project.lga || 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                <div className="font-medium">
                                                    {getProjectEstimateBand(policy.project) || 'Not provided'}
                                                </div>
                                                <div className="mt-1 text-xs text-gray-500">
                                                    Stored ceiling:{' '}
                                                    {policy.project.totalEstimateSum != null
                                                        ? formatCurrency(Number(policy.project.totalEstimateSum))
                                                        : 'N/A'}
                                                </div>
                                            </td>
                                            <td className="px-6 py-4 text-sm text-gray-900">
                                                {brokerCompany ? (
                                                    <span className="inline-flex items-center gap-1 px-2 py-0.5 rounded-full text-xs bg-indigo-50 text-indigo-700 border border-indigo-100">
                                                        <Building2 className="w-3 h-3" />
                                                        {brokerCompany}
                                                    </span>
                                                ) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500">
                                                {policy.completedAt ? formatDate(policy.completedAt) : 'N/A'}
                                            </td>
                                            <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                                <button
                                                    type="button"
                                                    onClick={(event) => {
                                                        event.preventDefault();
                                                        event.stopPropagation();
                                                        handleViewCompletedPolicy(policy._id);
                                                    }}
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-900"
                                                >
                                                    <Eye className="w-4 h-4 mr-1" />
                                                    View details
                                                </button>
                                            </td>
                                        </tr>
                                    );
                                })
                            ) : (
                                <tr>
                                    <td colSpan={8} className="px-6 py-12 text-center text-gray-500">
                                        <CheckCircle className="w-10 h-10 mx-auto text-gray-300 mb-3" />
                                        <p className="text-sm">No completed policies found.</p>
                                        {(appliedCpSearch || appliedCpCompanyName || appliedCpDateFrom || appliedCpDateTo) && (
                                            <button onClick={handleClearCpFilters} className="mt-2 text-indigo-600 text-sm hover:underline">Clear filters</button>
                                        )}
                                    </td>
                                </tr>
                            )}
                        </tbody>
                    </table>
                </div>

                {/* Pagination */}
                {completedTotalPages > 1 && (
                    <div className="px-6 py-4 border-t border-gray-200 flex items-center justify-between">
                        <p className="text-sm text-gray-600">
                            Page {completedPage} of {completedTotalPages} - {completedTotal} total
                        </p>
                        <div className="flex gap-2">
                            <button
                                onClick={() => setCompletedPage(p => Math.max(1, p - 1))}
                                disabled={completedPage === 1}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                <ChevronLeft className="w-4 h-4 mr-1" /> Prev
                            </button>
                            <button
                                onClick={() => setCompletedPage(p => Math.min(completedTotalPages, p + 1))}
                                disabled={completedPage === completedTotalPages}
                                className="inline-flex items-center px-3 py-1.5 border border-gray-300 rounded-md text-sm text-gray-700 hover:bg-gray-50 disabled:opacity-40"
                            >
                                Next <ChevronRight className="w-4 h-4 ml-1" />
                            </button>
                        </div>
                    </div>
                )}
            </div>

            {completedPolicyModalOpen && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-5xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-start justify-between">
                            <div>
                                <h2 className="text-2xl font-bold text-gray-900">Completed Policy Details</h2>
                                <p className="text-sm text-gray-600 mt-1">
                                    {selectedCompletedPolicy?.policyNumber || 'Loading policy...'}
                                </p>
                            </div>
                            <button onClick={closeCompletedPolicyModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {completedPolicyModalLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                </div>
                            )}

                            {completedPolicyModalError && (
                                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-800">{completedPolicyModalError}</p>
                                    </div>
                                </div>
                            )}

                            {!completedPolicyModalLoading && selectedCompletedPolicy && (
                                <>
                                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4 mb-6">
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Status</p>
                                            <div className="mt-2">
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedCompletedPolicy.status)}`}>
                                                    {formatStatus(selectedCompletedPolicy.status)}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Insurance Company</p>
                                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                                {selectedCompletedPolicy.brokerCompanyName || selectedCompletedPolicy.meta?.brokerOrAgentName || 'N/A'}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Estimated Sum Range</p>
                                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                                {getProjectEstimateBand(selectedCompletedPolicy.project) || 'Range not provided'}
                                            </p>
                                            <p className="mt-1 text-xs text-gray-500">
                                                Stored ceiling: {formatCurrency(selectedCompletedPolicy.project.totalEstimateSum)}
                                            </p>
                                        </div>
                                        <div className="rounded-lg border border-gray-200 bg-gray-50 p-4">
                                            <p className="text-xs uppercase tracking-wide text-gray-500">Completed At</p>
                                            <p className="mt-2 text-sm font-semibold text-gray-900">
                                                {selectedCompletedPolicy.completedAt ? formatDate(selectedCompletedPolicy.completedAt) : 'N/A'}
                                            </p>
                                        </div>
                                    </div>

                                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                                        <SectionCard icon={User} title="Contractor & Client">
                                            <KeyValue label="Contractor" value={selectedCompletedPolicy.builder.nameOfBuilder} />
                                            <KeyValue label="RC Number" value={selectedCompletedPolicy.builder.rcNumber} />
                                            <KeyValue label="Email" value={selectedCompletedPolicy.builder.customerEmail} />
                                            <KeyValue label="Phone" value={selectedCompletedPolicy.builder.telNo} />
                                            <KeyValue label="Location / Address" value={selectedCompletedPolicy.builder.address} />
                                            <KeyValue label="Client Name" value={selectedCompletedPolicy.client?.name || 'Not provided'} />
                                            <KeyValue label="Client Email" value={selectedCompletedPolicy.client?.email || 'Not provided'} />
                                            <KeyValue label="Client Phone" value={selectedCompletedPolicy.client?.phoneNumber || 'Not provided'} />
                                            <KeyValue label="Client RC Number" value={selectedCompletedPolicy.client?.rcNumber || 'Not provided'} />
                                            <KeyValue
                                                label="Identification"
                                                value={selectedCompletedPolicy.builder.identification
                                                    ? `${selectedCompletedPolicy.builder.identification.identificationTypeId} - ${selectedCompletedPolicy.builder.identification.identityNo}`
                                                    : 'N/A'}
                                            />
                                        </SectionCard>

                                        <SectionCard icon={Layers} title="Project">
                                            <KeyValue label="Property Title" value={getDisplayValue(getProjectTitle(selectedCompletedPolicy.project))} />
                                            <KeyValue label="Project Type" value={selectedCompletedPolicy.project.projectType || 'N/A'} />
                                            <KeyValue label="Cover Type" value={selectedCompletedPolicy.project.coverTypeIdxDetails} />
                                            <KeyValue label="Estimated Sum Range" value={getProjectEstimateBand(selectedCompletedPolicy.project) || 'Not provided'} />
                                            <KeyValue label="Category" value={selectedCompletedPolicy.project.categoryOfContractorId} />
                                            <KeyValue label="Plot Number" value={selectedCompletedPolicy.project.plotNumber || selectedCompletedPolicy.project.agisNo || 'Not provided'} />
                                            <KeyValue label="Cadastral Zone" value={selectedCompletedPolicy.project.cadastralZone || 'Not provided'} />
                                            <KeyValue label="Location" value={getDisplayValue(getProjectAddress(selectedCompletedPolicy.project, selectedCompletedPolicy.builder))} />
                                            <KeyValue label="District / LGA" value={`${getDisplayValue(getProjectDistrict(selectedCompletedPolicy.project))} / ${getDisplayValue(getProjectLga(selectedCompletedPolicy.project))}`} />
                                            <KeyValue label="Work Details" value={selectedCompletedPolicy.project.workDetails || 'N/A'} />
                                            <KeyValue label="Extra Hazardous" value={selectedCompletedPolicy.project.extraHazardous ? 'Yes' : 'No'} />
                                        </SectionCard>

                                        <SectionCard icon={Building2} title="Consultant">
                                            <KeyValue label="Regulatory Body" value={getDisplayValue(getProfessionalBody(selectedCompletedPolicy.organization))} />
                                            <KeyValue label="Registration Number" value={getDisplayValue(getProfessionalRegistrationNumber(selectedCompletedPolicy.organization))} />
                                            {getProfessionalBody(selectedCompletedPolicy.organization) === 'Other' && (
                                                <KeyValue label="Other Regulatory Body Name" value={selectedCompletedPolicy.organization.otherProfessionalBodyName || 'Not provided'} />
                                            )}
                                            <KeyValue label="Specialization" value={selectedCompletedPolicy.organization.areaOfSpecialization || 'N/A'} />
                                            <KeyValue
                                                label="Year of Registration"
                                                value={selectedCompletedPolicy.organization.yearOfRegistration
                                                    ? formatDate(String(selectedCompletedPolicy.organization.yearOfRegistration))
                                                    : 'N/A'}
                                            />
                                            <KeyValue label="Staff Strength" value={selectedCompletedPolicy.organization.staffStrength || selectedCompletedPolicy.organization.noOfPermanentStaff || selectedCompletedPolicy.organization.permanentStaffCount} />
                                        </SectionCard>

                                        <SectionCard icon={DollarSign} title="Payment">
                                            <KeyValue label="Payment Status" value={formatStatus(selectedCompletedPolicy.paymentInfo?.status)} />
                                            <KeyValue label="Amount" value={formatCurrency(selectedCompletedPolicy.paymentInfo?.amount)} />
                                            <KeyValue label="Transaction ID" value={selectedCompletedPolicy.paymentInfo?.transactionId || 'N/A'} />
                                            <KeyValue label="Method" value={selectedCompletedPolicy.paymentInfo?.method || 'N/A'} />
                                            <KeyValue
                                                label="Paid At"
                                                value={selectedCompletedPolicy.paymentInfo?.paidAt
                                                    ? formatDate(String(selectedCompletedPolicy.paymentInfo.paidAt))
                                                    : 'N/A'}
                                            />
                                        </SectionCard>

                                        <SectionCard icon={Shield} title="Membership & Compliance">
                                            <KeyValue
                                                label="NIA Membership Status"
                                                value={selectedCompletedPolicy.membership.MembershipStatusId === 1
                                                    ? 'Yes, applicant is a Nigerian Insurers Association (NIA) member'
                                                    : selectedCompletedPolicy.membership.MembershipStatusId === 2
                                                        ? 'No, applicant is not a Nigerian Insurers Association (NIA) member'
                                                        : 'N/A'}
                                            />
                                            <KeyValue
                                                label="NIA Member ID"
                                                value={selectedCompletedPolicy.membership.MemberId || selectedCompletedPolicy.membership.MembershipNo || 'N/A'}
                                            />
                                            <KeyValue
                                                label="Existing Insurance"
                                                value={selectedCompletedPolicy.compliance.HasInsurance
                                                    ? selectedCompletedPolicy.compliance.HasInsuranceDetails || 'Yes'
                                                    : 'No'}
                                            />
                                            <KeyValue
                                                label="Investigation"
                                                value={selectedCompletedPolicy.compliance.investigation
                                                    ? selectedCompletedPolicy.compliance.investigationDetails || 'Yes'
                                                    : 'No'}
                                            />
                                            <KeyValue
                                                label="Disciplinary Committee"
                                                value={selectedCompletedPolicy.compliance.disciplinaryCommittee
                                                    ? selectedCompletedPolicy.compliance.disciplinaryCommitteeDetails || 'Yes'
                                                    : 'No'}
                                            />
                                            <KeyValue label="Practice Outside Nigeria" value={selectedCompletedPolicy.compliance.PracticeOutsideNigeria} />
                                        </SectionCard>

                                        <SectionCard icon={ClipboardList} title="Workforce">
                                            <KeyValue label="Contract Staff" value={selectedCompletedPolicy.workforce.contractStaffCount} />
                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-gray-700">Categories</p>
                                                <div className="mt-2 space-y-2">
                                                    {selectedCompletedPolicy.workforce.categoryOfWorkmen.map((category, index) => (
                                                        <div key={`${category.categoryOfWorkmen}-${index}`} className="rounded-md bg-gray-50 border border-gray-200 p-2 text-xs text-gray-700">
                                                            {category.categoryOfWorkmen} - {category.numberOfEmployment} staff - {category.yearsOfEmployment} years
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                            <div className="pt-2">
                                                <p className="text-xs font-semibold text-gray-700">Professionals</p>
                                                <div className="mt-2 space-y-2">
                                                    {selectedCompletedPolicy.workforce.professionals.map((professional, index) => (
                                                        <div key={`${professional.surname}-${professional.otherName}-${index}`} className="rounded-md bg-gray-50 border border-gray-200 p-2 text-xs text-gray-700">
                                                            {professional.surname} {professional.otherName} - {professional.profession} ({professional.qualification})
                                                        </div>
                                                    ))}
                                                </div>
                                            </div>
                                        </SectionCard>

                                        <SectionCard icon={FileText} title="Survey & Notes">
                                            <KeyValue label="Recommendation" value={selectedCompletedPolicy.surveyorRecommendation ? formatStatus(selectedCompletedPolicy.surveyorRecommendation) : 'N/A'} />
                                            <KeyValue label="Estimated Value" value={formatCurrency(selectedCompletedPolicy.surveyorEstimatedValue ?? undefined)} />
                                            <KeyValue
                                                label="Assigned Surveyors"
                                                value={selectedCompletedPolicy.assignedSurveyors && selectedCompletedPolicy.assignedSurveyors.length > 0
                                                    ? selectedCompletedPolicy.assignedSurveyors.map((surveyor) => `${surveyor.firstname} ${surveyor.lastname}`).join(', ')
                                                    : 'N/A'}
                                            />
                                            <KeyValue label="Survey Notes" value={selectedCompletedPolicy.surveyNotes || 'N/A'} />
                                            {selectedCompletedPolicy.surveyDocument && typeof selectedCompletedPolicy.surveyDocument !== 'string' && selectedCompletedPolicy.surveyDocument.url && (
                                                <a
                                                    href={selectedCompletedPolicy.surveyDocument.url}
                                                    target="_blank"
                                                    rel="noreferrer"
                                                    className="inline-flex items-center text-indigo-600 hover:text-indigo-800 text-sm font-medium pt-2"
                                                >
                                                    <Download className="w-4 h-4 mr-1" />
                                                    Open survey document
                                                </a>
                                            )}
                                        </SectionCard>

                                        <SectionCard icon={Images} title="Documents">
                                            {selectedCompletedPolicy.documents && selectedCompletedPolicy.documents.length > 0 ? (
                                                <div className="space-y-2">
                                                    {selectedCompletedPolicy.documents.map((document, index) => (
                                                        <div key={`${document.fileName}-${index}`} className="rounded-md bg-gray-50 border border-gray-200 p-3">
                                                            <p className="text-sm font-medium text-gray-900">{document.fileName}</p>
                                                            <p className="text-xs text-gray-600 mt-1">
                                                                {document.category} | {document.documentType} | {document.isVerified ? 'Verified' : 'Pending verification'}
                                                            </p>
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No additional documents attached.</p>
                                            )}
                                        </SectionCard>

                                        <SectionCard icon={Clock} title="Timeline" fullWidth>
                                            {selectedCompletedPolicy.statusHistory && selectedCompletedPolicy.statusHistory.length > 0 ? (
                                                <div className="space-y-3">
                                                    {selectedCompletedPolicy.statusHistory.map((entry, index) => (
                                                        <div key={`${entry.status}-${entry.changedAt}-${index}`} className="rounded-md border border-gray-200 bg-gray-50 p-3">
                                                            <div className="flex items-center justify-between gap-3">
                                                                <p className="text-sm font-semibold text-gray-900">{formatStatus(entry.status)}</p>
                                                                <p className="text-xs text-gray-500">{formatDate(entry.changedAt)}</p>
                                                            </div>
                                                            {entry.reason && (
                                                                <p className="text-sm text-gray-600 mt-2">{entry.reason}</p>
                                                            )}
                                                            {entry.changedBy && typeof entry.changedBy !== 'string' && (
                                                                <p className="text-xs text-gray-500 mt-2">
                                                                    Updated by {entry.changedBy.firstname} {entry.changedBy.lastname}
                                                                </p>
                                                            )}
                                                        </div>
                                                    ))}
                                                </div>
                                            ) : (
                                                <p className="text-sm text-gray-500">No status history available.</p>
                                            )}
                                        </SectionCard>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}

            {/* Claim Detail Modal - Same as claims page */}
            {selectedClaim && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-4xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="sticky top-0 bg-white border-b border-gray-200 px-6 py-4 flex items-center justify-between">
                            <h2 className="text-2xl font-bold text-gray-900">Claim Details</h2>
                            <button onClick={handleCloseModal} className="text-gray-400 hover:text-gray-600">
                                <X className="w-6 h-6" />
                            </button>
                        </div>

                        <div className="p-6">
                            {modalLoading && (
                                <div className="flex items-center justify-center py-12">
                                    <div className="animate-spin rounded-full h-10 w-10 border-b-2 border-indigo-600" />
                                </div>
                            )}

                            {successMessage && (
                                <div className="mb-4 rounded-md bg-green-50 border border-green-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <CheckCircle className="w-5 h-5 text-green-400" />
                                        <p className="text-green-800">{successMessage}</p>
                                    </div>
                                </div>
                            )}

                            {modalError && (
                                <div className="mb-4 rounded-md bg-red-50 border border-red-200 p-4">
                                    <div className="flex items-center gap-3">
                                        <AlertCircle className="w-5 h-5 text-red-400" />
                                        <p className="text-red-800">{modalError}</p>
                                    </div>
                                </div>
                            )}

                            {!modalLoading && (
                                <>
                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <FileText className="w-5 h-5" />
                                            Claim Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Claim ID</p>
                                                <p className="font-medium">{selectedClaim._id}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Policy Number</p>
                                                <p className="font-medium">{selectedClaim.policyNumber || 'N/A'}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Status</p>
                                                <span className={`inline-flex px-2 py-1 text-xs rounded-full ${getStatusBadge(selectedClaim.brokerStatus || 'pending')}`}>
                                                    {(selectedClaim.brokerStatus || 'pending').replace('_', ' ').toUpperCase()}
                                                </span>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600 flex items-center gap-1">
                                                    <Calendar className="w-4 h-4" /> Submitted
                                                </p>
                                                <p className="font-medium">{formatDate(selectedClaim.createdAt)}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Coverage Type</p>
                                                <p className="font-medium">{selectedClaim.requestDetails.coverageType}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Building Value</p>
                                                <p className="font-medium">{formatCurrency(selectedClaim.propertyDetails.buildingValue)}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4 mb-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <User className="w-5 h-5" />
                                            Contact Information
                                        </h3>
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                                            <div>
                                                <p className="text-sm text-gray-600">Name</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.fullName}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Email</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.email}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Phone</p>
                                                <p className="font-medium">{selectedClaim.contactDetails.phoneNumber}</p>
                                            </div>
                                            <div>
                                                <p className="text-sm text-gray-600">Property Address</p>
                                                <p className="font-medium">{selectedClaim.propertyDetails.address}</p>
                                            </div>
                                        </div>
                                    </div>

                                    <div className="bg-gray-50 rounded-lg p-4">
                                        <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                                            <Clock className="w-5 h-5" />
                                            Update Status
                                        </h3>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Notes (Optional)
                                            </label>
                                            <textarea
                                                value={notes}
                                                onChange={(e) => setNotes(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-indigo-500"
                                                rows={2}
                                                placeholder="Add any notes..."
                                            />
                                        </div>

                                        <div className="mb-3">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Rejection Reason {selectedClaim.brokerStatus === 'pending' && '(Required for rejection)'}
                                            </label>
                                            <textarea
                                                value={reason}
                                                onChange={(e) => setReason(e.target.value)}
                                                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-red-500"
                                                rows={2}
                                                placeholder="Provide reason if rejecting..."
                                            />
                                        </div>

                                        <div className="flex gap-2 flex-wrap">
                                            {selectedClaim.brokerStatus === 'pending' && (
                                                <button
                                                    onClick={() => updateStatus('under_review')}
                                                    disabled={updating}
                                                    className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 disabled:opacity-50"
                                                >
                                                    {updating ? 'Updating...' : 'Start Review'}
                                                </button>
                                            )}

                                            {selectedClaim.brokerStatus === 'under_review' && (
                                                <>
                                                    <button
                                                        onClick={() => updateStatus('completed')}
                                                        disabled={updating}
                                                        className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 disabled:opacity-50"
                                                    >
                                                        {updating ? 'Updating...' : 'Complete'}
                                                    </button>
                                                    <button
                                                        onClick={() => updateStatus('rejected')}
                                                        disabled={updating}
                                                        className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 disabled:opacity-50"
                                                    >
                                                        {updating ? 'Updating...' : 'Reject'}
                                                    </button>
                                                </>
                                            )}

                                            {(selectedClaim.brokerStatus === 'completed' || selectedClaim.brokerStatus === 'rejected') && (
                                                <p className="text-gray-600 italic text-sm">
                                                    This claim has been {selectedClaim.brokerStatus}. No further actions available.
                                                </p>
                                            )}
                                        </div>
                                    </div>
                                </>
                            )}
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
}

const SectionCard: React.FC<{
    title: string;
    icon: React.ComponentType<{ className?: string }>;
    children: React.ReactNode;
    fullWidth?: boolean;
}> = ({ title, icon: Icon, children, fullWidth }) => (
    <div className={`bg-white border border-gray-200 rounded-lg p-4 ${fullWidth ? 'col-span-full' : ''}`}>
        <div className="flex items-center gap-2 mb-3">
            <Icon className="w-4 h-4 text-indigo-500" />
            <h4 className="text-sm font-semibold text-gray-900">{title}</h4>
        </div>
        <div className="space-y-2">{children}</div>
    </div>
);

const KeyValue: React.FC<{ label: string; value?: string | number | null }> = ({ label, value }) => (
    <div className="text-sm">
        <p className="text-gray-500 text-xs uppercase tracking-wide">{label}</p>
        <p className="text-gray-800">{value ?? '—'}</p>
    </div>
);
