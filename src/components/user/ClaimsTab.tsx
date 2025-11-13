'use client';

import React, { useState } from 'react';
import { FileText, Plus } from 'lucide-react';

interface ClaimsTabProps {
    userId: string;
}

type ViewMode = 'list' | 'submit' | 'details';

interface ClaimRequest {
    _id: string;
    referenceNumber: string;
    status: string;
    submissionDate: string;
}

const ClaimsTab: React.FC<ClaimsTabProps> = ({ userId }) => {
    const [activeView, setActiveView] = useState<ViewMode>('list');
    const [selectedClaim, setSelectedClaim] = useState<ClaimRequest | null>(null);

    const handleSubmitNewClaim = () => {
        setActiveView('submit');
        setSelectedClaim(null);
    };

    const handleViewClaimDetails = (claimId: string) => {
        // This will be implemented when we create the details component
        setActiveView('details');
    };

    const handleBackToList = () => {
        setActiveView('list');
        setSelectedClaim(null);
    };

    const handleSubmitSuccess = (claim: ClaimRequest) => {
        setActiveView('list');
        setSelectedClaim(null);
    };

    return (
        <div className="min-h-screen bg-gray-50 p-6">
            <div className="max-w-7xl mx-auto">
                {/* Header */}
                <div className="bg-white rounded-lg shadow-sm p-6 mb-6">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                            <FileText className="w-8 h-8 text-blue-600" />
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Claims</h1>
                                <p className="text-sm text-gray-600">Submit and manage your insurance claims</p>
                            </div>
                        </div>

                        {activeView === 'list' && (
                            <button
                                onClick={handleSubmitNewClaim}
                                className="flex items-center space-x-2 bg-blue-600 text-white px-4 py-2 rounded-lg hover:bg-blue-700 transition-colors"
                            >
                                <Plus className="w-5 h-5" />
                                <span>Submit New Claim</span>
                            </button>
                        )}
                    </div>
                </div>

                {/* Content Area */}
                <div className="bg-white rounded-lg shadow-sm p-6">
                    {activeView === 'list' && (
                        <div>
                            <p className="text-gray-600">Claims list will be displayed here</p>
                            {/* ClaimsList component will be rendered here */}
                        </div>
                    )}

                    {activeView === 'submit' && (
                        <div>
                            <button
                                onClick={handleBackToList}
                                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                                <span>← Back to Claims</span>
                            </button>
                            <p className="text-gray-600">Claim submission form will be displayed here</p>
                            {/* ClaimSubmissionForm component will be rendered here */}
                        </div>
                    )}

                    {activeView === 'details' && selectedClaim && (
                        <div>
                            <button
                                onClick={handleBackToList}
                                className="mb-4 text-blue-600 hover:text-blue-700 flex items-center space-x-1"
                            >
                                <span>← Back to Claims</span>
                            </button>
                            <p className="text-gray-600">Claim details will be displayed here</p>
                            {/* ClaimDetailsModal component will be rendered here */}
                        </div>
                    )}
                </div>
            </div>
        </div>
    );
};

export default ClaimsTab;
