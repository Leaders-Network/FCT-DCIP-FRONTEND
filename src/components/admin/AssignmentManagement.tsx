"use client";
import React, { useState, useEffect } from "react";
import { 
  Calendar, 
  Clock, 
  Users, 
  MapPin, 
  AlertTriangle, 
  CheckCircle,
  XCircle,
  Filter,
  Search,
  Plus,
  Eye,
  Edit,
  UserPlus,
  FileText,
  Star,
  TrendingUp
} from "lucide-react";
import { Assignment, PolicyRequest, Surveyor } from "@/types/api.types";

interface AssignmentManagementProps {
  onCreateAssignment: (assignment: Partial<Assignment>) => Promise<void>;
  onUpdateAssignment: (id: string, assignment: Partial<Assignment>) => Promise<void>;
  onReassignSurveyor: (assignmentId: string, newSurveyorId: string) => Promise<void>;
}

const AssignmentManagement: React.FC<AssignmentManagementProps> = ({
  onCreateAssignment,
  onUpdateAssignment,
  onReassignSurveyor
}) => {
  const [assignments, setAssignments] = useState<Assignment[]>([]);
  const [policies, setPolicies] = useState<PolicyRequest[]>([]);
  const [surveyors, setSurveyors] = useState<Surveyor[]>([]);
  const [loading, setLoading] = useState(true);
  
  // Filters
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [priorityFilter, setPriorityFilter] = useState<string>("all");
  const [surveyorFilter, setSurveyorFilter] = useState<string>("all");
  const [overdueFilter, setOverdueFilter] = useState(false);

  // Modals
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [showReassignModal, setShowReassignModal] = useState(false);
  const [selectedAssignment, setSelectedAssignment] = useState<Assignment | null>(null);

  // Form data
  const [formData, setFormData] = useState({
    policyId: "",
    surveyorIds: [] as string[],
    priority: "medium" as "low" | "medium" | "high",
    instructions: "",
    deadline: ""
  });

  useEffect(() => {
    fetchData();
  }, []);

  const fetchData = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API calls
      await new Promise(resolve => setTimeout(resolve, 1000));

      setAssignments([
        {
          _id: "assign1",
          policyId: "policy1",
          surveyorIds: ["surveyor1"],
          assignedBy: "admin1",
          status: "in_progress",
          priority: "high",
          instructions: "Priority residential property survey. Customer is VIP.",
          deadline: "2024-10-15T00:00:00Z",
          createdAt: "2024-10-05T00:00:00Z",
          updatedAt: "2024-10-08T00:00:00Z"
        },
        {
          _id: "assign2",
          policyId: "policy2",
          surveyorIds: ["surveyor2"],
          assignedBy: "admin1",
          status: "completed",
          priority: "medium",
          instructions: "Industrial facility assessment. Check for safety compliance.",
          deadline: "2024-10-10T00:00:00Z",
          createdAt: "2024-10-01T00:00:00Z",
          updatedAt: "2024-10-09T00:00:00Z"
        },
        {
          _id: "assign3",
          policyId: "policy3",
          surveyorIds: ["surveyor1", "surveyor3"],
          assignedBy: "admin1",
          status: "pending",
          priority: "low",
          instructions: "Commercial building assessment. Multiple surveyors assigned for comprehensive review.",
          deadline: "2024-10-20T00:00:00Z",
          createdAt: "2024-10-10T00:00:00Z",
          updatedAt: "2024-10-10T00:00:00Z"
        },
        {
          _id: "assign4",
          policyId: "policy4",
          surveyorIds: ["surveyor2"],
          assignedBy: "admin1",
          status: "overdue",
          priority: "high",
          instructions: "Urgent: Large residential complex. Deadline missed, need immediate attention.",
          deadline: "2024-10-08T00:00:00Z",
          createdAt: "2024-09-30T00:00:00Z",
          updatedAt: "2024-10-08T00:00:00Z"
        }
      ]);

      setPolicies([
        {
          _id: "policy1",
          userId: "user1",
          propertyDetails: {
            address: "123 VIP Estate, Maitama, Abuja",
            propertyType: "Luxury Residential Villa",
            buildingValue: 150000000,
            yearBuilt: 2022,
            squareFootage: 4500,
            constructionMaterial: "Reinforced Concrete"
          },
          contactDetails: {
            fullName: "Dr. Amina Hassan",
            email: "amina.hassan@email.com",
            phoneNumber: "+234 801 234 5678"
          },
          requestDetails: {
            coverageType: "Comprehensive Coverage",
            policyDuration: "3 Years",
            additionalCoverage: ["Flood Coverage", "Theft Protection", "Art Collection"],
            specialRequests: "Property includes art collection worth ₦50M"
          },
          status: "assigned",
          createdAt: "2024-10-05T00:00:00Z",
          updatedAt: "2024-10-05T00:00:00Z"
        },
        {
          _id: "policy5",
          userId: "user5",
          propertyDetails: {
            address: "789 New Development, Gwarinpa, Abuja",
            propertyType: "Residential Apartment",
            buildingValue: 25000000,
            yearBuilt: 2023,
            squareFootage: 1200,
            constructionMaterial: "Concrete Block"
          },
          contactDetails: {
            fullName: "Ibrahim Musa",
            email: "ibrahim.musa@email.com",
            phoneNumber: "+234 803 456 7890"
          },
          requestDetails: {
            coverageType: "Basic Coverage",
            policyDuration: "1 Year",
            additionalCoverage: [],
            specialRequests: ""
          },
          status: "submitted",
          createdAt: "2024-10-12T00:00:00Z",
          updatedAt: "2024-10-12T00:00:00Z"
        }
      ]);

      setSurveyors([
        {
          _id: "surveyor1",
          firstname: "Sarah",
          lastname: "Wilson",
          email: "sarah.wilson@surveyors.com",
          phonenumber: "+234 805 678 9012",
          employeeStatus: { _id: "status1", status: "Active" },
          employeeRole: { _id: "role1", role: "Senior Surveyor" },
          deleted: false,
          createdAt: "2024-01-15T00:00:00Z",
          updatedAt: "2024-10-01T00:00:00Z",
          specializations: ["Residential", "Commercial", "Luxury Properties"],
          licenseNumber: "SRV001",
          totalSurveys: 45,
          completedSurveys: 42,
          rating: 4.9,
          currentWorkload: 3
        },
        {
          _id: "surveyor2",
          firstname: "Mike",
          lastname: "Johnson",
          email: "mike.johnson@surveyors.com",
          phonenumber: "+234 806 789 0123",
          employeeStatus: { _id: "status1", status: "Active" },
          employeeRole: { _id: "role1", role: "Surveyor" },
          deleted: false,
          createdAt: "2024-02-01T00:00:00Z",
          updatedAt: "2024-09-30T00:00:00Z",
          specializations: ["Industrial", "Commercial"],
          licenseNumber: "SRV002",
          totalSurveys: 38,
          completedSurveys: 35,
          rating: 4.7,
          currentWorkload: 2
        },
        {
          _id: "surveyor3",
          firstname: "David",
          lastname: "Chen",
          email: "david.chen@surveyors.com",
          phonenumber: "+234 807 890 1234",
          employeeStatus: { _id: "status1", status: "Active" },
          employeeRole: { _id: "role1", role: "Surveyor" },
          deleted: false,
          createdAt: "2024-03-15T00:00:00Z",
          updatedAt: "2024-09-25T00:00:00Z",
          specializations: ["Residential", "Agricultural"],
          licenseNumber: "SRV003",
          totalSurveys: 28,
          completedSurveys: 26,
          rating: 4.8,
          currentWorkload: 1
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getAssignmentWithDetails = (assignment: Assignment) => {
    const policy = policies.find(p => p._id === assignment.policyId);
    const assignedSurveyors = surveyors.filter(s => assignment.surveyorIds.includes(s._id));
    const isOverdue = new Date(assignment.deadline) < new Date() && assignment.status !== 'completed';
    
    return {
      ...assignment,
      policy,
      assignedSurveyors,
      isOverdue
    };
  };

  const filteredAssignments = assignments
    .map(getAssignmentWithDetails)
    .filter(assignment => {
      const matchesSearch = 
        assignment.policy?.contactDetails.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.policy?.propertyDetails.address.toLowerCase().includes(searchTerm.toLowerCase()) ||
        assignment.assignedSurveyors.some(s => 
          `${s.firstname} ${s.lastname}`.toLowerCase().includes(searchTerm.toLowerCase())
        );
      
      const matchesStatus = statusFilter === "all" || assignment.status === statusFilter;
      const matchesPriority = priorityFilter === "all" || assignment.priority === priorityFilter;
      const matchesSurveyor = surveyorFilter === "all" || assignment.surveyorIds.includes(surveyorFilter);
      const matchesOverdue = !overdueFilter || assignment.isOverdue;

      return matchesSearch && matchesStatus && matchesPriority && matchesSurveyor && matchesOverdue;
    });

  const getStatusBadge = (status: string, isOverdue: boolean = false) => {
    let badge;
    
    if (isOverdue && status !== 'completed') {
      badge = { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Overdue" };
    } else {
      const badges = {
        pending: { color: "bg-yellow-100 text-yellow-800", icon: Clock, text: "Pending" },
        in_progress: { color: "bg-blue-100 text-blue-800", icon: Users, text: "In Progress" },
        completed: { color: "bg-green-100 text-green-800", icon: CheckCircle, text: "Completed" },
        cancelled: { color: "bg-gray-100 text-gray-800", icon: XCircle, text: "Cancelled" },
        overdue: { color: "bg-red-100 text-red-800", icon: AlertTriangle, text: "Overdue" }
      };
      badge = badges[status as keyof typeof badges] || badges.pending;
    }

    const Icon = badge.icon;

    return (
      <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${badge.color}`}>
        <Icon className="w-3 h-3 mr-1" />
        {badge.text}
      </span>
    );
  };

  const getPriorityBadge = (priority: string) => {
    const colors = {
      low: "bg-green-100 text-green-800",
      medium: "bg-yellow-100 text-yellow-800", 
      high: "bg-red-100 text-red-800"
    };
    return colors[priority as keyof typeof colors] || colors.medium;
  };

  const handleCreateAssignment = async () => {
    try {
      await onCreateAssignment({
        ...formData,
        assignedBy: "current_admin_id" // Get from auth context
      });
      setShowCreateModal(false);
      setFormData({
        policyId: "",
        surveyorIds: [],
        priority: "medium",
        instructions: "",
        deadline: ""
      });
      fetchData();
    } catch (error) {
      console.error('Failed to create assignment:', error);
    }
  };

  const getSurveyorRecommendations = (policy: PolicyRequest | undefined) => {
    if (!policy) return surveyors;

    return surveyors
      .filter(s => 
        s.employeeStatus.status === "Active" &&
        s.specializations?.some(spec => 
          spec.toLowerCase().includes(policy.propertyDetails.propertyType.toLowerCase().split(' ')[0])
        )
      )
      .sort((a, b) => {
        // Sort by workload (ascending) then rating (descending)
        if (a.currentWorkload !== b.currentWorkload) {
          return (a.currentWorkload || 0) - (b.currentWorkload || 0);
        }
        return (b.rating || 0) - (a.rating || 0);
      });
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="animate-pulse">
          <div className="h-8 bg-gray-300 rounded w-1/3 mb-4"></div>
          <div className="h-10 bg-gray-300 rounded mb-4"></div>
          <div className="space-y-4">
            {[1, 2, 3].map((i) => (
              <div key={i} className="h-32 bg-gray-300 rounded"></div>
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
          <h2 className="text-2xl font-bold text-gray-900">Assignment Management</h2>
          <p className="text-gray-600">Manage surveyor assignments and workload distribution</p>
        </div>
        <button
          onClick={() => setShowCreateModal(true)}
          className="bg-[#028835] text-white px-4 py-2 rounded-lg hover:bg-green-700 flex items-center"
        >
          <Plus className="h-4 w-4 mr-2" />
          Create Assignment
        </button>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Total</p>
              <p className="text-2xl font-bold text-gray-900">{assignments.length}</p>
            </div>
            <FileText className="h-8 w-8 text-gray-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Pending</p>
              <p className="text-2xl font-bold text-yellow-600">
                {assignments.filter(a => a.status === 'pending').length}
              </p>
            </div>
            <Clock className="h-8 w-8 text-yellow-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">In Progress</p>
              <p className="text-2xl font-bold text-blue-600">
                {assignments.filter(a => a.status === 'in_progress').length}
              </p>
            </div>
            <Users className="h-8 w-8 text-blue-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Completed</p>
              <p className="text-2xl font-bold text-green-600">
                {assignments.filter(a => a.status === 'completed').length}
              </p>
            </div>
            <CheckCircle className="h-8 w-8 text-green-400" />
          </div>
        </div>
        <div className="bg-white p-4 rounded-lg shadow-sm border">
          <div className="flex items-center justify-between">
            <div>
              <p className="text-sm text-gray-600">Overdue</p>
              <p className="text-2xl font-bold text-red-600">
                {filteredAssignments.filter(a => a.isOverdue).length}
              </p>
            </div>
            <AlertTriangle className="h-8 w-8 text-red-400" />
          </div>
        </div>
      </div>

      {/* Filters */}
      <div className="bg-white p-4 rounded-lg shadow-sm border border-gray-200">
        <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
          <div className="relative">
            <Search className="h-4 w-4 absolute left-3 top-3 text-gray-400" />
            <input
              type="text"
              placeholder="Search assignments..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10 w-full border border-gray-300 rounded-md px-3 py-2"
            />
          </div>
          
          <select
            value={statusFilter}
            onChange={(e) => setStatusFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Statuses</option>
            <option value="pending">Pending</option>
            <option value="in_progress">In Progress</option>
            <option value="completed">Completed</option>
            <option value="overdue">Overdue</option>
          </select>

          <select
            value={priorityFilter}
            onChange={(e) => setPriorityFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Priorities</option>
            <option value="low">Low</option>
            <option value="medium">Medium</option>
            <option value="high">High</option>
          </select>

          <select
            value={surveyorFilter}
            onChange={(e) => setSurveyorFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Surveyors</option>
            {surveyors.map(surveyor => (
              <option key={surveyor._id} value={surveyor._id}>
                {surveyor.firstname} {surveyor.lastname}
              </option>
            ))}
          </select>

          <label className="flex items-center">
            <input
              type="checkbox"
              checked={overdueFilter}
              onChange={(e) => setOverdueFilter(e.target.checked)}
              className="mr-2"
            />
            <span className="text-sm">Overdue Only</span>
          </label>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setPriorityFilter("all");
              setSurveyorFilter("all");
              setOverdueFilter(false);
            }}
            className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50"
          >
            Clear
          </button>
        </div>
      </div>

      {/* Assignments List */}
      <div className="space-y-4">
        {filteredAssignments.map((assignment) => (
          <div key={assignment._id} className={`bg-white rounded-lg shadow-sm border p-6 ${assignment.isOverdue ? 'border-red-200' : 'border-gray-200'}`}>
            <div className="flex items-start justify-between mb-4">
              <div className="flex-1">
                <div className="flex items-center space-x-2 mb-2">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {assignment.policy?.propertyDetails.propertyType}
                  </h3>
                  {getStatusBadge(assignment.status, assignment.isOverdue)}
                  <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(assignment.priority)}`}>
                    {assignment.priority.toUpperCase()}
                  </span>
                </div>
                <div className="flex items-center text-sm text-gray-600 space-x-4">
                  <div className="flex items-center">
                    <MapPin className="h-4 w-4 mr-1" />
                    {assignment.policy?.propertyDetails.address}
                  </div>
                  <div className="flex items-center">
                    <Calendar className="h-4 w-4 mr-1" />
                    Due: {new Date(assignment.deadline).toLocaleDateString()}
                  </div>
                </div>
              </div>
              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowDetailsModal(true);
                  }}
                  className="text-[#028835] hover:text-green-700"
                >
                  <Eye className="h-4 w-4" />
                </button>
                <button
                  onClick={() => {
                    setSelectedAssignment(assignment);
                    setShowReassignModal(true);
                  }}
                  className="text-blue-600 hover:text-blue-800"
                >
                  <UserPlus className="h-4 w-4" />
                </button>
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Client</p>
                <p className="text-sm text-gray-900">{assignment.policy?.contactDetails.fullName}</p>
                <p className="text-xs text-gray-500">{assignment.policy?.contactDetails.email}</p>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Assigned Surveyors</p>
                <div className="flex flex-wrap gap-1">
                  {assignment.assignedSurveyors.map((surveyor) => (
                    <span key={surveyor._id} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {surveyor.firstname} {surveyor.lastname}
                    </span>
                  ))}
                </div>
              </div>
              <div>
                <p className="text-sm font-medium text-gray-700 mb-1">Property Value</p>
                <p className="text-sm text-gray-900">
                  ₦{assignment.policy?.propertyDetails.buildingValue.toLocaleString()}
                </p>
                <p className="text-xs text-gray-500">
                  {assignment.policy?.propertyDetails.squareFootage} sq ft
                </p>
              </div>
            </div>

            {assignment.instructions && (
              <div className="bg-gray-50 p-3 rounded">
                <p className="text-sm font-medium text-gray-700 mb-1">Instructions</p>
                <p className="text-sm text-gray-600">{assignment.instructions}</p>
              </div>
            )}
          </div>
        ))}
      </div>

      {filteredAssignments.length === 0 && (
        <div className="text-center py-12">
          <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
          <p className="text-gray-600">No assignments found matching your criteria.</p>
        </div>
      )}

      {/* Create Assignment Modal */}
      {showCreateModal && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Create New Assignment</h3>
              <button
                onClick={() => setShowCreateModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Select Policy
                </label>
                <select
                  value={formData.policyId}
                  onChange={(e) => setFormData({...formData, policyId: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                >
                  <option value="">Select a policy...</option>
                  {policies.filter(p => p.status === 'submitted').map(policy => (
                    <option key={policy._id} value={policy._id}>
                      {policy.contactDetails.fullName} - {policy.propertyDetails.propertyType} - {policy.propertyDetails.address}
                    </option>
                  ))}
                </select>
              </div>

              {formData.policyId && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-2">
                    Recommended Surveyors
                  </label>
                  <div className="space-y-2 max-h-48 overflow-y-auto">
                    {getSurveyorRecommendations(policies.find(p => p._id === formData.policyId)).map((surveyor) => (
                      <label key={surveyor._id} className="flex items-center p-3 border rounded-lg hover:bg-gray-50">
                        <input
                          type="checkbox"
                          checked={formData.surveyorIds.includes(surveyor._id)}
                          onChange={(e) => {
                            if (e.target.checked) {
                              setFormData({
                                ...formData,
                                surveyorIds: [...formData.surveyorIds, surveyor._id]
                              });
                            } else {
                              setFormData({
                                ...formData,
                                surveyorIds: formData.surveyorIds.filter(id => id !== surveyor._id)
                              });
                            }
                          }}
                          className="mr-3"
                        />
                        <div className="flex-1">
                          <div className="flex items-center justify-between">
                            <p className="text-sm font-medium">
                              {surveyor.firstname} {surveyor.lastname}
                            </p>
                            <div className="flex items-center space-x-2">
                              <span className="flex items-center text-xs text-yellow-600">
                                <Star className="h-3 w-3 mr-1" />
                                {surveyor.rating}
                              </span>
                              <span className="text-xs text-gray-500">
                                Workload: {surveyor.currentWorkload || 0}
                              </span>
                            </div>
                          </div>
                          <p className="text-xs text-gray-500">
                            {surveyor.specializations?.join(", ")}
                          </p>
                        </div>
                      </label>
                    ))}
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Priority
                  </label>
                  <select
                    value={formData.priority}
                    onChange={(e) => setFormData({...formData, priority: e.target.value as any})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  >
                    <option value="low">Low</option>
                    <option value="medium">Medium</option>
                    <option value="high">High</option>
                  </select>
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Deadline
                  </label>
                  <input
                    type="date"
                    value={formData.deadline ? formData.deadline.split('T')[0] : ''}
                    onChange={(e) => setFormData({
                      ...formData, 
                      deadline: e.target.value ? `${e.target.value}T00:00:00Z` : ''
                    })}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Instructions
                </label>
                <textarea
                  value={formData.instructions}
                  onChange={(e) => setFormData({...formData, instructions: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                  placeholder="Special instructions for the surveyor(s)..."
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => setShowCreateModal(false)}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={handleCreateAssignment}
                  disabled={!formData.policyId || formData.surveyorIds.length === 0}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  Create Assignment
                </button>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Assignment Details Modal */}
      {showDetailsModal && selectedAssignment && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-3xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">Assignment Details</h3>
              <button
                onClick={() => setShowDetailsModal(false)}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-6">
              {/* Assignment Info */}
              <div className="grid grid-cols-2 gap-6">
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Assignment Information</h4>
                  <div className="space-y-2 text-sm">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Status:</span>
                      {getStatusBadge(selectedAssignment.status, selectedAssignment.isOverdue)}
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Priority:</span>
                      <span className={`px-2 py-1 rounded text-xs font-medium ${getPriorityBadge(selectedAssignment.priority)}`}>
                        {selectedAssignment.priority.toUpperCase()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Deadline:</span>
                      <span className={selectedAssignment.isOverdue ? 'text-red-600 font-medium' : ''}>
                        {new Date(selectedAssignment.deadline).toLocaleDateString()}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Created:</span>
                      <span>{new Date(selectedAssignment.createdAt).toLocaleDateString()}</span>
                    </div>
                  </div>
                </div>
                
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Property Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">Type:</span> {selectedAssignment.policy?.propertyDetails.propertyType}</p>
                    <p><span className="text-gray-600">Value:</span> ₦{selectedAssignment.policy?.propertyDetails.buildingValue.toLocaleString()}</p>
                    <p><span className="text-gray-600">Size:</span> {selectedAssignment.policy?.propertyDetails.squareFootage} sq ft</p>
                    <p><span className="text-gray-600">Built:</span> {selectedAssignment.policy?.propertyDetails.yearBuilt}</p>
                  </div>
                </div>
              </div>

              {/* Client Info */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Client Information</h4>
                <div className="bg-gray-50 p-4 rounded">
                  <p className="font-medium">{selectedAssignment.policy?.contactDetails.fullName}</p>
                  <p className="text-sm text-gray-600">{selectedAssignment.policy?.contactDetails.email}</p>
                  <p className="text-sm text-gray-600">{selectedAssignment.policy?.contactDetails.phoneNumber}</p>
                </div>
              </div>

              {/* Assigned Surveyors */}
              <div>
                <h4 className="font-medium text-gray-900 mb-3">Assigned Surveyors</h4>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  {selectedAssignment.assignedSurveyors.map((surveyor) => (
                    <div key={surveyor._id} className="border rounded-lg p-4">
                      <div className="flex items-center justify-between mb-2">
                        <p className="font-medium">{surveyor.firstname} {surveyor.lastname}</p>
                        <div className="flex items-center text-sm text-yellow-600">
                          <Star className="h-3 w-3 mr-1" />
                          {surveyor.rating}
                        </div>
                      </div>
                      <p className="text-sm text-gray-600">{surveyor.email}</p>
                      <p className="text-sm text-gray-600">{surveyor.phonenumber}</p>
                      <div className="flex flex-wrap gap-1 mt-2">
                        {surveyor.specializations?.map((spec, index) => (
                          <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                            {spec}
                          </span>
                        ))}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Instructions */}
              {selectedAssignment.instructions && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-3">Instructions</h4>
                  <div className="bg-gray-50 p-4 rounded">
                    <p className="text-sm text-gray-700">{selectedAssignment.instructions}</p>
                  </div>
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
                    setShowReassignModal(true);
                  }}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  Reassign Surveyors
                </button>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
};

export default AssignmentManagement;