'use client';

import React, { useState } from 'react';
import { Plus, FileText, AlertCircle } from 'lucide-react';
import { ClaimsList } from '@/components/user/ClaimsList';
import ClaimSubmissionForm from '@/components/user/ClaimSubmissionForm';
import { useAuth } from '@/context/useAuth';
import type { ClaimRequest } from '@/types/claims';

export default function ClaimsPage() {
    const [showSubmissionForm, setShowSubmissionForm] = useState(false);
    const [refreshTrigger, setRefreshTrigger] = useState(0);
    const { user } = useAuth();

    const handleSubmissionSuccess = (claim: ClaimRequest) => {
        setShowSubmissionForm(false);
        setRefreshTrigger(prev => prev + 1); // Trigger refresh of claims list
    };

    const handleCancel = () => {
        setShowSubmissionForm(false);
    };

    if (!user) {
        return (
            <div className="min-h-screen bg-gray-50 flex items-center justify-center">
                <div className="text-center">
                    <AlertCircle className="w-12 h-12 text-red-500 mx-auto mb-4" />
                    <h2 className="text-xl font-semibold text-gray-900 mb-2">Authentication Required</h2>
                    <p className="text-gray-600">Please log in to view your claims.</p>
                </div>
            </div>
        );
    }

    return (
        <div className="min-h-screen bg-gray-50">
            {/* Header */}
            <div className="bg-white border-b border-gray-200">
                <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                    <div className="py-6">
                        <div className="flex items-center justify-between">
                            <div>
                                <h1 className="text-2xl font-bold text-gray-900">Insurance Claims</h1>
                                <p className="mt-1 text-sm text-gray-600">
                                    Manage your insurance claims for Builder Liability policies
                                </p>
                            </div>
                            {!showSubmissionForm && (
                                <button
                                    onClick={() => setShowSubmissionForm(true)}
                                    className="inline-flex items-center px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors"
                                >
                                    <Plus className="w-4 h-4 mr-2" />
                                    Submit New Claim
                                </button>
                            )}
                        </div>
                    </div>
                </div>
            </div>

            {/* Content */}
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
                {showSubmissionForm ? (
                    <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                        <ClaimSubmissionForm
                            userId={user._id}
                            onSubmitSuccess={handleSubmissionSuccess}
                            onCancel={handleCancel}
                        />
                    </div>
                ) : (
                    <div className="space-y-6">
                        {/* Claims Overview */}
                        <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                            <div className="flex items-center mb-4">
                                <FileText className="w-6 h-6 text-blue-600 mr-3" />
                                <h2 className="text-lg font-semibold text-gray-900">Your Claims</h2>
                            </div>
                            <p className="text-gray-600 mb-6">
                                View and track the status of your insurance claims. You can submit new claims for any completed Builder Liability policies.
                            </p>

                            {/* Claims List */}
                            <ClaimsList refreshTrigger={refreshTrigger} />
                        </div>

                        {/* Help Section */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-6">
                            <h3 className="text-lg font-semibold text-blue-900 mb-3">Need Help with Claims?</h3>
                            <div className="space-y-2 text-blue-800">
                                <p>• Claims can only be submitted for completed Builder Liability policies</p>
                                <p>• Provide detailed information about the incident or damage</p>
                                <p>• Upload supporting documents (photos, reports, receipts) to speed up processing</p>
                                <p>• Claims are reviewed by our broker admin team within 2-3 business days</p>
                                <p>• You'll receive notifications about claim status updates</p>
                            </div>
                        </div>
                    </div>
                )}
            </div>
        </div>
    );
}