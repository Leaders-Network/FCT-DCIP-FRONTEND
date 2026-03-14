'use client';

import type React from 'react';
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
    RefreshCw,
    X,
    Calendar,
    User,
    Shield,
    Layers,
    DollarSign,
    ClipboardList,
    Images
} from 'lucide-react';
import type {
    BrokerDashboardData,
    BrokerPolicyRequest,
    BrokerClaimFilters,
    BrokerStatusUpdateRequest,
    UnderwriterMockPolicy
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
    const router = useRouter();
    const [dashboardData, setDashboardData] = useState<BrokerDashboardData | null>(null);
    const [claims, setClaims] = useState<BrokerPolicyRequest[]>([]);
    const [mockPolicies, setMockPolicies] = useState<UnderwriterMockPolicy[]>([]);
    const [loading, setLoading] = useState(true);
    const [mockLoading, setMockLoading] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [mockError, setMockError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [statusFilter, setStatusFilter] = useState<'all' | 'pending' | 'under_review' | 'rejected' | 'completed'>('all');
    const [refreshing, setRefreshing] = useState(false);

    // Modal state
    const [selectedClaim, setSelectedClaim] = useState<BrokerPolicyRequest | null>(null);
    const [selectedMock, setSelectedMock] = useState<UnderwriterMockPolicy | null>(null);
    const [mockDetailLoading, setMockDetailLoading] = useState(false);
    const [modalLoading, setModalLoading] = useState(false);
    const [modalError, setModalError] = useState<string | null>(null);
    const [updating, setUpdating] = useState(false);
    const [successMessage, setSuccessMessage] = useState<string | null>(null);
    const [notes, setNotes] = useState('');
    const [reason, setReason] = useState('');

    useEffect(() => {
        fetchDashboardData();
        fetchClaims();
        fetchMockPolicies();
        // eslint-disable-next-line react-hooks/exhaustive-deps
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

    const fetchMockPolicies = async () => {
        try {
            setMockLoading(true);
            setMockError(null);
            const res = await brokerAdminAPI.getMockAssignedPolicies();
            if (res.success && res.data?.policies) {
                setMockPolicies(res.data.policies);
            } else {
                setMockError('No mock policies available');
            }
        } catch (err) {
            console.error('Failed to fetch mock policies:', err);
            setMockError('Failed to load mock underwriter data');
        } finally {
            setMockLoading(false);
        }
    };

    const fetchMockDetail = async (policyId: string) => {
        try {
            setMockDetailLoading(true);
            const res = await brokerAdminAPI.getMockPolicyDetail(policyId);
            if (res.success && res.data?.policy) {
                setSelectedMock(res.data.policy);
            }
        } catch (err) {
            console.error('Failed to fetch mock policy detail:', err);
            setMockError('Failed to load policy detail');
        } finally {
            setMockDetailLoading(false);
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

            {/* Mock Underwriter Policies (Demo) */}
            <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-4 mb-6">
                <div className="flex items-center justify-between mb-3">
                    <div>
                        <h2 className="text-lg font-semibold text-gray-900">Underwriter Demo Policies (Mock)</h2>
                        <p className="text-sm text-gray-600">Fetched from mock endpoints to preview full policy payloads.</p>
                    </div>
                    <button
                        onClick={fetchMockPolicies}
                        className="inline-flex items-center px-3 py-2 text-sm border border-gray-300 rounded-md bg-white hover:bg-gray-50"
                        disabled={mockLoading}
                    >
                        <RefreshCw className={`w-4 h-4 mr-2 ${mockLoading ? 'animate-spin' : ''}`} />
                        Refresh mock data
                    </button>
                </div>

                {mockError && (
                    <div className="mb-3 rounded-md bg-red-50 border border-red-200 p-3 text-red-800 text-sm flex items-center gap-2">
                        <AlertCircle className="w-4 h-4" />
                        {mockError}
                    </div>
                )}

                {mockLoading ? (
                    <div className="flex items-center justify-center py-6 text-gray-600 text-sm">Loading mock policies...</div>
                ) : (
                    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                        {mockPolicies.map((policy) => (
                            <div
                                key={policy.policyId}
                                className={`border rounded-lg p-4 hover:shadow-sm transition cursor-pointer ${selectedMock?.policyId === policy.policyId ? 'border-indigo-500' : 'border-gray-200'}`}
                                onClick={() => {
                                    setSelectedMock(policy);
                                    fetchMockDetail(policy.policyId);
                                }}
                            >
                                <div className="flex items-center justify-between mb-2">
                                    <h3 className="text-md font-semibold text-gray-900">{policy.policyNumber}</h3>
                                    <span className={`px-2 py-1 text-xs rounded-full ${getStatusBadge((policy.brokerStatus as string) || 'pending')}`}>
                                        {formatStatus(policy.brokerStatus || policy.status)}
                                    </span>
                                </div>
                                <p className="text-sm text-gray-700 font-medium">{policy.builder.nameOfBuilder}</p>
                                <p className="text-xs text-gray-500">{policy.project.address}</p>
                                <div className="mt-3 grid grid-cols-2 gap-2 text-xs text-gray-600">
                                    <div>
                                        <p className="text-gray-500">Sum Insured</p>
                                        <p className="font-semibold">
                                            {formatCurrency(policy.project.totalEstimateSum)}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Payment</p>
                                        <p className="font-semibold">{formatStatus(policy.paymentInfo?.status)}</p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Surveyor</p>
                                        <p className="font-semibold text-gray-700">
                                            {policy.survey?.surveyor?.name || 'Pending'}
                                        </p>
                                    </div>
                                    <div>
                                        <p className="text-gray-500">Priority</p>
                                        <p className="font-semibold capitalize">{policy.priority || 'medium'}</p>
                                    </div>
                                </div>
                            </div>
                        ))}
                        {mockPolicies.length === 0 && !mockError && (
                            <div className="col-span-full text-center text-gray-500 text-sm py-4">
                                No mock policies to display.
                            </div>
                        )}
                    </div>
                )}

                {selectedMock && (
                    <div className="mt-6 border rounded-lg p-4 bg-gray-50">
                        <div className="flex items-center justify-between mb-3">
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Mock Policy Detail</h3>
                                <p className="text-sm text-gray-600">{selectedMock.policyNumber} · {selectedMock.builder.nameOfBuilder}</p>
                            </div>
                            <div className="flex items-center gap-3">
                                {mockDetailLoading && <span className="text-xs text-gray-500">Refreshing…</span>}
                                <button
                                    onClick={() => setSelectedMock(null)}
                                    className="text-sm text-indigo-600 hover:text-indigo-800"
                                >
                                    Clear
                                </button>
                            </div>
                        </div>

                        <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                            <SectionCard icon={User} title="Builder">
                                <KeyValue label="Builder" value={`${selectedMock.builder.nameOfBuilder} (${selectedMock.builder.rcNumber})`} />
                                <KeyValue label="Email / Phone" value={`${selectedMock.builder.customerEmail} · ${selectedMock.builder.telNo}`} />
                                <KeyValue label="Address" value={selectedMock.builder.address} />
                                {selectedMock.builder.identification && (
                                    <KeyValue label="ID" value={`${selectedMock.builder.identification.identificationTypeId} - ${selectedMock.builder.identification.identityNo}`} />
                                )}
                            </SectionCard>

                            <SectionCard icon={Layers} title="Project">
                                <KeyValue label="Description" value={selectedMock.project.workDetails || 'Project details pending'} />
                                <KeyValue label="Location" value={`${selectedMock.project.address || '—'} (${selectedMock.project.district || ''} ${selectedMock.project.lga || ''})`} />
                                <KeyValue label="Cover Type" value={selectedMock.project.coverTypeIdxDetails} />
                                <KeyValue label="Sum Insured" value={formatCurrency(selectedMock.project.totalEstimateSum)} />
                            </SectionCard>

                            <SectionCard icon={Shield} title="Compliance & Membership">
                                <KeyValue label="Membership" value={selectedMock.membership ? `${selectedMock.membership.MembershipName || ''} ${selectedMock.membership.MembershipNo || ''}` : '—'} />
                                <KeyValue label="Insurance" value={selectedMock.compliance?.HasInsurance ? selectedMock.compliance.HasInsuranceDetails : 'No prior cover'} />
                                <KeyValue label="Disciplinary" value={selectedMock.compliance?.disciplinaryCommittee ? selectedMock.compliance.disciplinaryCommitteeDetails : 'None disclosed'} />
                                <KeyValue label="Practice Outside Nigeria" value={selectedMock.compliance?.PracticeOutsideNigeria || 'No'} />
                            </SectionCard>

                            <SectionCard icon={ClipboardList} title="Workforce">
                                <KeyValue label="Contract Staff" value={selectedMock.workforce?.contractStaffCount ?? '—'} />
                                <KeyValue label="Blood Relations" value={selectedMock.workforce?.bloodRelationsCount ?? '—'} />
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-700">Categories</p>
                                    <ul className="text-xs text-gray-600 list-disc ml-4">
                                        {(selectedMock.workforce?.categoryOfWorkmen || []).map((c, idx) => (
                                            <li key={idx}>{c.categoryOfWorkmen} · {c.numberOfEmployment} staff · {c.yearsOfEmployment} yrs</li>
                                        ))}
                                    </ul>
                                </div>
                                <div className="mt-2">
                                    <p className="text-xs font-semibold text-gray-700">Professionals</p>
                                    <ul className="text-xs text-gray-600 list-disc ml-4">
                                        {(selectedMock.workforce?.professionals || []).map((p, idx) => (
                                            <li key={idx}>{p.surname} {p.otherName} — {p.profession} ({p.qualification}), {p.yearsInEmployment} yrs</li>
                                        ))}
                                    </ul>
                                </div>
                            </SectionCard>

                            <SectionCard icon={DollarSign} title="Payment">
                                <KeyValue label="Status" value={formatStatus(selectedMock.paymentInfo?.status)} />
                                <KeyValue label="Amount" value={formatCurrency(selectedMock.paymentInfo?.amount)} />
                                <KeyValue label="Transaction ID" value={selectedMock.paymentInfo?.transactionId || '—'} />
                                <KeyValue label="Method" value={selectedMock.paymentInfo?.method || '—'} />
                                <KeyValue label="Paid At" value={selectedMock.paymentInfo?.paidAt ? formatDate(selectedMock.paymentInfo.paidAt) : '—'} />
                            </SectionCard>

                            <SectionCard icon={FileText} title="Survey">
                                <KeyValue label="Surveyor" value={selectedMock.survey?.surveyor?.name || 'Unassigned'} />
                                <KeyValue label="Survey Date" value={selectedMock.survey?.surveyDate ? formatDate(selectedMock.survey.surveyDate) : '—'} />
                                <KeyValue label="Assessment" value={selectedMock.survey?.structuralAssessment || '—'} />
                                <KeyValue label="Risks" value={selectedMock.survey?.riskFactors || '—'} />
                                <KeyValue label="Recommendations" value={selectedMock.survey?.recommendations || '—'} />
                                <KeyValue label="Estimated Value" value={formatCurrency(selectedMock.survey?.estimatedValue)} />
                                {selectedMock.survey?.surveyDocument?.url && (
                                    <div className="mt-2">
                                        <p className="text-xs font-semibold text-gray-700">Survey Report</p>
                                        <a
                                            href={selectedMock.survey.surveyDocument.url}
                                            target="_blank"
                                            rel="noreferrer"
                                            className="text-indigo-600 text-sm hover:underline"
                                        >
                                            Download survey document
                                        </a>
                                    </div>
                                )}
                            </SectionCard>

                            <SectionCard icon={ClipboardList} title="Notes" fullWidth>
                                <KeyValue label="Admin Notes" value={selectedMock.adminNotes || '—'} />
                            </SectionCard>
                        </div>
                    </div>
                )}
            </div>

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
