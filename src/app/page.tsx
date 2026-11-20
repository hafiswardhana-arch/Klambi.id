'use client';

import React, { useState, useEffect } from 'react';
import Image from 'next/image';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import { FadeIn, SlideUp, StaggerContainer, StaggerItem } from '@/components/motion';
import { fetchData } from '@/lib/supabase/client';
import { rupiah, useMe } from '@/lib/supabase/useMe';

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
  imageUrl: string;
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
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80',
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
    imageUrl: 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80',
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

function LeafIcon() {
  return (
    <svg width="25" height="22" viewBox="0 0 34 30" fill="none" aria-hidden="true">
      <path d="M32 2C17 2 6 7 4 20c-.4 2.6 0 5 1 7 2-6 7-11 14-14-6 4-10 9-12 15 15 1 24-10 25-26Z" fill="#2E7D4F" />
    </svg>
  );
}

function HangerIcon() {
  return (
    <svg width="30" height="21" viewBox="0 0 40 28" fill="none" stroke="#E2725B" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
      <path d="M16.5 6.5a3.5 3.5 0 1 1 5 3.2c-1 .5-1.5 1.3-1.5 2.3v1.5" />
      <path d="M20 13.5 3.5 23a1.6 1.6 0 0 0 .8 3h31.4a1.6 1.6 0 0 0 .8-3L20 13.5Z" />
    </svg>
  );
}

function StandingFigureIcon() {
  return (
    <svg width="24" height="26" viewBox="0 0 40 44" fill="#163B2E" aria-hidden="true">
      <circle cx="20" cy="5.5" r="4.5" />
      <path d="M4 12.5c0-1.4 1.1-2.5 2.5-2.5h27c1.4 0 2.5 1.1 2.5 2.5S34.9 15 33.5 15H25v27a2 2 0 0 1-4 0V29h-2v13a2 2 0 0 1-4 0V15H6.5A2.5 2.5 0 0 1 4 12.5Z" />
    </svg>
  );
}

