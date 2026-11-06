'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { SlideUp, StaggerContainer, StaggerItem, AnimatedCard, AnimatedButton } from '@/components/motion';

export default function KeputusanPage() {
  const router = useRouter();

  return (
    <AppLayout title="Pusat Keputusan Sirkular" showBack backHref="/wearwise-ai">
      <div className="max-w-2xl mx-auto space-y-5 pb-24 select-none">
        {/* Banner Hero */}
        <SlideUp duration={400}>
          <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-6 shadow-md space-y-2 relative overflow-hidden">
            <div className="flex items-center gap-2">
              <span className="bg-white/20 text-white text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider backdrop-blur-xs">
                Decision Hub 5.4
              </span>
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-400 animate-pulse" />
            </div>
            <h2 className="text-lg sm:text-xl font-black tracking-tight">
              Tentukan Langkah untuk Pakaianmu
            </h2>
            <p className="text-xs text-white/80 leading-relaxed max-w-lg">
              Pilih apakah Anda ingin menghasilkan nilai ekonomi dari pakaian bekas Anda atau merawatnya agar dapat dipakai lebih lama secara sirkular.
            </p>
          </div>
        </SlideUp>

        {/* 2 Opsi Keputusan Utama (Bagian 5.4) */}
        <StaggerContainer staggerDelay={120} className="grid grid-cols-1 sm:grid-cols-2 gap-4 pt-1">
          {/* OPSI 1: INGIN DIJUAL */}
          <StaggerItem>
            <AnimatedCard
              onClick={() => router.push('/jual')}
              hoverLift
              hoverGlow
              className="bg-card rounded-3xl p-6 border-2 border-border hover:border-[#10284D] shadow-sm cursor-pointer space-y-4 group transition-colors duration-250"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-blue-100 group-hover:bg-[#10284D] text-[#10284D] group-hover:text-white flex items-center justify-center text-3xl transition-colors duration-250 shadow-inner">
                  💰
                </div>
                <span className="text-xs text-[#E86D50] font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                  Pilih <span aria-hidden="true">&rarr;</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-[#10284D]">Ingin Dijual</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Uangkan pakaian bekas Anda! Jual satuan di <strong>Trif (Thrift)</strong> atau jual borongan kiloan untuk <strong>Upcycle</strong> dengan sistem pembayaran Escrow aman.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] font-bold text-blue-700">
                <span>🛍️ Thrift Satuan</span>
                <span>•</span>
                <span>♻️ Upcycle Kiloan (Min 5kg)</span>
              </div>
            </AnimatedCard>
          </StaggerItem>

          {/* OPSI 2: BUTUH PERAWATAN */}
          <StaggerItem>
            <AnimatedCard
              onClick={() => router.push('/care-plan')}
              hoverLift
              hoverGlow
              className="bg-card rounded-3xl p-6 border-2 border-border hover:border-emerald-600 shadow-sm cursor-pointer space-y-4 group transition-colors duration-250"
            >
              <div className="flex items-center justify-between">
                <div className="w-14 h-14 rounded-2xl bg-emerald-100 group-hover:bg-emerald-700 text-emerald-800 group-hover:text-white flex items-center justify-center text-3xl transition-colors duration-250 shadow-inner">
                  ✨
                </div>
                <span className="text-xs text-emerald-600 font-extrabold flex items-center gap-1 group-hover:translate-x-1 transition-transform duration-200">
                  Pilih <span aria-hidden="true">&rarr;</span>
                </span>
              </div>

              <div className="space-y-1.5">
                <h3 className="text-base font-extrabold text-[#10284D]">Butuh Perawatan</h3>
                <p className="text-xs text-muted-foreground leading-relaxed">
                  Rawat pakaian kesayangan Anda! Dapatkan <strong>Care Plan</strong>, beli produk deterjen lembaran Kindfoam, atau pesan jasa <strong>Permak / Binatu / Re-Color</strong> terdekat.
                </p>
              </div>

              <div className="pt-2 border-t border-border flex items-center gap-2 text-[11px] font-bold text-emerald-700">
                <span>🧼 Eco-Deterjen</span>
                <span>•</span>
                <span>🧵 Permak / Binatu / Re-color</span>
              </div>
            </AnimatedCard>
          </StaggerItem>
        </StaggerContainer>

        {/* Back navigation */}
        <div className="pt-4 text-center">
          <AnimatedButton
            onClick={() => router.push('/wearwise-ai')}
            className="text-xs font-bold text-muted-foreground hover:text-foreground inline-flex items-center gap-1.5 py-2 px-4 rounded-xl hover:bg-muted"
          >
            <Icon name="ArrowLeftIcon" size={14} />
            <span>Kembali ke Kamera Scan Wearwise AI</span>
          </AnimatedButton>
        </div>
      </div>
    </AppLayout>
  );
}
