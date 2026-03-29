"use client";

import React, { useState } from "react";
import {
    CheckCircle,
    XCircle,
    AlertTriangle,
    X,
    ChevronDown,
    ChevronUp,
    ExternalLink,
    Info,
} from "lucide-react";

// ─── Types ───────────────────────────────────────────────────────────────────

export interface NiipWithdrawalResult {
    success: boolean;
    /** Present when the withdrawal was deliberately skipped. */
    skipped?: boolean;
    reason?: string;
    /** HTTP status code returned by NIIP. */
    status?: number;
    /** URL that was called. */
    url?: string;
    /** Top-level error string. */
    error?: string;
    /** Detailed body from NIIP – may contain raw HTML when NIIP is down. */
    body?: {
        raw?: string;
        error?: string;
        message?: string;
        looksLike404Page?: boolean;
        niipUrl?: string;
        statusCode?: number;
    };
}

export interface PaymentConfirmationResult {
    success: boolean;
    message?: string;
    data?: {
        status?: string;
        amount?: number;
        transactionReference?: string;
    };
    transferVerification?: {
        success: boolean;
        skipped?: boolean;
        reason?: string;
    };
    niipWithdrawal?: NiipWithdrawalResult;
}

interface PaymentResultModalProps {
    isOpen: boolean;
    result: PaymentConfirmationResult;
    onClose: () => void;
    onRetry?: () => void;
    retryLoading?: boolean;
}

// ─── Helpers ─────────────────────────────────────────────────────────────────

function formatAmount(amount?: number) {
    if (!amount) return "—";
    return new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
    }).format(amount);
}

// ─── Sub-components ──────────────────────────────────────────────────────────

const StatusRow: React.FC<{
    label: string;
    ok: boolean | null;
    detail?: string;
}> = ({ label, ok, detail }) => (
    <div className="flex items-start gap-3 py-2">
        <div className="mt-0.5 flex-shrink-0">
            {ok === true && <CheckCircle className="w-5 h-5 text-green-500" />}
            {ok === false && <XCircle className="w-5 h-5 text-red-500" />}
            {ok === null && <Info className="w-5 h-5 text-yellow-500" />}
        </div>
        <div>
            <p className="text-sm font-medium text-gray-900">{label}</p>
            {detail && <p className="text-xs text-gray-600 mt-0.5">{detail}</p>}
        </div>
    </div>
);

interface NiipSectionProps {
    withdrawal: NiipWithdrawalResult;
}

const NiipSection: React.FC<NiipSectionProps> = ({ withdrawal }) => {
    const [showRaw, setShowRaw] = useState(false);
    const is404 = withdrawal.body?.looksLike404Page;
    const rawHtml = withdrawal.body?.raw;

    if (withdrawal.skipped) {
        return (
            <div className="rounded-lg border border-yellow-200 bg-yellow-50 p-4">
                <div className="flex items-center gap-2 mb-1">
                    <AlertTriangle className="w-4 h-4 text-yellow-600" />
                    <span className="text-sm font-semibold text-yellow-800">NIIP Withdrawal Skipped</span>
                </div>
                <p className="text-xs text-yellow-700">
                    {withdrawal.reason?.replace(/_/g, " ") || "No reason provided."}
                </p>
            </div>
        );
    }

    if (withdrawal.success) {
        return (
            <div className="rounded-lg border border-green-200 bg-green-50 p-4">
                <div className="flex items-center gap-2">
                    <CheckCircle className="w-4 h-4 text-green-600" />
                    <span className="text-sm font-semibold text-green-800">NIIP Wallet Withdrawal Successful</span>
                </div>
            </div>
        );
    }

    // Failure path
    const userFriendlyError = is404
        ? "The NIIP payment endpoint returned a 404 page. This usually means the NIIP service is temporarily unavailable or the API URL has changed."
        : withdrawal.body?.error || withdrawal.body?.message || withdrawal.error || "An unknown error occurred.";

    return (
        <div className="rounded-lg border border-red-200 bg-red-50 p-4 space-y-3">
            <div className="flex items-start gap-2">
                <XCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                <div>
                    <span className="text-sm font-semibold text-red-800 block">
                        NIIP Wallet Withdrawal Failed
                    </span>
                    <p className="text-xs text-red-700 mt-1 leading-relaxed">{userFriendlyError}</p>
                </div>
            </div>

            {/* Technical details */}
            <div className="space-y-1 text-xs text-red-700 border-t border-red-200 pt-2">
                {withdrawal.url && (
                    <div className="flex items-center gap-1 flex-wrap">
                        <span className="font-medium">Endpoint:</span>
                        <a
                            href={withdrawal.url}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="underline flex items-center gap-0.5 break-all"
                        >
                            {withdrawal.url}
                            <ExternalLink className="w-3 h-3 flex-shrink-0" />
                        </a>
                    </div>
                )}
                {withdrawal.status && (
                    <div>
                        <span className="font-medium">HTTP Status:</span>{" "}
                        {withdrawal.status}
                        {is404 && " (HTML page — expected JSON)"}
                    </div>
                )}
            </div>

            {/* Raw HTML toggle — only shown when NIIP returned a page */}
            {rawHtml && (
                <div>
                    <button
                        onClick={() => setShowRaw((v) => !v)}
                        className="flex items-center gap-1 text-xs font-medium text-red-700 hover:text-red-900"
                    >
                        {showRaw ? <ChevronUp className="w-3 h-3" /> : <ChevronDown className="w-3 h-3" />}
                        {showRaw ? "Hide raw response" : "Show raw NIIP response"}
                    </button>

                    {showRaw && (
                        <pre className="mt-2 max-h-40 overflow-auto rounded bg-red-100 p-3 text-[10px] text-red-900 whitespace-pre-wrap break-all">
                            {rawHtml.substring(0, 4000)}
                            {rawHtml.length > 4000 && "\n\n[truncated…]"}
                        </pre>
                    )}
                </div>
            )}

            <p className="text-xs text-red-600 bg-red-100 rounded p-2 leading-relaxed">
                <strong>What to do:</strong> Your payment was received and confirmed on our
                side. The NIIP withdrawal can be retried by an administrator. Please contact
                support if this issue persists.
            </p>
        </div>
    );
};

