-- =====================================================================
-- Klámbi.id — SISTEM ESCROW (Rekening Bersama)
-- Jalankan SETELAH supabase/schema.sql dan SEBELUM supabase/seed.sql.
-- Aman dijalankan ulang (idempotent).
--
-- ALUR DANA
--   1. Customer membayar  → uang masuk ke rekening escrow milik Klámbi (admin).
--                           Mitra TIDAK menerima apa pun dulu.
--   2. Mitra memproses & mengirim barang / mengerjakan jasa.
--   3. Customer menerima & menekan "Konfirmasi Diterima"
--        → admin melepas dana ke saldo mitra (dipotong biaya platform).
--   4. Ada masalah?  Customer / mitra melapor → status DISPUTED → admin memutuskan:
--        dana dilepas ke mitra, ATAU dikembalikan ke customer.
--   5. Customer diam? Setelah barang tiba, dana otomatis dilepas 48 jam kemudian.
--
-- Semua perpindahan dana dicatat di wallet_ledger, semua perubahan status
-- dicatat di escrow_events (jejak audit). Fungsi hanya bisa dipanggil server
-- (service_role) dan berjalan atomik (baris dikunci dengan FOR UPDATE).
-- =====================================================================

-- ---------------------------------------------------------------------
-- 1. Perluas tabel orders
-- ---------------------------------------------------------------------
alter table public.orders drop constraint if exists orders_status_check;
alter table public.orders add constraint orders_status_check check (
  status in ('pending_payment','escrow_held','shipped','delivered','completed','disputed','refunded','cancelled')
);

alter table public.orders add column if not exists mitra_id        uuid references public.users(id) on delete set null;
alter table public.orders add column if not exists title           text;
alter table public.orders add column if not exists kind            text not null default 'trift';
alter table public.orders add column if not exists platform_fee    integer not null default 0;
alter table public.orders add column if not exists paid_at         timestamptz;
alter table public.orders add column if not exists shipped_at      timestamptz;
alter table public.orders add column if not exists delivered_at    timestamptz;
alter table public.orders add column if not exists released_at     timestamptz;
alter table public.orders add column if not exists auto_release_at timestamptz;
alter table public.orders add column if not exists dispute_reason  text;
alter table public.orders add column if not exists buyer_rating    integer check (buyer_rating between 1 and 5);
alter table public.orders add column if not exists buyer_review    text;

alter table public.orders drop constraint if exists orders_kind_check;
alter table public.orders add constraint orders_kind_check check (kind in ('trift','produk','jasa'));

create index if not exists orders_mitra_idx on public.orders (mitra_id, created_at desc);
create sequence if not exists public.order_number_seq start 2000;

-- ---------------------------------------------------------------------
-- 2. Rekening escrow platform + buku besar + jejak audit
-- ---------------------------------------------------------------------
create table if not exists public.platform_wallet (
  id          text primary key default 'main' check (id = 'main'),   -- satu rekening saja
  escrow_held bigint  not null default 0,    -- uang customer yang SEDANG ditahan admin
  fee_income  bigint  not null default 0,    -- pendapatan biaya platform
  fee_bps     integer not null default 500   -- biaya platform: 500 = 5,00% dari harga barang/jasa
);
alter table public.platform_wallet add column if not exists insurance_fee integer not null default 2500;  -- proteksi pembeli (flat, Rp)
insert into public.platform_wallet (id) values ('main') on conflict do nothing;

create table if not exists public.wallet_ledger (
  id         uuid primary key default gen_random_uuid(),
  order_id   uuid references public.orders(id) on delete set null,
  account    text not null check (account in ('platform_escrow','platform_fee','user_wallet')),
  user_id    uuid references public.users(id) on delete set null,
  entry_type text not null check (entry_type in
             ('WALLET_DEBIT','PAYMENT_IN','RELEASE_TO_MITRA','PLATFORM_FEE','REFUND_TO_BUYER')),
  amount     bigint not null,
  note       text,
  created_at timestamptz not null default clock_timestamp()
);
create index if not exists wallet_ledger_order_idx on public.wallet_ledger (order_id);

