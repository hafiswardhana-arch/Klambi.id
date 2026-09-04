'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ServiceProvider {
  id: string;
  name: string;
  serviceCategory: 'permak' | 'binatu' | 'recolor';
  categoryLabel: string;
  distanceKm: number;
  rating: number;
  reviewsCount: number;
  estimatedPrice: number;
  isVerified: boolean;
  statusAvailability: 'Tersedia' | 'Full Order';
  address: string;
  servicesList: string[];
}

const initialProviders: ServiceProvider[] = [
  {
    id: 'sp-1',
    name: 'Taylor Studio Artisan Fatmawati',
    serviceCategory: 'permak',
    categoryLabel: 'Permak & Tailor',
    distanceKm: 1.2,
    rating: 4.9,
    reviewsCount: 128,
    estimatedPrice: 35000,
    isVerified: true,
    statusAvailability: 'Tersedia',
    address: 'Jl. Fatmawati No. 18, Jakarta Selatan',
    servicesList: ['Potong Kelim', 'Resize Pinggang', 'Jahit Rantai', 'Ganti Resleting'],
  },
  {
    id: 'sp-2',
    name: 'CleanCare Eco-Binatu & Spa Kemang',
    serviceCategory: 'binatu',
    categoryLabel: 'Binatu Eco-Spa',
    distanceKm: 2.5,
    rating: 4.8,
    reviewsCount: 94,
    estimatedPrice: 45000,
    isVerified: true,
    statusAvailability: 'Tersedia',
    address: 'Jl. Kemang Raya No. 42, Jakarta Selatan',
    servicesList: ['Deep Clean Serat', 'Anti-Odor Spa', 'Cuci Dingin Ramah Lingkungan'],
  },
  {
    id: 'sp-3',
    name: 'Jahit Kilat Express Senopati',
    serviceCategory: 'permak',
    categoryLabel: 'Permak Cepat',
    distanceKm: 0.8,
    rating: 4.6,
    reviewsCount: 52,
    estimatedPrice: 25000,
    isVerified: false,
    statusAvailability: 'Tersedia',
    address: 'Jl. Senopati No. 8, Jakarta Selatan',
    servicesList: ['Permak Cepat 1 Hari', 'Ganti Kancing', 'Jahit Kelim'],
  },
  {
    id: 'sp-4',
    name: 'Textile Color Restorer & Dyeing',
    serviceCategory: 'recolor',
    categoryLabel: 'Re-Color Pewarnaan',
    distanceKm: 3.1,
    rating: 4.9,
    reviewsCount: 76,
    estimatedPrice: 85000,
    isVerified: true,
    statusAvailability: 'Tersedia',
    address: 'Jl. Radio Dalam No. 15, Jakarta Selatan',
    servicesList: ['Celup Warna Hitam Pekat', 'Indigo Denim Restore', 'Pewarna Alami Eco'],
  },
];

type FilterMode = 'terdekat' | 'termurah' | 'rating' | 'kebutuhan';

