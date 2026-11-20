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
      const [u, w, i, c, n, ord, sold, svc] = await Promise.all([
        db
          .from('users')
          .select('id, username, email, full_name, avatar, city, role, level, is_verified')
          .eq('id', uid)
          .maybeSingle(),
        db.from('wallets').select('*').eq('user_id', uid).maybeSingle(),
        db.from('user_impact').select('*').eq('user_id', uid).maybeSingle(),
        db.from('cart_items').select('id', { count: 'exact', head: true }).eq('user_id', uid),
        db.from('notifications').select('id', { count: 'exact', head: true }).eq('user_id', uid).eq('unread', true),
        db.from('orders').select('status, buyer_rating, total').eq('buyer_id', uid),
        // Pesanan yang uangnya untuk akun ini: barang yang dijual (customer) atau layanan (mitra)
        db.from('orders').select('status, total, platform_fee').eq('mitra_id', uid),
        db.from('service_partners').select('*').eq('owner_id', uid),
      ]);
      const mine = ord.data || [];
      const countBy = (f: (o: { status: string; buyer_rating: number | null }) => boolean) => mine.filter(f).length;
      const sales = (sold.data || []) as { status: string; total: number; platform_fee: number | null }[];
      const payout = (o: { total: number; platform_fee: number | null }) => Number(o.total) - Number(o.platform_fee ?? 0);
      const HELD = ['escrow_held', 'shipped', 'delivered', 'disputed'];
      if (!u.data) return NextResponse.json({ success: false }, { status: 401 });
      const s = svc.data?.[0] as any;
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
          // Penghitung "Transaksi Saya" — dihitung dari pesanan sungguhan
          orderCounts: {
            unpaid: countBy((o) => o.status === 'pending_payment'),
            escrow: countBy((o) => o.status === 'escrow_held'),
            shipping: countBy((o) => o.status === 'shipped' || o.status === 'delivered'),
            toReview: countBy((o) => o.status === 'completed' && o.buyer_rating === null),
            disputed: countBy((o) => o.status === 'disputed'),
            completed: countBy((o) => o.status === 'completed'),
            total: mine.length,
          },
          // Uang pembeli yang sedang ditahan admin untuk pesanan yang SAYA beli
          buyerHeld: mine.filter((o) => HELD.includes(o.status)).reduce((t, o) => t + Number(o.total), 0),
          // Sisi penjual/mitra: pesanan yang dananya untuk saya, dicairkan admin setelah selesai
          sales: {
            toProcess: sales.filter((o) => o.status === 'escrow_held').length,
            inProgress: sales.filter((o) => o.status === 'shipped').length,
            waiting: sales.filter((o) => o.status === 'delivered').length,
            disputed: sales.filter((o) => o.status === 'disputed').length,
            completed: sales.filter((o) => o.status === 'completed').length,
            total: sales.length,
            incoming: sales.filter((o) => HELD.includes(o.status)).reduce((t, o) => t + payout(o), 0),
            earned: sales.filter((o) => o.status === 'completed').reduce((t, o) => t + payout(o), 0),
          },
          incomingForMitra: sales.filter((o) => o.status === 'escrow_held' || o.status === 'shipped').length,
          // Layanan milik mitra (laundry, penatu, permak, …)
          service: s
            ? {
                id: s.id, name: s.name, category: s.category, categoryLabel: s.category_label, address: s.address,
                services: s.services ?? [], openHours: s.open_hours, minOrder: s.min_order, estimatedPrice: s.estimated_price,
                rating: Number(s.rating), reviewsCount: s.reviews_count, isVerified: s.is_verified, badge: s.badge,
              }
            : null,
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
