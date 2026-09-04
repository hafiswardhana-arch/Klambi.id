'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function KeputusanPage() {
  const router = useRouter();

  return (
    <AppLayout title="Pusat Keputusan Sirkular" showBack backHref="/wearwise-ai">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md space-y-1.5 relative overflow-hidden">
          <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Decision Hub 5.4
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Tentukan Langkah untuk Pakaianmu
          </h2>
          <p className="text-xs text-white/80 leading-relaxed">
            Pilih apakah Anda ingin menghasilkan uang dari pakaian bekas Anda atau merawatnya agar dapat dipakai lebih lama.
          </p>
        </div>

        {/* 2 Opsi Keputusan Utama (Bagian 5.4) */}
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-2">
          {/* OPSI 1: INGIN DIJUAL */}
          <div
            onClick={() => router.push('/jual')}
            className="bg-card rounded-3xl p-6 border-2 border-border hover:border-[#10284D] shadow-sm hover:shadow-lg transition-all cursor-pointer space-y-4 group active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-blue-100 group-hover:bg-[#10284D] text-[#10284D] group-hover:text-white flex items-center justify-center text-3xl transition-all shadow-inner">
              💰
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#10284D]">Ingin Dijual</h3>
                <span className="text-xs text-[#E86D50] font-extrabold group-hover:translate-x-1 transition-transform">
                  Pilih →
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Uangkan pakaian bekas Anda! Jual satuan di <strong>Trif (Thrift)</strong> atau jual borongan kiloan untuk <strong>Upcycle</strong> dengan sistem pembayaran Escrow aman.
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] font-bold text-blue-700">
              <span>🛍️ Thrift Satuan</span>
              <span>•</span>
              <span>♻️ Upcycle Kiloan (Min 5kg)</span>
            </div>
          </div>

          {/* OPSI 2: BUTUH PERAWATAN */}
          <div
            onClick={() => router.push('/care-plan')}
            className="bg-card rounded-3xl p-6 border-2 border-border hover:border-emerald-600 shadow-sm hover:shadow-lg transition-all cursor-pointer space-y-4 group active:scale-[0.98]"
          >
            <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white flex items-center justify-center text-3xl transition-all shadow-inner">
              ✨
            </div>

            <div className="space-y-1.5">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-extrabold text-[#10284D]">Butuh Perawatan</h3>
                <span className="text-xs text-emerald-600 font-extrabold group-hover:translate-x-1 transition-transform">
                  Pilih →
                </span>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">
                Rawat pakaian kesayangan Anda! Dapatkan <strong>Care Plan</strong>, beli produk deterjen lembaran Kindfoam, atau pesan jasa <strong>Permak / Binatu / Re-Color</strong> terdekat.
              </p>
            </div>

            <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] font-bold text-emerald-700">
              <span>🧼 Eco-Deterjen</span>
              <span>•</span>
              <span>🧵 Permak / Binatu / Re-color</span>
            </div>
          </div>
        </div>

        {/* Back navigation */}
        <div className="pt-3 text-center">
          <button
            onClick={() => router.push('/wearwise-ai')}
            className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-muted transition-all"
          >
            <Icon name="ArrowLeftIcon" size={14} />
            <span>Kembali ke Kamera Scan Wearwise AI</span>
          </button>
        </div>
      </div>
    </AppLayout>
  );
}
