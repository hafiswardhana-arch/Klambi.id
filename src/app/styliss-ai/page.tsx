'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

type Stage = 'upload' | 'rendering' | 'result';

const renderSteps = [
  { label: 'Memindai kontur & siluet pakaian', emoji: '📷', durationMs: 900 },
  { label: 'Memetakan tekstur & motif kain', emoji: '🎨', durationMs: 900 },
  { label: 'Memodelkan ke manekin 3D', emoji: '🧍', durationMs: 1000 },
  { label: 'Menghitung pencahayaan & bayangan', emoji: '✨', durationMs: 800 },
];

const outfitSuggestions = [
  { id: 1, label: 'Smart Casual', top: '👔', bottom: '👖', shoes: '👟', tags: ['Office', 'Casual Friday'] },
  { id: 2, label: 'Street Style', top: '🧥', bottom: '👖', shoes: '👠', tags: ['Weekend', 'Urban'] },
  { id: 3, label: 'Resort Casual', top: '👗', bottom: '—', shoes: '👡', tags: ['Holiday', 'Beach'] },
  { id: 4, label: 'Monochrome', top: '🧣', bottom: '👕', shoes: '🥿', tags: ['Minimalis', 'Clean'] },
];

const savedItems = [
  { id: 1, emoji: '👔', label: 'Kemeja Oxford', score: 91 },
  { id: 2, emoji: '🧥', label: 'Jaket Denim', score: 67 },
  { id: 3, emoji: '👗', label: 'Dress Batik', score: 88 },
  { id: 4, emoji: '👖', label: 'Celana Chino', score: 82 },
];

