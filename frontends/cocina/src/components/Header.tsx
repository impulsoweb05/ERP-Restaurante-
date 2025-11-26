'use client';

import { useEffect, useState } from 'react';
import { useAuthStore } from '@/stores/authStore';
import { useSettingsStore } from '@/stores/settingsStore';
import { useFullscreen } from '@/hooks/useFullscreen';
import { getCurrentTime } from '@/lib/utils';
import type { KitchenStats } from '@/types';

interface HeaderProps {
  stats?: KitchenStats | null;
  onRefresh?: () => void;
  isConnected?: boolean;
}

export default function Header({ stats, onRefresh, isConnected }: HeaderProps) {
  const { user, logout } = useAuthStore();
  const { sound, setSoundEnabled } = useSettingsStore();
  const { toggleFullscreen, isFullscreen } = useFullscreen();
  const [currentTime, setCurrentTime] = useState(getCurrentTime());

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(getCurrentTime());
    }, 1000);
    return () => clearInterval(interval);
  }, []);

  return (
    <header className="bg-kitchen-dark border-b border-gray-700 px-4 py-3 flex items-center justify-between">
      {/* Left section */}
      <div className="flex items-center gap-4">
        <div className="flex items-center gap-2">
          <span className="text-2xl">🧑‍🍳</span>
          <div>
            <h1 className="text-xl font-bold text-white">COCINA</h1>
            {user && (
              <span className="text-xs text-gray-400">{user.name}</span>
            )}
          </div>
        </div>

        {/* Connection status */}
        <div className="flex items-center gap-2 px-3 py-1 bg-gray-800 rounded-full">
          <span
            className={`w-2 h-2 rounded-full ${
              isConnected ? 'bg-green-500' : 'bg-red-500'
            }`}
          />
          <span className="text-xs text-gray-400">
            {isConnected ? 'Conectado' : 'Desconectado'}
          </span>
        </div>
      </div>

      {/* Center section - Stats */}
      {stats && (
        <div className="flex items-center gap-6">
          <div className="flex items-center gap-2 px-4 py-2 bg-yellow-500/20 rounded-lg">
            <span className="text-yellow-500 font-bold text-lg">
              {stats.pending}
            </span>
            <span className="text-yellow-500/80 text-sm">En cola</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-orange-500/20 rounded-lg">
            <span className="text-orange-500 font-bold text-lg">
              {stats.preparing}
            </span>
            <span className="text-orange-500/80 text-sm">Preparando</span>
          </div>
          <div className="flex items-center gap-2 px-4 py-2 bg-green-500/20 rounded-lg">
            <span className="text-green-500 font-bold text-lg">
              {stats.ready}
            </span>
            <span className="text-green-500/80 text-sm">Listos</span>
          </div>
        </div>
      )}

      {/* Right section */}
      <div className="flex items-center gap-4">
        {/* Clock */}
        <div className="text-2xl font-mono text-white bg-gray-800 px-4 py-2 rounded-lg">
          {currentTime}
        </div>

        {/* Sound toggle */}
        <button
          onClick={() => setSoundEnabled(!sound.enabled)}
          className={`p-2 rounded-lg transition-colors ${
            sound.enabled
              ? 'bg-green-500/20 text-green-500'
              : 'bg-gray-700 text-gray-400'
          }`}
          title={sound.enabled ? 'Sonido activado' : 'Sonido desactivado'}
        >
          {sound.enabled ? '🔊' : '🔇'}
        </button>

        {/* Refresh button */}
        {onRefresh && (
          <button
            onClick={onRefresh}
            className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
            title="Actualizar"
          >
            🔄
          </button>
        )}

        {/* Fullscreen toggle */}
        <button
          onClick={toggleFullscreen}
          className="p-2 bg-gray-700 text-white rounded-lg hover:bg-gray-600 transition-colors"
          title={isFullscreen ? 'Salir de pantalla completa' : 'Pantalla completa'}
        >
          {isFullscreen ? '⬜' : '⬛'}
        </button>

        {/* Logout button */}
        <button
          onClick={logout}
          className="px-4 py-2 bg-red-500/20 text-red-500 rounded-lg hover:bg-red-500/30 transition-colors"
        >
          Salir
        </button>
      </div>
    </header>
  );
}
