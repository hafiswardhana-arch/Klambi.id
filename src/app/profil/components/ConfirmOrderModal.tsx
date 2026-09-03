'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export interface PendingOrder {
  id: string;
  orderNumber: string;
  module: 'permak' | 'perawatan' | 'trift' | 'upcycle';
  moduleLabel: string;
  title: string;
  partnerOrSeller: string;
  amount: number;
  trackingNumber?: string;
  courier?: string;
  itemImage?: string;
}

interface ConfirmOrderModalProps {
  order: PendingOrder;
  onClose: () => void;
  onConfirm: (orderId: string, rating: number, review: string) => void;
}

export default function ConfirmOrderModal({
  order,
  onClose,
  onConfirm,
}: ConfirmOrderModalProps) {
  const [rating, setRating] = useState(5);
  const [review, setReview] = useState('');
  const [isCheckCondition, setIsCheckCondition] = useState(true);
  const [isCheckComplete, setIsCheckComplete] = useState(true);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!isCheckCondition || !isCheckComplete) return;
    onConfirm(order.id, rating, review);
  };

  const isFormValid = isCheckCondition && isCheckComplete;

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-5 sm:p-6 shadow-2xl animate-scale-in max-h-[90vh] overflow-y-auto">
        {/* Header */}
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="CheckBadgeIcon" size={20} />
            </div>
            <div>
              <h3 className="text-base font-bold text-foreground">
                Konfirmasi Pesanan Diterima
              </h3>
              <p className="text-xs text-muted-foreground">
                #{order.orderNumber} • {order.moduleLabel}
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground transition-colors"
            aria-label="Tutup modal"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* Order Details Brief */}
        <div className="mt-4 p-3.5 bg-muted/60 rounded-xl border border-border/70 flex items-center justify-between gap-3">
          <div className="min-w-0">
            <span className="text-[10px] font-bold uppercase tracking-wider text-primary bg-secondary px-2 py-0.5 rounded">
              {order.moduleLabel}
            </span>
            <h4 className="font-bold text-sm text-foreground mt-1 truncate">
              {order.title}
            </h4>
            <p className="text-xs text-muted-foreground">
              Mitra/Penjual: <strong className="text-foreground">{order.partnerOrSeller}</strong>
            </p>
            {order.courier && (
              <p className="text-[11px] text-muted-foreground mt-0.5">
                📦 {order.courier} ({order.trackingNumber})
              </p>
            )}
          </div>
          <div className="text-right flex-shrink-0">
            <span className="text-[10px] text-muted-foreground block">Total Escrow</span>
            <span className="text-sm font-extrabold text-primary">
              Rp {order.amount.toLocaleString('id-ID')}
            </span>
          </div>
        </div>

        {/* Escrow Release Notice */}
        <div className="mt-3.5 p-3 bg-info-bg rounded-xl border border-info/30 flex items-start gap-2.5">
          <Icon name="ShieldCheckIcon" size={16} className="text-info flex-shrink-0 mt-0.5" />
          <p className="text-xs text-muted-foreground leading-relaxed">
            Dengan mengonfirmasi penerimaan, dana sebesar <strong className="text-foreground">Rp {order.amount.toLocaleString('id-ID')}</strong> di rekening bersama (escrow) Klámbi akan diteruskan kepada mitra/penjual.
          </p>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-4">
          {/* Verification Checkboxes */}
          <div className="space-y-2.5 p-3.5 bg-secondary/40 rounded-xl border border-border">
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-foreground select-none">
              <input
                type="checkbox"
                checked={isCheckCondition}
                onChange={(e) => setIsCheckCondition(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary mt-0.5 w-4 h-4"
              />
              <span>
                Saya telah memeriksa bahwa pakaian/layanan dalam kondisi baik dan sesuai pesanan.
              </span>
            </label>
            <label className="flex items-start gap-2.5 cursor-pointer text-xs text-foreground select-none">
              <input
                type="checkbox"
                checked={isCheckComplete}
                onChange={(e) => setIsCheckComplete(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary mt-0.5 w-4 h-4"
              />
              <span>
                Saya menyetujui pelepasan dana pembayaran escrow ke pihak penjual/mitra.
              </span>
            </label>
          </div>

          {/* Rating Section */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Beri Rating Pengalaman (1-5 Bintang)
            </label>
            <div className="flex items-center gap-2">
              {[1, 2, 3, 4, 5].map((star) => (
                <button
                  type="button"
                  key={star}
                  onClick={() => setRating(star)}
                  className="p-1 hover:scale-110 transition-transform"
                  aria-label={`Bintang ${star}`}
                >
                  <Icon
                    name="StarIcon"
                    size={28}
                    variant={star <= rating ? 'solid' : 'outline'}
                    className={
                      star <= rating ? 'text-warning fill-warning' : 'text-muted-foreground'
                    }
                  />
                </button>
              ))}
              <span className="text-xs font-semibold text-primary ml-2 bg-secondary px-2 py-0.5 rounded">
                {rating === 5
                  ? 'Sangat Puas ⭐⭐⭐⭐⭐'
                  : rating === 4
                  ? 'Puas ⭐⭐⭐⭐'
                  : rating === 3
                  ? 'Cukup ⭐⭐⭐'
                  : 'Kurang Puas'}
              </span>
            </div>
          </div>

          {/* Review Input */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Ulasan / Testimoni Singkat (Opsional)
            </label>
            <textarea
              rows={2}
              value={review}
              onChange={(e) => setReview(e.target.value)}
              placeholder="Ceritakan kepuasan hasil jahitan / kondisi baju / kecepatan pengiriman..."
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          {/* Action Buttons */}
          <div className="pt-2 flex gap-2.5">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
            >
              Batal / Belum Sampai
            </button>
            <button
              type="submit"
              disabled={!isFormValid}
              className="btn-primary flex-1 py-2.5 text-xs font-semibold flex items-center justify-center gap-1.5 disabled:opacity-50"
            >
              <Icon name="CheckCircleIcon" size={16} />
              Konfirmasi & Selesai
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
