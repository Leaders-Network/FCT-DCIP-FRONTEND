"use client";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee } from "@/services/api";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/utils/auth";
import SkeletonLoader from "@/components/SkeletonLoader";

interface User {
  _id: string;
  email: string;
  firstname: string;
  lastname: string;
  phonenumber: string;
  employeeRole: {
    _id: string;
    role: string;
  };
  employeeStatus: {
    _id: string;
    status: string;
  };
  deleted: boolean;
  createdAt: string;
  updatedAt: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

interface AuthState {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string;
  name: string;
}

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [state, setState] = useState<AuthState>({
    isAuthenticated: false,
    isLoading: true,
    token: '',
    name: '',
  });

  const logout = useCallback(() => {
    removeAuthToken();
    localStorage.removeItem('user');
    setUser(null);
    setState({
      isAuthenticated: false,
      isLoading: false,
      token: '',
      name: '',
    });
    router.push("/");
  }, [router]);

  // Check authentication status on mount and token change
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const token = getAuthToken();
        const storedUser = localStorage.getItem('user');

        if (token && storedUser) {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setState({
            isAuthenticated: true,
            isLoading: false,
            token,
            name: userData.firstname,
          });
          
          // Optionally verify token with backend
          // try {
          //   await getUserRole(token); // Verify token is still valid
          // } catch (error) {
          //   console.error("Token validation failed:", error);
          //   logout();
          //   return;
          // }
        } else {
          // Only redirect to login if we're not already there
          const isLoginPage = window.location.pathname.includes('/login');
          if (!isLoginPage) {
            router.push("/");
          }
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    checkAuth();
  }, [logout, router]);

  const login = async (email: string, password: string) => {
    try {
      const response = await loginEmployee(email, password);
      console.log("Login Response:", response.data);
      
      // Destructure the correct response structure
      const { token, employee } = response.data;
      
      // Store token
      setAuthToken(token);
      
      // Store user data - using the employee object directly
      const userData = {
        _id: employee._id,
        email: employee.email,
        firstname: employee.firstname,
        lastname: employee.lastname,
        phonenumber: employee.phonenumber,
        employeeRole: employee.employeeRole,
        employeeStatus: employee.employeeStatus,
        deleted: employee.deleted,
        createdAt: employee.createdAt,
        updatedAt: employee.updatedAt
      };

      // Save to localStorage and state
      localStorage.setItem('user', JSON.stringify(userData));
      setUser(userData);
      setState({
        isAuthenticated: true,
        isLoading: false,
        token,
        name: userData.firstname,
      });

      console.log("Stored User Data:", userData);
      
      // Optionally redirect to dashboard
      router.push("/admin/dashboard");
      
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  // Add this effect to load user data on mount
  useEffect(() => {
    const loadUserData = () => {
      const token = getAuthToken();
      const storedUser = localStorage.getItem('user');

      console.log("Loading stored data - Token:", token);
      console.log("Loading stored data - User:", storedUser);

      if (token && storedUser) {
        try {
          const userData = JSON.parse(storedUser);
          setUser(userData);
          setState({
            isAuthenticated: true,
            isLoading: false,
            token,
            name: userData.firstname,
          });
        } catch (error) {
          console.error("Failed to parse stored user data:", error);
          logout();
        }
      }
      setState(prevState => ({ ...prevState, isLoading: false }));
    };

    loadUserData();
  }, [logout]);

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: state.isAuthenticated,
  };

  if (state.isLoading) {
    return <SkeletonLoader />;
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
