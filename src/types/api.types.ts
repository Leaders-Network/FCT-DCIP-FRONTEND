
import { ApiResponse, ApiSuccessResponse, ApiErrorResponse, RecommendationAction, PaginationData } from './utility.types';
export type { ApiResponse, RecommendationAction, PaginationData };

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
  organization?: 'AMMC' | 'NIA';
  surveyorInfo?: {
    _id: string;
    specialization: string[];
    experience: number;
    availability: string;
  };
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
  ammcId?: string | {
    _id: string;
    propertyDetails?: {
      address: string;
      propertyType: string;
      buildingValue: number;
    };
    requestDetails?: {
      coverageType: string;
    };
    contactDetails?: {
      fullName: string;
    };
  };
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
    rcNumber: string;
  };
  requestDetails: {
    coverageType: string;
    policyDuration: string;
    additionalCoverage?: string[];
    specialRequests?: string;
  };
  status: 'pending' | 'submitted' | 'assigned' | 'surveyed' | 'approved' | 'rejected' | 'completed' | 'under_review' | 'revision_required';
  priority?: 'low' | 'medium' | 'high' | 'urgent';
  assignedSurveyors?: string[];
  surveyDocument?: string | {
    name: string;
    url: string;
    publicId: string;
  };
  surveyNotes?: string;
  adminNotes?: string;
  rejectionReason?: string;
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
    rcNumber: string;
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
  experience?: number;
  maxAssignments?: number;
  dateOfBirth?: string;
  qualifications?: string[];
  availability?: 'available' | 'busy' | 'unavailable';
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
  ammcId: string;
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
  ammcId: string;
  surveyorIds: string[];
  assignedBy: string;
  deadline?: string;
  priority: 'low' | 'medium' | 'high';
  instructions?: string;
}

export interface PolicyReview {
  ammcId: string;
  reviewerId: string;
  decision: 'approved' | 'rejected';
  reviewNotes: string;
  recommendedChanges?: string;
}

