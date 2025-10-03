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
    const response = await api.post("/auth/policy-requests", policyData, {
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

export const getPolicyRequests = async (status?: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const url = status ? `/auth/policy-requests?status=${status}` : "/auth/policy-requests";
    const response = await api.get<import("../types/api.types").GetPolicyRequestsResponse>(url, {
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

export const assignSurveyor = async (assignment: import("../types/api.types").PolicyAssignment) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post("/auth/assign-surveyor", assignment, {
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

export const reviewSubmission = async (policyId: string, decision: 'approved' | 'rejected', notes: string) => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.post("/auth/review-submission", { policyId, decision, notes }, {
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
    const response = await api.post("/auth/loginSurveyor", { email, password });
    return response.data;
  } catch (error) {
    console.error("Surveyor login failed", error);
    throw error;
  }
};

export const getAssignedPolicies = async () => {
  try {
    const token = localStorage.getItem("surveyorToken");
    const response = await api.get<import("../types/api.types").GetAssignedPoliciesResponse>("/auth/assigned-policies", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch assigned policies", error);
    throw error;
  }
};

export const submitSurvey = async (submission: import("../types/api.types").SurveySubmission) => {
  try {
    const token = localStorage.getItem("surveyorToken");
    const formData = new FormData();
    
    formData.append("policyId", submission.policyId);
    formData.append("surveyorId", submission.surveyorId);
    formData.append("surveyNotes", submission.surveyNotes);
    formData.append("recommendedAction", submission.recommendedAction);
    formData.append("contactLog", JSON.stringify(submission.contactLog));
    
    if (submission.surveyDocument instanceof File) {
      formData.append("surveyDocument", submission.surveyDocument);
    }

    const response = await api.post("/auth/submit-survey", formData, {
      headers: {
        Authorization: `Bearer ${token}`,
        "Content-Type": "multipart/form-data",
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to submit survey", error);
    throw error;
  }
};

export const getSurveyors = async () => {
  try {
    const token = localStorage.getItem("authToken");
    const response = await api.get<import("../types/api.types").GetSurveyorsResponse>("/auth/surveyors", {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch surveyors", error);
    throw error;
  }
};

export const getUserPolicies = async (userId: string) => {
  try {
    const token = localStorage.getItem("token");
    const response = await api.get(`/auth/user-policies/${userId}`, {
      headers: {
        Authorization: `Bearer ${token}`,
      },
    });
    return response.data;
  } catch (error) {
    console.error("Failed to fetch user policies", error);
    throw error;
  }
};

export default api;
