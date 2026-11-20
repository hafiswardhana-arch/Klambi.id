/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isCtx, loadOrders, requireUser } from '@/lib/supabase/escrow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** GET /api/admin/escrow — admin-only overview of the escrow account ("penahan dana"). */
export async function GET(req: NextRequest) {
  const ctx = await requireUser(req);
  if (!isCtx(ctx)) return ctx;
  if (ctx.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Hanya admin yang dapat membuka halaman ini.' }, { status: 403 });
  }

  try {
    const [orders, wallet, ledger] = await Promise.all([
      loadOrders(ctx.db, { statuses: ['escrow_held', 'shipped', 'delivered', 'disputed', 'completed', 'refunded'], limit: 60 }),
      ctx.db.from('platform_wallet').select('*').eq('id', 'main').maybeSingle(),
      ctx.db.from('wallet_ledger').select('*').order('created_at', { ascending: false }).limit(15),
    ]);
    const held = orders.filter((o) => ['escrow_held', 'shipped', 'delivered', 'disputed'].includes(o.status));
    return NextResponse.json({
      success: true,
      data: {
        escrowHeld: Number(wallet.data?.escrow_held ?? 0),
        feeIncome: Number(wallet.data?.fee_income ?? 0),
        feePercent: (wallet.data?.fee_bps ?? 500) / 100,
        disputes: orders.filter((o) => o.status === 'disputed'),
        held,
        recent: orders.filter((o) => ['completed', 'refunded'].includes(o.status)).slice(0, 10),
        ledger: (ledger.data || []).map((l: any) => ({
          id: l.id, type: l.entry_type, amount: Number(l.amount), note: l.note, at: l.created_at,
        })),
      },
    });
  } catch (e: any) {
    console.error('admin/escrow:', e.message);
    return NextResponse.json({ success: false, error: 'Gagal memuat data escrow.' }, { status: 502 });
  }
}
