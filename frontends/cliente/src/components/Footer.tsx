'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { cn } from '@/lib/utils';

const navItems = [
  { href: '/', icon: '🏠', label: 'Inicio' },
  { href: '/menu', icon: '🍕', label: 'Menú' },
  { href: '/reservations', icon: '🪑', label: 'Reservas' },
  { href: '/orders', icon: '📦', label: 'Pedidos' },
];

export default function Footer() {
  const pathname = usePathname();

  return (
    <footer className="fixed bottom-0 left-0 right-0 bg-white border-t border-gray-200 z-50 safe-area-bottom">
      <nav className="max-w-7xl mx-auto px-4">
        <ul className="flex justify-around items-center py-2">
          {navItems.map((item) => {
            const isActive = pathname === item.href;
            return (
              <li key={item.href}>
                <Link
                  href={item.href}
                  className={cn(
                    'flex flex-col items-center gap-1 px-4 py-2 rounded-lg transition-colors',
                    isActive
                      ? 'text-primary-500'
                      : 'text-gray-500 hover:text-primary-400'
                  )}
                >
                  <span className="text-xl">{item.icon}</span>
                  <span className="text-xs font-medium">{item.label}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </nav>
    </footer>
  );
}
