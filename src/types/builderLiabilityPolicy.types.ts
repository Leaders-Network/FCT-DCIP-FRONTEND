// Builder Liability Policy Types

export interface BuilderIdentity {
    customerEmail: string;
    nameOfBuilder: string;
    rcNumber: string;
    directorOfCompany?: string;
    lga?: string;
    district?: string;
    identification: {
        identificationTypeId: number;
        identityNo: string | number;
    };
    address: string;
    telNo: string;
}

export type ClientIdentificationType =
    | 'National ID'
    | "Voter's Card"
    | "Driver's License"
    | 'International Passport'
    | 'CAC / RC Number'
    | 'Other';

export const CLIENT_IDENTIFICATION_TYPES: ClientIdentificationType[] = [
    'National ID',
    "Voter's Card",
    "Driver's License",
    'International Passport',
    'CAC / RC Number',
    'Other'
];

export interface ClientInfo {
    name: string;
    email: string;
    phoneNumber: string;
    identificationType: ClientIdentificationType;
    identificationNumber: string;
    address: string;
    rcNumber?: string;
}

export type ProfessionalBody =
    | 'COREN - Council for regulation of engineering in Nigeria'
    | 'ARCON - Architects Registration council of Nigeria'
    | 'TOPREC - Town Planners Registration council of Nigeria'
    | 'CORBON - Council of Registered Builders of Nigeria'
    | 'QSRBN - Quantity Surveyors Registration Board of Nigeria'
    | 'Other';

export const PROFESSIONAL_BODY_OPTIONS: ProfessionalBody[] = [
    'COREN - Council for regulation of engineering in Nigeria',
    'ARCON - Architects Registration council of Nigeria',
    'TOPREC - Town Planners Registration council of Nigeria',
    'CORBON - Council of Registered Builders of Nigeria',
    'QSRBN - Quantity Surveyors Registration Board of Nigeria',
    'Other'
];

export type StaffStrength = 'Permanent' | 'Casual' | 'Artisans' | 'Other';

export const STAFF_STRENGTH_OPTIONS: StaffStrength[] = [
    'Permanent',
    'Casual',
    'Artisans',
    'Other'
];

export type ProjectType =
    | 'Commercial'
    | 'Residential'
    | 'Industrial'
    | 'Mass Housing (Estate Development)'
    | 'Other';

export const PROJECT_TYPES: ProjectType[] = [
    'Commercial',
    'Residential',
    'Industrial',
    'Mass Housing (Estate Development)',
    'Other'
];

export type ContractorType = 'Local' | 'International' | 'Other';

export const CONTRACTOR_TYPES: ContractorType[] = ['Local', 'International', 'Other'];

export interface OrganizationInfo {
    consultantName?: string;
    professionalBody?: ProfessionalBody;
    professionalRegistrationNumber?: string;
    otherProfessionalBodyName?: string;
    practiceLicenseNumber?: string;
    niobRegNo?: string;
    yearOfRegistration: Date | string;
    areaOfSpecialization?: string;
    staffStrength?: StaffStrength;
    noOfPermanentStaff?: number;
    permanentStaffCount?: number;
}

export interface MembershipInfo {
    MembershipStatusId: number;
    MembershipName?: string;
    MemberId?: string;
    MembershipNo?: string;
    ProfessionalBodyName?: string;
}

export interface CategoryOfWorkmen {
    categoryOfWorkmen: string;
    numberOfEmployment: string;
    yearsOfEmployment: string;
}

export interface Professional {
    surname: string;
    otherName: string;
    age: number;
    gender: 'Male' | 'Female' | 'Other';
    nationality: string;
    profession: string;
    qualification: string;
    yearsInEmployment: number;
}

export interface WorkforceInfo {
    categoryOfWorkmen: CategoryOfWorkmen[];
    professionals: Professional[];
    contractStaffCount: number;
    bloodRelationsCount: number;
}

export interface ComplianceInfo {
    HasInsurance: boolean;
    HasInsuranceDetails?: string;
    investigation: boolean;
    investigationDetails?: string;
    disciplinaryCommittee: boolean;
    disciplinaryCommitteeDetails?: string;
    legalSuitDetails?: string;
    preEmploymentCheck: boolean;
    preEmploymentCheckDetails?: string;
    PracticeOutsideNigeria: 'Yes' | 'No';
}

