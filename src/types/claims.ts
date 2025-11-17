// Claim-related types for type safety

export interface Policy {
    _id: string;
    policyNumber: string;
    policyType: string;
    coverageType: string;
    policyDuration: string;
    address: string;
    status: string;
    createdAt: string;
}

export interface PolicyDetails {
    _id: string;
    policyNumber: string;
    userId: string;
    policyType: string;
    coverageType: string;
    policyDuration: string;
    additionalCoverage: string[];
    propertyDetails: {
        address: string;
        propertyType: string;
        constructionType: string;
        yearBuilt: number;
        squareFootage: number;
        buildingValue: number;
    };
    contactDetails: {
        name: string;
        email: string;
        phone: string;
    };
    status: string;
    createdAt: string;
}

export interface ClaimRequest {
    _id: string;
    policyNumber: string;
    claimReason: string;
    referenceNumber: string;
    status: ClaimStatus;
    submissionDate: string;
    lastUpdated?: string;
    coverageType: string;
    address: string;
    documentsCount: number;
}

export interface ClaimDetails {
    _id: string;
    referenceNumber: string;
    policyNumber: string;
    claimReason: string;
    status: ClaimStatus;
    submissionDate: string;
    lastUpdated: string;
    policyType: string;
    coverageType: string;
    policyDuration: string;
    additionalCoverage: string[];
    propertyDetails: {
        address: string;
        propertyType: string;
        buildingValue: number;
        yearBuilt: number;
        squareFootage: number;
        constructionMaterial: string;
    };
    contactDetails: {
        name: string;
        email: string;
        phone: string;
    };
    documents: ClaimDocument[];
    statusHistory: StatusHistoryItem[];
}

export interface ClaimDocument {
    _id: string;
    fileName: string;
    fileType: string;
    fileSize: number;
    uploadedAt: string;
    cloudinaryPublicId: string;
}

export interface StatusHistoryItem {
    status: ClaimStatus;
    timestamp: string;
    reason?: string;
    changedBy?: string;
}

export interface Notification {
    _id: string;
    userId: string;
    claimId: string;
    type: NotificationType;
    message: string;
    isRead: boolean;
    metadata?: {
        oldStatus?: string;
        newStatus?: string;
        rejectionReason?: string;
    };
    createdAt: string;
}

export type ClaimStatus =
    | 'submitted'
    | 'under_review'
    | 'approved'
    | 'rejected'
    | 'completed'
    | 'requires_more_info';

export type NotificationType =
    | 'status_change'
    | 'assignment'
    | 'completion'
    | 'rejection'
    | 'under_review';

export interface FormErrors {
    policyNumber?: string;
    claimReason?: string;
    files?: string;
    general?: string;
}

export interface ClaimSubmissionResponse {
    success: boolean;
    message: string;
    claimId: string;
    referenceNumber: string;
    documentsUploaded: number;
}

export interface PolicyValidationResponse {
    success: boolean;
    policy?: PolicyDetails;
    error?: string;
}

export interface ClaimsListResponse {
    success: boolean;
    count: number;
    claims: ClaimRequest[];
}

export interface ClaimDetailsResponse {
    success: boolean;
    claim: ClaimDetails;
    statusHistory: StatusHistoryItem[];
}

export interface NotificationsResponse {
    success: boolean;
    count: number;
    unreadCount: number;
    notifications: Notification[];
}
