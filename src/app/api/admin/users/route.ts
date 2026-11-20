/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextRequest, NextResponse } from 'next/server';
import { isCtx, requireUser } from '@/lib/supabase/escrow';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/**
 * GET /api/admin/users — admin-only list of accounts with their role, wallet and order activity.
 * Never returns password hashes or phone numbers.
 */
export async function GET(req: NextRequest) {
  const ctx = await requireUser(req);
  if (!isCtx(ctx)) return ctx;
  if (ctx.role !== 'admin') {
    return NextResponse.json({ success: false, error: 'Hanya admin yang dapat membuka halaman ini.' }, { status: 403 });
  }

  try {
    const [users, wallets, orders] = await Promise.all([
      ctx.db
        .from('users')
        .select('id, username, email, full_name, avatar, city, role, level, is_verified, created_at')
        .order('created_at', { ascending: true }),
      ctx.db.from('wallets').select('user_id, balance, escrow_held'),
      ctx.db.from('orders').select('buyer_id, mitra_id, status, total, platform_fee'),
    ]);
    if (users.error) throw new Error(users.error.message);

    const walletOf = new Map((wallets.data || []).map((w: any) => [w.user_id, w]));
    const ord = orders.data || [];
    const data = (users.data || []).map((u: any) => {
      const asBuyer = ord.filter((o: any) => o.buyer_id === u.id);
      const asMitra = ord.filter((o: any) => o.mitra_id === u.id);
      const w: any = walletOf.get(u.id);
      return {
        id: u.id,
        username: u.username,
        name: u.full_name,
        email: u.email,
        avatar: u.avatar,
        city: u.city,
        role: u.role as 'user' | 'seller' | 'admin',
        level: u.level,
        isVerified: u.is_verified,
        joinedAt: u.created_at,
        balance: Number(w?.balance ?? 0),
        escrowHeld: Number(w?.escrow_held ?? 0),
        buyerOrders: asBuyer.length,
        mitraOrders: asMitra.length,
        disputes: [...asBuyer, ...asMitra].filter((o: any) => o.status === 'disputed').length,
        // What the mitra actually received (total minus platform fee) — same number as on their own dashboard
        mitraRevenue: asMitra
          .filter((o: any) => o.status === 'completed')
          .reduce((s: number, o: any) => s + Number(o.total) - Number(o.platform_fee ?? 0), 0),
      };
    });

    return NextResponse.json({
      success: true,
      data: {
        users: data,
        counts: {
          customer: data.filter((u) => u.role === 'user').length,
          mitra: data.filter((u) => u.role === 'seller').length,
          admin: data.filter((u) => u.role === 'admin').length,
        },
        orders: {
          total: ord.length,
          active: ord.filter((o: any) => ['escrow_held', 'shipped', 'delivered'].includes(o.status)).length,
          completed: ord.filter((o: any) => o.status === 'completed').length,
          gmv: ord.filter((o: any) => o.status === 'completed').reduce((s: number, o: any) => s + Number(o.total), 0),
        },
      },
    });
  } catch (e: any) {
    console.error('admin/users:', e.message);
    return NextResponse.json({ success: false, error: 'Gagal memuat data pengguna.' }, { status: 502 });
  }
}
