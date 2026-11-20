'use client';

import React from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import { rememberRole, rupiah, toAppRole, type MeSummary } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

/** Sign out everywhere: server cookie, cached role, legacy client flags. */
export async function signOut() {
  try { await fetch('/api/auth/logout', { method: 'POST' }); } catch { /* still sign out locally */ }
  rememberRole(null);
  try { sessionStorage.removeItem('klambi_auth'); localStorage.removeItem('klambi_user'); } catch { /* ignore */ }
}

interface MenuLink { href: string; icon: string; label: string; hint: string }

const MENU: Record<'mitra' | 'admin', MenuLink[]> = {
  mitra: [
    { href: '/mitra', icon: 'Squares2X2Icon', label: 'Dasbor Mitra', hint: 'Ringkasan penjualan & dana' },
    { href: '/mitra/pesanan', icon: 'ClipboardDocumentListIcon', label: 'Pesanan Masuk', hint: 'Proses, kirim, tandai tiba' },
    { href: '/jual', icon: 'PlusCircleIcon', label: 'Jual / Tambah Produk', hint: 'Unggah barang preloved atau upcycle' },
    { href: '/chat', icon: 'ChatBubbleLeftRightIcon', label: 'Chat Pembeli', hint: 'Balas pertanyaan customer' },
    { href: '/notifikasi', icon: 'BellAlertIcon', label: 'Notifikasi', hint: 'Pesanan & pencairan dana' },
    { href: '/trift-marketplace', icon: 'BuildingStorefrontIcon', label: 'Lihat Marketplace', hint: 'Tampilan toko dari sisi pembeli' },
  ],
  admin: [
    { href: '/admin', icon: 'ChartBarIcon', label: 'Dasbor Admin', hint: 'Ringkasan platform' },
    { href: '/admin/escrow', icon: 'ShieldCheckIcon', label: 'Rekening Escrow', hint: 'Dana ditahan, sengketa, buku besar' },
    { href: '/admin/pengguna', icon: 'UsersIcon', label: 'Kelola Pengguna', hint: 'Customer, mitra, admin' },
    { href: '/notifikasi', icon: 'BellAlertIcon', label: 'Notifikasi', hint: 'Aktivitas terbaru' },
  ],
};

/** "Akun" tab for mitra and admin — replaces the shopper profile (points, wardrobe, vouchers). */
export default function RoleAccount({ me }: { me: MeSummary }) {
  const router = useRouter();
  const role = toAppRole(me.user.role) as 'mitra' | 'admin';
  const theme = ROLE_THEME[role];

  return (
    <div className="space-y-4 pb-20 text-slate-800">
      <section className={`rounded-2xl p-4 text-white shadow-card ${theme.hero}`} aria-label="Identitas akun">
        <div className="flex items-center gap-3">
          <span className="flex h-14 w-14 flex-shrink-0 items-center justify-center rounded-2xl bg-white/15 text-2xl" aria-hidden="true">
            {me.user.avatar || '🙂'}
          </span>
          <div className="min-w-0">
            <p className="flex items-center gap-1.5 truncate text-base font-bold">
              {me.user.name}
              {me.user.isVerified && <Icon name="CheckBadgeIcon" variant="solid" size={18} className="flex-shrink-0 text-sky-300" aria-label="Terverifikasi" />}
            </p>
            <p className="truncate text-xs text-white/75">@{me.user.username}{me.user.city ? ` · ${me.user.city}` : ''}</p>
            <span className={`mt-1.5 inline-flex items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ring-1 ${theme.chip}`}>
              <Icon name={theme.icon} variant="solid" size={12} aria-hidden="true" />
              {theme.label}{me.user.level && me.user.level !== theme.label ? ` · ${me.user.level}` : ''}
            </span>
          </div>
        </div>

        {role === 'mitra' && me.wallet && (
          <div className="mt-4 grid grid-cols-2 gap-2">
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[0.6875rem] text-white/70">Saldo bisa ditarik</p>
              <p className="text-base font-extrabold">{rupiah(me.wallet.balance)}</p>
            </div>
            <div className="rounded-xl bg-white/10 p-3">
              <p className="text-[0.6875rem] text-white/70">Akan diterima</p>
              <p className="text-base font-extrabold text-brand-yellow">{rupiah(me.wallet.escrowHeld)}</p>
            </div>
          </div>
        )}
        {role === 'admin' && (
          <p className="mt-4 rounded-xl bg-white/10 p-3 text-xs leading-relaxed text-white/85">
            Akun admin memegang rekening escrow Klámbi: menahan dana customer, melepasnya ke mitra, dan memutuskan sengketa.
          </p>
        )}
      </section>

      <nav aria-label={`Menu ${theme.label}`} className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
        {MENU[role].map((m) => (
          <Link key={m.href} href={m.href} className="flex min-h-[60px] items-center gap-3 px-4 py-3 transition-colors hover:bg-slate-50 active:bg-slate-100">
            <span className={`flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl ${theme.tile}`}>
              <Icon name={m.icon} variant="solid" size={20} aria-hidden="true" />
            </span>
            <span className="min-w-0 flex-1">
              <span className="block text-sm font-semibold text-slate-900">{m.label}</span>
              <span className="block truncate text-xs text-slate-500">{m.hint}</span>
            </span>
            <Icon name="ChevronRightIcon" size={18} className="text-slate-400" aria-hidden="true" />
          </Link>
        ))}
      </nav>

      <dl className="space-y-2 rounded-2xl bg-white p-4 text-sm shadow-card">
        <div className="flex justify-between gap-3"><dt className="text-slate-500">Email</dt><dd className="truncate font-medium">{me.user.email || '—'}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate-500">Jenis akun</dt><dd className="font-medium">{theme.label}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate-500">Status</dt><dd className="font-medium">{me.user.isVerified ? 'Terverifikasi' : 'Belum diverifikasi'}</dd></div>
      </dl>

      <button
        onClick={async () => {
          await signOut();
          toast.success('Anda telah keluar.');
          router.push('/login');
        }}
        className="flex min-h-[48px] w-full items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-bold text-rose-600 hover:bg-rose-50 active:scale-[0.99]"
      >
        <Icon name="ArrowRightOnRectangleIcon" size={18} aria-hidden="true" />
        Keluar
      </button>
    </div>
  );
}
