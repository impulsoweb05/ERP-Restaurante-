'use client';

import { useEffect } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { useAuthStore, useUIStore } from '@/store';
import { cn } from '@/lib/utils';
import Sidebar from './Sidebar';
import Header from './Header';
import { Toaster } from 'react-hot-toast';

export default function AdminLayout({ children }: { children: React.ReactNode }) {
  const router = useRouter();
  const pathname = usePathname();
  const { isAuthenticated } = useAuthStore();
  const { sidebarOpen, darkMode } = useUIStore();

  useEffect(() => {
    // Check if it's a public route
    const isPublicRoute = pathname?.startsWith('/auth');
    
    if (!isAuthenticated && !isPublicRoute) {
      router.push('/auth/login');
    }
  }, [isAuthenticated, pathname, router]);

  // Don't show layout on auth pages
  if (pathname?.startsWith('/auth')) {
    return (
      <div className={cn(darkMode && 'dark')}>
        <Toaster position="top-right" />
        {children}
      </div>
    );
  }

  return (
    <div className={cn(darkMode && 'dark')}>
      <Toaster position="top-right" />
      <Sidebar />
      <Header />
      <main
        className={cn(
          'min-h-screen bg-gray-50 dark:bg-secondary-950 pt-16 transition-all duration-300',
          sidebarOpen ? 'ml-64' : 'ml-20'
        )}
      >
        <div className="p-6">
          {children}
        </div>
      </main>
    </div>
  );
}
