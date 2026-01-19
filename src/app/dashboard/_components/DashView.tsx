"use client";
import React, { useState, useEffect } from "react";
import { BuilderLiabilityPolicyForm } from '@/components/builderLiability/PolicyForm';
import { BuilderLiabilityPolicyList } from '@/components/builderLiability/PolicyList';
// DEPRECATED: Legacy property builder liability form - system now uses Builder Liability Policy exclusively
// import PolicyRequestForm from "@/components/dashboard/PolicyRequestForm";
import ReportSection from "@/components/dashboard/ReportSection";
// REMOVED: MergedReportsSummary - not applicable for Builder Liability policies
import NotificationTester from "@/components/shared/NotificationTester";
import { PolicyRequest } from "@/types/api.types";
import Image from "next/image";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";
import { getAuthToken } from "@/utils/auth";
import {
  MoreVertical,
  Download,
  CreditCard,
  Eye,
  FileText,
  Search,
  Filter,
  Plus,
  Bell,
  User,
  Settings,
  HelpCircle,
  ChevronDown,
  Calendar,
  MapPin,
  Building,
  TrendingUp,
  CheckCircle,
  Clock,
  AlertTriangle,
  X,
  RefreshCw,
  ArrowRight,
  Shield,
  Home,
  BarChart3,
  Users
} from "lucide-react";
import {
  PROPERTY_TYPES,
  CONSTRUCTION_MATERIALS,
  COVERAGE_TYPES,
  POLICY_DURATIONS
} from "@/constants/policyConstants";

