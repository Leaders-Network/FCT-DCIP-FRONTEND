"use client";
import React, { createContext, useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import { loginEmployee, loginUser } from "@/services/api";
import {
  getAuthToken,
  setAuthToken,
  removeAuthToken,
} from "@/utils/auth";
import { getCookie, setCookie, deleteCookie } from "@/utils/cookies";
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
    deleteCookie('user');
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
        const storedUser = getCookie('user');

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

        // Store token with correct type for employees (super-admin gets its own token key)
        const role = employee.employeeRole.role;
        const tokenType = role === 'Super-admin' ? 'super-admin' : 'admin';
        setAuthToken(token, tokenType);
        setCookie('user', JSON.stringify(employee), { expires: 7 });
        if (role === 'Super-admin') {
          setCookie('superAdminInfo', JSON.stringify(employee), { expires: 7 });
        }
        setUser(employee);
        setState({
          isAuthenticated: true,
          isLoading: false,
          token,
          name: employee.firstname,
        });

        // Determine redirect based on employee role
        if (role === 'Super-admin') {
          // Redirect super-admin to a dashboard selector page
          router.push("/admin/dashboard-selector");
        } else if (role === 'Admin') {
          router.push("/admin/dashboard");
        } else if (role === 'Staff') {
          router.push("/admin/dashboard");
        } else if (role === 'Surveyor') {
          router.push("/surveyor/dashboard");
        } else {
          // Fallback to admin dashboard
          router.push("/admin/dashboard");
        }
      } else {
        const response = await loginUser(email, password);
        const { token, user } = response.data;

        // Store token with correct type for users
        setAuthToken(token, 'user'); // Explicitly set as user token
        setCookie('user', JSON.stringify(user), { expires: 7 });
        setCookie('userInfo', JSON.stringify(user), { expires: 7 }); // Also store in userInfo for compatibility
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
