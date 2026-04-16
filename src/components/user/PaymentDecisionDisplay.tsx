'use client';

import React, { useState, useEffect } from 'react';
import {
    CreditCard,
    AlertTriangle,
    CheckCircle,
    XCircle,
    Clock,
    Info,
    Edit,
    MessageSquare,
    ExternalLink,
    RefreshCw,
    FileText,
    Shield
} from 'lucide-react';

interface PaymentDecision {
    decision: 'approve' | 'reject' | 'request_more_info' | 'conditional';
    reasoning: string[];
    conditions?: string[];
    requiredActions?: string[];
    conflictRelated: boolean;
    conflictSeverity?: 'low' | 'medium' | 'high' | 'critical';
    decisionDate: string;
    reviewedBy: string;
    canProceedToInsurance: boolean;
    insuranceUrl?: string;
}

interface ConflictDetails {
    conflictType: string;
    conflictSeverity: string;
    ammcRecommendation: string;
    niaRecommendation: string;
    ammcValue?: number;
    niaValue?: number;
    discrepancyPercentage?: number;
    resolved: boolean;
    resolutionNotes?: string;
}

interface PaymentDecisionDisplayProps {
    policyId: string;
    reportId?: string;
    onEditPolicy?: () => void;
    onRaiseConflict?: () => void;
    className?: string;
}

