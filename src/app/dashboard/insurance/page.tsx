"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Search, Filter, X } from "lucide-react";
import InsuranceSidebar from "@/components/dashboard/usersComponent/InsuranceSidebar";
import { getUserPolicyRequests } from "@/services/api";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";

interface InsurancePolicy {
  _id: string;
  requestDetails?: {
    coverageType?: string;
  };
  updatedAt?: string;
  status?: string;
}

const InsurancePage = () => {
  const [showInsuranceSidebar, setShowInsuranceSidebar] = useState(false);
  const [policies, setPolicies] = useState<InsurancePolicy[]>([]);
  const [loading, setLoading] = useState(true);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    coverageType: "",
    dateFrom: "",
    dateTo: ""
  });

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

  useEffect(() => {
    const fetchPolicies = async () => {
      try {
        setLoading(true);
        const response = await getUserPolicyRequests("all", 1, 100);
        setPolicies(response.data.policyRequests);
      } catch (error) {
        console.error("Failed to fetch policies:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchPolicies();
  }, []);

  const toggleInsuranceSidebar = () => {
    setShowInsuranceSidebar(!showInsuranceSidebar);
  };

  // Filter policies based on search and filters
  const filteredPolicies = policies.filter(policy => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery ||
      policy._id?.toLowerCase().includes(searchLower) ||
      policy.requestDetails?.coverageType?.toLowerCase().includes(searchLower) ||
      policy.status?.toLowerCase().includes(searchLower);

    // Status filter
    const statusMatch = !filters.status || policy.status === filters.status;

    // Coverage Type filter
    const coverageMatch = !filters.coverageType ||
      policy.requestDetails?.coverageType === filters.coverageType;

    // Date range filter
    const dateFromMatch = !filters.dateFrom ||
      (policy.updatedAt && new Date(policy.updatedAt) >= new Date(filters.dateFrom));
    const dateToMatch = !filters.dateTo ||
      (policy.updatedAt && new Date(policy.updatedAt) <= new Date(filters.dateTo));

    return searchMatch && statusMatch && coverageMatch && dateFromMatch && dateToMatch;
  });

  const clearFilters = () => {
    setFilters({
      status: "",
      coverageType: "",
      dateFrom: "",
      dateTo: ""
    });
    setSearchQuery("");
  };

  const hasActiveFilters = searchQuery || Object.values(filters).some(v => v !== "");

  return (
    <>
      {/* Greeting */}
      <h1 className="text-[23px] font-extrabold p-4 sm:p-8 pb-4">
        Hello {lastName}
      </h1>
      {/* Full-width Banner */}
      <div className="px-4 sm:px-8">
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
          <div className="absolute lg:mb-12 right-2 sm:right-4 bottom-2 sm:bottom-4">
            <button
              onClick={toggleInsuranceSidebar}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-white rounded-[40px] text-[#028835] text-sm sm:text-base lg:text-lg font-semibold flex items-center"
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-[#028835] rounded-full mr-1 sm:mr-2 flex items-center justify-center">
                <svg
                  width="12"
                  height="13"
                  viewBox="0 0 12 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6.62816V5.70509H5.53846V0.166626H6.46154V5.70509H12V6.62816H6.46154V12.1666H5.53846V6.62816H0Z"
                    fill="white"
                  />
                </svg>
              </div>
              Renew Policy
            </button>
          </div>
        </div>
      </div>

      {/* Main Content */}
      <main className="flex-1 px-4 sm:px-8 pb-8 overflow-y-auto">
        {/* Search and Filter Bar */}
        <div className="w-full bg-white rounded-xl p-4 mb-4">
          <div className="flex flex-col sm:flex-row gap-3 mb-4">
            {/* Search Input */}
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
              <input
                type="text"
                placeholder="Search by ID, coverage type, or status..."
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
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-gray-200">
              {/* Status Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Status</label>
                <select
                  value={filters.status}
                  onChange={(e) => setFilters({ ...filters, status: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
                >
                  <option value="">All Status</option>
                  <option value="active">Active</option>
                  <option value="inactive">Inactive</option>
                  <option value="expired">Expired</option>
                  <option value="pending">Pending</option>
                  <option value="assigned">Assigned</option>
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
                  <option value="">All Types</option>
                  <option value="Comprehensive">Comprehensive</option>
                  <option value="Basic">Basic</option>
                  <option value="Premium">Premium</option>
                </select>
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
            </div>
          )}

          {/* Results Count */}
          <div className="flex items-center justify-between text-sm text-gray-600 pt-3 border-t border-gray-200 mt-3">
            <span>
              Showing <span className="font-semibold text-gray-900">{filteredPolicies.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{policies.length}</span> insurance policies
            </span>
            {hasActiveFilters && (
              <span className="text-[#028835] font-medium">Filters active</span>
            )}
          </div>
        </div>

        {/* Insurance Table */}
        <div className="w-full bg-white rounded-xl p-4 overflow-x-auto">
          <table className="w-full min-w-[720px]">
            <thead>
              <tr className="text-left border-b">
                <th className="pb-2 font-bold w-5 px-4">
                  <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                    <input
                      type="checkbox"
                      className="w-full h-full cursor-pointer opacity-0"
                    />
                  </div>
                </th>
                <th className="pb-2 font-bold">Name</th>
                <th className="pb-2 font-bold">Expiring Date</th>
                <th className="pb-2 font-bold">AMMC ID</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold w-5">
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    width="24"
                    height="24"
                    viewBox="0 0 24 24"
                    fill="none"
                    stroke="currentColor"
                    strokeWidth="2"
                    strokeLinecap="round"
                    strokeLinejoin="round"
                  >
                    <circle cx="12" cy="12" r="1" />
                    <circle cx="12" cy="5" r="1" />
                    <circle cx="12" cy="19" r="1" />
                  </svg>
                </th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                // Loading state
                Array.from({ length: 5 }).map((_, index) => (
                  <tr key={index} className="border-b animate-pulse">
                    <td className="py-4 px-4">
                      <div className="w-5 h-5 bg-gray-200 rounded"></div>
                    </td>
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
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredPolicies.length === 0 ? (
                <tr>
                  <td colSpan={6} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-lg font-medium">No insurance policies found</p>
                      <p className="text-sm mt-1">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "No insurance policies have been added yet"}
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
                filteredPolicies.map((item, index) => (
                  <tr key={item._id || index} className="border-b">
                    <td className="py-4 px-4">
                      <div className="w-5 h-5 opacity-30 bg-white rounded-[3px] border border-black">
                        <input
                          type="checkbox"
                          className="w-full h-full cursor-pointer opacity-0"
                        />
                      </div>
                    </td>
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
                        className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize ${item.status === "active"
                          ? "bg-[#028835]"
                          : item.status === "inactive" || item.status === "expired"
                            ? "bg-[#2a2a29]"
                            : item.status === "pending" || item.status === "assigned"
                              ? "bg-[#ffc52b]"
                              : "bg-[#bd2721]"
                          }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4">
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        width="24"
                        height="24"
                        viewBox="0 0 24 24"
                        fill="none"
                        stroke="currentColor"
                        strokeWidth="1"
                        strokeLinecap="round"
                        strokeLinejoin="round"
                      >
                        <circle cx="12" cy="12" r="1" />
                        <circle cx="12" cy="5" r="1" />
                        <circle cx="12" cy="19" r="1" />
                      </svg>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </main>

      <InsuranceSidebar
        isOpen={showInsuranceSidebar}
        onClose={() => setShowInsuranceSidebar(false)}
      />
    </>
  );
};

export default InsurancePage;