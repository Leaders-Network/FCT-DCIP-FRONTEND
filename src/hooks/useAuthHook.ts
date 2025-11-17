import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { getCookie, setCookie, deleteCookie } from '@/utils/cookies';

export function useAuthHook() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const router = useRouter();

  useEffect(() => {
    const token = getCookie('token') || getCookie('userToken');
    if (token) {
      setIsAuthenticated(true);
    }
    setIsLoading(false);
  }, []);

  const login = (token: string, name: string) => {
    setCookie('token', token, { expires: 7 });
    setCookie('name', name, { expires: 7 });
    setIsAuthenticated(true);
    router.push('/dashboard');
  };

  const logout = () => {
    deleteCookie('token');
    deleteCookie('name');
    setIsAuthenticated(false);
    router.push('/login');
  };

  return { isAuthenticated, isLoading, login, logout };
}
