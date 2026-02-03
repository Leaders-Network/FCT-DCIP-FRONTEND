"use client";
import React, { useState } from 'react';
import { CreditCard, CheckCircle, XCircle, Clock } from 'lucide-react';
import { toast } from "sonner";

interface TestResult {
    success: boolean;
    data?: {
        policyId: string;
        oldStatus: string;
        newStatus: string;
        paymentStatus: string;
        transactionId: string;
    };
    error?: string;
    status: 'payment_approved' | 'payment_rejected';
}

export default function TestPaymentPage() {
    const [policyId, setPolicyId] = useState('');
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState<TestResult | null>(null);

    const testPaymentWebhook = async (status: 'payment_approved' | 'payment_rejected') => {
        if (!policyId.trim()) {
            toast.error('Please enter a Policy ID');
            return;
        }

        setLoading(true);
        setResult(null);

        try {
            const response = await fetch(`http://localhost:5000/api/v1/admin/enforcement/webhook/test/${policyId}?status=${status}`);
            const data = await response.json();

            setResult({
                success: response.ok,
                data: data,
                status: status
            });
        } catch (error) {
            const errorMessage = error instanceof Error ? error.message : String(error);
            setResult({
                success: false,
                error: errorMessage,
                status: status
            });
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="min-h-screen bg-gray-50 py-8">
            <div className="max-w-4xl mx-auto px-4">
                <div className="bg-white rounded-lg shadow-sm border border-gray-200 p-6">
                    <div className="mb-6">
                        <h1 className="text-2xl font-bold text-gray-900 mb-2">Payment Webhook Test</h1>
                        <p className="text-gray-600">
                            Test the new payment verification workflow by simulating payment webhook calls.
                        </p>
                    </div>

                    <div className="space-y-6">
                        {/* Policy ID Input */}
                        <div>
                            <label className="block text-sm font-medium text-gray-700 mb-2">
                                Policy ID
                            </label>
                            <input
                                type="text"
                                value={policyId}
                                onChange={(e) => setPolicyId(e.target.value)}
                                placeholder="Enter a policy ID (must be in 'approved' status)"
                                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                            />
                            <p className="text-xs text-gray-500 mt-1">
                                The policy must be in "approved" status for the webhook to work
                            </p>
                        </div>

                        {/* Action Buttons */}
                        <div className="flex space-x-4">
                            <button
                                onClick={() => testPaymentWebhook('payment_approved')}
                                disabled={loading}
                                className="flex items-center px-6 py-3 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <CheckCircle className="w-5 h-5 mr-2" />
                                {loading ? 'Processing...' : 'Simulate Payment Approved'}
                            </button>

                            <button
                                onClick={() => testPaymentWebhook('payment_rejected')}
                                disabled={loading}
                                className="flex items-center px-6 py-3 bg-red-600 text-white rounded-lg hover:bg-red-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                            >
                                <XCircle className="w-5 h-5 mr-2" />
                                {loading ? 'Processing...' : 'Simulate Payment Rejected'}
                            </button>
                        </div>

                        {/* Loading State */}
                        {loading && (
                            <div className="flex items-center justify-center py-8">
                                <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
                                <span className="ml-3 text-gray-600">Processing webhook...</span>
                            </div>
                        )}

                        {/* Results */}
                        {result && (
                            <div className={`p-4 rounded-lg border ${result.success
                                ? 'bg-green-50 border-green-200'
                                : 'bg-red-50 border-red-200'
                                }`}>
                                <div className="flex items-center mb-3">
                                    {result.success ? (
                                        <CheckCircle className="w-5 h-5 text-green-600 mr-2" />
                                    ) : (
                                        <XCircle className="w-5 h-5 text-red-600 mr-2" />
                                    )}
                                    <h3 className={`font-medium ${result.success ? 'text-green-800' : 'text-red-800'
                                        }`}>
                                        {result.success ? 'Webhook Processed Successfully' : 'Webhook Failed'}
                                    </h3>
                                </div>

                                <div className="bg-white p-3 rounded border">
                                    <pre className="text-sm text-gray-700 whitespace-pre-wrap">
                                        {JSON.stringify(result.data || result.error, null, 2)}
                                    </pre>
                                </div>

                                {result.success && result.data && (
                                    <div className="mt-4 p-3 bg-blue-50 border border-blue-200 rounded">
                                        <h4 className="font-medium text-blue-800 mb-2">Status Change Summary:</h4>
                                        <div className="text-sm text-blue-700">
                                            <p><strong>Policy ID:</strong> {result.data.policyId}</p>
                                            <p><strong>Old Status:</strong> {result.data.oldStatus}</p>
                                            <p><strong>New Status:</strong> {result.data.newStatus}</p>
                                            <p><strong>Payment Status:</strong> {result.data.paymentStatus}</p>
                                            <p><strong>Transaction ID:</strong> {result.data.transactionId}</p>
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Workflow Explanation */}
                        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                            <h3 className="font-medium text-blue-800 mb-3">New Payment Verification Workflow:</h3>
                            <div className="space-y-2 text-sm text-blue-700">
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">1</div>
                                    <span>Underwriting Decision: If rejected, payment is disabled</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">2</div>
                                    <span>If approved, backend automatically triggers payment request to external service</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-blue-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">3</div>
                                    <span>External payment service processes payment and sends webhook to /admin/enforcement/webhook</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-green-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                                    <span>If payment_approved: Policy status → "completed" (appears in Completed tab)</span>
                                </div>
                                <div className="flex items-center">
                                    <div className="w-6 h-6 bg-red-600 text-white rounded-full flex items-center justify-center text-xs font-bold mr-3">4</div>
                                    <span>If payment_rejected: Policy status → "payment_pending" (remains in In Progress tab)</span>
                                </div>
                            </div>
                        </div>

                        {/* Business Rules */}
                        <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                            <h3 className="font-medium text-yellow-800 mb-3">Important Business Rules:</h3>
                            <ul className="space-y-1 text-sm text-yellow-700">
                                <li>• A policy cannot become "Completed" until payment is confirmed via webhook</li>
                                <li>• Underwriting cannot reject a policy after payment has been approved</li>
                                <li>• Policies remain in "Under Review (Payment Pending)" until webhook confirms payment</li>
                                <li>• Only "completed" policies appear in the Completed category at /dashboard/policies</li>
                            </ul>
                        </div>
                    </div>
                </div>
            </div>
        </div>
    );
}