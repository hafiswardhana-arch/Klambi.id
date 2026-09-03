'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { toast } from 'sonner';

export interface ClothingScanRecord {
  id: string;
  itemName: string;
  category: string;
  date: string;
  aiScore: number;
  conditionGrade: 'Sangat Baik' | 'Cukup Baik' | 'Perlu Perhatian' | 'Perlu Restorasi';
  material: string;
  lastStatus: 'Direkomendasikan Dijual' | 'Sudah Dirawat' | 'Perlu Permak' | 'Siap Daur Ulang' | 'Dalam Penjualan';
  estimatedValue: string;
  colorTone: string;
  stainInfo: string;
}

const initialClothingData: ClothingScanRecord[] = [
  {
    id: 'scan-1',
    itemName: 'Kemeja Katun Linen Uniqlo',
    category: 'Kemeja Casual',
    date: '21 Agu 2026',
    aiScore: 86,
    conditionGrade: 'Sangat Baik',
    material: '100% Katun Linen',
    lastStatus: 'Direkomendasikan Dijual',
    estimatedValue: 'Rp 145.000',
    colorTone: 'Sage Green (#7C9D8E)',
    stainInfo: 'Serat 92% utuh, tanpa noda pudar',
  },
  {
    id: 'scan-2',
    itemName: 'Celana Jeans Selvedge 14oz',
    category: 'Celana Denim',
    date: '18 Agu 2026',
    aiScore: 68,
    conditionGrade: 'Cukup Baik',
    material: 'Denim Katun 100%',
    lastStatus: 'Sudah Dirawat',
    estimatedValue: 'Rp 230.000',
    colorTone: 'Indigo Dark Wash',
    stainInfo: 'Selesai Deep Clean & Hemming Jahitan',
  },
  {
    id: 'scan-3',
    itemName: 'Jaket Windbreaker Vintage 90s',
    category: 'Outerwear',
    date: '10 Agu 2026',
    aiScore: 92,
    conditionGrade: 'Sangat Baik',
    material: 'Polyester Daur Ulang',
    lastStatus: 'Dalam Penjualan',
    estimatedValue: 'Rp 310.000',
    colorTone: 'Colorblock Teal-Navy',
    stainInfo: 'Zipper YKK orisinil, siap pakai',
  },
  {
    id: 'scan-4',
    itemName: 'Kaos Graphic Oversized Heavyweight',
    category: 'Kaos T-Shirt',
    date: '02 Agu 2026',
    aiScore: 54,
    conditionGrade: 'Perlu Perhatian',
    material: 'Katun Combed 24s',
    lastStatus: 'Perlu Permak',
    estimatedValue: 'Rp 65.000',
    colorTone: 'Washed Black',
    stainInfo: 'Kerah agak melar, cocok untuk rework/patching',
  },
  {
    id: 'scan-5',
    itemName: 'Dress Tenun Ikat Tradisional',
    category: 'Dress / Etnik',
    date: '28 Jul 2026',
    aiScore: 89,
    conditionGrade: 'Sangat Baik',
    material: 'Pewarna Alami & Katun Tenun',
    lastStatus: 'Sudah Dirawat',
    estimatedValue: 'Rp 450.000',
    colorTone: 'Terracotta & Indigo',
    stainInfo: 'Sudah di-steam spa & anti-jamur',
  },
];

