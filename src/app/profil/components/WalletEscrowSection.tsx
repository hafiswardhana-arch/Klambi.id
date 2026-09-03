'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface WalletEscrowSectionProps {
  withdrawableBalance: number;
  escrowBalance: number;
  escrowPendingCount: number;
  onOpenWithdrawModal: () => void;
  onOpenEscrowDetailModal: () => void;
}

export default function WalletEscrowSection({
  withdrawableBalance,
  escrowBalance,
  escrowPendingCount,
  onOpenWithdrawModal,
  onOpenEscrowDetailModal,
}: WalletEscrowSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
            <Icon name="BanknotesIcon" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Saldo & Rekening Bersama (Escrow)</h3>
            <p className="text-[11px] text-muted-foreground">Perlindungan transaksi jual-beli & jasa perawatan</p>
          </div>
        </div>

        <button
          onClick={onOpenEscrowDetailModal}
          className="text-xs text-primary hover:underline font-semibold flex items-center gap-1"
        >
          <Icon name="InformationCircleIcon" size={14} />
          Cara Kerja Escrow
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
        {/* Withdrawable Balance Card */}
        <div className="bg-secondary/60 border border-border rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">Saldo Tersedia (Bisa Ditarik)</span>
              <span className="text-[10px] font-bold text-accent bg-card px-2 py-0.5 rounded-full border border-border">
                Aktif
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-foreground tracking-tight">
              Rp {withdrawableBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              Hasil penjualan Trift & refund yang sudah cair
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-border/80 flex items-center justify-between">
            <button
              onClick={onOpenWithdrawModal}
              disabled={withdrawableBalance <= 0}
              className="btn-primary py-2 px-4 text-xs font-bold w-full flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Icon name="ArrowDownTrayIcon" size={14} />
              Tarik Saldo ke Rekening
            </button>
          </div>
        </div>

        {/* Escrow Held Balance Card */}
        <div className="bg-info-bg/50 border border-info/30 rounded-xl p-4 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-1">
              <span className="text-xs font-semibold text-muted-foreground">Dana Tertahan di Escrow</span>
              <span className="text-[10px] font-bold text-info bg-card px-2 py-0.5 rounded-full border border-info/30">
                {escrowPendingCount} Transaksi
              </span>
            </div>
            <p className="text-xl sm:text-2xl font-extrabold text-info tracking-tight">
              Rp {escrowBalance.toLocaleString('id-ID')}
            </p>
            <p className="text-[11px] text-muted-foreground mt-1">
              🔒 Aman di sistem Klámbi. Cair otomatis setelah pembeli konfirmasi barang diterima.
            </p>
          </div>

          <div className="mt-4 pt-3 border-t border-info/20 flex items-center justify-between">
            <span className="text-[11px] text-muted-foreground">
              Estimasi cair: <strong>1-2 hari kerja</strong>
            </span>
            <button
              onClick={onOpenEscrowDetailModal}
              className="text-xs text-info font-bold hover:underline"
            >
              Rincian Dana &rarr;
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
