'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { PaymentMethodItem } from './PaymentMethodsSection';

interface WithdrawModalProps {
  balance: number;
  paymentMethods: PaymentMethodItem[];
  onClose: () => void;
  onWithdraw: (amount: number, destination: string) => void;
}

export default function WithdrawModal({
  balance,
  paymentMethods,
  onClose,
  onWithdraw,
}: WithdrawModalProps) {
  const [amount, setAmount] = useState(balance.toString());
  const [selectedDestination, setSelectedDestination] = useState(
    paymentMethods[0]?.name + ' (' + paymentMethods[0]?.accountNumber + ')' || 'Rekening Bank'
  );

  const numAmount = parseInt(amount.replace(/[^0-9]/g, ''), 10) || 0;

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (numAmount < 10000) return;
    if (numAmount > balance) return;
    onWithdraw(numAmount, selectedDestination);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="ArrowDownTrayIcon" size={18} />
            </div>
            <h3 className="text-base font-bold text-foreground">Tarik Saldo Penjualan</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Tutup"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3.5">
          <div className="p-3 bg-secondary/50 rounded-xl border border-border">
            <span className="text-[11px] text-muted-foreground block">Total Saldo Bisa Ditarik</span>
            <span className="text-lg font-extrabold text-foreground">
              Rp {balance.toLocaleString('id-ID')}
            </span>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Nominal Penarikan (Rp)
            </label>
            <input
              type="number"
              min={10000}
              max={balance}
              value={amount}
              onChange={(e) => setAmount(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-sm font-bold text-foreground focus:ring-2 focus:ring-ring"
            />
            <div className="flex gap-2 mt-1.5">
              <button
                type="button"
                onClick={() => setAmount('100000')}
                className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
              >
                100rb
              </button>
              <button
                type="button"
                onClick={() => setAmount('250000')}
                className="text-[10px] px-2 py-0.5 rounded bg-muted text-muted-foreground hover:text-foreground"
              >
                250rb
              </button>
              <button
                type="button"
                onClick={() => setAmount(balance.toString())}
                className="text-[10px] px-2 py-0.5 rounded bg-secondary text-primary font-bold"
              >
                Tarik Semua
              </button>
            </div>
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Tujuan Rekening / E-Wallet
            </label>
            <select
              value={selectedDestination}
              onChange={(e) => setSelectedDestination(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {paymentMethods.map((pm) => (
                <option
                  key={pm.id}
                  value={`${pm.name} (${pm.accountNumber})`}
                >
                  {pm.name} - {pm.accountNumber}
                </option>
              ))}
            </select>
          </div>

          <p className="text-[11px] text-muted-foreground">
            ⚡ Penarikan dana diproses instan tanpa biaya admin ke e-wallet & rekening bank terdaftar.
          </p>

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              disabled={numAmount < 10000 || numAmount > balance}
              className="btn-primary flex-1 py-2.5 text-xs font-semibold disabled:opacity-50"
            >
              Konfirmasi Tarik Dana
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
