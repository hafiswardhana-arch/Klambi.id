'use client';

import React from 'react';

interface AnimatedButtonProps extends React.ButtonHTMLAttributes<HTMLButtonElement> {
  children: React.ReactNode;
  variant?: 'primary' | 'secondary' | 'outline' | 'ghost' | 'danger';
  size?: 'sm' | 'md' | 'lg';
  isLoading?: boolean;
  className?: string;
}

export default function AnimatedButton({
  children,
  variant = 'primary',
  size = 'md',
  isLoading = false,
  disabled,
  className = '',
  ...props
}: AnimatedButtonProps) {
  const baseClasses =
    'relative inline-flex items-center justify-center font-extrabold rounded-full transition-all duration-150 ease-out select-none focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 active:scale-[0.97] disabled:opacity-50 disabled:pointer-events-none disabled:active:scale-100';

  const sizeClasses = {
    sm: 'text-xs px-3.5 py-1.5 gap-1.5',
    md: 'text-xs sm:text-sm px-5 py-3 gap-2',
    lg: 'text-sm sm:text-base px-6 py-3.5 gap-2.5',
  }[size];

  const variantClasses = {
    primary:
      'bg-[#10284D] text-white hover:bg-[#163768] shadow-md hover:shadow-lg focus-visible:ring-[#10284D]',
    secondary:
      'bg-white text-[#10284D] hover:bg-slate-50 shadow-sm border border-slate-200 focus-visible:ring-slate-300',
    outline:
      'bg-transparent text-[#10284D] border-2 border-[#10284D] hover:bg-[#10284D]/5 focus-visible:ring-[#10284D]',
    ghost:
      'bg-transparent text-slate-700 hover:bg-slate-100 focus-visible:ring-slate-200',
    danger:
      'bg-[#E05C5C] text-white hover:bg-[#D04A4A] shadow-md focus-visible:ring-[#E05C5C]',
  }[variant];

  return (
    <button
      disabled={disabled || isLoading}
      className={`${baseClasses} ${sizeClasses} ${variantClasses} ${className}`}
      {...props}
    >
      {isLoading ? (
        <>
          <span className="w-4 h-4 border-2 border-current border-t-transparent rounded-full animate-spin flex-shrink-0" />
          <span>Memproses...</span>
        </>
      ) : (
        children
      )}
    </button>
  );
}
