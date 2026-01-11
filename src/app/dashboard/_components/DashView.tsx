"use client";
import React, { useState, useEffect } from "react";
import { BuilderLiabilityPolicyForm } from '@/components/builderLiability/PolicyForm';
// DEPRECATED: Legacy property insurance form - system now uses Builder Liability Policy exclusively
// import PolicyRequestForm from "@/components/dashboard/PolicyRequestForm";
import ReportSection from "@/components/dashboard/ReportSection";
import MergedReportsSummary from "@/components/user/MergedReportsSummary";
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
  const getUserName = () => {
    if (user) {
      return (user as any).fullname || (user as any).firstname || "User";
    }
    const storedUser = typeof window !== 'undefined' ? getCookie('user') : null;
    if (storedUser) {
      try {
        const userData = JSON.parse(storedUser);
        return userData.fullname || userData.firstname || "User";
      } catch (e) {
        return "User";
      }
    }
    return "User";
  };
  const userName = getUserName();
  const nameParts = userName?.split(" ") ?? [];
  const lastName = nameParts[nameParts.length - 1] || "User";

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

        const { getUserPolicyRequests } = await import("@/services/api");

        // Fetch all policy requests to calculate stats
        const [allPolicies, approvedPolicies, rejectedPolicies, pendingPolicies, surveyedPolicies, completedPolicies, paymentPendingPolicies] = await Promise.all([
          getUserPolicyRequests('all', 1, 100),
          getUserPolicyRequests('approved', 1, 100),
          getUserPolicyRequests('rejected', 1, 100),
          getUserPolicyRequests('submitted', 1, 100),
          getUserPolicyRequests('surveyed', 1, 100),
          getUserPolicyRequests('completed', 1, 100),
          getUserPolicyRequests('payment_pending', 1, 100).catch(() => ({ data: { policyRequests: [] } }))
        ]);

        // Calculate collaborators from all policies
        const allPolicyData = allPolicies?.data?.policyRequests || [];
        const assignedPolicies = allPolicyData.filter((p: PolicyRequest) => p.status === 'assigned' || p.status === 'surveyed');
        const collaborators = assignedPolicies.length; // Simple count of policies with surveyors

        // Update stats
        setStats({
          active: approvedPolicies?.data?.policyRequests?.length || 0,
          expired: rejectedPolicies?.data?.policyRequests?.length || 0,
          pending: pendingPolicies?.data?.policyRequests?.length || 0,
          collaborators: collaborators,
          completed: completedPolicies?.data?.policyRequests?.length || 0,
          paymentPending: paymentPendingPolicies?.data?.policyRequests?.length || 0
        });

        // Set recent insurances (first 5 items from all policies)
        setRecentInsurances(allPolicyData.slice(0, 5) || []);

        // Store all policies for report section and filtering
        setAllPolicies(allPolicyData);
        setFilteredPolicies(allPolicyData);

        // Combine surveyed and approved policies for the "Surveyed Policies" table
        const surveyedData = surveyedPolicies?.data?.policyRequests || [];
        const approvedData = approvedPolicies?.data?.policyRequests || [];
        const combinedSurveyedPolicies = [...surveyedData, ...approvedData];
        setSurveyedPolicies(combinedSurveyedPolicies);

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
          Hello {lastName}
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
              Life is unpredictable, but your home insurance doesn&apos;t
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
            <button
              onClick={() => setActiveSection('reports')}
              className={`py-2 px-1 border-b-2 font-medium text-sm ${activeSection === 'reports'
                ? 'border-blue-500 text-blue-600'
                : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
                }`}
            >
              Assessment Reports
            </button>
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

                {/* Merged Reports Summary */}
                <MergedReportsSummary />

                {/* Enhanced Policies Table */}
                <div className="w-full bg-white rounded-xl p-4 overflow-x-auto mt-6 shadow-sm border border-gray-200">
                  <div className="flex justify-between items-center mb-4">
                    <h3 className="text-lg font-bold">Recent Policy Activity</h3>
                    <div className="flex items-center space-x-2">
                      <button
                        onClick={() => {
                          // Refresh data
                          window.location.reload();
                        }}
                        className="p-2 text-gray-500 hover:text-gray-700 hover:bg-gray-100 rounded-lg transition-colors"
                        title="Refresh"
                      >
                        <RefreshCw className="w-4 h-4" />
                      </button>
                    </div>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full min-w-[720px]">
                      <thead>
                        <tr className="text-left border-b">
                          <th className="pb-2 font-bold">Name</th>
                          <th className="pb-2 font-bold">Survey Date</th>
                          <th className="pb-2 font-bold">AMMC Policy ID</th>
                          <th className="pb-2 font-bold">Status</th>
                          <th className="pb-2 font-bold">Actions</th>
                        </tr>
                      </thead>
                      <tbody>
                        {loading ? (
                          // Loading state
                          Array.from({ length: 3 }).map((_, index) => (
                            <tr key={index} className="border-b animate-pulse">
                              <td className="py-4">
                                <div className="h-4 bg-gray-200 rounded w-32"></div>
                              </td>
                              <td className="py-4">
                                <div className="h-4 bg-gray-200 rounded w-24"></div>
                              </td>
                              <td className="py-4">
                                <div className="h-4 bg-gray-200 rounded w-20"></div>
                              </td>
                              <td className="py-4">
                                <div className="h-6 bg-gray-200 rounded w-16"></div>
                              </td>
                              <td className="py-4">
                                <div className="w-32 h-8 bg-gray-200 rounded"></div>
                              </td>
                            </tr>
                          ))
                        ) : filteredPolicies.length > 0 ? (
                          filteredPolicies.slice(0, 10).map((item, index) => (
                            <tr key={item._id || index} className="border-b">
                              <td className="py-4 text-[#1e1e1e] text-[17px] font-medium">
                                {item.requestDetails?.coverageType || "Insurance Policy"}
                              </td>
                              <td className="py-4 text-[#2a2828] text-base font-medium">
                                {item.updatedAt ? new Date(item.updatedAt).toLocaleDateString('en-US', {
                                  year: 'numeric',
                                  month: 'short',
                                  day: '2-digit'
                                }) : "N/A"}
                              </td>
                              <td className="py-4 text-[#2a2828] text-base font-medium">
                                {item._id?.substring(0, 7).toUpperCase() || "N/A"}
                              </td>
                              <td className="py-4">
                                <span
                                  className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize bg-blue-500`}
                                >
                                  {item.status || "Unknown"}
                                </span>
                              </td>
                              <td className="py-4">
                                <PolicyActionsDropdown policy={item} />
                              </td>
                            </tr>
                          ))
                        ) : (
                          // Empty state
                          <tr className="border-b">
                            <td colSpan={5} className="py-8 text-center text-gray-500">
                              <div className="flex flex-col items-center">
                                {hasActiveFilters ? (
                                  <>
                                    <Search className="w-12 h-12 mb-2 text-gray-400" />
                                    <p className="font-medium">No policies match your filters</p>
                                    <p className="text-sm mb-3">Try adjusting your search criteria or clearing filters.</p>
                                    <button
                                      onClick={clearFilters}
                                      className="text-blue-600 hover:text-blue-700 text-sm font-medium"
                                    >
                                      Clear all filters
                                    </button>
                                  </>
                                ) : (
                                  <>
                                    <FileText className="w-12 h-12 mb-2 text-gray-400" />
                                    <p className="font-medium">No policies yet</p>
                                    <p className="text-sm mb-3">Start by submitting your first Builder Liability Policy application.</p>
                                    <button
                                      onClick={() => setShowBuilderLiabilityForm(true)}
                                      className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                                    >
                                      Apply for Builder Liability Policy
                                    </button>
                                  </>
                                )}
                              </div>
                            </td>
                          </tr>
                        )}
                      </tbody>
                    </table>
                  </div>
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
                        Welcome to your insurance dashboard! Here's how to navigate your policy journey:
                      </p>

                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                        <div className="bg-white p-4 rounded-lg border border-blue-200">
                          <div className="flex items-center mb-2">
                            <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-2">1</div>
                            <h4 className="font-medium text-gray-900">Submit Policy Request</h4>
                          </div>
                          <p className="text-sm text-gray-600">Click "New Request" to submit your property details for insurance coverage.</p>
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
                          <p className="text-sm text-gray-600">Download your certificate and access the insurance portal for ongoing support.</p>
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
                            const body = 'Hello, I need assistance with my insurance dashboard. Please help me with:';
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
                Our support team is here to help you with your insurance needs.
              </p>
              <button
                onClick={() => {
                  const email = 'support@ammc.gov.ng';
                  const subject = 'Insurance Dashboard Support Request';
                  const body = 'Hello, I need assistance with my insurance dashboard. Please help me with:';
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

// Policy Actions Dropdown Component
interface PolicyActionsDropdownProps {
  policy: PolicyRequest;
}

const PolicyActionsDropdown: React.FC<PolicyActionsDropdownProps> = ({ policy }) => {
  const [showDropdown, setShowDropdown] = useState(false);
  const [showSurveyModal, setShowSurveyModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [surveyData, setSurveyData] = useState<import('@/types/survey.types').SurveyDataType | null>(null);
  const [loadingSurveyData, setLoadingSurveyData] = useState(false);

  // Fetch survey data when dropdown opens
  useEffect(() => {
    if (showDropdown && !surveyData && !loadingSurveyData) {
      fetchSurveyData();
    }
  }, [showDropdown]);

  const fetchSurveyData = async () => {
    setLoadingSurveyData(true);
    try {
      console.log('Fetching survey data for policy:', policy._id);
      console.log('Policy status:', policy.status);

      const { getUserAssignmentByAmmcId } = await import('@/services/api');
      const assignmentResponse = await getUserAssignmentByAmmcId(policy._id);
      console.log('Assignment response:', assignmentResponse);

      if (assignmentResponse.success && assignmentResponse.data) {
        const assignment = assignmentResponse.data;
        console.log('Assignment data:', assignment);

        const { getSubmissionByAssignment } = await import('@/services/api');
        const surveyResponse = await getSubmissionByAssignment(assignment._id);
        console.log('Survey response:', surveyResponse);

        if (surveyResponse.success && surveyResponse.data.submission) {
          console.log('Survey data loaded:', surveyResponse.data.submission);
          setSurveyData(surveyResponse.data.submission);
        } else {
          console.log('No survey submission found');
        }
      } else {
        console.log('No assignment found for policy');
      }
    } catch (error) {
      console.error('Failed to fetch survey data:', error);
    } finally {
      setLoadingSurveyData(false);
    }
  };

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      const target = event.target as Element;
      if (showDropdown && !target.closest('.dropdown-container')) {
        setShowDropdown(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, [showDropdown]);

  const handlePaymentClick = async () => {
    console.log('Payment click - Policy status:', policy.status);
    console.log('Payment click - Survey data:', surveyData);
    console.log('Payment click - Recommended action:', surveyData?.recommendedAction);

    // Calculate premium
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

    // Check if policy is eligible for payment
    const isEligibleForPayment =
      policy.status === 'approved' ||
      (policy.status === 'surveyed' && surveyData?.recommendedAction === 'approve') ||
      (policy.status === 'surveyed' && !surveyData); // Fallback for surveyed without explicit data

    if (!isEligibleForPayment) {
      if (surveyData?.recommendedAction === 'reject') {
        alert('❌ Payment Disabled\n\nThis policy request has been rejected by the surveyor. Please review the survey report for details.');
        return;
      }
      if (surveyData?.recommendedAction === 'request_more_info') {
        alert('⚠️ Payment Disabled\n\nThe surveyor has requested additional information. Please edit and resubmit your policy request before proceeding to payment.');
        return;
      }
      alert('⚠️ Payment Not Available\n\nPayment is not available for this policy at this time. Please check the policy status.');
      return;
    }

    // Show payment confirmation
    // const premium = calculatePolicyPremium(policy);
    const confirmed = confirm(
      `💳 Complete Payment for ${policy.propertyDetails.propertyType}\n\n` +
      `Property Value: ₦${policy.propertyDetails.buildingValue.toLocaleString()}\n` +
      `Click OK to proceed to payment gateway.`
    );

    if (confirmed) {
      try {
        // Call the payment webhook to simulate payment processing
        const response = await fetch(`http://localhost:5000/api/v1/admin/enforcement/webhook/test/${policy._id}?status=payment_approved`);
        const data = await response.json();

        if (response.ok) {
          alert('✅ Payment completed successfully!\n\nYour policy is now active and has been moved to the Completed section.');
          // Refresh the page to show updated status
          window.location.reload();
        } else {
          alert(`❌ Payment failed: ${data.message}`);
        }
      } catch (error) {
        console.error('Payment processing failed:', error);
        alert('❌ Payment failed: Network error. Please try again.');
      }
    }
  };

  return (
    <div className="relative dropdown-container">
      <button
        onClick={() => setShowDropdown(!showDropdown)}
        className="p-2 hover:bg-gray-100 rounded-full transition-colors"
      >
        <MoreVertical className="h-4 w-4" />
      </button>

      {showDropdown && (
        <div className="absolute right-0 mt-2 w-56 bg-white rounded-md shadow-lg z-10 border">
          <div className="py-1">
            {/* Always show survey details */}
            <button
              onClick={() => {
                setShowSurveyModal(true);
                setShowDropdown(false);
              }}
              className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
            >
              <Eye className="mr-3 h-4 w-4" />
              View Survey Details
            </button>

            {/* Always show survey document download if available */}
            {policy.surveyDocument && (
              <a
                href={typeof policy.surveyDocument === 'string' ? policy.surveyDocument : policy.surveyDocument.url}
                target="_blank"
                rel="noopener noreferrer"
                onClick={() => setShowDropdown(false)}
                className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
              >
                <Download className="mr-3 h-4 w-4" />
                Download Survey Report
              </a>
            )}

            {/* Conditional actions based on surveyor recommendation */}
            {loadingSurveyData ? (
              <div className="flex items-center px-4 py-2 text-sm text-gray-500">
                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-gray-400 mr-3"></div>
                Loading...
              </div>
            ) : (
              <>
                {/* Payment button - conditional based on recommendation and policy status */}
                {(policy.status === 'approved' ||
                  policy.status === 'surveyed') && (
                    <button
                      onClick={() => {
                        handlePaymentClick();
                        setShowDropdown(false);
                      }}
                      className={`flex items-center px-4 py-2 text-sm w-full text-left ${
                        // Enable if: approved by admin, approved by surveyor, or surveyed without explicit rejection
                        (policy.status === 'approved' ||
                          surveyData?.recommendedAction === 'approve' ||
                          (policy.status === 'surveyed' && !surveyData) ||
                          (policy.status === 'surveyed' && loadingSurveyData))
                          ? 'text-gray-700 hover:bg-gray-100'
                          : 'text-gray-400 cursor-not-allowed'
                        }`}
                      disabled={
                        // Disable only if: explicitly rejected or explicitly requesting more info
                        surveyData?.recommendedAction === 'reject' ||
                        surveyData?.recommendedAction === 'request_more_info'
                      }
                    >
                      <CreditCard className="mr-3 h-4 w-4" />
                      <div className="flex flex-col">
                        <span>Complete Payment</span>
                        {policy.status === 'approved' && (
                          <span className="text-xs text-green-500">Policy Approved - Payment Required</span>
                        )}
                        {surveyData?.recommendedAction === 'approve' && policy.status !== 'approved' && (
                          <span className="text-xs text-blue-500">Survey Approved - Payment Required</span>
                        )}
                        {policy.status === 'surveyed' && !surveyData && !loadingSurveyData && (
                          <span className="text-xs text-green-500">Survey Completed - Payment Required</span>
                        )}
                        {loadingSurveyData && (
                          <span className="text-xs text-gray-500">Loading...</span>
                        )}
                        {surveyData?.recommendedAction === 'reject' && (
                          <span className="text-xs text-red-500">Policy Rejected</span>
                        )}
                        {surveyData?.recommendedAction === 'request_more_info' && (
                          <span className="text-xs text-orange-500">More Info Required</span>
                        )}
                      </div>
                    </button>
                  )}

                {/* Edit Policy - only show if more info is requested */}
                {surveyData?.recommendedAction === 'request_more_info' && (
                  <button
                    onClick={() => {
                      setShowEditModal(true);
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-blue-600 hover:bg-blue-50 w-full text-left"
                  >
                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M11 5H6a2 2 0 00-2 2v11a2 2 0 002 2h11a2 2 0 002-2v-5m-1.414-9.414a2 2 0 112.828 2.828L11.828 15H9v-2.828l8.586-8.586z" />
                    </svg>
                    <div className="flex flex-col">
                      <span>Edit Policy Request</span>
                      <span className="text-xs text-gray-500">Update & Resubmit</span>
                    </div>
                  </button>
                )}

                {/* Certificate download - only for completed policies (payment confirmed) */}
                {policy.status === 'completed' && (
                  <button
                    onClick={() => {
                      // Handle policy certificate download
                      alert('📄 Certificate Download\n\nYour policy certificate is being prepared. You will receive it via email shortly.');
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <FileText className="mr-3 h-4 w-4" />
                    <div className="flex flex-col">
                      <span>Download Certificate</span>
                      <span className="text-xs text-green-500">Payment Confirmed</span>
                    </div>
                  </button>
                )}

                {/* Insurance portal link - only for completed policies */}
                {policy.status === 'completed' && (
                  <button
                    onClick={() => {
                      window.open('https://niip.ng/', '_blank');
                      setShowDropdown(false);
                    }}
                    className="flex items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100 w-full text-left"
                  >
                    <svg className="mr-3 h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                    </svg>
                    <div className="flex flex-col">
                      <span>View Insurance Portal</span>
                      <span className="text-xs text-blue-500">Policy Active</span>
                    </div>
                  </button>
                )}
              </>
            )}
          </div>
        </div>
      )}

      {/* Survey Details Modal */}
      {showSurveyModal && (
        <SurveyDetailsModal
          policy={policy}
          onClose={() => setShowSurveyModal(false)}
        />
      )}

      {/* Edit Policy Modal */}
      {showEditModal && (
        <EditPolicyModal
          policy={policy}
          surveyData={surveyData}
          onClose={() => setShowEditModal(false)}
          onUpdate={() => {
            setShowEditModal(false);
            // Refresh the page or update the policy list
            window.location.reload();
          }}
        />
      )}
    </div>
  );
};

// Survey Details Modal Component
interface SurveyDetailsModalProps {
  policy: PolicyRequest;
  onClose: () => void;
}

const SurveyDetailsModal: React.FC<SurveyDetailsModalProps> = ({ policy, onClose }) => {
  const [surveyData, setSurveyData] = useState<import('@/types/survey.types').SurveyDataType | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    const fetchSurveyData = async () => {
      try {
        console.log('Fetching survey data for policy:', policy._id);

        // Get assignment for this policy
        const { getUserAssignmentByAmmcId } = await import('@/services/api');
        const assignmentResponse = await getUserAssignmentByAmmcId(policy._id);

        console.log('Assignment response:', assignmentResponse);

        if (assignmentResponse.success && assignmentResponse.data) {
          const assignment = assignmentResponse.data;
          console.log('Assignment found:', assignment);

          // Get survey submission
          const { getSubmissionByAssignment } = await import('@/services/api');
          const surveyResponse = await getSubmissionByAssignment(assignment._id);

          console.log('Survey response:', surveyResponse);

          if (surveyResponse.success && surveyResponse.data) {
            // Handle both .submission and direct data structures
            const submission = surveyResponse.data.submission || surveyResponse.data;
            console.log('Survey data loaded:', submission);
            setSurveyData(submission);
          } else {
            console.log('No survey submission found');
          }
        } else {
          console.log('No assignment found for policy');
        }
      } catch (error) {
        console.error('Failed to fetch survey data:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchSurveyData();
  }, [policy._id]);

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Survey Details</h3>
              <p className="text-sm text-gray-500 mt-1">
                Policy #{policy._id?.substring(0, 8).toUpperCase()} • {policy.propertyDetails?.propertyType}
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
        </div>

        {/* Modal Content */}
        <div className="p-6 bg-white overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
          {loading ? (
            <div className="text-center py-8">
              <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600 mx-auto"></div>
              <p className="text-gray-500 mt-2">Loading survey details...</p>
            </div>
          ) : !surveyData ? (
            <div className="text-center py-12 text-gray-500">
              <Eye className="w-16 h-16 mx-auto mb-4 opacity-30" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">Survey Details Not Available</h3>
              <div className="space-y-2 text-sm">
                <p>This could happen for several reasons:</p>
                <ul className="text-left max-w-md mx-auto space-y-1">
                  <li>• Survey has not been completed yet</li>
                  <li>• Policy has not been assigned to a surveyor</li>
                  <li>• Survey data is still being processed</li>
                </ul>
              </div>
              <div className="mt-6 p-4 bg-blue-50 rounded-lg max-w-md mx-auto">
                <p className="text-sm text-blue-800">
                  <strong>Policy Status:</strong> <span className="capitalize">{policy.status}</span>
                </p>
                {policy.status === 'submitted' && (
                  <p className="text-xs text-blue-600 mt-1">
                    Your policy is awaiting surveyor assignment.
                  </p>
                )}
                {policy.status === 'assigned' && (
                  <p className="text-xs text-blue-600 mt-1">
                    A surveyor has been assigned and will contact you soon.
                  </p>
                )}
              </div>
            </div>
          ) : (
            <div className="space-y-6">
              {/* Survey Summary */}
              <div className="bg-gradient-to-r from-blue-50 to-indigo-50 p-6 rounded-lg border border-blue-200">
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="text-center">
                    <div className="text-2xl font-bold text-blue-600 mb-1">
                      {surveyData.status?.toUpperCase() || 'PENDING'}
                    </div>
                    <div className="text-sm text-blue-800">Survey Status</div>
                  </div>
                  <div className="text-center">
                    <div className={`text-2xl font-bold mb-1 ${surveyData.recommendedAction === 'approve' ? 'text-green-600' :
                      surveyData.recommendedAction === 'reject' ? 'text-red-600' :
                        'text-yellow-600'
                      }`}>
                      {surveyData.recommendedAction === 'approve' && '✅ APPROVED'}
                      {surveyData.recommendedAction === 'reject' && '❌ REJECTED'}
                      {surveyData.recommendedAction === 'request_more_info' && '📋 INFO NEEDED'}
                      {!surveyData.recommendedAction && '⏳ PENDING'}
                    </div>
                    <div className="text-sm text-gray-600">Recommendation</div>
                  </div>
                  <div className="text-center">
                    <div className="text-2xl font-bold text-gray-600 mb-1">
                      {surveyData.submissionTime
                        ? new Date(surveyData.submissionTime).toLocaleDateString('en-US', { month: 'short', day: 'numeric' })
                        : 'N/A'
                      }
                    </div>
                    <div className="text-sm text-gray-600">Survey Date</div>
                  </div>
                </div>
              </div>

              {/* Property Information */}
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Details</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Type:</span>
                      <span className="font-medium text-gray-900">{policy.propertyDetails?.propertyType}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Value:</span>
                      <span className="font-medium text-gray-900">₦{policy.propertyDetails?.buildingValue?.toLocaleString()}</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Address:</span>
                      <span className="font-medium text-gray-900 text-right">{policy.propertyDetails?.address}</span>
                    </div>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Survey Results</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${policy.status === 'surveyed' ? 'bg-blue-100 text-blue-800' :
                        policy.status === 'approved' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                        {policy.status?.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Recommendation:</span>
                      <span className={`font-medium px-2 py-1 rounded text-xs ${surveyData.recommendedAction === 'approve' ? 'bg-green-100 text-green-800' :
                        surveyData.recommendedAction === 'reject' ? 'bg-red-100 text-red-800' :
                          'bg-yellow-100 text-yellow-800'
                        }`}>
                        {surveyData.recommendedAction === 'approve' && '✅ Approved'}
                        {surveyData.recommendedAction === 'reject' && '❌ Rejected'}
                        {surveyData.recommendedAction === 'request_more_info' && '📋 More Info Needed'}
                        {!surveyData.recommendedAction && '⏳ Pending'}
                      </span>
                    </div>
                    {surveyData.surveyDetails?.estimatedValue && (
                      <div className="flex justify-between">
                        <span className="text-gray-600">Estimated Value:</span>
                        <span className="font-medium text-gray-900">
                          ₦{surveyData.surveyDetails.estimatedValue.toLocaleString()}
                        </span>
                      </div>
                    )}
                  </div>
                </div>
              </div>

              {/* Survey Assessment */}
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Condition</h4>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.propertyCondition ||
                        'No property condition assessment provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Structural Assessment</h4>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.structuralAssessment ||
                        'No structural assessment provided'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Risk Factors</h4>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.riskFactors ||
                        'No risk factors identified'}
                    </p>
                  </div>
                </div>

                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Recommendations</h4>
                  <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                    <p className="text-sm text-gray-700">
                      {surveyData.surveyDetails?.recommendations ||
                        'No recommendations provided'}
                    </p>
                  </div>
                </div>
              </div>

              {/* Survey Notes */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Additional Survey Notes</h4>
                <div className="bg-gray-50 p-4 rounded-lg min-h-[80px]">
                  <p className="text-sm text-gray-700">
                    {surveyData.surveyNotes || 'No additional notes provided'}
                  </p>
                </div>
              </div>

              {/* Contact Log */}
              {surveyData.contactLog && surveyData.contactLog.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Surveyor Contact History</h4>
                  <div className="space-y-3">
                    {surveyData.contactLog.map((contact, index) => (
                      <div key={index} className="bg-gray-50 p-4 rounded-lg border-l-4 border-blue-500">
                        <div className="flex items-start justify-between">
                          <div className="flex-1">
                            <div className="flex items-center space-x-2 mb-2">
                              <span className={`px-2 py-1 rounded-full text-xs font-medium ${contact.successful
                                ? 'bg-green-100 text-green-800'
                                : 'bg-red-100 text-red-800'
                                }`}>
                                {contact.successful ? '✓ Successful' : '✗ Unsuccessful'}
                              </span>
                              <span className="text-xs text-gray-500 capitalize">
                                {contact.method}
                              </span>
                            </div>
                            <p className="text-sm text-gray-700 mb-1">{contact.notes}</p>
                          </div>
                          <div className="text-xs text-gray-500 ml-4">
                            {new Date(contact.date).toLocaleDateString('en-US', {
                              month: 'short',
                              day: 'numeric',
                              hour: '2-digit',
                              minute: '2-digit'
                            })}
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Survey Photos */}
              {surveyData.surveyDetails?.photos && surveyData.surveyDetails.photos.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Survey Photos</h4>
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
                    {surveyData.surveyDetails.photos.map((photo, index) => (
                      <div key={index} className="relative group">
                        <img
                          src={photo.url}
                          alt={photo.description || `Survey photo ${index + 1}`}
                          className="w-full h-32 object-cover rounded-lg border border-gray-200"
                        />
                        <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-50 transition-all duration-200 rounded-lg flex items-center justify-center">
                          <button
                            onClick={() => window.open(photo.url, '_blank')}
                            className="opacity-0 group-hover:opacity-100 bg-white text-gray-900 px-3 py-1 rounded text-sm font-medium transition-opacity"
                          >
                            View Full Size
                          </button>
                        </div>
                        {photo.description && (
                          <p className="text-xs text-gray-600 mt-1 truncate">{photo.description}</p>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {/* Survey Documents */}
              {(surveyData.surveyDocument || (surveyData.documents && surveyData.documents.length > 0)) && (
                <div className="space-y-4">
                  <h4 className="font-medium text-gray-900">Survey Documents</h4>

                  {/* Main Survey Document */}
                  {surveyData.surveyDocument && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-6 w-6 text-blue-600 mr-3" />
                          <div>
                            <h5 className="font-medium text-blue-900">Main Survey Report</h5>
                            <p className="text-sm text-blue-700">Complete survey document</p>
                          </div>
                        </div>
                        <div className="flex space-x-2">
                          <a
                            href={surveyData.surveyDocument}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors text-sm font-medium"
                          >
                            View
                          </a>
                          <a
                            href={surveyData.surveyDocument}
                            download
                            className="bg-green-600 text-white px-4 py-2 rounded-lg hover:bg-green-700 transition-colors text-sm font-medium"
                          >
                            Download
                          </a>
                        </div>
                      </div>
                    </div>
                  )}

                  {/* Additional Documents */}
                  {surveyData.documents && surveyData.documents.length > 0 && (
                    <div className="space-y-2">
                      <h5 className="font-medium text-gray-800">Additional Documents</h5>
                      {surveyData.documents.map((doc, index) => (
                        <div key={index} className="bg-gray-50 border border-gray-200 rounded-lg p-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center">
                              <FileText className="h-5 w-5 text-gray-600 mr-2" />
                              <div>
                                <p className="font-medium text-gray-900 text-sm">{doc.fileName}</p>
                                <p className="text-xs text-gray-600 capitalize">{doc.category || 'Document'}</p>
                              </div>
                            </div>
                            <div className="flex space-x-2">
                              <a
                                href={doc.cloudinaryUrl}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="bg-gray-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-gray-700 transition-colors"
                              >
                                View
                              </a>
                              <a
                                href={doc.cloudinaryUrl}
                                download={doc.fileName}
                                className="bg-green-600 text-white px-3 py-1 rounded text-xs font-medium hover:bg-green-700 transition-colors"
                              >
                                Download
                              </a>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  )}
                </div>
              )}
            </div>
          )}
        </div>

        {/* Modal Footer */}
        <div className="p-6 border-t border-gray-200 bg-gray-50">
          <div className="flex items-center justify-end">
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

// Edit Policy Modal Component
interface EditPolicyModalProps {
  policy: PolicyRequest;
  surveyData: SurveyData | null;
  onClose: () => void;
  onUpdate: () => void;
}

interface SurveyData {
  surveyDetails?: {
    propertyCondition?: string;
    structuralAssessment?: string;
    riskFactors?: string;
    recommendations?: string;
    estimatedValue?: number;
  };
  surveyNotes?: string;
  recommendedAction?: string;
}

const EditPolicyModal: React.FC<EditPolicyModalProps> = ({ policy, surveyData, onClose, onUpdate }) => {
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    propertyDetails: {
      plotNumber: policy.propertyDetails?.plotNumber || '',
      cadastralZone: policy.propertyDetails?.cadastralZone || '',
      district: policy.propertyDetails?.district || '',
      fullAddress: policy.propertyDetails?.fullAddress || policy.propertyDetails?.address || '',
      propertyType: policy.propertyDetails?.propertyType || '',
      buildingValue: policy.propertyDetails?.buildingValue || 0,
      yearBuilt: policy.propertyDetails?.yearBuilt || '',
      squareFootage: policy.propertyDetails?.squareFootage || 0,
      constructionMaterial: policy.propertyDetails?.constructionMaterial || ''
    },
    contactDetails: {
      fullName: policy.contactDetails?.fullName || '',
      email: policy.contactDetails?.email || '',
      phoneNumber: policy.contactDetails?.phoneNumber || '',
      alternatePhone: policy.contactDetails?.alternatePhone || '',
      rcNumber: policy.contactDetails?.rcNumber || ''
    },
    requestDetails: {
      coverageType: policy.requestDetails?.coverageType || '',
      policyDuration: policy.requestDetails?.policyDuration || '',
      additionalCoverage: policy.requestDetails?.additionalCoverage || [],
      specialRequests: policy.requestDetails?.specialRequests || ''
    }
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      const api = await import('@/services/api');
      // Ensure yearBuilt is a number
      const submitData = {
        ...formData,
        propertyDetails: {
          ...formData.propertyDetails,
          yearBuilt: typeof formData.propertyDetails.yearBuilt === 'string'
            ? parseInt(formData.propertyDetails.yearBuilt, 10)
            : formData.propertyDetails.yearBuilt
        }
      };
      await api.updatePolicyRequest(policy._id, submitData);
      alert('Policy request updated successfully! It will be reassigned for survey.');
      onUpdate();
    } catch (error) {
      console.error('Failed to update policy:', error);
      alert('Failed to update policy request. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  const handleInputChange = (section: string, field: string, value: string | number | string[]) => {
    setFormData(prev => ({
      ...prev,
      [section]: {
        ...prev[section as keyof typeof prev],
        [field]: value
      }
    }));
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
        {/* Modal Header */}
        <div className="p-6 border-b border-gray-200 bg-gray-50">
          <div className="flex items-start justify-between">
            <div>
              <h3 className="text-xl font-semibold text-gray-900">Edit Policy Request</h3>
              <p className="text-sm text-gray-500 mt-1">
                Update your policy information based on surveyor feedback
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

          {/* Surveyor Feedback */}
          {surveyData && (
            <div className="mt-4 p-4 bg-orange-50 border border-orange-200 rounded-lg">
              <h4 className="font-medium text-orange-900 mb-2">Surveyor Feedback</h4>
              <p className="text-sm text-orange-800 mb-2">
                <strong>Recommendation:</strong> {surveyData.recommendedAction === 'request_more_info' ? 'Additional Information Required' : surveyData.recommendedAction}
              </p>
              {surveyData.surveyNotes && (
                <p className="text-sm text-orange-800">
                  <strong>Notes:</strong> {surveyData.surveyNotes}
                </p>
              )}
            </div>
          )}
        </div>

        {/* Modal Content */}
        <div className="flex-1 overflow-hidden flex flex-col">
          <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
            <div className="p-6 bg-white overflow-y-auto flex-1">
              <div className="space-y-6">
                {/* Property Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Property Details</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Property Type</label>
                      <select
                        value={formData.propertyDetails.propertyType}
                        onChange={(e) => handleInputChange('propertyDetails', 'propertyType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select property type</option>
                        {PROPERTY_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Building Value (₦)</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.buildingValue}
                        onChange={(e) => handleInputChange('propertyDetails', 'buildingValue', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Plot Number</label>
                      <input
                        type="text"
                        value={formData.propertyDetails.plotNumber}
                        onChange={(e) => handleInputChange('propertyDetails', 'plotNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Cadastral Zone</label>
                      <input
                        type="text"
                        value={formData.propertyDetails.cadastralZone}
                        onChange={(e) => handleInputChange('propertyDetails', 'cadastralZone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">District</label>
                      <input
                        type="text"
                        value={formData.propertyDetails.district}
                        onChange={(e) => handleInputChange('propertyDetails', 'district', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Full Property Address</label>
                      <textarea
                        value={formData.propertyDetails.fullAddress}
                        onChange={(e) => handleInputChange('propertyDetails', 'fullAddress', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Year Built</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.yearBuilt}
                        onChange={(e) => handleInputChange('propertyDetails', 'yearBuilt', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Square Footage</label>
                      <input
                        type="number"
                        value={formData.propertyDetails.squareFootage}
                        onChange={(e) => handleInputChange('propertyDetails', 'squareFootage', Number(e.target.value))}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Construction Material</label>
                      <select
                        value={formData.propertyDetails.constructionMaterial}
                        onChange={(e) => handleInputChange('propertyDetails', 'constructionMaterial', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select material</option>
                        {CONSTRUCTION_MATERIALS.map((material) => (
                          <option key={material} value={material}>
                            {material}
                          </option>
                        ))}
                      </select>
                    </div>
                  </div>
                </div>

                {/* Contact Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Contact Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Name of Builder/Contractor</label>
                      <input
                        type="text"
                        value={formData.contactDetails.fullName}
                        onChange={(e) => handleInputChange('contactDetails', 'fullName', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Email
                        <span className="text-xs text-green-600 ml-2">(Auto-filled from your account)</span>
                      </label>
                      <input
                        type="email"
                        value={formData.contactDetails.email}
                        readOnly
                        disabled
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        This email is automatically filled from your account and cannot be changed.
                      </p>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Phone Number</label>
                      <input
                        type="tel"
                        value={formData.contactDetails.phoneNumber}
                        onChange={(e) => handleInputChange('contactDetails', 'phoneNumber', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Alternate Phone</label>
                      <input
                        type="tel"
                        value={formData.contactDetails.alternatePhone}
                        onChange={(e) => handleInputChange('contactDetails', 'alternatePhone', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                      />
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">RC Number *</label>
                      <input
                        type="text"
                        value={formData.contactDetails.rcNumber}
                        onChange={(e) => handleInputChange('contactDetails', 'rcNumber', e.target.value.toUpperCase())}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        style={{ textTransform: 'uppercase' }}
                        placeholder="RC123456"
                        required
                      />
                      <p className="text-xs text-gray-500 mt-1">
                        Enter your company's Registration Certificate number
                      </p>
                    </div>
                  </div>
                </div>

                {/* Coverage Details */}
                <div>
                  <h4 className="font-medium text-gray-900 mb-4">Coverage Information</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Coverage Type</label>
                      <select
                        value={formData.requestDetails.coverageType}
                        onChange={(e) => handleInputChange('requestDetails', 'coverageType', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select coverage type</option>
                        {COVERAGE_TYPES.map((type) => (
                          <option key={type} value={type}>
                            {type}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">Policy Duration</label>
                      <select
                        value={formData.requestDetails.policyDuration}
                        onChange={(e) => handleInputChange('requestDetails', 'policyDuration', e.target.value)}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        required
                      >
                        <option value="">Select duration</option>
                        {POLICY_DURATIONS.map((duration) => (
                          <option key={duration} value={duration}>
                            {duration}
                          </option>
                        ))}
                      </select>
                    </div>

                    <div className="md:col-span-2">
                      <label className="block text-sm font-medium text-gray-700 mb-1">Special Requests</label>
                      <textarea
                        value={formData.requestDetails.specialRequests}
                        onChange={(e) => handleInputChange('requestDetails', 'specialRequests', e.target.value)}
                        rows={3}
                        className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        placeholder="Any special requirements or additional information..."
                      />
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Modal Footer - Now inside form */}
            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
              <div className="flex items-center justify-between">
                <p className="text-sm text-gray-600">
                  Your updated policy will be reassigned for a new survey.
                </p>
                <div className="flex space-x-3">
                  <button
                    type="button"
                    onClick={onClose}
                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50 transition-colors"
                  >
                    Cancel
                  </button>
                  <button
                    type="submit"
                    disabled={loading}
                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center"
                  >
                    {loading && <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white mr-2"></div>}
                    {loading ? 'Updating...' : 'Update Policy'}
                  </button>
                </div>
              </div>
            </div>
          </form>
        </div>
      </div>
    </div>
  );
};

export default Dashview;