export type BuilderLiabilityCoverageType =
    | 'Public Liability'
    | "Employer's Liability"
    | 'Product Liability'
    | 'Professional Indemnity';

export const BUILDER_LIABILITY_COVERAGE_TYPES: BuilderLiabilityCoverageType[] = [
    'Public Liability',
    "Employer's Liability",
    'Product Liability',
    'Professional Indemnity'
];

export type TotalEstimateSumBand =
    | '0 - 50 million'
    | '50 - 100 million'
    | '100 - 500 million'
    | '500 million and above';

export const TOTAL_ESTIMATE_SUM_BANDS: TotalEstimateSumBand[] = [
    '0 - 50 million',
    '50 - 100 million',
    '100 - 500 million',
    '500 million and above'
];

export interface ProjectInfo {
    coverTypeIdx: boolean;
    isStatutory?: boolean;
    isStatutoryCover?: boolean;
    coverTypeIdxDetails: BuilderLiabilityCoverageType;
    coverageType?: BuilderLiabilityCoverageType;
    categoryOfContractorId: number;
    contractorCategory?: number;
    contractorType?: ContractorType;
    projectType?: ProjectType;
    extraHazardous: boolean;
    extraHazardousWork?: boolean;
    totalEstimateSum: number;
    totalEstimatedSum?: number;
    totalEstimateSumBand?: TotalEstimateSumBand;
    agisNo?: string;
    plotNumber?: string;
    projectTitle?: string;
    projectName?: string;
    workDetails?: string;
    address?: string;
    projectAddress?: string;
    lga?: string;
    projectLga?: string;
    district?: string;
    projectDistrict?: string;
    cadastralZone?: string;
}

export interface MetaInfo {
    ProductId: number;
    date: Date | string;
    salesOutlet?: string;
    brokerOrAgentName?: string;
}

export interface PaymentInfo {
    status: 'not_started' | 'pending' | 'paid' | 'rejected' | 'failed';
    amount?: number;
    transactionId?: string;
    method?: 'external_payment_service' | 'bank_transfer' | 'card' | 'other';
    initiatedAt?: Date | string;
    paidAt?: Date | string;
    rejectedAt?: Date | string;
    reason?: string;
    webhookData?: Record<string, unknown>;
}

export interface PolicyAction {
    type: 'calculate_premium' | 'initialize_payment' | string;
    label: string;
    method?: string;
    url?: string;
}

export interface PolicyWorkflow {
    currentStage: 'premium_calculation' | 'payment_ready' | string;
    premiumCalculated: boolean;
    canCalculatePremium: boolean;
    canInitializePayment: boolean;
    nextAction?: PolicyAction | null;
}

export interface AssignedSurveyorContact {
    surveyorId: string;
    name: string;
    email: string;
    phone: string;
    organization?: 'AMMC' | 'NIA';
    licenseNumber?: string;
    address?: string;
    emergencyContact?: string;
    specialization?: string[];
    experience?: number;
    rating?: number;
    availability?: string;
    assignedAt?: Date | string;
}

export interface StatusHistoryEntry {
    status: BuilderLiabilityPolicyStatus;
    changedBy?: string;
    changedAt: Date | string;
    reason?: string;
    metadata?: Record<string, unknown>;
}

export interface DocumentInfo {
    fileName: string;
    fileType: string;
    fileSize: number;
    cloudinaryUrl: string;
    cloudinaryPublicId: string;
    category: 'application_documents' | 'identification' | 'property_documents' | 'supporting_documents' | 'survey_reports' | 'general';
    description?: string;
    documentType: 'application_form' | 'id_document' | 'property_deed' | 'survey_report' | 'photo' | 'other';
    uploadedBy: string;
    uploadedAt: Date | string;
    isRequired: boolean;
    isVerified: boolean;
    verifiedBy?: string;
    verifiedAt?: Date | string;
    downloadPath?: string;
    downloadUrl?: string;
    storageType?: string;
    name?: string;
    submissionId?: string;
    fileId?: string;
    publicId?: string;
}

