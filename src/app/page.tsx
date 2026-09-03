'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface ProductItem {
  id: string;
  categoryTitle: string;
  name: string;
  category: 'Kemeja' | 'Celana' | 'Dress' | 'Jaket' | 'Kaos';
  priceNow: number;
  priceOrig: number;
  condition: 'Sangat Baik' | 'Baik' | 'Mulus';
  score: number;
  fabric: string;
  colorScheme: string;
  iconText: string;
  description: string;
  seller: string;
  location: string;
}

const promoSlides = [
  {
    id: 'kindfoam-slide',
    title: 'kindfoam',
    badge: 'BARU!',
    subtitle: '1 Lembar. Cukup Bersih. 1 Cucian.',
    description: 'Deterjen lembaran praktis, bersih maksimal, dan ramah untuk bumi.',
    features: ['Ramah Lingkungan', 'Bersih Maksimal', 'Praktis & Ringan', 'Tanpa Residu', 'Bebas Paraben', 'Wangi Segar'],
    cta: 'BELI SEKARANG! →',
    isKindfoam: true,
  },
  {
    id: 'ai-care-slide',
    title: 'Wearwise AI',
    badge: 'AI CARE',
    subtitle: 'Analisis AI Gratis untuk Pakaianmu',
    description: 'Kenali kondisi serat & rawat pakaian kesayanganmu dengan presisi.',
    features: ['Scan Kamera AI', 'Deteksi Noda', 'Skor Sirkularitas', 'Panduan Khusus'],
    cta: 'MULAI SCAN →',
    isKindfoam: false,
    link: '/wearwise-ai',
  },
  {
    id: 'eco-fashion-slide',
    title: 'Eco-Fashion Drops',
    badge: 'PROMO 30%',
    subtitle: 'Koleksi Kurasi Upcycle & Vintage',
    description: 'Beli busana ramah kantong dan ikut melestarikan bumi.',
    features: ['100% Terverifikasi', 'Escrow Aman', 'Higienis & Disetrika', 'Kemasan Ramah Lingkungan'],
    cta: 'JELAJAHI MARKET →',
    isKindfoam: false,
    link: '/trift-marketplace',
  },
];

const categories = ['Semua', 'Kemeja', 'Celana', 'Dress', 'Jaket', 'Kaos'];

