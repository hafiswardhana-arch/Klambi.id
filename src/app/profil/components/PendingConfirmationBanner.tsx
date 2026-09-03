'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import { PendingOrder } from './ConfirmOrderModal';

interface PendingConfirmationBannerProps {
  pendingOrders: PendingOrder[];
  onOpenConfirmModal: (order: PendingOrder) => void;
}

export default function PendingConfirmationBanner({
  pendingOrders,
  onOpenConfirmModal,
}: PendingConfirmationBannerProps) {
  if (!pendingOrders || pendingOrders.length === 0) return null;

  return (
    <div className="bg-gradient-to-r from-warning-bg to-card border-2 border-warning/60 rounded-2xl p-4 sm:p-5 shadow-sm relative overflow-hidden animate-fade-in">
      <div className="flex items-center justify-between gap-2 mb-3">
        <div className="flex items-center gap-2">
          <span className="relative flex h-3 w-3">
            <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-warning opacity-75"></span>
            <span className="relative inline-flex rounded-full h-3 w-3 bg-warning"></span>
          </span>
          <h3 className="text-sm font-extrabold text-foreground flex items-center gap-1.5">
            Pesanan Menunggu Konfirmasi Diterima ({pendingOrders.length})
          </h3>
        </div>
        <span className="text-[11px] font-semibold text-warning-foreground bg-warning/20 px-2.5 py-0.5 rounded-full border border-warning/40">
          Dana Escrow Tertahan
        </span>
      </div>

      <p className="text-xs text-muted-foreground mb-3 leading-relaxed">
        Barang Anda telah dikirim dan tiba di lokasi penjemputan/pengantaran. Harap periksa kondisi pesanan dan konfirmasi penerimaan untuk meneruskan dana ke pihak mitra/penjual.
      </p>

      <div className="space-y-2.5">
        {pendingOrders.map((order) => (
          <div
            key={order.id}
            className="bg-card border border-border/90 rounded-xl p-3.5 flex flex-col sm:flex-row sm:items-center justify-between gap-3 shadow-xs hover:border-warning/80 transition-all"
          >
            <div className="flex items-start gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-secondary/80 flex items-center justify-center text-primary flex-shrink-0">
                <Icon
                  name={
                    order.module === 'trift'
                      ? 'ShoppingBagIcon'
                      : order.module === 'permak'
                      ? 'ScissorsIcon'
                      : order.module === 'upcycle'
                      ? 'ArrowPathIcon'
                      : 'SparklesIcon'
                  }
                  size={20}
                />
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5 flex-wrap">
                  <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary px-1.5 py-0.2 rounded">
                    {order.moduleLabel}
                  </span>
                  <span className="text-xs font-mono text-muted-foreground">
                    #{order.orderNumber}
                  </span>
                </div>
                <h4 className="font-bold text-sm text-foreground mt-0.5 truncate">
                  {order.title}
                </h4>
                <p className="text-xs text-muted-foreground">
                  Penyedia: <strong className="text-foreground">{order.partnerOrSeller}</strong>
                  {order.courier && ` • Resi: ${order.trackingNumber}`}
                </p>
              </div>
            </div>

            <div className="flex sm:flex-col items-center sm:items-end justify-between gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/50">
              <span className="text-xs font-extrabold text-primary">
                Rp {order.amount.toLocaleString('id-ID')}
              </span>
              <button
                onClick={() => onOpenConfirmModal(order)}
                className="btn-primary py-2 px-3.5 text-xs font-bold flex items-center gap-1.5 bg-primary hover:bg-primary/90 text-white rounded-xl shadow-xs"
              >
                <Icon name="CheckBadgeIcon" size={15} />
                Konfirmasi Diterima
              </button>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
