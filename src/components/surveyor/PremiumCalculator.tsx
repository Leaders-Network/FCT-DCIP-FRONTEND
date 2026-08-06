"use client";
import React, { useState, useCallback } from "react";
import {
    Calculator,
    Search,
    RefreshCw,
    CheckCircle,
    AlertTriangle,
    Info,
    ChevronDown,
    ChevronUp,
    Printer,
    Copy,
    BadgeCheck,
} from "lucide-react";
import { getSurveyorAssignments } from "@/services/api";

// ─── Types ──────────────────────────────────────────────────────────────────

type ContractorType = "international" | "indigenous" | "direct_labor" | "other";
type YesNoOption = "yes" | "no";
type ContractorClassificationOption = "suitable" | "mismatch";
type SectionKey = "building" | "quality" | "site" | "assessor";

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

interface UnderwritingAnswers {
    buildingApproval: YesNoOption | null;
    directLabor: YesNoOption | null;
    contractorRegistered: YesNoOption | null;
    contractorClassification: ContractorClassificationOption | null;
    siteHighRisk: YesNoOption | null;
    siteEngineering: YesNoOption | null;
    assessorEngaged: YesNoOption | null;
    assessorName: string;
    assessorCompany: string;
    assessorEmail: string;
    opinionHasRiskFactor: boolean;
}

// ─── Business rules ───────────────────────────────────────────────────────

const BASE_RISK_FACTOR = 0.0025; // 0.25%
const MAX_ADDITIONAL_LOADING = 0.5; // 0.5x
const UNDERWRITING_LOADINGS = {
    buildingApprovalMissing: 0.1,
    directLabor: 0.2,
    contractorMismatch: 0.1,
    siteRisk: 0.1,
    assessorUnavailable: 0.1,
    generalOpinion: 0.1,
} as const;

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

const INITIAL_ANSWERS: UnderwritingAnswers = {
    buildingApproval: null,
    directLabor: null,
    contractorRegistered: null,
    contractorClassification: null,
    siteHighRisk: null,
    siteEngineering: null,
    assessorEngaged: null,
    assessorName: "",
    assessorCompany: "",
    assessorEmail: "",
    opinionHasRiskFactor: false,
};

const calculateSectionLoadings = (answers: UnderwritingAnswers, surveyOpinion: string) => {
    const buildingApproval = answers.buildingApproval === "no" ? UNDERWRITING_LOADINGS.buildingApprovalMissing : 0;
    const quality = (() => {
        if (answers.directLabor === "yes") return UNDERWRITING_LOADINGS.directLabor;
        if (answers.directLabor === "no") {
            const contractorMismatch =
                answers.contractorRegistered === "no" && answers.contractorClassification === "mismatch"
                    ? UNDERWRITING_LOADINGS.contractorMismatch
                    : 0;
            return contractorMismatch;
        }
        return 0;
    })();
    const site = answers.siteHighRisk === "yes" || answers.siteEngineering === "yes"
        ? UNDERWRITING_LOADINGS.siteRisk
        : 0;
    const assessor = answers.assessorEngaged === "no" ? UNDERWRITING_LOADINGS.assessorUnavailable : 0;
    const opinion = surveyOpinion.trim() && answers.opinionHasRiskFactor ? UNDERWRITING_LOADINGS.generalOpinion : 0;

    return {
        buildingApproval,
        quality,
        site,
        assessor,
        opinion,
    };
};

// ─── Component ────────────────────────────────────────────────────────────────

