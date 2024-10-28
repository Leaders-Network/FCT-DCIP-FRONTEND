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

export default api;
