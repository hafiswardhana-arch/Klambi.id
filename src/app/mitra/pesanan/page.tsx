'use client';

import React, { useEffect, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import FundFlow from '@/components/escrow/FundFlow';
import EscrowOrdersPanel from '@/components/escrow/EscrowOrdersPanel';
import { fetchData } from '@/lib/supabase/client';

interface Summary {
  user: { name: string; role: string };
  wallet?: { balance: number; escrowHeld: number } | null;
}

const rp = (n: number) => `Rp ${Number(n).toLocaleString('id-ID')}`;

export default function MitraPesananPage() {
  const [summary, setSummary] = useState<Summary | null>(null);
  const [reloadKey, setReloadKey] = useState(0);

  useEffect(() => {
    fetchData<Summary>('/api/me/summary').then(setSummary);
  }, [reloadKey]);

  return (
    <AppLayout title="Pesanan Mitra" showBack backHref="/profil">
      <div className="space-y-4 pb-4">
        <section className="space-y-3 rounded-2xl bg-navy p-4 text-white shadow-card" aria-label="Saldo mitra">
          <p className="text-xs text-white/70">{summary?.user.name ?? 'Mitra'}</p>
          <div className="grid grid-cols-2 gap-3">
            <div>
              <p className="text-[0.6875rem] text-white/70">Saldo bisa ditarik</p>
              <p className="text-lg font-extrabold">{summary?.wallet ? rp(summary.wallet.balance) : '—'}</p>
            </div>
            <div>
              <p className="text-[0.6875rem] text-white/70">Dana ditahan admin (akan diterima)</p>
              <p className="text-lg font-extrabold text-brand-yellow">{summary?.wallet ? rp(summary.wallet.escrowHeld) : '—'}</p>
            </div>
          </div>
          <p className="text-[0.6875rem] leading-relaxed text-white/80">
            Pembayaran customer ditahan admin Klámbi. Dana masuk ke saldomu setelah customer menerima barang/jasa dan tidak ada masalah
            (dipotong biaya platform).
          </p>
        </section>

        <div className="rounded-2xl bg-white p-4 shadow-card">
          <FundFlow neutral />
        </div>

        <EscrowOrdersPanel as="mitra" onChanged={() => setReloadKey((k) => k + 1)} />
      </div>
    </AppLayout>
  );
}
