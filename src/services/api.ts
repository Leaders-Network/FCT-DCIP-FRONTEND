import axios from "axios";
import {
  EmployeeRegistrationData,
  EmployeeLoginResponse,
  UserLoginResponse,
  AvailableRolesResponse,
  GetAllEmployeesResponse,
  PolicyRequest,
  Surveyor,
  Assignment,
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
    apiKey: API_KEY,
  },
});

api.interceptors.request.use(
  (config) => {
    const token = getAuthToken();
    console.log("Auth Token for getSurveySubmissions:", token);
    if (token) {
      config.headers['Authorization'] = `Bearer ${token}`;
    }
    console.log("Request Headers:", config.headers);
    return config;
  },
  (error) => {
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
    const response = await api.get("/auth/user/get-all-properties");
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

export const reviewSubmission = async (submissionId: string, decision: 'approved' | 'rejected', reviewNotes: string, qualityCheck?: any) => {
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

export const updateSurveyorProfile = async (profileData: any) => {
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

export const updateSurveyorByAdmin = async (surveyorId: string, surveyorData: any) => {
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

export const updateAssignmentByAdmin = async (assignmentId: string, updates: any) => {
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
  contactLog: any[];
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

export const updateSurveySubmission = async (submissionId: string, updates: any) => {
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
    const response = await api.get(url);
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

  getPolicyById: async (policyId: string) => {
    const response = await api.get(`/admin/policy/${policyId}`);
    return response.data;
  },

  assignSurveyor: async (policyId: string, assignment: { surveyorIds: string[] }) => {
    const response = await api.post(`/policy/${policyId}/assign`, assignment);
    return response.data;
  },

  reviewPolicySubmission: async (policyId: string, decision: 'approved' | 'rejected', notes: string) => {
    const response = await api.post(`/policy/${policyId}/review`, { decision, notes });
    return response.data;
  },

  sendPolicyToUser: async (policyId: string) => {
    const response = await api.post(`/admin/policy/${policyId}/send-to-user`);
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

  deleteEmployee: async (employeeId: string) => {
    const response = await api.delete(`/admin/employees/${employeeId}`);
    return response.data;
  },

  updateEmployeeStatus: async (employeeId: string, status: string) => {
    const response = await api.patch(`/admin/employees/${employeeId}/status`, { status });
    return response.data;
  },

  createAdministrator: async (adminData: any) => {
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

  getSurveyors: async (filters?: {
    status?: string;
    specialization?: string;
    search?: string;
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

  getAssignmentByPolicyId: async (policyId: string) => {
    const response = await api.get(`/admin/assignment/policy/${policyId}`);
    return response.data;
  },

  getSurveySubmissions: async (filters?: {
    status?: string;
    surveyorId?: string;
    policyId?: string;
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

  generateReport: async (reportType: string, filters?: any) => {
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

export const withErrorHandling = <T extends (...args: any[]) => Promise<any>>(
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

export default api;