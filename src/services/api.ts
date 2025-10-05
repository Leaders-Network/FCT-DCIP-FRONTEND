import axios from "axios";
import {
  EmployeeRegistrationData,
  LoginResponse,
  AvailableRolesResponse,
  GetAllEmployeesResponse
} from "../types/api.types";

// Constants
const API_BASE_URL = process.env.NEXT_PUBLIC_API_URL || "https://fct-dcip-backend-1.onrender.com/api/v1";
const API_KEY = "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

// Helper function for consistent token retrieval
const getAuthToken = () => {
  return localStorage.getItem("token") || localStorage.getItem("authToken");
};

// Helper function for authenticated requests
const getAuthHeaders = () => {
  const token = getAuthToken();
  return {
    "Content-Type": "application/json",
    apiKey: API_KEY,
    ...(token && { Authorization: `Bearer ${token}` }),
  };
};

// API Instance Configuration
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    apiKey: API_KEY,
  },
});

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
export const loginEmployee = async (email: string, password: string) => {
  try {
    const response = await api.post<LoginResponse>("/auth/loginEmployee", { email, password });
    return response;
  } catch (error) {
    console.error("Login API Error:", error);
    throw error;
  }
};

export const getUserRole = (token: string) =>
  api.get("/auth/user-role", {
    headers: { Authorization: `Bearer ${token}` },
  }); 

// Property Management APIs
export const getCategories = async ({token}: {token: string}): Promise<Category[]> => {
  try {
    const response = await api.get("/auth/available-categories", {
      headers: { Authorization: `Bearer ${token}` },
    });
    console.log(response)
    return response.data.categories;
  } catch (error) {
    console.error("Failed to fetch categories:", error);
    throw error;
  }
};

export const addProperty = async (
  payload: AddPropertyPayload, 
  token: string
): Promise<Record<string, unknown>> => {
  try {
    const response = await api.post("/auth/user/add-property", payload, {
      headers: { Authorization: `Bearer ${token}` },
    });
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
    const token = localStorage.getItem("authToken");
    const response = await api.post("/auth/registerEmployee", employeeData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to register employee", error);
    throw error;
  }
};

export const getAllEmployees = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get<GetAllEmployeesResponse>("/auth/get-all-employees", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data.allStaff.sanitizedEmployees;
  } catch (error) {
    console.error("Failed to fetch users", error);
    throw error;
  }
};

export const getAvailableRoles = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get<AvailableRolesResponse>("/auth/available-roles", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch available roles", error);
    throw error;
  }
};

// Policy Request APIs
export const submitPolicyRequest = async (policyData: import("../types/api.types").CreatePolicyRequestData) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.post("/policy", policyData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit policy request", error);
    throw error;
  }
};

export const getPolicyRequests = async (status?: string, page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("authToken");
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `/policy?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch policy requests", error);
    throw error;
  }
};

export const getUserPolicyRequests = async (status?: string, page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `/policy/user?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user policy requests", error);
    throw error;
  }
};

export const assignSurveyor = async (policyId: string, assignment: {
  surveyorIds: string[];
  deadline?: string;
  priority?: string;
  instructions?: string;
  specialRequirements?: string[];
}) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post(`/policy/${policyId}/assign`, assignment, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to assign surveyor", error);
    throw error;
  }
};

export const getAvailableSurveyors = async (specialization?: string, location?: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const params = new URLSearchParams();
    if (specialization) params.append('specialization', specialization);
    if (location) params.append('location', location);
    
    const url = `/policy/surveyors/available?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get available surveyors", error);
    throw error;
  }
};

export const reviewSubmission = async (submissionId: string, decision: 'approved' | 'rejected', reviewNotes: string, qualityCheck?: any) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post(`/policy/submissions/${submissionId}/review`, { 
      decision, 
      reviewNotes, 
      qualityCheck 
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
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
    const response = await api.post("/auth/loginEmployee", { email, password });
    return response.data;
  } catch (error) {
    console.error("Surveyor login failed", error);
    throw error;
  }
};

export const getSurveyorDashboard = async () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.get("/surveyor/dashboard", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor dashboard", error);
    throw error;
  }
};

export const getSurveyorAssignments = async (status?: string, page = 1, limit = 10) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `/surveyor/assignments?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor assignments", error);
    throw error;
  }
};

export const updateAssignmentStatus = async (assignmentId: string, status: string, notes?: string) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.patch(`/surveyor/assignments/${assignmentId}/status`, {
      status,
      notes
    }, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update assignment status", error);
    throw error;
  }
};

