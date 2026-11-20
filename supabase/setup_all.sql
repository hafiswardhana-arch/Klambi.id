-- =====================================================================
-- Klambi.id - SETUP LENGKAP (schema + escrow + grants + data dummy) dalam SATU file.
-- Tempel seluruhnya di Supabase SQL Editor lalu klik Run. Aman dijalankan ulang.
-- (Gabungan dari schema.sql, escrow.sql, grants.sql, seed.sql - jangan edit file ini langsung.)
-- =====================================================================


-- ############ schema.sql ############
-- =====================================================================
-- Klámbi.id — Supabase schema
-- Jalankan SELURUH file ini di: Supabase Dashboard → SQL Editor → New query → Run
-- Aman dijalankan ulang (idempotent): memakai "if not exists" / "or replace".
-- Setelah ini jalankan supabase/seed.sql untuk mengisi data dummy.
-- =====================================================================

create extension if not exists pgcrypto with schema extensions;

-- ---------------------------------------------------------------------
-- USERS & AKUN
-- ---------------------------------------------------------------------
create table if not exists public.users (
  id            uuid primary key default gen_random_uuid(),
  username      text not null,
  email         text,
  full_name     text not null,
  phone         text,
  avatar        text default '🧑‍🦱',
  city          text,
  bio           text,
  role          text not null default 'user' check (role in ('user','seller','admin')),
  level         text default 'Pemula',
  is_verified   boolean not null default false,
  password_hash text not null,
  created_at    timestamptz not null default now()
);
create unique index if not exists users_username_lower_key on public.users (lower(username));
create unique index if not exists users_email_lower_key on public.users (lower(email)) where email is not null;

create table if not exists public.wallets (
  user_id        uuid primary key references public.users(id) on delete cascade,
  balance        bigint not null default 0,      -- Saldo Klámbi (Rp)
  escrow_held    bigint not null default 0,      -- Dana tertahan di escrow (Rp)
  eco_points     integer not null default 0,
  voucher_count  integer not null default 0
);

create table if not exists public.user_impact (
  user_id     uuid primary key references public.users(id) on delete cascade,
  goal_pct    integer not null default 0,        -- progres target (%)
  kg_saved    numeric(8,1) not null default 0,   -- kg tekstil diselamatkan
  rank_pos    integer not null default 99,
  scan_count  integer not null default 0
);

create table if not exists public.addresses (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  label        text not null,
  recipient    text not null,
  phone        text,
  street       text not null,
  city         text not null,
  postal_code  text,
  is_primary   boolean not null default false
);

create table if not exists public.payment_methods (
  id            uuid primary key default gen_random_uuid(),
  user_id       uuid not null references public.users(id) on delete cascade,
  type          text not null check (type in ('bank','ewallet','card')),
  provider      text not null,
  masked_number text not null,
  is_primary    boolean not null default false
);

-- ---------------------------------------------------------------------
-- KATALOG (dibaca semua pengguna)
-- ---------------------------------------------------------------------
create table if not exists public.products (            -- "Featured Drops" di Beranda
  id             text primary key,
  category_title text,
  name           text not null,
  category       text not null,
  price_now      integer not null,
  price_orig     integer not null,
  condition      text,
  score          integer,
  fabric         text,
  color_scheme   text,
  icon_text      text,
  image_url      text,
  description    text,
  seller         text,
  location       text,
  sort_order     integer not null default 0
);

create table if not exists public.trift_listings (      -- Marketplace Trift
  id                 text primary key,
  title              text not null,
  brand              text,
  category           text not null,
  size               text,
  color              text,
  price              integer not null,
  original_price     integer,
  ai_score           integer,
  condition_label    text,
  ai_description     text,
  image_url          text,
  image_alt          text,
  seller_name        text,
  seller_rating      numeric(2,1),
  seller_total_sales integer,
  seller_location    text,
  seller_avatar      text,
  listed_at          date,
  tags               text[] not null default '{}',
  is_verified        boolean not null default false
);

create table if not exists public.service_partners (    -- Jasa & Perawatan
  id              text primary key,
  name            text not null,
  category        text not null check (category in ('permak','cuci','recolor','upcycle')),
  category_label  text,
  lat             double precision not null,
  lng             double precision not null,
  rating          numeric(2,1),
  reviews_count   integer,
  estimated_price integer,
  is_verified     boolean not null default false,
  address         text,
  services        text[] not null default '{}',
  open_hours      text,
  min_order       text,
  badge           text
);

-- ---------------------------------------------------------------------
-- DATA PER PENGGUNA
-- ---------------------------------------------------------------------
create table if not exists public.cart_items (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  store_name     text,
  category       text,
  title          text not null,
  condition      text,
  price          integer not null,
  original_price integer,
  selected       boolean not null default true,
  emoji          text,
  image_url      text,
  is_clothing    boolean not null default true,
  color          text,
  size           text,
  brand          text,
  created_at     timestamptz not null default now()
);

create table if not exists public.notifications (
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  title          text not null,
  descr          text,
  type           text not null check (type in ('order','care','ai','promo','impact')),
  category_label text,
  target_href    text,
  action_text    text,
  details        text,
  icon           text,
  order_number   text,
  badge_color    text,
  unread         boolean not null default true,
  created_at     timestamptz not null default now()
);

create table if not exists public.garments (            -- Lemari digital / Rawat
  id                    uuid primary key default gen_random_uuid(),
  user_id               uuid not null references public.users(id) on delete cascade,
  title                 text not null,
  category              text,
  category_type         text,
  scan_date             date,
  score                 integer,
  status_badge          text,
  summary               text,
  fabric                text,
  icon_text             text,
  parameters            jsonb not null default '{}'::jsonb,
  care_steps            jsonb not null default '[]'::jsonb,
  recommendation_action text,
  created_at            timestamptz not null default now()
);

create table if not exists public.garment_scans (       -- Riwayat hasil Wearwise AI (Gemini)
  id             uuid primary key default gen_random_uuid(),
  user_id        uuid not null references public.users(id) on delete cascade,
  garment_type   text,
  gcs_score      integer,
  condition_grade text,
  primary_action text,
  result         jsonb not null default '{}'::jsonb,
  created_at     timestamptz not null default now()
);

create table if not exists public.orders (
  id              uuid primary key default gen_random_uuid(),
  order_number    text not null unique,
  buyer_id        uuid not null references public.users(id) on delete cascade,
  seller_name     text,
  status          text not null check (status in ('pending_payment','escrow_held','shipped','delivered','completed','cancelled')),
  subtotal        integer not null,
  shipping_cost   integer not null default 0,
  total           integer not null,
  tracking_number text,
  payment_method  text,
  created_at      timestamptz not null default now()
);

create table if not exists public.order_items (
  id        uuid primary key default gen_random_uuid(),
  order_id  uuid not null references public.orders(id) on delete cascade,
  title     text not null,
  price     integer not null,
  qty       integer not null default 1,
  size      text,
  image_url text
);

create table if not exists public.service_bookings (
  id           uuid primary key default gen_random_uuid(),
  user_id      uuid not null references public.users(id) on delete cascade,
  partner_id   text references public.service_partners(id),
  service      text not null,
  status       text not null check (status in ('dijadwalkan','dijemput','diproses','selesai','dibatalkan')),
  price        integer,
  scheduled_at timestamptz,
  notes        text,
  created_at   timestamptz not null default now()
);

create table if not exists public.chat_conversations (
  id          uuid primary key default gen_random_uuid(),
  user_id     uuid not null references public.users(id) on delete cascade,
  seller_name text not null,
  avatar      text,
  unread      boolean not null default false,
  updated_at  timestamptz not null default now()
);

