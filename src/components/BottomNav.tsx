'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';

const navItems = [
  { name: 'Beranda', href: '/', icon: 'HomeIcon' },
  { name: 'Jasa', href: '/menu-perawatan', icon: 'Cog8ToothIcon' },
  { name: 'Market', href: '/trift-marketplace', icon: 'BuildingStorefrontIcon' },
  { name: 'Rawat', href: '/rawat', icon: 'HeartIcon' },
  { name: 'Notifikasi', href: '/notifikasi', icon: 'BellAlertIcon' },
  { name: 'Saya', href: '/profil', icon: 'UserCircleIcon' },
];

interface BottomNavProps {
  /** Dims the bar (used on the scan screen, where the camera controls take focus). */
  muted?: boolean;
}

export default function BottomNav({ muted = false }: BottomNavProps) {
  const pathname = usePathname();

  const isActive = (href: string) =>
    href === '/' ? pathname === '/' : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md mx-auto pointer-events-auto px-4">
        <nav
          aria-label="Navigasi utama"
          className={`rounded-[32px] flex items-stretch justify-between px-2 py-2 shadow-[0_12px_32px_rgba(11,42,82,0.35)] transition-colors duration-300 ${
            muted ? 'bg-navy-deep/90 backdrop-blur-md' : 'bg-navy'
          }`}
        >
          {navItems.map((item) => {
            const active = isActive(item.href);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex flex-1 min-h-[52px] flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95 ${
                  active ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon
                  name={item.icon}
                  variant="solid"
                  size={24}
                  className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                  aria-hidden="true"
                />
                <span className={`text-[10.5px] leading-none tracking-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
                {active && (
                  <span className="absolute -bottom-0.5 h-1 w-1 rounded-full bg-brand-yellow" aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
