/* eslint-disable @typescript-eslint/no-explicit-any */
import { NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { mapListing, mapPartner, mapProduct } from '@/lib/supabase/mappers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

const SOURCES: Record<string, { table: string; order: string; asc: boolean; map: (r: any) => unknown }> = {
  products: { table: 'products', order: 'sort_order', asc: true, map: mapProduct },
  listings: { table: 'trift_listings', order: 'listed_at', asc: false, map: mapListing },
  partners: { table: 'service_partners', order: 'rating', asc: false, map: mapPartner },
};

export async function GET(_req: Request, { params }: { params: Promise<{ type: string }> }) {
  const { type } = await params;
  const src = SOURCES[type];
  if (!src) return NextResponse.json({ success: false, error: 'Not found' }, { status: 404 });
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ success: false, configured: false }, { status: 503 });

  const { data, error } = await db.from(src.table).select('*').order(src.order, { ascending: src.asc });
  if (error) {
    console.error(`catalog/${type}:`, error.message);
    return NextResponse.json({ success: false, error: error.message }, { status: 502 });
  }
  return NextResponse.json({ success: true, data: (data || []).map(src.map) });
}
