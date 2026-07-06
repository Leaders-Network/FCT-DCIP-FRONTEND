"use client";
import React, { useState, useEffect } from 'react';
import ContactManagementHub from '@/components/dashboard/ContactManagementHub';
import { Sparkles, Users } from 'lucide-react';
import { ContactData, ConflictInquiryData, AdminContactInfo, SurveyorContactInfo } from '@/types/api.types';
import { getAuthToken } from '@/utils/auth';
import { toast } from "sonner";
import type { BuilderLiabilityPolicy, AssignedSurveyorContact } from '@/types/builderLiabilityPolicy.types';

const DEFAULT_AMMC_ADMIN: AdminContactInfo = {
    name: 'Engr Dotun Sasore',
    email: 'dsasore@gmail.com',
    phone: '+234 806 006 0826',
    organization: 'AMMC',
    title: 'Survey Department Administrator',
    department: 'Property Assessment Division',
    officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
};

const createDefaultContactData = (overrides: Partial<ContactData> = {}): ContactData => ({
    ammcSurveyor: null,
    niaSurveyor: null,
    assignmentStatus: 'unassigned',
    ammcAdmin: DEFAULT_AMMC_ADMIN,
    niaAdmin: null,
    policyId: null,
    mergedReportId: null,
    hasConflicts: false,
    ...overrides
});

const mapSurveyorContact = (contact: AssignedSurveyorContact): SurveyorContactInfo => ({
    name: contact.name,
    email: contact.email,
    phone: contact.phone,
    organization: contact.organization,
    licenseNumber: contact.licenseNumber,
    specialization: contact.specialization,
    experience: contact.experience,
    rating: contact.rating,
    lastActive: contact.assignedAt ? new Date(contact.assignedAt).toISOString() : new Date().toISOString()
});

const buildContactDataFromPolicy = (policy: BuilderLiabilityPolicy): ContactData => {
    const contacts = Array.isArray(policy.assignedSurveyorContacts) ? policy.assignedSurveyorContacts : [];
    const ammcSurveyorContact = contacts.find((contact) => contact.organization === 'AMMC') || null;
    const niaSurveyorContact = contacts.find((contact) => contact.organization === 'NIA') || null;
    const fallbackContact = contacts.find(Boolean) || null;
    const contactCount = [ammcSurveyorContact, niaSurveyorContact].filter(Boolean).length;
    const assignmentStatus =
        contactCount === 0
            ? 'unassigned'
            : contactCount === 1
                ? 'partially_assigned'
                : 'fully_assigned';

    return createDefaultContactData({
        ammcSurveyor: ammcSurveyorContact
            ? mapSurveyorContact(ammcSurveyorContact)
            : fallbackContact && fallbackContact.organization !== 'NIA'
                ? mapSurveyorContact(fallbackContact)
                : null,
        niaSurveyor: null,
        assignmentStatus: ammcSurveyorContact || fallbackContact ? 'fully_assigned' : assignmentStatus,
        policyId: policy._id,
        mergedReportId: null,
        hasConflicts: policy.status === 'surveyed'
    });
};

const ContactsPage: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData>(createDefaultContactData());
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                setLoading(true);

                // Get user's latest policy to determine contact information
                const token = getAuthToken('user');
                if (!token) {
                    setLoading(false);
                    return;
                }

                const { builderLiabilityPolicyAPI } = await import("@/services/api");
                const policiesResponse = await builderLiabilityPolicyAPI.getUserPolicies({
                    status: 'all',
                    page: 1,
                    limit: 20
                });

                if (policiesResponse?.data?.policies?.length > 0) {
                    const policies = policiesResponse.data.policies as BuilderLiabilityPolicy[];
                    const selectedPolicy =
                        policies.find((policy) => Array.isArray(policy.assignedSurveyorContacts) && policy.assignedSurveyorContacts.length > 0) ||
                        policies[0];

                    setContactData(buildContactDataFromPolicy(selectedPolicy));
                } else {
                    // No policies found, show default admin contacts
                    setContactData(createDefaultContactData());
                }
            } catch (error) {
                // Set default admin contacts on error
                setContactData(createDefaultContactData());
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, []);

    const handleConflictSubmit = async (conflictData: ConflictInquiryData): Promise<void> => {
        try {

            // Here you would typically send the conflict data to your API
            // For now, we'll just log it and show a success message

            // Example API call structure:
            // const { submitConflictInquiry } = await import('@/services/api');
            // await submitConflictInquiry({
            //     policyId: contactData.policyId,
            //     mergedReportId: contactData.mergedReportId,
            //     ...conflictData
            // });

            toast.success('Conflict inquiry submitted successfully! You will receive a response within 24-48 hours.');
        } catch (error) {
            toast.error('Failed to submit conflict inquiry. Please try again or contact administrators directly.');
        }
    };

    if (loading) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
                    <p className="text-gray-600">Loading contact information...</p>
                </div>
            </div>
        );
    }

    return (
        <div className="space-y-6 px-4 py-4 sm:px-6 lg:px-8">
            <div className="relative overflow-hidden rounded-[2rem] border border-white/70 bg-gradient-to-br from-[#015a23] via-[#028835] to-emerald-500 p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.22)]">
                <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_36%)]" />
                <div className="relative flex flex-col gap-4 lg:flex-row lg:items-end lg:justify-between">
                    <div className="max-w-3xl">
                        <div className="mb-3 inline-flex items-center gap-2 rounded-full border border-white/20 bg-white/10 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.24em] text-emerald-50">
                            <Sparkles className="h-3.5 w-3.5" />
                            Contact center
                        </div>
                        <h1 className="text-2xl font-bold tracking-tight sm:text-3xl">Contact Management</h1>
                        <p className="mt-3 max-w-2xl text-sm leading-6 text-emerald-50/90 sm:text-base">
                            Manage surveyor and administrator communication in one clean, modern space.
                        </p>
                    </div>
                    <div className="flex items-center gap-3 rounded-2xl border border-white/20 bg-white/10 px-4 py-3 text-sm font-medium backdrop-blur">
                        <Users className="h-4 w-4" />
                        Support and contact workflow
                    </div>
                </div>
            </div>

            <div className="rounded-[2rem] border border-white/70 bg-white/85 p-4 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                <ContactManagementHub
                    ammcSurveyor={contactData.ammcSurveyor}
                    niaSurveyor={contactData.niaSurveyor}
                    assignmentStatus={contactData.assignmentStatus}
                    ammcAdmin={contactData.ammcAdmin}
                    niaAdmin={contactData.niaAdmin}
                    hasConflicts={contactData.hasConflicts}
                    showContactActions={true}
                    defaultExpandedSection="both"
                    onConflictSubmit={handleConflictSubmit}
                />
            </div>
        </div>
    );
};

export default ContactsPage;