const productsData: ProductItem[] = [
  {
    id: 'prod-1',
    categoryTitle: 'Patchwork Denim Jacket',
    name: 'Jaket warna-warni',
    category: 'Jaket',
    priceNow: 185000,
    priceOrig: 250000,
    condition: 'Sangat Baik',
    score: 92,
    fabric: 'Heavy Denim 14oz & Katun Patchwork',
    colorScheme: 'from-blue-400 via-emerald-400 to-amber-300',
    iconText: '🧥',
    description: 'Jaket upcycle artisan dengan teknik patchwork warna-warni cerah. Kondisi serat kain sangat kuat dan kancing logam kokoh.',
    seller: 'Sirkular Studio Kemang',
    location: 'Jakarta Selatan',
  },
  {
    id: 'prod-2',
    categoryTitle: 'Graphic Long Sleeve Tee',
    name: 'Atasan biru motif',
    category: 'Kaos',
    priceNow: 120000,
    priceOrig: 200000,
    condition: 'Baik',
    score: 85,
    fabric: '100% Combed Cotton 24s',
    colorScheme: 'from-cyan-500 to-blue-600',
    iconText: '👕',
    description: 'Kaos lengan panjang motif grafis biru elektrik. Sablon rubber elastis tanpa pecah dan kerah leher tetap kencang.',
    seller: 'Vintage Vault Senopati',
    location: 'Jakarta Selatan',
  },
  {
    id: 'prod-3',
    categoryTitle: 'Graphic Mini Skirt',
    name: 'Bawahan motif',
    category: 'Dress',
    priceNow: 95000,
    priceOrig: 150000,
    condition: 'Baik',
    score: 84,
    fabric: 'Polyester Twill Breathable',
    colorScheme: 'from-slate-700 via-gray-400 to-slate-200',
    iconText: '👗',
    description: 'Rok mini motif retro monokrom print. Jahitan samping rapi dengan resleting tersembunyi YKK.',
    seller: 'Thriftique Tebet',
    location: 'Jakarta Selatan',
  },
  {
    id: 'prod-4',
    categoryTitle: 'Windbreaker 90s Vintage',
    name: 'Jaket parasut retro',
    category: 'Jaket',
    priceNow: 175000,
    priceOrig: 350000,
    condition: 'Sangat Baik',
    score: 94,
    fabric: 'Nylon Taslan Water-repellent',
    colorScheme: 'from-teal-500 via-purple-500 to-pink-500',
    iconText: '🎽',
    description: 'Jaket parasut colorblock khas era 90-an. Tahan angin, ringan, dan warna masih sangat pekat.',
    seller: 'Archive Retro ID',
    location: 'Bandung',
  },
  {
    id: 'prod-5',
    categoryTitle: 'Kemeja Flannel Sage Green',
    name: 'Kemeja flanel kotak',
    category: 'Kemeja',
    priceNow: 135000,
    priceOrig: 210000,
    condition: 'Sangat Baik',
    score: 88,
    fabric: '100% Katun Flanel Organik',
    colorScheme: 'from-emerald-600 to-teal-700',
    iconText: '👔',
    description: 'Kemeja flanel lembut warna sage green natural. Bebas noda dan serat kain terawat.',
    seller: 'EcoWardrobe BSD',
    location: 'Tangerang',
  },
  {
    id: 'prod-6',
    categoryTitle: 'Celana Chino Slim Fit',
    name: 'Chino khaki casual',
    category: 'Celana',
    priceNow: 145000,
    priceOrig: 280000,
    condition: 'Baik',
    score: 86,
    fabric: 'Cotton Stretch Twill',
    colorScheme: 'from-amber-200 to-amber-400',
    iconText: '👖',
    description: 'Celana chino warna khaki hangat. Nyaman untuk aktivitas harian dengan potongan slim fit modern.',
    seller: 'Urban Re-style',
    location: 'Jakarta Pusat',
  },
];

function getGreeting(): string {
  const h = new Date().getHours();
  if (h < 6) return 'Malam';
  if (h < 12) return 'Pagi';
  if (h < 15) return 'Siang';
  if (h < 18) return 'Sore';
  return 'Malam';
}

