"use client";
import React, { useState, useEffect } from "react";
import {
    Users,
    Building2,
    Shield,
    Phone,
    Mail,
    Plus,
    Filter,
    Search,
    Eye,
    Edit,
    Trash2,
    CheckCircle,
    XCircle,
    AlertCircle
} from "lucide-react";
import { BrokerAdmin } from "@/types/api.types";

// Extended BrokerAdmin interface for management UI with populated userId
interface BrokerAdminWithUser extends Omit<BrokerAdmin, 'userId'> {
    userId: {
        _id: string;
        firstname: string;
        lastname: string;
        email: string;
        phonenumber: string;
        organization: string;
    };
}

interface BrokerAdminFormData {
    firstname: string;
    lastname: string;
    email: string;
    phonenumber: string;
    password: string;
    brokerFirmName: string;
    brokerFirmLicense: string;
    licenseNumber: string;
    department: string;
    position: string;
    permissions: {
        canViewClaims: boolean;
        canUpdateClaimStatus: boolean;
        canViewReports: boolean;
        canAccessAnalytics: boolean;
    };
}

interface BrokerAdminStats {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    totalFirms: number;
}

interface BrokerAdminManagementProps {
    onCreateBrokerAdmin?: (data: BrokerAdminFormData) => Promise<void>;
    onUpdateBrokerAdmin?: (id: string, data: Partial<BrokerAdminFormData>) => Promise<void>;
    onDeleteBrokerAdmin?: (id: string) => Promise<void>;
}

