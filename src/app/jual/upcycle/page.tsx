'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import DecisionButtonPair from '@/components/ui/DecisionButtonPair';

interface CollectionPartner {
  id: string;
  name: string;
  distanceKm: number;
  rating: number;
  acceptedFabrics: string[];
  ratePerKg: number;
  address: string;
}

const initialPartners: CollectionPartner[] = [
  {
    id: 'pt-1',
    name: 'Mitra Pengepul Sirkular Senopati',
    distanceKm: 1.2,
    rating: 4.9,
    acceptedFabrics: ['Denim', 'Katun', 'Linen', 'Polyester'],
    ratePerKg: 12000,
    address: 'Jl. Senopati Dalam No. 14, Jakarta Selatan',
  },
  {
    id: 'pt-2',
    name: 'Bank Sampah Tekstil Kemang Artisan',
    distanceKm: 2.8,
    rating: 4.8,
    acceptedFabrics: ['Denim', 'Katun Organik', 'Wool'],
    ratePerKg: 14000,
    address: 'Jl. Kemang Timur No. 88, Jakarta Selatan',
  },
  {
    id: 'pt-3',
    name: 'Hub Daur Ulang Tekstil Tebet',
    distanceKm: 3.5,
    rating: 4.7,
    acceptedFabrics: ['Semua Jenis Kain'],
    ratePerKg: 10000,
    address: 'Jl. Tebet Barat Raya No. 21, Jakarta Selatan',
  },
];

