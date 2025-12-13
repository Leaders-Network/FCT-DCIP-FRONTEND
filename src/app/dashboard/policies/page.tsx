"use client";
import React, { useState, useEffect } from "react";
import PolicyCompletion from "@/components/dashboard/PolicyCompletion";
import PolicyDetailsWithDualSurveyor from "@/components/dashboard/PolicyDetailsWithDualSurveyor";
import EnhancedPolicyDetails from "@/components/dashboard/EnhancedPolicyDetails";
import DualSurveyorProgress from "@/components/dashboard/DualSurveyorProgress";

import {
  FileText,
  Clock,
  Users,
  Eye,
  ArrowRight,
  Building,
  Calendar,
  MapPin,
  TrendingUp,
  CheckCircle,
  XCircle,
  Search,
  Filter,
  X,
  CreditCard
} from "lucide-react";
import { getUserPolicyRequests } from "@/services/api";

interface PolicyRequest {
  _id: string;
  propertyDetails: {
    propertyType: string;
    address: string;
    buildingValue: number;
  };
  contactDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
  };
  status: string;
  createdAt: string;
  updatedAt: string;
}

export default function PoliciesPage() {
  const [activeTab, setActiveTab] = useState<'in-progress' | 'completed' | 'rejected'>('in-progress');
  const [selectedPolicyId, setSelectedPolicyId] = useState<string | null>(null);
  const [showEnhancedView, setShowEnhancedView] = useState(false);
  const [inProgressPolicies, setInProgressPolicies] = useState<PolicyRequest[]>([]);
  const [completedPolicies, setCompletedPolicies] = useState<PolicyRequest[]>([]);
  const [rejectedPolicies, setRejectedPolicies] = useState<PolicyRequest[]>([]);
  const [completedCount, setCompletedCount] = useState(0);
  const [rejectedCount, setRejectedCount] = useState(0);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    propertyType: "",
    coverageType: "",
    dateFrom: "",
    dateTo: "",
    minValue: "",
    maxValue: ""
  });

  useEffect(() => {
    fetchInProgressPolicies();
    fetchCompletedPolicies();
    fetchRejectedPolicies();
  }, []);

  const fetchCompletedPolicies = async () => {
    try {
      // Only fetch truly completed policies (payment confirmed)
      const completedResponse = await getUserPolicyRequests("completed", 1, 100);
      const completed = completedResponse.data.policyRequests || [];

      setCompletedPolicies(completed);
      setCompletedCount(completed.length);
    } catch (error) {
      console.error("Failed to fetch completed policies:", error);
    }
  };

  const fetchRejectedPolicies = async () => {
    try {
      console.log('🔍 Fetching rejected policies...');
      const response = await getUserPolicyRequests("rejected", 1, 100);
      console.log('📊 Rejected policies response:', response);
      const rejected = response.data?.policyRequests || [];
      console.log(`✅ Found ${rejected.length} rejected policies`);
      setRejectedPolicies(rejected);
      setRejectedCount(rejected.length);
    } catch (error) {
      console.error("❌ Failed to fetch rejected policies:", error);
      setRejectedPolicies([]);
      setRejectedCount(0);
    }
  };

  const fetchInProgressPolicies = async () => {
    try {
      setLoading(true);
      const [submittedResponse, assignedResponse, surveyedResponse, approvedResponse, paymentPendingResponse] = await Promise.all([
        getUserPolicyRequests("submitted", 1, 100),
        getUserPolicyRequests("assigned", 1, 100),
        getUserPolicyRequests("surveyed", 1, 100),
        getUserPolicyRequests("approved", 1, 100),
        getUserPolicyRequests("payment_pending", 1, 100),
      ]);

      const submitted = submittedResponse.data.policyRequests || [];
      const assigned = assignedResponse.data.policyRequests || [];
      const surveyed = surveyedResponse.data.policyRequests || [];
      const approved = approvedResponse.data.policyRequests || [];
      const paymentPending = paymentPendingResponse.data.policyRequests || [];

      // Sort by priority: approved (needs payment) first, then payment_pending, then others by creation date
      const allInProgress = [...submitted, ...assigned, ...surveyed, ...approved, ...paymentPending];
      const sortedPolicies = allInProgress.sort((a, b) => {
        // Prioritize approved policies (need payment action)
        if (a.status === 'approved' && b.status !== 'approved') return -1;
        if (b.status === 'approved' && a.status !== 'approved') return 1;
        // Then prioritize payment_pending
        if (a.status === 'payment_pending' && b.status !== 'payment_pending') return -1;
        if (b.status === 'payment_pending' && a.status !== 'payment_pending') return 1;
        // Then sort by creation date (newest first)
        return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
      });

      setInProgressPolicies(sortedPolicies);
    } catch (error) {
      console.error("Failed to fetch in-progress policies:", error);
    } finally {
      setLoading(false);
    }
  };

  // const calculatePolicyPremium = (policy: PolicyRequest) => {
  //   const baseRate = 0.005; // 0.5% of building value
  //   const buildingValue = policy.propertyDetails.buildingValue || 0;
  //   return Math.max(buildingValue * baseRate, 25000); // Minimum premium of ₦25,000
  // };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN'
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    switch (status) {
      case 'submitted':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">
            <Clock className="w-3 h-3 mr-1" />
            Pending Assignment
          </span>
        );
      case 'assigned':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">
            <Users className="w-3 h-3 mr-1" />
            Survey In Progress
          </span>
        );
      case 'surveyed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Survey Complete
          </span>
        );
      case 'approved':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Approved - Payment Required
          </span>
        );
      case 'payment_pending':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-orange-100 text-orange-800">
            <Clock className="w-3 h-3 mr-1" />
            Payment Pending - Retry Required
          </span>
        );
      case 'completed':
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
            <CheckCircle className="w-3 h-3 mr-1" />
            Completed
          </span>
        );
      default:
        return (
          <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">
            {status}
          </span>
        );
    }
  };

  const getMockDualSurveyorData = (policy: PolicyRequest) => {
    // Mock data for demonstration - in real implementation this would come from API
    const isAssigned = policy.status === 'assigned';

    return {
      assignmentStatus: isAssigned ? 'partially_assigned' as const : 'unassigned' as const,
      completionStatus: 0 as const,
      ammcSurveyorContact: isAssigned ? {
        name: 'John Adebayo',
        email: 'j.adebayo@ammc.gov.ng',
        phone: '+234 803 123 4567'
      } : undefined,
      niaSurveyorContact: undefined,
      priority: 'medium',
      estimatedCompletion: {
        overallDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
      }
    };
  };

  // Filter function
  const filterPolicies = (policies: PolicyRequest[]) => {
    return policies.filter(policy => {
      // Search filter
      const searchLower = searchQuery.toLowerCase();
      const searchMatch = !searchQuery ||
        policy._id?.toLowerCase().includes(searchLower) ||
        policy.propertyDetails.address?.toLowerCase().includes(searchLower) ||
        policy.propertyDetails.propertyType?.toLowerCase().includes(searchLower) ||
        policy.contactDetails.fullName?.toLowerCase().includes(searchLower) ||
        policy.requestDetails.coverageType?.toLowerCase().includes(searchLower);

      // Property Type filter
      const propertyTypeMatch = !filters.propertyType ||
        policy.propertyDetails.propertyType === filters.propertyType;

      // Coverage Type filter
      const coverageMatch = !filters.coverageType ||
        policy.requestDetails.coverageType === filters.coverageType;

      // Date range filter
      const dateFromMatch = !filters.dateFrom ||
        new Date(policy.createdAt) >= new Date(filters.dateFrom);
      const dateToMatch = !filters.dateTo ||
        new Date(policy.createdAt) <= new Date(filters.dateTo);

      // Value range filter
      const minValueMatch = !filters.minValue ||
        policy.propertyDetails.buildingValue >= parseFloat(filters.minValue);
      const maxValueMatch = !filters.maxValue ||
        policy.propertyDetails.buildingValue <= parseFloat(filters.maxValue);

      return searchMatch && propertyTypeMatch && coverageMatch &&
        dateFromMatch && dateToMatch && minValueMatch && maxValueMatch;
    });
  };

  const clearFilters = () => {
    setFilters({
      propertyType: "",
      coverageType: "",
      dateFrom: "",
      dateTo: "",
      minValue: "",
      maxValue: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v !== "");

  // Apply filters to current tab
  const filteredInProgressPolicies = filterPolicies(inProgressPolicies);
  const filteredCompletedPolicies = filterPolicies(completedPolicies);
  const filteredRejectedPolicies = filterPolicies(rejectedPolicies);

  if (selectedPolicyId) {
    return (
      <div className="p-0">
        {showEnhancedView ? (
          <EnhancedPolicyDetails
            policyId={selectedPolicyId}
            onBack={() => {
              setSelectedPolicyId(null);
              setShowEnhancedView(false);
            }}
          />
        ) : (
          <PolicyDetailsWithDualSurveyor
            policyId={selectedPolicyId}
            onBack={() => setSelectedPolicyId(null)}
          />
        )}
      </div>
    );
  }

  return (
    <div className="p-0">
      {/* Priority Actions Banner */}
      {inProgressPolicies.filter(p => p.status === 'approved' || p.status === 'payment_pending' || p.status === 'surveyed').length > 0 && (
        <div className="mb-4 sm:mb-6">
          <div className="bg-gradient-to-r from-green-50 to-blue-50 border border-green-200 rounded-lg p-4">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                  <CreditCard className="w-4 h-4 text-green-600" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-gray-900">Payment Required</h3>
                  <p className="text-xs text-gray-600">
                    {inProgressPolicies.filter(p => p.status === 'approved').length} approved policies, {' '}
                    {inProgressPolicies.filter(p => p.status === 'surveyed').length} surveyed policies, {' '}
                    {inProgressPolicies.filter(p => p.status === 'payment_pending').length} payment retries needed
                  </p>
                </div>
              </div>
              <div className="text-xs text-gray-500">
                Complete payments to activate your policies
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Header with Stats */}
      <div className="mb-4 sm:mb-6 md:mb-8">
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4 mb-4">
          <div>
            <h1 className="text-xl sm:text-2xl md:text-3xl font-bold text-gray-900 mb-1 sm:mb-2">My Policies</h1>
            <p className="text-sm sm:text-base text-gray-600">
              Track your insurance policy requests and payment status
            </p>
          </div>
          <div className="grid grid-cols-3 gap-2 sm:gap-4">
            <div className="bg-blue-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-blue-600">{inProgressPolicies.length}</div>
              <div className="text-[10px] sm:text-xs text-blue-600 font-medium">In Progress</div>
            </div>
            <div className="bg-green-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-green-600">{completedCount}</div>
              <div className="text-[10px] sm:text-xs text-green-600 font-medium">Completed</div>
            </div>
            <div className="bg-red-50 rounded-lg px-3 sm:px-6 py-2 sm:py-4 text-center">
              <div className="text-lg sm:text-2xl font-bold text-red-600">{rejectedCount}</div>
              <div className="text-[10px] sm:text-xs text-red-600 font-medium">Rejected</div>
            </div>
          </div>
        </div>
      </div>

      {/* Search and Filter Bar */}
      <div className="w-full bg-white rounded-xl p-4 mb-4 shadow-sm border border-gray-200">
        <div className="flex flex-col sm:flex-row gap-3 mb-4">
          {/* Search Input */}
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
            <input
              type="text"
              placeholder="Search by ID, address, property type, or coverage..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
              ? 'bg-blue-600 text-white border-blue-600'
              : 'bg-white text-gray-700 border-gray-300 hover:bg-gray-50'
              }`}
          >
            <Filter className="h-4 w-4 mr-2" />
            Filters
            {hasActiveFilters && !showFilters && (
              <span className="ml-2 bg-white text-blue-600 rounded-full w-5 h-5 flex items-center justify-center text-xs font-bold">
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Types</option>
                <option value="Residential">Residential</option>
                <option value="Commercial">Commercial</option>
                <option value="Industrial">Industrial</option>
              </select>
            </div>

            {/* Coverage Type Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
              <select
                value={filters.coverageType}
                onChange={(e) => setFilters({ ...filters, coverageType: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              >
                <option value="">All Coverage</option>
                <option value="Comprehensive">Comprehensive</option>
                <option value="Basic">Basic</option>
                {/* <option value="Premium">Premium</option> */}
              </select>
            </div>

            {/* Date From Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date From</label>
              <input
                type="date"
                value={filters.dateFrom}
                onChange={(e) => setFilters({ ...filters, dateFrom: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Date To Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Date To</label>
              <input
                type="date"
                value={filters.dateTo}
                onChange={(e) => setFilters({ ...filters, dateTo: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>

            {/* Min Value Filter */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Min Value (₦)</label>
              <input
                type="number"
                placeholder="0"
                value={filters.minValue}
                onChange={(e) => setFilters({ ...filters, minValue: e.target.value })}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
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
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
              />
            </div>
          </div>
        )}

        {/* Results Count */}
        <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200 mt-3">
          <span>
            Showing <span className="font-semibold text-gray-900">
              {activeTab === 'in-progress' ? filteredInProgressPolicies.length :
                activeTab === 'completed' ? filteredCompletedPolicies.length :
                  filteredRejectedPolicies.length}
            </span> of{' '}
            <span className="font-semibold text-gray-900">
              {activeTab === 'in-progress' ? inProgressPolicies.length :
                activeTab === 'completed' ? completedPolicies.length :
                  rejectedPolicies.length}
            </span> policies
          </span>
          {hasActiveFilters && (
            <span className="text-blue-600 font-medium">Filters active</span>
          )}
        </div>
      </div>

      {/* Enhanced Tabs */}
      <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-1 mb-4 sm:mb-6 flex flex-wrap sm:inline-flex">
        <button
          onClick={() => setActiveTab('in-progress')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'in-progress'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <Clock className="w-3 h-3 sm:w-4 sm:h-4" />
            <span className="hidden sm:inline">In Progress</span>
            <span className="sm:hidden">Progress</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'in-progress' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {inProgressPolicies.length}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('completed')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'completed'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <CheckCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Completed</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'completed' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {completedCount}
            </span>
          </div>
        </button>
        <button
          onClick={() => setActiveTab('rejected')}
          className={`flex-1 sm:flex-none px-3 sm:px-6 py-2 sm:py-3 rounded-md font-medium text-xs sm:text-sm transition-all ${activeTab === 'rejected'
            ? 'bg-blue-600 text-white shadow-sm'
            : 'text-gray-600 hover:text-gray-900 hover:bg-gray-50'
            }`}
        >
          <div className="flex items-center justify-center gap-1 sm:gap-2">
            <XCircle className="w-3 h-3 sm:w-4 sm:h-4" />
            <span>Rejected</span>
            <span className={`px-1.5 sm:px-2 py-0.5 rounded-full text-[10px] sm:text-xs ${activeTab === 'rejected' ? 'bg-blue-500 text-white' : 'bg-gray-200 text-gray-700'}`}>
              {rejectedCount}
            </span>
          </div>
        </button>
      </div>

      {/* Tab Content */}
      {activeTab === 'in-progress' ? (
        <div className="space-y-4 sm:space-y-6">
          {loading ? (
            <div className="space-y-4">
              {[1, 2, 3].map((i) => (
                <div key={i} className="bg-white p-4 sm:p-6 rounded-lg border border-gray-200 animate-pulse">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <div className="h-5 sm:h-6 bg-gray-300 rounded w-1/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                      <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                    </div>
                    <div className="h-6 bg-gray-300 rounded w-20 sm:w-24"></div>
                  </div>
                  <div className="h-24 sm:h-32 bg-gray-300 rounded"></div>
                </div>
              ))}
            </div>
          ) : filteredInProgressPolicies.length > 0 ? (
            <div className="space-y-4 sm:space-y-6">
              {filteredInProgressPolicies.map((policy) => {
                const dualSurveyorData = getMockDualSurveyorData(policy);

                return (
                  <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm">
                    <div className="p-6">
                      {/* Policy Header */}
                      <div className="flex items-start justify-between mb-6">
                        <div className="flex-1">
                          <div className="flex items-center space-x-3 mb-2">
                            <h3 className="text-lg font-semibold text-gray-900">
                              {policy.propertyDetails.propertyType}
                            </h3>
                            {getStatusBadge(policy.status)}
                          </div>
                          <div className="space-y-1 text-sm text-gray-600">
                            <div className="flex items-center">
                              <MapPin className="w-4 h-4 mr-2" />
                              <span>{policy.propertyDetails.address}</span>
                            </div>
                            <div className="flex items-center">
                              <Building className="w-4 h-4 mr-2" />
                              <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center">
                              <Calendar className="w-4 h-4 mr-2" />
                              <span>Submitted {new Date(policy.createdAt).toLocaleDateString()}</span>
                            </div>
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          {/* {(policy.status === 'approved' || policy.status === 'payment_pending' || policy.status === 'surveyed') && (
                            <div className="flex items-center px-3 py-1 bg-blue-50 rounded-lg border border-blue-200">
                              <CreditCard className="w-4 h-4 mr-2 text-blue-600" />
                              <span className="text-sm font-medium text-blue-700">
                                Premium: {formatCurrency(calculatePolicyPremium(policy))}
                              </span>
                            </div>
                          )} */}
                          {(policy.status === 'approved' || policy.status === 'surveyed') && (
                            <button
                              onClick={(event) => {
                                // Enhanced payment flow with better UX
                                const confirmed = confirm(
                                  `💳 Complete Payment for ${policy.propertyDetails.propertyType}\n\n` +
                                  `Property Value: ₦${policy.propertyDetails.buildingValue.toLocaleString()}\n` +
                                  `Click OK to proceed to payment gateway.`
                                );

                                if (confirmed) {
                                  // Show loading state
                                  const button = event.target as HTMLButtonElement;
                                  const originalText = button.innerHTML;
                                  button.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Processing...';
                                  button.disabled = true;

                                  // Simulate payment processing
                                  setTimeout(async () => {
                                    try {
                                      const response = await fetch(`http://localhost:5000/api/v1/admin/enforcement/webhook/test/${policy._id}?status=payment_approved`);
                                      const data = await response.json();

                                      if (response.ok) {
                                        alert('✅ Payment completed successfully!\n\nYour policy is now active and has been moved to the Completed section.');
                                        // Refresh the policies
                                        fetchInProgressPolicies();
                                        fetchCompletedPolicies();
                                      } else {
                                        alert(`❌ Payment failed: ${data.message}`);
                                      }
                                    } catch (error) {
                                      console.error('Payment simulation failed:', error);
                                      alert('❌ Payment failed: Network error');
                                    } finally {
                                      // Restore button
                                      button.innerHTML = originalText;
                                      button.disabled = false;
                                    }
                                  }, 2000);
                                }
                              }}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              {policy.status === 'approved' ? 'Complete Payment' : 'Proceed to Payment'}
                            </button>
                          )}
                          {policy.status === 'payment_pending' && (
                            <button
                              onClick={(event) => {
                                const retry = confirm(
                                  `🔄 Retry Payment for ${policy.propertyDetails.propertyType}\n\n` +
                                  `Your previous payment attempt was unsuccessful.\n` +
                                  `Would you like to try again?`
                                );

                                if (retry) {
                                  // Show loading state
                                  const button = event.target as HTMLButtonElement;
                                  const originalText = button.innerHTML;
                                  button.innerHTML = '<svg class="animate-spin -ml-1 mr-3 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24"><circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"></circle><path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path></svg>Retrying...';
                                  button.disabled = true;

                                  // Simulate retry payment
                                  setTimeout(async () => {
                                    try {
                                      const response = await fetch(`http://localhost:5000/api/v1/admin/enforcement/webhook/test/${policy._id}?status=payment_approved`);
                                      const data = await response.json();

                                      if (response.ok) {
                                        alert('✅ Payment retry successful! Your policy is now active.');
                                        fetchInProgressPolicies();
                                        fetchCompletedPolicies();
                                      } else {
                                        alert(`❌ Payment retry failed: ${data.message}`);
                                      }
                                    } catch (error) {
                                      console.error('Payment retry failed:', error);
                                      alert('❌ Payment retry failed: Network error');
                                    } finally {
                                      // Restore button
                                      button.innerHTML = originalText;
                                      button.disabled = false;
                                    }
                                  }, 2000);
                                }
                              }}
                              className="flex items-center px-4 py-2 text-sm font-medium text-white bg-orange-600 rounded-lg hover:bg-orange-700 transition-colors shadow-sm"
                            >
                              <CreditCard className="w-4 h-4 mr-2" />
                              Retry Payment
                            </button>
                          )}
                          <button
                            onClick={() => {
                              setSelectedPolicyId(policy._id);
                              setShowEnhancedView(true);
                            }}
                            className="flex items-center px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors shadow-sm"
                          >
                            <TrendingUp className="w-4 h-4 mr-2" />
                            View Progress
                          </button>
                        </div>
                      </div>

                      {/* Workflow Progress - Enhanced Version */}
                      <div className="bg-gray-50 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                          <h4 className="text-sm font-medium text-gray-900">Workflow Progress</h4>
                          <span className="text-sm font-bold text-gray-900">
                            {policy.status === 'submitted' ? '10%' :
                              policy.status === 'assigned' ? '30%' :
                                policy.status === 'surveyed' ? '60%' :
                                  policy.status === 'approved' ? '80%' :
                                    policy.status === 'payment_pending' ? '85%' :
                                      policy.status === 'completed' ? '100%' : '0%'}
                          </span>
                        </div>

                        <div className="w-full bg-gray-200 rounded-full h-2 mb-3">
                          <div
                            className={`h-2 rounded-full transition-all duration-300 ${policy.status === 'submitted' ? 'bg-yellow-400' :
                              policy.status === 'assigned' ? 'bg-blue-400' :
                                policy.status === 'surveyed' ? 'bg-purple-400' :
                                  policy.status === 'approved' ? 'bg-green-400' :
                                    policy.status === 'payment_pending' ? 'bg-orange-400' :
                                      policy.status === 'completed' ? 'bg-green-500' : 'bg-gray-200'
                              }`}
                            style={{
                              width: `${policy.status === 'submitted' ? '10%' :
                                policy.status === 'assigned' ? '30%' :
                                  policy.status === 'surveyed' ? '60%' :
                                    policy.status === 'approved' ? '80%' :
                                      policy.status === 'payment_pending' ? '85%' :
                                        policy.status === 'completed' ? '100%' : '0%'
                                }`
                            }}
                          ></div>
                        </div>

                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-4">
                            {/* Survey Status */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${['assigned', 'surveyed', 'approved', 'payment_pending', 'completed'].includes(policy.status) ? 'bg-green-100' : 'bg-gray-100'
                                }`}>
                                <Users className={`w-3 h-3 ${['assigned', 'surveyed', 'approved', 'payment_pending', 'completed'].includes(policy.status) ? 'text-green-600' : 'text-gray-400'
                                  }`} />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-900">Survey</div>
                                <div className="text-xs text-gray-600">
                                  {['assigned', 'surveyed', 'approved', 'payment_pending', 'completed'].includes(policy.status) ? 'Completed' : 'Pending'}
                                </div>
                              </div>
                            </div>

                            {/* Payment Status */}
                            <div className="flex items-center space-x-2">
                              <div className={`w-6 h-6 rounded-full flex items-center justify-center ${policy.status === 'completed' ? 'bg-green-100' :
                                policy.status === 'approved' ? 'bg-yellow-100' :
                                  policy.status === 'payment_pending' ? 'bg-orange-100' : 'bg-gray-100'
                                }`}>
                                <CreditCard className={`w-3 h-3 ${policy.status === 'completed' ? 'text-green-600' :
                                  policy.status === 'approved' ? 'text-yellow-600' :
                                    policy.status === 'payment_pending' ? 'text-orange-600' : 'text-gray-400'
                                  }`} />
                              </div>
                              <div>
                                <div className="text-xs font-medium text-gray-900">Payment</div>
                                <div className="text-xs text-gray-600">
                                  {policy.status === 'completed' ? 'Confirmed' :
                                    policy.status === 'approved' ? 'Required' :
                                      policy.status === 'payment_pending' ? 'Pending' :
                                        policy.status === 'surveyed' ? 'Required' :
                                          'Not Required'}
                                </div>
                              </div>
                            </div>
                          </div>

                          <div className="text-xs text-gray-600">
                            Next: {
                              policy.status === 'submitted' ? 'Awaiting assignment' :
                                policy.status === 'assigned' ? 'Survey in progress' :
                                  policy.status === 'surveyed' ? 'Under review' :
                                    policy.status === 'approved' ? 'Complete payment' :
                                      policy.status === 'payment_pending' ? 'Retry payment' :
                                        'Policy active'
                            }
                          </div>
                        </div>

                        <div className="flex items-center justify-between mt-4 pt-3 border-t border-gray-200">
                          <div className="text-xs text-gray-600">
                            Policy ID: <span className="font-medium">{policy._id.substring(0, 8).toUpperCase()}</span>
                          </div>
                          <div className="flex items-center space-x-2">
                            <button
                              onClick={() => setSelectedPolicyId(policy._id)}
                              className="flex items-center text-xs text-blue-600 hover:text-blue-800 transition-colors"
                            >
                              View Details
                              <ArrowRight className="w-3 h-3 ml-1" />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>
          ) : (
            <div className="text-center py-12">
              <div className="mx-auto h-12 w-12 text-gray-400">
                <FileText className="h-full w-full" />
              </div>
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? "No matching policies found" : "No policies in progress"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Your submitted policies will appear here as they progress through the dual-surveyor assessment."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : activeTab === 'completed' ? (
        <div className="space-y-6">
          {filteredCompletedPolicies.length > 0 ? (
            filteredCompletedPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-gray-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                        <CheckCircle className="w-3 h-3 mr-1" />
                        {policy.status}
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Completed {new Date(policy.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy._id);
                      setShowEnhancedView(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-lg hover:bg-green-700 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Report
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <CheckCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? "No matching completed policies" : "No completed policies"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Completed policies will appear here."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      ) : (
        <div className="space-y-6">
          {filteredRejectedPolicies.length > 0 ? (
            filteredRejectedPolicies.map((policy) => (
              <div key={policy._id} className="bg-white rounded-lg border border-red-200 shadow-sm p-6">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-3 mb-2">
                      <h3 className="text-lg font-semibold text-gray-900">
                        {policy.propertyDetails.propertyType}
                      </h3>
                      <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">
                        <XCircle className="w-3 h-3 mr-1" />
                        Rejected
                      </span>
                    </div>
                    <div className="space-y-1 text-sm text-gray-600">
                      <div className="flex items-center">
                        <MapPin className="w-4 h-4 mr-2" />
                        <span>{policy.propertyDetails.address}</span>
                      </div>
                      <div className="flex items-center">
                        <Building className="w-4 h-4 mr-2" />
                        <span>₦{policy.propertyDetails.buildingValue.toLocaleString()}</span>
                      </div>
                      <div className="flex items-center">
                        <Calendar className="w-4 h-4 mr-2" />
                        <span>Rejected {new Date(policy.updatedAt).toLocaleDateString()}</span>
                      </div>
                    </div>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedPolicyId(policy._id);
                      setShowEnhancedView(true);
                    }}
                    className="flex items-center px-4 py-2 text-sm font-medium text-white bg-gray-600 rounded-lg hover:bg-gray-700 transition-colors shadow-sm"
                  >
                    <Eye className="w-4 h-4 mr-2" />
                    View Details
                  </button>
                </div>
              </div>
            ))
          ) : (
            <div className="text-center py-12">
              <XCircle className="mx-auto h-12 w-12 text-gray-400" />
              <h3 className="mt-2 text-sm font-medium text-gray-900">
                {hasActiveFilters ? "No matching rejected policies" : "No rejected policies"}
              </h3>
              <p className="mt-1 text-sm text-gray-500">
                {hasActiveFilters
                  ? "Try adjusting your search or filters"
                  : "Rejected policies will appear here."}
              </p>
              {hasActiveFilters && (
                <button
                  onClick={clearFilters}
                  className="mt-4 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                  Clear Filters
                </button>
              )}
            </div>
          )}
        </div>
      )}
    </div>
  );
}
