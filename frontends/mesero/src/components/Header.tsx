'use client';

import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/stores/authStore';

export default function Header() {
  const router = useRouter();
  const { waiter, logout } = useAuthStore();

  const handleLogout = () => {
    logout();
    router.push('/auth/login');
  };

  return (
    <header className="bg-white shadow-sm sticky top-0 z-40">
      <div className="max-w-7xl mx-auto px-4 py-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-primary-100 rounded-full flex items-center justify-center">
              <span className="text-xl">👨‍🍳</span>
            </div>
            <div>
              <h1 className="font-bold text-gray-900">{waiter?.name || 'Mesero'}</h1>
              <p className="text-xs text-gray-500">{waiter?.code}</p>
            </div>
          </div>
          
          <div className="flex items-center gap-2">
            <button
              onClick={() => router.push('/dashboard')}
              className="p-2 hover:bg-gray-100 rounded-full transition-colors"
              title="Inicio"
            >
              🏠
            </button>
            <button
              onClick={handleLogout}
              className="p-2 hover:bg-red-50 text-red-500 rounded-full transition-colors"
              title="Cerrar sesión"
            >
              🚪
            </button>
          </div>
        </div>
      </div>
    </header>
  );
}