// ─── Main Modal ───────────────────────────────────────────────────────────────

const PaymentResultModal: React.FC<PaymentResultModalProps> = ({
    isOpen,
    result,
    onClose,
    onRetry,
    retryLoading = false,
}) => {
    if (!isOpen) return null;

    const paymentOk = result.success;
    const niipOk = result.niipWithdrawal?.success ?? null;
    const niipSkipped = result.niipWithdrawal?.skipped ?? false;
    const amount = result.data?.amount;
    const ref = result.data?.transactionReference;

    // Overall status label
    const allGood = paymentOk && (niipOk === true || niipSkipped);
    const partialSuccess = paymentOk && niipOk === false && !niipSkipped;

    return (
        <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/50 backdrop-blur-sm">
            <div className="bg-white rounded-2xl shadow-2xl w-full max-w-lg max-h-[90vh] overflow-y-auto">
                {/* Header */}
                <div
                    className={`flex items-start justify-between p-5 rounded-t-2xl ${
                        allGood
                            ? "bg-green-600"
                            : partialSuccess
                            ? "bg-amber-500"
                            : "bg-red-600"
                    } text-white`}
                >
                    <div className="flex items-start gap-3">
                        {allGood ? (
                            <CheckCircle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        ) : (
                            <AlertTriangle className="w-6 h-6 flex-shrink-0 mt-0.5" />
                        )}
                        <div>
                            <h2 className="text-lg font-bold leading-tight">
                                {allGood
                                    ? "Payment Successful"
                                    : partialSuccess
                                    ? "Payment Confirmed — Action Required"
                                    : "Payment Failed"}
                            </h2>
                            <p className="text-sm opacity-90 mt-0.5">
                                {allGood
                                    ? "Your payment and NIIP withdrawal were both processed."
                                    : partialSuccess
                                    ? "Your payment was received, but the NIIP withdrawal could not be completed automatically."
                                    : result.message || "Something went wrong."}
                            </p>
                        </div>
                    </div>
                    <button
                        onClick={onClose}
                        className="ml-4 flex-shrink-0 text-white/80 hover:text-white"
                    >
                        <X className="w-5 h-5" />
                    </button>
                </div>

                {/* Body */}
                <div className="p-5 space-y-4">
                    {/* Summary row */}
                    {(amount || ref) && (
                        <div className="flex flex-wrap gap-4 bg-gray-50 rounded-lg p-3 text-sm">
                            {amount && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide">Amount</span>
                                    <p className="font-semibold text-gray-900">{formatAmount(amount)}</p>
                                </div>
                            )}
                            {ref && (
                                <div>
                                    <span className="text-gray-500 text-xs uppercase tracking-wide">Reference</span>
                                    <p className="font-mono text-xs text-gray-800 break-all">{ref}</p>
                                </div>
                            )}
                        </div>
                    )}

                    {/* Step statuses */}
                    <div className="divide-y divide-gray-100 rounded-lg border border-gray-200 px-4">
                        <StatusRow
                            label="Payment Confirmation"
                            ok={paymentOk}
                            detail={
                                paymentOk
                                    ? result.message || "Payment received and recorded."
                                    : result.message || "Could not confirm the payment."
                            }
                        />
                        {result.transferVerification && (
                            <StatusRow
                                label="Transfer Verification"
                                ok={
                                    result.transferVerification.skipped
                                        ? null
                                        : result.transferVerification.success
                                }
                                detail={
                                    result.transferVerification.skipped
                                        ? `Skipped — ${result.transferVerification.reason?.replace(/_/g, " ") || "no reference provided"}`
                                        : result.transferVerification.success
                                        ? "Transfer reference verified."
                                        : "Verification failed."
                                }
                            />
                        )}
                        <StatusRow
                            label="NIIP Wallet Withdrawal"
                            ok={niipSkipped ? null : niipOk}
                            detail={
                                niipSkipped
                                    ? "Skipped — see details below."
                                    : niipOk === true
                                    ? "NIIP wallet charged successfully."
                                    : niipOk === false
                                    ? "See details below."
                                    : undefined
                            }
                        />
                    </div>

                    {/* NIIP detail section */}
                    {result.niipWithdrawal && (
                        <NiipSection withdrawal={result.niipWithdrawal} />
                    )}
                </div>

                {/* Footer */}
                <div className="flex justify-end gap-3 px-5 pb-5">
                    {onRetry && partialSuccess && (
                        <button
                            onClick={onRetry}
                            disabled={retryLoading}
                            className="px-5 py-2 bg-amber-600 text-white text-sm font-medium rounded-lg hover:bg-amber-700 transition-colors disabled:opacity-50"
                        >
                            {retryLoading ? "Retrying..." : "Retry NIIP Withdrawal"}
                        </button>
                    )}
                    <button
                        onClick={onClose}
                        className="px-5 py-2 bg-gray-900 text-white text-sm font-medium rounded-lg hover:bg-gray-700 transition-colors"
                    >
                        Close
                    </button>
                </div>
            </div>
        </div>
    );
};

export default PaymentResultModal;
