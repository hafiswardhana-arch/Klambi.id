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
