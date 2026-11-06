'use client';

import React from 'react';

interface AnimatedCardProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  isInteractive?: boolean;
  className?: string;
}

export default function AnimatedCard({
  children,
  isInteractive = true,
  className = '',
  ...props
}: AnimatedCardProps) {
  return (
    <div
      className={`bg-card rounded-3xl border border-border shadow-sm transition-all duration-200 ease-out ${
        isInteractive
          ? 'cursor-pointer hover:shadow-md hover:-translate-y-0.5 active:scale-[0.98]'
          : ''
      } ${className}`}
      {...props}
    >
      {children}
    </div>
  );
}
