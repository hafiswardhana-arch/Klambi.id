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

  const { username, password, fullName, email } = (await req.json().catch(() => ({}))) as {
    username?: string;
    password?: string;
    fullName?: string;
    email?: string;
  };
  if (!username?.trim() || !fullName?.trim() || !password || password.length < 6) {
    return NextResponse.json({ success: false, error: 'Lengkapi data. Password minimal 6 karakter.' }, { status: 400 });
  }
  if (!/^[A-Za-z0-9_.]{3,30}$/.test(username.trim())) {
    return NextResponse.json(
      { success: false, error: 'Username 3–30 karakter: huruf, angka, titik, atau underscore.' },
      { status: 400 }
    );
  }

  const { data, error } = await db.rpc('register_user', {
    p_username: username.trim(),
    p_password: password,
    p_full_name: fullName.trim(),
    p_email: email ?? null,
  });
  if (error) {
    if (error.code === '23505') {
      return NextResponse.json({ success: false, error: 'Username atau email sudah dipakai.' }, { status: 409 });
    }
    console.error('register_user failed:', error.message);
    return NextResponse.json({ success: false, error: 'Pendaftaran gagal diproses.' }, { status: 502 });
  }
  const row = Array.isArray(data) ? data[0] : data;
  const res = NextResponse.json({ success: true, user: mapUser(row) }, { status: 201 });
  setSessionCookie(res, row.id, row.username);
  return res;
}