create table if not exists public.escrow_events (
  id          uuid primary key default gen_random_uuid(),
  order_id    uuid not null references public.orders(id) on delete cascade,
  from_status text,
  to_status   text not null,
  actor_id    uuid references public.users(id) on delete set null,
  actor_role  text not null,                 -- buyer | mitra | admin | system
  note        text,
  created_at  timestamptz not null default clock_timestamp()
);
create index if not exists escrow_events_order_idx on public.escrow_events (order_id, created_at);

alter table public.platform_wallet enable row level security;
alter table public.wallet_ledger   enable row level security;
alter table public.escrow_events   enable row level security;

-- ---------------------------------------------------------------------
-- 3. Fungsi bantu (internal)
-- ---------------------------------------------------------------------
create or replace function public._escrow_fail(p_code text, p_msg text)
returns void language plpgsql as $$
begin
  raise exception '%', p_msg using errcode = p_code;   -- KE400 ditolak · KE403 dilarang · KE404 tidak ada
end $$;

create or replace function public._escrow_event(p_order uuid, p_from text, p_to text, p_actor uuid, p_role text, p_note text)
returns void language sql as $$
  insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note)
  values (p_order, p_from, p_to, p_actor, p_role, p_note);
$$;

create or replace function public._escrow_lock(p_order uuid)
returns public.orders language plpgsql as $$
declare o public.orders;
begin
  select * into o from public.orders where id = p_order for update;
  if not found then perform public._escrow_fail('KE404', 'Pesanan tidak ditemukan.'); end if;
  return o;
end $$;

-- Lepas dana: escrow → saldo mitra (dipotong biaya platform)
create or replace function public._escrow_release(p_order uuid, p_actor uuid, p_role text, p_note text)
returns public.orders language plpgsql as $$
declare o public.orders; payout bigint; prev text;
begin
  o := public._escrow_lock(p_order);
  prev := o.status;
  if o.status not in ('shipped','delivered','disputed') then
    perform public._escrow_fail('KE400', 'Dana hanya bisa dicairkan untuk pesanan yang sedang dikirim, sudah tiba, atau dalam sengketa.');
  end if;
  payout := o.total - o.platform_fee;

  update public.wallets set balance = balance + payout, escrow_held = greatest(escrow_held - payout, 0) where user_id = o.mitra_id;
  update public.wallets set escrow_held = greatest(escrow_held - o.total, 0) where user_id = o.buyer_id;
  update public.platform_wallet set escrow_held = escrow_held - o.total, fee_income = fee_income + o.platform_fee where id = 'main';

  insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note)
  values (o.id, 'platform_escrow', o.mitra_id, 'RELEASE_TO_MITRA', payout, 'Dana dilepas admin ke saldo mitra');
  insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note)
  values (o.id, 'platform_fee', null, 'PLATFORM_FEE', o.platform_fee, 'Biaya platform + proteksi pembeli Klámbi');

  update public.orders set status = 'completed', released_at = now(), auto_release_at = null where id = o.id returning * into o;
  perform public._escrow_event(o.id, prev, 'completed', p_actor, p_role, p_note);
  return o;
end $$;

-- Kembalikan dana: escrow → saldo Klámbi customer
create or replace function public._escrow_refund(p_order uuid, p_actor uuid, p_role text, p_note text)
returns public.orders language plpgsql as $$
declare o public.orders; payout bigint; prev text;
begin
  o := public._escrow_lock(p_order);
  prev := o.status;
  if o.status not in ('escrow_held','disputed') then
    perform public._escrow_fail('KE400', 'Refund hanya untuk pesanan yang dananya masih ditahan atau sedang disengketakan.');
  end if;
  payout := o.total - o.platform_fee;

  update public.wallets set balance = balance + o.total, escrow_held = greatest(escrow_held - o.total, 0) where user_id = o.buyer_id;
  update public.wallets set escrow_held = greatest(escrow_held - payout, 0) where user_id = o.mitra_id;
  update public.platform_wallet set escrow_held = escrow_held - o.total where id = 'main';

  insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note)
  values (o.id, 'platform_escrow', o.buyer_id, 'REFUND_TO_BUYER', o.total, 'Dana dikembalikan ke saldo Klámbi customer');

  update public.orders set status = 'refunded', released_at = now(), auto_release_at = null where id = o.id returning * into o;
  perform public._escrow_event(o.id, prev, 'refunded', p_actor, p_role, p_note);
  return o;
