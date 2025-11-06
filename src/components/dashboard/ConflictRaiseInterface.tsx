"use client";
import React, { useState } from 'react';
import {
    X,
    AlertTriangle,
    Send,
    Mail,
    Phone,
    MessageCircle,
    FileText,
    User,
    CheckCircle
} from 'lucide-react';

interface ConflictRaiseInterfaceProps {
    isOpen: boolean;
    onClose: () => void;
    policyId?: string;
    mergedReportId?: string;
    onSubmit?: (conflictData: ConflictInquiry) => void;
}

interface ConflictInquiry {
    conflictType: string;
    description: string;
    contactPreference: 'email' | 'phone' | 'both';
    urgency: 'low' | 'medium' | 'high';
    userContact: {
        email: string;
        phone: string;
        preferredTime?: string;
    };
}

const ConflictRaiseInterface: React.FC<ConflictRaiseInterfaceProps> = ({
    isOpen,
    onClose,
    policyId,
    mergedReportId,
    onSubmit
}) => {
    const [formData, setFormData] = useState<ConflictInquiry>({
        conflictType: '',
        description: '',
        contactPreference: 'email',
        urgency: 'medium',
        userContact: {
            email: '',
            phone: '',
            preferredTime: ''
        }
    });

    const [isSubmitting, setIsSubmitting] = useState(false);
    const [submitted, setSubmitted] = useState(false);

    const conflictTypes = [
        { value: 'disagreement_findings', label: 'Disagreement with Survey Findings' },
        { value: 'recommendation_concern', label: 'Concern about Recommendations' },
        { value: 'surveyor_conduct', label: 'Surveyor Conduct Issues' },
        { value: 'technical_error', label: 'Technical Errors in Report' },
        { value: 'missing_information', label: 'Missing Information' },
        { value: 'clarification_needed', label: 'Need Clarification' },
        { value: 'other', label: 'Other Concerns' }
    ];

    const urgencyLevels = [
        { value: 'low', label: 'Low - General inquiry', color: 'green' },
        { value: 'medium', label: 'Medium - Important concern', color: 'yellow' },
        { value: 'high', label: 'High - Urgent issue', color: 'red' }
    ];

    const handleInputChange = (field: string, value: string) => {
        if (field.startsWith('userContact.')) {
            const contactField = field.split('.')[1];
            setFormData(prev => ({
                ...prev,
                userContact: {
                    ...prev.userContact,
                    [contactField]: value
                }
            }));
        } else {
            setFormData(prev => ({
                ...prev,
                [field]: value
            }));
        }
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        setIsSubmitting(true);

        try {
            // Simulate API call
            await new Promise(resolve => setTimeout(resolve, 2000));

            if (onSubmit) {
                onSubmit(formData);
            }

            setSubmitted(true);

            // Auto close after 3 seconds
            setTimeout(() => {
                onClose();
                setSubmitted(false);
                setFormData({
                    conflictType: '',
                    description: '',
                    contactPreference: 'email',
                    urgency: 'medium',
                    userContact: {
                        email: '',
                        phone: '',
                        preferredTime: ''
                    }
                });
            }, 3000);
        } catch (error) {
            console.error('Error submitting conflict inquiry:', error);
        } finally {
            setIsSubmitting(false);
        }
    };

    const isFormValid = () => {
        return formData.conflictType &&
            formData.description.trim() &&
            formData.userContact.email.trim() &&
            (formData.contactPreference !== 'phone' && formData.contactPreference !== 'both' || formData.userContact.phone.trim());
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-2xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-orange-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <AlertTriangle className="w-6 h-6" />
                            <div>
                                <h2 className="text-xl font-bold">Raise Survey Conflict</h2>
                                <p className="text-orange-100 mt-1">
                                    Submit your concerns about the survey report
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-orange-100 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    {submitted ? (
                        <div className="text-center py-8">
                            <CheckCircle className="w-16 h-16 text-green-500 mx-auto mb-4" />
                            <h3 className="text-xl font-bold text-gray-900 mb-2">
                                Conflict Inquiry Submitted
                            </h3>
                            <p className="text-gray-600 mb-4">
                                Your inquiry has been sent to both AMMC and NIA administrators.
                                You will receive a response within 24-48 hours.
                            </p>
                            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                                <p className="text-sm text-green-800">
                                    <strong>Reference ID:</strong> CF-{Date.now().toString().slice(-6)}
                                </p>
                                <p className="text-sm text-green-800 mt-1">
                                    Please keep this reference for your records.
                                </p>
                            </div>
                        </div>
                    ) : (
                        <form onSubmit={handleSubmit} className="space-y-6">
                            {/* Conflict Type */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Type of Concern *
                                </label>
                                <select
                                    value={formData.conflictType}
                                    onChange={(e) => handleInputChange('conflictType', e.target.value)}
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    required
                                >
                                    <option value="">Select concern type</option>
                                    {conflictTypes.map(type => (
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
                                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                    placeholder="Please provide detailed information about your concern, including specific sections of the report if applicable..."
                                    required
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Be as specific as possible to help administrators understand your concern
                                </p>
                            </div>

                            {/* Urgency Level */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Urgency Level
                                </label>
                                <div className="space-y-2">
                                    {urgencyLevels.map(level => (
                                        <label key={level.value} className="flex items-center space-x-3">
                                            <input
                                                type="radio"
                                                name="urgency"
                                                value={level.value}
                                                checked={formData.urgency === level.value}
                                                onChange={(e) => handleInputChange('urgency', e.target.value)}
                                                className="text-orange-600 focus:ring-orange-500"
                                            />
                                            <div className="flex items-center space-x-2">
                                                <div className={`w-3 h-3 rounded-full bg-${level.color}-500`}></div>
                                                <span className="text-sm text-gray-900">{level.label}</span>
                                            </div>
                                        </label>
                                    ))}
                                </div>
                            </div>

                            {/* Contact Information */}
                            <div className="border-t border-gray-200 pt-6">
                                <h4 className="text-lg font-medium text-gray-900 mb-4">Contact Information</h4>

                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="block text-sm font-medium text-gray-700 mb-1">
                                            Email Address *
                                        </label>
                                        <input
                                            type="email"
                                            value={formData.userContact.email}
                                            onChange={(e) => handleInputChange('userContact.email', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="your.email@example.com"
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
                                            onChange={(e) => handleInputChange('userContact.phone', e.target.value)}
                                            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                            placeholder="+234-XXX-XXX-XXXX"
                                        />
                                    </div>
                                </div>

                                <div className="mt-4">
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Preferred Contact Time
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.userContact.preferredTime}
                                        onChange={(e) => handleInputChange('userContact.preferredTime', e.target.value)}
                                        className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-orange-500 focus:border-orange-500"
                                        placeholder="e.g., Weekdays 9 AM - 5 PM, Evenings after 6 PM"
                                    />
                                </div>
                            </div>

                            {/* Contact Preference */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-2">
                                    Preferred Contact Method
                                </label>
                                <div className="space-y-2">
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="contactPreference"
                                            value="email"
                                            checked={formData.contactPreference === 'email'}
                                            onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Mail className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">Email only</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="contactPreference"
                                            value="phone"
                                            checked={formData.contactPreference === 'phone'}
                                            onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <Phone className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">Phone call only</span>
                                        </div>
                                    </label>
                                    <label className="flex items-center space-x-3">
                                        <input
                                            type="radio"
                                            name="contactPreference"
                                            value="both"
                                            checked={formData.contactPreference === 'both'}
                                            onChange={(e) => handleInputChange('contactPreference', e.target.value)}
                                            className="text-orange-600 focus:ring-orange-500"
                                        />
                                        <div className="flex items-center space-x-2">
                                            <MessageCircle className="w-4 h-4 text-gray-400" />
                                            <span className="text-sm text-gray-900">Both email and phone</span>
                                        </div>
                                    </label>
                                </div>
                            </div>

                            {/* Information Notice */}
                            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                                <div className="flex items-start space-x-3">
                                    <FileText className="w-5 h-5 text-blue-600 mt-0.5" />
                                    <div>
                                        <h5 className="text-sm font-medium text-blue-900 mb-1">
                                            What happens next?
                                        </h5>
                                        <ul className="text-sm text-blue-800 space-y-1">
                                            <li>• Your inquiry will be sent to both AMMC and NIA administrators</li>
                                            <li>• You will receive an acknowledgment within 2 hours</li>
                                            <li>• A detailed response will be provided within 24-48 hours</li>
                                            <li>• If needed, a meeting or call will be scheduled to resolve the issue</li>
                                        </ul>
                                    </div>
                                </div>
                            </div>
                        </form>
                    )}
                </div>

                {/* Footer */}
                {!submitted && (
                    <div className="border-t border-gray-200 p-6">
                        <div className="flex items-center justify-end space-x-3">
                            <button
                                type="button"
                                onClick={onClose}
                                className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                            >
                                Cancel
                            </button>
                            <button
                                onClick={handleSubmit}
                                disabled={!isFormValid() || isSubmitting}
                                className="px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {isSubmitting ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Submitting...</span>
                                    </>
                                ) : (
                                    <>
                                        <Send className="w-4 h-4" />
                                        <span>Submit Inquiry</span>
                                    </>
                                )}
                            </button>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
};

export default ConflictRaiseInterface;