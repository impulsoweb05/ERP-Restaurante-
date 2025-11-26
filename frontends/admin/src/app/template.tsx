'use client';

import AdminLayout from '@/components/AdminLayout';

export default function Template({ children }: { children: React.ReactNode }) {
  return <AdminLayout>{children}</AdminLayout>;
}
