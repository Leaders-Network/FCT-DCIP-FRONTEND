"use client";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee, loginUser } from "@/services/api";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/utils/auth";
import SkeletonLoader from "@/components/SkeletonLoader";
import { User, Employee } from "@/types/api.types";

type AuthenticatedUser = User | Employee;

interface AuthContextType {
  user: AuthenticatedUser | null;
  login: (email: string, password: string, userType: 'user' | 'employee') => Promise<void>;
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
  const [user, setUser] = useState<AuthenticatedUser | null>(null);
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
            name: userData.firstname || userData.fullname,
          });
        }
      } catch (error) {
        console.error("Auth initialization error:", error);
      } finally {
        setState(prevState => ({ ...prevState, isLoading: false }));
      }
    };

    checkAuth();
  }, [logout, router]);

  const login = async (email: string, password: string, userType: 'user' | 'employee') => {
    try {
      if (userType === 'employee') {
        const response = await loginEmployee(email, password);
        const { token, employee } = response.data;

        // Store token with correct type for employees
        setAuthToken(token, 'admin'); // Default to admin for employees
        localStorage.setItem('user', JSON.stringify(employee));
        setUser(employee);
        setState({
          isAuthenticated: true,
          isLoading: false,
          token,
          name: employee.firstname,
        });
        router.push("/admin/dashboard");
      } else {
        const response = await loginUser(email, password);
        const { token, user } = response.data;

        // Store token with correct type for users
        setAuthToken(token, 'user'); // Explicitly set as user token
        localStorage.setItem('user', JSON.stringify(user));
        localStorage.setItem('userInfo', JSON.stringify(user)); // Also store in userInfo for compatibility
        setUser(user);
        setState({
          isAuthenticated: true,
          isLoading: false,
          token,
          name: user.fullname,
        });
        router.push("/dashboard");
      }
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

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
