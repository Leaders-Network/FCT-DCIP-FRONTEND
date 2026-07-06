
"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Users, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical, DollarSign, Search, Filter, X, UserPlus } from 'lucide-react';
import { Surveyor, EnhancedSurveySubmission, Assignment } from '@/types/api.types';
import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { useBuilderLiabilityPolicies } from '@/hooks/useBuilderLiabilityPolicy';
import { adminApi, reviewSubmission, getSubmissionByAssignment } from '@/services/api';
import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';
import AssignSurveyorModal from './AssignSurveyorModal';
import { PolicyDetailsModal } from '@/components/builderLiability/PolicyDetailsModal';
import { toast } from "sonner";
import ExportCsvPanel from '@/components/shared/ExportCsvPanel';
import { exportAmmcPoliciesCsv, triggerCsvDownload } from '@/services/api';

// Legacy imports for backward compatibility during transition
import { PolicyRequest } from '@/types/api.types';
import { deletePolicyRequest } from '@/services/api';

// Extended type for handling both legacy and new policy types
interface ExtendedPolicyRequest extends Omit<PolicyRequest, 'isBuilderLiabilityPolicy' | 'originalBLPolicy'> {
  isBuilderLiabilityPolicy?: boolean;
  originalBLPolicy?: BuilderLiabilityPolicy;
}

type MixedPolicy = ExtendedPolicyRequest | PolicyRequest;

type ApiErrorWithMessage = {
  response?: {
    data?: {
      message?: string;
    };
  };
};

// Type guard functions
const isBuilderLiabilityPolicy = (policy: MixedPolicy): policy is ExtendedPolicyRequest & {
  isBuilderLiabilityPolicy: true;
  originalBLPolicy: BuilderLiabilityPolicy;
} => {
  return 'isBuilderLiabilityPolicy' in policy && policy.isBuilderLiabilityPolicy === true && !!policy.originalBLPolicy;
};

const getPolicyStatus = (policy: MixedPolicy): string => {
  return policy.status || 'unknown';
};

// Helper function to safely convert MixedPolicy to PolicyRequest for legacy functions
const toPolicyRequest = (policy: MixedPolicy): PolicyRequest => {
  if (isBuilderLiabilityPolicy(policy)) {
    // Convert ExtendedPolicyRequest to PolicyRequest format
    return {
      ...policy,
      originalBLPolicy: policy.originalBLPolicy ? {
        _id: policy.originalBLPolicy._id,
        policyNumber: policy.originalBLPolicy.policyNumber || '',
        builder: policy.originalBLPolicy.builder as unknown as Record<string, unknown>,
        propertyDetails: policy.originalBLPolicy.project as unknown as Record<string, unknown>,
        status: policy.originalBLPolicy.status
      } : undefined
    } as PolicyRequest;
  }
  return policy as PolicyRequest;
};

interface PolicyManagementProps { }

