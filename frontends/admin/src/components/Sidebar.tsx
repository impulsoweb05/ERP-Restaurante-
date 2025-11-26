'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useUIStore, useAuthStore } from '@/store';
import { cn } from '@/lib/utils';
import {
  LayoutDashboard,
  Package,
  FolderTree,
  ShoppingCart,
  SquareStack,
  CalendarCheck,
  Users,
  ChefHat,
  UtensilsCrossed,
  Clock,
  Bell,
  Settings,
  LogOut,
  ChevronLeft,
  ChevronRight,
} from 'lucide-react';

const menuItems = [
  { href: '/dashboard', icon: LayoutDashboard, label: 'Dashboard' },
  { href: '/products', icon: Package, label: 'Productos' },
  { href: '/categories', icon: FolderTree, label: 'Categorías' },
  { href: '/orders', icon: ShoppingCart, label: 'Pedidos' },
  { href: '/tables', icon: SquareStack, label: 'Mesas' },
  { href: '/reservations', icon: CalendarCheck, label: 'Reservas' },
  { href: '/customers', icon: Users, label: 'Clientes' },
  { href: '/staff', icon: ChefHat, label: 'Personal' },
  { href: '/kitchen', icon: UtensilsCrossed, label: 'Cocina' },
  { href: '/schedule', icon: Clock, label: 'Horarios' },
  { href: '/notifications', icon: Bell, label: 'Notificaciones' },
  { href: '/settings', icon: Settings, label: 'Configuración' },
];

export default function Sidebar() {
  const pathname = usePathname();
  const { sidebarOpen, toggleSidebar } = useUIStore();
  const { logout } = useAuthStore();

  return (
    <aside
      className={cn(
        'fixed left-0 top-0 z-40 h-screen bg-secondary-800 text-white transition-all duration-300',
        sidebarOpen ? 'w-64' : 'w-20'
      )}
    >
      {/* Logo */}
      <div className="flex h-16 items-center justify-between border-b border-secondary-700 px-4">
        {sidebarOpen && (
          <Link href="/dashboard" className="flex items-center gap-2">
            <span className="text-2xl">🍽️</span>
            <span className="font-bold text-lg">Admin</span>
          </Link>
        )}
        <button
          onClick={toggleSidebar}
          className="rounded-lg p-2 hover:bg-secondary-700 transition-colors"
        >
          {sidebarOpen ? (
            <ChevronLeft className="h-5 w-5" />
          ) : (
            <ChevronRight className="h-5 w-5" />
          )}
        </button>
      </div>

      {/* Navigation */}
      <nav className="mt-4 space-y-1 px-2">
        {menuItems.map((item) => {
          const isActive = pathname === item.href;
          return (
            <Link
              key={item.href}
              href={item.href}
              className={cn(
                'flex items-center gap-3 rounded-lg px-3 py-2.5 transition-all duration-200',
                isActive
                  ? 'bg-primary-500 text-white'
                  : 'text-secondary-300 hover:bg-secondary-700 hover:text-white'
              )}
            >
              <item.icon className="h-5 w-5 flex-shrink-0" />
              {sidebarOpen && <span className="truncate">{item.label}</span>}
            </Link>
          );
        })}
      </nav>

      {/* Logout */}
      <div className="absolute bottom-4 left-0 right-0 px-2">
        <button
          onClick={logout}
          className="flex w-full items-center gap-3 rounded-lg px-3 py-2.5 text-secondary-300 hover:bg-secondary-700 hover:text-white transition-all duration-200"
        >
          <LogOut className="h-5 w-5 flex-shrink-0" />
          {sidebarOpen && <span>Cerrar Sesión</span>}
        </button>
      </div>
    </aside>
  );
}
