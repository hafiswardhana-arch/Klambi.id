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
  GarmentVisualProfile,
} from '@/lib/ai/types';
import { classifyVisualProfile } from '@/lib/ai/garmentAssessment';

function extractVisualProfileFromCanvas(canvas: HTMLCanvasElement): GarmentVisualProfile {
  try {
    const ctx = canvas.getContext('2d');
    if (!ctx) {
      return classifyVisualProfile(120, 120, 120, 1.0);
    }
    const width = canvas.width;
    const height = canvas.height;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;

    const sampleSteps = 25;
    const startX = Math.floor(width * 0.2);
    const endX = Math.floor(width * 0.8);
    const startY = Math.floor(height * 0.2);
    const endY = Math.floor(height * 0.8);

    let totalR = 0,
      totalG = 0,
      totalB = 0;
    let count = 0;

    for (let yi = 0; yi < sampleSteps; yi++) {
      const y = Math.floor(startY + (yi / sampleSteps) * (endY - startY));
      for (let xi = 0; xi < sampleSteps; xi++) {
        const x = Math.floor(startX + (xi / sampleSteps) * (endX - startX));
        const idx = (y * width + x) * 4;
        totalR += data[idx];
        totalG += data[idx + 1];
        totalB += data[idx + 2];
        count++;
      }
    }

    const r = Math.round(totalR / Math.max(1, count));
    const g = Math.round(totalG / Math.max(1, count));
    const b = Math.round(totalB / Math.max(1, count));

    return classifyVisualProfile(r, g, b, width / Math.max(1, height));
  } catch (err) {
    console.warn('Canvas pixel extraction fallback:', err);
    return classifyVisualProfile(120, 120, 120, 1.0);
  }
}

type ScanStage = 'camera' | 'analyzing' | 'result';
type CameraStatus = 'idle' | 'requesting' | 'active' | 'error';
type ActionType = 'care' | 'alter' | 'sell' | 'circulate';

interface AnalysisStep {
  id: number;
  label: string;
  isComplete: boolean;
  iconName: string;
}

