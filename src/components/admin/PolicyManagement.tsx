
"use client";

import React, { useState, useEffect } from 'react';
import { Eye, Users, Calendar, CheckCircle, XCircle, Clock, Trash2, MoreVertical, DollarSign, Search, Filter, X } from 'lucide-react';
import { Surveyor, EnhancedSurveySubmission, Assignment } from '@/types/api.types';
import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { useBuilderLiabilityPolicies } from '@/hooks/useBuilderLiabilityPolicy';
import { adminApi, reviewSubmission, getSubmissionByAssignment } from '@/services/api';
import { useAuth } from '@/context/useAuth';
import { useRouter } from 'next/navigation';
import AssignSurveyorModal from './AssignSurveyorModal';
import { PolicyDetailsModal } from '@/components/builderLiability/PolicyDetailsModal';

// Legacy imports for backward compatibility during transition
import { PolicyRequest } from '@/types/api.types';
import { deletePolicyRequest } from '@/services/api';

// Union type for handling both legacy and new policy types
type MixedPolicy = PolicyRequest;

// Type guard functions
const isBuilderLiabilityPolicy = (policy: PolicyRequest): policy is PolicyRequest & {
  isBuilderLiabilityPolicy: true;
  originalBLPolicy: BuilderLiabilityPolicy;
} => {
  return policy.isBuilderLiabilityPolicy === true;
};

