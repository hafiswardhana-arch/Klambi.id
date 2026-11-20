/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isCtx, requireUser, rpcErrorResponse } from '@/lib/supabase/escrow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const UUID = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

/**
 * POST /api/escrow/orders/:id/:action
 *   pay      customer  — dana masuk ke rekening escrow Klámbi
 *   ship     mitra     — proses / kirim
 *   deliver  mitra|admin — barang tiba (mulai hitung mundur 48 jam)
 *   confirm  customer  — terima barang → admin lepas dana ke mitra   { rating?, review? }
 *   dispute  customer|mitra — lapor masalah                            { reason }
 *   decline  mitra     — tolak pesanan yang sudah dibayar → refund
 *   cancel   customer  — batalkan sebelum bayar
 *   resolve  admin     — putuskan sengketa                             { decision: 'release'|'refund', note? }
 * Who may do what is enforced inside Postgres (supabase/escrow.sql), not here.
 */
export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string; action: string }> }) {
  const { id, action } = await params;
  if (!UUID.test(id)) return NextResponse.json({ success: false, error: 'ID pesanan tidak valid.' }, { status: 400 });

  const ctx = await requireUser(req);
  if (!isCtx(ctx)) return ctx;
  const body = (await req.json().catch(() => ({}))) as Record<string, any>;

  let call: PromiseLike<{ data: any; error: any }>;
  switch (action) {
    case 'pay':     call = ctx.db.rpc('escrow_pay', { p_order: id, p_buyer: ctx.uid }); break;
    case 'ship':    call = ctx.db.rpc('escrow_ship', { p_order: id, p_mitra: ctx.uid, p_tracking: body.tracking ?? null }); break;
    case 'deliver': call = ctx.db.rpc('escrow_deliver', { p_order: id, p_actor: ctx.uid }); break;
    case 'confirm': {
      const rating = Number.isInteger(body.rating) && body.rating >= 1 && body.rating <= 5 ? body.rating : null;
      call = ctx.db.rpc('escrow_confirm', { p_order: id, p_buyer: ctx.uid, p_rating: rating, p_review: String(body.review ?? '').slice(0, 500) || null });
      break;
    }
    case 'dispute': call = ctx.db.rpc('escrow_dispute', { p_order: id, p_actor: ctx.uid, p_reason: String(body.reason ?? '').slice(0, 500) }); break;
    case 'decline': call = ctx.db.rpc('escrow_decline', { p_order: id, p_mitra: ctx.uid, p_reason: String(body.reason ?? '').slice(0, 300) || null }); break;
    case 'cancel':  call = ctx.db.rpc('escrow_cancel', { p_order: id, p_buyer: ctx.uid }); break;
    case 'resolve': call = ctx.db.rpc('escrow_resolve', { p_order: id, p_admin: ctx.uid, p_decision: String(body.decision ?? ''), p_note: String(body.note ?? '').slice(0, 300) || null }); break;
    default:
      return NextResponse.json({ success: false, error: 'Aksi tidak dikenal.' }, { status: 404 });
  }

  const { data, error } = await call;
  if (error) return rpcErrorResponse(error);
  const o: any = Array.isArray(data) ? data[0] : data;
  return NextResponse.json({ success: true, data: { id: o.id, orderNumber: o.order_number, status: o.status } });
}
