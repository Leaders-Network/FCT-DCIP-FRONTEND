"use client";
import React, { useState, useEffect } from "react";
import { 
  Users, 
  Star, 
  Clock, 
  MapPin, 
  Phone, 
  Mail, 
  Calendar,
  CheckCircle,
  AlertCircle,
  Plus,
  Filter,
  Search,
  MoreVertical,
  Eye,
  Edit,
  Trash2
} from "lucide-react";
import { Surveyor, Assignment } from "@/types/api.types";

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
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("all");
  const [specializationFilter, setSpecializationFilter] = useState<string>("all");
  const [showCreateModal, setShowCreateModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDetailsModal, setShowDetailsModal] = useState(false);
  const [selectedSurveyor, setSelectedSurveyor] = useState<Surveyor | null>(null);
  const [formData, setFormData] = useState({
    firstname: "",
    lastname: "",
    email: "",
    phonenumber: "",
    specializations: [] as string[],
    licenseNumber: "",
    address: "",
    emergencyContact: "",
    notes: ""
  });

  useEffect(() => {
    fetchSurveyors();
    fetchAssignments();
  }, []);

  const fetchSurveyors = async () => {
    setLoading(true);
    try {
      // Mock data - replace with actual API call
      await new Promise(resolve => setTimeout(resolve, 1000));
      
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
          specializations: ["Residential", "Commercial"],
          licenseNumber: "SRV001",
          totalSurveys: 45,
          completedSurveys: 42,
          rating: 4.9,
          address: "123 Professional Ave, Abuja",
          emergencyContact: "+234 806 789 0123",
          notes: "Excellent track record with residential properties"
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
          address: "456 Industry Rd, Abuja",
          emergencyContact: "+234 807 890 1234",
          notes: "Specialist in industrial facilities"
        },
        {
          _id: "surveyor3",
          firstname: "David",
          lastname: "Chen",
          email: "david.chen@surveyors.com",
          phonenumber: "+234 807 890 1234",
          employeeStatus: { _id: "status2", status: "On Leave" },
          employeeRole: { _id: "role1", role: "Surveyor" },
          deleted: false,
          createdAt: "2024-03-15T00:00:00Z",
          updatedAt: "2024-09-25T00:00:00Z",
          specializations: ["Residential", "Agricultural"],
          licenseNumber: "SRV003",
          totalSurveys: 28,
          completedSurveys: 26,
          rating: 4.8,
          address: "789 Suburban St, Abuja",
          emergencyContact: "+234 808 901 2345",
          notes: "Currently on medical leave until end of October"
        }
      ]);
    } catch (error) {
      console.error('Failed to fetch surveyors:', error);
    } finally {
      setLoading(false);
    }
  };

  const fetchAssignments = async () => {
    try {
      // Mock assignments data
      // Use real API call instead of mock data
      setAssignments([]);
    } catch (error) {
      console.error('Failed to fetch assignments:', error);
    }
  };

  const filteredSurveyors = surveyors.filter(surveyor => {
    const matchesSearch = 
      surveyor.firstname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surveyor.lastname.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surveyor.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
      surveyor.licenseNumber?.toLowerCase().includes(searchTerm.toLowerCase());
    
    const matchesStatus = 
      statusFilter === "all" || 
      surveyor.employeeStatus.status.toLowerCase() === statusFilter.toLowerCase();
    
    const matchesSpecialization = 
      specializationFilter === "all" || 
      surveyor.specializations?.some(spec => 
        spec.toLowerCase().includes(specializationFilter.toLowerCase())
      );

    return matchesSearch && matchesStatus && matchesSpecialization;
  });

  const getStatusBadge = (status: string) => {
    const colors = {
      Active: "bg-green-100 text-green-800",
      "On Leave": "bg-yellow-100 text-yellow-800",
      Inactive: "bg-red-100 text-red-800"
    };
    return colors[status as keyof typeof colors] || "bg-gray-100 text-gray-800";
  };

  const getCurrentAssignments = (surveyorId: string) => {
    return assignments.filter(
      assignment => 
        assignment.surveyorId === surveyorId && 
        assignment.status === "in_progress"
    ).length;
  };

  const handleCreateSurveyor = async () => {
    try {
      await onCreateSurveyor(formData);
      setShowCreateModal(false);
      setFormData({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        specializations: [],
        licenseNumber: "",
        address: "",
        emergencyContact: "",
        notes: ""
      });
      fetchSurveyors();
    } catch (error) {
      console.error('Failed to create surveyor:', error);
    }
  };

  const handleUpdateSurveyor = async () => {
    if (!selectedSurveyor) return;
    
    try {
      await onUpdateSurveyor(selectedSurveyor._id, formData);
      setShowEditModal(false);
      fetchSurveyors();
    } catch (error) {
      console.error('Failed to update surveyor:', error);
    }
  };

  const handleDeleteSurveyor = async (surveyorId: string) => {
    if (window.confirm('Are you sure you want to delete this surveyor?')) {
      try {
        await onDeleteSurveyor(surveyorId);
        fetchSurveyors();
      } catch (error) {
        console.error('Failed to delete surveyor:', error);
      }
    }
  };

  const openEditModal = (surveyor: Surveyor) => {
    setSelectedSurveyor(surveyor);
    setFormData({
      firstname: surveyor.firstname,
      lastname: surveyor.lastname,
      email: surveyor.email,
      phonenumber: surveyor.phonenumber,
      specializations: surveyor.specializations || [],
      licenseNumber: surveyor.licenseNumber || "",
      address: surveyor.address || "",
      emergencyContact: surveyor.emergencyContact || "",
      notes: surveyor.notes || ""
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
          <p className="text-gray-600">Manage surveyor profiles and assignments</p>
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
              placeholder="Search surveyors..."
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
            <option value="active">Active</option>
            <option value="on leave">On Leave</option>
            <option value="inactive">Inactive</option>
          </select>

          <select
            value={specializationFilter}
            onChange={(e) => setSpecializationFilter(e.target.value)}
            className="border border-gray-300 rounded-md px-3 py-2"
          >
            <option value="all">All Specializations</option>
            <option value="residential">Residential</option>
            <option value="commercial">Commercial</option>
            <option value="industrial">Industrial</option>
            <option value="agricultural">Agricultural</option>
          </select>

          <button
            onClick={() => {
              setSearchTerm("");
              setStatusFilter("all");
              setSpecializationFilter("all");
            }}
            className="border border-gray-300 rounded-md px-3 py-2 hover:bg-gray-50"
          >
            Clear Filters
          </button>
        </div>
      </div>

      {/* Surveyors Grid */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {filteredSurveyors.map((surveyor) => (
          <div key={surveyor._id} className="bg-white rounded-lg shadow-sm border border-gray-200 overflow-hidden">
            <div className="p-6">
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <h3 className="text-lg font-semibold text-gray-900">
                    {surveyor.firstname} {surveyor.lastname}
                  </h3>
                  <p className="text-sm text-gray-600">{surveyor.employeeRole.role}</p>
                </div>
                <div className="relative">
                  <button className="text-gray-400 hover:text-gray-600">
                    <MoreVertical className="h-4 w-4" />
                  </button>
                </div>
              </div>

              <div className="space-y-3 mb-4">
                <div className="flex items-center text-sm text-gray-600">
                  <Mail className="h-4 w-4 mr-2 text-gray-400" />
                  {surveyor.email}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <Phone className="h-4 w-4 mr-2 text-gray-400" />
                  {surveyor.phonenumber}
                </div>
                <div className="flex items-center text-sm text-gray-600">
                  <MapPin className="h-4 w-4 mr-2 text-gray-400" />
                  License: {surveyor.licenseNumber}
                </div>
              </div>

              <div className="flex items-center justify-between mb-4">
                <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${getStatusBadge(surveyor.employeeStatus.status)}`}>
                  {surveyor.employeeStatus.status}
                </span>
                <div className="flex items-center text-sm text-gray-600">
                  <Star className="h-4 w-4 text-yellow-400 mr-1" />
                  {surveyor.rating}/5.0
                </div>
              </div>

              <div className="space-y-2 mb-4">
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Completed Surveys:</span>
                  <span className="font-medium">{surveyor.completedSurveys}/{surveyor.totalSurveys}</span>
                </div>
                <div className="flex justify-between text-sm">
                  <span className="text-gray-600">Current Assignments:</span>
                  <span className="font-medium">{getCurrentAssignments(surveyor._id)}</span>
                </div>
              </div>

              <div className="mb-4">
                <p className="text-xs text-gray-600 mb-1">Specializations:</p>
                <div className="flex flex-wrap gap-1">
                  {surveyor.specializations?.map((spec, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              <div className="flex space-x-2">
                <button
                  onClick={() => {
                    setSelectedSurveyor(surveyor);
                    setShowDetailsModal(true);
                  }}
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

      {/* Create/Edit Surveyor Modal */}
      {(showCreateModal || showEditModal) && (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
          <div className="bg-white rounded-lg w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <div className="flex justify-between items-center p-6 border-b">
              <h3 className="text-lg font-semibold">
                {showCreateModal ? "Add New Surveyor" : "Edit Surveyor"}
              </h3>
              <button
                onClick={() => {
                  setShowCreateModal(false);
                  setShowEditModal(false);
                }}
                className="text-gray-500 hover:text-gray-700"
              >
                ×
              </button>
            </div>
            <div className="p-6 space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    First Name
                  </label>
                  <input
                    type="text"
                    value={formData.firstname}
                    onChange={(e) => setFormData({...formData, firstname: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Last Name
                  </label>
                  <input
                    type="text"
                    value={formData.lastname}
                    onChange={(e) => setFormData({...formData, lastname: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Email
                  </label>
                  <input
                    type="email"
                    value={formData.email}
                    onChange={(e) => setFormData({...formData, email: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Phone Number
                  </label>
                  <input
                    type="tel"
                    value={formData.phonenumber}
                    onChange={(e) => setFormData({...formData, phonenumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    License Number
                  </label>
                  <input
                    type="text"
                    value={formData.licenseNumber}
                    onChange={(e) => setFormData({...formData, licenseNumber: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Emergency Contact
                  </label>
                  <input
                    type="tel"
                    value={formData.emergencyContact}
                    onChange={(e) => setFormData({...formData, emergencyContact: e.target.value})}
                    className="w-full border border-gray-300 rounded-md px-3 py-2"
                  />
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Address
                </label>
                <input
                  type="text"
                  value={formData.address}
                  onChange={(e) => setFormData({...formData, address: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Specializations
                </label>
                <div className="grid grid-cols-2 gap-2">
                  {["Residential", "Commercial", "Industrial", "Agricultural"].map(spec => (
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
                        className="mr-2"
                      />
                      {spec}
                    </label>
                  ))}
                </div>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Notes
                </label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({...formData, notes: e.target.value})}
                  className="w-full border border-gray-300 rounded-md px-3 py-2"
                  rows={3}
                />
              </div>

              <div className="flex justify-end space-x-2 pt-4 border-t">
                <button
                  onClick={() => {
                    setShowCreateModal(false);
                    setShowEditModal(false);
                  }}
                  className="px-4 py-2 text-gray-600 border border-gray-300 rounded-md hover:bg-gray-50"
                >
                  Cancel
                </button>
                <button
                  onClick={showCreateModal ? handleCreateSurveyor : handleUpdateSurveyor}
                  className="px-4 py-2 bg-[#028835] text-white rounded-md hover:bg-green-700"
                >
                  {showCreateModal ? "Create Surveyor" : "Update Surveyor"}
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
                    <p><span className="text-gray-600">Name:</span> {selectedSurveyor.firstname} {selectedSurveyor.lastname}</p>
                    <p><span className="text-gray-600">Email:</span> {selectedSurveyor.email}</p>
                    <p><span className="text-gray-600">Phone:</span> {selectedSurveyor.phonenumber}</p>
                    <p><span className="text-gray-600">Emergency Contact:</span> {selectedSurveyor.emergencyContact}</p>
                    <p><span className="text-gray-600">Address:</span> {selectedSurveyor.address}</p>
                  </div>
                </div>
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Professional Information</h4>
                  <div className="space-y-2 text-sm">
                    <p><span className="text-gray-600">License:</span> {selectedSurveyor.licenseNumber}</p>
                    <p><span className="text-gray-600">Role:</span> {selectedSurveyor.employeeRole.role}</p>
                    <p><span className="text-gray-600">Status:</span> {selectedSurveyor.employeeStatus.status}</p>
                    <p><span className="text-gray-600">Rating:</span> {selectedSurveyor.rating}/5.0</p>
                    <p><span className="text-gray-600">Joined:</span> {new Date(selectedSurveyor.createdAt).toLocaleDateString()}</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Performance Metrics</h4>
                <div className="grid grid-cols-3 gap-4">
                  <div className="bg-blue-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-blue-600">{selectedSurveyor.totalSurveys}</p>
                    <p className="text-sm text-blue-800">Total Surveys</p>
                  </div>
                  <div className="bg-green-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-green-600">{selectedSurveyor.completedSurveys}</p>
                    <p className="text-sm text-green-800">Completed</p>
                  </div>
                  <div className="bg-yellow-50 p-4 rounded-lg">
                    <p className="text-2xl font-bold text-yellow-600">{getCurrentAssignments(selectedSurveyor._id)}</p>
                    <p className="text-sm text-yellow-800">Current Assignments</p>
                  </div>
                </div>
              </div>

              <div>
                <h4 className="font-medium text-gray-900 mb-2">Specializations</h4>
                <div className="flex flex-wrap gap-2">
                  {selectedSurveyor.specializations?.map((spec, index) => (
                    <span key={index} className="bg-blue-100 text-blue-800 text-sm px-3 py-1 rounded-full">
                      {spec}
                    </span>
                  ))}
                </div>
              </div>

              {selectedSurveyor.notes && (
                <div>
                  <h4 className="font-medium text-gray-900 mb-2">Notes</h4>
                  <p className="text-sm text-gray-600 bg-gray-50 p-3 rounded">
                    {selectedSurveyor.notes}
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
                    handleDeleteSurveyor(selectedSurveyor._id);
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