"use client";
import React, { createContext, useState, useContext, useEffect, useCallback } from "react";
import axios from "axios";

interface User {
  // Define user properties here, for example:
  id: string;
  email: string;
  name: string;
  firstname: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  logout: () => void;
  isAuthenticated: boolean;
}

const AuthContext = createContext<AuthContextType | null>(null);

export const AuthProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [user, setUser] = useState<User | null>(null);
  const [isAuthenticated, setIsAuthenticated] = useState<boolean>(false);

  const verifyToken = useCallback(async (token: string) => {
    try {
      const response = await axios.get("https://your-api.com/verify-token", {
        headers: { Authorization: `Bearer ${token}` },
      });
      setUser(response.data.user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Token verification failed", error);
      logout();
    }
  }, []);

  useEffect(() => {
    // Check if user is already logged in
    const token = localStorage.getItem("authToken");
    if (token) {
      // Verify token and set user
      verifyToken(token);
    }
  }, [verifyToken]);

  const login = async (email: string, password: string) => {
    try {
      const response = await axios.post("https://your-api.com/login", {
        email,
        password,
      });
      const { token, user } = response.data;
      localStorage.setItem("authToken", token);
      setUser(user);
      setIsAuthenticated(true);
    } catch (error) {
      console.error("Login failed", error);
      throw error;
    }
  };

  const logout = () => {
    localStorage.removeItem("authToken");
    setUser(null);
    setIsAuthenticated(false);
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, isAuthenticated }}>
      {children}
    </AuthContext.Provider>
  );
};

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
