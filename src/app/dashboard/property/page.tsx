"use client";
import React, { useState, useEffect } from "react";
import Image from "next/image";
import { Trash2, MoreVertical, Search, Filter, X } from "lucide-react";
import { getUserProperties, deleteProperty } from "@/services/api";
import PolicyRequestForm from "@/components/dashboard/PolicyRequestForm";
import { CreatePolicyRequestData } from "@/types/api.types";
import { PropertyType } from "@/types/survey.types";
import PropertyDetailsModal from "@/components/dashboard/usersComponent/PropertyDetailsModal";
import AddNewProperty from "@/components/dashboard/usersComponent/AddNewProperty";
import { useAuth } from "@/context/useAuth";
import { getCookie } from "@/utils/cookies";

const PropertyPage = () => {
  const [properties, setProperties] = useState<PropertyType[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedProperty, setSelectedProperty] = useState<PropertyType | null>(null);
  const [showPolicyRequest, setShowPolicyRequest] = useState(false);
  const [showViewModal, setShowViewModal] = useState(false);
  const [selectedPropertyForView, setSelectedPropertyForView] = useState<PropertyType | null>(null);
  const [showAddNewProperty, setShowAddNewProperty] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [propertyToDelete, setPropertyToDelete] = useState<PropertyType | null>(null);
  const [showActionsDropdown, setShowActionsDropdown] = useState<string | null>(null);

  // Search and Filter States
  const [searchQuery, setSearchQuery] = useState("");
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: "",
    category: "",
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
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getUserProperties();
        setProperties(response.allProperties.properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchProperties();
  }, []);

  const togglePolicyRequestForm = () => {
    setSelectedProperty(null);
    setShowPolicyRequest(!showPolicyRequest);
  };

  const toggleAddNewProperty = () => {
    setShowAddNewProperty(!showAddNewProperty);
  };

  const handlePropertyAdded = () => {
    // Refresh the properties list when a new property is added
    const fetchProperties = async () => {
      try {
        setLoading(true);
        const response = await getUserProperties();
        setProperties(response.allProperties.properties);
      } catch (error) {
        console.error("Failed to fetch properties:", error);
      } finally {
        setLoading(false);
      }
    };
    fetchProperties();
  };

  const handleDeleteProperty = async (property: PropertyType) => {
    // Safety check: Only allow deletion of unverified properties
    if (property.status !== "Unverified") {
      alert('Only unverified properties can be deleted.');
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      return;
    }

    try {
      await deleteProperty(property._id);
      setProperties(prev => prev.filter(p => p._id !== property._id));
      setShowDeleteModal(false);
      setPropertyToDelete(null);
      alert('Unverified property deleted successfully!');
    } catch (error) {
      console.error('Delete property error:', error);
      alert('Failed to delete property. Please try again.');
    }
  };

  const handleInsureClick = (property: PropertyType) => {
    setSelectedProperty(property);
    setShowPolicyRequest(true);
  };

  const handleViewClick = (property: PropertyType) => {
    setSelectedPropertyForView(property);
    setShowViewModal(true);
  };

  const handlePolicyRequest = async (data: CreatePolicyRequestData) => {
    try {
      console.log("Submitting policy request with data:", data);
      const { submitPolicyRequest } = await import("@/services/api");
      await submitPolicyRequest(data);
      alert("Policy request submitted successfully!");
      setShowPolicyRequest(false);
    } catch (error) {
      console.error("Failed to submit policy request:", error);
      alert("Failed to submit policy request. Please try again.");
    }
  };

  // Filter properties based on search and filters
  const filteredProperties = properties.filter(property => {
    // Search filter
    const searchLower = searchQuery.toLowerCase();
    const searchMatch = !searchQuery ||
      property.address?.toLowerCase().includes(searchLower) ||
      property._id?.toLowerCase().includes(searchLower) ||
      property.category?.category?.toLowerCase().includes(searchLower);

    // Status filter
    const statusMatch = !filters.status || property.status === filters.status;

    // Category filter
    const categoryMatch = !filters.category || property.category?.category === filters.category;

    // Date range filter
    const dateFromMatch = !filters.dateFrom ||
      new Date(property.createdAt) >= new Date(filters.dateFrom);
    const dateToMatch = !filters.dateTo ||
      new Date(property.createdAt) <= new Date(filters.dateTo);

    return searchMatch && statusMatch && categoryMatch && dateFromMatch && dateToMatch;
  });

  const clearFilters = () => {
    setFilters({
      status: "",
      category: "",
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
          <div className="absolute lg:mb-12 right-2 sm:right-4 bottom-2 sm:bottom-4 flex space-x-2">
            <button
              onClick={toggleAddNewProperty}
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
              New Property
            </button>
            <button
              onClick={togglePolicyRequestForm}
              className="px-2 sm:px-4 py-1 sm:py-2 bg-[#028835] rounded-[40px] text-white text-sm sm:text-base lg:text-lg font-semibold flex items-center"
            >
              <div className="w-3 h-3 sm:w-4 sm:h-4 lg:w-5 lg:h-5 bg-white rounded-full mr-1 sm:mr-2 flex items-center justify-center">
                <svg
                  width="12"
                  height="13"
                  viewBox="0 0 12 13"
                  fill="none"
                  xmlns="http://www.w3.org/2000/svg"
                >
                  <path
                    d="M0 6.62816V5.70509H5.53846V0.166626H6.46154V5.70509H12V6.62816H6.46154V12.1666H5.53846V6.62816H0Z"
                    fill="#028835"
                  />
                </svg>
              </div>
              New Policy
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
                placeholder="Search by address, property ID, or category..."
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
                  <option value="Verified">Verified</option>
                  <option value="Unverified">Unverified</option>
                  <option value="Pending">Pending</option>
                </select>
              </div>

              {/* Category Filter */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Category</label>
                <select
                  value={filters.category}
                  onChange={(e) => setFilters({ ...filters, category: e.target.value })}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-transparent"
                >
                  <option value="">All Categories</option>
                  <option value="Residential">Residential</option>
                  <option value="Commercial">Commercial</option>
                  <option value="Industrial">Industrial</option>
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
              Showing <span className="font-semibold text-gray-900">{filteredProperties.length}</span> of{' '}
              <span className="font-semibold text-gray-900">{properties.length}</span> properties
            </span>
            {hasActiveFilters && (
              <span className="text-[#028835] font-medium">Filters active</span>
            )}
          </div>
        </div>

        {/* Property Table */}
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
                <th className="pb-2 font-bold">Property ID</th>
                <th className="pb-2 font-bold">Status</th>
                <th className="pb-2 font-bold">Actions</th>
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
                      <div className="w-16 h-8 bg-gray-200 rounded"></div>
                    </td>
                    <td className="py-4">
                      <div className="w-6 h-6 bg-gray-200 rounded"></div>
                    </td>
                  </tr>
                ))
              ) : filteredProperties.length === 0 ? (
                <tr>
                  <td colSpan={7} className="py-12 text-center">
                    <div className="flex flex-col items-center justify-center text-gray-500">
                      <Search className="h-12 w-12 mb-3 opacity-30" />
                      <p className="text-lg font-medium">No properties found</p>
                      <p className="text-sm mt-1">
                        {hasActiveFilters
                          ? "Try adjusting your search or filters"
                          : "No properties have been added yet"}
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
                filteredProperties.map((item, index) => (
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
                      {item.address}
                    </td>
                    <td className="py-4 text-[#2a2828] text-base font-medium">
                      {"N/A"}
                    </td>
                    <td className="py-4 text-[#2a2828] text-base font-medium">
                      {item._id?.substring(0, 7).toUpperCase() || "N/A"}
                    </td>
                    <td className="py-4">
                      <span
                        className={`px-2.5 py-1.5 rounded-md text-white text-[15px] font-medium capitalize ${item.status === "Verified"
                          ? "bg-[#028835]"
                          : item.status === "Unverified"
                            ? "bg-[#ffc52b]"
                            : item.status === "Blacklist"
                              ? "bg-[#bd2721]"
                              : "bg-[#2a2a29]"
                          }`}
                      >
                        {item.status || "Unknown"}
                      </span>
                    </td>
                    <td className="py-4">
                      <div className="flex flex-col sm:flex-row gap-2 min-w-0">
                        <button onClick={() => handleViewClick(item)} className="px-2 py-1 bg-blue-500 text-white rounded-md text-sm whitespace-nowrap">
                          View
                        </button>
                        <button onClick={() => handleInsureClick(item)} className="px-2 py-1 bg-[#028835] text-white rounded-md text-sm whitespace-nowrap">
                          Insure
                        </button>
                      </div>
                    </td>
                    <td className="py-4">
                      <div className="relative">
                        <button
                          onClick={() => setShowActionsDropdown(showActionsDropdown === item._id ? null : item._id)}
                          className="p-2 hover:bg-gray-100 rounded-full"
                        >
                          <MoreVertical className="h-4 w-4" />
                        </button>
                        {showActionsDropdown === item._id && (
                          <div className="absolute right-0 mt-2 w-48 bg-white rounded-md shadow-lg z-10 border">
                            <div className="py-1">
                              {item.status === "Unverified" ? (
                                <button
                                  onClick={() => {
                                    setPropertyToDelete(item);
                                    setShowDeleteModal(true);
                                    setShowActionsDropdown(null);
                                  }}
                                  className="flex items-center px-4 py-2 text-sm text-red-600 hover:bg-red-50 w-full text-left"
                                >
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  Delete Property
                                </button>
                              ) : (
                                <div className="flex items-center px-4 py-2 text-sm text-gray-400 w-full text-left cursor-not-allowed">
                                  <Trash2 className="mr-3 h-4 w-4" />
                                  <div>
                                    <div>Delete Property</div>
                                    <div className="text-xs">Only unverified properties can be deleted</div>
                                  </div>
                                </div>
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
      </main>

      <PolicyRequestForm
        isOpen={showPolicyRequest}
        onClose={() => setShowPolicyRequest(false)}
        onSubmit={handlePolicyRequest}
        property={selectedProperty}
      />

      <PropertyDetailsModal
        isOpen={showViewModal}
        onClose={() => setShowViewModal(false)}
        property={selectedPropertyForView}
      />

      <AddNewProperty
        isOpen={showAddNewProperty}
        onClose={() => setShowAddNewProperty(false)}
        onPropertyAdded={handlePropertyAdded}
      />

      {/* Delete Confirmation Modal */}
      {showDeleteModal && propertyToDelete && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg p-6 w-full max-w-md">
            <h3 className="text-lg font-medium text-gray-900 mb-4">Delete Unverified Property</h3>
            <div className="mb-6">
              <p className="text-sm text-gray-500 mb-2">
                Are you sure you want to delete this unverified property?
              </p>
              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-3">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <svg className="h-5 w-5 text-yellow-400" viewBox="0 0 20 20" fill="currentColor">
                      <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
                    </svg>
                  </div>
                  <div className="ml-3">
                    <p className="text-sm text-yellow-800">
                      <strong>Property:</strong> {propertyToDelete.address}
                    </p>
                    <p className="text-xs text-yellow-700 mt-1">
                      This action cannot be undone. Only unverified properties can be deleted.
                    </p>
                  </div>
                </div>
              </div>
            </div>
            <div className="flex justify-end space-x-3">
              <button
                onClick={() => {
                  setShowDeleteModal(false);
                  setPropertyToDelete(null);
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              <button
                onClick={() => handleDeleteProperty(propertyToDelete)}
                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700"
              >
                Delete Property
              </button>
            </div>
          </div>
        </div>
      )}
    </>
  );
};

export default PropertyPage;