const isRearLabel = (label: string) => /back|rear|environment|belakang|world/i.test(label);
const isFrontLabel = (label: string) => /front|user|selfie|depan|facetime/i.test(label);

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
    { id: 1, label: 'Mendeteksi jenis pakaian', isComplete: false, iconName: 'ViewfinderCircleIcon' },
    { id: 2, label: 'Menganalisis kondisi kain', isComplete: false, iconName: 'PresentationChartBarIcon' },
    { id: 3, label: 'Mengevaluasi jahitan', isComplete: false, iconName: 'DocumentMagnifyingGlassIcon' },
    { id: 4, label: 'Menghitung skor dan rekomendasi', isComplete: false, iconName: 'CheckBadgeIcon' },
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

  // Incremented on every start/stop so stale async getUserMedia results can be discarded
  const cameraRequestIdRef = useRef(0);

  // Re-enumerate cameras (labels are only available after permission is granted)
  const refreshCameraList = useCallback(async (): Promise<MediaDeviceInfo[]> => {
    if (typeof navigator === 'undefined' || !navigator.mediaDevices?.enumerateDevices) return [];
    try {
      const devices = await navigator.mediaDevices.enumerateDevices();
      const videoDevices = devices.filter((d) => d.kind === 'videoinput');
      setAvailableCameras(videoDevices);
      setHasMultipleCameras(videoDevices.length > 1);
      return videoDevices;
    } catch {
      return [];
    }
  }, []);

  // Initialize and start live camera hardware
  const startCamera = useCallback(
    async (mode: 'user' | 'environment', targetDeviceId?: string | null) => {
      const requestId = ++cameraRequestIdRef.current;
      stopCameraTracks();
      setCameraStatus('requesting');
      setCameraError(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('error');
        setCameraError(
          typeof window !== 'undefined' && !window.isSecureContext
            ? 'Kamera hanya bisa diakses lewat HTTPS. Buka situs dengan https://'
            : 'Browser tidak mendukung akses kamera langsung. Pilih foto dari galeri.'
        );
        return;
      }

      const tryGet = async (constraints: MediaStreamConstraints): Promise<MediaStream | null> => {
        try {
          return await navigator.mediaDevices.getUserMedia(constraints);
        } catch (err) {
          console.warn('getUserMedia failed', constraints, err);
          return null;
        }
      };

      const size = { width: { ideal: 1280 }, height: { ideal: 720 } };
      let stream: MediaStream | null = null;

      // Strategy 1: specific deviceId
      if (targetDeviceId) {
        stream = await tryGet({ video: { deviceId: { exact: targetDeviceId }, ...size }, audio: false });
      }
      // Strategy 2: exact facingMode (forces the rear camera on phones)
      if (!stream) {
        stream = await tryGet({ video: { facingMode: { exact: mode }, ...size }, audio: false });
      }
      // Strategy 3: preferred facingMode
      if (!stream) {
        stream = await tryGet({ video: { facingMode: { ideal: mode }, ...size }, audio: false });
      }
      // Strategy 4: any camera
      if (!stream) {
        stream = await tryGet({ video: true, audio: false });
      }

      // A newer start/stop happened while waiting: release this stream so the camera isn't locked
      if (requestId !== cameraRequestIdRef.current) {
        stream?.getTracks().forEach((t) => t.stop());
        return;
      }

      if (!stream) {
        setCameraStatus('error');
        setCameraError('Izin kamera ditolak atau kamera sedang dipakai aplikasi lain.');
        return;
      }

      // Rear camera requested but the browser returned the front one: pick the rear lens by label
      if (mode === 'environment' && !targetDeviceId) {
        const track = stream.getVideoTracks()[0];
        const settings = track?.getSettings?.() || {};
        const gotFront =
          settings.facingMode === 'user' ||
          (!!track?.label && isFrontLabel(track.label) && !isRearLabel(track.label));
        if (gotFront) {
          const cams = await refreshCameraList();
          const rear = cams.find((c) => c.deviceId && isRearLabel(c.label) && c.deviceId !== settings.deviceId);
          if (rear) {
            stream.getTracks().forEach((t) => t.stop());
            let rearStream = await tryGet({
              video: { deviceId: { exact: rear.deviceId }, ...size },
              audio: false,
            });
            if (requestId !== cameraRequestIdRef.current) {
              rearStream?.getTracks().forEach((t) => t.stop());
              return;
            }
            if (!rearStream) {
              rearStream = await tryGet({ video: true, audio: false });
            } else {
              setActiveDeviceId(rear.deviceId);
            }
            if (!rearStream) {
              setCameraStatus('error');
              setCameraError('Kamera belakang tidak dapat dibuka.');
              return;
            }
            stream = rearStream;
          }
        }
      }

      streamRef.current = stream;
      const video = videoRef.current;
      if (video) {
        video.srcObject = stream;
        video.setAttribute('playsinline', 'true');
        video.muted = true;
        video.onloadedmetadata = () => {
          video.play().catch(() => {});
        };
        try {
          await video.play();
        } catch {
          // autoplay may still start via onloadedmetadata
        }
      }
      setCameraStatus('active');

      // Labels are available now that permission is granted: refresh for the switch button
      refreshCameraList();

      const videoTrack = stream.getVideoTracks()[0];
      if (videoTrack) {
        try {
          const capabilities = (videoTrack.getCapabilities?.() || {}) as { torch?: boolean };
          setTorchSupported(Boolean(capabilities.torch));
        } catch {
          setTorchSupported(false);
        }
      }
    },
    [stopCameraTracks, refreshCameraList]
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
      const matches = nextMode === 'environment' ? isRearLabel : isFrontLabel;
      const targetCam = availableCameras.find((cam) => cam.deviceId && cam.label && matches(cam.label));
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
    refreshCameraList();
  }, [refreshCameraList]);

  // Camera start on mount
  useEffect(() => {
    if (stage === 'camera') {
      startCamera(facingMode);
    } else {
      stopCameraTracks();
    }

    return () => {
      // Invalidate any getUserMedia call still in flight, then release the camera
      cameraRequestIdRef.current++;
      stopCameraTracks();
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [stage]);

  // Capture frame from live video or use default preview
  const handleCapture = () => {
    let capturedImage: string | null = null;
    let visualProfile: GarmentVisualProfile | undefined = undefined;

    if (videoRef.current && cameraStatus === 'active' && videoRef.current.videoWidth > 0) {
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
        visualProfile = extractVisualProfileFromCanvas(canvas);
      }
    }

    if (!capturedImage) {
      toast.error('Kamera belum siap. Tunggu kamera aktif atau pilih foto dari galeri.');
      return;
    }

    setSelectedImage(capturedImage);
    stopCameraTracks();
    processGarmentAnalysis(capturedImage, visualProfile);
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
            const visualProfile = extractVisualProfileFromCanvas(canvas);
            setSelectedImage(optimizedBase64);
            stopCameraTracks();
            processGarmentAnalysis(optimizedBase64, visualProfile);
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
   * 2. Send image, user context, and extracted visual profile to /api/ai/scan-garment
   * 3. Handle focus guidance if garment is not detected
   * 4. Transition to result with GCS score & 7 dimensions
   */
  const processGarmentAnalysis = async (
    imageDataUrl: string,
    visualProfile?: GarmentVisualProfile
  ) => {
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

    // Start API request with visualProfile
    const apiPromise = (async (): Promise<{ data: GarmentAssessmentResult | null; error?: string }> => {
      try {
        const res = await fetch('/api/ai/scan-garment', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({
            imageBase64: imageDataUrl,
            userContext,
            visualProfile,
          }),
        });

        const json = await res.json().catch(() => null);
        if (res.ok && json?.data) {
          return { data: json.data as GarmentAssessmentResult };
        }
        return {
          data: null,
          error:
            json?.error ||
            json?.message ||
            `Analisis AI gagal (status ${res.status}). Silakan coba lagi.`,
        };
      } catch (err) {
        console.error('Scan API request failed:', err);
        return { data: null, error: 'Koneksi ke server terputus. Periksa internet lalu coba lagi.' };
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
    const [apiResponse] = await Promise.all([
      apiPromise,
      new Promise((resolve) => setTimeout(resolve, 5000)),
    ]);
    const result = apiResponse.data;

    if (!result) {
      // AI failed: show the real reason and return to the camera instead of a fake result
      setStage('camera');
      setIsObjectLocked(false);
      setIsScanLineActive(false);
      setCurrentStepIndex(0);
      setSteps((prev) => prev.map((s) => ({ ...s, isComplete: false })));
      toast.error(apiResponse.error || 'Analisis AI gagal. Silakan coba lagi.', { duration: 8000 });
      return;
    }

    if (result.isGarmentDetected === false) {
      // Garment explicitly not detected: trigger Focus Guidance dialog
      setStage('camera');
      setGuidanceMessage(
        result.focusGuidance ||
          'Pakaian tidak terdeteksi dengan jelas. Harap pastikan pencahayaan cukup, posisikan pakaian rata dan terbentang penuh di permukaan datar atau digantung, dan fokuskan lensa kamera ke area pakaian.'
      );
      setShowFocusGuidance(true);
      toast.warning('Pakaian tidak terdeteksi jelas. Silakan periksa fokus kamera.');
      return;
    }

    // Success: completion phase
    const resolvedResult = result;
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

  const frameClipOuter =
    'polygon(0 0, 100% 0, 100% calc(100% - 48px), calc(100% - 48px) 100%, 48px 100%, 0 calc(100% - 48px))';
  const frameClipInner =
    'polygon(0 0, 100% 0, 100% calc(100% - 46.8px), calc(100% - 46.8px) 100%, 46.8px 100%, 0 calc(100% - 46.8px))';

  return (
    <AppLayout
      hideTopHeader
      mutedNav={stage !== 'result'}
      className="bg-gradient-to-b from-[#F1F1F1] via-[#C9C9C9] to-[#8A8A8A] bg-fixed"
    >
      {/* Hidden canvas for capturing frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-md mx-auto pb-28 select-none font-sans">
        {/* HEADER: back + menu floating buttons, centered title */}
        <div className="flex items-center justify-between pt-3">
          <button
            type="button"
            onClick={() => router.push('/')}
            className="w-12 h-12 rounded-full bg-white/90 shadow-card flex items-center justify-center text-navy-deep active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label="Kembali ke beranda"
          >
            <Icon name="ArrowLeftIcon" size={26} strokeWidth={1.6} />
          </button>
          <button
            type="button"
            onClick={() => setShowContextModal(true)}
            className="w-12 h-12 rounded-full bg-white/90 shadow-card flex items-center justify-center text-navy-deep active:scale-95 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
            aria-label="Tambah data fisik pakaian (bau & bahan)"
          >
            <Icon name="EllipsisVerticalIcon" size={28} strokeWidth={2.6} />
          </button>
        </div>

        <h1 className="text-center text-[19px] font-medium text-navy mt-2 mb-1">Kenali Kondisi Pakaianmu</h1>

        {/* STAGE 1 & 2: CAMERA + ANALYZING */}
        {stage !== 'result' && (
          <div className="animate-fade-in">
            {/* Viewfinder frame (rounded top, chamfered bottom, mint border) */}
            <div
              className="relative mx-auto w-full h-[220px] bg-[#DDF2E3] p-[3px] rounded-t-[34px]"
              style={{ clipPath: frameClipOuter }}
            >
              <div
                className="relative w-full h-full overflow-hidden rounded-t-[31px] bg-slate-800"
                style={{ clipPath: frameClipInner }}
              >
                <video
                  ref={videoRef}
                  autoPlay
                  playsInline
                  muted
                  className={`w-full h-full object-cover ${facingMode === 'user' ? 'scale-x-[-1]' : ''} ${
                    flash ? 'brightness-125 contrast-105' : ''
                  } ${stage === 'camera' && cameraStatus === 'active' ? 'block' : 'hidden'}`}
                />

                {!(stage === 'camera' && cameraStatus === 'active') && (
                  <div className="absolute inset-0 bg-slate-200">
                    <Image
                      src={selectedImage || DEFAULT_JACKET_IMAGE}
                      alt="Pakaian yang dipindai"
                      fill
                      unoptimized
                      className="object-cover"
                    />
                    {stage === 'camera' && cameraStatus === 'requesting' && (
                      <div className="absolute inset-0 bg-slate-900/60 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2">
                        <div className="w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                        <span className="text-sm font-medium">Mengakses kamera...</span>
                      </div>
                    )}
                    {stage === 'camera' && cameraStatus === 'error' && (
                      <div className="absolute inset-0 bg-slate-900/80 backdrop-blur-sm flex flex-col items-center justify-center text-white gap-2 p-6 text-center">
                        <Icon name="ExclamationTriangleIcon" size={30} className="text-amber-400" aria-hidden="true" />
                        <span className="text-sm font-medium">{cameraError || 'Kamera tidak dapat diakses'}</span>
                        <span className="text-xs text-white/75">Pilih foto dari galeri dengan tombol di bawah</span>
                      </div>
                    )}
                  </div>
                )}

                {/* Scan line */}
                {(isScanLineActive || stage === 'analyzing') && !isCompletionPhase && (
                  <div
                    className="absolute inset-x-0 h-[3px] bg-navy-deep shadow-[0_0_10px_rgba(11,42,82,0.55)] animate-scan-laser z-20 pointer-events-none"
                    aria-hidden="true"
                  />
                )}

                {/* Camera guidance + switch */}
                {stage === 'camera' && cameraStatus === 'active' && (
                  <span className="absolute top-4 left-1/2 -translate-x-1/2 z-20 whitespace-nowrap bg-black/45 backdrop-blur-sm text-white text-[11px] font-medium px-3 py-1 rounded-full">
                    Bentangkan pakaian & fokuskan kamera
                  </span>
                )}
                {stage === 'camera' && hasMultipleCameras && (
                  <button
                    onClick={handleSwitchCamera}
                    className="absolute top-3 right-4 z-20 w-10 h-10 rounded-full bg-black/45 backdrop-blur-sm text-white flex items-center justify-center active:scale-90 transition-transform focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
                    aria-label="Ganti kamera depan/belakang"
                  >
                    <Icon name="ArrowPathIcon" size={18} />
                  </button>
                )}
              </div>
            </div>

            {/* Status label */}
            <p className="text-center text-[20px] font-medium text-navy mt-1" aria-live="polite">
              {isCompletionPhase
                ? 'Diagnosis Selesai'
                : stage === 'analyzing'
                ? 'Scanning...'
                : 'Siap Memindai'}
            </p>

            {/* User context tag */}
            {(userContext.odour !== 'none' || userContext.knownFabric) && (
              <div className="mt-3 mx-1 bg-white/80 backdrop-blur-sm rounded-2xl px-4 py-2 flex items-center justify-between text-xs text-navy-deep">
                <span className="flex items-center gap-2 min-w-0">
                  <Icon name="InformationCircleIcon" size={16} aria-hidden="true" />
                  <span className="truncate">
                    {userContext.knownFabric || 'Bahan umum'} • Bau:{' '}
                    {userContext.odour === 'strong' ? 'Menyengat' : userContext.odour === 'musty' ? 'Apek' : 'Normal'}
                  </span>
                </span>
                <button onClick={() => setShowContextModal(true)} className="font-semibold underline underline-offset-2 py-1">
                  Ubah
                </button>
              </div>
            )}

            {/* Process card */}
            <div className="mt-5 mx-2 bg-white rounded-[20px] px-4 pt-4 pb-3 shadow-[0_10px_30px_rgba(0,0,0,0.12)]">
              <span className="inline-block bg-navy-deep text-white text-[13px] font-medium px-4 py-1.5 rounded-full tracking-wide">
                PROSES ANALISIS
              </span>

              {isCompletionPhase ? (
                <div className="py-4 flex flex-col items-center justify-center animate-checkmark-reveal">
                  <SignatureCircularMotion size="md" showCheckmark={true} />
                  <p className="text-sm font-semibold text-navy mt-3">Diagnosis kondisi pakaian selesai</p>
                  <p className="text-xs text-gray-600 mt-0.5">Membuka skor & rekomendasi sirkular...</p>
                </div>
              ) : (
                <ol className="mt-2 space-y-0.5">
                  {steps.map((step) => {
                    const isDone = step.isComplete;
                    const isCurrent = currentStepIndex + 1 === step.id && stage === 'analyzing';
                    return (
                      <li key={step.id} className="flex items-center gap-2.5 min-h-[44px]">
                        <span
                          className={`w-9 h-9 flex items-center justify-center flex-shrink-0 transition-colors duration-300 ${
                            isDone ? 'text-success-green' : isCurrent ? 'text-navy' : 'text-gray-400'
                          }`}
                          aria-hidden="true"
                        >
                          <Icon name={step.iconName} size={32} strokeWidth={1.4} />
                        </span>
                        <span
                          className={`text-[14.5px] leading-snug transition-colors duration-300 ${
                            isDone
                              ? 'text-success-green'
                              : isCurrent
                              ? 'text-navy font-medium'
                              : 'text-gray-400 line-through decoration-gray-400'
                          }`}
                        >
                          {step.label}
                        </span>
                        {isDone ? (
                          <Icon
                            name="CheckCircleIcon"
                            variant="solid"
                            size={24}
                            className="text-success-green flex-shrink-0 animate-scale-in"
                            aria-label="Selesai"
                          />
                        ) : isCurrent ? (
                          <span
                            className="w-5 h-5 border-2 border-navy border-t-transparent rounded-full animate-spin flex-shrink-0"
                            aria-label="Sedang diproses"
                          />
                        ) : null}
                      </li>
                    );
                  })}
                </ol>
              )}
            </div>

            <p className="text-center text-[13px] text-white mt-2 [text-shadow:0_1px_2px_rgba(0,0,0,0.35)]">
              Analisis biasanya memakan waktu 30 detik
            </p>

            {/* Controls: gallery / shutter / flash */}
            <div className="flex items-center justify-center gap-8 mt-6">
              <label
                className="w-14 h-14 rounded-full bg-navy-deep border-[3px] border-white text-white flex items-center justify-center shadow-lg active:scale-95 transition-transform cursor-pointer focus-within:ring-2 focus-within:ring-white focus-within:ring-offset-2 focus-within:ring-offset-navy"
                aria-label="Pilih foto dari galeri"
              >
                <Icon name="PhotoIcon" variant="solid" size={28} aria-hidden="true" />
                <input type="file" accept="image/*" onChange={handleGalleryUpload} className="sr-only" />
              </label>

              <button
                onClick={handleCapture}
                disabled={stage === 'analyzing'}
                className="w-[88px] h-[88px] rounded-full bg-navy-deep border-[5px] border-white text-white flex items-center justify-center shadow-xl hover:scale-[1.03] active:scale-95 transition-transform disabled:opacity-90 focus-visible:outline-none focus-visible:ring-4 focus-visible:ring-white/70"
                aria-label="Mulai scan pakaian"
              >
                {stage === 'analyzing' ? (
                  <span className="w-8 h-8 border-[3px] border-white border-t-transparent rounded-full animate-spin" />
                ) : (
                  <Icon name="QrCodeIcon" size={46} strokeWidth={1.4} aria-hidden="true" />
                )}
              </button>

              <button
                onClick={handleToggleFlash}
                className={`w-14 h-14 rounded-full border-[3px] border-white flex items-center justify-center shadow-lg active:scale-95 transition-all focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white ${
                  flash ? 'bg-brand-yellow text-navy-deep' : 'bg-navy-deep text-white'
                }`}
                aria-label={flash ? 'Matikan flash' : 'Nyalakan flash'}
                aria-pressed={flash}
              >
                <Icon name="BoltIcon" size={28} strokeWidth={1.5} aria-hidden="true" />
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
                  <strong>Bahan:</strong> {assessmentResult.estimatedFabric} • {assessmentResult.colorSummary}
                </p>
              </div>
            </div>

            {/* AI Recommendation Engine Card (5 Categories) */}
            <div className="bg-[#10284D] text-white rounded-3xl p-5 shadow-md space-y-2.5 animate-card-reveal stagger-1">
              <div className="flex items-center justify-between border-b border-white/10 pb-2">
                <div className="flex items-center gap-2 text-[#E8C547] text-xs font-black uppercase tracking-wider">
                  <Icon name="LightBulbIcon" variant="solid" size={16} aria-hidden="true" />
                  <span>Rekomendasi Tindakan</span>
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
                  Estimasi nilai: <strong>{assessmentResult.estimatedPriceRange}</strong>
                </div>
              )}
            </div>

            {/* 7 ASSESSMENT DIMENSIONS (ACCORDION & EXPANDABLE LIST) */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3 animate-card-reveal stagger-2">
              <div className="flex items-center justify-between border-b border-border pb-2">
                <h4 className="text-xs font-black text-[#10284D] uppercase tracking-wider flex items-center gap-1.5">
                  <Icon name="BeakerIcon" size={16} aria-hidden="true" />
                  <span>7 Dimensi Penilaian</span>
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
                          <Icon name="ChevronDownIcon" size={16} className={`transition-transform duration-200 ${isExpanded ? 'rotate-180' : ''}`} aria-hidden="true" />
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
                  Pilih Tindakan Sirkular
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
                    <Icon name="SparklesIcon" variant="solid" size={20} className="text-rose-500" aria-hidden="true" />
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
                    <Icon name="ScissorsIcon" size={20} className="text-amber-600" aria-hidden="true" />
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
                    <Icon name="TagIcon" variant="solid" size={20} className="text-emerald-600" aria-hidden="true" />
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
                    <Icon name="ArrowPathRoundedSquareIcon" size={20} className="text-blue-600" aria-hidden="true" />
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
                Scan Pakaian Lain
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
        title="Pakaian Tidak Terdeteksi Jelas"
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
        title="Data Fisik Pakaian"
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
