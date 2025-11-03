"use client";
import React from 'react';
import ContactManagementHub from './ContactManagementHub';

// Example usage component showing how to use the contact management system
const ContactsExample: React.FC = () => {
    // Example data - in real app this would come from API/props
    const exampleAMMCSurveyor = {
        name: 'John Adebayo',
        email: 'j.adebayo@ammc.gov.ng',
        phone: '+234-803-123-4567',
        organization: 'AMMC' as const,
        licenseNumber: 'AMMC-2024-001',
        specialization: ['residential', 'commercial'],
        experience: 8,
        rating: 4.7,
        lastActive: new Date().toISOString()
    };

    const exampleNIASurveyor = {
        name: 'Sarah Okafor',
        email: 's.okafor@nia.org.ng',
        phone: '+234-807-987-6543',
        organization: 'NIA' as const,
        licenseNumber: 'NIA-2024-045',
        specialization: ['structural', 'valuation'],
        experience: 12,
        rating: 4.9,
        lastActive: new Date(Date.now() - 2 * 60 * 60 * 1000).toISOString() // 2 hours ago
    };

    const exampleAMMCAdmin = {
        name: 'Dr. Michael Okonkwo',
        email: 'admin@ammc.gov.ng',
        phone: '+234-9-234-5678',
        organization: 'AMMC' as const,
        title: 'Survey Department Administrator',
        department: 'Property Assessment Division',
        officeHours: 'Mon-Fri 8:00 AM - 5:00 PM'
    };

    const exampleNIAAdmin = {
        name: 'Mrs. Fatima Abdullahi',
        email: 'admin@nia.org.ng',
        phone: '+234-9-876-5432',
        organization: 'NIA' as const,
        title: 'Survey Operations Manager',
        department: 'Insurance Assessment Division',
        officeHours: 'Mon-Fri 9:00 AM - 6:00 PM',
        emergencyContact: true
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <ContactManagementHub
                    ammcSurveyor={exampleAMMCSurveyor}
                    niaSurveyor={exampleNIASurveyor}
                    assignmentStatus="fully_assigned"
                    ammcAdmin={exampleAMMCAdmin}
                    niaAdmin={exampleNIAAdmin}
                    policyId="POL-2024-001"
                    mergedReportId="MR-2024-001"
                    hasConflicts={true}
                    showContactActions={true}
                    defaultExpandedSection="both"
                />
            </div>
        </div>
    );
};

export default ContactsExample;