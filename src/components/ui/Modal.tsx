'use client';
import React, { useEffect } from 'react';
import Icon from '@/components/ui/AppIcon';

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: 'sm' | 'md' | 'lg' | 'full';
  showClose?: boolean;
}

export default function Modal({
  isOpen,
  onClose,
  title,
  children,
  size = 'md',
  showClose = true,
}: ModalProps) {
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => {
      document.body.style.overflow = '';
    };
  }, [isOpen]);

  if (!isOpen) return null;

  const sizeClasses = {
    sm: 'max-w-sm',
    md: 'max-w-md',
    lg: 'max-w-lg',
    full: 'max-w-full mx-4',
  };

  return (
    <div
      className="fixed inset-0 z-[100] flex items-end sm:items-center justify-center"
      role="dialog"
      aria-modal="true"
      aria-label={title}
    >
      {/* Backdrop */}
      <div
        className="absolute inset-0 bg-foreground/40 backdrop-blur-sm animate-fade-in"
        onClick={onClose}
        aria-hidden="true"
      />
      {/* Panel */}
      <div
        className={`relative w-full ${sizeClasses[size]} bg-card rounded-t-2xl sm:rounded-2xl shadow-modal animate-slide-up max-h-[90vh] flex flex-col`}
      >
        {/* Header */}
        {(title || showClose) && (
          <div className="flex items-center justify-between px-5 pt-5 pb-3 border-b border-border flex-shrink-0">
            {title && (
              <h2 className="text-base font-700 text-foreground">{title}</h2>
            )}
            {showClose && (
              <button
                onClick={onClose}
                className="flex items-center justify-center w-8 h-8 rounded-lg bg-muted hover:bg-secondary transition-colors ml-auto"
                aria-label="Tutup modal"
              >
                <Icon name="XMarkIcon" size={18} className="text-muted-foreground" />
              </button>
            )}
          </div>
        )}
        {/* Content */}
        <div className="overflow-y-auto flex-1 px-5 pb-6 pt-4">{children}</div>
      </div>
    </div>
  );
}