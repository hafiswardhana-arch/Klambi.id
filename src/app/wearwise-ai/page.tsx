'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import Modal from '@/components/ui/Modal';
import SignatureCircularMotion from '@/components/ui/SignatureCircularMotion';
import {
  GarmentAssessmentResult,
  UserContextInput,
  CircularActionCategory,
} from '@/lib/ai/types';

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

  // Focus & Positioning Guidance state
  const [showFocusGuidance, setShowFocusGuidance] = useState(false);
  const [guidanceMessage, setGuidanceMessage] = useState('');

  // 2-Source Data: User Context Input Modal state
  const [showContextModal, setShowContextModal] = useState(false);
  const [userContext, setUserContext] = useState<UserContextInput>({
    odour: 'none',
    knownFabric: '',
    usageHistory: '',
    notes: '',
  });

  // Motion State Machine & Timings
  const [isObjectLocked, setIsObjectLocked] = useState(false);
  const [isScanLineActive, setIsScanLineActive] = useState(false);
  const [isCompletionPhase, setIsCompletionPhase] = useState(false);
  const [animatedScore, setAnimatedScore] = useState(0);
  const [selectedAction, setSelectedAction] = useState<ActionType>('sell');

  // Active Assessment Result from DeepSeek Vision API
  const [assessmentResult, setAssessmentResult] = useState<GarmentAssessmentResult | null>(null);
  const [expandedDimension, setExpandedDimension] = useState<string | null>(null);

  // Default preview fallback image
  const DEFAULT_JACKET_IMAGE =
    'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=800&auto=format&fit=crop&q=80';

  // Analysis Checklist State
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, label: 'Mendeteksi pakaian & kejernihan kamera', isComplete: false, iconName: 'ViewfinderCircleIcon' },
    { id: 2, label: 'Menganalisis 7 dimensi kondisi pakaian', isComplete: false, iconName: 'SparklesIcon' },
    { id: 3, label: 'Menghitung Garment Condition Score (GCS)', isComplete: false, iconName: 'ArrowPathIcon' },
    { id: 4, label: 'Menentukan rekomendasi tindakan sirkular', isComplete: false, iconName: 'CheckBadgeIcon' },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

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

      // Strategy 2: exact facingMode
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
          // Strategy 3: loose facingMode
          try {
            stream = await navigator.mediaDevices.getUserMedia({
              video: {
                facingMode: mode,
                width: { ideal: 1280 },
                height: { ideal: 720 },
              },
              audio: false,
            });
          } catch {
            // Strategy 4: fallback any camera
            try {
              stream = await navigator.mediaDevices.getUserMedia({
                video: true,
                audio: false,
              });
            } catch (err: unknown) {
              setCameraStatus('error');
              setCameraError('Izin kamera ditolak atau kamera tidak tersedia.');
              return;
            }
          }
        }
      }

      if (stream) {
        streamRef.current = stream;
        if (videoRef.current) {
          videoRef.current.srcObject = stream;
          videoRef.current.setAttribute('playsinline', 'true');
          videoRef.current.onloadedmetadata = () => {
            videoRef.current?.play().catch(() => {});
            setCameraStatus('active');
          };
          try {
            await videoRef.current.play();
            setCameraStatus('active');
          } catch {
            setCameraStatus('active');
          }
        } else {
          setCameraStatus('active');
        }

        const videoTrack = stream.getVideoTracks()[0];
        if (videoTrack) {
          try {
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  // Keep videoRef in sync with active camera stream
  useEffect(() => {
    if (stage === 'camera' && streamRef.current && videoRef.current) {
      if (videoRef.current.srcObject !== streamRef.current) {
        videoRef.current.srcObject = streamRef.current;
        videoRef.current.play().catch(() => {});
        setCameraStatus('active');
      }
    }
  });

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
    let capturedImage = DEFAULT_JACKET_IMAGE;

    if (videoRef.current && cameraStatus === 'active') {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      
      const MAX_DIM = 1024;
      let width = video.videoWidth || 1280;
      let height = video.videoHeight || 720;

      if (width > MAX_DIM || height > MAX_DIM) {
        if (width > height) {
          height = Math.round((height * MAX_DIM) / width);
          width = MAX_DIM;
        } else {
          width = Math.round((width * MAX_DIM) / height);
          height = MAX_DIM;
        }
      }

      canvas.width = width;
      canvas.height = height;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        if (facingMode === 'user') {
          ctx.translate(width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, width, height);
        capturedImage = canvas.toDataURL('image/jpeg', 0.85);
      }
    } else if (selectedImage) {
      capturedImage = selectedImage;
    }

    setSelectedImage(capturedImage);
    stopCameraTracks();
    processGarmentAnalysis(capturedImage);
  };

  // Handle gallery file upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        const rawBase64 = uploadEvent.target?.result as string;
        // Optimize and compress image through canvas to keep payload fast and light
        const img = document.createElement('img');
        img.onload = () => {
          const canvas = document.createElement('canvas');
          const MAX_DIM = 1024;
          let width = img.width;
          let height = img.height;
          if (width > MAX_DIM || height > MAX_DIM) {
            if (width > height) {
              height = Math.round((height * MAX_DIM) / width);
              width = MAX_DIM;
            } else {
              width = Math.round((width * MAX_DIM) / height);
              height = MAX_DIM;
            }
          }
          canvas.width = width;
          canvas.height = height;
          const ctx = canvas.getContext('2d');
          if (ctx) {
            ctx.drawImage(img, 0, 0, width, height);
            const optimizedBase64 = canvas.toDataURL('image/jpeg', 0.85);
            setSelectedImage(optimizedBase64);
            stopCameraTracks();
            processGarmentAnalysis(optimizedBase64);
            toast.success('Foto pakaian dari galeri berhasil dimuat.');
            return;
          }
          setSelectedImage(rawBase64);
          stopCameraTracks();
          processGarmentAnalysis(rawBase64);
        };
        img.onerror = () => {
          setSelectedImage(rawBase64);
          stopCameraTracks();
          processGarmentAnalysis(rawBase64);
        };
        img.src = rawBase64;
      };
      reader.readAsDataURL(file);
    }
  };

  /**
   * Run the AI Analysis Pipeline:
   * 1. Trigger visual scanning motion (scanline, corner lock)
   * 2. Send image & user context to /api/ai/scan-garment (with direct DeepSeek client fallback)
   * 3. Handle focus guidance if garment is not detected
   * 4. Transition to result with GCS score & 7 dimensions
   */
  const processGarmentAnalysis = async (imageDataUrl: string) => {
    setStage('analyzing');
    setIsObjectLocked(false);
    setIsScanLineActive(false);
    setIsCompletionPhase(false);
    setCurrentStepIndex(0);
    setSteps((prev) => prev.map((s) => ({ ...s, isComplete: false })));

    // T+0.3s: Object Lock
    setTimeout(() => setIsObjectLocked(true), 300);

    // T+0.7s: AI Scan Line active
    setTimeout(() => setIsScanLineActive(true), 700);

    // Start API request: backend endpoint first, resilient direct DeepSeek fallback if server unavailable
    const apiPromise = (async (): Promise<GarmentAssessmentResult | null> => {
      try {
        const res = await fetch('/api/ai/scan-garment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            userContext,
          }),
        });

        if (res.ok) {
          const json = await res.json();
          if (json.data) {
            return json.data as GarmentAssessmentResult;
          }
        }
        throw new Error(`API endpoint status: ${res.status}`);
      } catch (err) {
        console.warn('Backend API error, attempting direct DeepSeek Vision client call...', err);
        try {
          // Direct client call to DeepSeek Vision API
          const { assessGarmentCondition } = await import('@/lib/ai/garmentAssessment');
          const directResult = await assessGarmentCondition(
            imageDataUrl,
            userContext,
            'sk-9f8205f021df4072908bf9650e5a893d'
          );
          return directResult;
        } catch (directErr) {
          console.error('Direct DeepSeek Vision API call failed, generating fallback:', directErr);
          return null;
        }
      }
    })();

    // Step 1: Detect garment & focus check (T+1.5s)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 1 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(1);
    }, 1500);

    // Step 2: 7 dimensions analysis (T+3.0s)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 2 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(2);
    }, 3000);

    // Step 3: Compute GCS (T+4.5s)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 3 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(3);
    }, 4500);

    // Step 4: Decision Engine (T+5.8s)
    setTimeout(() => {
      setSteps((prev) => prev.map((s) => (s.id === 4 ? { ...s, isComplete: true } : s)));
      setCurrentStepIndex(4);
    }, 5800);

    // Wait for API & minimum animation duration
    const [result] = await Promise.all([
      apiPromise,
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);

    if (!result || result.isGarmentDetected === false) {
      if (result && result.isGarmentDetected === false) {
        // Garment explicitly not detected: trigger Focus Guidance dialog
        setStage('camera');
        setGuidanceMessage(
          result?.focusGuidance ||
            'Pakaian tidak terdeteksi dengan jelas. Harap pastikan pencahayaan cukup, posisikan pakaian rata dan terbentang penuh di permukaan datar atau digantung, dan fokuskan lensa kamera ke area pakaian.'
        );
        setShowFocusGuidance(true);
        toast.warning('Pakaian tidak terdeteksi jelas. Silakan periksa fokus kamera.');
        return;
      }
      
      // If network failure occurred, generate a resilient fallback instead of blocking the user
      toast.error('Koneksi terganggu. Menggunakan diagnosis cerdas Klámbi.');
    }

    // Success: completion phase
    let resolvedResult = result;
    if (!resolvedResult) {
      const { assessGarmentCondition } = await import('@/lib/ai/garmentAssessment');
      resolvedResult = await assessGarmentCondition(imageDataUrl, userContext);
    }

    setAssessmentResult(resolvedResult);

    // Map primary action to selectedAction tab
    const actionKey: ActionType =
      resolvedResult.primaryAction === 'CIRCULATE'
        ? 'sell'
        : resolvedResult.primaryAction === 'CARE'
        ? 'care'
        : resolvedResult.primaryAction === 'ALTER'
        ? 'alter'
        : 'circulate';
    setSelectedAction(actionKey);

    // Persist diagnosis to localStorage for other pages
    try {
      localStorage.setItem('klambi_current_scan', JSON.stringify(resolvedResult));
    } catch {
      // ignore
    }

    setIsCompletionPhase(true);
    toast.success('Pemeriksaan DeepSeek AI 7-Dimensi Selesai!');

    // Transition to Result Screen
    setTimeout(() => {
      setStage('result');
    }, 1200);
  };

  // Score count-up animation on Result load
  useEffect(() => {
    if (stage === 'result' && assessmentResult) {
      const targetScore = assessmentResult.gcsScore;
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
          setAnimatedScore(targetScore);
        }
      }, intervalTime);

      return () => clearInterval(timer);
    }
  }, [stage, assessmentResult]);

  return (
    <AppLayout
      title="Kenali Kondisi Pakaianmu"
      showBack
      backHref="/"
      headerRight={
        <button
          onClick={() => setShowContextModal(true)}
          className="relative flex items-center justify-center px-3 py-1.5 rounded-xl bg-slate-100 hover:bg-slate-200 text-[#10284D] active:scale-95 transition-all text-xs font-bold gap-1"
          title="Input Tambahan Bau & Bahan"
        >
          <span>✨</span>
          <span className="hidden sm:inline">Data Fisik</span>
        </button>
      }
    >
      {/* Hidden canvas for capturing frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-md mx-auto space-y-4 pb-24 select-none font-sans">
        {/* ========================================================================= */}
        {/* STAGE 1 & 2: SCANNING & ANALYZING VIEW */}
        {/* ========================================================================= */}
        {stage !== 'result' && (
          <div className="space-y-4 animate-fade-in">
            {/* 1. CLOTHING PREVIEW FRAME WITH SCANLINE & CORNER LOCK GUIDES */}
            <div className="relative bg-slate-900 rounded-3xl h-[280px] sm:h-[300px] overflow-hidden shadow-md border-2 border-slate-200/80 transition-transform duration-300">
              {/* Media Display: Keep video element mounted in DOM so videoRef remains valid */}
              <video
                ref={videoRef}
                autoPlay
                playsInline
                muted
                className={`w-full h-full object-cover transition-transform duration-300 ${
                  facingMode === 'user' ? 'scale-x-[-1]' : ''
                } ${flash ? 'brightness-125 contrast-105' : ''} ${
                  stage === 'camera' && cameraStatus === 'active' ? 'block' : 'hidden'
                }`}
              />

              {!(stage === 'camera' && cameraStatus === 'active') && (
                <div className="relative w-full h-full overflow-hidden bg-slate-100">
                  <Image
                    src={selectedImage || DEFAULT_JACKET_IMAGE}
                    alt="Pakaian yang di-scan"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  {stage === 'analyzing' && <div className="absolute inset-0 bg-[#10284D]/30" />}
                  {stage === 'camera' && cameraStatus === 'requesting' && (
                    <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 z-10">
                      <div className="w-8 h-8 border-3 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                      <span className="text-xs font-semibold">Mengakses kamera...</span>
                    </div>
                  )}
                  {stage === 'camera' && cameraStatus === 'error' && (
                    <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 p-4 text-center z-10">
                      <Icon name="ExclamationTriangleIcon" size={28} className="text-amber-400" />
                      <span className="text-xs font-semibold">{cameraError || 'Kamera tidak dapat diakses'}</span>
                      <span className="text-[10px] text-white/70">Pilih foto dari galeri dengan tombol di bawah</span>
                    </div>
                  )}
                </div>
              )}

              {/* Corner Lock Brackets & Framing Overlay */}
              <div
                className={`absolute inset-4 pointer-events-none transition-opacity duration-300 ${
                  isObjectLocked || stage === 'camera' ? 'opacity-100 animate-corner-lock' : 'opacity-40'
                }`}
              >
                <div className="absolute top-0 left-0 w-7 h-7 border-t-3 border-l-3 border-cyan-400 rounded-tl-lg shadow-sm" />
                <div className="absolute top-0 right-0 w-7 h-7 border-t-3 border-r-3 border-cyan-400 rounded-tr-lg shadow-sm" />
                <div className="absolute bottom-0 left-0 w-7 h-7 border-b-3 border-l-3 border-cyan-400 rounded-bl-lg shadow-sm" />
                <div className="absolute bottom-0 right-0 w-7 h-7 border-b-3 border-r-3 border-cyan-400 rounded-br-lg shadow-sm" />

                {/* Subtitle guidance inside viewfinder */}
                {stage === 'camera' && (
                  <div className="absolute inset-x-0 bottom-2 text-center">
                    <span className="bg-black/50 backdrop-blur-sm text-white/90 text-[10px] font-semibold px-3 py-1 rounded-full border border-white/20">
                      Posisikan pakaian rata & fokuskan kamera
                    </span>
                  </div>
                )}
              </div>

              {/* Horizontal Moving Scan Laser Line */}
              {(isScanLineActive || stage === 'analyzing') && (
                <div className="absolute inset-x-0 h-1 bg-gradient-to-r from-transparent via-cyan-400 to-transparent shadow-[0_0_14px_#38bdf8] animate-scan-laser z-20 pointer-events-none" />
              )}

              {/* Top Status Capsule */}
              <div className="absolute top-3 left-3 z-20 flex items-center gap-1.5 bg-black/60 backdrop-blur-md px-3 py-1 rounded-full border border-white/20 text-white text-[10px] font-bold">
                <span className={`w-2 h-2 rounded-full ${stage === 'analyzing' ? 'bg-amber-400 animate-ping' : 'bg-emerald-400'}`} />
                <span>{stage === 'analyzing' ? 'DeepSeek Vision AI Active' : 'Kamera Siap'}</span>
              </div>

              {/* Camera Switch Pill (Rear / Front) */}
              {stage === 'camera' && (
                <button
                  onClick={handleSwitchCamera}
                  className="absolute top-3 right-3 z-20 bg-black/60 hover:bg-black/80 backdrop-blur-md p-2 rounded-full border border-white/20 text-white active:scale-90 transition-all"
                  title="Ganti Kamera Depan/Belakang"
                  aria-label="Switch Camera"
                >
                  <Icon name="ArrowPathIcon" size={16} />
                </button>
              )}
            </div>

            {/* Label below preview frame */}
            <div className="text-center pt-0.5">
              <h3 className="text-base font-extrabold text-[#10284D] tracking-tight">
                {isCompletionPhase
                  ? 'Diagnosis Selesai 🎉'
                  : stage === 'analyzing'
                  ? 'Menilai 7 Dimensi Pakaian...'
                  : 'AI Garment Condition Assessment'}
              </h3>
              <p className="text-xs text-muted-foreground mt-0.5">
                {stage === 'analyzing'
                  ? 'Wearwise AI sedang mendiagnosis serat, noda, dan keutuhan pakaian...'
                  : 'Arahkan kamera ke pakaian secara rata & tekan tombol scan.'}
              </p>
            </div>

            {/* User Context Banner Tag (If Provided) */}
            {(userContext.odour !== 'none' || userContext.knownFabric) && (
              <div className="bg-blue-50 border border-blue-200 rounded-2xl px-3.5 py-2 flex items-center justify-between text-xs text-blue-900">
                <div className="flex items-center gap-2">
                  <span>ℹ️</span>
                  <span>
                    Input Fisik: {userContext.knownFabric || 'Bahan umum'} • Bau:{' '}
                    {userContext.odour === 'strong' ? 'Menyengat' : 'Apek'}
                  </span>
                </div>
                <button
                  onClick={() => setShowContextModal(true)}
                  className="text-xs font-bold text-[#10284D] hover:underline"
                >
                  Ubah
                </button>
              </div>
            )}

            {/* 2. FLOATING PROCESS CARD */}
            <div className="bg-white rounded-3xl p-5 shadow-lg border border-slate-100 space-y-3.5 relative overflow-hidden">
              <div className="flex items-center justify-between">
                <span className="bg-[#10284D] text-white text-[10px] font-black px-4 py-1.5 rounded-full uppercase tracking-wider shadow-sm">
                  PROSES DIAGNOSIS
                </span>
                <span className="text-[11px] font-extrabold text-[#3A7BF7]">
                  {currentStepIndex}/4 Selesai
                </span>
              </div>

              {isCompletionPhase ? (
                <div className="py-4 flex flex-col items-center justify-center animate-checkmark-reveal">
                  <SignatureCircularMotion size="md" showCheckmark={true} />
                  <p className="text-xs font-black text-[#10284D] mt-3">
                    Diagnosis Kondisi Pakaian Sempurna!
                  </p>
                  <p className="text-[10px] text-muted-foreground mt-0.5">
                    Membuka Garment Condition Score (GCS) dan rekomendasi sirkular...
                  </p>
                </div>
              ) : (
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

              <div className="pt-2 border-t border-slate-100 flex items-center justify-between text-[11px] text-muted-foreground">
                <span>Model AI: DeepSeek Vision Chat (V3)</span>
                <button
                  onClick={() => setShowContextModal(true)}
                  className="font-bold text-[#10284D] hover:underline flex items-center gap-1"
                >
                  <span>+ Data Bau & Bahan</span>
                </button>
              </div>
            </div>

            {/* 3. BOTTOM CONTROL ROW (GALLERY, PROMINENT SHUTTER, FLASH) */}
            <div className="flex items-center justify-center gap-6 pt-2">
              {/* Left Gallery Icon Button */}
              <label
                className="w-14 h-14 rounded-full bg-[#10284D] text-white flex items-center justify-center shadow-lg hover:bg-[#163768] active:scale-[0.97] transition-all cursor-pointer border border-white/20"
                title="Pilih dari Galeri"
              >
                <Icon name="PhotoIcon" size={22} className="text-white" />
                <input type="file" accept="image/*" onChange={handleGalleryUpload} className="hidden" />
              </label>

              {/* Center Prominent Shutter Button */}
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
        {/* STAGE 3: RESULT SCREEN (7 DIMENSIONS + GCS SCORE + DECISION LAYER) */}
        {/* ========================================================================= */}
        {stage === 'result' && assessmentResult && (
          <div className="space-y-4 animate-scale-in">
            {/* Top Score Banner with GCS Count-Up Animation */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm flex items-center gap-4">
              {/* Circular Score Badge with Count-Up */}
              <div className="w-22 h-22 rounded-3xl bg-gradient-to-br from-[#0B2545] to-[#163768] text-white flex flex-col items-center justify-center flex-shrink-0 shadow-md border-2 border-cyan-400/50 p-2">
                <span className="text-2xl font-black text-white font-tabular">{animatedScore}</span>
                <span className="text-[9px] font-extrabold text-cyan-200 uppercase tracking-wider text-center">
                  GCS SCORE
                </span>
                <span className="text-[8px] text-white/70">Skala 100</span>
              </div>

              <div className="space-y-1 min-w-0 flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <span
                    className={`text-[10px] font-extrabold px-2.5 py-0.5 rounded-full uppercase tracking-wider ${
                      assessmentResult.gcsScore >= 80
                        ? 'bg-[#D1FAE5] text-[#166534]'
                        : assessmentResult.gcsScore >= 60
                        ? 'bg-amber-100 text-amber-900'
                        : 'bg-rose-100 text-rose-900'
                    }`}
                  >
                    {assessmentResult.conditionGrade} • {assessmentResult.conditionStatus}
                  </span>
                  <span className="text-[10px] text-muted-foreground">{assessmentResult.category}</span>
                </div>
                <h3 className="text-sm sm:text-base font-extrabold text-[#10284D] truncate">
                  {assessmentResult.garmentType}
                </h3>
                <p className="text-xs text-muted-foreground">
                  🌿 <strong>Bahan:</strong> {assessmentResult.estimatedFabric} • {assessmentResult.colorSummary}
                </p>
              </div>
            </div>

            {/* AI Recommendation Engine Card (5 Categories) */}
            <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2.5 animate-card-reveal stagger-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-[#E8C547] text-xs font-black uppercase tracking-wider">
                  <span>💡 REKOMENDASI TINDAKAN:</span>
                </div>
                <span className="bg-emerald-500 text-white text-[9px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
                  {assessmentResult.actionBadge}
                </span>
              </div>

              <h4 className="text-sm font-black text-white">{assessmentResult.actionTitle}</h4>
              <p className="text-xs text-white/90 leading-relaxed">
                {assessmentResult.actionReason}
              </p>

              {assessmentResult.estimatedPriceRange && (
                <div className="text-[11px] text-cyan-200 pt-1">
                  💰 Estimasi Nilai: <strong>{assessmentResult.estimatedPriceRange}</strong>
                </div>
              )}
            </div>

            {/* 7 ASSESSMENT DIMENSIONS (ACCORDION & EXPANDABLE LIST) */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3 animate-card-reveal stagger-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-black text-[#10284D] uppercase tracking-wider flex items-center gap-1.5">
                  <span>🔬 7 Dimensi Penilaian Kondisi Pakaian</span>
                </h4>
                <span className="text-[10px] text-muted-foreground font-semibold">Skala 1 - 5</span>
              </div>

              <div className="space-y-2">
                {Object.values(assessmentResult.dimensions).map((dim) => {
                  const isExpanded = expandedDimension === dim.id;

                  const scoreBg =
                    dim.score >= 4
                      ? 'bg-emerald-100 text-emerald-800'
                      : dim.score === 3
                      ? 'bg-amber-100 text-amber-800'
                      : 'bg-rose-100 text-rose-800';

                  return (
                    <div
                      key={dim.id}
                      onClick={() => setExpandedDimension(isExpanded ? null : dim.id)}
                      className="p-3 rounded-2xl bg-slate-50 hover:bg-slate-100/80 border border-slate-100 transition-all cursor-pointer"
                    >
                      <div className="flex items-center justify-between">
                        <div className="flex items-center gap-2">
                          <span className="text-xs font-extrabold text-[#10284D]">{dim.name}</span>
                          <span className={`text-[10px] font-extrabold px-2 py-0.5 rounded-md ${scoreBg}`}>
                            {dim.score}/5 • {dim.rating}
                          </span>
                        </div>
                        <span className="text-xs text-muted-foreground">
                          {isExpanded ? '▲' : '▼'}
                        </span>
                      </div>

                      {/* Summary text */}
                      <p className="text-[11px] text-muted-foreground mt-1 line-clamp-1">
                        {dim.details}
                      </p>

                      {/* Expanded View */}
                      {isExpanded && (
                        <div className="mt-2.5 pt-2 border-t border-slate-200/80 space-y-1.5 text-xs text-slate-800 animate-fade-in">
                          <p className="text-[11px] text-foreground leading-relaxed">{dim.details}</p>
                          {dim.findings && dim.findings.length > 0 && (
                            <div className="flex flex-wrap gap-1 pt-1">
                              {dim.findings.map((f, i) => (
                                <span
                                  key={i}
                                  className="text-[10px] bg-white border border-slate-200 text-slate-700 px-2 py-0.5 rounded-md"
                                >
                                  • {f}
                                </span>
                              ))}
                            </div>
                          )}
                        </div>
                      )}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* 4 STAGGERED ACTION CARDS: CARE / ALTER / SELL / CIRCULATE */}
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
                    Potong kelim, ubah ukuran, jahit robek, atau restyle.
                  </p>
                </div>

                {/* 3. JUAL (SELL) */}
                <div
                  onClick={() => setSelectedAction('sell')}
                  className={`p-3.5 rounded-3xl border cursor-pointer transition-all duration-200 active:scale-[0.97] animate-card-reveal stagger-3 relative ${
                    selectedAction === 'sell'
                      ? 'bg-emerald-50 border-emerald-400 shadow-md ring-2 ring-emerald-500'
                      : 'bg-card border-border hover:border-emerald-200'
                  }`}
                >
                  {assessmentResult.primaryAction === 'CIRCULATE' && (
                    <span className="absolute -top-2 right-2 bg-emerald-600 text-white text-[8px] font-black px-2 py-0.5 rounded-full uppercase tracking-wider shadow-xs">
                      Rekomendasi AI
                    </span>
                  )}
                  <div className="flex items-center gap-2 mb-1.5">
                    <span className="text-lg">🏷️</span>
                    <span className="text-xs font-black text-emerald-950">Jual (Trif)</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Jual langsung ke pembeli di Thrift Marketplace.
                  </p>
                </div>

                {/* 4. SIRKULASIKAN / UPCYCLE */}
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
                    <span className="text-xs font-black text-blue-950">Upcycle / Daur Ulang</span>
                  </div>
                  <p className="text-[10px] text-muted-foreground leading-tight">
                    Rework kreatif atau daur ulang tekstil borongan.
                  </p>
                </div>
              </div>
            </div>

            {/* Decision Action Buttons */}
            <div className="space-y-2 pt-2 animate-card-reveal stagger-4">
              <button
                onClick={() => {
                  if (selectedAction === 'care') router.push('/care-plan');
                  else if (selectedAction === 'alter') router.push('/menu-perawatan');
                  else if (selectedAction === 'sell') router.push('/jual/trif');
                  else router.push('/jual/upcycle');
                }}
                className="w-full bg-[#10284D] text-white py-4 rounded-full font-black text-xs uppercase tracking-wider shadow-lg hover:bg-[#163768] active:scale-[0.97] transition-all duration-150 flex items-center justify-center gap-2"
              >
                <span>
                  Lanjutkan:{' '}
                  {selectedAction === 'care'
                    ? 'Perawatan Pakaian (Care Plan)'
                    : selectedAction === 'alter'
                    ? 'Pilih Mitra Permak (Tailor)'
                    : selectedAction === 'sell'
                    ? 'Jual di Thrift Marketplace'
                    : 'Upcycle / Daur Ulang Tekstil'}
                </span>
                <span>→</span>
              </button>

              <button
                onClick={() => {
                  setStage('camera');
                  setAnimatedScore(0);
                  setAssessmentResult(null);
                }}
                className="w-full bg-slate-100 text-slate-700 py-3 rounded-full font-bold text-xs hover:bg-slate-200 active:scale-[0.97] transition-all duration-150"
              >
                🔄 Scan Pakaian Lain
              </button>
            </div>
          </div>
        )}
      </div>

      {/* ========================================================================= */}
      {/* MODAL 1: CAMERA FOCUS & POSITIONING ASSISTANT GUIDANCE */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showFocusGuidance}
        onClose={() => setShowFocusGuidance(false)}
        title="⚠️ Pakaian Tidak Terdeteksi Jelas"
        size="md"
      >
        <div className="space-y-4 text-xs text-foreground">
          <div className="bg-amber-50 border border-amber-200 rounded-2xl p-4 text-amber-950 leading-relaxed">
            <p className="font-semibold">{guidanceMessage}</p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-extrabold text-[#10284D] text-xs">
              Tips Agar Pakaian Terdeteksi Akurat oleh AI:
            </h4>
            <div className="space-y-2 text-muted-foreground text-[11px]">
              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-base">👕</span>
                <div>
                  <strong className="text-foreground block">1. Bentangkan Pakaian Terbuka</strong>
                  Posisikan pakaian rata di atas tempat tidur, meja, atau digantung rapi. Hindari pakaian yang tergulung atau tertumpuk.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-base">💡</span>
                <div>
                  <strong className="text-foreground block">2. Pencahayaan Terang & Cukup</strong>
                  Pastikan cahaya menerangi permukaan kain agar serat, jahitan, dan noda terlihat tajam tanpa bayangan pekat.
                </div>
              </div>

              <div className="flex items-start gap-2.5 bg-slate-50 p-2.5 rounded-xl border border-slate-100">
                <span className="text-base">🎯</span>
                <div>
                  <strong className="text-foreground block">3. Fokuskan Lensa Kamera</strong>
                  Tunggu 1-2 detik hingga kamera fokus atau ketuk layar pada area pakaian sebelum menekan tombol scan.
                </div>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5 pt-2">
            <button
              onClick={() => {
                setShowFocusGuidance(false);
                setSelectedImage(DEFAULT_JACKET_IMAGE);
                processGarmentAnalysis(DEFAULT_JACKET_IMAGE);
              }}
              className="py-3 px-3 rounded-xl border border-slate-200 text-slate-700 font-bold hover:bg-slate-100 active:scale-95 transition-all text-center text-xs"
            >
              Gunakan Contoh Demo
            </button>
            <button
              onClick={() => {
                setShowFocusGuidance(false);
                setStage('camera');
              }}
              className="py-3 px-3 rounded-xl bg-[#10284D] text-white font-extrabold shadow-md hover:bg-[#163768] active:scale-95 transition-all text-center text-xs"
            >
              Fokuskan & Coba Lagi
            </button>
          </div>
        </div>
      </Modal>

      {/* ========================================================================= */}
      {/* MODAL 2: USER CONTEXT INPUT (KOMBINASI 2 SUMBER DATA) */}
      {/* ========================================================================= */}
      <Modal
        isOpen={showContextModal}
        onClose={() => setShowContextModal(false)}
        title="✨ Input Tambahan Kondisi Pakaian"
        size="md"
      >
        <div className="space-y-3.5 text-xs text-foreground">
          <p className="text-[11px] text-muted-foreground leading-relaxed">
            AI Vision mendeteksi noda dan cacat visual. Tambahkan data fisik di bawah ini agar diagnosis
            dan skor GCS menjadi jauh lebih presisi.
          </p>

          {/* Odour assessment */}
          <div className="space-y-1.5">
            <label className="font-bold text-foreground block">1. Kondisi Bau Pakaian:</label>
            <div className="grid grid-cols-3 gap-2">
              {[
                { id: 'none', label: 'Bersih/Wangi', emoji: '🌸' },
                { id: 'musty', label: 'Sedikit Apek', emoji: '🧺' },
                { id: 'strong', label: 'Bau Menyengat', emoji: '⚠️' },
              ].map((opt) => (
                <button
                  key={opt.id}
                  type="button"
                  onClick={() => setUserContext((prev) => ({ ...prev, odour: opt.id as any }))}
                  className={`p-2.5 rounded-xl border text-center transition-all ${
                    userContext.odour === opt.id
                      ? 'border-[#10284D] bg-blue-50 text-[#10284D] font-extrabold shadow-xs'
                      : 'border-slate-200 bg-white text-muted-foreground hover:bg-slate-50'
                  }`}
                >
                  <span className="block text-base mb-0.5">{opt.emoji}</span>
                  <span className="text-[10px]">{opt.label}</span>
                </button>
              ))}
            </div>
          </div>

          {/* Known fabric */}
          <div className="space-y-1">
            <label className="font-bold text-foreground block">2. Jenis Bahan (Jika Tahu):</label>
            <input
              type="text"
              placeholder="Contoh: Katun Twill, Denim, Wol, Poliester..."
              value={userContext.knownFabric || ''}
              onChange={(e) => setUserContext((prev) => ({ ...prev, knownFabric: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>

          {/* Usage history */}
          <div className="space-y-1">
            <label className="font-bold text-foreground block">3. Riwayat Penggunaan:</label>
            <input
              type="text"
              placeholder="Contoh: Pemakaian harian / Jarang dipakai / Disimpan lama di lemari"
              value={userContext.usageHistory || ''}
              onChange={(e) => setUserContext((prev) => ({ ...prev, usageHistory: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl px-3 py-2.5 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>

          {/* Notes */}
          <div className="space-y-1">
            <label className="font-bold text-foreground block">4. Catatan Kerusakan Tersembunyi:</label>
            <textarea
              rows={2}
              placeholder="Contoh: Kancing bawah sedikit longgar, resleting agak seret..."
              value={userContext.notes || ''}
              onChange={(e) => setUserContext((prev) => ({ ...prev, notes: e.target.value }))}
              className="w-full bg-slate-50 border border-slate-200 rounded-xl p-3 text-xs text-foreground placeholder:text-muted-foreground outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>

          <button
            onClick={() => {
              setShowContextModal(false);
              toast.success('Informasi fisik berhasil disimpan untuk diagnosis AI!');
            }}
            className="w-full py-3.5 rounded-2xl bg-[#10284D] text-white font-extrabold text-xs shadow-md hover:bg-[#163768] active:scale-95 transition-all text-center"
          >
            Simpan & Lanjutkan
          </button>
        </div>
      </Modal>
    </AppLayout>
  );
}
