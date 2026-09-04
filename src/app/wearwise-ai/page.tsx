'use client';

import React, { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import DecisionButtonPair from '@/components/ui/DecisionButtonPair';

type ScanStage = 'camera' | 'analyzing' | 'result';

interface AnalysisStep {
  id: number;
  label: string;
  isComplete: boolean;
}

export default function WearwiseAIPage() {
  const router = useRouter();
  const [stage, setStage] = useState<ScanStage>('camera');

  // Camera settings
  const [flash, setFlash] = useState(false);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Analysis Checklist State (Section 5.2)
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, label: 'Mendeteksi jenis pakaian', isComplete: false },
    { id: 2, label: 'Menganalisis kondisi kain', isComplete: false },
    { id: 3, label: 'Mengevaluasi jahitan', isComplete: false },
    { id: 4, label: 'Menghitung skor dan rekomendasi', isComplete: false },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Clothing item data
  const [itemResult, setItemResult] = useState({
    title: 'Jaket Patchwork Denim Artisan',
    category: 'Outerwear / Jaket',
    fabric: 'Heavy Denim 14oz & Katun Organik',
    score: 88,
    conditionStatus: 'Sangat Baik',
    recommendation: 'jual', // 'jual' | 'rawat'
    recommendationReason: 'Kondisi serat kain sangat prima (skor 88/100). Memiliki potensi nilai jual kembali tinggi di pasar Thrift (Trif) atau Upcycle Kolektor.',
    parameters: {
      kondisiUmum: 'Sangat Baik (Grade A+)',
      noda: 'Bebas noda minyak/kimia (95/100)',
      warna: 'Warna indigo cerah alami (88/100)',
      serat: 'Serat katun padat & kokoh (90/100)',
      kerusakan: 'Tidak ada robekan struktural',
      jahitan: 'Jahitan kelim ganda utuh (94/100)',
      potensi: 'Bernilai jual tinggi di Marketplace Trif (Estimasi: Rp 185.000)',
    },
  });

  const handleCapture = () => {
    setStage('analyzing');
  };

  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
        setStage('analyzing');
      };
      reader.readAsDataURL(file);
    } else {
      setStage('analyzing');
    }
  };

  // Step-by-step sequential analysis animation with 1.2s delay per step
  useEffect(() => {
    if (stage === 'analyzing') {
      let stepIdx = 0;
      setSteps((prev) => prev.map((s) => ({ ...s, isComplete: false })));
      setCurrentStepIndex(0);

      const interval = setInterval(() => {
        if (stepIdx < 4) {
          const currentId = stepIdx + 1;
          setSteps((prev) =>
            prev.map((s) => (s.id === currentId ? { ...s, isComplete: true } : s))
          );
          setCurrentStepIndex(stepIdx + 1);
          stepIdx++;
        } else {
          clearInterval(interval);
          setTimeout(() => {
            setStage('result');
            toast.success('Diagnosis Wearwise AI selesai!');
          }, 800);
        }
      }, 1200);

      return () => clearInterval(interval);
    }
  }, [stage]);

  return (
    <AppLayout
      title={
        stage === 'camera'
          ? 'Wearwise AI — Scan Baju'
          : stage === 'analyzing'
          ? 'Memproses Analisis...'
          : 'Hasil Diagnosis Pakaian'
      }
      showBack
      backHref="/"
    >
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* ========================================================================= */}
        {/* 5.2 LAYAR SCAN — WEARWISE AI (Pixel Perfect Image 4) */}
        {/* ========================================================================= */}
        {stage === 'camera' && (
          <div className="space-y-3">
            <div className="relative bg-slate-950 rounded-3xl h-[490px] overflow-hidden flex flex-col justify-between p-4 shadow-2xl border border-slate-800">
              {/* Top Toolbar */}
              <div className="flex items-center justify-between z-20">
                <button
                  onClick={() => setFlash(!flash)}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    flash
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : 'bg-white/20 text-white backdrop-blur-md'
                  }`}
                >
                  <Icon name="SparklesIcon" size={14} />
                  <span>Flash: {flash ? 'ON' : 'OFF'}</span>
                </button>

                <div className="bg-black/40 text-white/90 px-3 py-1 rounded-full text-[11px] font-bold backdrop-blur-md">
                  ✨ Wearwise Vision AI
                </div>

                <button
                  onClick={() =>
                    setFacingMode((prev) => (prev === 'user' ? 'environment' : 'user'))
                  }
                  className="w-9 h-9 rounded-full bg-white/20 text-white flex items-center justify-center hover:bg-white/30 backdrop-blur-md"
                >
                  <Icon name="ArrowPathIcon" size={18} />
                </button>
              </div>

              {/* Viewport Frame with Rounded Masking & Target Box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none">
                {/* Visual Garment Mockup Placeholder */}
                <div className="w-64 h-80 border-2 border-dashed border-cyan-300/80 rounded-3xl flex flex-col items-center justify-center relative shadow-[0_0_0_9999px_rgba(11,37,69,0.55)]">
                  <span className="text-4xl mb-2 filter drop-shadow-md">🧥</span>
                  <span className="text-white text-xs font-extrabold bg-[#10284D]/90 px-3.5 py-1.5 rounded-full backdrop-blur-sm shadow-md text-center">
                    Posisikan pakaian di dalam kotak
                  </span>

                  {/* Corner Accent Guides */}
                  <div className="absolute -top-1 -left-1 w-4 h-4 border-t-2 border-l-2 border-white rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-4 h-4 border-t-2 border-r-2 border-white rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-4 h-4 border-b-2 border-l-2 border-white rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-4 h-4 border-b-2 border-r-2 border-white rounded-br" />
                </div>
              </div>

              {/* Bottom Camera Controls Bar (Gallery, Big Shutter, Flash) */}
              <div className="z-20 flex items-center justify-between px-3 pb-2 pt-4 bg-gradient-to-t from-black/80 via-black/40 to-transparent">
                {/* Gallery File Upload */}
                <label className="cursor-pointer text-white text-xs font-bold bg-white/15 hover:bg-white/25 px-3.5 py-2.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95">
                  <span>🖼️ Galeri</span>
                  <input
                    type="file"
                    accept="image/*"
                    onChange={handleGalleryUpload}
                    className="hidden"
                  />
                </label>

                {/* Big Capture Shutter Button */}
                <button
                  onClick={handleCapture}
                  className="w-18 h-18 rounded-full border-4 border-white bg-gradient-to-tr from-cyan-400 to-[#10284D] hover:scale-105 active:scale-95 transition-all shadow-xl flex items-center justify-center relative group"
                  aria-label="Ambil Foto & Scan"
                >
                  <div className="w-13 h-13 rounded-full bg-white/90 group-hover:bg-white transition-colors" />
                </button>

                {/* Flash/Tips Toggle Button */}
                <button
                  onClick={() => toast.info('Pastikan pencahayaan cukup dan pakaian dibentangkan rata.')}
                  className="text-white text-xs font-bold bg-white/15 hover:bg-white/25 px-3.5 py-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95"
                >
                  💡 Tips Foto
                </button>
              </div>
            </div>

            <p className="text-center text-xs text-muted-foreground">
              Arahkan kamera ke pakaian secara utuh untuk mendeteksi serat, jahitan, dan noda.
            </p>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5.2 PROSES ANALISIS BERTALAP (Pixel Perfect Image 4 Overlay) */}
        {/* ========================================================================= */}
        {stage === 'analyzing' && (
          <div className="space-y-4">
            {/* Camera View Freeze with Dark Overlay */}
            <div className="relative bg-slate-900 rounded-3xl h-[490px] overflow-hidden flex flex-col justify-between p-5 shadow-2xl border border-slate-800">
              {/* Background Mockup Image */}
              <div className="absolute inset-0 bg-gradient-to-b from-[#10284D]/70 via-[#10284D]/85 to-[#0B2545] flex items-center justify-center">
                <span className="text-7xl opacity-40 filter blur-xs">🧥</span>
              </div>

              {/* Scanning Laser Line */}
              <div
                className="absolute inset-x-0 h-1 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 shadow-[0_0_15px_#22D3EE] transition-all duration-700 animate-pulse"
                style={{ top: `${(currentStepIndex / 4) * 80 + 10}%` }}
              />

              {/* Title & Status */}
              <div className="relative z-10 text-center space-y-1">
                <span className="bg-[#E86D50] text-white text-[10px] font-black px-3 py-1 rounded-full uppercase tracking-wider animate-pulse inline-block shadow-md">
                  Scanning...
                </span>
                <h2 className="text-lg font-extrabold text-white">Kenali Kondisi Pakaianmu</h2>
              </div>

              {/* Floating White Card "PROSES ANALISIS" (Exact Image 4 Specification) */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white space-y-3.5 text-slate-800 max-w-sm mx-auto w-full">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#10284D]">
                    PROSES ANALISIS
                  </h3>
                  <span className="text-[10px] font-bold text-cyan-700 bg-cyan-50 px-2 py-0.5 rounded-full">
                    Step {currentStepIndex}/4
                  </span>
                </div>

                {/* 4 Checklist Steps */}
                <div className="space-y-2.5">
                  {steps.map((step) => (
                    <div
                      key={step.id}
                      className="flex items-center gap-3 text-xs font-bold transition-all"
                    >
                      {step.isComplete ? (
                        <div className="w-5 h-5 rounded-full bg-emerald-500 text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-scale-in">
                          <Icon name="CheckIcon" size={12} />
                        </div>
                      ) : (
                        <div className="w-5 h-5 rounded-full border-2 border-gray-300 flex items-center justify-center flex-shrink-0">
                          <div className="w-2 h-2 rounded-full bg-gray-300" />
                        </div>
                      )}
                      <span
                        className={
                          step.isComplete
                            ? 'text-slate-900 font-extrabold'
                            : 'text-slate-400 font-medium'
                        }
                      >
                        {step.label}
                      </span>
                    </div>
                  ))}
                </div>

                {/* Small Note: Analisis biasanya memakan waktu 30 detik */}
                <div className="pt-2 border-t border-gray-100 flex items-center justify-between text-[11px] text-gray-500">
                  <span>⏱️ Analisis biasanya memakan waktu 30 detik</span>
                  <div className="w-4 h-4 border-2 border-[#10284D] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>

              {/* Bottom camera bar placeholder */}
              <div className="relative z-10 text-center">
                <span className="text-[11px] text-white/70">
                  AI sedang memindai mikroskopis serat kain & pola jahitan...
                </span>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5.3 HASIL ANALISIS (CLOTHING CONDITION ASSESSMENT) */}
        {/* ========================================================================= */}
        {stage === 'result' && (
          <div className="space-y-4 animate-scale-in">
            {/* Score Ring & Overview Header Card */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex items-center gap-4">
              {/* Circular Score Badge */}
              <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-[#0B2545] to-[#163768] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md border-2 border-cyan-400/40">
                <span className="text-2xl font-black text-white">{itemResult.score}</span>
                <span className="text-[9px] font-extrabold text-cyan-200 uppercase tracking-wider">
                  Skor Serat
                </span>
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2">
                  <span className="text-[10px] font-extrabold bg-[#D1FAE5] text-[#166534] px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                    {itemResult.conditionStatus}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{itemResult.category}</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#10284D] truncate">
                  {itemResult.title}
                </h3>
                <p className="text-xs text-muted-foreground">
                  🌿 <strong>Bahan:</strong> {itemResult.fabric}
                </p>
              </div>
            </div>

            {/* 7 Parameter Hasil Scan (Section 5.3 Specification) */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#10284D] uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <span>🔍 Parameter Evaluasi Kain & Serat</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">1. Kondisi Umum</span>
                  <span className="font-extrabold text-slate-800">{itemResult.parameters.kondisiUmum}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">2. Noda & Kebersihan</span>
                  <span className="font-extrabold text-emerald-700">{itemResult.parameters.noda}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">3. Kecerahan Warna</span>
                  <span className="font-extrabold text-slate-800">{itemResult.parameters.warna}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">4. Integritas Serat Kain</span>
                  <span className="font-extrabold text-emerald-700">{itemResult.parameters.serat}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">5. Kerusakan & Lubang</span>
                  <span className="font-extrabold text-emerald-700">{itemResult.parameters.kerusakan}</span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">6. Kualitas Jahitan & Kelim</span>
                  <span className="font-extrabold text-slate-800">{itemResult.parameters.jahitan}</span>
                </div>
              </div>

              <div className="bg-emerald-50/80 p-3.5 rounded-2xl border border-emerald-200 text-emerald-950 text-xs">
                <span className="text-[10px] font-black uppercase tracking-wider text-emerald-800 block mb-0.5">
                  7. Potensi Sirkular
                </span>
                <p className="font-bold">{itemResult.parameters.potensi}</p>
              </div>
            </div>

            {/* Rekomendasi AI Box */}
            <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2">
              <div className="flex items-center gap-2 text-[#E8C547] text-xs font-black uppercase tracking-wider">
                <span>💡 KESIMPULAN REKOMENDASI AI: DIJUAL (TRIF)</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {itemResult.recommendationReason}
              </p>
            </div>

            {/* WAJIB: 2 Tombol Global Sesuai Prinsip UX (Bagian 1 & 5.3) */}
            <DecisionButtonPair
              continueText="Lanjutkan Rekomendasi Jual →"
              continueHref="/jual"
              backText="← Ubah Keputusan (Pilih Manual)"
              backHref="/keputusan"
            />
          </div>
        )}
      </div>
    </AppLayout>
  );
}