end $$;

-- ---------------------------------------------------------------------
-- 4. API escrow (dipanggil server)
-- ---------------------------------------------------------------------

-- Customer membuat pesanan (belum dibayar)
create or replace function public.escrow_create_order(
  p_buyer uuid, p_mitra uuid, p_seller_name text, p_title text, p_kind text,
  p_subtotal integer, p_shipping integer, p_method text, p_items jsonb default '[]'::jsonb)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders; bps integer; ins integer; fee integer;
begin
  if p_subtotal is null or p_subtotal <= 0 then perform public._escrow_fail('KE400', 'Nominal pesanan tidak valid.'); end if;
  if p_buyer = p_mitra then perform public._escrow_fail('KE400', 'Tidak bisa membeli dari akun sendiri.'); end if;
  if not exists (select 1 from public.users where id = p_buyer) then perform public._escrow_fail('KE404', 'Pembeli tidak ditemukan.'); end if;
  if not exists (select 1 from public.users where id = p_mitra) then perform public._escrow_fail('KE404', 'Mitra/penjual tidak ditemukan.'); end if;
  if p_kind not in ('trift','produk','jasa') then perform public._escrow_fail('KE400', 'Jenis pesanan tidak valid.'); end if;

  -- Customer membayar: harga + biaya platform (5%) + proteksi pembeli + ongkir.
  -- Mitra menerima harga + ongkir PENUH; biaya platform + proteksi menjadi pendapatan Klámbi.
  select fee_bps, insurance_fee into bps, ins from public.platform_wallet where id = 'main';
  fee := round(p_subtotal::bigint * bps / 10000.0) + ins;

  insert into public.orders (order_number, buyer_id, mitra_id, seller_name, title, kind, status, subtotal, shipping_cost, total, platform_fee, payment_method)
  values ('ORD-KLM-' || to_char(now(), 'YYYY') || '-' || lpad(nextval('public.order_number_seq')::text, 4, '0'),
          p_buyer, p_mitra, p_seller_name, p_title, p_kind, 'pending_payment',
          p_subtotal, coalesce(p_shipping, 0), p_subtotal + coalesce(p_shipping, 0) + fee, fee, p_method)
  returning * into o;

  insert into public.order_items (order_id, title, price, qty, size, image_url)
  select o.id, coalesce(i->>'title', p_title), coalesce((i->>'price')::int, p_subtotal), coalesce((i->>'qty')::int, 1), i->>'size', i->>'imageUrl'
  from jsonb_array_elements(case when jsonb_array_length(p_items) = 0 then jsonb_build_array(jsonb_build_object('title', p_title, 'price', p_subtotal, 'qty', 1)) else p_items end) i;

  perform public._escrow_event(o.id, null, 'pending_payment', p_buyer, 'buyer', 'Pesanan dibuat');
  return o;
end $$;

-- Customer membayar → dana MASUK KE REKENING ESCROW KLÁMBI (bukan ke mitra)
create or replace function public.escrow_pay(p_order uuid, p_buyer uuid)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders; bal bigint;
begin
  o := public._escrow_lock(p_order);
  if o.buyer_id <> p_buyer then perform public._escrow_fail('KE403', 'Ini bukan pesanan Anda.'); end if;
  if o.status <> 'pending_payment' then perform public._escrow_fail('KE400', 'Pesanan ini sudah dibayar atau tidak bisa dibayar lagi.'); end if;

  -- Bayar pakai Saldo Klámbi → saldo customer dipotong. Metode lain (GoPay, VA, dll) = dana masuk lewat payment gateway.
  if o.payment_method = 'Saldo Klámbi' then
    select balance into bal from public.wallets where user_id = o.buyer_id for update;
    if coalesce(bal, 0) < o.total then perform public._escrow_fail('KE400', 'Saldo Klámbi tidak cukup untuk pembayaran ini.'); end if;
    update public.wallets set balance = balance - o.total where user_id = o.buyer_id;
    insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note)
    values (o.id, 'user_wallet', o.buyer_id, 'WALLET_DEBIT', o.total, 'Pembayaran dari Saldo Klámbi');
  end if;

  update public.platform_wallet set escrow_held = escrow_held + o.total where id = 'main';
  update public.wallets set escrow_held = escrow_held + o.total where user_id = o.buyer_id;
  update public.wallets set escrow_held = escrow_held + (o.total - o.platform_fee) where user_id = o.mitra_id;  -- "akan diterima" mitra
  insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note)
  values (o.id, 'platform_escrow', o.buyer_id, 'PAYMENT_IN', o.total, 'Dana customer ditahan di rekening escrow Klámbi');

  update public.orders set status = 'escrow_held', paid_at = now() where id = o.id returning * into o;
  perform public._escrow_event(o.id, 'pending_payment', 'escrow_held', p_buyer, 'buyer', 'Pembayaran diterima, dana ditahan admin');
  return o;
