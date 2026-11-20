'use client';

import React, { useEffect, useState } from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RoleGate from '@/components/roles/RoleGate';
import { ActionBanner, OrderRow, QuickAction, SectionTitle, StatTile, rp, rpShort } from '@/components/roles/DashboardParts';
import type { EscrowOrder } from '@/components/escrow/EscrowOrdersPanel';
import { fetchData } from '@/lib/supabase/client';
import { DATA_CHANGED_EVENT, type MeSummary } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

const theme = ROLE_THEME.mitra;

/** Home of a service mitra (laundry, penatu, permak, …): service orders, money held by admin, payouts. */
function MitraDashboard({ me }: { me: MeSummary }) {
  const [orders, setOrders] = useState<EscrowOrder[] | null>(null);

  useEffect(() => {
    const load = () => fetchData<EscrowOrder[]>('/api/escrow/orders?as=mitra').then((o) => setOrders(o ?? []));
    load();
    window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, []);

  const s = me.sales;
  const svc = me.service;
  const recent = (orders ?? []).filter((o) => o.status !== 'pending_payment').slice(0, 4);

  return (
    <div className="space-y-4 pb-4">
      {/* Kartu usaha mitra */}
      <section className={`rounded-2xl p-4 text-white shadow-card ${theme.hero}`} aria-label="Ringkasan usaha">
        <div className="flex items-center gap-3">
          <span className="flex h-12 w-12 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">
            {me.user.avatar || '🧺'}
          </span>
          <div className="min-w-0">
            <p className="text-xs text-white/70">Dasbor Mitra · {svc?.categoryLabel ?? 'Layanan'}</p>
            <p className="flex items-start gap-1.5 text-base font-bold leading-snug">
              {svc?.name ?? me.user.name}
              {me.user.isVerified && <Icon name="CheckBadgeIcon" variant="solid" size={18} className="flex-shrink-0 text-sky-300" aria-label="Terverifikasi" />}
            </p>
            <p className="truncate text-[0.6875rem] text-emerald-200">
              {svc ? `★ ${svc.rating.toLocaleString('id-ID')} · ${svc.reviewsCount} ulasan` : me.user.level}
              {svc && svc.name !== me.user.name ? ` · ${me.user.name}` : ''}
            </p>
          </div>
        </div>
        <div className="mt-4 grid grid-cols-2 gap-2">
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[0.6875rem] text-white/70">Saldo bisa ditarik</p>
            <p className="text-lg font-extrabold tabular-nums">{rp(me.wallet?.balance ?? 0)}</p>
          </div>
          <div className="rounded-xl bg-white/10 p-3">
            <p className="text-[0.6875rem] text-white/70">Ditahan admin · akan cair</p>
            <p className="text-lg font-extrabold text-brand-yellow tabular-nums">{rp(s.incoming)}</p>
          </div>
        </div>
        <p className="mt-3 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-white/80">
          <Icon name="ShieldCheckIcon" size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />
          Pembayaran pelanggan ditahan admin Klámbi dan baru masuk ke saldomu setelah layanan selesai dan pelanggan mengonfirmasi.
        </p>
      </section>

      {/* Perlu tindakan */}
      {s.disputed > 0 && (
        <ActionBanner href="/mitra/pesanan" icon="ExclamationTriangleIcon" tone="rose"
          title={`${s.disputed} pesanan dalam sengketa`} text="Admin sedang meninjau laporan pelanggan." />
      )}
      {s.toProcess > 0 && (
        <ActionBanner href="/mitra/pesanan" icon="InboxArrowDownIcon" tone="amber"
          title={`${s.toProcess} pesanan layanan baru`} text="Pelanggan sudah membayar. Mulai kerjakan sekarang." />
      )}

      {/* Angka layanan */}
      <section aria-label="Statistik layanan" className="grid grid-cols-2 gap-3 md:grid-cols-4">
        <StatTile icon="InboxArrowDownIcon" label="Perlu dikerjakan" value={s.toProcess} tone="bg-amber-50 text-amber-700" href="/mitra/pesanan" />
        <StatTile icon="WrenchScrewdriverIcon" label="Sedang dikerjakan" value={s.inProgress} tone="bg-sky-50 text-sky-700" href="/mitra/pesanan" />
        <StatTile icon="ClockIcon" label="Tunggu konfirmasi" value={s.waiting} hint="Cair otomatis 48 jam" tone="bg-violet-50 text-violet-700" href="/mitra/pesanan" />
        <StatTile icon="BanknotesIcon" label={`${s.completed} layanan selesai`} value={rpShort(s.earned)} hint="Total pendapatan" tone={theme.tile} />
      </section>

      {/* Aksi cepat */}
      <section aria-label="Aksi cepat" className="grid grid-cols-4 gap-2">
        <QuickAction href="/mitra/pesanan" icon="ClipboardDocumentListIcon" label="Pesanan" tone={theme.tile} />
        <QuickAction href="/mitra/layanan" icon="WrenchScrewdriverIcon" label="Layanan Saya" tone={theme.tile} />
        <QuickAction href="/chat" icon="ChatBubbleLeftRightIcon" label="Chat Pelanggan" tone={theme.tile} />
        <QuickAction href="/notifikasi" icon="BellAlertIcon" label="Notifikasi" tone={theme.tile} />
      </section>

      {/* Pesanan terbaru */}
      <section aria-label="Pesanan layanan terbaru" className="space-y-2">
        <SectionTitle action={{ href: '/mitra/pesanan', label: 'Semua pesanan' }}>Pesanan Layanan Terbaru</SectionTitle>
        {orders === null ? (
          <div className="h-32 animate-pulse rounded-2xl bg-white/70" />
        ) : recent.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-xs text-slate-500 shadow-card">Belum ada pesanan layanan.</p>
        ) : (
          <div className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {recent.map((o) => (
              <OrderRow key={o.id} href="/mitra/pesanan" title={o.title} status={o.status} kind={o.kind}
                sub={`${o.orderNumber} · ${o.buyer?.name ?? 'Pelanggan'}`} amount={o.mitraPayout} />
            ))}
          </div>
        )}
        <p className="px-1 text-[0.6875rem] text-slate-500">Nominal = yang kamu terima. Biaya platform dibayar pelanggan.</p>
      </section>

      {!svc && (
        <p className="rounded-2xl bg-white p-4 text-xs text-slate-600 shadow-card">
          Akun ini belum terhubung ke layanan mana pun. Hubungi admin Klámbi untuk mendaftarkan layananmu.{' '}
          <Link href="/chat" className="font-semibold text-emerald-700 underline">Chat admin</Link>
        </p>
      )}
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
