'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RoleGate from '@/components/roles/RoleGate';
import { ActionBanner, OrderRow, QuickAction, SectionTitle, StatTile, rp, rpShort } from '@/components/roles/DashboardParts';
import type { EscrowOrder } from '@/components/escrow/EscrowOrdersPanel';
import { fetchData } from '@/lib/supabase/client';
import type { MeSummary } from '@/lib/supabase/useMe';
import type { UsersOverview } from '@/lib/admin-types';
import { ROLE_THEME } from '@/lib/roles';

const theme = ROLE_THEME.admin;

interface EscrowOverview { escrowHeld: number; feeIncome: number; feePercent: number; disputes: EscrowOrder[]; held: EscrowOrder[]; recent: EscrowOrder[] }

function AdminDashboard({ me }: { me: MeSummary }) {
  const [esc, setEsc] = useState<EscrowOverview | null>(null);
  const [usr, setUsr] = useState<UsersOverview | null>(null);
  const [failed, setFailed] = useState(false);

  useEffect(() => {
    Promise.all([fetchData<EscrowOverview>('/api/admin/escrow'), fetchData<UsersOverview>('/api/admin/users')]).then(([e, u]) => {
      setEsc(e); setUsr(u); setFailed(!e || !u);
    });
  }, []);

  const loading = !esc && !failed;
  const n = (v: number | undefined) => (v === undefined ? '–' : v);
  const topMitra = (usr?.users ?? []).filter((u) => u.role === 'seller').sort((a, b) => b.mitraRevenue - a.mitraRevenue).slice(0, 3);
  const activity = [...(esc?.held ?? []), ...(esc?.recent ?? [])]
    .sort((a, b) => +new Date(b.createdAt) - +new Date(a.createdAt))
    .slice(0, 5);

  return (
    <div className="space-y-4 pb-4">
      <section className={`rounded-2xl p-4 text-white shadow-card ${theme.hero}`} aria-label="Rekening escrow">
        <div className="flex items-center justify-between gap-3">
          <div className="min-w-0">
            <p className="text-xs text-white/70">Halo, {me.user.name.split(' ')[0]} · Panel Admin</p>
            <p className="mt-1 text-[0.6875rem] text-white/70">Dana customer yang sedang ditahan</p>
            <p className="text-2xl font-extrabold text-brand-yellow tabular-nums">{esc ? rp(esc.escrowHeld) : '–'}</p>
          </div>
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15" aria-hidden="true">
            <Icon name="ShieldCheckIcon" variant="solid" size={26} />
          </span>
        </div>
        <div className="mt-4 grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold tabular-nums">{n(esc?.held.length)}</p><p className="text-[0.625rem] text-white/70">Pesanan ditahan</p></div>
          <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold tabular-nums">{n(esc?.disputes.length)}</p><p className="text-[0.625rem] text-white/70">Sengketa</p></div>
          <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold tabular-nums">{esc ? rpShort(esc.feeIncome) : '–'}</p><p className="text-[0.625rem] text-white/70">Pendapatan fee</p></div>
        </div>
      </section>

      {failed && <p role="alert" className="rounded-2xl bg-white p-4 text-center text-xs text-slate-600 shadow-card">Sebagian data admin gagal dimuat. Coba muat ulang halaman.</p>}

      {esc && esc.disputes.length > 0 && (
        <ActionBanner href="/admin/escrow" icon="ScaleIcon" tone="rose"
          title={`${esc.disputes.length} sengketa menunggu keputusan`} text="Putuskan: lepas ke mitra atau kembalikan ke customer." />
      )}

      <section aria-label="Statistik platform" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="UserGroupIcon" label="Customer" value={n(usr?.counts.customer)} tone="bg-sky-50 text-sky-700" href="/admin/pengguna?peran=customer" />
        <StatTile icon="BuildingStorefrontIcon" label="Mitra" value={n(usr?.counts.mitra)} tone="bg-emerald-50 text-emerald-700" href="/admin/pengguna?peran=mitra" />
        <StatTile icon="ArrowPathIcon" label="Transaksi berjalan" value={n(usr?.orders.active)} hint={usr ? `${usr.orders.total} total pesanan` : undefined} tone="bg-amber-50 text-amber-700" href="/admin/escrow" />
        <StatTile icon="BanknotesIcon" label="Nilai transaksi selesai" value={usr ? rpShort(usr.orders.gmv) : '–'} hint={usr ? `${usr.orders.completed} pesanan` : undefined} tone={theme.tile} />
      </section>

      <section aria-label="Aksi cepat" className="grid grid-cols-4 gap-2">
        <QuickAction href="/admin/escrow" icon="ShieldCheckIcon" label="Escrow" tone={theme.tile} />
        <QuickAction href="/admin/escrow#sengketa" icon="ScaleIcon" label="Sengketa" tone={theme.tile} />
        <QuickAction href="/admin/pengguna" icon="UsersIcon" label="Pengguna" tone={theme.tile} />
        <QuickAction href="/notifikasi" icon="BellAlertIcon" label="Notifikasi" tone={theme.tile} />
      </section>

      <section aria-label="Aktivitas transaksi" className="space-y-2">
        <SectionTitle action={{ href: '/admin/escrow', label: 'Buku besar' }}>Aktivitas Transaksi</SectionTitle>
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
        ) : activity.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-xs text-slate-500 shadow-card">Belum ada transaksi.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {activity.map((o) => (
              <OrderRow key={o.id} href="/admin/escrow" title={o.title} status={o.status}
                sub={`${o.buyer?.name ?? 'Customer'} → ${o.mitra?.name ?? 'Mitra'}`} amount={o.total} />
            ))}
          </div>
        )}
      </section>

      {topMitra.length > 0 && (
        <section aria-label="Mitra teratas" className="space-y-2">
          <SectionTitle action={{ href: '/admin/pengguna?peran=mitra', label: 'Semua mitra' }}>Mitra Teratas</SectionTitle>
          <ol className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {topMitra.map((u, i) => (
              <li key={u.id} className="flex items-center gap-3 p-3">
                <span className="w-4 text-center text-xs font-bold text-slate-400">{i + 1}</span>
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-xl bg-emerald-50 text-lg" aria-hidden="true">{u.avatar}</span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-[0.8125rem] font-semibold text-slate-900">{u.name}</span>
                  <span className="block text-[0.6875rem] text-slate-500">{u.mitraOrders} pesanan · {u.city ?? '—'}</span>
                </span>
                <span className="text-[0.8125rem] font-bold text-slate-800 tabular-nums">{rpShort(u.mitraRevenue)}</span>
              </li>
            ))}
          </ol>
        </section>
      )}
    </div>
  );
}

export default function AdminHomePage() {
  return (
    <AppLayout title="Dasbor Admin">
      <RoleGate allow="admin">{(me) => <AdminDashboard me={me} />}</RoleGate>
    </AppLayout>
  );
}
