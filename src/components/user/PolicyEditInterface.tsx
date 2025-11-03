'use client';

import React, { useState, useEffect } from 'react';
import {
    Edit,
    Save,
    X,
    AlertTriangle,
    Info,
    CheckCircle,
    RefreshCw,
    FileText,
    User,
    Building,
    Shield
} from 'lucide-react';
import {
    PROPERTY_TYPES,
    CONSTRUCTION_MATERIALS,
    COVERAGE_TYPES,
    POLICY_DURATIONS
} from '@/constants/policyConstants';

interface PolicyEditInterfaceProps {
    policyId: string;
    isOpen: boolean;
    onClose: () => void;
    onUpdate?: () => void;
    rejectionReasons?: string[];
    requiredActions?: string[];
    conflictContext?: {
        type: string;
        severity: string;
        description: string;
    };
}

interface PolicyData {
    propertyDetails: {
        propertyType: string;
        address: string;
        buildingValue: number;
        yearBuilt: string;
        squareFootage: number;
        constructionMaterial: string;
    };
    contactDetails: {
        fullName: string;
        email: string;
        phoneNumber: string;
        alternatePhone: string;
        rcNumber: string;
    };
    requestDetails: {
        coverageType: string;
        policyDuration: string;
        additionalCoverage: string[];
        specialRequests: string;
    };
}

