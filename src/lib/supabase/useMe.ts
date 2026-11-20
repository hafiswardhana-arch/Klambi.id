'use client';

import { useCallback, useEffect, useState } from 'react';

export interface MeSummary {
  user: { id: string; username: string; name: string; email: string | null; avatar: string; city: string | null; role: 'user' | 'seller' | 'admin'; level: string | null; isVerified: boolean };
  wallet: { balance: number; escrowHeld: number; ecoPoints: number; voucherCount: number } | null;
  impact: { goalPct: number; kgSaved: number; rank: number; scanCount: number } | null;
  cartCount: number;
  unreadNotifications: number;
  orderCounts: { unpaid: number; escrow: number; shipping: number; toReview: number; disputed: number; completed: number; total: number };
  incomingForMitra: number;
}

/** 'ready' = real data · 'guest' = no session (401) · 'demo' = database not configured (503) · 'error' = server problem */
export type MeStatus = 'loading' | 'ready' | 'guest' | 'demo' | 'error';

export const DATA_CHANGED_EVENT = 'klambi:data-changed';
export const notifyDataChanged = () => {
  try { window.dispatchEvent(new Event(DATA_CHANGED_EVENT)); } catch { /* SSR / blocked */ }
};

/**
 * Single source of truth for the logged-in user's numbers (wallet, impact, order counters).
 * Beranda and Profil both read from here, so they can never disagree.
 * Reloads when a purchase/confirmation happens (DATA_CHANGED_EVENT) and when the tab regains focus.
 */
export function useMe() {
  const [me, setMe] = useState<MeSummary | null>(null);
  const [status, setStatus] = useState<MeStatus>('loading');

  const load = useCallback(async () => {
    try {
      const res = await fetch('/api/me/summary', { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 503) { setStatus('demo'); return; }
      if (res.status === 401) { setMe(null); setStatus('guest'); return; }
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) { setStatus('error'); return; }
      setMe(json.data as MeSummary);
      setStatus('ready');
    } catch {
      setStatus('error');
    }
  }, []);

  useEffect(() => {
    load();
    const onChange = () => load();
    const onVisible = () => { if (document.visibilityState === 'visible') load(); };
    window.addEventListener(DATA_CHANGED_EVENT, onChange);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener(DATA_CHANGED_EVENT, onChange);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  return { me, status, reload: load };
}

export const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'K';
