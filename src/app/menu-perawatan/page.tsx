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
  openHours: string;
  minOrder: string;
  badge?: string;
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
    openHours: 'Senin–Sabtu, 09.00–18.00',
    minOrder: 'Mulai 1 item',
    badge: '🏆 Terpopuler',
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
    openHours: 'Setiap Hari, 08.00–20.00',
    minOrder: 'Minimal 2 item',
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
    openHours: 'Senin–Jumat, 09.00–17.00',
    minOrder: 'Mulai 1 item',
    badge: '⚡ Terdekat',
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
    openHours: 'Selasa–Minggu, 10.00–18.00',
    minOrder: 'Minimal 1 item',
    badge: '⭐ Rating Teratas',
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
    openHours: 'Senin–Sabtu, 10.00–17.00',
    minOrder: 'Konsultasi gratis',
    badge: '🌿 Eco-Partner',
  },
];

type SortMode = 'terdekat' | 'termurah' | 'rating' | 'sesuai';

const mapPins = [
  { top: '35%', left: '45%', label: 'Kamu', color: '#3A7BF7', isUser: true },
  { top: '50%', left: '30%', label: '0.8km', color: '#22C55E' },
  { top: '40%', left: '60%', label: '1.2km', color: '#E86D50' },
  { top: '60%', left: '55%', label: '2.5km', color: '#E86D50' },
  { top: '25%', left: '70%', label: '2.8km', color: '#6366F1' },
  { top: '65%', left: '25%', label: '3.1km', color: '#6366F1' },
];

