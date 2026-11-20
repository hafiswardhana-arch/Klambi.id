'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { useMe, toAppRole, type AppRole, type MeSummary } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

interface RoleGateProps {
  allow: AppRole;
  children: (me: MeSummary) => React.ReactNode;
}

/**
 * Renders its children only for the given account type. Others get a clear explanation
 * instead of an empty or broken page (the API also enforces this on the server).
 */
export default function RoleGate({ allow, children }: RoleGateProps) {
  const { me, status } = useMe();
  const theme = ROLE_THEME[allow];

  if (status === 'loading' && !me) {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Memuat">
        <div className="h-36 animate-pulse rounded-2xl bg-white/70" />
        <div className="grid grid-cols-2 gap-3">
          <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
          <div className="h-20 animate-pulse rounded-2xl bg-white/70" />
        </div>
      </div>
    );
  }

  if (me && toAppRole(me.user.role) === allow) return <>{children(me)}</>;

  const reason =
    status === 'demo'
      ? 'Database belum tersambung, jadi akun mitra dan admin belum bisa dipakai. Aplikasi sedang memakai data demo.'
      : status === 'guest' || !me
        ? `Halaman ini khusus akun ${theme.label}. Masuk dengan akun ${theme.label.toLowerCase()} untuk melanjutkan.`
        : `Kamu masuk sebagai ${ROLE_THEME[toAppRole(me.user.role)].label}. Halaman ini khusus akun ${theme.label}.`;

  return (
    <div role="alert" className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-card">
      <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.tile}`}>
        <Icon name={theme.icon} variant="solid" size={24} aria-hidden="true" />
      </span>
      <p className="text-sm leading-relaxed text-slate-600">{reason}</p>
      <div className="flex w-full gap-2">
        <Link href="/" className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl border border-slate-200 text-[0.8125rem] font-semibold text-slate-700">
          Ke Beranda
        </Link>
        {status !== 'demo' && (
          <Link href="/login" className="flex min-h-[44px] flex-1 items-center justify-center rounded-xl bg-navy text-[0.8125rem] font-semibold text-white">
            {me ? 'Ganti Akun' : 'Masuk'}
          </Link>
        )}
      </div>
    </div>
  );
}
