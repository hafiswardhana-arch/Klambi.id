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

Jalan pintas: `supabase/setup_all.sql` = keempat file di atas dalam satu file. Tempel sekali, Run.
Semuanya aman dijalankan ulang. Cek di **Table Editor**: tabel `users` berisi 10 akun.

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
1. **Customer membayar** → uang masuk ke rekening escrow Klámbi. Mitra belum menerima apa pun.
2. **Mitra memproses / mengirim** barang atau mengerjakan jasa, lalu menandai **sudah tiba**.
3. **Customer menekan "Konfirmasi Diterima"** → admin melepas dana ke saldo mitra.
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
| Customer | `/profil` → bagian *Pesanan & Dana Escrow* (bayar, konfirmasi, lapor) |
| Mitra | `/mitra/pesanan` (login `rini`, `sari`, `vintage_jkt`, …) |
| Admin | `/admin/escrow` (login `admin`) — saldo yang ditahan, sengketa, buku besar |

Keamanan: semua perpindahan dana terjadi di dalam fungsi Postgres yang atomik (baris dikunci `FOR UPDATE`),
hanya bisa dipanggil server (`service_role`), memeriksa peran pelaku, menolak transisi status ilegal
(mis. konfirmasi dua kali), dan mencatat jejak audit di `escrow_events` + `wallet_ledger`.

## 5. Akun demo
| Username | Password | Peran |
|---|---|---|
| `hafiz` | `klambi123` | Pengguna utama — data paling lengkap (notifikasi, lemari, keranjang, 5 pesanan, chat, booking) |
| `rini` | `klambi123` | Penjual thrift (Bandung) |
| `dewi` | `klambi123` | Pembeli aktif (Jakarta Barat) |
| `bagas` | `klambi123` | Pengguna Eco (Yogyakarta) |
| `sari` | `klambi123` | Mitra jasa permak (Surabaya) |
| `admin` | `admin123` | Administrator / penahan dana escrow |
| `vintage_jkt`, `sirkular_kemang`, `kindfoam`, `batik_solo` | `klambi123` | Mitra/penjual untuk pesanan escrow |

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