const PaymentDecisionDisplay: React.FC<PaymentDecisionDisplayProps> = ({
    policyId,
    reportId,
    onEditPolicy,
    onRaiseConflict,
    className = ''
}) => {
    const [paymentDecision, setPaymentDecision] = useState<PaymentDecision | null>(null);
    const [conflictDetails, setConflictDetails] = useState<ConflictDetails | null>(null);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState<string | null>(null);
    const [showConflictDetails, setShowConflictDetails] = useState(false);
    const [processingInsurance, setProcessingInsurance] = useState(false);

    useEffect(() => {
        fetchPaymentDecision();
        if (reportId) {
            fetchConflictDetails();
        }
    }, [policyId, reportId]);

    const fetchPaymentDecision = async () => {
        try {
            const response = await fetch(`/api/v1/payment-decision/${policyId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (!response.ok) {
                throw new Error('Failed to fetch payment decision');
            }

            const data = await response.json();
            setPaymentDecision(data.data);
        } catch (err) {
            setError(err instanceof Error ? err.message : 'Unknown error');
        } finally {
            setLoading(false);
        }
    };

    const fetchConflictDetails = async () => {
        if (!reportId) return;

        try {
            const response = await fetch(`/api/v1/report-release/report/${reportId}`, {
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`
                }
            });

            if (response.ok) {
                const data = await response.json();
                if (data.data.conflictDetected && data.data.conflictDetails) {
                    setConflictDetails({
                        ...data.data.conflictDetails,
                        resolved: data.data.conflictResolved
                    });
                }
            }
        } catch (err) {
        }
    };

    const handleProceedToInsurance = async () => {
        if (!paymentDecision?.canProceedToInsurance) return;

        setProcessingInsurance(true);

        try {
            // Log the insurance initiation
            await fetch(`/api/v1/payment-decision/${policyId}/insurance-initiated`, {
                method: 'POST',
                headers: {
                    'Authorization': `Bearer ${localStorage.getItem('token')}`,
                    'Content-Type': 'application/json'
                }
            });

            // Redirect to insurance platform
            const insuranceUrl = paymentDecision.insuranceUrl || 'http://buildersuat.niip.ng/';
            window.open(insuranceUrl, '_blank');

        } catch (err) {
            // Still proceed to insurance even if logging fails
            const insuranceUrl = paymentDecision?.insuranceUrl || 'http://buildersuat.niip.ng/';
            window.open(insuranceUrl, '_blank');
        } finally {
            setProcessingInsurance(false);
        }
    };

    const getDecisionIcon = (decision: string) => {
        switch (decision) {
            case 'approve':
                return <CheckCircle className="w-6 h-6 text-green-500" />;
            case 'reject':
                return <XCircle className="w-6 h-6 text-red-500" />;
            case 'request_more_info':
                return <Info className="w-6 h-6 text-blue-500" />;
            case 'conditional':
                return <AlertTriangle className="w-6 h-6 text-yellow-500" />;
            default:
                return <Clock className="w-6 h-6 text-gray-500" />;
        }
    };

    const getDecisionColor = (decision: string) => {
        switch (decision) {
            case 'approve':
                return 'bg-green-50 border-green-200 text-green-800';
            case 'reject':
                return 'bg-red-50 border-red-200 text-red-800';
            case 'request_more_info':
                return 'bg-blue-50 border-blue-200 text-blue-800';
            case 'conditional':
                return 'bg-yellow-50 border-yellow-200 text-yellow-800';
            default:
                return 'bg-gray-50 border-gray-200 text-gray-800';
        }
    };

    const getDecisionTitle = (decision: string) => {
        switch (decision) {
            case 'approve':
                return 'Insurance Approved';
            case 'reject':
                return 'Insurance Rejected';
            case 'request_more_info':
                return 'Additional Information Required';
            case 'conditional':
                return 'Conditional Approval';
            default:
                return 'Decision Pending';
        }
    };

    const getSeverityColor = (severity: string) => {
        switch (severity) {
            case 'critical':
                return 'bg-red-100 text-red-800';
            case 'high':
                return 'bg-orange-100 text-orange-800';
            case 'medium':
                return 'bg-yellow-100 text-yellow-800';
            case 'low':
                return 'bg-green-100 text-green-800';
            default:
                return 'bg-gray-100 text-gray-800';
        }
    };

    if (loading) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
                <div className="animate-pulse">
                    <div className="flex items-center space-x-3 mb-4">
                        <div className="w-6 h-6 bg-gray-300 rounded"></div>
                        <div className="h-5 bg-gray-300 rounded w-1/3"></div>
                    </div>
                    <div className="space-y-3">
                        <div className="h-4 bg-gray-300 rounded w-3/4"></div>
                        <div className="h-4 bg-gray-300 rounded w-1/2"></div>
                        <div className="h-10 bg-gray-300 rounded w-1/4"></div>
                    </div>
                </div>
            </div>
        );
    }

    if (error) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
                <div className="flex items-center space-x-3 text-red-600 mb-4">
                    <AlertTriangle className="w-6 h-6" />
                    <span className="font-medium">Error Loading Decision</span>
                </div>
                <p className="text-sm text-gray-600 mb-4">{error}</p>
                <button
                    onClick={fetchPaymentDecision}
                    className="inline-flex items-center space-x-2 text-sm text-blue-600 hover:text-blue-800"
                >
                    <RefreshCw className="w-4 h-4" />
                    <span>Try Again</span>
                </button>
            </div>
        );
    }

    if (!paymentDecision) {
        return (
            <div className={`bg-white rounded-lg shadow-sm border p-6 ${className}`}>
                <div className="text-center py-8">
                    <Clock className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">Decision Pending</h3>
                    <p className="text-gray-600">
                        Your insurance decision is being processed. You'll be notified once it's ready.
                    </p>
                </div>
            </div>
        );
    }

    return (
        <div className={`bg-white rounded-lg shadow-sm border ${className}`}>
            {/* Header */}
            <div className={`p-6 border-b ${getDecisionColor(paymentDecision.decision)}`}>
                <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                        {getDecisionIcon(paymentDecision.decision)}
                        <div>
                            <h3 className="text-lg font-semibold">
                                {getDecisionTitle(paymentDecision.decision)}
                            </h3>
                            <p className="text-sm opacity-75">
                                Decision made on {new Date(paymentDecision.decisionDate).toLocaleDateString()}
                            </p>
                        </div>
                    </div>

                    {paymentDecision.canProceedToInsurance && (
                        <button
                            onClick={handleProceedToInsurance}
                            disabled={processingInsurance}
                            className="inline-flex items-center space-x-2 px-4 py-2 bg-green-600 text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed"
                        >
                            {processingInsurance ? (
                                <RefreshCw className="w-4 h-4 animate-spin" />
                            ) : (
                                <Shield className="w-4 h-4" />
                            )}
                            <span>{processingInsurance ? 'Processing...' : 'Proceed to Insure'}</span>
                            <ExternalLink className="w-4 h-4" />
                        </button>
                    )}
                </div>
            </div>

            {/* Decision Details */}
            <div className="p-6 space-y-6">
                {/* Reasoning */}
                {paymentDecision.reasoning.length > 0 && (
                    <div>
                        <h4 className="font-medium text-gray-900 mb-3">Decision Reasoning</h4>
                        <ul className="space-y-2">
                            {paymentDecision.reasoning.map((reason, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-gray-400 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-gray-700">{reason}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Conditions (for conditional approval) */}
                {paymentDecision.conditions && paymentDecision.conditions.length > 0 && (
                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4">
                        <h4 className="font-medium text-yellow-800 mb-3 flex items-center">
                            <AlertTriangle className="w-4 h-4 mr-2" />
                            Conditions for Approval
                        </h4>
                        <ul className="space-y-2">
                            {paymentDecision.conditions.map((condition, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-yellow-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-yellow-800">{condition}</span>
                                </li>
                            ))}
                        </ul>
                    </div>
                )}

                {/* Required Actions (for request_more_info) */}
                {paymentDecision.requiredActions && paymentDecision.requiredActions.length > 0 && (
                    <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
                        <h4 className="font-medium text-blue-800 mb-3 flex items-center">
                            <Info className="w-4 h-4 mr-2" />
                            Required Actions
                        </h4>
                        <ul className="space-y-2 mb-4">
                            {paymentDecision.requiredActions.map((action, index) => (
                                <li key={index} className="flex items-start space-x-2">
                                    <div className="w-1.5 h-1.5 bg-blue-600 rounded-full mt-2 flex-shrink-0"></div>
                                    <span className="text-sm text-blue-800">{action}</span>
                                </li>
                            ))}
                        </ul>

                        {onEditPolicy && (
                            <button
                                onClick={onEditPolicy}
                                className="inline-flex items-center space-x-2 px-3 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 text-sm"
                            >
                                <Edit className="w-4 h-4" />
                                <span>Edit & Resubmit Policy</span>
                            </button>
                        )}
                    </div>
                )}

                {/* Conflict Information */}
                {paymentDecision.conflictRelated && conflictDetails && (
                    <div className="bg-orange-50 border border-orange-200 rounded-lg p-4">
                        <div className="flex items-center justify-between mb-3">
                            <h4 className="font-medium text-orange-800 flex items-center">
                                <AlertTriangle className="w-4 h-4 mr-2" />
                                Conflict-Related Decision
                                {paymentDecision.conflictSeverity && (
                                    <span className={`ml-2 px-2 py-1 rounded-full text-xs font-medium ${getSeverityColor(paymentDecision.conflictSeverity)}`}>
                                        {paymentDecision.conflictSeverity.toUpperCase()}
                                    </span>
                                )}
                            </h4>
                            <button
                                onClick={() => setShowConflictDetails(!showConflictDetails)}
                                className="text-sm text-orange-700 hover:text-orange-900"
                            >
                                {showConflictDetails ? 'Hide Details' : 'Show Details'}
                            </button>
                        </div>

                        <p className="text-sm text-orange-800 mb-3">
                            This decision was influenced by conflicts detected between surveyor assessments.
                            {conflictDetails.resolved
                                ? ' The conflicts have been reviewed and resolved.'
                                : ' The conflicts are noted but do not prevent insurance processing.'
                            }
                        </p>

                        {showConflictDetails && (
                            <div className="bg-white rounded border border-orange-200 p-3 space-y-2">
                                <div className="grid grid-cols-2 gap-4 text-sm">
                                    <div>
                                        <span className="font-medium text-gray-700">Conflict Type:</span>
                                        <p className="text-gray-600">{conflictDetails.conflictType.replace('_', ' ')}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">Severity:</span>
                                        <p className="text-gray-600">{conflictDetails.conflictSeverity}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">AMMC Assessment:</span>
                                        <p className="text-gray-600">{conflictDetails.ammcRecommendation}</p>
                                    </div>
                                    <div>
                                        <span className="font-medium text-gray-700">NIA Assessment:</span>
                                        <p className="text-gray-600">{conflictDetails.niaRecommendation}</p>
                                    </div>
                                </div>

                                {conflictDetails.discrepancyPercentage && (
                                    <div className="pt-2 border-t border-orange-200">
                                        <span className="font-medium text-gray-700">Value Discrepancy:</span>
                                        <p className="text-gray-600">{conflictDetails.discrepancyPercentage.toFixed(1)}%</p>
                                    </div>
                                )}

                                {conflictDetails.resolutionNotes && (
                                    <div className="pt-2 border-t border-orange-200">
                                        <span className="font-medium text-gray-700">Resolution Notes:</span>
                                        <p className="text-gray-600">{conflictDetails.resolutionNotes}</p>
                                    </div>
                                )}
                            </div>
                        )}

                        {onRaiseConflict && !conflictDetails.resolved && (
                            <div className="mt-3 pt-3 border-t border-orange-200">
                                <button
                                    onClick={onRaiseConflict}
                                    className="inline-flex items-center space-x-2 px-3 py-2 bg-orange-600 text-white rounded-lg hover:bg-orange-700 text-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Raise Conflict Inquiry</span>
                                </button>
                            </div>
                        )}
                    </div>
                )}

                {/* Rejection Information */}
                {paymentDecision.decision === 'reject' && (
                    <div className="bg-red-50 border border-red-200 rounded-lg p-4">
                        <h4 className="font-medium text-red-800 mb-3 flex items-center">
                            <XCircle className="w-4 h-4 mr-2" />
                            Insurance Rejected
                        </h4>
                        <p className="text-sm text-red-800 mb-3">
                            Your insurance application has been rejected based on the assessment results.
                            Please review the reasoning above and consider the following options:
                        </p>

                        <div className="space-y-2">
                            {onEditPolicy && (
                                <button
                                    onClick={onEditPolicy}
                                    className="inline-flex items-center space-x-2 px-3 py-2 bg-red-600 text-white rounded-lg hover:bg-red-700 text-sm mr-3"
                                >
                                    <Edit className="w-4 h-4" />
                                    <span>Modify & Resubmit Policy</span>
                                </button>
                            )}

                            {onRaiseConflict && (
                                <button
                                    onClick={onRaiseConflict}
                                    className="inline-flex items-center space-x-2 px-3 py-2 bg-gray-600 text-white rounded-lg hover:bg-gray-700 text-sm"
                                >
                                    <MessageSquare className="w-4 h-4" />
                                    <span>Contest Decision</span>
                                </button>
                            )}
                        </div>
                    </div>
                )}

                {/* Decision Metadata */}
                <div className="pt-4 border-t border-gray-200">
                    <div className="flex items-center justify-between text-sm text-gray-600">
                        <span>Reviewed by: {paymentDecision.reviewedBy}</span>
                        <span>Decision ID: {policyId.substring(0, 8).toUpperCase()}</span>
                    </div>
                </div>

                {/* Insurance Platform Information */}
                {paymentDecision.canProceedToInsurance && (
                        <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                            <div className="flex items-center space-x-3 mb-3">
                                <Shield className="w-5 h-5 text-green-600" />
                                <h4 className="font-medium text-green-800">Ready for Payment</h4>
                            </div>
                            <p className="text-sm text-green-800 mb-3">
                                Your policy has been approved and the premium can now be calculated and paid securely
                                through the configured payment platform.
                            </p>
                            <div className="flex items-center space-x-2 text-xs text-green-700">
                                <Info className="w-3 h-3" />
                                <span>Secure connection to the payment provider</span>
                            </div>
                        </div>
                )}
            </div>
        </div>
    );
};

export default PaymentDecisionDisplay;