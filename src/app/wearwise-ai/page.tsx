'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

type Step = 'camera' | 'analyzing' | 'result';

export default function WearwiseAIPage() {
  const router = useRouter();
  const [step, setStep] = useState<Step>('camera');

  // Camera settings
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');

  // Loading analysis state
  const [progress, setProgress] = useState(0);
  const [statusTextIndex, setStatusTextIndex] = useState(0);

  const statusMessages = [
    'Menganalisis warna & kecerahan...',
    'Mengecek komposisi serat kain...',
    'Mendeteksi noda & keretakan jahitan...',
    'Kalkulasi skor sirkularitas...',
  ];

  const handleCapture = () => {
    setStep('analyzing');
  };

  useEffect(() => {
    if (step === 'analyzing') {
      setProgress(0);
      setStatusTextIndex(0);

      const interval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 100) {
            clearInterval(interval);
            setTimeout(() => setStep('result'), 300);
            return 100;
          }
          return prev + 5;
        });
      }, 100);

      const textInterval = setInterval(() => {
        setStatusTextIndex((prev) => (prev + 1) % statusMessages.length);
      }, 600);

      return () => {
        clearInterval(interval);
        clearInterval(textInterval);
      };
    }
  }, [step]);

  return (
    <AppLayout
      title={
        step === 'camera'
          ? 'Wearwise AI — Scan Baju'
          : step === 'analyzing'
          ? 'Analisis AI...'
          : 'Hasil Diagnosis AI'
      }
      showBack
      backHref="/"
    >
      <div className="max-w-2xl mx-auto space-y-4 pb-20 select-none">
        {/* TAHAP 6.1: SCAN CAMERA */}
        {step === 'camera' && (
          <div className="relative bg-slate-900 rounded-3xl h-[480px] overflow-hidden flex flex-col justify-between p-4 shadow-xl border border-slate-800">
            {/* Top Toolbar */}
            <div className="flex items-center justify-between z-10">
              <button
                onClick={() => setFlash(!flash)}
                className={`px-3 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-colors ${
                  flash ? 'bg-amber-400 text-gray-900' : 'bg-white/20 text-white'
                }`}
              >
                <Icon name="SparklesIcon" size={14} />
                Flash: {flash ? 'ON' : 'OFF'}
              </button>

              <button
                onClick={() =>
                  setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                }
                className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30"
              >
                <Icon name="ArrowPathIcon" size={18} />
              </button>
            </div>

            {/* Frame Guide Overlay */}
            <div className="absolute inset-0 flex flex-col items-center justify-center p-8 pointer-events-none">
              <div className="w-64 h-72 border-2 border-dashed border-white/80 rounded-3xl flex items-center justify-center relative shadow-[0_0_0_9999px_rgba(0,0,0,0.5)]">
                <span className="text-white/80 text-xs font-bold bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Posisikan pakaian dalam bingkai
                </span>
              </div>
            </div>

            {/* Bottom Shutter Bar */}
            <div className="z-10 flex items-center justify-between px-4 pb-2">
              <button
                onClick={handleCapture}
                className="text-white text-xs font-semibold hover:underline bg-black/40 px-3 py-2 rounded-xl backdrop-blur-sm"
              >
                🖼️ Upload Galeri
              </button>

              <button
                onClick={handleCapture}
                className="w-16 h-16 rounded-full border-4 border-white bg-red-500 hover:scale-105 active:scale-95 transition-all shadow-lg flex items-center justify-center"
              >
                <div className="w-12 h-12 rounded-full bg-white/30" />
              </button>

              <div className="w-16" />
            </div>
          </div>
        )}

        {/* TAHAP 6.2: LOADING ANALISIS */}
        {step === 'analyzing' && (
          <div className="bg-card rounded-3xl p-8 border border-border shadow-xl text-center space-y-6 min-h-[400px] flex flex-col items-center justify-center">
            {/* Animated Scan Box */}
            <div className="relative w-48 h-48 rounded-2xl bg-slate-100 border-2 border-[#10284D] overflow-hidden flex items-center justify-center shadow-inner">
              <Icon name="ShirtIcon" size={64} className="text-[#10284D]/40" />

              {/* Scanning Laser Line */}
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-blue-500 to-emerald-400 shadow-[0_0_12px_#3B82F6] animate-pulse"
                style={{ top: `${progress}%`, transition: 'top 100ms linear' }}
              />
            </div>

            <div className="space-y-2 max-w-xs">
              <h3 className="text-base font-bold text-foreground">
                {statusMessages[statusTextIndex]}
              </h3>
              <div className="w-full h-3 bg-muted rounded-full overflow-hidden border border-border">
                <div
                  className="h-full bg-[#10284D] rounded-full transition-all duration-100"
                  style={{ width: `${progress}%` }}
                />
              </div>
              <span className="text-xs font-extrabold text-primary block">{progress}%</span>
            </div>
          </div>
        )}

        {/* TAHAP 6.3: HASIL DIAGNOSIS */}
        {step === 'result' && (
          <div className="space-y-4">
            {/* Score Overview Card */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex items-center gap-5">
              {/* Score Circle */}
              <div className="w-20 h-20 rounded-full bg-[#D1FAE5] border-4 border-emerald-400 flex flex-col items-center justify-center flex-shrink-0">
                <span className="text-xl font-extrabold text-[#166534]">72</span>
                <span className="text-[9px] font-bold text-emerald-800">/ 100</span>
              </div>
              <div>
                <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-700 bg-emerald-100 px-2.5 py-0.5 rounded-md">
                  Cukup Baik
                </span>
                <h3 className="text-base font-extrabold text-foreground mt-1">
                  Kemeja Katun Casual
                </h3>
                <p className="text-xs text-muted-foreground mt-0.5">
                  Serat kain 85% katun murni, kelunturan warna 15% di leher
                </p>
              </div>
            </div>

            {/* Detail Parameter Grid */}
            <div className="grid grid-cols-2 gap-3">
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold block">Kebersihan</span>
                <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">90/100 (Bersih)</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold block">Kelunturan Warna</span>
                <span className="text-sm font-extrabold text-amber-600 block mt-0.5">70/100 (Ringan)</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold block">Kondisi Serat</span>
                <span className="text-sm font-extrabold text-emerald-600 block mt-0.5">85/100 (Kuat)</span>
              </div>
              <div className="bg-card p-3.5 rounded-2xl border border-border shadow-sm">
                <span className="text-[10px] text-muted-foreground font-semibold block">Kerusakan Jahitan</span>
                <span className="text-sm font-extrabold text-amber-600 block mt-0.5">Sobek Kelim 4cm</span>
              </div>
            </div>

            {/* Rekomendasi AI */}
            <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2">
              <h4 className="text-xs font-bold text-[#E8C547] uppercase tracking-wider">
                💡 Rekomendasi AI Klámbi
              </h4>
              <p className="text-xs text-white/90 leading-relaxed">
                Pakaian ini masih sangat layak pakai! Disarankan untuk mencuci dengan deterjen lembut
                tanpa pemutih, serta membawa ke tukang permak untuk merapikan jahitan kelim bawah.
              </p>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => router.push('/rawat')}
                className="bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                📖 Lihat Cara Rawat
              </button>

              <button
                onClick={() => router.push('/cari-jasa')}
                className="border-2 border-[#10284D] text-[#10284D] py-3.5 rounded-2xl text-xs font-bold hover:bg-secondary active:scale-95 transition-all"
              >
                🔍 Cari Jasa Terdekat
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
