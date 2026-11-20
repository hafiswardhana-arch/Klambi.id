'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import ConfirmOrderModal, { PendingOrder } from '@/app/profil/components/ConfirmOrderModal';
import { DATA_CHANGED_EVENT, notifyDataChanged } from '@/lib/supabase/useMe';
import FundFlow, { OrderStatus, STATUS_LABEL, STATUS_TONE } from './FundFlow';

export interface EscrowOrder {
  id: string;
  orderNumber: string;
  title: string;
  kind: 'trift' | 'produk' | 'jasa';
  status: OrderStatus;
  sellerName: string | null;
  buyer?: { username: string; name: string };
  mitra?: { username: string; name: string };
  subtotal: number;
  shippingCost: number;
  total: number;
  platformFee: number;
  mitraPayout: number;
  trackingNumber: string | null;
  paymentMethod: string | null;
  createdAt: string;
  autoReleaseAt: string | null;
  disputeReason: string | null;
  rating?: number | null;
  events: { from: string | null; to: string; role: string; note: string | null; at: string }[];
}

const rp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
const when = (iso: string) =>
  new Date(iso).toLocaleString('id-ID', { day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit' });
const ROLE_LABEL: Record<string, string> = { buyer: 'Customer', mitra: 'Mitra', admin: 'Admin Klámbi', system: 'Sistem' };

function hoursLeft(iso: string | null): string | null {
  if (!iso) return null;
  const ms = new Date(iso).getTime() - Date.now();
  if (ms <= 0) return 'segera';
  const h = Math.floor(ms / 3_600_000);
  return h >= 1 ? `${h} jam lagi` : `${Math.max(1, Math.round(ms / 60_000))} menit lagi`;
}

/** POST an escrow action. Returns true on success (toast shown on failure). */
export async function escrowAction(orderId: string, action: string, body: Record<string, unknown> = {}) {
  try {
    const res = await fetch(`/api/escrow/orders/${orderId}/${action}`, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    });
    const json = await res.json().catch(() => null);
    if (!res.ok || !json?.success) {
      toast.error(json?.error || 'Aksi gagal diproses.');
      return false;
    }
    return true;
  } catch {
    toast.error('Tidak dapat terhubung ke server.');
    return false;
  }
}

// Langkah ringkas yang dilihat customer/mitra
const STEPS = ['Dibayar', 'Diproses', 'Tiba', 'Selesai'];
const STEP_INDEX: Partial<Record<OrderStatus, number>> = { escrow_held: 0, shipped: 1, delivered: 2, completed: 3 };

function Progress({ status }: { status: OrderStatus }) {
  if (status === 'disputed') {
    return <p className="flex items-center gap-1.5 text-xs font-medium text-rose-700"><Icon name="ExclamationTriangleIcon" size={14} aria-hidden="true" />Dalam peninjauan admin</p>;
  }
  const idx = STEP_INDEX[status];
  if (idx === undefined) return null;
  return (
    <ol className="grid grid-cols-4 gap-1.5" aria-label="Tahapan pesanan">
      {STEPS.map((s, i) => (
        <li key={s} aria-current={i === idx ? 'step' : undefined}>
          <span className={`block h-1 rounded-full ${i <= idx ? 'bg-navy' : 'bg-slate-200'}`} />
          <span className={`mt-1 block text-[0.6875rem] ${i === idx ? 'font-semibold text-navy' : i < idx ? 'text-slate-600' : 'text-slate-400'}`}>{s}</span>
        </li>
      ))}
    </ol>
  );
}

interface Props {
  /** buyer = pesanan saya; mitra = pesanan masuk ke toko/jasa kita */
  as: 'buyer' | 'mitra';
  /** Hide the whole panel when there is nothing to show. */
  hideWhenEmpty?: boolean;
  /** Only show orders still in progress (hide completed / refunded / cancelled). */
  onlyActive?: boolean;
  /** Only show these statuses (used by the Profil tabs). */
  statuses?: OrderStatus[];
  /** Heading. Pass null to hide it (the parent renders its own). */
  title?: string | null;
  emptyText?: string;
  onChanged?: () => void;
}

export default function EscrowOrdersPanel({
  as,
  hideWhenEmpty = false,
  onlyActive = false,
  statuses,
  title,
  emptyText,
  onChanged,
}: Props) {
  const [orders, setOrders] = useState<EscrowOrder[] | null>(null);
  const [unavailable, setUnavailable] = useState(false);
  const [busyId, setBusyId] = useState<string | null>(null);
  const [openId, setOpenId] = useState<string | null>(null);
  const [confirming, setConfirming] = useState<EscrowOrder | null>(null);
  const [disputing, setDisputing] = useState<EscrowOrder | null>(null);
  const [reason, setReason] = useState('');

  const load = useCallback(async () => {
    try {
      const res = await fetch(`/api/escrow/orders?as=${as}`, { cache: 'no-store' });
      if (!res.ok) { setUnavailable(true); return; }
      const json = await res.json();
      setUnavailable(false);
      setOrders(json.data as EscrowOrder[]);
    } catch {
      setUnavailable(true);
    }
  }, [as]);

  useEffect(() => {
    load();
    window.addEventListener(DATA_CHANGED_EVENT, load);
    return () => window.removeEventListener(DATA_CHANGED_EVENT, load);
  }, [load]);

  const run = async (o: EscrowOrder, action: string, body: Record<string, unknown> = {}, okMsg?: string) => {
    setBusyId(o.id);
    const ok = await escrowAction(o.id, action, body);
    setBusyId(null);
    if (ok) {
      if (okMsg) toast.success(okMsg);
      notifyDataChanged(); // memuat ulang panel ini, Beranda, dan angka-angka Profil
      onChanged?.();
    }
    return ok;
  };

  if (unavailable) return null; // belum login / database belum dikonfigurasi
  if (orders === null) return <div className="h-28 animate-pulse rounded-xl bg-slate-200/60" aria-label="Memuat pesanan" />;

  const isActive = (o: EscrowOrder) => !(['completed', 'refunded', 'cancelled'] as OrderStatus[]).includes(o.status);
  let list = orders;
  if (onlyActive) list = list.filter(isActive);
  if (statuses) list = list.filter((o) => statuses.includes(o.status));
  if (list.length === 0 && hideWhenEmpty) return null;

  const btn = 'min-h-[44px] cursor-pointer rounded-lg px-4 text-[0.8125rem] font-semibold transition-colors active:scale-[0.98] disabled:cursor-not-allowed disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1';
  const primary = `${btn} bg-navy text-white hover:bg-navy-deep`;
  const ghost = `${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
  const danger = `${btn} border border-rose-200 bg-white text-rose-700 hover:bg-rose-50`;

  const heading = title === undefined ? (as === 'buyer' ? 'Pesanan' : 'Pesanan Masuk') : title;

  return (
    <section aria-label={heading || 'Daftar pesanan'} className="space-y-3">
      {heading && (
        <h2 className="text-[0.9375rem] font-semibold text-slate-900">
          {heading} <span className="ml-1 text-sm font-normal text-slate-500">({list.length})</span>
        </h2>
      )}

      {list.length === 0 && (
        <div className="rounded-xl border border-dashed border-slate-300 bg-white px-4 py-8 text-center">
          <Icon name="InboxIcon" size={28} className="mx-auto text-slate-300" aria-hidden="true" />
          <p className="mt-2 text-sm text-slate-500">{emptyText || (as === 'buyer' ? 'Belum ada pesanan.' : 'Belum ada pesanan masuk.')}</p>
        </div>
      )}

      {list.map((o) => {
        const busy = busyId === o.id;
        const open = openId === o.id;
        const countdown = o.status === 'delivered' ? hoursLeft(o.autoReleaseAt) : null;
        return (
          <article key={o.id} className="space-y-3 rounded-xl border border-slate-200 bg-white p-4">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-semibold text-slate-900">{o.title}</p>
                <p className="mt-0.5 truncate text-xs text-slate-500">
                  {o.orderNumber} · {as === 'buyer' ? o.mitra?.name || o.sellerName : `Dari ${o.buyer?.name}`}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-bold tabular-nums text-navy">{rp(o.total)}</p>
                {as === 'mitra' && <p className="text-[0.6875rem] text-slate-500">Anda terima {rp(o.mitraPayout)}</p>}
              </div>
            </header>

            <div className="flex items-center justify-between gap-2">
              <span className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[0.6875rem] font-semibold ${STATUS_TONE[o.status]}`}>
                {STATUS_LABEL[o.status]}
              </span>
              <span className="text-[0.6875rem] text-slate-400">{when(o.createdAt)}</span>
            </div>

            <Progress status={o.status} />

            {o.status === 'disputed' && o.disputeReason && (
              <p className="rounded-lg bg-rose-50 px-3 py-2 text-xs leading-relaxed text-rose-800">
                <b>Laporan:</b> {o.disputeReason}. Dana tetap aman di rekening escrow sampai admin memutuskan.
              </p>
            )}
            {o.status === 'pending_payment' && as === 'buyer' && (
              <p className="rounded-lg bg-amber-50 px-3 py-2 text-xs text-amber-900">Selesaikan pembayaran agar pesanan diteruskan ke mitra.</p>
            )}
            {o.status === 'escrow_held' && (
              <p className="rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-600">
                {as === 'buyer' ? 'Dana aman di rekening escrow Klámbi. Menunggu mitra memproses pesananmu.' : 'Dana customer sudah ditahan admin. Silakan proses pesanan.'}
              </p>
            )}
            {countdown && (
              <p className="rounded-lg bg-emerald-50 px-3 py-2 text-xs leading-relaxed text-emerald-900">
                {as === 'buyer'
                  ? <>Periksa barangmu. Tanpa konfirmasi/laporan, dana otomatis dicairkan ke mitra <b>{countdown}</b>.</>
                  : <>Menunggu konfirmasi customer. Otomatis cair <b>{countdown}</b> bila tidak ada laporan.</>}
              </p>
            )}
            {o.trackingNumber && ['shipped', 'delivered', 'completed'].includes(o.status) && (
              <p className="text-xs text-slate-500">No. resi <span className="font-mono font-semibold text-slate-700">{o.trackingNumber}</span></p>
            )}

            <div className="flex flex-wrap gap-2">
              {as === 'buyer' && o.status === 'pending_payment' && (
                <>
                  <button disabled={busy} onClick={() => run(o, 'pay', {}, 'Pembayaran diterima. Dana ditahan admin Klámbi.')} className={primary}>
                    {busy ? 'Memproses…' : `Bayar ${rp(o.total)}`}
                  </button>
                  <button disabled={busy} onClick={() => run(o, 'cancel', {}, 'Pesanan dibatalkan.')} className={ghost}>Batalkan</button>
                </>
              )}
              {as === 'buyer' && (o.status === 'shipped' || o.status === 'delivered') && (
                <>
                  <button disabled={busy} onClick={() => setConfirming(o)} className={primary}>Konfirmasi Diterima</button>
                  <button disabled={busy} onClick={() => { setReason(''); setDisputing(o); }} className={danger}>Laporkan Masalah</button>
                </>
              )}
              {as === 'mitra' && o.status === 'escrow_held' && (
                <>
                  <button disabled={busy} onClick={() => run(o, 'ship', {}, 'Pesanan diproses. Dana tetap ditahan sampai customer menerima.')} className={primary}>
                    {busy ? 'Memproses…' : 'Proses & Kirim'}
                  </button>
                  <button
                    disabled={busy}
                    onClick={() => { if (window.confirm('Tolak pesanan ini? Dana akan dikembalikan 100% ke customer.')) run(o, 'decline', {}, 'Pesanan ditolak. Dana dikembalikan ke customer.'); }}
                    className={danger}
                  >
                    Tolak
                  </button>
                </>
              )}
              {as === 'mitra' && o.status === 'shipped' && (
                <>
                  <button disabled={busy} onClick={() => run(o, 'deliver', {}, 'Ditandai tiba. Menunggu konfirmasi customer.')} className={primary}>Tandai Sudah Tiba</button>
                  <button disabled={busy} onClick={() => { setReason(''); setDisputing(o); }} className={danger}>Laporkan Masalah</button>
                </>
              )}
              <button onClick={() => setOpenId(open ? null : o.id)} className={ghost} aria-expanded={open}>
                {open ? 'Tutup Detail' : 'Detail'}
              </button>
            </div>

            {open && (
              <div className="space-y-4 border-t border-slate-100 pt-4">
                <FundFlow status={o.status} neutral={as === 'mitra'} />
                <dl className="grid grid-cols-[1fr_auto] gap-x-4 gap-y-1 rounded-lg bg-slate-50 p-3 text-xs">
                  <dt className="text-slate-500">Harga</dt><dd className="text-right tabular-nums">{rp(o.subtotal)}</dd>
                  {o.shippingCost > 0 && (<><dt className="text-slate-500">Ongkir</dt><dd className="text-right tabular-nums">{rp(o.shippingCost)}</dd></>)}
                  <dt className="text-slate-500">Biaya platform & proteksi</dt><dd className="text-right tabular-nums">{rp(o.platformFee)}</dd>
                  <dt className="font-semibold text-slate-800">Total dibayar</dt><dd className="text-right font-semibold tabular-nums">{rp(o.total)}</dd>
                  {o.paymentMethod && (<><dt className="text-slate-500">Metode</dt><dd className="text-right">{o.paymentMethod}</dd></>)}
                </dl>
                <ol className="space-y-2.5" aria-label="Riwayat status">
                  {o.events.map((e, i) => (
                    <li key={i} className="flex gap-2.5 text-xs">
                      <span className="mt-1 h-2 w-2 flex-shrink-0 rounded-full bg-navy" aria-hidden="true" />
                      <div>
                        <p className="font-medium text-slate-800">
                          {STATUS_LABEL[e.to as OrderStatus] || e.to} <span className="font-normal text-slate-500">· {ROLE_LABEL[e.role] || e.role}</span>
                        </p>
                        {e.note && <p className="text-slate-600">{e.note}</p>}
                        <p className="text-[0.6875rem] text-slate-400">{when(e.at)}</p>
                      </div>
                    </li>
                  ))}
                </ol>
              </div>
            )}
          </article>
        );
      })}

      {/* Konfirmasi penerimaan = melepas dana ke mitra (tidak bisa dibatalkan) */}
      {confirming && (
        <ConfirmOrderModal
          order={{
            id: confirming.id,
            orderNumber: confirming.orderNumber,
            module: confirming.kind === 'jasa' ? 'perawatan' : 'trift',
            moduleLabel: confirming.kind === 'jasa' ? 'Jasa Perawatan' : confirming.kind === 'produk' ? 'Produk' : 'Thrift',
            title: confirming.title,
            partnerOrSeller: confirming.mitra?.name || confirming.sellerName || 'Mitra',
            amount: confirming.total,
            trackingNumber: confirming.trackingNumber || undefined,
          } satisfies PendingOrder}
          onClose={() => setConfirming(null)}
          onConfirm={async (id, rating, review) => {
            const target = confirming;
            setConfirming(null);
            await run(target, 'confirm', { rating, review }, 'Terima kasih! Dana sudah dicairkan admin ke mitra.');
          }}
        />
      )}

      <Modal isOpen={!!disputing} onClose={() => setDisputing(null)} title="Laporkan Masalah" size="md">
        <div className="space-y-3 text-sm">
          <p className="text-xs leading-relaxed text-slate-600">
            Dana <b>tidak akan dicairkan</b> ke mitra selama laporan ditinjau. Admin Klámbi memutuskan: dana dilepas ke mitra atau dikembalikan ke customer.
          </p>
          <label className="block text-xs font-semibold text-slate-800" htmlFor="dispute-reason">Apa masalahnya?</label>
          <textarea
            id="dispute-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Contoh: ukuran tidak sesuai deskripsi / barang rusak / jasa belum dikerjakan"
            className="w-full rounded-lg border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
          />
          <div className="flex gap-2">
            <button onClick={() => setDisputing(null)} className={`${ghost} flex-1`}>Batal</button>
            <button
              disabled={reason.trim().length < 5 || (disputing ? busyId === disputing.id : false)}
              onClick={async () => {
                const target = disputing!;
                setDisputing(null);
                await run(target, 'dispute', { reason: reason.trim() }, 'Laporan terkirim. Admin akan meninjau; dana tetap aman.');
              }}
              className={`${primary} flex-1`}
            >
              Kirim Laporan
            </button>
          </div>
        </div>
      </Modal>
    </section>
  );
}
