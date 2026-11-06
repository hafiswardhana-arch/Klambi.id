'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface ScaleInProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number;
  delay?: number;
  className?: string;
}

export default function ScaleIn({
  children,
  duration = 280,
  delay = 0,
  className = '',
  style,
  ...props
}: ScaleInProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return (
      <div className={className} style={style} {...props}>
        {children}
      </div>
    );
  }

  return (
    <div
      className={`animate-scale-in ${className}`}
      style={{
        animationDuration: `${duration}ms`,
        animationDelay: `${delay}ms`,
        animationFillMode: 'both',
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
