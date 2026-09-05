'use client';
import React, { useState, useMemo } from 'react';
import Image from 'next/image';
import Icon from '@/components/ui/AppIcon';
import TriftListingGrid from './TriftListingGrid';
import TriftListingModal from './TriftListingModal';
import { TriftListing, triftListings } from '../data/triftListings';
import { toast } from 'sonner';

type SortOption = 'terbaru' | 'termurah' | 'termahal' | 'skor_tertinggi';
type TabType = 'trift' | 'produk' | 'umkm';

const categories = [
  { id: 'cat-all', label: 'Semua' },
  { id: 'cat-kemeja', label: 'Kemeja' },
  { id: 'cat-celana', label: 'Celana' },
  { id: 'cat-dress', label: 'Dress' },
  { id: 'cat-jaket', label: 'Jaket' },
  { id: 'cat-kaos', label: 'Kaos' },
];

const conditionFilters = [
  { id: 'cond-all', label: 'Semua Kondisi', min: 0 },
  { id: 'cond-excellent', label: 'Sangat Baik (80+)', min: 80 },
  { id: 'cond-good', label: 'Cukup Baik (60–79)', min: 60 },
  { id: 'cond-fair', label: 'Perlu Perhatian (<60)', min: 0 },
];

interface CareProduct {
  id: string;
  name: string;
  brand: string;
  price: number;
  originalPrice: number;
  category: string;
  emoji: string;
  imageUrl: string;
  badge?: string;
  rating: number;
  sold: number;
}

const careProducts: CareProduct[] = [
  {
    id: 'cp-1',
    name: 'Kindfoam Eco-Deterjen Lembaran 30pcs',
    brand: 'Kindfoam',
    price: 45000,
    originalPrice: 65000,
    category: 'Deterjen',
    emoji: '🧼',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    badge: 'Best Seller',
    rating: 4.9,
    sold: 1240,
  },
  {
    id: 'cp-2',
    name: 'Cedar Wood Anti-Ngengat Pack (6pcs)',
    brand: 'EcoGuard',
    price: 28000,
    originalPrice: 40000,
    category: 'Penyimpanan',
    emoji: '🪵',
    imageUrl: 'https://images.unsplash.com/photo-1586023492125-27b2c045efd7?w=600&auto=format&fit=crop&q=80',
    badge: 'Eco-Friendly',
    rating: 4.7,
    sold: 856,
  },
  {
    id: 'cp-3',
    name: 'Lerak Sachet Cuci Natural 250ml',
    brand: 'HijauCare',
    price: 22000,
    originalPrice: 32000,
    category: 'Deterjen',
    emoji: '🌿',
    imageUrl: 'https://images.unsplash.com/photo-1608248597359-0a566580f142?w=600&auto=format&fit=crop&q=80',
    rating: 4.8,
    sold: 624,
  },
  {
    id: 'cp-4',
    name: 'Silica Gel Premium Lemari (4 pak)',
    brand: 'DryFresh',
    price: 18000,
    originalPrice: 25000,
    category: 'Penyimpanan',
    emoji: '🫙',
    imageUrl: 'https://images.unsplash.com/photo-1584308666744-24d5c474f2ae?w=600&auto=format&fit=crop&q=80',
    rating: 4.5,
    sold: 432,
  },
  {
    id: 'cp-5',
    name: 'Eco Fabric Softener Sheet Rose 20pcs',
    brand: 'Kindfoam',
    price: 35000,
    originalPrice: 50000,
    category: 'Softener',
    emoji: '🌹',
    imageUrl: 'https://images.unsplash.com/photo-1556228720-195a672e8a03?w=600&auto=format&fit=crop&q=80',
    badge: 'New!',
    rating: 4.6,
    sold: 198,
  },
  {
    id: 'cp-6',
    name: 'Micro-Fiber Washing Bag Anti-Plastik',
    brand: 'CleanLoop',
    price: 55000,
    originalPrice: 75000,
    category: 'Aksesoris',
    emoji: '🛍️',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    badge: 'Eco-Friendly',
    rating: 4.8,
    sold: 377,
  },
];

interface UmkmProduct {
  id: string;
  name: string;
  artisan: string;
  price: number;
  originalMaterial: string;
  emoji: string;
  imageUrl: string;
  badge?: string;
  rating: number;
  location: string;
}

