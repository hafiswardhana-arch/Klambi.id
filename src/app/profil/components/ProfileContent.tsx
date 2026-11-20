'use client';

import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import EscrowOrdersPanel from '@/components/escrow/EscrowOrdersPanel';
import RoleShortcuts from '@/components/escrow/RoleShortcuts';
import type { OrderStatus } from '@/components/escrow/FundFlow';
import { initialsOf, rupiah, useMe } from '@/lib/supabase/useMe';
import LegacyProfileContent from './LegacyProfileContent';

type TabKey = 'all' | 'unpaid' | 'escrow' | 'shipping' | 'done' | 'disputed';

const TABS: { key: TabKey; label: string; statuses?: OrderStatus[]; empty: string }[] = [
  { key: 'all', label: 'Semua', empty: 'Belum ada pesanan. Mulai belanja di Marketplace.' },
  { key: 'unpaid', label: 'Belum Bayar', statuses: ['pending_payment'], empty: 'Tidak ada pesanan yang menunggu pembayaran.' },
  { key: 'escrow', label: 'Dana Ditahan', statuses: ['escrow_held'], empty: 'Tidak ada pesanan yang menunggu diproses mitra.' },
  { key: 'shipping', label: 'Dikirim', statuses: ['shipped', 'delivered'], empty: 'Tidak ada pesanan yang sedang dikirim.' },
  { key: 'done', label: 'Selesai', statuses: ['completed', 'refunded', 'cancelled'], empty: 'Belum ada pesanan selesai.' },
  { key: 'disputed', label: 'Sengketa', statuses: ['disputed'], empty: 'Tidak ada sengketa.' },
];

const MENU: { href: string; icon: string; label: string; hint: string }[] = [
  { href: '/rawat', icon: 'ClockIcon', label: 'Riwayat Scan & Lemari', hint: 'Hasil diagnosis Wearwise AI' },
  { href: '/jual', icon: 'TagIcon', label: 'Jual Pakaian', hint: 'Thrift & upcycle' },
  { href: '/dampak', icon: 'GlobeAsiaAustraliaIcon', label: 'Dampak Sirkular', hint: 'Kontribusi lingkungan Anda' },
  { href: '/chat', icon: 'ChatBubbleLeftRightIcon', label: 'Pesan & Bantuan', hint: 'Chat dengan penjual & CS' },
];

function Card({ children, className = '' }: { children: React.ReactNode; className?: string }) {
  return <section className={`rounded-xl border border-slate-200 bg-white ${className}`}>{children}</section>;
}

