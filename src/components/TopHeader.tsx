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

const iconBtn =
  'relative flex items-center justify-center w-10 h-10 rounded-full text-navy hover:bg-navy/5 active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy';

export default function TopHeader({
  title,
  showBack = false,
  backHref = '/',
  headerRight,
}: TopHeaderProps) {
  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md h-14 flex items-center">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-navy shadow-card active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy flex-shrink-0"
              aria-label="Kembali"
            >
              <Icon name="ArrowLeftIcon" size={20} />
            </Link>
          ) : (
            <Link href="/" aria-label="Beranda Klámbi.id" className="flex items-center flex-shrink-0 h-10 overflow-hidden">
              <AppLogo variant="full" size="sm" />
            </Link>
          )}

          {showBack && title && (
            <h1 className="text-[0.9375rem] font-semibold text-navy truncate">{title}</h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {headerRight ?? (
            <>
              <Link href="/keranjang" className={iconBtn} aria-label="Keranjang">
                <Icon name="ShoppingCartIcon" size={24} />
              </Link>
              <Link href="/chat" className={iconBtn} aria-label="Pesan & Bantuan">
                <Icon name="ChatBubbleLeftRightIcon" size={24} />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
