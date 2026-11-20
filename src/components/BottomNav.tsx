'use client';

import React from 'react';
import Link from 'next/link';
import { usePathname } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { useRole } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

interface BottomNavProps {
  /** Dims the bar (used on the scan screen, where the camera controls take focus). */
  muted?: boolean;
}

/** Bottom menu. Its tabs depend on the account type: customer, mitra or admin (see src/lib/roles.ts). */
export default function BottomNav({ muted = false }: BottomNavProps) {
  const pathname = usePathname();
  const { role } = useRole();
  const theme = ROLE_THEME[role];

  const isActive = (href: string, exact?: boolean) =>
    exact ? pathname === href : pathname === href || pathname?.startsWith(`${href}/`);

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 pointer-events-none pb-[max(0.75rem,env(safe-area-inset-bottom))]">
      <div className="max-w-md md:max-w-xl lg:max-w-2xl mx-auto pointer-events-auto px-4">
        <nav
          aria-label={role === 'customer' ? 'Navigasi utama' : `Navigasi ${theme.label}`}
          className={`rounded-[26px] flex items-stretch justify-between px-1.5 py-1.5 shadow-[0_12px_32px_rgba(11,42,82,0.35)] transition-colors duration-300 ${
            muted ? 'bg-navy-deep/90 backdrop-blur-md' : 'bg-navy'
          }`}
        >
          {theme.nav.map((item) => {
            const active = isActive(item.href, item.exact);
            return (
              <Link
                key={item.href}
                href={item.href}
                aria-current={active ? 'page' : undefined}
                className={`group relative flex flex-1 min-h-[46px] flex-col items-center justify-center gap-0.5 rounded-2xl transition-all duration-200 ease-out focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white/80 active:scale-95 ${
                  active ? 'text-white' : 'text-white/70 hover:text-white'
                }`}
              >
                <Icon
                  name={item.icon}
                  variant="solid"
                  size={21}
                  className={`transition-transform duration-200 ${active ? 'scale-110' : 'group-hover:scale-105'}`}
                  aria-hidden="true"
                />
                <span className={`text-[0.625rem] leading-none tracking-tight ${active ? 'font-semibold' : 'font-medium'}`}>
                  {item.name}
                </span>
                {active && (
                  <span className={`absolute -bottom-0.5 h-1 w-1 rounded-full ${theme.dot}`} aria-hidden="true" />
                )}
              </Link>
            );
          })}
        </nav>
      </div>
    </div>
  );
}
