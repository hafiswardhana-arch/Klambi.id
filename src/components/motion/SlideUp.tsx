'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface SlideUpProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  duration?: number; // ms
  delay?: number;    // ms
  distance?: number; // px
  className?: string;
}

export default function SlideUp({
  children,
  duration = 380,
  delay = 0,
  distance = 20,
  className = '',
  style,
  ...props
}: SlideUpProps) {
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
      className={`animate-slide-up ${className}`}
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
