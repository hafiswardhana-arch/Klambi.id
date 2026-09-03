'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ServicePartner {
  id: string;
  name: string;
  category: 'permak' | 'cuci' | 'recolor' | 'upcycle';
  categoryLabel: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  estimatedPrice: number;
  isVerified: boolean;
  address: string;
  services: string[];
}

const servicePartners: ServicePartner[] = [
  {
    id: 'sp-1',
    name: 'Taylor Studio Artisan Fatmawati',
    category: 'permak',
    categoryLabel: 'Permak & Jahit',
    distanceKm: 1.2,
    rating: 4.9,
    reviewsCount: 128,
    estimatedPrice: 45000,
    isVerified: true,
    address: 'Jl. Fatmawati No. 18, Jakarta Selatan',
    services: ['Potong Panjang Celana', 'Hemming Chainstitch', 'Ganti Resleting YKK', 'Kecilkan Pinggang'],
  },
  {
    id: 'sp-2',
    name: 'CleanCare Signature Workshop Kemang',
    category: 'cuci',
    categoryLabel: 'Cuci & Spa Tekstil',
    distanceKm: 2.5,
    rating: 4.8,
    reviewsCount: 94,
    estimatedPrice: 75000,
    isVerified: true,
    address: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
    services: ['Deep Clean & Anti-Odor Spa', 'Dry Cleaning Jas/Gaun', 'Treatment Anti-Jamur'],
  },
  {
    id: 'sp-3',
    name: 'Jahit Kilat Express Senopati',
    category: 'permak',
    categoryLabel: 'Permak & Jahit',
    distanceKm: 0.8,
    rating: 4.6,
    reviewsCount: 52,
    estimatedPrice: 35000,
    isVerified: false,
    address: 'Jl. Senopati No. 8, Jakarta Selatan',
    services: ['Permak Cepat 1 Hari', 'Ganti Kancing', 'Jahit Robekan Ringan'],
  },
  {
    id: 'sp-4',
    name: 'Textile Color Restorer & Dyeing',
    category: 'recolor',
    categoryLabel: 'Re-Colour & Celup',
    distanceKm: 3.1,
    rating: 4.9,
    reviewsCount: 76,
    estimatedPrice: 120000,
    isVerified: true,
    address: 'Jl. Radio Dalam No. 15, Jakarta Selatan',
    services: ['Pewarnaan Ulang Denim Hitam/Navy', 'Restorasi Warna Katun', 'Tie-Dye Kreatif'],
  },
  {
    id: 'sp-5',
    name: 'Sirkular Upcycle Lab Mampang',
    category: 'upcycle',
    categoryLabel: 'Upcycle & Rework',
    distanceKm: 2.8,
    rating: 5.0,
    reviewsCount: 41,
    estimatedPrice: 150000,
    isVerified: true,
    address: 'Jl. Mampang Prapatan No. 71, Jakarta Selatan',
    services: ['Rework Jeans jadi Tote Bag', 'Patchwork Jacket', 'Custom Bucket Hat'],
  },
];

type SortMode = 'terdekat' | 'termurah' | 'rating';

export default function MenuPerawatanPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortMode>('terdekat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<ServicePartner | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Jasa' },
    { id: 'permak', label: 'Permak & Jahit' },
    { id: 'cuci', label: 'Cuci & Spa' },
    { id: 'recolor', label: 'Re-Colour' },
    { id: 'upcycle', label: 'Upcycle' },
  ];

  const filteredPartners = useMemo(() => {
    let result = [...servicePartners];

    if (selectedCategory !== 'all') {
      result = result.filter((p) => p.category === selectedCategory);
    }

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.services.some((s) => s.toLowerCase().includes(q))
      );
    }

    if (sortBy === 'terdekat') {
      result.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (sortBy === 'termurah') {
      result.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    } else if (sortBy === 'rating') {
      result.sort((a, b) => b.rating - a.rating);
    }

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  return (
    <AppLayout title="Jasa & Perawatan" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Peta Lokasi & Tailor Terdekat Banner */}
        <div className="relative bg-slate-200 rounded-3xl h-44 border border-border shadow-inner overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-300 via-blue-100 to-emerald-100 opacity-90" />

          {/* Interactive Pin UI */}
          <div className="relative z-10 flex flex-col items-center gap-1.5 text-center">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold text-[#10284D]">
                Lokasi Anda: Senopati, Kebayoran Baru
              </span>
            </div>
            <span className="text-[10px] font-bold text-gray-600 bg-white/80 px-2.5 py-0.5 rounded-md shadow-xs">
              📍 {filteredPartners.length} Mitra tailor, spa, dan permak aktif di sekitarmu
            </span>
          </div>
        </div>

        {/* Search Bar */}
        <div className="relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
          />
          <input
            type="search"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tailor, perbaikan kancing, recolor, spa..."
            className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
          />
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#10284D] text-white shadow-sm'
                  : 'bg-white text-foreground border border-border hover:border-[#10284D]/40'
              }`}
            >
              {cat.label}
            </button>
          ))}
        </div>

        {/* Sorting Pills */}
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <span className="text-xs font-bold text-muted-foreground">Urutkan:</span>
            {(['terdekat', 'termurah', 'rating'] as SortMode[]).map((mode) => (
              <button
                key={mode}
                onClick={() => setSortBy(mode)}
                className={`px-3 py-1 rounded-full text-[11px] font-bold capitalize transition-all ${
                  sortBy === mode
                    ? 'bg-[#10284D] text-white shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
                }`}
              >
                {mode === 'terdekat' ? '📍 Terdekat' : mode === 'termurah' ? '🏷️ Termurah' : '⭐ Rating'}
              </button>
            ))}
          </div>
          <span className="text-[11px] text-muted-foreground font-semibold">
            {filteredPartners.length} mitra
          </span>
        </div>

        {/* List Mitra Jasa */}
        <div className="space-y-3">
          {filteredPartners.map((partner) => (
            <div
              key={partner.id}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold flex-shrink-0">
                    <Icon name="WrenchScrewdriverIcon" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-foreground">{partner.name}</h4>
                      {partner.isVerified && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          ✓ Terpercaya
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {partner.categoryLabel} • {partner.address}
                    </span>
                  </div>
                </div>
              </div>

              {/* Service tags */}
              <div className="flex flex-wrap gap-1.5">
                {partner.services.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-muted text-foreground/80 font-medium px-2 py-0.5 rounded-md"
                  >
                    {srv}
                  </span>
                ))}
              </div>

              {/* Footer row */}
              <div className="flex items-center justify-between text-xs pt-2 border-t border-border">
                <div className="flex items-center gap-3 text-muted-foreground font-semibold text-[11px]">
                  <span>📍 {partner.distanceKm} km</span>
                  <span>⭐ {partner.rating} ({partner.reviewsCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#E86D50]">
                    Mulai Rp {partner.estimatedPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() =>
                      router.push(
                        `/pemesanan-jasa?provider=${encodeURIComponent(partner.name)}`
                      )
                    }
                    className="bg-[#10284D] text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm hover:bg-[#152248] active:scale-95 transition-all"
                  >
                    Pesan Jasa
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </AppLayout>
  );
}