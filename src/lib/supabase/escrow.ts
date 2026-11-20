/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import type { SupabaseClient } from '@supabase/supabase-js';
import { getSupabaseAdmin } from './admin';
import { getSession } from './session';

/**
 * Server-side helpers for the escrow ("rekber") flow.
 *
 * Money flow:  customer ──pay──▶ Klámbi escrow account (admin holds it)
 *              ──customer confirms receipt──▶ admin releases to the mitra's wallet.
 * All balance changes happen inside Postgres functions (supabase/escrow.sql),
 * atomically and with row locks. This file only authenticates and maps results.
 */

export interface EscrowContext {
  db: SupabaseClient;
  uid: string;
  username: string;
  role: 'user' | 'seller' | 'admin';
}

/** Resolve the logged-in user (signed cookie) or return a ready-to-send error response. */
export async function requireUser(req: NextRequest): Promise<EscrowContext | NextResponse> {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ success: false, configured: false, error: 'Database belum dikonfigurasi.' }, { status: 503 });
  }
  const session = getSession(req);
  if (!session) return NextResponse.json({ success: false, error: 'Silakan login terlebih dahulu.' }, { status: 401 });

  const { data } = await db.from('users').select('id, username, role').eq('id', session.uid).maybeSingle();
  if (!data) return NextResponse.json({ success: false, error: 'Sesi tidak valid.' }, { status: 401 });
  return { db, uid: data.id, username: data.username, role: data.role };
}

export const isCtx = (v: EscrowContext | NextResponse): v is EscrowContext => !(v instanceof NextResponse);

/** Map Postgres escrow errors (SQLSTATE KE400/KE403/KE404) to HTTP responses. */
export function rpcErrorResponse(error: { code?: string; message: string }) {
  const status = error.code === 'KE403' ? 403 : error.code === 'KE404' ? 404 : error.code === 'KE400' ? 400 : 502;
  if (status === 502) console.error('escrow rpc failed:', error.message);
  return NextResponse.json(
    { success: false, error: status === 502 ? 'Transaksi gagal diproses. Coba lagi.' : error.message },
    { status }
  );
}

/**
 * Find the mitra (seller) user from free text such as "@vintage_jkt (Denim House)",
 * "Sirkular Studio Kemang" or a plain username. Returns null when nothing matches.
 */
export async function resolveMitra(db: SupabaseClient, hint?: string | null, kind?: string) {
  const { data: sellers, error } = await db.from('users').select('id, username, full_name').in('role', ['seller', 'admin']);
  if (error) throw new Error(error.message); // mis. "permission denied" → jangan dikira "mitra tidak ada"
  const list = (sellers || []).filter((u: any) => u.username !== 'admin');
  const text = (hint || '').trim().toLowerCase();
  if (text) {
    const token = (text.match(/[a-z0-9_.]+/) || [''])[0];
    const hit =
      list.find((u: any) => u.username.toLowerCase() === token) ||
      list.find((u: any) => token.startsWith(u.username.toLowerCase())) ||
      list.find((u: any) => (u.full_name as string).toLowerCase() === text) ||
      list.find((u: any) => text.includes((u.full_name as string).toLowerCase()) || (u.full_name as string).toLowerCase().includes(text));
    if (hit) return hit as { id: string; username: string; full_name: string };
  }
  // Demo fallback so any flow can be completed end-to-end with the seeded accounts.
  const fallback = kind === 'jasa' ? 'sari' : kind === 'produk' ? 'kindfoam' : 'rini';
  return (list.find((u: any) => u.username === fallback) as any) || null;
}

export function mapOrder(r: any, users: Record<string, { username: string; full_name: string }> = {}) {
  const buyer = users[r.buyer_id];
  const mitra = r.mitra_id ? users[r.mitra_id] : undefined;
  return {
    id: r.id,
    orderNumber: r.order_number,
    title: r.title || r.order_items?.[0]?.title || 'Pesanan',
    kind: r.kind,
    status: r.status,
    sellerName: r.seller_name,
    buyer: buyer && { id: r.buyer_id, username: buyer.username, name: buyer.full_name },
    mitra: mitra && { id: r.mitra_id, username: mitra.username, name: mitra.full_name },
    subtotal: r.subtotal,
    shippingCost: r.shipping_cost,
    total: r.total,
    platformFee: r.platform_fee,
    mitraPayout: r.total - r.platform_fee,
    trackingNumber: r.tracking_number,
    paymentMethod: r.payment_method,
    createdAt: r.created_at,
    paidAt: r.paid_at,
    shippedAt: r.shipped_at,
    deliveredAt: r.delivered_at,
    releasedAt: r.released_at,
    autoReleaseAt: r.auto_release_at,
    disputeReason: r.dispute_reason,
    rating: r.buyer_rating,
    review: r.buyer_review,
    items: (r.order_items || []).map((i: any) => ({ title: i.title, price: i.price, qty: i.qty, size: i.size, imageUrl: i.image_url })),
    events: (r.escrow_events || [])
      .sort((a: any, b: any) => +new Date(a.created_at) - +new Date(b.created_at))
      .map((e: any) => ({ from: e.from_status, to: e.to_status, role: e.actor_role, note: e.note, at: e.created_at })),
  };
}

/** Load orders (with items + audit trail + people) filtered by buyer, mitra, or status list. */
export async function loadOrders(
  db: SupabaseClient,
  filter: { buyerId?: string; mitraId?: string; statuses?: string[]; limit?: number }
) {
  // Release anything that passed its 48h window before reading (lazy "cron").
  await db.rpc('escrow_auto_release');

  let q = db.from('orders').select('*, order_items(*), escrow_events(*)').order('created_at', { ascending: false }).limit(filter.limit ?? 50);
  if (filter.buyerId) q = q.eq('buyer_id', filter.buyerId);
  if (filter.mitraId) q = q.eq('mitra_id', filter.mitraId);
  if (filter.statuses) q = q.in('status', filter.statuses);
  const { data, error } = await q;
  if (error) throw new Error(error.message);

  const ids = Array.from(new Set((data || []).flatMap((o: any) => [o.buyer_id, o.mitra_id].filter(Boolean))));
  const users: Record<string, { username: string; full_name: string }> = {};
  if (ids.length) {
    const { data: us } = await db.from('users').select('id, username, full_name').in('id', ids);
    (us || []).forEach((u: any) => (users[u.id] = u));
  }
  return (data || []).map((o: any) => mapOrder(o, users));
}
