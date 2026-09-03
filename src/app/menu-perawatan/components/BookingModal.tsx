'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import EscrowTracker, { EscrowStatus } from '@/components/ui/EscrowTracker';
import Icon from '@/components/ui/AppIcon';
import { Provider } from '@/components/ui/ProviderCard';

interface BookingModalProps {
  provider: Provider;
  onClose: () => void;
}

type PickupMethod = 'antar' | 'jemput';
type BookingStep = 'detail' | 'payment' | 'tracking';

export default function BookingModal({ provider, onClose }: BookingModalProps) {
  const [step, setStep] = useState<BookingStep>('detail');
  const [pickupMethod, setPickupMethod] = useState<PickupMethod>('antar');
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>('menunggu_pembayaran');
  const [isProcessing, setIsProcessing] = useState(false);
  const [notes, setNotes] = useState('');

  const servicePrice = 35000;
  const pickupFee = pickupMethod === 'jemput' ? 10000 : 0;
  const total = servicePrice + pickupFee;

  const handlePayment = () => {
    setIsProcessing(true);
    // BACKEND: POST /api/transactions — create escrow transaction
    setTimeout(() => {
      setIsProcessing(false);
      setEscrowStatus('dana_ditahan');
      setStep('tracking');
      toast.success('Pembayaran berhasil! Dana ditahan sistem escrow.');
    }, 2000);
  };

  const handleConfirmDone = () => {
    setEscrowStatus('selesai');
    toast.success('Selesai! Dana dicairkan ke penyedia jasa.');
    setTimeout(onClose, 1500);
  };

  return (
    <Modal
      isOpen
      onClose={onClose}
      title={step === 'tracking' ? 'Status Pemesanan' : `Pesan ${provider.name}`}
      size="md"
    >
      {step === 'detail' && (
        <div className="space-y-4">
          {/* Provider Summary */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <div className="w-10 h-10 rounded-xl bg-primary/20 flex items-center justify-center font-800 text-primary flex-shrink-0">
              {provider.avatar}
            </div>
            <div>
              <p className="text-sm font-700 text-foreground">{provider.name}</p>
              <p className="text-xs text-muted-foreground">{provider.location}</p>
            </div>
          </div>

          {/* Pickup Method */}
          <div>
            <p className="text-xs font-700 text-foreground mb-2">Metode Pengambilan</p>
            <div className="grid grid-cols-2 gap-2">
              {([
                { key: 'antar' as PickupMethod, label: 'Antar Sendiri', icon: 'UserIcon', fee: 'Gratis' },
                { key: 'jemput' as PickupMethod, label: 'Dijemput', icon: 'TruckIcon', fee: '+Rp 10.000' },
              ]).map((method) => (
                <button
                  key={`method-${method.key}`}
                  onClick={() => setPickupMethod(method.key)}
                  className={`flex flex-col items-center gap-2 p-3 rounded-xl border-2 transition-all ${
                    pickupMethod === method.key
                      ? 'border-primary bg-secondary' :'border-border bg-card hover:border-accent'
                  }`}
                >
                  <Icon
                    name={method.icon as Parameters<typeof Icon>[0]['name']}
                    size={20}
                    className={pickupMethod === method.key ? 'text-primary' : 'text-muted-foreground'}
                  />
                  <div className="text-center">
                    <p className="text-xs font-600 text-foreground">{method.label}</p>
                    <p className={`text-[11px] font-600 ${pickupMethod === method.key ? 'text-primary' : 'text-muted-foreground'}`}>
                      {method.fee}
                    </p>
                  </div>
                </button>
              ))}
            </div>
          </div>

          {/* Notes */}
          <div>
            <label className="text-xs font-700 text-foreground block mb-1.5">
              Catatan untuk Penyedia
              <span className="text-muted-foreground font-400 ml-1">(opsional)</span>
            </label>
            <textarea
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: jahitan kancing di bagian depan, kancing warna putih"
              className="w-full bg-input border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
              rows={3}
            />
          </div>

          {/* Price Summary */}
          <div className="bg-muted rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Jasa Permak</span>
              <span className="font-600 text-foreground font-tabular">Rp {servicePrice.toLocaleString('id-ID')}</span>
            </div>
            {pickupFee > 0 && (
              <div className="flex justify-between text-xs">
                <span className="text-muted-foreground">Biaya Jemput</span>
                <span className="font-600 text-foreground font-tabular">Rp {pickupFee.toLocaleString('id-ID')}</span>
              </div>
            )}
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-700 text-foreground">Total</span>
              <span className="text-sm font-800 text-primary font-tabular">Rp {total.toLocaleString('id-ID')}</span>
            </div>
          </div>

          {/* Escrow Info */}
          <div className="flex items-start gap-2 p-3 bg-info-bg rounded-xl border border-info/30">
            <Icon name="LockClosedIcon" size={14} className="text-info flex-shrink-0 mt-0.5" />
            <p className="text-xs text-muted-foreground leading-relaxed">
              Pembayaran ditahan sistem escrow. Dana hanya cair ke penyedia setelah kamu konfirmasi pesanan selesai.
            </p>
          </div>

          <button
            onClick={() => setStep('payment')}
            className="btn-primary w-full py-3.5"
          >
            Lanjut ke Pembayaran
          </button>
        </div>
      )}

      {step === 'payment' && (
        <div className="space-y-4">
          <div className="text-center py-2">
            <div className="w-16 h-16 rounded-2xl gradient-green flex items-center justify-center mx-auto mb-3">
              <Icon name="CreditCardIcon" size={28} variant="solid" className="text-white" />
            </div>
            <p className="text-2xl font-800 text-primary font-tabular">
              Rp {total.toLocaleString('id-ID')}
            </p>
            <p className="text-xs text-muted-foreground mt-1">Dana akan ditahan escrow</p>
          </div>

          {/* Payment Methods */}
          <div className="space-y-2">
            <p className="text-xs font-700 text-foreground">Metode Pembayaran</p>
            {[
              { id: 'pay-gopay', label: 'GoPay', sub: 'Saldo: Rp 125.000', icon: 'DevicePhoneMobileIcon' },
              { id: 'pay-bca', label: 'Transfer BCA', sub: '1234567890', icon: 'BuildingLibraryIcon' },
              { id: 'pay-dana', label: 'DANA', sub: 'Saldo: Rp 78.500', icon: 'WalletIcon' },
            ].map((method, i) => (
              <label
                key={method.id}
                className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                  i === 0 ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-accent'
                }`}
              >
                <input
                  type="radio"
                  name="payment"
                  defaultChecked={i === 0}
                  className="accent-primary"
                />
                <Icon name={method.icon as Parameters<typeof Icon>[0]['name']} size={18} className="text-primary" />
                <div>
                  <p className="text-sm font-600 text-foreground">{method.label}</p>
                  <p className="text-xs text-muted-foreground">{method.sub}</p>
                </div>
              </label>
            ))}
          </div>

          <button
            onClick={handlePayment}
            disabled={isProcessing}
            className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Icon name="ArrowPathIcon" size={18} className="text-white animate-spin" />
                Memproses...
              </>
            ) : (
              <>
                <Icon name="LockClosedIcon" size={18} className="text-white" />
                Bayar & Tahan Escrow
              </>
            )}
          </button>
        </div>
      )}

      {step === 'tracking' && (
        <div className="space-y-4">
          <EscrowTracker status={escrowStatus} />

          <div className="card-elevated p-4 space-y-3">
            <p className="text-xs font-700 text-foreground">Status Pesanan</p>
            <div className="space-y-2">
              {[
                {
                  id: 'track-paid',
                  label: 'Pembayaran diterima',
                  time: 'Baru saja',
                  done: true,
                },
                {
                  id: 'track-confirm',
                  label: `${provider.name} mengkonfirmasi pesanan`,
                  time: 'Menunggu...',
                  done: false,
                },
                {
                  id: 'track-process',
                  label: 'Baju sedang dikerjakan',
                  time: 'Belum dimulai',
                  done: false,
                },
                {
                  id: 'track-done',
                  label: 'Selesai & siap diambil',
                  time: 'Belum dimulai',
                  done: false,
                },
              ].map((t) => (
                <div key={t.id} className="flex items-center gap-3">
                  <div className={`w-5 h-5 rounded-full flex items-center justify-center flex-shrink-0 ${t.done ? 'bg-accent' : 'bg-muted'}`}>
                    {t.done ? (
                      <Icon name="CheckIcon" size={12} variant="solid" className="text-white" />
                    ) : (
                      <div className="w-2 h-2 rounded-full bg-muted-foreground/40" />
                    )}
                  </div>
                  <div className="flex-1">
                    <p className={`text-xs font-600 ${t.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                      {t.label}
                    </p>
                  </div>
                  <span className="text-[10px] text-muted-foreground">{t.time}</span>
                </div>
              ))}
            </div>
          </div>

          {escrowStatus === 'dana_ditahan' && (
            <button
              onClick={handleConfirmDone}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            >
              <Icon name="CheckCircleIcon" size={18} className="text-white" />
              Konfirmasi Pesanan Selesai
            </button>
          )}
        </div>
      )}
    </Modal>
  );
}