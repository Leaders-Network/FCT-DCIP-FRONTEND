'use client';

import React, { useState, useEffect } from 'react';
import {
    MessageSquare,
    AlertTriangle,
    Send,
    X,
    Phone,
    Mail,
    User,
    FileText,
    Clock
} from 'lucide-react';
import { getCookie } from '@/utils/cookies';
import { toast } from "sonner";

interface ConflictRaiseInterfaceProps {
    policyId?: string;
    reportId?: string;
    mergedReportId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (data: ConflictInquirySubmitData) => void;
    conflictContext?: {
        type: string;
        severity: string;
        description: string;
    };
}

export interface ConflictInquirySubmitData {
    policyId?: string;
    mergedReportId?: string;
    conflictType: string;
    description: string;
    priority: 'low' | 'medium' | 'high';
    contactPreference: 'email' | 'phone';
    additionalInfo?: string;
}

interface ConflictInquiry {
    policyId: string;
    reportId: string;
    conflictType: string;
    description: string;
    urgency: 'low' | 'medium' | 'high';
    contactPreference: 'email' | 'phone' | 'both';
    userContact: {
        email: string;
        phone?: string;
        name: string;
    };
}

interface PolicyOption {
    _id: string;
    policyNumber?: string;
    builder?: {
        address: string;
        nameOfBuilder?: string;
    };
    project?: {
        address?: string;
        coverTypeIdxDetails?: string;
    };
    propertyDetails?: {
        address?: string;
        propertyType?: string;
    };
    status?: string;
}