export default function ProfileContent() {
  const router = useRouter();
  const { me, status, reload } = useMe();
  const [tab, setTab] = useState<TabKey>('all');
  const [loggingOut, setLoggingOut] = useState(false);

  // Database belum dikonfigurasi → tampilan demo lama
  if (status === 'demo') return <LegacyProfileContent />;

  if (status === 'loading') {
    return (
      <div className="space-y-3" aria-busy="true" aria-label="Memuat profil">
        <div className="h-40 animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-32 animate-pulse rounded-xl bg-slate-200/60" />
        <div className="h-48 animate-pulse rounded-xl bg-slate-200/60" />
      </div>
    );
  }

  if (status === 'guest' || status === 'error' || !me) {
    const guest = status === 'guest';
    return (
      <Card className="px-6 py-12 text-center">
        <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <Icon name={guest ? 'UserCircleIcon' : 'ExclamationTriangleIcon'} size={28} aria-hidden="true" />
        </span>
        <h2 className="mt-4 text-base font-semibold text-slate-900">{guest ? 'Masuk untuk melihat profil' : 'Profil belum bisa dimuat'}</h2>
        <p className="mx-auto mt-1 max-w-xs text-sm text-slate-500">
          {guest
            ? 'Sesi login Anda belum tersimpan di akun. Silakan masuk agar pesanan, saldo, dan dana escrow tampil.'
            : 'Terjadi gangguan saat memuat data akun. Coba lagi beberapa saat.'}
        </p>
        <button
          onClick={() => (guest ? router.push('/login') : reload())}
          className="mt-5 min-h-[44px] cursor-pointer rounded-lg bg-navy px-6 text-sm font-semibold text-white transition-colors hover:bg-navy-deep focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-2"
        >
          {guest ? 'Masuk' : 'Coba Lagi'}
        </button>
      </Card>
    );
  }

  const { user, wallet, impact, orderCounts: oc } = me;
  const counts: Record<TabKey, number> = {
    all: oc.total, unpaid: oc.unpaid, escrow: oc.escrow, shipping: oc.shipping, done: oc.completed, disputed: oc.disputed,
  };
  const active = TABS.find((t) => t.key === tab)!;

  const handleLogout = async () => {
    setLoggingOut(true);
    try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* tetap keluar di sisi klien */ }
    try {
      sessionStorage.removeItem('klambi_auth');
      localStorage.removeItem('klambi_user');
    } catch { /* ignore */ }
    toast.success('Anda telah keluar.');
    router.push('/login');
  };

  return (
    <div className="space-y-4 pb-6 text-slate-800">
      {/* ── Identitas ───────────────────────────────────────────── */}
      <Card className="p-5">
        <div className="flex items-center gap-4">
          <span
            className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-full bg-navy text-lg font-semibold text-white"
            aria-hidden="true"
          >
            {initialsOf(user.name)}
          </span>
          <div className="min-w-0 flex-1">
            <div className="flex items-start gap-1.5">
              <h1 className="text-lg font-semibold leading-snug text-slate-900 break-words">{user.name}</h1>
              {user.isVerified && (
                <Icon name="CheckBadgeIcon" variant="solid" size={18} className="mt-1 flex-shrink-0 text-sky-600" aria-label="Akun terverifikasi" />
              )}
            </div>
            <p className="truncate text-sm text-slate-500">@{user.username}{user.city ? ` · ${user.city}` : ''}</p>
            {user.level && (
              <span className="mt-1.5 inline-block rounded-md bg-amber-50 px-2 py-0.5 text-xs font-semibold text-amber-800 ring-1 ring-inset ring-amber-200">
                {user.level}
              </span>
            )}
          </div>
        </div>

        <dl className="mt-5 grid grid-cols-3 divide-x divide-slate-200 rounded-lg bg-slate-50 py-3 text-center">
          <div>
            <dd className="text-base font-semibold tabular-nums text-slate-900">{oc.completed}</dd>
            <dt className="text-xs text-slate-500">Pesanan selesai</dt>
          </div>
          <div>
            <dd className="text-base font-semibold tabular-nums text-slate-900">{impact?.scanCount ?? 0}</dd>
            <dt className="text-xs text-slate-500">Scan AI</dt>
          </div>
          <div>
            <dd className="text-base font-semibold tabular-nums text-slate-900">{impact ? `${impact.kgSaved.toLocaleString('id-ID')} kg` : '–'}</dd>
            <dt className="text-xs text-slate-500">Tekstil diselamatkan</dt>
          </div>
        </dl>
      </Card>

      {/* ── Dompet ──────────────────────────────────────────────── */}
      <section className="rounded-xl bg-navy p-5 text-white" aria-label="Dompet">
        <p className="text-xs font-medium text-white/70">Saldo Klámbi</p>
        <p className="mt-0.5 text-2xl font-semibold tabular-nums tracking-tight">{rupiah(wallet?.balance ?? 0)}</p>

        <dl className="mt-4 grid grid-cols-3 gap-3 border-t border-white/15 pt-4">
          <div>
            <dt className="flex items-center gap-1 text-[0.6875rem] text-white/70">
              <Icon name="LockClosedIcon" size={12} aria-hidden="true" />
              {user.role === 'seller' ? 'Akan diterima' : 'Dana ditahan'}
            </dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{rupiah(wallet?.escrowHeld ?? 0)}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] text-white/70">Poin Eco</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{(wallet?.ecoPoints ?? 0).toLocaleString('id-ID')}</dd>
          </div>
          <div>
            <dt className="text-[0.6875rem] text-white/70">Voucher</dt>
            <dd className="mt-0.5 text-sm font-semibold tabular-nums">{wallet?.voucherCount ?? 0}</dd>
          </div>
        </dl>
        <p className="mt-4 flex items-start gap-1.5 text-[0.6875rem] leading-relaxed text-white/70">
          <Icon name="ShieldCheckIcon" size={14} className="mt-px flex-shrink-0" aria-hidden="true" />
          Pembayaran ditahan admin Klámbi dan baru dicairkan ke mitra setelah Anda menerima pesanan.
        </p>
      </section>

      <RoleShortcuts />

      {/* ── Pesanan ─────────────────────────────────────────────── */}
      <section aria-label="Pesanan saya" className="space-y-3">
        <h2 className="text-[0.9375rem] font-semibold text-slate-900">Pesanan Saya</h2>

        <div role="tablist" aria-label="Filter status pesanan" className="-mx-4 flex gap-2 overflow-x-auto px-4 pb-1 scrollbar-hide">
          {TABS.map((t) => {
            const selected = t.key === tab;
            const n = counts[t.key];
            return (
              <button
                key={t.key}
                role="tab"
                aria-selected={selected}
                onClick={() => setTab(t.key)}
                className={`flex min-h-[40px] flex-shrink-0 cursor-pointer items-center gap-1.5 rounded-full border px-3.5 text-[0.8125rem] font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1 ${
                  selected ? 'border-navy bg-navy text-white' : 'border-slate-300 bg-white text-slate-700 hover:bg-slate-50'
                }`}
              >
                {t.label}
                {n > 0 && (
                  <span className={`rounded-full px-1.5 text-[0.6875rem] font-semibold tabular-nums ${selected ? 'bg-white/20 text-white' : t.key === 'unpaid' || t.key === 'disputed' ? 'bg-rose-100 text-rose-700' : 'bg-slate-100 text-slate-600'}`}>
                    {n}
                  </span>
                )}
              </button>
            );
          })}
        </div>

        <EscrowOrdersPanel as="buyer" title={null} statuses={active.statuses} emptyText={active.empty} />
      </section>

      {/* ── Menu ────────────────────────────────────────────────── */}
      <Card>
        <ul className="divide-y divide-slate-100">
          {MENU.map((m) => (
            <li key={m.href}>
              <Link
                href={m.href}
                className="flex min-h-[56px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-inset focus-visible:ring-navy"
              >
                <span className="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                  <Icon name={m.icon} size={18} aria-hidden="true" />
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block text-sm font-medium text-slate-900">{m.label}</span>
                  <span className="block truncate text-xs text-slate-500">{m.hint}</span>
                </span>
                <Icon name="ChevronRightIcon" size={16} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
              </Link>
            </li>
          ))}
        </ul>
      </Card>

      <button
        onClick={handleLogout}
        disabled={loggingOut}
        className="flex min-h-[48px] w-full cursor-pointer items-center justify-center gap-2 rounded-xl border border-slate-200 bg-white text-sm font-semibold text-rose-700 transition-colors hover:bg-rose-50 disabled:opacity-60 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-rose-300"
      >
        <Icon name="ArrowRightOnRectangleIcon" size={18} aria-hidden="true" />
        {loggingOut ? 'Keluar…' : 'Keluar'}
      </button>
    </div>
  );
}
