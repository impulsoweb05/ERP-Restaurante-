import { create } from 'zustand';
import type { SoundSettings } from '@/types';

interface SettingsState {
  sound: SoundSettings;
  isFullscreen: boolean;
  setSoundEnabled: (enabled: boolean) => void;
  setSoundVolume: (volume: number) => void;
  toggleNewOrderSound: () => void;
  toggleUrgentSound: () => void;
  setFullscreen: (fullscreen: boolean) => void;
  loadFromStorage: () => void;
  saveToStorage: () => void;
}

const DEFAULT_SETTINGS: SoundSettings = {
  enabled: true,
  volume: 0.7,
  newOrderSound: true,
  urgentSound: true,
};

export const useSettingsStore = create<SettingsState>((set, get) => ({
  sound: DEFAULT_SETTINGS,
  isFullscreen: false,

  setSoundEnabled: (enabled: boolean) => {
    set((state) => ({
      sound: { ...state.sound, enabled },
    }));
    get().saveToStorage();
  },

  setSoundVolume: (volume: number) => {
    set((state) => ({
      sound: { ...state.sound, volume: Math.max(0, Math.min(1, volume)) },
    }));
    get().saveToStorage();
  },

  toggleNewOrderSound: () => {
    set((state) => ({
      sound: { ...state.sound, newOrderSound: !state.sound.newOrderSound },
    }));
    get().saveToStorage();
  },

  toggleUrgentSound: () => {
    set((state) => ({
      sound: { ...state.sound, urgentSound: !state.sound.urgentSound },
    }));
    get().saveToStorage();
  },

  setFullscreen: (fullscreen: boolean) => {
    set({ isFullscreen: fullscreen });
  },

  loadFromStorage: () => {
    if (typeof window !== 'undefined') {
      const stored = localStorage.getItem('kitchen_settings');
      if (stored) {
        try {
          const settings = JSON.parse(stored);
          set({ sound: { ...DEFAULT_SETTINGS, ...settings } });
        } catch {
          // Use defaults
        }
      }
    }
  },

  saveToStorage: () => {
    if (typeof window !== 'undefined') {
      const { sound } = get();
      localStorage.setItem('kitchen_settings', JSON.stringify(sound));
    }
  },
}));
