'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import FundFlow from '@/components/escrow/FundFlow';
import EscrowOrdersPanel from '@/components/escrow/EscrowOrdersPanel';
import { rp } from '@/components/roles/DashboardParts';
import type { MeSummary } from '@/lib/supabase/useMe';

/**
 * Orders whose money is for this account, with the escrow explained.
 *  - variant "mitra":    service orders (laundry, penatu, permak) → "Mulai Kerjakan" / "Tandai Selesai".
 *  - variant "customer": items the customer sold (thrift/preloved) → "Proses & Kirim" / "Tandai Tiba".
 */
export default function IncomingOrders({ me, variant }: { me: MeSummary; variant: 'mitra' | 'customer' }) {
  const isMitra = variant === 'mitra';
  return (
    <div className="space-y-4 pb-4">
      <section
        className={`space-y-3 rounded-2xl p-4 text-white shadow-card ${isMitra ? 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-navy' : 'bg-navy'}`}
        aria-label={isMitra ? 'Dana layanan' : 'Dana penjualan'}
      >
        <p className="text-xs text-white/70">{isMitra ? me.service?.name ?? me.user.name : `Penjualan ${me.user.name}`}</p>
        <div className="grid grid-cols-2 gap-3">
          <div>
            <p className="text-[0.6875rem] text-white/70">Saldo bisa ditarik</p>
            <p className="text-lg font-extrabold tabular-nums">{rp(me.wallet?.balance ?? 0)}</p>
          </div>
          <div>
            <p className="text-[0.6875rem] text-white/70">Ditahan admin · akan cair</p>
            <p className="text-lg font-extrabold text-brand-yellow tabular-nums">{rp(me.sales.incoming)}</p>
          </div>
        </div>
        <p className="text-[0.6875rem] leading-relaxed text-white/80">
          {isMitra
            ? 'Pembayaran pelanggan ditahan admin Klámbi. Dana masuk ke saldomu setelah layanan selesai dan pelanggan mengonfirmasi (atau otomatis 48 jam tanpa laporan).'
            : 'Pembayaran pembeli ditahan admin Klámbi. Dana masuk ke Saldo Klámbi-mu setelah pembeli menerima barang dan tidak ada masalah (atau otomatis 48 jam tanpa laporan).'}
        </p>
      </section>

      <div className="rounded-2xl bg-white p-4 shadow-card">
        <FundFlow neutral kind={isMitra ? 'jasa' : 'trift'} />
      </div>

      {!isMitra && (
        <Link
          href="/jual"
          className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl bg-white text-sm font-semibold text-navy shadow-card hover:bg-slate-50"
        >
          <Icon name="PlusCircleIcon" variant="solid" size={18} aria-hidden="true" />
          Jual Barang Lagi
        </Link>
      )}

      <EscrowOrdersPanel
        as="mitra"
        title={isMitra ? 'Pesanan Layanan Masuk' : 'Barang yang Saya Jual'}
        emptyText={isMitra ? 'Belum ada pesanan layanan.' : 'Belum ada barangmu yang terjual. Pasang barang preloved di menu Jual.'}
      />
    </div>
  );
}
