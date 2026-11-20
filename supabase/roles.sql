-- =====================================================================
-- Klámbi.id — PERAN AKUN (jalankan SETELAH seed.sql; aman dijalankan ulang)
--
--   Customer (role 'user')   : bisa BELI dan JUAL barang (thrift/preloved), dan
--                              memesan layanan dari mitra.
--   Mitra    (role 'seller') : penyedia LAYANAN — laundry, penatu/dry clean, permak,
--                              re-colour, upcycle. Tiap mitra memiliki satu layanan
--                              di tabel service_partners (kolom owner_id).
--   Admin    (role 'admin')  : perantara dana (escrow). Menahan uang pembeli dan
--                              mencairkannya ke penjual/mitra setelah barang diterima
--                              atau layanan selesai.
-- =====================================================================

-- 1) Layanan dimiliki oleh akun mitra
alter table public.service_partners add column if not exists owner_id uuid references public.users(id) on delete set null;
create index if not exists service_partners_owner_idx on public.service_partners (owner_id);

-- 2) Penjual barang adalah CUSTOMER biasa (bukan mitra)
update public.users set role = 'user'
 where lower(username) in ('rini', 'vintage_jkt', 'batik_solo', 'kindfoam') and role <> 'admin';

-- 3) Akun mitra layanan (laundry, penatu, permak, re-colour)
insert into public.users (username, email, full_name, phone, avatar, city, bio, role, level, is_verified, password_hash)
select v.un, v.em, v.fn, v.ph, v.av, v.city, v.bio, 'seller', v.lvl, true, extensions.crypt('klambi123', extensions.gen_salt('bf'))
from (values
  ('cleancare',      'cleancare@klambi.id', 'CleanCare Signature Workshop Kemang', '081234567820', '🧺', 'Jakarta Selatan', 'Laundry premium: cuci, spa tekstil, anti-odor.',     'Mitra Laundry'),
  ('penatu_prima',   'penatu@klambi.id',    'Penatu Prima Dry Clean Tebet',        '081234567821', '👔', 'Jakarta Selatan', 'Penatu & dry clean jas, gaun, kebaya.',               'Mitra Penatu'),
  ('jahit_kilat',    'jahitkilat@klambi.id','Jahit Kilat Express Senopati',        '081234567822', '✂️', 'Jakarta Selatan', 'Permak kilat 1 hari.',                                'Mitra Permak'),
  ('color_restorer', 'recolor@klambi.id',   'Textile Color Restorer & Dyeing',     '081234567823', '🎨', 'Jakarta Selatan', 'Pewarnaan ulang & restorasi warna kain.',             'Mitra Re-Colour')
) as v(un, em, fn, ph, av, city, bio, lvl)
where not exists (select 1 from public.users u where lower(u.username) = v.un);

update public.users set role = 'seller', level = 'Mitra Permak', city = 'Jakarta Selatan',
       bio = 'Pemilik Taylor Studio Artisan Fatmawati — permak & jahit sejak 2012.'
 where lower(username) = 'sari';
update public.users set role = 'seller', level = 'Mitra Upcycle' where lower(username) = 'sirkular_kemang';

insert into public.wallets (user_id) select u.id from public.users u
 where u.role = 'seller' and not exists (select 1 from public.wallets w where w.user_id = u.id);
insert into public.user_impact (user_id) select u.id from public.users u
 where u.role = 'seller' and not exists (select 1 from public.user_impact i where i.user_id = u.id);

-- 4) Layanan penatu baru + pemilik tiap layanan
insert into public.service_partners (id, name, category, category_label, lat, lng, rating, reviews_count, estimated_price, is_verified, address, services, open_hours, min_order, badge)
select 'sp-6', 'Penatu Prima Dry Clean Tebet', 'cuci', 'Penatu & Dry Clean', -6.2262, 106.8508, 4.7, 63, 55000, true, 'Jl. Tebet Raya No. 27, Jakarta Selatan',
       array['Dry Clean Jas & Blazer','Penatu Gaun/Kebaya','Setrika Uap Profesional']::text[], 'Setiap Hari, 07.00–21.00', 'Mulai 1 item', 'Baru'
where not exists (select 1 from public.service_partners where id = 'sp-6');

update public.service_partners p set owner_id = u.id
from (values ('sp-1','sari'),('sp-2','cleancare'),('sp-3','jahit_kilat'),('sp-4','color_restorer'),('sp-5','sirkular_kemang'),('sp-6','penatu_prima')) as m(pid, un)
join public.users u on lower(u.username) = m.un
where p.id = m.pid;

-- 5) Pesanan ke akun mitra = pesanan LAYANAN
update public.orders o set kind = 'jasa'
 where o.mitra_id in (select id from public.users where role = 'seller') and o.kind is distinct from 'jasa';

-- 6) Contoh pesanan layanan berjalan (sekali saja), lewat fungsi escrow agar saldo konsisten
do $$
declare dewi uuid; hafiz uuid; cc uuid; pp uuid; o public.orders;
begin
  select id into dewi  from public.users where lower(username) = 'dewi';
  select id into hafiz from public.users where lower(username) = 'hafiz';
  select id into cc    from public.users where lower(username) = 'cleancare';
  select id into pp    from public.users where lower(username) = 'penatu_prima';
  if dewi is null or hafiz is null or cc is null or pp is null then return; end if;

  if not exists (select 1 from public.orders where mitra_id = cc) then
    -- Dewi sudah bayar laundry → menunggu CleanCare mengerjakan
    o := public.escrow_create_order(dewi, cc, 'CleanCare Signature Workshop Kemang', 'Deep Clean & Anti-Odor Spa (3 item)', 'jasa', 150000, 15000, 'GoPay');
    perform public.escrow_pay(o.id, dewi);
  end if;
  if not exists (select 1 from public.orders where mitra_id = pp) then
    -- Hafiz: dry clean jas sedang dikerjakan penatu
    o := public.escrow_create_order(hafiz, pp, 'Penatu Prima Dry Clean Tebet', 'Dry Clean Jas & Blazer (2 item)', 'jasa', 110000, 10000, 'OVO');
    perform public.escrow_pay(o.id, hafiz);
    perform public.escrow_ship(o.id, pp, null);
  end if;
end $$;

notify pgrst, 'reload schema';
-- Cek: select username, role, level from public.users order by role, username;
