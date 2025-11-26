'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';
import { loginCustomer, registerCustomer } from '@/services/api';

export const useAuth = () => {
  const router = useRouter();
  const { token, customer, isAuthenticated, isLoading, setAuth, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  const login = async (phone: string) => {
    try {
      // Try to login first
      const response = await loginCustomer(phone);
      if (response.success && response.data) {
        setAuth(response.data.token, response.data.customer);
        return { success: true };
      }
      return { success: false, error: response.error || 'Error al iniciar sesión' };
    } catch (error) {
      // If login fails, try to register
      try {
        const registerResponse = await registerCustomer({ phone });
        if (registerResponse.success && registerResponse.data) {
          setAuth(registerResponse.data.token, registerResponse.data.customer);
          return { success: true };
        }
        return { success: false, error: registerResponse.error || 'Error al registrar' };
      } catch (registerError) {
        return { success: false, error: 'Error al iniciar sesión' };
      }
    }
  };

  const handleLogout = () => {
    logout();
    router.push('/');
  };

  const requireAuth = () => {
    if (!isLoading && !isAuthenticated) {
      router.push('/auth/login');
      return false;
    }
    return true;
  };

  return {
    token,
    customer,
    isAuthenticated,
    isLoading,
    login,
    logout: handleLogout,
    requireAuth,
  };
};