export const submitSurvey = async (submission: {
  policyId: string;
  assignmentId: string;
  surveyDetails: any;
  surveyDocument: any;
  surveyNotes: string;
  contactLog: any[];
  recommendedAction: string;
}) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.post("/surveyor/surveys", submission, {
      headers: {
        Authorization: `Bearer ${token}`,
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
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const params = new URLSearchParams();
    if (status && status !== 'all') params.append('status', status);
    params.append('page', page.toString());
    params.append('limit', limit.toString());
    
    const url = `/surveyor/submissions?${params.toString()}`;
    const response = await api.get(url, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor submissions", error);
    throw error;
  }
};

export const getSurveyorProfile = async () => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.get("/surveyor/profile", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor profile", error);
    throw error;
  }
};

export const updateSurveyorProfile = async (profileData: any) => {
  try {
    const token = localStorage.getItem("token") || localStorage.getItem("authToken");
    const response = await api.patch("/surveyor/profile", profileData, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update surveyor profile", error);
    throw error;
  }
};

// Admin Dashboard APIs
export const getAdminDashboardData = async (period = '30d') => {
  try {
    const response = await api.get(`/admin/dashboard?period=${period}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin dashboard data:", error);
    throw error;
  }
};

export const getQuickStats = async () => {
  try {
    const response = await api.get("/admin/dashboard/stats", {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch quick stats:", error);
    throw error;
  }
};

export const getAdminAlerts = async () => {
  try {
    const response = await api.get("/admin/dashboard/alerts", {
      headers: getAuthHeaders(),
    });
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
    const response = await api.get(url, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.post("/admin/surveyor", surveyorData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to create surveyor:", error);
    throw error;
  }
};

export const updateSurveyorByAdmin = async (surveyorId: string, surveyorData: any) => {
  try {
    const response = await api.patch(`/admin/surveyor/${surveyorId}`, surveyorData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update surveyor:", error);
    throw error;
  }
};

export const deleteSurveyorByAdmin = async (surveyorId: string) => {
  try {
    const response = await api.delete(`/admin/surveyor/${surveyorId}`, {
      headers: getAuthHeaders(),
    });
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
  policyId?: string;
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
    const response = await api.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch admin assignments:", error);
    throw error;
  }
};

export const getAssignmentAnalytics = async (period = '30d') => {
  try {
    const response = await api.get(`/admin/assignment/analytics?period=${period}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch assignment analytics:", error);
    throw error;
  }
};

export const updateAssignmentByAdmin = async (assignmentId: string, updates: any) => {
  try {
    const response = await api.patch(`/admin/assignment/${assignmentId}`, updates, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.patch(`/admin/assignment/${assignmentId}/reassign`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to reassign assignment:", error);
    throw error;
  }
};

export const cancelAssignment = async (assignmentId: string, reason: string) => {
  try {
    const response = await api.patch(`/admin/assignment/${assignmentId}/cancel`, { reason }, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to cancel assignment:", error);
    throw error;
  }
};

// Surveyor Assignment Workflow APIs
export const getSurveyorAssignmentsNew = async (filters?: {
  status?: string;
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
    
    const url = `/assignment${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyor assignments:", error);
    throw error;
  }
};

export const acceptAssignment = async (assignmentId: string, notes?: string) => {
  try {
    const response = await api.patch(`/assignment/${assignmentId}/accept`, { notes }, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.patch(`/assignment/${assignmentId}/start`, data, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.patch(`/assignment/${assignmentId}/progress`, data, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.patch(`/assignment/${assignmentId}/complete`, data, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.post(`/assignment/${assignmentId}/messages`, data, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add assignment message:", error);
    throw error;
  }
};

export const getAssignmentMessages = async (assignmentId: string) => {
  try {
    const response = await api.get(`/assignment/${assignmentId}/messages`, {
      headers: getAuthHeaders(),
    });
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
  contactLog: any[];
  recommendedAction: 'approve' | 'reject' | 'request_more_info';
}) => {
  try {
    const response = await api.post("/submission", submissionData, {
      headers: getAuthHeaders(),
    });
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
    
    const url = `/submission${params.toString() ? `?${params.toString()}` : ''}`;
    const response = await api.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch survey submissions:", error);
    throw error;
  }
};

export const updateSurveySubmission = async (submissionId: string, updates: any) => {
  try {
    const response = await api.patch(`/submission/${submissionId}`, updates, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to update survey submission:", error);
    throw error;
  }
};

export const submitSurveyFinal = async (submissionId: string, finalNotes?: string) => {
  try {
    const response = await api.patch(`/submission/${submissionId}/submit`, { finalNotes }, {
      headers: getAuthHeaders(),
    });
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
    const response = await api.post(`/submission/${submissionId}/contact`, contactData, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to add contact log entry:", error);
    throw error;
  }
};

export const getSubmissionByAssignment = async (assignmentId: string) => {
  try {
    const response = await api.get(`/submission/assignment/${assignmentId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get submission by assignment:", error);
    throw error;
  }
};

// File Upload APIs
export const uploadSurveyDocument = async (file: File, data: {
  assignmentId?: string;
  policyId?: string;
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
        apiKey: API_KEY,
        Authorization: `Bearer ${getAuthToken()}`,
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
  policyId?: string;
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
        apiKey: API_KEY,
        Authorization: `Bearer ${getAuthToken()}`,
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
  policyId?: string;
  category?: string;
  documentType?: string;
}) => {
  try {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value) params.append(key, value);
    });
    
    const url = `/survey-documents?${params.toString()}`;
    const response = await api.get(url, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get survey documents:", error);
    throw error;
  }
};

export const deleteSurveyDocument = async (documentId: string, assignmentId?: string, policyId?: string) => {
  try {
    const endpoint = assignmentId 
      ? `/survey-documents/assignment/${assignmentId}/document/${documentId}`
      : `/survey-documents/policy/${policyId}/document/${documentId}`;
    
    const response = await api.delete(endpoint, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to delete survey document:", error);
    throw error;
  }
};

export const getDocumentDownloadUrl = async (publicId: string) => {
  try {
    const response = await api.get(`/survey-documents/download/${publicId}`, {
      headers: getAuthHeaders(),
    });
    return response.data;
  } catch (error) {
    console.error("Failed to get document download URL:", error);
    throw error;
  }
};

export default api;
