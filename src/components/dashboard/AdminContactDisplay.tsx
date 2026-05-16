"use client";
import React, { useState } from 'react';
import {
    Shield,
    Mail,
    Phone,
    Building2,
    ExternalLink,
    Copy,
    CheckCircle,
    MessageCircle,
    HelpCircle,
    Clock,
    AlertCircle
} from 'lucide-react';

interface AdminContact {
    name: string;
    email: string;
    phone: string;
    organization: 'AMMC' | 'NIA';
    title: string;
    department?: string;
    officeHours?: string;
    emergencyContact?: boolean;
}

interface AdminContactDisplayProps {
    ammcAdmin?: AdminContact;
    niaAdmin?: AdminContact;
    showContactActions?: boolean;
    showConflictRaiseButton?: boolean;
    onRaiseConflict?: () => void;
}

const AdminContactDisplay: React.FC<AdminContactDisplayProps> = ({
    ammcAdmin,
    niaAdmin,
    showContactActions = true,
    showConflictRaiseButton = false,
    onRaiseConflict
}) => {
    const [copiedField, setCopiedField] = useState<string | null>(null);

    const copyToClipboard = async (text: string, field: string) => {
        try {
            await navigator.clipboard.writeText(text);
            setCopiedField(field);
            setTimeout(() => setCopiedField(null), 2000);
        } catch (err) {
        }
    };

    const getOrganizationColor = (org: 'AMMC' | 'NIA') => {
        return org === 'AMMC' ? 'green' : 'blue';
    };

    const getOrganizationName = (org: 'AMMC' | 'NIA') => {
        return org === 'AMMC' ? 'Abuja Municipal Area Council' : 'Nigerian Insurers Association';
    };

    const AdminCard: React.FC<{ admin: AdminContact }> = ({ admin }) => {
        const orgColor = getOrganizationColor(admin.organization);

        return (
            <div className={`border-2 rounded-lg p-6 transition-all border-${orgColor}-200 bg-${orgColor}-50`}>
                {/* Header */}
                <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                        <div className={`p-2 rounded-lg bg-${orgColor}-100`}>
                            <Shield className={`h-6 w-6 text-${orgColor}-600`} />
                        </div>
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {admin.organization} Administrator
                            </h3>
                            <p className="text-sm text-gray-600">
                                {getOrganizationName(admin.organization)}
                            </p>
                        </div>
                    </div>
                    <div className={`inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-${orgColor}-100 text-${orgColor}-800`}>
                        Available
                    </div>
                </div>

                <div className="space-y-4">
                    {/* Admin Profile */}
                    <div className="flex items-center space-x-4">
                        <div className={`w-12 h-12 rounded-full flex items-center justify-center text-white font-bold ${orgColor === 'green' ? 'bg-green-600' : 'bg-blue-600'
                            }`}>
                            {admin.name.split(' ').map(n => n[0]).join('').toUpperCase()}
                        </div>
                        {/* <div className="flex-1">
                            <h4 className="text-lg font-medium text-gray-900">{admin.name}</h4>
                            <p className="text-sm text-gray-600">{admin.title}</p>
                            {admin.department && (
                                <p className="text-xs text-gray-500">{admin.department}</p>
                            )}
                        </div> */}
                        {admin.emergencyContact && (
                            <div className="flex items-center space-x-1">
                                <AlertCircle className="w-4 h-4 text-orange-500" />
                                <span className="text-xs font-medium text-orange-600">
                                    Emergency Contact
                                </span>
                            </div>
                        )}
                    </div>

                    {/* Contact Information */}
                    <div className="space-y-3">
                        <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                                <Mail className="w-4 h-4 text-gray-400" />
                                <span className="text-sm text-gray-900">{admin.email}</span>
                            </div>
                            {showContactActions && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => copyToClipboard(admin.email, `${admin.organization}-admin-email`)}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Copy email"
                                    >
                                        {copiedField === `${admin.organization}-admin-email` ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <a
                                        href={`mailto:${admin.email}?subject=Policy Survey Inquiry`}
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
                                <span className="text-sm text-gray-900">{admin.phone}</span>
                            </div>
                            {showContactActions && (
                                <div className="flex items-center space-x-2">
                                    <button
                                        onClick={() => copyToClipboard(admin.phone, `${admin.organization}-admin-phone`)}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Copy phone"
                                    >
                                        {copiedField === `${admin.organization}-admin-phone` ? (
                                            <CheckCircle className="w-4 h-4 text-green-500" />
                                        ) : (
                                            <Copy className="w-4 h-4" />
                                        )}
                                    </button>
                                    <a
                                        href={`tel:${admin.phone}`}
                                        className="p-1 text-gray-400 hover:text-gray-600 transition-colors"
                                        title="Call phone"
                                    >
                                        <ExternalLink className="w-4 h-4" />
                                    </a>
                                </div>
                            )}
                        </div>
                    </div>

                    {/* Office Hours */}
                    {admin.officeHours && (
                        <div className="flex items-center space-x-2 text-sm text-gray-600">
                            <Clock className="w-4 h-4" />
                            <span>Office Hours: {admin.officeHours}</span>
                        </div>
                    )}

                    {/* Contact Actions */}
                    {showContactActions && (
                        <div className="flex items-center space-x-3 pt-4 border-t border-gray-200">
                            <a
                                href={`mailto:${admin.email}?subject=Policy Survey Inquiry`}
                                className={`flex items-center space-x-2 px-3 py-2 rounded-lg text-sm font-medium transition-colors ${orgColor === 'green'
                                        ? 'bg-green-600 text-white hover:bg-green-700'
                                        : 'bg-blue-600 text-white hover:bg-blue-700'
                                    }`}
                            >
                                <MessageCircle className="w-4 h-4" />
                                <span>Email Admin</span>
                            </a>
                            <a
                                href={`tel:${admin.phone}`}
                                className="flex items-center space-x-2 px-3 py-2 border border-gray-300 rounded-lg text-sm font-medium text-gray-700 hover:bg-gray-50 transition-colors"
                            >
                                <Phone className="w-4 h-4" />
                                <span>Call Admin</span>
                            </a>
                        </div>
                    )}
                </div>
            </div>
        );
    };

    // Default admin contacts if not provided
    const defaultAMMCAdmin: AdminContact = {
        name: 'Engr Dotun Sasore',
        email: 'dsasore@gmail.com',
        phone: '+234 806 006 0826',
        organization: 'AMMC',
        title: 'Survey Department Administrator',
        department: 'Property Assessment Division',
        officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h2 className="text-xl font-bold text-gray-900">Administrator Contacts</h2>
                    <p className="text-sm text-gray-600 mt-1">
                        Contact administrators for questions, concerns, or to raise conflicts about your survey
                    </p>
                </div>
                <div className="flex items-center space-x-2">
                    <HelpCircle className="w-5 h-5 text-gray-400" />
                    <span className="text-sm text-gray-600">Need Help?</span>
                </div>
            </div>

            {/* Conflict Raise Button */}
            {showConflictRaiseButton && (
                <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-start space-x-3">
                            <AlertCircle className="w-5 h-5 text-orange-600 mt-0.5" />
                            <div>
                                <h4 className="text-sm font-medium text-orange-900 mb-1">
                                    Have concerns about your survey report?
                                </h4>
                                <p className="text-sm text-orange-800">
                                    If you disagree with findings or need clarification, you can raise a conflict and contact administrators directly.
                                </p>
                            </div>
                        </div>
                        <button
                            onClick={onRaiseConflict}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors text-sm font-medium"
                        >
                            <AlertCircle className="w-4 h-4" />
                            <span>Raise Conflict</span>
                        </button>
                    </div>
                </div>
            )}

            {/* Admin Cards */}
            <div className="grid grid-cols-1 gap-6">
                <AdminCard admin={ammcAdmin || defaultAMMCAdmin} />
            </div>

            {/* Contact Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <HelpCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-2">When to Contact Administrators</h4>
                        <ul className="text-sm text-blue-800 space-y-1">
                            <li>• Questions about survey findings or recommendations</li>
                            <li>• Concerns about surveyor conduct or professionalism</li>
                            <li>• Disagreements with survey conclusions</li>
                            <li>• Technical issues with the survey process</li>
                            <li>• Requests for survey re-evaluation or clarification</li>
                        </ul>
                    </div>
                </div>
            </div>

            {/* Response Time Information */}
            <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        <Clock className="w-5 h-5 text-gray-600" />
                        <div>
                            <p className="text-sm font-medium text-gray-900">Expected Response Times</p>
                            <p className="text-xs text-gray-600">
                                Email inquiries: 24-48 hours | Phone calls: During office hours | Urgent matters: Same day
                            </p>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default AdminContactDisplay;
