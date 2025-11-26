import { create } from 'zustand';
import type { Waiter } from '@/types';

interface AuthState {
  token: string | null;
  waiter: Waiter | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, waiter: Waiter) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  waiter: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, waiter: Waiter) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('waiter_token', token);
      localStorage.setItem('waiter', JSON.stringify(waiter));
    }
    set({ token, waiter, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('waiter_token');
      localStorage.removeItem('waiter');
    }
    set({ token: null, waiter: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('waiter_token');
      const waiterStr = localStorage.getItem('waiter');
      if (token && waiterStr) {
        try {
          const waiter = JSON.parse(waiterStr);
          set({ token, waiter, isAuthenticated: true, isLoading: false });
        } catch {
          set({ isLoading: false });
        }
      } else {
        set({ isLoading: false });
      }
    } else {
      set({ isLoading: false });
    }
  },
}));
