'use client';

import React, { useState } from 'react';
import PaymentDecisionDisplay from './PaymentDecisionDisplay';
import ConflictRaiseInterface, { ConflictInquirySubmitData } from './ConflictRaiseInterface';
import PolicyEditInterface from './PolicyEditInterface';

interface EnhancedPaymentDecisionHubProps {
    policyId: string;
    reportId?: string;
    className?: string;
}

const EnhancedPaymentDecisionHub: React.FC<EnhancedPaymentDecisionHubProps> = ({
    policyId,
    reportId,
    className = ''
}) => {
    const [showConflictInterface, setShowConflictInterface] = useState(false);
    const [showEditInterface, setShowEditInterface] = useState(false);
    // Context states are not currently used since handlers don't accept parameters
    // These could be populated from PaymentDecisionDisplay if needed in the future

    const handleRaiseConflict = () => {
        setShowConflictInterface(true);
    };

    const handleEditPolicy = () => {
        setShowEditInterface(true);
    };

    const handleConflictSubmitted = (data: ConflictInquirySubmitData) => {
        setShowConflictInterface(false);
        // Optionally refresh the payment decision display
    };

    const handlePolicyUpdated = () => {
        setShowEditInterface(false);
        // Optionally refresh the payment decision display or redirect
        window.location.reload(); // Simple refresh for now
    };

    return (
        <div className={className}>
            <PaymentDecisionDisplay
                policyId={policyId}
                reportId={reportId}
                onEditPolicy={handleEditPolicy}
                onRaiseConflict={handleRaiseConflict}
            />

            <ConflictRaiseInterface
                policyId={policyId}
                reportId={reportId}
                isOpen={showConflictInterface}
                onClose={() => setShowConflictInterface(false)}
                onSubmit={handleConflictSubmitted}
                conflictContext={undefined}
            />

            <PolicyEditInterface
                policyId={policyId}
                isOpen={showEditInterface}
                onClose={() => setShowEditInterface(false)}
                onUpdate={handlePolicyUpdated}
                rejectionReasons={undefined}
                requiredActions={undefined}
                conflictContext={undefined}
            />
        </div>
    );
};

export default EnhancedPaymentDecisionHub;