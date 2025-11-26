'use client';

import { useUIStore, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import { Menu, Bell, Moon, Sun, User } from 'lucide-react';

export default function Header() {
  const { sidebarOpen, darkMode, toggleDarkMode, toggleSidebar } = useUIStore();
  const { user } = useAuthStore();

  return (
    <header
      className={cn(
        'fixed right-0 top-0 z-30 h-16 bg-white dark:bg-secondary-900 border-b border-gray-200 dark:border-secondary-700 transition-all duration-300',
        sidebarOpen ? 'left-64' : 'left-20'
      )}
    >
      <div className="flex h-full items-center justify-between px-6">
        {/* Left side - Mobile menu & Title */}
        <div className="flex items-center gap-4">
          <button
            onClick={toggleSidebar}
            className="lg:hidden rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-secondary-800"
          >
            <Menu className="h-5 w-5" />
          </button>
          <h1 className="text-lg font-semibold text-gray-800 dark:text-white hidden sm:block">
            Panel de Administración
          </h1>
        </div>

        {/* Right side - Actions */}
        <div className="flex items-center gap-3">
          {/* Notifications */}
          <button className="relative rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-secondary-800">
            <Bell className="h-5 w-5 text-gray-600 dark:text-gray-300" />
            <span className="absolute right-1.5 top-1.5 h-2 w-2 rounded-full bg-red-500"></span>
          </button>

          {/* Dark mode toggle */}
          <button
            onClick={toggleDarkMode}
            className="rounded-lg p-2 hover:bg-gray-100 dark:hover:bg-secondary-800"
          >
            {darkMode ? (
              <Sun className="h-5 w-5 text-yellow-500" />
            ) : (
              <Moon className="h-5 w-5 text-gray-600" />
            )}
          </button>

          {/* User menu */}
          <div className="flex items-center gap-3 border-l border-gray-200 dark:border-secondary-700 pl-4">
            <div className="h-9 w-9 rounded-full bg-primary-500 flex items-center justify-center">
              <User className="h-5 w-5 text-white" />
            </div>
            <div className="hidden sm:block">
              <p className="text-sm font-medium text-gray-800 dark:text-white">
                {user?.name || 'Admin'}
              </p>
              <p className="text-xs text-gray-500 dark:text-gray-400">
                {user?.email || 'admin@restaurante.com'}
              </p>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
