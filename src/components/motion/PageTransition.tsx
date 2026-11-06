'use client';

import React from 'react';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface PageTransitionProps {
  children: React.ReactNode;
  className?: string;
}

export default function PageTransition({
  children,
  className = '',
}: PageTransitionProps) {
  const prefersReduced = useReducedMotion();

  if (prefersReduced) {
    return <div className={className}>{children}</div>;
  }

  return (
    <div className={`animate-fade-in ${className}`}>
      {children}
    </div>
  );
}
