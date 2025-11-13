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

// Assignment Management Props
export interface AssignmentManagementProps {
  onAssignmentComplete?: () => void;
  onClose?: () => void;
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
  name: string;
  email: string;
  phone: string;
  licenseNumber?: string;
  experience?: number;
  specialization?: string[];
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
  reportId: string;
  policyId: string;
  propertyAddress: string;
  propertyType: string;
  status: 'pending' | 'released' | 'withheld';
  createdAt: string;
  downloadCount: number;
  canDownload: boolean;
  isMerged?: boolean;
  finalRecommendation?: 'approve' | 'reject' | 'request_more_info';
  paymentEnabled?: boolean;
  conflictDetected?: boolean;
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

// API Response Types
export interface ApiResponse<T = unknown> {
  success: boolean;
  data?: T;
  message?: string;
  error?: string;
}

export interface PaginationData {
  currentPage: number;
  totalPages: number;
  totalItems: number;
  itemsPerPage: number;
}

export interface UserReportsResponse extends ApiResponse<{
  reports: UserReport[];
  pagination: PaginationData;
}> { }

export interface ReportSummaryResponse extends ApiResponse<{
  totalReports: number;
  releasedReports: number;
  pendingReports: number;
  withheldReports: number;
  completedReports: number;
}> { }

export interface ReportDetailsResponse extends ApiResponse<ReportDetails> { }

export interface ReportStatusResponse extends ApiResponse<ReportStatus> { }

export interface DownloadReportResponse extends ApiResponse<{
  reportId: string;
  downloadCount: number;
  propertyDetails: ReportDetails['propertyDetails'];
  finalRecommendation: string;
  paymentEnabled: boolean;
  conflictDetected: boolean;
  reportSections: ReportDetails['reportSections'];
  mergingMetadata: ReportDetails['mergingMetadata'];
  releasedAt: string;
}> { }

// Additional interfaces for better type safety
// ProcessingMonitorData uses types from processingMonitor service
export interface ProcessingMonitorData {
  overview: import('@/services/processingMonitor').ProcessingOverview | null;
  activeProcessing: import('@/services/processingMonitor').ActiveProcessing | null;
  performanceMetrics: import('@/services/processingMonitor').PerformanceMetrics | null;
  systemHealth: import('@/services/processingMonitor').SystemHealth | null;
  recentActivity: import('@/services/processingMonitor').RecentActivity | null;
}

// Component Props Types
export interface ComponentProps {
  className?: string;
  children?: React.ReactNode;
}

// Generic API Response Handler
export interface ApiErrorDetails {
  code?: string;
  field?: string;
  message: string;
}

// Enhanced Error Response
export interface EnhancedApiErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: ApiErrorDetails[] | Record<string, unknown>;
  timestamp?: string;
  path?: string;
}

// Error handling utility types
export interface ValidationError {
  field: string;
  message: string;
  code?: string;
}

export interface NetworkError {
  type: 'network';
  message: string;
  status?: number;
  statusText?: string;
}

export interface ServerError {
  type: 'server';
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export type AppError = ValidationError | NetworkError | ServerError;

// Form Data Types
export interface FormData {
  [key: string]: FormFieldValue<unknown> | FormData;
}

// Navigation and UI Types
export interface NavItem {
  href: string;
  icon: React.ComponentType<{ className?: string }>;
  label: string;
  badge?: string | number;
}

export interface DropdownOption {
  value: string;
  label: string;
  disabled?: boolean;
}

// Modal and Dialog Types
export interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
}

// Table and List Types
export interface TableColumn<T = unknown> {
  key: keyof T | string;
  label: string;
  sortable?: boolean;
  render?: (value: unknown, item: T) => React.ReactNode;
}

export interface PaginationProps {
  currentPage: number;
  totalPages: number;
  onPageChange: (page: number) => void;
  itemsPerPage?: number;
  totalItems?: number;
}

// Search and Filter Types
export interface SearchFilters {
  search?: string;
  status?: string;
  category?: string;
  dateFrom?: string;
  dateTo?: string;
  [key: string]: string | undefined;
}

// File Upload Types
export interface FileUploadProps {
  accept?: string;
  multiple?: boolean;
  maxSize?: number;
  onUpload: (files: File[]) => void;
  onError?: (error: string) => void;
}

export interface UploadedFile {
  id: string;
  name: string;
  size: number;
  type: string;
  url: string;
  uploadedAt: string;
}

// Dashboard and Analytics Types
export interface DashboardCard {
  title: string;
  value: string | number;
  change?: number;
  trend?: 'up' | 'down' | 'neutral';
  icon?: React.ComponentType<{ className?: string }>;
}

export interface ChartDataPoint {
  label: string;
  value: number;
  color?: string;
}

// Notification Types
export interface NotificationItem {
  id: string;
  type: 'info' | 'success' | 'warning' | 'error';
  title: string;
  message: string;
  timestamp: string;
  read: boolean;
  actions?: Array<{
    label: string;
    action: () => void;
  }>;
}