const ConflictRaiseInterface: React.FC<ConflictRaiseInterfaceProps> = ({
    policyId,
    reportId,
    mergedReportId,
    isOpen,
    onClose,
    onSubmit,
    conflictContext
}) => {
    // Use mergedReportId if reportId is not provided
    const effectiveReportId = reportId || mergedReportId;
    const [formData, setFormData] = useState<ConflictInquiry>({
        policyId: '',
        reportId: '',
        conflictType: conflictContext?.type || '',
        description: '',
        urgency: 'medium',
        contactPreference: 'email',
        userContact: {
            email: '',
            phone: '',
            name: ''
        }
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [inquiryId, setInquiryId] = useState<string>('');
    const [policies, setPolicies] = useState<PolicyOption[]>([]);
    const [loadingPolicies, setLoadingPolicies] = useState(false);

    const getPolicyAddress = (policy: PolicyOption) =>
        policy.project?.address ||
        policy.builder?.address ||
        policy.propertyDetails?.address ||
        'No address';

    const getPolicyType = (policy: PolicyOption) =>
        policy.project?.coverTypeIdxDetails ||
        policy.propertyDetails?.propertyType ||
        'Builder Liability Policy';

    const getPolicyLabel = (policy: PolicyOption) => {
        const policyNumberLabel = policy.policyNumber || `Policy ${policy._id.slice(-6)}`;
        const address = getPolicyAddress(policy);
        return `${policyNumberLabel} - ${address.substring(0, 50)}${address.length > 50 ? '...' : ''}`;
    };

    const selectedPolicy = policies.find((policy) => policy._id === formData.policyId);

    // Load user info from cookies and fetch policies on mount
    useEffect(() => {
        if (isOpen) {
            // Try to get from cookies first
            let email = getCookie('userEmail') || getCookie('email') || '';
            let firstname = getCookie('firstname') || '';
            let lastname = getCookie('lastname') || '';
            let fullname = getCookie('fullname') || getCookie('userName') || '';

            // Fallback to localStorage if cookies are empty
            if (!email) {
                try {
                    const userDataStr = localStorage.getItem('userData');
                    if (userDataStr) {
                        const userData = JSON.parse(userDataStr);
                        email = userData.email || '';
                        firstname = userData.firstname || '';
                        lastname = userData.lastname || '';
                        fullname = userData.fullname || '';
                    }
                } catch (e) {
                    console.error('Error parsing user data from localStorage:', e);
                }
            }

            const name = fullname || `${firstname} ${lastname}`.trim() || '';

            console.log('Loading user data:', { email, name, firstname, lastname, fullname });

            setFormData(prev => ({
                ...prev,
                policyId: policyId || prev.policyId,
                reportId: effectiveReportId || prev.reportId,
                userContact: {
                    ...prev.userContact,
                    email,
                    name
                }
            }));

            fetchUserPolicies();
        }
    }, [isOpen]);

    const fetchUserPolicies = async () => {
        try {
            setLoadingPolicies(true);
            const { builderLiabilityPolicyAPI } = await import('@/services/api');

            // Fetch completed, approved, and surveyed policies
            const [completedRes, approvedRes, surveyedRes] = await Promise.all([
                builderLiabilityPolicyAPI.getUserPolicies({ status: 'completed', page: 1, limit: 100 }).catch(() => ({ data: { policies: [] } })),
                builderLiabilityPolicyAPI.getUserPolicies({ status: 'approved', page: 1, limit: 100 }).catch(() => ({ data: { policies: [] } })),
                builderLiabilityPolicyAPI.getUserPolicies({ status: 'surveyed', page: 1, limit: 100 }).catch(() => ({ data: { policies: [] } }))
            ]);

            const allPolicies = [
                ...(completedRes?.data?.policies || []),
                ...(approvedRes?.data?.policies || []),
                ...(surveyedRes?.data?.policies || [])
            ];

            // Remove duplicates by _id
            const uniquePolicies = allPolicies.filter((policy, index, self) =>
                index === self.findIndex((p) => p._id === policy._id)
            );

            setPolicies(uniquePolicies);
        } catch (error) {
            console.error('Error fetching policies:', error);
            setPolicies([]);
        } finally {
            setLoadingPolicies(false);
        }
    };

    const conflictTypes = [
        { value: 'disagreement_findings', label: 'Disagreement with Findings' },
        { value: 'recommendation_concern', label: 'Recommendation Concern' },
        { value: 'surveyor_conduct', label: 'Surveyor Conduct Issue' },
        { value: 'technical_error', label: 'Technical Error' },
        { value: 'missing_information', label: 'Missing Information' },
        { value: 'clarification_needed', label: 'Clarification Needed' },
        { value: 'other', label: 'Other Concern' }
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low - General inquiry', color: 'text-green-600' },
        { value: 'medium', label: 'Medium - Needs attention', color: 'text-yellow-600' },
        { value: 'high', label: 'High - Urgent resolution needed', color: 'text-red-600' }
    ];

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setSubmitting(true);

        try {
            // Use the API service for proper token handling
            const { default: api } = await import('@/services/api');

            // Build the payload with only non-empty fields
            const payload: Record<string, unknown> = {
                conflictType: formData.conflictType,
                description: formData.description,
                urgency: formData.urgency,
                contactPreference: formData.contactPreference,
                userContact: {
                    email: formData.userContact.email,
                    name: formData.userContact.name
                }
            };

            // Only add optional fields if they have values
            if (formData.policyId) {
                payload.policyId = formData.policyId;
            }
            if (formData.reportId) {
                payload.mergedReportId = formData.reportId;
            }
            if (formData.userContact.phone) {
                (payload.userContact as Record<string, string>).phone = formData.userContact.phone;
            }

            const response = await api.post('/user-conflict-inquiries', payload);

            if (response.data?.success) {
                setInquiryId(response.data.data.referenceId);
                setSubmitted(true);

                if (onSubmit) {
                    // Map form data to ConflictInquirySubmitData format
                    const submitData: ConflictInquirySubmitData = {
                        policyId: formData.policyId || undefined,
                        mergedReportId: formData.reportId || undefined,
                        conflictType: formData.conflictType,
                        description: formData.description,
                        priority: formData.urgency,
                        contactPreference: formData.contactPreference === 'both' ? 'email' : formData.contactPreference,
                        additionalInfo: formData.userContact.phone || undefined
                    };
                    onSubmit(submitData);
                }
            } else {
                throw new Error(response.data?.message || 'Failed to submit conflict inquiry');
            }
        } catch (error: unknown) {
            console.error('Failed to submit inquiry:', error);
            const axiosError = error as {
                response?: {
                    data?: {
                        message?: string;
                        error?: string;
                        errors?: Record<string, string[]>;
                    }
                };
                message?: string
            };

            // Extract detailed error message
            let errorMessage = 'Failed to submit inquiry. Please try again.';

            if (axiosError?.response?.data) {
                const errorData = axiosError.response.data;

                // Check for validation errors
                if (errorData.errors) {
                    const errorFields = Object.entries(errorData.errors)
                        .map(([field, messages]) => `${field}: ${messages.join(', ')}`)
                        .join('\n');
                    errorMessage = `Validation errors:\n${errorFields}`;
                } else if (errorData.message) {
                    errorMessage = errorData.message;
                } else if (errorData.error) {
                    errorMessage = errorData.error;
                }
            } else if (axiosError?.message) {
                errorMessage = axiosError.message;
            }

            toast.error(errorMessage);
        } finally {
            setSubmitting(false);
        }
    };

    const handleInputChange = (field: keyof ConflictInquiry, value: string) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));
    };

    const handleContactChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            userContact: {
                ...prev.userContact,
                [field]: value
            }
        }));
    };

    // Typed event handlers
    const handleSelectChange = (field: keyof ConflictInquiry) =>
        (e: React.ChangeEvent<HTMLSelectElement>) => handleInputChange(field, e.target.value);

    const handleTextAreaChange = (field: keyof ConflictInquiry) =>
        (e: React.ChangeEvent<HTMLTextAreaElement>) => handleInputChange(field, e.target.value);

    const handleTextInputChange = (field: keyof ConflictInquiry) =>
        (e: React.ChangeEvent<HTMLInputElement>) => handleInputChange(field, e.target.value);

    const handleContactInputChange = (field: string) =>
        (e: React.ChangeEvent<HTMLInputElement>) => handleContactChange(field, e.target.value);

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <MessageSquare className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {submitted ? 'Inquiry Submitted' : 'Raise Conflict Inquiry'}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {submitted
                                        ? 'Your inquiry has been submitted successfully'
                                        : 'Report a concern or dispute about your policy assessment'
                                    }
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-gray-400 hover:text-gray-600 transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto" style={{ maxHeight: 'calc(90vh - 200px)' }}>
                    {submitted ? (
                        /* Success State */
                        <div className="text-center py-8">
                            <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4">
                                <MessageSquare className="w-8 h-8 text-green-600" />
                            </div>

                            <h4 className="text-lg font-semibold text-gray-900 mb-2">
                                Inquiry Submitted Successfully
                            </h4>

                            <p className="text-gray-600 mb-4">
                                Your conflict inquiry has been submitted and assigned reference ID:
                            </p>

                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
                                <div className="flex items-center justify-center space-x-2">
                                    <FileText className="w-5 h-5 text-blue-600" />
                                    <span className="font-mono text-lg font-semibold text-blue-800">
                                        {inquiryId}
                                    </span>
                                </div>
                                <p className="text-sm text-blue-700 mt-2">
                                    Please save this reference ID for tracking your inquiry
                                </p>
                            </div>

                            <div className="space-y-3 text-sm text-gray-600">
                                <div className="flex items-center justify-center space-x-2">
                                    <Clock className="w-4 h-4" />
                                    <span>Expected response time: 24-48 hours</span>
                                </div>

                                <div className="flex items-center justify-center space-x-2">
                                    <Mail className="w-4 h-4" />
                                    <span>You'll receive updates at {formData.userContact.email}</span>
                                </div>

                                {formData.contactPreference !== 'email' && formData.userContact.phone && (
                                    <div className="flex items-center justify-center space-x-2">
                                        <Phone className="w-4 h-4" />
                                        <span>Phone contact: {formData.userContact.phone}</span>
                                    </div>
                                )}
                            </div>

                            <button
                                onClick={onClose}
                                className="mt-6 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700"
                            >
                                Close
                            </button>
                        </div>
                    ) : (
                        /* Form State */
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Policy Selection */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Related Policy *
                                </label>
                                <select
                                    value={formData.policyId}
                                    onChange={handleSelectChange('policyId')}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 text-sm focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                    disabled={loadingPolicies}
                                >
                                    <option value="">
                                        {loadingPolicies ? 'Loading policies...' : 'Select a policy'}
                                    </option>
                                    {policies.map((policy) => (
                                        <option key={policy._id} value={policy._id}>
                                            {getPolicyLabel(policy)}
                                        </option>
                                    ))}
                                </select>
                                {selectedPolicy && (
                                    <div className="mt-2 rounded-lg border border-blue-200 bg-blue-50 p-3">
                                        <p className="text-sm font-medium text-blue-900">
                                            {selectedPolicy.policyNumber || 'Selected Policy'}
                                        </p>
                                        <p className="mt-1 text-xs text-blue-800">
                                            {getPolicyType(selectedPolicy)}
                                        </p>
                                        <p className="mt-1 text-xs text-blue-700">
                                            {getPolicyAddress(selectedPolicy)}
                                        </p>
                                    </div>
                                )}
                                {policies.length === 0 && !loadingPolicies && (
                                    <p className="text-xs text-gray-500 mt-1">
                                        No completed policies found. You can only raise inquiries for completed policies.
                                    </p>
                                )}
                            </div>

                            {/* Conflict Context */}
                            {conflictContext && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Detected Conflict Context
                                    </h4>
                                    <div className="space-y-2 text-sm">
                                        <div>
                                            <span className="text-orange-700 font-medium">Type:</span>
                                            <span className="ml-2 text-orange-800">{conflictContext.type.replace('_', ' ')}</span>
                                        </div>
                                        <div>
                                            <span className="text-orange-700 font-medium">Severity:</span>
                                            <span className="ml-2 text-orange-800">{conflictContext.severity}</span>
                                        </div>
                                        <div>
                                            <span className="text-orange-700 font-medium">Description:</span>
                                            <p className="text-orange-800 mt-1">{conflictContext.description}</p>
                                        </div>
                                    </div>
                                </div>
                            )}

                            {/* Conflict Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type of Concern *
                                </label>
                                <select
                                    value={formData.conflictType}
                                    onChange={handleSelectChange('conflictType')}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    required
                                >
                                    <option value="">Select concern type</option>
                                    {conflictTypes.map((type) => (
                                        <option key={type.value} value={type.value}>
                                            {type.label}
                                        </option>
                                    ))}
                                </select>
                            </div>

                            {/* Description */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Detailed Description *
                                </label>
                                <textarea
                                    value={formData.description}
                                    onChange={handleTextAreaChange('description')}
                                    rows={5}
                                    className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                    placeholder="Please provide a detailed description of your concern, including specific issues and any supporting information..."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Be as specific as possible to help us address your concern effectively
                                </p>
                            </div>

                            {/* Urgency */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Urgency Level
                                </label>
                                <div className="space-y-2">
                                    {urgencyLevels.map((level) => (
                                        <label key={level.value} className="flex items-center">
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={level.value}
                                                checked={formData.urgency === level.value}
                                                onChange={handleTextInputChange('urgency')}
                                                className="mr-3"
                                            />
                                            <span className={`text-sm ${level.color}`}>
                                                {level.label}
                                            </span>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div>
                                <h4 className="font-medium text-gray-900 mb-3">Contact Information</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Full Name *
                                        </label>
                                        <input
                                            type="text"
                                            value={formData.userContact.name}
                                            onChange={handleContactInputChange('name')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.userContact.email}
                                            onChange={handleContactInputChange('email')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            required
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Phone Number
                                        </label>
                                        <input
                                            type="tel"
                                            value={formData.userContact.phone}
                                            onChange={handleContactInputChange('phone')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            placeholder="Optional"
                                        />
                                    </div>

                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Preferred Contact Method
                                        </label>
                                        <select
                                            value={formData.contactPreference}
                                            onChange={handleSelectChange('contactPreference')}
                                            className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="email">Email Only</option>
                                            <option value="phone">Phone Only</option>
                                            <option value="both">Email and Phone</option>
                                        </select>
                                    </div>
                                </div>
                            </div>

                            {/* Submit Button */}
                            <div className="flex items-center justify-end space-x-3 pt-4 border-t border-gray-200">
                                <button
                                    type="button"
                                    onClick={onClose}
                                    className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                >
                                    Cancel
                                </button>
                                <button
                                    type="submit"
                                    disabled={submitting}
                                    className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                >
                                    {submitting && (
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                    )}
                                    <Send className="w-4 h-4" />
                                    <span>{submitting ? 'Submitting...' : 'Submit Inquiry'}</span>
                                </button>
                            </div>
                        </form>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ConflictRaiseInterface;
