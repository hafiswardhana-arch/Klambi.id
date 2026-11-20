'use client';

import React from 'react';
import { useRole } from '@/lib/supabase/useMe';
import RoleAccount from '@/components/roles/RoleAccount';
import ProfileContent from './ProfileContent';

/** "Saya"/"Akun" tab: shoppers get the full customer profile; mitra and admin get their own account page. */
export default function ProfileSwitch() {
  const { role, me, status } = useRole();

  if (role === 'customer' || (status !== 'loading' && !me)) return <ProfileContent />;
  if (me) return <RoleAccount me={me} />;
  return <div className="h-48 animate-pulse rounded-2xl bg-white/70" aria-busy="true" aria-label="Memuat akun" />;
}