const umkmProducts: UmkmProduct[] = [
  {
    id: 'um-1',
    name: 'Tote Bag Patchwork Denim',
    artisan: 'Karya Sirkular Studio',
    price: 125000,
    originalMaterial: 'Denim bekas',
    emoji: '👜',
    imageUrl: 'https://images.unsplash.com/photo-1544816155-12df9643f363?w=600&auto=format&fit=crop&q=80',
    badge: '♻️ Dari Limbah',
    rating: 4.9,
    location: 'Jakarta',
  },
  {
    id: 'um-2',
    name: 'Bucket Hat Upcycled Flannel',
    artisan: 'ReworkLab ID',
    price: 85000,
    originalMaterial: 'Kemeja flanel lama',
    emoji: '🪣',
    imageUrl: 'https://images.unsplash.com/photo-1575428652377-a2d80e2277fc?w=600&auto=format&fit=crop&q=80',
    rating: 4.7,
    location: 'Bandung',
  },
  {
    id: 'um-3',
    name: 'Pouch Kain Perca Batik Mix',
    artisan: 'Batik Nusantara Sirkular',
    price: 65000,
    originalMaterial: 'Perca batik',
    emoji: '🎒',
    imageUrl: 'https://images.unsplash.com/photo-1566150905458-1bf1fc113f0d?w=600&auto=format&fit=crop&q=80',
    badge: 'Handmade',
    rating: 4.8,
    location: 'Solo',
  },
  {
    id: 'um-4',
    name: 'Vest Rework Denim Vintage',
    artisan: 'Sirkular Upcycle Lab',
    price: 220000,
    originalMaterial: 'Jaket denim vintage',
    emoji: '🦺',
    imageUrl: 'https://images.unsplash.com/photo-1516257984-b1b4d707412e?w=600&auto=format&fit=crop&q=80',
    badge: '🔥 Hot',
    rating: 5.0,
    location: 'Yogyakarta',
  },
  {
    id: 'um-5',
    name: 'Scrunchie Set Satin Upcycled (5pcs)',
    artisan: 'ReThreads Co.',
    price: 45000,
    originalMaterial: 'Kain satin bekas',
    emoji: '💍',
    imageUrl: 'https://images.unsplash.com/photo-1607083206869-4c7672e72a8a?w=600&auto=format&fit=crop&q=80',
    rating: 4.6,
    location: 'Surabaya',
  },
  {
    id: 'um-6',
    name: 'Tas Belanja Anyaman Kain Tenun',
    artisan: 'Tenun Nusantara Eco',
    price: 150000,
    originalMaterial: 'Tenun tradisional',
    emoji: '🧺',
    imageUrl: 'https://images.unsplash.com/photo-1590874103328-eac38a683ce7?w=600&auto=format&fit=crop&q=80',
    badge: 'Budaya',
    rating: 4.9,
    location: 'Bali',
  },
];

const heroBanners = [
  { gradient: 'from-[#10284D] via-[#1A3A6B] to-[#254E8C]', tag: 'MEGA SALE', headline: 'Thrift Up to 85% Off', sub: 'Ribuan item fashion berkondisi baik, harga terjangkau', cta: 'Lihat Semua Trift →', tab: 'trift' as TabType },
  { gradient: 'from-[#166534] via-[#15803D] to-[#22C55E]', tag: 'ECO CHOICE', headline: 'Produk Perawatan Ramah Lingkungan', sub: 'Jaga pakaianmu dengan produk yang menjaga bumi', cta: 'Belanja Produk Eco →', tab: 'produk' as TabType },
  { gradient: 'from-[#9333EA] via-[#7C3AED] to-[#4F46E5]', tag: 'UMKM LOKAL', headline: 'Kerajinan dari Limbah Tekstil', sub: 'Dukung pengrajin lokal yang mengubah sampah jadi karya', cta: 'Dukung UMKM →', tab: 'umkm' as TabType },
];

