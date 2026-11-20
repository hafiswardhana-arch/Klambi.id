/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isCtx, loadOrders, mapOrder, requireUser, resolveMitra, rpcErrorResponse } from '@/lib/supabase/escrow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/escrow/orders?as=buyer|mitra — the logged-in user's orders. */
export async function GET(req: NextRequest) {
  const ctx = await requireUser(req);
  if (!isCtx(ctx)) return ctx;
  const as = req.nextUrl.searchParams.get('as') === 'mitra' ? 'mitra' : 'buyer';
  try {
    const orders = await loadOrders(ctx.db, as === 'mitra' ? { mitraId: ctx.uid } : { buyerId: ctx.uid });
    return NextResponse.json({ success: true, data: orders });
  } catch (e: any) {
    console.error('escrow/orders GET:', e.message);
    return NextResponse.json({ success: false, error: 'Gagal memuat pesanan.' }, { status: 502 });
  }
}

/**
 * POST /api/escrow/orders — create an order (status pending_payment).
 * The amount is re-priced on the server when a catalog item is referenced, so a
 * tampered `amount` from the browser cannot lower the price.
 * Body: { title, kind: 'trift'|'produk'|'jasa', amount, shipping?, method, seller?, refId?, items?, payNow? }
 */
export async function POST(req: NextRequest) {
  const ctx = await requireUser(req);
  if (!isCtx(ctx)) return ctx;

  const body = (await req.json().catch(() => ({}))) as {
    title?: string; kind?: string; amount?: number; shipping?: number; method?: string;
    seller?: string; refId?: string; items?: any[]; payNow?: boolean;
  };
  const kind = body.kind === 'jasa' || body.kind === 'produk' ? body.kind : 'trift';
  const title = (body.title || '').trim() || 'Pesanan Klámbi';
  let amount = Math.round(Number(body.amount));
  const shipping = Math.max(0, Math.round(Number(body.shipping) || 0));
  const method = (body.method || 'GoPay').slice(0, 40);

  // Server-authoritative price for catalog items
  let sellerHint = body.seller;
  if (body.refId) {
    const { data: l } = await ctx.db.from('trift_listings').select('price, seller_name').eq('id', body.refId).maybeSingle();
    if (l) { amount = l.price; sellerHint = sellerHint || l.seller_name; }
    else {
      const { data: p } = await ctx.db.from('products').select('price_now, seller').eq('id', body.refId).maybeSingle();
      if (p) { amount = p.price_now; sellerHint = sellerHint || p.seller; }
    }
  }
  if (!Number.isFinite(amount) || amount <= 0 || amount > 500_000_000) {
    return NextResponse.json({ success: false, error: 'Nominal pesanan tidak valid.' }, { status: 400 });
  }

  const mitra = await resolveMitra(ctx.db, sellerHint, kind);
  if (!mitra) return NextResponse.json({ success: false, error: 'Mitra/penjual tidak ditemukan.' }, { status: 404 });

  const { data, error } = await ctx.db.rpc('escrow_create_order', {
    p_buyer: ctx.uid, p_mitra: mitra.id, p_seller_name: mitra.full_name, p_title: title, p_kind: kind,
    p_subtotal: amount, p_shipping: shipping, p_method: method, p_items: body.items ?? [],
  });
  if (error) return rpcErrorResponse(error);
  let order: any = Array.isArray(data) ? data[0] : data;

  if (body.payNow) {
    const paid = await ctx.db.rpc('escrow_pay', { p_order: order.id, p_buyer: ctx.uid });
    if (paid.error) {
      // Order exists but payment failed (e.g. insufficient Saldo Klámbi) — report why, keep order unpaid.
      const r = rpcErrorResponse(paid.error);
      return r;
    }
    order = Array.isArray(paid.data) ? paid.data[0] : paid.data;
  }
  return NextResponse.json({ success: true, data: mapOrder(order, { [ctx.uid]: { username: ctx.username, full_name: '' }, [mitra.id]: mitra }) }, { status: 201 });
}
