"use client";
import React, { useState, useCallback } from "react";
import {
    Calculator,
    Search,
    RefreshCw,
    CheckCircle,
    XCircle,
    AlertTriangle,
    Info,
    ChevronDown,
    ChevronUp,
    Printer,
    Copy,
    BadgeCheck,
} from "lucide-react";
import { getSurveyorAssignments } from "@/services/api";
import { Switch } from "@/components/ui/switch";

// ─── Types ──────────────────────────────────────────────────────────────────

interface RiskFactor {
    id: string;
    label: string;
    description: string;
    multiplier: number; // expressed as fraction of x
    active: boolean;
    locked?: boolean; // auto-detected from policy
    lockedValue?: boolean;
    category: "approval" | "contractor" | "assessor" | "site" | "opinion";
}

type ContractorType = "international" | "indigenous" | "direct_labor" | "other";

interface PolicySummary {
    policyNumber: string;
    builderName: string;
    projectAddress: string;
    contractorType: ContractorType;
    isDirectLabor: boolean;
    hasAssessor: boolean;
    hasSiteAssessment: boolean;
    totalEstimateSum: number;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

const fmt = (n: number) =>
    new Intl.NumberFormat("en-NG", {
        style: "currency",
        currency: "NGN",
        minimumFractionDigits: 2,
    }).format(n);

const detectContractorType = (policy: any): ContractorType => {
    if (policy?.isDirectLabor) return "direct_labor";
    const ct = (policy?.project?.contractorType || "").toLowerCase();
    if (ct.includes("international")) return "international";
    if (ct.includes("local") || ct.includes("indigenous")) return "indigenous";
    return "other";
};

const extractPolicySummary = (policyDoc: any): PolicySummary => {
    const contractorType = detectContractorType(policyDoc);
    return {
        policyNumber: policyDoc?.policyNumber || "",
        builderName: policyDoc?.builder?.nameOfBuilder || "N/A",
        projectAddress:
            policyDoc?.project?.address ||
            policyDoc?.project?.projectAddress ||
            "N/A",
        contractorType,
        isDirectLabor: !!policyDoc?.isDirectLabor,
        hasAssessor: !!(
            policyDoc?.organization?.assessorName ||
            policyDoc?.organization?.consultantName
        ),
        hasSiteAssessment: false, // same – surveyor decides
        totalEstimateSum: policyDoc?.project?.totalEstimateSum || 0,
    };
};

// ─── Component ────────────────────────────────────────────────────────────────

const INITIAL_FACTORS = (overrides?: Partial<PolicySummary>): RiskFactor[] => [
    {
        id: "no_building_approval",
        label: "Is building plan approval missing?",
        description: "Select Yes when plan approval is not present. Yes adds 20% of x to the base risk.",
        multiplier: 0.2,
        active: false,
        category: "approval",
    },
    {
        id: "direct_labor",
        label: "Is the construction carried out as direct labor?",
        description: "Select Yes if the work is direct labor. Yes adds 20% of x to the base risk.",
        multiplier: 0.2,
        active: overrides?.isDirectLabor ?? false,
        locked: overrides?.isDirectLabor !== undefined,
        lockedValue: overrides?.isDirectLabor,
        category: "contractor",
    },
    {
        id: "international_contractor",
        label: "Is the contractor international?",
        description: "Select Yes if the contractor is international. Yes adds 20% of x to the base risk.",
        multiplier: 0.2,
        active: overrides?.contractorType === "international",
        locked:
            overrides?.contractorType !== undefined &&
            overrides?.contractorType !== "other",
        lockedValue: overrides?.contractorType === "international",
        category: "contractor",
    },
    {
        id: "indigenous_contractor",
        label: "Is the contractor indigenous / locally registered?",
        description: "Select Yes if the contractor is indigenous / locally registered. Yes adds 10% of x to the base risk.",
        multiplier: 0.1,
        active: overrides?.contractorType === "indigenous",
        locked:
            overrides?.contractorType !== undefined &&
            overrides?.contractorType !== "other",
        lockedValue: overrides?.contractorType === "indigenous",
        category: "contractor",
    },
    {
        id: "no_assessor",
        label: "Is there no assessor linked to this policy?",
        description: "Select Yes when no assessor is linked. Yes adds 10% of x to the base risk.",
        multiplier: 0.1,
        active: overrides?.hasAssessor !== undefined ? !overrides.hasAssessor : false,
        locked: overrides?.hasAssessor !== undefined,
        lockedValue: overrides?.hasAssessor !== undefined ? !overrides.hasAssessor : false,
        category: "assessor",
    },
    {
        id: "no_site_assessment",
        label: "Has no site assessment been conducted?",
        description: "Select Yes when no site assessment has been completed. Yes adds 10% of x to the base risk.",
        multiplier: 0.1,
        active: overrides?.hasSiteAssessment !== undefined
            ? !overrides.hasSiteAssessment
            : false,
        category: "site",
    },
];

export default function PremiumCalculator() {
    // ── Policy fetch ──────────────────────────────────────────────────────────
    const [policyInput, setPolicyInput] = useState("");
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [loadedPolicy, setLoadedPolicy] = useState<PolicySummary | null>(null);

    // ── Calculator state ──────────────────────────────────────────────────────
    const [propertyValue, setPropertyValue] = useState<string>("");
    const [factors, setFactors] = useState<RiskFactor[]>(INITIAL_FACTORS());
    const [showBreakdown, setShowBreakdown] = useState(true);
    const [copied, setCopied] = useState(false);
    const [surveyOpinion, setSurveyOpinion] = useState("");

    // ── Conflict guard: international & indigenous are mutually exclusive ──────
    const resolveContractorConflict = (
        updated: RiskFactor[],
        changedId: string,
        newValue: boolean
    ): RiskFactor[] => {
        if (!newValue) return updated;
        if (changedId === "international_contractor") {
            return updated.map((f) =>
                f.id === "indigenous_contractor" ? { ...f, active: false } : f
            );
        }
        if (changedId === "indigenous_contractor") {
            return updated.map((f) =>
                f.id === "international_contractor" ? { ...f, active: false } : f
            );
        }
        // direct_labor disables contractor type flags
        if (changedId === "direct_labor" && newValue) {
            return updated.map((f) =>
                f.id === "international_contractor" || f.id === "indigenous_contractor"
                    ? { ...f, active: false }
                    : f
            );
        }
        return updated;
    };

    const toggleFactor = (id: string) => {
        setFactors((prev) => {
            const updated = prev.map((f) =>
                f.id === id && !f.locked ? { ...f, active: !f.active } : f
            );
            const changed = updated.find((f) => f.id === id);
            return changed ? resolveContractorConflict(updated, id, changed.active) : updated;
        });
    };

    // ── Premium maths ──────────────────────────────────────────────────────────
    const ev = parseFloat(propertyValue) || 0;
    const premiumX = ev * 0.03;
    const base = 0.5 * premiumX;
    const loadings = factors
        .filter((f) => f.active)
        .map((f) => ({ label: f.label, amount: f.multiplier * premiumX }));
    const totalLoading = loadings.reduce((s, l) => s + l.amount, 0);
    const totalPremium = base + totalLoading;

    // ── Fetch policy ──────────────────────────────────────────────────────────
    const handleFetchPolicy = useCallback(async () => {
        const query = policyInput.trim();
        if (!query) return;
        setFetchLoading(true);
        setFetchError(null);
        setLoadedPolicy(null);
        try {
            // Fetch all assignments and find matching policy number
            const res = await getSurveyorAssignments({ status: "all", page: 1, limit: 100 });
            const assignments: any[] = res?.data?.assignments || [];
            const match = assignments.find(
                (a: any) =>
                    (a.policyId?.policyNumber || "")
                        .toLowerCase()
                        .includes(query.toLowerCase())
            );
            if (!match) {
                setFetchError(
                    `No assignment found for policy number "${query}". Only policies assigned to you can be fetched.`
                );
                return;
            }
            const summary = extractPolicySummary(match.policyId);
            setLoadedPolicy(summary);
            // Seed factors from policy
            setFactors(INITIAL_FACTORS(summary));
            setSurveyOpinion("");
            // Seed estimated property value directly from totalEstimateSum
            if (match.policyId?.project?.totalEstimateSum) {
                setPropertyValue(String(match.policyId.project.totalEstimateSum));
            }
        } catch {
            setFetchError("Failed to load assignments. Please check your connection.");
        } finally {
            setFetchLoading(false);
        }
    }, [policyInput]);

    const handleReset = () => {
        setPolicyInput("");
        setLoadedPolicy(null);
        setFetchError(null);
        setPropertyValue("");
        setFactors(INITIAL_FACTORS());
        setSurveyOpinion("");
    };

    // ── Copy result ───────────────────────────────────────────────────────────
    const handleCopy = () => {
        const lines = [
            `Premium Calculator Report`,
            loadedPolicy ? `Policy: ${loadedPolicy.policyNumber}` : "",
            `Builder: ${loadedPolicy?.builderName || "N/A"}`,
            surveyOpinion ? `Surveyor Opinion: ${surveyOpinion}` : "",
            ``,
            `Estimated Property Value:  ${fmt(ev)}`,
            `Premium (x):               ${fmt(premiumX)}`,
            `Base Risk (0.5x):          ${fmt(base)}`,
            ...loadings.map((l) => `  + ${l.label}: ${fmt(l.amount)}`),
            `──────────────────────────────`,
            `TOTAL PREMIUM: ${fmt(totalPremium)}`,
        ]
            .filter(Boolean)
            .join("\n");
        navigator.clipboard.writeText(lines).then(() => {
            setCopied(true);
            setTimeout(() => setCopied(false), 2000);
        });
    };

    const handlePrint = () => window.print();

    const isValid = ev > 0;

    return (
        <>
            <style jsx global>{`
                @media print {
                    body {
                        background: #ffffff !important;
                    }

                    body * {
                        visibility: hidden !important;
                    }

                    #premium-calculator-printable,
                    #premium-calculator-printable * {
                        visibility: visible !important;
                    }

                    #premium-calculator-printable {
                        position: absolute !important;
                        inset: 0 !important;
                        width: 100% !important;
                        min-height: auto !important;
                        margin: 0 !important;
                        padding: 0 !important;
                        background: #ffffff !important;
                    }
                }
            `}</style>
            <div id="premium-calculator-printable" className="min-h-screen bg-gradient-to-br from-slate-50 via-green-50/30 to-blue-50/20">
            <div className="max-w-5xl mx-auto px-4 py-8 space-y-6">

                {/* ── Header ─────────────────────────────────────────────────── */}
                <div className="relative overflow-hidden rounded-[2rem] border border-emerald-200/70 bg-gradient-to-r from-[#028835] via-[#02742d] to-[#015a23] p-6 text-white shadow-[0_24px_80px_rgba(5,150,105,0.25)]">
                    <div className="pointer-events-none absolute inset-0 bg-[radial-gradient(circle_at_top_right,_rgba(255,255,255,0.18),_transparent_45%)]" />
                    <div className="flex items-center gap-3 mb-2">
                        <div className="p-2 bg-white/20 rounded-xl">
                            <Calculator className="w-6 h-6" />
                        </div>
                        <div>
                            <h1 className="text-2xl font-bold">Premium Calculator</h1>
                            <p className="text-green-100 text-sm mt-0.5">
                                FCT-DCIP Builder Liability — Surveyor Risk Assessment Tool
                            </p>
                        </div>
                    </div>
                    <div className="mt-4 rounded-2xl border border-white/15 bg-white/10 p-4 text-sm text-green-50 backdrop-blur-sm">
                        <Info className="w-4 h-4 inline mr-1.5 -mt-0.5" />
                        Enter an estimated property value, the system computes the <strong>x</strong> premium, then toggle risk factors to compute the
                        final premium. Optionally enter a policy number to auto-fill risk factors.
                    </div>
                </div>

                {/* ── Policy Lookup ───────────────────────────────────────────── */}
                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <h2 className="text-base font-semibold text-gray-800 mb-4 flex items-center gap-2">
                        <Search className="w-4 h-4 text-[#028835]" />
                        Auto-fill from Policy (Optional)
                    </h2>
                    <div className="flex gap-3">
                        <input
                            type="text"
                            placeholder="Enter policy number e.g. BL-2025-00123"
                            value={policyInput}
                            onChange={(e) => setPolicyInput(e.target.value)}
                            onKeyDown={(e) => e.key === "Enter" && handleFetchPolicy()}
                            className="flex-1 rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-[#028835] focus:outline-none focus:ring-4 focus:ring-[#028835]/10"
                        />
                        <div className="print:hidden flex gap-3">
                            <button
                                onClick={handleFetchPolicy}
                                disabled={fetchLoading || !policyInput.trim()}
                                className="inline-flex items-center gap-2 rounded-2xl bg-[#028835] px-5 py-3 text-sm font-medium text-white shadow-md shadow-emerald-200/50 transition-all duration-300 hover:-translate-y-0.5 hover:bg-[#026a28] hover:shadow-lg disabled:cursor-not-allowed disabled:opacity-50"
                            >
                                {fetchLoading ? (
                                    <RefreshCw className="w-4 h-4 animate-spin" />
                                ) : (
                                    <Search className="w-4 h-4" />
                                )}
                                {fetchLoading ? "Loading…" : "Fetch"}
                            </button>
                            {(loadedPolicy || fetchError) && (
                                <button
                                    onClick={handleReset}
                                    className="rounded-2xl border border-slate-200 px-4 py-3 text-sm text-slate-600 transition-all duration-300 hover:-translate-y-0.5 hover:bg-slate-50 hover:shadow-sm"
                                >
                                    Reset
                                </button>
                            )}
                        </div>
                    </div>

                    {fetchError && (
                        <div className="mt-3 flex items-start gap-2 rounded-2xl border border-red-200 bg-red-50/90 p-4 text-sm text-red-700 shadow-sm">
                            <AlertTriangle className="w-4 h-4 flex-shrink-0 mt-0.5" />
                            {fetchError}
                        </div>
                    )}

                    {loadedPolicy && (
                        <div className="mt-3 rounded-2xl border border-emerald-200 bg-emerald-50/90 p-4 shadow-sm">
                            <div className="flex items-center gap-2 mb-2">
                                <BadgeCheck className="w-4 h-4 text-green-600" />
                                <span className="text-sm font-semibold text-green-800">
                                    Policy loaded — linked factors auto-filled where available
                                </span>
                            </div>
                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-sm text-green-700">
                                <span><strong>Policy:</strong> {loadedPolicy.policyNumber}</span>
                                <span><strong>Builder:</strong> {loadedPolicy.builderName}</span>
                                <span><strong>Address:</strong> {loadedPolicy.projectAddress}</span>
                                <span>
                                    <strong>Contractor Type:</strong>{" "}
                                    {loadedPolicy.isDirectLabor
                                        ? "Direct Labor"
                                        : loadedPolicy.contractorType.replace("_", " ")}
                                </span>
                                <span>
                                    <strong>Assessor:</strong>{" "}
                                    {loadedPolicy.hasAssessor ? "Present" : "Not linked"}
                                </span>
                                {loadedPolicy.totalEstimateSum > 0 && (
                                    <span>
                                        <strong>Estimate:</strong>{" "}
                                        {fmt(loadedPolicy.totalEstimateSum)}
                                    </span>
                                )}
                            </div>
                            <p className="text-xs text-green-600 mt-2">
                                Locked fields are derived from the policy and cannot be changed manually.
                            </p>
                        </div>
                    )}
                </div>

                {/* ── Property Valuation & Premium ─────────────────────────────────── */}
                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <h2 className="text-base font-semibold text-gray-800 mb-1 flex items-center gap-2">
                        <Calculator className="w-4 h-4 text-[#028835]" />
                        Property Valuation &amp; Premium
                    </h2>
                    <p className="text-xs text-gray-500 mb-4">
                        Enter the <strong>estimated property value</strong>. The system calculates the
                        <strong> premium as 3%</strong> of that value, then applies a
                        <strong> 0.5x base risk factor</strong> on the premium before any additional loadings.
                    </p>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                        {/* Input */}
                        <div>
                            <label className="text-xs font-medium text-gray-600 mb-1 block">
                                Estimated Property Value (₦)
                            </label>
                            <input
                                type="number"
                                min={0}
                                step={1000000}
                                placeholder="e.g. 50,000,000"
                                value={propertyValue}
                                onChange={(e) => setPropertyValue(e.target.value)}
                                className="w-full rounded-2xl border border-slate-200 bg-white px-4 py-3 text-sm shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-[#028835] focus:outline-none focus:ring-4 focus:ring-[#028835]/10"
                            />
                        </div>
                    </div>
                </div>
                          {/* ── Risk Loading Factors ────────────────────────────────────── */}
                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex flex-col gap-3 mb-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Risk Loading Factors
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                Additive only
                            </span>
                            {isValid && (
                                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 font-medium">
                                    {loadings.length} factor{loadings.length !== 1 ? "s" : ""} active
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-6 text-amber-900 shadow-sm">
                        <p className="font-semibold">How to use these factors</p>
                        <p>
                            Choose <strong>Yes</strong> only when the condition applies. Every <strong>Yes</strong> adds to
                            the base risk and <strong>increases</strong> the total premium. <strong>No</strong> means no
                            extra loading, so the premium never drops below the base risk.
                        </p>
                        <p className="mt-1 text-amber-800">
                            Factors detected from your loaded policy are locked automatically.
                        </p>
                    </div>

                    <div className="divide-y divide-gray-100">
                        {factors.map((factor) => (
                            <div
                                key={factor.id}
                                className={`group flex flex-col gap-4 py-4 first:pt-0 last:pb-0 sm:flex-row sm:items-center ${
                                    factor.locked ? "opacity-75" : ""
                                }`}
                            >
                                {/* Question + description */}
                                <div className="flex-1 min-w-0 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 transition-all duration-300 group-hover:border-emerald-200 group-hover:bg-emerald-50/40">
                                    <p className="text-sm font-semibold text-slate-800 leading-snug">
                                        {factor.label}
                                    </p>
                                    <p className="mt-1 text-xs leading-5 text-slate-500">{factor.description}</p>
                                </div>

                                {/* Right side: loading amount + yes/no toggle */}
                                <div className="flex flex-wrap items-center gap-3 flex-shrink-0 sm:justify-end">
                                    {factor.active && isValid ? (
                                        <span className="rounded-full border border-amber-200 bg-amber-50 px-3 py-1 text-xs font-semibold text-amber-700">
                                            +{fmt(factor.multiplier * premiumX)}
                                        </span>
                                    ) : (
                                        <span className="rounded-full border border-slate-200 bg-white px-3 py-1 text-xs text-slate-400">
                                            +{factor.multiplier * 100}% of x
                                        </span>
                                    )}

                                    <div className="flex flex-col items-end gap-1.5">
                                        <div className="inline-flex items-center gap-2 rounded-full border border-slate-200 bg-white px-3 py-2 shadow-sm transition-all duration-300 group-hover:shadow-md">
                                            <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                                                !factor.active ? "text-gray-700" : "text-gray-400"
                                            }`}>
                                                No
                                            </span>
                                            <Switch
                                                checked={factor.active}
                                                onCheckedChange={() => !factor.locked && toggleFactor(factor.id)}
                                                disabled={factor.locked}
                                                aria-label={factor.label}
                                                className="data-[state=checked]:bg-[#028835] data-[state=unchecked]:bg-gray-300"
                                            />
                                            <span className={`text-[10px] font-semibold uppercase tracking-wide transition-colors ${
                                                factor.active ? "text-[#028835]" : "text-gray-400"
                                            }`}>
                                                Yes
                                            </span>
                                        </div>
                                        <p className="text-[10px] text-slate-400 text-right leading-tight">
                                            Yes adds loading only
                                        </p>
                                    </div>

                                    {factor.locked && (
                                        <span className="whitespace-nowrap rounded-full bg-slate-100 px-2 py-1 text-[10px] font-medium text-slate-500">
                                            AUTO
                                        </span>
                                    )}
                                </div>
                            </div>
                        ))}
                    </div>

                </div>

                {/* ── Results ─────────────────────────────────────────────────── */}
                <div className="rounded-[2rem] border border-slate-200/80 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex items-start justify-between gap-4">
                        <div>
                            <h2 className="text-base font-semibold text-gray-800">
                                General Surveyor Opinion
                            </h2>
                            <p className="mt-1 text-xs leading-5 text-slate-500">
                                This is a free-text note for your professional opinion only. It does not affect the premium.
                            </p>
                        </div>
                        <span className="rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[10px] font-semibold uppercase tracking-[0.18em] text-slate-500">
                            Note only
                        </span>
                    </div>
                    <textarea
                        value={surveyOpinion}
                        onChange={(e) => setSurveyOpinion(e.target.value)}
                        rows={4}
                        placeholder="Add your professional opinion here..."
                        className="mt-4 w-full rounded-2xl border border-slate-200 bg-slate-50/70 px-4 py-3 text-sm shadow-sm transition-all duration-300 placeholder:text-slate-400 focus:border-[#028835] focus:bg-white focus:outline-none focus:ring-4 focus:ring-[#028835]/10"
                    />
                </div>

                <div className="overflow-hidden rounded-[2rem] border border-white/70 bg-white/90 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl print:shadow-none">
                    {/* Result header */}
                    <div className="flex flex-col gap-3 bg-gradient-to-r from-[#028835] to-[#015a23] px-6 py-4 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-white font-semibold flex items-center gap-2">
                            <CheckCircle className="w-4 h-4" />
                            Premium Summary
                        </h2>
                        <div className="flex gap-2 print:hidden">
                            <button
                                onClick={handleCopy}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30"
                            >
                                {copied ? <CheckCircle className="w-3.5 h-3.5" /> : <Copy className="w-3.5 h-3.5" />}
                                {copied ? "Copied!" : "Copy"}
                            </button>
                            <button
                                onClick={handlePrint}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30"
                            >
                                <Printer className="w-3.5 h-3.5" />
                                Print
                            </button>
                            <button
                                onClick={() => setShowBreakdown((v) => !v)}
                                className="inline-flex items-center gap-1.5 rounded-full bg-white/20 px-3 py-1.5 text-xs text-white transition-all duration-300 hover:-translate-y-0.5 hover:bg-white/30"
                            >
                                {showBreakdown ? (
                                    <ChevronUp className="w-3.5 h-3.5" />
                                ) : (
                                    <ChevronDown className="w-3.5 h-3.5" />
                                )}
                                {showBreakdown ? "Hide" : "Show"} Breakdown
                            </button>
                        </div>
                    </div>

                    <div className="p-6 space-y-4">
                        {!isValid && (
                            <div className="flex items-center gap-2 text-sm text-amber-700 bg-amber-50 border border-amber-200 rounded-xl p-3">
                                <AlertTriangle className="w-4 h-4 flex-shrink-0" />
                                Enter a base premium value above to see results.
                            </div>
                        )}

                        {/* Breakdown */}
                        {showBreakdown && isValid && (
                            <div className="space-y-2 rounded-2xl border border-slate-200/80 bg-slate-50/70 p-4 text-sm">
                                {/* Property value */}
                                <div className="flex justify-between items-center py-1.5">
                                    <span className="text-gray-500">Estimated Property Value</span>
                                    <span className="text-gray-600 font-medium">{fmt(ev)}</span>
                                </div>

                                {/* Premium x */}
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-600">
                                        Premium (x)&nbsp;<span className="text-gray-400 text-xs">(3% of value)</span>
                                    </span>
                                    <span className="text-blue-700 font-semibold">{fmt(premiumX)}</span>
                                </div>

                                {/* Base risk 0.5x */}
                                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-200">
                                    <span className="text-gray-700 font-semibold">
                                        Base Risk&nbsp;<span className="text-gray-400 text-xs font-normal">(0.5x)</span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{fmt(base)}</span>
                                </div>

                                {/* Risk Loadings */}
                                {loadings.length === 0 ? (
                                    <div className="py-2 text-gray-400 text-xs italic">
                                        No loadings selected — total premium = base risk only.
                                    </div>
                                ) : (
                                    loadings.map((l) => (
                                        <div
                                            key={l.label}
                                            className="flex justify-between items-center py-1.5"
                                        >
                                            <span className="text-gray-600 flex items-center gap-1.5">
                                                <span className="w-1.5 h-1.5 rounded-full bg-[#028835] inline-block" />
                                                {l.label}
                                            </span>
                                            <span className="text-amber-700 font-medium">
                                                + {fmt(l.amount)}
                                            </span>
                                        </div>
                                    ))
                                )}

                                {/* Total loading row */}
                                {loadings.length > 0 && (
                                    <div className="flex justify-between items-center py-2 border-t border-gray-100 text-sm">
                                        <span className="text-gray-500">Total Added Loading</span>
                                        <span className="text-amber-700 font-semibold">
                                            + {fmt(totalLoading)}
                                        </span>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* Grand Total */}
                        {isValid && (
                            <div className="bg-gradient-to-r from-[#028835]/10 to-blue-50 rounded-xl p-5 flex items-center justify-between">
                                <div>
                                    <p className="text-sm text-gray-600">Total Premium Payable</p>
                                    <p className="text-xs text-gray-400 mt-0.5">
                                        0.5x base risk + {loadings.length} selected loading{loadings.length !== 1 ? "s" : ""}
                                    </p>
                                </div>
                                <div className="text-right">
                                    <p className="text-3xl font-bold text-[#028835]">
                                        {fmt(totalPremium)}
                                    </p>
                                </div>
                            </div>
                        )}

                        {/* Effective rate */}
                        {isValid && loadedPolicy?.totalEstimateSum && loadedPolicy.totalEstimateSum > 0 && (
                            <div className="text-xs text-gray-500 text-right">
                                Effective rate:{" "}
                                <span className="font-medium text-gray-700">
                                    {((totalPremium / loadedPolicy.totalEstimateSum) * 100).toFixed(3)}%
                                </span>{" "}
                                of project estimate
                            </div>
                        )}
                    </div>
                </div>

                {/* ── Formula reference card ──────────────────────────────────── */}
                <div className="rounded-[2rem] bg-slate-800 p-5 text-sm shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
                    <h3 className="text-slate-200 font-semibold mb-3 flex items-center gap-2">
                        <Info className="w-4 h-4" />
                        Formula Reference
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-2 text-slate-400 text-xs font-mono">
                        {[
                            ["Estimated Property Value", "EV"],
                            ["Premium (x)", "= 3% × EV"],
                            ["Base Risk", "= 0.5x"],
                            ["No Building Plan Approval", "+ 0.2x"],
                            ["Direct Labor", "+ 0.2x"],
                            ["International Contractor", "+ 0.2x"],
                            ["Indigenous Contractor", "+ 0.1x"],
                            ["No Assessor", "+ 0.1x"],
                            ["No Site Assessment", "+ 0.1x"],
                        ].map(([label, val]) => (
                            <div key={label} className={`flex justify-between rounded-lg px-3 py-2 ${
                                label === "Base Risk" || label === "Premium (x)" ? "bg-slate-600" : "bg-slate-700/50"
                            }`}>
                                <span>{label}</span>
                                <span className={`font-bold ${
                                    label === "Base Risk" || label === "Premium (x)" ? "text-white" : "text-green-400"
                                }`}>{val}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-3">
                        x = 3% of estimated property value. Base risk = 0.5x. All risk loadings are additive only.
                        General surveyor opinion is captured as a note only. Max possible premium = <strong className="text-slate-300">1.4x</strong> (all loadings active).
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
