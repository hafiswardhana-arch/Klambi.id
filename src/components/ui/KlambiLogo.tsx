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
  const iconDimensions = {
    sm: { w: 36, h: 20 },
    md: { w: 48, h: 26 },
    lg: { w: 90, h: 48 },
    xl: { w: 160, h: 86 },
  };

  const textSizes = {
    sm: 'text-base',
    md: 'text-lg',
    lg: 'text-2xl',
    xl: 'text-4xl',
  };

  const { w, h } = iconDimensions[size] || iconDimensions.md;
  const textSize = textSizes[size] || textSizes.md;

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        <Image
          src="/assets/images/app_icon.png"
          alt="Klámbi.id Logo"
          width={w}
          height={h}
          className="object-contain w-auto h-auto"
          priority
          unoptimized
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-2 select-none ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        <Image
          src="/assets/images/app_icon.png"
          alt="Klámbi.id Logo"
          width={w}
          height={h}
          className="object-contain w-auto h-auto"
          priority
          unoptimized
        />
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
      <Image
        src="/assets/images/app_icon.png"
        alt="Klámbi.id Logo"
        width={w}
        height={h}
        className="object-contain w-auto h-auto"
        priority
        unoptimized
      />
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
