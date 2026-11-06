'use client';

import React from 'react';

interface StaggerItemProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  animation?: 'fade' | 'slide' | 'scale';
  className?: string;
}

export default function StaggerItem({
  children,
  animation = 'slide',
  className = '',
  ...props
}: StaggerItemProps) {
  const animClass = {
    fade: 'animate-fade-in',
    slide: 'animate-card-reveal',
    scale: 'animate-scale-in',
  }[animation];

  return (
    <div className={`${animClass} ${className}`} {...props}>
      {children}
    </div>
  );
}
