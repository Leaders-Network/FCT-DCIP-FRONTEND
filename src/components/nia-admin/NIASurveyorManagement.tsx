import React, { useState } from 'react';
import { X, Save, User, Award } from 'lucide-react';
import { NIASurveyor, NIASurveyorManagementProps } from '@/types/api.types';

const NIASurveyorManagement: React.FC<NIASurveyorManagementProps> = ({
    surveyor,
    mode,
    onSave,
    onClose
}) => {
    const [formData, setFormData] = useState<Partial<NIASurveyor>>({
        firstname: surveyor?.firstname || '',
        lastname: surveyor?.lastname || '',
        email: surveyor?.email || '',
        phoneNumber: surveyor?.phoneNumber || '',
        address: surveyor?.address || '',
        licenseNumber: surveyor?.licenseNumber || '',
        specialization: surveyor?.specialization || [],
        experience: surveyor?.experience || 0,
        status: surveyor?.status || 'active',
        availability: surveyor?.availability || 'available',
        maxAssignments: surveyor?.maxAssignments || 10,
        dateOfBirth: surveyor?.dateOfBirth || '',
        emergencyContact: surveyor?.emergencyContact || undefined,
        qualifications: surveyor?.qualifications || [],
        notes: surveyor?.notes || ''
    });

    const [loading, setLoading] = useState(false);
    const [errors, setErrors] = useState<Record<string, string>>({});

    // Properly typed handleInputChange function
    const handleInputChange = (field: keyof NIASurveyor, value: string | number | string[] | undefined) => {
        setFormData(prev => ({ ...prev, [field]: value }));
        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({ ...prev, [field]: '' }));
        }
    };

    const validateForm = (): boolean => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstname?.trim()) {
            newErrors.firstname = 'First name is required';
        }
        if (!formData.lastname?.trim()) {
            newErrors.lastname = 'Last name is required';
        }
        if (!formData.email?.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
            newErrors.email = 'Email is invalid';
        }
        if (!formData.phoneNumber?.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            // Validate phone format
            const normalizedPhone = formData.phoneNumber.replace(/[\s\-]/g, '');
            const phoneRegex = /^(?:\+234\d{10}|234\d{10}|0\d{10})$/;
            if (!phoneRegex.test(normalizedPhone)) {
                newErrors.phoneNumber = 'Invalid format. Use: 08012345678, 2348012345678, or +2348012345678';
            }
        }
        if (!formData.licenseNumber?.trim()) {
            newErrors.licenseNumber = 'License number is required';
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!validateForm()) {
            return;
        }

        try {
            setLoading(true);
            await onSave(formData as NIASurveyor);
        } catch (error) {
            console.error('Error saving surveyor:', error);
            alert('Failed to save surveyor. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    const isReadOnly = mode === 'view';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">
                                {mode === 'add' ? 'Add New NIA Surveyor' :
                                    mode === 'edit' ? 'Edit NIA Surveyor' :
                                        'View NIA Surveyor'}
                            </h2>
                            <p className="text-blue-100 mt-1">
                                {mode === 'add' ? 'Create a new surveyor profile' :
                                    mode === 'edit' ? 'Update surveyor information' :
                                        'View surveyor details'}
                            </p>
                        </div>
                        <button
                            onClick={onClose}
                            className="text-blue-100 hover:text-white transition-colors"
                        >
                            <X className="w-6 h-6" />
                        </button>
                    </div>
                </div>

                {/* Form */}
                <form onSubmit={handleSubmit} className="p-6 overflow-y-auto max-h-[calc(90vh-120px)]">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <User className="w-5 h-5 mr-2" />
                                Personal Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    First Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.firstname || ''}
                                    onChange={(e) => handleInputChange('firstname', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.firstname ? 'border-red-500' : 'border-gray-300'
                                        } ${isReadOnly ? 'bg-gray-50' : ''}`}
                                />
                                {errors.firstname && (
                                    <p className="text-red-500 text-xs mt-1">{errors.firstname}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Last Name *
                                </label>
                                <input
                                    type="text"
                                    value={formData.lastname || ''}
                                    onChange={(e) => handleInputChange('lastname', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.lastname ? 'border-red-500' : 'border-gray-300'
                                        } ${isReadOnly ? 'bg-gray-50' : ''}`}
                                />
                                {errors.lastname && (
                                    <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email || ''}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.email ? 'border-red-500' : 'border-gray-300'
                                        } ${isReadOnly ? 'bg-gray-50' : ''}`}
                                />
                                {errors.email && (
                                    <p className="text-red-500 text-xs mt-1">{errors.email}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Phone Number *
                                </label>
                                <input
                                    type="tel"
                                    value={formData.phoneNumber || ''}
                                    onChange={(e) => handleInputChange('phoneNumber', e.target.value)}
                                    disabled={isReadOnly}
                                    placeholder="08012345678 or +2348012345678"
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'
                                        } ${isReadOnly ? 'bg-gray-50' : ''}`}
                                />
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                                )}
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: 08012345678, 2348012345678, or +2348012345678
                                </p>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address
                                </label>
                                <textarea
                                    value={formData.address || ''}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={isReadOnly}
                                    rows={3}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 flex items-center">
                                <Award className="w-5 h-5 mr-2" />
                                Professional Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Number *
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber || ''}
                                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'
                                        } ${isReadOnly ? 'bg-gray-50' : ''}`}
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Years of Experience
                                </label>
                                <input
                                    type="number"
                                    min="0"
                                    max="50"
                                    value={formData.experience || 0}
                                    onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Status
                                </label>
                                <select
                                    value={formData.status || 'active'}
                                    onChange={(e) => handleInputChange('status', e.target.value as 'active' | 'inactive' | 'suspended')}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                >
                                    <option value="active">Active</option>
                                    <option value="inactive">Inactive</option>
                                    <option value="suspended">Suspended</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Availability
                                </label>
                                <select
                                    value={formData.availability || 'available'}
                                    onChange={(e) => handleInputChange('availability', e.target.value as 'available' | 'busy' | 'unavailable')}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                >
                                    <option value="available">Available</option>
                                    <option value="busy">Busy</option>
                                    <option value="unavailable">Unavailable</option>
                                </select>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Maximum Assignments
                                </label>
                                <input
                                    type="number"
                                    min="1"
                                    max="20"
                                    value={formData.maxAssignments || 10}
                                    onChange={(e) => handleInputChange('maxAssignments', parseInt(e.target.value) || 10)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                />
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Notes
                                </label>
                                <textarea
                                    value={formData.notes || ''}
                                    onChange={(e) => handleInputChange('notes', e.target.value)}
                                    disabled={isReadOnly}
                                    rows={3}
                                    className={`w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        }`}
                                    placeholder="Additional notes about the surveyor..."
                                />
                            </div>
                        </div>
                    </div>

                    {/* Footer */}
                    <div className="flex justify-end space-x-3 mt-6 pt-6 border-t border-gray-200">
                        <button
                            type="button"
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </button>
                        {!isReadOnly && (
                            <button
                                type="submit"
                                disabled={loading}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {loading ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{mode === 'add' ? 'Create Surveyor' : 'Update Surveyor'}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </form>
            </div>
        </div>
    );
};

export default NIASurveyorManagement;