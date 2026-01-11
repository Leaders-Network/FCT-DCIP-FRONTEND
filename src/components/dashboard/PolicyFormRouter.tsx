"use client";

import React, { useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Building, Home, ArrowLeft } from 'lucide-react';
import { BuilderLiabilityPolicyForm } from '@/components/builderLiability/PolicyForm';
// DEPRECATED: Legacy property insurance form - keeping for backward compatibility only
// import PolicyRequestForm from '@/components/dashboard/PolicyRequestForm';
import { CreatePolicyRequestData } from '@/types/api.types';

interface PolicyFormRouterProps {
    isOpen?: boolean;
    onClose: () => void;
    onSubmitPropertyPolicy?: (data: CreatePolicyRequestData) => Promise<void>;
    property?: unknown;
    defaultPolicyType?: 'builder-liability' | 'property' | null;
}

export const PolicyFormRouter: React.FC<PolicyFormRouterProps> = ({
    isOpen = false,
    onClose,
    onSubmitPropertyPolicy,
    property,
    defaultPolicyType = null
}) => {
    const [selectedPolicyType, setSelectedPolicyType] = useState<'builder-liability' | 'property' | null>(defaultPolicyType);

    if (!isOpen) return null;

    const handleBack = () => {
        setSelectedPolicyType(null);
    };

    const handleBuilderLiabilitySuccess = (policyId: string) => {
        alert('Builder Liability Policy application submitted successfully!');
        onClose();
        setSelectedPolicyType(null);
    };

    const handleBuilderLiabilityCancel = () => {
        setSelectedPolicyType(null);
    };

    // Always show Builder Liability Policy form - no more property insurance option
    if (selectedPolicyType === 'builder-liability' || defaultPolicyType === 'builder-liability') {
        return (
            <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
                <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                    <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                        <div className="flex items-center space-x-4">
                            <Button variant="outline" size="sm" onClick={handleBack}>
                                <ArrowLeft className="w-4 h-4 mr-2" />
                                Back
                            </Button>
                            <h2 className="text-xl font-bold">Builder Liability Policy Application</h2>
                        </div>
                        <Button variant="outline" size="sm" onClick={onClose}>
                            ×
                        </Button>
                    </div>
                    <div className="p-6">
                        <BuilderLiabilityPolicyForm
                            onSuccess={handleBuilderLiabilitySuccess}
                            onCancel={handleBuilderLiabilityCancel}
                        />
                    </div>
                </div>
            </div>
        );
    }

    // Show Builder Liability Policy form directly - no more policy type selection
    return (
        <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50 p-4">
            <div className="bg-white rounded-lg w-full max-w-6xl max-h-[95vh] overflow-y-auto">
                <div className="flex justify-between items-center p-6 border-b sticky top-0 bg-white z-10">
                    <h2 className="text-xl font-bold">Builder Liability Policy Application</h2>
                    <Button variant="outline" size="sm" onClick={onClose}>
                        ×
                    </Button>
                </div>
                <div className="p-6">
                    <BuilderLiabilityPolicyForm
                        onSuccess={handleBuilderLiabilitySuccess}
                        onCancel={onClose}
                    />
                </div>
            </div>
        </div>
    );
};

export default PolicyFormRouter;