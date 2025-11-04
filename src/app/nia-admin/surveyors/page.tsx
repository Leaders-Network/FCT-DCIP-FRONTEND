"use client";
import React, { useState, useEffect } from 'react';
import {
    Plus,
    Search,
    RefreshCw,
    Users,
    UserCheck,
    UserX,
    Edit,
    Trash2,
    Eye,
    Mail,
    Phone,
    Award,
    AlertTriangle
} from 'lucide-react';
import NIASurveyorManagement from '@/components/nia-admin/NIASurveyorManagement';
import { NIASurveyor } from '@/types/api.types';

interface NIAUser {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
}

interface NIASurveyorLocal {
    _id: string;
    userId: NIAUser | string;
    firstname?: string;
    lastname?: string;
    email?: string;
    phoneNumber?: string;
    address?: string;
    licenseNumber?: string;
    specialization?: string[];
    experience?: number;
    status: 'active' | 'inactive' | 'suspended';
    availability?: 'available' | 'busy' | 'unavailable';
    maxAssignments?: number;
    currentAssignments: number;
    completedAssignments: number;
    rating: number;
    joinedDate: string;
    lastActive: string;
    dateOfBirth?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    qualifications?: string[];
    notes?: string;
    profile?: {
        experience?: number;
        availability?: 'available' | 'busy' | 'unavailable';
        specialization?: string[];
    };
}

interface NIASurveyorForManagement {
    _id?: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    address: string;
    licenseNumber: string;
    specialization: string[];
    experience: number;
    status: 'active' | 'inactive' | 'suspended';
    availability: 'available' | 'busy' | 'unavailable';
    maxAssignments: number;
    dateOfBirth?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    qualifications?: string[];
    notes?: string;
    // Required fields from original interface
    userId: NIAUser | string;
    currentAssignments: number;
    completedAssignments: number;
    rating: number;
    joinedDate: string;
    lastActive: string;
}

