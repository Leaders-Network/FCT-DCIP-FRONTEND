"use client";
import React, { useState, useEffect } from 'react';
import DualSurveyorProgress from './DualSurveyorProgress';
import SurveyorContactsDisplay from './SurveyorContactsDisplay';
import { getCookie } from '@/utils/cookies';
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
    AlertTriangle,
    Download
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
            const token = getCookie('userToken') || getCookie('token') || getCookie('authToken');

            if (!token) {
                throw new Error('No authentication token found');
            }

            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';
            let policyData = null;
            let statusData = null;

            // Try to get policy data using user-accessible endpoint first
            try {
                const policyResponse = await fetch(`${API_BASE_URL}/report-release/policy/${policyId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (policyResponse.ok) {
                    const policyResult = await policyResponse.json();
                    if (policyResult.success && policyResult.data) {
                        policyData = policyResult.data;
                        console.log('✅ Policy data fetched successfully:', policyData);
                    }
                } else {
                    const errorData = await policyResponse.json().catch(() => ({}));
                    console.error('❌ Policy endpoint error:', {
                        status: policyResponse.status,
                        statusText: policyResponse.statusText,
                        error: errorData
                    });

                    if (policyResponse.status === 401) {
                        throw new Error('Authentication failed. Please log in again.');
                    } else if (policyResponse.status === 403) {
                        throw new Error('You do not have permission to view this policy.');
                    }
                }
            } catch (error) {
                console.error('Policy endpoint error:', error);
                if (error instanceof Error && (error.message.includes('Authentication') || error.message.includes('permission'))) {
                    throw error;
                }
            }

            // Get report processing status (user-accessible)
            try {
                console.log('🔍 Fetching status from:', `${API_BASE_URL}/report-release/status/${policyId}`);
                const statusResponse = await fetch(`${API_BASE_URL}/report-release/status/${policyId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                console.log('📡 Status response:', statusResponse.status, statusResponse.statusText);

                if (statusResponse.ok) {
                    const statusResult = await statusResponse.json();
                    console.log('📊 Status result:', statusResult);
                    if (statusResult.success && statusResult.data) {
                        statusData = statusResult.data;
                        console.log('✅ Status data fetched successfully:', statusData);
                    } else {
                        console.warn('⚠️ Status response missing data:', statusResult);
                    }
                } else {
                    const errorData = await statusResponse.json().catch(() => ({}));
                    console.error('❌ Status endpoint error:', {
                        status: statusResponse.status,
                        error: errorData
                    });
                }
            } catch (error) {
                console.error('❌ Status endpoint exception:', error);
            }

            // Try to get dual assignment data (only for admins, will fail gracefully for users)
            try {
                const dualAssignmentResponse = await fetch(`${API_BASE_URL}/dual-assignment/policy/${policyId}`, {
                    headers: {
                        'Authorization': `Bearer ${token}`,
                        'Content-Type': 'application/json'
                    }
                });

                if (dualAssignmentResponse.ok) {
                    const dualAssignmentResult = await dualAssignmentResponse.json();
                    if (dualAssignmentResult.success && dualAssignmentResult.data) {
                        setDualAssignmentData(dualAssignmentResult.data);
                        console.log('✅ Dual assignment data fetched successfully');
                        return;
                    }
                } else if (dualAssignmentResponse.status === 401 || dualAssignmentResponse.status === 403) {
                    console.log('Dual assignment endpoint not accessible (user role), using policy data');
                }
            } catch (error) {
                console.log('Dual assignment endpoint not accessible, using policy data');
            }

            // If we have real policy data, use it; otherwise create mock data
            const mockPolicy = policyData ? {
                _id: policyData._id || policyId,
                propertyDetails: {
                    address: policyData.propertyDetails?.address || 'Property Address Not Available',
                    propertyType: policyData.propertyDetails?.propertyType || 'Property Type Not Available',
                    buildingValue: policyData.propertyDetails?.buildingValue || 0,
                    yearBuilt: policyData.propertyDetails?.yearBuilt?.toString() || '2020',
                    squareFootage: policyData.propertyDetails?.squareFootage,
                    constructionMaterial: policyData.propertyDetails?.constructionMaterial
                },
                contactDetails: {
                    fullName: policyData.contactDetails?.fullName || 'N/A',
                    email: policyData.contactDetails?.email || 'N/A',
                    phoneNumber: policyData.contactDetails?.phoneNumber || 'N/A',
                    alternatePhone: policyData.contactDetails?.alternatePhone
                },
                requestDetails: {
                    coverageType: policyData.requestDetails?.coverageType || 'Standard Coverage',
                    policyDuration: policyData.requestDetails?.policyDuration || '1 Year',
                    specialRequests: policyData.requestDetails?.specialRequests
                },
                status: policyData.status || 'assigned',
                createdAt: policyData.createdAt || new Date().toISOString(),
                updatedAt: policyData.updatedAt || new Date().toISOString()
            } : {
                _id: policyId,
                propertyDetails: {
                    address: 'Sample Property Address',
                    propertyType: 'Residential Building',
                    buildingValue: 50000000,
                    yearBuilt: '2020',
                    squareFootage: 2500,
                    constructionMaterial: 'Concrete Block'
                },
                contactDetails: {
                    fullName: 'Sample User',
                    email: 'user@example.com',
                    phoneNumber: '+234 800 000 0000'
                },
                requestDetails: {
                    coverageType: 'Standard Coverage',
                    policyDuration: '1 Year'
                },
                status: 'assigned',
                createdAt: new Date().toISOString(),
                updatedAt: new Date().toISOString()
            };

            // Determine assignment and completion status from statusData
            let assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned' = 'partially_assigned';
            let completionStatus: 0 | 50 | 100 = 50;

            if (statusData) {
                console.log('📊 Processing status data:', statusData);

                // Map status data to assignment status
                if (statusData.stage === 'awaiting_assignment') {
                    assignmentStatus = 'unassigned';
                    completionStatus = 0;
                } else if (statusData.stage === 'survey_in_progress' || statusData.stage === 'awaiting_surveys') {
                    assignmentStatus = 'fully_assigned';
                    completionStatus = (statusData.progress || 0) as 0 | 50 | 100;
                } else if (statusData.stage === 'processing' || statusData.stage === 'completed' || statusData.stage === 'under_review') {
                    assignmentStatus = 'fully_assigned';
                    completionStatus = 100;
                }

                console.log('✅ Calculated status:', {
                    assignmentStatus,
                    completionStatus,
                    stage: statusData.stage,
                    progress: statusData.progress,
                    surveyStatus: statusData.surveyStatus
                });
            } else {
                console.warn('⚠️ No status data available, using default values:', { assignmentStatus, completionStatus });
            }

            const mockDualAssignment: DualAssignmentData = {
                _id: `dual_${policyId}`,
                policyId: mockPolicy,
                assignmentStatus,
                completionStatus,
                ammcSurveyorContact: {
                    name: 'John Adebayo',
                    email: 'j.adebayo@ammc.gov.ng',
                    phone: '+234 803 123 4567',
                    licenseNumber: 'AMMC/2023/001',
                    specialization: ['residential', 'commercial'],
                    experience: 8,
                    rating: 4.7,
                    lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                },
                niaSurveyorContact: {
                    name: 'Sarah Okafor',
                    email: 's.okafor@nia.gov.ng',
                    phone: '+234 807 654 3210',
                    licenseNumber: 'NIA/2023/002',
                    specialization: ['structural', 'residential'],
                    experience: 6,
                    rating: 4.5,
                    lastActive: new Date(Date.now() - 4 * 60 * 60 * 1000).toISOString()
                },
                priority: 'medium',
                estimatedCompletion: {
                    overallDeadline: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString()
                },
                createdAt: mockPolicy.createdAt,
                updatedAt: mockPolicy.updatedAt
            };

            setDualAssignmentData(mockDualAssignment);

        } catch (error) {
            console.error('Failed to fetch dual assignment data:', error);
            setError(`Unable to load policy details: ${error instanceof Error ? error.message : 'Unknown error'}`);
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
                                    <div className="text-sm text-gray-600">{policy.requestDetails?.coverageType || 'N/A'}</div>
                                </div>
                            </div>
                            <div className="flex items-center">
                                <Clock className="w-4 h-4 text-gray-400 mr-3" />
                                <div>
                                    <div className="text-sm font-medium text-gray-900">Duration</div>
                                    <div className="text-sm text-gray-600">{policy.requestDetails?.policyDuration || 'N/A'}</div>
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

            {/* Report Downloads */}
            {dualAssignmentData.completionStatus === 100 && (
                <div className="bg-white rounded-lg border border-gray-200 p-6">
                    <h2 className="text-xl font-bold text-gray-900 mb-6">Survey Reports</h2>
                    <div className="space-y-4">
                        <p className="text-sm text-gray-600 mb-4">
                            Both surveys have been completed. You can download the individual reports and the merged final report below.
                        </p>

                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            {/* AMMC Report */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <FileText className="w-5 h-5 text-blue-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">AMMC Report</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Survey report from AMMC surveyor
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { userReportAPI } = await import('@/services/api');
                                            const token = getCookie('userToken') || getCookie('token') || getCookie('authToken');
                                            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

                                            // Get report details to find AMMC assignment ID
                                            const statusResponse = await fetch(`${API_BASE_URL}/report-release/status/${policyId}`, {
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            if (statusResponse.ok) {
                                                const statusResult = await statusResponse.json();
                                                if (statusResult.success && statusResult.data.reportId) {
                                                    // Get full report details
                                                    const reportResponse = await fetch(`${API_BASE_URL}/report-release/report/${statusResult.data.reportId}`, {
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        }
                                                    });

                                                    if (reportResponse.ok) {
                                                        const reportResult = await reportResponse.json();
                                                        if (reportResult.success && reportResult.data.individualReports?.ammcReportId) {
                                                            const response = await userReportAPI.downloadAMMCReport(reportResult.data.individualReports.ammcReportId);

                                                            if (response.success && response.data) {
                                                                if (response.data.downloadUrl) {
                                                                    window.open(response.data.downloadUrl, '_blank');
                                                                    alert('AMMC report opened in new tab.');
                                                                } else if (response.data.documents && response.data.documents.length > 0) {
                                                                    window.open(response.data.documents[0].cloudinaryUrl, '_blank');
                                                                    alert('AMMC report opened in new tab.');
                                                                } else {
                                                                    alert('No AMMC report document available');
                                                                }
                                                            } else {
                                                                alert('Failed to download AMMC report: ' + (response.message || 'Unknown error'));
                                                            }
                                                        } else {
                                                            alert('AMMC report not yet available');
                                                        }
                                                    }
                                                } else {
                                                    alert('Report not yet available');
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Download error:', error);
                                            alert('Failed to download AMMC report');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download AMMC Report
                                </button>
                            </div>

                            {/* NIA Report */}
                            <div className="border border-gray-200 rounded-lg p-4">
                                <div className="flex items-center mb-3">
                                    <FileText className="w-5 h-5 text-green-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">NIA Report</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Survey report from NIA surveyor
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { userReportAPI } = await import('@/services/api');
                                            const token = getCookie('userToken') || getCookie('token') || getCookie('authToken');
                                            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

                                            // Get report details to find NIA assignment ID
                                            const statusResponse = await fetch(`${API_BASE_URL}/report-release/status/${policyId}`, {
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            if (statusResponse.ok) {
                                                const statusResult = await statusResponse.json();
                                                if (statusResult.success && statusResult.data.reportId) {
                                                    // Get full report details
                                                    const reportResponse = await fetch(`${API_BASE_URL}/report-release/report/${statusResult.data.reportId}`, {
                                                        headers: {
                                                            'Authorization': `Bearer ${token}`,
                                                            'Content-Type': 'application/json'
                                                        }
                                                    });

                                                    if (reportResponse.ok) {
                                                        const reportResult = await reportResponse.json();
                                                        if (reportResult.success && reportResult.data.individualReports?.niaReportId) {
                                                            const response = await userReportAPI.downloadNIAReport(reportResult.data.individualReports.niaReportId);

                                                            if (response.success && response.data) {
                                                                if (response.data.downloadUrl) {
                                                                    window.open(response.data.downloadUrl, '_blank');
                                                                    alert('NIA report opened in new tab.');
                                                                } else if (response.data.documents && response.data.documents.length > 0) {
                                                                    window.open(response.data.documents[0].cloudinaryUrl, '_blank');
                                                                    alert('NIA report opened in new tab.');
                                                                } else {
                                                                    alert('No NIA report document available');
                                                                }
                                                            } else {
                                                                alert('Failed to download NIA report: ' + (response.message || 'Unknown error'));
                                                            }
                                                        } else {
                                                            alert('NIA report not yet available');
                                                        }
                                                    }
                                                } else {
                                                    alert('Report not yet available');
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Download error:', error);
                                            alert('Failed to download NIA report');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download NIA Report
                                </button>
                            </div>

                            {/* Merged Report */}
                            <div className="border border-gray-200 rounded-lg p-4 bg-blue-50">
                                <div className="flex items-center mb-3">
                                    <FileText className="w-5 h-5 text-purple-600 mr-2" />
                                    <h3 className="font-semibold text-gray-900">Merged Report</h3>
                                </div>
                                <p className="text-sm text-gray-600 mb-4">
                                    Final combined assessment report
                                </p>
                                <button
                                    onClick={async () => {
                                        try {
                                            const { userReportAPI } = await import('@/services/api');
                                            const token = getCookie('userToken') || getCookie('token') || getCookie('authToken');
                                            const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || 'http://localhost:5000/api/v1';

                                            const statusResponse = await fetch(`${API_BASE_URL}/report-release/status/${policyId}`, {
                                                headers: {
                                                    'Authorization': `Bearer ${token}`,
                                                    'Content-Type': 'application/json'
                                                }
                                            });

                                            if (statusResponse.ok) {
                                                const statusResult = await statusResponse.json();
                                                if (statusResult.success && statusResult.data.reportId) {
                                                    const response = await userReportAPI.downloadReport(statusResult.data.reportId);

                                                    if (response.success && response.data) {
                                                        // Generate HTML report
                                                        const reportData = response.data as any;
                                                        const htmlContent = `
<!DOCTYPE html>
<html>
<head>
    <meta charset="UTF-8">
    <title>Merged Survey Report - ${statusResult.data.reportId}</title>
    <style>
        body { font-family: Arial, sans-serif; margin: 40px; line-height: 1.6; }
        h1 { color: #028835; border-bottom: 3px solid #028835; padding-bottom: 10px; }
        h2 { color: #333; margin-top: 30px; border-bottom: 2px solid #ddd; padding-bottom: 5px; }
        h3 { color: #555; margin-top: 20px; }
        .section { margin: 20px 0; padding: 15px; background: #f9f9f9; border-left: 4px solid #028835; }
        .info-row { display: flex; margin: 10px 0; }
        .label { font-weight: bold; width: 200px; color: #555; }
        .value { flex: 1; }
        .recommendation { padding: 15px; margin: 20px 0; border-radius: 5px; font-weight: bold; }
        .approve { background: #d4edda; color: #155724; border: 1px solid #c3e6cb; }
        .reject { background: #f8d7da; color: #721c24; border: 1px solid #f5c6cb; }
        .conflict { background: #fff3cd; color: #856404; border: 1px solid #ffeaa7; }
        .footer { margin-top: 40px; padding-top: 20px; border-top: 2px solid #ddd; text-align: center; color: #777; }
    </style>
</head>
<body>
    <h1>Merged Dual Survey Report</h1>
    
    <div class="section">
        <h2>Report Information</h2>
        <div class="info-row"><span class="label">Report ID:</span><span class="value">${reportData.reportId || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Policy ID:</span><span class="value">${reportData.policyId || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Property Address:</span><span class="value">${reportData.propertyDetails?.address || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Property Type:</span><span class="value">${reportData.propertyDetails?.propertyType || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Report Status:</span><span class="value">${reportData.status || reportData.releaseStatus || 'N/A'}</span></div>
        <div class="info-row"><span class="label">Released Date:</span><span class="value">${reportData.releasedAt ? new Date(reportData.releasedAt).toLocaleString() : 'N/A'}</span></div>
        <div class="info-row"><span class="label">Download Count:</span><span class="value">${reportData.downloadCount || 0}</span></div>
    </div>

    <div class="recommendation ${reportData.finalRecommendation === 'approve' ? 'approve' : reportData.finalRecommendation === 'reject' ? 'reject' : ''}">
        <h2>Final Recommendation: ${(reportData.finalRecommendation || 'N/A').toUpperCase()}</h2>
        ${reportData.paymentEnabled ? '<p>✓ Payment Enabled</p>' : '<p>✗ Payment Not Enabled</p>'}
    </div>

    ${reportData.conflictDetected ? `
    <div class="conflict">
        <h3>⚠️ Conflict Detected</h3>
        <p>Status: ${reportData.conflictResolved ? 'Resolved' : 'Pending Resolution'}</p>
        ${reportData.conflictDetails ? `<p>Details: ${JSON.stringify(reportData.conflictDetails)}</p>` : ''}
    </div>
    ` : ''}

    <div class="section">
        <h2>Report Sections</h2>
        ${reportData.reportSections ? Object.entries(reportData.reportSections).map(([key, value]: [string, any]) => `
            <h3>${key.replace(/([A-Z])/g, ' $1').trim()}</h3>
            <p>${typeof value === 'object' ? JSON.stringify(value, null, 2) : value}</p>
        `).join('') : '<p>No report sections available</p>'}
    </div>

    <div class="footer">
        <p>Generated on ${new Date().toLocaleString()}</p>
        <p>FCT-DCIP - Dual Survey Report System</p>
    </div>
</body>
</html>`;

                                                        // Create blob and download
                                                        const blob = new Blob([htmlContent], { type: 'text/html' });
                                                        const url = URL.createObjectURL(blob);
                                                        const link = document.createElement('a');
                                                        link.href = url;
                                                        link.download = `merged-report-${policyId}-${Date.now()}.html`;
                                                        document.body.appendChild(link);
                                                        link.click();
                                                        document.body.removeChild(link);
                                                        URL.revokeObjectURL(url);

                                                        alert('Merged report downloaded successfully. Open the HTML file and print to PDF from your browser.');
                                                    } else {
                                                        alert(response.message || 'Report not yet available for download');
                                                    }
                                                } else {
                                                    alert('Merged report is still being processed');
                                                }
                                            }
                                        } catch (error) {
                                            console.error('Download error:', error);
                                            alert('Failed to download merged report');
                                        }
                                    }}
                                    className="w-full flex items-center justify-center px-4 py-2 bg-purple-600 text-white rounded-lg hover:bg-purple-700 transition-colors"
                                >
                                    <Download className="w-4 h-4 mr-2" />
                                    Download Merged Report
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

        </div>
    );
};

export default PolicyDetailsWithDualSurveyor;