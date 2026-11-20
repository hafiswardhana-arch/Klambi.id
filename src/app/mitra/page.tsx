'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RoleGate from '@/components/roles/RoleGate';
import { ActionBanner, OrderRow, QuickAction, SectionTitle, StatTile, rp, rpShort } from '@/components/roles/DashboardParts';
import type { EscrowOrder } from '@/components/escrow/EscrowOrdersPanel';
import { fetchData } from '@/lib/supabase/client';
import { DATA_CHANGED_EVENT, type MeSummary } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

const theme = ROLE_THEME.mitra;

function MitraDashboard({ me }: { me: MeSummary }) {
  const [orders, setOrders] = useState<EscrowOrder[] | null>(null);

  useEffect(() => {
    const load = () => fetchData<EscrowOrder[]>('/api/escrow/orders?as=mitra').then((o) => setOrders(o ?? []));
    load();
    window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, []);

  const s = useMemo(() => {
    const list = orders ?? [];
    const by = (st: string) => list.filter((o) => o.status === st);
    const done = by('completed');
    return {
      toShip: by('escrow_held').length,
      shipping: by('shipped').length,
      waiting: by('delivered').length,
      disputed: by('disputed').length,
      done: done.length,
      revenue: done.reduce((t, o) => t + o.mitraPayout, 0),
      recent: list.filter((o) => o.status !== 'pending_payment').slice(0, 4),
    };
  }, [orders]);

  const loading = orders === null;
  const n = (v: number) => (loading ? '–' : v);

  return (
    <div className="space-y-4 pb-4">
      {/* Kartu toko */}
      <section className={`rounded-2xl p-4 text-white shadow-card ${theme.hero}`} aria-label="Ringkasan toko">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">
            {me.user.avatar || '🏪'}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-white/70">Dasbor Mitra</p>
            <p className="flex items-center gap-1.5 truncate text-base font-bold">
              {me.user.name}
              {me.user.isVerified && <Icon name="CheckBadgeIcon" variant="solid" size={18} className="flex-shrink-0 text-sky-300" aria-label="Terverifikasi" />}
            </p>
            {me.user.level && <p className="text-[0.6875rem] text-emerald-200">{me.user.level}{me.user.city ? ` · ${me.user.city}` : ''}</p>}
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[0.6875rem] text-white/70">Saldo bisa ditarik</p>
            <p className="text-lg font-extrabold tabular-nums">{rp(me.wallet?.balance ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[0.6875rem] text-white/70">Ditahan admin · akan diterima</p>
            <p className="text-lg font-extrabold text-brand-yellow tabular-nums">{rp(me.wallet?.escrowHeld ?? 0)}</p>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-white/80">
          <Icon name="ShieldCheckIcon" size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Dana customer ditahan admin dan masuk ke saldomu setelah customer mengonfirmasi barang/jasa diterima.
        </p>
      </section>

      {/* Perlu tindakan */}
      {!loading && s.disputed > 0 && (
        <ActionBanner href="/mitra/pesanan" icon="ExclamationTriangleIcon" tone="rose"
          title={`${s.disputed} pesanan dalam sengketa`} text="Admin sedang meninjau. Lihat laporan customer." />
      )}
      {!loading && s.toShip > 0 && (
        <ActionBanner href="/mitra/pesanan" icon="TruckIcon" tone="amber"
          title={`${s.toShip} pesanan perlu diproses`} text="Customer sudah membayar. Kirim atau kerjakan sekarang." />
      )}

      {/* Angka penjualan */}
      <section aria-label="Statistik penjualan" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="InboxArrowDownIcon" label="Perlu diproses" value={n(s.toShip)} tone="bg-amber-50 text-amber-700" href="/mitra/pesanan" />
        <StatTile icon="TruckIcon" label="Dalam pengiriman" value={n(s.shipping)} tone="bg-sky-50 text-sky-700" href="/mitra/pesanan" />
        <StatTile icon="ClockIcon" label="Tunggu konfirmasi" value={n(s.waiting)} hint="Cair otomatis 48 jam" tone="bg-violet-50 text-violet-700" href="/mitra/pesanan" />
        <StatTile icon="BanknotesIcon" label={`${loading ? '' : s.done + ' '}pesanan selesai`} value={loading ? '–' : rpShort(s.revenue)} hint="Total pendapatan" tone={theme.tile} />
      </section>

      {/* Aksi cepat */}
      <section aria-label="Aksi cepat" className="grid grid-cols-4 gap-2">
        <QuickAction href="/jual" icon="PlusCircleIcon" label="Tambah Produk" tone={theme.tile} />
        <QuickAction href="/mitra/pesanan" icon="ClipboardDocumentListIcon" label="Pesanan" tone={theme.tile} />
        <QuickAction href="/chat" icon="ChatBubbleLeftRightIcon" label="Chat Pembeli" tone={theme.tile} />
        <QuickAction href="/trift-marketplace" icon="BuildingStorefrontIcon" label="Lihat Toko" tone={theme.tile} />
      </section>

      {/* Pesanan terbaru */}
      <section aria-label="Pesanan terbaru" className="space-y-2">
        <SectionTitle action={{ href: '/mitra/pesanan', label: 'Semua pesanan' }}>Pesanan Terbaru</SectionTitle>
        {loading ? (
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
        ) : s.recent.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-xs text-slate-500 shadow-card">Belum ada pesanan masuk.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {s.recent.map((o) => (
              <OrderRow key={o.id} href="/mitra/pesanan" title={o.title} status={o.status}
                sub={`${o.orderNumber} · dari ${o.buyer?.name ?? 'Customer'}`} amount={o.mitraPayout} />
            ))}
          </div>
        )}
        <p className="px-1 text-[0.6875rem] text-slate-500">Nominal = yang kamu terima (harga + ongkir). Biaya platform dibayar customer.</p>
      </section>
    </div>
  );
}

export default function MitraHomePage() {
  return (
    <AppLayout title="Dasbor Mitra">
      <RoleGate allow="mitra">{(me) => <MitraDashboard me={me} />}</RoleGate>
    </AppLayout>
  );
}