const BrokerAdminManagement: React.FC<BrokerAdminManagementProps> = ({
    onCreateBrokerAdmin,
    onUpdateBrokerAdmin,
    onDeleteBrokerAdmin,
}) => {
    const [brokerAdmins, setBrokerAdmins] = useState<BrokerAdminWithUser[]>([]);
    const [loading, setLoading] = useState(true);
    const [searchTerm, setSearchTerm] = useState("");
    const [statusFilter, setStatusFilter] = useState<string>("all");
    const [showCreateModal, setShowCreateModal] = useState(false);
    const [showEditModal, setShowEditModal] = useState(false);
    const [showDetailsModal, setShowDetailsModal] = useState(false);
    const [selectedBrokerAdmin, setSelectedBrokerAdmin] = useState<BrokerAdminWithUser | null>(null);
    const [stats, setStats] = useState<BrokerAdminStats>({
        total: 0,
        active: 0,
        inactive: 0,
        suspended: 0,
        totalFirms: 0
    });
    const [formData, setFormData] = useState<BrokerAdminFormData>({
        firstname: "",
        lastname: "",
        email: "",
        phonenumber: "",
        password: "",
        brokerFirmName: "",
        brokerFirmLicense: "",
        licenseNumber: "",
        department: "Claims Management",
        position: "Broker Administrator",
        permissions: {
            canViewClaims: true,
            canUpdateClaimStatus: true,
            canViewReports: true,
            canAccessAnalytics: false
        }
    });

    useEffect(() => {
        fetchBrokerAdmins();
        fetchStats();
    }, [statusFilter, searchTerm]);

    const fetchBrokerAdmins = async () => {
        setLoading(true);
        try {
            const { adminApi } = await import("@/services/api");

            const response = await adminApi.get('/broker-admin/management', {
                params: {
                    status: statusFilter !== "all" ? statusFilter : undefined,
                    search: searchTerm || undefined,
                    page: 1,
                    limit: 100
                }
            });

            if ((response as any)?.success && (response as any)?.data) {
                setBrokerAdmins((response as any).data);
            } else {
                setBrokerAdmins([]);
            }
        } catch (error) {
            console.error("Failed to fetch broker admins:", error);
            setBrokerAdmins([]);
        } finally {
            setLoading(false);
        }
    };

    const fetchStats = async () => {
        try {
            const { adminApi } = await import("@/services/api");

            const response = await adminApi.get('/broker-admin/management/stats');

            if ((response as any)?.success && (response as any)?.data) {
                setStats((response as any).data);
            }
        } catch (error) {
            console.error("Failed to fetch stats:", error);
        }
    };

    const handleCreateBrokerAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        try {
            const { adminApi } = await import("@/services/api");

            const response = await adminApi.post('/broker-admin/management', formData);

            if ((response as any)?.success) {
                alert('Broker admin created successfully!');
                setShowCreateModal(false);
                resetForm();
                fetchBrokerAdmins();
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to create broker admin:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to create broker admin';
            alert(errorMessage);
        }
    };

    const handleUpdateBrokerAdmin = async (e: React.FormEvent<HTMLFormElement>) => {
        e.preventDefault();

        if (!selectedBrokerAdmin) return;

        try {
            const { adminApi } = await import("@/services/api");

            const response = await adminApi.patch(
                `/broker-admin/management/${selectedBrokerAdmin._id}`,
                formData
            );

            if ((response as any)?.success) {
                alert('Broker admin updated successfully!');
                setShowEditModal(false);
                setSelectedBrokerAdmin(null);
                resetForm();
                fetchBrokerAdmins();
            }
        } catch (error) {
            console.error("Failed to update broker admin:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to update broker admin';
            alert(errorMessage);
        }
    };

    const handleDeleteBrokerAdmin = async (id: string) => {
        if (!confirm('Are you sure you want to deactivate this broker admin?')) {
            return;
        }

        try {
            const { adminApi } = await import("@/services/api");

            const response = await adminApi.delete(`/broker-admin/management/${id}`);

            if ((response as any)?.success) {
                alert('Broker admin deactivated successfully!');
                fetchBrokerAdmins();
                fetchStats();
            }
        } catch (error) {
            console.error("Failed to delete broker admin:", error);
            const errorMessage = error instanceof Error ? error.message : 'Failed to deactivate broker admin';
            alert(errorMessage);
        }
    };

    const openEditModal = (brokerAdmin: BrokerAdminWithUser) => {
        setSelectedBrokerAdmin(brokerAdmin);
        setFormData({
            firstname: brokerAdmin.userId.firstname,
            lastname: brokerAdmin.userId.lastname,
            email: brokerAdmin.userId.email,
            phonenumber: brokerAdmin.userId.phonenumber,
            password: "",
            brokerFirmName: brokerAdmin.brokerFirmName,
            brokerFirmLicense: brokerAdmin.brokerFirmLicense,
            licenseNumber: brokerAdmin.profile.licenseNumber,
            department: brokerAdmin.profile.department,
            position: brokerAdmin.profile.position,
            permissions: brokerAdmin.permissions
        });
        setShowEditModal(true);
    };

    const openDetailsModal = (brokerAdmin: BrokerAdminWithUser) => {
        setSelectedBrokerAdmin(brokerAdmin);
        setShowDetailsModal(true);
    };

    const resetForm = () => {
        setFormData({
            firstname: "",
            lastname: "",
            email: "",
            phonenumber: "",
            password: "",
            brokerFirmName: "",
            brokerFirmLicense: "",
            licenseNumber: "",
            department: "Claims Management",
            position: "Broker Administrator",
            permissions: {
                canViewClaims: true,
                canUpdateClaimStatus: true,
                canViewReports: true,
                canAccessAnalytics: false
            }
        });
    };

    const handleInputChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
        const { name, value, type } = e.target;

        if (type === 'checkbox') {
            const checked = (e.target as HTMLInputElement).checked;
            if (name.startsWith('permissions.')) {
                const permissionKey = name.split('.')[1] as keyof BrokerAdminFormData['permissions'];
                setFormData(prev => ({
                    ...prev,
                    permissions: {
                        ...prev.permissions,
                        [permissionKey]: checked
                    }
                }));
            }
        } else {
            setFormData(prev => ({ ...prev, [name]: value }));
        }
    };

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            active: { color: 'bg-green-100 text-green-800', icon: CheckCircle },
            inactive: { color: 'bg-gray-100 text-gray-800', icon: XCircle },
            suspended: { color: 'bg-red-100 text-red-800', icon: AlertCircle }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
        const Icon = config.icon;

        return (
            <span className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${config.color}`}>
                <Icon className="w-3 h-3 mr-1" />
                {status.charAt(0).toUpperCase() + status.slice(1)}
            </span>
        );
    };

    return (
        <div className="p-6 bg-gray-50 min-h-screen">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-3xl font-bold text-gray-900 mb-2">Broker Admin Management</h1>
                <p className="text-gray-600">Manage broker administrator accounts and permissions</p>
            </div>

            {/* Statistics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-5 gap-4 mb-6">
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Total Admins</p>
                            <p className="text-2xl font-bold text-gray-900">{stats.total}</p>
                        </div>
                        <Users className="w-8 h-8 text-blue-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Active</p>
                            <p className="text-2xl font-bold text-green-600">{stats.active}</p>
                        </div>
                        <CheckCircle className="w-8 h-8 text-green-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Inactive</p>
                            <p className="text-2xl font-bold text-gray-600">{stats.inactive}</p>
                        </div>
                        <XCircle className="w-8 h-8 text-gray-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Suspended</p>
                            <p className="text-2xl font-bold text-red-600">{stats.suspended}</p>
                        </div>
                        <AlertCircle className="w-8 h-8 text-red-500" />
                    </div>
                </div>
                <div className="bg-white p-4 rounded-lg shadow">
                    <div className="flex items-center justify-between">
                        <div>
                            <p className="text-sm text-gray-600">Broker Firms</p>
                            <p className="text-2xl font-bold text-purple-600">{stats.totalFirms}</p>
                        </div>
                        <Building2 className="w-8 h-8 text-purple-500" />
                    </div>
                </div>
            </div>

            {/* Filters and Actions */}
            <div className="bg-white p-4 rounded-lg shadow mb-6">
                <div className="flex flex-col md:flex-row gap-4 items-center justify-between">
                    <div className="flex flex-col md:flex-row gap-4 flex-1">
                        <div className="relative flex-1">
                            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <input
                                type="text"
                                placeholder="Search by name, email, firm..."
                                value={searchTerm}
                                onChange={(e) => setSearchTerm(e.target.value)}
                                className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                            />
                        </div>
                        <div className="relative">
                            <Filter className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
                            <select
                                value={statusFilter}
                                onChange={(e) => setStatusFilter(e.target.value)}
                                className="pl-10 pr-8 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent appearance-none bg-white"
                            >
                                <option value="all">All Status</option>
                                <option value="active">Active</option>
                                <option value="inactive">Inactive</option>
                                <option value="suspended">Suspended</option>
                            </select>
                        </div>
                    </div>
                    <button
                        onClick={() => setShowCreateModal(true)}
                        className="flex items-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                    >
                        <Plus className="w-5 h-5" />
                        Add Broker Admin
                    </button>
                </div>
            </div>

            {/* Broker Admins Table */}
            <div className="bg-white rounded-lg shadow overflow-hidden">
                {loading ? (
                    <div className="p-8 text-center">
                        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto"></div>
                        <p className="mt-4 text-gray-600">Loading broker admins...</p>
                    </div>
                ) : brokerAdmins.length === 0 ? (
                    <div className="p-8 text-center">
                        <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                        <p className="text-gray-600">No broker admins found</p>
                    </div>
                ) : (
                    <div className="overflow-x-auto">
                        <table className="w-full">
                            <thead className="bg-gray-50 border-b border-gray-200">
                                <tr>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Admin
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Broker Firm
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Position
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Contact
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Status
                                    </th>
                                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                                        Actions
                                    </th>
                                </tr>
                            </thead>
                            <tbody className="bg-white divide-y divide-gray-200">
                                {brokerAdmins.map((admin) => (
                                    <tr key={admin._id} className="hover:bg-gray-50">
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            <div className="flex items-center">
                                                <div className="flex-shrink-0 h-10 w-10 bg-blue-100 rounded-full flex items-center justify-center">
                                                    <span className="text-blue-600 font-semibold">
                                                        {admin.userId.firstname[0]}{admin.userId.lastname[0]}
                                                    </span>
                                                </div>
                                                <div className="ml-4">
                                                    <div className="text-sm font-medium text-gray-900">
                                                        {admin.userId.firstname} {admin.userId.lastname}
                                                    </div>
                                                    <div className="text-sm text-gray-500">{admin.userId.email}</div>
                                                </div>
                                            </div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{admin.brokerFirmName}</div>
                                            <div className="text-sm text-gray-500">{admin.brokerFirmLicense}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="text-sm text-gray-900">{admin.profile.position}</div>
                                            <div className="text-sm text-gray-500">{admin.profile.department}</div>
                                        </td>
                                        <td className="px-6 py-4">
                                            <div className="flex items-center text-sm text-gray-900 mb-1">
                                                <Mail className="w-4 h-4 mr-2 text-gray-400" />
                                                {admin.userId.email}
                                            </div>
                                            <div className="flex items-center text-sm text-gray-500">
                                                <Phone className="w-4 h-4 mr-2 text-gray-400" />
                                                {admin.userId.phonenumber}
                                            </div>
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap">
                                            {getStatusBadge(admin.status)}
                                        </td>
                                        <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                                            <div className="flex items-center gap-2">
                                                <button
                                                    onClick={() => openDetailsModal(admin)}
                                                    className="text-blue-600 hover:text-blue-900"
                                                    title="View Details"
                                                >
                                                    <Eye className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => openEditModal(admin)}
                                                    className="text-green-600 hover:text-green-900"
                                                    title="Edit"
                                                >
                                                    <Edit className="w-5 h-5" />
                                                </button>
                                                <button
                                                    onClick={() => handleDeleteBrokerAdmin(admin._id)}
                                                    className="text-red-600 hover:text-red-900"
                                                    title="Deactivate"
                                                >
                                                    <Trash2 className="w-5 h-5" />
                                                </button>
                                            </div>
                                        </td>
                                    </tr>
                                ))}
                            </tbody>
                        </table>
                    </div>
                )}
            </div>

            {/* Create Modal */}
            {showCreateModal && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Add New Broker Admin</h2>
                            <form onSubmit={handleCreateBrokerAdmin} className="space-y-4">
                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            First Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Last Name *
                                        </label>
                                        <input
                                            type="text"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Email *
                                    </label>
                                    <input
                                        type="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number *
                                        </label>
                                        <input
                                            type="tel"
                                            name="phonenumber"
                                            value={formData.phonenumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Password *
                                        </label>
                                        <input
                                            type="password"
                                            name="password"
                                            value={formData.password}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Broker Firm Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="brokerFirmName"
                                        value={formData.brokerFirmName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Broker Firm License *
                                        </label>
                                        <input
                                            type="text"
                                            name="brokerFirmLicense"
                                            value={formData.brokerFirmLicense}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            License Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canViewClaims"
                                                checked={formData.permissions.canViewClaims}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can View Claims</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canUpdateClaimStatus"
                                                checked={formData.permissions.canUpdateClaimStatus}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can Update Claim Status</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canViewReports"
                                                checked={formData.permissions.canViewReports}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can View Reports</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canAccessAnalytics"
                                                checked={formData.permissions.canAccessAnalytics}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can Access Analytics</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Create Broker Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowCreateModal(false);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Edit Modal */}
            {showEditModal && selectedBrokerAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <h2 className="text-2xl font-bold mb-4">Edit Broker Admin</h2>
                            <form onSubmit={handleUpdateBrokerAdmin} className="space-y-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Broker Firm Name *
                                    </label>
                                    <input
                                        type="text"
                                        name="brokerFirmName"
                                        value={formData.brokerFirmName}
                                        onChange={handleInputChange}
                                        required
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                    />
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Broker Firm License *
                                        </label>
                                        <input
                                            type="text"
                                            name="brokerFirmLicense"
                                            value={formData.brokerFirmLicense}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            License Number *
                                        </label>
                                        <input
                                            type="text"
                                            name="licenseNumber"
                                            value={formData.licenseNumber}
                                            onChange={handleInputChange}
                                            required
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div className="grid grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Department
                                        </label>
                                        <input
                                            type="text"
                                            name="department"
                                            value={formData.department}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Position
                                        </label>
                                        <input
                                            type="text"
                                            name="position"
                                            value={formData.position}
                                            onChange={handleInputChange}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
                                        />
                                    </div>
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-2">
                                        Permissions
                                    </label>
                                    <div className="space-y-2">
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canViewClaims"
                                                checked={formData.permissions.canViewClaims}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can View Claims</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canUpdateClaimStatus"
                                                checked={formData.permissions.canUpdateClaimStatus}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can Update Claim Status</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canViewReports"
                                                checked={formData.permissions.canViewReports}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can View Reports</span>
                                        </label>
                                        <label className="flex items-center">
                                            <input
                                                type="checkbox"
                                                name="permissions.canAccessAnalytics"
                                                checked={formData.permissions.canAccessAnalytics}
                                                onChange={handleInputChange}
                                                className="rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                                            />
                                            <span className="ml-2 text-sm text-gray-700">Can Access Analytics</span>
                                        </label>
                                    </div>
                                </div>

                                <div className="flex gap-4 pt-4">
                                    <button
                                        type="submit"
                                        className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                    >
                                        Update Broker Admin
                                    </button>
                                    <button
                                        type="button"
                                        onClick={() => {
                                            setShowEditModal(false);
                                            setSelectedBrokerAdmin(null);
                                            resetForm();
                                        }}
                                        className="flex-1 px-4 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                </div>
                            </form>
                        </div>
                    </div>
                </div>
            )}

            {/* Details Modal */}
            {showDetailsModal && selectedBrokerAdmin && (
                <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                    <div className="bg-white rounded-lg max-w-2xl w-full max-h-[90vh] overflow-y-auto">
                        <div className="p-6">
                            <div className="flex items-center justify-between mb-6">
                                <h2 className="text-2xl font-bold">Broker Admin Details</h2>
                                {getStatusBadge(selectedBrokerAdmin.status)}
                            </div>

                            <div className="space-y-6">
                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Users className="w-5 h-5 mr-2" />
                                        Personal Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600">Name</p>
                                            <p className="font-medium">
                                                {selectedBrokerAdmin.userId.firstname} {selectedBrokerAdmin.userId.lastname}
                                            </p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Email</p>
                                            <p className="font-medium">{selectedBrokerAdmin.userId.email}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Phone</p>
                                            <p className="font-medium">{selectedBrokerAdmin.userId.phonenumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Organization</p>
                                            <p className="font-medium">{selectedBrokerAdmin.userId.organization}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Building2 className="w-5 h-5 mr-2" />
                                        Broker Firm Information
                                    </h3>
                                    <div className="grid grid-cols-2 gap-4 bg-gray-50 p-4 rounded-lg">
                                        <div>
                                            <p className="text-sm text-gray-600">Firm Name</p>
                                            <p className="font-medium">{selectedBrokerAdmin.brokerFirmName}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Firm License</p>
                                            <p className="font-medium">{selectedBrokerAdmin.brokerFirmLicense}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">License Number</p>
                                            <p className="font-medium">{selectedBrokerAdmin.profile.licenseNumber}</p>
                                        </div>
                                        <div>
                                            <p className="text-sm text-gray-600">Department</p>
                                            <p className="font-medium">{selectedBrokerAdmin.profile.department}</p>
                                        </div>
                                        <div className="col-span-2">
                                            <p className="text-sm text-gray-600">Position</p>
                                            <p className="font-medium">{selectedBrokerAdmin.profile.position}</p>
                                        </div>
                                    </div>
                                </div>

                                <div>
                                    <h3 className="text-lg font-semibold mb-3 flex items-center">
                                        <Shield className="w-5 h-5 mr-2" />
                                        Permissions
                                    </h3>
                                    <div className="bg-gray-50 p-4 rounded-lg space-y-2">
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">View Claims</span>
                                            {selectedBrokerAdmin.permissions.canViewClaims ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Update Claim Status</span>
                                            {selectedBrokerAdmin.permissions.canUpdateClaimStatus ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">View Reports</span>
                                            {selectedBrokerAdmin.permissions.canViewReports ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                        <div className="flex items-center justify-between">
                                            <span className="text-sm">Access Analytics</span>
                                            {selectedBrokerAdmin.permissions.canAccessAnalytics ? (
                                                <CheckCircle className="w-5 h-5 text-green-500" />
                                            ) : (
                                                <XCircle className="w-5 h-5 text-red-500" />
                                            )}
                                        </div>
                                    </div>
                                </div>

                                <div className="flex justify-end pt-4">
                                    <button
                                        onClick={() => {
                                            setShowDetailsModal(false);
                                            setSelectedBrokerAdmin(null);
                                        }}
                                        className="px-6 py-2 bg-gray-200 text-gray-800 rounded-lg hover:bg-gray-300 transition-colors"
                                    >
                                        Close
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            )}
        </div>
    );
};

export default BrokerAdminManagement;
