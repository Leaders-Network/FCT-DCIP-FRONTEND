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
    }, [policy?._id, isOpen]);

    if (!policy) return null;

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

                <Tabs defaultValue="builder" className="w-full">
                    <div className="w-full overflow-x-auto">
                        <TabsList className="flex md:grid md:grid-cols-6 w-max md:w-full min-w-max md:min-w-0">
                            <TabsTrigger value="builder" className="whitespace-nowrap text-xs sm:text-sm">
                                Builder
                            </TabsTrigger>
                            <TabsTrigger value="organization" className="whitespace-nowrap text-xs sm:text-sm">
                                Organization
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
                            <TabsTrigger value="timeline" className="whitespace-nowrap text-xs sm:text-sm">
                                Timeline
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
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Builder Name</label>
                                    <p className="text-base font-semibold">{policy.builder.nameOfBuilder}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">RC Number</label>
                                    <p className="text-base font-semibold">{policy.builder.rcNumber}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Mail className="w-4 h-4" />
                                        Email
                                    </label>
                                    <p className="text-base">{policy.builder.customerEmail}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <Phone className="w-4 h-4" />
                                        Phone
                                    </label>
                                    <p className="text-base">{policy.builder.telNo}</p>
                                </div>
                                <div className="md:col-span-2">
                                    <label className="text-sm font-medium text-gray-600 flex items-center gap-1">
                                        <MapPin className="w-4 h-4" />
                                        Address
                                    </label>
                                    <p className="text-base">{policy.builder.address}</p>
                                </div>
                                {policy.builder.identification && (
                                    <>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Identification Type</label>
                                            <p className="text-base">
                                                {policy.builder.identification.identificationTypeId === 1 ? 'National ID' :
                                                    policy.builder.identification.identificationTypeId === 2 ? 'Passport' :
                                                        policy.builder.identification.identificationTypeId === 3 ? 'Driver\'s License' : 'Other'}
                                            </p>
                                        </div>
                                        <div>
                                            <label className="text-sm font-medium text-gray-600">Identification Number</label>
                                            <p className="text-base">{policy.builder.identification.identityNo}</p>
                                        </div>
                                    </>
                                )}
                            </CardContent>
                        </Card>
                    </TabsContent>

                    {/* Organization Information */}
                    <TabsContent value="organization" className="space-y-4">
                        <Card>
                            <CardHeader>
                                <CardTitle className="flex items-center gap-2">
                                    <Building className="w-5 h-5" />
                                    Organization Details
                                </CardTitle>
                            </CardHeader>
                            <CardContent className="grid grid-cols-1 md:grid-cols-2 gap-4">
                                <div>
                                    <label className="text-sm font-medium text-gray-600">NIOB Registration Number</label>
                                    <p className="text-base font-semibold">{policy.organization?.niobRegNo || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Year of Incorporation</label>
                                    <p className="text-base">{policy.organization?.yearOfIncorporation ? formatDate(policy.organization.yearOfIncorporation) : 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Area of Specialization</label>
                                    <p className="text-base">{policy.organization?.areaOfSpecialization || 'N/A'}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Permanent Staff Count</label>
                                    <p className="text-base">{policy.organization?.noOfPermanentStaff ?? 0}</p>
                                </div>
                                <div>
                                    <label className="text-sm font-medium text-gray-600">Number of Floors</label>
                                    <p className="text-base">{policy.organization?.noOfFloors ?? 0}</p>
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
                                    <label className="text-sm font-medium text-gray-600">Membership Status</label>
                                    <p className="text-base">
                                        {policy.membership?.MembershipStatusId === 1 ? 'Active Member' :
                                            policy.membership?.MembershipStatusId === 2 ? 'Non-Member' : 'Unknown'}
                                    </p>
                                </div>
                                {policy.membership?.MembershipName && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Membership Name</label>
                                        <p className="text-base">{policy.membership.MembershipName}</p>
                                    </div>
                                )}
                                {policy.membership?.MembershipNo && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Membership Number</label>
                                        <p className="text-base">{policy.membership.MembershipNo}</p>
                                    </div>
                                )}
                                {policy.membership?.ProfessionalBodyName && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Professional Body</label>
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
                                        <label className="text-sm font-medium text-gray-600">Coverage Type</label>
                                        <p className="text-base font-semibold">{policy.project?.coverTypeIdxDetails || 'N/A'}</p>
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
                                        <label className="text-sm font-medium text-gray-600">Total Estimate Sum</label>
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
                                        {policy.compliance?.HasInsurance ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Under Investigation</span>
                                        {policy.compliance?.investigation ? (
                                            <AlertCircle className="w-5 h-5 text-orange-600" />
                                        ) : (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Disciplinary Action</span>
                                        {policy.compliance?.disciplinaryCommittee ? (
                                            <AlertCircle className="w-5 h-5 text-orange-600" />
                                        ) : (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        )}
                                    </div>
                                    <div className="flex items-center justify-between p-3 bg-gray-50 rounded-md">
                                        <span className="text-sm font-medium">Pre-Employment Check</span>
                                        {policy.compliance?.preEmploymentCheck ? (
                                            <CheckCircle className="w-5 h-5 text-green-600" />
                                        ) : (
                                            <XCircle className="w-5 h-5 text-red-600" />
                                        )}
                                    </div>
                                </div>

                                {policy.compliance?.HasInsuranceDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Insurance Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{policy.compliance?.HasInsuranceDetails}</p>
                                    </div>
                                )}

                                {policy.compliance?.investigationDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Investigation Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{policy.compliance?.investigationDetails}</p>
                                    </div>
                                )}

                                {policy.compliance?.legalSuitDetails && (
                                    <div>
                                        <label className="text-sm font-medium text-gray-600">Legal Suit Details</label>
                                        <p className="text-base bg-gray-50 p-3 rounded-md">{policy.compliance?.legalSuitDetails}</p>
                                    </div>
                                )}

                                <div>
                                    <label className="text-sm font-medium text-gray-600">Practice Outside Nigeria</label>
                                    <p className="text-base">{policy.compliance?.PracticeOutsideNigeria || 'N/A'}</p>
                                </div>
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
                    
                    {/* Survey Download Action */}
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
                            Download Survey Report
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
