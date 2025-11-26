import { create } from 'zustand';
import type { Customer } from '@/types';

interface AuthState {
  token: string | null;
  customer: Customer | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, customer: Customer) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  customer: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, customer: Customer) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('token', token);
      localStorage.setItem('customer', JSON.stringify(customer));
    }
    set({ token, customer, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('token');
      localStorage.removeItem('customer');
    }
    set({ token: null, customer: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('token');
      const customerStr = localStorage.getItem('customer');
      if (token && customerStr) {
        try {
          const customer = JSON.parse(customerStr);
          set({ token, customer, isAuthenticated: true, isLoading: false });
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
