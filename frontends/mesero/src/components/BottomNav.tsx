'use client';

import Link from 'next/link';
import { useOrderStore } from '@/stores/orderStore';

type NavItem = 'dashboard' | 'tables' | 'orders';

interface BottomNavProps {
  active: NavItem;
}

export default function BottomNav({ active }: BottomNavProps) {
  const { activeOrders } = useOrderStore();
  const readyCount = activeOrders.filter(o => o.status === 'ready').length;

  const navItems = [
    { id: 'dashboard' as NavItem, label: 'Inicio', icon: '🏠', href: '/dashboard' },
    { id: 'tables' as NavItem, label: 'Mesas', icon: '🪑', href: '/tables' },
    { id: 'orders' as NavItem, label: 'Pedidos', icon: '📋', href: '/my-orders', badge: readyCount },
  ];

  return (
    <nav className="fixed bottom-0 left-0 right-0 bg-white border-t shadow-lg safe-area-bottom z-50">
      <div className="max-w-7xl mx-auto px-4">
        <div className="flex items-center justify-around py-2">
          {navItems.map((item) => (
            <Link
              key={item.id}
              href={item.href}
              className={`flex flex-col items-center py-2 px-4 rounded-xl transition-colors relative ${
                active === item.id
                  ? 'text-primary-500 bg-primary-50'
                  : 'text-gray-500 hover:text-gray-700'
              }`}
            >
              <span className="text-2xl">{item.icon}</span>
              <span className="text-xs font-medium mt-1">{item.label}</span>
              {item.badge !== undefined && item.badge > 0 && (
                <span className="absolute -top-1 -right-1 w-5 h-5 bg-red-500 text-white text-xs font-bold rounded-full flex items-center justify-center animate-pulse">
                  {item.badge}
                </span>
              )}
            </Link>
          ))}
        </div>
      </div>
    </nav>
  );
}
