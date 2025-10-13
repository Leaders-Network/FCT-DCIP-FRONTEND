// User related types
export interface User {
    _id: string;
    fullname: string;
    phonenumber: string;
    email: string;
    role: 'user';
    isEmailVerified: boolean;
    deleted: boolean;
}

export interface Employee {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  employeeStatus: {
    _id: string;
    status: string;
  };
  employeeRole: {
    _id: string;
    role: RoleType;
  };
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export type RoleType = 'Super-admin' | 'Admin' | 'Staff' | 'Surveyor';

export const enum UserRoles {
  SUPER_ADMIN = "67097fb3f07f5547278be69b",
  ADMIN = "67097fb3f07f5547278be69c",
  STAFF = "67097fb3f07f5547278be69d",
  SURVEYOR = "67097fb3f07f5547278be69e"
}

export interface Role {
  _id: string;
  role: RoleType;
}

export interface EmployeeRegistrationData {
  firstname: string;
  lastname: string;
  phonenumber: string;
  email: string;
  roleId: string;
  statusId: string;
}

// API Response types
export interface UserLoginResponse {
    success: boolean;
    user: User;
    token: string;
}

export interface EmployeeLoginResponse {
  success: boolean;
  employee: Employee;
  token: string;
}

export interface AvailableRolesResponse {
  role: RoleType;
  roles: Role[];
}

export interface GetAllEmployeesResponse {
  success: boolean;
  allStaff: {
    count: number;
    sanitizedEmployees: Employee[];
  };
}

// Policy Request types
export interface PolicyRequest {
  _id: string;
  userId: string;
  policyNumber?: string;
  propertyDetails: {
    address: string;
    propertyType: string;
    buildingValue: number;
    yearBuilt: number;
    squareFootage: number;
    constructionMaterial: string;
  };
  contactDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    alternatePhone?: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
    additionalCoverage?: string[];
    specialRequests?: string;
  };
  status: 'pending' | 'submitted' | 'assigned' | 'surveyed' | 'approved' | 'rejected' | 'completed';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedSurveyors?: string[];
  surveyDocument?: string | {
    name: string;
    url: string;
    publicId: string;
  };
  surveyNotes?: string;
  adminNotes?: string;
  documents?: DocumentFile[];
  statusHistory?: Array<{
    status: string;
    changedBy: string;
    changedAt: string;
    reason: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyRequestData {
  propertyId?: string;
  propertyDetails: {
    address: string;
    propertyType: string;
    buildingValue: number;
    yearBuilt: number;
    squareFootage: number;
    constructionMaterial: string;
  };
  contactDetails: {
    fullName: string;
    email: string;
    phoneNumber: string;
    alternatePhone?: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
    additionalCoverage?: string[];
    specialRequests?: string;
  };
}

// Surveyor types
export interface Surveyor extends Employee {
  userId?: string;
  specializations?: string[];
  licenseNumber?: string;
  totalSurveys?: number;
  completedSurveys?: number;
  rating?: number;
  address?: string;
  emergencyContact?: string;
  notes?: string;
  status?: 'active' | 'inactive' | 'suspended';
  role?: string;
  profile?: {
    availability: 'available' | 'busy' | 'unavailable';
    specialization: string[];
    location: {
      state: string;
      city: string;
      coordinates?: {
        latitude: number;
        longitude: number;
      };
    };
    workSchedule: {
      monday: { start: string; end: string; available: boolean };
      tuesday: { start: string; end: string; available: boolean };
      wednesday: { start: string; end: string; available: boolean };
      thursday: { start: string; end: string; available: boolean };
      friday: { start: string; end: string; available: boolean };
      saturday: { start: string; end: string; available: boolean };
      sunday: { start: string; end: string; available: boolean };
    };
  };
  statistics?: {
    totalAssignments: number;
    completedSurveys: number;
    averageRating: number;
    onTimeDeliveryRate: number;
    averageCompletionTime: number;
    currentWorkload: number;
  };
}

export interface SurveySubmission {
  policyId: string;
  surveyorId: string;
  surveyDocument: File | string | {
    name: string;
    url: string;
    publicId: string;
  };
  surveyNotes: string;
  contactLog: ContactLogEntry[];
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
}

export interface ContactLogEntry {
  date: string;
  method: 'phone' | 'email' | 'sms' | 'visit';
  notes: string;
  successful: boolean;
}

// Admin Policy Management types
export interface PolicyAssignment {
  policyId: string;
  surveyorIds: string[];
  assignedBy: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  instructions?: string;
}

export interface PolicyReview {
  policyId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  reviewNotes: string;
  recommendedChanges?: string;
}

// Assignment Management Types
export interface Assignment {
  _id: string;
  policyId: string;
  surveyorId: string;
  assignedBy: string;
  assignedAt: string;
  deadline: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  status: 'assigned' | 'accepted' | 'in_progress' | 'completed' | 'rejected' | 'cancelled';
  instructions: string;
  specialRequirements: string[];
  location: {
    address: string;
    coordinates?: {
      latitude: number;
      longitude: number;
    };
    accessInstructions?: string;
    contactPerson: {
      name: string;
      phone: string;
      email: string;
      availableHours?: string;
    };
  };
  estimatedDuration?: number;
  actualDuration?: number;
  progressTracking: {
    startedAt?: string;
    completedAt?: string;
    lastUpdate: string;
    milestones: Array<{
      name: string;
      completedAt: string;
      notes: string;
    }>;
    checkpoints: Array<{
      timestamp: string;
      location?: {
        latitude: number;
        longitude: number;
      };
      notes: string;
      photos: string[];
    }>;
  };
  communication: {
    messages: Array<{
      _id: string;
      from: string;
      message: string;
      timestamp: string;
      type: 'message' | 'status_update' | 'question' | 'clarification';
    }>;
    lastContact?: string;
  };
  documents: DocumentFile[];
  timeline: Array<{
    action: string;
    timestamp: string;
    performedBy: string;
    details: string;
    notes?: string;
  }>;
  rating?: {
    score: number;
    feedback: string;
    ratedBy: string;
    ratedAt: string;
  };
  expenses?: {
    transportation: number;
    accommodation: number;
    meals: number;
    equipment: number;
    other: number;
    receipts: Array<{
      description: string;
      amount: number;
      receiptUrl: string;
      category: string;
    }>;
    totalExpenses: number;
    approved: boolean;
    approvedBy?: string;
  };
  createdAt: string;
  updatedAt: string;
}

// Document File Interface
export interface DocumentFile {
  _id?: string;
  fileName: string;
  fileType: string;
  fileSize: number;
  cloudinaryUrl: string;
  cloudinaryPublicId: string;
  category: 'survey_report' | 'photos' | 'receipts' | 'legal_documents' | 'inspection_forms' | 'general' | 'application_documents' | 'identification' | 'property_documents' | 'supporting_documents' | 'survey_reports';
  description?: string;
  documentType: 'survey_document' | 'photo' | 'receipt' | 'report' | 'form' | 'other' | 'application_form' | 'id_document' | 'property_deed' | 'main_report' | 'supporting_doc';
  uploadedBy: string;
  uploadedAt: string;
  isPublic?: boolean;
  isRequired?: boolean;
  isVerified?: boolean;
  isMainReport?: boolean;
  verifiedBy?: string;
  verifiedAt?: string;
  metadata?: {
    location?: {
      latitude: number;
      longitude: number;
    };
    timestamp?: string;
    deviceInfo?: string;
  };
}

// Enhanced Survey Submission Interface
export interface EnhancedSurveySubmission {
  _id: string;
  policyId: string;
  surveyorId: string;
  assignmentId?: string;
  surveyDetails: {
    propertyCondition: string;
    structuralAssessment: string;
    riskFactors: string;
    recommendations: string;
    estimatedValue?: number;
    photos: Array<{
      url: string;
      publicId: string;
      description: string;
      timestamp: string;
    }>;
  };
  documents: DocumentFile[];
  surveyDocument?: any; // Legacy field
  surveyNotes: string;
  contactLog: Array<{
    date: string;
    method: 'phone' | 'email' | 'sms' | 'visit';
    notes: string;
    successful: boolean;
    duration?: number;
  }>;
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
  qualityCheck?: {
    completeness: number;
    accuracy: number;
    timeliness: number;
    overallScore: number;
    reviewedBy?: string;
    reviewedAt?: string;
    comments?: string;
  };
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_required';
  submissionTime: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  revisionHistory: Array<{
    version: number;
    changes: string;
    revisedBy: string;
    revisedAt: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

// Dashboard Analytics Interfaces
export interface DashboardData {
  summary: {
    policies: {
      total: number;
      pending: number;
      approved: number;
      rejected: number;
      growth: number;
    };
    assignments: {
      total: number;
      active: number;
      completed: number;
      overdue: number;
      completionRate: number;
    };
    surveyors: {
      total: number;
      active: number;
      available: number;
    };
  };
  recentActivity: {
    policies: PolicyRequest[];
    assignments: Assignment[];
    submissions: EnhancedSurveySubmission[];
  };
  analytics: {
    dailyTrends: Array<{
      _id: { date: string };
      newPolicies: number;
      approvedPolicies: number;
    }>;
    topSurveyors: Array<{
      _id: string;
      completedAssignments: number;
      avgCompletionTime: number;
      surveyor: any;
      employee: any;
    }>;
    statusDistribution: Array<{
      _id: string;
      count: number;
      percentage: number;
    }>;
    priorityDistribution: Array<{
      _id: string;
      count: number;
    }>;
    systemHealth: {
      overdueRate: number;
      surveyorUtilization: number;
      avgProcessingTime: number;
    };
  };
}

export interface QuickStats {
  todayPolicies: number;
  weekPolicies: number;
  pendingAssignments: number;
  overdueAssignments: number;
  activeSubmissions: number;
}

export interface AdminAlert {
  type: 'overdue_assignment' | 'pending_review' | 'unassigned_policy';
  severity: 'high' | 'medium' | 'low';
  title: string;
  message: string;
  data: any;
  timestamp: string;
}

// API Response types for new endpoints
export interface GetPolicyRequestsResponse {
  success: boolean;
  policies: PolicyRequest[];
  total: number;
  page: number;
  limit: number;
}

export interface GetSurveyorsResponse {
  success: boolean;
  surveyors: Surveyor[];
}

export interface GetAssignedPoliciesResponse {
  success: boolean;
  policies: PolicyRequest[];
}
