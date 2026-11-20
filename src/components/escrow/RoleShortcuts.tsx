'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { fetchData } from '@/lib/supabase/client';

/** Shortcut card for mitra (incoming orders) and admin (escrow holder). Renders nothing for regular customers. */
export default function RoleShortcuts() {
  const [role, setRole] = useState<string | null>(null);

  useEffect(() => {
    fetchData<{ user: { role: string } }>('/api/me/summary').then((s) => setRole(s?.user.role ?? null));
  }, []);

  if (role !== 'seller' && role !== 'admin') return null;
  const isAdmin = role === 'admin';

  return (
    <Link
      href={isAdmin ? '/admin/escrow' : '/mitra/pesanan'}
      className="flex min-h-[56px] items-center justify-between gap-3 rounded-2xl bg-navy p-4 text-white shadow-card transition active:scale-[0.99] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-brand-yellow"
    >
      <span className="flex items-center gap-3">
        <span className="flex h-10 w-10 items-center justify-center rounded-xl bg-white/10">
          <Icon name={isAdmin ? 'ShieldCheckIcon' : 'BuildingStorefrontIcon'} variant="solid" size={22} aria-hidden="true" />
        </span>
        <span>
          <span className="block text-sm font-bold">{isAdmin ? 'Panel Escrow Admin' : 'Pesanan Masuk Mitra'}</span>
          <span className="block text-[0.6875rem] text-white/75">
            {isAdmin ? 'Pantau dana yang ditahan & putuskan sengketa' : 'Proses pesanan & lihat dana yang akan diterima'}
          </span>
        </span>
      </span>
      <Icon name="ChevronRightIcon" size={18} aria-hidden="true" />
    </Link>
  );
}
