'use client';

import React, { useState } from 'react';
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

interface ConflictRaiseInterfaceProps {
    policyId: string;
    reportId?: string;
    isOpen: boolean;
    onClose: () => void;
    onSubmit?: (inquiryId: string) => void;
    conflictContext?: {
        type: string;
        severity: string;
        description: string;
    };
}

interface ConflictInquiry {
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

const ConflictRaiseInterface: React.FC<ConflictRaiseInterfaceProps> = ({
    policyId,
    reportId,
    isOpen,
    onClose,
    onSubmit,
    conflictContext
}) => {
    const [formData, setFormData] = useState<ConflictInquiry>({
        conflictType: conflictContext?.type || '',
        description: '',
        urgency: 'medium',
        contactPreference: 'email',
        userContact: {
            email: localStorage.getItem('email') || '',
            phone: '',
            name: localStorage.getItem('fullname') || ''
        }
    });
    const [submitting, setSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);
    const [inquiryId, setInquiryId] = useState<string>('');

    const conflictTypes = [
        { value: 'recommendation_mismatch', label: 'Surveyor Recommendations Differ' },
        { value: 'value_discrepancy', label: 'Property Value Discrepancy' },
        { value: 'assessment_quality', label: 'Assessment Quality Concerns' },
        { value: 'decision_dispute', label: 'Dispute Insurance Decision' },
        { value: 'process_issue', label: 'Process or Procedure Issue' },
        { value: 'technical_error', label: 'Technical Error or Bug' },
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
            const response = await fetch('/api/v1/user-conflict-inquiries', {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                },
                body: JSON.stringify({
                    policyId,
                    reportId,
                    ...formData
                })
            });

            if (!response.ok) {
                throw new Error('Failed to submit conflict inquiry');
            }

            const data = await response.json();
            setInquiryId(data.data.referenceId);
            setSubmitted(true);

            if (onSubmit) {
                onSubmit(data.data.referenceId);
            }
        } catch (error) {
            console.error('Failed to submit inquiry:', error);
            alert('Failed to submit inquiry. Please try again.');
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
                            {/* Policy Information */}
                            <div className="bg-gray-50 rounded-lg p-4">
                                <h4 className="font-medium text-gray-900 mb-2">Policy Information</h4>
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="text-gray-600">Policy ID:</span>
                                        <span className="ml-2 font-mono">{policyId.substring(0, 8).toUpperCase()}</span>
                                    </div>
                                    {reportId && (
                                        <div>
                                            <span className="text-gray-600">Report ID:</span>
                                            <span className="ml-2 font-mono">{reportId.substring(0, 8).toUpperCase()}</span>
                                        </div>
                                    )}
                                </div>
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
                                    onChange={(e) => handleInputChange('conflictType', e.target.value)}
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
                                    onChange={(e) => handleInputChange('description', e.target.value)}
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
                                                onChange={(e) => handleInputChange('urgency', e.target.value)}
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
                                            onChange={(e) => handleContactChange('name', e.target.value)}
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
                                            onChange={(e) => handleContactChange('email', e.target.value)}
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
                                            onChange={(e) => handleContactChange('phone', e.target.value)}
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
                                            onChange={(e) => handleInputChange('contactPreference', e.target.value)}
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