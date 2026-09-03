'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface CarePlanItem {
  id: string;
  title: string;
  category: string;
  scanDate: string;
  score: number;
  statusBadge: 'Baik' | 'Perlu Perawatan' | 'Perlu Jasa';
  summary: string;
  fabric: string;
  recommendation: string;
}

const historyItems: CarePlanItem[] = [
  {
    id: 'cp-1',
    title: 'Kemeja Flannel Sage Green',
    category: 'Kemeja',
    scanDate: '22 Agu 2026',
    score: 86,
    statusBadge: 'Baik',
    summary: 'Kondisi serat kain sangat terjaga. Bebas noda membandel.',
    fabric: '100% Katun Organik',
    recommendation: 'Cuci dengan air dingin (30°C) dan gantung di tempat teduh tanpa dijemur matahari langsung.',
  },
  {
    id: 'cp-2',
    title: 'Jaket Denim Vintage 90s',
    category: 'Outerwear',
    scanDate: '18 Agu 2026',
    score: 67,
    statusBadge: 'Perlu Perawatan',
    summary: 'Warna agak pudar di area siku & aroma serat kain lembab.',
    fabric: 'Serat Denim Heavyweight',
    recommendation: 'Lakukan Deep Clean & Anti-Odor Spa agar serat kembali segar dan terhindar dari jamur.',
  },
  {
    id: 'cp-3',
    title: 'Celana Chino Slim Fit',
    category: 'Celana',
    scanDate: '10 Agu 2026',
    score: 52,
    statusBadge: 'Perlu Jasa',
    summary: 'Jahitan kelim bawah terlepas sepanjang 8 cm & kancing longgar.',
    fabric: 'Twill Cotton Stretch',
    recommendation: 'Disarankan dibawa ke tukang jahit / Taylor artisan untuk perbaikan jahitan rantai.',
  },
];

export default function CarePlanPage() {
  const router = useRouter();
  const [selectedItem, setSelectedItem] = useState<CarePlanItem | null>(null);

  const getBadgeClasses = (status: CarePlanItem['statusBadge']) => {
    if (status === 'Baik') return 'bg-[#D1FAE5] text-[#166534]';
    if (status === 'Perlu Perawatan') return 'bg-amber-100 text-amber-800';
    return 'bg-red-100 text-red-700';
  };

  return (
    <AppLayout title="Care Plan Saya" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Header Summary */}
        <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md flex items-center justify-between">
          <div>
            <h2 className="text-base font-bold">Panduan & Histori Perawatan</h2>
            <p className="text-xs text-white/80 mt-0.5">
              {historyItems.length} Pakaian terpantau oleh Wearwise AI
            </p>
          </div>
          <button
            onClick={() => router.push('/wearwise-ai')}
            className="bg-white text-[#10284D] px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-gray-100"
          >
            + Scan Baru
          </button>
        </div>

        {/* List Card Histori Care Plan */}
        <div className="space-y-3">
          {historyItems.map((item) => (
            <div
              key={item.id}
              onClick={() => setSelectedItem(item)}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all cursor-pointer space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                    <Icon name="ShirtIcon" size={24} />
                  </div>
                  <div>
                    <h3 className="text-xs font-bold text-foreground">{item.title}</h3>
                    <p className="text-[10px] text-muted-foreground">
                      {item.category} • Scanned: {item.scanDate}
                    </p>
                  </div>
                </div>

                <span
                  className={`text-[10px] font-bold px-2.5 py-1 rounded-md ${getBadgeClasses(
                    item.statusBadge
                  )}`}
                >
                  {item.statusBadge} ({item.score}/100)
                </span>
              </div>

              <p className="text-xs text-muted-foreground line-clamp-2">{item.summary}</p>
            </div>
          ))}
        </div>

        {/* Modal Read-only Detail Hasil Scan */}
        {selectedItem && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div>
                  <h3 className="font-bold text-base text-gray-900">{selectedItem.title}</h3>
                  <p className="text-xs text-gray-500">Hasil Diagnosis AI ({selectedItem.scanDate})</p>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-gray-400 hover:text-gray-600"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              <div className="space-y-3 text-xs">
                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl">
                  <span className="font-semibold text-gray-600">Skor Kondisi Serat</span>
                  <span className="font-extrabold text-[#10284D] text-sm">
                    {selectedItem.score} / 100
                  </span>
                </div>

                <div>
                  <span className="font-bold text-gray-700 block mb-1">Jenis Bahan Kain:</span>
                  <p className="text-gray-600 bg-slate-100 p-2.5 rounded-xl">{selectedItem.fabric}</p>
                </div>

                <div>
                  <span className="font-bold text-gray-700 block mb-1">Rekomendasi Tindakan AI:</span>
                  <p className="text-gray-600 leading-relaxed bg-emerald-50 text-emerald-900 border border-emerald-200 p-3 rounded-2xl">
                    {selectedItem.recommendation}
                  </p>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setSelectedItem(null);
                    router.push('/menu-perawatan');
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248]"
                >
                  ✨ Rawat Sekarang
                </button>

                <button
                  onClick={() => {
                    setSelectedItem(null);
                    router.push('/cari-jasa');
                  }}
                  className="border border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold hover:bg-secondary"
                >
                  🔍 Cari Jasa
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
