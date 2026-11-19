import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { getSession } from '@/lib/supabase/session';
import { mapUser } from '@/lib/supabase/mappers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function GET(req: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) return NextResponse.json({ success: false, configured: false }, { status: 503 });
  const session = getSession(req);
  if (!session) return NextResponse.json({ success: false }, { status: 401 });
  const { data } = await db
    .from('users')
    .select('id, username, email, full_name, avatar, city, role, level, is_verified')
    .eq('id', session.uid)
    .maybeSingle();
  if (!data) return NextResponse.json({ success: false }, { status: 401 });
  return NextResponse.json({ success: true, user: mapUser(data) });
}
