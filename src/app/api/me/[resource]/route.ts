import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/supabase/session';
import { mapCartItem, mapGarment, mapNotification, mapUser } from '@/lib/supabase/mappers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

/** Per-user data. Every query is scoped to the user id from the signed session cookie. */
export async function GET(req: NextRequest, { params }: { params: Promise<{ resource: string }> }) {
  const { resource } = await params;
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ success: false, configured: false }, { status: 503 });
  const session = getSession(req);
  if (!session) return NextResponse.json({ success: false, error: 'Belum login' }, { status: 401 });
  const uid = session.uid;

  const fail = (e: { message: string }) => {
    console.error(`me/${resource}:`, e.message);
    return NextResponse.json({ success: false, error: e.message }, { status: 502 });
  };

  switch (resource) {
    case 'summary': {
      const [u, w, i, c, n] = await Promise.all([
        db
          .from('users')
          .select('id, username, email, full_name, avatar, city, role, level, is_verified')
          .eq('id', uid)
          .maybeSingle(),
        db.from('wallets').select('*').eq('user_id', uid).maybeSingle(),
        db.from('user_impact').select('*').eq('user_id', uid).maybeSingle(),
        db.from('cart_items').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        db.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('unread', true),
      ]);
      if (!u.data) return NextResponse.json({ success: false }, { status: 401 });
      return NextResponse.json({
        success: true,
        data: {
          user: mapUser(u.data),
          wallet: w.data && {
            balance: w.data.balance,
            escrowHeld: w.data.escrow_held,
            ecoPoints: w.data.eco_points,
            voucherCount: w.data.voucher_count,
          },
          impact: i.data && {
            goalPct: i.data.goal_pct,
            kgSaved: Number(i.data.kg_saved),
            rank: i.data.rank_pos,
            scanCount: i.data.scan_count,
          },
          cartCount: c.count ?? 0,
          unreadNotifications: n.count ?? 0,
        },
      });
    }
    case 'notifications': {
      const { data, error } = await db
        .from('notifications')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: false });
      if (error) return fail(error);
      return NextResponse.json({ success: true, data: (data || []).map(mapNotification) });
    }
    case 'garments': {
      const { data, error } = await db
        .from('garments')
        .select('*')
        .eq('user_id', uid)
        .order('scan_date', { ascending: false });
      if (error) return fail(error);
      return NextResponse.json({ success: true, data: (data || []).map(mapGarment) });
    }
    case 'cart': {
      const { data, error } = await db
        .from('cart_items')
        .select('*')
        .eq('user_id', uid)
        .order('created_at', { ascending: true });
      if (error) return fail(error);
      return NextResponse.json({ success: true, data: (data || []).map(mapCartItem) });
    }
    case 'orders': {
      const { data, error } = await db
        .from('orders')
        .select('*, order_items(*)')
        .eq('buyer_id', uid)
        .order('created_at', { ascending: false });
      if (error) return fail(error);
      return NextResponse.json({ success: true, data });
    }
    default:
      return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  }
}