export default function StylissAIPage() {
  const [stage, setStage] = useState<Stage>('upload');
  const [stepsDone, setStepsDone] = useState<number>(0);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [selectedOutfit, setSelectedOutfit] = useState<number>(0);
  const [selectedItem, setSelectedItem] = useState<number>(0);

  const handleUpload = () => {
    setStage('rendering');
    setStepsDone(0);

    renderSteps.forEach((step, idx) => {
      const delay = renderSteps.slice(0, idx).reduce((acc, s) => acc + s.durationMs, 0);
      setTimeout(() => setStepsDone(idx + 1), delay + 400);
    });

    const totalDuration = renderSteps.reduce((acc, s) => acc + s.durationMs, 0) + 600;
    setTimeout(() => {
      setStage('result');
      toast.success('Mannequin 3D siap! Pakaian berhasil dirender.');
    }, totalDuration);
  };

  const handleReset = () => {
    setStage('upload');
    setStepsDone(0);
    setRotation(0);
    setZoom(1);
  };

  const outfit = outfitSuggestions[selectedOutfit];
  const item = savedItems[selectedItem];

  return (
    <AppLayout title="Styliss AI — 3D Fitting" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20 animate-fade-in">

        {/* Stage: Upload */}
        {stage === 'upload' && (
          <div className="space-y-4 animate-slide-up">
            {/* Hero Card */}
            <div className="relative bg-gradient-to-b from-[#D1FAE5] to-[#A7F3D0] rounded-3xl h-[360px] border border-emerald-200 overflow-hidden flex flex-col items-center justify-center gap-6 shadow-inner">
              {/* Decorative circles */}
              <div className="absolute -top-10 -left-10 w-48 h-48 rounded-full bg-emerald-300/20 pointer-events-none" />
              <div className="absolute -bottom-10 -right-10 w-48 h-48 rounded-full bg-teal-300/20 pointer-events-none" />

              {/* Mannequin Placeholder */}
              <div className="relative animate-float">
                <div className="flex flex-col items-center gap-0.5">
                  {/* Head */}
                  <div className="w-10 h-10 rounded-full bg-[#10284D]/15 border-2 border-[#10284D]/20" />
                  {/* Body outline dashed */}
                  <div className="w-28 h-44 rounded-t-3xl rounded-b-xl border-2 border-dashed border-[#10284D]/30 flex items-center justify-center bg-white/40">
                    <div className="text-center space-y-1">
                      <Icon name="CameraIcon" size={32} className="text-[#10284D]/40 mx-auto" />
                      <span className="text-[10px] text-[#10284D]/60 font-semibold">Zona Pakaian 3D</span>
                    </div>
                  </div>
                  {/* Legs */}
                  <div className="flex gap-4">
                    <div className="w-3 h-20 rounded-b-xl bg-[#10284D]/10 border border-[#10284D]/15" />
                    <div className="w-3 h-20 rounded-b-xl bg-[#10284D]/10 border border-[#10284D]/15" />
                  </div>
                </div>
              </div>

              <div className="text-center px-6 relative z-10">
                <h3 className="text-base font-extrabold text-[#10284D]">Styliss AI 3D Viewer</h3>
                <p className="text-xs text-[#10284D]/70 mt-1">
                  Upload foto pakaian → AI peta tekstur ke manekin 3D interaktif
                </p>
              </div>

              <button
                onClick={handleUpload}
                className="bg-[#10284D] text-white px-8 py-3.5 rounded-full text-sm font-extrabold shadow-lg hover:bg-[#152248] active:scale-95 transition-all animate-bounce-gentle relative z-10"
              >
                📸 Upload Foto Pakaian
              </button>
            </div>

            {/* Saved Wardrobe */}
            <div className="bg-card rounded-3xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#10284D]">👔 Lemari Digital Saya</span>
                <span className="text-xs text-[#E86D50] font-bold">{savedItems.length} item tersimpan</span>
              </div>
              <div className="grid grid-cols-4 gap-2">
                {savedItems.map((itm, idx) => (
                  <button
                    key={itm.id}
                    onClick={() => setSelectedItem(idx)}
                    className={`flex flex-col items-center gap-1 p-2 rounded-2xl border transition-all ${
                      selectedItem === idx
                        ? 'border-[#10284D] bg-secondary shadow-sm scale-105'
                        : 'border-border bg-slate-50 hover:border-[#10284D]/40'
                    }`}
                  >
                    <span className="text-2xl">{itm.emoji}</span>
                    <span className="text-[9px] font-bold text-center text-foreground leading-tight">{itm.label}</span>
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded-full ${
                      itm.score >= 80 ? 'bg-emerald-100 text-emerald-800' :
                      itm.score >= 60 ? 'bg-amber-100 text-amber-800' :
                      'bg-red-100 text-red-700'
                    }`}>{itm.score}/100</span>
                  </button>
                ))}
              </div>
              {selectedItem !== null && (
                <button
                  onClick={handleUpload}
                  className="w-full py-2.5 bg-secondary text-primary rounded-2xl text-xs font-extrabold border border-border hover:bg-slate-100 transition-all active:scale-95"
                >
                  🎯 Render {item.label} ke Mannequin 3D
                </button>
              )}
            </div>
          </div>
        )}

        {/* Stage: Rendering */}
        {stage === 'rendering' && (
          <div className="space-y-4 animate-fade-in">
            <div className="relative bg-gradient-to-b from-slate-800 to-slate-900 rounded-3xl h-[360px] flex flex-col items-center justify-center gap-6 overflow-hidden shadow-2xl">
              {/* Spinning ring */}
              <div className="relative">
                <div className="w-24 h-24 rounded-full border-4 border-[#3A7BF7]/30 border-t-[#3A7BF7] animate-spin" />
                <div className="absolute inset-0 flex items-center justify-center">
                  <span className="text-2xl animate-pulse">🧍</span>
                </div>
              </div>
              <div className="text-center">
                <h3 className="text-base font-extrabold text-white">Merekonstruksi Mannequin 3D...</h3>
                <p className="text-xs text-white/60 mt-1">Mohon tunggu sebentar</p>
              </div>
            </div>

            {/* Steps card */}
            <div className="bg-card rounded-3xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex items-center justify-between">
                <span className="text-sm font-extrabold text-[#10284D]">PROSES ANALISIS 3D</span>
                <span className="text-xs font-bold text-muted-foreground">{stepsDone}/{renderSteps.length}</span>
              </div>
              {/* Progress bar */}
              <div className="w-full h-2 bg-slate-100 rounded-full overflow-hidden">
                <div
                  className="h-full bg-gradient-to-r from-[#10284D] to-[#3A7BF7] rounded-full transition-all duration-700"
                  style={{ width: `${(stepsDone / renderSteps.length) * 100}%` }}
                />
              </div>
              {renderSteps.map((step, idx) => {
                const isDone = idx < stepsDone;
                const isActive = idx === stepsDone;
                return (
                  <div key={idx} className={`flex items-center gap-3 py-1.5 transition-all ${isDone ? 'opacity-100' : isActive ? 'opacity-100' : 'opacity-40'}`}>
                    <div className={`w-8 h-8 rounded-full flex items-center justify-center text-sm flex-shrink-0 transition-all ${
                      isDone ? 'bg-emerald-100' : isActive ? 'bg-[#10284D]/10 animate-pulse' : 'bg-slate-100'
                    }`}>
                      {isDone ? '✅' : step.emoji}
                    </div>
                    <span className={`text-xs font-semibold ${isDone ? 'text-emerald-700 line-through' : isActive ? 'text-[#10284D] font-bold' : 'text-muted-foreground'}`}>
                      {step.label}
                    </span>
                  </div>
                );
              })}
              <p className="text-[11px] text-muted-foreground text-center border-t border-border pt-2">
                ⏱️ Estimasi waktu: 5–10 detik
              </p>
            </div>
          </div>
        )}

        {/* Stage: Result */}
        {stage === 'result' && (
          <div className="space-y-4 animate-fade-in">
            {/* 3D Viewer */}
            <div
              className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl h-[400px] border border-border shadow-inner flex flex-col items-center justify-center overflow-hidden select-none"
            >
              {/* 3D Model */}
              <div
                className="transition-transform duration-200 flex flex-col items-center gap-0.5"
                style={{ transform: `rotateY(${rotation}deg) scale(${zoom})` }}
              >
                {/* Head */}
                <div className="w-11 h-11 rounded-full bg-[#F5DEB3] border-2 border-[#D2B48C] shadow-sm mb-1" />
                {/* Garment */}
                <div className="w-40 h-52 bg-gradient-to-b from-[#1E3A8A] via-[#3B82F6] to-[#10284D] rounded-t-3xl rounded-b-2xl shadow-xl flex flex-col items-center justify-center text-white gap-2 border-2 border-blue-400/40">
                  <span className="text-3xl">{item.emoji}</span>
                  <span className="text-[10px] font-bold text-center px-4">{item.label}</span>
                  <span className="text-[9px] text-blue-200 font-semibold">AI Score: {item.score}/100</span>
                </div>
                {/* Legs */}
                <div className="flex gap-5 mt-0.5">
                  <div className="w-4 h-28 bg-slate-400/80 rounded-b-xl border border-slate-500/30 shadow-sm" />
                  <div className="w-4 h-28 bg-slate-400/80 rounded-b-xl border border-slate-500/30 shadow-sm" />
                </div>
              </div>

              {/* Overlay tags */}
              <div className="absolute top-3 left-3 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-700 border border-gray-200 shadow-xs">
                🔄 {rotation}° rotasi
              </div>
              <div className="absolute top-3 right-3 bg-white/80 backdrop-blur-sm px-3 py-1.5 rounded-full text-[10px] font-bold text-gray-700 border border-gray-200 shadow-xs">
                🔍 {Math.round(zoom * 100)}%
              </div>
            </div>

            {/* 3D Controls */}
            <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
              <div className="flex items-center justify-between">
                <span className="text-xs font-extrabold text-foreground">Kontrol Viewer 3D</span>
                <button onClick={() => { setRotation(0); setZoom(1); }} className="text-xs font-semibold text-primary hover:underline">
                  Reset View
                </button>
              </div>
              <div className="space-y-1">
                <label className="text-[11px] text-muted-foreground font-semibold flex justify-between">
                  <span>Rotasi Mannequin</span><span>{rotation}°</span>
                </label>
                <input type="range" min="-180" max="180" value={rotation}
                  onChange={(e) => setRotation(Number(e.target.value))}
                  className="w-full accent-[#10284D] cursor-pointer" />
              </div>
              <div className="flex items-center justify-between">
                <span className="text-xs text-muted-foreground font-semibold">Zoom</span>
                <div className="flex items-center gap-2">
                  <button onClick={() => setZoom((p) => Math.max(0.7, p - 0.1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-secondary">−</button>
                  <span className="text-xs font-bold w-12 text-center">{Math.round(zoom * 100)}%</span>
                  <button onClick={() => setZoom((p) => Math.min(1.6, p + 0.1))} className="w-9 h-9 rounded-xl bg-muted flex items-center justify-center font-bold text-lg hover:bg-secondary">+</button>
                </div>
              </div>
            </div>

            {/* Outfit Suggestion Carousel */}
            <div className="bg-card rounded-3xl p-4 border border-border shadow-sm space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-base">💡</span>
                <span className="text-sm font-extrabold text-[#10284D]">Saran Outfit AI</span>
              </div>
              <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
                {outfitSuggestions.map((o, idx) => (
                  <button
                    key={o.id}
                    onClick={() => setSelectedOutfit(idx)}
                    className={`flex-shrink-0 flex flex-col items-center gap-1 p-3 rounded-2xl border transition-all ${
                      selectedOutfit === idx
                        ? 'border-[#10284D] bg-secondary shadow-sm'
                        : 'border-border bg-slate-50 hover:border-[#10284D]/40'
                    }`}
                  >
                    <div className="flex gap-1 text-xl">{o.top}<span className="text-xs text-slate-400 self-center">+</span>{o.bottom}</div>
                    <span className="text-[10px] font-bold text-foreground">{o.label}</span>
                  </button>
                ))}
              </div>

              {/* Outfit detail */}
              <div className="bg-slate-50 rounded-2xl p-3 border border-border space-y-2">
                <div className="flex items-center justify-between">
                  <span className="text-xs font-extrabold text-foreground">{outfit.label} Look</span>
                  <div className="flex gap-1">
                    {outfit.tags.map((t) => (
                      <span key={t} className="text-[9px] bg-[#10284D]/10 text-[#10284D] font-bold px-2 py-0.5 rounded-full">{t}</span>
                    ))}
                  </div>
                </div>
                <div className="flex items-center gap-3 text-sm">
                  <span title="Atasan">{outfit.top}</span>
                  <span className="text-muted-foreground text-xs">+</span>
                  <span title="Bawahan">{outfit.bottom}</span>
                  <span className="text-muted-foreground text-xs">+</span>
                  <span title="Sepatu">{outfit.shoes}</span>
                </div>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => toast.success('Disimpan ke Lemari Digital!')}
                className="bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                💾 Simpan ke Lemari
              </button>
              <button
                onClick={() => toast.info('Link fitting 3D disalin!')}
                className="border border-[#10284D] text-[#10284D] py-3.5 rounded-2xl text-xs font-extrabold hover:bg-secondary active:scale-95 transition-all"
              >
                🔗 Bagikan Fitting
              </button>
            </div>

            <button
              onClick={handleReset}
              className="w-full py-3 rounded-2xl bg-slate-100 text-muted-foreground text-xs font-bold hover:bg-slate-200 transition-all"
            >
              ← Upload Pakaian Lain
            </button>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
