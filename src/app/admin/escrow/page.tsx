'use client';

import React, { useCallback, useEffect, useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import FundFlow, { STATUS_LABEL, STATUS_TONE } from '@/components/escrow/FundFlow';
import { escrowAction, EscrowOrder } from '@/components/escrow/EscrowOrdersPanel';

interface Overview {
  escrowHeld: number;
  feeIncome: number;
  feePercent: number;
  disputes: EscrowOrder[];
  held: EscrowOrder[];
  recent: EscrowOrder[];
  ledger: { id: string; type: string; amount: number; note: string | null; at: string }[];
}

const rp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;
const LEDGER_LABEL: Record<string, string> = {
  PAYMENT_IN: 'Dana masuk escrow',
  RELEASE_TO_MITRA: 'Dilepas ke mitra',
  PLATFORM_FEE: 'Biaya platform',
  REFUND_TO_BUYER: 'Refund ke customer',
  WALLET_DEBIT: 'Potong Saldo Klámbi',
};

export default function AdminEscrowPage() {
  const [data, setData] = useState<Overview | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/admin/escrow', { cache: 'no-store' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) {
        setError(res.status === 403 ? 'Halaman ini khusus admin. Login sebagai akun admin.' : res.status === 401 ? 'Silakan login sebagai admin.' : 'Data escrow belum tersedia (database belum dikonfigurasi).');
        return;
      }
      setError(null);
      setData(json.data);
    } catch {
      setError('Tidak dapat terhubung ke server.');
    }
  }, []);

  useEffect(() => { load(); }, [load]);

  const resolve = async (o: EscrowOrder, decision: 'release' | 'refund') => {
    const text = decision === 'release'
      ? `Lepas ${rp(o.mitraPayout)} ke mitra ${o.mitra?.name}? Tidak bisa dibatalkan.`
      : `Kembalikan ${rp(o.total)} ke customer ${o.buyer?.name}? Tidak bisa dibatalkan.`;
    if (!window.confirm(text)) return;
    setBusy(o.id);
    const ok = await escrowAction(o.id, 'resolve', { decision });
    setBusy(null);
    if (ok) { toast.success(decision === 'release' ? 'Dana dilepas ke mitra.' : 'Dana dikembalikan ke customer.'); load(); }
  };

  const heldNotDisputed = data?.held.filter((o) => o.status !== 'disputed') ?? [];

  return (
    <AppLayout title="Escrow · Admin" showBack backHref="/profil">
      {!data && !error && <div className="h-40 animate-pulse rounded-2xl bg-white/70" aria-label="Memuat data escrow" />}
      {error && <p role="alert" className="rounded-2xl bg-white p-5 text-center text-sm text-slate-600 shadow-card">{error}</p>}

      {data && (
        <div className="space-y-4 pb-4">
          <section aria-label="Rekening escrow Klámbi" className="rounded-2xl bg-navy p-4 text-white shadow-card">
            <p className="text-xs text-white/70">Dana customer yang sedang ditahan admin</p>
            <p className="mt-0.5 text-2xl font-extrabold text-brand-yellow">{rp(data.escrowHeld)}</p>
            <div className="mt-3 grid grid-cols-3 gap-2 text-center">
              <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold">{data.held.length}</p><p className="text-[0.625rem] text-white/70">Pesanan ditahan</p></div>
              <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold">{data.disputes.length}</p><p className="text-[0.625rem] text-white/70">Sengketa</p></div>
              <div className="rounded-xl bg-white/10 p-2"><p className="text-sm font-bold">{rp(data.feeIncome)}</p><p className="text-[0.625rem] text-white/70">Fee {data.feePercent}%</p></div>
            </div>
          </section>

          <div className="rounded-2xl bg-white p-4 shadow-card"><FundFlow neutral /></div>

          {/* Sengketa: butuh keputusan admin */}
          <section aria-label="Sengketa" className="space-y-3">
            <h2 className="text-sm font-extrabold text-slate-900">Perlu Keputusan Admin ({data.disputes.length})</h2>
            {data.disputes.length === 0 && <p className="rounded-2xl bg-white p-4 text-center text-xs text-slate-500">Tidak ada sengketa.</p>}
            {data.disputes.map((o) => (
              <article key={o.id} className="space-y-3 rounded-2xl border border-rose-200 bg-white p-4 shadow-card">
                <header className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <p className="truncate text-sm font-bold text-slate-900">{o.title}</p>
                    <p className="text-[0.6875rem] text-slate-500">{o.orderNumber} · {o.buyer?.name} → {o.mitra?.name}</p>
                  </div>
                  <p className="text-sm font-extrabold text-coral">{rp(o.total)}</p>
                </header>
                <p className="rounded-xl bg-rose-50 p-3 text-xs leading-relaxed text-rose-800"><b>Laporan:</b> {o.disputeReason}</p>
                <div className="flex flex-wrap gap-2">
                  <button disabled={busy === o.id} onClick={() => resolve(o, 'refund')}
                    className="min-h-[44px] flex-1 rounded-xl border border-rose-300 bg-white px-4 text-[0.8125rem] font-semibold text-rose-700 active:scale-[0.98] disabled:opacity-50">
                    Kembalikan ke Customer
                  </button>
                  <button disabled={busy === o.id} onClick={() => resolve(o, 'release')}
                    className="min-h-[44px] flex-1 rounded-xl bg-navy px-4 text-[0.8125rem] font-semibold text-white active:scale-[0.98] disabled:opacity-50">
                    Lepas ke Mitra
                  </button>
                </div>
              </article>
            ))}
          </section>

          <section aria-label="Dana ditahan" className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900">Sedang Ditahan ({heldNotDisputed.length})</h2>
            {heldNotDisputed.map((o) => (
              <div key={o.id} className="flex items-center justify-between gap-3 rounded-2xl bg-white p-3 shadow-card">
                <div className="min-w-0">
                  <p className="truncate text-[0.8125rem] font-semibold text-slate-900">{o.title}</p>
                  <p className="text-[0.6875rem] text-slate-500">{o.orderNumber} · {o.buyer?.name} → {o.mitra?.name}</p>
                  <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold ${STATUS_TONE[o.status]}`}>{STATUS_LABEL[o.status]}</span>
                </div>
                <p className="flex-shrink-0 text-[0.8125rem] font-bold text-slate-800">{rp(o.total)}</p>
              </div>
            ))}
          </section>

          <section aria-label="Buku besar" className="space-y-2">
            <h2 className="text-sm font-extrabold text-slate-900">Buku Besar Terbaru</h2>
            <ul className="divide-y divide-slate-100 rounded-2xl bg-white shadow-card">
              {data.ledger.map((l) => (
                <li key={l.id} className="flex items-center justify-between gap-3 p-3 text-xs">
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-800">{LEDGER_LABEL[l.type] || l.type}</p>
                    <p className="truncate text-slate-500">{l.note}</p>
                  </div>
                  <p className="flex-shrink-0 font-bold text-slate-800">{rp(l.amount)}</p>
                </li>
              ))}
            </ul>
          </section>
        </div>
      )}
    </AppLayout>
  );
}
