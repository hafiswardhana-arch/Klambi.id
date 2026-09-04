'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import DecisionButtonPair from '@/components/ui/DecisionButtonPair';

export default function JualPage() {
  const router = useRouter();
  const [mode, setMode] = useState<'recommendation' | 'manual'>('recommendation');

  // AI Recommendation for selling
  const aiRecommendation = {
    type: 'trif' as 'trif' | 'upcycle',
    typeLabel: 'TRIF (Thrift Satuan di Marketplace)',
    targetHref: '/jual/trif',
    reason: 'Berdasarkan skor serat (88/100) dan kondisi bahan yang masih sangat bagus, pakaian ini lebih menguntungkan jika dijual satuan ke pembeli umum melalui Klámbi Trift Marketplace.',
    estimatedValue: 'Rp 160.000 – Rp 195.000',
  };

  return (
    <AppLayout title="Cabang Penjualan Pakaian" showBack backHref="/keputusan">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#10284D] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md space-y-1">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Sub-Keputusan 5.5.1
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Pilih Metode Penjualan: Trif vs Upcycle
          </h2>
          <p className="text-xs text-white/85">
            Semua hasil penjualan dilindungi oleh sistem Rekening Bersama (Escrow) Klámbi.
          </p>
        </div>

        {/* View 1: Rekomendasi AI */}
        {mode === 'recommendation' ? (
          <div className="space-y-4 animate-scale-in">
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 bg-emerald-100 px-2.5 py-1 rounded-full">
                  ✨ Rekomendasi Terbaik AI
                </span>
                <span className="text-xs font-bold text-[#E86D50]">
                  Est. {aiRecommendation.estimatedValue}
                </span>
              </div>

              <div className="flex items-start gap-3.5">
                <div className="w-12 h-12 rounded-2xl bg-blue-100 flex items-center justify-center text-2xl flex-shrink-0">
                  🛍️
                </div>
                <div className="space-y-1">
                  <h3 className="text-sm font-extrabold text-[#10284D]">
                    {aiRecommendation.typeLabel}
                  </h3>
                  <p className="text-xs text-muted-foreground leading-relaxed">
                    {aiRecommendation.reason}
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Buttons (Bagian 1 & 5.5.1) */}
            <DecisionButtonPair
              continueText="Lanjutkan Sesuai Rekomendasi (Trif) →"
              continueHref="/jual/trif"
              backText="Pilih Manual (Trif / Upcycle)"
              onBack={() => setMode('manual')}
            />
          </div>
        ) : (
          /* View 2: Pilihan Manual (5.5.1a vs 5.5.1b) */
          <div className="space-y-4 animate-scale-in">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3.5">
              {/* Card 1: TRIF */}
              <div
                onClick={() => router.push('/jual/trif')}
                className="bg-card rounded-3xl p-5 border-2 border-border hover:border-[#10284D] shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-blue-100 group-hover:bg-[#10284D] text-[#10284D] group-hover:text-white flex items-center justify-center text-2xl transition-all shadow-inner">
                  🛍️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#10284D]">1. Trif (Thrift Satuan)</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Jual pakaian satuan langsung ke pembeli di marketplace dengan deskripsi otomatis dari AI.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-blue-700 pt-1">
                  Pilih Trif Satuan →
                </div>
              </div>

              {/* Card 2: UPCYCLE */}
              <div
                onClick={() => router.push('/jual/upcycle')}
                className="bg-card rounded-3xl p-5 border-2 border-border hover:border-emerald-600 shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3 group active:scale-[0.98]"
              >
                <div className="w-12 h-12 rounded-2xl bg-emerald-100 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white flex items-center justify-center text-2xl transition-all shadow-inner">
                  ♻️
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#10284D]">2. Upcycle (Kiloan / Borongan)</h3>
                  <p className="text-xs text-muted-foreground mt-1 leading-relaxed">
                    Jual borongan (minimal 5kg) ke mitra pengepul terdekat untuk disalurkan ke UMKM / Industri daur ulang.
                  </p>
                </div>
                <div className="text-[11px] font-bold text-emerald-700 pt-1">
                  Pilih Upcycle Kiloan →
                </div>
              </div>
            </div>

            <button
              onClick={() => setMode('recommendation')}
              className="w-full text-xs font-bold text-muted-foreground hover:text-foreground py-2 text-center"
            >
              ← Kembali ke Rekomendasi AI
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
