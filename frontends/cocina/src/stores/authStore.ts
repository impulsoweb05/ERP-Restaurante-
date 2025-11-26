import { create } from 'zustand';
import type { KitchenUser } from '@/types';

interface AuthState {
  token: string | null;
  user: KitchenUser | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  setAuth: (token: string, user: KitchenUser) => void;
  logout: () => void;
  loadFromStorage: () => void;
}

export const useAuthStore = create<AuthState>((set) => ({
  token: null,
  user: null,
  isAuthenticated: false,
  isLoading: true,

  setAuth: (token: string, user: KitchenUser) => {
    if (typeof window !== 'undefined') {
      localStorage.setItem('kitchen_token', token);
      localStorage.setItem('kitchen_user', JSON.stringify(user));
    }
    set({ token, user, isAuthenticated: true, isLoading: false });
  },

  logout: () => {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('kitchen_token');
      localStorage.removeItem('kitchen_user');
    }
    set({ token: null, user: null, isAuthenticated: false, isLoading: false });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const token = localStorage.getItem('kitchen_token');
      const userStr = localStorage.getItem('kitchen_user');
      if (token && userStr) {
        try {
          const user = JSON.parse(userStr);
          set({ token, user, isAuthenticated: true, isLoading: false });
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