export default function UpcycleSellPage() {
  const router = useRouter();

  // Weight & Validation State (Min. 5kg as specified in Section 5.5.1b)
  const [weightKg, setWeightKg] = useState<number>(6);
  const [deliveryMethod, setDeliveryMethod] = useState<'dijemput' | 'diantar'>('dijemput');
  const [selectedPartner, setSelectedPartner] = useState<CollectionPartner>(initialPartners[0]);
  const [activeSubTab, setActiveSubTab] = useState<'user_flow' | 'mitra_ecosystem'>('user_flow');

  const isWeightValid = weightKg >= 5;
  const estimatedPayout = weightKg * selectedPartner.ratePerKg;
  const shippingFee = deliveryMethod === 'dijemput' ? 15000 : 8000;

  const handleSubmitOrder = () => {
    if (!isWeightValid) {
      toast.error('Berat minimal untuk penjualan upcycle borongan adalah 5 kg!');
      return;
    }

    toast.success(
      deliveryMethod === 'dijemput'
        ? `Pesanan berhasil! Kurir mitra ${selectedPartner.name} akan menjemput paket Anda.`
        : `Pesanan berhasil! Silakan kirimkan paket ke alamat ${selectedPartner.name}.`
    );
    router.push('/profil');
  };

  return (
    <AppLayout title="Jual Kiloan (Upcycle Pengepul)" showBack backHref="/jual">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md space-y-1">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Alur 5.5.1b: Upcycle Kiloan
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Jual Borongan Tekstil ke Mitra Pengepul
          </h2>
          <p className="text-xs text-white/85">
            Pakaian Anda akan dipilah dan didistribusikan ke UMKM pengrajin & industri daur ulang kain.
          </p>
        </div>

        {/* Tab Toggle: Alur User vs Sub-Alur Ekosistem Mitra */}
        <div className="flex bg-muted p-1 rounded-2xl border border-border text-xs font-bold">
          <button
            onClick={() => setActiveSubTab('user_flow')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeSubTab === 'user_flow'
                ? 'bg-white text-[#10284D] shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            📦 Form Penjualan Upcycle
          </button>
          <button
            onClick={() => setActiveSubTab('mitra_ecosystem')}
            className={`flex-1 py-2 rounded-xl transition-all ${
              activeSubTab === 'mitra_ecosystem'
                ? 'bg-white text-[#10284D] shadow-xs'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            🔄 Sub-Alur Mitra & UMKM
          </button>
        </div>

        {activeSubTab === 'user_flow' ? (
          <div className="space-y-4 animate-scale-in">
            {/* 1. Input Berat dengan Validasi Min 5kg */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <label className="text-xs font-extrabold text-[#10284D]">
                  ⚖️ Estimasi Berat Pakaian:
                </label>
                <span
                  className={`text-[10px] font-bold px-2 py-0.5 rounded ${
                    isWeightValid
                      ? 'bg-emerald-100 text-emerald-800'
                      : 'bg-rose-100 text-rose-800 animate-pulse'
                  }`}
                >
                  {isWeightValid ? '✓ Memenuhi Syarat (Min. 5kg)' : '⚠️ Minimal 5kg'}
                </span>
              </div>

              <div className="flex items-center gap-3">
                <input
                  type="range"
                  min={1}
                  max={50}
                  step={1}
                  value={weightKg}
                  onChange={(e) => setWeightKg(Number(e.target.value))}
                  className="flex-1 accent-[#10284D] cursor-pointer"
                />
                <div className="flex items-baseline gap-1 bg-muted px-4 py-2 rounded-2xl border border-border">
                  <span className="text-lg font-black text-[#10284D]">{weightKg}</span>
                  <span className="text-xs font-bold text-muted-foreground">kg</span>
                </div>
              </div>

              {!isWeightValid && (
                <div className="bg-rose-50 border border-rose-200 text-rose-800 text-xs p-3 rounded-2xl flex items-center gap-2">
                  <Icon name="ExclamationTriangleIcon" size={16} />
                  <span>
                    Penjualan upcycle borongan membutuhkan minimal <strong>5 kg</strong> pakaian. Kumpulkan lebih banyak pakaian lama Anda!
                  </span>
                </div>
              )}
            </div>

            {/* 2. Pilih Mitra Pengepul Terdekat */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h3 className="text-xs font-black uppercase tracking-wider text-[#10284D]">
                  📍 Mitra Pengepul Terdekat
                </h3>
                <span className="text-[10px] text-muted-foreground">Senopati, Jaksel</span>
              </div>

              <div className="space-y-2.5">
                {initialPartners.map((partner) => (
                  <div
                    key={partner.id}
                    onClick={() => setSelectedPartner(partner)}
                    className={`p-3.5 rounded-2xl border-2 cursor-pointer transition-all flex items-center justify-between ${
                      selectedPartner.id === partner.id
                        ? 'border-[#10284D] bg-blue-50/40 shadow-xs'
                        : 'border-border bg-card hover:border-gray-300'
                    }`}
                  >
                    <div className="space-y-1">
                      <div className="flex items-center gap-2">
                        <h4 className="text-xs font-extrabold text-[#10284D]">{partner.name}</h4>
                        <span className="text-[10px] bg-secondary text-primary font-bold px-1.5 py-0.2 rounded">
                          📍 {partner.distanceKm} km
                        </span>
                      </div>
                      <p className="text-[11px] text-muted-foreground">{partner.address}</p>
                      <div className="text-[10px] text-emerald-700 font-bold">
                        Tarif: Rp {partner.ratePerKg.toLocaleString('id-ID')}/kg • ⭐ {partner.rating}
                      </div>
                    </div>

                    <input
                      type="radio"
                      name="partner"
                      checked={selectedPartner.id === partner.id}
                      onChange={() => setSelectedPartner(partner)}
                      className="w-4 h-4 accent-[#10284D]"
                    />
                  </div>
                ))}
              </div>
            </div>

            {/* 3. Metode Pengiriman: Dijemput vs Diantar (Section 5.5.1b) */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <label className="text-xs font-extrabold text-[#10284D] block">
                🚚 Pilih Metode Pengiriman & Penyerahan:
              </label>

              <div className="grid grid-cols-2 gap-3">
                {/* Dijemput */}
                <div
                  onClick={() => setDeliveryMethod('dijemput')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-1.5 ${
                    deliveryMethod === 'dijemput'
                      ? 'border-[#10284D] bg-blue-50/50 shadow-xs'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-2xl block">🏠</span>
                  <h4 className="text-xs font-extrabold text-[#10284D]">Dijemput Mitra</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Mitra jemput ke rumah, cek fisik langsung di lokasi & konfirmasi di tempat.
                  </p>
                </div>

                {/* Diantar */}
                <div
                  onClick={() => setDeliveryMethod('diantar')}
                  className={`p-4 rounded-2xl border-2 cursor-pointer transition-all text-center space-y-1.5 ${
                    deliveryMethod === 'diantar'
                      ? 'border-[#10284D] bg-blue-50/50 shadow-xs'
                      : 'border-border bg-card'
                  }`}
                >
                  <span className="text-2xl block">📦</span>
                  <h4 className="text-xs font-extrabold text-[#10284D]">Diantar Sendiri</h4>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Kirim via ekspedisi. Mitra memverifikasi paket saat sampai. Dana cair dalam 2 hari.
                  </p>
                </div>
              </div>

              {/* Status Escrow Payout Info */}
              <div className="bg-emerald-50 p-3.5 rounded-2xl border border-emerald-200 text-xs text-emerald-950 space-y-1">
                <div className="flex items-center justify-between font-extrabold">
                  <span>Estimasi Dana yang Anda Terima:</span>
                  <span className="text-sm text-emerald-800">
                    Rp {estimatedPayout.toLocaleString('id-ID')}
                  </span>
                </div>
                <p className="text-[11px] text-emerald-800">
                  {deliveryMethod === 'dijemput'
                    ? '⚡ Saldo otomatis dicairkan ke dompet Klámbi setelah mitra selesai menimbang & menyetujui di tempat.'
                    : '⏳ Status Escrow: Dana akan cair ke dompet Anda dalam waktu 2 hari kerja setelah paket diterima & diverifikasi mitra.'}
                </p>
              </div>
            </div>

            {/* Submit Button */}
            <button
              onClick={handleSubmitOrder}
              disabled={!isWeightValid}
              className="w-full bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md hover:bg-[#163768] active:scale-95 transition-all disabled:opacity-50"
            >
              Proses Penjualan Upcycle (Rp {estimatedPayout.toLocaleString('id-ID')})
            </button>
          </div>
        ) : (
          /* Sub-Alur Ekosistem Mitra (Section 5.5.1b Specification) */
          <div className="space-y-4 animate-scale-in">
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
              <h3 className="text-xs font-black uppercase tracking-wider text-[#10284D] border-b border-border pb-2">
                🔄 Simulasi Rantai Nilai Mitra Pengepul
              </h3>

              {/* Flow 1: Mitra -> UMKM Pengrajin */}
              <div className="bg-blue-50/60 p-4 rounded-2xl border border-blue-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-[#10284D] font-extrabold">
                  <span>🧵</span>
                  <h4>1. Penjualan ke UMKM / Pengrajin Daur Ulang</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Mitra memilah kain per jenis bahan (denim, katun, tenun). UMKM artisan membeli bahan terpilih sesuai kebutuhan (bukan per-ball), lalu mengolahnya menjadi tas, jaket patchwork, atau aksesoris bernilai tinggi, dan menjualnya kembali di <strong>Marketplace Klámbi</strong>.
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-blue-200 text-[10px] text-blue-900 font-bold">
                  Status Transaksi: Pembelian Bahan ➔ Olah Upcycle ➔ Listing Kembali di Market
                </div>
              </div>

              {/* Flow 2: Mitra -> Industri Tekstil */}
              <div className="bg-emerald-50/60 p-4 rounded-2xl border border-emerald-100 space-y-2 text-xs">
                <div className="flex items-center gap-2 text-emerald-900 font-extrabold">
                  <span>🏭</span>
                  <h4>2. Penjualan ke Industri Daur Ulang Tekstil</h4>
                </div>
                <p className="text-[11px] text-muted-foreground leading-relaxed">
                  Bahan kain rusak berat dihancurkan dan dipintal ulang menjadi benang daur ulang (recycled yarn) atau kain perca industri. Industri juga dapat menjual kain perca terpilah di ekosistem sirkular Klámbi.
                </p>
                <div className="bg-white p-2.5 rounded-xl border border-emerald-200 text-[10px] text-emerald-900 font-bold">
                  Status Transaksi: Pembelian Kiloan Besar ➔ Ekstraksi Serat ➔ Zero Waste Textile
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveSubTab('user_flow')}
              className="w-full border-2 border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold text-center"
            >
              ← Kembali ke Form Penjualan
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
