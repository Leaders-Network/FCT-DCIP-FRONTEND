"use client";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { getUserRole, loginEmployee } from "@/services/api";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/utils/auth";
import SkeletonLoader from "@/components/SkeletonLoader";

interface User {
  id: string;
  email: string;
  role: string;
  name: string;
  // Add other user properties as needed
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

export const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const router = useRouter();
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticatedState, setIsAuthenticatedState] = useState<boolean>(false);
  const [isLoading, setIsLoading] = useState(true);

  const logout = useCallback(() => {
    removeAuthToken();
    setUser(null);
    setIsAuthenticatedState(false);
    router.push("/admin/login");
  }, [router]);

  useEffect(() => {
    const initializeAuth = async () => {
      const token = getAuthToken();
      if (token) {
        try {
          await verifyAndSetUser(token);
        } catch (error) {
          console.error("Token verification failed", error);
          logout();
        }
      }
      setIsLoading(false);
    };

    initializeAuth();
  }, [logout]);

  const verifyAndSetUser = async (token: string) => {
    try {
      const response = await getUserRole(token);
      setUser(response.data.user);
      setIsAuthenticatedState(true);
    } catch (error) {
      throw error;
    }
  };

  const login = async (email: string, password: string) => {
    try {
      const response = await loginEmployee(email, password);
      const { token, employee } = response.data;
      setAuthToken(token);
      setUser(employee);
      setIsAuthenticatedState(true);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  

  const contextValue: AuthContextType = {
    user,
    login,
    logout,
    isAuthenticated: isAuthenticatedState,
  };

  if (isLoading) {
    return <SkeletonLoader />; // Or any loading component
  }

  return (
    <AuthContext.Provider value={contextValue}>{children}</AuthContext.Provider>
  );
};