export default function MenuPerawatanPage() {
  const router = useRouter();
  const [selectedCategory, setSelectedCategory] = useState<string>('all');
  const [sortBy, setSortBy] = useState<SortMode>('terdekat');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPartner, setSelectedPartner] = useState<ServicePartner | null>(null);

  const categories = [
    { id: 'all', label: 'Semua Jasa', emoji: '🔍' },
    { id: 'permak', label: 'Permak & Jahit', emoji: '🧵' },
    { id: 'cuci', label: 'Cuci & Spa', emoji: '🫧' },
    { id: 'recolor', label: 'Re-Colour', emoji: '🎨' },
    { id: 'upcycle', label: 'Upcycle', emoji: '♻️' },
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

    if (sortBy === 'terdekat') result.sort((a, b) => a.distanceKm - b.distanceKm);
    else if (sortBy === 'termurah') result.sort((a, b) => a.estimatedPrice - b.estimatedPrice);
    else if (sortBy === 'rating') result.sort((a, b) => b.rating - a.rating);
    else if (sortBy === 'sesuai') result = result.filter((p) => p.isVerified);

    return result;
  }, [selectedCategory, searchQuery, sortBy]);

  const sortOptions: { id: SortMode; label: string; emoji: string }[] = [
    { id: 'terdekat', label: 'Terdekat', emoji: '📍' },
    { id: 'termurah', label: 'Termurah', emoji: '🏷️' },
    { id: 'rating', label: 'Rating', emoji: '⭐' },
    { id: 'sesuai', label: 'Sesuai Kebutuhan', emoji: '✅' },
  ];

  const categoryColors: Record<string, string> = {
    permak: 'bg-blue-100 text-blue-800',
    cuci: 'bg-cyan-100 text-cyan-800',
    recolor: 'bg-purple-100 text-purple-800',
    upcycle: 'bg-emerald-100 text-emerald-800',
  };

  return (
    <AppLayout title="Jasa & Perawatan" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-fade-in">

        {/* Interactive Map Placeholder */}
        <div className="relative bg-slate-200 rounded-3xl h-48 border border-border shadow-inner overflow-hidden">
          {/* Gradient map background */}
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-300 via-blue-100 to-emerald-100" />
          {/* Grid lines */}
          <div className="absolute inset-0 opacity-20"
            style={{
              backgroundImage: 'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
              backgroundSize: '32px 32px'
            }}
          />
          {/* Road lines */}
          <div className="absolute top-[45%] left-0 right-0 h-[3px] bg-white/60 rounded-full" />
          <div className="absolute top-0 bottom-0 left-[40%] w-[3px] bg-white/60 rounded-full" />

          {/* Map Pins */}
          {mapPins.map((pin, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center animate-scale-in"
              style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -100%)' }}
            >
              {pin.isUser ? (
                <div className="w-8 h-8 rounded-full bg-[#3A7BF7] border-3 border-white shadow-lg flex items-center justify-center">
                  <span className="text-[10px] text-white font-black">📍</span>
                </div>
              ) : (
                <div
                  className="w-6 h-6 rounded-full border-2 border-white shadow-md flex items-center justify-center"
                  style={{ backgroundColor: pin.color }}
                >
                  <span className="text-[8px] text-white font-black">✂</span>
                </div>
              )}
              <span
                className="text-[9px] font-bold bg-white/90 px-1.5 py-0.5 rounded-full shadow-xs mt-0.5"
                style={{ color: pin.isUser ? '#3A7BF7' : '#374151' }}
              >
                {pin.label}
              </span>
            </div>
          ))}

          {/* Info bubble */}
          <div className="absolute bottom-3 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-2 bg-white/95 backdrop-blur-sm px-4 py-2 rounded-full shadow-md border border-gray-200">
              <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-xs font-extrabold text-[#10284D]">
                {filteredPartners.length} Mitra aktif di sekitarmu
              </span>
            </div>
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
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          )}
        </div>

        {/* Category Filter Chips */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat.id}
              onClick={() => setSelectedCategory(cat.id)}
              className={`flex items-center gap-1.5 px-4 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat.id
                  ? 'bg-[#10284D] text-white shadow-sm'
                  : 'bg-white text-foreground border border-border hover:border-[#10284D]/40'
              }`}
            >
              <span>{cat.emoji}</span>
              <span>{cat.label}</span>
            </button>
          ))}
        </div>

        {/* Sorting Pills — 4 Options */}
        <div className="space-y-2">
          <span className="text-[11px] font-bold text-muted-foreground">Urutkan berdasarkan:</span>
          <div className="grid grid-cols-4 gap-2">
            {sortOptions.map((opt) => (
              <button
                key={opt.id}
                onClick={() => setSortBy(opt.id)}
                className={`flex flex-col items-center justify-center gap-1 py-2.5 rounded-xl text-[10px] font-bold transition-all ${
                  sortBy === opt.id
                    ? 'bg-[#10284D] text-white shadow-md'
                    : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]'
                }`}
              >
                <span className="text-base">{opt.emoji}</span>
                <span className="text-center leading-tight">{opt.label}</span>
              </button>
            ))}
          </div>
        </div>

        {/* Count */}
        <div className="flex items-center justify-between text-[11px] text-muted-foreground font-semibold">
          <span>Menampilkan {filteredPartners.length} mitra</span>
          {sortBy === 'sesuai' && (
            <span className="text-emerald-600 font-bold">✅ Hanya mitra terverifikasi</span>
          )}
        </div>

        {/* List Mitra Jasa */}
        <div className="space-y-3">
          {filteredPartners.map((partner, idx) => (
            <div
              key={partner.id}
              className={`bg-card rounded-2xl p-4 border border-border shadow-sm hover:shadow-md transition-all space-y-3 cursor-pointer active:scale-[0.99] animate-slide-up stagger-${Math.min(idx + 1, 6)}`}
              onClick={() => setSelectedPartner(partner)}
            >
              <div className="flex items-start justify-between">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-xl bg-secondary flex items-center justify-center text-primary font-bold flex-shrink-0 text-xl">
                    {partner.category === 'permak' ? '🧵' :
                     partner.category === 'cuci' ? '🫧' :
                     partner.category === 'recolor' ? '🎨' : '♻️'}
                  </div>
                  <div>
                    <div className="flex items-center gap-1.5 flex-wrap">
                      <h4 className="text-xs font-extrabold text-foreground">{partner.name}</h4>
                      {partner.isVerified && (
                        <span className="text-[9px] bg-emerald-100 text-emerald-800 font-bold px-1.5 py-0.5 rounded">
                          ✓ Terpercaya
                        </span>
                      )}
                    </div>
                    <span className="text-[10px] text-muted-foreground block mt-0.5">
                      {partner.categoryLabel} • {partner.address}
                    </span>
                    {partner.badge && (
                      <span className="text-[9px] font-bold text-[#E86D50] mt-0.5 block">{partner.badge}</span>
                    )}
                  </div>
                </div>
              </div>

              {/* Service tags */}
              <div className="flex flex-wrap gap-1.5">
                {partner.services.map((srv, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-medium px-2 py-0.5 rounded-md ${categoryColors[partner.category] ?? 'bg-muted text-foreground/80'}`}
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
                <div className="flex items-center gap-2">
                  <span className="font-extrabold text-[#E86D50]">
                    Mulai Rp {partner.estimatedPrice.toLocaleString('id-ID')}
                  </span>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      router.push(`/pemesanan-jasa?provider=${encodeURIComponent(partner.name)}`);
                    }}
                    className="bg-[#10284D] text-white px-4 py-2 rounded-xl text-xs font-extrabold shadow-sm hover:bg-[#152248] active:scale-95 transition-all"
                  >
                    Pesan
                  </button>
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Detail Modal */}
      {selectedPartner && (
        <div
          className="fixed inset-0 z-50 flex items-end justify-center bg-black/50 backdrop-blur-sm p-4"
          onClick={() => setSelectedPartner(null)}
        >
          <div
            className="bg-white rounded-3xl w-full max-w-md p-5 space-y-4 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="w-14 h-14 rounded-2xl bg-secondary flex items-center justify-center text-2xl shadow-inner">
                  {selectedPartner.category === 'permak' ? '🧵' :
                   selectedPartner.category === 'cuci' ? '🫧' :
                   selectedPartner.category === 'recolor' ? '🎨' : '♻️'}
                </div>
                <div>
                  <h3 className="text-sm font-extrabold text-[#10284D]">{selectedPartner.name}</h3>
                  <span className="text-xs text-muted-foreground">{selectedPartner.categoryLabel}</span>
                  {selectedPartner.isVerified && (
                    <div className="mt-0.5">
                      <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                        ✓ Mitra Terpercaya Klámbi
                      </span>
                    </div>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="w-8 h-8 rounded-full bg-slate-100 flex items-center justify-center text-slate-500 hover:bg-slate-200"
              >
                ✕
              </button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-3 gap-2 bg-slate-50 rounded-2xl p-3">
              <div className="text-center">
                <div className="text-base font-black text-[#10284D]">{selectedPartner.rating}</div>
                <div className="text-[10px] text-muted-foreground">⭐ Rating</div>
              </div>
              <div className="text-center border-x border-border">
                <div className="text-base font-black text-[#10284D]">{selectedPartner.distanceKm}km</div>
                <div className="text-[10px] text-muted-foreground">📍 Jarak</div>
              </div>
              <div className="text-center">
                <div className="text-base font-black text-[#E86D50]">
                  {selectedPartner.reviewsCount}
                </div>
                <div className="text-[10px] text-muted-foreground">✍️ Ulasan</div>
              </div>
            </div>

            {/* Info */}
            <div className="space-y-2 text-xs text-muted-foreground">
              <div className="flex items-center gap-2">
                <Icon name="MapPinIcon" size={14} className="text-[#10284D] flex-shrink-0" />
                <span>{selectedPartner.address}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="ClockIcon" size={14} className="text-[#10284D] flex-shrink-0" />
                <span>{selectedPartner.openHours}</span>
              </div>
              <div className="flex items-center gap-2">
                <Icon name="CubeIcon" size={14} className="text-[#10284D] flex-shrink-0" />
                <span>{selectedPartner.minOrder}</span>
              </div>
            </div>

            {/* Services */}
            <div>
              <p className="text-[11px] font-bold text-foreground mb-2">Layanan Tersedia:</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPartner.services.map((srv, i) => (
                  <span
                    key={i}
                    className={`text-[10px] font-medium px-2.5 py-1 rounded-full ${categoryColors[selectedPartner.category] ?? 'bg-muted text-foreground'}`}
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            {/* CTA */}
            <div className="grid grid-cols-2 gap-3 pt-1">
              <button
                onClick={() => setSelectedPartner(null)}
                className="py-3 rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:bg-slate-50"
              >
                Kembali
              </button>
              <button
                onClick={() => router.push(`/pemesanan-jasa?provider=${encodeURIComponent(selectedPartner.name)}`)}
                className="py-3 rounded-2xl bg-[#10284D] text-white text-xs font-extrabold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                Pesan Jasa →
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}