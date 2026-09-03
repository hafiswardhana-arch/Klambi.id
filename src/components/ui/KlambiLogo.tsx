'use client';

import React from 'react';
import AppImage from './AppImage';

interface KlambiLogoProps {
  variant?: 'full' | 'icon-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
}

export default function KlambiLogo({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
}: KlambiLogoProps) {
  // Dimension mapping
  const fullWidths = {
    sm: 110,
    md: 140,
    lg: 180,
    xl: 240,
  };

  const fullHeights = {
    sm: 27,
    md: 34,
    lg: 44,
    xl: 58,
  };

  const iconSizes = {
    sm: 28,
    md: 38,
    lg: 52,
    xl: 76,
  };

  const w = fullWidths[size];
  const h = fullHeights[size];
  const iconSize = iconSizes[size];

  if (variant === 'icon-only') {
    return (
      <div
        className={`inline-flex items-center justify-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        <AppImage
          src="/assets/images/app_icon.png"
          alt="Klámbi.id Icon"
          width={iconSize}
          height={Math.round(iconSize * (126 / 261))}
          className="object-contain flex-shrink-0"
          priority
        />
      </div>
    );
  }

  if (variant === 'stacked') {
    return (
      <div
        className={`flex flex-col items-center justify-center gap-3 ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
        onClick={onClick}
      >
        <AppImage
          src="/assets/images/app_logo.png"
          alt="Klámbi.id Logo"
          width={w * 1.5}
          height={h * 1.5}
          className="object-contain flex-shrink-0"
          priority
        />
      </div>
    );
  }

  // Full Logo (horizontal)
  return (
    <div
      className={`inline-flex items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      <AppImage
        src="/assets/images/app_logo.png"
        alt="Klámbi.id Logo"
        width={w}
        height={h}
        className="object-contain flex-shrink-0"
        priority
      />
    </div>
  );
}
