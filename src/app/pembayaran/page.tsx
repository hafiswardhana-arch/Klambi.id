'use client';

import React, { useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function PembayaranPage() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const totalAmount = Number(searchParams.get('total')) || 320000;
  const title = searchParams.get('title') || 'Pesanan Layanan Sirkular Klámbi';

  const [selectedMethod, setSelectedMethod] = useState<string>('gopay');
  const [isProcessing, setIsProcessing] = useState(false);

  const paymentOptions = [
    { id: 'gopay', name: 'GoPay', icon: '⚡', desc: 'Instan via aplikasi Gojek' },
    { id: 'shopeepay', name: 'ShopeePay', icon: '🛍️', desc: 'Instan via aplikasi Shopee' },
    { id: 'bni_va', name: 'Transfer Bank BNI VA', icon: '🏦', desc: 'Virtual Account BNI' },
    { id: 'bca_va', name: 'Transfer Bank BCA VA', icon: '💳', desc: 'Virtual Account BCA' },
    { id: 'mandiri_va', name: 'Mandiri Livin Virtual Account', icon: '🏛️', desc: 'Virtual Account Mandiri' },
  ];

  const handlePayNow = () => {
    setIsProcessing(true);
    setTimeout(() => {
      setIsProcessing(false);
      toast.success(
        `Pembayaran Rp ${totalAmount.toLocaleString('id-ID')} Berhasil! Dana ditahan di Rekening Bersama Escrow Klámbi.`
      );
      router.push('/profil');
    }, 1800);
  };

  return (
    <AppLayout title="Pembayaran (Escrow)" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Escrow Protection Banner */}
        <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2">
          <div className="flex items-center gap-2 text-[#E8C547] text-xs font-bold">
            <Icon name="ShieldCheckIcon" size={18} />
            <span>Garansi Rekening Bersama (Escrow Klámbi)</span>
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            Dana Anda ditahan dengan aman oleh sistem Klámbi dan <b>baru akan dicairkan ke penjual/mitra</b> setelah Anda menerima barang/layanan dan menekan tombol konfirmasi di profil.
          </p>
        </div>

        {/* Order Title & Amount */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center justify-between">
          <div>
            <span className="text-[10px] text-muted-foreground font-semibold block">Total Pembayaran</span>
            <span className="text-lg font-extrabold text-[#E86D50]">
              Rp {totalAmount.toLocaleString('id-ID')}
            </span>
          </div>
          <span className="text-xs font-bold text-foreground max-w-[180px] text-right truncate">
            {title}
          </span>
        </div>

        {/* 6.6 Payment Options */}
        <div className="space-y-2">
          <label className="text-xs font-bold text-foreground block">Pilih Metode Pembayaran:</label>
          <div className="space-y-2">
            {paymentOptions.map((opt) => (
              <div
                key={opt.id}
                onClick={() => setSelectedMethod(opt.id)}
                className={`p-4 rounded-2xl border cursor-pointer transition-all flex items-center justify-between ${
                  selectedMethod === opt.id
                    ? 'border-[#10284D] bg-secondary/40 shadow-sm'
                    : 'border-border bg-card hover:border-gray-300'
                }`}
              >
                <div className="flex items-center gap-3">
                  <span className="text-xl">{opt.icon}</span>
                  <div>
                    <h4 className="text-xs font-bold text-foreground">{opt.name}</h4>
                    <p className="text-[10px] text-muted-foreground">{opt.desc}</p>
                  </div>
                </div>
                <input
                  type="radio"
                  name="payment"
                  checked={selectedMethod === opt.id}
                  onChange={() => setSelectedMethod(opt.id)}
                  className="w-4 h-4 accent-[#10284D] cursor-pointer"
                />
              </div>
            ))}
          </div>
        </div>

        {/* Pay Button */}
        <button
          onClick={handlePayNow}
          disabled={isProcessing}
          className="w-full bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all disabled:opacity-50"
        >
          {isProcessing ? 'Memproses Pembayaran...' : `Bayar Sekarang (Rp ${totalAmount.toLocaleString('id-ID')})`}
        </button>
      </div>
    </AppLayout>
  );
}
