'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { StaggerContainer, StaggerItem } from '@/components/motion';

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
    badge: 'Terpopuler',
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
    badge: 'Terdekat',
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
    badge: 'Rating Teratas',
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
    badge: 'Eco-Partner',
  },
];

type SortMode = 'terdekat' | 'termurah' | 'rating' | 'sesuai';

const mapPins = [
  { top: '58%', left: '45%', label: 'Kamu', color: '#3A7BF7', isUser: true },
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
    { id: 'all', label: 'Semua Jasa', icon: 'Squares2X2Icon' },
    { id: 'permak', label: 'Permak & Jahit', icon: 'ScissorsIcon' },
    { id: 'cuci', label: 'Cuci & Spa', icon: 'SparklesIcon' },
    { id: 'recolor', label: 'Re-Colour', icon: 'SwatchIcon' },
    { id: 'upcycle', label: 'Upcycle', icon: 'ArrowPathRoundedSquareIcon' },
  ];

  const categoryIcon: Record<ServicePartner['category'], string> = {
    permak: 'ScissorsIcon',
    cuci: 'SparklesIcon',
    recolor: 'SwatchIcon',
    upcycle: 'ArrowPathRoundedSquareIcon',
  };

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

  const sortOptions: { id: SortMode; label: string; icon: string }[] = [
    { id: 'terdekat', label: 'Terdekat', icon: 'MapPinIcon' },
    { id: 'termurah', label: 'Termurah', icon: 'TagIcon' },
    { id: 'rating', label: 'Rating', icon: 'StarIcon' },
    { id: 'sesuai', label: 'Sesuai', icon: 'CheckBadgeIcon' },
  ];

  const categoryColors: Record<string, string> = {
    permak: 'bg-blue-50 text-blue-800',
    cuci: 'bg-cyan-50 text-cyan-800',
    recolor: 'bg-purple-50 text-purple-800',
    upcycle: 'bg-emerald-50 text-emerald-800',
  };

  const goOrder = (name: string) => router.push(`/pemesanan-jasa?provider=${encodeURIComponent(name)}`);

  return (
    <AppLayout title="Jasa & Perawatan" showBack backHref="/">
      <div className="space-y-3 pb-4 animate-fade-in">
        {/* Map placeholder */}
        <div className="relative rounded-2xl h-36 shadow-card overflow-hidden bg-slate-200" role="img" aria-label="Peta mitra jasa di sekitarmu">
          <div className="absolute inset-0 bg-gradient-to-tr from-slate-200 via-blue-100 to-emerald-100" />
          <div
            className="absolute inset-0 opacity-20"
            style={{
              backgroundImage:
                'linear-gradient(#94a3b8 1px, transparent 1px), linear-gradient(90deg, #94a3b8 1px, transparent 1px)',
              backgroundSize: '28px 28px',
            }}
          />
          <div className="absolute top-[45%] left-0 right-0 h-[3px] bg-white/70 rounded-full" />
          <div className="absolute top-0 bottom-0 left-[40%] w-[3px] bg-white/70 rounded-full" />

          {mapPins.map((pin, i) => (
            <div
              key={i}
              className="absolute flex flex-col items-center animate-scale-in"
              style={{ top: pin.top, left: pin.left, transform: 'translate(-50%, -100%)' }}
            >
              <span
                className={`${pin.isUser ? 'w-7 h-7' : 'w-5 h-5'} rounded-full border-2 border-white shadow-md flex items-center justify-center text-white`}
                style={{ backgroundColor: pin.color }}
                aria-hidden="true"
              >
                <Icon
                  name={pin.isUser ? 'MapPinIcon' : 'ScissorsIcon'}
                  variant="solid"
                  size={pin.isUser ? 14 : 10}
                />
              </span>
              <span
                className="text-[9px] font-semibold bg-white/90 px-1.5 rounded-full shadow-sm mt-0.5 leading-4"
                style={{ color: pin.isUser ? '#3A7BF7' : '#374151' }}
              >
                {pin.label}
              </span>
            </div>
          ))}

          <div className="absolute top-2 left-0 right-0 flex justify-center">
            <div className="flex items-center gap-1.5 bg-white/95 backdrop-blur-sm pl-2.5 pr-3 h-7 rounded-full shadow-md">
              <span className="w-1.5 h-1.5 rounded-full bg-emerald-500 animate-pulse" />
              <span className="text-[11px] font-semibold text-navy">
                {filteredPartners.length} mitra aktif di sekitarmu
              </span>
            </div>
          </div>
        </div>

        {/* Search */}
        <div className="relative">
          <Icon
            name="MagnifyingGlassIcon"
            size={18}
            className="absolute left-3.5 top-1/2 -translate-y-1/2 text-navy pointer-events-none"
            aria-hidden="true"
          />
          <input
            type="search"
            aria-label="Cari jasa"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Cari tailor, kancing, recolor, spa..."
            className="w-full h-10 bg-white rounded-full pl-10 pr-10 text-[13px] text-gray-900 placeholder:text-gray-500 shadow-card outline-none focus:ring-2 focus:ring-navy"
          />
          {searchQuery && (
            <button
              onClick={() => setSearchQuery('')}
              className="absolute right-1 top-1/2 -translate-y-1/2 w-8 h-8 flex items-center justify-center text-gray-500 hover:text-gray-800"
              aria-label="Hapus pencarian"
            >
              <Icon name="XMarkIcon" size={16} />
            </button>
          )}
        </div>

        {/* Category chips */}
        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Kategori jasa">
          {categories.map((cat) => {
            const active = selectedCategory === cat.id;
            return (
              <button
                key={cat.id}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat.id)}
                className={`flex items-center gap-1.5 h-9 px-3.5 rounded-full text-[12px] whitespace-nowrap border transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                  active
                    ? 'bg-navy border-navy text-white font-medium shadow-sm'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-navy/60'
                }`}
              >
                <Icon name={cat.icon} size={15} aria-hidden="true" />
                <span>{cat.label}</span>
              </button>
            );
          })}
        </div>

        {/* Sort segmented control */}
        <div>
          <p className="text-[11px] text-gray-600 mb-1.5">Urutkan berdasarkan</p>
          <div className="grid grid-cols-4 bg-white rounded-xl shadow-card p-1" role="radiogroup" aria-label="Urutkan">
            {sortOptions.map((opt) => {
              const active = sortBy === opt.id;
              return (
                <button
                  key={opt.id}
                  role="radio"
                  aria-checked={active}
                  onClick={() => setSortBy(opt.id)}
                  className={`h-9 rounded-lg flex items-center justify-center gap-1 text-[11px] transition-all duration-200 active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy ${
                    active ? 'bg-navy text-white font-medium' : 'text-gray-700 hover:bg-gray-50'
                  }`}
                >
                  <Icon name={opt.icon} variant={active ? 'solid' : 'outline'} size={14} aria-hidden="true" />
                  <span>{opt.label}</span>
                </button>
              );
            })}
          </div>
        </div>

        <div className="flex items-center justify-between text-[11px] text-gray-600">
          <span>Menampilkan {filteredPartners.length} mitra</span>
          {sortBy === 'sesuai' && (
            <span className="flex items-center gap-1 text-emerald-700 font-medium">
              <Icon name="CheckBadgeIcon" variant="solid" size={13} aria-hidden="true" />
              Hanya mitra terverifikasi
            </span>
          )}
        </div>

        {/* Partner list */}
        <StaggerContainer className="space-y-2.5" staggerDelay={50}>
          {filteredPartners.map((partner) => (
            <StaggerItem key={partner.id}>
              <div
                role="button"
                tabIndex={0}
                onClick={() => setSelectedPartner(partner)}
                onKeyDown={(e) => {
                  if (e.key === 'Enter' || e.key === ' ') {
                    e.preventDefault();
                    setSelectedPartner(partner);
                  }
                }}
                className="bg-white rounded-2xl p-3 shadow-card hover:shadow-card-hover transition-all cursor-pointer active:scale-[0.99] space-y-2.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
              >
                <div className="flex items-start gap-2.5">
                  <span
                    className={`w-11 h-11 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[partner.category]}`}
                    aria-hidden="true"
                  >
                    <Icon name={categoryIcon[partner.category]} size={22} />
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-center gap-1.5">
                      <h4 className="text-[13px] font-semibold text-gray-900 truncate">{partner.name}</h4>
                      {partner.isVerified && (
                        <Icon
                          name="CheckBadgeIcon"
                          variant="solid"
                          size={15}
                          className="text-emerald-600 flex-shrink-0"
                          aria-label="Mitra terpercaya"
                        />
                      )}
                    </div>
                    <p className="text-[11px] text-gray-600 truncate mt-0.5">
                      {partner.categoryLabel} • {partner.address}
                    </p>
                    {partner.badge && (
                      <span className="inline-flex items-center gap-1 text-[10px] font-medium text-coral mt-0.5">
                        <Icon name="SparklesIcon" variant="solid" size={11} aria-hidden="true" />
                        {partner.badge}
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex flex-wrap gap-1">
                  {partner.services.map((srv, i) => (
                    <span
                      key={i}
                      className={`text-[10px] px-2 py-0.5 rounded-full ${categoryColors[partner.category] ?? 'bg-gray-100 text-gray-800'}`}
                    >
                      {srv}
                    </span>
                  ))}
                </div>

                <div className="flex items-center justify-between pt-2 border-t border-gray-100">
                  <div className="flex items-center gap-2.5 text-[11px] text-gray-700">
                    <span className="flex items-center gap-0.5">
                      <Icon name="MapPinIcon" variant="solid" size={13} className="text-coral" aria-hidden="true" />
                      {partner.distanceKm} km
                    </span>
                    <span className="flex items-center gap-0.5">
                      <Icon name="StarIcon" variant="solid" size={13} className="text-amber-400" aria-hidden="true" />
                      {partner.rating} ({partner.reviewsCount})
                    </span>
                  </div>
                  <div className="flex items-center gap-2">
                    <span className="text-[12px] font-semibold text-coral">
                      Rp{partner.estimatedPrice.toLocaleString('id-ID')}
                    </span>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        goOrder(partner.name);
                      }}
                      className="h-8 px-4 rounded-full bg-navy text-white text-[12px] font-medium hover:bg-navy-deep active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy focus-visible:ring-offset-1"
                    >
                      Pesan
                    </button>
                  </div>
                </div>
              </div>
            </StaggerItem>
          ))}
        </StaggerContainer>

        {filteredPartners.length === 0 && (
          <div className="text-center py-10 text-[12px] text-gray-600">
            Tidak ada mitra yang cocok. Coba ubah kata kunci atau kategori.
          </div>
        )}
      </div>

      {/* Detail bottom sheet */}
      {selectedPartner && (
        <div
          className="fixed inset-0 z-[60] flex items-end justify-center bg-black/50 backdrop-blur-sm"
          onClick={() => setSelectedPartner(null)}
          role="dialog"
          aria-modal="true"
          aria-label={`Detail ${selectedPartner.name}`}
        >
          <div
            className="bg-white rounded-t-3xl w-full max-w-md p-4 pb-6 space-y-3.5 animate-slide-up shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            <div className="flex items-start justify-between gap-3">
              <div className="flex items-center gap-3 min-w-0">
                <span
                  className={`w-12 h-12 rounded-xl flex items-center justify-center flex-shrink-0 ${categoryColors[selectedPartner.category]}`}
                  aria-hidden="true"
                >
                  <Icon name={categoryIcon[selectedPartner.category]} size={24} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-[14px] font-semibold text-navy leading-snug">{selectedPartner.name}</h3>
                  <p className="text-[11px] text-gray-600">{selectedPartner.categoryLabel}</p>
                  {selectedPartner.isVerified && (
                    <span className="inline-flex items-center gap-1 text-[10px] text-emerald-700 font-medium mt-0.5">
                      <Icon name="CheckBadgeIcon" variant="solid" size={12} aria-hidden="true" />
                      Mitra Terpercaya Klámbi
                    </span>
                  )}
                </div>
              </div>
              <button
                onClick={() => setSelectedPartner(null)}
                className="w-9 h-9 rounded-full bg-gray-100 flex items-center justify-center text-gray-600 hover:bg-gray-200 flex-shrink-0"
                aria-label="Tutup"
              >
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            <div className="grid grid-cols-3 bg-gray-50 rounded-xl py-2.5">
              <div className="text-center">
                <div className="text-[15px] font-semibold text-navy">{selectedPartner.rating}</div>
                <div className="text-[10px] text-gray-600">Rating</div>
              </div>
              <div className="text-center border-x border-gray-200">
                <div className="text-[15px] font-semibold text-navy">{selectedPartner.distanceKm} km</div>
                <div className="text-[10px] text-gray-600">Jarak</div>
              </div>
              <div className="text-center">
                <div className="text-[15px] font-semibold text-coral">{selectedPartner.reviewsCount}</div>
                <div className="text-[10px] text-gray-600">Ulasan</div>
              </div>
            </div>

            <ul className="space-y-1.5 text-[12px] text-gray-700">
              <li className="flex items-center gap-2">
                <Icon name="MapPinIcon" size={15} className="text-navy flex-shrink-0" aria-hidden="true" />
                <span>{selectedPartner.address}</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="ClockIcon" size={15} className="text-navy flex-shrink-0" aria-hidden="true" />
                <span>{selectedPartner.openHours}</span>
              </li>
              <li className="flex items-center gap-2">
                <Icon name="CubeIcon" size={15} className="text-navy flex-shrink-0" aria-hidden="true" />
                <span>{selectedPartner.minOrder}</span>
              </li>
            </ul>

            <div>
              <p className="text-[12px] font-semibold text-gray-900 mb-1.5">Layanan tersedia</p>
              <div className="flex flex-wrap gap-1.5">
                {selectedPartner.services.map((srv, i) => (
                  <span
                    key={i}
                    className={`text-[11px] px-2.5 py-1 rounded-full ${categoryColors[selectedPartner.category]}`}
                  >
                    {srv}
                  </span>
                ))}
              </div>
            </div>

            <div className="grid grid-cols-2 gap-2.5 pt-1">
              <button
                onClick={() => setSelectedPartner(null)}
                className="h-11 rounded-full border border-gray-300 text-[13px] font-medium text-gray-700 hover:bg-gray-50 active:scale-95 transition-all"
              >
                Kembali
              </button>
              <button
                onClick={() => goOrder(selectedPartner.name)}
                className="h-11 rounded-full bg-navy text-white text-[13px] font-medium hover:bg-navy-deep active:scale-95 transition-all"
              >
                Pesan Jasa
              </button>
            </div>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
