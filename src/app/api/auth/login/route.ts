import { NextRequest, NextResponse } from 'next/server';
import { getSupabaseAdmin } from '@/lib/supabase/admin';
import { setSessionCookie } from '@/lib/supabase/session';
import { mapUser } from '@/lib/supabase/mappers';

export const runtime = 'nodejs';
export const dynamic = 'force-dynamic';

export async function POST(req: NextRequest) {
  const db = getSupabaseAdmin();
  if (!db) {
    return NextResponse.json({ success: false, configured: false, error: 'Database belum dikonfigurasi.' }, { status: 503 });
  }

  const { identifier, password } = (await req.json().catch(() => ({}))) as { identifier?: string; password?: string };
  if (!identifier?.trim() || !password) {
    return NextResponse.json({ success: false, error: 'Username dan password wajib diisi.' }, { status: 400 });
  }

  const { data, error } = await db.rpc('login_user', { p_identifier: identifier.trim(), p_password: password });
  if (error) {
    console.error('login_user failed:', error.message);
    return NextResponse.json({ success: false, error: 'Layanan login sedang bermasalah.' }, { status: 502 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  if (!row) return NextResponse.json({ success: false, error: 'Username atau password salah.' }, { status: 401 });

  const res = NextResponse.json({ success: true, user: mapUser(row) });
  setSessionCookie(res, row.id, row.username);
  return res;
}