export default function TriftMarketplaceContent() {
  const [activeTab, setActiveTab] = useState<TabType>('trift');
  const [search, setSearch] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('cat-all');
  const [selectedCondition, setSelectedCondition] = useState('cond-all');
  const [sortBy, setSortBy] = useState<SortOption>('terbaru');
  const [selectedListing, setSelectedListing] = useState<TriftListing | null>(null);
  const [heroBannerIdx, setHeroBannerIdx] = useState(0);
  const [cart, setCart] = useState<Set<string>>(new Set());

  const banner = heroBanners[heroBannerIdx];

  const filtered = useMemo(() => {
    let result = [...triftListings];
    if (search.trim()) {
      const q = search.toLowerCase();
      result = result.filter((l) =>
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
      if (selectedCondition === 'cond-excellent') result = result.filter((l) => l.aiScore >= 80);
      else if (selectedCondition === 'cond-good') result = result.filter((l) => l.aiScore >= 60 && l.aiScore < 80);
      else if (selectedCondition === 'cond-fair') result = result.filter((l) => l.aiScore < 60);
    }
    result.sort((a, b) => {
      if (sortBy === 'termurah') return a.price - b.price;
      if (sortBy === 'termahal') return b.price - a.price;
      if (sortBy === 'skor_tertinggi') return b.aiScore - a.aiScore;
      return new Date(b.listedAt).getTime() - new Date(a.listedAt).getTime();
    });
    return result;
  }, [search, selectedCategory, selectedCondition, sortBy]);

  const toggleCart = (id: string, name: string) => {
    setCart((prev) => {
      const next = new Set(prev);
      if (next.has(id)) {
        next.delete(id);
        toast.info(`${name} dihapus dari keranjang`);
      } else {
        next.add(id);
        toast.success(`${name} ditambahkan ke keranjang! 🛒`);
      }
      return next;
    });
  };

  return (
    <div className="space-y-4 max-w-screen-2xl mx-auto animate-fade-in">

      {/* Hero Banner */}
      <div className={`relative rounded-3xl overflow-hidden bg-gradient-to-r ${banner.gradient} text-white p-5 min-h-[140px] flex flex-col justify-between`}>
        <div>
          <span className="text-[10px] font-extrabold bg-white/20 border border-white/30 px-2.5 py-0.5 rounded-full tracking-wider">
            {banner.tag}
          </span>
          <h2 className="text-lg font-black leading-tight mt-2">{banner.headline}</h2>
          <p className="text-xs text-white/80 mt-1">{banner.sub}</p>
        </div>
        <div className="flex items-center justify-between mt-3">
          <button
            onClick={() => setActiveTab(banner.tab)}
            className="bg-white/20 hover:bg-white/30 border border-white/40 text-white text-xs font-bold px-4 py-2 rounded-full transition-all active:scale-95"
          >
            {banner.cta}
          </button>
          <div className="flex gap-1.5">
            {heroBanners.map((_, i) => (
              <button
                key={i}
                onClick={() => setHeroBannerIdx(i)}
                className={`rounded-full transition-all ${i === heroBannerIdx ? 'w-5 h-2 bg-white' : 'w-2 h-2 bg-white/40'}`}
              />
            ))}
          </div>
        </div>
        {/* Decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 rounded-full bg-white/10 pointer-events-none" />
        <div className="absolute right-16 -bottom-6 w-20 h-20 rounded-full bg-white/10 pointer-events-none" />
      </div>

      {/* Tab Selector */}
      <div className="grid grid-cols-3 gap-2 bg-slate-100 rounded-2xl p-1.5">
        {[
          { id: 'trift' as TabType, label: 'Trift', emoji: '👗' },
          { id: 'produk' as TabType, label: 'Produk Eco', emoji: '🌿' },
          { id: 'umkm' as TabType, label: 'UMKM', emoji: '♻️' },
        ].map((tab) => (
          <button
            key={tab.id}
            onClick={() => setActiveTab(tab.id)}
            className={`flex items-center justify-center gap-1.5 py-2.5 rounded-xl text-xs font-bold transition-all ${
              activeTab === tab.id
                ? 'bg-white text-[#10284D] shadow-sm'
                : 'text-muted-foreground hover:text-foreground'
            }`}
          >
            <span>{tab.emoji}</span>
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* ===== TAB TRIFT ===== */}
      {activeTab === 'trift' && (
        <div className="space-y-3 animate-fade-in">
          {/* Search Bar */}
          <div className="relative">
            <Icon name="MagnifyingGlassIcon" size={18} className="absolute left-3.5 top-1/2 -translate-y-1/2 text-muted-foreground pointer-events-none" />
            <input
              type="search"
              value={search}
              onChange={(e) => setSearch(e.target.value)}
              placeholder="Cari baju, brand, atau kategori..."
              className="w-full bg-card border border-border rounded-xl pl-10 pr-4 py-3 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            {search && (
              <button onClick={() => setSearch('')} className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground">
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
                className={`flex-shrink-0 text-xs px-4 py-2 rounded-full font-bold border transition-all duration-150 ${
                  selectedCategory === cat.id
                    ? 'bg-[#10284D] text-white border-[#10284D]'
                    : 'bg-card text-muted-foreground border-border hover:border-[#10284D]/40'
                }`}
              >
                {cat.label}
              </button>
            ))}
          </div>

          {/* Filters Row */}
          <div className="flex items-center gap-2 flex-wrap">
            <select
              value={selectedCondition}
              onChange={(e) => setSelectedCondition(e.target.value)}
              className="text-xs bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-semibold cursor-pointer"
            >
              {conditionFilters.map((f) => (
                <option key={f.id} value={f.id}>{f.label}</option>
              ))}
            </select>
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value as SortOption)}
              className="text-xs bg-card border border-border rounded-xl px-3 py-2 text-foreground focus:outline-none focus:ring-2 focus:ring-ring font-semibold cursor-pointer"
            >
              <option value="terbaru">Terbaru</option>
              <option value="termurah">Termurah</option>
              <option value="termahal">Termahal</option>
              <option value="skor_tertinggi">Skor AI Tertinggi</option>
            </select>
            <div className="ml-auto text-xs text-muted-foreground font-semibold">
              {filtered.length} item
            </div>
          </div>

          <TriftListingGrid listings={filtered} onSelectListing={setSelectedListing} />

          {selectedListing && (
            <TriftListingModal listing={selectedListing} onClose={() => setSelectedListing(null)} />
          )}
        </div>
      )}

      {/* ===== TAB PRODUK PERAWATAN ===== */}
      {activeTab === 'produk' && (
        <div className="space-y-3 animate-fade-in">
          {/* Top Pick */}
          <div className="bg-gradient-to-r from-emerald-50 to-cyan-50 border border-emerald-200 rounded-3xl p-4 space-y-3">
            <div className="flex items-center gap-2">
              <span className="text-base">🌟</span>
              <span className="text-xs font-extrabold text-emerald-800">Pilihan Utama Klámbi</span>
            </div>
            <div className="flex items-center gap-4">
              <div className="relative w-24 h-24 rounded-2xl overflow-hidden flex-shrink-0 shadow-sm bg-white border border-emerald-200">
                <Image
                  src={careProducts[0].imageUrl}
                  alt={careProducts[0].name}
                  fill
                  unoptimized
                  className="object-cover"
                />
              </div>
              <div className="flex-1 min-w-0">
                <div className="text-xs font-extrabold text-[#10284D]">Kindfoam Eco-Deterjen Lembaran 30pcs</div>
                <div className="text-[10px] text-muted-foreground mt-0.5">by Kindfoam • ⭐ 4.9 • 1,240 terjual</div>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-sm font-black text-[#E86D50]">Rp 45.000</span>
                  <span className="text-xs text-muted-foreground line-through">Rp 65.000</span>
                  <span className="text-[10px] bg-red-100 text-red-700 font-bold px-1.5 py-0.5 rounded">-31%</span>
                </div>
                <button
                  onClick={() => toggleCart('cp-1', 'Kindfoam 30pcs')}
                  className={`mt-2 w-full py-2 rounded-xl text-xs font-extrabold transition-all active:scale-95 ${
                    cart.has('cp-1')
                      ? 'bg-emerald-600 text-white'
                      : 'bg-[#10284D] text-white hover:bg-[#152248]'
                  }`}
                >
                  {cart.has('cp-1') ? '✓ Di Keranjang' : '+ Tambah ke Keranjang'}
                </button>
              </div>
            </div>
          </div>

          {/* Grid Produk */}
          <div className="grid grid-cols-2 gap-3">
            {careProducts.slice(1).map((p, idx) => (
              <div
                key={p.id}
                className={`bg-card border border-border rounded-2xl p-3 space-y-2 animate-slide-up stagger-${Math.min(idx + 1, 6)} overflow-hidden`}
              >
                <div className="relative w-full h-28 rounded-xl overflow-hidden bg-slate-100 border border-border/80">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    unoptimized
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  {p.badge && (
                    <span className="absolute top-2 left-2 text-[9px] bg-emerald-600/90 text-white font-bold px-2 py-0.5 rounded-full backdrop-blur-xs shadow-xs">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute bottom-1.5 right-1.5 bg-black/50 text-white text-[10px] px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                    {p.emoji}
                  </span>
                </div>
                <div>
                  <div className="text-[11px] font-extrabold text-foreground leading-tight truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground mt-0.5">{p.brand} • ⭐ {p.rating}</div>
                </div>
                <div className="flex items-center gap-1 flex-wrap">
                  <span className="text-xs font-black text-[#E86D50]">Rp {p.price.toLocaleString('id-ID')}</span>
                  <span className="text-[10px] text-muted-foreground line-through">Rp {p.originalPrice.toLocaleString('id-ID')}</span>
                </div>
                <button
                  onClick={() => toggleCart(p.id, p.name)}
                  className={`w-full py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 ${
                    cart.has(p.id)
                      ? 'bg-emerald-100 text-emerald-800 border border-emerald-300'
                      : 'bg-[#10284D] text-white hover:bg-[#152248]'
                  }`}
                >
                  {cart.has(p.id) ? '✓ Di Keranjang' : '+ Keranjang'}
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* ===== TAB UMKM ===== */}
      {activeTab === 'umkm' && (
        <div className="space-y-3 animate-fade-in">
          {/* Banner info */}
          <div className="bg-gradient-to-r from-purple-50 to-indigo-50 border border-purple-200 rounded-2xl p-4 flex items-center gap-3">
            <span className="text-3xl">♻️</span>
            <div>
              <div className="text-xs font-extrabold text-purple-900">Dukung Pengrajin Lokal</div>
              <div className="text-[11px] text-purple-700">Setiap pembelian = 1 item limbah tekstil teselamatkan</div>
            </div>
          </div>

          {/* UMKM Grid */}
          <div className="grid grid-cols-2 gap-3">
            {umkmProducts.map((p, idx) => (
              <div
                key={p.id}
                className={`bg-card border border-border rounded-2xl overflow-hidden animate-slide-up stagger-${Math.min(idx + 1, 6)} shadow-xs hover:shadow-md transition-shadow`}
              >
                {/* Product image */}
                <div className="relative w-full h-36 overflow-hidden bg-slate-100">
                  <Image
                    src={p.imageUrl}
                    alt={p.name}
                    fill
                    unoptimized
                    className="object-cover hover:scale-105 transition-transform duration-300"
                  />
                  <div className="absolute inset-0 bg-gradient-to-t from-black/50 via-transparent to-transparent opacity-60" />
                  {p.badge && (
                    <span className="absolute top-2 left-2 text-[9px] bg-purple-700/90 text-white font-bold px-2 py-0.5 rounded-full shadow-xs backdrop-blur-xs">
                      {p.badge}
                    </span>
                  )}
                  <span className="absolute bottom-2 left-2 text-white text-[10px] font-bold bg-black/40 px-2 py-0.5 rounded-md backdrop-blur-xs">
                    {p.emoji}
                  </span>
                </div>
                <div className="p-3 space-y-1.5">
                  <div className="text-[11px] font-extrabold text-foreground leading-tight truncate">{p.name}</div>
                  <div className="text-[10px] text-muted-foreground truncate">{p.artisan}</div>
                  <div className="text-[10px] text-emerald-700 font-semibold truncate">♻️ {p.originalMaterial}</div>
                  <div className="flex items-center justify-between pt-0.5">
                    <span className="text-xs font-black text-[#E86D50]">Rp {p.price.toLocaleString('id-ID')}</span>
                    <span className="text-[9px] text-muted-foreground">📍 {p.location}</span>
                  </div>
                  <button
                    onClick={() => toggleCart(p.id, p.name)}
                    className={`w-full py-2 rounded-xl text-[10px] font-extrabold transition-all active:scale-95 mt-1 ${
                      cart.has(p.id)
                        ? 'bg-purple-100 text-purple-800 border border-purple-300'
                        : 'bg-[#10284D] text-white hover:bg-[#152248]'
                    }`}
                  >
                    {cart.has(p.id) ? '✓ Di Keranjang' : '+ Keranjang'}
                  </button>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}