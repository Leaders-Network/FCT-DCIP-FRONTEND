import { useContext } from 'react';
import { AuthContext } from '@/context/AuthProvider';

interface AuthContextType {
  isAuthenticated: boolean;
  isLoading: boolean;
  token: string;
  login: (token: string, name: string) => void;
  logout: () => void;
}

export const useAuth = () => {
  const context = useContext(AuthContext) as unknown as AuthContextType;
  if (!context) {
    throw new Error('useAuth must be used within an AuthProvider');
  }
  return {
    isAuthenticated: context.isAuthenticated,
    isLoading: context.isLoading || false,
    token: context.token || '',
    login: context.login,
    logout: context.logout,
  };
};
