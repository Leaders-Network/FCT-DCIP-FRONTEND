'use client';

import React, { useState } from 'react';
import PaymentDecisionDisplay from './PaymentDecisionDisplay';
import ConflictRaiseInterface from './ConflictRaiseInterface';
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
    const [conflictContext, setConflictContext] = useState<any>(null);
    const [editContext, setEditContext] = useState<any>(null);

    const handleRaiseConflict = (context?: any) => {
        setConflictContext(context);
        setShowConflictInterface(true);
    };

    const handleEditPolicy = (context?: any) => {
        setEditContext(context);
        setShowEditInterface(true);
    };

    const handleConflictSubmitted = (inquiryId: string) => {
        console.log('Conflict inquiry submitted:', inquiryId);
        setShowConflictInterface(false);
        // Optionally refresh the payment decision display
    };

    const handlePolicyUpdated = () => {
        console.log('Policy updated successfully');
        setShowEditInterface(false);
        // Optionally refresh the payment decision display or redirect
        window.location.reload(); // Simple refresh for now
    };

    return (
        <div className={className}>
            <PaymentDecisionDisplay
                policyId={policyId}
                reportId={reportId}
                onEditPolicy={() => handleEditPolicy(editContext)}
                onRaiseConflict={() => handleRaiseConflict(conflictContext)}
            />

            <ConflictRaiseInterface
                policyId={policyId}
                reportId={reportId}
                isOpen={showConflictInterface}
                onClose={() => setShowConflictInterface(false)}
                onSubmit={handleConflictSubmitted}
                conflictContext={conflictContext}
            />

            <PolicyEditInterface
                policyId={policyId}
                isOpen={showEditInterface}
                onClose={() => setShowEditInterface(false)}
                onUpdate={handlePolicyUpdated}
                rejectionReasons={editContext?.rejectionReasons}
                requiredActions={editContext?.requiredActions}
                conflictContext={editContext?.conflictContext}
            />
        </div>
    );
};

export default EnhancedPaymentDecisionHub;