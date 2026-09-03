'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ServiceProvider {
  id: string;
  name: string;
  category: 'permak' | 'cuci' | 'recolor';
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  estimatedPrice: number;
  isVerified: boolean;
  address: string;
}

const initialProviders: ServiceProvider[] = [
  {
    id: 'sp-1',
    name: 'Taylor Studio Artisan Fatmawati',
    category: 'permak',
    distanceKm: 1.2,
    rating: 4.9,
    reviewsCount: 128,
    estimatedPrice: 45000,
    isVerified: true,
    address: 'Jl. Fatmawati No. 18, Jakarta Selatan',
  },
  {
    id: 'sp-[#10284D]',
    name: 'CleanCare Signature Workshop Kemang',
    category: 'cuci',
    distanceKm: 2.5,
    rating: 4.8,
    reviewsCount: 94,
    estimatedPrice: 75000,
    isVerified: true,
    address: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
  },
  {
    id: 'sp-3',
    name: 'Jahit Kilat Express Senopati',
    category: 'permak',
    distanceKm: 0.8,
    rating: 4.6,
    reviewsCount: 52,
    estimatedPrice: 35000,
    isVerified: false,
    address: 'Jl. Senopati No. 8, Jakarta Selatan',
  },
  {
    id: 'sp-4',
    name: 'Textile Color Restorer Kebayoran',
    category: 'recolor',
    distanceKm: 3.1,
    rating: 4.9,
    reviewsCount: 76,
    estimatedPrice: 120000,
    isVerified: true,
    address: 'Jl. Radio Dalam No. 15, Jakarta Selatan',
  },
];

type SortType = 'terdekat' | 'termurah' | 'rating';

export default function CariJasaPage() {
  const router = useRouter();
  const [sortBy, setSortBy] = useState<SortType>('terdekat');
  const [searchQuery, setSearchQuery] = useState('');

  const sortedProviders = useMemo(() => {
    let result = [...initialProviders];

    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      result = result.filter(
        (p) => p.name.toLowerCase().includes(q) || p.address.toLowerCase().includes(q)
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
  }, [sortBy, searchQuery]);

  return (
    <AppLayout title="Cari Jasa Terdekat" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Map Preview Banner */}
        <div className="relative bg-slate-200 rounded-3xl h-44 border border-border shadow-inner overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-300 via-blue-100 to-emerald-100 opacity-80" />

          {/* Map Pin Mockup */}
          <div className="relative z-10 flex flex-col items-center gap-1">
            <div className="flex items-center gap-2 bg-white/90 backdrop-blur-sm px-3.5 py-1.5 rounded-full shadow-md border border-gray-200">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-extrabold text-[#10284D]">Lokasi Anda: Senopati</span>
            </div>
            <span className="text-[10px] font-semibold text-gray-500 bg-white/70 px-2 py-0.5 rounded-md">
              📍 4 Mitra tailor & spa ditemukan di sekitarmu
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
            placeholder="Cari tailor, spa baju, atau lokasi..."
            className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
          />
        </div>

        {/* Sorting Pills */}
        <div className="flex items-center gap-2">
          <span className="text-xs font-bold text-muted-foreground mr-1">Urutkan:</span>
          {(['terdekat', 'termurah', 'rating'] as SortType[]).map((tab) => (
            <button
              key={tab}
              onClick={() => setSortBy(tab)}
              className={`px-3.5 py-1.5 rounded-full text-xs font-bold capitalize transition-all ${
                sortBy === tab
                  ? 'bg-[#10284D] text-white shadow-sm'
                  : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
              }`}
            >
              {tab === 'terdekat'
                ? '📍 Terdekat'
                : tab === 'termurah'
                ? '🏷️ Termurah'
                : '⭐ Rating Tertinggi'}
            </button>
          ))}
        </div>

        {/* Provider Cards */}
        <div className="space-y-3">
          {sortedProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold text-sm flex-shrink-0">
                    <Icon name="WrenchScrewdriverIcon" size={24} />
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs font-extrabold text-foreground">{provider.name}</h4>
                      {provider.isVerified && (
                        <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.2 rounded">
                          ✓ Terpercaya
                        </span>
                      )}
                    </div>
                    <p className="text-[10px] text-muted-foreground mt-0.5">{provider.address}</p>
                  </div>
                </div>
              </div>

              <div className="flex items-center justify-between text-xs pt-1 border-t border-border">
                <div className="flex items-center gap-3 text-muted-foreground font-medium">
                  <span>📍 {provider.distanceKm} km</span>
                  <span>⭐ {provider.rating} ({provider.reviewsCount})</span>
                </div>
                <div className="flex items-center gap-3">
                  <span className="font-extrabold text-[#E86D50]">
                    Mulai Rp {provider.estimatedPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={() =>
                      router.push(`/pemesanan-jasa?provider=${encodeURIComponent(provider.name)}`)
                    }
                    className="bg-[#10284D] text-white px-4 py-2 rounded-xl text-xs font-bold shadow-sm hover:bg-[#152248]"
                  >
                    Pesan
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