end $$;

-- Mitra memproses / mengirim
create or replace function public.escrow_ship(p_order uuid, p_mitra uuid, p_tracking text default null)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders;
begin
  o := public._escrow_lock(p_order);
  if o.mitra_id is distinct from p_mitra then perform public._escrow_fail('KE403', 'Hanya mitra pemilik pesanan yang boleh memproses.'); end if;
  if o.status <> 'escrow_held' then perform public._escrow_fail('KE400', 'Pesanan harus sudah dibayar (dana ditahan) sebelum diproses.'); end if;
  update public.orders set status = 'shipped', shipped_at = now(),
         tracking_number = coalesce(nullif(trim(p_tracking), ''), 'KLM-' || upper(substr(md5(o.id::text), 1, 8)))
   where id = o.id returning * into o;
  perform public._escrow_event(o.id, 'escrow_held', 'shipped', p_mitra, 'mitra', 'Mitra memproses / mengirim pesanan');
  return o;
end $$;

-- Barang tiba (mitra / admin). Memulai hitung mundur auto-release 48 jam.
create or replace function public.escrow_deliver(p_order uuid, p_actor uuid)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders; r text;
begin
  o := public._escrow_lock(p_order);
  select role into r from public.users where id = p_actor;
  if o.mitra_id is distinct from p_actor and r is distinct from 'admin' then perform public._escrow_fail('KE403', 'Hanya mitra atau admin yang boleh menandai pesanan tiba.'); end if;
  if o.status <> 'shipped' then perform public._escrow_fail('KE400', 'Pesanan belum dalam status dikirim.'); end if;
  update public.orders set status = 'delivered', delivered_at = now(), auto_release_at = now() + interval '48 hours' where id = o.id returning * into o;
  perform public._escrow_event(o.id, 'shipped', 'delivered', p_actor, case when r = 'admin' then 'admin' else 'mitra' end, 'Pesanan tiba di customer; menunggu konfirmasi (maks. 48 jam)');
  return o;
end $$;

-- Customer menerima & puas → admin melepas dana ke mitra
create or replace function public.escrow_confirm(p_order uuid, p_buyer uuid, p_rating integer default null, p_review text default null)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders;
begin
  o := public._escrow_lock(p_order);
  if o.buyer_id <> p_buyer then perform public._escrow_fail('KE403', 'Hanya customer yang boleh mengonfirmasi penerimaan.'); end if;
  if o.status not in ('shipped','delivered') then perform public._escrow_fail('KE400', 'Pesanan belum dikirim, atau sudah selesai / disengketakan.'); end if;
  update public.orders set buyer_rating = p_rating, buyer_review = nullif(trim(p_review), '') where id = o.id;
  return public._escrow_release(o.id, p_buyer, 'buyer', 'Customer mengonfirmasi penerimaan; dana dilepas ke mitra');
end $$;

-- Ada masalah (customer / mitra)
create or replace function public.escrow_dispute(p_order uuid, p_actor uuid, p_reason text)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders; prev text;
begin
  if p_reason is null or length(trim(p_reason)) < 5 then perform public._escrow_fail('KE400', 'Jelaskan masalahnya (minimal 5 karakter).'); end if;
  o := public._escrow_lock(p_order);
  if p_actor <> o.buyer_id and p_actor is distinct from o.mitra_id then perform public._escrow_fail('KE403', 'Hanya customer atau mitra pesanan ini yang boleh melapor.'); end if;
  if o.status not in ('shipped','delivered') then perform public._escrow_fail('KE400', 'Laporan hanya bisa dibuat saat pesanan sedang dikirim atau sudah tiba.'); end if;
  prev := o.status;
  update public.orders set status = 'disputed', dispute_reason = trim(p_reason), auto_release_at = null where id = o.id returning * into o;
  perform public._escrow_event(o.id, prev, 'disputed', p_actor, case when p_actor = o.buyer_id then 'buyer' else 'mitra' end, trim(p_reason));
  return o;
