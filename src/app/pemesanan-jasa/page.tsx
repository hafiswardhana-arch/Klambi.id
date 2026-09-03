'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function PemesananJasaPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const providerName = searchParams.get('provider') || 'Taylor Studio Artisan Fatmawati';

  // Toggle metode penyerahan
  const [deliveryMethod, setDeliveryMethod] = useState<'diantar' | 'dijemput'>('dijemput');

  const [addressNotes, setAddressNotes] = useState(
    'Jl. Senopati No. 42, Kebayoran Baru, Jakarta Selatan'
  );
  const [garmentNotes, setGarmentNotes] = useState('Kemeja Flannel Sage Green - Potong lengan 2 cm');

  const priceBase = 45000;
  const pickupFee = deliveryMethod === 'dijemput' ? 15000 : 0;
  const grandTotal = priceBase + pickupFee;

  const handleProceedToPayment = () => {
    router.push(`/pembayaran?total=${grandTotal}&title=${encodeURIComponent(providerName)}`);
  };

  return (
    <AppLayout title="Form Pemesanan Jasa" showBack backHref="/cari-jasa">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Mitra Info Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold">
            <Icon name="WrenchScrewdriverIcon" size={20} />
          </div>
          <div>
            <h3 className="text-xs font-extrabold text-foreground">{providerName}</h3>
            <p className="text-[10px] text-muted-foreground">Layanan Permak & Perawatan Sirkular</p>
          </div>
        </div>

        {/* 6.5 Toggle Card Metode Penyerahan */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground block">Pilih Metode Penyerahan Baju:</label>
          <div className="grid grid-cols-2 gap-3">
            {/* Diantar */}
            <div
              onClick={() => setDeliveryMethod('diantar')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                deliveryMethod === 'diantar'
                  ? 'border-[#10284D] bg-secondary/50 shadow-sm'
                  : 'border-border bg-card hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-blue-100 text-[#10284D] mx-auto flex items-center justify-center">
                <Icon name="TruckIcon" size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Diantar Sendiri</h4>
                <p className="text-[10px] text-muted-foreground">Antar langsung ke lokasi mitra</p>
              </div>
            </div>

            {/* Dijemput */}
            <div
              onClick={() => setDeliveryMethod('dijemput')}
              className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-2 ${
                deliveryMethod === 'dijemput'
                  ? 'border-[#10284D] bg-secondary/50 shadow-sm'
                  : 'border-border bg-card hover:border-gray-300'
              }`}
            >
              <div className="w-10 h-10 rounded-full bg-emerald-100 text-emerald-800 mx-auto flex items-center justify-center">
                <Icon name="HomeIcon" size={20} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Dijemput Kurir</h4>
                <p className="text-[10px] text-muted-foreground">Kurir Klámbi jemput ke rumah (+Rp 15rb)</p>
              </div>
            </div>
          </div>
        </div>

        {/* Form Alamat jika Dijemput */}
        {deliveryMethod === 'dijemput' && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-2">
            <label className="text-xs font-bold text-foreground flex items-center gap-1.5">
              <Icon name="MapPinIcon" size={16} className="text-primary" />
              Alamat Penjemputan Pakaian:
            </label>
            <textarea
              rows={2}
              value={addressNotes}
              onChange={(e) => setAddressNotes(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl p-3 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>
        )}

        {/* Catatan Perbaikan / Pakaian */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-2">
          <label className="text-xs font-bold text-foreground block">Catatan Instruksi Pakaian:</label>
          <input
            type="text"
            value={garmentNotes}
            onChange={(e) => setGarmentNotes(e.target.value)}
            className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
          />
        </div>

        {/* Cost Summary */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-2">
          <h4 className="text-xs font-bold text-foreground border-b border-border pb-2">Rincian Biaya</h4>
          <div className="flex justify-between text-xs text-muted-foreground">
            <span>Biaya Jasa Dasar</span>
            <span>Rp {priceBase.toLocaleString('id-ID')}</span>
          </div>
          {deliveryMethod === 'dijemput' && (
            <div className="flex justify-between text-xs text-muted-foreground">
              <span>Ongkos Penjemputan Kurir</span>
              <span>Rp {pickupFee.toLocaleString('id-ID')}</span>
            </div>
          )}
          <div className="flex justify-between text-xs font-extrabold text-foreground pt-2 border-t border-border">
            <span>Total Pembayaran</span>
            <span className="text-[#E86D50]">Rp {grandTotal.toLocaleString('id-ID')}</span>
          </div>
        </div>

        {/* Action Button */}
        <button
          onClick={handleProceedToPayment}
          className="w-full bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
        >
          Lanjut ke Pembayaran Escrow (Rp {grandTotal.toLocaleString('id-ID')})
        </button>
      </div>
    </AppLayout>
  );
}
