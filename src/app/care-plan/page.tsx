'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function CarePlanPage() {
  const router = useRouter();

  // Garment Diagnosis Data (Section 5.6.1 Specification)
  const garmentData = {
    title: 'Kemeja Flannel Sage Green',
    category: 'Kemeja Katun Organik',
    difficulty: 'Sedang' as 'Mudah' | 'Sedang' | 'Sulit',
    difficultyColor: 'bg-amber-100 text-amber-800 border-amber-300',
    summaryProblem: 'Warna kain mulai pudar di area lipatan kerah & siku, serta serat terasa kaku.',
    causeDiagnosis:
      'Disebabkan oleh penggunaan deterjen berbusa tinggi dengan residu alkali berlebih, pencucian dengan air panas, serta paparan sinar matahari langsung saat penjemuran.',
    carePlanTips: [
      {
        icon: '🧺',
        title: 'Metode Pencucian Dingin & Lembut',
        desc: 'Cuci selalu menggunakan air dingin (suhu maksimal 30°C) dengan siklus lembut agar serat katun organik tidak mengerut.',
      },
      {
        icon: '🧼',
        title: 'Gunakan Deterjen Ramah Serat (Kindfoam)',
        desc: 'Gunakan deterjen lembaran eco-friendly tanpa pemutih klorin agar pigmen warna hijau sage tetap terkunci cerah.',
      },
      {
        icon: '☀️',
        title: 'Jemur Terbalik di Tempat Teduh',
        desc: 'Balik pakaian (sisi dalam di luar) dan angin-anginkan di area teduh berventilasi baik tanpa terkena sinar UV langsung.',
      },
      {
        icon: '🛡️',
        title: 'Penyimpanan Lemari Bernapas',
        desc: 'Gantung menggunakan hanger kayu berbahu lebar atau lipat dengan silica gel penyerap kelembaban di sudut lemari.',
      },
    ],
    actionableRecommendation:
      'Pakaian ini sangat direkomendasikan untuk menggunakan produk perawatan deterjen lembaran Kindfoam. Jika Anda menginginkan pemulihan warna pudar yang sempurna, Anda juga dapat memesan jasa Re-Color / Permak dari mitra profesional terdekat.',
  };

  return (
    <AppLayout title="Diagnosis & Care Plan" showBack backHref="/keputusan">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* Banner Hero */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md space-y-1">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Alur 5.6.1: Care Plan
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Panduan & Diagnosis Perawatan Pakaian
          </h2>
          <p className="text-xs text-white/85">
            Langkah tepat untuk merawat serat kain dan memperpanjang masa pakai pakaianmu.
          </p>
        </div>

        {/* 1. Header Ringkasan Pakaian & Tingkat Kesulitan */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex items-center justify-between">
          <div className="flex items-center gap-3.5">
            <div className="w-13 h-13 rounded-2xl bg-emerald-100 text-emerald-800 flex items-center justify-center text-2xl shadow-inner">
              👔
            </div>
            <div>
              <h3 className="text-sm font-extrabold text-[#10284D]">{garmentData.title}</h3>
              <p className="text-xs text-muted-foreground">{garmentData.category}</p>
            </div>
          </div>

          <div className="text-right">
            <span className="text-[10px] text-muted-foreground font-semibold block mb-0.5">
              Tingkat Kesulitan:
            </span>
            <span
              className={`text-xs font-black px-3 py-1 rounded-xl border ${garmentData.difficultyColor}`}
            >
              {garmentData.difficulty}
            </span>
          </div>
        </div>

        {/* 2. Ringkasan Masalah Pakaian */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#10284D] flex items-center gap-1.5 border-b border-border pb-2">
            <span>⚠️ 1. Ringkasan Masalah Pakaian</span>
          </h4>
          <p className="text-xs text-foreground/90 leading-relaxed font-semibold bg-amber-50/70 p-3.5 rounded-2xl border border-amber-200/80 text-amber-950">
            {garmentData.summaryProblem}
          </p>
        </div>

        {/* 3. Diagnosis Penyebab */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-2">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#10284D] flex items-center gap-1.5 border-b border-border pb-2">
            <span>🔬 2. Diagnosis Penyebab (Wearwise AI)</span>
          </h4>
          <p className="text-xs text-muted-foreground leading-relaxed bg-slate-50 p-3.5 rounded-2xl border border-slate-100">
            {garmentData.causeDiagnosis}
          </p>
        </div>

        {/* 4. Care Plan: Panduan & Tips Singkat */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
          <h4 className="text-xs font-black uppercase tracking-wider text-[#10284D] flex items-center gap-1.5 border-b border-border pb-2">
            <span>📋 3. Care Plan: Langkah Perawatan Mandiri</span>
          </h4>

          <div className="space-y-2.5">
            {garmentData.carePlanTips.map((tip, idx) => (
              <div
                key={idx}
                className="bg-slate-50/80 p-3.5 rounded-2xl border border-slate-100 flex items-start gap-3"
              >
                <span className="text-2xl mt-0.5">{tip.icon}</span>
                <div className="space-y-0.5">
                  <h5 className="text-xs font-extrabold text-[#10284D]">{tip.title}</h5>
                  <p className="text-[11px] text-muted-foreground leading-relaxed">{tip.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* 5. Card Actionable Instruction di Paling Bawah (Section 5.6.1 Specification) */}
        <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-lg space-y-3">
          <div className="flex items-center gap-2">
            <span className="text-xl">💡</span>
            <h4 className="text-xs font-black uppercase tracking-wider text-[#E8C547]">
              Actionable Instruction
            </h4>
          </div>
          <p className="text-xs text-white/90 leading-relaxed">
            {garmentData.actionableRecommendation}
          </p>

          {/* 2 Tombol Wajib: Lanjutkan (Produk) vs Pilih Jasa (Bagian 5.6.1) */}
          <div className="grid grid-cols-2 gap-3 pt-2">
            {/* Tombol Kiri: Jalur Jasa */}
            <button
              onClick={() => router.push('/cari-jasa')}
              className="border-2 border-white/80 hover:bg-white/15 text-white py-3.5 px-3 rounded-2xl text-xs font-bold transition-all active:scale-95 text-center flex items-center justify-center gap-1.5"
            >
              <span>🧵 Pilih Jasa Permak/Binatu</span>
            </button>

            {/* Tombol Kanan: Jalur Produk */}
            <button
              onClick={() => router.push('/rawat?tab=kalkulator')}
              className="bg-white hover:bg-slate-100 text-[#10284D] py-3.5 px-3 rounded-2xl text-xs font-black transition-all active:scale-95 shadow-md text-center flex items-center justify-center gap-1"
            >
              <span>🧼 Beli Produk Kindfoam →</span>
            </button>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
