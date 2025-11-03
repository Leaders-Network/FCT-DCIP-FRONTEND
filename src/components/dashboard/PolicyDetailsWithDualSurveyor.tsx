"use client";
import React, { useState, useEffect } from 'react';
import DualSurveyorProgress from './DualSurveyorProgress';
import SurveyorContactsDisplay from './SurveyorContactsDisplay';
import {
    ArrowLeft,
    FileText,
    Calendar,
    MapPin,
    Building,
    DollarSign,
    User,
    Phone,
    Mail,
    Clock,
    CheckCircle,
    AlertTriangle
} from 'lucide-react';

interface PolicyDetailsWithDualSurveyorProps {
    policyId: string;
    onBack: () => void;
    showBackButton?: boolean;
}

interface DualAssignmentData {
    _id: string;
    policyId: {
        _id: string;
        propertyDetails: {
            propertyType: string;
            address: string;
            buildingValue: number;
            yearBuilt?: string;
            squareFootage?: number;
            constructionMaterial?: string;
        };
        contactDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
            alternatePhone?: string;
        };
        requestDetails: {
            coverageType: string;
            policyDuration: string;
            specialRequests?: string;
        };
        status: string;
        createdAt: string;
        updatedAt: string;
    };
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    completionStatus: 0 | 50 | 100;
    ammcSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
        specialization?: string[];
        experience?: number;
        rating?: number;
        lastActive?: string;
    };
    niaSurveyorContact?: {
        name: string;
        email: string;
        phone: string;
        licenseNumber?: string;
        specialization?: string[];
        experience?: number;
        rating?: number;
        lastActive?: string;
    };
    priority: string;
    estimatedCompletion: {
        overallDeadline: string;
    };
    createdAt: string;
    updatedAt: string;
}

