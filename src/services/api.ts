import axios from "axios";

const API_BASE_URL = "https://fct-dcip-backend-1.onrender.com/api/v1";
const API_KEY =
  "4a8612b0162373aff93c2088780b42e77d06b22b9906a58f5940054b192695134262a4c481b9713426922f29b7bd44ea64dcc6e13a3d22d0f7d05044e9ca626c";

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    "Content-Type": "application/json",
    apiKey: API_KEY,
  },
});

export const loginEmployee = (email: string, password: string) =>
  api.post("/auth/loginEmployee", { email, password });

export const resetPasswordOTP = (email: string) =>
  api.post("/auth/reset-password-otp", { email });

export const verifyOTP = (email: string, otp: string) =>
  api.post("/auth/verify-otp-employee", { email, otp });

export const resetPassword = (newpassword: string) =>
  api.patch("/auth/employee-reset-password", { newpassword });

export const registerEmployee = (employeeData: EmployeeRegistrationData) =>
  api.post("/auth/registerEmployee", employeeData);

export const getUserRole = (token: string) =>
  api.get("/auth/user-role", {
    headers: { Authorization: `Bearer ${token}` },
  });

// New functions for ResetPassword, NewPassword, and OTPAuthentication
export const initiatePasswordReset = (email: string) =>
  api.post("/auth/reset-password-otp", { email });

export const verifyOTPAndResetPassword = (email: string, otp: string, newpassword: string) =>
  api.patch("/auth/employee-reset-password", { email, otp, newpassword });

export const resendOTP = (email: string) =>
  api.post("/auth/resend-otp", { email });

// Add other API calls as needed

export default api;

interface EmployeeRegistrationData {
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  // Add any other fields that are required for employee registration
}
