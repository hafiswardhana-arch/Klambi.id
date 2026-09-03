'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface PaymentMethodItem {
  id: string;
  type: 'ewallet' | 'bank' | 'card';
  name: string;
  accountNumber: string;
  isPrimary: boolean;
  status: 'Terhubung' | 'Aktif';
}

interface PaymentMethodsSectionProps {
  paymentMethods: PaymentMethodItem[];
  onOpenAddPayment: () => void;
  onDeletePayment: (id: string) => void;
  onSetPrimaryPayment: (id: string) => void;
}

export default function PaymentMethodsSection({
  paymentMethods,
  onOpenAddPayment,
  onDeletePayment,
  onSetPrimaryPayment,
}: PaymentMethodsSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
            <Icon name="CreditCardIcon" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Metode Pembayaran & E-Wallet</h3>
            <p className="text-[11px] text-muted-foreground">Pembayaran instan & penarikan saldo penjualan</p>
          </div>
        </div>

        <button
          onClick={onOpenAddPayment}
          className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 rounded-xl"
        >
          <Icon name="PlusIcon" size={14} />
          Tambah Metode
        </button>
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
        {paymentMethods.map((pm) => (
          <div
            key={pm.id}
            className={`border rounded-xl p-3.5 flex items-center justify-between gap-2 transition-all ${
              pm.isPrimary
                ? 'border-primary bg-secondary/30'
                : 'border-border bg-card hover:border-accent'
            }`}
          >
            <div className="flex items-center gap-3 min-w-0">
              <div className="w-10 h-10 rounded-xl bg-muted flex items-center justify-center text-primary flex-shrink-0 font-extrabold text-xs">
                {pm.type === 'ewallet' ? '📱' : pm.type === 'card' ? '💳' : '🏦'}
              </div>
              <div className="min-w-0">
                <div className="flex items-center gap-1.5">
                  <h4 className="text-xs font-bold text-foreground">{pm.name}</h4>
                  {pm.isPrimary && (
                    <span className="text-[9px] font-extrabold text-primary bg-secondary px-1.5 py-0.2 rounded border border-accent/40">
                      Utama
                    </span>
                  )}
                </div>
                <p className="text-xs font-mono text-muted-foreground truncate">
                  {pm.accountNumber}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-1.5 flex-shrink-0">
              {!pm.isPrimary && (
                <button
                  onClick={() => onSetPrimaryPayment(pm.id)}
                  className="text-[11px] text-muted-foreground hover:text-primary hover:underline font-medium"
                >
                  Set Utama
                </button>
              )}
              {paymentMethods.length > 1 && (
                <button
                  onClick={() => onDeletePayment(pm.id)}
                  className="p-1 rounded-lg text-muted-foreground hover:text-danger hover:bg-danger-bg transition-colors"
                  title="Hapus Metode"
                  aria-label="Hapus Metode"
                >
                  <Icon name="TrashIcon" size={14} />
                </button>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
