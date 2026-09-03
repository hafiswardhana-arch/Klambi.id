'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function DampakPage() {
  const historyGraph = [
    { month: 'Mei', kg: 2.1 },
    { month: 'Jun', kg: 4.8 },
    { month: 'Jul', kg: 8.2 },
    { month: 'Agu', kg: 12.5 },
  ];

  return (
    <AppLayout title="Dampak Saya" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-5 pb-20">
        {/* Main Card */}
        <div className="bg-[#10284D] text-white rounded-3xl p-6 shadow-xl space-y-4">
          <div className="flex items-center justify-between">
            <span className="text-xs font-bold text-[#E8C547] uppercase tracking-wider">
              Capaian Ekologis Sirkular
            </span>
            <span className="bg-white/20 text-white text-[10px] font-bold px-3 py-1 rounded-full">
              Level 2: Eco-Warrior
            </span>
          </div>

          <div className="grid grid-cols-2 gap-4 pt-2">
            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] text-white/70 block">Limbah Tekstil</span>
              <span className="text-2xl font-extrabold text-white">12.5 kg</span>
              <span className="text-[10px] text-emerald-400 font-semibold block mt-1">
                +4.3 kg bulan ini
              </span>
            </div>

            <div className="bg-white/10 rounded-2xl p-4 border border-white/10">
              <span className="text-[10px] text-white/70 block">Penghematan Air</span>
              <span className="text-2xl font-extrabold text-white">41.200 L</span>
              <span className="text-[10px] text-cyan-300 font-semibold block mt-1">
                Setara 165 mandi
              </span>
            </div>
          </div>
        </div>

        {/* Donut Progress Card */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-sm font-bold text-foreground">Target Tahunan 2026</h3>
            <span className="text-xs font-extrabold text-primary">32% Terpesan</span>
          </div>

          <div className="flex items-center gap-6">
            <div className="relative w-24 h-24 flex-shrink-0 flex items-center justify-center">
              <svg width="96" height="96" viewBox="0 0 96 96">
                <circle cx="48" cy="48" r="40" fill="none" stroke="#ECEEF3" strokeWidth="10" />
                <circle
                  cx="48" cy="48" r="40" fill="none"
                  stroke="#10284D" strokeWidth="10"
                  strokeDasharray="251.3" strokeDashoffset={251.3 * (1 - 0.32)}
                  strokeLinecap="round"
                  transform="rotate(-90 48 48)"
                />
              </svg>
              <div className="absolute text-center">
                <span className="text-sm font-extrabold text-foreground block">32%</span>
                <span className="text-[9px] text-muted-foreground">Progress</span>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-[#10284D]" />
                <span className="font-semibold text-foreground">12.5 kg diselamatkan</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="w-3 h-3 rounded-full bg-gray-200" />
                <span className="text-muted-foreground">Target 40 kg limbah</span>
              </div>
              <p className="text-[11px] text-muted-foreground pt-1">
                Anda berada di peringkat <b>#8</b> di antara pengguna Klámbi.id! 🏆
              </p>
            </div>
          </div>
        </div>

        {/* History Graph */}
        <div className="bg-card rounded-2xl p-5 border border-border shadow-sm space-y-3">
          <h3 className="text-sm font-bold text-foreground">Histori Penyelamatan Tekstil</h3>
          <div className="flex items-end justify-between h-40 pt-6 px-4">
            {historyGraph.map((item, i) => (
              <div key={i} className="flex flex-col items-center gap-2 flex-1">
                <span className="text-[10px] font-bold text-primary">{item.kg} kg</span>
                <div
                  className="w-8 rounded-t-xl bg-[#10284D] transition-all duration-500"
                  style={{ height: `${(item.kg / 15) * 100}%` }}
                />
                <span className="text-[11px] font-semibold text-muted-foreground">{item.month}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