const PolicyEditInterface: React.FC<PolicyEditInterfaceProps> = ({
    policyId,
    isOpen,
    onClose,
    onUpdate,
    rejectionReasons = [],
    requiredActions = [],
    conflictContext
}) => {
    const [policyData, setPolicyData] = useState<PolicyData | null>(null);
    const [loading, setLoading] = useState(true);
    const [saving, setSaving] = useState(false);
    const [error, setError] = useState<string | null>(null);
    const [validationErrors, setValidationErrors] = useState<Record<string, string>>({});
    const [hasChanges, setHasChanges] = useState(false);

    useEffect(() => {
        if (isOpen) {
            fetchPolicyData();
        }
    }, [isOpen, policyId]);

    const fetchPolicyData = async () => {
        try {
            setLoading(true);
            const response = await fetch(`/api/v1/policy/${policyId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch policy data');
            }

            const data = await response.json();
            setPolicyData({
                propertyDetails: {
                    propertyType: data.data.propertyDetails?.propertyType || '',
                    address: data.data.propertyDetails?.address || '',
                    buildingValue: data.data.propertyDetails?.buildingValue || 0,
                    yearBuilt: data.data.propertyDetails?.yearBuilt || '',
                    squareFootage: data.data.propertyDetails?.squareFootage || 0,
                    constructionMaterial: data.data.propertyDetails?.constructionMaterial || ''
                },
                contactDetails: {
                    fullName: data.data.contactDetails?.fullName || '',
                    email: data.data.contactDetails?.email || localStorage.getItem('email') || '',
                    phoneNumber: data.data.contactDetails?.phoneNumber || '',
                    alternatePhone: data.data.contactDetails?.alternatePhone || '',
                    rcNumber: data.data.contactDetails?.rcNumber || ''
                },
                requestDetails: {
                    coverageType: data.data.requestDetails?.coverageType || '',
                    policyDuration: data.data.requestDetails?.policyDuration || '',
                    additionalCoverage: data.data.requestDetails?.additionalCoverage || [],
                    specialRequests: data.data.requestDetails?.specialRequests || ''
                }
            });
            setError(null);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const handleInputChange = (section: keyof PolicyData, field: string, value: any) => {
        if (!policyData) return;

        setPolicyData(prev => ({
            ...prev!,
            [section]: {
                ...prev![section],
                [field]: value
            }
        }));
        setHasChanges(true);

        // Clear validation error for this field
        const fieldKey = `${section}.${field}`;
        if (validationErrors[fieldKey]) {
            setValidationErrors(prev => {
                const newErrors = { ...prev };
                delete newErrors[fieldKey];
                return newErrors;
            });
        }
    };

    const validateForm = (): boolean => {
        if (!policyData) return false;

        const errors: Record<string, string> = {};

        // Property Details Validation
        if (!policyData.propertyDetails.propertyType) {
            errors['propertyDetails.propertyType'] = 'Property type is required';
        }
        if (!policyData.propertyDetails.address) {
            errors['propertyDetails.address'] = 'Property address is required';
        }
        if (!policyData.propertyDetails.buildingValue || policyData.propertyDetails.buildingValue <= 0) {
            errors['propertyDetails.buildingValue'] = 'Valid building value is required';
        }
        if (!policyData.propertyDetails.constructionMaterial) {
            errors['propertyDetails.constructionMaterial'] = 'Construction material is required';
        }

        // Contact Details Validation
        if (!policyData.contactDetails.fullName) {
            errors['contactDetails.fullName'] = 'Full name is required';
        }
        if (!policyData.contactDetails.email) {
            errors['contactDetails.email'] = 'Email is required';
        }
        if (!policyData.contactDetails.phoneNumber) {
            errors['contactDetails.phoneNumber'] = 'Phone number is required';
        }
        if (!policyData.contactDetails.rcNumber) {
            errors['contactDetails.rcNumber'] = 'RC Number is required';
        }

        // Request Details Validation
        if (!policyData.requestDetails.coverageType) {
            errors['requestDetails.coverageType'] = 'Coverage type is required';
        }
        if (!policyData.requestDetails.policyDuration) {
            errors['requestDetails.policyDuration'] = 'Policy duration is required';
        }

        setValidationErrors(errors);
        return Object.keys(errors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            const response = await fetch(`/api/v1/policy/${policyId}`, {
                method: 'PUT',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify(policyData)
            });

            if (!response.ok) {
                throw new Error('Failed to update policy');
            }

            setHasChanges(false);
            if (onUpdate) {
                onUpdate();
            }
            onClose();

            // Show success message
            alert('Policy updated successfully! It will be reassigned for a new survey.');
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Failed to update policy');
        } finally {
            setSaving(false);
        }
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-4">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="p-6 border-b border-gray-200 bg-gray-50">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <Edit className="w-6 h-6 text-blue-600" />
                            <div>
                                <h3 className="text-lg font-semibold text-gray-900">Edit Policy Request</h3>
                                <p className="text-sm text-gray-600">
                                    Policy ID: {policyId.substring(0, 8).toUpperCase()}
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

                    {/* Context Information */}
                    {(rejectionReasons.length > 0 || requiredActions.length > 0 || conflictContext) && (
                        <div className="mt-4 space-y-3">
                            {/* Rejection Reasons */}
                            {rejectionReasons.length > 0 && (
                                <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                                    <h4 className="font-medium text-red-800 mb-2 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Rejection Reasons
                                    </h4>
                                    <ul className="space-y-1">
                                        {rejectionReasons.map((reason, index) => (
                                            <li key={index} className="text-sm text-red-700 flex items-start">
                                                <span className="w-1.5 h-1.5 bg-red-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                {reason}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Required Actions */}
                            {requiredActions.length > 0 && (
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                    <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                                        <Info className="w-4 h-4 mr-2" />
                                        Required Actions
                                    </h4>
                                    <ul className="space-y-1">
                                        {requiredActions.map((action, index) => (
                                            <li key={index} className="text-sm text-blue-700 flex items-start">
                                                <span className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-2 mr-2 flex-shrink-0"></span>
                                                {action}
                                            </li>
                                        ))}
                                    </ul>
                                </div>
                            )}

                            {/* Conflict Context */}
                            {conflictContext && (
                                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                                    <h4 className="font-medium text-orange-800 mb-2 flex items-center">
                                        <AlertTriangle className="w-4 h-4 mr-2" />
                                        Conflict Context
                                    </h4>
                                    <div className="text-sm text-orange-700">
                                        <p><strong>Type:</strong> {conflictContext.type.replace('_', ' ')}</p>
                                        <p><strong>Severity:</strong> {conflictContext.severity}</p>
                                        <p><strong>Description:</strong> {conflictContext.description}</p>
                                    </div>
                                </div>
                            )}
                        </div>
                    )}
                </div>

                {/* Content */}
                <div className="flex-1 overflow-hidden flex flex-col">
                    {loading ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <RefreshCw className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
                                <p className="text-gray-600">Loading policy data...</p>
                            </div>
                        </div>
                    ) : error ? (
                        <div className="flex-1 flex items-center justify-center">
                            <div className="text-center">
                                <AlertTriangle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                                <h4 className="text-lg font-semibold text-red-800 mb-2">Error Loading Policy</h4>
                                <p className="text-red-600 mb-4">{error}</p>
                                <button
                                    onClick={fetchPolicyData}
                                    className="px-4 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700"
                                >
                                    Try Again
                                </button>
                            </div>
                        </div>
                    ) : policyData ? (
                        <form onSubmit={handleSubmit} className="flex-1 flex flex-col">
                            <div className="flex-1 p-6 overflow-y-auto space-y-8">
                                {/* Property Details */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Building className="w-5 h-5 text-gray-600" />
                                        <h4 className="font-medium text-gray-900">Property Details</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Property Type *
                                            </label>
                                            <select
                                                value={policyData.propertyDetails.propertyType}
                                                onChange={(e) => handleInputChange('propertyDetails', 'propertyType', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['propertyDetails.propertyType'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select property type</option>
                                                {PROPERTY_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {validationErrors['propertyDetails.propertyType'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['propertyDetails.propertyType']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Building Value (₦) *
                                            </label>
                                            <input
                                                type="number"
                                                value={policyData.propertyDetails.buildingValue}
                                                onChange={(e) => handleInputChange('propertyDetails', 'buildingValue', Number(e.target.value))}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['propertyDetails.buildingValue'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {validationErrors['propertyDetails.buildingValue'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['propertyDetails.buildingValue']}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Property Address *
                                            </label>
                                            <textarea
                                                value={policyData.propertyDetails.address}
                                                onChange={(e) => handleInputChange('propertyDetails', 'address', e.target.value)}
                                                rows={3}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['propertyDetails.address'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {validationErrors['propertyDetails.address'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['propertyDetails.address']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Year Built
                                            </label>
                                            <input
                                                type="number"
                                                value={policyData.propertyDetails.yearBuilt}
                                                onChange={(e) => handleInputChange('propertyDetails', 'yearBuilt', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Square Footage
                                            </label>
                                            <input
                                                type="number"
                                                value={policyData.propertyDetails.squareFootage}
                                                onChange={(e) => handleInputChange('propertyDetails', 'squareFootage', Number(e.target.value))}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Construction Material *
                                            </label>
                                            <select
                                                value={policyData.propertyDetails.constructionMaterial}
                                                onChange={(e) => handleInputChange('propertyDetails', 'constructionMaterial', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['propertyDetails.constructionMaterial'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select material</option>
                                                {CONSTRUCTION_MATERIALS.map((material) => (
                                                    <option key={material} value={material}>{material}</option>
                                                ))}
                                            </select>
                                            {validationErrors['propertyDetails.constructionMaterial'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['propertyDetails.constructionMaterial']}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Contact Details */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <User className="w-5 h-5 text-gray-600" />
                                        <h4 className="font-medium text-gray-900">Contact Information</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Full Name *
                                            </label>
                                            <input
                                                type="text"
                                                value={policyData.contactDetails.fullName}
                                                onChange={(e) => handleInputChange('contactDetails', 'fullName', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['contactDetails.fullName'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {validationErrors['contactDetails.fullName'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['contactDetails.fullName']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Email *
                                            </label>
                                            <input
                                                type="email"
                                                value={policyData.contactDetails.email}
                                                readOnly
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 bg-gray-50 text-gray-700 cursor-not-allowed"
                                            />
                                            <p className="text-xs text-gray-500 mt-1">
                                                Email cannot be changed from this form
                                            </p>
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Phone Number *
                                            </label>
                                            <input
                                                type="tel"
                                                value={policyData.contactDetails.phoneNumber}
                                                onChange={(e) => handleInputChange('contactDetails', 'phoneNumber', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['contactDetails.phoneNumber'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            />
                                            {validationErrors['contactDetails.phoneNumber'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['contactDetails.phoneNumber']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Alternate Phone
                                            </label>
                                            <input
                                                type="tel"
                                                value={policyData.contactDetails.alternatePhone}
                                                onChange={(e) => handleInputChange('contactDetails', 'alternatePhone', e.target.value)}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                            />
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                RC Number *
                                            </label>
                                            <input
                                                type="text"
                                                value={policyData.contactDetails.rcNumber}
                                                onChange={(e) => handleInputChange('contactDetails', 'rcNumber', e.target.value.toUpperCase())}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['contactDetails.rcNumber'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                                style={{ textTransform: 'uppercase' }}
                                                placeholder="RC123456"
                                            />
                                            {validationErrors['contactDetails.rcNumber'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['contactDetails.rcNumber']}</p>
                                            )}
                                        </div>
                                    </div>
                                </div>

                                {/* Coverage Details */}
                                <div>
                                    <div className="flex items-center space-x-2 mb-4">
                                        <Shield className="w-5 h-5 text-gray-600" />
                                        <h4 className="font-medium text-gray-900">Coverage Information</h4>
                                    </div>

                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Coverage Type *
                                            </label>
                                            <select
                                                value={policyData.requestDetails.coverageType}
                                                onChange={(e) => handleInputChange('requestDetails', 'coverageType', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['requestDetails.coverageType'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select coverage type</option>
                                                {COVERAGE_TYPES.map((type) => (
                                                    <option key={type} value={type}>{type}</option>
                                                ))}
                                            </select>
                                            {validationErrors['requestDetails.coverageType'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['requestDetails.coverageType']}</p>
                                            )}
                                        </div>

                                        <div>
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Policy Duration *
                                            </label>
                                            <select
                                                value={policyData.requestDetails.policyDuration}
                                                onChange={(e) => handleInputChange('requestDetails', 'policyDuration', e.target.value)}
                                                className={`w-full border rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${validationErrors['requestDetails.policyDuration'] ? 'border-red-300' : 'border-gray-300'
                                                    }`}
                                            >
                                                <option value="">Select duration</option>
                                                {POLICY_DURATIONS.map((duration) => (
                                                    <option key={duration} value={duration}>{duration}</option>
                                                ))}
                                            </select>
                                            {validationErrors['requestDetails.policyDuration'] && (
                                                <p className="text-red-500 text-xs mt-1">{validationErrors['requestDetails.policyDuration']}</p>
                                            )}
                                        </div>

                                        <div className="md:col-span-2">
                                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                                Special Requests
                                            </label>
                                            <textarea
                                                value={policyData.requestDetails.specialRequests}
                                                onChange={(e) => handleInputChange('requestDetails', 'specialRequests', e.target.value)}
                                                rows={3}
                                                className="w-full border border-gray-300 rounded-lg px-3 py-2 focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                                placeholder="Any special requirements or additional information..."
                                            />
                                        </div>
                                    </div>
                                </div>
                            </div>

                            {/* Footer */}
                            <div className="p-6 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                                <div className="flex items-center justify-between">
                                    <div className="text-sm text-gray-600">
                                        {hasChanges && (
                                            <div className="flex items-center space-x-2 text-orange-600">
                                                <AlertTriangle className="w-4 h-4" />
                                                <span>You have unsaved changes</span>
                                            </div>
                                        )}
                                    </div>

                                    <div className="flex items-center space-x-3">
                                        <button
                                            type="button"
                                            onClick={onClose}
                                            className="px-4 py-2 border border-gray-300 text-gray-700 rounded-lg hover:bg-gray-50"
                                        >
                                            Cancel
                                        </button>
                                        <button
                                            type="submit"
                                            disabled={saving || !hasChanges}
                                            className="inline-flex items-center space-x-2 px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                                        >
                                            {saving && <RefreshCw className="w-4 h-4 animate-spin" />}
                                            <Save className="w-4 h-4" />
                                            <span>{saving ? 'Saving...' : 'Save Changes'}</span>
                                        </button>
                                    </div>
                                </div>

                                <div className="mt-3 text-xs text-gray-500">
                                    <p>
                                        <strong>Note:</strong> After saving, your policy will be reassigned for a new survey.
                                        You'll receive notifications about the progress.
                                    </p>
                                </div>
                            </div>
                        </form>
                    ) : null}
                </div>
            </div>
        </div>
    );
};

export default PolicyEditInterface;