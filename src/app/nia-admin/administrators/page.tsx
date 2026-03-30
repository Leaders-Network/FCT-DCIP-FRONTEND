"use client";
import React, { useState, useEffect } from 'react';
import { getAuthToken } from '@/utils/auth';
import {
    UserPlus,
    Search,
    MoreVertical,
    Edit,
    Trash2,
    Shield,
    Mail,
    Phone,
    Calendar,
    X
} from 'lucide-react';

interface NIAAdmin {
    _id: string;
    userId: {
        firstname: string;
        lastname: string;
        email: string;
        phonenumber: string;
    };
    permissions: {
        canManageSurveyors: boolean;
        canManageAssignments: boolean;
        canViewReports: boolean;
        canManageAdmins: boolean;
    };
    status: 'active' | 'inactive' | 'pending';
    createdAt: string;
    lastLogin?: string;
}

const NIAAdministratorsPage = () => {
    const [admins, setAdmins] = useState<NIAAdmin[]>([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showAddModal, setShowAddModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDeleteModal, setShowDeleteModal] = useState(false);
    const [selectedAdmin, setSelectedAdmin] = useState<NIAAdmin | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        phonenumber: '',
        permissions: {
            canManageSurveyors: true,
            canManageAssignments: true,
            canViewReports: true,
            canManageAdmins: false
        }
    });

    useEffect(() => {
        fetchNIAAdmins();
    }, []);

    const fetchNIAAdmins = async () => {
        try {
            setLoading(true);
            const token = getAuthToken('nia-admin');

            if (!token) {
                // If not authenticated as NIA admin, show a friendly message but don't throw
                setError('You must be logged in as a NIA administrator to view this page.');
                setAdmins([]);
                return;
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/nia-admin`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch NIA administrators');
            }

            const data = await response.json();

            if (data.success) {
                setAdmins(data.data.niaAdmins || []);
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to load administrators');
            }
        } catch (error) {
            console.error('NIA admins fetch error:', error);
            setError(error instanceof Error ? error.message : 'Failed to load administrators');
            setAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    const handleCreateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        try {
            const token = getAuthToken('nia-admin');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(`${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/nia-admin`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify(formData)
            });

            if (!response.ok) {
                throw new Error('Failed to create NIA administrator');
            }

            const data = await response.json();

            if (data.success) {
                setShowAddModal(false);
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phonenumber: '',
                    permissions: {
                        canManageSurveyors: true,
                        canManageAssignments: true,
                        canViewReports: true,
                        canManageAdmins: false
                    }
                });
                fetchNIAAdmins(); // Refresh the list
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to create administrator');
            }
        } catch (error) {
            console.error('Create admin error:', error);
            setError(error instanceof Error ? error.message : 'Failed to create administrator');
        }
    };

    const handleEditClick = (admin: NIAAdmin) => {
        setSelectedAdmin(admin);
        setFormData({
            firstname: admin.userId.firstname,
            lastname: admin.userId.lastname,
            email: admin.userId.email,
            phonenumber: admin.userId.phonenumber,
            permissions: admin.permissions
        });
        setShowEditModal(true);
    };

    const handleUpdateAdmin = async (e: React.FormEvent) => {
        e.preventDefault();
        if (!selectedAdmin) return;

        try {
            const token = getAuthToken('nia-admin');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/nia-admin/${selectedAdmin._id}`,
                {
                    method: 'PATCH',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    },
                    body: JSON.stringify({
                        permissions: formData.permissions
                    })
                }
            );

            if (!response.ok) {
                throw new Error('Failed to update NIA administrator');
            }

            const data = await response.json();

            if (data.success) {
                setShowEditModal(false);
                setSelectedAdmin(null);
                setFormData({
                    firstname: '',
                    lastname: '',
                    email: '',
                    phonenumber: '',
                    permissions: {
                        canManageSurveyors: true,
                        canManageAssignments: true,
                        canViewReports: true,
                        canManageAdmins: false
                    }
                });
                fetchNIAAdmins();
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to update administrator');
            }
        } catch (error) {
            console.error('Update admin error:', error);
            setError(error instanceof Error ? error.message : 'Failed to update administrator');
        }
    };

    const handleDeleteClick = (admin: NIAAdmin) => {
        setSelectedAdmin(admin);
        setShowDeleteModal(true);
    };

    const handleDeleteAdmin = async () => {
        if (!selectedAdmin) return;

        try {
            const token = getAuthToken('nia-admin');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const response = await fetch(
                `${process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1'}/nia-admin/${selectedAdmin._id}`,
                {
                    method: 'DELETE',
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                }
            );

            if (!response.ok) {
                throw new Error('Failed to delete NIA administrator');
            }

            const data = await response.json();

            if (data.success) {
                setShowDeleteModal(false);
                setSelectedAdmin(null);
                fetchNIAAdmins();
                setError(null);
            } else {
                throw new Error(data.message || 'Failed to delete administrator');
            }
        } catch (error) {
            console.error('Delete admin error:', error);
            setError(error instanceof Error ? error.message : 'Failed to delete administrator');
        }
    };

    const filteredAdmins = admins.filter(admin =>
        `${admin.userId.firstname} ${admin.userId.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
        admin.userId.email.toLowerCase().includes(searchQuery.toLowerCase())
    );

    const getStatusBadge = (status: string) => {
        switch (status) {
            case 'active':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">Active</span>;
            case 'inactive':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-red-100 text-red-800">Inactive</span>;
            case 'pending':
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Pending</span>;
            default:
                return <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{status}</span>;
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">NIA Administrators</h1>
                    <p className="text-gray-600 mt-1">Manage Nigerian Insurers Association administrative users and permissions</p>
                </div>
                <button
                    onClick={() => setShowAddModal(true)}
                    className="flex items-center space-x-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                >
                    <UserPlus className="w-4 h-4" />
                    <span>Add NIA Admin</span>
                </button>
            </div>

            {/* Search */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="relative">
                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                    <input
                        type="text"
                        placeholder="Search administrators..."
                        value={searchQuery}
                        onChange={(e) => setSearchQuery(e.target.value)}
                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                    />
                </div>
            </div>

            {/* Error Display */}
            {error && (
                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                    <p className="text-red-700">{error}</p>
                </div>
            )}

            {/* Administrators Grid */}
            {loading ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {[1, 2, 3].map((i) => (
                        <div key={i} className="bg-white p-6 rounded-lg shadow-sm border animate-pulse">
                            <div className="space-y-3">
                                <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                                <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                <div className="h-3 bg-gray-300 rounded w-2/3"></div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : filteredAdmins.length > 0 ? (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    {filteredAdmins.map((admin) => (
                        <div key={admin._id} className="bg-white border rounded-lg shadow-sm hover:shadow-md transition-shadow">
                            <div className="p-6">
                                <div className="flex items-start justify-between mb-4">
                                    <div className="flex items-center space-x-3">
                                        <div className="w-12 h-12 bg-blue-600 rounded-full flex items-center justify-center text-white font-bold">
                                            {admin.userId.firstname[0]}{admin.userId.lastname[0]}
                                        </div>
                                        <div>
                                            <h3 className="text-lg font-semibold text-gray-900">
                                                {admin.userId.firstname} {admin.userId.lastname}
                                            </h3>
                                            {getStatusBadge(admin.status)}
                                        </div>
                                    </div>
                                    <button className="text-gray-400 hover:text-gray-600">
                                        <MoreVertical className="w-4 h-4" />
                                    </button>
                                </div>

                                <div className="space-y-3 mb-4">
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                        {admin.userId.email}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                        {admin.userId.phonenumber}
                                    </div>
                                    <div className="flex items-center text-sm text-gray-600">
                                        <Calendar className="w-4 h-4 mr-2 text-gray-400" />
                                        Joined {new Date(admin.createdAt).toLocaleDateString()}
                                    </div>
                                </div>

                                <div className="mb-4">
                                    <h4 className="text-sm font-medium text-gray-700 mb-2">Permissions</h4>
                                    <div className="flex flex-wrap gap-1">
                                        {admin.permissions.canManageSurveyors && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-blue-100 text-blue-800">
                                                Manage Surveyors
                                            </span>
                                        )}
                                        {admin.permissions.canManageAssignments && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-green-100 text-green-800">
                                                Manage Assignments
                                            </span>
                                        )}
                                        {admin.permissions.canViewReports && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-purple-100 text-purple-800">
                                                View Reports
                                            </span>
                                        )}
                                        {admin.permissions.canManageAdmins && (
                                            <span className="inline-flex items-center px-2 py-1 rounded text-xs font-medium bg-red-100 text-red-800">
                                                Manage Admins
                                            </span>
                                        )}
                                    </div>
                                </div>

                                <div className="flex space-x-2">
                                    <button
                                        onClick={() => handleEditClick(admin)}
                                        className="flex-1 bg-gray-100 text-gray-700 px-3 py-2 rounded-md text-sm hover:bg-gray-200 flex items-center justify-center transition-colors"
                                    >
                                        <Edit className="w-4 h-4 mr-1" />
                                        Edit
                                    </button>
                                    <button
                                        onClick={() => handleDeleteClick(admin)}
                                        className="flex-1 bg-red-100 text-red-700 px-3 py-2 rounded-md text-sm hover:bg-red-200 flex items-center justify-center transition-colors"
                                    >
                                        <Trash2 className="w-4 h-4 mr-1" />
                                        Delete
                                    </button>
                                </div>
                            </div>
                        </div>
                    ))}
                </div>
            ) : (
                <div className="text-center py-12 bg-white border border-gray-200 rounded-lg">
                    <Shield className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">No administrators found</h3>
                    <p className="text-gray-600">
                        {searchQuery ? 'Try adjusting your search criteria.' : 'Get started by adding your first NIA administrator.'}
                    </p>
                </div>
            )}

            {/* Add Admin Modal */}
            {showAddModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
                    <div className="bg-white rounded-lg shadow-xl max-w-md w-full max-h-[90vh] overflow-hidden">
                        <div className="bg-blue-600 text-white p-6">
                            <div className="flex items-center justify-between">
                                <h2 className="text-xl font-bold">Add NIA Administrator</h2>
                                <button
                                    onClick={() => setShowAddModal(false)}
                                    className="text-blue-100 hover:text-white transition-colors"
                                >
                                    <X className="w-6 h-6" />
                                </button>
                            </div>
                        </div>

                        <form onSubmit={handleCreateAdmin} className="p-6 space-y-4">
                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstname}
                                        onChange={(e) => setFormData({ ...formData, firstname: e.target.value })}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Permissions
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageSurveyors}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, canManageSurveyors: e.target.checked }
                                            })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Manage Surveyors</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageAssignments}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, canManageAssignments: e.target.checked }
                                            })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Manage Assignments</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canViewReports}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, canViewReports: e.target.checked }
                                            })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">View Reports</span>
                                    </label>
                                    <label className="flex items-center">
                                        <input
                                            type="checkbox"
                                            checked={formData.permissions.canManageAdmins}
                                            onChange={(e) => setFormData({
                                                ...formData,
                                                permissions: { ...formData.permissions, canManageAdmins: e.target.checked }
                                            })}
                                            className="mr-2"
                                        />
                                        <span className="text-sm">Manage Admins</span>
                                    </label>
                                </div>
                            </div>

                            <div className="flex justify-end space-x-3 pt-4">
                                <button
                                    type="button"
                                    onClick={() => setShowAddModal(false)}
                                    className="px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    Create Administrator
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
};

export default NIAAdministratorsPage;
