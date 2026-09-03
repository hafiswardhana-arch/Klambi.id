'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { PaymentMethodItem } from './PaymentMethodsSection';

interface PaymentMethodModalProps {
  onClose: () => void;
  onSave: (method: PaymentMethodItem) => void;
}

export default function PaymentMethodModal({
  onClose,
  onSave,
}: PaymentMethodModalProps) {
  const [type, setType] = useState<'ewallet' | 'bank' | 'card'>('ewallet');
  const [providerName, setProviderName] = useState('GoPay');
  const [accountNumber, setAccountNumber] = useState('');
  const [isPrimary, setIsPrimary] = useState(false);

  const ewalletOptions = ['GoPay', 'OVO', 'ShopeePay', 'DANA', 'LinkAja'];
  const bankOptions = ['BCA Virtual Account', 'Mandiri Virtual Account', 'BRImo', 'BNI'];
  const cardOptions = ['Kartu Debit Visa / Mastercard', 'Kartu Kredit'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!accountNumber.trim()) return;

    const newMethod: PaymentMethodItem = {
      id: `pm-${Date.now()}`,
      type,
      name: providerName,
      accountNumber,
      isPrimary,
      status: 'Terhubung',
    };

    onSave(newMethod);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="CreditCardIcon" size={18} />
            </div>
            <h3 className="text-base font-bold text-foreground">Tambah Metode Pembayaran</h3>
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
          {/* Method Type Selector */}
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Pilih Jenis Pembayaran
            </label>
            <div className="grid grid-cols-3 gap-2">
              <button
                type="button"
                onClick={() => {
                  setType('ewallet');
                  setProviderName('GoPay');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 ${
                  type === 'ewallet'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-input text-foreground border-border hover:border-accent'
                }`}
              >
                <span>📱</span>
                <span>E-Wallet</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('bank');
                  setProviderName('BCA Virtual Account');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 ${
                  type === 'bank'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-input text-foreground border-border hover:border-accent'
                }`}
              >
                <span>🏦</span>
                <span>Transfer Bank</span>
              </button>

              <button
                type="button"
                onClick={() => {
                  setType('card');
                  setProviderName('Kartu Debit Visa / Mastercard');
                }}
                className={`py-2 px-2 rounded-xl text-xs font-semibold border flex flex-col items-center gap-1 ${
                  type === 'card'
                    ? 'bg-primary text-white border-primary'
                    : 'bg-input text-foreground border-border hover:border-accent'
                }`}
              >
                <span>💳</span>
                <span>Kartu Debit/CC</span>
              </button>
            </div>
          </div>

          {/* Provider Selection */}
          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Penyedia Layanan
            </label>
            <select
              value={providerName}
              onChange={(e) => setProviderName(e.target.value)}
              className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring cursor-pointer"
            >
              {(type === 'ewallet'
                ? ewalletOptions
                : type === 'bank'
                ? bankOptions
                : cardOptions
              ).map((opt) => (
                <option key={opt} value={opt}>
                  {opt}
                </option>
              ))}
            </select>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              {type === 'ewallet'
                ? 'Nomor Handphone Terdaftar di E-Wallet'
                : type === 'bank'
                ? 'Nomor Rekening Bank'
                : 'Nomor Kartu (16 Digit)'}
            </label>
            <input
              type="text"
              value={accountNumber}
              onChange={(e) => setAccountNumber(e.target.value)}
              placeholder={
                type === 'ewallet'
                  ? '0812-xxxx-xxxx'
                  : type === 'bank'
                  ? 'Contoh: 8271092811'
                  : '4111 2222 3333 4444'
              }
              required
              className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          <label className="flex items-center gap-2 cursor-pointer pt-1">
            <input
              type="checkbox"
              checked={isPrimary}
              onChange={(e) => setIsPrimary(e.target.checked)}
              className="rounded border-border text-primary focus:ring-primary w-4 h-4"
            />
            <span className="text-xs text-foreground font-medium">
              Jadikan metode pembayaran utama
            </span>
          </label>

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
              className="btn-primary flex-1 py-2.5 text-xs font-semibold"
            >
              Hubungkan & Simpan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
