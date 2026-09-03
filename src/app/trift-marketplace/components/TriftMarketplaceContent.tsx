'use client';
import React, { useState, useMemo } from 'react';
import Icon from '@/components/ui/AppIcon';
import TriftListingGrid from './TriftListingGrid';
import TriftListingModal from './TriftListingModal';
import { TriftListing, triftListings } from '../data/triftListings';

type SortOption = 'terbaru' | 'termurah' | 'termahal' | 'skor_tertinggi';

const categories = [
  { id: 'cat-all', label: 'Semua', icon: 'Squares2X2Icon' },
  { id: 'cat-kemeja', label: 'Kemeja', icon: 'UserIcon' },
  { id: 'cat-celana', label: 'Celana', icon: 'UserIcon' },
  { id: 'cat-dress', label: 'Dress', icon: 'UserIcon' },
  { id: 'cat-jaket', label: 'Jaket', icon: 'UserIcon' },
  { id: 'cat-kaos', label: 'Kaos', icon: 'UserIcon' },
];

const conditionFilters = [
  { id: 'cond-all', label: 'Semua Kondisi', min: 0 },
  { id: 'cond-excellent', label: 'Sangat Baik (80+)', min: 80 },
  { id: 'cond-good', label: 'Cukup Baik (60–79)', min: 60 },
  { id: 'cond-fair', label: 'Perlu Perhatian (<60)', min: 0 },
];

export default function TriftMarketplaceContent() {
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [selectedCondition, setSelectedCondition] = useState('cond-all');
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');
  const [selectedListing, setSelectedListing] = useState<TriftListing | null>(null);

  const filtered = useMemo(() => {
    let result = [...triftListings];

    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter(
        (l) =>
          l.title.toLowerCase().includes(q) ||
          l.category.toLowerCase().includes(q) ||
          l.brand.toLowerCase().includes(q)
      );
    }

    if (selectedCategory !== 'cat-all') {
      const catLabel = categories.find((c) => c.id === selectedCategory)?.label ?? '';
      result = result.filter((l) => l.category === catLabel);
    }

    if (selectedCondition !== 'cond-all') {
      const cond = conditionFilters.find((c) => c.id === selectedCondition);
      if (cond) {
        if (selectedCondition === 'cond-excellent') result = result.filter((l) => l.aiScore >= 80);
        else if (selectedCondition === 'cond-good') result = result.filter((l) => l.aiScore >= 60 && l.aiScore < 80);
        else if (selectedCondition === 'cond-fair') result = result.filter((l) => l.aiScore < 60);
      }
    }

    result.sort((a, b) => {
      if (sortBy === 'termurah') return a.price - b.price;
      if (sortBy === 'termahal') return b.price - a.price;
      if (sortBy === 'skor_tertinggi') return b.aiScore - a.aiScore;
      return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
    });

    return result;
  }, [search, selectedCategory, selectedCondition, sortBy]);

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto">
      {/* Search Bar */}
      <div className="relative">
        <Icon
          name="MagnifyingGlassIcon"
          size={18}
          className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none"
        />
        <input
          type="search"
          value={search}
          onChange={(e) => setSearch(e.target.value)}
          placeholder="Cari baju, brand, atau kategori..."
          className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
          aria-label="Cari listing trift"
        />
        {search && (
          <button
            onClick={() => setSearch('')}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground"
            aria-label="Hapus pencarian"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        )}
      </div>

      {/* Category Filter */}
      <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
        {categories.map((cat) => (
          <button
            key={cat.id}
            onClick={() => setSelectedCategory(cat.id)}
            className={`flex-shrink-0 text-xs px-4 py-2 rounded-full font-600 border transition-all duration-150 ${
              selectedCategory === cat.id
                ? 'bg-primary text-white border-primary' :'bg-card text-muted-foreground border-border hover:border-accent'
            }`}
          >
            {cat.label}
          </button>
        ))}
      </div>

      {/* Filters Row */}
      <div className="flex items-center gap-2 flex-wrap">
        {/* Condition Filter */}
        <select
          value={selectedCondition}
          onChange={(e) => setSelectedCondition(e.target.value)}
          className="text-xs bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-500 cursor-pointer"
          aria-label="Filter kondisi"
        >
          {conditionFilters.map((f) => (
            <option key={f.id} value={f.id}>{f.label}</option>
          ))}
        </select>

        {/* Sort */}
        <select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value as SortOption)}
          className="text-xs bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-500 cursor-pointer"
          aria-label="Urutkan listing"
        >
          <option value="terbaru">Terbaru</option>
          <option value="termurah">Termurah</option>
          <option value="termahal">Termahal</option>
          <option value="skor_tertinggi">Skor AI Tertinggi</option>
        </select>

        <div className="ml-auto flex items-center gap-1.5">
          <Icon name="ShirtIcon" size={14} className="text-muted-foreground" />
          <span className="text-xs text-muted-foreground font-500">
            {filtered.length} item
          </span>
        </div>
      </div>

      {/* Listing Grid */}
      <TriftListingGrid
        listings={filtered}
        onSelectListing={setSelectedListing}
      />

      {/* Listing Detail Modal */}
      {selectedListing && (
        <TriftListingModal
          listing={selectedListing}
          onClose={() => setSelectedListing(null)}
        />
      )}
    </div>
  );
}