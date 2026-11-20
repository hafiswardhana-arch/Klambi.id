import type { AppRole } from '@/lib/supabase/useMe';

export interface NavItem {
  name: string;
  href: string;
  icon: string;
  /** Only highlight on this exact path (dashboards whose sub-pages have their own tab). */
  exact?: boolean;
}

export interface RoleTheme {
  label: string;
  /** Where the logo and "home" lead for this role. */
  home: string;
  icon: string;
  nav: NavItem[];
  /** Small pill shown next to the logo / on account cards. */
  chip: string;
  /** Hero card background on the role dashboard. */
  hero: string;
  /** Active-tab dot in the bottom menu. */
  dot: string;
  /** Accent for icon tiles on dashboards. */
  tile: string;
}

/**
 * One place that decides how each account type sees the app.
 * Customer: shop, care, scan. Mitra: run the shop / service and get paid. Admin: hold funds, judge disputes, oversee users.
 * All three keep the same brand (navy bar, Poppins, warm background); only the accent and the menus change.
 */
export const ROLE_THEME: Record<AppRole, RoleTheme> = {
  customer: {
    label: 'Customer',
    home: '/',
    icon: 'UserCircleIcon',
    nav: [
      { name: 'Beranda', href: '/', icon: 'HomeIcon', exact: true },
      { name: 'Jasa', href: '/menu-perawatan', icon: 'Cog8ToothIcon' },
      { name: 'Market', href: '/trift-marketplace', icon: 'BuildingStorefrontIcon' },
      { name: 'Rawat', href: '/rawat', icon: 'HeartIcon' },
      { name: 'Notifikasi', href: '/notifikasi', icon: 'BellAlertIcon' },
      { name: 'Saya', href: '/profil', icon: 'UserCircleIcon' },
    ],
    chip: 'bg-sky-100 text-sky-800 ring-sky-200',
    hero: 'bg-navy',
    dot: 'bg-brand-yellow',
    tile: 'bg-sky-50 text-sky-700',
  },
  mitra: {
    label: 'Mitra',
    home: '/mitra',
    icon: 'BuildingStorefrontIcon',
    nav: [
      { name: 'Dasbor', href: '/mitra', icon: 'Squares2X2Icon', exact: true },
      { name: 'Pesanan', href: '/mitra/pesanan', icon: 'ClipboardDocumentListIcon' },
      { name: 'Jual', href: '/jual', icon: 'PlusCircleIcon' },
      { name: 'Chat', href: '/chat', icon: 'ChatBubbleLeftRightIcon' },
      { name: 'Akun', href: '/profil', icon: 'UserCircleIcon' },
    ],
    chip: 'bg-emerald-100 text-emerald-800 ring-emerald-200',
    hero: 'bg-gradient-to-br from-emerald-800 via-emerald-900 to-navy',
    dot: 'bg-emerald-400',
    tile: 'bg-emerald-50 text-emerald-700',
  },
  admin: {
    label: 'Admin',
    home: '/admin',
    icon: 'ShieldCheckIcon',
    nav: [
      { name: 'Dasbor', href: '/admin', icon: 'ChartBarIcon', exact: true },
      { name: 'Escrow', href: '/admin/escrow', icon: 'ShieldCheckIcon' },
      { name: 'Pengguna', href: '/admin/pengguna', icon: 'UsersIcon' },
      { name: 'Notifikasi', href: '/notifikasi', icon: 'BellAlertIcon' },
      { name: 'Akun', href: '/profil', icon: 'UserCircleIcon' },
    ],
    chip: 'bg-violet-100 text-violet-800 ring-violet-200',
    hero: 'bg-gradient-to-br from-violet-900 via-indigo-950 to-navy',
    dot: 'bg-violet-300',
    tile: 'bg-violet-50 text-violet-700',
  },
};

export const ROLE_OF_DB: Record<string, string> = { user: 'Customer', seller: 'Mitra', admin: 'Admin' };