export default function BerandaPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cartCount, setCartCount] = useState(3);

  // Count-up animation state for Impact Tracker
  const [countProgress, setCountProgress] = useState(0);
  const [countKg, setCountKg] = useState(0);
  const [countRank, setCountRank] = useState(1);
  const [countScan, setCountScan] = useState(0);

  // Interactive Bubble Modals
  const [selectedProduct, setSelectedProduct] = useState<ProductItem | null>(null);
  const [selectedSize, setSelectedSize] = useState<'S' | 'M' | 'L' | 'XL'>('M');
  const [showProfileModal, setShowProfileModal] = useState(false);
  const [showImpactModal, setShowImpactModal] = useState(false);
  const [showKindfoamModal, setShowKindfoamModal] = useState(false);
  const [kindfoamPacks, setKindfoamPacks] = useState(1);

  // Authentication & Splash Guard
  useEffect(() => {
    const hasSplashed = sessionStorage.getItem('klambi_splashed');
    if (!hasSplashed) {
      sessionStorage.setItem('klambi_splashed', 'true');
      router.push('/splash');
      return;
    }

    const isAuth = sessionStorage.getItem('klambi_auth');
    if (!isAuth) {
      router.push('/login');
    }
  }, [router]);

  // Carousel Auto-timer
  useEffect(() => {
    const timer = setInterval(() => {
      setActiveSlide((prev) => (prev + 1) % promoSlides.length);
    }, 5500);
    return () => clearInterval(timer);
  }, []);

  // Count-up animation for impact metrics on page load
  useEffect(() => {
    const duration = 1200; // ms
    const steps = 30;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const countInterval = setInterval(() => {
      currentStep++;
      const factor = currentStep / steps;

      setCountProgress(Math.round(32 * factor));
      setCountKg(Number((12.5 * factor).toFixed(1)));
      setCountRank(Math.max(8, Math.round(50 - 42 * factor)));
      setCountScan(Math.round(12 * factor));

      if (currentStep >= steps) {
        clearInterval(countInterval);
      }
    }, intervalTime);

    return () => clearInterval(countInterval);
  }, []);

  const greeting = getGreeting();

  const filteredProducts = productsData.filter((p) => {
    if (selectedCategory === 'Semua') return true;
    return p.category === selectedCategory;
  });

  const handleAddToCart = (product: ProductItem) => {
    setCartCount((prev) => prev + 1);
    toast.success(`"${product.name}" (Ukuran ${selectedSize}) ditambahkan ke keranjang! 🛒`);
    setSelectedProduct(null);
  };

  const handleBuyKindfoam = () => {
    setCartCount((prev) => prev + kindfoamPacks);
    toast.success(`${kindfoamPacks} Pack Kindfoam Eco-Detergent ditambahkan ke keranjang! 🧼`);
    setShowKindfoamModal(false);
  };

  return (
    <AppLayout
      headerRight={
        <div className="flex items-center gap-2">
          {/* Icon Keranjang -> /keranjang */}
          <button
            onClick={() => router.push('/keranjang')}
            className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary transition-colors active:scale-95 shadow-xs"
            aria-label="Keranjang"
          >
            <Icon name="ShoppingCartIcon" size={20} className="text-[#10284D]" />
            {cartCount > 0 && (
              <span className="absolute -top-1 -right-1 w-4 h-4 rounded-full bg-[#E86D50] text-white text-[9px] font-extrabold flex items-center justify-center shadow-sm animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>

          {/* Icon Chat -> /chat */}
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary transition-colors active:scale-95 shadow-xs"
            aria-label="Chat"
          >
            <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-[#10284D]" />
          </button>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* ========================================================================= */}
        {/* 1. KARTU SAPAAN USER (Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div
          onClick={() => setShowProfileModal(true)}
          className="bg-card rounded-2xl shadow-sm border border-border p-4 flex items-center gap-3.5 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          {/* Avatar Illustration (Young man with wavy dark hair in amber circle) */}
          <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white font-bold text-base flex-shrink-0 shadow-inner overflow-hidden border-2 border-white ring-2 ring-amber-200">
            <span className="text-xl">🧑‍🦱</span>
          </div>
          <div className="flex-1 min-w-0">
            <h2 className="text-sm sm:text-base font-extrabold text-[#10284D] truncate">
              {greeting}, Muhammad Hafiz Maulana
            </h2>
            <p className="text-xs text-muted-foreground mt-0.5">
              Kenali Kondisinya, Tentukan Langkahnya!
            </p>
          </div>
          <span className="text-xs text-muted-foreground">👉</span>
        </div>

        {/* ========================================================================= */}
        {/* 2. PROMO BANNER CAROUSEL (KINDFOAM - Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div>
          <div className="relative overflow-hidden rounded-3xl shadow-sm border border-blue-900/10">
            <div
              className="flex transition-transform duration-500 ease-in-out"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {promoSlides.map((slide, i) => (
                <div
                  key={slide.id}
                  className="w-full flex-shrink-0 bg-gradient-to-r from-[#0C3B7A] via-[#1A5EA8] to-[#3891E6] rounded-3xl p-5 min-h-[160px] flex flex-col justify-between text-white relative overflow-hidden"
                >
                  {/* Decorative bubble & cloud effect matching Image 3 */}
                  <div className="absolute -right-4 -bottom-4 w-32 h-32 rounded-full bg-white/10 blur-xl pointer-events-none" />
                  <div className="absolute right-20 top-2 w-20 h-20 rounded-full bg-cyan-300/20 blur-lg pointer-events-none" />

                  {/* Top content */}
                  <div className="relative z-10 space-y-1.5 max-w-[280px]">
                    <div className="flex items-center gap-2">
                      <span className="bg-cyan-400/30 text-cyan-200 text-[9px] font-black px-2 py-0.5 rounded uppercase tracking-wider border border-cyan-300/40">
                        {slide.badge}
                      </span>
                      <span className="text-xl font-black tracking-tight">{slide.title}</span>
                    </div>
                    <h3 className="text-xs sm:text-sm font-extrabold text-white/95">
                      {slide.subtitle}
                    </h3>
                    <p className="text-[11px] text-white/80 leading-relaxed line-clamp-2">
                      {slide.description}
                    </p>
                  </div>

                  {/* CTA & Product Imagery representation */}
                  <div className="relative z-10 pt-3 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        if (slide.isKindfoam) {
                          setShowKindfoamModal(true);
                        } else if (slide.link) {
                          router.push(slide.link);
                        }
                      }}
                      className="bg-white text-[#10284D] rounded-full px-4 py-2 text-[11px] font-black hover:bg-white/90 active:scale-95 transition-all shadow-md flex items-center gap-1.5"
                    >
                      <span>{slide.cta}</span>
                    </button>

                    {/* Kindfoam visual pack box indicators */}
                    {slide.isKindfoam && (
                      <div className="flex items-center gap-1.5 opacity-90">
                        <div className="bg-white/20 backdrop-blur-sm border border-white/30 px-2 py-1 rounded-xl text-[9px] font-bold">
                          🧼 30 Lembar
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Dot Indicators */}
          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {promoSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className={`h-1.5 rounded-full transition-all duration-300 ${
                  i === activeSlide ? 'bg-[#10284D] w-6' : 'bg-[#10284D]/25 w-2 hover:bg-[#10284D]/40'
                }`}
                aria-label={`Slide ${i + 1}`}
              />
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. KARTU IMPACT TRACKER (Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div
          onClick={() => setShowImpactModal(true)}
          className="bg-card rounded-2xl shadow-sm border border-border p-4 cursor-pointer hover:shadow-md active:scale-[0.99] transition-all"
        >
          <div className="grid grid-cols-4 gap-0 divide-x divide-border">
            {/* Donut Chart Target */}
            <div className="flex flex-col items-center justify-center pr-2">
              <svg width="44" height="44" viewBox="0 0 44 44" className="mb-1">
                <circle cx="22" cy="22" r="18" fill="none" stroke="#ECEEF3" strokeWidth="5" />
                <circle
                  cx="22"
                  cy="22"
                  r="18"
                  fill="none"
                  stroke="#10284D"
                  strokeWidth="5"
                  strokeDasharray="113.1"
                  strokeDashoffset={113.1 * (1 - countProgress / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 22 22)"
                />
                <text
                  x="22"
                  y="22"
                  textAnchor="middle"
                  dy="0.35em"
                  className="text-[10px] font-extrabold fill-[#10284D]"
                >
                  {countProgress}%
                </text>
              </svg>
              <span className="text-[10px] text-muted-foreground font-medium">Target</span>
            </div>

            {/* Weight Saved */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-emerald-600 text-sm mb-0.5">🍃</span>
              <span className="text-sm sm:text-base font-extrabold text-[#10284D]">{countKg} kg</span>
              <span className="text-[10px] text-muted-foreground">Diselamatkan</span>
            </div>

            {/* Ranking */}
            <div className="flex flex-col items-center justify-center px-2">
              <span className="text-amber-500 text-sm mb-0.5">🏆</span>
              <span className="text-sm sm:text-base font-extrabold text-[#10284D]">#{countRank}</span>
              <span className="text-[10px] text-muted-foreground">Peringkat</span>
            </div>

            {/* Scan Count */}
            <div className="flex flex-col items-center justify-center pl-2">
              <span className="text-primary text-sm mb-0.5">👔</span>
              <span className="text-sm sm:text-base font-extrabold text-[#10284D]">{countScan}</span>
              <span className="text-[10px] text-muted-foreground">Discan</span>
            </div>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 4. 3 KARTU FITUR UTAMA (Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div className="grid grid-cols-3 gap-3">
          {/* 1. Styliss AI */}
          <div
            onClick={() => router.push('/styliss-ai')}
            className="bg-[#D1FAE5]/60 border border-[#D1FAE5] rounded-3xl p-3.5 text-center cursor-pointer hover:shadow-md active:scale-95 transition-all shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#D1FAE5] mx-auto mb-2 flex items-center justify-center shadow-inner">
              <span className="text-xl">🧍</span>
            </div>
            <h4 className="font-extrabold text-xs text-[#10284D]">Styliss AI</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">See Your Style in 3D</p>
          </div>

          {/* 2. Care Plan */}
          <div
            onClick={() => router.push('/rawat')}
            className="bg-[#FCE4EC]/60 border border-[#FCE4EC] rounded-3xl p-3.5 text-center cursor-pointer hover:shadow-md active:scale-95 transition-all shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FCE4EC] mx-auto mb-2 flex items-center justify-center shadow-inner">
              <span className="text-xl">❤️</span>
            </div>
            <h4 className="font-extrabold text-xs text-[#10284D]">Care Plan</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Your Guide to Better Care</p>
          </div>

          {/* 3. Wearwise AI */}
          <div
            onClick={() => router.push('/wearwise-ai')}
            className="bg-[#FFF3E0]/60 border border-[#FFF3E0] rounded-3xl p-3.5 text-center cursor-pointer hover:shadow-md active:scale-95 transition-all shadow-xs"
          >
            <div className="w-11 h-11 rounded-2xl bg-[#FFF3E0] mx-auto mb-2 flex items-center justify-center shadow-inner">
              <Icon name="QrCodeIcon" size={22} className="text-amber-800" />
            </div>
            <h4 className="font-extrabold text-xs text-[#10284D]">Wearwise AI</h4>
            <p className="text-[10px] text-muted-foreground mt-0.5 leading-tight">Know Before You Decide</p>
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 5. FILTER KATEGORI PILLS (Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
          {categories.map((cat) => (
            <button
              key={cat}
              onClick={() => setSelectedCategory(cat)}
              className={`px-5 py-2 rounded-full text-xs font-bold whitespace-nowrap transition-all ${
                selectedCategory === cat
                  ? 'bg-[#10284D] text-white shadow-sm'
                  : 'bg-white text-gray-700 border border-gray-200 hover:border-[#10284D]/40'
              }`}
            >
              {cat}
            </button>
          ))}
        </div>

        {/* ========================================================================= */}
        {/* 6. FEATURED DROPS SECTION (Pixel Perfect Image 3) */}
        {/* ========================================================================= */}
        <div className="space-y-3">
          <div className="flex items-center justify-between">
            <h3 className="text-base font-extrabold text-[#10284D]">Featured Drops</h3>
            <button
              onClick={() => router.push('/trift-marketplace')}
              className="text-[#E86D50] text-xs font-bold hover:underline"
            >
              Lihat lainnya
            </button>
          </div>

          <div className="flex gap-3.5 overflow-x-auto scrollbar-hide pb-2">
            {filteredProducts.map((product) => (
              <div
                key={product.id}
                onClick={() => setSelectedProduct(product)}
                className="w-[165px] flex-shrink-0 bg-card rounded-2xl border border-border shadow-sm overflow-hidden hover:shadow-md active:scale-95 transition-all cursor-pointer flex flex-col justify-between"
              >
                {/* Visual Image Representation */}
                <div
                  className={`w-full h-[130px] bg-gradient-to-br ${product.colorScheme} flex flex-col items-center justify-center p-3 relative`}
                >
                  <span className="text-4xl filter drop-shadow-md transform hover:scale-110 transition-transform">
                    {product.iconText}
                  </span>
                  <span className="absolute top-2 right-2 bg-black/40 text-white text-[9px] font-bold px-1.5 py-0.5 rounded-md backdrop-blur-xs">
                    ⭐ {product.score}
                  </span>
                </div>

                {/* Card Content */}
                <div className="p-3 space-y-1 bg-white">
                  <span className="text-[10px] text-muted-foreground block truncate">
                    {product.categoryTitle}
                  </span>
                  <h4 className="text-xs font-extrabold text-[#10284D] truncate">
                    {product.name}
                  </h4>
                  <div className="flex items-baseline gap-1 pt-0.5">
                    <span className="text-[#E86D50] text-xs font-extrabold">
                      Rp{product.priceNow.toLocaleString('id-ID')},00
                    </span>
                  </div>
                  <div className="flex items-center justify-between pt-1 border-t border-gray-100">
                    <span className="text-[9px] text-muted-foreground line-through">
                      Rp{product.priceOrig.toLocaleString('id-ID')},00
                    </span>
                    <span className="bg-[#D1FAE5] text-[#166534] text-[9px] font-extrabold px-1.5 py-0.5 rounded">
                      {product.condition}
                    </span>
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* INTERACTIVE BUBBLE POP-UP 1: PRODUCT DETAILS MODAL */}
        {/* ========================================================================= */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 max-h-[85vh] overflow-y-auto animate-scale-in shadow-2xl">
              {/* Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div
                    className={`w-14 h-14 rounded-2xl bg-gradient-to-br ${selectedProduct.colorScheme} flex items-center justify-center text-3xl shadow-sm`}
                  >
                    {selectedProduct.iconText}
                  </div>
                  <div>
                    <span className="text-[10px] text-gray-500 font-semibold block">
                      {selectedProduct.categoryTitle}
                    </span>
                    <h3 className="font-extrabold text-base text-[#10284D] leading-tight">
                      {selectedProduct.name}
                    </h3>
                    <span className="text-[10px] text-emerald-700 bg-emerald-100 px-2 py-0.5 rounded font-bold mt-1 inline-block">
                      Kondisi: {selectedProduct.condition} (Skor {selectedProduct.score}/100)
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {/* Price & Seller */}
              <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[10px] text-gray-500 block">Harga Spesial</span>
                  <div className="flex items-baseline gap-2">
                    <span className="text-base font-black text-[#E86D50]">
                      Rp{selectedProduct.priceNow.toLocaleString('id-ID')},00
                    </span>
                    <span className="text-xs text-gray-400 line-through">
                      Rp{selectedProduct.priceOrig.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-[10px] text-gray-500 block">Mitra Penjual</span>
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.seller}</span>
                  <span className="text-[9px] text-gray-400 block">📍 {selectedProduct.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 block">Deskripsi & Bahan:</span>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {selectedProduct.description}
                </p>
                <p className="text-[11px] text-gray-500 pt-1">
                  🌿 <strong>Bahan:</strong> {selectedProduct.fabric}
                </p>
              </div>

              {/* Size Selector */}
              <div className="space-y-1.5">
                <span className="text-xs font-bold text-gray-800 block">Pilih Ukuran:</span>
                <div className="flex gap-2">
                  {(['S', 'M', 'L', 'XL'] as const).map((size) => (
                    <button
                      key={size}
                      onClick={() => setSelectedSize(size)}
                      className={`flex-1 py-2 rounded-xl text-xs font-bold transition-all ${
                        selectedSize === size
                          ? 'bg-[#10284D] text-white shadow-sm'
                          : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
                      }`}
                    >
                      {size}
                    </button>
                  ))}
                </div>
              </div>

              {/* Actions */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => handleAddToCart(selectedProduct)}
                  className="border-2 border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold hover:bg-secondary active:scale-95 transition-all flex items-center justify-center gap-1.5"
                >
                  <Icon name="ShoppingCartIcon" size={16} />
                  <span>+ Keranjang</span>
                </button>

                <button
                  onClick={() => {
                    setSelectedProduct(null);
                    router.push('/pembayaran');
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  Beli Sekarang ⚡
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE BUBBLE POP-UP 2: PROFILE QUICK SUMMARY MODAL */}
        {/* ========================================================================= */}
        {showProfileModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-400 to-amber-600 flex items-center justify-center text-white text-2xl shadow-inner">
                    🧑‍🦱
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#10284D]">
                      Muhammad Hafiz Maulana
                    </h3>
                    <span className="text-[10px] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      🌱 Eco Champion Level 3
                    </span>
                  </div>
                </div>
                <button
                  onClick={() => setShowProfileModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {/* Status metrics */}
              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-gray-400 block text-[10px]">Saldo Escrow Aman</span>
                  <span className="font-black text-sm text-emerald-600">Rp 450.000</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-gray-400 block text-[10px]">Baju Terawat</span>
                  <span className="font-black text-sm text-[#10284D]">12 Pakaian</span>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    router.push('/profil');
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  Buka Profil Penuh →
                </button>

                <button
                  onClick={() => {
                    setShowProfileModal(false);
                    sessionStorage.removeItem('klambi_auth');
                    toast.info('Anda telah keluar dari akun.');
                    router.push('/login');
                  }}
                  className="border border-red-300 text-red-600 py-3 rounded-2xl text-xs font-bold hover:bg-red-50 active:scale-95 transition-all text-center"
                >
                  Keluar Akun
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE BUBBLE POP-UP 3: IMPACT BREAKDOWN MODAL */}
        {/* ========================================================================= */}
        {showImpactModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <span className="text-2xl">🌍</span>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#10284D]">
                      Dampak Lingkungan Sirkularmu
                    </h3>
                    <p className="text-[10px] text-gray-500">Pencapaian Bulan Ini</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowImpactModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <div className="bg-emerald-50 border border-emerald-200 rounded-2xl p-3.5 space-y-1">
                  <span className="text-[10px] text-emerald-800 font-bold block uppercase tracking-wider">
                    🍃 Limbah Tekstil Diselamatkan
                  </span>
                  <span className="text-2xl font-black text-emerald-900 block">12.5 kg</span>
                  <p className="text-[11px] text-emerald-700">
                    Setara dengan mencegah 150 kg emisi karbon pembakaran kain!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                    <span className="text-blue-600 block text-[10px]">Air Dihemat</span>
                    <span className="font-extrabold text-sm text-blue-900">💧 2.450 Liter</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                    <span className="text-amber-800 block text-[10px]">Peringkat Komunitas</span>
                    <span className="font-extrabold text-sm text-amber-900">🏆 Top #8 Nasional</span>
                  </div>
                </div>
              </div>

              <button
                onClick={() => {
                  setShowImpactModal(false);
                  router.push('/dampak');
                }}
                className="w-full bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
              >
                Lihat Dashboard Dampak Lengkap →
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* INTERACTIVE BUBBLE POP-UP 4: KINDFOAM QUICK PURCHASE MODAL */}
        {/* ========================================================================= */}
        {showKindfoamModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center text-2xl">
                    🧼
                  </div>
                  <div>
                    <span className="text-[10px] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded">
                      Official Product
                    </span>
                    <h3 className="font-extrabold text-base text-[#10284D] mt-0.5">
                      Kindfoam Eco-Detergent Sheet
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setShowKindfoamModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              <div className="space-y-3">
                <p className="text-xs text-gray-600 leading-relaxed bg-blue-50/60 p-3 rounded-2xl border border-blue-100">
                  Deterjen lembaran biodegradable tanpa botol plastik. 1 lembar cukup untuk 1 kali cuci (3-5 kg pakaian).
                </p>

                <div className="flex items-center justify-between bg-gray-50 p-3 rounded-2xl border border-gray-100">
                  <div>
                    <span className="text-xs font-bold text-gray-800 block">Jumlah Pack (30 lembar/pack)</span>
                    <span className="text-xs font-black text-[#E86D50]">
                      Rp {(54000 * kindfoamPacks).toLocaleString('id-ID')}
                    </span>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={() => setKindfoamPacks(Math.max(1, kindfoamPacks - 1))}
                      className="w-8 h-8 rounded-xl bg-white border border-gray-300 font-bold flex items-center justify-center hover:bg-gray-100 active:scale-95"
                    >
                      -
                    </button>
                    <span className="w-6 text-center font-bold text-xs">{kindfoamPacks}</span>
                    <button
                      onClick={() => setKindfoamPacks(kindfoamPacks + 1)}
                      className="w-8 h-8 rounded-xl bg-[#10284D] text-white font-bold flex items-center justify-center hover:bg-[#152248] active:scale-95"
                    >
                      +
                    </button>
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={handleBuyKindfoam}
                  className="border-2 border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold hover:bg-secondary active:scale-95 transition-all"
                >
                  + Tambah Keranjang
                </button>

                <button
                  onClick={() => {
                    setShowKindfoamModal(false);
                    router.push('/pembayaran');
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  Beli Langsung ⚡
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}