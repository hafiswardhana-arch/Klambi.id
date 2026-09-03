'use client';

import React, { memo } from 'react';
import KlambiLogo from './KlambiLogo';

interface AppLogoProps {
  variant?: 'full' | 'icon-only' | 'stacked';
  size?: 'sm' | 'md' | 'lg' | 'xl';
  className?: string;
  onClick?: () => void;
  [key: string]: any;
}

const AppLogo = memo(function AppLogo({
  variant = 'full',
  size = 'md',
  className = '',
  onClick,
}: AppLogoProps) {
  return (
    <div
      className={`inline-flex items-center ${onClick ? 'cursor-pointer hover:opacity-80 transition-opacity' : ''} ${className}`}
      onClick={onClick}
    >
      <KlambiLogo variant={variant} size={size} />
    </div>
  );
});

export default AppLogo;
