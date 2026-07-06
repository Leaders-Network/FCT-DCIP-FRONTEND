"use client";

import React from 'react';
import { BuilderLiabilityPolicy } from '@/types/builderLiabilityPolicy.types';
import { builderLiabilityPolicyAPI } from '@/services/builderLiabilityPolicyApi';
import { downloadProtectedFileByPath } from '@/services/api';
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Button } from '@/components/ui/button';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { toast } from 'sonner';
import { openSARReport, downloadSARReport } from './SARReportGenerator';
import {
    getClientEmail,
    getClientName,
    getClientPhone,
    getDisplayValue,
    getProfessionalBody,
    getProfessionalRegistrationNumber,
    getProjectAddress,
    getProjectDistrict,
    getProjectEstimateBand,
    getProjectLga,
    getProjectTitle
} from '@/utils/builderLiability';
import {
    Building,
    User,
    MapPin,
    Calendar,
    Phone,
    Mail,
    FileText,
    Shield,
    Users,
    Briefcase,
    AlertCircle,
    CheckCircle,
    XCircle,
    Clock,
    CreditCard,
    Eye,
    Download,
    X,
    Loader2,
    Receipt
} from 'lucide-react';

interface PolicyDetailsModalProps {
    policy: BuilderLiabilityPolicy | null;
    isOpen: boolean;
    onClose: () => void;
}