create table if not exists public.chat_messages (
  id              uuid primary key default gen_random_uuid(),
  conversation_id uuid not null references public.chat_conversations(id) on delete cascade,
  sender          text not null check (sender in ('user','seller')),
  body            text not null,
  created_at      timestamptz not null default now()
);

create index if not exists cart_items_user_idx    on public.cart_items (user_id);
create index if not exists notifications_user_idx on public.notifications (user_id, created_at desc);
create index if not exists garments_user_idx      on public.garments (user_id);
create index if not exists orders_buyer_idx       on public.orders (buyer_id, created_at desc);
create index if not exists bookings_user_idx      on public.service_bookings (user_id);
create index if not exists chat_msgs_conv_idx     on public.chat_messages (conversation_id, created_at);

-- ---------------------------------------------------------------------
-- LOGIN / REGISTER (password di-hash bcrypt di dalam database)
-- ---------------------------------------------------------------------
create or replace function public.login_user(p_identifier text, p_password text)
returns table (id uuid, username text, email text, full_name text, avatar text, city text, role text, level text, is_verified boolean)
language sql security definer set search_path = public, extensions
as $$
  select u.id, u.username, u.email, u.full_name, u.avatar, u.city, u.role, u.level, u.is_verified
  from public.users u
  where (lower(u.username) = lower(p_identifier) or lower(u.email) = lower(p_identifier))
    and u.password_hash = extensions.crypt(p_password, u.password_hash)
  limit 1;
$$;

create or replace function public.register_user(p_username text, p_password text, p_full_name text, p_email text default null)
returns table (id uuid, username text, email text, full_name text, avatar text, city text, role text, level text, is_verified boolean)
language plpgsql security definer set search_path = public, extensions
as $$
declare new_id uuid;
begin
  insert into public.users (username, email, full_name, password_hash)
  values (trim(p_username), nullif(trim(p_email), ''), trim(p_full_name), extensions.crypt(p_password, extensions.gen_salt('bf')))
  returning public.users.id into new_id;

  insert into public.wallets (user_id) values (new_id);
  insert into public.user_impact (user_id) values (new_id);

  return query
    select u.id, u.username, u.email, u.full_name, u.avatar, u.city, u.role, u.level, u.is_verified
    from public.users u where u.id = new_id;
end;
$$;

-- Hanya server (service_role) yang boleh memanggil fungsi login/register.
revoke all on function public.login_user(text, text) from public, anon, authenticated;
revoke all on function public.register_user(text, text, text, text) from public, anon, authenticated;
grant execute on function public.login_user(text, text) to service_role;
grant execute on function public.register_user(text, text, text, text) to service_role;

-- ---------------------------------------------------------------------
-- ROW LEVEL SECURITY
-- Aplikasi mengakses database hanya lewat server (service_role, bypass RLS).
-- Tabel pribadi: RLS aktif TANPA policy → anon key tidak bisa baca apa pun.
-- Katalog publik: boleh dibaca anon (read-only).
-- ---------------------------------------------------------------------
alter table public.users              enable row level security;
alter table public.wallets            enable row level security;
alter table public.user_impact        enable row level security;
alter table public.addresses          enable row level security;
alter table public.payment_methods    enable row level security;
alter table public.cart_items         enable row level security;
alter table public.notifications      enable row level security;
alter table public.garments           enable row level security;
alter table public.garment_scans      enable row level security;
alter table public.orders             enable row level security;
alter table public.order_items        enable row level security;
alter table public.service_bookings   enable row level security;
alter table public.chat_conversations enable row level security;
alter table public.chat_messages      enable row level security;
alter table public.products           enable row level security;
alter table public.trift_listings     enable row level security;
alter table public.service_partners   enable row level security;

drop policy if exists "catalog read products" on public.products;
create policy "catalog read products" on public.products for select to anon, authenticated using (true);
drop policy if exists "catalog read listings" on public.trift_listings;
create policy "catalog read listings" on public.trift_listings for select to anon, authenticated using (true);
drop policy if exists "catalog read partners" on public.service_partners;
create policy "catalog read partners" on public.service_partners for select to anon, authenticated using (true);


-- ############ escrow.sql ############
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


-- ############ grants.sql ############
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


-- ############ seed.sql ############
-- =====================================================================
-- Klámbi.id — DATA DUMMY (seed)
-- Jalankan SETELAH supabase/schema.sql. Aman dijalankan ulang: data dummy
-- lama dihapus dulu lalu diisi ulang (tidak menyentuh akun yang kamu daftarkan sendiri).
--
-- AKUN DEMO (semua password: klambi123, kecuali admin → admin123)
--   hafiz     Muhammad Hafiz Maulana  — akun utama, data paling lengkap
--   rini      Rini Anggraini          — penjual thrift, Bandung
--   dewi      Dewi Lestari            — pembeli aktif, Jakarta
--   bagas     Bagas Pratama           — pengguna Eco, Yogyakarta
--   sari      Sari Wulandari          — pemilik jasa permak, Surabaya
--   admin     Administrator           — role admin (panel escrow: /admin/escrow)
--   Mitra/penjual untuk alur escrow (password klambi123): rini, sari,
--   vintage_jkt (Denim House), sirkular_kemang (Sirkular Studio Kemang),
--   kindfoam (Kindfoam Official), batik_solo (Batik Solo Heritage)
-- =====================================================================

delete from public.users where lower(username) in ('hafiz','rini','dewi','bagas','sari','admin','vintage_jkt','sirkular_kemang','kindfoam','batik_solo');
delete from public.products;
delete from public.trift_listings;
delete from public.service_partners;

