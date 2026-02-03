"use client";
import React, { useState, useEffect } from "react";
import {
  Users,
  Star,
  MapPin,
  Phone,
  Mail,
  Plus,
  Search,
  MoreVertical,
  Eye,
  Edit
} from "lucide-react";
import { Surveyor as BaseSurveyor, Assignment, PolicyRequest } from "@/types/api.types";
import Swal from "sweetalert2"

type UserIdType = {
  firstname?: string;
  lastname?: string;
  email?: string;
  phonenumber?: string;
};

type Surveyor = BaseSurveyor & {
  userId?: UserIdType;
};

interface SurveyorManagementProps {
  onCreateSurveyor: (surveyor: Partial<Surveyor>) => Promise<void>;
  onUpdateSurveyor: (id: string, surveyor: Partial<Surveyor>) => Promise<void>;
  onDeleteSurveyor: (id: string) => Promise<void>;
}

const SurveyorManagement: React.FC<SurveyorManagementProps> = ({
  onCreateSurveyor,
  onUpdateSurveyor,
  onDeleteSurveyor,
}) => {
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [loading, setLoading] = useState(true);
  const [fetching, setFetching] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSurveyor, setSelectedSurveyor] = useState<Surveyor | null>(null);
  const [performanceData, setPerformanceData] = useState<{
    totalSurveys: number;
    completedSurveys: number;
    currentAssignments: number;
    rejectedSurveys: number;
    successRate: number;
    avgCompletionTime: number;
    recentActivity: number;
    rating: number;
    joinDate: string;
    lastActive: string;
  } | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    specializations: [] as string[],
    licenseNumber: "",
    address: "",
    state: "",
    city: "",
    lga: "",
    district: "",
    emergencyContact: "",
    notes: "",
    role: "Surveyor",
    status: "active" as "active" | "inactive" | "suspended",
    rating: 0,
    experience: 0,
    maxAssignments: 5,
    dateOfBirth: "",
    qualifications: [] as string[],
    availability: "available" as "available" | "busy" | "unavailable"
  });

  // Initial load
  useEffect(() => {
    const fetchInitialData = async () => {
      setLoading(true);
      try {
        const { adminApi, builderLiabilityPolicyAPI } = await import("@/services/api");

        // Fetch surveyors
        const surveyorResponse = await adminApi.getSurveyors({});

        if (surveyorResponse?.success && surveyorResponse?.data) {
          setSurveyors(surveyorResponse.data);
        }

        // Fetch assignments
        const assignmentResponse = await builderLiabilityPolicyAPI.getAllPolicies({ status: 'all', page: 1, limit: 100 });
        if (assignmentResponse?.data && Array.isArray(assignmentResponse.data)) {
          const assignmentData = assignmentResponse.data?.map((policy: PolicyRequest) => ({
            _id: policy._id,
            surveyorId: policy.assignedSurveyors?.[0] || null,
            ammcId: policy._id,
            status: policy.status,
            createdAt: policy.createdAt,
            updatedAt: policy.updatedAt
          })) || [];
          setAssignments(assignmentData);
        }
      } catch (error) {
        console.error("Failed to fetch initial data:", error);
      } finally {
        setLoading(false);
      }
    };

    fetchInitialData();
  }, []);

  // Fetch on filter/search changes
  useEffect(() => {
    const fetchSurveyors = async () => {
      setFetching(true);
      try {
        const { adminApi } = await import("@/services/api");

        const filters = {
          status: statusFilter !== "all" ? statusFilter : undefined,
          specialization: specializationFilter !== "all" ? specializationFilter : undefined,
          search: searchTerm || undefined
        };

        console.log("🔍 Fetching surveyors with filters:", filters);

        const response = await adminApi.getSurveyors(filters);

        console.log("📊 Surveyor API response:", response);
        console.log("👥 Surveyors count:", response?.data?.length || 0);

        if (response?.success && response?.data) {
          console.log("✅ Setting surveyors data:", response.data);
          setSurveyors(response.data);
        } else {
          console.warn("⚠️ No surveyors data in response");
          setSurveyors([]);
        }
      } catch (error) {
        console.error("❌ Failed to fetch surveyors:", error);
        setSurveyors([]);
      } finally {
        setFetching(false);
      }
    };

    // Skip initial render (handled by initial load effect)
    if (loading) return;

    // Debounce search
    const debounceTimer = setTimeout(() => {
      fetchSurveyors();
    }, searchTerm ? 500 : 0);

    return () => clearTimeout(debounceTimer);
  }, [statusFilter, specializationFilter, searchTerm, loading]);

  const fetchSurveyorAnalytics = async (surveyor: Surveyor) => {
    setSelectedSurveyor(surveyor);

    try {
      const { adminApi } = await import("@/services/api");

      // Fetch comprehensive analytics for the surveyor
      const surveyorAssignments = assignments.filter(a => a.surveyorId === surveyor._id);
      const completedAssignments = surveyorAssignments.filter(a => a.status === 'completed');
      const inProgressAssignments = surveyorAssignments.filter(a => a.status === 'in_progress' || a.status === 'assigned');
      const rejectedAssignments = surveyorAssignments.filter(a => a.status === 'rejected');

      // Calculate performance metrics
      const totalSurveys = surveyorAssignments.length;
      const completedSurveys = completedAssignments.length;
      const currentAssignments = inProgressAssignments.length;
      const successRate = totalSurveys > 0 ? ((completedSurveys / totalSurveys) * 100).toFixed(1) : '0';

      // Calculate average completion time (mock data for now)
      const avgCompletionTime = completedSurveys > 0 ? Math.floor(Math.random() * 7) + 1 : 0;

      // Recent activity (last 30 days)
      const thirtyDaysAgo = new Date();
      thirtyDaysAgo.setDate(thirtyDaysAgo.getDate() - 30);
      const recentAssignments = surveyorAssignments.filter(a =>
        new Date(a.createdAt) >= thirtyDaysAgo
      ).length;

      const performance = {
        totalSurveys,
        completedSurveys,
        currentAssignments,
        rejectedSurveys: rejectedAssignments.length,
        successRate: parseFloat(successRate),
        avgCompletionTime,
        recentActivity: recentAssignments,
        rating: surveyor?.rating || 0,
        joinDate: surveyor?.createdAt ? new Date(surveyor.createdAt).toLocaleDateString() : 'N/A',
        lastActive: completedAssignments.length > 0
          ? new Date(Math.max(...completedAssignments.map(a => new Date(a.updatedAt).getTime()))).toLocaleDateString()
          : 'N/A'
      };

      setPerformanceData(performance);
      setShowDetailsModal(true);
    } catch (error) {
      console.error('Failed to fetch surveyor analytics:', error);
      // Fallback to basic metrics
      const performance = {
        totalSurveys: assignments.filter(a => a.surveyorId === surveyor._id).length,
        completedSurveys: assignments.filter(a => a.surveyorId === surveyor._id && a.status === 'completed').length,
        currentAssignments: getCurrentAssignments(surveyor._id),
        rejectedSurveys: assignments.filter(a => a.surveyorId === surveyor._id && a.status === 'rejected').length,
        successRate: 0,
        avgCompletionTime: 0,
        recentActivity: 0,
        rating: surveyor?.rating || 0,
        joinDate: surveyor?.createdAt ? new Date(surveyor.createdAt).toLocaleDateString() : 'N/A',
        lastActive: 'N/A'
      };
      setPerformanceData(performance);
      setShowDetailsModal(true);
    }
  };

  // Get unique specializations from surveyors for dynamic filter options
  const availableSpecializations = React.useMemo(() => {
    const specs = new Set<string>();
    surveyors.forEach(surveyor => {
      const specializations = surveyor.specializations || surveyor.profile?.specialization || [];
      if (Array.isArray(specializations)) {
        specializations.forEach(spec => {
          if (spec && typeof spec === 'string') {
            specs.add(spec.toLowerCase());
          }
        });
      }
    });
    return Array.from(specs).sort();
  }, [surveyors]);

  // Get unique statuses from surveyors for dynamic filter options
  const availableStatuses = React.useMemo(() => {
    const statuses = new Set<string>();
    surveyors.forEach(surveyor => {
      const status = surveyor.status || surveyor.employeeStatus?.status || '';
      if (status) {
        statuses.add(status.toLowerCase());
      }
    });
    return Array.from(statuses).sort();
  }, [surveyors]);
  const filteredSurveyors = React.useMemo(() => {
    let filtered = surveyors || [];

    console.log("🔄 Client-side filtering - Initial count:", filtered.length);
    console.log("🔄 Filters applied:", { searchTerm, statusFilter, specializationFilter });

    // Apply search filter if backend didn't handle it properly
    if (searchTerm && searchTerm.trim()) {
      const searchLower = searchTerm.toLowerCase();
      filtered = filtered.filter(surveyor => {
        const firstName = (surveyor.userId?.firstname || surveyor.firstname || '').toLowerCase();
        const lastName = (surveyor.userId?.lastname || surveyor.lastname || '').toLowerCase();
        const email = (surveyor.userId?.email || surveyor.email || '').toLowerCase();
        const phone = (surveyor.userId?.phonenumber || surveyor.phonenumber || '').toLowerCase();
        const license = (surveyor.licenseNumber || '').toLowerCase();

        return firstName.includes(searchLower) ||
          lastName.includes(searchLower) ||
          email.includes(searchLower) ||
          phone.includes(searchLower) ||
          license.includes(searchLower);
      });
    }

    // Apply status filter if backend didn't handle it properly
    if (statusFilter && statusFilter !== "all") {
      filtered = filtered.filter(surveyor => {
        const surveyorStatus = (surveyor.status || surveyor.employeeStatus?.status || '').toLowerCase();
        const filterStatus = statusFilter.toLowerCase();

        // Handle different status formats
        if (filterStatus === 'active') {
          return surveyorStatus === 'active' || surveyorStatus === 'available';
        } else if (filterStatus === 'inactive') {
          return surveyorStatus === 'inactive' || surveyorStatus === 'unavailable';
        } else if (filterStatus === 'on leave') {
          return surveyorStatus === 'on leave' || surveyorStatus === 'busy';
        }

        return surveyorStatus === filterStatus;
      });
    }

    // Apply specialization filter if backend didn't handle it properly
    if (specializationFilter && specializationFilter !== "all") {
      filtered = filtered.filter(surveyor => {
        const specializations = surveyor.specializations || surveyor.profile?.specialization || [];
        if (Array.isArray(specializations)) {
          return specializations.some(spec =>
            spec.toLowerCase().includes(specializationFilter.toLowerCase())
          );
        }
        return false;
      });
    }

    console.log("✅ Client-side filtering - Final count:", filtered.length);
    return filtered;
  }, [surveyors, searchTerm, statusFilter, specializationFilter]);

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      "On Leave": "bg-yellow-100 text-yellow-800",
      Inactive: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getCurrentAssignments = (surveyorId: string) => {
    return (assignments || []).filter(
      assignment =>
        assignment?.surveyorId === surveyorId &&
        assignment?.status === "in_progress"
    ).length;
  };

  const refetchSurveyors = async () => {
    setFetching(true);
    try {
      const { adminApi } = await import("@/services/api");

      const filters = {
        status: statusFilter !== "all" ? statusFilter : undefined,
        specialization: specializationFilter !== "all" ? specializationFilter : undefined,
        search: searchTerm || undefined
      };

      const response = await adminApi.getSurveyors(filters);

      if (response?.success && response?.data) {
        setSurveyors(response.data);
      } else {
        setSurveyors([]);
      }
    } catch (error) {
      console.error("Failed to fetch surveyors:", error);
      setSurveyors([]);
    } finally {
      setFetching(false);
    }
  };

  const handleCreateSurveyor = async () => {
    try {
      await onCreateSurveyor({
        ...formData,
        status: formData.status as "active" | "inactive" | "suspended"
      });
      setShowCreateModal(false);
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        specializations: [],
        licenseNumber: "",
        address: "",
        state: "",
        city: "",
        lga: "",
        district: "",
        emergencyContact: "",
        notes: "",
        role: "Surveyor",
        status: "active",
        rating: 0,
        experience: 0,
        maxAssignments: 5,
        dateOfBirth: "",
        qualifications: [],
        availability: "available"
      });
      refetchSurveyors();
    } catch (error) {
      console.error('Failed to create surveyor:', error);
    }
  };

  const handleUpdateSurveyor = async () => {
    if (!selectedSurveyor) return;
    try {
      await onUpdateSurveyor(selectedSurveyor._id, {
        ...formData,
        status: formData.status as "active" | "inactive" | "suspended"
      });
      setShowEditModal(false);
      refetchSurveyors();
    } catch (error) {
      console.error('Failed to update surveyor:', error);
    }
  };


    const handleDeleteSurveyor = async (surveyorId: string) => {
      const result = await Swal.fire({
        title: 'Are you sure?',
        text: 'This action cannot be undone!',
        icon: 'warning',
        showCancelButton: true,
        confirmButtonColor: '#d33',
        cancelButtonColor: '#3085d6',
        confirmButtonText: 'Yes, delete it',
        cancelButtonText: 'Cancel',
      });

      if (result.isConfirmed) {
        try {
          await onDeleteSurveyor(surveyorId);
          refetchSurveyors();

          Swal.fire({
            title: 'Deleted!',
            text: 'Surveyor has been deleted successfully.',
            icon: 'success',
            timer: 2000,
            showConfirmButton: false,
          });
        } catch (error) {
          console.error('Failed to delete surveyor:', error);

          Swal.fire({
            title: 'Error!',
            text: 'Failed to delete surveyor. Please try again.',
            icon: 'error',
          });
        }
      }
    };


  const openEditModal = (surveyor: Surveyor) => {
    setSelectedSurveyor(surveyor);
    console.log('Opening edit modal for surveyor:', surveyor);

    setFormData({
      firstname: surveyor.userId?.firstname || surveyor.firstname || "",
      lastname: surveyor.userId?.lastname || surveyor.lastname || "",
      email: surveyor.userId?.email || surveyor.email || "",
      phonenumber: surveyor.userId?.phonenumber || surveyor.phonenumber || "",
      specializations: surveyor.profile?.specialization || surveyor.specializations || [],
      licenseNumber: surveyor.licenseNumber || "",
      address: surveyor.profile?.location?.state || surveyor.address || "",
      state: surveyor.profile?.location?.state || "",
      city: surveyor.profile?.location?.city || "",
      lga: surveyor.profile?.location?.lga || "",
      district: surveyor.profile?.location?.district || "",
      emergencyContact: surveyor.emergencyContact || "",
      notes: surveyor.notes || "",
      role: surveyor.role || "Surveyor",
      status: surveyor.status || "active",
      rating: surveyor.rating || 0,
      experience: surveyor.experience || 0,
      maxAssignments: surveyor.maxAssignments || 5,
      dateOfBirth: surveyor.dateOfBirth || "",
      qualifications: surveyor.qualifications || [],
      availability: surveyor.availability || "available"
    });
    setShowEditModal(true);
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-20 bg-gray-300 rounded"></div>
            ))}
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex justify-between items-center">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">Surveyor Management</h2>
          <p className="text-gray-600">Comprehensive management of surveyor profiles, qualifications, and LGA-based assignments</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#028835] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Add Surveyor
        </button>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search by name, email, phone, or license..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
              disabled={fetching}
            />
          </div>

          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={fetching}
          >
            <option value="all">All Statuses</option>
            {availableStatuses.map(status => (
              <option key={status} value={status}>
                {status.charAt(0).toUpperCase() + status.slice(1)}
              </option>
            ))}
            {/* Fallback options if no dynamic statuses found */}
            {availableStatuses.length === 0 && (
              <>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="suspended">Suspended</option>
              </>
            )}
          </select>

          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
            disabled={fetching}
          >
            <option value="all">All Specializations</option>
            {availableSpecializations.map(spec => (
              <option key={spec} value={spec}>
                {spec.charAt(0).toUpperCase() + spec.slice(1)}
              </option>
            ))}
            {/* Fallback options if no dynamic specializations found */}
            {availableSpecializations.length === 0 && (
              <>
                <option value="residential">Residential</option>
                <option value="commercial">Commercial</option>
                <option value="industrial">Industrial</option>
                <option value="agricultural">Agricultural</option>
              </>
            )}
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSpecializationFilter("all");
            }}
            className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={fetching}
          >
            Clear Filters
          </button>
        </div>

        {/* Results counter */}
        <div className="mt-3 text-sm text-gray-600">
          Showing {filteredSurveyors.length} of {surveyors.length} surveyors
          {(searchTerm || statusFilter !== 'all' || specializationFilter !== 'all') && (
            <span className="text-blue-600 ml-2">• Filters applied</span>
          )}
        </div>
      </div>


      {/* Surveyors Grid */}
      {fetching && (
        <div className="flex items-center justify-center py-8">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-green-600"></div>
          <span className="ml-3 text-gray-600">Loading surveyors...</span>
        </div>
      )}

      {!fetching && filteredSurveyors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">No surveyors found</h3>
          <p className="text-gray-600 mb-4">
            {searchTerm || statusFilter !== 'all' || specializationFilter !== 'all'
              ? 'Try adjusting your search criteria or filters'
              : 'No surveyors have been added yet'}
          </p>
          {(searchTerm || statusFilter !== 'all' || specializationFilter !== 'all') && (
            <button
              onClick={() => {
                setSearchTerm("");
                setStatusFilter("all");
                setSpecializationFilter("all");
              }}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
            >
              Clear Filters
            </button>
          )}
        </div>
      )}

      <div className={`grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6 ${fetching ? 'opacity-50 pointer-events-none' : ''}`}>
        {filteredSurveyors.map((surveyor) => (
          <div key={surveyor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {surveyor.userId?.firstname || 'N/A'} {surveyor.userId?.lastname || 'N/A'}
                  </h3>
                  <p className="text-sm text-gray-600">{surveyor?.employeeRole?.role || 'N/A'}</p>
                </div>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                  {surveyor.userId?.phonenumber ?? surveyor.phonenumber ?? 'N/A'}
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {surveyor.userId?.email || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {surveyor.userId?.phonenumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  License: {surveyor?.licenseNumber || 'N/A'}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold">Experience:</span> {surveyor?.experience || 0} years
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold">Max Assignments:</span> {surveyor?.maxAssignments || 5}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <span className="font-semibold">Availability:</span>
                  <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${surveyor?.availability === 'available' ? 'bg-green-100 text-green-800' :
                    surveyor?.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                      'bg-red-100 text-red-800'
                    }`}>
                    {surveyor?.availability || 'Available'}
                  </span>
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(surveyor?.employeeStatus?.status || 'Unknown')}`}>
                  {surveyor?.employeeStatus?.status || 'Unknown'}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {surveyor?.rating || 0}/5.0
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Surveys:</span>
                  <span className="font-medium">{surveyor?.completedSurveys || 0}/{surveyor?.totalSurveys || 0}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Assignments:</span>
                  <span className="font-medium">{getCurrentAssignments(surveyor?._id)}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Joined:</span>
                  <span className="font-medium">{surveyor?.createdAt ? new Date(surveyor.createdAt).toLocaleDateString() : 'N/A'}</span>
                </div>
              </div>

              <div className="mb-4 space-y-3">
                <div>
                  <p className="text-xs text-gray-600 mb-1">Specializations:</p>
                  <div className="flex flex-wrap gap-1">
                    {surveyor.specializations?.map((spec, index) => (
                      <span key={index} className="bg-green-100 text-green-800 text-xs px-2 py-1 rounded">
                        {spec}
                      </span>
                    ))}
                  </div>
                </div>

                {surveyor.qualifications && surveyor.qualifications.length > 0 && (
                  <div>
                    <p className="text-xs text-gray-600 mb-1">Qualifications:</p>
                    <div className="flex flex-wrap gap-1">
                      {surveyor.qualifications.slice(0, 2).map((qual: string, index: number) => (
                        <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                          {qual}
                        </span>
                      ))}
                      {surveyor.qualifications.length > 2 && (
                        <span className="bg-gray-100 text-gray-600 text-xs px-2 py-1 rounded">
                          +{surveyor.qualifications.length - 2} more
                        </span>
                      )}
                    </div>
                  </div>
                )}
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => fetchSurveyorAnalytics(surveyor)}
                  className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center"
                >
                  <Eye className="h-4 w-4 mr-1" />
                  View
                </button>
                <button
                  onClick={() => openEditModal(surveyor)}
                  className="flex-1 bg-[#028835] text-white px-3 py-2 rounded-md text-sm hover:bg-green-700 flex items-center justify-center"
                >
                  <Edit className="h-4 w-4 mr-1" />
                  Edit
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>

      {filteredSurveyors.length === 0 && (
        <div className="text-center py-12">
          <Users className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No surveyors found matching your criteria.</p>
        </div>
      )}

      {/* Create/Edit Surveyor Modal - Enhanced Comprehensive Form */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
          <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
            {/* Header */}
            <div className="bg-green-600 text-white p-6">
              <div className="flex items-center justify-between">
                <div>
                  <h2 className="text-xl font-bold">
                    {showCreateModal ? "Add New Surveyor" : "Edit Surveyor"}
                  </h2>
                  <p className="text-green-100 mt-1">
                    {showCreateModal ? 'Register a new surveyor with LGA assignment' : 'Update surveyor information'}
                  </p>
                </div>
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="text-green-100 hover:text-white transition-colors"
                >
                  <span className="text-2xl">×</span>
                </button>
              </div>
            </div>

            {/* Form Content */}
            <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* Personal Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Personal Information
                  </h3>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        First Name *
                      </label>
                      <input
                        type="text"
                        value={formData.firstname}
                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter first name"
                        required
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Last Name *
                      </label>
                      <input
                        type="text"
                        value={formData.lastname}
                        onChange={(e) => setFormData({ ...formData, lastname: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter last name"
                        required
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Email Address *
                    </label>
                    <input
                      type="email"
                      value={formData.email}
                      onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter email address"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Phone Number *
                    </label>
                    <input
                      type="tel"
                      value={formData.phonenumber}
                      onChange={(e) => setFormData({ ...formData, phonenumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter phone number"
                      required
                    />
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Address *
                    </label>
                    <textarea
                      value={formData.address}
                      onChange={(e) => setFormData({ ...formData, address: e.target.value })}
                      rows={3}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter full address"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        LGA (Local Government Area) *
                      </label>
                      <select
                        value={formData.lga}
                        onChange={(e) => setFormData({ ...formData, lga: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        required
                      >
                        <option value="">Select LGA</option>
                        <option value="amac">Abuja Municipal Area Council (AMAC)</option>
                        <option value="bwari">Bwari Area Council</option>
                        <option value="gwagwalada">Gwagwalada Area Council</option>
                        <option value="kuje">Kuje Area Council</option>
                        <option value="abaji">Abaji Area Council</option>
                        <option value="kwali">Kwali Area Council</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        District
                      </label>
                      <input
                        type="text"
                        value={formData.district}
                        onChange={(e) => setFormData({ ...formData, district: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="Enter district within LGA"
                      />
                    </div>
                  </div>
                </div>

                {/* Professional Information */}
                <div className="space-y-4">
                  <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                    Professional Information
                  </h3>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      License Number *
                    </label>
                    <input
                      type="text"
                      value={formData.licenseNumber}
                      onChange={(e) => setFormData({ ...formData, licenseNumber: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Enter license number"
                      required
                    />
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Status
                      </label>
                      <select
                        value={formData.status}
                        onChange={(e) => setFormData({ ...formData, status: e.target.value as "active" | "inactive" | "suspended" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Rating
                      </label>
                      <input
                        type="number"
                        min="0"
                        max="5"
                        step="0.1"
                        value={formData.rating}
                        onChange={(e) => setFormData({ ...formData, rating: parseFloat(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0.0"
                      />
                    </div>
                  </div>

                  {/* Specializations */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Specializations *
                    </label>
                    <div className="grid grid-cols-2 gap-2">
                      {["residential", "commercial", "industrial", "agricultural"].map(spec => (
                        <label key={spec} className="flex items-center">
                          <input
                            type="checkbox"
                            checked={formData.specializations.includes(spec)}
                            onChange={(e) => {
                              if (e.target.checked) {
                                setFormData({
                                  ...formData,
                                  specializations: [...formData.specializations, spec]
                                });
                              } else {
                                setFormData({
                                  ...formData,
                                  specializations: formData.specializations.filter(s => s !== spec)
                                });
                              }
                            }}
                            className="mr-2 text-green-600 focus:ring-green-500"
                          />
                          <span className="text-sm capitalize">{spec.replace('-', ' ')}</span>
                        </label>
                      ))}
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Years of Experience
                      </label>
                      <input
                        type="number"
                        min="0"
                        value={formData.experience}
                        onChange={(e) => setFormData({ ...formData, experience: parseInt(e.target.value) || 0 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="0"
                      />
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Max Assignments
                      </label>
                      <input
                        type="number"
                        min="1"
                        value={formData.maxAssignments}
                        onChange={(e) => setFormData({ ...formData, maxAssignments: parseInt(e.target.value) || 1 })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                        placeholder="5"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Availability
                      </label>
                      <select
                        value={formData.availability}
                        onChange={(e) => setFormData({ ...formData, availability: e.target.value as "available" | "busy" | "unavailable" })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      >
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                      </select>
                    </div>

                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-1">
                        Date of Birth
                      </label>
                      <input
                        type="date"
                        value={formData.dateOfBirth}
                        onChange={(e) => setFormData({ ...formData, dateOfBirth: e.target.value })}
                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      />
                    </div>
                  </div>

                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Emergency Contact
                    </label>
                    <input
                      type="tel"
                      value={formData.emergencyContact}
                      onChange={(e) => setFormData({ ...formData, emergencyContact: e.target.value })}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      placeholder="Emergency contact phone number"
                    />
                  </div>
                </div>
              </div>

              {/* Qualifications */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Qualifications
                  </label>
                  <div className="flex gap-2 mb-2">
                    <input
                      type="text"
                      placeholder="Enter qualification"
                      className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                      onKeyDown={(e) => {
                        if (e.key === 'Enter') {
                          e.preventDefault();
                          const input = e.target as HTMLInputElement;
                          const qualification = input.value.trim();
                          if (qualification && !formData.qualifications.includes(qualification)) {
                            setFormData(prev => ({
                              ...prev,
                              qualifications: [...prev.qualifications, qualification]
                            }));
                            input.value = '';
                          }
                        }
                      }}
                    />
                    <button
                      type="button"
                      onClick={(e) => {
                        const input = (e.target as HTMLButtonElement).previousElementSibling as HTMLInputElement;
                        const qualification = input.value.trim();
                        if (qualification && !formData.qualifications.includes(qualification)) {
                          setFormData(prev => ({
                            ...prev,
                            qualifications: [...prev.qualifications, qualification]
                          }));
                          input.value = '';
                        }
                      }}
                      className="px-3 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                    >
                      Add
                    </button>
                  </div>
                  <div className="space-y-1">
                    {formData.qualifications.map((qual, index) => (
                      <div
                        key={index}
                        className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                      >
                        <span className="text-sm text-gray-900">{qual}</span>
                        <button
                          type="button"
                          onClick={() => {
                            setFormData(prev => ({
                              ...prev,
                              qualifications: prev.qualifications.filter((_, i) => i !== index)
                            }));
                          }}
                          className="text-red-600 hover:text-red-800"
                        >
                          Remove
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              </div>

              {/* Notes */}
              <div className="mt-6 pt-6 border-t border-gray-200">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Additional Notes
                  </label>
                  <textarea
                    value={formData.notes}
                    onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                    rows={3}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-green-500 focus:border-green-500"
                    placeholder="Enter any additional notes about the surveyor"
                  />
                </div>
              </div>
            </div>

            {/* Footer */}
            <div className="border-t border-gray-200 p-6">
              <div className="flex items-center justify-end space-x-3">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                >
                  Cancel
                </button>
                <button
                  onClick={showCreateModal ? handleCreateSurveyor : handleUpdateSurveyor}
                  className="px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors flex items-center space-x-2"
                >
                  <span>{showCreateModal ? "Add Surveyor" : "Save Changes"}</span>
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Details Modal */}
      {showDetailsModal && selectedSurveyor && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Surveyor Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Personal Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Name:</span> {selectedSurveyor.userId?.firstname || 'N/A'} {selectedSurveyor.userId?.lastname || 'N/A'}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedSurveyor.userId?.email || 'N/A'}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedSurveyor.userId?.phonenumber || 'N/A'}</p>
                    <p><span className="text-gray-600">Emergency Contact:</span> {selectedSurveyor?.emergencyContact || 'N/A'}</p>
                    <p><span className="text-gray-600">Address:</span> {selectedSurveyor?.address || 'N/A'}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">License:</span> {selectedSurveyor?.licenseNumber || 'N/A'}</p>
                    <p><span className="text-gray-600">Experience:</span> {selectedSurveyor?.experience || 0} years</p>
                    <p><span className="text-gray-600">Max Assignments:</span> {selectedSurveyor?.maxAssignments || 5}</p>
                    <p><span className="text-gray-600">Availability:</span>
                      <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${selectedSurveyor?.availability === 'available' ? 'bg-green-100 text-green-800' :
                        selectedSurveyor?.availability === 'busy' ? 'bg-yellow-100 text-yellow-800' :
                          'bg-red-100 text-red-800'
                        }`}>
                        {selectedSurveyor?.availability || 'Available'}
                      </span>
                    </p>
                    <p><span className="text-gray-600">Status:</span> {selectedSurveyor?.status || 'N/A'}</p>
                    <p><span className="text-gray-600">Rating:</span> {selectedSurveyor?.rating || 0}/5.0</p>
                    <p><span className="text-gray-600">Joined:</span> {selectedSurveyor?.createdAt ? new Date(selectedSurveyor.createdAt).toLocaleDateString() : 'N/A'}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-4">Performance Metrics</h4>
                <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-6">
                  <div className="bg-blue-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-blue-600">{performanceData?.totalSurveys || 0}</p>
                    <p className="text-sm text-blue-800">Total Surveys</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-green-600">{performanceData?.completedSurveys || 0}</p>
                    <p className="text-sm text-green-800">Completed</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-yellow-600">{performanceData?.currentAssignments || 0}</p>
                    <p className="text-sm text-yellow-800">Current Assignments</p>
                  </div>
                  <div className="bg-red-50 p-4 rounded-lg text-center">
                    <p className="text-2xl font-bold text-red-600">{performanceData?.rejectedSurveys || 0}</p>
                    <p className="text-sm text-red-800">Rejected</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 md:grid-cols-3 gap-4 mb-4">
                  <div className="bg-purple-50 p-4 rounded-lg text-center">
                    <p className="text-xl font-bold text-purple-600">{performanceData?.successRate || 0}%</p>
                    <p className="text-sm text-purple-800">Success Rate</p>
                  </div>
                  <div className="bg-indigo-50 p-4 rounded-lg text-center">
                    <p className="text-xl font-bold text-indigo-600">{performanceData?.avgCompletionTime || 0} days</p>
                    <p className="text-sm text-indigo-800">Avg Completion</p>
                  </div>
                  <div className="bg-teal-50 p-4 rounded-lg text-center">
                    <p className="text-xl font-bold text-teal-600">{performanceData?.recentActivity || 0}</p>
                    <p className="text-sm text-teal-800">Recent Activity (30d)</p>
                  </div>
                </div>

                <div className="bg-gray-50 p-4 rounded-lg">
                  <div className="grid grid-cols-2 gap-4 text-sm">
                    <div>
                      <span className="text-gray-600">Last Active:</span>
                      <span className="ml-2 font-medium">{performanceData?.lastActive || 'N/A'}</span>
                    </div>
                    <div>
                      <span className="text-gray-600">Overall Rating:</span>
                      <span className="ml-2 font-medium flex items-center">
                        <Star className="h-4 w-4 text-yellow-400 mr-1" />
                        {performanceData?.rating || 0}/5.0
                      </span>
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSurveyor.specializations?.map((spec, index) => (
                    <span key={index} className="bg-green-100 text-green-800 text-sm px-3 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSurveyor?.qualifications && selectedSurveyor.qualifications.length > 0 && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Qualifications</h4>
                  <div className="space-y-1">
                    {selectedSurveyor.qualifications.map((qual: string, index: number) => (
                      <div key={index} className="flex items-center px-3 py-2 bg-gray-50 rounded-lg">
                        <span className="text-sm text-gray-900">{qual}</span>
                      </div>
                    ))}
                  </div>
                </div>
              )}

              {selectedSurveyor?.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSurveyor?.notes}
                  </p>
                </div>
              )}

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => setShowDetailsModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Close
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    openEditModal(selectedSurveyor);
                  }}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  Edit Surveyor
                </button>
                <button
                  onClick={() => {
                    setShowDetailsModal(false);
                    handleDeleteSurveyor(selectedSurveyor?._id);
                  }}
                  className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default SurveyorManagement;