export type BuilderLiabilityPolicyStatus =
    | 'draft'
    | 'submitted'
    | 'assigned'
    | 'surveyed'
    | 'approved'
    | 'payment_pending'
    | 'rejected'
    | 'requires_more_info'
    | 'revision_required'
    | 'completed'
    | 'sent_to_user'
    | 'paid_niip_failed';

export type BuilderLiabilityPolicyPriority = 'low' | 'medium' | 'high' | 'urgent';

export interface BuilderLiabilityPolicyData {
    userId?: string;
    isDirectLabor?: boolean;
    builder: BuilderIdentity;
    client: ClientInfo;
    organization: OrganizationInfo;
    membership: MembershipInfo;
    workforce: WorkforceInfo;
    compliance: ComplianceInfo;
    project: ProjectInfo;
    meta: MetaInfo;
    status?: BuilderLiabilityPolicyStatus;
    priority?: BuilderLiabilityPolicyPriority;
    paymentInfo?: PaymentInfo;
}

export interface BuilderLiabilityPolicy extends BuilderLiabilityPolicyData {
    _id: string;
    policyNumber: string;
    isDirectLabor?: boolean;
    status: BuilderLiabilityPolicyStatus;
    rejectionReason?: string;
    assignedSurveyors: string[];
    surveyDocument?: DocumentInfo;
    surveyNotes: string;
    adminNotes: string;
    documents: DocumentInfo[];
    deadline: Date | string;
    statusHistory: StatusHistoryEntry[];
    niipPayload?: Record<string, unknown>;
    nextAction?: PolicyAction | null;
    primaryAction?: PolicyAction | null;
    availableActions?: PolicyAction[];
    actionLabel?: string | null;
    actionUrl?: string | null;
    actionMethod?: string | null;
    calculatePremiumUrl?: string | null;
    showCalculatePremiumButton?: boolean;
    canCalculatePremium?: boolean;
    canProceedToPayment?: boolean;
    premiumCalculated?: boolean;
    assignedSurveyorContacts?: AssignedSurveyorContact[];
    primaryAssignedSurveyorContact?: AssignedSurveyorContact | null;
    workflow?: PolicyWorkflow;
    createdAt: Date | string;
    updatedAt: Date | string;
}

// Validation Types
export interface ValidationError {
    field: string;
    message: string;
}

export interface ValidationWarning {
    field: string;
    message: string;
}

export interface ValidationResponse {
    isValid: boolean;
    errors: ValidationError[];
    warnings: ValidationWarning[];
    summary?: {
        totalErrors: number;
        totalWarnings: number;
    };
}

export interface SectionValidationResponse extends ValidationResponse {
    section: string;
}

// API Response Types
export interface CreatePolicyResponse {
    success: boolean;
    message: string;
    data: {
        policy: BuilderLiabilityPolicy;
        policyId: string;
        policyNumber: string;
    };
    warnings?: ValidationWarning[];
}

export interface GetPolicyResponse {
    success: boolean;
    data: {
        policy: BuilderLiabilityPolicy;
    };
}

export interface GetPoliciesResponse {
    success: boolean;
    data: {
        policies: BuilderLiabilityPolicy[];
        pagination: {
            currentPage: number;
            totalPages: number;
            totalPolicies: number;
            hasMore: boolean;
        };
    };
}

export interface UpdatePolicyResponse {
    success: boolean;
    message: string;
    data: {
        policy: BuilderLiabilityPolicy;
    };
    warnings?: ValidationWarning[];
}

export interface UpdatePolicyStatusResponse {
    success: boolean;
    message: string;
    data: {
        policy: BuilderLiabilityPolicy;
    };
}

export interface SearchPoliciesResponse {
    success: boolean;
    data: {
        policies: BuilderLiabilityPolicy[];
        searchTerm: string;
    };
}

export interface DeletePolicyResponse {
    success: boolean;
    message: string;
}

export interface ValidatePolicyResponse {
    success: boolean;
    data: ValidationResponse;
}

export interface ValidateSectionResponse {
    success: boolean;
    data: SectionValidationResponse;
}

// Filter and Query Types
export interface PolicyFilters {
    page?: number;
    limit?: number;
    status?: BuilderLiabilityPolicyStatus | 'all';
    priority?: BuilderLiabilityPolicyPriority | 'all';
    search?: string;
    sortBy?: 'createdAt' | 'updatedAt' | 'deadline' | 'policyNumber' | 'status';
    sortOrder?: 'asc' | 'desc';
}

