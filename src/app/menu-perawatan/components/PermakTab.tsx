'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import ProviderCard, { Provider } from '@/components/ui/ProviderCard';
import BookingModal from './BookingModal';

type SortOption = 'terdekat' | 'termurah' | 'rating';

const tailorProviders: Provider[] = [
  {
    id: 'tailor-001',
    name: 'Jahit Rapih Bu Sari',
    type: 'tailor',
    rating: 4.9,
    reviewCount: 234,
    distance: '0.8 km',
    priceRange: 'Rp 15.000 – 50.000',
    services: ['Ganti Kancing', 'Permak Celana', 'Kecilkan Baju', 'Perbaiki Jahitan'],
    availability: 'available',
    turnaround: '1–2 hari',
    avatar: 'BS',
    location: 'Jl. Melati No. 12, Bandung',
    matchScore: 96,
  },
  {
    id: 'tailor-002',
    name: 'Atelier Mas Dedi',
    type: 'tailor',
    rating: 4.7,
    reviewCount: 189,
    distance: '1.2 km',
    priceRange: 'Rp 20.000 – 80.000',
    services: ['Permak Premium', 'Ubah Model', 'Ganti Resleting', 'Sulam'],
    availability: 'available',
    turnaround: '2–3 hari',
    avatar: 'MD',
    location: 'Jl. Cihampelas No. 45, Bandung',
    matchScore: 89,
  },
  {
    id: 'tailor-003',
    name: 'Modiste Ibu Tini',
    type: 'tailor',
    rating: 4.5,
    reviewCount: 97,
    distance: '1.9 km',
    priceRange: 'Rp 10.000 – 35.000',
    services: ['Ganti Kancing', 'Tambal Kain', 'Perbaiki Jahitan'],
    availability: 'full',
    turnaround: '3–4 hari',
    avatar: 'IT',
    location: 'Jl. Kebon Jati No. 8, Bandung',
    matchScore: 74,
  },
  {
    id: 'tailor-004',
    name: 'Tailor Express Pak Budi',
    type: 'tailor',
    rating: 4.6,
    reviewCount: 312,
    distance: '2.4 km',
    priceRange: 'Rp 25.000 – 60.000',
    services: ['Permak Cepat', 'Ganti Kancing', 'Kecilkan Baju', 'Perbaiki Resleting'],
    availability: 'available',
    turnaround: '1 hari',
    avatar: 'PB',
    location: 'Jl. Riau No. 22, Bandung',
    matchScore: 85,
  },
];

export default function PermakTab() {
  const [sortBy, setSortBy] = useState<SortOption>('terdekat');
  const [selectedProvider, setSelectedProvider] = useState<Provider | null>(null);
  const [showBooking, setShowBooking] = useState(false);

  const sortedProviders = [...tailorProviders].sort((a, b) => {
    if (sortBy === 'terdekat') return parseFloat(a.distance) - parseFloat(b.distance);
    if (sortBy === 'termurah') return parseInt(a.priceRange.replace(/\D/g, '')) - parseInt(b.priceRange.replace(/\D/g, ''));
    return b.rating - a.rating;
  });

  const handleProviderSelect = (provider: Provider) => {
    setSelectedProvider(provider);
  };

  const handleBook = () => {
    if (selectedProvider) setShowBooking(true);
  };

  return (
    <div className="space-y-4">
      {/* What needs fixing */}
      <div className="p-3 bg-secondary rounded-xl border border-accent/30">
        <p className="text-xs font-700 text-foreground mb-2">Perbaikan yang Dibutuhkan</p>
        <div className="flex flex-wrap gap-1.5">
          {['Ganti Kancing (2 biji)', 'Perbaiki Jahitan Kerah'].map((fix) => (
            <span
              key={`fix-${fix}`}
              className="text-xs bg-card border border-border text-foreground px-2.5 py-1 rounded-full font-500"
            >
              {fix}
            </span>
          ))}
        </div>
      </div>

      {/* Sort Controls */}
      <div className="flex items-center gap-2">
        <p className="text-xs text-muted-foreground font-500 flex-shrink-0">Urutkan:</p>
        <div className="flex gap-1.5 overflow-x-auto scrollbar-hide">
          {([
            { key: 'terdekat' as SortOption, label: 'Terdekat' },
            { key: 'termurah' as SortOption, label: 'Termurah' },
            { key: 'rating' as SortOption, label: 'Rating Tertinggi' },
          ]).map((opt) => (
            <button
              key={`sort-${opt.key}`}
              onClick={() => setSortBy(opt.key)}
              className={`flex-shrink-0 text-xs px-3 py-1.5 rounded-full font-600 border transition-all duration-150 ${
                sortBy === opt.key
                  ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-accent'
              }`}
            >
              {opt.label}
            </button>
          ))}
        </div>
      </div>

      {/* Provider List */}
      <div className="space-y-3">
        <p className="text-xs text-muted-foreground font-500">
          {sortedProviders.length} tailor ditemukan dalam radius 5 km
        </p>
        {sortedProviders.map((provider) => (
          <ProviderCard
            key={`provider-${provider.id}`}
            provider={provider}
            onSelect={handleProviderSelect}
            selected={selectedProvider?.id === provider.id}
          />
        ))}
      </div>

      {/* Book CTA */}
      {selectedProvider && (
        <div className="sticky bottom-[80px] left-0 right-0 animate-slide-up">
          <button
            onClick={handleBook}
            className="btn-primary w-full flex items-center justify-center gap-2 py-4"
          >
            <Icon name="CalendarDaysIcon" size={18} className="text-white" />
            Pesan {selectedProvider.name}
          </button>
        </div>
      )}

      {showBooking && selectedProvider && (
        <BookingModal
          provider={selectedProvider}
          onClose={() => setShowBooking(false)}
        />
      )}
    </div>
  );
}