insert into public.users (username, email, full_name, phone, avatar, city, bio, role, level, is_verified, password_hash) values
  ('hafiz', 'hafiz@klambi.id', 'Muhammad Hafiz Maulana', '081234567801', '🧑‍🦱', 'Jakarta Selatan', 'Pecinta thrift & upcycle. Lemari penuh jaket denim.', 'user', 'Kontributor Gold', true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('rini', 'rini@klambi.id', 'Rini Anggraini', '081234567802', '👩', 'Bandung', 'Jual preloved berkualitas, semua lolos scan Wearwise AI.', 'seller', 'Penjual Terpercaya', true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('dewi', 'dewi@klambi.id', 'Dewi Lestari', '081234567803', '👩‍🦰', 'Jakarta Barat', 'Suka kemeja flanel dan dress vintage.', 'user', 'Kontributor Silver', true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('bagas', 'bagas@klambi.id', 'Bagas Pratama', '081234567804', '🧔', 'Yogyakarta', 'Mengurangi limbah tekstil satu baju sehari.', 'user', 'Eco Warrior', false, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('sari', 'sari@klambi.id', 'Sari Wulandari', '081234567805', '👩‍🔧', 'Surabaya', 'Penjahit & permak profesional sejak 2012.', 'seller', 'Mitra Jasa', true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('admin', 'admin@klambi.id', 'Administrator', '081234567800', '🛡️', 'Jakarta', 'Akun administrator demo.', 'admin', 'Admin', true, extensions.crypt('admin123', extensions.gen_salt('bf')));

insert into public.wallets (user_id, balance, escrow_held, eco_points, voucher_count)
select u.id, v.balance, v.escrow, v.pts, v.vouch from public.users u
join (values ('hafiz',850000,320000,2450,6),('rini',1275000,185000,1820,2),('dewi',420000,0,960,3),('bagas',150000,0,3100,1),('sari',2340000,450000,700,0),('admin',0,0,0,0)) as v(un,balance,escrow,pts,vouch)
  on lower(u.username)=v.un;

insert into public.user_impact (user_id, goal_pct, kg_saved, rank_pos, scan_count)
select u.id, v.pct, v.kg, v.rk, v.sc from public.users u
join (values ('hafiz',32,12.5,8,12),('rini',78,41.2,2,34),('dewi',45,18.9,5,17),('bagas',91,63.4,1,52),('sari',20,9.3,14,8),('admin',0,0,99,0)) as v(un,pct,kg,rk,sc)
  on lower(u.username)=v.un;

insert into public.addresses (user_id, label, recipient, phone, street, city, postal_code, is_primary)
select u.id, v.label, v.rec, v.phone, v.street, v.city, v.zip, v.pr from public.users u
join (values
 ('hafiz','Rumah','Muhammad Hafiz Maulana','081234567801','Jl. Fatmawati Raya No. 21, Cilandak','Jakarta Selatan','12430',true),
 ('hafiz','Kantor','Muhammad Hafiz Maulana','081234567801','Gedung Cyber 2 Lt. 5, Jl. HR Rasuna Said','Jakarta Selatan','12950',false),
 ('rini','Rumah','Rini Anggraini','081234567802','Jl. Braga No. 44','Bandung','40111',true),
 ('dewi','Rumah','Dewi Lestari','081234567803','Jl. Daan Mogot Km. 11 No. 8','Jakarta Barat','11710',true),
 ('bagas','Kos','Bagas Pratama','081234567804','Jl. Kaliurang Km. 5 No. 17','Yogyakarta','55281',true),
 ('sari','Workshop','Sari Wulandari','081234567805','Jl. Darmo Permai Selatan No. 3','Surabaya','60226',true)
) as v(un,label,rec,phone,street,city,zip,pr) on lower(u.username)=v.un;

insert into public.payment_methods (user_id, type, provider, masked_number, is_primary)
select u.id, v.t, v.p, v.m, v.pr from public.users u
join (values
 ('hafiz','ewallet','GoPay','0812••••7801',true),
 ('hafiz','bank','BCA','••••• 4821',false),
 ('rini','bank','Mandiri','••••• 9033',true),
 ('dewi','ewallet','OVO','0812••••7803',true),
 ('bagas','ewallet','DANA','0812••••7804',true),
 ('sari','bank','BRI','••••• 1177',true)
) as v(un,t,p,m,pr) on lower(u.username)=v.un;

insert into public.products (id, category_title, name, category, price_now, price_orig, condition, score, fabric, color_scheme, icon_text, image_url, description, seller, location, sort_order) values
  ('prod-1', 'Patchwork Denim Jacket', 'Jaket warna-warni', 'Jaket', 185000, 250000, 'Sangat Baik', 92, 'Heavy Denim 14oz & Katun Patchwork', 'from-blue-400 via-emerald-400 to-amber-300', '🧥', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', 'Jaket upcycle artisan dengan teknik patchwork warna-warni cerah. Kondisi serat kain sangat kuat dan kancing logam kokoh.', 'Sirkular Studio Kemang', 'Jakarta Selatan', 0),
  ('prod-2', 'Graphic Long Sleeve Tee', 'Atasan biru motif', 'Kaos', 120000, 200000, 'Baik', 85, '100% Combed Cotton 24s', 'from-cyan-500 to-blue-600', '👕', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', 'Kaos lengan panjang motif grafis biru elektrik. Sablon rubber elastis tanpa pecah dan kerah leher tetap kencang.', 'Vintage Vault Senopati', 'Jakarta Selatan', 1),
  ('prod-3', 'Graphic Mini Skirt', 'Bawahan motif', 'Dress', 95000, 150000, 'Baik', 84, 'Polyester Twill Breathable', 'from-slate-700 via-gray-400 to-slate-200', '👗', 'https://images.unsplash.com/photo-1583496661160-fb5886a0aaaa?w=600&auto=format&fit=crop&q=80', 'Rok mini motif retro monokrom print. Jahitan samping rapi dengan resleting tersembunyi YKK.', 'Thriftique Tebet', 'Jakarta Selatan', 2),
  ('prod-4', 'Windbreaker 90s Vintage', 'Jaket parasut retro', 'Jaket', 175000, 350000, 'Sangat Baik', 94, 'Nylon Taslan Water-repellent', 'from-teal-500 via-purple-500 to-pink-500', '🎽', 'https://images.unsplash.com/photo-1548883354-7622d03aca27?w=600&auto=format&fit=crop&q=80', 'Jaket parasut colorblock khas era 90-an. Tahan angin, ringan, dan warna masih sangat pekat.', 'Archive Retro ID', 'Bandung', 3),
  ('prod-5', 'Kemeja Flannel Sage Green', 'Kemeja flanel kotak', 'Kemeja', 135000, 210000, 'Sangat Baik', 88, '100% Katun Flanel Organik', 'from-emerald-600 to-teal-700', '👔', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', 'Kemeja flanel lembut warna sage green natural. Bebas noda dan serat kain terawat.', 'EcoWardrobe BSD', 'Tangerang', 4),
  ('prod-6', 'Celana Chino Slim Fit', 'Chino khaki casual', 'Celana', 145000, 280000, 'Baik', 86, 'Cotton Stretch Twill', 'from-amber-200 to-amber-400', '👖', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', 'Celana chino warna khaki hangat. Nyaman untuk aktivitas harian dengan potongan slim fit modern.', 'Urban Re-style', 'Jakarta Pusat', 5);

insert into public.trift_listings (id, title, brand, category, size, color, price, original_price, ai_score, condition_label, ai_description, image_url, image_alt, seller_name, seller_rating, seller_total_sales, seller_location, seller_avatar, listed_at, tags, is_verified) values
  ('trift-001', 'Kemeja Flanel Kotak-kotak Merah', 'H&M', 'Kemeja', 'M', 'Merah-Hitam', 65000, 299000, 84, 'Sangat Baik', 'Kemeja flanel dengan kondisi kain sangat baik. Warna merah-hitam masih cerah dan rata. Jahitan rapi di semua sisi. Kancing lengkap dan berfungsi. Tidak ada noda atau robekan.', 'https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80', 'Kemeja flanel kotak-kotak warna merah hitam terbentang rata', 'Rini Anggraini', 4.9, 47, 'Bandung', 'RA', '2026-08-12', array['flanel','casual','unisex']::text[], true),
  ('trift-002', 'Celana Jeans Slim Fit Navy', 'Levi''s', 'Celana', '30', 'Navy Blue', 120000, 650000, 76, 'Cukup Baik', 'Jeans slim fit dengan bahan denim tebal. Ada sedikit fading di area lutut yang menambah karakter vintage. Jahitan masih kuat. Kancing dan resleting berfungsi normal.', 'https://images.unsplash.com/photo-1542272604-787c3835535d?w=600&auto=format&fit=crop&q=80', 'Celana jeans slim fit warna navy biru terbentang di permukaan putih', 'Dimas Pratama', 4.7, 23, 'Jakarta Selatan', 'DP', '2026-08-11', array['jeans','slim-fit','denim']::text[], true),
  ('trift-003', 'Dress Midi Batik Kontemporer', 'Danar Hadi', 'Dress', 'S', 'Coklat-Krem', 95000, 450000, 88, 'Sangat Baik', 'Dress midi batik motif kontemporer dengan kondisi prima. Kain katun halus tanpa kusut. Motif batik cerah dan tidak pudar. Jahitan rapi termasuk di bagian pinggang dan hem.', 'https://images.unsplash.com/photo-1572804013309-59a88b7e92f1?w=600&auto=format&fit=crop&q=80', 'Dress midi batik coklat krem dengan motif kontemporer', 'Siti Nuraini', 5, 89, 'Solo', 'SN', '2026-08-13', array['batik','midi','formal-casual']::text[], true),
  ('trift-004', 'Jaket Bomber Olive Green', 'Uniqlo', 'Jaket', 'L', 'Olive Green', 150000, 799000, 79, 'Cukup Baik', 'Jaket bomber dengan bahan nylon berkualitas. Warna olive green sedikit memudar di area bahu namun masih terlihat bagus. Resleting berfungsi mulus. Tidak ada robekan.', 'https://images.unsplash.com/photo-1591047139829-d91aecb6caea?w=600&auto=format&fit=crop&q=80', 'Jaket bomber warna olive green tergantung di hanger kayu', 'Fajar Nugroho', 4.6, 31, 'Yogyakarta', 'FN', '2026-08-10', array['bomber','casual','streetwear']::text[], false),
  ('trift-005', 'Kaos Oversized Putih Polos', 'Cotton Ink', 'Kaos', 'XL', 'Putih', 35000, 175000, 58, 'Perlu Perhatian', 'Kaos oversized dengan bahan cotton combed. Ada beberapa noda kecil yang tidak terangkat di area dada. Warna putih sedikit kekuningan di area kerah. Jahitan masih kuat.', 'https://images.unsplash.com/photo-1521572267360-ee0c2909d518?w=600&auto=format&fit=crop&q=80', 'Kaos oversized putih polos terbentang di permukaan datar', 'Mega Wulandari', 4.3, 12, 'Surabaya', 'MW', '2026-08-09', array['oversized','basic','casual']::text[], false),
  ('trift-006', 'Kemeja Oxford Biru Muda', 'Marks & Spencer', 'Kemeja', 'M', 'Biru Muda', 85000, 420000, 91, 'Sangat Baik', 'Kemeja oxford dengan bahan katun premium. Kondisi sangat baik mendekati baru. Warna biru muda cerah dan merata. Semua kancing lengkap dan jahitan sempurna di setiap sisi.', 'https://images.unsplash.com/photo-1596755094514-f87e34085b2c?w=600&auto=format&fit=crop&q=80', 'Kemeja oxford biru muda tergantung rapi di hanger putih', 'Andika Saputra', 4.8, 56, 'Jakarta Pusat', 'AS', '2026-08-13', array['oxford','formal','office']::text[], true),
  ('trift-007', 'Celana Kulot Linen Abu-abu', 'Zara', 'Celana', 'S', 'Abu-abu', 75000, 380000, 82, 'Sangat Baik', 'Celana kulot linen dengan drape yang bagus. Warna abu-abu netral masih bersih dan merata. Kain linen berkualitas tanpa kerutan permanen. Resleting tersembunyi berfungsi baik.', 'https://images.unsplash.com/photo-1509631179647-0177331693ae?w=600&auto=format&fit=crop&q=80', 'Celana kulot linen warna abu-abu dengan potongan longgar', 'Laras Setiawati', 4.9, 38, 'Bandung', 'LS', '2026-08-12', array['kulot','linen','minimalis']::text[], true),
  ('trift-008', 'Dress Wrap Floral Musim Panas', 'Mango', 'Dress', 'M', 'Kuning-Hijau', 110000, 550000, 73, 'Cukup Baik', 'Dress wrap dengan motif floral cerah. Warna kuning dan hijau masih vivid meski ada sedikit fading di bagian punggung. Tali pengikat pinggang masih utuh. Kain rayon lembut.', 'https://images.unsplash.com/photo-1612336307429-8a898d10e223?w=600&auto=format&fit=crop&q=80', 'Dress wrap bermotif bunga warna kuning hijau diletakkan di lantai kayu', 'Putri Handayani', 4.5, 19, 'Bali', 'PH', '2026-08-08', array['wrap','floral','summer']::text[], true),
  ('trift-009', 'Jaket Denim Klasik Biru Tua', 'Wrangler', 'Jaket', 'L', 'Biru Tua', 180000, 850000, 68, 'Cukup Baik', 'Jaket denim klasik dengan karakter vintage yang kuat. Fading alami di area siku dan bahu menambah estetika. Jahitan masih kuat. Ada satu kancing yang perlu diganti.', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', 'Jaket denim biru tua klasik dengan efek fading di siku', 'Rizky Ramadhan', 4.4, 28, 'Medan', 'RR', '2026-08-07', array['denim','vintage','classic']::text[], false),
  ('trift-010', 'Kaos Graphic Tee Band Vintage', 'Unknown', 'Kaos', 'L', 'Hitam', 45000, 200000, 62, 'Cukup Baik', 'Kaos graphic tee dengan desain band vintage yang unik. Sablon sedikit retak di beberapa bagian namun masih terbaca jelas. Warna hitam dasar masih pekat. Bahan cotton tebal.', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80', 'Kaos hitam dengan graphic print band vintage terbentang rata', 'Bagas Wicaksono', 4.2, 8, 'Semarang', 'BW', '2026-08-06', array['graphic','vintage','band-tee']::text[], false),
  ('trift-011', 'Kemeja Batik Tulis Motif Parang', 'Batik Keris', 'Kemeja', 'L', 'Coklat-Krem', 200000, 900000, 93, 'Sangat Baik', 'Kemeja batik tulis asli dengan motif parang yang halus. Kondisi hampir sempurna, hanya dipakai 2–3 kali. Warna coklat dan krem sangat kaya dan konsisten. Jahitan tangan rapi.', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', 'Kemeja batik tulis motif parang coklat krem tergantung di hanger', 'Hendra Kusuma', 5, 102, 'Yogyakarta', 'HK', '2026-08-13', array['batik-tulis','parang','formal']::text[], true),
  ('trift-012', 'Celana Chino Krem Slim', 'Pull & Bear', 'Celana', '32', 'Krem', 55000, 280000, 71, 'Cukup Baik', 'Celana chino slim fit warna krem. Ada sedikit noda kecil di bagian saku kiri yang tidak terlalu terlihat. Kain katun masih tebal dan tidak melar. Resleting dan kancing berfungsi baik.', 'https://images.unsplash.com/photo-1624378439575-d8705ad7ae80?w=600&auto=format&fit=crop&q=80', 'Celana chino slim fit warna krem terlipat rapi di permukaan kayu', 'Yoga Pratama', 4.3, 15, 'Malang', 'YP', '2026-08-05', array['chino','slim','casual']::text[], false);

insert into public.service_partners (id, name, category, category_label, lat, lng, rating, reviews_count, estimated_price, is_verified, address, services, open_hours, min_order, badge) values
  ('sp-1', 'Taylor Studio Artisan Fatmawati', 'permak', 'Permak & Jahit', -6.2661, 106.7973, 4.9, 128, 45000, true, 'Jl. Fatmawati No. 18, Jakarta Selatan', array['Potong Panjang Celana','Hemming Chainstitch','Ganti Resleting YKK','Kecilkan Pinggang']::text[], 'Senin–Sabtu, 09.00–18.00', 'Mulai 1 item', 'Terpopuler'),
  ('sp-2', 'CleanCare Signature Workshop Kemang', 'cuci', 'Cuci & Spa Tekstil', -6.2604, 106.8137, 4.8, 94, 75000, true, 'Jl. Kemang Raya No. 42, Jakarta Selatan', array['Deep Clean & Anti-Odor Spa','Dry Cleaning Jas/Gaun','Treatment Anti-Jamur']::text[], 'Setiap Hari, 08.00–20.00', 'Minimal 2 item', null),
  ('sp-3', 'Jahit Kilat Express Senopati', 'permak', 'Permak & Jahit', -6.2316, 106.8085, 4.6, 52, 35000, false, 'Jl. Senopati No. 8, Jakarta Selatan', array['Permak Cepat 1 Hari','Ganti Kancing','Jahit Robekan Ringan']::text[], 'Senin–Jumat, 09.00–17.00', 'Mulai 1 item', null),
  ('sp-4', 'Textile Color Restorer & Dyeing', 'recolor', 'Re-Colour & Celup', -6.2526, 106.7858, 4.9, 76, 120000, true, 'Jl. Radio Dalam No. 15, Jakarta Selatan', array['Pewarnaan Ulang Denim Hitam/Navy','Restorasi Warna Katun','Tie-Dye Kreatif']::text[], 'Selasa–Minggu, 10.00–18.00', 'Minimal 1 item', 'Rating Teratas'),
  ('sp-5', 'Sirkular Upcycle Lab Mampang', 'upcycle', 'Upcycle & Rework', -6.2457, 106.8233, 5, 41, 150000, true, 'Jl. Mampang Prapatan No. 71, Jakarta Selatan', array['Rework Jeans jadi Tote Bag','Patchwork Jacket','Custom Bucket Hat']::text[], 'Senin–Sabtu, 10.00–17.00', 'Konsultasi gratis', 'Eco-Partner');

-- Notifikasi (akun hafiz)
insert into public.notifications (user_id, title, descr, type, category_label, target_href, action_text, details, icon, order_number, badge_color, unread, created_at)
select u.id, v.* from public.users u, (values
  ('Pesanan Telah Tiba di Lokasi! 📦', 'Jaket Denim Vintage Levi''s 501 pesanan Anda telah tiba. Mohon konfirmasi penerimaan di menu Profil untuk menyelesaikan pencairan escrow aman.', 'order', 'Transaksi', '/profil', 'Konfirmasi Pesanan', 'Nomor Resi: JNE-KLM-992148. Dana pembayaran Anda aman di dalam sistem Rekening Bersama (Escrow) Klámbi sampai barang Anda terima dengan puas.', '📦', 'ORD-KLM-2026-0901', 'bg-blue-100 text-blue-800', true, now() - interval '600 seconds'),
  ('Pengingat Perawatan Baju Mingguan 👕', 'Kemeja Flannel Sage Green Anda sudah 3 minggu belum di-spa. Yuk jadwalkan Deep Clean berkala agar serat katun organik tetap lembut dan tahan lama!', 'care', 'Perawatan', '/menu-perawatan', 'Jadwalkan Perawatan', 'Rekomendasi Tindakan: Cuci dengan air dingin suhu maksimal 30°C dan gunakan 1 lembar Kindfoam eco-detergent tanpa pemutih optik klorin.', '👕', null, 'bg-emerald-100 text-emerald-800', true, now() - interval '7200 seconds'),
  ('Hasil Diagnosis Wearwise AI Tersedia 🔍', 'Scan Jaket Patchwork Denim telah selesai dianalisis. Skor kesehatan serat kain: 92/100 (Sangat Baik).', 'ai', 'Wearwise AI', '/rawat', 'Buka Hasil AI', 'Wearwise Vision AI mendeteksi serat kain 100% bebas dari jamur tekstil, jahitan sambungan patchwork sangat kokoh, dan elastisitas kain prima.', '✨', null, 'bg-amber-100 text-amber-800', true, now() - interval '18000 seconds'),
  ('Saldo Escrow Rp 185.000 Berhasil Dicairkan 💰', 'Pembeli telah mengonfirmasi penerimaan Jaket Upcycle Anda. Saldo dompet Klámbi Anda telah bertambah dan siap ditarik.', 'order', 'Transaksi', '/profil', 'Lihat Dompet Escrow', 'Dana sebesar Rp 185.000 telah masuk ke saldo aktif dompet Anda. Anda dapat menariknya ke BCA, Mandiri, BRI, atau e-Wallet tanpa biaya admin.', '💰', 'ESC-TRF-884120', 'bg-blue-100 text-blue-800', false, now() - interval '86400 seconds'),
  ('Promo Trift & Upcycle Drop Minggu Ini ♻️', 'Diskon 30% untuk produk upcycle artisan & koleksi vintage denim baru saja dirilis di Klámbi Trift Marketplace.', 'promo', 'Promo', '/trift-marketplace', 'Cek Koleksi Promo', 'Gunakan kode promo SIRKULAR30 saat checkout untuk mendapatkan potongan harga langsung 30% hingga maksimal Rp 50.000.', '🎁', null, 'bg-rose-100 text-rose-800', false, now() - interval '108000 seconds'),
  ('Jasa Permak Selesai Dikerjakan 🧵', 'Mitra penjahit "Rumah Jahit Lestari" telah menyelesaikan permak celana chino Anda. Kurir sedang dalam perjalanan pengantaran.', 'care', 'Perawatan', '/menu-perawatan', 'Lacak Pengantaran', 'Perbaikan pinggang dan potong kelim celana chino telah tuntas dengan jahitan ganda berkualitas tinggi. Estimasi sampai di alamat: Sore ini.', '🪡', 'SRV-JHT-552190', 'bg-emerald-100 text-emerald-800', false, now() - interval '172800 seconds'),
  ('Pencapaian Baru: Eco Champion Level 3! 🏆', 'Hebat! Anda telah menyelamatkan 12.5 kg limbah tekstil dan menghemat 2.450 Liter air bulan ini.', 'impact', 'Dampak Sirkular', '/dampak', 'Lihat Dampak Lingkungan', 'Kontribusi Anda menempatkan akun Anda di peringkat Top #8 Komunitas Sirkular Nasional Klámbi. Terus rawat & putar siklus pakaianmu!', '🌍', null, 'bg-teal-100 text-teal-800', false, now() - interval '259200 seconds')
) as v(title, descr, type, category_label, target_href, action_text, details, icon, order_number, badge_color, unread, created_at)
where lower(u.username) = 'hafiz';

-- Lemari digital (akun hafiz)
insert into public.garments (user_id, title, category, category_type, scan_date, score, status_badge, summary, fabric, icon_text, parameters, care_steps, recommendation_action)
select u.id, v.* from public.users u, (values
  ('Kemeja Flannel Sage Green', 'Kemeja', 'Kemeja', '2026-08-22'::date, 86, 'Baik', 'Kondisi serat kain sangat terjaga. Bebas noda membandel.', '100% Katun Organik', '👔', $j${"cleanliness":"95/100 (Sangat Bersih)","fading":"90/100 (Warna Cerah)","fiber":"88/100 (Serat Utuh)","damage":"Tidak ada robekan"}$j$::jsonb, $j$[{"text":"Gunakan air dingin (suhu maksimal 30°C) saat mencuci.","done":true},{"text":"Balik pakaian ke dalam sebelum dicuci agar warna kain tidak tergesek.","done":true},{"text":"Gunakan deterjen lembaran ramah lingkungan (Kindfoam / eco-detergent).","done":false},{"text":"Jemur di tempat teduh dengan sirkulasi udara baik, hindari terik matahari langsung.","done":false}]$j$::jsonb, 'Perawatan mandiri di rumah sudah optimal. Tidak memerlukan jasa permak.'),
  ('Jaket Denim Vintage Levi''s 501', 'Outerwear', 'Outerwear', '2026-08-18'::date, 67, 'Perlu Perawatan', 'Warna agak pudar di area siku & aroma serat kain lembab.', 'Heavyweight Denim Twill 14oz', '🧥', $j${"cleanliness":"75/100 (Perlu Deep Clean)","fading":"65/100 (Pudar Sedang)","fiber":"78/100 (Serat Kuat)","damage":"Jahitan saku samping longgar"}$j$::jsonb, $j$[{"text":"Lakukan Deep Clean & Spa Anti-Odor untuk menghilangkan jamur mikroba.","done":false},{"text":"Rendam dengan larutan cuka putih 1 sendok makan untuk mengunci pigmen indigo.","done":false},{"text":"Jangan diperas terlalu keras menggunakan mesin pengering putar tinggi.","done":false},{"text":"Gantung menggunakan hanger kayu berbahu lebar.","done":false}]$j$::jsonb, 'Disarankan melakukan Deep Clean & Anti-Odor Spa agar serat kembali segar.'),
  ('Celana Chino Slim Fit', 'Celana', 'Celana', '2026-08-10'::date, 52, 'Perlu Jasa', 'Jahitan kelim bawah terlepas sepanjang 8 cm & kancing longgar.', 'Twill Cotton Stretch 98% / Elastane 2%', '👖', $j${"cleanliness":"80/100 (Bersih)","fading":"70/100 (Pudar Ringan)","fiber":"65/100 (Karet Mulai Melar)","damage":"Kelim bawah robek 8 cm"}$j$::jsonb, $j$[{"text":"Perbaiki jahitan kelim bawah menggunakan teknik chainstitch atau hemming rapi.","done":false},{"text":"Kencangkan kembali kancing pinggang sebelum dicuci.","done":false},{"text":"Hindari penggunaan pemutih klorin.","done":false}]$j$::jsonb, 'Perlu bantuan tukang jahit / Taylor artisan terdekat untuk perbaikan jahitan kelim.'),
  ('Dress Tenun Ikat Tradisional', 'Dress', 'Dress', '2026-08-05'::date, 92, 'Baik', 'Serat tenun tangan istimewa. Tidak ada benang lepas.', 'Tenun Pewarna Alami', '👗', $j${"cleanliness":"98/100 (Bersih Terawat)","fading":"95/100 (Pewarna Alami Terkunci)","fiber":"92/100 (Anyaman Padat)","damage":"Sempurna"}$j$::jsonb, $j$[{"text":"Gunakan lerak atau sabun khusus kain tradisional saat mencuci.","done":true},{"text":"Cuci manual secara perlahan dengan tangan tanpa disikat.","done":true},{"text":"Angin-anginkan di dalam ruangan hingga kering.","done":true}]$j$::jsonb, 'Kondisi pakaian sangat prima. Terus terapkan teknik cuci tradisional.'),
  ('Kaos Heavyweight Vintage Band Tee', 'Kaos', 'Kaos', '2026-08-01'::date, 78, 'Baik', 'Sablon plastisol utuh, kerah leher tetap kencang.', '100% Combed Cotton 20s', '👕', $j${"cleanliness":"92/100 (Bersih)","fading":"82/100 (Vintage Fade Estetik)","fiber":"85/100 (Kerah Kencang)","damage":"Tidak ada lubang ngengat"}$j$::jsonb, $j$[{"text":"Setrika selalu dari bagian dalam (terbalik) agar sablon grafis tidak meleleh.","done":true},{"text":"Hindari peras putar berlebihan agar kerah rib tidak cepat keriting.","done":true},{"text":"Gunakan deterjen bebas pemutih optik.","done":false}]$j$::jsonb, 'Pakaian terawat sangat baik. Pertahankan cara cuci terbalik.')
) as v(title, category, category_type, scan_date, score, status_badge, summary, fabric, icon_text, parameters, care_steps, recommendation_action)
where lower(u.username) = 'hafiz';

insert into public.garments (user_id, title, category, category_type, scan_date, score, status_badge, summary, fabric, icon_text, parameters, care_steps, recommendation_action)
select u.id, v.title, v.cat, v.cat, v.sd::date, v.score, v.badge, v.summary, v.fabric, v.icon, v.params::jsonb, v.steps::jsonb, v.rec
from public.users u join (values
 ('dewi','Kemeja Flanel Kotak Merah','Kemeja',to_char(current_date - 6,'YYYY-MM-DD'),88,'Baik','Serat kuat, warna masih cerah.','Katun Flanel','👔','{"cleanliness":"92/100","fading":"85/100","fiber":"90/100","damage":"Tidak ada"}','[{"text":"Cuci air dingin maksimal 30°C.","done":true},{"text":"Jemur di tempat teduh.","done":false}]','Siap dijual di Trift atau dipakai kembali.'),
 ('dewi','Dress Floral Vintage','Dress',to_char(current_date - 15,'YYYY-MM-DD'),71,'Perlu Perawatan','Ada noda ringan di bagian kerah.','Rayon','👗','{"cleanliness":"70/100","fading":"75/100","fiber":"80/100","damage":"Kancing longgar"}','[{"text":"Spot clean noda kerah.","done":false}]','Disarankan jasa cuci spa sebelum dijual.'),
 ('bagas','Kaos Band Vintage','Kaos',to_char(current_date - 3,'YYYY-MM-DD'),79,'Baik','Sablon sedikit retak, kain masih kuat.','Katun 20s','👕','{"cleanliness":"85/100","fading":"70/100","fiber":"82/100","damage":"Sablon retak ringan"}','[{"text":"Cuci terbalik air dingin.","done":true}]','Cocok untuk dijual sebagai vintage.'),
 ('rini','Jaket Parasut 90s','Outerwear',to_char(current_date - 9,'YYYY-MM-DD'),90,'Baik','Kondisi sangat baik, resleting lancar.','Nilon','🧥','{"cleanliness":"95/100","fading":"90/100","fiber":"88/100","damage":"Tidak ada"}','[{"text":"Lap dengan kain lembap.","done":true}]','Layak jual — pasang harga Rp175.000.')
) as v(un,title,cat,sd,score,badge,summary,fabric,icon,params,steps,rec) on lower(u.username)=v.un;

-- Hasil Wearwise AI (contoh riwayat scan)
insert into public.garment_scans (user_id, garment_type, gcs_score, condition_grade, primary_action, result, created_at)
select u.id, v.gt, v.gcs, v.grade, v.act, v.res::jsonb, now() - (v.ago || ' days')::interval
from public.users u join (values
 ('hafiz','Jaket Patchwork Denim',92,'Grade A','CIRCULATE','{"note":"Data contoh"}',1),
 ('hafiz','Kemeja Flannel Sage Green',86,'Grade A','CARE','{"note":"Data contoh"}',3),
 ('hafiz','Jaket Denim Vintage Levi''s 501',67,'Grade C','CARE','{"note":"Data contoh"}',7),
 ('dewi','Dress Floral Vintage',71,'Grade B','CARE','{"note":"Data contoh"}',15),
 ('bagas','Kaos Band Vintage',79,'Grade B','CIRCULATE','{"note":"Data contoh"}',3)
) as v(un,gt,gcs,grade,act,res,ago) on lower(u.username)=v.un;

-- Keranjang (akun hafiz)
insert into public.cart_items (user_id, store_name, category, title, condition, price, original_price, selected, emoji, image_url, is_clothing, color, size, brand)
select u.id, v.* from public.users u, (values
  ('@vintage_jkt (Denim House)', 'Jaket', 'Jaket Denim Vintage Levi''s 501 Original', 'Sangat Baik', 245000, 450000, true, '🧥', 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80', true, '#1E3A8A', 'L', 'Levi''s'),
  ('Kindfoam Official', 'Produk Perawatan', 'Kindfoam Eco-Deterjen Lembaran 30pcs', 'Produk Eco', 45000, 65000, true, '🧼', 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80', false, '#22C55E', null, null),
  ('@batik_solo_heritage', 'Kemeja', 'Kemeja Batik Tulis Parang Coklat-Krem', 'Sangat Baik', 200000, 900000, true, '👔', 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80', true, '#92400E', 'L', 'Batik Keris'),
  ('ReworkLab ID', 'Kaos', 'Kaos Oversized Heavyweight Vintage Band Tee', 'Baik', 85000, 200000, false, '👕', 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80', true, '#1C1917', 'XL', 'Unknown Pleasures')
) as v(store_name, category, title, condition, price, original_price, selected, emoji, image_url, is_clothing, color, size, brand)
where lower(u.username) = 'hafiz';

-- Pesanan & riwayat transaksi
insert into public.orders (order_number, buyer_id, seller_name, status, subtotal, shipping_cost, total, tracking_number, payment_method, created_at)
select v.no, u.id, v.seller, v.status, v.sub, v.ship, v.sub + v.ship, v.trk, v.pay, now() - (v.ago || ' days')::interval
from public.users u join (values
 ('hafiz','ORD-KLM-2026-0901','@vintage_jkt (Denim House)','delivered',245000,18000,'JNE-KLM-992148','GoPay',1),
 ('hafiz','ORD-KLM-2026-0874','Sirkular Studio Kemang','shipped',185000,15000,'SICEPAT-77120931','BCA Virtual Account',2),
 ('hafiz','ORD-KLM-2026-0822','Rini Anggraini','completed',65000,12000,'JNT-55302817','GoPay',14),
 ('hafiz','ORD-KLM-2026-0790','Kindfoam Official','completed',90000,10000,'JNE-KLM-881026','GoPay',26),
 ('hafiz','ORD-KLM-2026-0911','@batik_solo_heritage','pending_payment',200000,16000,null,'BCA Virtual Account',0),
 ('dewi','ORD-KLM-2026-0860','Rini Anggraini','completed',65000,12000,'JNT-55290001','OVO',10),
 ('dewi','ORD-KLM-2026-0896','Sirkular Studio Kemang','escrow_held',120000,14000,null,'OVO',1),
 ('bagas','ORD-KLM-2026-0843','Kindfoam Official','completed',135000,10000,'JNE-KLM-770112','DANA',18),
 ('rini','ORD-KLM-2026-0881','Dewi Lestari','shipped',95000,12000,'JNT-55311000','Mandiri VA',3)
) as v(un,no,seller,status,sub,ship,trk,pay,ago) on lower(u.username)=v.un;

insert into public.order_items (order_id, title, price, qty, size, image_url)
select o.id, v.title, v.price, 1, v.size, v.img from public.orders o join (values
 ('ORD-KLM-2026-0901','Jaket Denim Vintage Levi''s 501 Original',245000,'L','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80'),
 ('ORD-KLM-2026-0874','Jaket warna-warni Patchwork Denim',185000,'M','https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80'),
 ('ORD-KLM-2026-0822','Kemeja Flanel Kotak-kotak Merah',65000,'M','https://images.unsplash.com/photo-1598033129183-c4f50c736f10?w=600&auto=format&fit=crop&q=80'),
 ('ORD-KLM-2026-0790','Kindfoam Eco-Deterjen Lembaran 30pcs',45000,null,null),
 ('ORD-KLM-2026-0790','Kindfoam Eco-Deterjen Lembaran 30pcs',45000,null,null),
 ('ORD-KLM-2026-0911','Kemeja Batik Tulis Parang Coklat-Krem',200000,'L',null),
 ('ORD-KLM-2026-0860','Kemeja Flanel Kotak-kotak Merah',65000,'S',null),
 ('ORD-KLM-2026-0896','Atasan biru motif',120000,'M',null),
 ('ORD-KLM-2026-0843','Kindfoam Eco-Deterjen Lembaran 30pcs',45000,null,null),
 ('ORD-KLM-2026-0843','Kindfoam Eco-Deterjen Lembaran 30pcs',45000,null,null),
 ('ORD-KLM-2026-0843','Kindfoam Eco-Deterjen Lembaran 30pcs',45000,null,null),
 ('ORD-KLM-2026-0881','Jaket Parasut 90s',95000,'L',null)
) as v(no,title,price,size,img) on o.order_number = v.no;

-- Booking jasa perawatan
insert into public.service_bookings (user_id, partner_id, service, status, price, scheduled_at, notes)
select u.id, v.pid, v.svc, v.st, v.price, now() + (v.off || ' days')::interval, v.notes
from public.users u join (values
 ('hafiz','sp-2','Deep Clean & Anti-Odor Jaket Denim','dijemput',85000,1,'Jemput pukul 14.00 oleh kurir Klámbi'),
 ('hafiz','sp-1','Potong Panjang Celana','selesai',45000,-14,'Chainstitch rapi'),
 ('hafiz','sp-1','Ganti Resleting YKK','dijadwalkan',60000,3,null),
 ('dewi','sp-2','Spa Dress Vintage','diproses',75000,0,'Noda kerah'),
 ('bagas','sp-1','Kecilkan Pinggang','dijadwalkan',50000,2,null)
) as v(un,pid,svc,st,price,off,notes) on lower(u.username)=v.un
where exists (select 1 from public.service_partners p where p.id = v.pid);

-- Chat (akun hafiz)
with conv as (
  insert into public.chat_conversations (user_id, seller_name, avatar, unread, updated_at)
  select u.id, '@vintage_jkt (Denim House)', 'VJ', true, now() - interval '1 hours' from public.users u where lower(u.username)='hafiz'
  returning id
)
insert into public.chat_messages (conversation_id, sender, body, created_at)
select conv.id, m.s, m.b, now() - interval '1 hours' + (m.o || ' minutes')::interval
from conv, (values ('seller', 'Halo kak! Ada yang bisa kami bantu seputar produk vintage/preloved kami?', 0), ('user', 'Halo, apakah Kemeja Sage Green ukurannya fit L?', 5), ('seller', 'Halo kak, kemeja Sage Green masih ready ya! Siap dikirim.', 10)) as m(s, b, o);
with conv as (
  insert into public.chat_conversations (user_id, seller_name, avatar, unread, updated_at)
  select u.id, 'CleanCare Signature Kemang', 'CC', false, now() - interval '2 hours' from public.users u where lower(u.username)='hafiz'
  returning id
)
insert into public.chat_messages (conversation_id, sender, body, created_at)
select conv.id, m.s, m.b, now() - interval '2 hours' + (m.o || ' minutes')::interval
from conv, (values ('user', 'Halo min, untuk spa jaket denim butuh berapa hari?', 0), ('seller', 'Proses deep clean & anti-odor membutuhkan waktu 2 hari kerja kak.', 5), ('seller', 'Jadwal penjemputan baju Anda pukul 14.00 WIB oleh kurir Klámbi.', 10)) as m(s, b, o);
with conv as (
  insert into public.chat_conversations (user_id, seller_name, avatar, unread, updated_at)
  select u.id, 'Taylor Studio Artisan Fatmawati', 'TS', false, now() - interval '3 hours' from public.users u where lower(u.username)='hafiz'
  returning id
)
insert into public.chat_messages (conversation_id, sender, body, created_at)
select conv.id, m.s, m.b, now() - interval '3 hours' + (m.o || ' minutes')::interval
from conv, (values ('seller', 'Terima kasih kak, potongan celana sudah rapi chainstitch.', 0)) as m(s, b, o);


-- =====================================================================
-- ESCROW: mitra/penjual tambahan + data pesanan konsisten dengan rekening escrow
-- (butuh supabase/escrow.sql sudah dijalankan)
-- =====================================================================
insert into public.users (username, email, full_name, phone, avatar, city, bio, role, level, is_verified, password_hash) values
  ('vintage_jkt',     'vintage@klambi.id',  'Denim House (Vintage JKT)', '081234567810', '🏪', 'Jakarta Selatan', 'Toko denim vintage & preloved terkurasi.', 'seller', 'Penjual Terpercaya', true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('sirkular_kemang', 'sirkular@klambi.id', 'Sirkular Studio Kemang',    '081234567811', '♻️', 'Jakarta Selatan', 'Studio upcycle & patchwork artisan.',     'seller', 'Mitra Jasa',         true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('kindfoam',        'kindfoam@klambi.id', 'Kindfoam Official',         '081234567812', '🧼', 'Bandung',         'Deterjen lembaran ramah lingkungan.',      'seller', 'Brand Mitra',        true, extensions.crypt('klambi123', extensions.gen_salt('bf'))),
  ('batik_solo',      'batik@klambi.id',    'Batik Solo Heritage',       '081234567813', '🧵', 'Surakarta',       'Batik tulis & kemeja heritage.',           'seller', 'Penjual Terpercaya', true, extensions.crypt('klambi123', extensions.gen_salt('bf')));

insert into public.wallets (user_id, balance, escrow_held, eco_points, voucher_count)
select u.id, v.bal, 0, 0, 0 from public.users u
join (values ('vintage_jkt',1850000),('sirkular_kemang',960000),('kindfoam',4200000),('batik_solo',730000)) as v(un,bal) on lower(u.username)=v.un;
insert into public.user_impact (user_id) select id from public.users where lower(username) in ('vintage_jkt','sirkular_kemang','kindfoam','batik_solo');

-- Pesanan tambahan: satu menunggu diproses mitra (rini), satu sedang SENGKETA (untuk admin)
insert into public.orders (order_number, buyer_id, seller_name, status, subtotal, shipping_cost, total, tracking_number, payment_method, created_at)
select v.no, u.id, v.seller, v.status, v.sub, v.ship, v.sub + v.ship, v.trk, v.pay, now() - (v.ago || ' hours')::interval
from public.users u join (values
 ('bagas','ORD-KLM-2026-0903','Rini Anggraini','escrow_held',120000,14000,null,'GoPay',5),
 ('bagas','ORD-KLM-2026-0905','@batik_solo_heritage','disputed',175000,16000,'JNE-KLM-660921','DANA',96)
) as v(un,no,seller,status,sub,ship,trk,pay,ago) on lower(u.username)=v.un;
insert into public.order_items (order_id, title, price, qty, size)
select o.id, v.title, v.price, 1, v.size from public.orders o join (values
 ('ORD-KLM-2026-0903','Celana Jeans Slim Fit Navy',120000,'32'),
 ('ORD-KLM-2026-0905','Kemeja Batik Tulis Mega Mendung',175000,'M')
) as v(no,title,price,size) on o.order_number = v.no;

-- Hubungkan pesanan ke mitra, judul, jenis, biaya platform (5%)
update public.orders o set mitra_id = u.id
from (values
  ('@vintage_jkt (Denim House)','vintage_jkt'),('Sirkular Studio Kemang','sirkular_kemang'),('Rini Anggraini','rini'),
  ('Kindfoam Official','kindfoam'),('@batik_solo_heritage','batik_solo'),('Dewi Lestari','dewi')
) as m(seller, un) join public.users u on lower(u.username) = m.un
where o.seller_name = m.seller and o.mitra_id is null;

update public.orders o set
  title = (select oi.title from public.order_items oi where oi.order_id = o.id order by oi.id limit 1),
  kind = case when o.seller_name = 'Kindfoam Official' then 'produk' else 'trift' end,
  platform_fee = round(o.subtotal * 500 / 10000.0) + 2500,
  total        = o.subtotal + o.shipping_cost + round(o.subtotal * 500 / 10000.0) + 2500,
  paid_at      = case when o.status <> 'pending_payment' then o.created_at + interval '5 minutes' end,
  shipped_at   = case when o.status in ('shipped','delivered','completed','disputed') then o.created_at + interval '1 day' end,
  delivered_at = case when o.status = 'delivered' then now() - interval '10 minutes'
                      when o.status in ('completed','disputed') then o.created_at + interval '2 days' end,
  released_at  = case when o.status = 'completed' then o.created_at + interval '3 days' end
where o.mitra_id is not null;

update public.orders set auto_release_at = delivered_at + interval '48 hours' where status = 'delivered';
update public.orders set dispute_reason = 'Ukuran tidak sesuai deskripsi (lebih kecil dari yang tertulis).' where status = 'disputed';

-- Jejak audit (escrow_events)
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, null, 'pending_payment', o.buyer_id, 'buyer', 'Pesanan dibuat', o.created_at from public.orders o where o.mitra_id is not null;
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, 'pending_payment', 'escrow_held', o.buyer_id, 'buyer', 'Pembayaran diterima, dana ditahan admin', o.paid_at from public.orders o where o.paid_at is not null;
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, 'escrow_held', 'shipped', o.mitra_id, 'mitra', 'Mitra memproses / mengirim pesanan', o.shipped_at from public.orders o where o.shipped_at is not null;
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, 'shipped', 'delivered', o.mitra_id, 'mitra', 'Pesanan tiba di customer; menunggu konfirmasi (maks. 48 jam)', o.delivered_at from public.orders o where o.delivered_at is not null;
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, 'delivered', 'completed', o.buyer_id, 'buyer', 'Customer mengonfirmasi penerimaan; dana dilepas ke mitra', o.released_at from public.orders o where o.status = 'completed';
insert into public.escrow_events (order_id, from_status, to_status, actor_id, actor_role, note, created_at)
select o.id, 'delivered', 'disputed', o.buyer_id, 'buyer', o.dispute_reason, o.delivered_at + interval '3 hours' from public.orders o where o.status = 'disputed';

-- Buku besar: uang customer masuk escrow; yang selesai → dilepas ke mitra + fee
insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note, created_at)
select o.id, 'platform_escrow', o.buyer_id, 'PAYMENT_IN', o.total, 'Dana customer ditahan di rekening escrow Klámbi', o.paid_at from public.orders o where o.paid_at is not null;
insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note, created_at)
select o.id, 'platform_escrow', o.mitra_id, 'RELEASE_TO_MITRA', o.total - o.platform_fee, 'Dana dilepas admin ke saldo mitra', o.released_at from public.orders o where o.status = 'completed';
insert into public.wallet_ledger (order_id, account, user_id, entry_type, amount, note, created_at)
select o.id, 'platform_fee', null, 'PLATFORM_FEE', o.platform_fee, 'Biaya platform Klámbi', o.released_at from public.orders o where o.status = 'completed';

-- Saldo tertahan & rekening escrow platform dihitung dari pesanan (selalu konsisten)
update public.wallets w set escrow_held =
    coalesce((select sum(o.total) from public.orders o where o.buyer_id = w.user_id and o.status in ('escrow_held','shipped','delivered','disputed')), 0)
  + coalesce((select sum(o.total - o.platform_fee) from public.orders o where o.mitra_id = w.user_id and o.status in ('escrow_held','shipped','delivered','disputed')), 0);
update public.platform_wallet set
  escrow_held = coalesce((select sum(total) from public.orders where status in ('escrow_held','shipped','delivered','disputed')), 0),
  fee_income  = coalesce((select sum(platform_fee) from public.orders where status = 'completed'), 0)
where id = 'main';

-- Selesai. Cek: select username, full_name, role from public.users;

