# Setup Supabase untuk Klámbi.id

Database: Supabase (Postgres). Aplikasi mengakses database **hanya lewat server Next.js**
(`/api/*`) memakai `service_role` key, jadi key itu tidak pernah sampai ke browser.

## 1. Ambil 2 nilai dari Supabase
Dashboard → project kamu → **Project Settings → API**:

| Nilai | Contoh | Dipakai sebagai |
|---|---|---|
| **Project URL** | `https://apitgixnihycfjwhomsx.supabase.co` (tanpa `/rest/v1/`) | `SUPABASE_URL` |
| **service_role** key (bagian *Project API keys*, klik *Reveal*) | diawali `eyJ...` atau `sb_secret_...` | `SUPABASE_SERVICE_ROLE_KEY` |

> Bukan key Gemini (`AQ.…`) dan bukan `anon`/`publishable` key. Service role = rahasia penuh,
> **jangan** ditempel di chat, kode, atau GitHub.

## 2. Buat tabel + isi data dummy
Supabase Dashboard → **SQL Editor → New query**. Jalankan **berurutan**, masing-masing satu query baru:
1. `supabase/schema.sql` → tabel, RLS, login/register.
2. `supabase/escrow.sql` → sistem escrow (rekening penahan dana, buku besar, fungsi transaksi).
3. `supabase/grants.sql` → **hak akses tabel untuk server (WAJIB, lihat catatan di bawah)**.
4. `supabase/seed.sql` → data dummy.
5. `supabase/roles.sql` → **peran akun** (customer bisa beli & jual, mitra = penyedia layanan) + akun mitra laundry/penatu.

Jalan pintas: `supabase/setup_all.sql` = kelima file di atas dalam satu file. Tempel sekali, Run.
Semuanya aman dijalankan ulang. Cek di **Table Editor**: tabel `users` berisi 14 akun.

> **Sudah pernah setup sebelumnya?** Cukup jalankan `supabase/roles.sql` sekali di SQL Editor.

> **Kalau website tetap menampilkan data demo / pembelian tidak tercatat:** hampir pasti kamu belum menjalankan
> `grants.sql`. Project Supabase baru tidak otomatis memberi hak akses tabel ke Data API, sehingga server
> mendapat `permission denied for table ...` (kode 42501) dan halaman diam-diam kembali ke data demo.
> Jalankan `supabase/grants.sql` di SQL Editor, lalu muat ulang website. Setelah itu, **login ulang** dengan akun demo.

## 3. Isi env
**Lokal** — di `.env.local`:
```env
SUPABASE_URL=https://apitgixnihycfjwhomsx.supabase.co
SUPABASE_SERVICE_ROLE_KEY=isi_service_role_key
```
lalu restart `npm run dev`.

**Vercel/Netlify** — tambahkan dua variabel yang sama di *Environment Variables*, lalu **Redeploy**
(`.env.local` tidak ikut ke GitHub).

Tanpa dua variabel itu aplikasi tetap jalan memakai data demo bawaan (mode lama).

## 4. Alur pembayaran escrow (rekber)
```
Customer ──bayar──▶ Rekening escrow Klámbi (ditahan ADMIN) ──customer konfirmasi──▶ Saldo Mitra
```
Penerima dana: **penjual** (customer yang menjual barang thrift/preloved) atau **mitra** (penyedia layanan laundry,
penatu, permak, dll). **Admin hanya perantara**, tidak pernah menjadi penerima.
1. **Pembeli membayar** → uang masuk ke rekening escrow Klámbi. Penjual/mitra belum menerima apa pun.
2. **Penjual mengirim barang** (lalu menandai *tiba*), atau **mitra mengerjakan layanan** (lalu menandai *selesai dikerjakan*).
3. **Pembeli menekan "Konfirmasi Diterima / Selesai"** → admin melepas dana ke saldo penjual/mitra.
4. **Ada masalah?** Customer atau mitra menekan **Laporkan Masalah** → status *Sengketa*. Admin memutuskan di
   `/admin/escrow`: **Lepas ke Mitra** atau **Kembalikan ke Customer**.
5. **Customer diam?** 48 jam setelah barang tiba, dana otomatis dilepas ke mitra.
6. **Mitra menolak** pesanan yang sudah dibayar → refund 100% ke Saldo Klámbi customer.

**Rincian biaya** (sama dengan `src/lib/security/pricing.ts`): customer membayar *harga + biaya platform 5% +
proteksi pembeli Rp2.500 + ongkir*. Mitra menerima *harga + ongkir* penuh. Biaya platform + proteksi jadi
pendapatan Klámbi. Harga barang katalog selalu dihitung ulang di server (tidak bisa diubah dari browser).

**Di mana melihatnya**
| Peran | Halaman |
|---|---|
| Customer (sebagai pembeli) | `/profil` → *Pesanan & Dana Escrow* (bayar, konfirmasi, lapor) |
| Customer (sebagai penjual) | `/profil` → *Penjualan Saya*, atau `/penjualan` (login `rini`, `vintage_jkt`, …) |
| Mitra layanan | `/mitra`, `/mitra/pesanan`, `/mitra/layanan` (login `cleancare`, `penatu_prima`, `sari`, …) |
| Admin | `/admin/escrow` (login `admin`) — saldo yang ditahan, sengketa, buku besar |