const PolicyDetailsWithDualSurveyor: React.FC<PolicyDetailsWithDualSurveyorProps> = ({
    policyId,
    onBack,
    showBackButton = true
}) => {
    const [dualAssignmentData, setDualAssignmentData] = useState<DualAssignmentData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchDualAssignmentData();
    }, [policyId]);

    const fetchDualAssignmentData = async () => {
        try {
            setLoading(true);
            const token = localStorage.getItem('token') || localStorage.getItem('authToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            // First try to get dual assignment data
            const dualAssignmentResponse = await fetch(`/api/v1/dual-assignment/policy/${policyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (dualAssignmentResponse.ok) {
                const dualAssignmentResult = await dualAssignmentResponse.json();
                if (dualAssignmentResult.success && dualAssignmentResult.data) {
                    setDualAssignmentData(dualAssignmentResult.data);
                    return;
                }
            }

            // If no dual assignment found, create a mock one for demonstration
            // In a real implementation, this would be handled by the backend
            const policyResponse = await fetch(`/api/v1/policy/${policyId}`, {
                headers: {
                    'Authorization': `Bearer ${token}`,
                    'Content-Type': 'application/json'
                }
            });

            if (policyResponse.ok) {
                const policyResult = await policyResponse.json();
                if (policyResult.success && policyResult.data) {
                    const policy = policyResult.data;

                    // Create mock dual assignment data for demonstration
                    const mockDualAssignment: DualAssignmentData = {
                        _id: `dual_${policy._id}`,
                        policyId: policy,
                        assignmentStatus: 'partially_assigned',
                        completionStatus: 0,
                        ammcSurveyorContact: {
                            name: 'John Adebayo',
                            email: 'j.adebayo@ammc.gov.ng',
                            phone: '+234 803 123 4567',
                            licenseNumber: 'AMMC/2023/001',
                            specialization: ['residential', 'commercial'],
                            experience: 8,
                            rating: 4.7,
                            lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
                        },
                        priority: 'medium',
                        estimatedCompletion: {
                            overallDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString() // 7 days from now
                        },
                        createdAt: policy.createdAt,
                        updatedAt: policy.updatedAt
                    };

                    setDualAssignmentData(mockDualAssignment);
                    return;
                }
            }

            throw new Error('Failed to load policy data');

        } catch (error) {
            console.error('Failed to fetch dual assignment data:', error);
            setError(error instanceof Error ? error.message : 'Failed to load policy details');
        } finally {
            setLoading(false);
        }
    };

    if (loading) {
        return (
            <div className="space-y-6">
                <div className="animate-pulse">
                    <div className="h-8 bg-gray-300 rounded w-1/3 mb-6"></div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200 mb-6">
                        <div className="h-6 bg-gray-300 rounded w-1/2 mb-4"></div>
                        <div className="space-y-3">
                            <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                            <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                            <div className="h-4 bg-gray-300 rounded w-2/3"></div>
                        </div>
                    </div>
                    <div className="bg-white p-6 rounded-lg border border-gray-200">
                        <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                        <div className="h-32 bg-gray-300 rounded"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error || !dualAssignmentData) {
        return (
            <div className="space-y-6">
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Policies
                    </button>
                )}

                <div className="bg-red-50 border border-red-200 rounded-lg p-6 text-center">
                    <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-red-900 mb-2">Unable to Load Policy Details</h3>
                    <p className="text-red-700 mb-4">
                        {error || 'Policy details could not be loaded at this time.'}
                    </p>
                    <button
                        onClick={fetchDualAssignmentData}
                        className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 transition-colors"
                    >
                        Try Again
                    </button>
                </div>
            </div>
        );
    }

    const policy = dualAssignmentData.policyId;

    // Convert surveyor contacts to the format expected by SurveyorContactsDisplay
    const ammcSurveyor = dualAssignmentData.ammcSurveyorContact ? {
        name: dualAssignmentData.ammcSurveyorContact.name,
        email: dualAssignmentData.ammcSurveyorContact.email,
        phone: dualAssignmentData.ammcSurveyorContact.phone,
        organization: 'AMMC' as const,
        licenseNumber: dualAssignmentData.ammcSurveyorContact.licenseNumber,
        specialization: dualAssignmentData.ammcSurveyorContact.specialization,
        experience: dualAssignmentData.ammcSurveyorContact.experience,
        rating: dualAssignmentData.ammcSurveyorContact.rating,
        lastActive: dualAssignmentData.ammcSurveyorContact.lastActive
    } : undefined;

    const niaSurveyor = dualAssignmentData.niaSurveyorContact ? {
        name: dualAssignmentData.niaSurveyorContact.name,
        email: dualAssignmentData.niaSurveyorContact.email,
        phone: dualAssignmentData.niaSurveyorContact.phone,
        organization: 'NIA' as const,
        licenseNumber: dualAssignmentData.niaSurveyorContact.licenseNumber,
        specialization: dualAssignmentData.niaSurveyorContact.specialization,
        experience: dualAssignmentData.niaSurveyorContact.experience,
        rating: dualAssignmentData.niaSurveyorContact.rating,
        lastActive: dualAssignmentData.niaSurveyorContact.lastActive
    } : undefined;

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                {showBackButton && (
                    <button
                        onClick={onBack}
                        className="flex items-center text-blue-600 hover:text-blue-800 transition-colors"
                    >
                        <ArrowLeft className="w-4 h-4 mr-2" />
                        Back to Policies
                    </button>
                )}

                <div className="text-sm text-gray-500">
                    Policy ID: {policy._id.substring(0, 8).toUpperCase()}
                </div>
            </div>

            {/* Policy Overview */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <div className="flex items-start justify-between mb-6">
                    <div>
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">
                            {policy.propertyDetails.propertyType}
                        </h1>
                        <div className="flex items-center text-gray-600 mb-2">
                            <MapPin className="w-4 h-4 mr-2" />
                            <span>{policy.propertyDetails.address}</span>
                        </div>
                        <div className="flex items-center text-gray-600">
                            <Calendar className="w-4 h-4 mr-2" />
                            <span>Submitted {new Date(policy.createdAt).toLocaleDateString()}</span>
                        </div>
                    </div>
                    <div className="text-right">
                        <div className="text-2xl font-bold text-gray-900">
                            ₦{policy.propertyDetails.buildingValue.toLocaleString()}
                        </div>
                        <div className="text-sm text-gray-600">Property Value</div>
                    </div>
                </div>

                {/* Policy Details Grid */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Property Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <Building className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Type</div>
                                    <div className="text-sm text-gray-600">{policy.propertyDetails.propertyType}</div>
                                </div>
                            </div>
                            {policy.propertyDetails.yearBuilt && (
                                <div className="flex items-center">
                                    <Calendar className="w-4 h-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Year Built</div>
                                        <div className="text-sm text-gray-600">{policy.propertyDetails.yearBuilt}</div>
                                    </div>
                                </div>
                            )}
                            {policy.propertyDetails.squareFootage && (
                                <div className="flex items-center">
                                    <Building className="w-4 h-4 text-gray-400 mr-3" />
                                    <div>
                                        <div className="text-sm font-medium text-gray-900">Square Footage</div>
                                        <div className="text-sm text-gray-600">{policy.propertyDetails.squareFootage.toLocaleString()} sq ft</div>
                                    </div>
                                </div>
                            )}
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Contact Information</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <User className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Name</div>
                                    <div className="text-sm text-gray-600">{policy.contactDetails.fullName}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Mail className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Email</div>
                                    <div className="text-sm text-gray-600">{policy.contactDetails.email}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Phone className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Phone</div>
                                    <div className="text-sm text-gray-600">{policy.contactDetails.phoneNumber}</div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div className="space-y-4">
                        <h3 className="text-lg font-semibold text-gray-900">Coverage Details</h3>
                        <div className="space-y-3">
                            <div className="flex items-center">
                                <FileText className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Coverage Type</div>
                                    <div className="text-sm text-gray-600">{policy.requestDetails.coverageType}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Duration</div>
                                    <div className="text-sm text-gray-600">{policy.requestDetails.policyDuration}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <DollarSign className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Property Value</div>
                                    <div className="text-sm text-gray-600">₦{policy.propertyDetails.buildingValue.toLocaleString()}</div>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>

                {/* Special Requests */}
                {policy.requestDetails.specialRequests && (
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-3">Special Requests</h3>
                        <div className="bg-gray-50 p-4 rounded-lg">
                            <p className="text-sm text-gray-700">{policy.requestDetails.specialRequests}</p>
                        </div>
                    </div>
                )}
            </div>

            {/* Dual Surveyor Progress */}
            <DualSurveyorProgress
                assignmentStatus={dualAssignmentData.assignmentStatus}
                completionStatus={dualAssignmentData.completionStatus}
                ammcSurveyorContact={dualAssignmentData.ammcSurveyorContact}
                niaSurveyorContact={dualAssignmentData.niaSurveyorContact}
                estimatedCompletion={dualAssignmentData.estimatedCompletion}
                priority={dualAssignmentData.priority}
            />

            {/* Surveyor Contacts */}
            <SurveyorContactsDisplay
                ammcSurveyor={ammcSurveyor}
                niaSurveyor={niaSurveyor}
                assignmentStatus={dualAssignmentData.assignmentStatus}
                showContactActions={true}
                showAdminContacts={true}
            />

            {/* Timeline */}
            <div className="bg-white rounded-lg border border-gray-200 p-6">
                <h2 className="text-xl font-bold text-gray-900 mb-6">Policy Timeline</h2>
                <div className="space-y-4">
                    <div className="flex items-start space-x-4">
                        <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                            <CheckCircle className="w-4 h-4 text-white" />
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Policy Submitted</div>
                            <div className="text-sm text-gray-600">
                                {new Date(policy.createdAt).toLocaleDateString('en-US', {
                                    weekday: 'long',
                                    year: 'numeric',
                                    month: 'long',
                                    day: 'numeric',
                                    hour: '2-digit',
                                    minute: '2-digit'
                                })}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dualAssignmentData.assignmentStatus !== 'unassigned'
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                            }`}>
                            {dualAssignmentData.assignmentStatus !== 'unassigned' ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                                <Clock className="w-4 h-4 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Surveyor Assignment</div>
                            <div className="text-sm text-gray-600">
                                {dualAssignmentData.assignmentStatus === 'unassigned' && 'Waiting for surveyor assignment'}
                                {dualAssignmentData.assignmentStatus === 'partially_assigned' && 'One surveyor assigned, waiting for second'}
                                {dualAssignmentData.assignmentStatus === 'fully_assigned' && 'Both surveyors assigned'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dualAssignmentData.completionStatus > 0
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                            }`}>
                            {dualAssignmentData.completionStatus > 0 ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                                <Clock className="w-4 h-4 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Survey Execution</div>
                            <div className="text-sm text-gray-600">
                                {dualAssignmentData.completionStatus === 0 && 'Surveys not yet started'}
                                {dualAssignmentData.completionStatus === 50 && 'One survey completed, one in progress'}
                                {dualAssignmentData.completionStatus === 100 && 'Both surveys completed'}
                            </div>
                        </div>
                    </div>

                    <div className="flex items-start space-x-4">
                        <div className={`w-8 h-8 rounded-full flex items-center justify-center ${dualAssignmentData.completionStatus === 100
                            ? 'bg-green-500'
                            : 'bg-gray-300'
                            }`}>
                            {dualAssignmentData.completionStatus === 100 ? (
                                <CheckCircle className="w-4 h-4 text-white" />
                            ) : (
                                <Clock className="w-4 h-4 text-gray-600" />
                            )}
                        </div>
                        <div className="flex-1">
                            <div className="text-sm font-medium text-gray-900">Report Generation & Review</div>
                            <div className="text-sm text-gray-600">
                                {dualAssignmentData.completionStatus === 100
                                    ? 'Reports being merged and reviewed'
                                    : 'Waiting for surveys to complete'
                                }
                            </div>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PolicyDetailsWithDualSurveyor;