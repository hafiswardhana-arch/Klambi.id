'use client';

import { useEffect, useState } from 'react';

export interface MeSummary {
  user: { id: string; username: string; name: string; email: string | null; avatar: string; city: string | null; role: 'user' | 'seller' | 'admin'; level: string | null; isVerified: boolean };
  wallet: { balance: number; escrowHeld: number; ecoPoints: number; voucherCount: number } | null;
  impact: { goalPct: number; kgSaved: number; rank: number; scanCount: number } | null;
  cartCount: number;
  unreadNotifications: number;
  orderCounts: { unpaid: number; escrow: number; shipping: number; toReview: number; disputed: number; completed: number; total: number };
  incomingForMitra: number;
  /** Money I paid that admin is still holding (orders I bought). */
  buyerHeld: number;
  /** Orders whose money is for me: items I sold (customer) or services I did (mitra). */
  sales: { toProcess: number; inProgress: number; waiting: number; disputed: number; completed: number; total: number; incoming: number; earned: number };
  /** The service a mitra runs (laundry, penatu, permak, …). Null for customers. */
  service: MitraService | null;
}

export interface MitraService {
  id: string; name: string; category: string; categoryLabel: string; address: string; services: string[];
  openHours: string; minOrder: string; estimatedPrice: number; rating: number; reviewsCount: number; isVerified: boolean; badge: string | null;
}

/** 'ready' = real data · 'guest' = no session (401) · 'demo' = database not configured (503) · 'error' = server problem */
export type MeStatus = 'loading' | 'ready' | 'guest' | 'demo' | 'error';

/** App-level role: what the UI shows. Guests and demo mode see the customer app. */
export type AppRole = 'customer' | 'mitra' | 'admin';

export const DATA_CHANGED_EVENT = 'klambi:data-changed';
export const notifyDataChanged = () => {
  try { window.dispatchEvent(new Event(DATA_CHANGED_EVENT)); } catch { /* SSR / blocked */ }
};

const ROLE_CACHE_KEY = 'klambi_role';
export const toAppRole = (r?: string | null): AppRole => (r === 'admin' ? 'admin' : r === 'seller' ? 'mitra' : 'customer');

/** Remember the role so the right menu shows on the first paint of the next page (no customer-menu flash). */
export function rememberRole(role: AppRole | null) {
  try {
    if (role && role !== 'customer') localStorage.setItem(ROLE_CACHE_KEY, role);
    else localStorage.removeItem(ROLE_CACHE_KEY);
  } catch { /* storage blocked */ }
}
function cachedRole(): AppRole | null {
  try {
    const v = localStorage.getItem(ROLE_CACHE_KEY);
    return v === 'admin' || v === 'mitra' ? v : null;
  } catch {
    return null;
  }
}

// ---- One shared store: every component using useMe() shares a single request ----
type Snapshot = { me: MeSummary | null; status: MeStatus };
let snapshot: Snapshot = { me: null, status: 'loading' };
let inflight: Promise<void> | null = null;
let listenersBound = false;
const subscribers = new Set<(s: Snapshot) => void>();

function publish(next: Snapshot) {
  snapshot = next;
  if (next.status === 'ready' && next.me) rememberRole(toAppRole(next.me.user.role));
  else if (next.status === 'guest' || next.status === 'demo') rememberRole(null);
  subscribers.forEach((fn) => fn(next));
}

function load(): Promise<void> {
  if (inflight) return inflight;
  inflight = (async () => {
    try {
      const res = await fetch('/api/me/summary', { cache: 'no-store', credentials: 'same-origin' });
      if (res.status === 503) return publish({ me: null, status: 'demo' });
      if (res.status === 401) return publish({ me: null, status: 'guest' });
      const json = await res.json().catch(() => null);
      if (!res.ok || !json?.success) return publish({ me: snapshot.me, status: 'error' });
      publish({ me: json.data as MeSummary, status: 'ready' });
    } catch {
      publish({ me: snapshot.me, status: 'error' });
    }
  })().finally(() => { inflight = null; });
  return inflight;
}

function bindGlobalListeners() {
  if (listenersBound || typeof window === 'undefined') return;
  listenersBound = true;
  window.addEventListener(DATA_CHANGED_EVENT, () => { load(); });
  document.addEventListener('visibilitychange', () => { if (document.visibilityState === 'visible') load(); });
}

/**
 * Single source of truth for the logged-in user's numbers (wallet, impact, order counters) and role.
 * Beranda, Profil, the header and the bottom menu all read from here, so they never disagree.
 * Reloads when a purchase/confirmation happens (DATA_CHANGED_EVENT) and when the tab regains focus.
 */
export function useMe() {
  const [state, setState] = useState<Snapshot>(snapshot);

  useEffect(() => {
    bindGlobalListeners();
    subscribers.add(setState);
    setState(snapshot);
    load(); // refresh on every page mount; concurrent callers share one request
    return () => { subscribers.delete(setState); };
  }, []);

  return { me: state.me, status: state.status, reload: load };
}

/**
 * The role the UI should render for. While loading it uses the role remembered from the last
 * visit, so mitra/admin don't see the customer menu flash on every navigation.
 */
export function useRole() {
  const { me, status } = useMe();
  const [cached, setCached] = useState<AppRole | null>(null);
  useEffect(() => { setCached(cachedRole()); }, []);
  const role: AppRole =
    status === 'ready' && me ? toAppRole(me.user.role) : status === 'loading' || status === 'error' ? cached ?? 'customer' : 'customer';
  return { role, me, status, known: status !== 'loading' || cached !== null };
}

export const rupiah = (n: number) => `Rp ${Math.round(n).toLocaleString('id-ID')}`;
export const initialsOf = (name: string) =>
  name.split(/\s+/).filter(Boolean).slice(0, 2).map((w) => w[0]?.toUpperCase()).join('') || 'K';
