// User related types
export interface User {
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
    role: string;
  };
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

export const enum UserRoles {
  SUPER_ADMIN = "67097fb3f07f5547278be69b",
  ADMIN = "67097fb3f07f5547278be69c",
  STAFF = "67097fb3f07f5547278be69d",
  SURVEYOR = "67097fb3f07f5547278be69e"
}

export interface Role {
  _id: string;
  name: string;
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
export interface LoginResponse {
  success: boolean;
  employee: User;
  token: string;
}

export interface AvailableRolesResponse {
  role: string;
  roles: Role[];
}

export interface GetAllEmployeesResponse {
  success: boolean;
  allStaff: {
    count: number;
    sanitizedEmployees: User[];
  };
}

// Policy Request types
export interface PolicyRequest {
  _id: string;
  userId: string;
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
  status: 'submitted' | 'assigned' | 'surveyed' | 'approved' | 'rejected' | 'completed';
  assignedSurveyors?: string[];
  surveyDocument?: string | {
    name: string;
    url: string;
    publicId: string;
  };
  surveyNotes?: string;
  adminNotes?: string;
  createdAt: string;
  updatedAt: string;
}

export interface CreatePolicyRequestData {
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
export interface Surveyor extends User {
  specializations: string[];
  licenseNumber: string;
  totalSurveys: number;
  completedSurveys: number;
  rating: number;
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
