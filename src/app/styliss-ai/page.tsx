'use client';

import React, { useState } from 'react';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export default function StylissAIPage() {
  const [hasUploaded, setHasUploaded] = useState(false);
  const [rotation, setRotation] = useState(0);
  const [zoom, setZoom] = useState(1);
  const [isRendering, setIsRendering] = useState(false);

  const handleUpload = () => {
    setIsRendering(true);
    setTimeout(() => {
      setIsRendering(false);
      setHasUploaded(true);
      toast.success('Pakaian berhasil dirender ke Mannequin 3D!');
    }, 1800);
  };

  const handleReset = () => {
    setRotation(0);
    setZoom(1);
  };

  return (
    <AppLayout title="Styliss AI — 3D Fitting" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
        {/* Main Canvas Viewer */}
        <div className="relative bg-gradient-to-b from-slate-100 to-slate-200 rounded-3xl h-[420px] border border-border shadow-inner flex flex-col items-center justify-center p-4 overflow-hidden select-none">
          {!hasUploaded ? (
            <div className="text-center space-y-4 max-w-xs">
              <div className="w-16 h-16 rounded-2xl bg-[#D1FAE5] text-[#166534] mx-auto flex items-center justify-center shadow-sm">
                <Icon name="UserIcon" size={32} />
              </div>
              <div>
                <h3 className="text-base font-bold text-gray-900">Styliss AI 3D Viewer</h3>
                <p className="text-xs text-gray-500 mt-1">
                  Unggah foto pakaianmu, AI akan memetakan tekstur & bentuknya ke manekin 3D
                </p>
              </div>

              {isRendering ? (
                <div className="flex flex-col items-center gap-2 pt-2">
                  <div className="w-8 h-8 border-3 border-[#10284D] border-t-transparent rounded-full animate-spin" />
                  <span className="text-xs font-semibold text-gray-600">Merekonstruksi Mannequin 3D...</span>
                </div>
              ) : (
                <button
                  onClick={handleUpload}
                  className="bg-[#10284D] text-white px-6 py-3 rounded-full text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
                >
                  📸 Upload Foto Pakaianmu
                </button>
              )}
            </div>
          ) : (
            /* 3D Rendered Mannequin Simulation */
            <div className="w-full h-full flex flex-col items-center justify-center relative">
              {/* Interactive 3D Model Display */}
              <div
                className="transition-transform duration-100 flex flex-col items-center justify-center"
                style={{
                  transform: `rotateY(${rotation}deg) scale(${zoom})`,
                }}
              >
                {/* Mannequin Head */}
                <div className="w-12 h-16 rounded-full bg-slate-300 border-2 border-slate-400 mb-1" />
                {/* Garment 3D Fit Body */}
                <div className="w-36 h-48 bg-gradient-to-b from-[#1E3A8A] via-[#3B82F6] to-[#10284D] rounded-t-3xl rounded-b-2xl shadow-xl flex items-center justify-center text-white text-xs font-bold text-center p-3 border-2 border-blue-400">
                  <span>Klámbi 3D Garment Rendered</span>
                </div>
                {/* Mannequin Legs */}
                <div className="flex gap-4 mt-1">
                  <div className="w-4 h-28 bg-slate-300 rounded-b-lg border border-slate-400" />
                  <div className="w-4 h-28 bg-slate-300 rounded-b-lg border border-slate-400" />
                </div>
              </div>

              {/* 360° Drag Helper Tag */}
              <div className="absolute top-4 left-4 bg-white/80 backdrop-blur-sm px-3 py-1 rounded-full text-[10px] font-bold text-gray-700 border border-gray-200">
                🔄 Rotasi 360° ({rotation}°)
              </div>
            </div>
          )}
        </div>

        {/* 3D View Controls */}
        {hasUploaded && (
          <div className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-4">
            <div className="flex items-center justify-between">
              <span className="text-xs font-bold text-foreground">Kontrol Viewer 3D</span>
              <button
                onClick={handleReset}
                className="text-xs font-semibold text-primary hover:underline"
              >
                Reset View
              </button>
            </div>

            {/* Slider Rotasi */}
            <div className="space-y-1">
              <label className="text-[11px] text-muted-foreground font-semibold flex justify-between">
                <span>Rotasi Mannequin (0° - 360°)</span>
                <span>{rotation}°</span>
              </label>
              <input
                type="range"
                min="-180"
                max="180"
                value={rotation}
                onChange={(e) => setRotation(Number(e.target.value))}
                className="w-full accent-[#10284D] cursor-pointer"
              />
            </div>

            {/* Zoom Controls */}
            <div className="flex items-center justify-between pt-1">
              <span className="text-xs text-muted-foreground font-semibold">Skala Zoom</span>
              <div className="flex items-center gap-2">
                <button
                  onClick={() => setZoom((prev) => Math.max(0.7, prev - 0.1))}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-foreground hover:bg-secondary"
                >
                  -
                </button>
                <span className="text-xs font-bold w-12 text-center">
                  {Math.round(zoom * 100)}%
                </span>
                <button
                  onClick={() => setZoom((prev) => Math.min(1.5, prev + 0.1))}
                  className="w-8 h-8 rounded-lg bg-muted flex items-center justify-center font-bold text-foreground hover:bg-secondary"
                >
                  +
                </button>
              </div>
            </div>

            {/* Action Buttons */}
            <div className="grid grid-cols-2 gap-3 pt-2">
              <button
                onClick={() => toast.success('Disimpan ke Lemari Digital!')}
                className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
              >
                💾 Simpan ke Lemari Digital
              </button>
              <button
                onClick={() => toast.info('Link tautan fitting 3D berhasil disalin!')}
                className="border border-[#10284D] text-[#10284D] py-3 rounded-2xl text-xs font-bold hover:bg-secondary active:scale-95 transition-all"
              >
                🔗 Bagikan Fitting
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
