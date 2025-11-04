"use client";
import React, { useState, useEffect } from 'react';
import ContactManagementHub from '@/components/dashboard/ContactManagementHub';
import { ContactData, SurveyorContactInfo } from '@/types/api.types';

const ContactsPage: React.FC = () => {
    const [contactData, setContactData] = useState<ContactData>({
        ammcSurveyor: null,
        niaSurveyor: null,
        assignmentStatus: 'unassigned',
        ammcAdmin: null,
        niaAdmin: null,
        policyId: null,
        mergedReportId: null,
        hasConflicts: false
    });
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        const fetchContactData = async () => {
            try {
                setLoading(true);

                // Get user's latest policy to determine contact information
                const token = localStorage.getItem("token") || localStorage.getItem("authToken");
                if (!token) {
                    setLoading(false);
                    return;
                }

                const { getUserPolicyRequests } = await import("@/services/api");
                const policiesResponse = await getUserPolicyRequests('all', 1, 1);

                if (policiesResponse?.data?.policyRequests?.length > 0) {
                    const latestPolicy = policiesResponse.data.policyRequests[0];

                    // Try to get assignment information for the latest policy
                    try {
                        const { getUserAssignmentByAmmcId } = await import('@/services/api');
                        const assignmentResponse = await getUserAssignmentByAmmcId(latestPolicy._id);

                        if (assignmentResponse.success && assignmentResponse.data) {
                            const assignment = assignmentResponse.data;

                            // Mock surveyor data based on assignment
                            const mockAMMCSurveyor: SurveyorContactInfo = {
                                name: assignment.surveyorId?.firstname + ' ' + assignment.surveyorId?.lastname || 'AMMC Surveyor',
                                email: assignment.surveyorId?.email || 'surveyor@ammc.gov.ng',
                                phone: assignment.surveyorId?.phoneNumber || '+234-803-123-4567',
                                organization: 'AMMC',
                                licenseNumber: assignment.surveyorId?.licenseNumber || 'AMMC-2024-001',
                                specialization: assignment.surveyorId?.specialization || ['residential', 'commercial'],
                                experience: assignment.surveyorId?.experience || 8,
                                rating: 4.7,
                                lastActive: new Date().toISOString()
                            };

                            // For now, we'll use mock NIA surveyor data
                            const mockNIASurveyor: SurveyorContactInfo = {
                                name: 'Sarah Okafor',
                                email: 's.okafor@nia.org.ng',
                                phone: '+234-807-987-6543',
                                organization: 'NIA',
                                licenseNumber: 'NIA-2024-045',
                                specialization: ['structural', 'valuation'],
                                experience: 12,
                                rating: 4.9,
                                lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString()
                            };

                            setContactData({
                                ammcSurveyor: mockAMMCSurveyor,
                                niaSurveyor: mockNIASurveyor,
                                assignmentStatus: 'fully_assigned',
                                ammcAdmin: {
                                    name: 'Dr. Michael Okonkwo',
                                    email: 'admin@ammc.gov.ng',
                                    phone: '+234-9-234-5678',
                                    organization: 'AMMC',
                                    title: 'Survey Department Administrator',
                                    department: 'Property Assessment Division',
                                    officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
                                },
                                niaAdmin: {
                                    name: 'Mrs. Fatima Abdullahi',
                                    email: 'admin@nia.org.ng',
                                    phone: '+234-9-876-5432',
                                    organization: 'NIA',
                                    title: 'Survey Operations Manager',
                                    department: 'Insurance Assessment Division',
                                    officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
                                    emergencyContact: true
                                },
                                policyId: latestPolicy._id,
                                mergedReportId: `MR-${latestPolicy._id.substring(0, 8)}`,
                                hasConflicts: latestPolicy.status === 'surveyed' // Show conflict option for surveyed policies
                            });
                        } else {
                            // No assignment found, show default admin contacts only
                            setContactData({
                                ammcSurveyor: null,
                                niaSurveyor: null,
                                assignmentStatus: 'unassigned',
                                ammcAdmin: {
                                    name: 'Dr. Michael Okonkwo',
                                    email: 'admin@ammc.gov.ng',
                                    phone: '+234-9-234-5678',
                                    organization: 'AMMC',
                                    title: 'Survey Department Administrator',
                                    department: 'Property Assessment Division',
                                    officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
                                },
                                niaAdmin: {
                                    name: 'Mrs. Fatima Abdullahi',
                                    email: 'admin@nia.org.ng',
                                    phone: '+234-9-876-5432',
                                    organization: 'NIA',
                                    title: 'Survey Operations Manager',
                                    department: 'Insurance Assessment Division',
                                    officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
                                    emergencyContact: true
                                },
                                policyId: latestPolicy._id,
                                mergedReportId: null,
                                hasConflicts: false
                            });
                        }
                    } catch (assignmentError) {
                        console.log('No assignment found, showing admin contacts only');
                        setContactData({
                            ammcSurveyor: null,
                            niaSurveyor: null,
                            assignmentStatus: 'unassigned',
                            ammcAdmin: {
                                name: 'Dr. Michael Okonkwo',
                                email: 'admin@ammc.gov.ng',
                                phone: '+234-9-234-5678',
                                organization: 'AMMC',
                                title: 'Survey Department Administrator',
                                department: 'Property Assessment Division',
                                officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
                            },
                            niaAdmin: {
                                name: 'Mrs. Fatima Abdullahi',
                                email: 'admin@nia.org.ng',
                                phone: '+234-9-876-5432',
                                organization: 'NIA',
                                title: 'Survey Operations Manager',
                                department: 'Insurance Assessment Division',
                                officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
                                emergencyContact: true
                            },
                            policyId: latestPolicy._id,
                            mergedReportId: null,
                            hasConflicts: false
                        });
                    }
                } else {
                    // No policies found, show default admin contacts
                    setContactData({
                        ammcSurveyor: null,
                        niaSurveyor: null,
                        assignmentStatus: 'unassigned',
                        ammcAdmin: {
                            name: 'Dr. Michael Okonkwo',
                            email: 'admin@ammc.gov.ng',
                            phone: '+234-9-234-5678',
                            organization: 'AMMC',
                            title: 'Survey Department Administrator',
                            department: 'Property Assessment Division',
                            officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
                        },
                        niaAdmin: {
                            name: 'Mrs. Fatima Abdullahi',
                            email: 'admin@nia.org.ng',
                            phone: '+234-9-876-5432',
                            organization: 'NIA',
                            title: 'Survey Operations Manager',
                            department: 'Insurance Assessment Division',
                            officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
                            emergencyContact: true
                        },
                        policyId: null,
                        mergedReportId: null,
                        hasConflicts: false
                    });
                }
            } catch (error) {
                console.error('Failed to fetch contact data:', error);
                // Set default admin contacts on error
                setContactData({
                    ammcSurveyor: null,
                    niaSurveyor: null,
                    assignmentStatus: 'unassigned',
                    ammcAdmin: {
                        name: 'Dr. Michael Okonkwo',
                        email: 'admin@ammc.gov.ng',
                        phone: '+234-9-234-5678',
                        organization: 'AMMC',
                        title: 'Survey Department Administrator',
                        department: 'Property Assessment Division',
                        officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
                    },
                    niaAdmin: {
                        name: 'Mrs. Fatima Abdullahi',
                        email: 'admin@nia.org.ng',
                        phone: '+234-9-876-5432',
                        organization: 'NIA',
                        title: 'Survey Operations Manager',
                        department: 'Insurance Assessment Division',
                        officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
                        emergencyContact: true
                    },
                    policyId: null,
                    mergedReportId: null,
                    hasConflicts: false
                });
            } finally {
                setLoading(false);
            }
        };

        fetchContactData();
    }, []);

    const handleConflictSubmit = async (conflictData: Record<string, unknown>) => {
        try {
            console.log('Conflict inquiry submitted:', conflictData);

            // Here you would typically send the conflict data to your API
            // For now, we'll just log it and show a success message

            // Example API call structure:
            // const { submitConflictInquiry } = await import('@/services/api');
            // await submitConflictInquiry({
            //     policyId: contactData.policyId,
            //     mergedReportId: contactData.mergedReportId,
            //     ...conflictData
            // });

            alert('Conflict inquiry submitted successfully! You will receive a response within 24-48 hours.');
        } catch (error) {
            console.error('Failed to submit conflict inquiry:', error);
            alert('Failed to submit conflict inquiry. Please try again or contact administrators directly.');
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
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ContactManagementHub
                    ammcSurveyor={contactData.ammcSurveyor}
                    niaSurveyor={contactData.niaSurveyor}
                    assignmentStatus={contactData.assignmentStatus}
                    ammcAdmin={contactData.ammcAdmin}
                    niaAdmin={contactData.niaAdmin}
                    policyId={contactData.policyId || undefined}
                    mergedReportId={contactData.mergedReportId || undefined}
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