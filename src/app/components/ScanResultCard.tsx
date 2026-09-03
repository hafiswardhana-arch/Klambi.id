'use client';
import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import ScoreRingChart from './ScoreRingChart';
import ParameterScoreBars from './ParameterScoreBars';

interface ScanResultCardProps {
  imageUrl: string | null;
  onRescan: () => void;
}

// Mock AI analysis result
// BACKEND: GET /api/scan/:id/result — returns ScanResult JSON
const mockResult = {
  id: 'scan-live-001',
  category: 'Kemeja Lengan Panjang',
  material: 'Katun 100%',
  color: 'Putih Polos',
  totalScore: 67,
  conditionLabel: 'Cukup Baik',
  parameters: [
    { id: 'param-kebersihan', label: 'Kebersihan', score: 72, note: 'Ada noda kecil di area kerah' },
    { id: 'param-kain', label: 'Keutuhan Kain', score: 81, note: 'Serat kain masih rapat, tidak ada robekan' },
    { id: 'param-warna', label: 'Kualitas Warna', score: 55, note: 'Warna sedikit pudar, terutama di area lipatan' },
    { id: 'param-jahitan', label: 'Kerapian Jahitan', score: 60, note: 'Ada jahitan yang mulai longgar di bagian kancing' },
  ],
  recommendation: 'rawat' as const,
  recommendationReason:
    'Warna kemeja mengalami pemudaran dan jahitan kancing perlu diperbaiki. Dengan perawatan yang tepat, kemeja ini masih bisa digunakan 2–3 tahun lagi.',
  estimatedSellPrice: 45000,
  aiConfidence: 94,
};

