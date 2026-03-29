"use client";
import React, { useState } from 'react';
import {
    User,
    Users,
    Mail,
    Phone,
    Building2,
    MessageCircle,
    Calendar,
    Clock,
    Award,
    ExternalLink,
    Copy,
    CheckCircle
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
    const assignedSurveyor = ammcSurveyor || niaSurveyor;

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
            console.error('Failed to copy text: ', err);
        }
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
        return (
            <div className={`border-2 rounded-lg p-6 transition-all ${isAssigned
                ? 'border-green-200 bg-green-50'
                : 'border-gray-200 bg-gray-50'
                }`}>
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg ${isAssigned ? 'bg-green-100' : 'bg-gray-100'}`}>
                            <Building2 className={`h-6 w-6 ${isAssigned ? 'text-green-600' : 'text-gray-400'}`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                AMMC Surveyor
                            </h3>
                            <p className="text-sm text-gray-600">
                                Abuja Municipal Area Council
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium ${isAssigned
                        ? 'bg-green-100 text-green-800'
                        : 'bg-gray-100 text-gray-600'
                        }`}>
                        {isAssigned ? 'Assigned' : 'Not Assigned'}
                    </div>
                </div>

                {isAssigned ? (
                    <div className="space-y-4">
                        <div className="flex items-center space-x-4">
                            <div className="w-12 h-12 rounded-full flex items-center justify-center text-white font-bold bg-green-600">
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

                        <div className="space-y-3">
                            <div className="flex items-center justify-between">
                                <div className="flex items-center space-x-3">
                                    <Mail className="w-4 h-4 text-gray-400" />
                                    <span className="text-sm text-gray-900">{surveyor.email}</span>
                                </div>
                                {showContactActions && (
                                    <div className="flex items-center space-x-2">
                                        <button
                                            onClick={() => copyToClipboard(surveyor.email, 'ammc-email')}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy email"
                                        >
                                            {copiedField === 'ammc-email' ? (
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
                                            onClick={() => copyToClipboard(surveyor.phone, 'ammc-phone')}
                                            className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                            title="Copy phone"
                                        >
                                            {copiedField === 'ammc-phone' ? (
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

                        {surveyor.specialization && surveyor.specialization.length > 0 && (
                            <div>
                                <p className="text-sm font-medium text-gray-700 mb-2">Specializations</p>
                                <div className="flex flex-wrap gap-2">
                                    {surveyor.specialization.map((spec, index) => (
                                        <span
                                            key={index}
                                            className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800"
                                        >
                                            {spec}
                                        </span>
                                    ))}
                                </div>
                            </div>
                        )}

                        {surveyor.lastActive && (
                            <div className="flex items-center space-x-2 text-sm text-gray-600">
                                <Clock className="w-4 h-4" />
                                <span>Last active: {formatLastActive(surveyor.lastActive)}</span>
                            </div>
                        )}

                        {showContactActions && (
                            <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                                <a
                                    href={`mailto:${surveyor.email}`}
                                    className="flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors bg-green-600 text-white hover:bg-green-700"
                                >
                                    <MessageCircle className="w-4 h-4" />
                                    <span>Contact Surveyor</span>
                                </a>
                                <a
                                    href={`tel:${surveyor.phone}`}
                                    className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                                >
                                    <Calendar className="w-4 h-4" />
                                    <span>Call Surveyor</span>
                                </a>
                            </div>
                        )}
                    </div>
                ) : (
                    <div className="text-center py-8">
                        <User className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                        <h4 className="text-lg font-medium text-gray-900 mb-2">No Surveyor Assigned</h4>
                        <p className="text-sm text-gray-600 mb-4">
                            An AMMC surveyor will be assigned to your property survey soon.
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
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Surveyor Contacts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Contact information for your assigned surveyor
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <div className="flex items-center space-x-2">
                        <div className="w-3 h-3 bg-green-500 rounded-full"></div>
                        <span className="text-xs text-gray-600">AMMC</span>
                    </div>
                </div>
            </div>

            <div className="bg-white border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Users className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Assignment Status</p>
                            <p className="text-xs text-gray-600">
                                {assignmentStatus === 'unassigned' && 'No surveyor assigned yet'}
                                {assignmentStatus === 'partially_assigned' && 'Surveyor assigned'}
                                {assignmentStatus === 'fully_assigned' && 'Surveyor assigned'}
                            </p>
                        </div>
                    </div>
                    <div className="text-right">
                        <p className="text-sm font-bold text-gray-900">
                            {assignmentStatus === 'unassigned' && '0/1'}
                            {assignmentStatus === 'partially_assigned' && '1/1'}
                            {assignmentStatus === 'fully_assigned' && '1/1'}
                        </p>
                        <p className="text-xs text-gray-600">Assigned</p>
                    </div>
                </div>
            </div>

            <div className="grid grid-cols-1 gap-6">
                <SurveyorCard
                    surveyor={assignedSurveyor || {
                        name: '',
                        email: '',
                        phone: '',
                        organization: 'AMMC'
                    }}
                    isAssigned={!!assignedSurveyor}
                />
            </div>

            {assignedSurveyor && (
                <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                    <div className="flex items-start space-x-3">
                        <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                        <div>
                            <h4 className="text-sm font-medium text-blue-900 mb-2">Coordination Tips</h4>
                            <ul className="text-sm text-blue-800 space-y-1">
                                <li>• Your assigned surveyor may contact you to arrange property access</li>
                                <li>• Keep your phone and email reachable during the survey window</li>
                                <li>• Share access constraints early to avoid delays</li>
                                <li>• Contact the AMMC administrator if you need clarification or support</li>
                            </ul>
                        </div>
                    </div>
                </div>
            )}

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