export const PolicyDetailsModal: React.FC<PolicyDetailsModalProps> = ({
    policy,
    isOpen,
    onClose
}) => {
    const [isCalculatingPremium, setIsCalculatingPremium] = React.useState(false);
    const [isDownloadingReceipt, setIsDownloadingReceipt] = React.useState(false);
    const [isGeneratingSAR, setIsGeneratingSAR] = React.useState(false);
    const [premiumResult, setPremiumResult] = React.useState<null | {
        premiumAmount: number;
        premiumDetails?: {
            amount?: number;
            currency?: string;
            invoiceNumber?: string | null;
            transactionReference?: string | null;
        };
        nextAction?: {
            type: string;
            label: string;
            method?: string;
            url?: string;
        } | null;
    }>(null);

    React.useEffect(() => {
        setPremiumResult(null);
        setIsCalculatingPremium(false);
        setIsDownloadingReceipt(false);
        setIsGeneratingSAR(false);
    }, [policy?._id, isOpen]);

    if (!policy) return null;

    const firstMeaningfulValue = (...values: unknown[]) => {
        for (const value of values) {
            if (value === null || value === undefined) continue;
            if (typeof value === 'string' && value.trim() === '') continue;
            return value;
        }
        return null;
    };

    const firstFiniteNumber = (...values: unknown[]) => {
        for (const value of values) {
            if (value === null || value === undefined) continue;
            const numericValue = Number(
                typeof value === 'string' ? value.replace(/,/g, '').trim() : value
            );
            if (Number.isFinite(numericValue)) {
                return numericValue;
            }
        }
        return null;
    };

    const normalizeBoolean = (value: unknown): boolean | null => {
        if (typeof value === 'boolean') return value;
        if (typeof value === 'number') {
            if (value === 1) return true;
            if (value === 0) return false;
        }
        if (typeof value === 'string') {
            const normalized = value.trim().toLowerCase();
            if (['true', 'yes', '1', 'y'].includes(normalized)) return true;
            if (['false', 'no', '0', 'n'].includes(normalized)) return false;
        }
        return null;
    };

    const toDisplayText = (value: unknown, fallback = 'N/A') => {
        if (value === null || value === undefined) return fallback;
        if (typeof value === 'string') {
            const trimmed = value.trim();
            return trimmed === '' ? fallback : trimmed;
        }
        return String(value);
    };

    // Helper function to get the actual current status from statusHistory if available
    const getActualStatus = (policy: BuilderLiabilityPolicy): string => {
        const latestStatus =
            policy.statusHistory && policy.statusHistory.length > 0
                ? policy.statusHistory[policy.statusHistory.length - 1]?.status
                : policy.status;

        const paymentAlreadyCompleted =
            policy.paymentInfo?.status === 'paid' || Boolean(policy.paymentInfo?.paidAt);

        if (latestStatus === 'completed' && !paymentAlreadyCompleted) {
            if ((policy as any).surveyorRecommendation === 'approve') {
                return 'payment_pending';
            }
            if ((policy as any).surveyorRecommendation === 'reject') {
                return 'rejected';
            }
            if ((policy as any).surveyorRecommendation === 'request_more_info') {
                return 'requires_more_info';
            }
        }

        if (policy.status === 'paid_niip_failed') {
            return 'paid_niip_failed';
        }

        return latestStatus || 'draft';
    };

    const actualStatus = getActualStatus(policy);
    const resolvedAction =
        premiumResult?.nextAction ||
        policy.primaryAction ||
        policy.nextAction ||
        policy.workflow?.nextAction ||
        policy.availableActions?.[0] ||
        null;
    const shouldShowCalculatePremiumButton = Boolean(
        policy.showCalculatePremiumButton ||
        (policy.canCalculatePremium && !policy.premiumCalculated) ||
        resolvedAction?.type === 'calculate_premium' ||
        (actualStatus === 'approved' &&
            (policy as any).surveyorRecommendation === 'approve' &&
            !policy.premiumCalculated)
    );
    const shouldShowProceedToPaymentButton = Boolean(
        policy.canProceedToPayment ||
        resolvedAction?.type === 'initialize_payment' ||
        actualStatus === 'payment_pending'
    );

    const handleCalculatePremium = async () => {
        try {
            setIsCalculatingPremium(true);
            const response = await builderLiabilityPolicyAPI.calculatePremium(policy._id);
            setPremiumResult({
                premiumAmount: response.data?.premiumAmount,
                premiumDetails: response.data?.premiumDetails,
                nextAction: response.data?.nextAction || null
            });

            toast.success(
                response.data?.premiumDetails?.invoiceNumber
                    ? `Premium calculated. Invoice ${response.data.premiumDetails.invoiceNumber} is ready.`
                    : 'Premium calculated successfully.'
            );
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Failed to calculate premium';
            toast.error(message);
        } finally {
            setIsCalculatingPremium(false);
        }
    };

    const handleDownloadReceipt = async () => {
        try {
            setIsDownloadingReceipt(true);
            await downloadProtectedFileByPath(
                `/payment/receipt/${policy._id}`,
                `payment-receipt-${policy.policyNumber || 'policy'}.pdf`
            );
            toast.success('Payment receipt downloaded successfully.');
        } catch (error: any) {
            const message =
                error?.response?.data?.message ||
                error?.message ||
                'Unable to download the payment receipt right now.';
            toast.error(message);
        } finally {
            setIsDownloadingReceipt(false);
        }
    };

    const formatCurrency = (amount: number) => {
        return new Intl.NumberFormat('en-NG', {
            style: 'currency',
            currency: 'NGN'
        }).format(amount);
    };

    const formatDate = (date: string | Date) => {
        return new Date(date).toLocaleDateString('en-NG', {
            year: 'numeric',
            month: 'long',
            day: 'numeric'
        });
    };

    const complianceData = ((policy as any)?.compliance || {}) as Record<string, unknown>;
    const hasInsurance = normalizeBoolean(
        firstMeaningfulValue(complianceData.HasInsurance, complianceData.hasInsurance)
    );
    const underInvestigation = normalizeBoolean(
        firstMeaningfulValue(complianceData.investigation, complianceData.underInvestigation)
    );
    const disciplinaryAction = normalizeBoolean(
        firstMeaningfulValue(
            complianceData.disciplinaryCommittee,
            complianceData.disciplinaryAction
        )
    );
    const preEmploymentCheck = normalizeBoolean(
        firstMeaningfulValue(complianceData.preEmploymentCheck, complianceData.preEmployment)
    );
    const hasInsuranceDetails = toDisplayText(
        firstMeaningfulValue(
            complianceData.HasInsuranceDetails,
            complianceData.hasInsuranceDetails,
            complianceData.insuranceDetails
        ),
        ''
    );
    const investigationDetails = toDisplayText(
        firstMeaningfulValue(complianceData.investigationDetails),
        ''
    );
    const disciplinaryDetails = toDisplayText(
        firstMeaningfulValue(
            complianceData.disciplinaryCommitteeDetails,
            complianceData.disciplinaryDetails
        ),
        ''
    );
    const preEmploymentDetails = toDisplayText(
        firstMeaningfulValue(
            complianceData.preEmploymentCheckDetails,
            complianceData.preEmploymentDetails
        ),
        ''
    );
    const legalSuitDetails = toDisplayText(
        firstMeaningfulValue(complianceData.legalSuitDetails),
        ''
    );
    const practiceOutsideNigeria = toDisplayText(
        firstMeaningfulValue(
            complianceData.PracticeOutsideNigeria,
            complianceData.practiceOutsideNigeria
        ),
        'N/A'
    );

    const niipPayload = ((policy as any)?.niipPayload || {}) as Record<string, any>;
    const niipPayloadData = (niipPayload.Data || niipPayload.data || {}) as Record<string, any>;
    const paymentInfo = ((policy as any)?.paymentInfo || {}) as Record<string, any>;
    const paymentWebhookData = (paymentInfo.webhookData || {}) as Record<string, any>;

    const paymentStatusToken = String(
        firstMeaningfulValue(
            paymentInfo.status,
            actualStatus === 'payment_pending' ? 'pending' : null
        ) || 'pending'
    )
        .trim()
        .toLowerCase();
    const isPaymentPaid = paymentStatusToken === 'paid' || Boolean(paymentInfo.paidAt);
    const isPaymentPending =
        !isPaymentPaid &&
        (['pending', 'not_started'].includes(paymentStatusToken) ||
            actualStatus === 'payment_pending');
    const paymentStatusLabel = paymentStatusToken
        .replace(/_/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    const paymentStatusBadgeClass = isPaymentPaid
        ? 'bg-emerald-100 text-emerald-800 border-emerald-200'
        : ['failed', 'rejected'].includes(paymentStatusToken)
            ? 'bg-rose-100 text-rose-800 border-rose-200'
            : 'bg-amber-100 text-amber-800 border-amber-200';

    const premiumAmount = firstFiniteNumber(
        paymentInfo.amount,
        paymentInfo.niipInvoiceAmount,
        premiumResult?.premiumDetails?.amount,
        premiumResult?.premiumAmount,
        niipPayload.amount,
        niipPayload.invoiceAmount,
        niipPayloadData.amount,
        niipPayloadData.invoiceAmount
    );
    const niipInvoiceNumber = toDisplayText(
        firstMeaningfulValue(
            paymentInfo.niipInvoice,
            premiumResult?.premiumDetails?.invoiceNumber,
            niipPayload.invoiceNumber,
            niipPayload.InvoiceNumber,
            niipPayloadData.invoiceNumber,
            niipPayloadData.InvoiceNumber,
            paymentWebhookData.niipInvoiceNumber
        )
    );
    const niipTransactionReference = toDisplayText(
        firstMeaningfulValue(
            paymentInfo.niipReference,
            premiumResult?.premiumDetails?.transactionReference,
            niipPayload.transactionReference,
            niipPayload.TransactionReference,
            niipPayloadData.transactionReference,
            niipPayloadData.TransactionReference,
            paymentWebhookData.niipTransactionReference
        )
    );
    const paymentTransactionId = toDisplayText(
        firstMeaningfulValue(
            paymentInfo.transactionId,
            paymentWebhookData.EgolepayTransactionReference,
            paymentWebhookData.EgolepayPaymentReference,
            paymentWebhookData.EgolepayReference
        )
    );
    const paymentSummaryText = isPaymentPaid
        ? 'Premium paid'
        : isPaymentPending
            ? 'Premium payment pending'
            : `Payment ${paymentStatusLabel.toLowerCase()}`;

    const getBooleanText = (value: boolean | null) => {
        if (value === null) return 'Not Provided';
        return value ? 'Yes' : 'No';
    };

    const assessorProfessionalBody = getProfessionalBody(policy.organization);
    const assessorRegistrationNumber = getProfessionalRegistrationNumber(policy.organization);
    const projectTitle = getProjectTitle(policy.project);
    const projectAddress = getProjectAddress(policy.project, policy.builder);
    const projectLga = getProjectLga(policy.project);
    const projectDistrict = getProjectDistrict(policy.project);
    const projectEstimateBand = getProjectEstimateBand(policy.project);
    const clientName = getClientName(policy.client);
    const clientEmail = getClientEmail(policy.client);
    const clientPhone = getClientPhone(policy.client);

    const getStatusBadge = (status: string) => {
        const statusConfig = {
            draft: { color: 'bg-gray-100 text-gray-800', icon: Clock, label: 'Draft' },
            submitted: { color: 'bg-yellow-100 text-yellow-800', icon: Clock, label: 'Submitted' },
            assigned: { color: 'bg-blue-100 text-blue-800', icon: AlertCircle, label: 'Assigned' },
            surveyed: { color: 'bg-purple-100 text-purple-800', icon: Eye, label: 'Surveyed' },
            approved: { color: 'bg-green-100 text-green-800', icon: CheckCircle, label: 'Approved' },
            payment_pending: { color: 'bg-orange-100 text-orange-800', icon: CreditCard, label: 'Awaiting Payment' },
            rejected: { color: 'bg-red-100 text-red-800', icon: XCircle, label: 'Rejected' },
            requires_more_info: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            revision_required: { color: 'bg-amber-100 text-amber-800', icon: AlertCircle, label: 'Needs Info' },
            completed: { color: 'bg-emerald-100 text-emerald-800', icon: CheckCircle, label: 'Completed' },
            sent_to_user: { color: 'bg-cyan-100 text-cyan-800', icon: CheckCircle, label: 'Sent to User' },
            paid_niip_failed: { color: 'bg-rose-100 text-rose-800', icon: AlertCircle, label: 'Payment OK, NIIP Failed' }
        };

        const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.submitted;
        const Icon = config.icon;

        return (
            <Badge className={`${config.color} flex items-center gap-1`}>
                <Icon className="w-3 h-3" />
                {config.label}
            </Badge>
        );
    };

    const tabTriggerClass = "relative h-11 px-4 sm:px-5 text-xs sm:text-sm font-medium text-slate-500 border-b-2 border-transparent rounded-none bg-transparent transition-all duration-200 hover:text-slate-800 hover:bg-slate-50/80 data-[state=active]:text-emerald-700 data-[state=active]:border-emerald-600 whitespace-nowrap flex items-center gap-1.5";

    // ── Inner UI helpers (display-only, no state) ────────────────────────────
    const InfoRow = ({ label, value, icon: Icon, full = false }: {
        label: string;
        value?: string | React.ReactNode;
        icon?: React.ElementType;
        full?: boolean;
    }) => (
        <div className={full ? 'col-span-full' : ''}>
            <dt className="flex items-center gap-1 text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-0.5">
                {Icon && <Icon className="w-3 h-3" />}
                {label}
            </dt>
            <dd className="text-sm font-medium text-slate-900 leading-snug">
                {value ?? <span className="text-slate-400 italic text-xs">Not provided</span>}
            </dd>
        </div>
    );

    const SectionCard = ({ icon: Icon, title, children }: {
        icon: React.ElementType;
        title: string;
        children: React.ReactNode;
    }) => (
        <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
            <div className="flex items-center gap-2 px-5 py-3.5 border-b border-slate-100 bg-slate-50/60">
                <Icon className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <h3 className="text-sm font-semibold text-slate-700">{title}</h3>
            </div>
            <div className="p-5">{children}</div>
        </div>
    );

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="w-[94vw] max-w-5xl max-h-[94vh] flex flex-col overflow-hidden rounded-2xl border-0 shadow-2xl p-0 gap-0">

                {/* ── Sticky Header ──────────────────────────────────────────── */}
                <div className="flex-shrink-0 bg-gradient-to-br from-green-900 via-green-800 to-green-700 px-6 py-5 rounded-t-2xl">
                    <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                        <div className="min-w-0">
                            <div className="flex items-center gap-2 mb-1">
                                <Shield className="w-3.5 h-3.5 text-emerald-400 flex-shrink-0" />
                                <span className="text-[10px] font-semibold text-emerald-400 uppercase tracking-widest">Builder Liability Policy</span>
                            </div>
                            <DialogTitle className="text-xl font-bold text-white sm:text-2xl leading-tight">
                                {clientName || 'Policy Details'}
                            </DialogTitle>
                            <p className="mt-0.5 text-sm text-slate-400 truncate max-w-md">
                                {projectTitle || projectAddress || 'No project title provided'}
                            </p>
                        </div>
                        <div className="flex flex-wrap items-center gap-2 flex-shrink-0">
                            {getStatusBadge(getActualStatus(policy))}
                            <Badge variant="outline" className="rounded-full border-slate-600 bg-slate-700/50 px-3 py-1 text-slate-300 text-xs">
                                {policy.priority?.toUpperCase() || 'MEDIUM'} priority
                            </Badge>
                        </div>
                    </div>
                    {/* Quick-facts strip */}
                    <div className="mt-4 flex flex-wrap gap-2">
                        {policy.policyNumber && (
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1">
                                <FileText className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">#{policy.policyNumber}</span>
                            </div>
                        )}
                        {clientEmail && (
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1">
                                <Mail className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">{clientEmail}</span>
                            </div>
                        )}
                        {projectLga && (
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1">
                                <MapPin className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">{projectLga}</span>
                            </div>
                        )}
                        {projectEstimateBand && (
                            <div className="flex items-center gap-1.5 rounded-full bg-slate-700/60 px-3 py-1">
                                <Briefcase className="w-3 h-3 text-slate-400" />
                                <span className="text-xs text-slate-300">{projectEstimateBand}</span>
                            </div>
                        )}
                    </div>
                </div>

                <Tabs defaultValue="client" className="flex flex-col flex-1 min-h-0">
                    {/* ── Tab Strip ──────────────────────────────────────────── */}
                    <div className="flex-shrink-0 border-b border-slate-200 bg-white">
                        <div className="overflow-x-auto">
                            <TabsList className="flex bg-transparent p-0 h-auto gap-0 w-max min-w-full">
                                {([
                                    { value: 'client',       icon: User,       label: 'Client' },
                                    { value: 'builder',      icon: Building,   label: 'Contractor' },
                                    { value: 'organization', icon: Shield,     label: 'Assessor' },
                                    { value: 'project',      icon: Briefcase,  label: 'Project' },
                                    { value: 'workforce',    icon: Users,      label: 'Workforce' },
                                    { value: 'compliance',   icon: FileText,   label: 'Compliance' },
                                    { value: 'payment',      icon: CreditCard, label: 'Payment' },
                                    { value: 'timeline',     icon: Calendar,   label: 'Timeline' },
                                    { value: 'survey',       icon: Eye,        label: 'SAR' },
                                ] as const).map(({ value, icon: Icon, label }) => (
                                    <TabsTrigger key={value} value={value} className={tabTriggerClass}>
                                        <Icon className="w-3.5 h-3.5" />
                                        {label}
                                    </TabsTrigger>
                                ))}
                            </TabsList>
                        </div>
                    </div>

                    {/* ── Scrollable Content ─────────────────────────────────── */}
                    <div className="flex-1 overflow-y-auto bg-slate-50/40 p-5 space-y-5">

                        {/* CLIENT */}
                        <TabsContent value="client" className="m-0">
                            <SectionCard icon={User} title="Client Information">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="Full Name / Company"     value={getDisplayValue(clientName)} />
                                    <InfoRow label="Email Address" icon={Mail}  value={getDisplayValue(clientEmail)} />
                                    <InfoRow label="Phone Number"  icon={Phone} value={getDisplayValue(clientPhone)} />
                                    <InfoRow label="Identification Type"     value={getDisplayValue(policy.client?.identificationType)} />
                                    <InfoRow label="Identification Number"   value={getDisplayValue(policy.client?.identificationNumber)} />
                                    <InfoRow label="RC Number"               value={getDisplayValue(policy.client?.rcNumber)} />
                                    <InfoRow label="Address" icon={MapPin}      value={getDisplayValue(policy.client?.address)} full />
                                </dl>
                            </SectionCard>
                        </TabsContent>

                        {/* CONTRACTOR */}
                        <TabsContent value="builder" className="m-0">
                            {(policy as any).isDirectLabor ? (
                                <div className="flex flex-col items-center justify-center py-12 px-6 rounded-xl bg-amber-50 border border-amber-200 text-center">
                                    <div className="rounded-full bg-amber-100 p-3 mb-3">
                                        <AlertCircle className="w-6 h-6 text-amber-600" />
                                    </div>
                                    <p className="text-base font-semibold text-amber-900">Direct Labor Project</p>
                                    <p className="text-sm text-amber-700 mt-1 max-w-md">
                                        This project is not assigned to a commercial general contractor. No contractor details are required.
                                    </p>
                                </div>
                            ) : (
                                <SectionCard icon={Building} title="Contractor / Builder Information">
                                    <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                        <InfoRow label="Contractor / Company Name" value={policy.builder?.nameOfBuilder || undefined} />
                                        <InfoRow label="Director of Company"       value={policy.builder?.directorOfCompany || undefined} />
                                        <InfoRow label="RC Number"                 value={policy.builder?.rcNumber || undefined} />
                                        <InfoRow label="Email Address" icon={Mail}    value={policy.builder?.customerEmail || undefined} />
                                        <InfoRow label="Phone Number"  icon={Phone}   value={policy.builder?.telNo || undefined} />
                                        <InfoRow label="Director ID Type" value={
                                            policy.builder?.identification?.identificationTypeId === 1 ? 'National ID' :
                                            policy.builder?.identification?.identificationTypeId === 2 ? 'Passport' :
                                            policy.builder?.identification?.identificationTypeId === 3 ? "Driver's License" : 'Other'
                                        } />
                                        <InfoRow label="Director ID Number" value={policy.builder?.identification?.identityNo || undefined} />
                                        <InfoRow label="Address" icon={MapPin}        value={policy.builder?.address || undefined} full />
                                    </dl>
                                </SectionCard>
                            )}
                        </TabsContent>

                        {/* ASSESSOR */}
                        <TabsContent value="organization" className="m-0 space-y-5">
                            <SectionCard icon={Shield} title="Assessor Details">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="Assessor Name"          value={policy.organization?.assessorName || undefined} />
                                    <InfoRow label="Regulatory Body"        value={getDisplayValue(assessorProfessionalBody)} />
                                    <InfoRow label="Registration Number"    value={getDisplayValue(assessorRegistrationNumber)} />
                                    <InfoRow label="Practice License"       value={getDisplayValue(policy.organization?.practiceLicenseNumber)} />
                                    <InfoRow label="Year of Registration"   value={policy.organization?.yearOfRegistration ? formatDate(policy.organization.yearOfRegistration) : undefined} />
                                    <InfoRow label="Area of Specialization" value={getDisplayValue(policy.organization?.areaOfSpecialization)} />
                                    <InfoRow label="Staff Strength"         value={toDisplayText(firstMeaningfulValue(policy.organization?.staffStrength, policy.organization?.noOfPermanentStaff, policy.organization?.permanentStaffCount), 'Not provided')} />
                                    {assessorProfessionalBody === 'Other' && (
                                        <InfoRow label="Other Body Name" value={getDisplayValue(policy.organization?.otherProfessionalBodyName)} />
                                    )}
                                </dl>
                            </SectionCard>
                            <SectionCard icon={Users} title="Membership Information">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="NIA Membership Status" full value={
                                        policy.membership?.MembershipStatusId === 1 ? 'Member — Nigerian Insurers Association (NIA)' :
                                        policy.membership?.MembershipStatusId === 2 ? 'Not a member of NIA' : 'Unknown'
                                    } />
                                    {policy.membership?.MembershipName && <InfoRow label="Membership Description" value={policy.membership.MembershipName} />}
                                    {(policy.membership?.MemberId || policy.membership?.MembershipNo) && (
                                        <InfoRow label="NIA Member ID" value={policy.membership.MemberId || policy.membership.MembershipNo} />
                                    )}
                                    {policy.membership?.ProfessionalBodyName && (
                                        <InfoRow label="Regulatory Body" value={policy.membership.ProfessionalBodyName} />
                                    )}
                                </dl>
                            </SectionCard>
                        </TabsContent>

                        {/* PROJECT */}
                        <TabsContent value="project" className="m-0">
                            <SectionCard icon={Briefcase} title="Project Details">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
                                    <InfoRow label="Property Title"      value={getDisplayValue(projectTitle)} />
                                    <InfoRow label="Project Type"        value={getDisplayValue(policy.project?.projectType)} />
                                    <InfoRow label="Coverage Type"       value={policy.project?.coverTypeIdxDetails || undefined} />
                                    <InfoRow label="Statutory Cover"     value={(typeof policy.project?.isStatutory === 'boolean' ? policy.project.isStatutory : policy.project?.coverTypeIdx) ? 'Yes' : 'No'} />
                                    <InfoRow label="Contractor Type"     value={getDisplayValue(policy.project?.contractorType)} />
                                    <InfoRow label="Contractor Category" value={
                                        policy.project?.categoryOfContractorId === 1 ? 'Class A – Minor (₦2m–₦5m)' :
                                        policy.project?.categoryOfContractorId === 2 ? 'Class B – Small (₦5m–₦10m)' :
                                        policy.project?.categoryOfContractorId === 3 ? 'Class C – Medium (₦10m–₦50m)' :
                                        policy.project?.categoryOfContractorId === 4 ? 'Class D – Upper Medium (₦50m–₦250m)' :
                                        policy.project?.categoryOfContractorId === 5 ? 'Class E – Large (₦250m–₦1B)' :
                                        policy.project?.categoryOfContractorId === 6 ? 'Class F – Mega (₦1B+)' : 'Other'
                                    } />
                                    <InfoRow label="Estimated Sum Range"   value={getDisplayValue(projectEstimateBand)} />
                                    <InfoRow label="Total Estimate Ceiling" value={<span className="text-emerald-700 font-bold">{formatCurrency(policy.project?.totalEstimateSum || 0)}</span>} />
                                    <InfoRow label="Extra Hazardous" value={
                                        policy.project?.extraHazardous
                                            ? <Badge variant="destructive" className="text-[10px]">Yes — Hazardous</Badge>
                                            : <Badge variant="outline" className="text-[10px]">No</Badge>
                                    } />
                                    <InfoRow label="Plot Number"      value={getDisplayValue(policy.project?.plotNumber || policy.project?.agisNo)} />
                                    <InfoRow label="Project LGA"      value={getDisplayValue(projectLga)} />
                                    <InfoRow label="Project District" value={getDisplayValue(projectDistrict)} />
                                    <InfoRow label="Cadastral Zone"   value={getDisplayValue(policy.project?.cadastralZone)} />
                                    <InfoRow label="Location / Address" icon={MapPin} value={getDisplayValue(projectAddress)} full />
                                    <InfoRow label="Work Details"       value={policy.project?.workDetails || undefined} full />
                                </dl>
                            </SectionCard>
                        </TabsContent>

                        {/* WORKFORCE */}
                        <TabsContent value="workforce" className="m-0 space-y-5">
                            <SectionCard icon={Users} title="Workforce Summary">
                                <dl className="grid grid-cols-2 sm:grid-cols-4 gap-x-6 gap-y-5">
                                    <InfoRow label="Contract Staff"   value={String(policy.workforce?.contractStaffCount ?? 0)} />
                                    <InfoRow label="Blood Relations"  value={String(policy.workforce?.bloodRelationsCount ?? 0)} />
                                </dl>
                            </SectionCard>
                            {policy.workforce?.categoryOfWorkmen && policy.workforce.categoryOfWorkmen.length > 0 && (
                                <SectionCard icon={Users} title="Categories of Workmen">
                                    <div className="space-y-3">
                                        {policy.workforce.categoryOfWorkmen.map((workman, index) => (
                                            <div key={index} className="grid grid-cols-3 gap-4 p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Category</dt><dd className="text-sm font-medium text-slate-900 mt-0.5">{workman.categoryOfWorkmen}</dd></div>
                                                <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Employees</dt><dd className="text-sm font-medium text-slate-900 mt-0.5">{workman.numberOfEmployment}</dd></div>
                                                <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Years</dt><dd className="text-sm font-medium text-slate-900 mt-0.5">{workman.yearsOfEmployment}</dd></div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                            {policy.workforce?.professionals && policy.workforce.professionals.length > 0 && (
                                <SectionCard icon={Briefcase} title="Professional Staff">
                                    <div className="space-y-3">
                                        {policy.workforce.professionals.map((prof, index) => (
                                            <div key={index} className="p-3 rounded-lg bg-slate-50 border border-slate-100">
                                                <p className="text-sm font-semibold text-slate-900 mb-2">{prof.surname} {prof.otherName}</p>
                                                <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
                                                    <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Profession</dt><dd className="text-xs text-slate-700 mt-0.5">{prof.profession}</dd></div>
                                                    <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Qualification</dt><dd className="text-xs text-slate-700 mt-0.5">{prof.qualification}</dd></div>
                                                    <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Experience</dt><dd className="text-xs text-slate-700 mt-0.5">{prof.yearsInEmployment} yrs</dd></div>
                                                    <div><dt className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest">Gender / Age</dt><dd className="text-xs text-slate-700 mt-0.5">{prof.gender}, {prof.age}</dd></div>
                                                </div>
                                            </div>
                                        ))}
                                    </div>
                                </SectionCard>
                            )}
                        </TabsContent>

                        {/* COMPLIANCE */}
                        <TabsContent value="compliance" className="m-0">
                            <SectionCard icon={FileText} title="Compliance Information">
                                <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                                    {([
                                        { label: 'Has Insurance Coverage', value: hasInsurance,       trueColor: 'bg-emerald-50 border-emerald-200 text-emerald-800', falseColor: 'bg-slate-50 border-slate-200 text-slate-600', trueIcon: CheckCircle, falseIcon: XCircle },
                                        { label: 'Under Investigation',     value: underInvestigation, trueColor: 'bg-rose-50 border-rose-200 text-rose-800',           falseColor: 'bg-emerald-50 border-emerald-200 text-emerald-800', trueIcon: AlertCircle, falseIcon: CheckCircle },
                                        { label: 'Disciplinary Action',    value: disciplinaryAction,  trueColor: 'bg-rose-50 border-rose-200 text-rose-800',           falseColor: 'bg-emerald-50 border-emerald-200 text-emerald-800', trueIcon: AlertCircle, falseIcon: CheckCircle },
                                        { label: 'Pre-Employment Check',   value: preEmploymentCheck, trueColor: 'bg-emerald-50 border-emerald-200 text-emerald-800', falseColor: 'bg-slate-50 border-slate-200 text-slate-600',     trueIcon: CheckCircle, falseIcon: XCircle },
                                    ] as const).map(({ label, value, trueColor, falseColor, trueIcon: TIcon, falseIcon: FIcon }) => {
                                        const colorClass = value === true ? trueColor : value === false ? falseColor : 'bg-slate-50 border-slate-200 text-slate-500';
                                        const Icon = value === true ? TIcon : value === false ? FIcon : Clock;
                                        return (
                                            <div key={label} className={`flex items-center justify-between rounded-lg border px-4 py-3 ${colorClass}`}>
                                                <span className="text-sm font-medium">{label}</span>
                                                <div className="flex items-center gap-1.5"><Icon className="w-4 h-4" /><span className="text-xs font-semibold">{getBooleanText(value)}</span></div>
                                            </div>
                                        );
                                    })}
                                </div>
                                <dl className="space-y-4">
                                    {hasInsuranceDetails && <InfoRow label="Insurance Details"      value={hasInsuranceDetails} />}
                                    {investigationDetails && <InfoRow label="Investigation Details" value={investigationDetails} />}
                                    {disciplinaryDetails  && <InfoRow label="Disciplinary Details"  value={disciplinaryDetails} />}
                                    {preEmploymentDetails && <InfoRow label="Pre-Employment Details" value={preEmploymentDetails} />}
                                    {legalSuitDetails     && <InfoRow label="Legal Suit Details"    value={legalSuitDetails} />}
                                    <InfoRow label="Practice Outside Nigeria" value={practiceOutsideNigeria} />
                                </dl>
                            </SectionCard>
                        </TabsContent>

                        {/* PAYMENT */}
                        <TabsContent value="payment" className="m-0 space-y-5">
                            <div className={`rounded-xl border p-5 ${isPaymentPaid ? 'bg-emerald-50 border-emerald-200' : isPaymentPending ? 'bg-amber-50 border-amber-200' : 'bg-slate-50 border-slate-200'}`}>
                                <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-3">
                                    <div>
                                        <p className="text-[10px] font-semibold uppercase tracking-widest text-slate-500">Premium Amount</p>
                                        <p className="text-3xl font-bold text-slate-900 mt-1">
                                            {premiumAmount !== null ? formatCurrency(premiumAmount) : <span className="text-slate-400 text-xl italic">Not yet calculated</span>}
                                        </p>
                                    </div>
                                    <div className="flex flex-col items-start sm:items-end gap-1">
                                        <Badge className={`border ${paymentStatusBadgeClass} text-xs px-3 py-1`}>
                                            {isPaymentPaid ? 'PAID' : isPaymentPending ? 'PENDING' : paymentStatusLabel.toUpperCase()}
                                        </Badge>
                                        <span className="text-xs text-slate-500">{paymentSummaryText}</span>
                                    </div>
                                </div>
                            </div>
                            <SectionCard icon={Receipt} title="Payment Records">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 gap-x-6 gap-y-5">
                                    <InfoRow label="Payment Status"  value={paymentStatusLabel || 'Pending'} />
                                    <InfoRow label="Payment Method"  value={toDisplayText(paymentInfo.method, 'External Payment Service')} />
                                    <InfoRow label="Initiated At"    value={paymentInfo.initiatedAt ? formatDate(paymentInfo.initiatedAt as string | Date) : undefined} />
                                    <InfoRow label="Paid At"         value={paymentInfo.paidAt ? formatDate(paymentInfo.paidAt as string | Date) : undefined} />
                                    <InfoRow label="NIIP Invoice #"  value={niipInvoiceNumber !== 'N/A' ? niipInvoiceNumber : undefined} />
                                    <InfoRow label="NIIP Reference"  value={niipTransactionReference !== 'N/A' ? niipTransactionReference : undefined} />
                                    {paymentInfo.reason && <InfoRow label="Failure Reason" value={toDisplayText(paymentInfo.reason)} full />}
                                </dl>
                                {!isPaymentPaid && (
                                    <div className="mt-5 rounded-lg border border-dashed border-slate-200 bg-slate-50 p-4 text-sm text-slate-500 text-center">
                                        A downloadable receipt will appear here once payment has been confirmed.
                                    </div>
                                )}
                            </SectionCard>
                            {premiumResult?.premiumDetails && (
                                <div className="rounded-xl border border-amber-200 bg-amber-50 p-5">
                                    <div className="flex items-center gap-2 mb-4">
                                        <Receipt className="w-4 h-4 text-amber-700" />
                                        <h3 className="text-sm font-semibold text-amber-900">Premium Calculation Result</h3>
                                    </div>
                                    <dl className="grid grid-cols-1 sm:grid-cols-3 gap-x-6 gap-y-4">
                                        <div>
                                            <dt className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Amount</dt>
                                            <dd className="text-lg font-bold text-amber-950 mt-0.5">{formatCurrency(Number(premiumResult.premiumDetails.amount || premiumResult.premiumAmount || 0))}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">Invoice Number</dt>
                                            <dd className="text-sm font-semibold text-amber-950 mt-0.5">{premiumResult.premiumDetails.invoiceNumber || 'N/A'}</dd>
                                        </div>
                                        <div>
                                            <dt className="text-[10px] font-semibold text-amber-600 uppercase tracking-widest">NIIP Reference</dt>
                                            <dd className="text-sm font-semibold text-amber-950 mt-0.5 break-all">{premiumResult.premiumDetails.transactionReference || 'N/A'}</dd>
                                        </div>
                                    </dl>
                                </div>
                            )}
                        </TabsContent>

                        {/* TIMELINE */}
                        <TabsContent value="timeline" className="m-0">
                            <SectionCard icon={Calendar} title="Policy Timeline">
                                <dl className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5 mb-6">
                                    <InfoRow label="Created At"    value={formatDate(policy.createdAt)} />
                                    <InfoRow label="Last Updated"  value={formatDate(policy.updatedAt)} />
                                    <InfoRow label="Deadline"      value={<span className="text-orange-600 font-semibold">{formatDate(policy.deadline)}</span>} />
                                    <InfoRow label="Payment Status" value={
                                        <Badge variant={policy.paymentInfo?.status === 'paid' ? 'default' : 'outline'} className="text-[10px]">
                                            {policy.paymentInfo?.status?.toUpperCase() || 'PENDING'}
                                        </Badge>
                                    } />
                                </dl>
                                {policy.statusHistory && policy.statusHistory.length > 0 && (
                                    <div>
                                        <h4 className="text-[10px] font-semibold text-slate-400 uppercase tracking-widest mb-3">Status History</h4>
                                        <div className="space-y-0">
                                            {policy.statusHistory.map((history, index) => (
                                                <div key={index} className="flex gap-3 pb-4 last:pb-0">
                                                    <div className="flex flex-col items-center">
                                                        <div className="w-2 h-2 rounded-full bg-emerald-500 mt-1.5 flex-shrink-0" />
                                                        {index < policy.statusHistory!.length - 1 && <div className="w-px flex-1 bg-slate-200 mt-1" />}
                                                    </div>
                                                    <div className="pb-1">
                                                        {getStatusBadge(history.status)}
                                                        <p className="text-xs text-slate-500 mt-1">{formatDate(history.changedAt)}</p>
                                                        {history.reason && <p className="text-xs text-slate-700 mt-0.5">{history.reason}</p>}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                                {(policy.surveyNotes || policy.adminNotes) && (
                                    <div className="space-y-3 mt-5">
                                        {policy.surveyNotes && (
                                            <div className="rounded-lg bg-blue-50 border border-blue-100 p-4">
                                                <p className="text-[10px] font-semibold text-blue-600 uppercase tracking-widest mb-1">Survey Notes</p>
                                                <p className="text-sm text-blue-900">{policy.surveyNotes}</p>
                                            </div>
                                        )}
                                        {policy.adminNotes && (
                                            <div className="rounded-lg bg-yellow-50 border border-yellow-100 p-4">
                                                <p className="text-[10px] font-semibold text-yellow-700 uppercase tracking-widest mb-1">Admin Notes</p>
                                                <p className="text-sm text-yellow-900">{policy.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </SectionCard>
                        </TabsContent>

                        {/* SAR */}
                        <TabsContent value="survey" className="m-0">
                            {!(policy as any).surveyorRecommendation ? (
                                <div className="flex flex-col items-center justify-center py-16 text-center">
                                    <div className="rounded-full bg-slate-100 p-4 mb-4"><Eye className="w-8 h-8 text-slate-400" /></div>
                                    <p className="font-semibold text-slate-700">No survey assessment yet</p>
                                    <p className="text-sm text-slate-500 mt-1">The SAR will appear here once a surveyor completes the assessment.</p>
                                </div>
                            ) : (
                                <>
                                    <div className={`flex items-start gap-3 p-4 rounded-xl border mb-5 ${
                                        (policy as any).surveyorRecommendation === 'approve' ? 'bg-emerald-50 border-emerald-200' :
                                        (policy as any).surveyorRecommendation === 'reject'  ? 'bg-rose-50 border-rose-200' :
                                        'bg-amber-50 border-amber-200'
                                    }`}>
                                        {(policy as any).surveyorRecommendation === 'approve' ? <CheckCircle className="w-5 h-5 text-emerald-600 flex-shrink-0 mt-0.5" /> :
                                         (policy as any).surveyorRecommendation === 'reject'  ? <XCircle    className="w-5 h-5 text-rose-600 flex-shrink-0 mt-0.5"    /> :
                                                                                                <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5"  />}
                                        <div>
                                            <p className="font-semibold text-sm">
                                                {(policy as any).surveyorRecommendation === 'approve' ? 'Recommended for Approval' :
                                                 (policy as any).surveyorRecommendation === 'reject'  ? 'Recommended for Rejection' :
                                                 'Further Inspection / More Information Required'}
                                            </p>
                                            {(policy as any).surveyNotes && <p className="text-xs mt-1 text-slate-600">{(policy as any).surveyNotes}</p>}
                                        </div>
                                    </div>
                                    {(() => {
                                        const rawSd = (policy as any).surveyDetails || {};
                                        const sd: Record<string, any> = {
                                            ...rawSd,
                                            plotNumber: rawSd.locationDetails?.plotNumber,
                                            district: rawSd.locationDetails?.district,
                                            cadastralZone: rawSd.locationDetails?.cadastralZone,
                                            landUse: rawSd.locationDetails?.landUse,
                                            purpose: rawSd.locationDetails?.purpose,
                                            plotSize: rawSd.locationDetails?.plotSize,
                                            dateOfApproval: rawSd.locationDetails?.dateOfApproval,
                                            streetName: rawSd.locationDetails?.streetName,
                                            buildingType: rawSd.locationDetails?.buildingType,
                                            proposedBuildingDescription: rawSd.locationDetails?.proposedBuildingDescription,
                                            naturePlotWellDrained: rawSd.siteDetails?.naturePlot?.wellDrained,
                                            naturePlotRocky: rawSd.siteDetails?.naturePlot?.rocky,
                                            naturePlotWaterLogged: rawSd.siteDetails?.naturePlot?.waterLogged,
                                            naturePlotOther: rawSd.siteDetails?.naturePlot?.other,
                                            naturePlotOtherDescription: rawSd.siteDetails?.naturePlot?.otherDescription,
                                            estimatedSlope: rawSd.siteDetails?.estimatedSlope,
                                            vacancyStatus: rawSd.siteDetails?.vacancyStatus,
                                            developmentDescription: rawSd.siteDetails?.developmentDescription,
                                            previouslyApproved: rawSd.siteDetails?.previouslyApproved,
                                            conformsWithApproval: rawSd.conformity?.conformsWithApproval,
                                            nonConformityDescription: rawSd.conformity?.nonConformityDescription,
                                            levelOfService: rawSd.conformity?.levelOfService,
                                            contractorPresentOnSite: rawSd.contractor?.presentOnSite,
                                            contractorName: rawSd.contractor?.name,
                                            contractorCategory: rawSd.contractor?.category,
                                            assessorName: rawSd.consultant?.name,
                                            assessorCategory: rawSd.consultant?.category,
                                            agentMetOnSite: rawSd.agent?.metOnSite,
                                            agentName: rawSd.agent?.name,
                                            agentDesignation: rawSd.agent?.designation,
                                            agentPhone: rawSd.agent?.phone,
                                            agentEmail: rawSd.agent?.email,
                                            structuralCondition: rawSd.structuralAssessmentDetails?.condition,
                                            visibleCracks: rawSd.structuralAssessmentDetails?.visibleCracks,
                                            foundationStatus: rawSd.structuralAssessmentDetails?.foundationStatus,
                                        };
                                        const get = (k1: string, k2?: string) => {
                                            const v1 = (policy as any)[k1] ?? sd[k1];
                                            if (v1 !== null && v1 !== undefined && String(v1).trim() !== '') return v1;
                                            if (k2) { const v2 = (policy as any)[k2] ?? sd[k2]; if (v2 !== null && v2 !== undefined && String(v2).trim() !== '') return v2; }
                                            return undefined;
                                        };
                                        const SarCard = ({ title, items }: { title: string; items: [string, unknown][] }) => {
                                            const filtered = items.filter(([, v]) => v !== undefined && v !== null && String(v).trim() !== '');
                                            if (filtered.length === 0) return null;
                                            return (
                                                <div className="rounded-xl border border-slate-100 bg-white shadow-sm overflow-hidden">
                                                    <div className="px-4 py-3 border-b border-slate-100 bg-slate-50/60"><h4 className="text-xs font-semibold text-slate-600">{title}</h4></div>
                                                    <dl className="p-4 space-y-3">
                                                        {filtered.map(([l, v]) => (
                                                            <div key={l as string} className="flex justify-between gap-4">
                                                                <dt className="text-xs text-slate-500 flex-shrink-0">{l as string}</dt>
                                                                <dd className="text-xs font-medium text-slate-900 text-right">{String(v)}</dd>
                                                            </div>
                                                        ))}
                                                    </dl>
                                                </div>
                                            );
                                        };
                                        return (
                                            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                                                <SarCard title="Location Details" items={[['Plot Number', get('plotNumber', 'surveyorPlotNumber')], ['District', get('district', 'surveyorDistrict')], ['Cadastral Zone', get('cadastralZone', 'surveyorCadastralZone')], ['Land Use', get('landUse', 'surveyorLandUse')], ['Purpose', get('purpose', 'surveyorPurpose')], ['Plot Size', get('plotSize', 'surveyorPlotSize')], ['Date of Approval', get('dateOfApproval', 'surveyorDateOfApproval') ? formatDate(get('dateOfApproval', 'surveyorDateOfApproval')) : null], ['Street Name', get('streetName', 'surveyorStreetName')], ['Building Type', get('buildingType', 'surveyorBuildingType')]]} />
                                                <SarCard title="Site Details" items={[['Slope', get('estimatedSlope', 'surveyorEstimatedSlope')], ['Vacancy', get('vacancyStatus', 'surveyorVacancyStatus')], ['Development', get('developmentDescription', 'surveyorDevelopmentDescription')], ['Previously Approved?', get('previouslyApproved', 'surveyorPreviouslyApproved')]]} />
                                                <SarCard title="Conformity & Service" items={[['Conforms?', get('conformsWithApproval', 'surveyorConformsWithApproval')], ['Non-Conformity', get('nonConformityDescription', 'surveyorNonConformityDescription')], ['Level of Service', get('levelOfService', 'surveyorLevelOfService')]]} />
                                                <SarCard title="Contractor / Assessor" items={[['Contractor on Site?', get('contractorPresentOnSite', 'surveyorContractorPresentOnSite')], ['Contractor Name', get('contractorName', 'surveyorContractorName')], ['Contractor Category', get('contractorCategory', 'surveyorContractorCategory')], ['Assessor Name', get('assessorName')], ['Assessor Category', get('assessorCategory', 'surveyorConsultantCategory')]]} />
                                                <SarCard title="Agent / Developer" items={[['Agent on Site?', get('agentMetOnSite', 'surveyorAgentMetOnSite')], ['Agent Name', get('agentName', 'surveyorAgentName')], ['Designation', get('agentDesignation', 'surveyorAgentDesignation')], ['Phone', get('agentPhone', 'surveyorAgentPhone')], ['Email', get('agentEmail', 'surveyorAgentEmail')]]} />
                                                <SarCard title="Structural & Valuation" items={[['Structural Condition', get('structuralCondition', 'surveyorStructuralCondition')], ['Visible Cracks?', get('visibleCracks', 'surveyorVisibleCracks')], ['Foundation Status', get('foundationStatus', 'surveyorFoundationStatus')], ['Estimated Value', get('surveyorEstimatedValue', 'estimatedPropertyValue') ? formatCurrency(Number(get('surveyorEstimatedValue', 'estimatedPropertyValue'))) : null], ['Valuation Basis', get('valuationBasis', 'surveyorValuationBasis')], ['Risk Level', get('riskLevel', 'surveyorRiskLevel')]]} />
                                            </div>
                                        );
                                    })()}
                                </>
                            )}
                        </TabsContent>
                    </div>

                    {/* ── Sticky Footer ──────────────────────────────────────── */}
                    <div className="flex-shrink-0 border-t border-slate-200 bg-white px-5 py-4 rounded-b-2xl">
                        {actualStatus === 'paid_niip_failed' && (
                            <div className="mb-3 rounded-xl border border-rose-100 bg-rose-50 p-3 text-xs text-rose-800">
                                <p className="font-semibold flex items-center gap-1 mb-0.5"><AlertCircle className="w-3 h-3" /> Action Required</p>
                                <p>Your payment was received, but the NIIP automated withdrawal failed. An administrator will manually reconcile this. You do not need to pay again.</p>
                            </div>
                        )}
                        <div className="flex flex-wrap justify-end gap-2">
                            <Button variant="outline" onClick={onClose} className="rounded-full px-5">
                                <X className="w-3.5 h-3.5 mr-1.5" /> Close
                            </Button>
                            {(policy as any).surveyorRecommendation && (
                                <>
                                    <Button variant="outline" className="rounded-full border-indigo-200 bg-indigo-50 px-4 text-indigo-700 hover:bg-indigo-100" onClick={() => { setIsGeneratingSAR(true); try { openSARReport(policy); } catch { toast.error('Could not open report.'); } finally { setIsGeneratingSAR(false); } }} disabled={isGeneratingSAR}>
                                        {isGeneratingSAR ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Eye className="w-3.5 h-3.5 mr-1.5" />} View SAR
                                    </Button>
                                    <Button variant="outline" className="rounded-full border-purple-200 bg-purple-50 px-4 text-purple-700 hover:bg-purple-100" onClick={() => { try { downloadSARReport(policy); toast.success('SAR report downloaded.'); } catch { toast.error('Could not download report.'); } }}>
                                        <Download className="w-3.5 h-3.5 mr-1.5" /> Download SAR
                                    </Button>
                                </>
                            )}
                            {(policy.surveyDocument?.downloadUrl || policy.surveyDocument?.downloadPath) && (
                                <Button variant="outline" className="rounded-full border-blue-200 bg-blue-50 px-4 text-blue-700 hover:bg-blue-100" onClick={async () => {
                                    const target = policy.surveyDocument?.downloadUrl || policy.surveyDocument?.downloadPath;
                                    if (!target) { toast.error('Survey report not available for download.'); return; }
                                    try { await downloadProtectedFileByPath(target, policy.surveyDocument?.name || policy.surveyDocument?.fileName || 'survey-report'); }
                                    catch { toast.error('Unable to download the survey report right now.'); }
                                }}>
                                    <Download className="w-3.5 h-3.5 mr-1.5" /> Site Pictures
                                </Button>
                            )}
                            {isPaymentPaid && (
                                <Button variant="outline" onClick={handleDownloadReceipt} disabled={isDownloadingReceipt} className="rounded-full border-emerald-200 bg-emerald-50 px-4 text-emerald-700 hover:bg-emerald-100">
                                    {isDownloadingReceipt ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5 mr-1.5" />}
                                    {isDownloadingReceipt ? 'Downloading…' : 'Receipt'}
                                </Button>
                            )}
                            {shouldShowCalculatePremiumButton && (
                                <Button className="rounded-full bg-amber-600 px-5 hover:bg-amber-700" onClick={handleCalculatePremium} disabled={isCalculatingPremium}>
                                    {isCalculatingPremium ? <Loader2 className="w-3.5 h-3.5 mr-1.5 animate-spin" /> : <Receipt className="w-3.5 h-3.5 mr-1.5" />}
                                    {isCalculatingPremium ? 'Calculating…' : 'Calculate Premium'}
                                </Button>
                            )}
                            {shouldShowProceedToPaymentButton && (
                                <Button className="rounded-full bg-emerald-600 px-5 hover:bg-emerald-700" onClick={() => toast.info('Proceed to Payment is available, but checkout is handled from the policy list flow.')}>
                                    <CreditCard className="w-3.5 h-3.5 mr-1.5" /> {resolvedAction?.label || 'Proceed to Payment'}
                                </Button>
                            )}
                        </div>
                    </div>
                </Tabs>
            </DialogContent>
        </Dialog>
    );
};

export default PolicyDetailsModal;
