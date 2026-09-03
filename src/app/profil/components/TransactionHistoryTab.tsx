'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { PendingOrder } from './ConfirmOrderModal';

export interface TransactionRecord {
  id: string;
  orderNumber: string;
  module: 'permak' | 'perawatan' | 'trift' | 'upcycle';
  moduleLabel: string;
  title: string;
  partnerOrSeller: string;
  date: string;
  amount: number;
  status: 'waiting_confirmation' | 'processing' | 'completed' | 'cancelled';
  statusLabel: string;
  trackingNumber?: string;
  courier?: string;
  escrowStatus: 'held' | 'released' | 'refunded';
}

interface TransactionHistoryTabProps {
  transactions: TransactionRecord[];
  onOpenConfirmModal: (order: PendingOrder) => void;
}

export default function TransactionHistoryTab({
  transactions,
  onOpenConfirmModal,
}: TransactionHistoryTabProps) {
  const [selectedModule, setSelectedModule] = useState<'all' | 'permak' | 'perawatan' | 'trift' | 'upcycle'>('all');
  const [selectedStatus, setSelectedStatus] = useState<string>('all');

  const moduleTabs = [
    { id: 'all', label: 'Semua Modul', icon: 'Squares2X2Icon' },
    { id: 'permak', label: 'Permak & Jahit', icon: 'ScissorsIcon' },
    { id: 'perawatan', label: 'Perawatan (Spa/Clean)', icon: 'SparklesIcon' },
    { id: 'trift', label: 'Trift Preloved', icon: 'ShoppingBagIcon' },
    { id: 'upcycle', label: 'Upcycle Tekstil', icon: 'ArrowPathIcon' },
  ];

  const filtered = transactions.filter((t) => {
    if (selectedModule !== 'all' && t.module !== selectedModule) return false;
    if (selectedStatus !== 'all' && t.status !== selectedStatus) return false;
    return true;
  });

  const getStatusBadgeClass = (status: TransactionRecord['status']) => {
    switch (status) {
      case 'waiting_confirmation':
        return 'bg-warning-bg text-warning-foreground border-warning/40 animate-pulse';
      case 'processing':
        return 'bg-info-bg text-info border-info/30';
      case 'completed':
        return 'bg-secondary text-primary border-accent/40';
      case 'cancelled':
        return 'bg-danger-bg text-danger border-danger/30';
      default:
        return 'bg-muted text-muted-foreground border-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Module Filter Chips (Swipeable / Scrollable) */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {moduleTabs.map((tab) => (
          <button
            key={tab.id}
            onClick={() => setSelectedModule(tab.id as any)}
            className={`flex items-center gap-1.5 px-3.5 py-2 rounded-xl text-xs font-semibold border transition-all whitespace-nowrap ${
              selectedModule === tab.id
                ? 'bg-primary text-white border-primary shadow-xs'
                : 'bg-card text-muted-foreground border-border hover:border-accent'
            }`}
          >
            <Icon name={tab.icon} size={14} />
            {tab.label}
          </button>
        ))}
      </div>

      {/* Secondary Status Filter */}
      <div className="flex items-center justify-between text-xs">
        <div className="flex items-center gap-2">
          <span className="text-muted-foreground font-medium">Status:</span>
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="bg-card border border-border rounded-lg px-2.5 py-1 text-xs text-foreground focus:outline-none focus:ring-1 focus:ring-primary cursor-pointer font-medium"
            aria-label="Filter status transaksi"
          >
            <option value="all">Semua Status</option>
            <option value="waiting_confirmation">Menunggu Konfirmasi Diterima</option>
            <option value="processing">Sedang Diproses / Dikirim</option>
            <option value="completed">Selesai</option>
            <option value="cancelled">Dibatalkan</option>
          </select>
        </div>

        <span className="text-muted-foreground font-medium">
          {filtered.length} Transaksi
        </span>
      </div>

      {/* Transactions List */}
      <div className="space-y-3">
        {filtered.length === 0 ? (
          <div className="bg-card border border-border rounded-xl p-8 text-center">
            <Icon name="ShoppingBagIcon" size={32} className="mx-auto text-muted-foreground/60 mb-2" />
            <p className="text-xs font-semibold text-foreground">Belum ada transaksi di kategori ini</p>
            <p className="text-[11px] text-muted-foreground mt-0.5">Semua riwayat pemesanan akan otomatis tercatat di sini</p>
          </div>
        ) : (
          filtered.map((item) => (
            <div
              key={item.id}
              className={`bg-card border rounded-xl p-4 shadow-sm transition-all ${
                item.status === 'waiting_confirmation'
                  ? 'border-warning/80 bg-warning-bg/10'
                  : 'border-border hover:border-accent'
              }`}
            >
              <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="min-w-0">
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded">
                      {item.moduleLabel}
                    </span>
                    <span className="text-xs font-mono text-muted-foreground">
                      #{item.orderNumber}
                    </span>
                    <span className="text-xs text-muted-foreground">• {item.date}</span>
                  </div>

                  <h4 className="font-bold text-sm text-foreground mt-1 truncate">
                    {item.title}
                  </h4>
                  <p className="text-xs text-muted-foreground">
                    Mitra/Penjual: <strong className="text-foreground">{item.partnerOrSeller}</strong>
                    {item.courier && ` • Kurir: ${item.courier} (${item.trackingNumber})`}
                  </p>
                </div>

                <div className="flex sm:flex-col items-center sm:items-end justify-between gap-1 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                  <span className="text-sm font-extrabold text-foreground">
                    Rp {item.amount.toLocaleString('id-ID')}
                  </span>
                  <span
                    className={`text-[11px] px-2.5 py-0.5 rounded-full font-bold border ${getStatusBadgeClass(
                      item.status
                    )}`}
                  >
                    {item.statusLabel}
                  </span>
                </div>
              </div>

              {/* Escrow note & Action Button */}
              <div className="mt-3 pt-3 border-t border-border flex flex-col sm:flex-row sm:items-center justify-between gap-2">
                <div className="text-[11px] text-muted-foreground flex items-center gap-1.5">
                  <Icon
                    name="ShieldCheckIcon"
                    size={14}
                    className={
                      item.escrowStatus === 'released'
                        ? 'text-accent'
                        : item.escrowStatus === 'held'
                        ? 'text-warning'
                        : 'text-muted-foreground'
                    }
                  />
                  <span>
                    Escrow:{' '}
                    {item.escrowStatus === 'released'
                      ? 'Dana telah diteruskan ke mitra'
                      : item.escrowStatus === 'held'
                      ? 'Dana tertahan aman di sistem'
                      : 'Dana dikembalikan (refund)'}
                  </span>
                </div>

                {/* THE REQUIRED OPTION: Confirmation button directly on the profile transaction card! */}
                {item.status === 'waiting_confirmation' && (
                  <button
                    onClick={() =>
                      onOpenConfirmModal({
                        id: item.id,
                        orderNumber: item.orderNumber,
                        module: item.module,
                        moduleLabel: item.moduleLabel,
                        title: item.title,
                        partnerOrSeller: item.partnerOrSeller,
                        amount: item.amount,
                        trackingNumber: item.trackingNumber,
                        courier: item.courier,
                      })
                    }
                    className="btn-primary py-1.5 px-3.5 text-xs font-bold flex items-center justify-center gap-1.5 bg-primary text-white rounded-xl shadow-xs"
                  >
                    <Icon name="CheckCircleIcon" size={15} />
                    Konfirmasi Pesanan Diterima
                  </button>
                )}
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
}
