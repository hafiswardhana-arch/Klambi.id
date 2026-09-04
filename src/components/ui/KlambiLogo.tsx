'use client';

import React from 'react';
import Image from 'next/image';

interface KlambiLogoProps {
  variant?: 'full' | 'icon-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  dark?: boolean;
}

export default function KlambiLogo({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
  dark = false,
}: KlambiLogoProps) {
  // Fixed pixel dimensions — used as both Image width/height AND CSS max constraints
  const iconDimensions = {
    sm: { w: 28, h: 28 },
    md: { w: 36, h: 36 },
    lg: { w: 56, h: 56 },
    xl: { w: 96, h: 96 },
  };

  const textSizes = {
    sm: 'text-sm',
    md: 'text-base',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const { w, h } = iconDimensions[size] ?? iconDimensions.md;
  const textSize = textSizes[size] ?? textSizes.md;

  const imgEl = (
    <Image
      src="/assets/images/app_icon.png"
      alt="Klámbi.id Logo"
      width={w}
      height={h}
      style={{ width: w, height: h, objectFit: 'contain', flexShrink: 0 }}
      priority
      unoptimized
    />
  );

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        {imgEl}
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        {imgEl}
        <div className="flex items-baseline tracking-tight">
          <span className={`font-black ${dark ? 'text-white' : 'text-[#10284D]'} ${textSize}`}>
            Klámbi
          </span>
          <span className={`font-medium ${dark ? 'text-cyan-300' : 'text-[#3A7BF7]'} ${textSize}`}>
            .id
          </span>
        </div>
      </div>
    );
  }

  // Full Horizontal Lockup
  return (
    <div
      className={`inline-flex items-center gap-2 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      {imgEl}
      <div className="flex items-baseline tracking-tight">
        <span className={`font-black ${dark ? 'text-white' : 'text-[#10284D]'} ${textSize}`}>
          Klámbi
        </span>
        <span className={`font-medium ${dark ? 'text-cyan-300' : 'text-[#3A7BF7]'} ${textSize}`}>
          .id
        </span>
      </div>
    </div>
  );
}
