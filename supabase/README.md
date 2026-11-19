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
Supabase Dashboard → **SQL Editor → New query**:
1. Tempel seluruh isi `supabase/schema.sql` → **Run**.
2. Query baru → tempel seluruh isi `supabase/seed.sql` → **Run**.

Keduanya aman dijalankan ulang. Cek di **Table Editor**: tabel `users` berisi 6 akun.

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

## 4. Akun demo
| Username | Password | Peran |
|---|---|---|
| `hafiz` | `klambi123` | Pengguna utama — data paling lengkap (notifikasi, lemari, keranjang, 5 pesanan, chat, booking) |
| `rini` | `klambi123` | Penjual thrift (Bandung) |
| `dewi` | `klambi123` | Pembeli aktif (Jakarta Barat) |
| `bagas` | `klambi123` | Pengguna Eco (Yogyakarta) |
| `sari` | `klambi123` | Mitra jasa permak (Surabaya) |
| `admin` | `admin123` | Administrator |

Login juga bisa memakai email, mis. `hafiz@klambi.id`. Login baru di perangkat baru tetap
meminta OTP 2FA (kode ditampilkan di aplikasi).

## Apa yang sudah tersambung ke database
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