export default function CariJasaPage() {
  const router = useRouter();
  const [filterMode, setFilterMode] = useState<FilterMode>('terdekat');
  const [categoryFilter, setCategoryFilter] = useState<'semua' | 'permak' | 'binatu' | 'recolor'>('semua');
  const [searchQuery, setSearchQuery] = useState('');

  const filteredProviders = useMemo(() => {
    let list = [...initialProviders];

    // Search query filter
    if (searchQuery.trim()) {
      const q = searchQuery.toLowerCase();
      list = list.filter(
        (p) =>
          p.name.toLowerCase().includes(q) ||
          p.address.toLowerCase().includes(q) ||
          p.categoryLabel.toLowerCase().includes(q) ||
          p.servicesList.some((s) => s.toLowerCase().includes(q))
      );
    }

    // Filter Sesuai Kebutuhan
    if (filterMode === 'kebutuhan' && categoryFilter !== 'semua') {
      list = list.filter((p) => p.serviceCategory === categoryFilter);
    }

    // Sort criteria based on Section 7
    if (filterMode === 'terdekat') {
      list.sort((a, b) => a.distanceKm - b.distanceKm);
    } else if (filterMode === 'termurah') {
      list.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    } else if (filterMode === 'rating') {
      list.sort((a, b) => b.rating - a.rating);
    }

    return list;
  }, [filterMode, categoryFilter, searchQuery]);

  return (
    <AppLayout title="Pencarian Jasa Terdekat" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* ========================================================================= */}
        {/* 1. INTERACTIVE MAP VIEW (Section 7 Specification) */}
        {/* ========================================================================= */}
        <div className="relative bg-slate-900 rounded-3xl h-48 border border-border shadow-md overflow-hidden flex items-center justify-center p-4">
          <div className="absolute inset-0 bg-gradient-to-tr from-[#10284D] via-[#163768] to-[#1E4D8C] opacity-90" />

          {/* Map Grid Pattern Mockup */}
          <div
            className="absolute inset-0 opacity-15"
            style={{
              backgroundImage:
                'radial-gradient(circle at 1px 1px, white 1px, transparent 0)',
              backgroundSize: '20px 20px',
            }}
          />

          {/* User Location Pin */}
          <div className="relative z-10 flex flex-col items-center gap-1.5">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-md px-4 py-2 rounded-full shadow-xl border border-white">
              <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-ping" />
              <span className="text-xs font-black text-[#10284D]">
                📍 Lokasi Anda: Senopati, Jakarta Selatan
              </span>
            </div>
            <span className="text-[10px] font-bold text-cyan-200 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
              Menampilkan {filteredProviders.length} Mitra Terdekat dalam Radius 5 km
            </span>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH BAR */}
        {/* ========================================================================= */}
        <div className="relative">
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tailor, binatu, re-color, atau jenis jahitan..."
            className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D] shadow-xs"
          />
          <div className="absolute left-3.5 top-3.5 text-muted-foreground pointer-events-none">
            <Icon name="MagnifyingGlassIcon" size={16} />
          </div>
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-3 text-xs text-muted-foreground hover:text-foreground font-bold"
            >
              ✕
            </button>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 3. 4 FILTER UTAMA (Bagian 7: Termurah, Terdekat, Rating, Sesuai Kebutuhan) */}
        {/* ========================================================================= */}
        <div className="space-y-2">
          <div className="flex items-center justify-between">
            <span className="text-xs font-black text-[#10284D] uppercase tracking-wider">
              Filter Kriteria:
            </span>
          </div>

          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {/* 1. Terdekat */}
            <button
              onClick={() => setFilterMode('terdekat')}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold transition-all text-center ${
                filterMode === 'terdekat'
                  ? 'bg-[#10284D] text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
              }`}
            >
              📍 1. Terdekat
            </button>

            {/* 2. Termurah */}
            <button
              onClick={() => setFilterMode('termurah')}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold transition-all text-center ${
                filterMode === 'termurah'
                  ? 'bg-[#10284D] text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
              }`}
            >
              🏷️ 2. Termurah
            </button>

            {/* 3. Rating Tertinggi */}
            <button
              onClick={() => setFilterMode('rating')}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold transition-all text-center ${
                filterMode === 'rating'
                  ? 'bg-[#10284D] text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
              }`}
            >
              ⭐ 3. Rating
            </button>

            {/* 4. Sesuai Kebutuhan */}
            <button
              onClick={() => setFilterMode('kebutuhan')}
              className={`py-2 px-3 rounded-2xl text-xs font-extrabold transition-all text-center ${
                filterMode === 'kebutuhan'
                  ? 'bg-[#10284D] text-white shadow-xs'
                  : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
              }`}
            >
              🎯 4. Kebutuhan
            </button>
          </div>

          {/* Sub-Filter Jika Mode Kebutuhan Dipilih */}
          {filterMode === 'kebutuhan' && (
            <div className="flex gap-2 pt-1 animate-scale-in">
              {(['semua', 'permak', 'binatu', 'recolor'] as const).map((cat) => (
                <button
                  key={cat}
                  onClick={() => setCategoryFilter(cat)}
                  className={`px-3 py-1 rounded-xl text-[11px] font-bold capitalize transition-all ${
                    categoryFilter === cat
                      ? 'bg-secondary text-primary border border-primary/30'
                      : 'bg-muted text-muted-foreground hover:bg-muted/80'
                  }`}
                >
                  {cat === 'semua'
                    ? 'Semua Jasa'
                    : cat === 'permak'
                    ? '🧵 Permak'
                    : cat === 'binatu'
                    ? '🧼 Binatu'
                    : '🎨 Re-Color'}
                </button>
              ))}
            </div>
          )}
        </div>

        {/* ========================================================================= */}
        {/* 4. DAFTAR MITRA PENYEDIA JASA */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          {filteredProviders.map((provider) => (
            <div
              key={provider.id}
              className="bg-card rounded-3xl p-5 border border-border shadow-sm hover:shadow-md transition-all space-y-3"
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3.5">
                  <div className="w-12 h-12 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
                    {provider.serviceCategory === 'permak'
                      ? '🧵'
                      : provider.serviceCategory === 'binatu'
                      ? '🧼'
                      : '🎨'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-xs sm:text-sm font-extrabold text-[#10284D]">
                        {provider.name}
                      </h4>
                      {provider.isVerified && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-extrabold px-1.5 py-0.2 rounded">
                          ✓ Terverifikasi
                        </span>
                      )}
                    </div>
                    <p className="text-[11px] text-muted-foreground mt-0.5">{provider.address}</p>
                  </div>
                </div>

                <span className="text-[10px] bg-blue-50 text-blue-800 font-bold px-2 py-0.5 rounded-full flex-shrink-0">
                  {provider.statusAvailability}
                </span>
              </div>

              {/* Tag Layanan yang Disediakan */}
              <div className="flex flex-wrap gap-1.5 pt-1">
                {provider.servicesList.map((srv, idx) => (
                  <span
                    key={idx}
                    className="text-[10px] bg-muted text-muted-foreground font-semibold px-2 py-0.5 rounded-lg"
                  >
                    • {srv}
                  </span>
                ))}
              </div>

              {/* Price & Action Row */}
              <div className="flex items-center justify-between pt-3 border-t border-border text-xs">
                <div className="flex items-center gap-3 text-muted-foreground font-semibold">
                  <span>📍 {provider.distanceKm} km</span>
                  <span>⭐ {provider.rating} ({provider.reviewsCount})</span>
                </div>

                <div className="flex items-center gap-2.5">
                  <div className="text-right">
                    <span className="text-[10px] text-muted-foreground block">Mulai Dari:</span>
                    <span className="font-black text-[#E86D50]">
                      Rp {provider.estimatedPrice.toLocaleString('id-ID')}
                    </span>
                  </div>

                  <button
                    onClick={() =>
                      router.push(
                        `/pemesanan-jasa?provider=${encodeURIComponent(provider.name)}`
                      )
                    }
                    className="bg-[#10284D] text-white px-4 py-2.5 rounded-2xl text-xs font-black shadow-md hover:bg-[#163768] active:scale-95 transition-all"
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
