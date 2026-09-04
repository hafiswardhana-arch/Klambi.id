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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 h-16 flex items-center px-4 shadow-xs">
      <div className="max-w-md mx-auto w-full flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-3 min-w-0">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 shadow-xs transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <Icon name="ArrowLeftIcon" size={20} className="text-[#10284D]" />
            </Link>
          ) : (
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group">
              <AppLogo variant="full" size="md" />
            </Link>
          )}

          {title && (
            <h1 className="text-base font-extrabold text-[#10284D] truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-2">
          {headerRight ?? (
            <>
              <Link
                href="/keranjang"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 transition-colors"
                aria-label="Keranjang"
              >
                <Icon name="ShoppingCartIcon" size={20} className="text-[#10284D]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-[#E86D50] border-2 border-white" />
              </Link>
              <Link
                href="/profil"
                className="relative flex items-center justify-center w-10 h-10 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 transition-colors"
                aria-label="Pesan & Bantuan"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={20} className="text-[#10284D]" />
                <span className="absolute top-1.5 right-1.5 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}