import React, { useState, useEffect, useRef, useCallback } from 'react';
import {
    X, Upload, Save, FileText, Camera, Phone, Mail, MessageSquare,
    CheckCircle, AlertCircle, ChevronDown, ChevronUp, Building2,
    MapPin, Users, Shield, ClipboardCheck, Image, Send
} from 'lucide-react';
import { Assignment, ContactLogEntry } from '@/types/api.types';
import { SurveySubmissionData } from '@/types/component.types';
import { toast } from "sonner";

interface SurveySubmissionModalProps {
    policy: any;
    assignment: Assignment;
    isOpen: boolean;
    onSubmit: (submission: FormData) => Promise<void>;
    onClose: () => void;
}

type TabId = 'location' | 'site' | 'conformity' | 'contractor' | 'agent' | 'structural' | 'images' | 'recommendation';

interface TabConfig {
    id: TabId;
    label: string;
    icon: React.ComponentType<{ className?: string }>;
    shortLabel: string;
}

const TABS: TabConfig[] = [
    { id: 'location',       label: 'Location Details',          shortLabel: 'Location',     icon: MapPin },
    { id: 'site',           label: 'Site Details',              shortLabel: 'Site',         icon: Building2 },
    { id: 'conformity',     label: 'Development Conformity',    shortLabel: 'Conformity',   icon: ClipboardCheck },
    { id: 'contractor',     label: 'Contractor & Consultant',   shortLabel: 'Contractor',   icon: Shield },
    { id: 'agent',          label: 'Agent / Developer',         shortLabel: 'Agent',        icon: Users },
    { id: 'structural',     label: 'Structural Assessment',     shortLabel: 'Structural',   icon: AlertCircle },
    { id: 'images',         label: 'Site Images & Documents',   shortLabel: 'Images',       icon: Image },
    { id: 'recommendation', label: 'Recommendation & Submit',   shortLabel: 'Submit',       icon: Send },
];

const inputCls = "w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-[#028835] focus:border-[#028835] text-sm transition-colors";
const labelCls = "block text-sm font-medium text-gray-700 mb-1";
const sectionCls = "bg-gray-50 border border-gray-200 rounded-lg p-4 space-y-4";
const sectionTitleCls = "text-sm font-semibold text-gray-800 flex items-center gap-2";

