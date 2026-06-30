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

    return (
        <Dialog open={isOpen} onOpenChange={onClose}>
            <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto">
                <DialogHeader>
                    <div className="flex items-start justify-between">
                        <div>
                            <DialogTitle className="text-2xl font-bold">
                                Builder Liability Policy Details
                            </DialogTitle>
                            <p className="text-sm text-gray-600 mt-1">
                                Policy #{policy.policyNumber}
                            </p>
                        </div>
                        <div className="flex items-center gap-2">
                            {getStatusBadge(getActualStatus(policy))}
                            <Badge variant="outline">
                                {policy.priority?.toUpperCase() || 'MEDIUM'}
                            </Badge>
                        </div>
                    </div>
                </DialogHeader>

                <Tabs defaultValue="client" className="w-full">
                    <div className="w-full overflow-x-auto">
                        <TabsList className="flex md:grid md:grid-cols-9 w-max md:w-full min-w-max md:min-w-0">
                            <TabsTrigger value="client" className="whitespace-nowrap text-xs sm:text-sm">
                                Client
                            </TabsTrigger>
                            <TabsTrigger value="builder" className="whitespace-nowrap text-xs sm:text-sm">
                                Contractor
                            </TabsTrigger>
                            <TabsTrigger value="organization" className="whitespace-nowrap text-xs sm:text-sm">
                                Assessor
                            </TabsTrigger>
                            <TabsTrigger value="project" className="whitespace-nowrap text-xs sm:text-sm">
                                Project
                            </TabsTrigger>
                            <TabsTrigger value="workforce" className="whitespace-nowrap text-xs sm:text-sm">
                                Workforce
                            </TabsTrigger>
                            <TabsTrigger value="compliance" className="whitespace-nowrap text-xs sm:text-sm">
                                Compliance
                            </TabsTrigger>
                            <TabsTrigger value="payment" className="whitespace-nowrap text-xs sm:text-sm">
                                Payment
                            </TabsTrigger>
                            <TabsTrigger value="timeline" className="whitespace-nowrap text-xs sm:text-sm">
                                Timeline
                            </TabsTrigger>
                            <TabsTrigger value="survey" className="whitespace-nowrap text-xs sm:text-sm">
                                SAR
                            </TabsTrigger>
                        </TabsList>
                    </div>

                    {/* Builder Information */}
                    <TabsContent value="builder" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Builder Information
                                    {(policy as any).isDirectLabor && (
                                        <Badge className="bg-amber-100 text-amber-800 border-amber-200 ml-2">
                                            Direct Labor
                                        </Badge>
                                    )}
                                </CardTitle>
                            </CardHeader>
                            <CardContent>
                                {(policy as any).isDirectLabor ? (
                                    <div className="flex flex-col items-center justify-center py-8 px-4 bg-amber-50 rounded-lg border border-amber-200">
                                        <AlertCircle className="w-8 h-8 text-amber-600 mb-3" />
                                        <p className="text-base font-semibold text-amber-900 mb-1">
                                            Direct Labor Project
                                        </p>
                                        <p className="text-sm text-amber-700 text-center max-w-md">
                                            This project is not assigned to a commercial general contractor. The property owner is managing or building it themselves. No contractor details are required.
                                        </p>
                                    </div>
                                ) : (
                                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Contractor Name</label>
                                            <p className="text-base font-semibold">{policy.builder?.nameOfBuilder || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Director of the company</label>
                                            <p className="text-base font-semibold">{policy.builder?.directorOfCompany || 'Not provided'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">RC Number</label>
                                            <p className="text-base font-semibold">{policy.builder?.rcNumber || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Mail className="w-4 h-4" />
                                                Email
                                            </label>
                                            <p className="text-base">{policy.builder?.customerEmail || 'N/A'}</p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <Phone className="w-4 h-4" />
                                                Phone
                                            </label>
                                            <p className="text-base">{policy.builder?.telNo || 'N/A'}</p>
                                        </div>
                                        <div className="md:col-span-2">
                                            <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                                <MapPin className="w-4 h-4" />
                                                Location / Address
                                            </label>
                                            <p className="text-base">{policy.builder?.address || 'N/A'}</p>
                                        </div>
                                        {policy.builder?.identification && (
                                            <>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Director's Identification Type</label>
                                                    <p className="text-base">
                                                        {policy.builder.identification.identificationTypeId === 1 ? 'National ID' :
                                                            policy.builder.identification.identificationTypeId === 2 ? 'Passport' :
                                                                policy.builder.identification.identificationTypeId === 3 ? 'Driver\'s License' : 'Other'}
                                                    </p>
                                                </div>
                                                <div>
                                                    <label className="text-sm font-medium text-gray-600">Director's Identification Number</label>
                                                    <p className="text-base">{policy.builder.identification.identityNo}</p>
                                                </div>
                                            </>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    <TabsContent value="client" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <User className="w-5 h-5" />
                                    Client Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Client Name</label>
                                    <p className="text-base font-semibold">{getDisplayValue(clientName)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Client RC Number</label>
                                    <p className="text-base">{getDisplayValue(policy.client?.rcNumber)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <p className="text-base">{getDisplayValue(clientEmail)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </label>
                                    <p className="text-base">{getDisplayValue(clientPhone)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Identification Type</label>
                                    <p className="text-base">{getDisplayValue(policy.client?.identificationType)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Identification Number</label>
                                    <p className="text-base">{getDisplayValue(policy.client?.identificationNumber)}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </label>
                                    <p className="text-base">{getDisplayValue(policy.client?.address)}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Organization Information */}
                    <TabsContent value="organization" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Assessor Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Assessor Name</label>
                                    <p className="text-base font-semibold">{policy.organization?.assessorName || 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Regulatory Body</label>
                                    <p className="text-base font-semibold">{getDisplayValue(assessorProfessionalBody)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Registration Number</label>
                                    <p className="text-base font-semibold">{getDisplayValue(assessorRegistrationNumber)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Valid Practice License Number</label>
                                    <p className="text-base font-semibold">{getDisplayValue(policy.organization?.practiceLicenseNumber)}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Year of Registration</label>
                                    <p className="text-base">{policy.organization?.yearOfRegistration ? formatDate(policy.organization.yearOfRegistration) : 'Not provided'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Area of Specialization</label>
                                    <p className="text-base">{getDisplayValue(policy.organization?.areaOfSpecialization)}</p>
                                </div>
                                {assessorProfessionalBody === 'Other' && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Other Regulatory Body Name</label>
                                        <p className="text-base">{getDisplayValue(policy.organization?.otherProfessionalBodyName)}</p>
                                    </div>
                                )}
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Staff Strength</label>
                                    <p className="text-base">{toDisplayText(firstMeaningfulValue(policy.organization?.staffStrength, policy.organization?.noOfPermanentStaff, policy.organization?.permanentStaffCount), 'Not provided')}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Shield className="w-5 h-5" />
                                    Membership Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">NIA Membership Status</label>
                                    <p className="text-base">
                                        {policy.membership?.MembershipStatusId === 1 ? 'Yes, applicant is a Nigerian Insurers Association (NIA) member' :
                                            policy.membership?.MembershipStatusId === 2 ? 'No, applicant is not a Nigerian Insurers Association (NIA) member' : 'Unknown'}
                                    </p>
                                </div>
                                {policy.membership?.MembershipName && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Membership Name</label>
                                        <p className="text-base">{policy.membership.MembershipName}</p>
                                    </div>
                                )}
                                {(policy.membership?.MemberId || policy.membership?.MembershipNo) && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">NIA Member ID</label>
                                        <p className="text-base">{policy.membership.MemberId || policy.membership.MembershipNo}</p>
                                    </div>
                                )}
                                {policy.membership?.ProfessionalBodyName && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Regulatory Body</label>
                                        <p className="text-base">{policy.membership.ProfessionalBodyName}</p>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Project Information */}
                    <TabsContent value="project" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Briefcase className="w-5 h-5" />
                                    Project Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Statutory Cover</label>
                                        <p className="text-base">
                                            {(typeof policy.project?.isStatutory === 'boolean'
                                                ? policy.project.isStatutory
                                                : policy.project?.coverTypeIdx) ? 'Yes' : 'No'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Project Type</label>
                                        <p className="text-base font-semibold">{getDisplayValue(policy.project?.projectType)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Coverage Type</label>
                                        <p className="text-base font-semibold">{policy.project?.coverTypeIdxDetails || 'N/A'}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Contractor Type</label>
                                        <p className="text-base font-semibold">{getDisplayValue(policy.project?.contractorType)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Property Title</label>
                                        <p className="text-base font-semibold">{getDisplayValue(projectTitle)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Contractor Category</label>
                                        <p className="text-base">
                                            {policy.project?.categoryOfContractorId === 1 ? 'Category A' :
                                                policy.project?.categoryOfContractorId === 2 ? 'Category B' :
                                                    policy.project?.categoryOfContractorId === 3 ? 'Category C' : 'Other'}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Estimated Sum Range</label>
                                        <p className="text-base font-semibold">{getDisplayValue(projectEstimateBand)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Stored Ceiling Amount</label>
                                        <p className="text-xl font-bold text-green-600">
                                            {formatCurrency(policy.project?.totalEstimateSum || 0)}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Extra Hazardous</label>
                                        <p className="text-base">
                                            {policy.project?.extraHazardous ? (
                                                <Badge variant="destructive">Yes</Badge>
                                            ) : (
                                                <Badge variant="outline">No</Badge>
                                            )}
                                        </p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Plot Number</label>
                                        <p className="text-base">{getDisplayValue(policy.project?.plotNumber || policy.project?.agisNo)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Location / Address</label>
                                        <p className="text-base">{getDisplayValue(projectAddress)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Project LGA</label>
                                        <p className="text-base">{getDisplayValue(projectLga)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Project District</label>
                                        <p className="text-base">{getDisplayValue(projectDistrict)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Cadastral Zone</label>
                                        <p className="text-base">{getDisplayValue(policy.project?.cadastralZone)}</p>
                                    </div>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Work Details</label>
                                    <p className="text-base bg-gray-50 p-3 rounded-md">{policy.project?.workDetails || 'N/A'}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Workforce Information */}
                    <TabsContent value="workforce" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Users className="w-5 h-5" />
                                    Workforce Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Contract Staff Count</label>
                                        <p className="text-base font-semibold">{policy.workforce?.contractStaffCount ?? 0}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Blood Relations Count</label>
                                        <p className="text-base font-semibold">{policy.workforce?.bloodRelationsCount ?? 0}</p>
                                    </div>
                                </div>

                                {/* Category of Workmen */}
                                {policy.workforce?.categoryOfWorkmen && policy.workforce.categoryOfWorkmen.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Category of Workmen</h4>
                                        <div className="space-y-2">
                                            {policy.workforce.categoryOfWorkmen.map((workman, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                    <div className="grid grid-cols-3 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Category:</span>
                                                            <p className="font-medium">{workman.categoryOfWorkmen}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Number:</span>
                                                            <p className="font-medium">{workman.numberOfEmployment}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Years:</span>
                                                            <p className="font-medium">{workman.yearsOfEmployment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Professionals */}
                                {policy.workforce?.professionals && policy.workforce.professionals.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Professionals</h4>
                                        <div className="space-y-2">
                                            {policy.workforce.professionals.map((prof, index) => (
                                                <div key={index} className="bg-gray-50 p-3 rounded-md">
                                                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm">
                                                        <div>
                                                            <span className="text-gray-600">Name:</span>
                                                            <p className="font-medium">{prof.surname} {prof.otherName}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Profession:</span>
                                                            <p className="font-medium">{prof.profession}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Qualification:</span>
                                                            <p className="font-medium">{prof.qualification}</p>
                                                        </div>
                                                        <div>
                                                            <span className="text-gray-600">Years:</span>
                                                            <p className="font-medium">{prof.yearsInEmployment}</p>
                                                        </div>
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Compliance Information */}
                    <TabsContent value="compliance" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <FileText className="w-5 h-5" />
                                    Compliance Information
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Has Insurance</span>
                                        <span className="flex items-center gap-2">
                                            {hasInsurance === true ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : hasInsurance === false ? (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="text-sm font-semibold">{getBooleanText(hasInsurance)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Under Investigation</span>
                                        <span className="flex items-center gap-2">
                                            {underInvestigation === true ? (
                                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                            ) : underInvestigation === false ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="text-sm font-semibold">{getBooleanText(underInvestigation)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Disciplinary Action</span>
                                        <span className="flex items-center gap-2">
                                            {disciplinaryAction === true ? (
                                                <AlertCircle className="w-5 h-5 text-orange-600" />
                                            ) : disciplinaryAction === false ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="text-sm font-semibold">{getBooleanText(disciplinaryAction)}</span>
                                        </span>
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Pre-Employment Check</span>
                                        <span className="flex items-center gap-2">
                                            {preEmploymentCheck === true ? (
                                                <CheckCircle className="w-5 h-5 text-green-600" />
                                            ) : preEmploymentCheck === false ? (
                                                <XCircle className="w-5 h-5 text-red-600" />
                                            ) : (
                                                <Clock className="w-5 h-5 text-gray-500" />
                                            )}
                                            <span className="text-sm font-semibold">{getBooleanText(preEmploymentCheck)}</span>
                                        </span>
                                    </div>
                                </div>

                                {hasInsuranceDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Insurance Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{hasInsuranceDetails}</p>
                                    </div>
                                )}

                                {investigationDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Investigation Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{investigationDetails}</p>
                                    </div>
                                )}

                                {disciplinaryDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Disciplinary Action Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{disciplinaryDetails}</p>
                                    </div>
                                )}

                                {preEmploymentDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Pre-Employment Check Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{preEmploymentDetails}</p>
                                    </div>
                                )}

                                {legalSuitDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Legal Suit Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{legalSuitDetails}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Practice Outside Nigeria</label>
                                    <p className="text-base">{practiceOutsideNigeria}</p>
                                </div>
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Payment & Premium Information */}
                    <TabsContent value="payment" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <CreditCard className="w-5 h-5" />
                                    Premium & Payment Summary
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div className="p-4 rounded-md border bg-gray-50">
                                    <label className="text-sm font-medium text-gray-600">Payment State</label>
                                    <div className="mt-1 flex items-center gap-2">
                                        <Badge className={`border ${paymentStatusBadgeClass}`}>
                                            {isPaymentPaid ? 'PAID' : isPaymentPending ? 'PENDING' : paymentStatusLabel.toUpperCase()}
                                        </Badge>
                                        <span className="text-sm text-gray-700">{paymentSummaryText}</span>
                                    </div>
                                </div>
                                <div className="p-4 rounded-md border bg-gray-50">
                                    <label className="text-sm font-medium text-gray-600">Premium Amount</label>
                                    <p className="text-lg font-semibold text-gray-900 mt-1">
                                        {premiumAmount !== null ? formatCurrency(premiumAmount) : 'N/A'}
                                    </p>
                                </div>
                                <div className="p-4 rounded-md border bg-gray-50">
                                    <label className="text-sm font-medium text-gray-600">NIIP Invoice Number</label>
                                    <p className="text-base font-semibold mt-1">{niipInvoiceNumber}</p>
                                </div>
                                <div className="p-4 rounded-md border bg-gray-50">
                                    <label className="text-sm font-medium text-gray-600">NIIP Reference</label>
                                    <p className="text-base font-semibold break-all mt-1">{niipTransactionReference}</p>
                                </div>
                            </CardContent>
                        </Card>

                        <Card>
                            <CardHeader>
                                <div className="flex flex-col gap-3 sm:flex-row sm:items-center sm:justify-between">
                                    <CardTitle className="flex items-center gap-2">
                                        <Receipt className="w-5 h-5" />
                                        Payment Records
                                    </CardTitle>
                                    {isPaymentPaid && (
                                        <Button
                                            type="button"
                                            variant="outline"
                                            size="sm"
                                            onClick={handleDownloadReceipt}
                                            disabled={isDownloadingReceipt}
                                            className="w-full sm:w-auto"
                                        >
                                            {isDownloadingReceipt ? (
                                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                                            ) : (
                                                <Download className="w-4 h-4 mr-2" />
                                            )}
                                            {isDownloadingReceipt ? 'Downloading...' : 'Download Receipt'}
                                        </Button>
                                    )}
                                </div>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Status</label>
                                    <p className="text-base">{paymentStatusLabel || 'Pending'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Payment Method</label>
                                    <p className="text-base">{toDisplayText(paymentInfo.method, 'external_payment_service')}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Initiated At</label>
                                    <p className="text-base">
                                        {paymentInfo.initiatedAt ? formatDate(paymentInfo.initiatedAt as string | Date) : 'N/A'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Paid At</label>
                                    <p className="text-base">
                                        {paymentInfo.paidAt ? formatDate(paymentInfo.paidAt as string | Date) : 'Not Paid Yet'}
                                    </p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Rejection / Failure Reason</label>
                                    <p className="text-base">{toDisplayText(paymentInfo.reason)}</p>
                                </div>
                                {!isPaymentPaid && (
                                    <div className="md:col-span-2 rounded-md border border-dashed border-slate-200 bg-slate-50 p-3 text-sm text-slate-600">
                                        A downloadable receipt will appear here once payment has been confirmed on the system.
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Timeline */}
                    <TabsContent value="timeline" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Calendar className="w-5 h-5" />
                                    Policy Timeline
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="space-y-4">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Created At</label>
                                        <p className="text-base">{formatDate(policy.createdAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Last Updated</label>
                                        <p className="text-base">{formatDate(policy.updatedAt)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Deadline</label>
                                        <p className="text-base font-semibold text-orange-600">{formatDate(policy.deadline)}</p>
                                    </div>
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Payment Status</label>
                                        <p className="text-base">
                                            <Badge variant={policy.paymentInfo?.status === 'paid' ? 'default' : 'outline'}>
                                                {policy.paymentInfo?.status?.toUpperCase() || 'PENDING'}
                                            </Badge>
                                        </p>
                                    </div>
                                </div>

                                {/* Status History */}
                                {policy.statusHistory && policy.statusHistory.length > 0 && (
                                    <div>
                                        <h4 className="font-semibold mb-3">Status History</h4>
                                        <div className="space-y-2">
                                            {policy.statusHistory.map((history, index) => (
                                                <div key={index} className="flex items-start gap-3 p-3 bg-gray-50 rounded-md">
                                                    <div className="flex-shrink-0 mt-1">
                                                        {getStatusBadge(history.status)}
                                                    </div>
                                                    <div className="flex-1">
                                                        <p className="text-sm text-gray-600">
                                                            {formatDate(history.changedAt)}
                                                        </p>
                                                        {history.reason && (
                                                            <p className="text-sm mt-1">{history.reason}</p>
                                                        )}
                                                    </div>
                                                </div>
                                            ))}
                                        </div>
                                    </div>
                                )}

                                {/* Notes */}
                                {(policy.surveyNotes || policy.adminNotes) && (
                                    <div className="space-y-3">
                                        {policy.surveyNotes && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Survey Notes</label>
                                                <p className="text-base bg-blue-50 p-3 rounded-md">{policy.surveyNotes}</p>
                                            </div>
                                        )}
                                        {policy.adminNotes && (
                                            <div>
                                                <label className="text-sm font-medium text-gray-600">Admin Notes</label>
                                                <p className="text-base bg-yellow-50 p-3 rounded-md">{policy.adminNotes}</p>
                                            </div>
                                        )}
                                    </div>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* ── SAR: Survey Assessment Report ── */}
                    <TabsContent value="survey" className="space-y-4">
                        {!(policy as any).surveyorRecommendation ? (
                            <div className="flex flex-col items-center justify-center py-16 text-center text-gray-500">
                                <Eye className="w-10 h-10 mb-3 opacity-40" />
                                <p className="font-medium">No survey assessment data yet</p>
                                <p className="text-sm mt-1">The SAR will appear here once a surveyor completes the assessment.</p>
                            </div>
                        ) : (
                            <>
                                {/* Quick summary banner */}
                                <div className={`flex items-start gap-3 p-4 rounded-lg border ${
                                    (policy as any).surveyorRecommendation === 'approve'
                                        ? 'bg-green-50 border-green-200'
                                        : (policy as any).surveyorRecommendation === 'reject'
                                            ? 'bg-red-50 border-red-200'
                                            : 'bg-amber-50 border-amber-200'
                                }`}>
                                    {(policy as any).surveyorRecommendation === 'approve'
                                        ? <CheckCircle className="w-5 h-5 text-green-600 flex-shrink-0 mt-0.5" />
                                        : (policy as any).surveyorRecommendation === 'reject'
                                            ? <XCircle className="w-5 h-5 text-red-600 flex-shrink-0 mt-0.5" />
                                            : <AlertCircle className="w-5 h-5 text-amber-600 flex-shrink-0 mt-0.5" />}
                                    <div>
                                        <p className="font-semibold text-sm">
                                            {(policy as any).surveyorRecommendation === 'approve' ? 'Recommended for Approval'
                                                : (policy as any).surveyorRecommendation === 'reject' ? 'Recommended for Rejection'
                                                    : 'Further Inspection / More Information Required'}
                                        </p>
                                        {(policy as any).surveyNotes && (
                                            <p className="text-xs mt-1 text-gray-600">{(policy as any).surveyNotes}</p>
                                        )}
                                    </div>
                                </div>

                                {/* SAR data cards */}
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
                                        if (k2) {
                                            const v2 = (policy as any)[k2] ?? sd[k2];
                                            if (v2 !== null && v2 !== undefined && String(v2).trim() !== '') return v2;
                                        }
                                        return undefined;
                                    };
                                    return (
                                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Location Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Plot Number', get('plotNumber', 'surveyorPlotNumber')], ['District', get('district', 'surveyorDistrict')], ['Cadastral Zone', get('cadastralZone', 'surveyorCadastralZone')], ['Land Use', get('landUse', 'surveyorLandUse')], ['Purpose', get('purpose', 'surveyorPurpose')], ['Plot Size', get('plotSize', 'surveyorPlotSize')], ['Date of Approval', get('dateOfApproval', 'surveyorDateOfApproval') ? formatDate(get('dateOfApproval', 'surveyorDateOfApproval')) : null], ['Street Name', get('streetName', 'surveyorStreetName')], ['Building Type', get('buildingType', 'surveyorBuildingType')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Site Details</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Slope', get('estimatedSlope', 'surveyorEstimatedSlope')], ['Vacancy', get('vacancyStatus', 'surveyorVacancyStatus')], ['Dev. Description', get('developmentDescription', 'surveyorDevelopmentDescription')], ['Prev. Approved?', get('previouslyApproved', 'surveyorPreviouslyApproved')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Conformity & Service</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Conforms?', get('conformsWithApproval', 'surveyorConformsWithApproval')], ['Non-Conformity', get('nonConformityDescription', 'surveyorNonConformityDescription')], ['Level of Service', get('levelOfService', 'surveyorLevelOfService')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Contractor / Assessor</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Contractor on Site?', get('contractorPresentOnSite', 'surveyorContractorPresentOnSite')], ['Contractor Name', get('contractorName', 'surveyorContractorName')], ['Contractor Category', get('contractorCategory', 'surveyorContractorCategory')], ['Assessor Name', get('assessorName')], ['Assessor Category', get('assessorCategory', 'surveyorConsultantCategory')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Agent / Developer</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Agent on Site?', get('agentMetOnSite', 'surveyorAgentMetOnSite')], ['Agent Name', get('agentName', 'surveyorAgentName')], ['Designation', get('agentDesignation', 'surveyorAgentDesignation')], ['Phone', get('agentPhone', 'surveyorAgentPhone')], ['Email', get('agentEmail', 'surveyorAgentEmail')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                            <Card>
                                                <CardHeader><CardTitle className="text-sm">Structural & Valuation</CardTitle></CardHeader>
                                                <CardContent className="space-y-2 text-sm">
                                                    {[['Structural Condition', get('structuralCondition', 'surveyorStructuralCondition')], ['Visible Cracks?', get('visibleCracks', 'surveyorVisibleCracks')], ['Foundation Status', get('foundationStatus', 'surveyorFoundationStatus')], ['Estimated Value', get('surveyorEstimatedValue', 'estimatedPropertyValue') ? formatCurrency(Number(get('surveyorEstimatedValue', 'estimatedPropertyValue'))) : null], ['Valuation Basis', get('valuationBasis', 'surveyorValuationBasis')], ['Risk Level', get('riskLevel', 'surveyorRiskLevel')]].map(([l, v]) => v ? <div key={l as string} className="flex justify-between"><span className="text-gray-500">{l}</span><span className="font-medium text-right">{String(v)}</span></div> : null)}
                                                </CardContent>
                                            </Card>
                                        </div>
                                    );
                                })()}
                            </>
                        )}
                    </TabsContent>
                </Tabs>

                {premiumResult?.premiumDetails && (
                    <Card className="mt-6 border-orange-200 bg-orange-50">
                        <CardHeader>
                            <CardTitle className="flex items-center gap-2 text-orange-900">
                                <Receipt className="w-5 h-5" />
                                Premium Calculation Result
                            </CardTitle>
                        </CardHeader>
                        <CardContent className="grid grid-cols-1 md:grid-cols-3 gap-4">
                            <div>
                                <label className="text-sm font-medium text-orange-700">Premium Amount</label>
                                <p className="text-base font-semibold text-orange-950">
                                    {formatCurrency(Number(premiumResult.premiumDetails.amount || premiumResult.premiumAmount || 0))}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-orange-700">Invoice Number</label>
                                <p className="text-base font-semibold text-orange-950">
                                    {premiumResult.premiumDetails.invoiceNumber || 'N/A'}
                                </p>
                            </div>
                            <div>
                                <label className="text-sm font-medium text-orange-700">NIIP Reference</label>
                                <p className="text-base font-semibold text-orange-950 break-all">
                                    {premiumResult.premiumDetails.transactionReference || 'N/A'}
                                </p>
                            </div>
                        </CardContent>
                    </Card>
                )}

                <div className="flex flex-col sm:flex-row justify-end gap-2 mt-6 pt-4 border-t">
                    <Button variant="outline" onClick={onClose} className="w-full sm:w-auto">
                        Close
                    </Button>
                    
                    {/* SAR Download Actions — always visible if survey data exists */}
                    {(policy as any).surveyorRecommendation && (
                        <>
                            <Button
                                variant="outline"
                                className="bg-indigo-50 text-indigo-700 hover:bg-indigo-100 border-indigo-200 w-full sm:w-auto"
                                onClick={() => {
                                    setIsGeneratingSAR(true);
                                    try { openSARReport(policy); } catch { toast.error('Could not open report.'); }
                                    finally { setIsGeneratingSAR(false); }
                                }}
                                disabled={isGeneratingSAR}
                            >
                                {isGeneratingSAR ? <Loader2 className="w-4 h-4 mr-2 animate-spin" /> : <Eye className="w-4 h-4 mr-2" />}
                                View SAR Report
                            </Button>
                            <Button
                                variant="outline"
                                className="bg-purple-50 text-purple-700 hover:bg-purple-100 border-purple-200 w-full sm:w-auto"
                                onClick={() => {
                                    try { downloadSARReport(policy); toast.success('SAR report downloaded.'); } catch { toast.error('Could not download report.'); }
                                }}
                            >
                                <Download className="w-4 h-4 mr-2" />
                                Download SAR
                            </Button>
                        </>
                    )}

                    {/* Existing survey document download */}
                    {(policy.surveyDocument?.downloadUrl || policy.surveyDocument?.downloadPath) && (
                        <Button 
                            variant="outline"
                            className="bg-blue-50 text-blue-700 hover:bg-blue-100 border-blue-200 w-full sm:w-auto"
                            onClick={async () => {
                                const downloadTarget = policy.surveyDocument?.downloadUrl || policy.surveyDocument?.downloadPath;
                                if (!downloadTarget) {
                                    toast.error('Survey report is not available for download.');
                                    return;
                                }

                                try {
                                    await downloadProtectedFileByPath(
                                        downloadTarget,
                                        policy.surveyDocument?.name || policy.surveyDocument?.fileName || 'survey-report'
                                    );
                                } catch {
                                    toast.error('Unable to download the survey report right now.');
                                }
                            }}
                        >
                            <Download className="w-4 h-4 mr-2" />
                            Download Site Pictures
                        </Button>
                    )}

                    {shouldShowCalculatePremiumButton && (
                        <Button
                            className="bg-amber-600 hover:bg-amber-700 w-full sm:w-auto"
                            onClick={handleCalculatePremium}
                            disabled={isCalculatingPremium}
                        >
                            {isCalculatingPremium ? (
                                <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                            ) : (
                                <Receipt className="w-4 h-4 mr-2" />
                            )}
                            {isCalculatingPremium ? 'Calculating...' : 'Calculate Premium'}
                        </Button>
                    )}

                    {shouldShowProceedToPaymentButton && (
                        <Button
                            className="bg-green-600 hover:bg-green-700 w-full sm:w-auto"
                            onClick={() => toast.info('Proceed to Payment is available, but checkout is still handled from the policy list flow.')}
                        >
                            <CreditCard className="w-4 h-4 mr-2" />
                            {resolvedAction?.label || 'Proceed to Payment'}
                        </Button>
                    )}

                    {/* NIIP Retry Info */}
                    {actualStatus === 'paid_niip_failed' && (
                        <div className="bg-rose-50 p-3 rounded-lg border border-rose-100 text-xs text-rose-800 w-full">
                            <p className="font-semibold flex items-center gap-1">
                                <AlertCircle className="w-3 h-3" />
                                Action Required
                            </p>
                            <p className="mt-1">
                                Your payment was received, but the NIIP automated withdrawal failed. 
                                An administrator will manually reconcile this. You do not need to pay again.
                            </p>
                        </div>
                    )}
                </div>
            </DialogContent>
        </Dialog>
    );
};

export default PolicyDetailsModal;
