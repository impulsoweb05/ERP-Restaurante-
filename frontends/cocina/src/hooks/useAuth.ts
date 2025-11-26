'use client';

import { useEffect } from 'react';
import { useAuthStore } from '@/stores/authStore';

export const useAuth = () => {
  const { token, user, isAuthenticated, isLoading, setAuth, logout, loadFromStorage } = useAuthStore();

  useEffect(() => {
    loadFromStorage();
  }, [loadFromStorage]);

  return {
    token,
    user,
    isAuthenticated,
    isLoading,
    setAuth,
    logout,
  };
};
