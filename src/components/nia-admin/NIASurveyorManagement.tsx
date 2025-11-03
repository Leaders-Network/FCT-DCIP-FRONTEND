"use client";
import React, { useState } from 'react';
import {
    X,
    User,
    Mail,
    Phone,
    MapPin,
    Award,
    Calendar,
    Save,
    AlertTriangle,
    CheckCircle,
    Plus,
    Trash2
} from 'lucide-react';

interface NIASurveyor {
    _id?: string;
    firstname: string;
    lastname: string;
    email: string;
    phoneNumber: string;
    address: string;
    licenseNumber: string;
    specialization: string[];
    experience: number;
    status: 'active' | 'inactive' | 'suspended';
    availability: 'available' | 'busy' | 'unavailable';
    maxAssignments: number;
    dateOfBirth?: string;
    emergencyContact?: {
        name: string;
        phone: string;
        relationship: string;
    };
    qualifications?: string[];
    notes?: string;
}

interface NIASurveyorManagementProps {
    surveyor?: NIASurveyor | null;
    mode: 'add' | 'edit' | 'view';
    onSave: (surveyor: NIASurveyor) => void;
    onClose: () => void;
}

const NIASurveyorManagement: React.FC<NIASurveyorManagementProps> = ({
    surveyor,
    mode,
    onSave,
    onClose
}) => {
    const [formData, setFormData] = useState<NIASurveyor>({
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
        maxAssignments: surveyor?.maxAssignments || 5,
        dateOfBirth: surveyor?.dateOfBirth || '',
        emergencyContact: surveyor?.emergencyContact || {
            name: '',
            phone: '',
            relationship: ''
        },
        qualifications: surveyor?.qualifications || [],
        notes: surveyor?.notes || ''
    });

    const [errors, setErrors] = useState<Record<string, string>>({});
    const [saving, setSaving] = useState(false);

    // Phone number formatting helper
    const formatPhoneNumber = (value: string) => {
        // Remove all non-digits
        const digits = value.replace(/\D/g, '');

        // If starts with 234, add +
        if (digits.startsWith('234') && digits.length <= 13) {
            return '+' + digits;
        }

        // If starts with 0 and has 11 digits, keep as is
        if (digits.startsWith('0') && digits.length <= 11) {
            return digits;
        }

        // If doesn't start with + or 0 or 234, assume it needs +234 prefix
        if (!digits.startsWith('0') && !digits.startsWith('234')) {
            return '+234' + digits;
        }

        return digits;
    };
    const [newSpecialization, setNewSpecialization] = useState('');
    const [newQualification, setNewQualification] = useState('');

    const specializationOptions = [
        'residential',
        'commercial',
        'industrial',
        'agricultural'
    ];

    const handleInputChange = (field: string, value: any) => {
        setFormData(prev => ({
            ...prev,
            [field]: value
        }));

        // Clear error when user starts typing
        if (errors[field]) {
            setErrors(prev => ({
                ...prev,
                [field]: ''
            }));
        }
    };

    const handleEmergencyContactChange = (field: string, value: string) => {
        setFormData(prev => ({
            ...prev,
            emergencyContact: {
                ...prev.emergencyContact!,
                [field]: value
            }
        }));
    };

    const addSpecialization = () => {
        if (newSpecialization && !formData.specialization.includes(newSpecialization)) {
            setFormData(prev => ({
                ...prev,
                specialization: [...prev.specialization, newSpecialization]
            }));
            setNewSpecialization('');
        }
    };

    const removeSpecialization = (spec: string) => {
        setFormData(prev => ({
            ...prev,
            specialization: prev.specialization.filter(s => s !== spec)
        }));
    };

    const addQualification = () => {
        if (newQualification && !formData.qualifications!.includes(newQualification)) {
            setFormData(prev => ({
                ...prev,
                qualifications: [...(prev.qualifications || []), newQualification]
            }));
            setNewQualification('');
        }
    };

    const removeQualification = (qual: string) => {
        setFormData(prev => ({
            ...prev,
            qualifications: prev.qualifications!.filter(q => q !== qual)
        }));
    };

    const validateForm = () => {
        const newErrors: Record<string, string> = {};

        if (!formData.firstname.trim()) {
            newErrors.firstname = 'First name is required';
        }

        if (!formData.lastname.trim()) {
            newErrors.lastname = 'Last name is required';
        }

        if (!formData.email.trim()) {
            newErrors.email = 'Email is required';
        } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
            newErrors.email = 'Please enter a valid email address';
        }

        if (!formData.phoneNumber.trim()) {
            newErrors.phoneNumber = 'Phone number is required';
        } else {
            // Validate phone number format (remove spaces and dashes for validation)
            const cleanPhone = formData.phoneNumber.replace(/[\s-]/g, '');
            const phoneRegex = /^(?:\+234\d{10}|234\d{10}|0\d{10})$/;
            if (!phoneRegex.test(cleanPhone)) {
                newErrors.phoneNumber = 'Invalid format. Use: +234xxxxxxxxxx, 234xxxxxxxxxx, or 0xxxxxxxxxx';
            }
        }

        if (!formData.licenseNumber.trim()) {
            newErrors.licenseNumber = 'License number is required';
        }

        if (!formData.address.trim()) {
            newErrors.address = 'Address is required';
        }

        if (formData.experience < 0) {
            newErrors.experience = 'Experience cannot be negative';
        }

        if (formData.maxAssignments < 1) {
            newErrors.maxAssignments = 'Max assignments must be at least 1';
        }

        if (formData.specialization.length === 0) {
            newErrors.specialization = 'At least one specialization is required';
        } else {
            // Validate specializations against allowed values
            const validSpecializations = ['residential', 'commercial', 'industrial', 'agricultural'];
            const invalidSpecs = formData.specialization.filter(spec => !validSpecializations.includes(spec));
            if (invalidSpecs.length > 0) {
                newErrors.specialization = `Invalid specializations: ${invalidSpecs.join(', ')}`;
            }
        }

        setErrors(newErrors);
        return Object.keys(newErrors).length === 0;
    };

    const handleSave = async () => {
        if (!validateForm()) {
            return;
        }

        setSaving(true);
        try {
            // Transform data to match backend expectations
            const backendData = {
                ...formData,
                phonenumber: formData.phoneNumber.replace(/[\s-]/g, ''), // Clean and map phoneNumber to phonenumber
                specializations: formData.specialization || ['residential'], // Ensure specializations is an array
                experience: parseInt(formData.experience?.toString() || '0'), // Ensure experience is a number
                // Transform emergency contact object to string
                emergencyContact: formData.emergencyContact ?
                    `${formData.emergencyContact.name} (${formData.emergencyContact.relationship}) - ${formData.emergencyContact.phone}` :
                    '',
                location: {
                    state: 'FCT',
                    city: 'Abuja',
                    area: []
                }
            };

            // Remove the frontend field names
            delete backendData.phoneNumber;

            await onSave(backendData);
        } catch (error) {
            console.error('Save error:', error);
        } finally {
            setSaving(false);
        }
    };

    const isReadOnly = mode === 'view';
    const title = mode === 'add' ? 'Add New Nigerian Insurers Association Surveyor' :
        mode === 'edit' ? 'Edit NIA Surveyor' :
            'NIA Surveyor Details';

    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-lg shadow-xl max-w-4xl w-full max-h-[90vh] overflow-hidden">
                {/* Header */}
                <div className="bg-blue-600 text-white p-6">
                    <div className="flex items-center justify-between">
                        <div>
                            <h2 className="text-xl font-bold">{title}</h2>
                            <p className="text-blue-100 mt-1">
                                {mode === 'add' ? 'Register a new Nigerian Insurers Association surveyor' :
                                    mode === 'edit' ? 'Update surveyor information' :
                                        'View surveyor profile and details'}
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

                {/* Form Content */}
                <div className="p-6 overflow-y-auto max-h-[calc(90vh-200px)]">
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                        {/* Personal Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Personal Information
                            </h3>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        First Name *
                                    </label>
                                    <input
                                        type="text"
                                        value={formData.firstname}
                                        onChange={(e) => handleInputChange('firstname', e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                            } ${errors.firstname ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter first name"
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
                                        value={formData.lastname}
                                        onChange={(e) => handleInputChange('lastname', e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                            } ${errors.lastname ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="Enter last name"
                                    />
                                    {errors.lastname && (
                                        <p className="text-red-500 text-xs mt-1">{errors.lastname}</p>
                                    )}
                                </div>
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Email Address *
                                </label>
                                <input
                                    type="email"
                                    value={formData.email}
                                    onChange={(e) => handleInputChange('email', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        } ${errors.email ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter email address"
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
                                    value={formData.phoneNumber}
                                    onChange={(e) => {
                                        const formatted = formatPhoneNumber(e.target.value);
                                        handleInputChange('phoneNumber', formatted);
                                    }}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        } ${errors.phoneNumber ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="+2348012345678"
                                />
                                <p className="text-xs text-gray-500 mt-1">
                                    Format: +234xxxxxxxxxx, 234xxxxxxxxxx, or 0xxxxxxxxxx
                                </p>
                                {errors.phoneNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.phoneNumber}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Address *
                                </label>
                                <textarea
                                    value={formData.address}
                                    onChange={(e) => handleInputChange('address', e.target.value)}
                                    disabled={isReadOnly}
                                    rows={3}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        } ${errors.address ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter full address"
                                />
                                {errors.address && (
                                    <p className="text-red-500 text-xs mt-1">{errors.address}</p>
                                )}
                            </div>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Date of Birth
                                </label>
                                <input
                                    type="date"
                                    value={formData.dateOfBirth}
                                    onChange={(e) => handleInputChange('dateOfBirth', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                        }`}
                                />
                            </div>
                        </div>

                        {/* Professional Information */}
                        <div className="space-y-4">
                            <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                                Professional Information
                            </h3>

                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    License Number *
                                </label>
                                <input
                                    type="text"
                                    value={formData.licenseNumber}
                                    onChange={(e) => handleInputChange('licenseNumber', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                        } ${errors.licenseNumber ? 'border-red-500' : 'border-gray-300'}`}
                                    placeholder="Enter license number"
                                />
                                {errors.licenseNumber && (
                                    <p className="text-red-500 text-xs mt-1">{errors.licenseNumber}</p>
                                )}
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Years of Experience *
                                    </label>
                                    <input
                                        type="number"
                                        min="0"
                                        value={formData.experience}
                                        onChange={(e) => handleInputChange('experience', parseInt(e.target.value) || 0)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                            } ${errors.experience ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="0"
                                    />
                                    {errors.experience && (
                                        <p className="text-red-500 text-xs mt-1">{errors.experience}</p>
                                    )}
                                </div>

                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Max Assignments *
                                    </label>
                                    <input
                                        type="number"
                                        min="1"
                                        value={formData.maxAssignments}
                                        onChange={(e) => handleInputChange('maxAssignments', parseInt(e.target.value) || 1)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : ''
                                            } ${errors.maxAssignments ? 'border-red-500' : 'border-gray-300'}`}
                                        placeholder="5"
                                    />
                                    {errors.maxAssignments && (
                                        <p className="text-red-500 text-xs mt-1">{errors.maxAssignments}</p>
                                    )}
                                </div>
                            </div>

                            <div className="grid grid-cols-2 gap-4">
                                <div>
                                    <label className="block text-sm font-medium text-gray-700 mb-1">
                                        Status
                                    </label>
                                    <select
                                        value={formData.status}
                                        onChange={(e) => handleInputChange('status', e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
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
                                        value={formData.availability}
                                        onChange={(e) => handleInputChange('availability', e.target.value)}
                                        disabled={isReadOnly}
                                        className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                            }`}
                                    >
                                        <option value="available">Available</option>
                                        <option value="busy">Busy</option>
                                        <option value="unavailable">Unavailable</option>
                                    </select>
                                </div>
                            </div>

                            {/* Specializations */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Specializations *
                                </label>
                                {!isReadOnly && (
                                    <div className="flex gap-2 mb-2">
                                        <select
                                            value={newSpecialization}
                                            onChange={(e) => setNewSpecialization(e.target.value)}
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        >
                                            <option value="">Select specialization</option>
                                            {specializationOptions.map(option => (
                                                <option key={option} value={option}>
                                                    {option.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                                </option>
                                            ))}
                                        </select>
                                        <button
                                            type="button"
                                            onClick={addSpecialization}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="flex flex-wrap gap-2">
                                    {formData.specialization.map((spec, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-3 py-1 rounded-full text-sm bg-blue-100 text-blue-800"
                                        >
                                            {spec.replace('-', ' ').replace(/\b\w/g, l => l.toUpperCase())}
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeSpecialization(spec)}
                                                    className="ml-2 text-blue-600 hover:text-blue-800"
                                                >
                                                    <X className="w-3 h-3" />
                                                </button>
                                            )}
                                        </span>
                                    ))}
                                </div>
                                {errors.specialization && (
                                    <p className="text-red-500 text-xs mt-1">{errors.specialization}</p>
                                )}
                            </div>

                            {/* Qualifications */}
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Qualifications
                                </label>
                                {!isReadOnly && (
                                    <div className="flex gap-2 mb-2">
                                        <input
                                            type="text"
                                            value={newQualification}
                                            onChange={(e) => setNewQualification(e.target.value)}
                                            placeholder="Enter qualification"
                                            className="flex-1 px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                                        />
                                        <button
                                            type="button"
                                            onClick={addQualification}
                                            className="px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
                                        >
                                            <Plus className="w-4 h-4" />
                                        </button>
                                    </div>
                                )}
                                <div className="space-y-1">
                                    {formData.qualifications?.map((qual, index) => (
                                        <div
                                            key={index}
                                            className="flex items-center justify-between px-3 py-2 bg-gray-50 rounded-lg"
                                        >
                                            <span className="text-sm text-gray-900">{qual}</span>
                                            {!isReadOnly && (
                                                <button
                                                    type="button"
                                                    onClick={() => removeQualification(qual)}
                                                    className="text-red-600 hover:text-red-800"
                                                >
                                                    <Trash2 className="w-4 h-4" />
                                                </button>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            </div>
                        </div>
                    </div>

                    {/* Emergency Contact */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <h3 className="text-lg font-semibold text-gray-900 mb-4">Emergency Contact</h3>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Name
                                </label>
                                <input
                                    type="text"
                                    value={formData.emergencyContact?.name || ''}
                                    onChange={(e) => handleEmergencyContactChange('name', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter contact name"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Contact Phone
                                </label>
                                <input
                                    type="tel"
                                    value={formData.emergencyContact?.phone || ''}
                                    onChange={(e) => handleEmergencyContactChange('phone', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                        }`}
                                    placeholder="Enter contact phone"
                                />
                            </div>
                            <div>
                                <label className="block text-sm font-medium text-gray-700 mb-1">
                                    Relationship
                                </label>
                                <input
                                    type="text"
                                    value={formData.emergencyContact?.relationship || ''}
                                    onChange={(e) => handleEmergencyContactChange('relationship', e.target.value)}
                                    disabled={isReadOnly}
                                    className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                        }`}
                                    placeholder="e.g., Spouse, Parent"
                                />
                            </div>
                        </div>
                    </div>

                    {/* Notes */}
                    <div className="mt-6 pt-6 border-t border-gray-200">
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-1">
                                Additional Notes
                            </label>
                            <textarea
                                value={formData.notes}
                                onChange={(e) => handleInputChange('notes', e.target.value)}
                                disabled={isReadOnly}
                                rows={3}
                                className={`w-full px-3 py-2 border rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 ${isReadOnly ? 'bg-gray-50' : 'border-gray-300'
                                    }`}
                                placeholder="Enter any additional notes about the surveyor"
                            />
                        </div>
                    </div>
                </div>

                {/* Footer */}
                <div className="border-t border-gray-200 p-6">
                    <div className="flex items-center justify-end space-x-3">
                        <button
                            onClick={onClose}
                            className="px-4 py-2 text-gray-700 bg-gray-100 rounded-lg hover:bg-gray-200 transition-colors"
                        >
                            {isReadOnly ? 'Close' : 'Cancel'}
                        </button>
                        {!isReadOnly && (
                            <button
                                onClick={handleSave}
                                disabled={saving}
                                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center space-x-2"
                            >
                                {saving ? (
                                    <>
                                        <div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white"></div>
                                        <span>Saving...</span>
                                    </>
                                ) : (
                                    <>
                                        <Save className="w-4 h-4" />
                                        <span>{mode === 'add' ? 'Add Surveyor' : 'Save Changes'}</span>
                                    </>
                                )}
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default NIASurveyorManagement;