const getPolicyStatus = (policy: PolicyRequest): string => {
  return policy.status || 'unknown';
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
  const [selectedPolicy, setSelectedPolicy] = useState<PolicyRequest | null>(null);
  const [showAssignModal, setShowAssignModal] = useState(false);
  const [showReviewModal, setShowReviewModal] = useState(false);
  const [reviewNotes, setReviewNotes] = useState("");
  const [selectedPolicySubmissions, setSelectedPolicySubmissions] = useState<EnhancedSurveySubmission[]>([]);
  const [activeTab, setActiveTab] = useState<'all' | 'submitted' | 'assigned' | 'surveyed' | 'revision_required' | 'rejected'>('all');
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [policyToDelete, setPolicyToDelete] = useState<PolicyRequest | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);
  const [showDetailsModal, setShowDetailsModal] = useState(false);

  // New state for Builder Liability Policies
  const [selectedBLPolicy, setSelectedBLPolicy] = useState<BuilderLiabilityPolicy | null>(null);
  const [showBLPolicyModal, setShowBLPolicyModal] = useState(false);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "",
    coverageType: "",
    minValue: "",
    maxValue: "",
    dateFrom: "",
    dateTo: "",
    plotNumber: "",
    cadastralZone: "",
    district: ""
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
      // Fetch surveyors and Builder Liability Policies only
      const surveyorsResponse = await adminApi.getSurveyors();
      setSurveyors(surveyorsResponse.data);

      // Fetch Builder Liability Policies
      fetchBLPolicies();
    } catch (error) {
      console.error('Failed to fetch policies and surveyors:', error);
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
        propertyType: `Builder Liability - ${blp.builder?.nameOfBuilder || 'Unknown'}`,
        address: blp.builder?.address || '',
        buildingValue: blp.project?.totalEstimateSum || 0,
        plotNumber: '',
        cadastralZone: '',
        district: '',
        fullAddress: blp.builder?.address || '',
        yearBuilt: 0,
        squareFootage: 0,
        constructionMaterial: ''
      },
      contactDetails: {
        fullName: blp.builder?.nameOfBuilder || '',
        email: blp.builder?.customerEmail || '',
        phoneNumber: blp.builder?.telNo || '',
        alternatePhone: '',
        rcNumber: blp.builder?.rcNumber || ''
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
    } as PolicyRequest));
  }, [builderLiabilityPolicies]);

  const filteredPolicies = Array.isArray(allPoliciesForDisplay)
    ? allPoliciesForDisplay.filter(policy => {
      // Tab filter
      const tabMatch = activeTab === 'all' ? true : policy.status === activeTab;

      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery ||
        policy.propertyDetails.propertyType.toLowerCase().includes(searchLower) ||
        (policy.propertyDetails.fullAddress || policy.propertyDetails.address || '').toLowerCase().includes(searchLower) ||
        (policy.propertyDetails.plotNumber || '').toLowerCase().includes(searchLower) ||
        (policy.propertyDetails.cadastralZone || '').toLowerCase().includes(searchLower) ||
        (policy.propertyDetails.district || '').toLowerCase().includes(searchLower) ||
        policy.contactDetails.fullName.toLowerCase().includes(searchLower) ||
        policy.contactDetails.email.toLowerCase().includes(searchLower) ||
        policy.contactDetails.phoneNumber.includes(searchQuery) ||
        policy._id.toLowerCase().includes(searchLower);

      // Property type filter
      const propertyTypeMatch = !filters.propertyType ||
        policy.propertyDetails.propertyType === filters.propertyType;

      // Coverage type filter
      const coverageTypeMatch = !filters.coverageType ||
        policy.requestDetails.coverageType === filters.coverageType;

      // Value range filter
      const minValueMatch = !filters.minValue ||
        policy.propertyDetails.buildingValue >= parseFloat(filters.minValue);
      const maxValueMatch = !filters.maxValue ||
        policy.propertyDetails.buildingValue <= parseFloat(filters.maxValue);

      // Date range filter
      const dateFromMatch = !filters.dateFrom ||
        new Date(policy.createdAt) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo ||
        new Date(policy.createdAt) <= new Date(filters.dateTo);

      // Location filters
      const plotNumberMatch = !filters.plotNumber ||
        (policy.propertyDetails.plotNumber || '').toLowerCase().includes(filters.plotNumber.toLowerCase());
      const cadastralZoneMatch = !filters.cadastralZone ||
        (policy.propertyDetails.cadastralZone || '').toLowerCase().includes(filters.cadastralZone.toLowerCase());
      const districtMatch = !filters.district ||
        (policy.propertyDetails.district || '').toLowerCase().includes(filters.district.toLowerCase());

      return tabMatch && searchMatch && propertyTypeMatch && coverageTypeMatch &&
        minValueMatch && maxValueMatch && dateFromMatch && dateToMatch &&
        plotNumberMatch && cadastralZoneMatch && districtMatch;
    })
    : [];

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      coverageType: "",
      minValue: "",
      maxValue: "",
      dateFrom: "",
      dateTo: "",
      plotNumber: "",
      cadastralZone: "",
      district: ""
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
      alert(`Submission ${actionText} successfully!`);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to review submission: ${err.message}`);
    }
  };

  const handleSendToUser = async (ammcId: string) => {
    try {
      await adminApi.sendPolicyToUser(ammcId);
      setPolicies(prev =>
        prev.map(p =>
          p._id === ammcId
            ? { ...p, status: 'completed' as PolicyRequest['status'] }
            : p
        )
      );
      alert('Policy sent to user successfully!');
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to send policy: ${err.message}`);
    }
  };

  const handleConfirmPayment = async (policy: PolicyRequest) => {
    const confirmed = window.confirm(
      `Confirm payment received for policy:\n\n` +
      `Property: ${policy.propertyDetails.propertyType}\n` +
      `Owner: ${policy.contactDetails.fullName}\n` +
      `Value: ₦${policy.propertyDetails.buildingValue.toLocaleString()}\n\n` +
      `This will mark the policy as COMPLETED and finalize the workflow.`
    );

    if (!confirmed) return;

    try {
      const { builderLiabilityPolicyAPI } = await import('@/services/api');
      await builderLiabilityPolicyAPI.updatePolicy(policy._id, {
        status: 'completed',
        adminNotes: `Payment confirmed on ${new Date().toLocaleDateString()}`
      });

      setPolicies(prev =>
        prev.map(p =>
          p._id === policy._id
            ? { ...p, status: 'completed' as PolicyRequest['status'] }
            : p
        )
      );

      alert('Payment confirmed! Policy marked as completed.');
    } catch (error) {
      console.error('Failed to confirm payment:', error);
      const err = error instanceof Error ? error : new Error('Unknown error');
      alert(`Failed to confirm payment: ${err.message}`);
    }
  };

  const handleDeletePolicy = async (policy: MixedPolicy) => {
    try {
      // Type guard to check if it's a Builder Liability Policy
      if ('isBuilderLiabilityPolicy' in policy && policy.isBuilderLiabilityPolicy && policy.originalBLPolicy) {
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
      alert('Policy deleted successfully!');
    } catch (error) {
      console.error('Delete policy error:', error);
      alert('Failed to delete policy');
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
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <h2 className="text-2xl font-bold">Policy Management</h2>
      </div>

      {/* Search and Filter Bar */}
      <div className="bg-white border border-gray-200 rounded-lg p-4 space-y-4">
        <div className="flex flex-col sm:flex-row gap-3">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by plot, zone, district, address, builder, email, phone, or policy ID..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
            />
            {searchQuery && (
              <button
                onClick={() => setSearchQuery("")}
                className="absolute right-3 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
              >
                <X className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Filter Toggle Button */}
          <button
            onClick={() => setShowFilters(!showFilters)}
            className={`flex items-center px-4 py-2 border rounded-lg transition-colors ${showFilters || hasActiveFilters
              ? 'bg-[#028835] text-white border-[#028835]'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="ml-2 bg-white text-[#028835] rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
                !
              </span>
            )}
          </button>

          {/* Clear Filters Button */}
          {hasActiveFilters && (
            <button
              onClick={clearFilters}
              className="flex items-center px-4 py-2 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-colors"
            >
              <X className="h-4 w-4 mr-2" />
              Clear
            </button>
          )}
        </div>

        {/* Advanced Filters Panel */}
        {showFilters && (
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
            {/* Property Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
              <select
                value={filters.propertyType}
                onChange={(e) => setFilters({ ...filters, propertyType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
                <option value="Mixed-Use">Mixed-Use</option>
              </select>
            </div>

            {/* Coverage Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
              <select
                value={filters.coverageType}
                onChange={(e) => setFilters({ ...filters, coverageType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              >
                <option value="">All Coverage</option>
                <option value="Basic">Basic</option>
                <option value="Standard">Standard</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Premium">Premium</option>
              </select>
            </div>

            {/* Min Value Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* Max Value Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Max Value (₦)</label>
              <input
                type="number"
                placeholder="∞"
                value={filters.maxValue}
                onChange={(e) => setFilters({ ...filters, maxValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* Plot Number Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Plot Number</label>
              <input
                type="text"
                placeholder="Search plot number"
                value={filters.plotNumber}
                onChange={(e) => setFilters({ ...filters, plotNumber: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* Cadastral Zone Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Cadastral Zone</label>
              <input
                type="text"
                placeholder="Search cadastral zone"
                value={filters.cadastralZone}
                onChange={(e) => setFilters({ ...filters, cadastralZone: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>

            {/* District Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
              <input
                type="text"
                placeholder="Search district"
                value={filters.district}
                onChange={(e) => setFilters({ ...filters, district: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-2 border-t border-gray-200">
          <span>
            Showing <span className="font-semibold text-gray-900">{filteredPolicies.length}</span> of{' '}
            <span className="font-semibold text-gray-900">{allPoliciesForDisplay.length}</span> policies
          </span>
          {hasActiveFilters && (
            <span className="text-[#028835] font-medium">Filters active</span>
          )}
        </div>
      </div>

      <div className="border-b border-gray-200">
        <nav className="-mb-px flex space-x-8">
          {[
            { key: 'all', label: 'All Policies', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.length : 0 },
            { key: 'submitted', label: 'Submitted', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'submitted').length : 0 },
            { key: 'assigned', label: 'Assigned', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'assigned').length : 0 },
            { key: 'surveyed', label: 'Surveyed', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'surveyed').length : 0 },
            { key: 'revision_required', label: 'Needs More Info', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'revision_required').length : 0 },
            { key: 'rejected', label: 'Rejected', count: Array.isArray(allPoliciesForDisplay) ? allPoliciesForDisplay.filter(p => p?.status === 'rejected').length : 0 }
          ].map(tab => (
            <button
              key={tab.key}
              onClick={() => setActiveTab(tab.key as typeof activeTab)}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeTab === tab.key
                ? 'border-[#028835] text-[#028835]'
                : 'border-transparent text-gray-500 hover:text-gray-700'
                }`}
            >
              {tab.label}
              <span className="ml-2 bg-gray-100 text-gray-900 py-0.5 px-2 rounded-full text-xs">
                {tab.count}
              </span>
            </button>
          ))}
        </nav>
      </div>

      <div className="bg-white shadow-sm border border-gray-200 rounded-lg overflow-hidden">
        <div className="overflow-x-auto">
          <table className="min-w-full divide-y divide-gray-200">
            <thead className="bg-gray-50">
              <tr>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Property Details</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Builder/Contractor</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Coverage</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Status</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Date</th>
                <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">Actions</th>
              </tr>
            </thead>
            <tbody className="bg-white divide-y divide-gray-200">
              {filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="px-6 py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-lg font-medium">No policies found</p>
                      <p className="text-sm mt-1">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "No policies have been submitted yet"}
                      </p>
                      {hasActiveFilters && (
                        <button
                          onClick={clearFilters}
                          className="mt-4 px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors"
                        >
                          Clear Filters
                        </button>
                      )}
                    </div>
                  </td>
                </tr>
              ) : (
                filteredPolicies?.map((policy) => (
                  <tr key={policy._id} className="hover:bg-gray-50">
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{policy.propertyDetails.propertyType}</p>
                        {policy.propertyDetails.plotNumber && (
                          <p className="text-xs text-gray-600">
                            Plot: {policy.propertyDetails.plotNumber} | Zone: {policy.propertyDetails.cadastralZone} | {policy.propertyDetails.district}
                          </p>
                        )}
                        <p className="text-sm text-gray-500 truncate max-w-xs">{policy.propertyDetails.fullAddress || policy.propertyDetails.address}</p>
                        <p className="text-xs text-gray-400">₦{policy.propertyDetails.buildingValue.toLocaleString()}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900 truncate max-w-xs">{policy.contactDetails.fullName}</p>
                        <p className="text-sm text-gray-500">{policy.contactDetails.email}</p>
                        <p className="text-sm text-gray-500">{policy.contactDetails.phoneNumber}</p>
                        <p className="text-xs text-gray-400">RC: {policy.contactDetails.rcNumber || 'N/A'}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">
                      <div>
                        <p className="text-sm font-medium text-gray-900">{policy.requestDetails.coverageType}</p>
                        <p className="text-sm text-gray-500">{policy.requestDetails.policyDuration}</p>
                      </div>
                    </td>
                    <td className="px-6 py-4">{getStatusBadge(getPolicyStatus(policy))}</td>
                    <td className="px-6 py-4 text-sm text-gray-500">{new Date(policy.createdAt).toLocaleDateString()}</td>
                    <td className="px-6 py-4 text-sm font-medium">
                      <div className="relative dropdown-container">
                        <button
                          onClick={() => setShowActionsDropdown(showActionsDropdown === policy._id ? null : policy._id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {showActionsDropdown === policy._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              <button
                                onClick={() => {
                                  setSelectedPolicy(policy);
                                  setShowDetailsModal(true);
                                  setShowActionsDropdown(null);
                                }}
                                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                              >
                                <Eye className="mr-3 h-4 w-4" />
                                View Details
                              </button>
                              {policy.status === 'submitted' && (
                                <button
                                  onClick={() => {
                                    setSelectedPolicy(policy);
                                    setShowAssignModal(true);
                                    setShowActionsDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                                >
                                  <Users className="mr-3 h-4 w-4" />
                                  Assign Surveyor
                                </button>
                              )}
                              {policy.status === 'surveyed' && (
                                <button
                                  onClick={async () => {
                                    setSelectedPolicy(policy);
                                    const response = await adminApi.getSurveySubmissions({ ammcId: policy._id });
                                    setSelectedPolicySubmissions(response.data.submissions);
                                    setShowReviewModal(true);
                                    setShowActionsDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-purple-600 hover:bg-purple-50 w-full text-left"
                                >
                                  <CheckCircle className="mr-3 h-4 w-4" />
                                  Review Submission
                                </button>
                              )}
                              {policy.status === 'approved' && (
                                <>
                                  <button
                                    onClick={() => {
                                      handleSendToUser(policy._id);
                                      setShowActionsDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-green-600 hover:bg-green-50 w-full text-left"
                                  >
                                    <CheckCircle className="mr-3 h-4 w-4" />
                                    Send to User
                                  </button>
                                  <button
                                    onClick={() => {
                                      handleConfirmPayment(policy);
                                      setShowActionsDropdown(null);
                                    }}
                                    className="flex items-center px-4 py-2 text-sm text-emerald-600 hover:bg-emerald-50 w-full text-left"
                                  >
                                    <DollarSign className="mr-3 h-4 w-4" />
                                    Confirm Payment
                                  </button>
                                </>
                              )}
                              {['submitted', 'assigned', 'rejected'].includes(getPolicyStatus(policy)) && (
                                <button
                                  onClick={() => {
                                    setPolicyToDelete(policy);
                                    setShowDeleteModal(true);
                                    setShowActionsDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Delete Policy
                                </button>
                              )}
                            </div>
                          </div>
                        )}
                      </div>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {showAssignModal && (
        <AssignSurveyorModal
          show={showAssignModal}
          onClose={() => setShowAssignModal(false)}
          selectedPolicy={selectedPolicy}
          onAssignmentCreated={fetchPoliciesAndSurveyors}
          onAssignmentReassigned={fetchPoliciesAndSurveyors}
        />
      )}

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
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              {selectedPolicy.surveyDocument && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Survey Document</label>
                  {!documentUrl && (
                    <button onClick={() => selectedPolicy.surveyDocument && handleFetchDocumentUrl(selectedPolicy.surveyDocument)} className="text-blue-600 hover:text-blue-800">Show Document</button>
                  )}
                  {documentUrl && (
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer" className="text-blue-600 hover:text-blue-800">View Document</a>
                  )}
                </div>
              )}

              {selectedPolicy.surveyNotes && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Surveyor Notes</label>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">{selectedPolicy.surveyNotes}</p>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Review Notes</label>
                <textarea
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Add your review notes..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button onClick={() => setShowReviewModal(false)} className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50">Cancel</button>
                <button
                  onClick={() => {
                    if (!reviewNotes) {
                      alert('Please provide feedback in the review notes when rejecting a submission.');
                      return;
                    }
                    handleReviewSubmission('rejected');
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Reject
                </button>
                <button
                  onClick={() => {
                    if (!reviewNotes) {
                      alert('Please provide feedback in the review notes when requesting more information.');
                      return;
                    }
                    handleReviewSubmission('revision_required');
                  }}
                  className="px-4 py-2 bg-orange-600 text-white rounded-md hover:bg-orange-700"
                >
                  Request More Info
                </button>
                <button onClick={() => handleReviewSubmission('approved')} className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700">Approve</button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation Modal */}
      {showDeleteModal && policyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <div className="flex items-center mb-4">
              <div className="mx-auto flex-shrink-0 flex items-center justify-center h-12 w-12 rounded-full bg-red-100">
                <Trash2 className="h-6 w-6 text-red-600" />
              </div>
            </div>
            <div className="text-center">
              <h3 className="text-lg font-medium text-gray-900 mb-2">Delete Policy Request</h3>
              <p className="text-sm text-gray-500 mb-4">
                Are you sure you want to delete the policy request for "{policyToDelete.propertyDetails.address}"? This action cannot be undone.
              </p>
              <div className="flex justify-center space-x-4">
                <button
                  onClick={() => {
                    setShowDeleteModal(false);
                    setPolicyToDelete(null);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={() => handleDeletePolicy(policyToDelete)}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete Policy
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Policy Details Modal */}
      {showDetailsModal && selectedPolicy && isBuilderLiabilityPolicy(selectedPolicy) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[90vh] overflow-y-auto">
            {/* Import and use the Builder Liability Policy Details Modal */}
            <PolicyDetailsModal
              policy={selectedPolicy.originalBLPolicy}
              isOpen={true}
              onClose={() => {
                setShowDetailsModal(false);
                setSelectedPolicy(null);
              }}
            />
          </div>
        </div>
      )}

      {/* Legacy Policy Details Modal - for non-Builder Liability policies */}
      {showDetailsModal && selectedPolicy && !isBuilderLiabilityPolicy(selectedPolicy) && (
        <LegacyPolicyDetailsModal
          policy={selectedPolicy}
          getStatusBadge={getStatusBadge}
          onClose={() => {
            setShowDetailsModal(false);
            setSelectedPolicy(null);
          }}
        />
      )}
    </div>
  );
};

// Legacy Policy Details Modal Component
interface LegacyPolicyDetailsModalProps {
  policy: MixedPolicy;
  getStatusBadge: (status: string) => JSX.Element;
  onClose: () => void;
}

const LegacyPolicyDetailsModal: React.FC<LegacyPolicyDetailsModalProps> = ({ policy, getStatusBadge, onClose }) => {
  const [surveyData, setSurveyData] = useState<EnhancedSurveySubmission | null>(null);
  const [assignmentData, setAssignmentData] = useState<Assignment | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState<'details' | 'survey' | 'documents'>('details');

  useEffect(() => {
    const fetchPolicyData = async () => {
      setLoading(true);
      try {
        // If policy has been surveyed, fetch survey data
        if (policy.status === 'surveyed' || policy.status === 'approved' || policy.status === 'rejected' || policy.status === 'revision_required') {
          console.log('Fetching survey data for policy:', policy._id);

          // First get the assignment for this policy
          const assignmentResponse = await adminApi.getAssignmentByAmmcId(policy._id);
          console.log('Assignment response:', assignmentResponse);

          if (assignmentResponse.success && assignmentResponse.data) {
            const assignment = assignmentResponse.data;
            setAssignmentData(assignment);

            // Then get the survey submission using the assignment ID
            const surveyResponse = await getSubmissionByAssignment(assignment._id);
            console.log('Survey submission response:', surveyResponse);

            if (surveyResponse.success && surveyResponse.data) {
              // Handle both possible response structures
              const submission = surveyResponse.data.submission || surveyResponse.data;
              console.log('Setting survey data:', submission);
              setSurveyData(submission);
            } else {
              console.log('No survey submission found');
            }
          } else {
            console.log('No assignment found for policy');
          }
        }
      } catch (error) {
        console.error('Failed to fetch policy data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicyData();
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
                Policy #{policy._id} • {policy.propertyDetails.propertyType}
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
          {activeTab === 'details' && (
            <PolicyDetailsTab policy={policy} assignmentData={assignmentData} />
          )}

          {activeTab === 'survey' && (
            <PolicySurveyTab
              policy={policy}
              surveyData={surveyData}
              loading={loading}
            />
          )}

          {activeTab === 'documents' && (
            <PolicyDocumentsTab
              policy={policy}
              surveyData={surveyData}
              loading={loading}
            />
          )}
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

// Policy Details Tab
const PolicyDetailsTab: React.FC<{ policy: PolicyRequest; assignmentData: Assignment | null }> = ({
  policy,
  assignmentData
}) => (
  <div className="space-y-6">
    {/* Property Information */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Property Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Type:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.propertyType}</span>
          </div>
          {policy.propertyDetails.plotNumber && (
            <>
              <div className="flex justify-between">
                <span className="text-gray-600">Plot Number:</span>
                <span className="font-medium text-gray-900">{policy.propertyDetails.plotNumber}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">Cadastral Zone:</span>
                <span className="font-medium text-gray-900">{policy.propertyDetails.cadastralZone}</span>
              </div>
              <div className="flex justify-between">
                <span className="text-gray-600">District:</span>
                <span className="font-medium text-gray-900">{policy.propertyDetails.district}</span>
              </div>
            </>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">Value:</span>
            <span className="font-medium text-gray-900">₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Year Built:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.yearBuilt || 'N/A'}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Square Footage:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.squareFootage?.toLocaleString() || 'N/A'} sq ft</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Construction:</span>
            <span className="font-medium text-gray-900">{policy.propertyDetails.constructionMaterial || 'N/A'}</span>
          </div>
        </div>
        <div className="mt-3">
          <span className="text-gray-600 text-sm">Full Address:</span>
          <p className="text-sm text-gray-900 mt-1">{policy.propertyDetails.fullAddress || policy.propertyDetails.address}</p>
        </div>
      </div>

      <div>
        <h4 className="font-medium text-gray-900 mb-3">Property Builder/Contractor</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Builder/Contractor:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.fullName}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Email:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.email}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Phone:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.phoneNumber}</span>
          </div>
          {policy.contactDetails.alternatePhone && (
            <div className="flex justify-between">
              <span className="text-gray-600">Alt Phone:</span>
              <span className="font-medium text-gray-900">{policy.contactDetails.alternatePhone}</span>
            </div>
          )}
          <div className="flex justify-between">
            <span className="text-gray-600">RC Number:</span>
            <span className="font-medium text-gray-900">{policy.contactDetails.rcNumber || 'N/A'}</span>
          </div>
        </div>
      </div>
    </div>

    {/* Coverage Details */}
    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Coverage Details</h4>
        <div className="space-y-2 text-sm">
          <div className="flex justify-between">
            <span className="text-gray-600">Coverage Type:</span>
            <span className="font-medium text-gray-900">{policy.requestDetails.coverageType}</span>
          </div>
          <div className="flex justify-between">
            <span className="text-gray-600">Duration:</span>
            <span className="font-medium text-gray-900">1 Year</span>
          </div>
        </div>
        {policy.requestDetails.additionalCoverage && policy.requestDetails.additionalCoverage.length > 0 && (
          <div className="mt-3">
            <span className="text-gray-600 text-sm">Additional Coverage:</span>
            <div className="flex flex-wrap gap-2 mt-1">
              {policy.requestDetails.additionalCoverage.map((coverage, index) => (
                <span
                  key={index}
                  className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-blue-100 text-blue-800"
                >
                  {coverage}
                </span>
              ))}
            </div>
          </div>
        )}
      </div>

      {assignmentData && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Assignment Details</h4>
          <div className="space-y-2 text-sm">
            <div className="flex justify-between">
              <span className="text-gray-600">Assigned:</span>
              <span className="font-medium text-gray-900">
                {assignmentData.assignedAt ? new Date(assignmentData.assignedAt).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Deadline:</span>
              <span className="font-medium text-gray-900">
                {assignmentData.deadline ? new Date(assignmentData.deadline).toLocaleDateString() : 'N/A'}
              </span>
            </div>
            <div className="flex justify-between">
              <span className="text-gray-600">Priority:</span>
              <span className={`font-medium ${assignmentData.priority === 'urgent' ? 'text-red-600' :
                assignmentData.priority === 'high' ? 'text-orange-600' :
                  assignmentData.priority === 'medium' ? 'text-yellow-600' :
                    'text-green-600'
                }`}>
                {assignmentData?.priority ? assignmentData.priority.toUpperCase() : 'N/A'}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>

    {/* Special Requests */}
    {policy.requestDetails.specialRequests && (
      <div>
        <h4 className="font-medium text-gray-900 mb-2">Special Requests</h4>
        <div className="bg-amber-50 border border-amber-200 rounded-lg p-3">
          <p className="text-sm text-amber-800">{policy.requestDetails.specialRequests}</p>
        </div>
      </div>
    )}
  </div>
);

// Policy Survey Tab
const PolicySurveyTab: React.FC<{
  policy: PolicyRequest;
  surveyData: EnhancedSurveySubmission | null;
  loading: boolean;
}> = ({ policy, surveyData, loading }) => {
  if (policy.status === 'submitted' || policy.status === 'assigned') {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey not completed yet</p>
        <p className="text-sm">Survey results will appear here once the survey is completed.</p>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading survey data...</p>
      </div>
    );
  }

  if (!surveyData) {
    return (
      <div className="text-center py-8 text-gray-500">
        <Eye className="w-12 h-12 mx-auto mb-3 opacity-30" />
        <p>Survey data not found</p>
        <p className="text-sm">Unable to load survey results for this policy.</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Survey Assessment Details */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Property Condition</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.propertyCondition || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Structural Assessment</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.structuralAssessment || 'No assessment provided'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.riskFactors || 'No risk factors identified'}
            </p>
          </div>
        </div>

        <div>
          <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
          <div className="bg-gray-50 p-4 rounded-lg">
            <p className="text-sm text-gray-700">
              {surveyData.surveyDetails?.recommendations || 'No recommendations provided'}
            </p>
          </div>
        </div>
      </div>

      {/* Survey Notes */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Additional Survey Notes</h4>
        <div className="bg-gray-50 p-4 rounded-lg">
          <p className="text-sm text-gray-700">
            {surveyData.surveyNotes || 'No additional notes provided'}
          </p>
        </div>
      </div>

      {/* Final Recommendation */}
      <div>
        <h4 className="font-medium text-gray-900 mb-3">Final Recommendation</h4>
        <div className={`inline-flex items-center px-3 py-2 rounded-full text-sm font-medium ${surveyData.recommendedAction === 'approve'
          ? 'bg-green-100 text-green-800 border border-green-200'
          : surveyData.recommendedAction === 'reject'
            ? 'bg-red-100 text-red-800 border border-red-200'
            : 'bg-yellow-100 text-yellow-800 border border-yellow-200'
          }`}>
          {surveyData.recommendedAction === 'approve' && '✅ Approve Policy'}
          {surveyData.recommendedAction === 'reject' && '❌ Reject Policy'}
          {surveyData.recommendedAction === 'request_more_info' && '📋 Request More Information'}
        </div>
      </div>

      {/* Contact Log */}
      {surveyData.contactLog && surveyData.contactLog.length > 0 && (
        <div>
          <h4 className="font-medium text-gray-900 mb-3">Contact Log</h4>
          <div className="space-y-3">
            {surveyData.contactLog?.map((entry, index: number) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-3">
                <div className="flex items-center space-x-2 text-sm text-gray-600 mb-1">
                  <Calendar className="h-4 w-4" />
                  <span>{new Date(entry.date).toLocaleDateString()}</span>
                  <span className="capitalize font-medium">{entry.method}</span>
                  <span className={`px-2 py-0.5 rounded-full text-xs font-medium ${entry.successful ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                    }`}>
                    {entry.successful ? 'Success' : 'Failed'}
                  </span>
                </div>
                <p className="text-sm text-gray-800">{entry.notes}</p>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
};

// Policy Documents Tab
const PolicyDocumentsTab: React.FC<{
  policy: PolicyRequest;
  surveyData: EnhancedSurveySubmission | null;
  loading: boolean;
}> = ({ policy, surveyData, loading }) => {
  // Debug logging
  console.log('PolicyDocumentsTab - Survey Data:', surveyData);
  console.log('PolicyDocumentsTab - Documents:', surveyData?.documents);
  console.log('PolicyDocumentsTab - Survey Document:', surveyData?.surveyDocument);
  console.log('PolicyDocumentsTab - Survey Details Photos:', surveyData?.surveyDetails?.photos);

  if (loading && (policy.status === 'surveyed' || policy.status === 'approved' || policy.status === 'rejected')) {
    return (
      <div className="text-center py-8">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
        <p className="text-gray-500 mt-2">Loading documents...</p>
      </div>
    );
  }

  // Get all documents from the survey submission
  const documents = surveyData?.documents || [];
  console.log('Documents array length:', documents.length);

  const mainReport = documents.find(doc => doc.isMainReport || doc.documentType === 'main_report');
  console.log('Main report found:', mainReport);

  const otherDocuments = documents.filter(doc => !doc.isMainReport && doc.documentType !== 'main_report');
  console.log('Other documents count:', otherDocuments.length);

  return (
    <div className="space-y-6">
      <h4 className="font-medium text-gray-900">Survey Documents</h4>

      {/* Debug Info - Remove after testing */}
      <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 text-xs space-y-1">
        <p className="font-semibold mb-2">Debug Info (check console for full details):</p>
        <p>✓ Survey Data exists: {surveyData ? 'Yes' : 'No'}</p>
        <p>✓ Survey submission documents: {documents.length}</p>
        <p>✓ Policy documents: {policy.documents?.length || 0}</p>
        <p>✓ Main report found: {mainReport ? 'Yes' : 'No'}</p>
        <p>✓ Other documents: {otherDocuments.length}</p>
        <p>✓ Survey Document field: {surveyData?.surveyDocument ? 'Exists' : 'None'}</p>
        <p>✓ Survey Document type: {typeof surveyData?.surveyDocument}</p>
        <p>✓ Policy surveyDocument: {policy.surveyDocument ? 'Exists' : 'None'}</p>
        <p>✓ Policy surveyDocument type: {typeof policy.surveyDocument}</p>
        <p>✓ Policy surveyNotes: {policy.surveyNotes ? 'Exists' : 'None'}</p>
        <p>✓ Photos: {surveyData?.surveyDetails?.photos?.length || 0}</p>
        <details className="mt-2">
          <summary className="cursor-pointer font-semibold">Raw Data (click to expand)</summary>
          <pre className="mt-2 text-xs overflow-auto max-h-40 bg-white p-2 rounded">
            {JSON.stringify({
              surveyDocument: surveyData?.surveyDocument,
              policyDocument: policy.surveyDocument,
              documentsCount: documents.length,
              policyDocsCount: policy.documents?.length
            }, null, 2)}
          </pre>
        </details>
      </div>

      {/* Main Survey Report */}
      {mainReport && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-blue-900">Main Survey Report</h5>
                <p className="text-sm text-blue-700">{mainReport.fileName}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Uploaded: {new Date(mainReport.uploadedAt).toLocaleDateString()}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={mainReport.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View
              </a>
              <a
                href={mainReport.cloudinaryUrl}
                download={mainReport.fileName}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Legacy Survey Document (for backward compatibility) */}
      {!mainReport && surveyData?.surveyDocument && typeof surveyData.surveyDocument === 'object' && 'cloudinaryUrl' in surveyData.surveyDocument && (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-blue-600 mr-3" />
              <div>
                <h5 className="font-medium text-blue-900">Survey Report</h5>
                <p className="text-sm text-blue-700">{surveyData.surveyDocument.fileName || 'Survey Document'}</p>
                <p className="text-xs text-blue-600 mt-1">
                  Submitted: {surveyData.submissionTime ? new Date(surveyData.submissionTime).toLocaleDateString() : 'N/A'}
                </p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={surveyData.surveyDocument.cloudinaryUrl}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
              >
                View
              </a>
              <a
                href={surveyData.surveyDocument.cloudinaryUrl}
                download={surveyData.surveyDocument.fileName}
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                Download
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Other Documents */}
      {otherDocuments.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Supporting Documents</h5>
          <div className="space-y-3">
            {otherDocuments.map((doc, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="h-10 w-10 bg-gray-100 rounded flex items-center justify-center mr-3">
                      <Eye className="h-5 w-5 text-gray-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900 text-sm">{doc.fileName}</h6>
                      <p className="text-xs text-gray-500">
                        {doc.category} • {(doc.fileSize / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={doc.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:text-blue-800 text-sm font-medium px-3 py-1 border border-blue-600 rounded hover:bg-blue-50"
                    >
                      View
                    </a>
                    <a
                      href={doc.cloudinaryUrl}
                      download={doc.fileName}
                      className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-600 rounded hover:bg-green-50"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Policy Survey Document (from policy object) */}
      {!mainReport && !surveyData?.surveyDocument && policy.surveyDocument && (
        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-green-600 mr-3" />
              <div>
                <h5 className="font-medium text-green-900">Survey Document (from Policy)</h5>
                <p className="text-sm text-green-700">
                  {typeof policy.surveyDocument === 'object' && 'name' in policy.surveyDocument
                    ? policy.surveyDocument.name
                    : 'Survey Document'}
                </p>
                {policy.surveyNotes && (
                  <p className="text-xs text-green-600 mt-1">Notes: {policy.surveyNotes.substring(0, 100)}...</p>
                )}
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={
                  typeof policy.surveyDocument === 'string'
                    ? policy.surveyDocument
                    : typeof policy.surveyDocument === 'object' && 'url' in policy.surveyDocument
                      ? policy.surveyDocument.url
                      : '#'
                }
                target="_blank"
                rel="noopener noreferrer"
                className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
              >
                View
              </a>
            </div>
          </div>
        </div>
      )}

      {/* Policy Documents Array */}
      {policy.documents && policy.documents.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Policy Documents</h5>
          <div className="space-y-3">
            {policy.documents.map((doc, index) => (
              <div key={index} className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center flex-1">
                    <div className="h-10 w-10 bg-purple-100 rounded flex items-center justify-center mr-3">
                      <Eye className="h-5 w-5 text-purple-600" />
                    </div>
                    <div className="flex-1">
                      <h6 className="font-medium text-gray-900 text-sm">{doc.fileName}</h6>
                      <p className="text-xs text-gray-500">
                        {doc.category} • {(doc.fileSize / 1024).toFixed(2)} KB
                      </p>
                      <p className="text-xs text-gray-400">
                        Uploaded: {new Date(doc.uploadedAt).toLocaleDateString()}
                      </p>
                    </div>
                  </div>
                  <div className="flex space-x-2">
                    <a
                      href={doc.cloudinaryUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-purple-600 hover:text-purple-800 text-sm font-medium px-3 py-1 border border-purple-600 rounded hover:bg-purple-50"
                    >
                      View
                    </a>
                    <a
                      href={doc.cloudinaryUrl}
                      download={doc.fileName}
                      className="text-green-600 hover:text-green-800 text-sm font-medium px-3 py-1 border border-green-600 rounded hover:bg-green-50"
                    >
                      Download
                    </a>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Survey Photos */}
      {surveyData?.surveyDetails?.photos && surveyData.surveyDetails.photos.length > 0 && (
        <div>
          <h5 className="font-medium text-gray-900 mb-3">Survey Photos</h5>
          <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
            {surveyData.surveyDetails.photos.map((photo, index) => (
              <div key={index} className="relative group">
                <img
                  src={photo.url}
                  alt={photo.description || `Survey photo ${index + 1}`}
                  className="w-full h-48 object-cover rounded-lg border border-gray-200"
                />
                <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all rounded-lg flex items-center justify-center">
                  <a
                    href={photo.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium"
                  >
                    View Full Size
                  </a>
                </div>
                {photo.description && (
                  <p className="text-xs text-gray-600 mt-1">{photo.description}</p>
                )}
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Raw Survey Document Display (if it's a string URL) */}
      {!mainReport && !policy.surveyDocument && surveyData?.surveyDocument && typeof surveyData.surveyDocument === 'string' && (
        <div className="bg-indigo-50 border border-indigo-200 rounded-lg p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <Eye className="h-6 w-6 text-indigo-600 mr-3" />
              <div>
                <h5 className="font-medium text-indigo-900">Survey Document (String URL)</h5>
                <p className="text-sm text-indigo-700 truncate max-w-md">{surveyData.surveyDocument}</p>
              </div>
            </div>
            <div className="flex space-x-2">
              <a
                href={surveyData.surveyDocument}
                target="_blank"
                rel="noopener noreferrer"
                className="bg-indigo-600 text-white px-4 py-2 rounded-lg hover:bg-indigo-700 transition-colors text-sm font-medium"
              >
                View
              </a>
            </div>
          </div>
        </div>
      )}

      {/* No Documents Message */}
      {!mainReport &&
        !surveyData?.surveyDocument &&
        !policy.surveyDocument &&
        (!policy.documents || policy.documents.length === 0) &&
        otherDocuments.length === 0 &&
        (!surveyData?.surveyDetails?.photos || surveyData.surveyDetails.photos.length === 0) && (
          <div className="text-center py-8 text-gray-500">
            <Eye className="w-12 w-12 mx-auto mb-3 opacity-30" />
            <p>No documents available</p>
            <p className="text-sm">Documents will appear here once the survey is completed.</p>
            <p className="text-xs mt-2 text-gray-400">Check the debug info above to see what data is available</p>
          </div>
        )}
    </div>
  );
};

export default PolicyManagement;
