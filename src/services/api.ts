import axios from "axios";
import {
  EmployeeRegistrationData,
  EmployeeLoginResponse,
  UserLoginResponse,
  AvailableRolesResponse,
  GetAllEmployeesResponse,
  Surveyor,
  Assignment,
  EnhancedSurveySubmission,
  SurveyorFilters,
  DualAssignmentFilters,
  ContactLogEntry,
  PolicyRequest,
  ApiResponse,
  UserReportsResponse,
  ReportSummaryResponse,
  ReportDetailsResponse,
  DownloadReportResponse,
  IndividualReportDownloadResponse
} from "../types/api.types";


// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_BASE_URL || "https://fct-dcip-backend.vercel.app/api/v1";

const API_KEY = process.env.NEXT_PUBLIC_API_KEY || "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

import { getAuthToken } from "@/utils/auth";



// API Instance Configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    "apikey": API_KEY, // Note: lowercase 'apikey' as expected by validation middleware
  },
});

api.interceptors.request.use(
  (config) => {
    // Ensure API key is always present (lowercase to match validation middleware)
    config.headers['apikey'] = API_KEY;

    // Determine the appropriate token type based on the request URL
    let tokenType: 'user' | 'admin' | 'super-admin' | 'nia-admin' | 'broker-admin' | 'surveyor' | undefined;

    if (config.url?.includes('/broker-admin')) {
      tokenType = 'broker-admin';
    } else if (config.url?.includes('/nia-admin') || config.url?.includes('/processing-monitor')) {
      tokenType = 'nia-admin';
    } else if (config.url?.includes('/surveyor') || config.url?.includes('/dual-assignment')) {
      tokenType = 'surveyor';
    } else if (config.url?.includes('/admin') && !config.url?.includes('/nia-admin') && !config.url?.includes('/broker-admin')) {
      // AMMC admin endpoints (exclude nia-admin and broker-admin)
      tokenType = 'admin';
    } else if (config.url?.includes('/super-admin')) {
      tokenType = 'super-admin';
    } else if (config.url?.includes('/user') ||
      config.url?.includes('/policy') ||
      config.url?.includes('/payment') ||
      config.url?.includes('/report-release') ||
      config.url?.includes('/auth/login') ||
      config.url?.includes('/auth/register')) {
      // User-specific endpoints
      tokenType = 'user';
    }
    // If no specific type detected, getAuthToken will use fallback priority

    const token = getAuthToken(tokenType);
    console.log("Auth Token:", token ? `Present (${token.substring(0, 20)}...)` : 'Missing');
    console.log("Token Type:", tokenType || 'auto-detect');

    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }

    console.log("Request Headers:", {
      'Content-Type': config.headers['Content-Type'],
      'apikey': config.headers['apikey'] ? `${config.headers['apikey'].substring(0, 20)}...` : 'Missing',
      'Authorization': config.headers['Authorization'] || 'Missing'
    });

    // Debug: Log full API key for troubleshooting
    console.log("Full API Key:", config.headers['apikey']);

    return config;
  },
  (error) => {
    console.error("Request interceptor error:", error);
    return Promise.reject(error);
  }
);

// Add response interceptor for better error handling
api.interceptors.response.use(
  (response) => {
    return response;
  },
  (error) => {
    console.error("API Response Error:", {
      status: error.response?.status,
      statusText: error.response?.statusText,
      data: error.response?.data,
      url: error.config?.url,
      method: error.config?.method
    });

    // Handle specific error cases
    if (error.response?.status === 401) {
      console.error("Unauthorized access - check API key and authentication token");
    }

    return Promise.reject(error);
  }
);

// Property Types
export interface Category {
  _id: string;
  name: string;
}

export interface AddPropertyPayload {
  categoryId: string;
  address: string;
  phonenumber: string;
  images: string[];
}

// Authentication APIs
export const loginUser = async (email: string, password: string) => {
  try {
    const response = await api.post<UserLoginResponse>("/auth/login", { email, password });
    return response;
  } catch (error) {
    console.error("User Login API Error:", error);
    throw error;
  }
};

