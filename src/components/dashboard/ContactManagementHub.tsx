"use client";
import React, { useState } from 'react';
import {
    Users,
    Shield,
    MessageCircle,
    Phone,
    Mail,
    AlertTriangle,
    ChevronDown,
    ChevronUp
} from 'lucide-react';
import SurveyorContactsDisplay from './SurveyorContactsDisplay';
import AdminContactDisplay from './AdminContactDisplay';
import ConflictRaiseInterface from './ConflictRaiseInterface';

import { SurveyorContactInfo, AdminContactInfo } from '@/types/api.types';

interface ContactManagementHubProps {
    // Surveyor data
    ammcSurveyor?: SurveyorContactInfo | null;
    niaSurveyor?: SurveyorContactInfo | null;
    assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';

    // Admin data
    ammcAdmin?: AdminContactInfo | null;
    niaAdmin?: AdminContactInfo | null;

    // Report data for conflict raising
    policyId?: string;
    mergedReportId?: string;
    hasConflicts?: boolean;

    // Display options
    showContactActions?: boolean;
    defaultExpandedSection?: 'surveyors' | 'admins' | 'both';

    // Callbacks
    onConflictSubmit?: (conflictData: Record<string, unknown>) => void;
}

const ContactManagementHub: React.FC<ContactManagementHubProps> = ({
    ammcSurveyor,
    niaSurveyor,
    assignmentStatus,
    ammcAdmin,
    niaAdmin,
    policyId,
    mergedReportId,
    hasConflicts = false,
    showContactActions = true,
    defaultExpandedSection = 'both',
    onConflictSubmit
}) => {
    const [expandedSections, setExpandedSections] = useState({
        surveyors: defaultExpandedSection === 'surveyors' || defaultExpandedSection === 'both',
        admins: defaultExpandedSection === 'admins' || defaultExpandedSection === 'both'
    });

    const [showConflictModal, setShowConflictModal] = useState(false);

    const toggleSection = (section: 'surveyors' | 'admins') => {
        setExpandedSections(prev => ({
            ...prev,
            [section]: !prev[section]
        }));
    };

    const handleConflictSubmit = (conflictData: Record<string, unknown>) => {
        if (onConflictSubmit) {
            onConflictSubmit(conflictData);
        } else {
            console.log('Conflict submitted:', conflictData);
        }
        setShowConflictModal(false);
    };

    const getSectionIcon = (section: 'surveyors' | 'admins') => {
        return section === 'surveyors' ? Users : Shield;
    };

    const getSectionTitle = (section: 'surveyors' | 'admins') => {
        return section === 'surveyors' ? 'Surveyor Contacts' : 'Administrator Contacts';
    };

    const getSectionDescription = (section: 'surveyors' | 'admins') => {
        return section === 'surveyors'
            ? 'Contact information for your assigned surveyors'
            : 'Contact administrators for questions or concerns';
    };

    const getSectionCount = (section: 'surveyors' | 'admins') => {
        if (section === 'surveyors') {
            let count = 0;
            if (ammcSurveyor) count++;
            if (niaSurveyor) count++;
            return `${count}/2 assigned`;
        } else {
            return 'Available 24/7';
        }
    };

    return (
        <div className="space-y-6">
            {/* Header */}
            <div className="flex items-center justify-between">
                <div>
                    <h1 className="text-2xl font-bold text-gray-900">Contact Management</h1>
                    <p className="text-sm text-gray-600 mt-1">
                        Manage communication with surveyors and administrators
                    </p>
                </div>

                {/* Quick Actions */}
                <div className="flex items-center space-x-3">
                    {hasConflicts && (
                        <button
                            onClick={() => setShowConflictModal(true)}
                            className="flex items-center space-x-2 px-4 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 transition-colors"
                        >
                            <AlertTriangle className="w-4 h-4" />
                            <span>Raise Conflict</span>
                        </button>
                    )}

                    <div className="flex items-center space-x-2 text-sm text-gray-600">
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                            <span>AMMC</span>
                        </div>
                        <div className="flex items-center space-x-1">
                            <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                            <span>NIA</span>
                        </div>
                    </div>
                </div>
            </div>

            {/* Contact Sections */}
            <div className="space-y-4">
                {/* Surveyor Contacts Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('surveyors')}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <Users className="w-5 h-5 text-gray-600" />
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {getSectionTitle('surveyors')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {getSectionDescription('surveyors')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                                {getSectionCount('surveyors')}
                            </span>
                            {expandedSections.surveyors ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {expandedSections.surveyors && (
                        <div className="p-6 border-t border-gray-200">
                            <SurveyorContactsDisplay
                                ammcSurveyor={ammcSurveyor}
                                niaSurveyor={niaSurveyor}
                                assignmentStatus={assignmentStatus}
                                showContactActions={showContactActions}
                            />
                        </div>
                    )}
                </div>

                {/* Admin Contacts Section */}
                <div className="border border-gray-200 rounded-lg overflow-hidden">
                    <button
                        onClick={() => toggleSection('admins')}
                        className="w-full px-6 py-4 bg-gray-50 hover:bg-gray-100 transition-colors flex items-center justify-between"
                    >
                        <div className="flex items-center space-x-3">
                            <Shield className="w-5 h-5 text-gray-600" />
                            <div className="text-left">
                                <h3 className="text-lg font-semibold text-gray-900">
                                    {getSectionTitle('admins')}
                                </h3>
                                <p className="text-sm text-gray-600">
                                    {getSectionDescription('admins')}
                                </p>
                            </div>
                        </div>
                        <div className="flex items-center space-x-3">
                            <span className="text-sm font-medium text-gray-700">
                                {getSectionCount('admins')}
                            </span>
                            {expandedSections.admins ? (
                                <ChevronUp className="w-5 h-5 text-gray-400" />
                            ) : (
                                <ChevronDown className="w-5 h-5 text-gray-400" />
                            )}
                        </div>
                    </button>

                    {expandedSections.admins && (
                        <div className="p-6 border-t border-gray-200">
                            <AdminContactDisplay
                                ammcAdmin={ammcAdmin}
                                niaAdmin={niaAdmin}
                                showContactActions={showContactActions}
                                showConflictRaiseButton={true}
                                onRaiseConflict={() => setShowConflictModal(true)}
                            />
                        </div>
                    )}
                </div>
            </div>

            {/* Emergency Contact Banner */}
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                <div className="flex items-center space-x-3">
                    <AlertTriangle className="w-5 h-5 text-red-600" />
                    <div>
                        <h4 className="text-sm font-medium text-red-900">Emergency Contact</h4>
                        <p className="text-sm text-red-800">
                            For urgent issues outside office hours, call the emergency hotline:
                            <a href="tel:+234-9-911-0000" className="font-medium underline ml-1">
                                +234-9-911-0000
                            </a>
                        </p>
                    </div>
                </div>
            </div>

            {/* Communication Guidelines */}
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                <div className="flex items-start space-x-3">
                    <MessageCircle className="w-5 h-5 text-blue-600 mt-0.5" />
                    <div>
                        <h4 className="text-sm font-medium text-blue-900 mb-2">Communication Guidelines</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm text-blue-800">
                            <div>
                                <h5 className="font-medium mb-1">For Surveyors:</h5>
                                <ul className="space-y-1">
                                    <li>• Schedule property visits</li>
                                    <li>• Clarify survey requirements</li>
                                    <li>• Report access issues</li>
                                </ul>
                            </div>
                            <div>
                                <h5 className="font-medium mb-1">For Administrators:</h5>
                                <ul className="space-y-1">
                                    <li>• Dispute survey findings</li>
                                    <li>• Report surveyor issues</li>
                                    <li>• Request re-evaluation</li>
                                </ul>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            {/* Conflict Raise Modal */}
            <ConflictRaiseInterface
                isOpen={showConflictModal}
                onClose={() => setShowConflictModal(false)}
                policyId={policyId}
                mergedReportId={mergedReportId}
                onSubmit={handleConflictSubmit}
            />
        </div>
    );
};

export default ContactManagementHub;