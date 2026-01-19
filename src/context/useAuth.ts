import { useContext } from "react";
import { AuthContext } from "./AuthProvider";
import { User, Employee } from "@/types/api.types";

export type AuthenticatedUser = User | Employee;

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (email: string, password: string, userType: 'user' | 'employee') => Promise<void>;
  logout: () => void;
  user: AuthenticatedUser | null;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

// Re-export types for convenience
export type { User, Employee } from "@/types/api.types";