export const loginEmployee = async (email: string, password: string) => {
  try {
    const response = await api.post<EmployeeLoginResponse>("/auth/loginEmployee", { email, password });
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

export const getUserRole = () =>
  api.get("/auth/user-role");

// Property Management APIs
export const getCategories = async (): Promise<Category[]> => {
  try {
    const response = await api.get("/auth/available-categories");
    console.log(response)
    return response.data.categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const addProperty = async (
  payload: AddPropertyPayload
): Promise<Record<string, unknown>> => {
  try {
    const response = await api.post("/auth/user/add-property", payload);
    return response.data;
  } catch (error) {
    console.error("Failed to add property:", error);
    throw error;
  }
};

// Password Reset APIs
export const initiatePasswordReset = (email: string) =>
  api.post("/auth/reset-password-otp", { email });

export const resetPasswordOTP = (email: string) =>
  api.post("/auth/reset-password-otp", { email });

export const verifyOTP = (email: string, otp: string) =>
  api.post("/auth/verify-otp-employee", { email, otp });

export const resetPassword = (newpassword: string) =>
  api.patch("/auth/employee-reset-password", { newpassword });

export const verifyOTPAndResetPassword = (email: string, otp: string, newpassword: string) =>
  api.patch("/auth/employee-reset-password", { email, otp, newpassword });

export const resendOTP = (email: string) =>
  api.post("/auth/resend-otp", { email });

// Employee Management APIs
export const registerEmployee = async (employeeData: EmployeeRegistrationData) => {
  try {
    const response = await api.post("/auth/registerEmployee", employeeData);
    return response.data;
  } catch (error) {
    console.error("Failed to register employee", error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    const response = await api.get<GetAllEmployeesResponse>("/auth/get-all-employees");
    return response.data.allStaff.sanitizedEmployees;
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

export const getAvailableRoles = async () => {
  try {
    const response = await api.get<AvailableRolesResponse>("/auth/available-roles");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available roles", error);
    throw error;
  }
};

// Policy Request APIs
export const submitPolicyRequest = async (policyData: import("../types/api.types").CreatePolicyRequestData) => {
  try {
    const response = await api.post("/policy", policyData);
    return response.data;
  } catch (error) {
    console.error("Failed to submit policy request", error);
    throw error;
  }
};

export const getPolicyRequests = async (status?: string, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `/policy?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch policy requests", error);
    throw error;
  }
};

export const getUserPolicyRequests = async (status?: string, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `/policy/user?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user policy requests", error);
    throw error;
  }
};

export const getUserProperties = async () => {
  try {
    const response = await api.get("/property/user");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user properties", error);
    throw error;
  }
};

export const getAvailableSurveyors = async (specialization?: string, location?: string) => {
  try {
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (location) params.append('location', location);

    const url = `/policy/surveyors/available?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to get available surveyors", error);
    throw error;
  }
};

export const reviewSubmission = async (submissionId: string, decision: 'approved' | 'rejected', reviewNotes: string, qualityCheck?: Record<string, unknown>) => {
  try {
    const response = await api.post(`/policy/submissions/${submissionId}/review`, {
      decision,
      reviewNotes,
      qualityCheck
    });
    return response.data;
  } catch (error) {
    console.error("Failed to review submission", error);
    throw error;
  }
};

// Surveyor APIs
export const loginSurveyor = async (email: string, password: string) => {
  try {
    const response = await api.post("/auth/loginSurveyor", { email, password });
    return response.data;
  } catch (error) {
    console.error("Surveyor login failed", error);
    throw error;
  }
};

export const getSurveyorDashboard = async () => {
  try {
    const response = await api.get("/surveyor/dashboard");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor dashboard", error);
    throw error;
  }
};

export const getSurveyorDualAssignments = async (filters?: {
  status?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== 'all') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/surveyor/dual-assignments${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor dual assignments", error);
    throw error;
  }
};

export const getSurveyorAssignments = async (status?: string, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `/surveyor/assignments?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor assignments", error);
    throw error;
  }
};

export const updateAssignmentStatus = async (assignmentId: string, status: string, notes?: string) => {
  try {
    const response = await api.patch(`/surveyor/assignments/${assignmentId}/status`, {
      status,
      notes
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update assignment status", error);
    throw error;
  }
};

export const submitSurvey = async (submission: FormData) => {
  try {
    const response = await api.post("/surveyor/surveys", submission, {
      headers: {
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit survey", error);
    throw error;
  }
};

export const getSurveyorSubmissions = async (status?: string, page = 1, limit = 10) => {
  try {
    const params = new URLSearchParams();
    let statusParam = status;
    if (status === 'pending') {
      statusParam = 'submitted,under_review';
    }
    if (statusParam && statusParam !== 'all') params.append('status', statusParam);
    params.append('page', page.toString());
    params.append('limit', limit.toString());

    const url = `/submission?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor submissions", error);
    throw error;
  }
};

export const getSurveyorProfile = async () => {
  try {
    const response = await api.get("/surveyor/profile");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor profile", error);
    throw error;
  }
};

export const updateSurveyorProfile = async (profileData: Partial<Surveyor>) => {
  try {
    const response = await api.patch("/surveyor/profile", profileData);
    return response.data;
  } catch (error) {
    console.error("Failed to update surveyor profile", error);
    throw error;
  }
};

export const getSurveyorAssignmentById = async (assignmentId: string) => {
  try {
    const response = await api.get(`/surveyor/assignments/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch assignment:", error);
    throw error;
  }
};

export const getDualAssignmentDetails = async (dualAssignmentId: string) => {
  try {
    const response = await api.get(`/dual-assignment/${dualAssignmentId}/details`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch dual assignment details:", error);
    throw error;
  }
};

// Admin Dashboard APIs
export const getAdminDashboardData = async (period = '30d') => {
  try {
    const response = await api.get(`/admin/dashboard?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    throw error;
  }
};

export const getQuickStats = async () => {
  try {
    const response = await api.get("/admin/dashboard/stats");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch quick stats:", error);
    throw error;
  }
};

export const getAdminAlerts = async () => {
  try {
    const response = await api.get("/admin/dashboard/alerts");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin alerts:", error);
    throw error;
  }
};

// Admin Surveyor Management APIs
export const getAdminSurveyors = async (filters?: {
  search?: string;
  status?: string;
  specialization?: string;
  organization?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/admin/surveyor${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyors:", error);
    throw error;
  }
};

export const createSurveyorByAdmin = async (surveyorData: {
  firstname: string;
  lastname: string;
  email: string;
  phonenumber: string;
  specializations: string[];
  licenseNumber: string;
  address?: string;
  emergencyContact?: string;
  notes?: string;
}) => {
  try {
    const response = await api.post("/admin/surveyor", surveyorData);
    return response.data;
  } catch (error) {
    console.error("Failed to create surveyor:", error);
    throw error;
  }
};

export const updateSurveyorByAdmin = async (surveyorId: string, surveyorData: Partial<Surveyor>) => {
  try {
    const response = await api.patch(`/admin/surveyor/${surveyorId}`, surveyorData);
    return response.data;
  } catch (error) {
    console.error("Failed to update surveyor:", error);
    throw error;
  }
};

export const deleteSurveyorByAdmin = async (surveyorId: string) => {
  try {
    const response = await api.delete(`/admin/surveyor/${surveyorId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete surveyor:", error);
    throw error;
  }
};

// Admin Assignment Management APIs
export const getAdminAssignments = async (filters?: {
  status?: string;
  priority?: string;
  surveyorId?: string;
  ammcId?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/admin/assignment${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin assignments:", error);
    throw error;
  }
};

export const getAssignmentAnalytics = async (period = '30d') => {
  try {
    const response = await api.get(`/admin/assignment/analytics?period=${period}`);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch assignment analytics:", error);
    throw error;
  }
};

export const updateAssignmentByAdmin = async (assignmentId: string, updates: Partial<Assignment>) => {
  try {
    const response = await api.patch(`/admin/assignment/${assignmentId}`, updates);
    return response.data;
  } catch (error) {
    console.error("Failed to update assignment:", error);
    throw error;
  }
};

export const reassignAssignment = async (assignmentId: string, data: {
  newSurveyorId: string;
  reason?: string;
  deadline?: string;
  priority?: string;
}) => {
  try {
    const response = await api.patch(`/admin/assignment/${assignmentId}/reassign`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to reassign assignment:", error);
    throw error;
  }
};

export const cancelAssignment = async (assignmentId: string, reason: string) => {
  try {
    const response = await api.patch(`/admin/assignment/${assignmentId}/cancel`, { reason });
    return response.data;
  } catch (error) {
    console.error("Failed to cancel assignment:", error);
    throw error;
  }
};

// Surveyor Assignment Workflow APIs
export const getSurveyorAssignmentsNew = async (filters?: {
  status?: string;
  priority?: string;
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: string;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/surveyor/assignments?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor assignments:", error);
    throw error;
  }
};

export const acceptAssignment = async (assignmentId: string, notes?: string) => {
  try {
    const response = await api.patch(`/assignment/${assignmentId}/accept`, { notes });
    return response.data;
  } catch (error) {
    console.error("Failed to accept assignment:", error);
    throw error;
  }
};

export const startAssignment = async (assignmentId: string, data?: {
  location?: { latitude: number; longitude: number };
  notes?: string;
}) => {
  try {
    const response = await api.patch(`/assignment/${assignmentId}/start`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to start assignment:", error);
    throw error;
  }
};

export const updateAssignmentProgress = async (assignmentId: string, data: {
  milestone?: string;
  notes?: string;
  location?: { latitude: number; longitude: number };
  photos?: string[];
}) => {
  try {
    const response = await api.patch(`/assignment/${assignmentId}/progress`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to update assignment progress:", error);
    throw error;
  }
};

export const completeAssignment = async (assignmentId: string, data?: {
  notes?: string;
  finalLocation?: { latitude: number; longitude: number };
}) => {
  try {
    const response = await api.patch(`/assignment/${assignmentId}/complete`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to complete assignment:", error);
    throw error;
  }
};

export const addAssignmentMessage = async (assignmentId: string, data: {
  message: string;
  type?: 'message' | 'status_update' | 'question' | 'clarification';
}) => {
  try {
    const response = await api.post(`/assignment/${assignmentId}/messages`, data);
    return response.data;
  } catch (error) {
    console.error("Failed to add assignment message:", error);
    throw error;
  }
};

export const getAssignmentMessages = async (assignmentId: string) => {
  try {
    const response = await api.get(`/assignment/${assignmentId}/messages`);
    return response.data;
  } catch (error) {
    console.error("Failed to get assignment messages:", error);
    throw error;
  }
};

// Survey Submission APIs
export const createSurveySubmission = async (submissionData: {
  assignmentId: string;
  surveyDetails: {
    propertyCondition: string;
    structuralAssessment: string;
    riskFactors: string;
    recommendations: string;
    estimatedValue?: number;
  };
  surveyNotes: string;
  contactLog: ContactLogEntry[];
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
}) => {
  try {
    const response = await api.post("/submission", submissionData);
    return response.data;
  } catch (error) {
    console.error("Failed to create survey submission:", error);
    throw error;
  }
};

export const getSurveySubmissions = async (filters?: {
  status?: string;
  assignmentId?: string;
  page?: number;
  limit?: number;
}) => {
  try {
    const params = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== '') {
          params.append(key, value.toString());
        }
      });
    }

    const url = `/submission?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to fetch survey submissions:", error);
    throw error;
  }
};

export const updateSurveySubmission = async (submissionId: string, updates: Partial<EnhancedSurveySubmission>) => {
  try {
    const response = await api.patch(`/submission/${submissionId}`, updates);
    return response.data;
  } catch (error) {
    console.error("Failed to update survey submission:", error);
    throw error;
  }
};

export const submitSurveyFinal = async (submissionId: string, finalNotes?: string) => {
  try {
    const response = await api.patch(`/submission/${submissionId}/submit`, { finalNotes });
    return response.data;
  } catch (error) {
    console.error("Failed to submit survey:", error);
    throw error;
  }
};

export const addContactLogEntry = async (submissionId: string, contactData: {
  date?: string;
  method: 'phone' | 'email' | 'sms' | 'visit';
  notes: string;
  successful?: boolean;
  duration?: number;
}) => {
  try {
    const response = await api.post(`/submission/${submissionId}/contact`, contactData);
    return response.data;
  } catch (error) {
    console.error("Failed to add contact log entry:", error);
    throw error;
  }
};

export const getSubmissionByAssignment = async (assignmentId: string) => {
  try {
    const response = await api.get(`/submission/assignment/${assignmentId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get submission by assignment:", error);
    throw error;
  }
};

// File Upload APIs
export const uploadSurveyDocument = async (file: File, data: {
  assignmentId?: string;
  ammcId?: string;
  category?: string;
  description?: string;
  documentType?: string;
}) => {
  try {
    const formData = new FormData();
    formData.append('document', file);
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const response = await api.post("/survey-documents/upload/single", formData, {
      headers: {
        apikey: API_KEY,
        // Don't set Content-Type for FormData
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload survey document:", error);
    throw error;
  }
};

export const uploadMultipleSurveyDocuments = async (files: File[], data: {
  assignmentId?: string;
  ammcId?: string;
  category?: string;
  description?: string;
  documentType?: string;
}) => {
  try {
    const formData = new FormData();
    files.forEach(file => {
      formData.append('documents', file);
    });
    Object.entries(data).forEach(([key, value]) => {
      if (value) formData.append(key, value);
    });

    const response = await api.post("/survey-documents/upload/multiple", formData, {
      headers: {
        apikey: API_KEY,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to upload multiple documents:", error);
    throw error;
  }
};

export const getSurveyDocuments = async (filters: {
  assignmentId?: string;
  ammcId?: string;
  category?: string;
  documentType?: string;
}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });

    const url = `/survey-documents?${params.toString()}`;
    const response = await api.get(url);
    return response.data;
  } catch (error) {
    console.error("Failed to get survey documents:", error);
    throw error;
  }
};

export const deleteSurveyDocument = async (documentId: string, assignmentId?: string, ammcId?: string) => {
  try {
    const endpoint = assignmentId
      ? `/survey-documents/assignment/${assignmentId}/document/${documentId}`
      : `/survey-documents/policy/${ammcId}/document/${documentId}`;

    const response = await api.delete(endpoint);
    return response.data;
  } catch (error) {
    console.error("Failed to delete survey document:", error);
    throw error;
  }
};

export const getDocumentDownloadUrl = async (publicId: string) => {
  try {
    const response = await api.get(`/survey-documents/download/${publicId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get document download URL:", error);
    throw error;
  }
};

export const getAdminProperties = async () => {
  try {
    const response = await api.get("/admin/property");
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin properties:", error);
    throw error;
  }
};

// Delete APIs
export const deleteProperty = async (propertyId: string) => {
  try {
    const response = await api.delete(`/property/${propertyId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete property:", error);
    throw error;
  }
};

export const updatePolicyRequest = async (ammcId: string, policyData: Partial<PolicyRequest>) => {
  try {
    const response = await api.patch(`/policy/${ammcId}`, policyData);
    return response.data;
  } catch (error) {
    console.error("Failed to update policy request:", error);
    throw error;
  }
};

export const getUserAssignmentByAmmcId = async (ammcId: string) => {
  try {
    const response = await api.get(`/admin/assignment/policy/${ammcId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to get assignment by AMMC ID:", error);
    throw error;
  }
};

export const deletePolicyRequest = async (ammcId: string) => {
  try {
    const response = await api.delete(`/policy/${ammcId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete policy request:", error);
    throw error;
  }
};

export const deleteEmployee = async (employeeId: string) => {
  try {
    const response = await api.delete(`/admin/employees/${employeeId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete employee:", error);
    throw error;
  }
};

export const deleteAdministrator = async (adminId: string) => {
  try {
    const response = await api.delete(`/admin/administrators/${adminId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete administrator:", error);
    throw error;
  }
};

export const deleteSurveyor = async (surveyorId: string) => {
  try {
    const response = await api.delete(`/admin/surveyor/${surveyorId}`);
    return response.data;
  } catch (error) {
    console.error("Failed to delete surveyor:", error);
    throw error;
  }
};

// Admin API Service
export const adminApi = {
  getDashboardStats: async () => {
    const response = await api.get('/admin/dashboard/stats');
    return response.data;
  },

  getRecentActivity: async () => {
    const response = await api.get('/admin/dashboard/activity');
    return response.data;
  },

  getPolicies: async (filters?: {
    status?: string;
    page?: number;
    limit?: number;
    search?: string;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/policy${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  getPolicyById: async (ammcId: string) => {
    const response = await api.get(`/admin/policy/${ammcId}`);
    return response.data;
  },

  assignSurveyor: async (ammcId: string, assignment: { surveyorIds: string[] }) => {
    const response = await api.post(`/policy/${ammcId}/assign`, assignment);
    return response.data;
  },

  reviewPolicySubmission: async (ammcId: string, decision: 'approved' | 'rejected', notes: string) => {
    const response = await api.post(`/policy/${ammcId}/review`, { decision, notes });
    return response.data;
  },

  sendPolicyToUser: async (ammcId: string) => {
    const response = await api.post(`/admin/policy/${ammcId}/send-to-user`);
    return response.data;
  },

  getAdministrators: async () => {
    const response = await api.get('/admin/administrators');
    return response.data;
  },

  getEmployees: async () => {
    const response = await api.get('/admin/employees');
    return response.data;
  },



  updateEmployeeStatus: async (employeeId: string, status: string) => {
    const response = await api.patch(`/admin/employees/${employeeId}/status`, { status });
    return response.data;
  },

  deleteEmployee: async (employeeId: string) => {
    const response = await api.delete(`/admin/employees/${employeeId}`);
    return response.data;
  },

  createAdministrator: async (adminData: EmployeeRegistrationData) => {
    const response = await api.post('/admin/administrators', adminData);
    return response.data;
  },

  deleteAdministrator: async (adminId: string) => {
    const response = await api.delete(`/admin/administrators/${adminId}`);
    return response.data;
  },

  updateAdministratorStatus: async (adminId: string, status: string) => {
    const response = await api.patch(`/admin/administrators/${adminId}/status`, { status });
    return response.data;
  },

  getSurveyors: async (filters?: SurveyorFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/surveyor${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  createSurveyor: async (surveyorData: Partial<Surveyor>) => {
    const response = await api.post('/admin/surveyor', surveyorData);
    return response.data;
  },

  updateSurveyor: async (surveyorId: string, surveyorData: Partial<Surveyor>) => {
    const response = await api.patch(`/admin/surveyor/${surveyorId}`, surveyorData);
    return response.data;
  },

  deleteSurveyor: async (surveyorId: string) => {
    const response = await api.delete(`/admin/surveyor/${surveyorId}`);
    return response.data;
  },

  getSurveyorById: async (surveyorId: string) => {
    const response = await api.get(`/admin/surveyor/${surveyorId}`);
    return response.data;
  },

  getSurveyorPerformance: async (surveyorId: string) => {
    const response = await api.get(`/admin/surveyor/${surveyorId}/performance`);
    return response.data;
  },

  getAssignments: async (filters?: {
    status?: string;
    priority?: string;
    surveyorId?: string;
    overdue?: boolean;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/admin/assignment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  createAssignment: async (assignmentData: Partial<Assignment>) => {
    const response = await api.post('/admin/assignment', assignmentData);
    return response.data;
  },

  updateAssignment: async (assignmentId: string, assignmentData: Partial<Assignment>) => {
    const response = await api.put(`/admin/assignment/${assignmentId}`, assignmentData);
    return response.data;
  },

  reassignSurveyor: async (assignmentId: string, newSurveyorId: string, reason?: string, deadline?: string, priority?: string) => {
    const response = await api.patch(`/admin/assignment/${assignmentId}/reassign`, { newSurveyorId, reason, deadline, priority });
    return response.data;
  },

  getAssignmentById: async (assignmentId: string) => {
    const response = await api.get(`/admin/assignment/${assignmentId}`);
    return response.data;
  },

  getAssignmentByAmmcId: async (ammcId: string) => {
    const response = await api.get(`/admin/assignment/policy/${ammcId}`);
    return response.data;
  },

  getSurveySubmissions: async (filters?: {
    status?: string;
    surveyorId?: string;
    ammcId?: string;
    page?: number;
    limit?: number;
  }) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined) {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/submission${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  approveSurveySubmission: async (submissionId: string, notes?: string) => {
    const response = await api.post(`/submission/${submissionId}/approve`, { notes });
    return response.data;
  },

  rejectSurveySubmission: async (submissionId: string, reason: string) => {
    const response = await api.post(`/submission/${submissionId}/reject`, { reason });
    return response.data;
  },

  getSurveyDocumentDownloadUrl: async (publicId: string) => {
    const response = await api.get(`/survey-documents/download/${publicId}`);
    return response.data;
  },

  uploadFile: async (file: File, type: string, relatedId: string) => {
    const formData = new FormData();
    formData.append('file', file);
    formData.append('type', type);
    formData.append('relatedId', relatedId);

    const response = await api.post('/files/upload', formData, {
      headers: {
        // Let browser set Content-Type for FormData
      },
    });
    return response.data;
  },

  downloadFile: async (fileId: string) => {
    const response = await api.get(`/files/download/${fileId}`, { responseType: 'blob' });
    return response;
  },

  getAnalytics: async (period: 'week' | 'month' | 'quarter' | 'year') => {
    const response = await api.get(`/admin/analytics?period=${period}`);
    return response.data;
  },

  generateReport: async (reportType: string, filters?: Record<string, unknown>) => {
    const response = await api.post('/admin/reports', { type: reportType, filters });
    return response.data;
  },

  getNotifications: async (unreadOnly?: boolean) => {
    const endpoint = `/notifications${unreadOnly ? '?unread=true' : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  markNotificationAsRead: async (notificationId: string) => {
    const response = await api.post(`/notifications/${notificationId}/read`);
    return response.data;
  },

  searchAll: async (query: string) => {
    const response = await api.get(`/search?q=${encodeURIComponent(query)}`);
    return response.data;
  },

  getSystemHealth: async () => {
    const response = await api.get('/system/health');
    return response.data;
  },

  getAdminProperties: async () => {
    const response = await api.get("/admin/property");
    return response.data;
  },


};

export const withErrorHandling = <T extends (...args: unknown[]) => Promise<unknown>>(
  fn: T,
  onError?: (error: Error) => void
): T => {
  return (async (...args: Parameters<T>) => {
    try {
      return await fn(...args);
    } catch (error) {
      const err = error instanceof Error ? error : new Error('Unknown error occurred');
      console.error('API Error:', err);

      if (onError) {
        onError(err);
      }

      throw err;
    }
  }) as T;
};

// Additional API utility functions for new services
// ApiResponse interface is now imported from api.types.ts

/**
 * Make an authenticated API request using the existing axios instance
 */
export const apiRequest = async <T = unknown>(
  endpoint: string,
  options: RequestInit = {}
): Promise<ApiResponse<T>> => {
  try {
    const method = (options.method || 'GET').toLowerCase();
    const data = options.body ? JSON.parse(options.body as string) : undefined;

    let response;

    switch (method) {
      case 'get':
        response = await api.get(endpoint);
        break;
      case 'post':
        response = await api.post(endpoint, data);
        break;
      case 'put':
        response = await api.put(endpoint, data);
        break;
      case 'patch':
        response = await api.patch(endpoint, data);
        break;
      case 'delete':
        response = await api.delete(endpoint);
        break;
      default:
        throw new Error(`Unsupported HTTP method: ${method}`);
    }

    return {
      success: true,
      data: response.data as T,
      message: response.data?.message
    };

  } catch (error: unknown) {
    console.error('API Request Error:', error);

    interface ErrorResponse {
      response?: {
        data?: {
          message?: string;
          error?: string;
        };
        status?: number;
        statusText?: string;
      };
      message?: string;
      code?: string;
    }

    const errorObj = error as ErrorResponse;
    const errorMessage = errorObj?.response?.data?.message ||
      errorObj?.response?.data?.error ||
      errorObj?.message ||
      'An unexpected error occurred';

    return {
      success: false,
      error: errorMessage,
      message: errorMessage
    };
  }
};

// Dual Assignment API functions
export const dualAssignmentAPI = {
  // Get all dual assignments with filters
  getDualAssignments: async (filters?: DualAssignmentFilters) => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/dual-assignment${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  // Get dual assignment by ID
  getDualAssignmentById: async (dualAssignmentId: string) => {
    const response = await api.get(`/dual-assignment/${dualAssignmentId}`);
    return response.data;
  },

  // Get dual assignment by policy ID
  getDualAssignmentByPolicy: async (policyId: string) => {
    const response = await api.get(`/dual-assignment/policy/${policyId}`);
    return response.data;
  },

  // Assign AMMC surveyor
  assignAMMCSurveyor: async (dualAssignmentId: string, surveyorData: {
    surveyorId: string;
    deadline?: string;
    instructions?: string;
    priority?: string;
  }) => {
    const response = await api.post(`/dual-assignment/${dualAssignmentId}/assign-ammc`, surveyorData);
    return response.data;
  },

  // Assign NIA surveyor
  assignNIASurveyor: async (dualAssignmentId: string, surveyorData: {
    surveyorId: string;
    deadline?: string;
    instructions?: string;
    priority?: string;
  }) => {
    const response = await api.post(`/dual-assignment/${dualAssignmentId}/assign-nia`, surveyorData);
    return response.data;
  },

  // Get dual assignment statistics
  getDualAssignmentStats: async () => {
    const response = await api.get('/dual-assignment/stats');
    return response.data;
  },

  // Create dual assignment for existing policy
  createDualAssignmentForPolicy: async (policyId: string, data: {
    priority?: string;
    deadline?: string;
  }) => {
    const response = await api.post(`/dual-assignment/policy/${policyId}/create`, data);
    return response.data;
  },

  // Test authentication
  testAuth: async () => {
    const response = await api.get('/dual-assignment/auth-test');
    return response.data;
  }
};

// Token management utility
export const tokenManager = {
  // Get the appropriate token based on user type
  getToken: (userType?: 'ammc' | 'nia' | 'user'): string | null => {
    if (typeof window === 'undefined') return null;

    if (userType === 'nia') {
      return localStorage.getItem('niaAdminToken');
    } else if (userType === 'ammc') {
      return localStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken');
    } else {
      // Try all possible token sources
      return localStorage.getItem('niaAdminToken') ||
        localStorage.getItem('adminToken') ||
        localStorage.getItem('token') ||
        localStorage.getItem('authToken');
    }
  },

  // Check if user has valid token
  hasValidToken: (userType?: 'ammc' | 'nia' | 'user'): boolean => {
    const token = tokenManager.getToken(userType);
    return !!token;
  },

  // Clear all tokens
  clearAllTokens: (): void => {
    if (typeof window === 'undefined') return;

    localStorage.removeItem('niaAdminToken');
    localStorage.removeItem('adminToken');
    localStorage.removeItem('token');
    localStorage.removeItem('authToken');
  }
};

// User Report API functions
export const userReportAPI = {
  // Get user's reports
  getUserReports: async (page = 1, limit = 10): Promise<UserReportsResponse> => {
    const response = await api.get(`/report-release/user/reports?page=${page}&limit=${limit}`);
    return response.data;
  },

  // Get report summary/statistics
  getReportSummary: async (): Promise<ReportSummaryResponse> => {
    const response = await api.get('/report-release/user/reports/summary');
    return response.data;
  },

  // Get specific report details
  getReportDetails: async (reportId: string): Promise<ReportDetailsResponse> => {
    const response = await api.get(`/report-release/report/${reportId}`);
    return response.data;
  },

  // Download merged report
  downloadReport: async (reportId: string): Promise<DownloadReportResponse> => {
    const response = await api.post(`/report-release/download/${reportId}`);
    return response.data;
  },

  // Download individual AMMC report
  downloadAMMCReport: async (assignmentId: string): Promise<ApiResponse<IndividualReportDownloadResponse>> => {
    const response = await api.post(`/report-release/download/ammc/${assignmentId}`);
    return response.data;
  },

  // Download individual NIA report
  downloadNIAReport: async (assignmentId: string): Promise<ApiResponse<IndividualReportDownloadResponse>> => {
    const response = await api.post(`/report-release/download/nia/${assignmentId}`);
    return response.data;
  },

  // Get report processing status
  getReportStatus: async (policyId: string) => {
    const response = await api.get(`/report-release/status/${policyId}`);
    return response.data;
  }
};

export default api;
//
 Broker Admin API functions
export const brokerAdminAPI = {
  // Login broker admin
  login: async (email: string, password: string): Promise<import("../types/api.types").BrokerAdminLoginResponse> => {
    const response = await api.post('/broker-admin/auth/login', { email, password });
    return response.data;
  },

  // Verify broker admin token
  verify: async (): Promise<import("../types/api.types").BrokerAdminVerifyResponse> => {
    const response = await api.get('/broker-admin/auth/verify');
    return response.data;
  },

  // Logout broker admin
  logout: async (): Promise<ApiResponse> => {
    const response = await api.post('/broker-admin/auth/logout');
    return response.data;
  },

  // Get broker dashboard data
  getDashboardData: async (): Promise<ApiResponse<import("../types/api.types").BrokerDashboardData>> => {
    const response = await api.get('/broker-admin/dashboard');
    return response.data;
  },

  // Get all claims with filters
  getClaims: async (filters?: import("../types/api.types").BrokerClaimFilters): Promise<import("../types/api.types").BrokerClaimsResponse> => {
    const queryParams = new URLSearchParams();
    if (filters) {
      Object.entries(filters).forEach(([key, value]) => {
        if (value !== undefined && value !== 'all') {
          queryParams.append(key, value.toString());
        }
      });
    }
    const endpoint = `/broker-admin/claims${queryParams.toString() ? `?${queryParams.toString()}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  },

  // Get claim by ID
  getClaimById: async (claimId: string): Promise<import("../types/api.types").BrokerClaimDetailResponse> => {
    const response = await api.get(`/broker-admin/claims/${claimId}`);
    return response.data;
  },

  // Update claim status
  updateClaimStatus: async (
    claimId: string,
    statusUpdate: import("../types/api.types").BrokerStatusUpdateRequest
  ): Promise<import("../types/api.types").BrokerStatusUpdateResponse> => {
    const response = await api.patch(`/broker-admin/claims/${claimId}/status`, statusUpdate);
    return response.data;
  },

  // Get claim analytics
  getAnalytics: async (period?: string): Promise<ApiResponse> => {
    const endpoint = `/broker-admin/analytics${period ? `?period=${period}` : ''}`;
    const response = await api.get(endpoint);
    return response.data;
  }
};