end $$;

-- Mitra menolak pesanan yang sudah dibayar → refund penuh
create or replace function public.escrow_decline(p_order uuid, p_mitra uuid, p_reason text default null)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders;
begin
  o := public._escrow_lock(p_order);
  if o.mitra_id is distinct from p_mitra then perform public._escrow_fail('KE403', 'Hanya mitra pemilik pesanan yang boleh menolak.'); end if;
  if o.status <> 'escrow_held' then perform public._escrow_fail('KE400', 'Pesanan hanya bisa ditolak sebelum diproses.'); end if;
  return public._escrow_refund(o.id, p_mitra, 'mitra', coalesce(nullif(trim(p_reason), ''), 'Mitra menolak pesanan; dana dikembalikan 100% ke customer'));
end $$;

-- Customer membatalkan pesanan yang belum dibayar
create or replace function public.escrow_cancel(p_order uuid, p_buyer uuid)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders;
begin
  o := public._escrow_lock(p_order);
  if o.buyer_id <> p_buyer then perform public._escrow_fail('KE403', 'Ini bukan pesanan Anda.'); end if;
  if o.status <> 'pending_payment' then perform public._escrow_fail('KE400', 'Hanya pesanan yang belum dibayar yang bisa dibatalkan.'); end if;
  update public.orders set status = 'cancelled' where id = o.id returning * into o;
  perform public._escrow_event(o.id, 'pending_payment', 'cancelled', p_buyer, 'buyer', 'Dibatalkan sebelum pembayaran');
  return o;
end $$;

-- Admin memutuskan sengketa: 'release' (ke mitra) atau 'refund' (ke customer)
create or replace function public.escrow_resolve(p_order uuid, p_admin uuid, p_decision text, p_note text default null)
returns public.orders language plpgsql security definer set search_path = public, extensions as $$
declare o public.orders; r text;
begin
  select role into r from public.users where id = p_admin;
  if r is distinct from 'admin' then perform public._escrow_fail('KE403', 'Hanya admin yang boleh memutuskan sengketa.'); end if;
  o := public._escrow_lock(p_order);
  if o.status <> 'disputed' then perform public._escrow_fail('KE400', 'Pesanan ini tidak sedang disengketakan.'); end if;
  if p_decision = 'release' then
    return public._escrow_release(o.id, p_admin, 'admin', coalesce(p_note, 'Admin memutuskan: dana dilepas ke mitra'));
  elsif p_decision = 'refund' then
    return public._escrow_refund(o.id, p_admin, 'admin', coalesce(p_note, 'Admin memutuskan: dana dikembalikan ke customer'));
  end if;
  perform public._escrow_fail('KE400', 'Keputusan harus "release" atau "refund".');
  return o;
end $$;

-- Auto-release: customer tidak merespons 48 jam setelah barang tiba
create or replace function public.escrow_auto_release()
returns integer language plpgsql security definer set search_path = public, extensions as $$
declare rec record; n integer := 0;
begin
  for rec in select id from public.orders where status = 'delivered' and auto_release_at is not null and auto_release_at <= now() loop
    perform public._escrow_release(rec.id, null, 'system', 'Auto-release: tidak ada konfirmasi/laporan dalam 48 jam setelah barang tiba');
    n := n + 1;
  end loop;
  return n;
end $$;

-- ---------------------------------------------------------------------
-- 5. Hak akses: hanya service_role (server) yang boleh memanggil
-- ---------------------------------------------------------------------
do $$
declare f text;
begin
  for f in select p.oid::regprocedure::text from pg_proc p join pg_namespace n on n.oid = p.pronamespace
           where n.nspname = 'public' and (p.proname like 'escrow\_%' or p.proname like '\_escrow\_%')
  loop
    execute format('revoke all on function %s from public, anon, authenticated', f);
    execute format('grant execute on function %s to service_role', f);
  end loop;
end $$;