export default function ScanResultCard({ imageUrl, onRescan }: ScanResultCardProps) {
  const router = useRouter();
  const [showDetail, setShowDetail] = useState(false);
  const result = mockResult;

  const scoreColor =
    result.totalScore >= 80 ? 'text-primary' :
    result.totalScore >= 60 ? 'text-accent' :
    result.totalScore >= 40 ? 'text-warning' : 'text-danger';

  const conditionVariant =
    result.totalScore >= 80 ? 'excellent' :
    result.totalScore >= 60 ? 'good' :
    result.totalScore >= 40 ? 'fair' : 'poor';

  return (
    <div className="space-y-4 animate-slide-up">
      {/* Header Result */}
      <div className="card-elevated p-4">
        <div className="flex items-start gap-4">
          {/* Garment Photo */}
          <div className="w-24 h-28 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border relative">
            {imageUrl ? (
              <AppImage
                src={imageUrl}
                alt={`Foto ${result.category} yang telah dianalisis`}
                fill
                className="object-cover"
              />
            ) : (
              <div className="w-full h-full flex items-center justify-center">
                <Icon name="PhotoIcon" size={28} className="text-muted-foreground/30" />
              </div>
            )}
            <div className="absolute top-1.5 left-1.5">
              <Badge variant={conditionVariant} size="sm">{result.conditionLabel}</Badge>
            </div>
          </div>

          {/* Info */}
          <div className="flex-1 min-w-0">
            <div className="flex items-start justify-between gap-2">
              <div>
                <p className="text-base font-700 text-foreground">{result.category}</p>
                <p className="text-xs text-muted-foreground mt-0.5">{result.material} · {result.color}</p>
              </div>
              <div className="flex items-center gap-1 bg-secondary px-2 py-1 rounded-lg">
                <Icon name="SparklesIcon" size={12} variant="solid" className="text-primary" />
                <span className="text-xs font-600 text-primary">{result.aiConfidence}% yakin</span>
              </div>
            </div>

            {/* Score Ring */}
            <div className="flex items-center gap-3 mt-3">
              <ScoreRingChart score={result.totalScore} size={64} />
              <div>
                <p className={`text-2xl font-800 font-tabular ${scoreColor}`}>{result.totalScore}</p>
                <p className="text-xs text-muted-foreground">dari 100</p>
                <p className="text-xs font-600 text-foreground mt-0.5">Skor Total</p>
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* Parameter Scores */}
      <div className="card-elevated p-4">
        <div className="flex items-center justify-between mb-3">
          <p className="text-sm font-700 text-foreground">Detail Parameter</p>
          <button
            onClick={() => setShowDetail(!showDetail)}
            className="text-xs text-primary font-600 flex items-center gap-1 hover:underline"
          >
            {showDetail ? 'Sembunyikan' : 'Lihat Catatan'}
            <Icon name={showDetail ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={14} />
          </button>
        </div>
        <ParameterScoreBars parameters={result.parameters} showNotes={showDetail} />
      </div>

      {/* AI Recommendation */}
      <div
        className={`rounded-2xl p-4 border ${
          result.recommendation === 'rawat' ?'bg-warning-bg border-warning/30' :'bg-secondary border-accent/30'
        }`}
      >
        <div className="flex items-start gap-3">
          <div
            className={`w-9 h-9 rounded-xl flex items-center justify-center flex-shrink-0 ${
              result.recommendation === 'rawat' ? 'bg-warning/20' : 'bg-accent/20'
            }`}
          >
            <Icon
              name={result.recommendation === 'rawat' ? 'WrenchScrewdriverIcon' : 'TagIcon'}
              size={18}
              variant="solid"
              className={result.recommendation === 'rawat' ? 'text-warning' : 'text-accent'}
            />
          </div>
          <div className="flex-1">
            <div className="flex items-center gap-2 mb-1">
              <p className="text-sm font-700 text-foreground">
                Rekomendasi AI: {result.recommendation === 'rawat' ? 'Rawat Dulu' : 'Jual Sekarang'}
              </p>
            </div>
            <p className="text-xs text-muted-foreground leading-relaxed">
              {result.recommendationReason}
            </p>
            {result.recommendation === 'jual' && (
              <p className="text-xs font-600 text-primary mt-1.5">
                Estimasi harga jual: Rp {result.estimatedSellPrice.toLocaleString('id-ID')}
              </p>
            )}
          </div>
        </div>
      </div>

      {/* CTA Buttons */}
      <div className="grid grid-cols-2 gap-3">
        <button
          onClick={() => router.push('/menu-perawatan')}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-warning-bg border-2 border-warning/40 hover:border-warning hover:bg-warning/10 transition-all duration-200 active:scale-95"
          aria-label="Pilih jalur rawat"
        >
          <div className="w-10 h-10 rounded-xl bg-warning/20 flex items-center justify-center">
            <Icon name="WrenchScrewdriverIcon" size={22} variant="solid" className="text-warning" />
          </div>
          <div className="text-center">
            <p className="text-sm font-700 text-foreground">Rawat</p>
            <p className="text-[11px] text-muted-foreground">Permak atau dirawat</p>
          </div>
          {result.recommendation === 'rawat' && (
            <span className="text-[10px] bg-warning/20 text-warning-foreground px-2 py-0.5 rounded-full font-600">
              Disarankan AI
            </span>
          )}
        </button>

        <button
          onClick={() => router.push('/trift-marketplace')}
          className="flex flex-col items-center gap-2 p-4 rounded-2xl bg-secondary border-2 border-accent/40 hover:border-accent hover:bg-secondary/80 transition-all duration-200 active:scale-95"
          aria-label="Pilih jalur jual"
        >
          <div className="w-10 h-10 rounded-xl bg-accent/20 flex items-center justify-center">
            <Icon name="TagIcon" size={22} variant="solid" className="text-accent" />
          </div>
          <div className="text-center">
            <p className="text-sm font-700 text-foreground">Jual</p>
            <p className="text-[11px] text-muted-foreground">Trift atau Upcycle</p>
          </div>
          {result.recommendation === 'jual' && (
            <span className="text-[10px] bg-accent/20 text-primary px-2 py-0.5 rounded-full font-600">
              Disarankan AI
            </span>
          )}
        </button>
      </div>

      {/* Rescan */}
      <button
        onClick={onRescan}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl border border-border bg-card text-sm font-600 text-muted-foreground hover:text-foreground hover:border-accent transition-all"
      >
        <Icon name="ArrowPathIcon" size={16} />
        Scan Baju Lain
      </button>
    </div>
  );
}