'use client';
import React, { useState, useEffect } from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';

interface ScanAnalysisProgressProps {
  imageUrl: string | null;
  stage: 'uploading' | 'analyzing';
  onComplete: () => void;
}

const analysisSteps = [
  { id: 'step-detect', label: 'Mendeteksi jenis pakaian', icon: 'TagIcon', duration: 800 },
  { id: 'step-fabric', label: 'Menganalisis kondisi kain', icon: 'SwatchIcon', duration: 900 },
  { id: 'step-color', label: 'Memeriksa kualitas warna', icon: 'EyeDropperIcon', duration: 700 },
  { id: 'step-stitch', label: 'Mengevaluasi jahitan', icon: 'ScissorsIcon', duration: 600 },
  { id: 'step-score', label: 'Menghitung skor & rekomendasi', icon: 'ChartBarIcon', duration: 1000 },
];

export default function ScanAnalysisProgress({
  imageUrl,
  stage,
  onComplete,
}: ScanAnalysisProgressProps) {
  const [currentStep, setCurrentStep] = useState(-1);
  const [completedSteps, setCompletedSteps] = useState<Set<number>>(new Set());
  const [overallProgress, setOverallProgress] = useState(0);

  useEffect(() => {
    if (stage !== 'analyzing') return;

    let stepIndex = 0;
    let totalElapsed = 0;
    const totalDuration = analysisSteps.reduce((a, s) => a + s.duration, 0);

    const runStep = () => {
      if (stepIndex >= analysisSteps.length) {
        setOverallProgress(100);
        setTimeout(onComplete, 400);
        return;
      }
      setCurrentStep(stepIndex);
      const stepDuration = analysisSteps[stepIndex].duration;

      const progressInterval = setInterval(() => {
        totalElapsed += 50;
        setOverallProgress(Math.min(Math.round((totalElapsed / totalDuration) * 100), 99));
      }, 50);

      setTimeout(() => {
        clearInterval(progressInterval);
        setCompletedSteps((prev) => new Set([...prev, stepIndex]));
        stepIndex++;
        runStep();
      }, stepDuration);
    };

    const startTimeout = setTimeout(runStep, 200);
    return () => clearTimeout(startTimeout);
  }, [stage, onComplete]);

  return (
    <div className="space-y-5 animate-fade-in">
      {/* Image Preview with overlay */}
      <div className="relative rounded-2xl overflow-hidden bg-muted h-48">
        {imageUrl ? (
          <AppImage
            src={imageUrl}
            alt="Foto baju yang sedang dianalisis AI"
            fill
            className="object-cover"
          />
        ) : (
          <div className="w-full h-full flex items-center justify-center">
            <Icon name="PhotoIcon" size={48} className="text-muted-foreground/30" />
          </div>
        )}
        {/* Overlay */}
        <div className="absolute inset-0 bg-foreground/50 flex flex-col items-center justify-center gap-3">
          <div className="w-16 h-16 rounded-full bg-white/10 border-2 border-white/30 flex items-center justify-center">
            <Icon name="SparklesIcon" size={28} variant="solid" className="text-white animate-pulse" />
          </div>
          <div className="text-center">
            <p className="text-white font-700 text-sm">
              {stage === 'uploading' ? 'Mengunggah foto...' : 'AI sedang menganalisis...'}
            </p>
            {stage === 'analyzing' && (
              <p className="text-white/70 text-xs mt-1 font-tabular">{overallProgress}% selesai</p>
            )}
          </div>
        </div>
        {/* Progress bar at bottom */}
        {stage === 'analyzing' && (
          <div className="absolute bottom-0 left-0 right-0 h-1.5 bg-white/20">
            <div
              className="h-full bg-accent transition-all duration-300 ease-out"
              style={{ width: `${overallProgress}%` }}
            />
          </div>
        )}
      </div>

      {/* Analysis Steps */}
      <div className="card-elevated p-4 space-y-3">
        <p className="text-xs font-600 text-muted-foreground uppercase tracking-wider">
          Proses Analisis
        </p>
        {analysisSteps.map((step, i) => {
          const isDone = completedSteps.has(i);
          const isActive = currentStep === i && !isDone;
          return (
            <div
              key={step.id}
              className={`flex items-center gap-3 transition-all duration-300 ${
                isDone || isActive ? 'opacity-100' : 'opacity-40'
              }`}
            >
              <div
                className={`w-7 h-7 rounded-full flex items-center justify-center flex-shrink-0 transition-all duration-300 ${
                  isDone
                    ? 'bg-accent'
                    : isActive
                    ? 'bg-primary animate-pulse-green' :'bg-muted'
                }`}
              >
                {isDone ? (
                  <Icon name="CheckIcon" size={14} variant="solid" className="text-white" />
                ) : (
                  <Icon
                    name={step.icon as Parameters<typeof Icon>[0]['name']}
                    size={14}
                    className={isActive ? 'text-white' : 'text-muted-foreground'}
                  />
                )}
              </div>
              <span
                className={`text-sm font-500 transition-colors ${
                  isDone ? 'text-accent line-through' : isActive ? 'text-foreground font-600' : 'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
              {isActive && (
                <div className="ml-auto flex gap-0.5">
                  {[0, 1, 2].map((dot) => (
                    <div
                      key={`dot-${dot}`}
                      className="w-1 h-1 rounded-full bg-primary animate-bounce"
                      style={{ animationDelay: `${dot * 150}ms` }}
                    />
                  ))}
                </div>
              )}
            </div>
          );
        })}
      </div>

      <p className="text-center text-xs text-muted-foreground">
        Analisis biasanya memakan waktu 3–5 detik
      </p>
    </div>
  );
}