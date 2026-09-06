'use client';

import React, { useState, useEffect, useRef, useCallback } from 'react';
import { useRouter } from 'next/navigation';
import Image from 'next/image';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import DecisionButtonPair from '@/components/ui/DecisionButtonPair';

type ScanStage = 'camera' | 'analyzing' | 'result';
type CameraStatus = 'idle' | 'requesting' | 'active' | 'error';

interface AnalysisStep {
  id: number;
  label: string;
  isComplete: boolean;
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

  // Analysis Checklist State (Section 5.2)
  const [steps, setSteps] = useState<AnalysisStep[]>([
    { id: 1, label: 'Mendeteksi jenis pakaian', isComplete: false },
    { id: 2, label: 'Menganalisis kondisi kain', isComplete: false },
    { id: 3, label: 'Mengevaluasi jahitan', isComplete: false },
    { id: 4, label: 'Menghitung skor dan rekomendasi', isComplete: false },
  ]);
  const [currentStepIndex, setCurrentStepIndex] = useState(0);

  // Clothing item analysis data
  const [itemResult] = useState({
    title: 'Jaket Patchwork Denim Artisan',
    category: 'Outerwear / Jaket',
    fabric: 'Heavy Denim 14oz & Katun Organik',
    score: 88,
    conditionStatus: 'Sangat Baik',
    recommendation: 'jual',
    recommendationReason:
      'Kondisi serat kain sangat prima (skor 88/100). Memiliki potensi nilai jual kembali tinggi di pasar Thrift (Trif) atau Upcycle Kolektor.',
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

  const [availableCameras, setAvailableCameras] = useState<MediaDeviceInfo[]>([]);
  const [activeDeviceId, setActiveDeviceId] = useState<string | null>(null);

  // Stop camera tracks helper
  const stopCameraTracks = useCallback(() => {
    if (streamRef.current) {
      streamRef.current.getTracks().forEach((track) => track.stop());
      streamRef.current = null;
    }
  }, []);

  // Initialize and start live camera hardware with multi-level fallback for Android & iOS
  const startCamera = useCallback(
    async (mode: 'user' | 'environment', targetDeviceId?: string | null) => {
      stopCameraTracks();
      setCameraStatus('requesting');
      setCameraError(null);

      if (typeof navigator === 'undefined' || !navigator.mediaDevices?.getUserMedia) {
        setCameraStatus('error');
        setCameraError(
          'Browser tidak mendukung akses kamera secara langsung. Silakan gunakan tombol Unggah Galeri.'
        );
        return;
      }

      let stream: MediaStream | null = null;

      // Strategy 1: Specific deviceId (very reliable on mobile devices when enumerated)
      if (targetDeviceId) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: {
              deviceId: { exact: targetDeviceId },
              width: { ideal: 1920, max: 1920 },
              height: { ideal: 1080, max: 1080 },
            },
            audio: false,
          });
        } catch {
          // fallback to ideal deviceId
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

      // Strategy 2: Exact facingMode (Android Chrome & iOS Safari standard)
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
          // Continue to ideal facingMode
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
          // Continue to device search or general fallback
        }
      }

      // Strategy 4: Fallback to basic video constraint (laptop webcams & unlabelled mobile cameras)
      if (!stream) {
        try {
          stream = await navigator.mediaDevices.getUserMedia({
            video: true,
            audio: false,
          });
        } catch (err: unknown) {
          console.error('Camera access error:', err);
          setCameraStatus('error');
          const errorObj = err as { name?: string; message?: string };
          if (
            errorObj.name === 'NotAllowedError' ||
            errorObj.name === 'PermissionDeniedError'
          ) {
            setCameraError(
              'Izin akses kamera belum diberikan. Mohon klik "Izinkan" pada pop-up browser atau gunakan Galeri.'
            );
          } else if (
            errorObj.name === 'NotFoundError' ||
            errorObj.name === 'DevicesNotFoundError'
          ) {
            setCameraError(
              'Tidak ada sensor kamera yang terdeteksi di HP/Laptop Anda. Silakan unggah foto dari galeri.'
            );
          } else {
            setCameraError(
              errorObj.message || 'Gagal menghubungkan ke sensor kamera.'
            );
          }
          return;
        }
      }

