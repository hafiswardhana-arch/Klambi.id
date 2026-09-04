'use client';

import React from 'react';
import { useRouter } from 'next/navigation';

interface DecisionButtonPairProps {
  onContinue?: () => void;
  continueHref?: string;
  continueText?: string;
  onBack?: () => void;
  backHref?: string;
  backText?: string;
  className?: string;
}

export default function DecisionButtonPair({
  onContinue,
  continueHref,
  continueText = 'Lanjutkan Sesuai Rekomendasi →',
  onBack,
  backHref,
  backText = '← Kembali / Pilih Manual',
  className = '',
}: DecisionButtonPairProps) {
  const router = useRouter();

  const handleBack = () => {
    if (onBack) {
      onBack();
    } else if (backHref) {
      router.push(backHref);
    } else {
      router.back();
    }
  };

  const handleContinue = () => {
    if (onContinue) {
      onContinue();
    } else if (continueHref) {
      router.push(continueHref);
    }
  };

  return (
    <div className={`grid grid-cols-2 gap-3 pt-3 ${className}`}>
      {/* Tombol Kiri (Sekunder) - Kembali */}
      <button
        type="button"
        onClick={handleBack}
        className="w-full border-2 border-[#10284D] text-[#10284D] bg-white hover:bg-slate-50 py-3.5 px-3 rounded-2xl text-xs font-bold transition-all active:scale-95 shadow-xs text-center truncate"
      >
        {backText}
      </button>

      {/* Tombol Kanan (Primer) - Lanjutkan */}
      <button
        type="button"
        onClick={handleContinue}
        className="w-full bg-[#10284D] hover:bg-[#163768] text-white py-3.5 px-3 rounded-2xl text-xs font-extrabold transition-all active:scale-95 shadow-md text-center truncate flex items-center justify-center gap-1"
      >
        {continueText}
      </button>
    </div>
  );
}