// Assignment Management Types
export interface Assignment {
  _id: string;
  ammcId: string | PolicyRequest;
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
  dualAssignmentId?: string;
  organization?: string;
  isDualSurveyor?: boolean;
  dualAssignmentInfo?: DualAssignment;
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

// Survey Submission Types
export interface SurveyPhoto {
  url: string;
  publicId: string;
  description: string;
  timestamp: string;
}

export interface SurveyDetails {
  propertyCondition: string;
  structuralAssessment: string;
  riskFactors: string;
  recommendations: string;
  estimatedValue?: number;
  photos: SurveyPhoto[];
}

export interface ContactLogEntry {
  date: string;
  method: 'phone' | 'email' | 'sms' | 'visit';
  notes: string;
  successful: boolean;
  duration?: number;
}

export interface QualityCheck {
  completeness: number;
  accuracy: number;
  timeliness: number;
  overallScore: number;
  reviewedBy?: string;
  reviewedAt?: string;
  comments?: string;
}

export interface RevisionHistoryEntry {
  version: number;
  changes: string;
  revisedBy: string;
  revisedAt: string;
}

// SurveySubmissionData is defined in component.types.ts to avoid duplication

export interface SurveySubmissionResult {
  submission: EnhancedSurveySubmission;
  dualAssignmentInfo?: {
    completionStatus: number;
    assignmentStatus: string;
    isDualSurveyor: boolean;
  };
  otherSurveyorNotified?: boolean;
  organization: string;
}

// Enhanced Survey Submission Interface
export interface EnhancedSurveySubmission {
  _id: string;
  ammcId: string;
  surveyorId: string;
  assignmentId?: string;
  surveyDetails: SurveyDetails;
  documents: DocumentFile[];
  surveyDocument?: DocumentFile; // Legacy field with proper type
  surveyNotes: string;
  contactLog: ContactLogEntry[];
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
  qualityCheck?: QualityCheck;
  status: 'draft' | 'submitted' | 'under_review' | 'approved' | 'rejected' | 'revision_required';
  submissionTime: string;
  reviewedBy?: string;
  reviewedAt?: string;
  reviewNotes?: string;
  revisionHistory: RevisionHistoryEntry[];
  createdAt: string;
  updatedAt: string;
}

// Dual Assignment Types
export interface DualAssignment {
  _id: string;
  policyId: {
    _id: string;
    propertyDetails: {
      propertyType: string;
      address: string;
      buildingValue: number;
    };
    contactDetails: {
      fullName: string;
      email: string;
      phoneNumber: string;
    };
    status: string;
  };
  assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
  completionStatus: 0 | 50 | 100;
  ammcSurveyorContact?: SurveyorContact;
  niaSurveyorContact?: SurveyorContact;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  estimatedCompletion: {
    overallDeadline: string;
  };
  createdAt: string;
  currentSurveyorInfo?: {
    assignmentId: Assignment;
  };
  partnerSurveyorInfo?: SurveyorContact;
  policyDetails?: {
    address: string;
    propertyType?: string;
    buildingValue?: number;
  };
  currentSurveyorOrganization?: string;
}

export interface SurveyorContact {
  _id?: string;
  fullname?: string;
  name?: string;
  email: string;
  phone?: string;
  phoneNumber?: string;
  licenseNumber?: string;
  license?: string;
  rating?: number;
  experience?: number;
  specialization?: string[];
  organization?: 'AMMC' | 'NIA';
}

// Contact Management Types
export interface ContactData {
  ammcSurveyor: SurveyorContactInfo | null;
  niaSurveyor: SurveyorContactInfo | null;
  assignmentStatus: 'unassigned' | 'partially_assigned' | 'fully_assigned';
  ammcAdmin: AdminContactInfo | null;
  niaAdmin: AdminContactInfo | null;
  policyId: string | null | undefined;
  mergedReportId: string | null | undefined;
  hasConflicts: boolean;
}

export interface ConflictInquiryData {
  policyId?: string;
  mergedReportId?: string;
  conflictType: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  contactPreference: 'email' | 'phone';
  additionalInfo?: string;
}

export interface SurveyorContactInfo {
  name: string;
  email: string;
  phone: string;
  organization?: 'AMMC' | 'NIA';
  licenseNumber?: string;
  specialization?: string[];
  experience?: number;
  rating?: number;
  lastActive?: string;
}

export interface AdminContactInfo {
  name: string;
  email: string;
  phone: string;
  organization: 'AMMC' | 'NIA';
  title?: string;
  department?: string;
  officeHours?: string;
  emergencyContact?: boolean;
}

// NIA Admin Types
export interface NIAUser {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
}

export interface NIASurveyor {
  _id?: string;
  userId: NIAUser | string;
  firstname?: string;
  lastname?: string;
  email?: string;
  phoneNumber?: string;
  address?: string;
  licenseNumber?: string;
  specialization: string[];
  experience?: number;
  status: 'active' | 'inactive' | 'suspended';
  availability?: 'available' | 'busy' | 'unavailable';
  maxAssignments?: number;
  currentAssignments: number;
  completedAssignments: number;
  rating: number;
  joinedDate: string;
  lastActive: string;
  dateOfBirth?: string;
  emergencyContact?: {
    name: string;
    phone: string;
    relationship: string;
  };
  qualifications?: string[];
  notes?: string;
  profile?: {
    experience?: number;
    availability?: 'available' | 'busy' | 'unavailable';
    specialization?: string[];
  };
}

// Enhanced NIASurveyor for management operations
export interface NIASurveyorForManagement extends NIASurveyor {
  firstname: string;
  lastname: string;
  email: string;
  phoneNumber: string;
  address: string;
  licenseNumber: string;
  specialization: string[];
  experience: number;
  availability: 'available' | 'busy' | 'unavailable';
  maxAssignments: number;
}

// NIA Surveyor Management Props
export interface NIASurveyorManagementProps {
  surveyor: NIASurveyor | null;
  mode: 'add' | 'edit' | 'view';
  onSave: (surveyor: NIASurveyor) => Promise<void>;
  onClose: () => void;
}



// Processing Monitor Types - imported from processingMonitor service
// These types are defined in src/services/processingMonitor.ts to avoid duplication

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
      surveyor: Surveyor;
      employee: Employee;
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
  data: Record<string, unknown>;
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

// API Filter Types
export interface DualAssignmentFilters {
  assignmentStatus?: string;
  completionStatus?: string;
  priority?: string;
  page?: number;
  limit?: number;
}

export interface SurveyorFilters {
  status?: string;
  availability?: string;
  specialization?: string;
  search?: string;
  organization?: string;
  page?: number;
  limit?: number;
}

export interface AssignmentFilters {
  status?: string;
  priority?: string;
  surveyorId?: string;
  overdue?: boolean;
  page?: number;
  limit?: number;
}



// Report Types
export interface UserReport {
  _id?: string;
  reportId?: string;
  policyId: string;
  propertyAddress?: string;
  propertyType?: string;
  status: 'pending' | 'released' | 'withheld' | string;
  createdAt: string;
  downloadCount?: number;
  canDownload?: boolean;
  isMerged?: boolean;
  finalRecommendation?: 'approve' | 'reject' | 'request_more_info';
  paymentEnabled?: boolean;
  conflictDetected?: boolean;
  estimatedValue?: number;
  surveyDetails?: {
    estimatedValue?: number;
  };
}

export interface ReportSectionData {
  propertyCondition: string;
  structuralAssessment: string;
  riskFactors: string;
  recommendations: string;
  estimatedValue: number;
  surveyorName: string;
  surveyorLicense: string;
  submissionDate: string;
  photos: Array<{
    url: string;
    description: string;
    timestamp: string;
  }>;
}

export interface ConflictDetails {
  conflictType: string;
  conflictSeverity: 'low' | 'medium' | 'high' | 'critical';
  ammcRecommendation: string;
  niaRecommendation: string;
  ammcValue?: number;
  niaValue?: number;
  discrepancyPercentage?: number;
}

export interface MergingMetadata {
  mergedBy: string;
  mergedAt: string;
  mergingAlgorithmVersion: string;
  processingTime: number;
  qualityScore: number;
}

export interface ReportDetails {
  reportId: string;
  policyId: string;
  propertyDetails: {
    address: string;
    propertyType: string;
    [key: string]: unknown;
  };
  status: 'pending' | 'released' | 'withheld';
  finalRecommendation: string;
  paymentEnabled: boolean;
  conflictDetected: boolean;
  conflictResolved: boolean;
  conflictDetails?: ConflictDetails;
  reportSections: {
    ammc: ReportSectionData;
    nia: ReportSectionData;
  };
  mergingMetadata: MergingMetadata;
  createdAt: string;
  releasedAt: string;
  downloadCount: number;
  canDownload: boolean;
}

export interface ReportStatus {
  status: 'not_started' | 'awaiting_surveys' | 'processing' | 'processing_delayed' | 'under_review' | 'completed' | 'unknown';
  message: string;
  stage: string;
  progress?: number;
  estimatedCompletion?: string;
  processingProgress?: number;
  conflictDetails?: ConflictDetails;
  completedAt?: string;
  reportId?: string;
  createdAt?: string;
  releasedAt?: string;
  conflictDetected?: boolean;
  conflictResolved?: boolean;
  dualAssignmentId?: string;
  surveyStatus?: {
    ammc: string;
    nia: string;
  };
}


export interface ReportDetailsExtended {
  reportId: string;
  status: string;
  downloadCount: number;
  canDownload: boolean;
  finalRecommendation?: RecommendationAction;
  conflictDetected: boolean;
  conflictResolved: boolean;
  propertyDetails: {
    address: string;
    propertyType: string;
  };
  surveyorContacts?: {
    ammc?: SurveyorContactInfo;
    nia?: SurveyorContactInfo;
  };
  individualReports?: {
    ammcReportId?: string;
    niaReportId?: string;
    ammcSubmission?: EnhancedSurveySubmission;
    niaSubmission?: EnhancedSurveySubmission;
  };
}

// Conflict Inquiry Interface
export interface ConflictInquiry {
  _id?: string;
  policyId?: string;
  mergedReportId?: string;
  conflictType: string;
  description: string;
  priority: 'low' | 'medium' | 'high';
  contactPreference: 'email' | 'phone';
  additionalInfo?: string;
  status?: 'pending' | 'in_progress' | 'resolved';
  createdAt?: string;
  updatedAt?: string;
}

// Inquiry Response Interface
export interface InquiryResponse {
  success: boolean;
  inquiry: ConflictInquiry;
  message?: string;
}

// Download Response Interface
export interface DownloadResponse {
  reportId: string;
  downloadCount: number;
  downloadUrl?: string;
  propertyDetails: ReportDetails['propertyDetails'];
  finalRecommendation: string;
  paymentEnabled: boolean;
  conflictDetected: boolean;
  reportSections: ReportDetails['reportSections'];
  mergingMetadata: MergingMetadata;
  releasedAt: string;
}

// Report Photo Interface
export interface ReportPhoto {
  url: string;
  description: string;
  timestamp: string;
  publicId?: string;
}

// Merged Report Interface
export interface MergedReport extends ReportDetails {
  individualReports: {
    ammcReportId: string;
    niaReportId: string;
    ammcSubmission?: EnhancedSurveySubmission;
    niaSubmission?: EnhancedSurveySubmission;
  };
}

// Recent Report Interface
export interface RecentReport {
  reportId: string;
  policyId: string;
  propertyAddress: string;
  propertyType: string;
  status: 'pending' | 'released' | 'withheld';
  createdAt: string;
  finalRecommendation: string;
  conflictDetected: boolean;
  downloadCount: number;
  canDownload: boolean;
  isMerged?: boolean;
  paymentEnabled: boolean;
}

// Report Summary Interface
export interface ReportSummary {
  totalReports: number;
  releasedReports: number;
  pendingReports: number;
  withheldReports: number;
  completedReports: number;
}

// Dual Assignment Data Interface
export interface DualAssignmentData {
  _id?: string;
  policyId: string | {
    _id: string;
    propertyDetails: {
      propertyType: string;
      address: string;
      buildingValue: number;
      yearBuilt?: string;
      squareFootage?: number;
      constructionMaterial?: string;
    };
    contactDetails: {
      fullName: string;
      email: string;
      phoneNumber: string;
      alternatePhone?: string;
    };
    requestDetails: {
      coverageType: string;
      policyStartDate: string;
      policyEndDate: string;
    };
    status: string;
    createdAt: string;
    updatedAt: string;
  };
  ammcSurveyorId?: string;
  niaSurveyorId?: string;
  ammcSurveyorContact?: SurveyorContact;
  niaSurveyorContact?: SurveyorContact;
  assignmentStatus?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent' | string;
  deadline?: string;
  instructions?: string;
  completionStatus: 0 | 50 | 100 | number;
  conflictDetected?: boolean;
  estimatedCompletion?: {
    ammc: string;
    nia: string;
  };
}

// Admin Contact Interface
export interface AdminContact {
  name: string;
  email: string;
  phone: string;
  organization: 'AMMC' | 'NIA';
  title: string;
  department: string;
  officeHours?: string;
  emergencyContact?: boolean;
}

// Broker Admin Types
export interface BrokerAdmin {
  _id: string;
  userId: string;
  organization: 'Broker';
  brokerFirmName: string;
  brokerFirmLicense: string;
  permissions: {
    canViewClaims: boolean;
    canUpdateClaimStatus: boolean;
    canViewReports: boolean;
    canAccessAnalytics: boolean;
    canManageAdmins: boolean;
  };
  profile: {
    department: string;
    position: string;
    licenseNumber: string;
  };
  settings: {
    notifications: {
      email: boolean;
      sms: boolean;
    };
    dashboard: {
      defaultView: 'claims' | 'analytics' | 'reports';
      autoRefresh: boolean;
    };
  };
  status: 'active' | 'inactive' | 'suspended';
  lastLogin?: string;
  loginHistory: Array<{
    timestamp: string;
    ipAddress: string;
    userAgent: string;
  }>;
  createdAt: string;
  updatedAt: string;
}

export interface BrokerAdminLoginResponse {
  success: boolean;
  message: string;
  token: string;
  user: {
    id: string;
    email: string;
    fullname: string;
    organization: 'Broker';
    role: string;
    tokenType: 'broker-admin';
  };
  brokerAdmin: {
    id: string;
    brokerFirmName: string;
    permissions: BrokerAdmin['permissions'];
    settings: BrokerAdmin['settings'];
  };
}

export interface BrokerAdminVerifyResponse {
  success: boolean;
  user: {
    id: string;
    fullname: string;
    organization: 'Broker';
    role: string;
    tokenType: 'broker-admin';
  };
  brokerAdmin: {
    id: string;
    brokerFirmName: string;
    permissions: BrokerAdmin['permissions'];
    settings: BrokerAdmin['settings'];
    status: 'active' | 'inactive' | 'suspended';
  };
}

export interface BrokerClaimStatusHistory {
  status: 'pending' | 'under_review' | 'rejected' | 'completed';
  changedAt: string;
  changedBy?: string;
  reason?: string;
  notes?: string;
}

export interface BrokerPolicyRequest extends PolicyRequest {
  brokerStatus: 'pending' | 'under_review' | 'approved' | 'rejected' | 'completed';
  brokerNotes?: string;
  brokerAssignedTo?: string;
  brokerStatusHistory: BrokerClaimStatusHistory[];
  claimRequested?: boolean;
  claimRequestedAt?: string;
  claimReason?: string;
}

export interface BrokerDashboardData {
  statistics: {
    pending: number;
    under_review: number;
    rejected: number;
    completed: number;
    total: number;
  };
  averageProcessingTime: number;
  recentActivity: Array<{
    claimId: string;
    policyNumber?: string;
    action: string;
    timestamp: string;
    performedBy: string;
  }>;
}

export interface BrokerClaimFilters {
  status?: 'all' | 'pending' | 'under_review' | 'rejected' | 'completed';
  dateFrom?: string;
  dateTo?: string;
  policyNumber?: string;
  sortBy?: 'submissionDate' | 'priority' | 'policyNumber';
  sortOrder?: 'asc' | 'desc';
  page?: number;
  limit?: number;
}

export interface BrokerClaimsResponse {
  success: boolean;
  claims: BrokerPolicyRequest[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
  pagination?: {
    total: number;
    totalPages: number;
    currentPage: number;
    itemsPerPage: number;
  };
}

export interface BrokerClaimDetailResponse {
  success: boolean;
  claim: BrokerPolicyRequest;
}

export interface BrokerStatusUpdateRequest {
  status: 'under_review' | 'rejected' | 'completed';
  reason?: string;
  notes?: string;
}

export interface BrokerStatusUpdateResponse {
  success: boolean;
  message: string;
  claim: BrokerPolicyRequest;
}

export type UserReportsResponse = ApiSuccessResponse<{
    reports: UserReport[];
    pagination: PaginationData;
}> | ApiErrorResponse;

export type ReportSummaryResponse = ApiSuccessResponse<{
    totalReports: number;
    releasedReports: number;
    pendingReports: number;
    withheldReports: number;
    completedReports: number;
}> | ApiErrorResponse;

export type ReportDetailsResponse = ApiSuccessResponse<ReportDetails> | ApiErrorResponse;

export type ReportStatusResponse = ApiSuccessResponse<ReportStatus> | ApiErrorResponse;

export type DownloadReportResponse = ApiSuccessResponse<{
    reportId: string;
    downloadCount: number;
    propertyDetails: ReportDetails['propertyDetails'];
    finalRecommendation: RecommendationAction;
    paymentEnabled: boolean;
    conflictDetected: boolean;
    reportSections: ReportDetails['reportSections'];
    mergingMetadata: MergingMetadata;
    releasedAt: string;
}> | ApiErrorResponse;

export interface SurveyData {
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
}

export interface IndividualReportDownloadResponse {
  submissionId: string;
  organization: string;
  downloadUrl?: string;
  documents?: Array<{
    cloudinaryUrl: string;
    fileName: string;
    isMainReport: boolean;
  }>;
  surveyData: SurveyData;
  submittedAt: string;
  surveyorNotes: string;
}

// Export SurveySubmissionData from component.types
export type { SurveySubmissionData } from './component.types';
