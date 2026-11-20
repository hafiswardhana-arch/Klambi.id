-- =====================================================================
-- Klámbi.id — HAK AKSES TABEL (WAJIB untuk project Supabase baru)
--
-- Project Supabase yang baru TIDAK otomatis memberi hak akses tabel di schema
-- "public" ke Data API. Tanpa ini, server mendapat error
--   "permission denied for table ..."  (kode 42501)
-- dan semua halaman diam-diam memakai data demo.
--
-- Jalankan di SQL Editor SETELAH schema.sql + escrow.sql. Aman dijalankan ulang.
-- (Sudah termasuk di supabase/setup_all.sql.)
-- =====================================================================

grant usage on schema public to service_role, anon, authenticated;

-- Server (service_role) = satu-satunya yang membaca/menulis data aplikasi
grant all on all tables    in schema public to service_role;
grant all on all sequences in schema public to service_role;
grant execute on all functions in schema public to service_role;

-- Tabel/sequence yang dibuat nanti ikut otomatis
alter default privileges in schema public grant all on tables    to service_role;
alter default privileges in schema public grant all on sequences to service_role;

-- Katalog publik: boleh dibaca anon (read-only; RLS tetap berlaku)
grant select on public.products, public.trift_listings, public.service_partners to anon, authenticated;

-- Pastikan fungsi login/register & escrow tetap TIDAK bisa dipanggil anon / authenticated
do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname in ('login_user','register_user') or p.proname like 'escrow\_%' or p.proname like '\_escrow\_%')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;

-- Segarkan cache skema PostgREST
notify pgrst, 'reload schema';
