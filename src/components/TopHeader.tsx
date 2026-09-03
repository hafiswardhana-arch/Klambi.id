'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';

interface TopHeaderProps {
  title?: string;
  showBack?: boolean;
  backHref?: string;
  headerRight?: React.ReactNode;
}

export default function TopHeader({
  title,
  showBack = false,
  backHref = '/',
  headerRight,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-card border-b border-border h-16 flex items-center px-4 shadow-card">
      <div className="max-w-screen-2xl mx-auto w-full flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <Icon name="ArrowLeftIcon" size={20} className="text-foreground" />
            </Link>
          ) : null}
          {!showBack && (
            <Link href="/" className="flex items-center gap-2 flex-shrink-0">
              <AppLogo variant="full" size="md" />
            </Link>
          )}
          {title && (
            <h1 className="text-base font-700 text-foreground truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {headerRight ?? (
            <>
              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary transition-colors"
                aria-label="Chat"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-foreground" />
              </button>
              <button
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary transition-colors"
                aria-label="Keranjang"
              >
                <Icon name="ShoppingCartIcon" size={20} className="text-foreground" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-danger border-2 border-card" />
              </button>
            </>
          )}
        </div>
      </div>
    </header>
  );
}