const NIASurveyorsPage = () => {
    const [surveyors, setSurveyors] = useState<NIASurveyorLocal[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showManagementModal, setShowManagementModal] = useState(false);
    const [selectedSurveyor, setSelectedSurveyor] = useState<NIASurveyorForManagement | null>(null);
    const [managementMode, setManagementMode] = useState<'add' | 'edit' | 'view'>('add');
    const [showDeleteConfirm, setShowDeleteConfirm] = useState(false);
    const [surveyorToDelete, setSurveyorToDelete] = useState<{ id: string, name: string } | null>(null);
    const [filters, setFilters] = useState({
        status: 'all',
        availability: 'all',
        specialization: 'all',
        search: ''
    });

    useEffect(() => {
        fetchSurveyors();
    }, [filters]);

    const fetchSurveyors = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('niaAdminToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const queryParams = new URLSearchParams();
            if (filters.status !== 'all') queryParams.append('status', filters.status);
            if (filters.availability !== 'all') queryParams.append('availability', filters.availability);
            if (filters.specialization !== 'all') queryParams.append('specialization', filters.specialization);

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/nia-admin/surveyors?${queryParams.toString()}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch surveyors');
            }

            const data = await response.json();

            if (data.success) {
                let filteredSurveyors = data.data.surveyors || [];

                // Apply search filter
                if (filters.search) {
                    filteredSurveyors = filteredSurveyors.filter((surveyor: NIASurveyorLocal) => {
                        const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                        const fullName = user ? `${user.firstname} ${user.lastname}` : '';
                        const email = user?.email || '';
                        const license = surveyor.licenseNumber || '';

                        return fullName.toLowerCase().includes(filters.search.toLowerCase()) ||
                            email.toLowerCase().includes(filters.search.toLowerCase()) ||
                            license.toLowerCase().includes(filters.search.toLowerCase());
                    });
                }

                setSurveyors(filteredSurveyors);
            } else {
                throw new Error(data.message || 'Failed to load surveyors');
            }
        } catch (error) {
            console.error('Surveyors fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load surveyors');
        } finally {
            setLoading(false);
        }
    };

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
            case 'inactive':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">Inactive</span>;
            case 'suspended':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Suspended</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    const getAvailabilityBadge = (availability: string) => {
        switch (availability) {
            case 'available':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-blue-100 text-blue-800">Available</span>;
            case 'busy':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Busy</span>;
            case 'unavailable':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Unavailable</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{availability}</span>;
        }
    };

    const handleUpdateStatus = async (surveyorId: string, newStatus: string) => {
        try {
            const token = localStorage.getItem('niaAdminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/nia-admin/surveyors/${surveyorId}/status`, {
                method: 'PATCH',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({ status: newStatus })
            });

            if (response.ok) {
                fetchSurveyors(); // Refresh the list
            } else {
                throw new Error('Failed to update surveyor status');
            }
        } catch (error) {
            console.error('Status update error:', error);
            alert('Failed to update surveyor status');
        }
    };

    const handleAddSurveyor = () => {
        setSelectedSurveyor(null);
        setManagementMode('add');
        setShowManagementModal(true);
    };

    const handleEditSurveyor = (surveyor: NIASurveyorLocal) => {
        setSelectedSurveyor(convertSurveyorForManagement(surveyor));
        setManagementMode('edit');
        setShowManagementModal(true);
    };

    const handleViewSurveyor = (surveyor: NIASurveyorLocal) => {
        setSelectedSurveyor(convertSurveyorForManagement(surveyor));
        setManagementMode('view');
        setShowManagementModal(true);
    };

    const handleDeleteSurveyor = (surveyorId: string, surveyorName: string) => {
        setSurveyorToDelete({ id: surveyorId, name: surveyorName });
        setShowDeleteConfirm(true);
    };

    const confirmDeleteSurveyor = async () => {
        if (!surveyorToDelete) return;

        try {
            const token = localStorage.getItem('niaAdminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

            const response = await fetch(`${baseUrl}/nia-admin/surveyors/${surveyorToDelete.id}`, {
                method: 'DELETE',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (response.ok) {
                fetchSurveyors(); // Refresh the list
                setShowDeleteConfirm(false);
                setSurveyorToDelete(null);
            } else {
                const errorData = await response.json();
                throw new Error(errorData.message || 'Failed to delete surveyor');
            }
        } catch (error) {
            console.error('Delete surveyor error:', error);
            alert(`Failed to delete surveyor: ${error instanceof Error ? error.message : 'Unknown error'}`);
        }
    };

    const convertSurveyorForManagement = (surveyor: NIASurveyorLocal): NIASurveyorForManagement => {
        const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
        return {
            _id: surveyor._id,
            firstname: user?.firstname || surveyor.firstname || '',
            lastname: user?.lastname || surveyor.lastname || '',
            email: user?.email || surveyor.email || '',
            phoneNumber: user?.phonenumber || surveyor.phoneNumber || '',
            address: surveyor.address || '',
            licenseNumber: surveyor.licenseNumber || '',
            specialization: surveyor.specialization || surveyor.profile?.specialization || [],
            experience: surveyor.experience || surveyor.profile?.experience || 0,
            status: surveyor.status,
            availability: surveyor.availability || surveyor.profile?.availability || 'unavailable',
            maxAssignments: surveyor.maxAssignments || 10,
            dateOfBirth: surveyor.dateOfBirth,
            emergencyContact: surveyor.emergencyContact,
            qualifications: surveyor.qualifications,
            notes: surveyor.notes,
            // Required fields for management interface
            userId: surveyor.userId,
            currentAssignments: surveyor.currentAssignments,
            completedAssignments: surveyor.completedAssignments,
            rating: surveyor.rating,
            joinedDate: surveyor.joinedDate,
            lastActive: surveyor.lastActive
        };
    };

    const handleSaveSurveyor = async (surveyorData: NIASurveyorForManagement) => {
        try {
            const token = localStorage.getItem('niaAdminToken');
            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const url = managementMode === 'add'
                ? `${baseUrl}/nia-admin/surveyors`
                : `${baseUrl}/nia-admin/surveyors/${selectedSurveyor?._id}`;

            const method = managementMode === 'add' ? 'POST' : 'PUT';

            const response = await fetch(url, {
                method,
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(surveyorData)
            });

            if (response.ok) {
                fetchSurveyors(); // Refresh the list
                setShowManagementModal(false);
                setSelectedSurveyor(null);
            } else {
                throw new Error(`Failed to ${managementMode} surveyor`);
            }
        } catch (error) {
            console.error('Save surveyor error:', error);
            throw error; // Re-throw to be handled by the component
        }
    };

    const handleCloseModal = () => {
        setShowManagementModal(false);
        setSelectedSurveyor(null);
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Nigerian Insurers Association Surveyor Management</h1>
                    <p className="text-gray-600 mt-1">Manage Nigerian Insurers Association surveyors, their profiles, and assignments</p>
                </div>
                <div className="flex items-center space-x-3">
                    <button
                        onClick={fetchSurveyors}
                        className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                    >
                        <RefreshCw className="w-4 h-4" />
                        <span>Refresh</span>
                    </button>
                    <button
                        onClick={handleAddSurveyor}
                        className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4" />
                        <span>Add Surveyor</span>
                    </button>
                </div>
            </div>

            {/* Stats Cards */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6">
                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-blue-100 rounded-lg">
                            <Users className="h-6 w-6 text-blue-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Total Surveyors</p>
                            <p className="text-2xl font-bold text-gray-900">{surveyors.length}</p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-green-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-green-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Active Surveyors</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {surveyors.filter(s => s.status === 'active').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-yellow-100 rounded-lg">
                            <UserCheck className="h-6 w-6 text-yellow-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Available</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {surveyors.filter(s => s.availability === 'available').length}
                            </p>
                        </div>
                    </div>
                </div>

                <div className="bg-white p-6 rounded-lg shadow-sm border">
                    <div className="flex items-center">
                        <div className="p-2 bg-red-100 rounded-lg">
                            <UserX className="h-6 w-6 text-red-600" />
                        </div>
                        <div className="ml-4">
                            <p className="text-sm font-medium text-gray-600">Suspended</p>
                            <p className="text-2xl font-bold text-gray-900">
                                {surveyors.filter(s => s.status === 'suspended').length}
                            </p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Filters */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="grid grid-cols-1 md:grid-cols-5 gap-4">
                    <div className="relative md:col-span-2">
                        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                        <input
                            type="text"
                            placeholder="Search surveyors..."
                            value={filters.search}
                            onChange={(e) => setFilters(prev => ({ ...prev, search: e.target.value }))}
                            className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                        />
                    </div>

                    <select
                        value={filters.status}
                        onChange={(e) => setFilters(prev => ({ ...prev, status: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Status</option>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                        <option value="suspended">Suspended</option>
                    </select>

                    <select
                        value={filters.availability}
                        onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Availability</option>
                        <option value="available">Available</option>
                        <option value="busy">Busy</option>
                        <option value="unavailable">Unavailable</option>
                    </select>

                    <select
                        value={filters.specialization}
                        onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                        className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    >
                        <option value="all">All Specializations</option>
                        <option value="residential">Residential</option>
                        <option value="commercial">Commercial</option>
                        <option value="industrial">Industrial</option>
                        <option value="land">Land Survey</option>
                    </select>
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <div className="flex items-center">
                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                        <p className="text-red-700">{error}</p>
                    </div>
                </div>
            )}

            {/* Surveyors Table */}
            {loading ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="animate-pulse">
                        <div className="px-6 py-4 border-b border-gray-200">
                            <div className="h-4 bg-gray-300 rounded w-1/4"></div>
                        </div>
                        {[1, 2, 3, 4, 5].map((i) => (
                            <div key={i} className="px-6 py-4 border-b border-gray-200">
                                <div className="flex items-center space-x-4">
                                    <div className="h-10 w-10 bg-gray-300 rounded-full"></div>
                                    <div className="flex-1 space-y-2">
                                        <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                        <div className="h-3 bg-gray-300 rounded w-1/4"></div>
                                    </div>
                                </div>
                            </div>
                        ))}
                    </div>
                </div>
            ) : surveyors.length > 0 ? (
                <div className="bg-white border border-gray-200 rounded-lg overflow-hidden">
                    <div className="overflow-x-auto">
                        <table className="min-w-full divide-y divide-gray-200">
                            <thead className="bg-gray-50">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Surveyor
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Assignments
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Performance
                                    </th>
                                    <th className="px-6 py-3 text-right text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {surveyors.map((surveyor) => (
                                    <tr key={surveyor._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="h-10 w-10 bg-blue-600 rounded-full flex items-center justify-center">
                                                    <span className="text-white font-medium text-sm">
                                                        {(() => {
                                                            const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                                                            return `${user?.firstname?.[0] || ''}${user?.lastname?.[0] || ''}`;
                                                        })()}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {(() => {
                                                            const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                                                            return user ? `${user.firstname} ${user.lastname}` : 'N/A';
                                                        })()}
                                                    </div>
                                                    <div className="text-sm text-gray-500">
                                                        License: {surveyor.licenseNumber || 'N/A'}
                                                    </div>
                                                    <div className="text-xs text-gray-400">
                                                        {surveyor.profile?.experience || surveyor.experience || 0} years experience
                                                    </div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="text-sm text-gray-900 flex items-center">
                                                <Mail className="w-4 h-4 mr-1 text-gray-400" />
                                                {(() => {
                                                    const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                                                    return user?.email || surveyor.email || 'N/A';
                                                })()}
                                            </div>
                                            <div className="text-sm text-gray-500 flex items-center mt-1">
                                                <Phone className="w-4 h-4 mr-1 text-gray-400" />
                                                {(() => {
                                                    const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                                                    return user?.phonenumber || surveyor.phoneNumber || 'N/A';
                                                })()}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="space-y-1">
                                                {getStatusBadge(surveyor.status)}
                                                {getAvailabilityBadge(surveyor.profile?.availability || surveyor.availability || 'unavailable')}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                                            <div className="space-y-1">
                                                <div>Current: {surveyor.currentAssignments}</div>
                                                <div className="text-gray-500">Completed: {surveyor.completedAssignments}</div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <Award className="w-4 h-4 text-yellow-500 mr-1" />
                                                <span className="text-sm font-medium text-gray-900">
                                                    {surveyor.rating?.toFixed(1) || '0.0'}
                                                </span>
                                                <span className="text-sm text-gray-500 ml-1">/5.0</span>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-right text-sm font-medium">
                                            <div className="flex items-center justify-end space-x-2">
                                                <button
                                                    onClick={() => handleViewSurveyor(surveyor)}
                                                    className="text-blue-600 hover:text-blue-900 transition-colors"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => handleEditSurveyor(surveyor)}
                                                    className="text-gray-600 hover:text-gray-900 transition-colors"
                                                    title="Edit Surveyor"
                                                >
                                                    <Edit className="w-4 h-4" />
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const newStatus = surveyor.status === 'active' ? 'suspended' : 'active';
                                                        handleUpdateStatus(surveyor._id, newStatus);
                                                    }}
                                                    className={`transition-colors ${surveyor.status === 'active'
                                                        ? 'text-red-600 hover:text-red-900'
                                                        : 'text-green-600 hover:text-green-900'
                                                        }`}
                                                    title={surveyor.status === 'active' ? 'Suspend' : 'Activate'}
                                                >
                                                    {surveyor.status === 'active' ? <UserX className="w-4 h-4" /> : <UserCheck className="w-4 h-4" />}
                                                </button>
                                                <button
                                                    onClick={() => {
                                                        const user = typeof surveyor.userId === 'object' ? surveyor.userId : null;
                                                        const name = user ? `${user.firstname} ${user.lastname}` : 'Unknown Surveyor';
                                                        handleDeleteSurveyor(surveyor._id, name);
                                                    }}
                                                    className="text-red-600 hover:text-red-900 transition-colors"
                                                    title="Delete Surveyor"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                </div>
            ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                    <Users className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No surveyors found</h3>
                    <p className="text-gray-600 mb-4">
                        {filters.search || filters.status !== 'all' || filters.availability !== 'all' || filters.specialization !== 'all'
                            ? 'Try adjusting your filters to see more surveyors.'
                            : 'Get started by adding your first NIA surveyor.'}
                    </p>
                    <button
                        onClick={handleAddSurveyor}
                        className="inline-flex items-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-4 h-4 mr-2" />
                        Add Surveyor
                    </button>
                </div>
            )}

            {/* Surveyor Management Modal */}
            {showManagementModal && (
                <NIASurveyorManagement
                    surveyor={selectedSurveyor ? {
                        ...selectedSurveyor,
                        firstname: selectedSurveyor.firstname || '',
                        lastname: selectedSurveyor.lastname || '',
                        email: selectedSurveyor.email || '',
                        phoneNumber: selectedSurveyor.phoneNumber || '',
                        address: selectedSurveyor.address || '',
                        licenseNumber: selectedSurveyor.licenseNumber || '',
                        specialization: selectedSurveyor.specialization || [],
                        experience: selectedSurveyor.experience || 0,
                        availability: selectedSurveyor.availability || 'unavailable',
                        maxAssignments: selectedSurveyor.maxAssignments || 10
                    } as NIASurveyor : null}
                    mode={managementMode}
                    onSave={async (surveyorData: NIASurveyor) => {
                        // Convert NIASurveyor to NIASurveyorForManagement format
                        const managementData: NIASurveyorForManagement = {
                            _id: surveyorData._id,
                            firstname: surveyorData.firstname || '',
                            lastname: surveyorData.lastname || '',
                            email: surveyorData.email || '',
                            phoneNumber: surveyorData.phoneNumber || '',
                            address: surveyorData.address || '',
                            licenseNumber: surveyorData.licenseNumber || '',
                            specialization: surveyorData.specialization || [],
                            experience: surveyorData.experience || 0,
                            status: surveyorData.status,
                            availability: surveyorData.availability || 'unavailable',
                            maxAssignments: surveyorData.maxAssignments || 10,
                            dateOfBirth: surveyorData.dateOfBirth,
                            emergencyContact: surveyorData.emergencyContact,
                            qualifications: surveyorData.qualifications,
                            notes: surveyorData.notes,
                            userId: surveyorData.userId,
                            currentAssignments: surveyorData.currentAssignments,
                            completedAssignments: surveyorData.completedAssignments,
                            rating: surveyorData.rating,
                            joinedDate: surveyorData.joinedDate,
                            lastActive: surveyorData.lastActive
                        };
                        await handleSaveSurveyor(managementData);
                    }}
                    onClose={handleCloseModal}
                />
            )}

            {/* Delete Confirmation Modal */}
            {showDeleteConfirm && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
                    <div className="bg-white rounded-lg p-6 max-w-md w-full mx-4">
                        <div className="flex items-center mb-4">
                            <div className="flex-shrink-0">
                                <Trash2 className="h-6 w-6 text-red-600" />
                            </div>
                            <div className="ml-3">
                                <h3 className="text-lg font-medium text-gray-900">
                                    Delete Surveyor
                                </h3>
                            </div>
                        </div>
                        <div className="mb-4">
                            <p className="text-sm text-gray-500">
                                Are you sure you want to delete <strong>{surveyorToDelete?.name}</strong>?
                                This action cannot be undone and will permanently remove the surveyor from the system.
                            </p>
                            <p className="text-sm text-red-600 mt-2">
                                Note: Surveyors with active assignments cannot be deleted.
                            </p>
                        </div>
                        <div className="flex justify-end space-x-3">
                            <button
                                onClick={() => {
                                    setShowDeleteConfirm(false);
                                    setSurveyorToDelete(null);
                                }}
                                className="px-4 py-2 text-sm font-medium text-gray-700 bg-gray-100 border border-gray-300 rounded-md hover:bg-gray-200 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-gray-500"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={confirmDeleteSurveyor}
                                className="px-4 py-2 text-sm font-medium text-white bg-red-600 border border-transparent rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-red-500"
                            >
                                Delete Surveyor
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NIASurveyorsPage;