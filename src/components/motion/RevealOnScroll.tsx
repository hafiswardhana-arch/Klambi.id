'use client';

import React from 'react';
import { useInView } from '@/lib/motion/useInView';
import { useReducedMotion } from '@/lib/motion/useReducedMotion';

interface RevealOnScrollProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade' | 'slide-up' | 'scale';
  threshold?: number;
  delay?: number;
  className?: string;
}

export default function RevealOnScroll({
  children,
  animation = 'slide-up',
  threshold = 0.15,
  delay = 0,
  className = '',
  style,
  ...props
}: RevealOnScrollProps) {
  const [ref, isInView] = useInView<HTMLDivElement>({ threshold, triggerOnce: true });
  const prefersReduced = useReducedMotion();

  const animationClass = {
    'fade': 'animate-fade-in',
    'slide-up': 'animate-slide-up',
    'scale': 'animate-scale-in',
  }[animation];

  return (
    <div
      ref={ref}
      className={`transition-all duration-500 ${
        isInView || prefersReduced
          ? `${animationClass} opacity-100`
          : 'opacity-0 translate-y-4'
      } ${className}`}
      style={{
        animationDelay: `${delay}ms`,
        ...style,
      }}
      {...props}
    >
      {children}
    </div>
  );
}
