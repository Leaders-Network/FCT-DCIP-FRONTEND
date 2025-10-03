import axios from "axios";
import {
  EmployeeRegistrationData,
  LoginResponse,
  AvailableRolesResponse,
  GetAllEmployeesResponse
} from "../types/api.types";

// Constants
const API_BASE_URL = "https://fct-dcip-backend-1.onrender.com/api/v1";
const API_KEY = "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

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

export default api;