      streamRef.current = stream;

      if (videoRef.current) {
        videoRef.current.srcObject = stream;
        try {
          await videoRef.current.play();
        } catch {
          // In case autoplay needs another trigger
        }
      }

      setCameraStatus('active');

      // Refresh camera devices list and determine current active track details
      try {
        const devices = await navigator.mediaDevices.enumerateDevices();
        const videoDevices = devices.filter((d) => d.kind === 'videoinput');
        setAvailableCameras(videoDevices);
        setHasMultipleCameras(videoDevices.length > 1);

        const currentTrack = stream.getVideoTracks()[0];
        const currentTrackSettings = currentTrack.getSettings ? currentTrack.getSettings() : {};
        if (currentTrackSettings.deviceId) {
          setActiveDeviceId(currentTrackSettings.deviceId);
        }

        // Check hardware torch support
        const capabilities = currentTrack.getCapabilities
          ? (currentTrack.getCapabilities() as Record<string, unknown>)
          : null;
        if (capabilities && 'torch' in capabilities) {
          setTorchSupported(true);
        } else {
          setTorchSupported(false);
        }
      } catch {
        // ignore device enumeration errors
      }
    },
    [stopCameraTracks]
  );

  // Switch between front and back camera (with smart deviceId search for Android & iOS)
  const handleSwitchCamera = () => {
    const nextMode = facingMode === 'environment' ? 'user' : 'environment';
    setFacingMode(nextMode);

    // Search for a matching device in available cameras if possible
    let targetDeviceId: string | null = null;
    if (availableCameras.length > 1) {
      if (nextMode === 'environment') {
        const backCam = availableCameras.find(
          (c) =>
            c.label.toLowerCase().includes('back') ||
            c.label.toLowerCase().includes('rear') ||
            c.label.toLowerCase().includes('belakang') ||
            c.label.toLowerCase().includes('environment') ||
            c.label.toLowerCase().includes('0')
        );
        if (backCam && backCam.deviceId !== activeDeviceId) {
          targetDeviceId = backCam.deviceId;
        } else {
          // Pick any camera that is not currently active
          const altCam = availableCameras.find((c) => c.deviceId !== activeDeviceId);
          if (altCam) targetDeviceId = altCam.deviceId;
        }
      } else {
        const frontCam = availableCameras.find(
          (c) =>
            c.label.toLowerCase().includes('front') ||
            c.label.toLowerCase().includes('user') ||
            c.label.toLowerCase().includes('depan') ||
            c.label.toLowerCase().includes('selfie')
        );
        if (frontCam && frontCam.deviceId !== activeDeviceId) {
          targetDeviceId = frontCam.deviceId;
        } else {
          const altCam = availableCameras.find((c) => c.deviceId !== activeDeviceId);
          if (altCam) targetDeviceId = altCam.deviceId;
        }
      }
    }

    startCamera(nextMode, targetDeviceId);
    toast.info(
      nextMode === 'environment'
        ? 'Beralih ke Kamera Belakang (Pakaian)'
        : 'Beralih ke Kamera Depan'
    );
  };

  // Toggle flash/torch
  const handleToggleFlash = async () => {
    const nextFlash = !flash;
    setFlash(nextFlash);

    if (torchSupported && streamRef.current) {
      try {
        const track = streamRef.current.getVideoTracks()[0];
        await track.applyConstraints({
          advanced: [{ torch: nextFlash } as MediaTrackConstraintSet],
        });
      } catch (e) {
        console.warn('Torch constraint failed:', e);
      }
    } else {
      toast.info(
        nextFlash
          ? 'Mode Pencahayaan Tinggi Aktif'
          : 'Pencahayaan Normal'
      );
    }
  };

  // Start camera on mount when in 'camera' stage
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

  // Capture frame from live video feed
  const handleCapture = () => {
    if (videoRef.current && cameraStatus === 'active') {
      const video = videoRef.current;
      const canvas = canvasRef.current || document.createElement('canvas');
      canvas.width = video.videoWidth || 1280;
      canvas.height = video.videoHeight || 720;
      const ctx = canvas.getContext('2d');

      if (ctx) {
        // If front camera, mirror image so preview matches user perception
        if (facingMode === 'user') {
          ctx.translate(canvas.width, 0);
          ctx.scale(-1, 1);
        }
        ctx.drawImage(video, 0, 0, canvas.width, canvas.height);
        const dataUrl = canvas.toDataURL('image/jpeg', 0.9);
        setSelectedImage(dataUrl);
      }
    }

    stopCameraTracks();
    setStage('analyzing');
    toast.success('Foto berhasil diambil! Memulai analisis...');
  };

  // Handle gallery file upload
  const handleGalleryUpload = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (e.target.files && e.target.files[0]) {
      const file = e.target.files[0];
      const reader = new FileReader();
      reader.onload = (uploadEvent) => {
        setSelectedImage(uploadEvent.target?.result as string);
        stopCameraTracks();
        setStage('analyzing');
        toast.success('Foto pakaian dari galeri berhasil dimuat.');
      };
      reader.readAsDataURL(file);
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
      hideBottomNav
    >
      {/* Hidden canvas for capturing frame */}
      <canvas ref={canvasRef} className="hidden" />

      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none animate-fade-in">
        {/* ========================================================================= */}
        {/* 5.2 LAYAR SCAN — WEARWISE AI (Live Hardware Camera) */}
        {/* ========================================================================= */}
        {stage === 'camera' && (
          <div className="space-y-3">
            <div className="relative bg-slate-950 rounded-3xl h-[520px] overflow-hidden flex flex-col justify-between p-4 shadow-2xl border border-slate-800">
              {/* LIVE CAMERA VIDEO ELEMENT */}
              <div className="absolute inset-0 bg-slate-950 flex items-center justify-center overflow-hidden">
                {cameraStatus === 'active' && (
                  <video
                    ref={videoRef}
                    autoPlay
                    playsInline
                    muted
                    className={`w-full h-full object-cover transition-transform duration-300 ${
                      facingMode === 'user' ? 'scale-x-[-1]' : ''
                    } ${flash ? 'brightness-125 contrast-105' : ''}`}
                  />
                )}

                {/* Camera Requesting / Loading State */}
                {cameraStatus === 'requesting' && (
                  <div className="flex flex-col items-center gap-3 text-center px-6 z-10">
                    <div className="w-12 h-12 border-4 border-cyan-400 border-t-transparent rounded-full animate-spin" />
                    <p className="text-white text-xs font-bold">
                      Menghubungkan ke sensor kamera...
                    </p>
                    <p className="text-white/60 text-[11px]">
                      Pastikan Anda menekan &quot;Izinkan&quot; pada dialog izin browser.
                    </p>
                  </div>
                )}

                {/* Camera Error / Fallback State */}
                {cameraStatus === 'error' && (
                  <div className="flex flex-col items-center gap-3 text-center px-6 z-10 max-w-sm">
                    <div className="w-14 h-14 rounded-2xl bg-red-500/20 text-red-400 flex items-center justify-center text-2xl border border-red-500/30">
                      📷
                    </div>
                    <h4 className="text-white text-sm font-extrabold">
                      Akses Kamera Tidak Aktif
                    </h4>
                    <p className="text-white/75 text-xs leading-relaxed">
                      {cameraError || 'Tidak dapat membuka kamera.'}
                    </p>
                    <div className="flex flex-col gap-2 w-full pt-2">
                      <button
                        onClick={() => startCamera(facingMode)}
                        className="bg-cyan-500 hover:bg-cyan-400 text-slate-950 px-4 py-2.5 rounded-xl text-xs font-bold transition-all active:scale-95 shadow-lg"
                      >
                        🔄 Coba Akses Kamera Lagi
                      </button>
                      <label className="cursor-pointer bg-white/20 hover:bg-white/30 text-white px-4 py-2.5 rounded-xl text-xs font-bold transition-all text-center border border-white/20">
                        🖼️ Pilih Foto dari Galeri / Laptop
                        <input
                          type="file"
                          accept="image/*"
                          onChange={handleGalleryUpload}
                          className="hidden"
                        />
                      </label>
                    </div>
                  </div>
                )}
              </div>

              {/* Top Toolbar */}
              <div className="flex items-center justify-between z-20">
                <button
                  onClick={handleToggleFlash}
                  className={`px-3.5 py-1.5 rounded-full text-xs font-bold flex items-center gap-1.5 transition-all ${
                    flash
                      ? 'bg-amber-400 text-slate-950 shadow-md shadow-amber-400/30'
                      : 'bg-black/50 text-white backdrop-blur-md border border-white/20 hover:bg-black/70'
                  }`}
                >
                  <Icon name="SparklesIcon" size={14} />
                  <span>Flash: {flash ? 'ON' : 'OFF'}</span>
                </button>

                {/* Camera Mode Toggle Pill (Mobile & Laptop) */}
                <div className="flex items-center bg-black/60 p-0.5 rounded-full backdrop-blur-md border border-white/20">
                  <button
                    type="button"
                    onClick={() => {
                      if (facingMode !== 'environment') handleSwitchCamera();
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      facingMode === 'environment'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Belakang 👕
                  </button>
                  <button
                    type="button"
                    onClick={() => {
                      if (facingMode !== 'user') handleSwitchCamera();
                    }}
                    className={`px-2.5 py-1 rounded-full text-[11px] font-bold transition-all ${
                      facingMode === 'user'
                        ? 'bg-emerald-500 text-white shadow-xs'
                        : 'text-white/70 hover:text-white'
                    }`}
                  >
                    Depan 🤳
                  </button>
                </div>

                {/* Flip Camera Button (Quick Tap) */}
                <button
                  onClick={handleSwitchCamera}
                  title="Putar Kamera (Depan / Belakang)"
                  className="w-10 h-10 rounded-full bg-black/50 text-white flex items-center justify-center hover:bg-black/70 active:scale-90 transition-all backdrop-blur-md border border-white/20 shadow-md"
                >
                  <Icon name="ArrowPathIcon" size={18} />
                </button>
              </div>

              {/* Viewport Frame with Rounded Masking & Target Box */}
              <div className="absolute inset-0 flex flex-col items-center justify-center p-6 pointer-events-none z-10">
                <div className="w-64 h-80 border-2 border-dashed border-cyan-300/80 rounded-3xl flex flex-col items-center justify-center relative shadow-[0_0_0_9999px_rgba(11,37,69,0.50)]">
                  {cameraStatus === 'active' && (
                    <span className="text-white text-xs font-extrabold bg-[#10284D]/90 px-3.5 py-1.5 rounded-full backdrop-blur-sm shadow-md text-center mb-2">
                      Posisikan pakaian di dalam kotak
                    </span>
                  )}

                  {/* Corner Accent Guides */}
                  <div className="absolute -top-1 -left-1 w-5 h-5 border-t-3 border-l-3 border-cyan-300 rounded-tl" />
                  <div className="absolute -top-1 -right-1 w-5 h-5 border-t-3 border-r-3 border-cyan-300 rounded-tr" />
                  <div className="absolute -bottom-1 -left-1 w-5 h-5 border-b-3 border-l-3 border-cyan-300 rounded-bl" />
                  <div className="absolute -bottom-1 -right-1 w-5 h-5 border-b-3 border-r-3 border-cyan-300 rounded-br" />

                  {/* Gentle Live Scan Guide Line */}
                  {cameraStatus === 'active' && (
                    <div className="absolute inset-x-4 h-0.5 bg-cyan-400/70 shadow-[0_0_8px_#22D3EE] animate-pulse" />
                  )}
                </div>
              </div>

              {/* Bottom Camera Controls Bar (Gallery, Big Shutter, Tips) */}
              <div className="z-20 flex items-center justify-between px-3 pb-2 pt-4 bg-gradient-to-t from-black/85 via-black/50 to-transparent">
                {/* Gallery File Upload */}
                <label className="cursor-pointer text-white text-xs font-bold bg-white/20 hover:bg-white/30 px-3.5 py-2.5 rounded-2xl backdrop-blur-md transition-all flex items-center gap-1.5 active:scale-95 border border-white/20 shadow-md">
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
                  className="w-18 h-18 rounded-full border-4 border-white bg-gradient-to-tr from-cyan-400 to-[#10284D] hover:scale-105 active:scale-90 transition-all shadow-2xl flex items-center justify-center relative group"
                  aria-label="Ambil Foto & Scan"
                >
                  <div className="w-13 h-13 rounded-full bg-white group-hover:bg-cyan-50 transition-colors shadow-inner flex items-center justify-center">
                    <div className="w-4 h-4 rounded-full bg-[#10284D]" />
                  </div>
                </button>

                {/* Tips Toggle Button */}
                <button
                  onClick={() =>
                    toast.info(
                      'Tips: Bentangkan pakaian secara rata di permukaan terang dan pastikan seluruh pola jahitan terlihat.'
                    )
                  }
                  className="text-white text-xs font-bold bg-white/20 hover:bg-white/30 px-3.5 py-2.5 rounded-2xl backdrop-blur-md transition-all active:scale-95 border border-white/20 shadow-md"
                >
                  💡 Tips Foto
                </button>
              </div>
            </div>

            <div className="flex items-center justify-between px-1 text-[11px] text-muted-foreground">
              <span className="flex items-center gap-1.5">
                <span className="w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                {facingMode === 'environment'
                  ? 'Kamera Belakang Aktif (Normal / Non-Mirror)'
                  : 'Kamera Depan Aktif (Mirror Preview)'}
              </span>
              <span className="font-bold text-[#10284D]">HD AI Vision</span>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5.2 PROSES ANALISIS BERTALAP (Real Photo Overlay) */}
        {/* ========================================================================= */}
        {stage === 'analyzing' && (
          <div className="space-y-4">
            {/* Freeze with Real Captured Photo Overlay */}
            <div className="relative bg-slate-900 rounded-3xl h-[520px] overflow-hidden flex flex-col justify-between p-5 shadow-2xl border border-slate-800">
              {/* Captured Photo Background */}
              {selectedImage ? (
                <div className="absolute inset-0 overflow-hidden">
                  <Image
                    src={selectedImage}
                    alt="Foto pakaian hasil scan"
                    fill
                    unoptimized
                    className="object-cover filter brightness-50 blur-[1px]"
                  />
                  <div className="absolute inset-0 bg-[#0B2545]/60" />
                </div>
              ) : (
                <div className="absolute inset-0 bg-gradient-to-b from-[#10284D]/70 via-[#10284D]/85 to-[#0B2545] flex items-center justify-center">
                  <span className="text-7xl opacity-40 filter blur-xs">🧥</span>
                </div>
              )}

              {/* Scanning Laser Line */}
              <div
                className="absolute inset-x-0 h-1.5 bg-gradient-to-r from-cyan-400 via-emerald-400 to-amber-300 shadow-[0_0_20px_#22D3EE] transition-all duration-700 animate-pulse z-10"
                style={{ top: `${(currentStepIndex / 4) * 80 + 10}%` }}
              />

              {/* Title & Status */}
              <div className="relative z-10 text-center space-y-1">
                <span className="bg-[#E86D50] text-white text-[10px] font-black px-3.5 py-1 rounded-full uppercase tracking-wider animate-pulse inline-block shadow-md">
                  Scanning Pakaian...
                </span>
                <h2 className="text-lg font-extrabold text-white drop-shadow">
                  Kenali Kondisi Pakaianmu
                </h2>
              </div>

              {/* Floating White Card "PROSES ANALISIS" */}
              <div className="relative z-10 bg-white/95 backdrop-blur-md rounded-3xl p-5 shadow-2xl border border-white space-y-3.5 text-slate-800 max-w-sm mx-auto w-full">
                <div className="flex items-center justify-between border-b border-gray-100 pb-2">
                  <h3 className="text-xs font-black uppercase tracking-wider text-[#10284D]">
                    PROSES ANALISIS WEARWISE AI
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
                  <span>⏱️ Analisis mikroskopis serat & noda</span>
                  <div className="w-4 h-4 border-2 border-[#10284D] border-t-transparent rounded-full animate-spin" />
                </div>
              </div>

              {/* Bottom camera bar placeholder */}
              <div className="relative z-10 text-center">
                <span className="text-[11px] text-white/80 bg-black/40 px-3 py-1 rounded-full backdrop-blur-sm">
                  Mengolah visual kain dari frame kamera...
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
            {/* Real Photo Preview Thumbnail if captured */}
            {selectedImage && (
              <div className="bg-card rounded-3xl p-4 border border-border shadow-sm flex items-center gap-3">
                <div className="relative w-16 h-16 rounded-2xl overflow-hidden border-2 border-cyan-400 flex-shrink-0 shadow-sm">
                  <Image
                    src={selectedImage}
                    alt="Foto pakaian hasil scan kamera"
                    fill
                    unoptimized
                    className="object-cover"
                  />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] font-extrabold text-emerald-600 bg-emerald-50 px-2 py-0.5 rounded-full">
                    ✓ Foto Kamera Berhasil Dipindai
                  </span>
                  <h4 className="text-xs font-bold text-foreground truncate mt-1">
                    Frame Tangkapan Kamera Langsung
                  </h4>
                  <p className="text-[10px] text-muted-foreground">
                    Sensor optik mendeteksi kerapatan benang & integritas warna
                  </p>
                </div>
                <button
                  onClick={() => setStage('camera')}
                  className="text-xs font-bold text-[#10284D] border border-border px-3 py-1.5 rounded-xl hover:bg-slate-50 transition-all flex-shrink-0"
                >
                  Scan Ulang
                </button>
              </div>
            )}

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

            {/* 7 Parameter Hasil Scan */}
            <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
              <h4 className="text-xs font-black text-[#10284D] uppercase tracking-wider flex items-center gap-1.5 border-b border-border pb-2">
                <span>🔍 Parameter Evaluasi Kain & Serat</span>
              </h4>

              <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5 text-xs">
                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    1. Kondisi Umum
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {itemResult.parameters.kondisiUmum}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    2. Noda & Kebersihan
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {itemResult.parameters.noda}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    3. Kecerahan Warna
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {itemResult.parameters.warna}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    4. Integritas Serat Kain
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {itemResult.parameters.serat}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    5. Kerusakan & Lubang
                  </span>
                  <span className="font-extrabold text-emerald-700">
                    {itemResult.parameters.kerusakan}
                  </span>
                </div>

                <div className="bg-slate-50 p-3 rounded-2xl border border-slate-100">
                  <span className="text-[10px] text-muted-foreground font-semibold block">
                    6. Kualitas Jahitan & Kelim
                  </span>
                  <span className="font-extrabold text-slate-800">
                    {itemResult.parameters.jahitan}
                  </span>
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
              <div className="flex items-center gap-2 text-[#E86D50] text-xs font-black uppercase tracking-wider">
                <span>💡 KESIMPULAN REKOMENDASI AI: DIJUAL (TRIF)</span>
              </div>
              <p className="text-xs text-white/90 leading-relaxed">
                {itemResult.recommendationReason}
              </p>
            </div>

            {/* 2 Tombol Global */}
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