Keamanan: semua perpindahan dana terjadi di dalam fungsi Postgres yang atomik (baris dikunci `FOR UPDATE`),
hanya bisa dipanggil server (`service_role`), memeriksa peran pelaku, menolak transisi status ilegal
(mis. konfirmasi dua kali), dan mencatat jejak audit di `escrow_events` + `wallet_ledger`.

## 5. Akun demo
| Username | Password | Peran |
|---|---|---|
| `hafiz` | `klambi123` | Customer utama — data paling lengkap (notifikasi, lemari, keranjang, pesanan, chat, booking) |
| `rini` | `klambi123` | Customer yang juga **menjual** thrift (Bandung) — lihat *Penjualan Saya* |
| `dewi`, `bagas` | `klambi123` | Customer pembeli |
| `vintage_jkt`, `batik_solo`, `kindfoam` | `klambi123` | Customer/toko yang menjual barang |
| `cleancare` | `klambi123` | **Mitra laundry** (CleanCare Kemang) — ada pesanan layanan baru |
| `penatu_prima` | `klambi123` | **Mitra penatu / dry clean** (Tebet) — ada layanan sedang dikerjakan |
| `sari`, `jahit_kilat` | `klambi123` | **Mitra permak** (Taylor Studio, Jahit Kilat) |
| `color_restorer`, `sirkular_kemang` | `klambi123` | **Mitra re-colour / upcycle** |
| `admin` | `admin123` | Admin — perantara dana escrow |

### Perbedaan tampilan tiap jenis akun
Jenis akun diambil dari kolom `users.role` (`user` = Customer, `seller` = Mitra layanan, `admin` = Admin).

- **Customer** bisa **membeli dan menjual** barang (thrift/preloved), serta memesan layanan dari mitra.
- **Mitra** adalah **penyedia layanan**: laundry, penatu/dry clean, permak, re-colour, upcycle. Tiap mitra memiliki
  satu layanan di `service_partners` (kolom `owner_id`); pesanan jasa ke layanan itu masuk ke akun mitranya.
- **Admin** adalah **perantara dana**: menahan pembayaran, mencairkannya setelah barang diterima/layanan selesai,
  dan memutuskan sengketa.

Setelah login, tiap akun langsung masuk ke halaman utamanya sendiri dengan menu bawah yang berbeda:

| Akun | Halaman utama | Menu bawah |
|---|---|---|
| Customer | `/` Beranda; Profil berisi *Pesanan* (yang dibeli) dan *Penjualan Saya* (yang dijual) | Beranda · Jasa · Market · Rawat · Notifikasi · Saya |
| Mitra layanan (label hijau "Mitra") | `/mitra` Dasbor Mitra: pesanan layanan baru/dikerjakan/tunggu konfirmasi, dana ditahan admin, pendapatan | Dasbor · Pesanan · Layanan · Chat · Akun |
| Admin (label ungu "Admin") | `/admin` Dasbor Admin: dana escrow ditahan, sengketa, jumlah customer/mitra, nilai transaksi | Dasbor · Escrow · Pengguna · Notifikasi · Akun |

Halaman khusus mitra/admin menolak akun lain dengan pesan yang jelas, dan API-nya juga menolak di server
(`/api/admin/*` hanya untuk admin). Daftar semua akun ada di `/admin/pengguna`.

Pesanan contoh `hafiz`: 1 menunggu konfirmasi (tiba), 1 sedang dikirim, 1 belum dibayar, 2 selesai.
`bagas` punya 1 pesanan **sengketa** (untuk dicoba admin) dan 1 pesanan yang menunggu diproses `rini`.

Login juga bisa memakai email, mis. `hafiz@klambi.id`. Login baru di perangkat baru tetap
meminta OTP 2FA (kode ditampilkan di aplikasi).

## Apa yang sudah tersambung ke database
- **Escrow penuh**: bayar → tahan → kirim → konfirmasi/sengketa → cair/refund (halaman `/pembayaran`, `/profil`, `/mitra/pesanan`, `/admin/escrow`)
- Login & daftar akun (password di-hash bcrypt di dalam Postgres, sesi memakai cookie bertanda tangan)
- Beranda: produk *Featured Drops*, statistik dampak, jumlah keranjang
- Marketplace Trift, Jasa & Perawatan (mitra), Notifikasi, Rawat (lemari digital), Keranjang
- Hasil scan Wearwise AI otomatis tersimpan ke `garment_scans` untuk pengguna yang login

Endpoint tambahan siap pakai: `GET /api/me/orders`, `GET /api/me/summary`, `GET /api/auth/me`.
Halaman Profil dan Chat masih memakai data demo di frontend (tabel `orders`, `wallets`,
`addresses`, `chat_*` sudah terisi dan siap disambungkan).

## Keamanan
- Semua tabel memakai Row Level Security. Tabel pribadi **tanpa policy** → anon key tidak bisa membaca apa pun.
- Katalog (produk, listing, mitra) boleh dibaca publik, read-only.
- Fungsi `login_user` / `register_user` hanya bisa dipanggil `service_role`.
