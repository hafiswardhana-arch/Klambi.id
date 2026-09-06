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
    <header className="fixed top-0 left-0 right-0 z-50 bg-white/95 backdrop-blur-md border-b border-slate-100 h-14 flex items-center px-4 shadow-sm">
      <div className="max-w-md mx-auto w-full flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack ? (
            <Link
              href={backHref}
              className="flex items-center justify-center w-9 h-9 rounded-full bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 shadow-xs transition-colors flex-shrink-0"
              aria-label="Kembali"
            >
              <Icon name="ArrowLeftIcon" size={18} className="text-[#10284D]" />
            </Link>
          ) : (
            /* Logo wrapper with strict height constraint */
            <Link href="/" className="flex items-center gap-2 flex-shrink-0 group h-9 overflow-hidden">
              <AppLogo variant="full" size="md" />
            </Link>
          )}

          {showBack && title && (
            <h1 className="text-sm font-extrabold text-[#10284D] truncate">
              {title}
            </h1>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1.5 flex-shrink-0">
          {headerRight ?? (
            <>
              <Link
                href="/keranjang"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 transition-colors"
                aria-label="Keranjang"
              >
                <Icon name="ShoppingCartIcon" size={18} className="text-[#10284D]" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-[#E86D50] border-2 border-white" />
              </Link>
              <Link
                href="/chat"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 transition-colors"
                aria-label="Pesan & Bantuan"
                title="Pesan & Bantuan"
              >
                <Icon name="ChatBubbleLeftRightIcon" size={18} className="text-[#10284D]" />
                <span className="absolute top-1 right-1 w-2 h-2 rounded-full bg-emerald-500 border-2 border-white" />
              </Link>
              <Link
                href="/profil?modal=settings"
                className="relative flex items-center justify-center w-9 h-9 rounded-xl bg-slate-50 hover:bg-slate-100 text-[#10284D] border border-slate-100 transition-colors"
                aria-label="Pengaturan"
                title="Pengaturan Akun"
              >
                <Icon name="Cog6ToothIcon" size={18} className="text-[#10284D]" />
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}