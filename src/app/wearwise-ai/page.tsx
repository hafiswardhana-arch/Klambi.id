'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import SignatureCircularMotion from '@/components/ui/SignatureCircularMotion';

type ScanStage = 'camera' | 'analyzing' | 'result';
type CameraStatus = 'idle' | 'requesting' | 'active' | 'error';
type ActionType = 'care' | 'alter' | 'sell' | 'circulate';

interface AnalysisStep {
  id: number;
  label: string;
  isComplete: boolean;
  iconName: string;
}

export default function WearwiseAIPage() {
  const router = useRouter();
  const [stage, setStage] = useState<ScanStage>('camera');

  // Real Camera Hardware State
  const videoRef = useRef<HTMLVideoElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const streamRef = useRef<MediaStream | null>(null);

  const [cameraStatus, setCameraStatus] = useState<CameraStatus>('idle');
  const [cameraError, setCameraError] = useState<string | null>(null);
  const [facingMode, setFacingMode] = useState<'user' | 'environment'>('environment');
  const [hasMultipleCameras, setHasMultipleCameras] = useState(true);
  const [flash, setFlash] = useState(false);
  const [torchSupported, setTorchSupported] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // PRD Section 9: Motion State Machine & Blueprint Timings
  const [isObjectLocked, setIsObjectLocked] = useState(false);
  const [isScanLineActive, setIsScanLineActive] = useState(false);
  const [isCompletionPhase, setIsCompletionPhase] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionType>('sell');

  // Default preview fallback image matching Image 3 in PRD Appendix B
  const DEFAULT_JACKET_IMAGE =
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80';

  // Analysis Checklist State (PRD Section 8 AN-08 & Appendix B Image 3)
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, label: 'Mendeteksi jenis pakaian', isComplete: false, iconName: 'ViewfinderCircleIcon' },
    { id: 2, label: 'Menganalisis kondisi kain', isComplete: false, iconName: 'SparklesIcon' },
    { id: 3, label: 'Mengevaluasi jahitan', isComplete: false, iconName: 'ArrowPathIcon' },
    { id: 4, label: 'Menghitung skor dan rekomendasi', isComplete: false, iconName: 'CheckBadgeIcon' },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Clothing item analysis authoritative data
  const itemResult = {
    title: 'Vintage Retro Tracktop Jacket',
    category: 'Outerwear / Jaket',
    fabric: 'Polyester Twill & Cotton Blend',
    score: 88,
    conditionStatus: 'Sangat Baik',
    recommendation: 'jual',
    recommendationReason:
      'Kondisi serat kain sangat prima (skor 88/100) dengan kelim jahitan utuh. Memiliki potensi nilai jual kembali tinggi di pasar Thrift (Trif) atau koleksi kurasi vintage.',
    parameters: {
      kondisiUmum: 'Sangat Baik (Grade A+)',
      noda: 'Noda debu ringan terangkat (92/100)',
      warna: 'Warna putih gading & strip merah cerah (88/100)',
      serat: 'Serat kain padat & elastis (90/100)',
      kerusakan: 'Tidak ada lubang struktural',
      jahitan: 'Jahitan kelim & resleting YKK utuh (94/100)',
      potensi: 'Bernilai jual tinggi di Marketplace Trif (Estimasi: Rp 185.000)',
    },
  };

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  // Stop camera tracks helper
  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize and start live camera hardware
  const startCamera = useCallback(
    async (mode: 'user' | 'environment', targetDeviceId?: string | null) => {
      stopCameraTracks();
      setCameraStatus('requesting');
      setCameraError(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('error');
        setCameraError('Browser tidak mendukung akses kamera langsung. Menampilkan mode demo foto.');
        return;
      }

      let stream: MediaStream | null = null;

      // Strategy 1: Specific deviceId
      if (targetDeviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: targetDeviceId },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: { deviceId: targetDeviceId },
              audio: false,
            });
          } catch {
            stream = null;
          }
        }
      }

      // Strategy 2: Exact facingMode
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { exact: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // fallback
        }
      }

      // Strategy 3: Ideal facingMode
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              facingMode: { ideal: mode },
              width: { ideal: 1280 },
              height: { ideal: 720 },
            },
            audio: false,
          });
        } catch {
          // fallback
        }
      }

      // Strategy 4: Fallback basic video
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err: unknown) {
          console.error('Camera access error:', err);
          setCameraStatus('error');
          setCameraError('Izin kamera tidak diberikan. Menggunakan visual pratinjau pakaian.');
          return;
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
          };
        }
        setCameraStatus('active');

        // Check torch support
        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          try {
            const capabilities = (videoTrack.getCapabilities?.() || {}) as { torch?: boolean };
            setTorchSupported(Boolean(capabilities.torch));
          } catch {
            setTorchSupported(false);
          }
        }
      }
    },
    [stopCameraTracks]
  );

  // Switch camera between rear and front
  const handleSwitchCamera = useCallback(async () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);

    if (availableCameras.length > 1) {
      const targetKeywords = nextMode === 'environment' ? ['back', 'rear', 'environment'] : ['front', 'user', 'selfie'];
      const targetCam = availableCameras.find((cam) =>
        targetKeywords.some((keyword) => cam.label.toLowerCase().includes(keyword))
      );
      if (targetCam) {
        setActiveDeviceId(targetCam.deviceId);
        await startCamera(nextMode, targetCam.deviceId);
        return;
      }
    }

    await startCamera(nextMode);
  }, [facingMode, availableCameras, startCamera]);

  // Toggle flash
  const handleToggleFlash = useCallback(() => {
    if (streamRef.current && torchSupported) {
      const track = streamRef.current.getVideoTracks()[0];
      const nextFlash = !flash;
      // eslint-disable-next-line @typescript-eslint/no-explicit-any
      track.applyConstraints({ advanced: [{ torch: nextFlash }] as any }).catch(() => {});
      setFlash(nextFlash);
    } else {
      setFlash(!flash);
    }
  }, [flash, torchSupported]);

  // Enumerate cameras
  useEffect(() => {
    const detectCameras = async () => {
      if (navigator.mediaDevices?.enumerateDevices) {
        try {
          const devices = await navigator.mediaDevices.enumerateDevices();
          const videoDevices = devices.filter((d) => d.kind === 'videoinput');
          setAvailableCameras(videoDevices);
          setHasMultipleCameras(videoDevices.length > 1);
        } catch {
          // ignore
        }
      }
    };
    detectCameras();
  }, []);

  // Camera start on mount
  useEffect(() => {
    if (stage === 'camera') {
      startCamera(facingMode);
    } else {
      stopCameraTracks();
    }

    return () => {
      stopCameraTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Capture frame from live video or use default preview
  const handleCapture = () => {
    if (videoRef.current && cameraStatus === 'active') {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(dataUrl);
      }
    } else {
      // Fallback to sample image from Image 3
      setSelectedImage(DEFAULT_JACKET_IMAGE);
    }

    stopCameraTracks();
    startAnalysisSequence();
  };

  // Start analysis sequence following Section 9 Blueprint
  const startAnalysisSequence = () => {
    setStage('analyzing');
    setIsObjectLocked(false);
    setIsScanLineActive(false);
    setIsCompletionPhase(false);
    setCurrentStepIndex(0);
    setSteps((prev) => prev.map((s) => ({ ...s, isComplete: false })));

    // T+0.3s: Object Lock (PRD Blueprint: corner draw + opacity pulse)
    setTimeout(() => {
      setIsObjectLocked(true);
    }, 300);

    // T+0.7s: AI Scan Line active (PRD Blueprint: vertical sweep)
    setTimeout(() => {
      setIsScanLineActive(true);
    }, 700);

    // T+1.5s: Step 1 complete (Mendeteksi jenis pakaian)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 1 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(1);
    }, 1500);

    // T+3.0s: Step 2 complete (Menganalisis kondisi kain)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 2 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(2);
    }, 3000);

    // T+4.5s: Step 3 complete (Mengevaluasi jahitan)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 3 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(3);
    }, 4500);

    // T+5.8s: Step 4 complete (Menghitung skor dan rekomendasi)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 4 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(4);
    }, 5800);

    // T+6.3s: Completion Phase (PRD Section 9.2: Signature Circular Infinity Motion)
    setTimeout(() => {
      setIsCompletionPhase(true);
      toast.success('Pemeriksaan AI Selesai!');
    }, 6300);

    // T+7.2s: Transition to Result screen with score counter reveal
    setTimeout(() => {
      setStage('result');
    }, 7400);
  };

  // Handle gallery file upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
        stopCameraTracks();
        startAnalysisSequence();
        toast.success('Foto pakaian dari galeri berhasil dimuat.');
      };
      reader.readAsDataURL(file);
    }
  };

  // PRD AN-10: Numeric Score count-up animation on Result load (0 -> 88 over 1200ms, Ease Out)
  useEffect(() => {
    if (stage === 'result') {
      const targetScore = itemResult.score; // 88
      const stepsCount = 36;
      const duration = 1200;
      const intervalTime = duration / stepsCount;
      let currentStep = 0;

      const timer = setInterval(() => {
        currentStep++;
        const factor = currentStep / stepsCount;
        const easeFactor = 1 - Math.pow(1 - factor, 3);
        setAnimatedScore(Math.round(targetScore * easeFactor));

        if (currentStep >= stepsCount) {
          clearInterval(timer);
        }
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [stage, itemResult.score]);

  return (
    <AppLayout
      title="Kenali Kondisi Pakaianmu"
      showBack
      backHref="/"
      headerRight={
        <button
          onClick={() => toast.info('Fitur: Pengaturan Kalibrasi Wearwise AI Vision 2026')}
          className="w-9 h-9 flex items-center justify-center rounded-xl text-[#10284D] hover:bg-slate-100 active:scale-95 transition-all"
          aria-label="Pengaturan"
        >
          <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
            <circle cx="12" cy="5" r="2" />
            <circle cx="12" cy="12" r="2" />
            <circle cx="12" cy="19" r="2" />
          </svg>
        </button>
      }
    >
      {/* Hidden canvas for capturing frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-md mx-auto space-y-4 pb-24 select-none font-sans">
        {/* ========================================================================= */}
        {/* STAGE 1 & 2: SCANNING & ANALYZING VIEW (PIXEL PERFECT IMAGE 3 & BLUEPRINT) */}
        {/* ========================================================================= */}
        {stage !== 'result' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1. CLOTHING PREVIEW FRAME WITH SCANLINE & CORNER LOCK GUIDES */}
            <div className="relative bg-slate-900 rounded-3xl h-[260px] sm:h-[280px] overflow-hidden shadow-md border-2 border-slate-200/80 transition-transform duration-300">
              {/* Media Display: Live Video or Captured/Sample Image */}
              {stage === 'camera' && cameraStatus === 'active' ? (
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover transition-transform duration-300 ${
                    facingMode === 'user' ? 'scale-x-[-1]' : ''
                  } ${flash ? 'brightness-125 contrast-105' : ''}`}
                />
              ) : (
                <div className="relative w-full h-full overflow-hidden bg-slate-100">
                  <Image
                    src={selectedImage || DEFAULT_JACKET_IMAGE}
                    alt="Pakaian yang di-scan"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {/* Subtle darkening overlay during active scanning */}
                  {stage === 'analyzing' && <div className="absolute inset-0 bg-[#10284D]/25" />}
                </div>
              )}

              {/* Corner Lock Brackets (PRD Blueprint T+0.3s) */}
              <div
                className={`absolute inset-4 pointer-events-none transition-opacity duration-300 ${
                  isObjectLocked || stage === 'camera' ? 'opacity-100 animate-corner-lock' : 'opacity-40'
                }`}
              >
                <div className="absolute top-0 left-0 w-6 h-6 border-t-3 border-l-3 border-cyan-400 rounded-tl-md shadow-sm" />
                <div className="absolute top-0 right-0 w-6 h-6 border-t-3 border-r-3 border-cyan-400 rounded-tr-md shadow-sm" />
                <div className="absolute bottom-0 left-0 w-6 h-6 border-b-3 border-l-3 border-cyan-400 rounded-bl-md shadow-sm" />
                <div className="absolute bottom-0 right-0 w-6 h-6 border-b-3 border-r-3 border-cyan-400 rounded-br-md shadow-sm" />
              </div>

              {/* Horizontal Moving Scan Laser Line (PRD AN-07: Translate Y + pulse) */}
              {(isScanLineActive || stage === 'analyzing') && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-[#10284D] to-transparent shadow-[0_0_12px_#3A7BF7] animate-scan-laser z-20 pointer-events-none" />
              )}

              {/* Top Status Capsule */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/50 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[10px] font-bold">
                <span className={`w-2 h-2 rounded-full ${stage === 'analyzing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>{stage === 'analyzing' ? 'AI Vision Active' : 'Sensor Ready'}</span>
              </div>
            </div>

            {/* Label below preview frame: "Scanning..." (PRD Image 3) */}
            <div className="text-center pt-0.5">
              <h3 className="text-base font-extrabold text-[#10284D] tracking-tight">
                {isCompletionPhase ? 'Analysis Complete 🎉' : stage === 'analyzing' ? 'Scanning...' : 'Siap Dianalisis'}
              </h3>
            </div>

            {/* 2. FLOATING WHITE CARD: "PROSES ANALISIS" (PIXEL PERFECT IMAGE 3) */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-3.5 relative overflow-hidden">
              {/* Top Navy Badge Pill */}
              <div className="flex items-center justify-between">
                <span className="bg-[#10284D] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  PROSES ANALISIS
                </span>
                <span className="text-[11px] font-extrabold text-[#3A7BF7]">
                  {currentStepIndex}/4 Selesai
                </span>
              </div>

              {/* Signature Circular Motion Reveal on Completion (PRD Section 9.2) */}
              {isCompletionPhase ? (
                <div className="py-4 flex flex-col items-center justify-center animate-checkmark-reveal">
                  <SignatureCircularMotion size="md" showCheckmark={true} />
                  <p className="text-xs font-black text-[#10284D] mt-3">
                    Analisis Kondisi Pakaian Sempurna!
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Membuka ringkasan skor dan 4 rekomendasi sirkular...
                  </p>
                </div>
              ) : (
                /* 4 Progressive Checklist Steps (PRD AN-08) */
                <div className="space-y-3 pt-1">
                  {steps.map((step) => {
                    const isDone = step.isComplete;
                    const isCurrent = currentStepIndex + 1 === step.id && stage === 'analyzing';

                    return (
                      <div
                        key={step.id}
                        className={`flex items-center justify-between text-xs transition-all duration-300 ${
                          isDone
                            ? 'text-[#2F9E67] font-extrabold'
                            : isCurrent
                            ? 'text-[#10284D] font-extrabold scale-102'
                            : 'text-slate-400 font-medium'
                        }`}
                      >
                        <div className="flex items-center gap-3">
                          {/* Step Leading Icon matching Image 3 */}
                          <div
                            className={`w-6 h-6 rounded-full flex items-center justify-center transition-colors ${
                              isDone
                                ? 'bg-emerald-50 text-emerald-600'
                                : isCurrent
                                ? 'bg-blue-50 text-[#10284D] animate-pulse'
                                : 'text-slate-300'
                            }`}
                          >
                            <Icon name={step.iconName} size={16} />
                          </div>
                          <span>{step.label}</span>
                        </div>

                        {/* Trailing Green Checkmark when complete */}
                        {isDone ? (
                          <div className="w-5 h-5 rounded-full bg-[#2F9E67] text-white flex items-center justify-center flex-shrink-0 shadow-xs animate-scale-in">
                            <svg className="w-3 h-3" fill="none" viewBox="0 0 24 24" stroke="currentColor" strokeWidth={3}>
                              <path strokeLinecap="round" strokeLinejoin="round" d="M5 13l4 4L19 7" />
                            </svg>
                          </div>
                        ) : isCurrent ? (
                          <div className="w-4 h-4 border-2 border-[#10284D] border-t-transparent rounded-full animate-spin" />
                        ) : (
                          <div className="w-4 h-4 rounded-full border border-slate-200" />
                        )}
                      </div>
                    );
                  })}
                </div>
              )}

              {/* Bottom Note: "Analisis biasanya memakan waktu 30 detik" (PRD Image 3) */}
              <div className="pt-2 border-t border-slate-100 text-center">
                <p className="text-[11px] text-muted-foreground font-medium">
                  Analisis biasanya memakan waktu 30 detik
                </p>
              </div>
            </div>

            {/* 3. BOTTOM CONTROL ROW (GALLERY, PROMINENT SHUTTER, FLASH - PIXEL PERFECT IMAGE 3) */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Left Gallery Icon Button */}
              <label
                className="w-14 h-14 rounded-full bg-[#10284D] text-white flex items-center justify-center shadow-lg hover:bg-[#163768] active:scale-[0.97] transition-all cursor-pointer border border-white/20"
                title="Pilih dari Galeri"
              >
                <Icon name="PhotoIcon" size={22} className="text-white" />
                <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>

              {/* Center Prominent QR / Shutter Button (Double Ring matching Image 3) */}
              <button
                onClick={handleCapture}
                disabled={stage === 'analyzing'}
                className="w-20 h-20 rounded-full bg-[#10284D] border-4 border-cyan-400/80 p-1 flex items-center justify-center shadow-xl hover:scale-105 active:scale-95 transition-all disabled:opacity-75 relative group"
                aria-label="Mulai Scan Pakaian"
              >
                <div className="w-full h-full rounded-full border-2 border-white/40 flex items-center justify-center bg-gradient-to-tr from-[#0C2952] to-[#1E4D8A]">
                  {stage === 'analyzing' ? (
                    <div className="w-6 h-6 border-3 border-white border-t-transparent rounded-full animate-spin" />
                  ) : (
                    <Icon name="QrCodeIcon" size={28} className="text-white" />
                  )}
                </div>
              </button>

              {/* Right Flash Icon Button */}
              <button
                onClick={handleToggleFlash}
                className={`w-14 h-14 rounded-full flex items-center justify-center shadow-lg active:scale-[0.97] transition-all border border-white/20 ${
                  flash
                    ? 'bg-amber-400 text-slate-900 shadow-amber-300/40'
                    : 'bg-[#10284D] text-white hover:bg-[#163768]'
                }`}
                title="Toggle Lampu Flash"
                aria-label="Flashlight"
              >
                <Icon name="BoltIcon" size={22} className={flash ? 'text-slate-900' : 'text-white'} />
              </button>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* STAGE 3: RESULT SCREEN (SCORE COUNTER + STAGGERED DECISION CARDS) */}
        {/* ========================================================================= */}
        {stage === 'result' && (
          <div className="space-y-4 animate-scale-in">
            {/* Top Score Banner with AN-10 Count-Up Animation */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex items-center gap-4">
              {/* Circular Score Badge with Count-Up */}
              <div className="w-20 h-20 rounded-3xl bg-gradient-to-br from-[#0B2545] to-[#163768] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md border-2 border-cyan-400/50">
                <span className="text-2xl font-black text-white font-tabular">{animatedScore}</span>
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

            {/* AI Diagnosis Reason Card */}
            <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2 animate-card-reveal stagger-1">
              <div className="flex items-center gap-2 text-[#E8C547] text-xs font-black uppercase tracking-wider">
                <span>💡 KESIMPULAN REKOMENDASI AI: DIJUAL (TRIF)</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {itemResult.recommendationReason}
              </p>
            </div>

            {/* 4 STAGGERED ACTION CARDS: CARE / ALTER / SELL / CIRCULATE (PRD AN-11) */}
            <div className="space-y-2.5">
              <div className="flex items-center justify-between px-1">
                <h4 className="text-xs font-extrabold text-[#10284D] uppercase tracking-wider">
                  PILIH TINDAKAN SIRKULAR (DECISION LAYER):
                </h4>
                <span className="text-[10px] text-muted-foreground">Pilih salah satu</span>
              </div>

              <div className="grid grid-cols-2 gap-3">
                {/* 1. RAWAT (CARE) */}
                <div
                  onClick={() => setSelectedAction('care')}
                  className={`p-3.5 rounded-3xl border cursor-pointer transition-all duration-200 active:scale-[0.97] animate-card-reveal stagger-1 ${
                    selectedAction === 'care'
                      ? 'bg-rose-50 border-rose-300 shadow-md ring-2 ring-rose-400'
                      : 'bg-card border-border hover:border-rose-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🧼</span>
                    <span className="text-xs font-black text-rose-950">Rawat (Care)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Pembersihan noda & perawatan deep cleaning serat.
                  </p>
                </div>

                {/* 2. PERMAK (ALTER) */}
                <div
                  onClick={() => setSelectedAction('alter')}
                  className={`p-3.5 rounded-3xl border cursor-pointer transition-all duration-200 active:scale-[0.97] animate-card-reveal stagger-2 ${
                    selectedAction === 'alter'
                      ? 'bg-amber-50 border-amber-300 shadow-md ring-2 ring-amber-400'
                      : 'bg-card border-border hover:border-amber-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">✂️</span>
                    <span className="text-xs font-black text-amber-950">Permak (Alter)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Potong kelim, ubah ukuran, atau restyle modern.
                  </p>
                </div>

                {/* 3. JUAL (SELL - RECOMMENDED) */}
                <div
                  onClick={() => setSelectedAction('sell')}
                  className={`p-3.5 rounded-3xl border cursor-pointer transition-all duration-200 active:scale-[0.97] animate-card-reveal stagger-3 relative ${
                    selectedAction === 'sell'
                      ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-500'
                      : 'bg-card border-border hover:border-emerald-200'
                  }`}
                >
                  <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                    Rekomendasi AI
                  </span>
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🏷️</span>
                    <span className="text-xs font-black text-emerald-950">Jual (Sell)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Jual langsung ke pembeli di Thrift Marketplace.
                  </p>
                </div>

                {/* 4. SIRKULASIKAN (CIRCULATE) */}
                <div
                  onClick={() => setSelectedAction('circulate')}
                  className={`p-3.5 rounded-3xl border cursor-pointer transition-all duration-200 active:scale-[0.97] animate-card-reveal stagger-4 ${
                    selectedAction === 'circulate'
                      ? 'bg-blue-50 border-blue-300 shadow-md ring-2 ring-blue-400'
                      : 'bg-card border-border hover:border-blue-200'
                  }`}
                >
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">♻️</span>
                    <span className="text-xs font-black text-blue-950">Sirkulasikan</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Daur ulang serat tekstil & peroleh Eco-Points.
                  </p>
                </div>
              </div>
            </div>

            {/* Parameter Evaluasi Kain 7 Poin */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3 animate-card-reveal stagger-3">
              <h4 className="text-xs font-black text-[#10284D] uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <span>🔍 Parameter Evaluasi Kain & Serat</span>
              </h4>

              <div className="grid grid-cols-2 gap-2 text-xs">
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-muted-foreground font-semibold block">1. Kondisi Umum</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">{itemResult.parameters.kondisiUmum}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-muted-foreground font-semibold block">2. Noda & Bersih</span>
                  <span className="font-extrabold text-emerald-700 text-[11px]">{itemResult.parameters.noda}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-muted-foreground font-semibold block">3. Kecerahan</span>
                  <span className="font-extrabold text-slate-800 text-[11px]">{itemResult.parameters.warna}</span>
                </div>
                <div className="bg-slate-50 p-2.5 rounded-2xl border border-slate-100">
                  <span className="text-[9px] text-muted-foreground font-semibold block">4. Integritas Serat</span>
                  <span className="font-extrabold text-emerald-700 text-[11px]">{itemResult.parameters.serat}</span>
                </div>
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="space-y-2 pt-2 animate-card-reveal stagger-4">
              <button
                onClick={() => {
                  if (selectedAction === 'care') router.push('/menu-perawatan');
                  else if (selectedAction === 'alter') router.push('/menu-perawatan');
                  else if (selectedAction === 'sell') router.push('/jual/trif');
                  else router.push('/jual/upcycle');
                }}
                className="w-full bg-[#10284D] text-white py-4 rounded-full font-black text-xs uppercase tracking-wider shadow-lg hover:bg-[#163768] active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span>
                  Lanjutkan:{' '}
                  {selectedAction === 'care'
                    ? 'Rawat Pakaian (Care Plan)'
                    : selectedAction === 'alter'
                    ? 'Permak Pakaian (Alteration)'
                    : selectedAction === 'sell'
                    ? 'Jual di Thrift Marketplace'
                    : 'Daur Ulang Sirkular'}
                </span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  setStage('camera');
                  setAnimatedScore(0);
                }}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-full font-bold text-xs hover:bg-slate-200 active:scale-[0.97] transition-all duration-150"
              >
                🔄 Scan Pakaian Lain
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
