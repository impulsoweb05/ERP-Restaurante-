import { create } from 'zustand';
import { persist } from 'zustand/middleware';
import type { User, Settings } from '@/types';

interface AuthState {
  user: User | null;
  token: string | null;
  isAuthenticated: boolean;
  login: (email: string, password: string) => Promise<boolean>;
  logout: () => void;
  setUser: (user: User, token: string) => void;
}

interface UIState {
  sidebarOpen: boolean;
  darkMode: boolean;
  toggleSidebar: () => void;
  toggleDarkMode: () => void;
  setSidebarOpen: (open: boolean) => void;
}

interface SettingsState {
  settings: Settings | null;
  setSettings: (settings: Settings) => void;
}

export const useAuthStore = create<AuthState>()(
  persist(
    (set) => ({
      user: null,
      token: null,
      isAuthenticated: false,
      login: async (email: string, password: string) => {
        // Default admin credentials
        if (email === 'admin@restaurante.com' && password === 'Admin@12345') {
          const user: User = {
            id: '1',
            email: 'admin@restaurante.com',
            name: 'Administrador',
            role: 'admin',
          };
          const token = 'jwt-token-' + Date.now();
          set({ user, token, isAuthenticated: true });
          return true;
        }
        return false;
      },
      logout: () => {
        set({ user: null, token: null, isAuthenticated: false });
      },
      setUser: (user: User, token: string) => {
        set({ user, token, isAuthenticated: true });
      },
    }),
    {
      name: 'auth-storage',
    }
  )
);

export const useUIStore = create<UIState>()(
  persist(
    (set) => ({
      sidebarOpen: true,
      darkMode: false,
      toggleSidebar: () => set((state) => ({ sidebarOpen: !state.sidebarOpen })),
      toggleDarkMode: () => set((state) => ({ darkMode: !state.darkMode })),
      setSidebarOpen: (open: boolean) => set({ sidebarOpen: open }),
    }),
    {
      name: 'ui-storage',
    }
  )
);

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      settings: {
        restaurant_name: 'Mi Restaurante',
        address: 'Calle Principal 123',
        phone: '3001234567',
        email: 'contacto@restaurante.com',
        social_links: {},
        payment_methods: {
          cash: true,
          card: true,
          transfer: true,
          dataphone: true,
        },
        delivery_zones: [],
        integrations: {
          email: {
            host: 'smtp.gmail.com',
            port: 587,
            user: '', // Configure in Settings > Integrations
            password: '', // Configure in Settings > Integrations
          },
          whatsapp: {
            url: '', // Configure in Settings > Integrations
            instance: '', // Configure in Settings > Integrations
            api_key: '', // Configure in Settings > Integrations
          },
          telegram: {
            bot_token: '', // Configure in Settings > Integrations
            chat_id: '', // Configure in Settings > Integrations
          },
        },
        reservation_config: {
          auto_release_minutes: 30,
          min_advance_hours: 2,
          max_advance_days: 30,
          online_tables: [],
        },
      },
      setSettings: (settings: Settings) => set({ settings }),
    }),
    {
      name: 'settings-storage',
    }
  )
);
