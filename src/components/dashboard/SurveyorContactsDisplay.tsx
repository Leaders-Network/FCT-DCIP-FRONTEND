"use client";
import React, { useState } from 'react';
import {
    User,
    Users,
    Mail,
    Phone,
    MapPin,
    Building2,
    MessageCircle,
    Calendar,
    Clock,
    Award,
    ExternalLink,
    Copy,
    CheckCircle,
    Shield,
    HelpCircle
} from 'lucide-react';
import AdminContactDisplay from './AdminContactDisplay';

interface SurveyorContact {
    name: string;
    email: string;
    phone: string;
    organization: 'AMMC' | 'NIA';
    licenseNumber?: string;
    specialization?: string[];
    experience?: number;
    rating?: number;
    lastActive?: string;
    profileImage?: string;
}

interface SurveyorContactsDisplayProps {
    ammcSurveyor?: SurveyorContact;
    niaSurveyor?: SurveyorContact;
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
    showContactActions?: boolean;
    showAdminContacts?: boolean;
}

const SurveyorContactsDisplay: React.FC<SurveyorContactsDisplayProps> = ({
    ammcSurveyor,
    niaSurveyor,
    assignmentStatus,
    showContactActions = true,
    showAdminContacts = false
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
    };

    const getOrganizationColor = (org: 'AMMC' | 'NIA') => {
        return org === 'AMMC' ? 'green' : 'blue';
    };

    const getOrganizationName = (org: 'AMMC' | 'NIA') => {
        return org === 'AMMC' ? 'Abuja Municipal Area Council' : 'Nigerian Insurers Association';
    };

    const formatLastActive = (lastActive?: string) => {
        if (!lastActive) return 'Unknown';
        const date = new Date(lastActive);
        const now = new Date();
        const diffInHours = Math.floor((now.getTime() - date.getTime()) / (1000 * 60 * 60));

        if (diffInHours < 1) return 'Active now';
        if (diffInHours < 24) return `${diffInHours}h ago`;
        if (diffInHours < 168) return `${Math.floor(diffInHours / 24)}d ago`;
        return date.toLocaleDateString();
    };

    const SurveyorCard: React.FC<{ surveyor: SurveyorContact; isAssigned: boolean }> = ({ surveyor, isAssigned }) => {
        const orgColor = getOrganizationColor(surveyor.organization);

        return (
            <div className={`border-2 rounded-lg p-6 transition-all ${isAssigned
                ? `border-${orgColor}-200 bg-${orgColor}-50`
                : 'border-gray-200 bg-gray-50'
                }`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isAssigned
                            ? `bg-${orgColor}-100`
                            : 'bg-gray-100'
                            }`}>
                            <Building2 className={`h-6 w-6 ${isAssigned
                                ? `text-${orgColor}-600`
                                : 'text-gray-400'
                                }`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {surveyor.organization} Surveyor
                            </h3>
                            <p className="text-sm text-gray-600">
                                {getOrganizationName(surveyor.organization)}
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAssigned
                        ? `bg-${orgColor}-100 text-${orgColor}-800`
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isAssigned ? 'Assigned' : 'Not Assigned'}
                    </div>
                </div>

                {isAssigned ? (
                    <div className="space-y-4">
                        {/* Surveyor Profile */}
                        <div className="flex items-center space-x-4">
                            <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${orgColor === 'green' ? 'bg-green-600' : 'bg-blue-600'
                                }`}>
                                {surveyor.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                            </div>
                            <div className="flex-1">
                                <h4 className="text-lg font-medium text-gray-900">{surveyor.name}</h4>
                                {surveyor.licenseNumber && (
                                    <p className="text-sm text-gray-600">License: {surveyor.licenseNumber}</p>
                                )}
                                {surveyor.experience && (
                                    <p className="text-sm text-gray-600">{surveyor.experience} years experience</p>
                                )}
                            </div>
                            {surveyor.rating && (
                                <div className="flex items-center space-x-1">
                                    <Award className="w-4 h-4 text-yellow-500" />
                                    <span className="text-sm font-medium text-gray-900">
                                        {surveyor.rating.toFixed(1)}
                                    </span>
                                </div>
                            )}
                        </div>

                        {/* Contact Information */}
                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{surveyor.email}</span>
                                </div>
                                {showContactActions && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => copyToClipboard(surveyor.email, `${surveyor.organization}-email`)}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy email"
                                        >
                                            {copiedField === `${surveyor.organization}-email` ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                        <a
                                            href={`mailto:${surveyor.email}`}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Send email"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>

                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Phone className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{surveyor.phone}</span>
                                </div>
                                {showContactActions && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => copyToClipboard(surveyor.phone, `${surveyor.organization}-phone`)}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy phone"
                                        >
                                            {copiedField === `${surveyor.organization}-phone` ? (
                                                <CheckCircle className="w-4 h-4 text-green-500" />
                                            ) : (
                                                <Copy className="w-4 h-4" />
                                            )}
                                        </button>
                                        <a
                                            href={`tel:${surveyor.phone}`}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Call phone"
                                        >
                                            <ExternalLink className="w-4 h-4" />
                                        </a>
                                    </div>
                                )}
                            </div>
                        </div>

                        {/* Specializations */}
                        {surveyor.specialization && surveyor.specialization.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                                <div className="flex flex-wrap gap-2">
                                    {surveyor.specialization.map((spec, index) => (
                                        <span
                                            key={index}
                                            className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${orgColor === 'green'
                                                ? 'bg-green-100 text-green-800'
                                                : 'bg-blue-100 text-blue-800'
                                                }`}
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {/* Last Active */}
                        {surveyor.lastActive && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Last active: {formatLastActive(surveyor.lastActive)}</span>
                            </div>
                        )}

                        {/* Contact Actions */}
                        {showContactActions && (
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                                <button className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${orgColor === 'green'
                                    ? 'bg-green-600 text-white hover:bg-green-700'
                                    : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}>
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Contact Surveyor</span>
                                </button>
                                <button className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors">
                                    <Calendar className="w-4 h-4" />
                                    <span>Schedule Meeting</span>
                                </button>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Surveyor Assigned</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            A {surveyor.organization} surveyor will be assigned to your property survey soon.
                        </p>
                        <div className="inline-flex items-center px-3 py-2 bg-gray-100 rounded-lg text-sm text-gray-600">
                            <Clock className="w-4 h-4 mr-2" />
                            Awaiting assignment
                        </div>
                    </div>
                )}
            </div>
        );
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Surveyor Contacts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Contact information for your assigned surveyors from both organizations
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">AMMC</span>
                    </div>
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-blue-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">NIA</span>
                    </div>
                </div>
            </div>

            {/* Assignment Status Summary */}
            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Assignment Status</p>
                            <p className="text-xs text-gray-600">
                                {assignmentStatus === 'unassigned' && 'No surveyors assigned yet'}
                                {assignmentStatus === 'partially_assigned' && 'One surveyor assigned, waiting for second'}
                                {assignmentStatus === 'fully_assigned' && 'Both surveyors assigned'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                            {assignmentStatus === 'unassigned' && '0/2'}
                            {assignmentStatus === 'partially_assigned' && '1/2'}
                            {assignmentStatus === 'fully_assigned' && '2/2'}
                        </p>
                        <p className="text-xs text-gray-600">Assigned</p>
                    </div>
                </div>
            </div>

            {/* Surveyor Cards */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                {/* AMMC Surveyor Card */}
                <SurveyorCard
                    surveyor={ammcSurveyor || {
                        name: '',
                        email: '',
                        phone: '',
                        organization: 'AMMC'
                    }}
                    isAssigned={!!ammcSurveyor}
                />

                {/* NIA Surveyor Card */}
                <SurveyorCard
                    surveyor={niaSurveyor || {
                        name: '',
                        email: '',
                        phone: '',
                        organization: 'NIA'
                    }}
                    isAssigned={!!niaSurveyor}
                />
            </div>

            {/* Coordination Tips */}
            {(ammcSurveyor || niaSurveyor) && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Coordination Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Both surveyors will coordinate to avoid scheduling conflicts</li>
                                <li>• You may be contacted by either surveyor to arrange property access</li>
                                <li>• Each surveyor will conduct an independent assessment</li>
                                <li>• Final report will combine findings from both organizations</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

            {/* Admin Contacts Section */}
            {showAdminContacts && (
                <div className="mt-8">
                    <AdminContactDisplay
                        showContactActions={showContactActions}
                        showConflictRaiseButton={false}
                    />
                </div>
            )}
        </div>
    );
};

export default SurveyorContactsDisplay;