// Strict typing for status values
export type AssignmentStatus = 'unassigned' | 'partially_assigned' | 'fully_assigned';
export type CompletionStatus = 0 | 50 | 100;
export type ReleaseStatus = 'pending' | 'withheld' | 'released';
export type ConflictSeverity = 'low' | 'medium' | 'high' | 'critical';
export type SystemHealthStatus = 'healthy' | 'warning' | 'critical';
export type RecommendationAction = 'approve' | 'reject' | 'request_more_info';

// Survey Data Interface for proper typing
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

// Individual Report Download Response
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

// Enhanced API Response types with better error handling
export interface ApiErrorResponse {
  success: false;
  error: string;
  message: string;
  code?: string;
  details?: Record<string, unknown>;
}

export interface ApiSuccessResponse<T = unknown> {
  success: true;
  data: T;
  message?: string;
  pagination?: PaginationData;
}

export type ApiResponseUnion<T = unknown> = ApiSuccessResponse<T> | ApiErrorResponse;

// Utility type for API method return types
export type ApiMethod<T = unknown> = Promise<ApiResponse<T>>;

// Generic utility types
export type Optional<T, K extends keyof T> = Omit<T, K> & Partial<Pick<T, K>>;
export type RequiredFields<T, K extends keyof T> = T & Required<Pick<T, K>>;
export type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

// Event handler types
export type EventHandler<T = Event> = (event: T) => void;
export type AsyncEventHandler<T = Event> = (event: T) => Promise<void>;

// Form types
export type FormFieldError = string | null;
export type FormFieldValue<T = unknown> = {
  value: T;
  error: FormFieldError;
  touched: boolean;
};

// API status types
export type LoadingState = 'idle' | 'loading' | 'success' | 'error';
export type RequestStatus = 'pending' | 'fulfilled' | 'rejected';

// Date and time types
export type DateString = string; // ISO date string
export type TimestampString = string; // ISO timestamp string

// ID types for better type safety
export type UserId = string;
export type PolicyId = string;
export type AssignmentId = string;
export type SurveyorId = string;
export type ReportId = string;
export type DocumentId = string;

// Processing Monitor Types (matching processingMonitor service)
export interface ProcessingOverview {
  timeframe: string;
  organization: string;
  overview: {
    totalDualAssignments: number;
    totalMergedReports: number;
    totalConflictFlags: number;
    totalUserInquiries: number;
    averageProcessingTime?: number;
  };
  assignmentStatus?: {
    unassigned: number;
    partially_assigned: number;
    fully_assigned: number;
  };
  completionStatus?: {
    0: number;
    50: number;
    100: number;
  };
  releaseStatus?: {
    pending: number;
    withheld: number;
    released: number;
  };
  activeConflictsBySeverity: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  generatedAt?: string;
}

export interface ActiveProcessing {
  activeAssignments: Array<{
    _id: string;
    policyId: string;
    assignmentStatus: string;
    completionStatus: number;
    ammcSurveyorContact?: {
      name: string;
      email: string;
      phone: string;
    };
    niaSurveyorContact?: {
      name: string;
      email: string;
      phone: string;
    };
  }>;
  pendingReports: Array<{
    _id: string;
    policyId: string;
    releaseStatus: string;
    createdAt: string;
  }>;
  recentSubmissions?: Array<{
    _id: string;
    policyId: string;
    organization: string;
    createdAt: string;
  }>;
  lastUpdated?: string;
}

export interface PerformanceMetrics {
  timeframe?: string;
  processingPerformance: {
    avgProcessingTime: number;
    minProcessingTime?: number;
    maxProcessingTime?: number;
    totalReports: number;
  };
  successRates: {
    pending?: number;
    withheld?: number;
    released: number;
  } | number;
  conflictDetectionRates?: {
    low: number;
    medium: number;
    high: number;
    critical: number;
  };
  assignmentCompletion?: {
    avgCompletionTime: number;
    minCompletionTime: number;
    maxCompletionTime: number;
  };
  dailyVolume?: Array<{
    _id: string;
    count: number;
  }>;
  generatedAt?: string;
}

export interface SystemHealth {
  systemStatus: 'healthy' | 'warning' | 'critical';
  alerts?: string[];
  metrics?: {
    recentActivity: number;
    stuckProcessing: number;
  };
  lastChecked?: string;
}

export interface RecentActivity {
  activities: Array<{
    type: string;
    details: string;
    propertyAddress: string;
    timestamp: string;
  }>;
  lastUpdated?: string;
}

// Type guards for API responses
export const isApiSuccessResponse = <T>(response: ApiResponseUnion<T>): response is ApiSuccessResponse<T> => {
  return response.success === true;
};

export const isApiErrorResponse = <T>(response: ApiResponseUnion<T>): response is ApiErrorResponse => {
  return response.success === false;
};

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
  policyId: string;
  ammcSurveyorId?: string;
  niaSurveyorId?: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  deadline: string;
  instructions?: string;
  completionStatus: 0 | 50 | 100;
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

// Export SurveySubmissionData from component.types
export type { SurveySubmissionData } from './component.types';