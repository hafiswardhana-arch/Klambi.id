import React from 'react';

type BadgeVariant =
  | 'excellent' |'good' |'fair' |'poor' |'default' |'warning' |'danger' |'info' |'jual' |'rawat' |'escrow' |'available' |'full';

interface BadgeProps {
  variant?: BadgeVariant;
  children: React.ReactNode;
  className?: string;
  size?: 'sm' | 'md';
}

const variantStyles: Record<BadgeVariant, string> = {
  excellent: 'bg-secondary text-primary border border-accent/40',
  good: 'bg-secondary text-primary border border-accent/30',
  fair: 'bg-warning-bg text-warning-foreground border border-warning/30',
  poor: 'bg-danger-bg text-danger border border-danger/30',
  default: 'bg-muted text-muted-foreground border border-border',
  warning: 'bg-warning-bg text-warning-foreground border border-warning/30',
  danger: 'bg-danger-bg text-danger border border-danger/30',
  info: 'bg-info-bg text-info border border-info/30',
  jual: 'bg-secondary text-primary border border-primary/30',
  rawat: 'bg-warning-bg text-warning-foreground border border-warning/30',
  escrow: 'bg-info-bg text-info border border-info/30',
  available: 'bg-secondary text-primary border border-accent/40',
  full: 'bg-danger-bg text-danger border border-danger/30',
};

export default function Badge({
  variant = 'default',
  children,
  className = '',
  size = 'sm',
}: BadgeProps) {
  const sizeStyles = size === 'sm' ? 'text-[11px] px-2 py-0.5' : 'text-xs px-2.5 py-1';
  return (
    <span
      className={`inline-flex items-center gap-1 font-600 rounded-full leading-none ${sizeStyles} ${variantStyles[variant]} ${className}`}
    >
      {children}
    </span>
  );
}