const PolicyManagement: React.FC<PolicyManagementProps> = ({ }) => {
  const router = useRouter();
  const { user } = useAuth();

  // Use the new Builder Liability Policy hooks
  const {
    policies: builderLiabilityPolicies,
    loading: blpLoading,
    error: blpError,
    fetchPolicies: fetchBLPolicies
  } = useBuilderLiabilityPolicies(true); // true for admin mode

  // Legacy state for backward compatibility
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [selectedPolicy, setSelectedPolicy] = useState<MixedPolicy | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedPolicySubmissions, setSelectedPolicySubmissions] = useState<EnhancedSurveySubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'assigned' | 'surveyed' | 'revision_required' | 'rejected'>('all');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<MixedPolicy | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  const normalizeSurveyor = (surveyor: Surveyor | Record<string, unknown>): Surveyor => {
    const safeSurveyor = surveyor as Surveyor & { userId?: { firstname?: string; lastname?: string; email?: string; phonenumber?: string } };
    return {
      ...safeSurveyor,
      firstname: safeSurveyor.firstname || safeSurveyor.userId?.firstname || '',
      lastname: safeSurveyor.lastname || safeSurveyor.userId?.lastname || '',
      email: safeSurveyor.email || safeSurveyor.userId?.email || '',
      phonenumber: safeSurveyor.phonenumber || safeSurveyor.userId?.phonenumber || ''
    };
  };

  // New state for Builder Liability Policies
  const [selectedBLPolicy, setSelectedBLPolicy] = useState<BuilderLiabilityPolicy | null>(null);
  const [showBLPolicyModal, setShowBLPolicyModal] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    insuranceType: "",
    coverageType: "",
    minValue: "",
    maxValue: "",
    dateFrom: "",
    dateTo: "",
    priority: "",
    claimStatus: "",
    surveyorAssigned: ""
  });

  // Handle click outside to close dropdown
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showActionsDropdown && !target.closest('.dropdown-container')) {
        setShowActionsDropdown(null);
      }
    };

    if (showActionsDropdown) {
      document.addEventListener('mousedown', handleClickOutside);
      return () => document.removeEventListener('mousedown', handleClickOutside);
    }
  }, [showActionsDropdown]);

  const handleFetchDocumentUrl = async (document: string | { cloudinaryUrl: string } | { name: string; url: string; publicId: string }) => {
    if (typeof document === 'string') {
      const response = await adminApi.getSurveyDocumentDownloadUrl(document);
      setDocumentUrl(response.data.url);
    } else if (document && 'cloudinaryUrl' in document) {
      setDocumentUrl(document.cloudinaryUrl);
    } else if (document && 'url' in document) {
      setDocumentUrl(document.url);
    }
  };

  const fetchPoliciesAndSurveyors = async () => {
    try {
      // Fetch surveyors and Builder Liability Policies
      const surveyorsResponse = await adminApi.getSurveyors();
      const normalizedSurveyors = Array.isArray(surveyorsResponse?.data)
        ? surveyorsResponse.data.map(normalizeSurveyor)
        : [];
      setSurveyors(normalizedSurveyors);

      // Fetch Builder Liability Policies using both hooks and direct API call
      fetchBLPolicies();

      // Also try to fetch from admin policy endpoint as backup
      try {
        const adminPoliciesResponse = await adminApi.getPolicies();
      } catch (adminError) {
      }
    } catch (error) {
      // Ensure policies is always an array even on error
      setPolicies([]);
    }
  };

  useEffect(() => {
    fetchPoliciesAndSurveyors();
  }, []);

  // Use only Builder Liability Policies for display
  const allPoliciesForDisplay = React.useMemo(() => {

    const safeBuilderLiabilityPolicies = Array.isArray(builderLiabilityPolicies) ? builderLiabilityPolicies : [];

    // Convert Builder Liability Policies to display format
    return safeBuilderLiabilityPolicies.map(blp => ({
      _id: blp._id,
      userId: blp.userId || '',
      propertyDetails: {
        propertyType: blp.project?.projectTitle || blp.project?.projectName || `Builder Liability - ${blp.builder?.nameOfBuilder || 'Unknown'}`,
        address: blp.project?.address || blp.project?.projectAddress || blp.builder?.address || '',
        buildingValue: blp.project?.totalEstimateSum || 0,
        plotNumber: blp.project?.plotNumber || blp.project?.agisNo || '',
        cadastralZone: blp.project?.cadastralZone || '',
        district: blp.project?.district || blp.project?.projectDistrict || '',
        fullAddress: blp.project?.address || blp.project?.projectAddress || blp.builder?.address || '',
        yearBuilt: 0,
        squareFootage: 0,
        constructionMaterial: ''
      },
      contactDetails: {
        fullName: blp.client?.name || blp.builder?.nameOfBuilder || '',
        email: blp.client?.email || blp.builder?.customerEmail || '',
        phoneNumber: blp.client?.phoneNumber || blp.builder?.telNo || '',
        alternatePhone: '',
        rcNumber: blp.client?.rcNumber || blp.builder?.rcNumber || ''
      },
      requestDetails: {
        coverageType: blp.project?.coverTypeIdxDetails || 'Builder Liability',
        policyDuration: '1 Year',
        additionalCoverage: [],
        specialRequests: blp.project?.workDetails || ''
      },
      status: blp.status,
      createdAt: blp.createdAt,
      updatedAt: blp.updatedAt,
      surveyDocument: blp.surveyDocument,
      surveyNotes: blp.surveyNotes,
      adminNotes: blp.adminNotes,
      documents: blp.documents || [],
      policyNumber: blp.policyNumber,
      // Mark as Builder Liability Policy for special handling
      isBuilderLiabilityPolicy: true,
      originalBLPolicy: blp
    } as ExtendedPolicyRequest));
  }, [builderLiabilityPolicies]);

  const filteredPolicies = Array.isArray(allPoliciesForDisplay)
    ? allPoliciesForDisplay.filter(policy => {
      // Tab filter
      const tabMatch = activeTab === 'all' ? true : policy.status === activeTab;

      // Search filter - Updated for insurance context
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery ||
        policy.contactDetails.fullName.toLowerCase().includes(searchLower) ||
        policy.contactDetails.email.toLowerCase().includes(searchLower) ||
        policy.contactDetails.phoneNumber.includes(searchQuery) ||
        policy.contactDetails.rcNumber?.toLowerCase().includes(searchLower) ||
        policy.policyNumber?.toLowerCase().includes(searchLower) ||
        policy._id.toLowerCase().includes(searchLower) ||
        policy.requestDetails.coverageType.toLowerCase().includes(searchLower) ||
        (policy.propertyDetails.fullAddress || policy.propertyDetails.address || '').toLowerCase().includes(searchLower) ||
        policy.adminNotes?.toLowerCase().includes(searchLower) ||
        policy.surveyNotes?.toLowerCase().includes(searchLower);

      // Insurance type filter (based on coverage type)
      const insuranceTypeMatch = !filters.insuranceType ||
        policy.requestDetails.coverageType.toLowerCase().includes(filters.insuranceType.toLowerCase());

      // Coverage type filter
      const coverageTypeMatch = !filters.coverageType ||
        policy.requestDetails.coverageType === filters.coverageType;

      // Value range filter (insurance sum)
      const minValueMatch = !filters.minValue ||
        policy.propertyDetails.buildingValue >= parseFloat(filters.minValue);
      const maxValueMatch = !filters.maxValue ||
        policy.propertyDetails.buildingValue <= parseFloat(filters.maxValue);

      // Date range filter
      const dateFromMatch = !filters.dateFrom ||
        new Date(policy.createdAt) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo ||
        new Date(policy.createdAt) <= new Date(filters.dateTo);

      // Priority filter
      const priorityMatch = !filters.priority ||
        policy.priority === filters.priority;

      // Claim status filter (same as policy status)
      const claimStatusMatch = !filters.claimStatus ||
        policy.status === filters.claimStatus;

      // Surveyor assigned filter
      const surveyorMatch = !filters.surveyorAssigned ||
        (policy.assignedSurveyors && policy.assignedSurveyors.includes(filters.surveyorAssigned));

      return tabMatch && searchMatch && insuranceTypeMatch && coverageTypeMatch &&
        minValueMatch && maxValueMatch && dateFromMatch && dateToMatch &&
        priorityMatch && claimStatusMatch && surveyorMatch;
    })
    : [];

  const clearFilters = () => {
    setFilters({
      insuranceType: "",
      coverageType: "",
      minValue: "",
      maxValue: "",
      dateFrom: "",
      dateTo: "",
      priority: "",
      claimStatus: "",
      surveyorAssigned: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v !== "");

  const handleReviewSubmission = async (decision: 'approved' | 'rejected' | 'revision_required') => {
    try {
      if (!selectedPolicy || selectedPolicySubmissions.length === 0) return;

      const submissionId = selectedPolicySubmissions[0]._id;

      await reviewSubmission(submissionId, decision as 'approved' | 'rejected', reviewNotes);
      setPolicies(prev =>
        prev.map(p =>
          p._id === selectedPolicy._id
            ? { ...p, status: decision as PolicyRequest['status'] }
            : p
        )
      );
      setShowReviewModal(false);
      setReviewNotes("");
      const actionText = decision === 'approved' ? 'approved' :
        decision === 'rejected' ? 'rejected' :
          'marked as requiring more information';
      toast.success(`Submission ${actionText} successfully!`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Failed to review submission: ${err.message}`);
    }
  };

  const handleSendToUser = async (policyId: string) => {
    if (!policyId) {
      toast.error('Invalid policy ID');
      return;
    }

    try {
      await adminApi.sendPolicyToUser(policyId);
      setPolicies(prev =>
        prev.map(p =>
          p._id === policyId
            ? { ...p, status: 'completed' as PolicyRequest['status'] }
            : p
        )
      );
      toast.success('Policy sent to user successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      toast.error(`Failed to send policy: ${err.message}`);
    }
  };


  const handleDeletePolicy = async (policy: MixedPolicy) => {
    try {
      // Type guard to check if it's a Builder Liability Policy
      if ('isBuilderLiabilityPolicy' in policy && policy.isBuilderLiabilityPolicy && policy.originalBLPolicy?._id) {
        await builderLiabilityPolicyAPI.deletePolicy(policy.originalBLPolicy._id);
        // Refresh Builder Liability Policies
        fetchBLPolicies();
      } else {
        // Handle legacy policy deletion
        await deletePolicyRequest(policy._id);
        setPolicies(prev => prev.filter(p => p._id !== policy._id));
      }

      setShowDeleteModal(false);
      setPolicyToDelete(null);
      toast.success('Policy deleted successfully!');
    } catch (error) {
      const errorMessage = (error as ApiErrorWithMessage).response?.data?.message || 'Failed to delete policy';
      toast.error(errorMessage);
    }
  };

  const getStatusBadge = (status: string) => {
    const badges = {
      submitted: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Submitted" },
      assigned: { color: "bg-blue-100 text-blue-800", icon: Users, text: "Assigned" },
      surveyed: { color: "bg-purple-100 text-purple-800", icon: Eye, text: "Surveyed" },
      approved: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Approved" },
      rejected: { color: "bg-red-100 text-red-800", icon: XCircle, text: "Rejected" },
      revision_required: { color: "bg-orange-100 text-orange-800", icon: Clock, text: "Requires More Info" },
      completed: { color: "bg-gray-100 text-gray-800", icon: CheckCircle, text: "Completed" },
      sent_to_user: { color: "bg-cyan-100 text-cyan-800", icon: CheckCircle, text: "Sent to User" }
    };

    const badge = badges[status as keyof typeof badges] || badges.submitted;
    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  return (
    <div className="space-y-5">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold text-slate-900">Insurance Policy Management</h2>
        
        {/* CSV Export Panel */}
        <ExportCsvPanel
          onExport={async (startDate, endDate) => {
            const csv = await exportAmmcPoliciesCsv(startDate, endDate);
            triggerCsvDownload(csv, 'ammc_policies.csv');
          }}
          buttonLabel="Export Policies CSV"
        />
      </div>

      {/* Filter bar */}
      <div className="flex flex-col gap-3 rounded-[1.5rem] border border-white/70 bg-white/90 p-4 shadow-[0_8px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl sm:flex-row sm:items-center">
        <div className="relative flex-1">
          <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="text"
            placeholder="Search by policy number, builder, email, RC number..."
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            className="w-full rounded-xl border border-slate-200 bg-slate-50/80 py-2.5 pl-9 pr-9 text-sm text-slate-700 placeholder-slate-400 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery("")}
              className="absolute right-3 top-1/2 transform -translate-y-1/2 text-slate-400 hover:text-slate-600"
            >
              <X className="h-4 w-4" />
            </button>
          )}
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center gap-1.5 rounded-xl border px-3 py-2.5 text-sm font-medium shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md ${
              showFilters || hasActiveFilters
                ? 'bg-emerald-50 text-emerald-700 border-emerald-200 hover:border-emerald-300'
                : 'bg-white text-slate-600 border-slate-200 hover:border-slate-300'
            }`}
          >
            <Filter className="h-4 w-4" />
            <span className="hidden sm:inline">Filters</span>
            {hasActiveFilters && !showFilters && (
              <span className="ml-1 flex h-4 w-4 items-center justify-center rounded-full bg-emerald-600 text-[10px] font-bold text-white">
                !
              </span>
            )}
          </button>

          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center gap-1.5 rounded-xl border border-red-200 bg-red-50 px-3 py-2.5 text-sm font-medium text-red-600 shadow-sm transition-all hover:-translate-y-0.5 hover:border-red-300 hover:shadow-md"
            >
              <X className="h-4 w-4" />
              <span className="hidden sm:inline">Clear</span>
            </button>
          )}
        </div>
      </div>

      {/* Advanced Filters Panel */}
      {showFilters && (
        <div className="rounded-[1.5rem] border border-white/70 bg-white/90 p-5 shadow-[0_8px_32px_rgba(15,23,42,0.05)] backdrop-blur-xl">
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Insurance Type</label>
              <select
                value={filters.insuranceType}
                onChange={(e) => setFilters({ ...filters, insuranceType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              >
                <option value="">All Insurance Types</option>
                <option value="Builder Liability">Builder Liability</option>
                <option value="Professional Indemnity">Professional Indemnity</option>
                <option value="Public Liability">Public Liability</option>
                <option value="Product Liability">Product Liability</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Coverage Type</label>
              <select
                value={filters.coverageType}
                onChange={(e) => setFilters({ ...filters, coverageType: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              >
                <option value="">All Coverage Types</option>
                <option value="Public Liability">Public Liability</option>
                <option value="Employer's Liability">Employer's Liability</option>
                <option value="Product Liability">Product Liability</option>
                <option value="Professional Indemnity">Professional Indemnity</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Priority</label>
              <select
                value={filters.priority}
                onChange={(e) => setFilters({ ...filters, priority: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              >
                <option value="">All Priorities</option>
                <option value="low">Low</option>
                <option value="medium">Medium</option>
                <option value="high">High</option>
                <option value="urgent">Urgent</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Status</label>
              <select
                value={filters.claimStatus}
                onChange={(e) => setFilters({ ...filters, claimStatus: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              >
                <option value="">All Statuses</option>
                <option value="submitted">Submitted</option>
                <option value="assigned">Assigned</option>
                <option value="surveyed">Surveyed</option>
                <option value="approved">Approved</option>
                <option value="rejected">Rejected</option>
                <option value="revision_required">Needs More Info</option>
                <option value="completed">Completed</option>
              </select>
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Min Insurance Value (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Max Insurance Value (₦)</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              />
            </div>
            <div>
              <label className="mb-1.5 block text-xs font-semibold text-slate-700">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full rounded-xl border border-slate-200 bg-white px-3 py-2 text-sm text-slate-700 focus:border-emerald-300 focus:outline-none focus:ring-2 focus:ring-emerald-200/60"
              />
            </div>
          </div>
        </div>
      )}

      {/* Tabs */}
      <div className="flex space-x-1 overflow-x-auto pb-2 scrollbar-hide">
        {[
          { key: 'all', label: 'All Policies', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.length : 0 },
          { key: 'submitted', label: 'New Apps', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'submitted').length : 0 },
          { key: 'assigned', label: 'Under Review', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'assigned').length : 0 },
          { key: 'surveyed', label: 'Survey Complete', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'surveyed').length : 0 },
          { key: 'revision_required', label: 'Pending Info', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'revision_required').length : 0 },
          { key: 'rejected', label: 'Declined', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'rejected').length : 0 }
        ].map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveTab(tab.key as typeof activeTab)}
            className={`flex shrink-0 items-center gap-2 rounded-full px-4 py-2 text-sm font-semibold transition-all ${
              activeTab === tab.key
                ? 'bg-[#028835] text-white shadow-md'
                : 'bg-white/60 text-slate-600 hover:bg-white'
            }`}
          >
            {tab.label}
            <span className={`flex h-5 w-5 items-center justify-center rounded-full text-[10px] ${
              activeTab === tab.key ? 'bg-white/20 text-white' : 'bg-slate-200 text-slate-600'
            }`}>
              {tab.count}
            </span>
          </button>
        ))}
      </div>

      {/* Policy list */}
      <div className="rounded-[1.5rem] border border-white/70 bg-white/90 shadow-[0_8px_32px_rgba(15,23,42,0.06)] backdrop-blur-xl">
        {filteredPolicies.length === 0 ? (
          <div className="flex flex-col items-center gap-3 py-16 text-center">
            <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-100">
              <Search className="h-6 w-6 text-slate-400" />
            </div>
            <div>
              <p className="text-sm font-semibold text-slate-700">No insurance policies found</p>
              <p className="mt-0.5 text-xs text-slate-400">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "No insurance applications have been submitted yet"}
              </p>
            </div>
            {hasActiveFilters && (
              <button
                onClick={clearFilters}
                className="mt-2 rounded-xl border border-emerald-200 bg-emerald-50 px-4 py-2 text-sm font-medium text-emerald-700 shadow-sm transition-all hover:-translate-y-0.5 hover:shadow-md"
              >
                Clear Filters
              </button>
            )}
          </div>
        ) : (
          <div className="divide-y divide-slate-100">
            {/* Table header */}
            <div className="hidden grid-cols-12 gap-4 px-6 py-4 md:grid">
              <p className="col-span-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Insurance Details</p>
              <p className="col-span-3 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Applicant/Builder</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Value</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400">Status</p>
              <p className="col-span-2 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-400 text-right">Actions</p>
            </div>

            {filteredPolicies?.map((policy) => {
              const statusCfg: Record<string, { label: string; dot: string; bg: string; border: string; text: string }> = {
                submitted:         { label: "Submitted",    dot: "bg-blue-400",   bg: "bg-blue-50",   border: "border-blue-200",   text: "text-blue-700"   },
                assigned:          { label: "Assigned",     dot: "bg-indigo-400", bg: "bg-indigo-50", border: "border-indigo-200", text: "text-indigo-700" },
                surveyed:          { label: "Surveyed",     dot: "bg-purple-400", bg: "bg-purple-50", border: "border-purple-200", text: "text-purple-700" },
                approved:          { label: "Approved",     dot: "bg-emerald-400",bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700"},
                completed:         { label: "Completed",    dot: "bg-emerald-400",bg: "bg-emerald-50",border: "border-emerald-200",text: "text-emerald-700"},
                sent_to_user:      { label: "Sent",         dot: "bg-cyan-400",   bg: "bg-cyan-50",   border: "border-cyan-200",   text: "text-cyan-700"   },
                rejected:          { label: "Rejected",     dot: "bg-red-400",    bg: "bg-red-50",    border: "border-red-200",    text: "text-red-700"    },
                revision_required: { label: "Needs Info",   dot: "bg-orange-400", bg: "bg-orange-50", border: "border-orange-200", text: "text-orange-700" }
              };
              const cfg = statusCfg[getPolicyStatus(policy)] ?? statusCfg.submitted;

              return (
                <div key={policy._id} className="grid grid-cols-1 md:grid-cols-12 items-center gap-4 px-6 py-5 transition-colors hover:bg-slate-50/70">
                  
                  {/* Insurance Details */}
                  <div className="col-span-3 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-900">{policy.requestDetails.coverageType}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">
                      Policy #{policy.policyNumber || policy._id.substring(0, 8)}
                    </p>
                    <p className="mt-1 truncate text-xs text-slate-400 max-w-xs">{policy.propertyDetails.fullAddress || policy.propertyDetails.address}</p>
                  </div>

                  {/* Applicant */}
                  <div className="col-span-3 min-w-0">
                    <p className="truncate text-sm font-semibold text-slate-800">{policy.contactDetails.fullName}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{policy.contactDetails.email}</p>
                    <div className="mt-1 flex items-center gap-2">
                      <p className="truncate text-xs text-slate-400">{policy.contactDetails.phoneNumber}</p>
                      {policy.contactDetails.rcNumber && (
                        <span className="rounded-md bg-slate-100 px-1.5 py-0.5 text-[10px] font-semibold text-slate-500">RC: {policy.contactDetails.rcNumber}</span>
                      )}
                    </div>
                  </div>

                  {/* Value */}
                  <div className="col-span-2 min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">₦{policy.propertyDetails.buildingValue.toLocaleString()}</p>
                    <p className="mt-0.5 truncate text-xs text-slate-500">{policy.requestDetails.policyDuration}</p>
                    <p className="mt-1 truncate text-[10px] text-slate-400">{new Date(policy.createdAt).toLocaleDateString('en-NG')}</p>
                  </div>

                  {/* Status */}
                  <div className="col-span-2">
                    <span className={`inline-flex items-center gap-1.5 rounded-full border px-2.5 py-1 text-xs font-semibold ${cfg.bg} ${cfg.border} ${cfg.text}`}>
                      <span className={`h-1.5 w-1.5 rounded-full ${cfg.dot}`} />
                      {cfg.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="col-span-2 flex justify-end gap-2 relative dropdown-container">
                    <button
                      onClick={() => {
                        if ((policy as any).isBuilderLiabilityPolicy && (policy as any).originalBLPolicy) {
                          setSelectedBLPolicy((policy as ExtendedPolicyRequest).originalBLPolicy as BuilderLiabilityPolicy);
                          setShowBLPolicyModal(true);
                        } else {
                          setSelectedPolicy(policy);
                          setShowDetailsModal(true);
                        }
                      }}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
                      title="View Details"
                    >
                      <Eye className="h-4 w-4" />
                    </button>

                    <button
                      onClick={() => setShowActionsDropdown(showActionsDropdown === policy._id ? null : policy._id)}
                      className="flex h-8 w-8 items-center justify-center rounded-xl border border-slate-200 bg-white text-slate-400 shadow-sm transition-all hover:-translate-y-0.5 hover:border-emerald-200 hover:text-emerald-700 hover:shadow-md"
                      title="More Actions"
                    >
                      <MoreVertical className="h-4 w-4" />
                    </button>

                    {showActionsDropdown === policy._id && (
                      <div className="absolute right-0 top-10 z-[60] w-48 rounded-xl border border-slate-200 bg-white/95 p-1.5 shadow-[0_8px_32px_rgba(15,23,42,0.12)] backdrop-blur-xl">
                        {getPolicyStatus(policy) === 'submitted' && (
                          <button
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowAssignModal(true);
                              setShowActionsDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Users className="h-4 w-4" /> Assign Surveyor
                          </button>
                        )}
                        
                        {(getPolicyStatus(policy) === 'assigned' || getPolicyStatus(policy) === 'submitted') && (
                          <button
                            onClick={() => {
                              setSelectedPolicy(policy);
                              setShowAssignModal(true);
                              setShowActionsDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <UserPlus className="h-4 w-4" /> Reassign Surveyor
                          </button>
                        )}

                        {getPolicyStatus(policy) === 'surveyed' && (
                          <button
                            onClick={async () => {
                              setSelectedPolicy(policy);
                              const response = await adminApi.getSurveySubmissions({ policyId: policy._id });
                              setSelectedPolicySubmissions(response.data.submissions);
                              setShowReviewModal(true);
                              setShowActionsDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <Eye className="h-4 w-4" /> Review Survey
                          </button>
                        )}

                        {getPolicyStatus(policy) === 'completed' && (
                          <button
                            onClick={() => {
                              if (policy._id) handleSendToUser(policy._id);
                              setShowActionsDropdown(null);
                            }}
                            className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-slate-700 transition-colors hover:bg-emerald-50 hover:text-emerald-700"
                          >
                            <CheckCircle className="h-4 w-4" /> Send to User
                          </button>
                        )}

                        <button
                          onClick={() => {
                            setPolicyToDelete(policy);
                            setShowDeleteModal(true);
                            setShowActionsDropdown(null);
                          }}
                          className="flex w-full items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium text-red-600 transition-colors hover:bg-red-50"
                        >
                          <Trash2 className="h-4 w-4" /> Delete Policy
                        </button>
                      </div>
                    )}
                  </div>

                </div>
              );
            })}
          </div>
        )}
      </div>

      <div className="flex items-center justify-between px-2 text-sm text-slate-500">
        <p>Showing <span className="font-semibold text-slate-900">{filteredPolicies.length}</span> of <span className="font-semibold text-slate-900">{allPoliciesForDisplay.length}</span> policies</p>
      </div>

      {/* Assign Surveyor Modal */}
      {showAssignModal && (
        <AssignSurveyorModal
          show={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedPolicy={selectedPolicy ? toPolicyRequest(selectedPolicy) : null}
          isReassign={selectedPolicy ? getPolicyStatus(selectedPolicy) === 'assigned' : false}
          onAssignmentCreated={fetchPoliciesAndSurveyors}
          onAssignmentReassigned={fetchPoliciesAndSurveyors}
        />
      )}

      {/* Review Modal */}
      {showReviewModal && selectedPolicy && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-md max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Review Survey Submission</h3>
              <button
                onClick={() => {
                  setShowReviewModal(false);
                  setDocumentUrl(null);
                }}
                className="text-gray-400 hover:text-gray-600"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            <div className="p-6">
              {selectedPolicy && (
                <div className="mb-4">
                  <h4 className="font-medium">Policy: {selectedPolicy.propertyDetails.propertyType}</h4>
                  <p className="text-sm text-gray-600">Owner: {selectedPolicy.contactDetails.fullName}</p>
                  {selectedPolicy.surveyDocument && (
                    <button
                      onClick={() => selectedPolicy.surveyDocument && handleFetchDocumentUrl(selectedPolicy.surveyDocument)}
                      className="mt-2 text-blue-600 hover:text-blue-800 text-sm"
                    >
                      View Survey Document
                    </button>
                  )}
                  {documentUrl && (
                    <iframe src={documentUrl} className="w-full h-64 mt-2 border rounded" />
                  )}
                </div>
              )}

              {selectedPolicy && (
                <div className="mb-4">
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Review Notes
                  </label>
                  <textarea
                    value={reviewNotes}
                    onChange={(e) => setReviewNotes(e.target.value)}
                    className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    rows={4}
                    placeholder="Add your review notes here..."
                  />
                </div>
              )}

              <div className="flex space-x-3">
                <button
                  onClick={() => handleReviewSubmission('approved')}
                  className="flex-1 bg-green-600 text-white py-2 px-4 rounded-lg hover:bg-green-700 transition-colors"
                >
                  Approve
                </button>
                <button
                  onClick={() => handleReviewSubmission('rejected')}
                  className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
                >
                  Reject
                </button>
                <button
                  onClick={() => handleReviewSubmission('revision_required')}
                  className="flex-1 bg-yellow-600 text-white py-2 px-4 rounded-lg hover:bg-yellow-700 transition-colors"
                >
                  Request More Info
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && policyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-semibold mb-4">Confirm Deletion</h3>
            <p className="text-gray-600 mb-6">
              Are you sure you want to delete this policy? This action cannot be undone.
            </p>
            <div className="flex space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPolicyToDelete(null);
                }}
                className="flex-1 bg-gray-200 text-gray-800 py-2 px-4 rounded-lg hover:bg-gray-300 transition-colors"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeletePolicy(policyToDelete)}
                className="flex-1 bg-red-600 text-white py-2 px-4 rounded-lg hover:bg-red-700 transition-colors"
              >
                Delete
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Policy Details Modal */}
      {showDetailsModal && selectedPolicy && (
        <LegacyPolicyDetailsModal
          policy={toPolicyRequest(selectedPolicy)}
          getStatusBadge={getStatusBadge}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}

      {/* Builder Liability Policy Details Modal */}
      {showBLPolicyModal && selectedBLPolicy && (
        <PolicyDetailsModal
          policy={selectedBLPolicy}
          isOpen={showBLPolicyModal}
          onClose={() => {
            setShowBLPolicyModal(false);
            setSelectedBLPolicy(null);
          }}
        />
      )}
    </div>
  );
};

// Legacy Policy Details Modal Component
interface LegacyPolicyDetailsModalProps {
  policy: PolicyRequest;
  getStatusBadge: (status: string) => JSX.Element;
  onClose: () => void;
}

const LegacyPolicyDetailsModal: React.FC<LegacyPolicyDetailsModalProps> = ({ policy, getStatusBadge, onClose }) => {
  const [activeTab, setActiveTab] = useState<'details' | 'survey' | 'documents'>('details');
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [surveyData, setSurveyData] = useState<EnhancedSurveySubmission | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      try {
        // Fetch assignment data
        const assignmentResponse = await adminApi.getAssignmentByPolicyId(policy._id);
        if (assignmentResponse?.success && assignmentResponse?.data) {
          setAssignmentData(assignmentResponse.data);
        }

        // Fetch survey data if policy is surveyed
        if (['surveyed', 'approved', 'rejected', 'revision_required'].includes(policy.status)) {
          const submissionResponse = await getSubmissionByAssignment(policy._id);
          if (submissionResponse?.success && submissionResponse?.data) {
            setSurveyData(submissionResponse.data);
          }
        }
      } catch (error) {
      } finally {
        setLoading(false);
      }
    };

    fetchData();
  }, [policy._id, policy.status]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Policy Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Policy #{policy._id} â€¢ {policy.propertyDetails.propertyType}
              </p>
            </div>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-gray-600 transition-colors"
            >
              <span className="sr-only">Close</span>
              <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
          <div className="flex items-center space-x-4 mt-4">
            <div className="flex items-center space-x-2">
              {getStatusBadge(getPolicyStatus(policy))}
            </div>
            <div className="text-sm text-gray-600">
              <span className="font-medium">Submitted:</span> {new Date(policy.createdAt).toLocaleDateString()}
            </div>
          </div>
        </div>

        {/* Tab Navigation */}
        <div className="border-b border-gray-200">
          <div className="flex space-x-1 px-6">
            {(['details', 'survey', 'documents'] as const).map((tab) => (
              <button
                key={tab}
                onClick={() => setActiveTab(tab)}
                className={`py-3 px-4 rounded-t-lg font-medium text-sm transition-colors ${activeTab === tab
                  ? 'bg-white text-blue-600 border-b-2 border-blue-600'
                  : 'bg-gray-50 text-gray-500 hover:text-gray-700 hover:bg-gray-100'
                  }`}
              >
                {tab === 'survey' ? 'Survey Results' : tab.charAt(0).toUpperCase() + tab.slice(1)}
              </button>
            ))}
          </div>
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          <div className="space-y-6">
            <div className="text-center py-8 text-gray-500">
              <p>Policy details will be displayed here</p>
              <p className="text-sm">This is a placeholder for the policy details view.</p>
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-between">
            <div className="text-sm text-gray-600">
              Policy ID: {policy._id}
            </div>
            <button
              onClick={onClose}
              className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
            >
              Close
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default PolicyManagement;
