"use client";
import React, { useState, useEffect } from 'react';
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    Clock,
    CreditCard,
    FileText,
    AlertCircle,
    Info,
    ExternalLink,
    RefreshCw
} from 'lucide-react';

interface PaymentDecision {
    decision: 'approve' | 'conditional' | 'reject' | 'request_more_info';
    confidence: number;
    reasoning: string[];
    conditions: string[];
    requiredActions: string[];
    reviewRequired: boolean;
    escalationLevel: string;
    decidedAt: string;
    decidedBy: string;
    isOverride?: boolean;
}

interface PaymentDecisionData {
    reportId: string;
    paymentDecision?: PaymentDecision;
    paymentEnabled: boolean;
    finalRecommendation: string;
    confidenceScore: number;
    releaseStatus: string;
}

interface PaymentDecisionDisplayProps {
    reportId: string;
    onConflictRaise?: () => void;
    className?: string;
}

const PaymentDecisionDisplay: React.FC<PaymentDecisionDisplayProps> = ({
    reportId,
    onConflictRaise,
    className = ''
}) => {
    const [decisionData, setDecisionData] = useState<PaymentDecisionData | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);

    useEffect(() => {
        fetchPaymentDecision();
    }, [reportId]);

    const fetchPaymentDecision = async () => {
        try {
            setLoading(true);
            setError(null);

            // Mock API call - replace with actual API
            const mockData: PaymentDecisionData = {
                reportId,
                paymentEnabled: true,
                finalRecommendation: 'approve',
                confidenceScore: 92,
                releaseStatus: 'approved',
                paymentDecision: {
                    decision: 'approve',
                    confidence: 92,
                    reasoning: [
                        'High confidence score with no critical conflicts',
                        'Both surveyors recommend approval',
                        'Property meets all safety requirements'
                    ],
                    conditions: [],
                    requiredActions: [],
                    reviewRequired: false,
                    escalationLevel: 'none',
                    decidedAt: new Date().toISOString(),
                    decidedBy: 'PaymentDecisionEngine'
                }
            };

            setDecisionData(mockData);
        } catch (error) {
            console.error('Failed to fetch payment decision:', error);
            setError(error instanceof Error ? error.message : 'Failed to load payment decision');
        } finally {
            setLoading(false);
        }
    };

    const getDecisionIcon = (decision: string) => {
        switch (decision) {
            case 'approve':
                return <CheckCircle className="h-6 w-6 text-green-500" />;
            case 'conditional':
                return <AlertTriangle className="h-6 w-6 text-yellow-500" />;
            case 'reject':
                return <XCircle className="h-6 w-6 text-red-500" />;
            case 'request_more_info':
                return <Clock className="h-6 w-6 text-blue-500" />;
            default:
                return <AlertCircle className="h-6 w-6 text-gray-500" />;
        }
    };

    const getDecisionColor = (decision: string) => {
        switch (decision) {
            case 'approve':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'conditional':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            case 'reject':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'request_more_info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getDecisionTitle = (decision: string) => {
        switch (decision) {
            case 'approve':
                return 'Payment Approved';
            case 'conditional':
                return 'Conditional Approval';
            case 'reject':
                return 'Payment Rejected';
            case 'request_more_info':
                return 'Additional Information Required';
            default:
                return 'Payment Decision Pending';
        }
    };

    const formatDate = (dateString: string) => {
        return new Date(dateString).toLocaleString();
    };

    if (loading) {
        return (
            <div className={`bg-white border border-gray-200 rounded-lg p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="h-6 bg-gray-300 rounded w-1/3 mb-4"></div>
                    <div className="h-4 bg-gray-300 rounded w-2/3 mb-2"></div>
                    <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-red-50 border border-red-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center">
                    <AlertCircle className="h-5 w-5 text-red-500 mr-2" />
                    <div>
                        <h3 className="text-sm font-medium text-red-800">Error Loading Payment Decision</h3>
                        <p className="text-sm text-red-600 mt-1">{error}</p>
                    </div>
                </div>
                <button
                    onClick={fetchPaymentDecision}
                    className="mt-3 flex items-center text-sm text-red-600 hover:text-red-800 transition-colors"
                >
                    <RefreshCw className="h-4 w-4 mr-1" />
                    Retry
                </button>
            </div>
        );
    }

    if (!decisionData) {
        return (
            <div className={`bg-gray-50 border border-gray-200 rounded-lg p-6 text-center ${className}`}>
                <Clock className="h-8 w-8 text-gray-400 mx-auto mb-2" />
                <p className="text-gray-600">Payment decision not available</p>
            </div>
        );
    }

    const { paymentDecision, paymentEnabled } = decisionData;

    if (!paymentDecision) {
        return (
            <div className={`bg-yellow-50 border border-yellow-200 rounded-lg p-6 ${className}`}>
                <div className="flex items-center">
                    <Clock className="h-5 w-5 text-yellow-500 mr-2" />
                    <div>
                        <h3 className="text-sm font-medium text-yellow-800">Payment Decision Pending</h3>
                        <p className="text-sm text-yellow-600 mt-1">
                            Your payment decision is being processed and will be available shortly.
                        </p>
                    </div>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white border border-gray-200 rounded-lg ${className}`}>
            <div className="p-6">
                {/* Header */}
                <div className="flex items-center justify-between mb-6">
                    <div className="flex items-center space-x-3">
                        {getDecisionIcon(paymentDecision.decision)}
                        <div>
                            <h3 className="text-lg font-semibold text-gray-900">
                                {getDecisionTitle(paymentDecision.decision)}
                            </h3>
                            <p className="text-sm text-gray-600">
                                Confidence: {paymentDecision.confidence}%
                            </p>
                        </div>
                    </div>

                    {paymentDecision.isOverride && (
                        <span className="inline-flex items-center px-2 py-1 rounded-full text-xs font-medium bg-purple-100 text-purple-800">
                            Admin Override
                        </span>
                    )}
                </div>

                {/* Decision Status */}
                <div className={`p-4 rounded-lg border ${getDecisionColor(paymentDecision.decision)} mb-6`}>
                    <div className="flex items-center justify-between">
                        <div>
                            <h4 className="font-medium">Payment Status</h4>
                            <p className="text-sm mt-1">
                                {paymentEnabled ?
                                    'Payment processing is enabled for this policy' :
                                    'Payment processing is currently disabled'
                                }
                            </p>
                        </div>
                        {paymentEnabled && (
                            <button className="flex items-center px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 transition-colors">
                                <CreditCard className="h-4 w-4 mr-2" />
                                Proceed to Payment
                            </button>
                        )}
                    </div>
                </div>

                {/* Reasoning */}
                {paymentDecision.reasoning.length > 0 && (
                    <div className="mb-6">
                        <h4 className="text-sm font-semibold text-gray-900 mb-3 flex items-center">
                            <Info className="h-4 w-4 mr-2" />
                            Decision Reasoning
                        </h4>
                        <ul className="space-y-2">
                            {paymentDecision.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-gray-700">{reason}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Conditions */}
                {paymentDecision.conditions.length > 0 && (
                    <div className="mb-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-yellow-800 mb-3 flex items-center">
                            <AlertTriangle className="h-4 w-4 mr-2" />
                            Conditions to Meet
                        </h4>
                        <ul className="space-y-2">
                            {paymentDecision.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-yellow-500 mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-yellow-700">{condition}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Required Actions */}
                {paymentDecision.requiredActions.length > 0 && (
                    <div className="mb-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                        <h4 className="text-sm font-semibold text-blue-800 mb-3 flex items-center">
                            <Clock className="h-4 w-4 mr-2" />
                            Required Actions
                        </h4>
                        <ul className="space-y-2">
                            {paymentDecision.requiredActions.map((action, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 rounded-full bg-blue-500 mt-2 flex-shrink-0"></div>
                                    <p className="text-sm text-blue-700">{action}</p>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Actions */}
                <div className="flex items-center justify-between pt-4 border-t border-gray-200">
                    <div className="text-xs text-gray-500">
                        Decision made on {formatDate(paymentDecision.decidedAt)}
                        {paymentDecision.decidedBy !== 'PaymentDecisionEngine' && (
                            <span> by {paymentDecision.decidedBy}</span>
                        )}
                    </div>

                    <div className="flex items-center space-x-3">
                        <button className="flex items-center text-sm text-blue-600 hover:text-blue-800 transition-colors">
                            <FileText className="h-4 w-4 mr-1" />
                            View Full Report
                        </button>

                        {onConflictRaise && (
                            <button
                                onClick={onConflictRaise}
                                className="flex items-center text-sm text-orange-600 hover:text-orange-800 transition-colors"
                            >
                                <AlertTriangle className="h-4 w-4 mr-1" />
                                Raise Concern
                            </button>
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
};

export default PaymentDecisionDisplay;