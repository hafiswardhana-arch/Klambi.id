'use client';
import React from 'react';
import Link from 'next/link';
import AppLogo from '@/components/ui/AppLogo';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

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
  backHref,
  headerRight,
}: TopHeaderProps) {
  const { role, me } = useRole();
  const theme = ROLE_THEME[role];
  const unread = me?.unreadNotifications ?? 0;

  return (
    <header className="fixed top-0 left-0 right-0 z-50 bg-background/90 backdrop-blur-md h-14 flex items-center">
      <div className="max-w-md md:max-w-2xl lg:max-w-3xl mx-auto w-full px-4 md:px-6 flex items-center justify-between gap-3">
        {/* Left */}
        <div className="flex items-center gap-2 min-w-0 flex-1">
          {showBack ? (
            <Link
              href={backHref ?? theme.home}
              className="flex items-center justify-center w-10 h-10 rounded-full bg-white text-navy shadow-card active:scale-95 transition-all duration-150 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy flex-shrink-0"
              aria-label="Kembali"
            >
              <Icon name="ArrowLeftIcon" size={20} />
            </Link>
          ) : (
            <Link href={theme.home} aria-label={`Beranda Klámbi.id${role === 'customer' ? '' : ` ${theme.label}`}`} className="flex items-center flex-shrink-0 h-10 overflow-hidden">
              <AppLogo variant="full" size="sm" />
            </Link>
          )}

          {showBack && title && (
            <h1 className="text-[0.9375rem] font-semibold text-navy truncate">{title}</h1>
          )}

          {/* Penanda peran: mitra & admin selalu tahu sedang memakai mode apa */}
          {role !== 'customer' && (
            <span className={`inline-flex flex-shrink-0 items-center gap-1 rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ring-1 ${theme.chip}`}>
              <Icon name={theme.icon} variant="solid" size={12} aria-hidden="true" />
              {theme.label}
            </span>
          )}
        </div>

        {/* Right */}
        <div className="flex items-center gap-1 flex-shrink-0">
          {headerRight ?? (
            role === 'customer' ? (
              <>
                <Link href="/keranjang" className={iconBtn} aria-label="Keranjang">
                  <Icon name="ShoppingCartIcon" size={24} />
                </Link>
                <Link href="/chat" className={iconBtn} aria-label="Pesan & Bantuan">
                  <Icon name="ChatBubbleLeftRightIcon" size={24} />
                </Link>
              </>
            ) : (
              <Link href="/notifikasi" className={iconBtn} aria-label={unread ? `Notifikasi, ${unread} belum dibaca` : 'Notifikasi'}>
                <Icon name="BellIcon" size={24} />
                {unread > 0 && (
                  <span className="absolute right-1.5 top-1.5 flex h-4 min-w-4 items-center justify-center rounded-full bg-coral px-1 text-[0.625rem] font-bold text-white" aria-hidden="true">
                    {unread > 9 ? '9+' : unread}
                  </span>
                )}
              </Link>
            )
          )}
        </div>
      </div>
    </header>
  );
}
