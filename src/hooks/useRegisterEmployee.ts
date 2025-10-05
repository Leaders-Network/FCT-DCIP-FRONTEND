import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import {
  getAvailableRoles,
  registerEmployee,
} from "@/services/api";
import axios from "axios";
import { EmployeeRegistrationData, Role } from "@/types/api.types";

// First, let's define role constants
const ROLE_IDS = {
  SUPER_ADMIN: "67097fb3f07f5547278be69b",
  ADMIN: "67097fb3f07f5547278be69c",
  STAFF: "67097fb3f07f5547278be69d"
} as const;

interface RegisterEmployeeState {
  formData: EmployeeRegistrationData;
  error: string;
  isLoading: boolean;
  availableRoles: Role[];
}

export const useRegisterEmployee = () => {
  const router = useRouter();
  const [state, setState] = useState<RegisterEmployeeState>({
    formData: {
      firstname: "",
      lastname: "",
      phonenumber: "",
      email: "",
      roleId: "",
      statusId: "",
    },
    error: "",
    isLoading: true,
    availableRoles: [], // We'll use this instead of the separate state
  });

  const [userRole, setUserRole] = useState<string>("");
  
  // Get current user role from context or localStorage
  useEffect(() => {
    const currentUserRole = localStorage.getItem("userRole"); // or from your auth context
    if (currentUserRole) {
      setUserRole(currentUserRole);
    }
  }, []);

  // Filter roles based on user's role
  const filterRolesByPermission = useCallback((roles: Role[], userRole: string) => {
    switch (userRole) {
      case ROLE_IDS.SUPER_ADMIN:
        return roles; // Show all roles
      case ROLE_IDS.ADMIN:
        return roles.filter(role => 
          role._id === ROLE_IDS.ADMIN || role._id === ROLE_IDS.STAFF
        );
      case ROLE_IDS.STAFF:
        return roles.filter(role => 
          role._id === ROLE_IDS.STAFF
        );
      default:
        return [];
    }
  }, []);

  // Fetch and filter available roles
  useEffect(() => {
    const fetchRoles = async () => {
      try {
        const response = await getAvailableRoles();
        const filteredRoles = filterRolesByPermission(response.roles, userRole);
        setState((prev) => ({
          ...prev,
          availableRoles: filteredRoles,
          isLoading: false,
        }));
      } catch (error) {
        console.error("Failed to fetch roles:", error);
        setState((prev) => ({
          ...prev,
          error: "Failed to load roles",
        }));
      }
    };

    fetchRoles();
  }, [userRole, filterRolesByPermission]);

  // Check authentication
  const checkAuth = useCallback(async () => {
    const token = localStorage.getItem("authToken");
    if (!token) {
      router.push("/admin/login");
      return;
    }

    try {
      const data = await getAvailableRoles();

      if (data.role !== "Super-admin") {
        router.push("/admin/dashboard");
        return;
      }

      setState((prev) => ({
        ...prev,
        availableRoles: data.roles || [],
        isLoading: false,
      }));
    } catch (error) {
      console.error("Failed to fetch user role", error);
      router.push("/admin/login");
    }
  }, [router]);

  useEffect(() => {
    checkAuth();
  }, [checkAuth]);

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    setState((prev) => ({
      ...prev,
      formData: { ...prev.formData, [e.target.name]: e.target.value },
    }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    try {
      const token = localStorage.getItem("authToken");
      if (!token) {
        setState((prev) => ({
          ...prev,
          error: "You must be logged in to register an employee.",
        }));
        return;
      }

      await registerEmployee(state.formData);
      router.push("/admin/registration-success");
    } catch (error) {
      if (axios.isAxiosError(error) && error.response) {
        setState((prev) => ({
          ...prev,
          error: `Registration failed: ${error.response?.data.message}`,
        }));
      } else {
        setState((prev) => ({
          ...prev,
          error: "Registration failed. Please try again.",
        }));
      }
    }
  };

  return {
    ...state,
    userRole,
    handleChange,
    handleSubmit,
  };
};