export interface AdminPolicyFilters extends PolicyFilters {
    userId?: string;
    assignedSurveyor?: string;
}

// Form Data Types (for frontend forms)
export interface BuilderLiabilityPolicyFormData {
    // Builder Identity
    builderEmail: string;
    builderName: string;
    rcNumber: string;
    directorOfCompany: string;
    identificationType: number;
    identificationNumber: string;
    builderAddress: string;
    builderPhone: string;

    // Direct labor flag
    isDirectLabor: boolean;

    // Client Info
    clientName: string;
    clientEmail: string;
    clientPhoneNumber: string;
    clientIdentificationType: ClientIdentificationType;
    clientIdentificationNumber: string;
    clientAddress: string;
    clientRcNumber?: string;

    // Organization Info
    consultantName: string;
    professionalBody: ProfessionalBody | '';
    professionalRegistrationNumber: string;
    otherProfessionalBodyName?: string;
    practiceLicenseNumber?: string;
    yearOfRegistration: string;
    areaOfSpecialization?: string;
    staffStrength: StaffStrength | '';

    // Membership Info
    membershipStatusId: number;
    membershipName?: string;
    memberId?: string;
    membershipNumber?: string;
    professionalBodyName?: string;

    // Workforce Info
    workmenCategories: CategoryOfWorkmen[];
    professionals: Professional[];
    contractStaffCount: number;
    bloodRelationsCount: number;

    // Compliance Info
    hasInsurance: boolean;
    insuranceDetails?: string;
    underInvestigation: boolean;
    investigationDetails?: string;
    disciplinaryAction: boolean;
    disciplinaryDetails?: string;
    legalSuitDetails?: string;
    preEmploymentCheck: boolean;
    preEmploymentDetails?: string;
    practiceOutsideNigeria: 'Yes' | 'No';

    // Project Info
    coverTypeIndex: boolean;
    coverTypeDetails: BuilderLiabilityCoverageType;
    contractorCategoryId: number;
    contractorType: ContractorType | '';
    projectType: ProjectType | '';
    extraHazardous: boolean;
    totalEstimateSum: number;
    totalEstimateSumBand: TotalEstimateSumBand | '';
    agisNo?: string;
    projectTitle: string;
    workDetails?: string;
    projectAddress: string;
    projectLga: string;
    projectDistrict: string;
    cadastralZone: string;

    // Meta Info
    productId: number;
    salesOutlet?: string;
    brokerAgentName?: string;

    // Optional fields
    priority?: BuilderLiabilityPolicyPriority;
}

// Utility Types
export type PolicySection =
    | 'builder'
    | 'client'
    | 'organization'
    | 'membership'
    | 'workforce'
    | 'compliance'
    | 'project'
    | 'meta'
    | 'paymentInfo';

export interface PolicySectionData {
    builder: BuilderIdentity;
    organization: OrganizationInfo;
    membership: MembershipInfo;
    workforce: WorkforceInfo;
    compliance: ComplianceInfo;
    project: ProjectInfo;
    meta: MetaInfo;
    paymentInfo?: PaymentInfo;
}

// Dashboard and Statistics Types
export interface PolicyStatistics {
    total: number;
    byStatus: Record<BuilderLiabilityPolicyStatus, number>;
    byPriority: Record<BuilderLiabilityPolicyPriority, number>;
    recentPolicies: BuilderLiabilityPolicy[];
    overdueCount: number;
    completionRate: number;
}

export interface RecentActivity {
    id: string;
    type: 'policy_created' | 'policy_updated' | 'policy_approved' | 'policy_rejected';
    message: string;
    timestamp: Date | string;
    policyId?: string;
}

export interface Alert {
    id: string;
    type: 'warning' | 'error' | 'info';
    message: string;
    timestamp: Date | string;
    isRead: boolean;
}

export interface Notification {
    id: string;
    title: string;
    message: string;
    type: 'error' | 'warning' | 'success' | 'info';
    timestamp: Date | string;
    isRead: boolean;
}

export interface PolicyDashboardData {
    statistics: PolicyStatistics;
    recentActivity: RecentActivity[];
    alerts: Alert[];
    notifications: Notification[];
}