const RadioOption: React.FC<{
    name: string;
    value: string;
    checked: boolean;
    onChange: () => void;
    label: string;
    description?: string;
    color?: string;
}> = ({ name, value, checked, onChange, label, description, color = 'green' }) => (
    <label
        className={`flex items-start gap-3 p-3 rounded-lg border cursor-pointer transition-all ${
            checked
                ? `border-[#028835] bg-green-50 shadow-sm`
                : 'border-gray-200 hover:border-gray-300 hover:bg-gray-50'
        }`}
    >
        <input
            type="radio"
            name={name}
            value={value}
            checked={checked}
            onChange={onChange}
            className="mt-0.5 h-4 w-4 accent-[#028835]"
        />
        <div>
            <span className={`text-sm font-medium ${checked ? 'text-[#028835]' : 'text-gray-700'}`}>{label}</span>
            {description && <p className="text-xs text-gray-500 mt-0.5">{description}</p>}
        </div>
    </label>
);

const CheckboxOption: React.FC<{
    checked: boolean;
    onChange: () => void;
    label: string;
}> = ({ checked, onChange, label }) => (
    <label className="flex items-center gap-2 cursor-pointer">
        <input
            type="checkbox"
            checked={checked}
            onChange={onChange}
            className="h-4 w-4 accent-[#028835] rounded"
        />
        <span className="text-sm text-gray-700">{label}</span>
    </label>
);

const SurveySubmissionModal: React.FC<SurveySubmissionModalProps> = ({
    policy,
    assignment,
    isOpen,
    onSubmit,
    onClose,
}) => {
    const [activeTabIndex, setActiveTabIndex] = useState(0);
    const [loading, setLoading] = useState(false);
    const [uploadedFiles, setUploadedFiles] = useState<File[]>([]);
    const autoSaveTimerRef = useRef<NodeJS.Timeout | null>(null);
    const [lastSaved, setLastSaved] = useState<Date | null>(null);
    const [structuralExpanded, setStructuralExpanded] = useState(true);
    const [valuationExpanded, setValuationExpanded] = useState(true);
    const [riskExpanded, setRiskExpanded] = useState(true);

    // ─── Form State ────────────────────────────────────────────────────────────
    const [form, setForm] = useState({
        // Tab 1 – Location Details
        plotNumber: '',
        district: '',
        cadastralZone: '',
        landUse: '',
        purpose: '',
        plotSize: '',
        dateOfApproval: '',
        streetName: '',
        buildingType: '',
        proposedBuildingDescription: '',

        // Tab 2 – Site Details
        naturePlotWellDrained: false,
        naturePlotRocky: false,
        naturePlotWaterLogged: false,
        naturePlotOther: false,
        naturePlotOtherDescription: '',
        estimatedSlope: '',
        vacancyStatus: '',
        developmentDescription: '',
        previouslyApproved: '',

        // Tab 3 – Development Conformity
        conformsWithApproval: '',
        nonConformityDescription: '',
        levelOfService: '',

        // Tab 4 – Contractor & Consultant
        contractorPresentOnSite: '',
        contractorName: '',
        contractorCategory: '',
        consultantName: '',
        consultantCategory: '',

        // Tab 5 – Agent / Developer
        agentMetOnSite: '',
        agentName: '',
        agentDesignation: '',
        agentPhone: '',
        agentEmail: '',

        // Tab 6 – Structural Assessment
        structuralCondition: '',
        visibleCracks: '',
        foundationStatus: '',
        generalStructuralRemarks: '',

        // Property Valuation
        estimatedPropertyValue: '',
        valuationBasis: '' as SurveySubmissionData['surveyDetails']['valuationBasis'] | '',
        valuationRemarks: '',

        // Risk Assessment
        riskLevel: '' as SurveySubmissionData['surveyDetails']['riskLevel'] | '',
        riskRemarks: '',

        // Survey Notes (global)
        surveyNotes: '',

        // Tab 8 – Recommendation
        recommendedAction: '' as SurveySubmissionData['recommendedAction'] | '',
    });

    const updateForm = (key: keyof typeof form, value: any) =>
        setForm(prev => ({ ...prev, [key]: value }));

    const activeTab = TABS[activeTabIndex];
    const progress = Math.round(((activeTabIndex + 1) / TABS.length) * 100);

    // ─── Auto Save ─────────────────────────────────────────────────────────────
    const saveDraft = useCallback(() => {
        try {
            const policyId = policy?._id || assignment?.policyId;
            if (policyId) {
                localStorage.setItem(`survey_draft_${policyId}`, JSON.stringify(form));
                setLastSaved(new Date());
            }
        } catch { /* ignore quota errors */ }
    }, [form, policy, assignment]);

    useEffect(() => {
        if (!isOpen) return;
        autoSaveTimerRef.current = setInterval(saveDraft, 30_000);
        return () => { if (autoSaveTimerRef.current) clearInterval(autoSaveTimerRef.current); };
    }, [isOpen, saveDraft]);

    // Restore draft on open
    useEffect(() => {
        if (!isOpen) return;
        try {
            const policyId = policy?._id || assignment?.policyId;
            if (policyId) {
                const saved = localStorage.getItem(`survey_draft_${policyId}`);
                if (saved) {
                    const parsed = JSON.parse(saved);
                    setForm(prev => ({ ...prev, ...parsed }));
                }
            }
        } catch { /* ignore */ }
    }, [isOpen]);

    // ─── Tab change auto-save ───────────────────────────────────────────────────
    const goToTab = (idx: number) => {
        saveDraft();
        setActiveTabIndex(idx);
    };

    // ─── Validation helpers ─────────────────────────────────────────────────────
    const phoneRegex = /^(\+?234|0)[789][01]\d{8}$/;
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;

    // ─── Submit ─────────────────────────────────────────────────────────────────
    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();

        if (!form.recommendedAction) {
            toast.error('Please select a recommendation before submitting.');
            return;
        }
        if (form.agentMetOnSite === 'yes') {
            if (form.agentPhone && !phoneRegex.test(form.agentPhone)) {
                toast.error('Please enter a valid Nigerian phone number for the agent.');
                return;
            }
            if (form.agentEmail && !emailRegex.test(form.agentEmail)) {
                toast.error('Please enter a valid email address for the agent.');
                return;
            }
        }

        const surveyDetails = {
            propertyCondition: form.structuralCondition,
            structuralAssessment: form.generalStructuralRemarks,
            riskFactors: form.riskRemarks || '',
            recommendations: form.surveyNotes || '',
            estimatedValue: form.estimatedPropertyValue ? parseFloat(form.estimatedPropertyValue) : undefined,
            valuationBasis: form.valuationBasis || undefined,
            valuationRemarks: form.valuationRemarks || undefined,
            riskLevel: form.riskLevel || undefined,
            riskRemarks: form.riskRemarks || undefined,
            photos: [],
            // Extended fields passed as JSON
            locationDetails: {
                plotNumber: form.plotNumber,
                district: form.district,
                cadastralZone: form.cadastralZone,
                landUse: form.landUse,
                purpose: form.purpose,
                plotSize: form.plotSize,
                dateOfApproval: form.dateOfApproval,
                streetName: form.streetName,
                buildingType: form.buildingType,
                proposedBuildingDescription: form.proposedBuildingDescription,
            },
            siteDetails: {
                naturePlot: {
                    wellDrained: form.naturePlotWellDrained,
                    rocky: form.naturePlotRocky,
                    waterLogged: form.naturePlotWaterLogged,
                    other: form.naturePlotOther,
                    otherDescription: form.naturePlotOtherDescription,
                },
                estimatedSlope: form.estimatedSlope,
                vacancyStatus: form.vacancyStatus,
                developmentDescription: form.developmentDescription,
                previouslyApproved: form.previouslyApproved,
            },
            conformity: {
                conformsWithApproval: form.conformsWithApproval,
                nonConformityDescription: form.nonConformityDescription,
                levelOfService: form.levelOfService,
            },
            contractor: {
                presentOnSite: form.contractorPresentOnSite,
                name: form.contractorName,
                category: form.contractorCategory,
            },
            consultant: {
                name: form.consultantName,
                category: form.consultantCategory,
            },
            agent: {
                metOnSite: form.agentMetOnSite,
                name: form.agentName,
                designation: form.agentDesignation,
                phone: form.agentPhone,
                email: form.agentEmail,
            },
            structuralAssessmentDetails: {
                condition: form.structuralCondition,
                visibleCracks: form.visibleCracks,
                foundationStatus: form.foundationStatus,
                generalRemarks: form.generalStructuralRemarks,
            },
        };

        const submissionData = new FormData();
        submissionData.append('surveyNotes', form.surveyNotes);
        submissionData.append('recommendedAction', form.recommendedAction);
        submissionData.append('contactLog', JSON.stringify([]));
        submissionData.append('surveyDetails', JSON.stringify(surveyDetails));

        uploadedFiles.forEach(file => submissionData.append('documents', file));

        try {
            setLoading(true);
            await onSubmit(submissionData);
            // Clear draft on successful submit
            const policyId = policy?._id || assignment?.policyId;
            if (policyId) localStorage.removeItem(`survey_draft_${policyId}`);
        } catch {
            toast.error('Failed to submit survey. Please try again.');
        } finally {
            setLoading(false);
        }
    };

    // ─── File upload ────────────────────────────────────────────────────────────
    const handleFileChange = (files: FileList | null) => {
        if (!files) return;
        const maxSize = 5 * 1024 * 1024; // 5 MB
        const maxFiles = 20;
        const accepted = ['image/jpeg', 'image/png', 'image/jpg', 'application/pdf'];
        const newFiles: File[] = [];

        Array.from(files).forEach(file => {
            if (!accepted.includes(file.type)) {
                toast.error(`${file.name}: Only JPG, PNG and PDF files are allowed.`);
                return;
            }
            if (file.size > maxSize) {
                toast.error(`${file.name}: File exceeds 5 MB limit.`);
                return;
            }
            newFiles.push(file);
        });

        setUploadedFiles(prev => {
            const combined = [...prev, ...newFiles];
            if (combined.length > maxFiles) {
                toast.warning(`Maximum ${maxFiles} files allowed. Some files were not added.`);
                return combined.slice(0, maxFiles);
            }
            return combined;
        });
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4 z-50">
            <div className="bg-white rounded-xl shadow-2xl w-full max-w-4xl max-h-[95vh] overflow-hidden flex flex-col">

                {/* ── Header ───────────────────────────────────────────────── */}
                <div className="bg-gradient-to-r from-[#028835] to-[#025c24] text-white px-6 py-4 flex-shrink-0">
                    <div className="flex items-start justify-between">
                        <div>
                            <h2 className="text-xl font-bold">Survey Assessment Report</h2>
                            <p className="text-green-100 text-sm mt-0.5">
                                {policy?.project?.projectType || 'Construction Project'} — {policy?.project?.address || assignment?.location?.address || 'Address not available'}
                            </p>
                            {policy?.policyNumber && (
                                <span className="text-green-200 text-xs">Policy #{policy.policyNumber}</span>
                            )}
                        </div>
                        <button onClick={onClose} className="text-green-100 hover:text-white transition-colors mt-1">
                            <X className="w-5 h-5" />
                        </button>
                    </div>

                    {/* Progress bar */}
                    <div className="mt-3">
                        <div className="flex items-center justify-between text-xs text-green-100 mb-1">
                            <span>Step {activeTabIndex + 1} of {TABS.length} — {activeTab.label}</span>
                            <span>{progress}%</span>
                        </div>
                        <div className="h-1.5 bg-green-900/50 rounded-full overflow-hidden">
                            <div
                                className="h-full bg-white/80 rounded-full transition-all duration-500"
                                style={{ width: `${progress}%` }}
                            />
                        </div>
                    </div>
                    {lastSaved && (
                        <p className="text-green-200 text-xs mt-1">
                            Draft saved {lastSaved.toLocaleTimeString()}
                        </p>
                    )}
                </div>

                {/* ── Tab Navigation ───────────────────────────────────────── */}
                <div className="border-b border-gray-200 overflow-x-auto flex-shrink-0">
                    <nav className="flex min-w-max">
                        {TABS.map((tab, idx) => {
                            const Icon = tab.icon;
                            const isCurrent = idx === activeTabIndex;
                            const isDone = idx < activeTabIndex;
                            return (
                                <button
                                    key={tab.id}
                                    type="button"
                                    onClick={() => goToTab(idx)}
                                    className={`flex items-center gap-1.5 px-3 py-3 text-xs font-medium border-b-2 transition-colors whitespace-nowrap ${
                                        isCurrent
                                            ? 'border-[#028835] text-[#028835] bg-green-50/60'
                                            : isDone
                                                ? 'border-transparent text-green-600 hover:text-[#028835]'
                                                : 'border-transparent text-gray-400 hover:text-gray-600'
                                    }`}
                                >
                                    {isDone
                                        ? <CheckCircle className="w-3.5 h-3.5 text-green-500" />
                                        : <Icon className="w-3.5 h-3.5" />
                                    }
                                    {tab.shortLabel}
                                </button>
                            );
                        })}
                    </nav>
                </div>

                {/* ── Scrollable Form Body ─────────────────────────────────── */}
                <form onSubmit={handleSubmit} className="flex-1 overflow-y-auto">
                    <div className="p-6 space-y-5">

                        {/* ════════════════ TAB 1: LOCATION DETAILS ═══════════════ */}
                        {activeTab.id === 'location' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900">Location Details</h3>
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className={labelCls}>Plot Number</label>
                                        <input type="text" className={inputCls} value={form.plotNumber}
                                            onChange={e => updateForm('plotNumber', e.target.value)} placeholder="e.g. PLOT-001" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>District</label>
                                        <input type="text" className={inputCls} value={form.district}
                                            onChange={e => updateForm('district', e.target.value)} placeholder="e.g. Garki" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Cadastral Zone</label>
                                        <input type="text" className={inputCls} value={form.cadastralZone}
                                            onChange={e => updateForm('cadastralZone', e.target.value)} placeholder="e.g. A01" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Land Use</label>
                                        <select className={inputCls} value={form.landUse} onChange={e => updateForm('landUse', e.target.value)}>
                                            <option value="">Select land use</option>
                                            <option>Residential</option>
                                            <option>Commercial</option>
                                            <option>Industrial</option>
                                            <option>Mixed Use</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                    <div>
                                        <label className={labelCls}>Purpose</label>
                                        <input type="text" className={inputCls} value={form.purpose}
                                            onChange={e => updateForm('purpose', e.target.value)} placeholder="e.g. 4-bedroom duplex" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Plot Size (m²)</label>
                                        <input type="number" className={inputCls} value={form.plotSize}
                                            onChange={e => updateForm('plotSize', e.target.value)} placeholder="e.g. 750" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Date of Approval</label>
                                        <input type="date" className={inputCls} value={form.dateOfApproval}
                                            onChange={e => updateForm('dateOfApproval', e.target.value)} />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Street Name</label>
                                        <input type="text" className={inputCls} value={form.streetName}
                                            onChange={e => updateForm('streetName', e.target.value)} placeholder="e.g. Aminu Kano Crescent" />
                                    </div>
                                    <div>
                                        <label className={labelCls}>Building Type</label>
                                        <select className={inputCls} value={form.buildingType} onChange={e => updateForm('buildingType', e.target.value)}>
                                            <option value="">Select building type</option>
                                            <option>Bungalow</option>
                                            <option>Duplex</option>
                                            <option>Terrace</option>
                                            <option>Block of Flats</option>
                                            <option>Office Complex</option>
                                            <option>Warehouse</option>
                                            <option>Other</option>
                                        </select>
                                    </div>
                                </div>
                                <div>
                                    <label className={labelCls}>Proposed Building Description</label>
                                    <textarea className={inputCls} rows={3} value={form.proposedBuildingDescription}
                                        onChange={e => updateForm('proposedBuildingDescription', e.target.value)}
                                        placeholder="Brief description of the proposed building..." />
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 2: SITE DETAILS ═══════════════════ */}
                        {activeTab.id === 'site' && (
                            <div className="space-y-5">
                                <h3 className="text-base font-semibold text-gray-900">Site Details</h3>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Nature of Plot</p>
                                    <div className="grid grid-cols-2 gap-2">
                                        <CheckboxOption checked={form.naturePlotWellDrained} onChange={() => updateForm('naturePlotWellDrained', !form.naturePlotWellDrained)} label="Well Drained" />
                                        <CheckboxOption checked={form.naturePlotRocky} onChange={() => updateForm('naturePlotRocky', !form.naturePlotRocky)} label="Rocky" />
                                        <CheckboxOption checked={form.naturePlotWaterLogged} onChange={() => updateForm('naturePlotWaterLogged', !form.naturePlotWaterLogged)} label="Water Logged / Marshy" />
                                        <CheckboxOption checked={form.naturePlotOther} onChange={() => updateForm('naturePlotOther', !form.naturePlotOther)} label="Other" />
                                    </div>
                                    {form.naturePlotOther && (
                                        <div>
                                            <label className={labelCls}>Other Description</label>
                                            <input type="text" className={inputCls} value={form.naturePlotOtherDescription}
                                                onChange={e => updateForm('naturePlotOtherDescription', e.target.value)}
                                                placeholder="Describe other nature..." />
                                        </div>
                                    )}
                                </div>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Estimated Slope</p>
                                    <div className="space-y-2">
                                        {[
                                            { value: 'below_5', label: 'Below 5% (Relatively Flat)' },
                                            { value: '5_8', label: '5% – 8% (Sloppy)' },
                                            { value: '8_12', label: '8% – 12% (Steep)' },
                                            { value: '12_18', label: '12% – 18% (Very Steep)' },
                                            { value: 'above_18', label: 'Above 18% (Hilly)' },
                                        ].map(opt => (
                                            <RadioOption key={opt.value} name="slope" value={opt.value}
                                                checked={form.estimatedSlope === opt.value}
                                                onChange={() => updateForm('estimatedSlope', opt.value)}
                                                label={opt.label} />
                                        ))}
                                    </div>
                                </div>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Vacancy Status</p>
                                    <div className="space-y-2">
                                        <RadioOption name="vacancy" value="vacant" checked={form.vacancyStatus === 'vacant'}
                                            onChange={() => updateForm('vacancyStatus', 'vacant')} label="Vacant" />
                                        <RadioOption name="vacancy" value="not_vacant" checked={form.vacancyStatus === 'not_vacant'}
                                            onChange={() => updateForm('vacancyStatus', 'not_vacant')} label="Not Vacant" />
                                    </div>
                                    {form.vacancyStatus === 'not_vacant' && (
                                        <div className="mt-3 space-y-3">
                                            <div>
                                                <label className={labelCls}>Description of Development on Site</label>
                                                <textarea className={inputCls} rows={3} value={form.developmentDescription}
                                                    onChange={e => updateForm('developmentDescription', e.target.value)}
                                                    placeholder="Describe the existing development..." />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Was development previously approved?</label>
                                                <div className="space-y-2 mt-1">
                                                    <RadioOption name="prevApproval" value="yes" checked={form.previouslyApproved === 'yes'}
                                                        onChange={() => updateForm('previouslyApproved', 'yes')} label="Yes" />
                                                    <RadioOption name="prevApproval" value="no" checked={form.previouslyApproved === 'no'}
                                                        onChange={() => updateForm('previouslyApproved', 'no')} label="No" />
                                                </div>
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 3: CONFORMITY ═════════════════════ */}
                        {activeTab.id === 'conformity' && (
                            <div className="space-y-5">
                                <h3 className="text-base font-semibold text-gray-900">Development Conformity</h3>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Does development conform with approved submission?</p>
                                    <div className="space-y-2">
                                        <RadioOption name="conforms" value="yes" checked={form.conformsWithApproval === 'yes'}
                                            onChange={() => updateForm('conformsWithApproval', 'yes')} label="Yes" />
                                        <RadioOption name="conforms" value="no" checked={form.conformsWithApproval === 'no'}
                                            onChange={() => updateForm('conformsWithApproval', 'no')} label="No" />
                                    </div>
                                    {form.conformsWithApproval === 'no' && (
                                        <div className="mt-3">
                                            <label className={labelCls}>Nature of Non-Conformity</label>
                                            <textarea className={inputCls} rows={3} value={form.nonConformityDescription}
                                                onChange={e => updateForm('nonConformityDescription', e.target.value)}
                                                placeholder="Describe the nature of non-conformity..." />
                                        </div>
                                    )}
                                </div>

                                <div>
                                    <label className={labelCls}>Level of Service</label>
                                    <select className={inputCls} value={form.levelOfService} onChange={e => updateForm('levelOfService', e.target.value)}>
                                        <option value="">Select level of service</option>
                                        <option value="excellent">Excellent</option>
                                        <option value="good">Good</option>
                                        <option value="fair">Fair</option>
                                        <option value="poor">Poor</option>
                                    </select>
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 4: CONTRACTOR & CONSULTANT ════════ */}
                        {activeTab.id === 'contractor' && (
                            <div className="space-y-5">
                                <h3 className="text-base font-semibold text-gray-900">Contractor & Consultant Information</h3>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Contractor</p>
                                    <div>
                                        <label className={labelCls}>Contractor Present On Site?</label>
                                        <div className="space-y-2 mt-1">
                                            <RadioOption name="contractorPresent" value="yes" checked={form.contractorPresentOnSite === 'yes'}
                                                onChange={() => updateForm('contractorPresentOnSite', 'yes')} label="Yes" />
                                            <RadioOption name="contractorPresent" value="no" checked={form.contractorPresentOnSite === 'no'}
                                                onChange={() => updateForm('contractorPresentOnSite', 'no')} label="No" />
                                        </div>
                                    </div>
                                    {form.contractorPresentOnSite === 'yes' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className={labelCls}>Contractor Name</label>
                                                <input type="text" className={inputCls} value={form.contractorName}
                                                    onChange={e => updateForm('contractorName', e.target.value)} placeholder="Contractor full name" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Contractor Category</label>
                                                <select className={inputCls} value={form.contractorCategory} onChange={e => updateForm('contractorCategory', e.target.value)}>
                                                    <option value="">Select category</option>
                                                    <option>Category A</option>
                                                    <option>Category B</option>
                                                    <option>Category C</option>
                                                    <option>Category D</option>
                                                    <option>Category E</option>
                                                    <option>Category F</option>
                                                </select>
                                            </div>
                                        </div>
                                    )}
                                </div>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>Consultant</p>
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className={labelCls}>Consultant Name</label>
                                            <input type="text" className={inputCls} value={form.consultantName}
                                                onChange={e => updateForm('consultantName', e.target.value)} placeholder="Consultant full name" />
                                        </div>
                                        <div>
                                            <label className={labelCls}>Consultant Category</label>
                                            <select className={inputCls} value={form.consultantCategory} onChange={e => updateForm('consultantCategory', e.target.value)}>
                                                <option value="">Select category</option>
                                                <option>Architect</option>
                                                <option>Civil/Structural Engineer</option>
                                                <option>Quantity Surveyor</option>
                                                <option>Town Planner</option>
                                                <option>Other</option>
                                            </select>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 5: AGENT / DEVELOPER ══════════════ */}
                        {activeTab.id === 'agent' && (
                            <div className="space-y-5">
                                <h3 className="text-base font-semibold text-gray-900">Agent / Developer Information</h3>
                                <div className={sectionCls}>
                                    <div>
                                        <label className={labelCls}>Agent Met On Site?</label>
                                        <div className="space-y-2 mt-1">
                                            <RadioOption name="agentMet" value="yes" checked={form.agentMetOnSite === 'yes'}
                                                onChange={() => updateForm('agentMetOnSite', 'yes')} label="Yes" />
                                            <RadioOption name="agentMet" value="no" checked={form.agentMetOnSite === 'no'}
                                                onChange={() => updateForm('agentMetOnSite', 'no')} label="No" />
                                        </div>
                                    </div>
                                    {form.agentMetOnSite === 'yes' && (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-3">
                                            <div>
                                                <label className={labelCls}>Agent / Developer Name</label>
                                                <input type="text" className={inputCls} value={form.agentName}
                                                    onChange={e => updateForm('agentName', e.target.value)} placeholder="Full name" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Designation</label>
                                                <input type="text" className={inputCls} value={form.agentDesignation}
                                                    onChange={e => updateForm('agentDesignation', e.target.value)} placeholder="e.g. Developer, Agent, Owner" />
                                            </div>
                                            <div>
                                                <label className={labelCls}>Phone Number</label>
                                                <input type="tel" className={inputCls} value={form.agentPhone}
                                                    onChange={e => updateForm('agentPhone', e.target.value)}
                                                    placeholder="e.g. 08012345678" />
                                                {form.agentPhone && !phoneRegex.test(form.agentPhone) && (
                                                    <p className="text-xs text-red-500 mt-1">Enter a valid Nigerian phone number (e.g. 08012345678)</p>
                                                )}
                                            </div>
                                            <div>
                                                <label className={labelCls}>Email Address</label>
                                                <input type="email" className={inputCls} value={form.agentEmail}
                                                    onChange={e => updateForm('agentEmail', e.target.value)}
                                                    placeholder="agent@example.com" />
                                                {form.agentEmail && !emailRegex.test(form.agentEmail) && (
                                                    <p className="text-xs text-red-500 mt-1">Enter a valid email address</p>
                                                )}
                                            </div>
                                        </div>
                                    )}
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 6: STRUCTURAL ASSESSMENT ══════════ */}
                        {activeTab.id === 'structural' && (
                            <div className="space-y-4">
                                <h3 className="text-base font-semibold text-gray-900">Structural & Property Assessment</h3>

                                {/* Structural Condition */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        onClick={() => setStructuralExpanded(v => !v)}>
                                        <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-gray-500" /> Structural Condition
                                        </span>
                                        {structuralExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {structuralExpanded && (
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className={labelCls}>Structural Condition</label>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    {['Excellent', 'Good', 'Fair', 'Poor'].map(opt => (
                                                        <RadioOption key={opt} name="structCond" value={opt.toLowerCase()}
                                                            checked={form.structuralCondition === opt.toLowerCase()}
                                                            onChange={() => updateForm('structuralCondition', opt.toLowerCase())}
                                                            label={opt} />
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Visible Cracks?</label>
                                                <div className="flex gap-3 mt-1">
                                                    <RadioOption name="cracks" value="yes" checked={form.visibleCracks === 'yes'}
                                                        onChange={() => updateForm('visibleCracks', 'yes')} label="Yes" />
                                                    <RadioOption name="cracks" value="no" checked={form.visibleCracks === 'no'}
                                                        onChange={() => updateForm('visibleCracks', 'no')} label="No" />
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Foundation Status</label>
                                                <select className={inputCls} value={form.foundationStatus} onChange={e => updateForm('foundationStatus', e.target.value)}>
                                                    <option value="">Select foundation status</option>
                                                    <option value="sound">Sound</option>
                                                    <option value="minor_issues">Minor Issues</option>
                                                    <option value="major_issues">Major Issues</option>
                                                    <option value="unknown">Unknown / Not Visible</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>General Structural Remarks</label>
                                                <textarea className={inputCls} rows={3} value={form.generalStructuralRemarks}
                                                    onChange={e => updateForm('generalStructuralRemarks', e.target.value)}
                                                    placeholder="Overall structural assessment remarks..." />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Property Valuation */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        onClick={() => setValuationExpanded(v => !v)}>
                                        <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                            <Shield className="w-4 h-4 text-gray-500" /> Property Valuation
                                        </span>
                                        {valuationExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {valuationExpanded && (
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className={labelCls}>Estimated Property Value (₦)</label>
                                                <div className="relative">
                                                    <span className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-500 font-medium text-sm">₦</span>
                                                    <input
                                                        type="number"
                                                        className={`${inputCls} pl-7`}
                                                        value={form.estimatedPropertyValue}
                                                        onChange={e => updateForm('estimatedPropertyValue', e.target.value)}
                                                        placeholder="0"
                                                        min="0"
                                                    />
                                                </div>
                                                {form.estimatedPropertyValue && (
                                                    <p className="text-xs text-green-700 mt-1">
                                                        ₦{Number(form.estimatedPropertyValue).toLocaleString('en-NG')}
                                                    </p>
                                                )}
                                            </div>
                                            <div>
                                                <label className={labelCls}>Valuation Basis</label>
                                                <select className={inputCls} value={form.valuationBasis}
                                                    onChange={e => updateForm('valuationBasis', e.target.value as any)}>
                                                    <option value="">Select valuation basis</option>
                                                    <option value="current_construction_cost">Current Construction Cost</option>
                                                    <option value="replacement_cost">Replacement Cost</option>
                                                    <option value="market_value_estimate">Market Value Estimate</option>
                                                    <option value="professional_assessment">Professional Assessment</option>
                                                    <option value="other">Other</option>
                                                </select>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Valuation Remarks</label>
                                                <textarea className={inputCls} rows={3} value={form.valuationRemarks}
                                                    onChange={e => updateForm('valuationRemarks', e.target.value)}
                                                    placeholder="Explain the basis for the valuation..." />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* Risk Assessment */}
                                <div className="border border-gray-200 rounded-lg overflow-hidden">
                                    <button type="button"
                                        className="w-full flex items-center justify-between px-4 py-3 bg-gray-50 hover:bg-gray-100 transition-colors"
                                        onClick={() => setRiskExpanded(v => !v)}>
                                        <span className="text-sm font-semibold text-gray-800 flex items-center gap-2">
                                            <AlertCircle className="w-4 h-4 text-orange-500" /> Risk Assessment
                                        </span>
                                        {riskExpanded ? <ChevronUp className="w-4 h-4" /> : <ChevronDown className="w-4 h-4" />}
                                    </button>
                                    {riskExpanded && (
                                        <div className="p-4 space-y-4">
                                            <div>
                                                <label className={labelCls}>Risk Level</label>
                                                <div className="grid grid-cols-2 gap-2 mt-1">
                                                    {[
                                                        { value: 'low',      label: 'Low Risk',      color: 'bg-green-50 border-green-300 text-green-700' },
                                                        { value: 'medium',   label: 'Medium Risk',   color: 'bg-yellow-50 border-yellow-300 text-yellow-700' },
                                                        { value: 'high',     label: 'High Risk',     color: 'bg-orange-50 border-orange-300 text-orange-700' },
                                                        { value: 'critical', label: 'Critical Risk', color: 'bg-red-50 border-red-300 text-red-700' },
                                                    ].map(opt => (
                                                        <label key={opt.value}
                                                            className={`flex items-center gap-2 p-3 rounded-lg border cursor-pointer transition-all ${
                                                                form.riskLevel === opt.value ? opt.color : 'border-gray-200 hover:bg-gray-50'
                                                            }`}>
                                                            <input type="radio" name="riskLevel" value={opt.value}
                                                                checked={form.riskLevel === opt.value}
                                                                onChange={() => updateForm('riskLevel', opt.value as any)}
                                                                className="h-4 w-4" />
                                                            <span className="text-sm font-medium">{opt.label}</span>
                                                        </label>
                                                    ))}
                                                </div>
                                            </div>
                                            <div>
                                                <label className={labelCls}>Risk Remarks</label>
                                                <textarea className={inputCls} rows={3} value={form.riskRemarks}
                                                    onChange={e => updateForm('riskRemarks', e.target.value)}
                                                    placeholder="Describe identified risk factors and exposure..." />
                                            </div>
                                        </div>
                                    )}
                                </div>

                                {/* General Survey Notes */}
                                <div>
                                    <label className={labelCls}>General Survey Notes</label>
                                    <textarea className={inputCls} rows={3} value={form.surveyNotes}
                                        onChange={e => updateForm('surveyNotes', e.target.value)}
                                        placeholder="Any additional observations from the site visit..." />
                                </div>
                            </div>
                        )}

                        {/* ════════════════ TAB 7: SITE IMAGES & DOCUMENTS ════════ */}
                        {activeTab.id === 'images' && (
                            <div className="space-y-5">
                                <h3 className="text-base font-semibold text-gray-900">Site Images & Documents</h3>
                                <p className="text-sm text-gray-500">
                                    Upload site photographs and supporting documents. Max 5 MB per file, up to 20 files. Accepted: JPG, PNG, PDF.
                                </p>

                                {/* Suggested categories */}
                                <div className="bg-blue-50 border border-blue-200 rounded-lg p-3">
                                    <p className="text-xs font-semibold text-blue-800 mb-2">Suggested Upload Categories</p>
                                    <div className="flex flex-wrap gap-1.5">
                                        {['Front View', 'Rear View', 'Left Elevation', 'Right Elevation', 'Foundation', 'Structural Components', 'Site Overview', 'Other'].map(cat => (
                                            <span key={cat} className="text-xs bg-white border border-blue-200 text-blue-700 px-2 py-0.5 rounded-full">{cat}</span>
                                        ))}
                                    </div>
                                </div>

                                {/* Drop zone */}
                                <label
                                    htmlFor="survey-file-upload"
                                    className="flex flex-col items-center justify-center border-2 border-dashed border-gray-300 rounded-xl p-10 text-center cursor-pointer hover:border-[#028835] hover:bg-green-50/30 transition-all"
                                >
                                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                                    <p className="text-sm font-medium text-gray-700">Drag & drop files here</p>
                                    <p className="text-xs text-gray-500 mt-1">or click to select files</p>
                                    <span className="mt-3 inline-flex items-center gap-1.5 px-4 py-2 bg-[#028835] text-white text-sm rounded-lg hover:bg-green-700 transition-colors">
                                        <Camera className="w-4 h-4" /> Choose Files
                                    </span>
                                    <input id="survey-file-upload" type="file" multiple accept=".jpg,.jpeg,.png,.pdf"
                                        className="hidden"
                                        onChange={e => handleFileChange(e.target.files)} />
                                </label>

                                {/* File list */}
                                {uploadedFiles.length > 0 && (
                                    <div>
                                        <p className="text-sm font-semibold text-gray-700 mb-2">
                                            Uploaded Files ({uploadedFiles.length}/20)
                                        </p>
                                        <div className="space-y-2">
                                            {uploadedFiles.map((file, idx) => {
                                                const isImage = file.type.startsWith('image/');
                                                return (
                                                    <div key={idx} className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-lg">
                                                        <div className="flex items-center gap-3">
                                                            {isImage
                                                                ? <img src={URL.createObjectURL(file)} alt={file.name}
                                                                    className="w-10 h-10 rounded object-cover border border-green-300" />
                                                                : <div className="w-10 h-10 rounded bg-red-50 border border-red-200 flex items-center justify-center">
                                                                    <FileText className="w-5 h-5 text-red-500" />
                                                                  </div>
                                                            }
                                                            <div>
                                                                <p className="text-sm font-medium text-gray-900 max-w-xs truncate">{file.name}</p>
                                                                <p className="text-xs text-gray-500">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                                                            </div>
                                                        </div>
                                                        <button type="button"
                                                            onClick={() => setUploadedFiles(prev => prev.filter((_, i) => i !== idx))}
                                                            className="text-red-500 hover:text-red-700 transition-colors">
                                                            <X className="w-5 h-5" />
                                                        </button>
                                                    </div>
                                                );
                                            })}
                                        </div>
                                    </div>
                                )}
                            </div>
                        )}

                        {/* ════════════════ TAB 8: RECOMMENDATION & SUBMIT ════════ */}
                        {activeTab.id === 'recommendation' && (
                            <div className="space-y-6">
                                <h3 className="text-base font-semibold text-gray-900">Surveyor Recommendation & Submission</h3>

                                <div className={sectionCls}>
                                    <p className={sectionTitleCls}>
                                        <CheckCircle className="w-4 h-4 text-[#028835]" />
                                        Recommendation Status
                                    </p>
                                    <p className="text-xs text-gray-500">Select your professional recommendation based on the site assessment.</p>
                                    <div className="space-y-3 mt-2">
                                        <RadioOption name="recommendation" value="approve"
                                            checked={form.recommendedAction === 'approve'}
                                            onChange={() => updateForm('recommendedAction', 'approve')}
                                            label="Recommend for Approval"
                                            description="The site and development fully meet requirements for insurance coverage." />
                                        <RadioOption name="recommendation" value="request_more_info"
                                            checked={form.recommendedAction === 'request_more_info'}
                                            onChange={() => updateForm('recommendedAction', 'request_more_info')}
                                            label="Recommend for Further Inspection"
                                            description="Additional information or inspection is needed before a final decision can be made." />
                                        <RadioOption name="recommendation" value="reject"
                                            checked={form.recommendedAction === 'reject'}
                                            onChange={() => updateForm('recommendedAction', 'reject')}
                                            label="Recommend for Rejection"
                                            description="The development does not meet the requirements for insurance coverage." />
                                    </div>
                                </div>

                                {/* Summary checklist */}
                                <div className="bg-gray-50 border border-gray-200 rounded-lg p-4">
                                    <p className="text-sm font-semibold text-gray-700 mb-3">Assessment Summary</p>
                                    <div className="space-y-2">
                                        {[
                                            { label: 'Location Details',             done: !!(form.plotNumber || form.district) },
                                            { label: 'Site Details',                  done: !!(form.estimatedSlope || form.vacancyStatus) },
                                            { label: 'Development Conformity',        done: !!form.conformsWithApproval },
                                            { label: 'Contractor & Consultant',       done: !!form.contractorPresentOnSite },
                                            { label: 'Agent / Developer',             done: !!form.agentMetOnSite },
                                            { label: 'Structural Assessment',         done: !!form.structuralCondition },
                                            { label: 'Property Valuation',            done: !!(form.estimatedPropertyValue && form.valuationBasis) },
                                            { label: 'Risk Assessment',               done: !!form.riskLevel },
                                            { label: 'Site Images',                  done: uploadedFiles.length > 0 },
                                            { label: 'Recommendation Selected',      done: !!form.recommendedAction },
                                        ].map(item => (
                                            <div key={item.label} className="flex items-center justify-between">
                                                <span className="text-sm text-gray-600">{item.label}</span>
                                                {item.done
                                                    ? <CheckCircle className="w-4 h-4 text-green-500" />
                                                    : <AlertCircle className="w-4 h-4 text-gray-300" />
                                                }
                                            </div>
                                        ))}
                                    </div>
                                </div>

                                {!form.recommendedAction && (
                                    <div className="bg-amber-50 border border-amber-200 rounded-lg p-3 flex items-start gap-2">
                                        <AlertCircle className="w-4 h-4 text-amber-500 mt-0.5 flex-shrink-0" />
                                        <p className="text-sm text-amber-700">Please select a recommendation status before submitting.</p>
                                    </div>
                                )}
                            </div>
                        )}
                    </div>

                    {/* ── Footer ───────────────────────────────────────────── */}
                    <div className="flex items-center justify-between gap-3 px-6 py-4 border-t border-gray-200 bg-gray-50 flex-shrink-0">
                        <div className="flex gap-2">
                            <button type="button" onClick={() => goToTab(Math.max(0, activeTabIndex - 1))}
                                disabled={activeTabIndex === 0}
                                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 disabled:opacity-40 disabled:cursor-not-allowed transition-colors">
                                ← Previous
                            </button>
                            {activeTabIndex < TABS.length - 1 && (
                                <button type="button" onClick={() => goToTab(activeTabIndex + 1)}
                                    className="px-4 py-2 text-sm bg-[#028835] text-white rounded-lg hover:bg-green-700 transition-colors">
                                    Next →
                                </button>
                            )}
                        </div>
                        <div className="flex gap-2">
                            <button type="button" onClick={saveDraft}
                                className="px-4 py-2 text-sm text-gray-700 bg-white border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors flex items-center gap-1.5">
                                <Save className="w-4 h-4" /> Save Draft
                            </button>
                            <button type="button" onClick={onClose}
                                className="px-4 py-2 text-sm text-gray-600 bg-white border border-gray-200 rounded-lg hover:bg-gray-50 transition-colors">
                                Cancel
                            </button>
                            {activeTab.id === 'recommendation' && (
                                <button type="submit" disabled={loading || !form.recommendedAction}
                                    className="px-5 py-2 text-sm bg-[#028835] text-white rounded-lg hover:bg-green-700 disabled:opacity-50 disabled:cursor-not-allowed transition-colors flex items-center gap-2">
                                    {loading
                                        ? <><div className="animate-spin rounded-full h-4 w-4 border-b-2 border-white" /><span>Submitting…</span></>
                                        : <><Send className="w-4 h-4" /><span>Submit SAR</span></>
                                    }
                                </button>
                            )}
                        </div>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default SurveySubmissionModal;