export default function ClothingHistoryTab() {
  const [items, setItems] = useState<ClothingScanRecord[]>(initialClothingData);
  const [filterCategory, setFilterCategory] = useState('Semua');

  const categories = ['Semua', 'Kemeja', 'Celana', 'Outerwear', 'Kaos', 'Dress'];

  const filteredItems = items.filter((item) => {
    if (filterCategory === 'Semua') return true;
    return item.category.toLowerCase().includes(filterCategory.toLowerCase());
  });

  const getStatusBadge = (status: ClothingScanRecord['lastStatus']) => {
    switch (status) {
      case 'Direkomendasikan Dijual':
        return 'bg-secondary text-primary border-accent/40';
      case 'Sudah Dirawat':
        return 'bg-info-bg text-info border-info/30';
      case 'Dalam Penjualan':
        return 'bg-warning-bg text-warning-foreground border-warning/40';
      case 'Perlu Permak':
        return 'bg-muted text-foreground border-border';
      default:
        return 'bg-secondary text-primary border-border';
    }
  };

  return (
    <div className="space-y-4">
      {/* Category Pills */}
      <div className="flex items-center justify-between gap-2">
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide py-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setFilterCategory(cat)}
              className={`text-xs px-3 py-1.5 rounded-full font-semibold border transition-all whitespace-nowrap ${
                filterCategory === cat
                  ? 'bg-primary text-white border-primary'
                  : 'bg-card text-muted-foreground border-border hover:border-accent'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        <span className="text-xs text-muted-foreground font-medium flex-shrink-0">
          {filteredItems.length} Baju
        </span>
      </div>

      {/* Grid of Scanned Clothes */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-3.5">
        {filteredItems.map((item) => (
          <div
            key={item.id}
            className="bg-card border border-border rounded-xl p-4 hover:border-accent transition-all shadow-sm flex flex-col justify-between"
          >
            <div>
              <div className="flex items-start justify-between gap-2">
                <div className="min-w-0">
                  <span className="text-[10px] font-mono text-muted-foreground">
                    {item.date} • {item.category}
                  </span>
                  <h4 className="font-bold text-sm text-foreground truncate mt-0.5">
                    {item.itemName}
                  </h4>
                  <p className="text-xs text-muted-foreground mt-0.5">
                    🧵 {item.material}
                  </p>
                </div>

                <div className="flex flex-col items-end flex-shrink-0">
                  <div className="flex items-center gap-1 px-2.5 py-1 rounded-lg bg-secondary text-primary font-extrabold text-xs border border-accent/30">
                    <Icon name="SparklesIcon" size={13} variant="solid" />
                    <span>{item.aiScore} / 100</span>
                  </div>
                  <span className="text-[10px] text-muted-foreground mt-1">
                    {item.conditionGrade}
                  </span>
                </div>
              </div>

              {/* Status & Analysis Details */}
              <div className="mt-3 p-2.5 bg-muted/50 rounded-lg text-xs space-y-1">
                <div className="flex items-center justify-between">
                  <span className="text-muted-foreground">Status Baju:</span>
                  <span
                    className={`px-2 py-0.5 rounded-md text-[10px] font-bold border ${getStatusBadge(
                      item.lastStatus
                    )}`}
                  >
                    {item.lastStatus}
                  </span>
                </div>
                <p className="text-[11px] text-foreground font-medium truncate pt-1">
                  🔍 {item.stainInfo}
                </p>
              </div>
            </div>

            {/* Bottom Actions */}
            <div className="mt-3 pt-3 border-t border-border flex items-center justify-between text-xs">
              <span className="text-muted-foreground">
                Estimasi:{' '}
                <strong className="text-primary font-bold">{item.estimatedValue}</strong>
              </span>

              <div className="flex items-center gap-2">
                {item.lastStatus === 'Direkomendasikan Dijual' ? (
                  <button
                    onClick={() => toast.success(`Membuka form listing jual untuk ${item.itemName}`)}
                    className="btn-primary py-1 px-2.5 text-xs font-semibold"
                  >
                    Jual di Trift
                  </button>
                ) : item.lastStatus === 'Perlu Permak' ? (
                  <button
                    onClick={() => toast.info(`Mengarahkan ke mitra permak untuk ${item.itemName}`)}
                    className="btn-secondary py-1 px-2.5 text-xs font-semibold"
                  >
                    Pesan Permak
                  </button>
                ) : (
                  <button
                    onClick={() => toast.info(`Detail analisis lengkap ${item.itemName}`)}
                    className="text-primary font-bold hover:underline"
                  >
                    Lihat Hasil AI &rarr;
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
