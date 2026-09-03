'use client';
import React, { useState, useRef, useCallback } from 'react';
import Icon from '@/components/ui/AppIcon';
import AppImage from '@/components/ui/AppImage';
import ScanAnalysisProgress from './ScanAnalysisProgress';
import ScanResultCard from './ScanResultCard';

type ScanState = 'idle' | 'uploading' | 'analyzing' | 'result';

const recentScans = [
  { id: 'scan-001', imageUrl: 'https://images.unsplash.com/photo-1594938298603-c8148c4b4b7e?w=160&h=160&fit=crop', category: 'Kemeja', condition: 'Baik', score: 82, date: '12 Agu' },
  { id: 'scan-002', imageUrl: 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=160&h=160&fit=crop', category: 'Jeans', condition: 'Cukup', score: 61, date: '10 Agu' },
  { id: 'scan-003', imageUrl: 'https://images.unsplash.com/photo-1562157873-818bc0726f68?w=160&h=160&fit=crop', category: 'Kaos', condition: 'Perlu Rawat', score: 44, date: '8 Agu' },
  { id: 'scan-004', imageUrl: 'https://images.unsplash.com/photo-1551028719-00167b16eac5?w=160&h=160&fit=crop', category: 'Jaket', condition: 'Baik', score: 78, date: '5 Agu' },
];

export default function ScanUploadZone() {
  const [scanState, setScanState] = useState<ScanState>('idle');
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);
  const [isDragOver, setIsDragOver] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleFile = useCallback((file: File) => {
    if (!file.type.startsWith('image/')) return;
    const url = URL.createObjectURL(file);
    setPreviewUrl(url);
    setScanState('uploading');

    // Simulate upload → analysis pipeline
    // BACKEND: POST /api/scan/upload — multipart/form-data with image file
    setTimeout(() => {
      setScanState('analyzing');
    }, 1200);
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent<HTMLDivElement>) => {
      e.preventDefault();
      setIsDragOver(false);
      const file = e.dataTransfer.files[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleFileInput = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const file = e.target.files?.[0];
      if (file) handleFile(file);
    },
    [handleFile]
  );

  const handleReset = useCallback(() => {
    setScanState('idle');
    setPreviewUrl(null);
    if (fileInputRef.current) fileInputRef.current.value = '';
  }, []);

  const handleAnalysisComplete = useCallback(() => {
    setScanState('result');
  }, []);

  if (scanState === 'result') {
    return <ScanResultCard imageUrl={previewUrl} onRescan={handleReset} />;
  }

  if (scanState === 'analyzing' || scanState === 'uploading') {
    return (
      <ScanAnalysisProgress
        imageUrl={previewUrl}
        stage={scanState}
        onComplete={handleAnalysisComplete}
      />
    );
  }

  return (
    <div className="space-y-4">
      {/* Upload Zone */}
      <div
        onDrop={handleDrop}
        onDragOver={(e) => { e.preventDefault(); setIsDragOver(true); }}
        onDragLeave={() => setIsDragOver(false)}
        onClick={() => fileInputRef.current?.click()}
        className={`relative rounded-2xl border-2 border-dashed transition-all duration-200 cursor-pointer overflow-hidden min-h-[280px] flex flex-col items-center justify-center gap-4 p-6 ${
          isDragOver
            ? 'border-accent bg-secondary/50 scale-[1.01]'
            : 'border-border bg-card hover:border-accent hover:bg-secondary/30'
        }`}
        role="button"
        aria-label="Area upload foto baju — klik atau drag foto ke sini"
        tabIndex={0}
        onKeyDown={(e) => { if (e.key === 'Enter' || e.key === ' ') fileInputRef.current?.click(); }}
      >
        {/* Background pattern */}
        <div className="absolute inset-0 opacity-[0.03] pointer-events-none">
          <div className="w-full h-full" style={{
            backgroundImage: 'radial-gradient(circle at 2px 2px, var(--primary) 1px, transparent 0)',
            backgroundSize: '24px 24px',
          }} />
        </div>

        <div className={`w-20 h-20 rounded-2xl flex items-center justify-center transition-all duration-200 ${
          isDragOver ? 'gradient-green scale-110' : 'bg-secondary border border-border'
        }`}>
          <Icon
            name="CameraIcon"
            size={36}
            className={isDragOver ? 'text-white' : 'text-primary'}
          />
        </div>

        <div className="text-center space-y-1">
          <p className="text-base font-700 text-foreground">
            {isDragOver ? 'Lepaskan foto di sini' : 'Upload Foto Baju'}
          </p>
          <p className="text-sm text-muted-foreground">
            Drag & drop atau klik untuk memilih foto
          </p>
          <p className="text-xs text-muted-foreground/70">
            JPG, PNG, WEBP • Maks. 10MB
          </p>
        </div>

        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 px-4 py-2 bg-primary rounded-xl text-white text-sm font-600 hover:bg-primary/90 transition-colors">
            <Icon name="ArrowUpTrayIcon" size={16} className="text-white" />
            Pilih Foto
          </div>
          <span className="text-xs text-muted-foreground">atau</span>
          <div className="flex items-center gap-2 px-4 py-2 bg-secondary border border-border rounded-xl text-primary text-sm font-600 hover:bg-secondary/80 transition-colors">
            <Icon name="CameraIcon" size={16} className="text-primary" />
            Kamera
          </div>
        </div>

        <input
          ref={fileInputRef}
          type="file"
          accept="image/*"
          capture="environment"
          className="hidden"
          onChange={handleFileInput}
          aria-hidden="true"
        />
      </div>

      {/* Tips */}
      <div className="card-elevated p-4 space-y-3">
        <div className="flex items-center gap-2">
          <Icon name="LightBulbIcon" size={16} variant="solid" className="text-warning flex-shrink-0" />
          <p className="text-sm font-600 text-foreground">Tips Foto Terbaik</p>
        </div>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
          {[
            { icon: 'SunIcon', text: 'Foto di cahaya terang atau sinar matahari' },
            { icon: 'ViewfinderCircleIcon', text: 'Bentangkan baju rata, ambil dari atas' },
            { icon: 'MagnifyingGlassCircleIcon', text: 'Fokus pada detail kain & jahitan' },
          ].map((tip) => (
            <div
              key={`tip-${tip.icon}`}
              className="flex items-start gap-2 p-3 bg-secondary/50 rounded-xl"
            >
              <Icon name={tip.icon as Parameters<typeof Icon>[0]['name']} size={16} className="text-accent flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">{tip.text}</p>
            </div>
          ))}
        </div>
      </div>

      {/* Recent Scans */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <p className="text-sm font-600 text-foreground">Scan Terakhir</p>
          <button className="text-xs text-primary font-600 hover:underline">Lihat Semua</button>
        </div>
        <div className="flex gap-3 overflow-x-auto scrollbar-hide pb-1">
          {recentScans.map((scan) => (
            <div
              key={`recent-${scan.id}`}
              className="flex-shrink-0 w-20 rounded-xl overflow-hidden border border-border bg-card cursor-pointer hover:border-accent transition-colors"
            >
              <div className="w-20 h-20 bg-muted relative overflow-hidden">
                <AppImage
                  src={scan.imageUrl}
                  alt={`Foto ${scan.category} kondisi ${scan.condition}`}
                  fill
                  className="object-cover"
                />
                <div className={`absolute bottom-1 right-1 w-5 h-5 rounded-full flex items-center justify-center text-[9px] font-700 ${
                  scan.score >= 75 ? 'bg-accent text-white' :
                  scan.score >= 50 ? 'bg-warning text-white' : 'bg-danger text-white'
                }`}>
                  {scan.score}
                </div>
              </div>
              <div className="p-1.5">
                <p className="text-[10px] font-600 text-foreground truncate">{scan.category}</p>
                <p className="text-[9px] text-muted-foreground">{scan.date}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}