const Dashview = () => {
  const [showBuilderLiabilityForm, setShowBuilderLiabilityForm] = useState(false);
  const [stats, setStats] = useState({
    active: 0,
    expired: 0,
    pending: 0,
    collaborators: 0,
    completed: 0,
    paymentPending: 0
  });
  const [recentInsurances, setRecentInsurances] = useState<PolicyRequest[]>([]);
  const [surveyedPolicies, setSurveyedPolicies] = useState<PolicyRequest[]>([]);
  const [allPolicies, setAllPolicies] = useState<PolicyRequest[]>([]);
  const [loading, setLoading] = useState(true);
  const [activeSection, setActiveSection] = useState<'overview' | 'reports'>('overview');

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "all",
    propertyType: "",
    dateFrom: "",
    dateTo: "",
    sortBy: "newest"
  });
  const [filteredPolicies, setFilteredPolicies] = useState<PolicyRequest[]>([]);

  // Apply search and filters to policies
  useEffect(() => {
    let filtered = [...allPolicies];

    // Apply search filter
    if (searchQuery) {
      const query = searchQuery.toLowerCase();
      filtered = filtered.filter(policy =>
        policy._id?.toLowerCase().includes(query) ||
        policy.propertyDetails?.address?.toLowerCase().includes(query) ||
        policy.propertyDetails?.propertyType?.toLowerCase().includes(query) ||
        policy.contactDetails?.fullName?.toLowerCase().includes(query) ||
        policy.requestDetails?.coverageType?.toLowerCase().includes(query)
      );
    }

    // Apply status filter
    if (filters.status !== "all") {
      filtered = filtered.filter(policy => policy.status === filters.status);
    }

    // Apply property type filter
    if (filters.propertyType) {
      filtered = filtered.filter(policy => policy.propertyDetails?.propertyType === filters.propertyType);
    }

    // Apply date range filters
    if (filters.dateFrom) {
      filtered = filtered.filter(policy =>
        new Date(policy.createdAt) >= new Date(filters.dateFrom)
      );
    }
    if (filters.dateTo) {
      filtered = filtered.filter(policy =>
        new Date(policy.createdAt) <= new Date(filters.dateTo)
      );
    }

    // Apply sorting
    filtered.sort((a, b) => {
      switch (filters.sortBy) {
        case "newest":
          return new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime();
        case "oldest":
          return new Date(a.createdAt).getTime() - new Date(b.createdAt).getTime();
        case "value-high":
          return (b.propertyDetails?.buildingValue || 0) - (a.propertyDetails?.buildingValue || 0);
        case "value-low":
          return (a.propertyDetails?.buildingValue || 0) - (b.propertyDetails?.buildingValue || 0);
        default:
          return 0;
      }
    });

    setFilteredPolicies(filtered);
  }, [allPolicies, searchQuery, filters]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setFilters({
      status: "all",
      propertyType: "",
      dateFrom: "",
      dateTo: "",
      sortBy: "newest"
    });
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery ||
    filters.status !== "all" ||
    filters.propertyType ||
    filters.dateFrom ||
    filters.dateTo ||
    filters.sortBy !== "newest";

  // Get user from AuthContext or cookies
  const { user } = useAuth();
  const getUserName = (): string => {
    if (user) {
      const userData = user as { fullname?: string; firstname?: string };
      return userData.fullname || userData.firstname || "User";
    }
    const storedUser = typeof window !== 'undefined' ? getCookie('user') : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser) as { fullname?: string; firstname?: string };
        return userData.fullname || userData.firstname || "User";
      } catch (e) {
        return "User";
      }
    }
    return "User";
  };
  const userName = getUserName();

  // Fetch dashboard data
  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setLoading(true);
        const token = getAuthToken('user');
        if (!token) {
          // Not logged in, set empty state
          setStats({ active: 0, expired: 0, pending: 0, collaborators: 0, completed: 0, paymentPending: 0 });
          setRecentInsurances([]);
          setSurveyedPolicies([]);
          setLoading(false);
          return;
        }

        const { builderLiabilityPolicyAPI } = await import("@/services/builderLiabilityPolicyApi");

        // Fetch Builder Liability policies
        const response = await builderLiabilityPolicyAPI.getUserPolicies({
          page: 1,
          limit: 100
        });

        const allPolicyData = response.data.policies || [];

        // Calculate stats from policies
        const completedPolicies = allPolicyData.filter((p: any) => p.status === 'completed');
        const rejectedPolicies = allPolicyData.filter((p: any) => p.status === 'rejected' || (p.status === 'completed' && p.surveyorRecommendation === 'reject'));
        const pendingPolicies = allPolicyData.filter((p: any) => p.status === 'submitted');
        const assignedPolicies = allPolicyData.filter((p: any) => p.status === 'assigned');
        const approvedPolicies = completedPolicies.filter((p: any) => p.surveyorRecommendation === 'approve');
        const paymentPendingPolicies = allPolicyData.filter((p: any) => p.status === 'payment_pending');

        // Update stats
        setStats({
          active: approvedPolicies.length,
          expired: rejectedPolicies.length,
          pending: pendingPolicies.length,
          collaborators: assignedPolicies.length,
          completed: completedPolicies.length,
          paymentPending: paymentPendingPolicies.length
        });

        // Set recent builder liabilities (first 5 items from all policies)
        setRecentInsurances(allPolicyData.slice(0, 5) || []);

        // Store all policies for report section and filtering
        setAllPolicies(allPolicyData);
        setFilteredPolicies(allPolicyData);

        // Set surveyed/completed policies for the table
        setSurveyedPolicies(completedPolicies);

      } catch (error) {
        console.error("Failed to fetch dashboard data:", error);
        // Set fallback values if API fails
        setStats({
          active: 0,
          expired: 0,
          pending: 0,
          collaborators: 0,
          completed: 0,
          paymentPending: 0
        });
      } finally {
        setLoading(false);
      }
    };

    fetchDashboardData();
  }, []);

  return (
    <>
      <div className="flex-1 flex flex-col overflow-hidden p-6">
        {/* Greeting */}
        <h1 className="text-[23px] font-extrabold pb-4">
          Hello {getUserName()}
        </h1>

        {/* Full-width Banner */}
        <div className="w-full h-[100px] sm:h-[120px] md:h-[140px] lg:h-[160px] relative mb-6">
          <div className="w-full h-full absolute">
            <div className="w-full h-full absolute opacity-20 bg-white rounded-xl border border-black" />
            <Image
              className="w-full h-full absolute rounded-xl object-cover"
              src="/abuja-bg.png"
              alt="Abuja background"
              width={500}
              height={500}
            />
            <div className="w-full h-full absolute opacity-20 bg-black rounded-xl" />
          </div>
          <div className="absolute inset-0 flex flex-col justify-center p-4">
            <div className="text-white text-sm sm:text-base md:text-lg lg:text-[17px] font-bold mb-2">
              Life is unpredictable, but your home&apos;s builder liability doesn&apos;t
              have to be.
            </div>
            <div className="text-white text-xs sm:text-sm md:text-base lg:text-[13px] font-semibold">
              Get peace of mind with a policy that covers you against
              life&apos;s unexpected twists
            </div>
          </div>

        </div>

        {/* Section Navigation */}
        <div className="mb-6">
          <nav className="flex space-x-8">
            <button
              onClick={() => setActiveSection('overview')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'overview'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Dashboard Overview
            </button>

            {/* <button
              onClick={() => setActiveSection('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Assessment Reports
            </button> */}
          </nav>
        </div>

        {/* Main Content and Right Sidebar */}
        <div className="flex-1 flex overflow-hidden">
          {/* Main Content */}
          <main className="flex-1 pb-8 overflow-y-auto">
            {activeSection === 'overview' && (
              <>
                {/* Notification Tester - Temporary for debugging */}
                {/* <NotificationTester /> */}

                {/* Stats */}
                <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  {[
                    {
                      title: "Approved Policies",
                      count: loading ? "..." : stats.active,
                      color: "bg-[#fda5fc]",
                      icon: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 15 15"
                        >
                          <path
                            fill="white"
                            fill-rule="evenodd"
                            d="M.877 7.5a6.623 6.623 0 1 1 13.246 0a6.623 6.623 0 0 1-13.246 0M7.5 1.827a5.673 5.673 0 0 0-4.193 9.494A4.97 4.97 0 0 1 7.5 9.025a4.97 4.97 0 0 1 4.193 2.296A5.673 5.673 0 0 0 7.5 1.827m3.482 10.152A4.02 4.02 0 0 0 7.5 9.975a4.02 4.02 0 0 0-3.482 2.004A5.65 5.65 0 0 0 7.5 13.173c1.312 0 2.52-.446 3.482-1.194M5.15 6.505a2.35 2.35 0 1 1 4.7 0a2.35 2.35 0 0 1-4.7 0m2.35-1.4a1.4 1.4 0 1 0 0 2.8a1.4 1.4 0 0 0 0-2.8"
                            clip-rule="evenodd"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Rejected Policies",
                      count: loading ? "..." : stats.expired,
                      color: "bg-[#7be0d4]",
                      icon: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1em"
                          height="1em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="white"
                            d="M12 8H4a2 2 0 0 0-2 2v4a2 2 0 0 0 2 2h1v4a1 1 0 0 0 1 1h2a1 1 0 0 0 1-1v-4h3l5 4V4zm3 7.6L13 14H4v-4h9l2-1.6zm6.5-3.6c0 1.71-.96 3.26-2.5 4V8c1.53.75 2.5 2.3 2.5 4"
                          />
                        </svg>
                      ),
                    },
                    {
                      title: "Pending Policies",
                      count: loading ? "..." : stats.pending,
                      color: "bg-[#fad572]",
                      icon: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.2em"
                          height="1.2em"
                          viewBox="0 0 24 24"
                        >
                          <g fill="none" fill-rule="evenodd">
                            <path d="m12.593 23.258l-.011.002l-.071.035l-.02.004l-.014-.004l-.071-.035q-.016-.005-.024.005l-.004.01l-.017.428l.005.02l.01.013l.104.074l.015.004l.012-.004l.104-.074l.012-.016l.004-.017l-.017-.427q-.004-.016-.017-.018m.265-.113l-.013.002l-.185.093l-.01.01l-.003.011l.018.43l.005.012l.008.007l.201.093q.019.005.029-.008l.004-.014l-.034-.614q-.005-.018-.02-.022m-.715.002a.02.02 0 0 0-.027.006l-.006.014l-.034.614q.001.018.017.024l.015-.002l.201-.093l.01-.008l.004-.011l.017-.43l-.003-.012l-.01-.01z" />
                            <path
                              fill="white"
                              fill-rule="nonzero"
                              d="M6.72 16.64a1 1 0 0 1 .56 1.92c-.5.146-.86.3-1.091.44c.238.143.614.303 1.136.452C8.48 19.782 10.133 20 12 20s3.52-.218 4.675-.548c.523-.149.898-.309 1.136-.452c-.23-.14-.59-.294-1.09-.44a1 1 0 0 1 .559-1.92c.668.195 1.28.445 1.75.766c.435.299.97.82.97 1.594c0 .783-.548 1.308-.99 1.607c-.478.322-1.103.573-1.786.768C15.846 21.77 14 22 12 22s-3.846-.23-5.224-.625c-.683-.195-1.308-.446-1.786-.768c-.442-.3-.99-.824-.99-1.607c0-.774.535-1.295.97-1.594c.47-.321 1.082-.571 1.75-.766M12 2a7.5 7.5 0 0 1 7.5 7.5c0 2.568-1.4 4.656-2.85 6.14a16.4 16.4 0 0 1-1.853 1.615c-.594.446-1.952 1.282-1.952 1.282a1.71 1.71 0 0 1-1.69 0a21 21 0 0 1-1.952-1.282A16 16 0 0 1 7.35 15.64C5.9 14.156 4.5 12.068 4.5 9.5A7.5 7.5 0 0 1 12 2m0 2a5.5 5.5 0 0 0-5.5 5.5c0 1.816.996 3.428 2.28 4.74c.966.988 2.03 1.74 2.767 2.202l.453.274l.453-.274c.736-.462 1.801-1.214 2.767-2.201c1.284-1.313 2.28-2.924 2.28-4.741A5.5 5.5 0 0 0 12 4m0 2.5a3 3 0 1 1 0 6a3 3 0 0 1 0-6m0 2a1 1 0 1 0 0 2a1 1 0 0 0 0-2"
                            />
                          </g>
                        </svg>
                      ),
                    },
                    {
                      title: "Assigned Policies",
                      count: loading ? "..." : stats.collaborators,
                      color: "bg-[#8b9fef]",
                      icon: (
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="1.2em"
                          height="1.2em"
                          viewBox="0 0 24 24"
                        >
                          <path
                            fill="none"
                            stroke="white"
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="1.75"
                            d="m3.282 21.782l4.278-4.278M21.782 3.282L17.673 7.39m-3.363 3.363a2.64 2.64 0 0 0-1.063-1.063a2.625 2.625 0 1 0-2.494 4.62m3.557-3.557l-3.557 3.557m3.557-3.557l3.363-3.363m-6.92 6.92L7.56 17.504M17.673 7.39c-.38-.319-.791-.621-1.232-.894C15.2 5.726 13.717 5.19 12 5.19c-4.956 0-7.948 4.459-8.91 6.16c-.11.196-.165.293-.197.446a1.2 1.2 0 0 0 0 .408c.032.152.088.25.198.445c.51.903 1.593 2.582 3.237 3.96c.38.319.791.621 1.232.895m12.18-7.925c.528.694.919 1.328 1.17 1.773c.11.194.165.292.197.444c.023.112.023.296 0 .408c-.032.152-.087.25-.197.444c-.96 1.702-3.95 6.162-8.91 6.162q-.714-.002-1.374-.117"
                          />
                        </svg>
                      ),
                    },
                  ].map((stat, index) => (
                    <div
                      key={index}
                      className="bg-white rounded-[9px] p-4 flex items-center min-w-0 overflow-hidden"
                    >
                      <div
                        className={`w-[53px] h-[58px] ${stat.color} rounded-lg mr-4 flex items-center justify-center text-2xl flex-shrink-0`}
                      >
                        {stat.icon}
                      </div>
                      <div className="flex-1 min-w-0">
                        <div className="text-xl font-bold mb-2">{stat.count}</div>
                        <div className="text-[11px] text-[#817e7e] truncate">
                          {stat.title}
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Quick Actions */}
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
                  <button
                    onClick={() => setShowBuilderLiabilityForm(true)}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm font-medium opacity-90">New Policy</div>
                        <div className="text-xs opacity-75">Builder Liability</div>
                      </div>
                      <Plus className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    onClick={() => setActiveSection('reports')}
                    className="bg-gradient-to-r from-green-600 to-green-700 text-white p-4 rounded-xl hover:from-green-700 hover:to-green-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm font-medium opacity-90">View Reports</div>
                        <div className="text-xs opacity-75">Assessment Details</div>
                      </div>
                      <BarChart3 className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    onClick={() => window.open('https://niip.ng/', '_blank')}
                    className="bg-gradient-to-r from-purple-600 to-purple-700 text-white p-4 rounded-xl hover:from-purple-700 hover:to-purple-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm font-medium opacity-90">Insurance Portal</div>
                        <div className="text-xs opacity-75">NIIP Website</div>
                      </div>
                      <Shield className="w-6 h-6" />
                    </div>
                  </button>

                  <button
                    onClick={() => {
                      const helpSection = document.getElementById('help-section');
                      if (helpSection) {
                        helpSection.scrollIntoView({ behavior: 'smooth' });
                      }
                    }}
                    className="bg-gradient-to-r from-orange-600 to-orange-700 text-white p-4 rounded-xl hover:from-orange-700 hover:to-orange-800 transition-all duration-200 shadow-sm hover:shadow-md"
                  >
                    <div className="flex items-center justify-between">
                      <div className="text-left">
                        <div className="text-sm font-medium opacity-90">Need Help?</div>
                        <div className="text-xs opacity-75">Support Guide</div>
                      </div>
                      <HelpCircle className="w-6 h-6" />
                    </div>
                  </button>
                </div>

                {/* Search and Filter Bar */}
                <div className="bg-white rounded-xl p-4 mb-6 shadow-sm border border-gray-200">
                  <div className="flex flex-col sm:flex-row gap-3 mb-4">
                    {/* Search Input */}
                    <div className="flex-1 relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                      <input
                        type="text"
                        placeholder="Search policies by ID, address, property type..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2.5 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent transition-all"
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
                      className={`flex items-center px-4 py-2.5 border rounded-lg transition-all ${showFilters || hasActiveFilters
                        ? 'bg-blue-600 text-white border-blue-600 shadow-sm'
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
                        className="flex items-center px-4 py-2.5 text-red-600 border border-red-300 rounded-lg hover:bg-red-50 transition-all"
                      >
                        <X className="h-4 w-4 mr-2" />
                        Clear
                      </button>
                    )}
                  </div>

                  {/* Advanced Filters Panel */}
                  {showFilters && (
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 pt-4 border-t border-gray-200">
                      {/* Status Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                        <select
                          value={filters.status}
                          onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="all">All Statuses</option>
                          <option value="submitted">Submitted</option>
                          <option value="assigned">Assigned</option>
                          <option value="surveyed">Surveyed</option>
                          <option value="approved">Approved</option>
                          <option value="payment_pending">Payment Pending</option>
                          <option value="completed">Completed</option>
                          <option value="rejected">Rejected</option>
                        </select>
                      </div>

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

                      {/* Sort By Filter */}
                      <div>
                        <label className="block text-sm font-medium text-gray-700 mb-1">Sort By</label>
                        <select
                          value={filters.sortBy}
                          onChange={(e) => setFilters({ ...filters, sortBy: e.target.value })}
                          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                        >
                          <option value="newest">Newest First</option>
                          <option value="oldest">Oldest First</option>
                          <option value="value-high">Highest Value</option>
                          <option value="value-low">Lowest Value</option>
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
                    </div>
                  )}

                  {/* Results Count */}
                  <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200 mt-3">
                    <span>
                      Showing <span className="font-semibold text-gray-900">{filteredPolicies.length}</span> of{' '}
                      <span className="font-semibold text-gray-900">{allPolicies.length}</span> policies
                    </span>
                    {hasActiveFilters && (
                      <span className="text-blue-600 font-medium">Filters active</span>
                    )}
                  </div>
                </div>

                {/* Removed MergedReportsSummary - not applicable for Builder Liability policies */}

                {/* Builder Liability Policies List */}
                <div className="mt-6">
                  <BuilderLiabilityPolicyList isAdmin={false} />
                </div>

                {/* Help Section */}
                <div id="help-section" className="bg-gradient-to-r from-blue-50 to-indigo-50 rounded-xl p-6 mt-6 border border-blue-200">
                  <div className="flex items-start space-x-4">
                    <div className="w-10 h-10 bg-blue-100 rounded-full flex items-center justify-center flex-shrink-0">
                      <HelpCircle className="w-5 h-5 text-blue-600" />
                    </div>
                    <div className="flex-1">
                      <h3 className="text-lg font-semibold text-gray-900 mb-2">Need Help Getting Started?</h3>
                      <p className="text-gray-700 mb-4">
                        Welcome to your builder liability dashboard! Here's how to navigate your policy journey:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
                            <h4 className="font-medium text-gray-900">Submit Policy Request</h4>
                          </div>
                          <p className="text-sm text-gray-600">Click "New Request" to submit your property details for builder liability coverage.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">2</div>
                            <h4 className="font-medium text-gray-900">Survey & Assessment</h4>
                          </div>
                          <p className="text-sm text-gray-600">Our surveyors will assess your property and provide recommendations.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">3</div>
                            <h4 className="font-medium text-gray-900">Complete Payment</h4>
                          </div>
                          <p className="text-sm text-gray-600">Once approved, complete your premium payment to activate your policy.</p>
                        </div>

                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">4</div>
                            <h4 className="font-medium text-gray-900">Policy Active</h4>
                          </div>
                          <p className="text-sm text-gray-600">Download your certificate and access the builder liability portal for ongoing support.</p>
                        </div>
                      </div>

                      <div className="flex flex-wrap gap-3">
                        <button
                          onClick={() => setShowBuilderLiabilityForm(true)}
                          className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium flex items-center"
                        >
                          <Plus className="w-4 h-4 mr-2" />
                          Apply for Builder Liability Policy
                        </button>
                        <button
                          onClick={() => window.open('https://niip.ng/', '_blank')}
                          className="bg-white text-blue-600 border border-blue-600 px-4 py-2 rounded-lg hover:bg-blue-50 transition-colors text-sm font-medium flex items-center"
                        >
                          <Shield className="w-4 h-4 mr-2" />
                          Visit NIIP Portal
                        </button>
                        <button
                          onClick={() => {
                            const email = 'support@ammc.gov.ng';
                            const subject = 'Insurance Dashboard Support Request';
                            const body = 'Hello, I need assistance with my builder liability dashboard. Please help me with:';
                            window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                          }}
                          className="bg-white text-gray-700 border border-gray-300 px-4 py-2 rounded-lg hover:bg-gray-50 transition-colors text-sm font-medium flex items-center"
                        >
                          <Bell className="w-4 h-4 mr-2" />
                          Contact Support
                        </button>
                      </div>
                    </div>
                  </div>
                </div>
              </>
            )}

            {activeSection === 'reports' && (
              <ReportSection userPolicies={allPolicies} />
            )}
          </main>

          {/* Right Sidebar */}
          <aside className="w-[300px] space-y-6 p-4 hidden lg:block">
            {/* Quick Stats */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Quick Overview</h3>
                <TrendingUp className="w-5 h-5 text-blue-600" />
              </div>
              <div className="space-y-3">
                <div className="flex items-center justify-between p-2 bg-blue-50 rounded-lg">
                  <div className="flex items-center">
                    <Clock className="w-4 h-4 text-blue-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">In Progress</span>
                  </div>
                  <span className="text-lg font-bold text-blue-600">{stats.pending + stats.active}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-green-50 rounded-lg">
                  <div className="flex items-center">
                    <CheckCircle className="w-4 h-4 text-green-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Completed</span>
                  </div>
                  <span className="text-lg font-bold text-green-600">{stats.completed}</span>
                </div>
                <div className="flex items-center justify-between p-2 bg-orange-50 rounded-lg">
                  <div className="flex items-center">
                    <CreditCard className="w-4 h-4 text-orange-600 mr-2" />
                    <span className="text-sm font-medium text-gray-700">Payment Due</span>
                  </div>
                  <span className="text-lg font-bold text-orange-600">{stats.paymentPending}</span>
                </div>
              </div>
            </div>

            {/* Recent Activity */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-bold text-gray-900">Recent Activity</h3>
                <Users className="w-5 h-5 text-gray-600" />
              </div>
              <div className="space-y-3">
                {recentInsurances.slice(0, 3).map((policy, index) => (
                  <div key={policy._id || index} className="flex items-start space-x-3 p-2 hover:bg-gray-50 rounded-lg transition-colors">
                    <div className="w-8 h-8 rounded-full bg-blue-100 flex items-center justify-center flex-shrink-0">
                      <Home className="w-4 h-4 text-blue-600" />
                    </div>
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium text-gray-900 truncate">
                        {policy.propertyDetails?.propertyType || 'Property'}
                      </div>
                      <div className="text-xs text-gray-500 truncate">
                        {policy.propertyDetails?.address || 'No address'}
                      </div>
                      <div className="text-xs text-gray-400">
                        {new Date(policy.createdAt).toLocaleDateString()}
                      </div>
                    </div>
                    <div className={`px-2 py-1 rounded-full text-xs font-medium ${policy.status === 'completed' ? 'bg-green-100 text-green-800' :
                      policy.status === 'approved' ? 'bg-blue-100 text-blue-800' :
                        policy.status === 'surveyed' ? 'bg-purple-100 text-purple-800' :
                          'bg-gray-100 text-gray-800'
                      }`}>
                      {policy.status}
                    </div>
                  </div>
                ))}
                {recentInsurances.length === 0 && (
                  <div className="text-center py-4 text-gray-500">
                    <FileText className="w-8 h-8 mx-auto mb-2 opacity-50" />
                    <p className="text-sm">No recent activity</p>
                  </div>
                )}
              </div>
            </div>

            {/* Quick Actions */}
            <div className="bg-white rounded-xl p-4 shadow-sm border border-gray-200">
              <h3 className="text-lg font-bold text-gray-900 mb-4">Quick Actions</h3>
              <div className="space-y-2">
                <button
                  onClick={() => setShowBuilderLiabilityForm(true)}
                  className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <Plus className="w-4 h-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-900">New Builder Liability Policy</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => setActiveSection('reports')}
                  className="w-full flex items-center justify-between p-3 text-left bg-green-50 hover:bg-green-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <BarChart3 className="w-4 h-4 text-green-600 mr-3" />
                    <span className="text-sm font-medium text-green-900">View Reports</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-green-600 group-hover:translate-x-1 transition-transform" />
                </button>

                <button
                  onClick={() => window.open('https://niip.ng/', '_blank')}
                  className="w-full flex items-center justify-between p-3 text-left bg-purple-50 hover:bg-purple-100 rounded-lg transition-colors group"
                >
                  <div className="flex items-center">
                    <Shield className="w-4 h-4 text-purple-600 mr-3" />
                    <span className="text-sm font-medium text-purple-900">Insurance Portal</span>
                  </div>
                  <ArrowRight className="w-4 h-4 text-purple-600 group-hover:translate-x-1 transition-transform" />
                </button>
              </div>
            </div>

            {/* Support */}
            <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-xl p-4 border border-orange-200">
              <div className="flex items-center mb-3">
                <HelpCircle className="w-5 h-5 text-orange-600 mr-2" />
                <h3 className="text-lg font-bold text-orange-900">Need Help?</h3>
              </div>
              <p className="text-sm text-orange-800 mb-3">
                Our support team is here to help you with your builder liability needs.
              </p>
              <button
                onClick={() => {
                  const email = 'support@ammc.gov.ng';
                  const subject = 'Insurance Dashboard Support Request';
                  const body = 'Hello, I need assistance with my builder liability dashboard. Please help me with:';
                  window.location.href = `mailto:${email}?subject=${encodeURIComponent(subject)}&body=${encodeURIComponent(body)}`;
                }}
                className="w-full bg-orange-600 text-white px-4 py-2 rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium flex items-center justify-center"
              >
                <Bell className="w-4 h-4 mr-2" />
                Contact Support
              </button>
            </div>
          </aside>
        </div>
      </div>

      {showBuilderLiabilityForm && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
          <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
              <h2 className="text-xl font-bold">Builder Liability Policy Application</h2>
              <button
                onClick={() => setShowBuilderLiabilityForm(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6">
              <BuilderLiabilityPolicyForm
                onSuccess={(policyId) => {
                  alert('Builder Liability Policy application submitted successfully!');
                  setShowBuilderLiabilityForm(false);
                  // Trigger a page refresh to show the new policy
                  window.location.reload();
                }}
                onCancel={() => setShowBuilderLiabilityForm(false)}
              />
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default Dashview;