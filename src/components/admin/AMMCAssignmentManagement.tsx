"use client";
import React, { useState, useEffect } from 'react';
import {
    UserPlus,
    Search,
    AlertTriangle,
    CheckCircle,
    User,
    Phone,
    Mail,
    X
} from 'lucide-react';
import { getAuthToken } from '@/utils/auth';

interface AMMCSurveyorForAssignment {
    _id: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    specialization: string[];
    experience: number;
    availability: 'available' | 'busy' | 'unavailable';
    currentAssignments: number;
    maxAssignments: number;
    rating: number;
    completedSurveys: number;
}

// Use types from api.types.ts
import { DualAssignment, AssignmentManagementProps } from '@/types/api.types';

interface AMMCAssignmentManagementProps extends AssignmentManagementProps {
    assignment: DualAssignment;
}

const AMMCAssignmentManagement: React.FC<AMMCAssignmentManagementProps> = ({
    assignment,
    onAssignmentComplete,
    onClose
}) => {
    const [surveyors, setSurveyors] = useState<AMMCSurveyorForAssignment[]>([]);
    const [filteredSurveyors, setFilteredSurveyors] = useState<AMMCSurveyorForAssignment[]>([]);
    const [selectedSurveyor, setSelectedSurveyor] = useState<AMMCSurveyorForAssignment | null>(null);
    const [loading, setLoading] = useState(true);
    const [assigning, setAssigning] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [searchQuery, setSearchQuery] = useState('');
    const [filters, setFilters] = useState<{
        availability: string;
        specialization: string;
        experience: string;
    }>({
        availability: 'all',
        specialization: 'all',
        experience: 'all'
    });

    useEffect(() => {
        fetchAvailableSurveyors();
    }, []);

    useEffect(() => {
        filterSurveyors();
    }, [surveyors, searchQuery, filters]);

    const fetchAvailableSurveyors = async () => {
        try {
            setLoading(true);
            // Get auth token using utility function
            const token = getAuthToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            const response = await fetch(`${baseUrl}/admin/surveyor?status=active&organization=AMMC`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch available surveyors');
            }

            const data = await response.json();

            if (data.success) {
                // Transform the data to match our interface
                const ammcSurveyors = (data.data || []).map((surveyor: Surveyor): AMMCSurveyorForAssignment => ({
                    _id: surveyor.userId._id,
                    firstname: surveyor.userId.firstname,
                    lastname: surveyor.userId.lastname,
                    email: surveyor.userId.email,
                    phoneNumber: surveyor.userId.phonenumber,
                    specialization: surveyor.profile?.specialization || ['residential'],
                    experience: surveyor.profile?.experience || 0,
                    availability: surveyor.profile?.availability || 'available',
                    currentAssignments: 0, // This would need to be calculated
                    maxAssignments: 3,
                    rating: surveyor.rating || 4.0,
                    completedSurveys: surveyor.statistics?.completedSurveys || 0
                }));

                setSurveyors(ammcSurveyors);
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

    const filterSurveyors = () => {
        let filtered = [...surveyors];

        // Search filter
        if (searchQuery) {
            filtered = filtered.filter(surveyor =>
                `${surveyor.firstname} ${surveyor.lastname}`.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surveyor.email.toLowerCase().includes(searchQuery.toLowerCase()) ||
                surveyor.specialization.some(spec => spec.toLowerCase().includes(searchQuery.toLowerCase()))
            );
        }

        // Availability filter
        if (filters.availability !== 'all') {
            filtered = filtered.filter(surveyor => surveyor.availability === filters.availability);
        }

        // Specialization filter
        if (filters.specialization !== 'all') {
            filtered = filtered.filter(surveyor =>
                surveyor.specialization.includes(filters.specialization)
            );
        }

        // Experience filter
        if (filters.experience !== 'all') {
            const expLevel = parseInt(filters.experience);
            filtered = filtered.filter(surveyor => surveyor.experience >= expLevel);
        }

        // Sort by availability and rating
        filtered.sort((a, b) => {
            if (a.availability === 'available' && b.availability !== 'available') return -1;
            if (b.availability === 'available' && a.availability !== 'available') return 1;
            return b.rating - a.rating;
        });

        setFilteredSurveyors(filtered);
    };

    const handleAssignSurveyor = async () => {
        if (!selectedSurveyor) return;

        try {
            setAssigning(true);
            // Get auth token using utility function
            const token = getAuthToken();

            if (!token) {
                throw new Error('No authentication token found');
            }

            const baseUrl = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            console.log('Assigning AMMC surveyor:', {
                assignmentId: assignment._id,
                surveyorId: selectedSurveyor._id,
                token: token ? 'Present' : 'Missing'
            });

            const response = await fetch(`${baseUrl}/dual-assignment/${assignment._id}/assign-ammc`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                },
                body: JSON.stringify({
                    surveyorId: selectedSurveyor._id,
                    priority: assignment.priority,
                    deadline: assignment.estimatedCompletion.overallDeadline
                })
            });

            console.log('Assignment response status:', response.status);

            const data = await response.json();
            console.log('Assignment response data:', data);

            if (!response.ok) {
                throw new Error(data.message || `HTTP ${response.status}: Failed to assign surveyor`);
            }

            if (data.success) {
                console.log('Assignment successful');
                onAssignmentComplete();
                onClose();
            } else {
                throw new Error(data.message || 'Failed to assign surveyor');
            }
        } catch (error) {
            console.error('Assignment error:', error);
            setError(error instanceof Error ? error.message : 'Failed to assign surveyor');
        } finally {
            setAssigning(false);
        }
    };

    const getAvailabilityBadge = (availability: string) => {
        switch (availability) {
            case 'available':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-green-100 text-green-800">Available</span>;
            case 'busy':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-yellow-100 text-yellow-800">Busy</span>;
            case 'unavailable':
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-red-100 text-red-800">Unavailable</span>;
            default:
                return <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800">{availability}</span>;
        }
    };

    const getWorkloadPercentage = (current: number, max: number) => {
        return Math.round((current / max) * 100);
    };

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-6xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-[#028835] text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Assign AMMC Surveyor</h2>
                            <p className="text-green-100 mt-1">
                                {assignment.policyId.propertyDetails.propertyType} - {assignment.policyId.propertyDetails.address}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-green-100 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                <div className="flex h-[calc(90vh-120px)]">
                    {/* Left Panel - Assignment Details */}
                    <div className="w-1/3 border-r border-gray-200 p-6 overflow-y-auto">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Assignment Details</h3>

                        <div className="space-y-4">
                            <div>
                                <label className="text-sm font-medium text-gray-600">Property Type</label>
                                <p className="text-gray-900">{assignment.policyId.propertyDetails.propertyType}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Address</label>
                                <p className="text-gray-900 text-sm">{assignment.policyId.propertyDetails.address}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Property Value</label>
                                <p className="text-gray-900">₦{assignment.policyId.propertyDetails.buildingValue.toLocaleString()}</p>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Client Contact</label>
                                <div className="text-sm text-gray-900">
                                    <p>{assignment.policyId.contactDetails.fullName}</p>
                                    <p>{assignment.policyId.contactDetails.email}</p>
                                    <p>{assignment.policyId.contactDetails.phoneNumber}</p>
                                </div>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Priority</label>
                                <span className={`inline-flex items-center px-2 py-1 rounded-full text-xs font-medium ${assignment.priority === 'urgent' ? 'bg-red-100 text-red-800' :
                                    assignment.priority === 'high' ? 'bg-orange-100 text-orange-800' :
                                        assignment.priority === 'medium' ? 'bg-yellow-100 text-yellow-800' :
                                            'bg-green-100 text-green-800'
                                    }`}>
                                    {assignment.priority}
                                </span>
                            </div>

                            <div>
                                <label className="text-sm font-medium text-gray-600">Deadline</label>
                                <p className="text-gray-900">{new Date(assignment.estimatedCompletion.overallDeadline).toLocaleDateString()}</p>
                            </div>

                            {assignment.niaSurveyorContact && (
                                <div>
                                    <label className="text-sm font-medium text-gray-600">NIA Surveyor</label>
                                    <div className="text-sm text-gray-900 space-y-1">
                                        <p className="font-medium">{assignment.niaSurveyorContact.name}</p>
                                        <p className="flex items-center">
                                            <Mail className="w-3 h-3 mr-1 text-gray-400" />
                                            {assignment.niaSurveyorContact.email}
                                        </p>
                                        <p className="flex items-center">
                                            <Phone className="w-3 h-3 mr-1 text-gray-400" />
                                            {assignment.niaSurveyorContact.phone}
                                        </p>
                                        {assignment.niaSurveyorContact.licenseNumber && (
                                            <p className="text-xs text-gray-600">
                                                License: {assignment.niaSurveyorContact.licenseNumber}
                                            </p>
                                        )}
                                        {assignment.niaSurveyorContact.experience && (
                                            <p className="text-xs text-gray-600">
                                                Experience: {assignment.niaSurveyorContact.experience} years
                                            </p>
                                        )}
                                        {assignment.niaSurveyorContact.specialization && assignment.niaSurveyorContact.specialization.length > 0 && (
                                            <div className="flex flex-wrap gap-1 mt-1">
                                                {assignment.niaSurveyorContact.specialization.map((spec: string, index: number) => (
                                                    <span
                                                        key={index}
                                                        className="inline-flex items-center px-1.5 py-0.5 rounded text-xs font-medium bg-blue-100 text-blue-800"
                                                    >
                                                        {spec}
                                                    </span>
                                                ))}
                                            </div>
                                        )}
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Right Panel - Surveyor Selection */}
                    <div className="flex-1 flex flex-col">
                        {/* Filters */}
                        <div className="p-6 border-b border-gray-200">
                            <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                                <div className="relative">
                                    <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                                    <input
                                        type="text"
                                        placeholder="Search surveyors..."
                                        value={searchQuery}
                                        onChange={(e) => setSearchQuery(e.target.value)}
                                        className="w-full pl-10 pr-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                    />
                                </div>

                                <select
                                    value={filters.availability}
                                    onChange={(e) => setFilters(prev => ({ ...prev, availability: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                >
                                    <option value="all">All Availability</option>
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>

                                <select
                                    value={filters.specialization}
                                    onChange={(e) => setFilters(prev => ({ ...prev, specialization: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                >
                                    <option value="all">All Specializations</option>
                                    <option value="residential">Residential</option>
                                    <option value="commercial">Commercial</option>
                                    <option value="industrial">Industrial</option>
                                    <option value="mixed-use">Mixed Use</option>
                                </select>

                                <select
                                    value={filters.experience}
                                    onChange={(e) => setFilters(prev => ({ ...prev, experience: e.target.value }))}
                                    className="px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835]"
                                >
                                    <option value="all">All Experience</option>
                                    <option value="1">1+ Years</option>
                                    <option value="3">3+ Years</option>
                                    <option value="5">5+ Years</option>
                                    <option value="10">10+ Years</option>
                                </select>
                            </div>
                        </div>

                        {/* Surveyor List */}
                        <div className="flex-1 overflow-y-auto p-6">
                            {error && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4 mb-4">
                                    <div className="flex items-center">
                                        <AlertTriangle className="w-5 h-5 text-red-500 mr-2" />
                                        <p className="text-red-700">{error}</p>
                                    </div>
                                </div>
                            )}

                            {loading ? (
                                <div className="space-y-4">
                                    {[1, 2, 3].map((i) => (
                                        <div key={i} className="border border-gray-200 rounded-lg p-4 animate-pulse">
                                            <div className="flex items-center space-x-4">
                                                <div className="w-12 h-12 bg-gray-300 rounded-full"></div>
                                                <div className="flex-1 space-y-2">
                                                    <div className="h-4 bg-gray-300 rounded w-1/3"></div>
                                                    <div className="h-3 bg-gray-300 rounded w-1/2"></div>
                                                </div>
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : filteredSurveyors.length > 0 ? (
                                <div className="space-y-4">
                                    {filteredSurveyors.map((surveyor) => (
                                        <div
                                            key={surveyor._id}
                                            className={`border rounded-lg p-4 cursor-pointer transition-all ${selectedSurveyor?._id === surveyor._id
                                                ? 'border-[#028835] bg-green-50'
                                                : 'border-gray-200 hover:border-gray-300'
                                                }`}
                                            onClick={() => setSelectedSurveyor(surveyor)}
                                        >
                                            <div className="flex items-start justify-between">
                                                <div className="flex items-center space-x-4">
                                                    <div className="w-12 h-12 bg-[#028835] rounded-full flex items-center justify-center text-white font-bold">
                                                        {surveyor.firstname[0]}{surveyor.lastname[0]}
                                                    </div>
                                                    <div className="flex-1">
                                                        <h4 className="text-lg font-semibold text-gray-900">
                                                            {surveyor.firstname} {surveyor.lastname}
                                                        </h4>
                                                        <div className="flex items-center space-x-4 text-sm text-gray-600 mt-1">
                                                            <span className="flex items-center">
                                                                <Mail className="w-4 h-4 mr-1" />
                                                                {surveyor.email}
                                                            </span>
                                                            <span className="flex items-center">
                                                                <Phone className="w-4 h-4 mr-1" />
                                                                {surveyor.phoneNumber}
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-2">
                                                            {getAvailabilityBadge(surveyor.availability)}
                                                            <span className="text-xs text-gray-500">
                                                                {surveyor.experience} years experience
                                                            </span>
                                                            <span className="text-xs text-gray-500">
                                                                Rating: {surveyor.rating}/5
                                                            </span>
                                                        </div>
                                                        <div className="flex items-center space-x-2 mt-1">
                                                            <span className="text-xs text-gray-500">
                                                                Workload: {surveyor.currentAssignments}/{surveyor.maxAssignments}
                                                                ({getWorkloadPercentage(surveyor.currentAssignments, surveyor.maxAssignments)}%)
                                                            </span>
                                                        </div>
                                                        <div className="flex flex-wrap gap-1 mt-2">
                                                            {surveyor.specialization.map((spec, index) => (
                                                                <span
                                                                    key={index}
                                                                    className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-gray-100 text-gray-800"
                                                                >
                                                                    {spec}
                                                                </span>
                                                            ))}
                                                        </div>
                                                    </div>
                                                </div>
                                                {selectedSurveyor?._id === surveyor._id && (
                                                    <CheckCircle className="w-6 h-6 text-[#028835]" />
                                                )}
                                            </div>
                                        </div>
                                    ))}
                                </div>
                            ) : (
                                <div className="text-center py-8">
                                    <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                                    <h3 className="text-lg font-medium text-gray-900 mb-2">No surveyors found</h3>
                                    <p className="text-gray-600">
                                        Try adjusting your filters to see more surveyors.
                                    </p>
                                </div>
                            )}
                        </div>

                        {/* Footer */}
                        <div className="border-t border-gray-200 p-6">
                            <div className="flex items-center justify-between">
                                <div className="text-sm text-gray-600">
                                    {selectedSurveyor ? (
                                        <span>Selected: {selectedSurveyor.firstname} {selectedSurveyor.lastname}</span>
                                    ) : (
                                        <span>Select a surveyor to assign</span>
                                    )}
                                </div>
                                <div className="flex items-center space-x-3">
                                    <button
                                        onClick={onClose}
                                        className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                                    >
                                        Cancel
                                    </button>
                                    <button
                                        onClick={handleAssignSurveyor}
                                        disabled={!selectedSurveyor || assigning}
                                        className="px-4 py-2 bg-[#028835] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                                    >
                                        {assigning ? (
                                            <>
                                                <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                                <span>Assigning...</span>
                                            </>
                                        ) : (
                                            <>
                                                <UserPlus className="w-4 h-4" />
                                                <span>Assign Surveyor</span>
                                            </>
                                        )}
                                    </button>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AMMCAssignmentManagement;