export default function PremiumCalculator() {
    // ── Policy fetch ──────────────────────────────────────────────────────────
    const [policyInput, setPolicyInput] = useState("");
    const [fetchLoading, setFetchLoading] = useState(false);
    const [fetchError, setFetchError] = useState<string | null>(null);
    const [loadedPolicy, setLoadedPolicy] = useState<PolicySummary | null>(null);

    // ── Calculator state ──────────────────────────────────────────────────────
    const [propertyValue, setPropertyValue] = useState<string>("");
    const [answers, setAnswers] = useState<UnderwritingAnswers>(INITIAL_ANSWERS);
    const [showBreakdown, setShowBreakdown] = useState(true);
    const [copied, setCopied] = useState(false);
    const [surveyOpinion, setSurveyOpinion] = useState("");
    const [openSections, setOpenSections] = useState<Record<SectionKey, boolean>>({
        building: true,
        quality: true,
        site: true,
        assessor: true,
    });

    const toggleSection = (section: SectionKey) => {
        setOpenSections((prev) => ({ ...prev, [section]: !prev[section] }));
    };

    const updateAnswer = <K extends keyof UnderwritingAnswers>(field: K, value: UnderwritingAnswers[K]) => {
        setAnswers((prev) => {
            const next = { ...prev, [field]: value } as UnderwritingAnswers;
            if (field === "assessorEngaged" && value === "no") {
                next.assessorName = "";
                next.assessorCompany = "";
                next.assessorEmail = "";
            }
            return next;
        });
    };

    // ── Premium maths ──────────────────────────────────────────────────────────
    const ev = parseFloat(propertyValue) || 0;
    const basePremium = ev * BASE_RISK_FACTOR;
    const sectionLoadings = calculateSectionLoadings(answers, surveyOpinion);
    const totalLoadingFraction = Math.min(
        Object.values(sectionLoadings).reduce((sum, value) => sum + value, 0),
        MAX_ADDITIONAL_LOADING
    );
    const totalLoadingAmount = basePremium * totalLoadingFraction;
    const effectiveRiskFactor = BASE_RISK_FACTOR * (1 + totalLoadingFraction);
    const totalPremium = ev * effectiveRiskFactor;
    const loadings = [
        {
            label: "Building Approval",
            multiplier: sectionLoadings.buildingApproval,
            amount: basePremium * sectionLoadings.buildingApproval,
        },
        {
            label: "Quality of Construction",
            multiplier: sectionLoadings.quality,
            amount: basePremium * sectionLoadings.quality,
        },
        {
            label: "Site Conditions",
            multiplier: sectionLoadings.site,
            amount: basePremium * sectionLoadings.site,
        },
        {
            label: "Assessors / Consultants",
            multiplier: sectionLoadings.assessor,
            amount: basePremium * sectionLoadings.assessor,
        },
        {
            label: "General Surveyor Opinion",
            multiplier: sectionLoadings.opinion,
            amount: basePremium * sectionLoadings.opinion,
        },
    ].filter((item) => item.multiplier > 0);

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
            setAnswers((prev) => ({
                ...prev,
                directLabor: summary.isDirectLabor ? "yes" : null,
                assessorEngaged: summary.hasAssessor ? "yes" : null,
                assessorName: summary.hasAssessor ? "Policy-linked assessor" : "",
                assessorCompany: summary.hasAssessor ? "Policy-linked consultant" : "",
                assessorEmail: summary.hasAssessor ? "policy@example.com" : "",
            }));
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
        setAnswers(INITIAL_ANSWERS);
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
            `Base Premium (x):          ${fmt(basePremium)}`,
            `Effective Risk Factor:     ${(effectiveRiskFactor * 100).toFixed(2)}%`,
            ...loadings.map((l) => `  + ${l.label}: ${fmt(l.amount)}`),
            `Total Loading (capped):   ${fmt(totalLoadingAmount)}`,
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
                        Complete the underwriting sections below to evaluate the project. The calculator applies loading only after each section has been assessed and caps total loading at <strong>0.5x</strong> for a maximum effective factor of <strong>1.5x</strong>.
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
                        <strong> base premium as 0.25%</strong> of that value, then applies underwriting loadings up to
                        <strong> 0.5x</strong> to produce the effective risk factor.
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
                {/* ── Underwriting Assessment Flow ─────────────────────────────────── */}
                <div className="rounded-[2rem] border border-white/70 bg-white/90 p-6 shadow-[0_20px_60px_rgba(15,23,42,0.08)] backdrop-blur-xl">
                    <div className="flex flex-col gap-3 mb-1 sm:flex-row sm:items-center sm:justify-between">
                        <h2 className="text-base font-semibold text-gray-800 flex items-center gap-2">
                            <AlertTriangle className="w-4 h-4 text-amber-500" />
                            Underwriting Assessment Flow
                        </h2>
                        <div className="flex flex-wrap items-center gap-2">
                            <span className="text-[10px] font-semibold uppercase tracking-[0.2em] text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1">
                                Section-based
                            </span>
                            {isValid && (
                                <span className="text-xs text-amber-700 bg-amber-50 border border-amber-200 rounded-full px-3 py-1 font-medium">
                                    {loadings.length} loading section{loadings.length !== 1 ? "s" : ""}
                                </span>
                            )}
                        </div>
                    </div>
                    <div className="mb-5 rounded-2xl border border-amber-200 bg-amber-50/80 p-4 text-xs leading-6 text-amber-900 shadow-sm">
                        <p className="font-semibold mt-5">How the workflow works</p>
                        <p>
                            Each section begins with a primary question. The calculator applies loading only after the relevant subsection questions in that section have been evaluated.
                        </p>
                    </div>

                    <div className="space-y-3">
                        {[
                            {
                                key: "building" as SectionKey,
                                title: "1. Building Approval",
                                summary: answers.buildingApproval === "no"
                                    ? "+0.1x loading"
                                    : answers.buildingApproval === "yes"
                                        ? "No loading"
                                        : "Awaiting assessment",
                                content: (
                                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-sm font-semibold text-slate-800">Is there a valid Building Plan Approval?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => updateAnswer("buildingApproval", value)}
                                                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                        answers.buildingApproval === value
                                                            ? "bg-[#028835] text-white"
                                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {value === "yes" ? "Yes" : "No"}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {answers.buildingApproval === "no"
                                                ? "Loading applied: +0.1x"
                                                : answers.buildingApproval === "yes"
                                                    ? "No loading applied from this section."
                                                    : "Select Yes or No to determine the section loading."}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                key: "quality" as SectionKey,
                                title: "2. Quality of Construction",
                                summary: answers.directLabor === "yes"
                                    ? "+0.2x loading"
                                    : answers.directLabor === "no" && answers.contractorRegistered === "no" && answers.contractorClassification === "mismatch"
                                        ? "+0.1x loading"
                                        : answers.directLabor === "no"
                                            ? "Contractor assessment pending"
                                            : "Awaiting assessment",
                                content: (
                                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-sm font-semibold text-slate-800">Is this a Direct Labour Construction?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => updateAnswer("directLabor", value)}
                                                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                        answers.directLabor === value
                                                            ? "bg-[#028835] text-white"
                                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {value === "yes" ? "Yes" : "No"}
                                                </button>
                                            ))}
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            Select Yes if the project is not assigned to a commercial contractor and is being managed directly by the owner/developer.
                                        </p>

                                        {answers.directLabor === "yes" ? (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                                Immediate loading applied: +0.2x. Contractor questions are not applicable.
                                            </div>
                                        ) : answers.directLabor === "no" ? (
                                            <div className="space-y-3">
                                                <p className="text-sm font-semibold text-slate-800">Is the contractor registered?</p>
                                                <div className="flex flex-wrap gap-2">
                                                    {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                        <button
                                                            key={value}
                                                            type="button"
                                                            onClick={() => updateAnswer("contractorRegistered", value)}
                                                            className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                                answers.contractorRegistered === value
                                                                    ? "bg-[#028835] text-white"
                                                                    : "bg-white text-slate-600 hover:bg-slate-100"
                                                            }`}
                                                        >
                                                            {value === "yes" ? "Yes" : "No"}
                                                        </button>
                                                    ))}
                                                </div>
                                                {answers.contractorRegistered === "no" && (
                                                    <div className="space-y-3">
                                                        <p className="text-sm font-semibold text-slate-800">Contractor Classification</p>
                                                        <div className="flex flex-wrap gap-2">
                                                            {([
                                                                { value: "suitable" as ContractorClassificationOption, label: "Correct contractor category" },
                                                                { value: "mismatch" as ContractorClassificationOption, label: "Category mismatch" },
                                                            ]).map((option) => (
                                                                <button
                                                                    key={option.value}
                                                                    type="button"
                                                                    onClick={() => updateAnswer("contractorClassification", option.value)}
                                                                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                                        answers.contractorClassification === option.value
                                                                            ? "bg-[#028835] text-white"
                                                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                                                    }`}
                                                                >
                                                                    {option.label}
                                                                </button>
                                                            ))}
                                                        </div>
                                                        <p className="text-xs text-slate-500">
                                                            {answers.contractorClassification === "mismatch"
                                                                ? "Loading applied: +0.1x"
                                                                : answers.contractorClassification === "suitable"
                                                                    ? "No loading applied from this contractor mismatch rule."
                                                                    : "Select the contractor classification outcome to complete the section."}
                                                        </p>
                                                    </div>
                                                )}
                                            </div>
                                        ) : null}
                                    </div>
                                ),
                            },
                            {
                                key: "site" as SectionKey,
                                title: "3. Site Conditions",
                                summary: answers.siteHighRisk === "yes" || answers.siteEngineering === "yes"
                                    ? "+0.1x loading"
                                    : "No site loading",
                                content: (
                                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-slate-800">Is the project located in a high-risk site?</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => updateAnswer("siteHighRisk", value)}
                                                        className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                            answers.siteHighRisk === value
                                                                ? "bg-[#028835] text-white"
                                                                : "bg-white text-slate-600 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {value === "yes" ? "Yes" : "No"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <div className="space-y-2">
                                            <p className="text-sm font-semibold text-slate-800">Does the project require a basement or other special engineering considerations?</p>
                                            <div className="flex flex-wrap gap-2">
                                                {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                    <button
                                                        key={value}
                                                        type="button"
                                                        onClick={() => updateAnswer("siteEngineering", value)}
                                                        className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                            answers.siteEngineering === value
                                                                ? "bg-[#028835] text-white"
                                                                : "bg-white text-slate-600 hover:bg-slate-100"
                                                        }`}
                                                    >
                                                        {value === "yes" ? "Yes" : "No"}
                                                    </button>
                                                ))}
                                            </div>
                                        </div>
                                        <p className="text-xs text-slate-500">
                                            {answers.siteHighRisk === "yes" || answers.siteEngineering === "yes"
                                                ? "Site loading applied: +0.1x (capped)."
                                                : "No site loading applied until a risk indicator is selected."}
                                        </p>
                                    </div>
                                ),
                            },
                            {
                                key: "assessor" as SectionKey,
                                title: "4. Assessors / Consultants",
                                summary: answers.assessorEngaged === "yes"
                                    ? "Assessor details captured"
                                    : answers.assessorEngaged === "no"
                                        ? "+0.1x loading"
                                        : "Awaiting assessment",
                                content: (
                                    <div className="space-y-3 rounded-2xl border border-slate-200 bg-slate-50/70 p-4">
                                        <p className="text-sm font-semibold text-slate-800">Has an Assessor / Consultant been engaged for this project?</p>
                                        <div className="flex flex-wrap gap-2">
                                            {(["yes", "no"] as YesNoOption[]).map((value) => (
                                                <button
                                                    key={value}
                                                    type="button"
                                                    onClick={() => updateAnswer("assessorEngaged", value)}
                                                    className={`rounded-full px-3 py-2 text-sm font-medium transition ${
                                                        answers.assessorEngaged === value
                                                            ? "bg-[#028835] text-white"
                                                            : "bg-white text-slate-600 hover:bg-slate-100"
                                                    }`}
                                                >
                                                    {value === "yes" ? "Yes" : "No"}
                                                </button>
                                            ))}
                                        </div>
                                        {answers.assessorEngaged === "yes" ? (
                                            <div className="space-y-2">
                                                <input
                                                    value={answers.assessorName}
                                                    onChange={(e) => updateAnswer("assessorName", e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                    placeholder="Assessor / consultant name"
                                                />
                                                <input
                                                    value={answers.assessorCompany}
                                                    onChange={(e) => updateAnswer("assessorCompany", e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                    placeholder="Company / firm"
                                                />
                                                <input
                                                    value={answers.assessorEmail}
                                                    onChange={(e) => updateAnswer("assessorEmail", e.target.value)}
                                                    className="w-full rounded-2xl border border-slate-200 bg-white px-3 py-2 text-sm"
                                                    placeholder="Email"
                                                />
                                                <p className="text-xs text-slate-500">This section currently does not affect the premium calculation.</p>
                                            </div>
                                        ) : answers.assessorEngaged === "no" ? (
                                            <div className="rounded-xl border border-amber-200 bg-amber-50 p-3 text-sm text-amber-800">
                                                No assessor/consultant is assigned. A loading of +0.1x is applied from this section.
                                            </div>
                                        ) : null}
                                    </div>
                                ),
                            },
                        ].map((section) => (
                            <div key={section.key} className="rounded-2xl border border-slate-200 bg-white p-4 shadow-sm">
                                <button
                                    type="button"
                                    onClick={() => toggleSection(section.key)}
                                    className="flex w-full items-center justify-between gap-3 text-left"
                                >
                                    <div>
                                        <p className="text-sm font-semibold text-slate-800">{section.title}</p>
                                        <p className="text-xs text-slate-500">{section.summary}</p>
                                    </div>
                                    {openSections[section.key] ? <ChevronUp className="h-4 w-4 text-slate-500" /> : <ChevronDown className="h-4 w-4 text-slate-500" />}
                                </button>
                                {openSections[section.key] && <div className="mt-4">{section.content}</div>}
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
                    <div className="mt-4 flex items-center gap-2 rounded-2xl border border-slate-200 bg-slate-50/70 px-3 py-2 text-sm text-slate-600">
                        <input
                            id="opinion-risk-factor"
                            type="checkbox"
                            checked={answers.opinionHasRiskFactor}
                            onChange={(e) => updateAnswer("opinionHasRiskFactor", e.target.checked)}
                            className="h-4 w-4 rounded border-slate-300 text-[#028835] focus:ring-[#028835]"
                        />
                        <label htmlFor="opinion-risk-factor" className="cursor-pointer">
                            This opinion includes a risk factor
                        </label>
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

                                {/* Base premium x */}
                                <div className="flex justify-between items-center py-1.5 border-b border-gray-100">
                                    <span className="text-gray-600">
                                        Base Premium (x)&nbsp;<span className="text-gray-400 text-xs">(0.25% of value)</span>
                                    </span>
                                    <span className="text-blue-700 font-semibold">{fmt(basePremium)}</span>
                                </div>

                                {/* Loading amount */}
                                <div className="flex justify-between items-center py-1.5 border-b border-dashed border-gray-200">
                                    <span className="text-gray-700 font-semibold">
                                        Additional Loading&nbsp;<span className="text-gray-400 text-xs font-normal">(capped at 0.5x)</span>
                                    </span>
                                    <span className="font-semibold text-gray-900">{fmt(totalLoadingAmount)}</span>
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
                                            + {fmt(totalLoadingAmount)}
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
                                        0.25% base risk + {loadings.length} selected loading{loadings.length !== 1 ? "s" : ""}
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
                            ["Base Risk Factor (x)", "= 0.25%"],
                            ["Base Premium", "= EV × x"],
                            ["Additional Loading", "= x × loading fraction"],
                            ["No Building Plan Approval", "+ 0.2x"],
                            ["Direct Labor", "+ 0.2x"],
                            ["International Contractor", "+ 0.2x"],
                            ["Indigenous Contractor", "+ 0.1x"],
                            ["No Assessor", "+ 0.1x"],
                            ["No Site Assessment", "+ 0.1x"],
                            ["Maximum Loading", "≤ 0.5x"],
                        ].map(([label, val]) => (
                            <div key={label} className={`flex justify-between rounded-lg px-3 py-2 ${
                                label === "Base Premium" || label === "Base Risk Factor (x)" ? "bg-slate-600" : "bg-slate-700/50"
                            }`}>
                                <span>{label}</span>
                                <span className={`font-bold ${
                                    label === "Base Premium" || label === "Base Risk Factor (x)" ? "text-white" : "text-green-400"
                                }`}>{val}</span>
                            </div>
                        ))}
                    </div>
                    <p className="text-slate-500 text-xs mt-3">
                        x = 0.25% of estimated property value. Additional loadings are additive up to a maximum of <strong className="text-slate-300">0.5x</strong>, making the highest effective factor <strong className="text-slate-300">1.5x</strong>.
                        General surveyor opinion is captured as a note only.
                    </p>
                </div>
            </div>
        </div>
        </>
    );
}
