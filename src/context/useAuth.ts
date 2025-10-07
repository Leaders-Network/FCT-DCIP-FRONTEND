import { useContext } from "react";
import { AuthContext } from "./AuthProvider";

export interface User {
  _id: string;
  firstname: string;
  lastname: string;
  email: string;
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
}

export interface AuthContextType {
  isAuthenticated: boolean;
  login: (token: string, user: User) => void;
  logout: () => void;
  user: User | null;
  token: string | null;
}

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};
