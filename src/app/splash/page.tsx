'use client';

import React, { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import KlambiLogo from '@/components/ui/KlambiLogo';

export default function SplashScreenPage() {
  const router = useRouter();
  const [progress, setProgress] = useState(0);

  useEffect(() => {
    // Animate progress bar smoothly over ~2.5 seconds
    const intervalTime = 30; // 30ms interval
    const totalSteps = 2500 / intervalTime;
    let step = 0;

    const timer = setInterval(() => {
      step++;
      const currentProgress = Math.min(Math.round((step / totalSteps) * 100), 100);
      setProgress(currentProgress);

      if (step >= totalSteps) {
        clearInterval(timer);
        // Redirect to Login page after splash completes
        setTimeout(() => {
          router.push('/login');
        }, 200);
      }
    }, intervalTime);

    return () => clearInterval(timer);
  }, [router]);

  return (
    <div className="fixed inset-0 z-[100] bg-white flex flex-col items-center justify-between py-12 px-6 select-none">
      {/* Top spacer */}
      <div />

      {/* Center Vertical: Logo Klámbi.id (Infinity Icon + Name stacked) */}
      <div className="flex flex-col items-center justify-center animate-scale-in">
        <KlambiLogo variant="stacked" size="xl" />
      </div>

      {/* Bottom: Loading Text & Horizontal Rounded Progress Bar */}
      <div className="w-full max-w-xs flex flex-col items-center gap-2">
        <span className="text-xs font-semibold text-gray-500 tracking-wider">
          Loading...
        </span>
        
        {/* Progress bar container (outline pill) */}
        <div className="w-full h-3 rounded-full border border-gray-900 p-0.5 bg-white overflow-hidden shadow-sm">
          {/* Progress bar (solid black rounded fill) */}
          <div
            className="h-full bg-black rounded-full transition-all duration-75 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
      </div>
    </div>
  );
}
