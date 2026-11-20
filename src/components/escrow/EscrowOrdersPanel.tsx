'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import ConfirmOrderModal, { PendingOrder } from '@/app/profil/components/ConfirmOrderModal';
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

/** POST an escrow action. Returns true on success (toast shown either way). */
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

interface Props {
  /** buyer = "Pesanan Saya"; mitra = pesanan masuk ke toko/jasa kita */
  as: 'buyer' | 'mitra';
  /** Hide the whole panel when there is nothing to show (used on Profil). */
  hideWhenEmpty?: boolean;
  /** Only show orders still in progress (hide completed / refunded / cancelled). */
  onlyActive?: boolean;
  onChanged?: () => void;
}

export default function EscrowOrdersPanel({ as, hideWhenEmpty = false, onlyActive = false, onChanged }: Props) {
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
      setOrders(json.data as EscrowOrder[]);
    } catch {
      setUnavailable(true);
    }
  }, [as]);

  useEffect(() => { load(); }, [load]);

  const run = async (o: EscrowOrder, action: string, body: Record<string, unknown> = {}, okMsg?: string) => {
    setBusyId(o.id);
    const ok = await escrowAction(o.id, action, body);
    setBusyId(null);
    if (ok) {
      if (okMsg) toast.success(okMsg);
      await load();
      onChanged?.();
    }
    return ok;
  };

  if (unavailable) return null; // not logged in / database not configured → keep the legacy demo UI
  if (orders === null) {
    return <div className="h-24 animate-pulse rounded-2xl bg-white/70" aria-label="Memuat pesanan" />;
  }

  const isActive = (o: EscrowOrder) => !(['completed', 'refunded', 'cancelled'] as OrderStatus[]).includes(o.status);
  const list = onlyActive ? orders.filter(isActive) : orders;
  if (list.length === 0 && hideWhenEmpty) return null;

  const btn = 'min-h-[44px] rounded-xl px-4 text-[0.8125rem] font-semibold transition active:scale-[0.98] disabled:opacity-50 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy';
  const primary = `${btn} bg-navy text-white hover:bg-navy-deep`;
  const ghost = `${btn} border border-slate-300 bg-white text-slate-700 hover:bg-slate-50`;
  const danger = `${btn} border border-rose-300 bg-white text-rose-700 hover:bg-rose-50`;

  return (
    <section aria-label={as === 'buyer' ? 'Pesanan dengan dana escrow' : 'Pesanan masuk'} className="space-y-3">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-extrabold text-slate-900">
          {as === 'buyer' ? 'Pesanan & Dana Escrow' : 'Pesanan Masuk'}
          <span className="ml-2 rounded-full bg-slate-100 px-2 py-0.5 text-[0.6875rem] font-semibold text-slate-600">{list.length}</span>
        </h2>
        <button onClick={load} className="min-h-[44px] px-2 text-xs font-semibold text-navy underline-offset-2 hover:underline">
          Segarkan
        </button>
      </div>

      {list.length === 0 && (
        <p className="rounded-2xl bg-white p-4 text-center text-xs text-slate-500">
          {as === 'buyer' ? 'Belum ada pesanan.' : 'Belum ada pesanan masuk.'}
        </p>
      )}

      {list.map((o) => {
        const busy = busyId === o.id;
        const open = openId === o.id;
        const countdown = o.status === 'delivered' ? hoursLeft(o.autoReleaseAt) : null;
        return (
          <article key={o.id} className="space-y-3 rounded-2xl border border-slate-200 bg-white p-4 shadow-card">
            <header className="flex items-start justify-between gap-3">
              <div className="min-w-0">
                <p className="truncate text-sm font-bold text-slate-900">{o.title}</p>
                <p className="text-[0.6875rem] text-slate-500">
                  {o.orderNumber} · {as === 'buyer' ? o.mitra?.name || o.sellerName : `Dari ${o.buyer?.name}`}
                </p>
              </div>
              <div className="flex-shrink-0 text-right">
                <p className="text-sm font-extrabold text-coral">{rp(o.total)}</p>
                {as === 'mitra' && <p className="text-[0.625rem] text-slate-500">Terima {rp(o.mitraPayout)}</p>}
              </div>
            </header>

            <span className={`inline-flex items-center rounded-full border px-2.5 py-1 text-[0.6875rem] font-semibold ${STATUS_TONE[o.status]}`}>
              {STATUS_LABEL[o.status]}
            </span>

            <FundFlow status={o.status} />

            {o.status === 'disputed' && o.disputeReason && (
              <p className="rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-rose-800">
                <b>Laporan:</b> {o.disputeReason}
                <br />
                Admin Klámbi sedang meninjau. Dana tetap aman di rekening escrow sampai ada keputusan.
              </p>
            )}
            {countdown && (
              <p className="rounded-xl bg-emerald-50 p-3 text-xs leading-relaxed text-emerald-900">
                {as === 'buyer'
                  ? <>Periksa barangmu. Jika tidak ada konfirmasi/laporan, dana otomatis dicairkan ke mitra <b>{countdown}</b>.</>
                  : <>Menunggu konfirmasi customer. Otomatis cair <b>{countdown}</b> jika tidak ada laporan.</>}
              </p>
            )}
            {o.trackingNumber && ['shipped', 'delivered', 'completed'].includes(o.status) && (
              <p className="text-[0.6875rem] text-slate-500">No. resi: <span className="font-mono font-semibold text-slate-700">{o.trackingNumber}</span></p>
            )}

            {/* ---- Aksi sesuai peran & status ---- */}
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
                {open ? 'Sembunyikan Riwayat' : 'Riwayat'}
              </button>
            </div>

            {open && (
              <ol className="space-y-2 border-t border-slate-100 pt-3" aria-label="Riwayat status">
                {o.events.map((e, i) => (
                  <li key={i} className="flex gap-2 text-xs">
                    <Icon name="CheckCircleIcon" variant="solid" size={16} className="mt-0.5 flex-shrink-0 text-success-green" aria-hidden="true" />
                    <div>
                      <p className="font-semibold text-slate-800">
                        {STATUS_LABEL[e.to as OrderStatus] || e.to} <span className="font-normal text-slate-500">· {ROLE_LABEL[e.role] || e.role}</span>
                      </p>
                      {e.note && <p className="text-slate-600">{e.note}</p>}
                      <p className="text-[0.625rem] text-slate-400">{when(e.at)}</p>
                    </div>
                  </li>
                ))}
              </ol>
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
            Dana <b>tidak akan dicairkan</b> ke mitra selama laporan ditinjau. Admin Klámbi akan memutuskan: dana dilepas ke mitra atau dikembalikan ke customer.
          </p>
          <label className="block text-xs font-semibold text-slate-800" htmlFor="dispute-reason">Apa masalahnya?</label>
          <textarea
            id="dispute-reason"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            rows={4}
            maxLength={500}
            placeholder="Contoh: ukuran tidak sesuai deskripsi / barang rusak / jasa belum dikerjakan"
            className="w-full rounded-xl border border-slate-300 p-3 text-sm focus:outline-none focus:ring-2 focus:ring-navy"
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