export default function BerandaPage() {
  const router = useRouter();
  const [activeSlide, setActiveSlide] = useState(0);
  const [selectedCategory, setSelectedCategory] = useState('Semua');
  const [cartCount, setCartCount] = useState(3);
  // Live data from Supabase (falls back to the built-in demo data when unavailable)
  const [products, setProducts] = useState<ProductItem[]>(productsData);
  const [impactTarget, setImpactTarget] = useState({ goal: 32, kg: 12.5, rank: 8, scan: 12 });

  useEffect(() => {
    fetchData<ProductItem[]>('/api/catalog/products').then((rows) => {
      if (rows && rows.length) setProducts(rows);
    });
  }, []);

  // Data akun yang SAMA dengan halaman Profil (satu sumber: useMe) → angka Beranda & Profil selalu cocok
  const { me } = useMe();
  useEffect(() => {
    if (!me) return;
    if (me.impact) setImpactTarget({ goal: me.impact.goalPct, kg: me.impact.kgSaved, rank: me.impact.rank, scan: me.impact.scanCount });
    setCartCount(me.cartCount);
  }, [me]);

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

  // Count-up animation for impact metrics on page load (PRD AN-04: 0.8–1.5s, Ease Out)
  useEffect(() => {
    const duration = 1200; // ms
    const steps = 36;
    const intervalTime = duration / steps;
    let currentStep = 0;

    const countInterval = setInterval(() => {
      currentStep++;
      const linearFactor = currentStep / steps;
      // Ease Out Cubic curve: fast start, soft settle
      const easeFactor = 1 - Math.pow(1 - linearFactor, 3);

      setCountProgress(Math.round(impactTarget.goal * easeFactor));
      setCountKg(Number((impactTarget.kg * easeFactor).toFixed(1)));
      setCountRank(Math.max(impactTarget.rank, Math.round(50 - (50 - impactTarget.rank) * easeFactor)));
      setCountScan(Math.round(impactTarget.scan * easeFactor));

      if (currentStep >= steps) {
        clearInterval(countInterval);
      }
    }, intervalTime);

    return () => clearInterval(countInterval);
  }, [impactTarget]);

  const greeting = getGreeting();
  const [storedName, setStoredName] = useState('Muhammad Hafiz Maulana');
  useEffect(() => {
    try {
      const raw = localStorage.getItem('klambi_user');
      const parsed = raw ? JSON.parse(raw) : null;
      if (parsed?.name) setStoredName(String(parsed.name));
    } catch {
      // keep default
    }
  }, []);
  const userName = me?.user.name ?? storedName;
  const initials = userName
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]?.toUpperCase())
    .join('');

  const filteredProducts = products.filter((p) => {
    if (selectedCategory === 'Semua') return true;
    return p.category === selectedCategory;
  });

  const handleAddToCart = (product: ProductItem) => {
    setCartCount((prev) => prev + 1);
    toast.success(`"${product.name}" (Ukuran ${selectedSize}) ditambahkan ke keranjang! `);
    setSelectedProduct(null);
  };

  const handleBuyKindfoam = () => {
    setCartCount((prev) => prev + kindfoamPacks);
    toast.success(`${kindfoamPacks} Pack Kindfoam Eco-Detergent ditambahkan ke keranjang!`);
    setShowKindfoamModal(false);
  };

  return (
    <AppLayout
      headerRight={
        <div className="flex items-center gap-1">
          <button
            onClick={() => router.push('/keranjang')}
            className="relative flex items-center justify-center w-10 h-10 rounded-full text-gray-900 hover:bg-navy/5 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label={`Keranjang, ${cartCount} item`}
          >
            <Icon name="ShoppingCartIcon" size={24} />
            {cartCount > 0 && (
              <span className="absolute top-0.5 right-0 min-w-[18px] h-[18px] px-1 rounded-full bg-coral text-white text-[0.625rem] font-semibold flex items-center justify-center ring-2 ring-background animate-scale-in">
                {cartCount}
              </span>
            )}
          </button>
          <button
            onClick={() => router.push('/chat')}
            className="flex items-center justify-center w-10 h-10 rounded-full text-gray-900 hover:bg-navy/5 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label="Chat"
          >
            <Icon name="ChatBubbleLeftRightIcon" size={24} />
          </button>
        </div>
      }
    >
      <div className="space-y-3.5 pb-2 select-none">
        {/* 1. GREETING CARD */}
        <FadeIn>
          <button
            type="button"
            onClick={() => setShowProfileModal(true)}
            className="w-full cursor-pointer text-left bg-white rounded-xl border border-slate-200 px-4 py-3 flex items-center gap-3 hover:border-slate-300 active:scale-[0.99] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          >
            <span
              className="w-11 h-11 rounded-full bg-navy flex items-center justify-center flex-shrink-0 text-white text-[0.875rem] font-semibold"
              aria-hidden="true"
            >
              {initials}
            </span>
            <span className="flex-1 min-w-0">
              <span className="block text-[0.9375rem] font-semibold text-slate-900 leading-tight truncate">
                {greeting}, {userName.split(' ')[0]}
              </span>
              <span className="block text-[0.75rem] text-slate-500 mt-0.5 truncate">
                {me?.wallet
                  ? `Saldo Klámbi ${rupiah(me.wallet.balance)}`
                  : 'Kenali kondisinya, tentukan langkahnya'}
              </span>
            </span>
            <Icon name="ChevronRightIcon" size={16} className="flex-shrink-0 text-slate-400" aria-hidden="true" />
          </button>
        </FadeIn>

        {/* 2. PROMO BANNER CAROUSEL */}
        <section aria-label="Promo" className="animate-card-reveal stagger-1">
          <div className="relative overflow-hidden rounded-xl">
            <div
              className="flex transition-transform duration-500"
              style={{ transform: `translateX(-${activeSlide * 100}%)` }}
            >
              {promoSlides.map((slide) => (
                <div
                  key={slide.id}
                  className="w-full flex-shrink-0 bg-gradient-to-br from-[#0B2A52] to-[#1559B0] p-5 min-h-[156px] flex text-white relative overflow-hidden"
                >
                  <span className="absolute -right-10 -top-10 w-44 h-44 rounded-full border border-white/10" aria-hidden="true" />
                  <span className="absolute -right-4 -bottom-16 w-44 h-44 rounded-full bg-white/5" aria-hidden="true" />

                  <div className="relative z-10 flex flex-col justify-between w-[68%] min-w-0">
                    <div>
                      <span className="inline-flex items-center gap-1 bg-white/15 text-white text-[0.5625rem] font-semibold px-2 py-0.5 rounded-md uppercase tracking-wider">
                        {slide.badge}
                      </span>
                      <h3 className="text-[1.375rem] leading-none font-bold tracking-tight mt-1.5">{slide.title}</h3>
                      <p className="text-[0.6875rem] font-semibold mt-1.5 leading-snug">{slide.subtitle}</p>
                      <p className="text-[0.625rem] text-white/90 leading-snug mt-1 line-clamp-2">{slide.description}</p>
                    </div>
                    <button
                      type="button"
                      onClick={() => {
                        if (slide.isKindfoam) setShowKindfoamModal(true);
                        else if (slide.link) router.push(slide.link);
                      }}
                      className="self-start mt-3 inline-flex items-center gap-1.5 bg-navy-deep text-white rounded-full pl-3.5 pr-2.5 h-8 text-[0.625rem] font-semibold uppercase tracking-wide border border-white/25 hover:bg-navy active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    >
                      {slide.cta.replace(' →', '')}
                      <Icon name="ArrowRightIcon" size={12} aria-hidden="true" />
                    </button>
                  </div>

                  <div className="relative z-10 flex-1 flex items-center justify-center" aria-hidden="true">
                    <span className="flex h-16 w-16 items-center justify-center rounded-2xl bg-white/10 ring-1 ring-white/20">
                      <Icon name={slide.isKindfoam ? 'SparklesIcon' : 'ArrowPathRoundedSquareIcon'} size={30} className="text-white/90" />
                    </span>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="flex items-center justify-center gap-1.5 mt-2.5">
            {promoSlides.map((_, i) => (
              <button
                key={i}
                onClick={() => setActiveSlide(i)}
                className="h-4 flex items-center"
                aria-label={`Slide ${i + 1}`}
                aria-current={i === activeSlide}
              >
                <span
                  className={`block h-1.5 rounded-full transition-all duration-300 ${
                    i === activeSlide ? 'bg-navy w-6' : 'bg-navy/25 w-2'
                  }`}
                />
              </button>
            ))}
          </div>
        </section>

        {/* 3. IMPACT TRACKER */}
        <button
          type="button"
          onClick={() => setShowImpactModal(true)}
          className="w-full cursor-pointer bg-white rounded-xl border border-slate-200 px-2 py-3 hover:border-slate-300 active:scale-[0.99] transition-all duration-150 animate-card-reveal stagger-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
          aria-label="Lihat detail dampak lingkungan"
        >
          <div className="grid grid-cols-[1.15fr_1fr_1fr_1fr] items-center">
            <div className="flex items-center justify-center pr-2">
              <svg width="54" height="54" viewBox="0 0 76 76" aria-hidden="true">
                <circle cx="38" cy="38" r="32" fill="none" stroke="#B9BCC2" strokeWidth="3" />
                <circle
                  cx="38"
                  cy="38"
                  r="32"
                  fill="none"
                  stroke="#1B5FB8"
                  strokeWidth="5"
                  strokeDasharray="201.06"
                  strokeDashoffset={201.06 * (1 - countProgress / 100)}
                  strokeLinecap="round"
                  transform="rotate(-90 38 38)"
                  className="transition-all duration-300 ease-out"
                />
                <text x="38" y="38" textAnchor="middle" dy="0.36em" className="text-[1.1875rem] font-bold fill-[#1B5FB8]">
                  {countProgress}%
                </text>
              </svg>
              <span className="sr-only">Target {countProgress}%</span>
            </div>

            {[
              { icon: <LeafIcon />, value: `${countKg} kg`, label: 'Diselamatkan' },
              { icon: <Icon name="TrophyIcon" variant="solid" size={22} className="text-[#F2B705]" />, value: `#${countRank}`, label: 'Peringkat' },
              { icon: <HangerIcon />, value: `${countScan}`, label: 'Discan' },
            ].map((stat) => (
              <div key={stat.label} className="flex flex-col items-center justify-center border-l border-gray-300 px-1">
                <span className="h-6 flex items-center" aria-hidden="true">{stat.icon}</span>
                <span className="text-[0.875rem] font-semibold text-gray-900 leading-tight mt-1 font-tabular">{stat.value}</span>
                <span className="text-[0.625rem] text-gray-700">{stat.label}</span>
              </div>
            ))}
          </div>
        </button>

        {/* 4. FEATURE CARDS */}
        <nav aria-label="Fitur utama" className="grid grid-cols-3 gap-3 animate-card-reveal stagger-3">
          {[
            {
              title: 'Styliss AI',
              sub: 'See Your Style in 3D',
              href: '/styliss-ai',
              tint: 'bg-[#D6EFE0]',
              icon: <StandingFigureIcon />,
            },
            {
              title: 'Care Plan',
              sub: 'Your Guide to Better Care',
              href: '/care-plan',
              tint: 'bg-[#FCE1E3]',
              icon: <Icon name="HeartIcon" variant="solid" size={26} className="text-[#E3121F]" />,
            },
            {
              title: 'Wearwise AI',
              sub: 'Know Before You Decide',
              href: '/wearwise-ai',
              tint: 'bg-[#F1E4D6]',
              icon: <Icon name="QrCodeIcon" size={26} className="text-gray-900" />,
            },
          ].map((f) => (
            <button
              key={f.href}
              type="button"
              onClick={() => router.push(f.href)}
              className="bg-white rounded-2xl shadow-card px-1.5 pt-2.5 pb-2.5 text-center hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            >
              <span className={`w-11 h-11 rounded-xl ${f.tint} mx-auto mb-1.5 flex items-center justify-center`} aria-hidden="true">
                {f.icon}
              </span>
              <span className="block font-semibold text-[0.7813rem] text-gray-900 leading-tight">{f.title}</span>
              <span className="block text-[0.5938rem] text-gray-600 mt-0.5 leading-tight">{f.sub}</span>
            </button>
          ))}
        </nav>

        {/* 5. CATEGORY PILLS */}
        <div className="-mx-4 px-4 flex gap-2 overflow-x-auto scrollbar-hide" role="tablist" aria-label="Kategori">
          {categories.map((cat) => {
            const active = selectedCategory === cat;
            return (
              <button
                key={cat}
                role="tab"
                aria-selected={active}
                onClick={() => setSelectedCategory(cat)}
                className={`h-9 px-4 rounded-full text-[0.7813rem] whitespace-nowrap border transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 focus-visible:ring-navy ${
                  active
                    ? 'bg-navy border-navy text-white shadow-md'
                    : 'bg-white border-gray-300 text-gray-800 hover:border-navy/60 active:scale-95'
                }`}
              >
                {cat}
              </button>
            );
          })}
        </div>

        {/* 6. FEATURED DROPS */}
        <section className="space-y-3" aria-labelledby="featured-drops">
          <div className="flex items-end justify-between">
            <h3 id="featured-drops" className="text-[0.9375rem] font-semibold text-gray-900">Featured Drops</h3>
            <button
              onClick={() => router.push('/trift-marketplace')}
              className="text-coral text-[0.75rem] font-normal py-1 hover:underline underline-offset-2 active:opacity-75 transition-opacity"
            >
              Lihat lainnya
            </button>
          </div>

          <StaggerContainer className="-mx-4 px-4 flex gap-3 overflow-x-auto scrollbar-hide pb-2" staggerDelay={50}>
            {filteredProducts.map((product) => (
              <StaggerItem key={product.id} className="flex-shrink-0">
                <button
                  type="button"
                  onClick={() => setSelectedProduct(product)}
                  className="w-[148px] text-left bg-white rounded-2xl shadow-card overflow-hidden hover:shadow-card-hover hover:-translate-y-0.5 active:scale-[0.97] transition-all duration-200 flex flex-col focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
                >
                  <span className="block p-2 pb-0">
                    <span className="block w-full h-[116px] relative overflow-hidden rounded-xl bg-gray-50">
                      <Image
                        src={product.imageUrl}
                        alt={product.name}
                        fill
                        unoptimized
                        sizes="148px"
                        className="object-cover"
                      />
                    </span>
                  </span>
                  <span className="block px-3 pt-2 pb-3">
                    <span className="block text-[0.625rem] text-gray-600 truncate">{product.categoryTitle}</span>
                    <span className="block text-[0.7813rem] font-semibold text-gray-900 truncate leading-tight">{product.name}</span>
                    <span className="block text-coral text-[0.8125rem] font-semibold mt-1.5 leading-none">
                      Rp{product.priceNow.toLocaleString('id-ID')},00
                    </span>
                    <span className="flex items-center justify-between gap-1 mt-1">
                      <span className="text-[0.5938rem] text-gray-500 line-through truncate">
                        Rp{product.priceOrig.toLocaleString('id-ID')},00
                      </span>
                      <span className="bg-[#B9F5CF] text-gray-900 text-[0.5625rem] font-medium px-2 py-0.5 rounded-full whitespace-nowrap">
                        {product.condition}
                      </span>
                    </span>
                  </span>
                </button>
              </StaggerItem>
            ))}
          </StaggerContainer>
        </section>

        {/* ========================================================================= */}
        {/* INTERACTIVE BUBBLE POP-UP 1: PRODUCT DETAILS MODAL */}
        {/* ========================================================================= */}
        {selectedProduct && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-5 w-full max-w-md text-gray-800 space-y-3.5 max-h-[90vh] overflow-y-auto animate-scale-in shadow-2xl">
              {/* Product Hero Image in Modal */}
              <div className="relative w-full h-48 rounded-2xl overflow-hidden shadow-inner bg-slate-100">
                <Image
                  src={selectedProduct.imageUrl}
                  alt={selectedProduct.name}
                  fill
                  unoptimized
                  className="object-cover"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-black/75 via-black/20 to-transparent" />
                <div className="absolute top-3 left-3">
                  <span className="text-[0.625rem] font-extrabold text-white bg-black/50 backdrop-blur-md px-2.5 py-1 rounded-full border border-white/20">
                    {selectedProduct.category}
                  </span>
                </div>
                <button
                  onClick={() => setSelectedProduct(null)}
                  className="absolute top-3 right-3 w-8 h-8 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 backdrop-blur-md transition-colors"
                >
                  <Icon name="XMarkIcon" size={18} />
                </button>
                <div className="absolute bottom-3 left-3 right-3 text-white">
                  <span className="text-[0.625rem] text-white/80 block">{selectedProduct.categoryTitle}</span>
                  <h3 className="font-extrabold text-base text-white leading-tight drop-shadow">
                    {selectedProduct.name}
                  </h3>
                  <div className="flex items-center gap-2 mt-1">
                    <span className="text-[0.625rem] text-emerald-300 bg-emerald-950/70 border border-emerald-500/40 px-2 py-0.5 rounded font-bold backdrop-blur-xs">
                      {selectedProduct.condition} • Skor {selectedProduct.score}/100
                    </span>
                  </div>
                </div>
              </div>

              {/* Price & Seller */}
              <div className="flex items-baseline justify-between bg-slate-50 p-3 rounded-2xl border border-slate-100">
                <div>
                  <span className="text-[0.625rem] text-gray-500 block">Harga Spesial</span>
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
                  <span className="text-[0.625rem] text-gray-500 block">Mitra Penjual</span>
                  <span className="text-xs font-bold text-gray-800">{selectedProduct.seller}</span>
                  <span className="text-[0.5625rem] text-gray-400 block">{selectedProduct.location}</span>
                </div>
              </div>

              {/* Description */}
              <div className="space-y-1">
                <span className="text-xs font-bold text-gray-800 block">Deskripsi & Bahan:</span>
                <p className="text-xs text-gray-600 leading-relaxed bg-gray-50 p-3 rounded-xl">
                  {selectedProduct.description}
                </p>
                <p className="text-[0.6875rem] text-gray-500 pt-1">
                  <strong>Bahan:</strong> {selectedProduct.fabric}
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
                    const p = selectedProduct;
                    setSelectedProduct(null);
                    router.push(
                      `/pembayaran?total=${p.priceNow}&title=${encodeURIComponent(p.name)}&seller=${encodeURIComponent(p.seller)}&ref=${encodeURIComponent(p.id)}&kind=trift`
                    );
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  Beli Sekarang
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
                  <div className="w-12 h-12 rounded-full bg-gradient-to-br from-amber-300 to-amber-500 flex items-center justify-center text-navy-deep text-base font-bold" aria-hidden="true">
                    {initials}
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#10284D]">
                      {userName}
                    </h3>
                    <span className="text-[0.625rem] bg-emerald-100 text-emerald-800 font-bold px-2 py-0.5 rounded-full">
                      Eco Champion Level 3
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
                  <span className="text-gray-400 block text-[0.625rem]">Saldo Escrow Aman</span>
                  <span className="font-black text-sm text-emerald-600">Rp 450.000</span>
                </div>
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-gray-400 block text-[0.625rem]">Baju Terawat</span>
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
                  <Icon name="GlobeAsiaAustraliaIcon" variant="solid" size={28} className="text-emerald-600" aria-hidden="true" />
                  <div>
                    <h3 className="font-extrabold text-sm text-[#10284D]">
                      Dampak Lingkungan Sirkularmu
                    </h3>
                    <p className="text-[0.625rem] text-gray-500">Pencapaian Bulan Ini</p>
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
                  <span className="text-[0.625rem] text-emerald-800 font-bold block uppercase tracking-wider">
                    Limbah Tekstil Diselamatkan
                  </span>
                  <span className="text-2xl font-black text-emerald-900 block">12.5 kg</span>
                  <p className="text-[0.6875rem] text-emerald-700">
                    Setara dengan mencegah 150 kg emisi karbon pembakaran kain!
                  </p>
                </div>

                <div className="grid grid-cols-2 gap-2 text-xs">
                  <div className="bg-blue-50 border border-blue-100 p-3 rounded-2xl">
                    <span className="text-blue-600 block text-[0.625rem]">Air Dihemat</span>
                    <span className="font-extrabold text-sm text-blue-900">2.450 Liter</span>
                  </div>
                  <div className="bg-amber-50 border border-amber-100 p-3 rounded-2xl">
                    <span className="text-amber-800 block text-[0.625rem]">Peringkat Komunitas</span>
                    <span className="font-extrabold text-sm text-amber-900">Top #8 Nasional</span>
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
                  <div className="w-12 h-12 rounded-2xl bg-cyan-100 flex items-center justify-center" aria-hidden="true">
                    <Icon name="SparklesIcon" variant="solid" size={24} className="text-cyan-700" />
                  </div>
                  <div>
                    <span className="text-[0.625rem] bg-cyan-100 text-cyan-800 font-extrabold px-2 py-0.5 rounded">
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
                    router.push(
                      `/pembayaran?total=${54000 * kindfoamPacks}&title=${encodeURIComponent(`Kindfoam Eco-Detergent × ${kindfoamPacks}`)}&seller=kindfoam&kind=produk`
                    );
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  Beli Langsung
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}