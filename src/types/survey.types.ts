// Survey Data Types
export interface SurveyDataType {
    _id: string;
    ammcId: string;
    surveyorId: string;
    assignmentId?: string;
    surveyDetails?: {
        propertyCondition?: string;
        structuralAssessment?: string;
        riskFactors?: string;
        recommendations?: string;
        estimatedValue?: number;
        photos?: Array<{
            url: string;
            description: string;
            timestamp: string;
        }>;
    };
    surveyNotes?: string;
    contactLog?: Array<{
        date: string;
        method: 'phone' | 'email' | 'sms' | 'visit';
        notes: string;
        successful: boolean;
    }>;
    recommendedAction?: 'approve' | 'reject' | 'request_more_info';
    status?: string;
    submissionTime?: string;
    surveyDocument?: string;
    documents?: Array<{
        fileName: string;
        cloudinaryUrl: string;
        category: string;
    }>;
    createdAt?: string;
    updatedAt?: string;
}

// Assignment Data Type
export interface AssignmentDataType {
    _id: string;
    ammcId: string | {
        _id: string;
        propertyDetails: {
            address: string;
            propertyType: string;
        };
        contactDetails: {
            fullName: string;
            email: string;
            phoneNumber: string;
        };
    };
    surveyorId: string;
    status: string;
    priority: string;
    deadline?: string;
    assignedAt: string;
    instructions?: string;
    location?: {
        address: string;
        contactPerson?: {
            name: string;
            phone: string;
            email: string;
        };
    };
}

// Property Type for Dashboard
export interface PropertyType {
    _id: string;
    userId: string;
    categoryId: {
        _id: string;
        name: string;
    };
    address: string;
    phonenumber: string;
    images: string[];
    status?: string;
    propertyType: string;
    buildingValue: number;
    yearBuilt: number;
    squareFootage: number;
    constructionMaterial: string;
    category?: { category: string };
    createdAt: string;
    updatedAt: string;
}

// Performance Data Type
export interface PerformanceDataType {
    totalSurveys: number;
    completedSurveys: number;
    currentAssignments: number;
    rejectedSurveys: number;
    successRate: number;
    avgCompletionTime: number;
    recentActivity: number;
    rating: number;
    joinDate: string;
    lastActive: string;
}

// Admin Info Type
export interface AdminInfoType {
    fullname: string;
    email: string;
    organization: string;
    role?: string;
    brokerFirmName?: string;
}

// Test Results Type
export interface TestResultsType {
    success: boolean;
    message: string;
    counts?: {
        policies: number;
        submissions: number;
        mergedReports: number;
        dualAssignments: number;
    };
    data?: {
        totalReports: number;
        processedReports: number;
        errors: string[];
        created?: number;
        skipped?: number;
        total?: number;
        reports?: Array<{
            _id: string;
            policyId: string;
            status: string;
            createdAt: string;
        }>;
        counts?: {
            policies: number;
            submissions: number;
            mergedReports: number;
            dualAssignments: number;
        };
    };
}

// Merged Report Type
export interface MergedReportType {
    _id: string;
    policyId: string | {
        _id: string;
        policyNumber?: string;
        propertyDetails?: {
            address: string;
        };
    };
    releaseStatus: string;
    finalRecommendation: string;
    conflictDetected: boolean;
    conflictResolved: boolean;
    paymentEnabled?: boolean;
    mergingMetadata?: {
        qualityScore?: number;
    };
    conflictDetails?: {
        conflictType: string;
        conflictSeverity: string;
    };
    createdAt: string;
    releasedAt?: string;
    propertyDetails?: {
        address: string;
        propertyType: string;
    };
}

// Status Type
export interface StatusType {
    success: boolean;
    message: string;
    summary?: {
        totalPolicies: number;
        totalDualAssignments: number;
        totalSurveySubmissions: number;
        totalMergedReports: number;
        ammcSubmissions: number;
        niaSubmissions: number;
        completedDualAssignments: number;
        pendingDualAssignments: number;
    };
    data?: {
        totalAssignments: number;
        completedReports: number;
        pendingReports: number;
    };
}

// Missing Reports Type
export interface MissingReportsType {
    success: boolean;
    totalMissingReports?: number;
    totalPoliciesWithBothSubmissions?: number;
    totalExistingMergedReports?: number;
    missingReportPolicies?: Array<{
        _id: string;
        policyNumber: string;
        status: string;
        propertyDetails: {
            address: string;
        };
    }>;
    missingReports: Array<{
        policyId: string;
        assignmentId: string;
        reason: string;
    }>;
}


