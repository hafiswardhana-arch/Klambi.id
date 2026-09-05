'use client';

import React, { useState, useRef, useEffect, useCallback } from 'react';
import Image from 'next/image';
import { useSearchParams, useRouter } from 'next/navigation';
import { Suspense } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

// ─────────────────────────────────────────────
// Types
// ─────────────────────────────────────────────
interface CartItemData {
  id: string;
  title: string;
  emoji: string;
  category: string;
  color: string;
  size?: string;
  brand?: string;
  condition: string;
  price: number;
  imageUrl?: string;
}

interface BodyMeasure {
  height: number; // cm, 150–195
  weight: number; // kg,  40–120
}

// ─────────────────────────────────────────────
// Wardrobe mock items (shown when no cart item)
// ─────────────────────────────────────────────
const wardrobeMock: CartItemData[] = [
  { id: 'w-1', title: "Jaket Denim Vintage Levi's 501", emoji: '🧥', category: 'Jaket', color: '#1E3A8A', size: 'L', brand: "Levi's", condition: 'Sangat Baik', price: 245000, imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80' },
  { id: 'w-2', title: 'Kemeja Batik Parang Coklat', emoji: '👔', category: 'Kemeja', color: '#92400E', size: 'L', brand: 'Batik Keris', condition: 'Sangat Baik', price: 200000, imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80' },
  { id: 'w-3', title: 'Kaos Oversized Vintage Band Tee', emoji: '👕', category: 'Kaos', color: '#1C1917', size: 'XL', brand: 'Unknown', condition: 'Baik', price: 85000, imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80' },
  { id: 'w-4', title: 'Dress Midi Batik Kontemporer', emoji: '👗', category: 'Dress', color: '#78350F', size: 'S', brand: 'Danar Hadi', condition: 'Sangat Baik', price: 95000, imageUrl: 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80' },
  { id: 'w-5', title: 'Celana Jeans Slim Fit Navy', emoji: '👖', category: 'Celana', color: '#1E3A5F', size: '30', brand: "Levi's", condition: 'Cukup Baik', price: 120000, imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80' },
];

// ─────────────────────────────────────────────
// Body proportion calculator
// ─────────────────────────────────────────────
function getBodyProps(height: number, weight: number) {
  const bmi = weight / ((height / 100) ** 2);
  const scale = height / 170; // reference height
  const widthScale = bmi < 18.5 ? 0.85 : bmi < 25 ? 1 : bmi < 30 ? 1.18 : 1.35;
  return { scale, widthScale, bmi: bmi.toFixed(1) };
}

// ─────────────────────────────────────────────
// SVG Mannequin Component (Realistic CSS 3D)
// ─────────────────────────────────────────────
function MannequinSVG({
  height,
  weight,
  item,
  rotation,
}: {
  height: number;
  weight: number;
  item: CartItemData | null;
  rotation: number;
}) {
  const { scale, widthScale } = getBodyProps(height, weight);
  const W = 120 * widthScale;
  const skinColor = '#F5CBA7';
  const skinDark = '#E8A87C';
  const hairColor = '#3D2B1F';
  const isSideView = Math.abs(((rotation % 360) + 360) % 360 - 180) < 30;
  const isBack = Math.abs(((rotation % 360) + 360) % 360 - 180) < 60 && !isSideView;

  // Clothing color from item
  const clothColor = item ? item.color : '#64748B';
  const clothLight = item ? `${item.color}CC` : '#94A3B8CC';
  const clothDark = item ? `${item.color}99` : '#47556999';

  // Category → garment shape
  const cat = item?.category?.toLowerCase() ?? '';
  const hasSkirt = cat === 'dress' || cat === 'rok';
  const isJacket = cat === 'jaket' || cat === 'outerwear';
  const isPants = cat === 'celana';
  const isTop = !hasSkirt && !isPants;

  return (
    <svg
      viewBox={`${-W / 2 - 20} -20 ${W + 40} 340`}
      className="w-full h-full"
      style={{ filter: 'drop-shadow(0 8px 24px rgba(0,0,0,0.18))' }}
    >
      <defs>
        {/* Skin gradient */}
        <radialGradient id="skinGrad" cx="50%" cy="35%" r="65%">
          <stop offset="0%" stopColor={skinColor} />
          <stop offset="100%" stopColor={skinDark} />
        </radialGradient>
        {/* Cloth main gradient */}
        <linearGradient id="clothGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor={clothLight} />
          <stop offset="55%" stopColor={clothColor} />
          <stop offset="100%" stopColor={clothDark} />
        </linearGradient>
        {/* Cloth side shading */}
        <linearGradient id="clothSide" x1="0%" y1="0%" x2="100%" y2="0%">
          <stop offset="0%" stopColor={`${clothColor}50`} />
          <stop offset="30%" stopColor={`${clothColor}00`} />
          <stop offset="70%" stopColor={`${clothColor}00`} />
          <stop offset="100%" stopColor={`${clothColor}60`} />
        </linearGradient>
        {/* Hair */}
        <radialGradient id="hairGrad" cx="50%" cy="20%" r="60%">
          <stop offset="0%" stopColor="#5D4037" />
          <stop offset="100%" stopColor={hairColor} />
        </radialGradient>
        {/* Denim texture for jeans */}
        <linearGradient id="denimGrad" x1="0%" y1="0%" x2="100%" y2="100%">
          <stop offset="0%" stopColor="#2563EB" />
          <stop offset="40%" stopColor="#1D4ED8" />
          <stop offset="100%" stopColor="#1E3A8A" />
        </linearGradient>
        {/* Shadow under feet */}
        <radialGradient id="shadowGrad" cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor="rgba(0,0,0,0.2)" />
          <stop offset="100%" stopColor="rgba(0,0,0,0)" />
        </radialGradient>
      </defs>

      {/* ── Ground shadow ── */}
      <ellipse cx="0" cy="315" rx={W * 0.6} ry="8" fill="url(#shadowGrad)" />

      {/* ── Legs (always show, behind clothing) ── */}
      {/* Left leg */}
      <path
        d={`M ${-W * 0.18} 185 L ${-W * 0.22} 280 L ${-W * 0.08} 280 L ${-W * 0.04} 185 Z`}
        fill={isPants ? 'url(#clothGrad)' : 'url(#skinGrad)'}
        stroke={isPants ? clothDark : skinDark}
        strokeWidth="0.8"
      />
      {/* Right leg */}
      <path
        d={`M ${W * 0.04} 185 L ${W * 0.08} 280 L ${W * 0.22} 280 L ${W * 0.18} 185 Z`}
        fill={isPants ? 'url(#clothGrad)' : 'url(#skinGrad)'}
        stroke={isPants ? clothDark : skinDark}
        strokeWidth="0.8"
      />
      {/* Knee highlights */}
      {isPants && (
        <>
          <ellipse cx={-W * 0.13} cy="230" rx="6" ry="4" fill={`${clothColor}40`} />
          <ellipse cx={W * 0.13} cy="230" rx="6" ry="4" fill={`${clothColor}40`} />
          {/* Denim seam line */}
          <line x1={-W * 0.13} y1="185" x2={-W * 0.15} y2="280" stroke={`${clothColor}60`} strokeWidth="0.7" strokeDasharray="4 3" />
          <line x1={W * 0.13} y1="185" x2={W * 0.15} y2="280" stroke={`${clothColor}60`} strokeWidth="0.7" strokeDasharray="4 3" />
        </>
      )}
      {/* Shoes */}
      <ellipse cx={-W * 0.15} cy="283" rx="12" ry="5" fill="#2D1B0E" />
      <ellipse cx={W * 0.15} cy="283" rx="12" ry="5" fill="#2D1B0E" />

      {/* ── Arms (skin, behind torso overlap) ── */}
      {/* Left arm */}
      <path
        d={`M ${-W * 0.26} 108 Q ${-W * 0.42} 140 ${-W * 0.36} 195 L ${-W * 0.26} 195 Q ${-W * 0.3} 140 ${-W * 0.17} 108 Z`}
        fill={isJacket ? 'url(#clothGrad)' : 'url(#skinGrad)'}
        stroke={isJacket ? clothDark : skinDark}
        strokeWidth="0.8"
      />
      {/* Right arm */}
      <path
        d={`M ${W * 0.17} 108 Q ${W * 0.3} 140 ${W * 0.26} 195 L ${W * 0.36} 195 Q ${W * 0.42} 140 ${W * 0.26} 108 Z`}
        fill={isJacket ? 'url(#clothGrad)' : 'url(#skinGrad)'}
        stroke={isJacket ? clothDark : skinDark}
        strokeWidth="0.8"
      />
      {/* Jacket sleeve cuffs */}
      {isJacket && (
        <>
          <rect x={-W * 0.38} y="188" width="13" height="8" rx="3" fill={clothDark} />
          <rect x={W * 0.25} y="188" width="13" height="8" rx="3" fill={clothDark} />
        </>
      )}
      {/* Hands */}
      <ellipse cx={-W * 0.31} cy="200" rx="6" ry="8" fill="url(#skinGrad)" />
      <ellipse cx={W * 0.31} cy="200" rx="6" ry="8" fill="url(#skinGrad)" />

      {/* ── Torso / Clothing ── */}
      {/* Torso base (skin neck area) */}
      <path
        d={`M ${-W * 0.28} 100 Q 0 92 ${W * 0.28} 100 L ${W * 0.24} 190 Q 0 196 ${-W * 0.24} 190 Z`}
        fill="url(#skinGrad)"
      />
      {/* Clothing over torso */}
      {!isPants && (
        <path
          d={`M ${-W * 0.28} ${isJacket ? 97 : 102} Q 0 ${isJacket ? 88 : 94} ${W * 0.28} ${isJacket ? 97 : 102}
              L ${W * 0.24} ${hasSkirt ? 155 : 190} Q 0 ${hasSkirt ? 162 : 196} ${-W * 0.24} ${hasSkirt ? 155 : 190} Z`}
          fill="url(#clothGrad)"
          stroke={clothDark}
          strokeWidth="0.6"
        />
      )}
      {/* Jacket lapels */}
      {isJacket && (
        <>
          <path d={`M 0 97 L ${-W * 0.1} 120 L 0 115 Z`} fill={clothLight} />
          <path d={`M 0 97 L ${W * 0.1} 120 L 0 115 Z`} fill={clothLight} />
          {/* Jacket button */}
          <circle cx="0" cy="130" r="2.5" fill={clothDark} />
          <circle cx="0" cy="145" r="2.5" fill={clothDark} />
          {/* Pocket lines */}
          <rect x={-W * 0.2} y="148" width="18" height="8" rx="2" fill={clothDark} />
          <rect x={W * 0.02} y="148" width="18" height="8" rx="2" fill={clothDark} />
        </>
      )}
      {/* Skirt / dress flare */}
      {hasSkirt && (
        <path
          d={`M ${-W * 0.24} 155 Q ${-W * 0.36} 185 ${-W * 0.32} 240 Q 0 250 ${W * 0.32} 240 Q ${W * 0.36} 185 ${W * 0.24} 155 Z`}
          fill="url(#clothGrad)"
          stroke={clothDark}
          strokeWidth="0.6"
        />
      )}
      {/* Cloth shading overlay */}
      {!isPants && (
        <path
          d={`M ${-W * 0.28} ${isJacket ? 97 : 102} Q 0 ${isJacket ? 88 : 94} ${W * 0.28} ${isJacket ? 97 : 102}
              L ${W * 0.24} ${hasSkirt ? 155 : 190} Q 0 ${hasSkirt ? 162 : 196} ${-W * 0.24} ${hasSkirt ? 155 : 190} Z`}
          fill="url(#clothSide)"
        />
      )}
      {/* Fabric texture lines */}
      {isTop && (
        <>
          <line x1={-W * 0.1} y1="115" x2={-W * 0.08} y2="185" stroke={`${clothColor}30`} strokeWidth="1.2" />
          <line x1={W * 0.1} y1="115" x2={W * 0.08} y2="185" stroke={`${clothColor}30`} strokeWidth="1.2" />
        </>
      )}

      {/* ── Waistband / belt ── */}
      {isPants && (
        <rect x={-W * 0.24} y="182" width={W * 0.48} height="8" rx="2" fill={clothDark} />
      )}

      {/* ── Neck ── */}
      <rect x="-10" y="58" width="20" height="44" rx="8" fill="url(#skinGrad)" />

      {/* ── Head ── */}
      {/* Head base */}
      <ellipse cx="0" cy="35" rx="30" ry="35" fill="url(#skinGrad)" />
      {/* Hair top */}
      <path d={`M -28 28 Q -30 -5 0 -8 Q 30 -5 28 28 Q 15 18 0 17 Q -15 18 -28 28 Z`} fill="url(#hairGrad)" />
      {/* Eyes */}
      {!isBack && (
        <>
          <ellipse cx="-10" cy="35" rx="4" ry="4.5" fill="white" />
          <ellipse cx="10" cy="35" rx="4" ry="4.5" fill="white" />
          <ellipse cx="-10" cy="36" rx="2.5" ry="3" fill="#3D2B1F" />
          <ellipse cx="10" cy="36" rx="2.5" ry="3" fill="#3D2B1F" />
          <ellipse cx="-9" cy="35" rx="1" ry="1" fill="white" />
          <ellipse cx="11" cy="35" rx="1" ry="1" fill="white" />
          {/* Eyebrows */}
          <path d="M -14 29 Q -10 27 -6 29" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          <path d="M 6 29 Q 10 27 14 29" stroke={hairColor} strokeWidth="1.5" fill="none" strokeLinecap="round" />
          {/* Nose */}
          <path d="M 0 38 Q -3 44 0 46 Q 3 44 0 38" fill="none" stroke={skinDark} strokeWidth="1.2" strokeLinecap="round" />
          {/* Mouth */}
          <path d="M -7 52 Q 0 57 7 52" stroke={skinDark} strokeWidth="1.5" fill="none" strokeLinecap="round" />
        </>
      )}
      {/* Ear */}
      <ellipse cx="-29" cy="37" rx="4" ry="6" fill={skinDark} />
      <ellipse cx="29" cy="37" rx="4" ry="6" fill={skinDark} />

      {/* ── Rotation indicator lines (back view subtle) ── */}
      {isBack && (
        <text x="0" y="200" textAnchor="middle" fontSize="10" fill="#94A3B8" opacity="0.6">tampak belakang</text>
      )}
    </svg>
  );
}

// ─────────────────────────────────────────────
// Main Styliss AI Component
// ─────────────────────────────────────────────
function StylissAIContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const fromCart = searchParams.get('source') === 'keranjang';

  // State
  const [body, setBody] = useState<BodyMeasure>({ height: 170, weight: 65 });
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedItem, setSelectedItem] = useState<CartItemData | null>(null);
  const [activeTab, setActiveTab] = useState<'mannequin' | 'wardrobe' | 'customize'>('mannequin');
  const [isDragging, setIsDragging] = useState(false);
  const [isAutoRotate, setIsAutoRotate] = useState(false);

  // Drag to rotate refs
  const dragStartX = useRef(0);
  const dragStartRot = useRef(0);
  const viewerRef = useRef<HTMLDivElement>(null);
  const autoRotateRef = useRef<ReturnType<typeof setInterval> | null>(null);

  // Load item from localStorage (from cart)
  useEffect(() => {
    if (typeof window !== 'undefined') {
      const raw = localStorage.getItem('klambi_styliss_item');
      if (raw) {
        try {
          const parsed = JSON.parse(raw) as CartItemData;
          setSelectedItem(parsed);
          if (fromCart) {
            toast.success(`${parsed.emoji} ${parsed.title} siap dicoba!`);
          }
        } catch {
          // ignore parse error
        }
      }
    }
    // Clean up after reading
    return () => {
      if (typeof window !== 'undefined' && fromCart) {
        localStorage.removeItem('klambi_styliss_source');
      }
    };
  }, [fromCart]);

  // Auto-rotate
  useEffect(() => {
    if (isAutoRotate) {
      autoRotateRef.current = setInterval(() => {
        setRotation((r) => r + 1);
      }, 30);
    } else {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    }
    return () => {
      if (autoRotateRef.current) clearInterval(autoRotateRef.current);
    };
  }, [isAutoRotate]);

  // ── Drag handlers ──
  const handlePointerDown = useCallback((e: React.PointerEvent) => {
    setIsDragging(true);
    setIsAutoRotate(false);
    dragStartX.current = e.clientX;
    dragStartRot.current = rotation;
    (e.target as HTMLElement).setPointerCapture(e.pointerId);
  }, [rotation]);

  const handlePointerMove = useCallback((e: React.PointerEvent) => {
    if (!isDragging) return;
    const delta = e.clientX - dragStartX.current;
    setRotation(dragStartRot.current + delta * 0.6);
  }, [isDragging]);

  const handlePointerUp = useCallback(() => {
    setIsDragging(false);
  }, []);

  // ── Wheel zoom ──
  const handleWheel = useCallback((e: React.WheelEvent) => {
    e.preventDefault();
    setZoom((z) => Math.min(2, Math.max(0.6, z - e.deltaY * 0.002)));
  }, []);

  const { bmi } = getBodyProps(body.height, body.weight);

  const bmiCategory =
    parseFloat(bmi) < 18.5 ? { label: 'Kurus', color: '#3B82F6' } :
    parseFloat(bmi) < 25 ? { label: 'Ideal', color: '#22C55E' } :
    parseFloat(bmi) < 30 ? { label: 'Gemuk', color: '#F59E0B' } :
    { label: 'Obesitas', color: '#EF4444' };

  const normalizedRot = ((rotation % 360) + 360) % 360;
  const viewLabel =
    normalizedRot < 30 || normalizedRot > 330 ? 'Tampak Depan' :
    normalizedRot < 80 ? 'Tampak Depan-Kiri' :
    normalizedRot < 120 ? 'Tampak Kiri' :
    normalizedRot < 160 ? 'Tampak Belakang-Kiri' :
    normalizedRot < 210 ? 'Tampak Belakang' :
    normalizedRot < 260 ? 'Tampak Belakang-Kanan' :
    normalizedRot < 290 ? 'Tampak Kanan' :
    'Tampak Depan-Kanan';

  return (
    <AppLayout title="Styliss AI — Manekin 3D" showBack backHref={fromCart ? '/keranjang' : '/'}>
      <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-fade-in">

        {/* From Cart Banner */}
        {fromCart && selectedItem && (
          <div className="bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] border border-emerald-200 rounded-2xl p-3 flex items-center gap-3 animate-slide-up">
            <span className="text-2xl">{selectedItem.emoji}</span>
            <div className="flex-1 min-w-0">
              <div className="text-[10px] font-bold text-emerald-700">Dari Keranjangmu</div>
              <div className="text-xs font-extrabold text-emerald-900 truncate">{selectedItem.title}</div>
            </div>
            <button
              onClick={() => router.push('/keranjang')}
              className="text-[10px] font-bold text-emerald-700 border border-emerald-400 px-2.5 py-1 rounded-full hover:bg-emerald-100"
            >
              ← Keranjang
            </button>
          </div>
        )}

        {/* Tab Navigation */}
        <div className="grid grid-cols-3 gap-1.5 bg-slate-100 rounded-2xl p-1.5">
          {[
            { id: 'mannequin', label: 'Manekin 3D', emoji: '🧍' },
            { id: 'wardrobe', label: 'Pilih Pakaian', emoji: '👗' },
            { id: 'customize', label: 'Ukuran Tubuh', emoji: '📏' },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id as typeof activeTab)}
              className={`flex flex-col items-center gap-0.5 py-2.5 rounded-xl text-[11px] font-bold transition-all ${
                activeTab === tab.id
                  ? 'bg-white text-[#10284D] shadow-sm'
                  : 'text-muted-foreground hover:text-foreground'
              }`}
            >
              <span className="text-base">{tab.emoji}</span>
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {/* ═══════════════════════════════════════ */}
        {/* TAB 1: MANNEQUIN 3D VIEWER              */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'mannequin' && (
          <div className="space-y-3 animate-fade-in">
            {/* Viewer Canvas */}
            <div
              ref={viewerRef}
              className={`relative bg-gradient-to-b from-slate-50 via-slate-100 to-slate-200 rounded-3xl border border-border shadow-inner overflow-hidden select-none ${isDragging ? 'cursor-grabbing' : 'cursor-grab'}`}
              style={{ height: '420px' }}
              onPointerDown={handlePointerDown}
              onPointerMove={handlePointerMove}
              onPointerUp={handlePointerUp}
              onPointerLeave={handlePointerUp}
              onWheel={handleWheel}
            >
              {/* Background grid */}
              <div
                className="absolute inset-0 opacity-30"
                style={{
                  backgroundImage: 'radial-gradient(circle, #CBD5E1 1px, transparent 1px)',
                  backgroundSize: '24px 24px',
                }}
              />
              {/* 3D Perspective container */}
              <div
                className="absolute inset-0 flex items-center justify-center"
                style={{
                  perspective: '800px',
                }}
              >
                <div
                  className="transition-none"
                  style={{
                    transform: `scale(${zoom}) rotateY(${rotation}deg)`,
                    transformStyle: 'preserve-3d',
                    width: '160px',
                    height: '360px',
                  }}
                >
                  <MannequinSVG
                    height={body.height}
                    weight={body.weight}
                    item={selectedItem}
                    rotation={rotation}
                  />
                </div>
              </div>

              {/* HUD overlays */}
              {/* Top-left: view label */}
              <div className="absolute top-3 left-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                {viewLabel}
              </div>
              {/* Top-right: zoom */}
              <div className="absolute top-3 right-3 bg-black/40 backdrop-blur-sm text-white text-[10px] font-bold px-3 py-1.5 rounded-full">
                🔍 {Math.round(zoom * 100)}%
              </div>
              {/* Bottom: drag hint */}
              <div className="absolute bottom-3 left-0 right-0 flex justify-center">
                <div className="bg-black/30 backdrop-blur-sm text-white text-[10px] font-semibold px-4 py-1.5 rounded-full flex items-center gap-2">
                  <span>↔ Seret untuk rotasi</span>
                  <span className="opacity-60">|</span>
                  <span>⬡ Scroll untuk zoom</span>
                </div>
              </div>
              {/* Outfit label badge */}
              {selectedItem && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 flex items-center gap-1.5 bg-white/90 backdrop-blur-sm border border-border text-[#10284D] text-[10px] font-bold px-3 py-1.5 rounded-full shadow-sm">
                  <span>{selectedItem.emoji}</span>
                  <span>{selectedItem.category}</span>
                  {selectedItem.size && <span className="text-[#E86D50]">• {selectedItem.size}</span>}
                </div>
              )}
            </div>

            {/* Controls row */}
            <div className="grid grid-cols-4 gap-2">
              {/* Zoom out */}
              <button
                onClick={() => setZoom((z) => Math.max(0.6, z - 0.15))}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-card rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:text-[#10284D] hover:border-[#10284D]/40 transition-all active:scale-95"
              >
                <span className="text-lg">🔍−</span>
                <span>Zoom Out</span>
              </button>
              {/* Zoom in */}
              <button
                onClick={() => setZoom((z) => Math.min(2, z + 0.15))}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-card rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:text-[#10284D] hover:border-[#10284D]/40 transition-all active:scale-95"
              >
                <span className="text-lg">🔍+</span>
                <span>Zoom In</span>
              </button>
              {/* Auto rotate */}
              <button
                onClick={() => setIsAutoRotate((r) => !r)}
                className={`flex flex-col items-center justify-center gap-1 py-3 rounded-2xl border text-xs font-bold transition-all active:scale-95 ${
                  isAutoRotate
                    ? 'bg-[#10284D] text-white border-[#10284D]'
                    : 'bg-card border-border text-muted-foreground hover:text-[#10284D]'
                }`}
              >
                <span className="text-lg">🔄</span>
                <span>{isAutoRotate ? 'Stop' : 'Auto'}</span>
              </button>
              {/* Reset */}
              <button
                onClick={() => { setRotation(0); setZoom(1); setIsAutoRotate(false); }}
                className="flex flex-col items-center justify-center gap-1 py-3 bg-card rounded-2xl border border-border text-xs font-bold text-muted-foreground hover:text-[#10284D] hover:border-[#10284D]/40 transition-all active:scale-95"
              >
                <span className="text-lg">↺</span>
                <span>Reset</span>
              </button>
            </div>

            {/* Rotation quick-select */}
            <div className="bg-card rounded-2xl p-3 border border-border shadow-sm">
              <div className="text-[11px] font-bold text-muted-foreground mb-2">Tampilkan Sudut Pandang:</div>
              <div className="grid grid-cols-4 gap-1.5">
                {[
                  { label: 'Depan', rot: 0 },
                  { label: 'Kiri', rot: 90 },
                  { label: 'Belakang', rot: 180 },
                  { label: 'Kanan', rot: 270 },
                ].map((v) => (
                  <button
                    key={v.rot}
                    onClick={() => { setRotation(v.rot); setIsAutoRotate(false); }}
                    className={`py-2 rounded-xl text-[11px] font-bold transition-all ${
                      Math.abs(((rotation % 360) + 360) % 360 - v.rot) < 20
                        ? 'bg-[#10284D] text-white'
                        : 'bg-slate-50 text-muted-foreground border border-border hover:border-[#10284D]/40'
                    }`}
                  >
                    {v.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Action buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toast.success('Tampilan manekin disimpan!')}
                className="py-3.5 rounded-2xl bg-[#10284D] text-white text-xs font-extrabold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                💾 Simpan Tampilan
              </button>
              {selectedItem ? (
                <button
                  onClick={() => router.push('/pembayaran?total=' + selectedItem.price)}
                  className="py-3.5 rounded-2xl bg-[#E86D50] text-white text-xs font-extrabold shadow-md hover:opacity-90 active:scale-95 transition-all"
                >
                  🛒 Beli Sekarang
                </button>
              ) : (
                <button
                  onClick={() => setActiveTab('wardrobe')}
                  className="py-3.5 rounded-2xl border-2 border-dashed border-[#10284D]/40 text-[#10284D] text-xs font-bold hover:bg-secondary active:scale-95 transition-all"
                >
                  👗 Pilih Pakaian
                </button>
              )}
            </div>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 2: WARDROBE / ITEM PICKER           */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'wardrobe' && (
          <div className="space-y-3 animate-fade-in">
            <div className="flex items-center justify-between">
              <span className="text-sm font-extrabold text-[#10284D]">Pilih Pakaian untuk Dicoba</span>
              <button
                onClick={() => router.push('/keranjang')}
                className="text-xs font-bold text-[#E86D50] flex items-center gap-1 hover:underline"
              >
                🛒 Dari Keranjang
                <Icon name="ChevronRightIcon" size={12} />
              </button>
            </div>

            {/* Current selected */}
            {selectedItem && (
              <div className="bg-gradient-to-r from-[#10284D] to-[#1A3A6B] rounded-2xl p-4 text-white flex items-center gap-3">
                <span className="text-3xl">{selectedItem.emoji}</span>
                <div className="flex-1">
                  <div className="text-[10px] font-semibold opacity-70">Sedang Dipakai:</div>
                  <div className="text-xs font-extrabold">{selectedItem.title}</div>
                  <div className="text-[10px] opacity-70">{selectedItem.category} • Size {selectedItem.size ?? '—'}</div>
                </div>
                <button
                  onClick={() => setSelectedItem(null)}
                  className="text-white/60 hover:text-white text-sm"
                >
                  ✕
                </button>
              </div>
            )}

            {/* Grid wardrobe */}
            <div className="grid grid-cols-2 gap-3">
              {wardrobeMock.map((item) => {
                const isActive = selectedItem?.id === item.id;
                return (
                  <button
                    key={item.id}
                    onClick={() => {
                      setSelectedItem(item);
                      setActiveTab('mannequin');
                      toast.success(`${item.emoji} ${item.title} dipakaikan ke manekin!`);
                    }}
                    className={`relative flex flex-col items-center gap-2 p-4 rounded-2xl border-2 transition-all active:scale-95 text-left ${
                      isActive
                        ? 'border-[#10284D] bg-[#10284D]/5 shadow-md'
                        : 'border-border bg-card hover:border-[#10284D]/40 hover:shadow-sm'
                    }`}
                  >
                    {isActive && (
                      <div className="absolute top-2 right-2 w-5 h-5 rounded-full bg-[#10284D] flex items-center justify-center">
                        <span className="text-[8px] text-white font-black">✓</span>
                      </div>
                    )}
                    <div className="relative w-full h-24 rounded-xl overflow-hidden bg-slate-100 border border-border/70">
                      {item.imageUrl ? (
                        <Image
                          src={item.imageUrl}
                          alt={item.title}
                          fill
                          unoptimized
                          className="object-cover"
                        />
                      ) : (
                        <div
                          className="w-full h-full flex items-center justify-center text-4xl"
                          style={{ background: `${item.color}18` }}
                        >
                          {item.emoji}
                        </div>
                      )}
                      <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1.5 py-0.5 rounded backdrop-blur-xs">
                        {item.emoji}
                      </span>
                    </div>
                    <div className="w-full">
                      <div className="text-[10px] font-extrabold text-foreground leading-tight">{item.title}</div>
                      <div className="text-[9px] text-muted-foreground mt-0.5">{item.category} • {item.size}</div>
                      <div className="text-[10px] font-bold text-[#E86D50] mt-1">
                        Rp {item.price.toLocaleString('id-ID')}
                      </div>
                    </div>
                  </button>
                );
              })}
            </div>

            {/* Naked mannequin option */}
            <button
              onClick={() => { setSelectedItem(null); setActiveTab('mannequin'); }}
              className="w-full py-3 rounded-2xl border border-dashed border-border text-muted-foreground text-xs font-semibold hover:border-[#10284D]/40 transition-all"
            >
              🗑️ Lepas Semua Pakaian (Tampilkan Manekin Polos)
            </button>
          </div>
        )}

        {/* ═══════════════════════════════════════ */}
        {/* TAB 3: BODY CUSTOMIZER                  */}
        {/* ═══════════════════════════════════════ */}
        {activeTab === 'customize' && (
          <div className="space-y-4 animate-fade-in">
            {/* BMI Card */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#10284D]">📏 Ukuran Tubuh Manekin</span>
                <div
                  className="text-xs font-extrabold px-3 py-1 rounded-full"
                  style={{ background: `${bmiCategory.color}20`, color: bmiCategory.color }}
                >
                  {bmiCategory.label} (BMI {bmi})
                </div>
              </div>

              {/* Height Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-2">
                    📐 Tinggi Badan
                  </label>
                  <div className="bg-[#10284D] text-white text-sm font-black px-4 py-1.5 rounded-xl min-w-[72px] text-center">
                    {body.height} cm
                  </div>
                </div>
                <input
                  type="range"
                  min="150"
                  max="200"
                  value={body.height}
                  onChange={(e) => setBody((b) => ({ ...b, height: Number(e.target.value) }))}
                  className="w-full accent-[#10284D] cursor-pointer h-2"
                  style={{ accentColor: '#10284D' }}
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>150 cm</span>
                  <span className="text-[#10284D] font-bold">↑ Referensi 170cm</span>
                  <span>200 cm</span>
                </div>
              </div>

              {/* Weight Slider */}
              <div className="space-y-3">
                <div className="flex items-center justify-between">
                  <label className="text-xs font-extrabold text-foreground flex items-center gap-2">
                    ⚖️ Berat Badan
                  </label>
                  <div className="bg-[#10284D] text-white text-sm font-black px-4 py-1.5 rounded-xl min-w-[72px] text-center">
                    {body.weight} kg
                  </div>
                </div>
                <input
                  type="range"
                  min="40"
                  max="120"
                  value={body.weight}
                  onChange={(e) => setBody((b) => ({ ...b, weight: Number(e.target.value) }))}
                  className="w-full accent-[#10284D] cursor-pointer h-2"
                />
                <div className="flex justify-between text-[10px] text-muted-foreground font-semibold">
                  <span>40 kg</span>
                  <span className="text-[#10284D] font-bold">↑ Referensi 65kg</span>
                  <span>120 kg</span>
                </div>
              </div>

              {/* BMI Visual */}
              <div className="bg-slate-50 rounded-2xl p-4 border border-border space-y-3">
                <div className="flex items-center justify-between text-xs font-bold">
                  <span>BMI Gauge</span>
                  <span style={{ color: bmiCategory.color }}>{bmiCategory.label}</span>
                </div>
                {/* BMI gradient bar */}
                <div className="relative h-4 rounded-full overflow-hidden" style={{ background: 'linear-gradient(to right, #3B82F6, #22C55E, #F59E0B, #EF4444)' }}>
                  <div
                    className="absolute top-0 bottom-0 w-3 rounded-full bg-white border-2 border-[#10284D] shadow-md transition-all duration-300"
                    style={{ left: `${Math.min(95, Math.max(2, ((parseFloat(bmi) - 15) / 25) * 100))}%`, transform: 'translateX(-50%)' }}
                  />
                </div>
                <div className="grid grid-cols-4 text-[9px] text-center text-muted-foreground font-semibold">
                  <span>Kurus<br/>&lt;18.5</span>
                  <span className="text-emerald-600">Ideal<br/>18.5–24.9</span>
                  <span className="text-amber-600">Gemuk<br/>25–29.9</span>
                  <span className="text-red-600">Obesitas<br/>≥30</span>
                </div>
              </div>

              {/* Body stats */}
              <div className="grid grid-cols-3 gap-2">
                {[
                  { label: 'Tinggi', value: `${body.height} cm` },
                  { label: 'Berat', value: `${body.weight} kg` },
                  { label: 'BMI', value: bmi },
                ].map((stat) => (
                  <div key={stat.label} className="bg-slate-50 rounded-xl p-3 text-center border border-border">
                    <div className="text-sm font-black text-[#10284D]">{stat.value}</div>
                    <div className="text-[10px] text-muted-foreground mt-0.5">{stat.label}</div>
                  </div>
                ))}
              </div>

              {/* Quick presets */}
              <div>
                <div className="text-[11px] font-bold text-muted-foreground mb-2">Preset Cepat:</div>
                <div className="grid grid-cols-3 gap-2">
                  {[
                    { label: 'Petite', h: 155, w: 48 },
                    { label: 'Average', h: 168, w: 62 },
                    { label: 'Tall', h: 182, w: 78 },
                  ].map((p) => (
                    <button
                      key={p.label}
                      onClick={() => {
                        setBody({ height: p.h, weight: p.w });
                        toast.success(`Ukuran "${p.label}" diterapkan ke manekin!`);
                      }}
                      className="py-2.5 rounded-xl bg-slate-50 border border-border text-[11px] font-bold text-muted-foreground hover:border-[#10284D] hover:text-[#10284D] transition-all active:scale-95"
                    >
                      {p.label}<br />
                      <span className="text-[9px] font-normal">{p.h}cm / {p.w}kg</span>
                    </button>
                  ))}
                </div>
              </div>

              <button
                onClick={() => setActiveTab('mannequin')}
                className="w-full py-3.5 rounded-2xl bg-[#10284D] text-white text-xs font-extrabold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                ✅ Terapkan ke Manekin 3D
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

// Suspense wrapper for useSearchParams
export default function StylissAIPage() {
  return (
    <Suspense fallback={
      <AppLayout title="Styliss AI">
        <div className="flex items-center justify-center h-64">
          <div className="w-10 h-10 border-4 border-[#10284D] border-t-transparent rounded-full animate-spin" />
        </div>
      </AppLayout>
    }>
      <StylissAIContent />
    </Suspense>
  );
}
