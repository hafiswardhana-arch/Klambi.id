# Dokumentasi Perubahan Sistem Keamanan (SECURITY_CHANGES.md) — Klambi.id

Dokumen ini mendokumentasikan secara rinci audit keamanan, arsitektur mitigasi, dan seluruh perubahan kode yang diimplementasikan pada branch `security-hardening` platform **Klambi.id**.

---

## Ringkasan Eksekutif

| Kategori | Status Implementasi | Standar Acuan | File Terkait |
| :--- | :--- | :--- | :--- |
| **1. Autentikasi & Akun** | ✅ Selesai | OWASP ASVS v4.0, NIST SP 800-63B | `hash.ts`, `rate-limiter.ts`, `otp.ts`, `jwt.ts`, `session.ts`, `login/page.tsx` |
| **2. Transaksi & Escrow** | ✅ Selesai | PCI-DSS Level 1, IETF Idempotency Draft | `pricing.ts`, `payment-gateway.ts`, `audit-logger.ts`, `idempotency.ts`, `escrow-state-machine.ts`, `pembayaran/page.tsx` |
| **3. Data Pribadi (UU PDP)** | ✅ Selesai | UU No. 27/2022 (PDP), OWASP Cryptographic Storage | `crypto.ts`, `rbac.ts`, `masking.ts`, `pdp-erasure.ts` |
| **4. API & Backend** | ✅ Selesai | OWASP Top 10 A03, RFC 6585 | `sanitizer.ts`, `api-rate-limiter.ts`, `s2s-auth.ts`, `next.config.mjs`, `middleware.ts` |
| **5. Mobile APK Security** | ✅ Selesai | OWASP MASVS v2.0 | `proguard-rules.pro`, `network_security_config.xml`, `device-integrity.ts`, `secure-storage.ts`, `env.ts` |
| **6. Infrastruktur & Policy** | ✅ Selesai | GitHub Security Standards, ISO 27001 | `.gitignore`, `.env.example`, `SECURITY.md` |

---

## 1. Autentikasi & Manajemen Akun

### Perubahan yang Dilakukan:
1. **Password Hashing Kriptografis (`src/lib/security/hash.ts`):**
   - Mengimplementasikan PBKDF2 dengan HMAC-SHA-512 (600.000 iterasi) dan salt acak 16-byte menggunakan Web Crypto API yang kompatibel dengan Edge dan Node.js runtime.
   - Menyediakan interface verifikasi konstan (*timing-safe string comparison*) untuk mencegah *side-channel timing attacks*.
   - Menyediakan arsitektur integrasi Argon2id / Bcrypt (cost factor >= 12) dengan penanda `// TODO:` untuk modul native production.
2. **Rate Limiting Percobaan Masuk (`src/lib/security/rate-limiter.ts`):**
   - Menerapkan mekanisme pembatasan laju sliding-window: **maksimal 5 kali percobaan gagal per 15 menit per akun/IP**.
   - Menghitung waktu tunggu (*retry-after*) dan mengunci proses autentikasi sementara jika terdeteksi indikasi *brute-force* atau *credential stuffing*.
3. **Multi-Factor Authentication / OTP 2FA (`src/lib/security/otp.ts`):**
   - Generator OTP 6-digit acak berbasis kriptografi dengan masa berlaku 5 menit (TTL 300 detik) dan batas maksimal 3 kali salah input.
   - Wajib untuk: login dari perangkat baru (*untrusted device*), penarikan saldo dompet (*withdrawal*), dan perubahan rekening bank.
   - Mendukung integrasi delivery via SMS/WhatsApp gateway dengan kode uji demo terintegrasi.
4. **JWT Short-Lived Access & Refresh Tokens (`src/lib/security/jwt.ts`):**
   - Access Token dengan masa aktif singkat: **15 menit**.
   - Refresh Token dengan masa aktif: **7 hari**.
   - Tanda tangan kriptografis HMAC-SHA256.
   - Mekanisme *Token Revocation Registry (JTI Blacklist)* untuk memastikan token segera kedaluwarsa saat pengguna melakukan logout.
5. **Session Management (`src/lib/security/session.ts`):**
   - Pembuatan sesi aman dengan fingerprint perangkat (*device fingerprinting*) guna mendeteksi pembajakan sesi (*session hijacking*).
   - Validasi batas ketidakaktifan sesi (*idle timeout*) selama 30 menit.
6. **Pembaruan Halaman Login (`src/app/login/page.tsx`):**
   - Mengintegrasikan pengecekan rate limiting, tantangan modal verifikasi 2FA OTP, serta pembuatan sesi dan token yang aman tanpa merusak pengalaman demo akun `admin / admin`.

---

## 2. Keamanan Transaksi & Rekening Bersama (Escrow)

### Perubahan yang Dilakukan:
1. **Kalkulasi Harga Berbasis Server / Zero-Client-Trust (`src/lib/security/pricing.ts`):**
   - Seluruh nominal transaksi, biaya admin platform (5%), asuransi perlindungan pembeli (Rp 2.500), dan nilai penahanan escrow dihitung ulang secara otoritatif di server.
   - Nilai harga yang dikirim oleh client dianggap *untrusted* dan diverifikasi terhadap katalog jasa sirkular (tailor, laundry, recolor).
2. **Adapter Payment Gateway PCI-DSS Level 1 (`src/lib/security/payment-gateway.ts`):**
   - Klambi.id tidak pernah menyimpan nomor kartu kredit atau kode CVV pengguna (*zero cardholder data retention*).
   - Seluruh pemrosesan pembayaran didelegasikan ke Midtrans Snap / Xendit.
   - Validasi tanda tangan webhook menggunakan enkripsi SHA-512 untuk mencegah *fake payment notification injection*.
3. **Rantai Audit Log Transaksi Nir-Ubah (`src/lib/security/audit-logger.ts`):**
   - Setiap perubahan status pesanan dicatat secara permanen (*immutable*) meliputi: `logId`, `transactionId`, `previousStatus`, `newStatus`, `actor`, `actorRole`, `timestamp`, `ipAddress`, `userAgent`, dan `reason`.
   - Menerapkan *hash-chaining* (setiap log memuat hash dari log sebelumnya) guna mendeteksi jika terjadi manipulasi data historis pada basis data.
4. **Kunci Idempotensi / Anti Double-Charge (`src/lib/security/idempotency.ts`):**
   - Mengadopsi standar IETF Idempotency-Key.
   - Mengunci eksekusi pembayaran yang sedang berjalan (*in-flight lock*) dan membalas request duplikat dengan respon cache terverifikasi selama 24 jam.
5. **Mesin Status Escrow Ketat (`src/lib/security/escrow-state-machine.ts`):**
   - Memvalidasi alur hidup transaksi resmi: `CREATED` ➔ `PAID` ➔ `IN_PROGRESS` ➔ `COMPLETED` / `DISPUTED` ➔ `REFUNDED`.
   - Menolak loncatan status ilegal (misal dari `PAID` langsung ke `COMPLETED` tanpa melalui `IN_PROGRESS`).
   - Penegakan otorisasi peran: hanya mitra yang bisa mengubah ke `IN_PROGRESS`, hanya pembeli/sistem yang bisa mengonfirmasi `COMPLETED`, dan hanya admin yang bisa menyelesaikan sengketa `DISPUTED`.
6. **Pembaruan Halaman Pembayaran (`src/app/pembayaran/page.tsx`):**
   - Mengintegrasikan pengecekan kalkulasi harga otoritatif, kunci idempotensi, audit log otomatis, dan badge sertifikasi keamanan pengguna.

---

## 3. Keamanan Data Pengguna & Kepatuhan Hukum (UU PDP No. 27/2022)

### Perubahan yang Dilakukan:
1. **Enkripsi Data Sensitif At-Rest (`src/lib/security/crypto.ts`):**
   - Enkripsi simetris **AES-256-GCM** dengan tag otentikasi 128-bit dan IV acak 12-byte per enkripsi.
   - Digunakan untuk mengamankan nomor rekening bank, data NIK KTP mitra verifikasi, dan alamat domisili lengkap saat disimpan di database.
2. **Kontrol Akses Berbasis Peran & Validasi Kepemilikan Data (`src/lib/security/rbac.ts`):**
   - Pemisahan izin ketat antara peran `user`, `mitra`, `cs`, dan `admin`.
   - Pengecekan *Resource Ownership* untuk memitigasi celah Insecure Direct Object References (IDOR / BOLA) pada endpoint profil dan transaksi.
3. **Masking & Redaksi Data Sensitif (`src/lib/security/masking.ts`):**
   - Fungsi penyamaran data otomatis untuk response publik dan log:
     - Nomor rekening: `••••••7890`
     - NIK KTP: `3171••••••••••01`
     - Email: `h••••@klambi.id`
     - Telepon: `0812•••••789`
   - Fungsi `sanitizeLogObject` yang secara otomatis membuang password, token, dan PIN dari pencatatan log.
4. **Mekanisme Hak Penghapusan Data / Right to Erasure (`src/lib/security/pdp-erasure.ts`):**
   - Mengimplementasikan alur kepatuhan Pasal 8, 40, dan 43 UU No. 27/2022 (UU PDP).
   - Memvalidasi saldo escrow aktif (penghapusan akun ditahan sementara jika terdapat transaksi berjalan).
   - Melakukan shredding kriptografis dan pseudonimisasi data pribadi menjadi data statistik non-identifikasi.

---

## 4. Keamanan API & Backend

### Perubahan yang Dilakukan:
1. **Sanitasi Input & Anti-Injeksi (`src/lib/security/sanitizer.ts`):**
   - Pembersihan entitas HTML dan pelarangan skrip berbahaya, protokol `javascript:`, serta penanganan injeksi NoSQL operator (`$where`, `$regex`).
   - Pendeteksi pola SQL Injection (SQLi) untuk validasi parameter formulir.
2. **API Rate Limiting Berjenjang (`src/lib/security/api-rate-limiter.ts`):**
   - Pembatasan laju global (100 req/menit), scan AI Wearwise & Styliss (20 req/menit), autentikasi (10 req/15 menit), dan penarikan dana finansial (5 req/jam).
   - Menghasilkan header kepatuhan RFC 6585 (`RateLimit-Limit`, `RateLimit-Remaining`, `RateLimit-Reset`).
3. **Otentikasi Server-to-Server / S2S (`src/lib/security/s2s-auth.ts`):**
   - Validasi API Key waktu-konstan (*constant-time*).
   - Verifikasi tanda tangan HMAC-SHA256 untuk webhook mitra logistik dan pembayaran dengan jendela toleransi waktu 300 detik (*anti-replay attack*).
4. **Penguatan Konfigurasi Next.js (`next.config.mjs`):**
   - **`productionBrowserSourceMaps: false`:** Mencegah kebocoran struktur kode sumber dan komentar internal pada environment produksi.
   - **`poweredByHeader: false`:** Menghilangkan fingerprint teknologi `X-Powered-By: Next.js`.
   - Mengonfigurasi header keamanan HTTP lengkap:
     - `Content-Security-Policy (CSP)`
     - `X-Frame-Options: DENY` (anti-clickjacking)
     - `X-Content-Type-Options: nosniff` (anti-MIME sniffing)
     - `Strict-Transport-Security (HSTS)`
     - `Referrer-Policy: strict-origin-when-cross-origin`
     - `Permissions-Policy: camera=(self), microphone=(), geolocation=()`
5. **Next.js Edge Middleware (`src/middleware.ts`):**
   - Memaksa pengalihan HTTPS / TLS 1.2+ pada traffic produksi.
   - Menegakkan kebijakan CORS ketat yang hanya mengizinkan origin resmi Klambi.id.
   - Memeriksa batas kuota laju API dan menginjeksi header perlindungan tepi (*edge security headers*).

---

## 5. Keamanan Aplikasi Mobile (APK)

### Perubahan yang Dilakukan:
1. **Aturan Obfuscation R8 / ProGuard (`mobile/proguard-rules.pro`):**
   - Mengaktifkan pengecilan kode (*code shrinking*), optimasi multi-pass, dan penyamaran nama kelas/metode (*name obfuscation*).
   - Melakukan repackaging kelas internal ke dalam namespace acak `id.klambi.internal`.
   - Menghapus pemanggilan logging debug (`Log.d`, `Log.v`, `Log.i`) pada build release APK.
2. **Konfigurasi Keamanan Jaringan & SSL Pinning (`mobile/network_security_config.xml` & `src/lib/security/ssl-pinning.ts`):**
   - Mematikan seluruh lalu lintas teks polos HTTP (`cleartextTrafficPermitted="false"`).
   - Menerapkan SSL Pinning dengan hash SHA-256 SPKI untuk domain `klambi.id` dan gateway pembayaran, menolak sertifikat proxy buatan pengguna (*anti-MITM / Burp Suite interception*).
3. **Pemberitahuan Deteksi Root / Jailbreak (`src/lib/security/device-integrity.ts`):**
   - Memeriksa jejak instrumentasi Frida, Xposed, Magisk, Cydia, serta framework otomatisasi browser (`navigator.webdriver`).
   - Memberikan rekomendasi pencegahan transaksi berisiko tinggi jika dijalankan di lingkungan tidak tepercaya.
4. **Penyimpanan Klien Terenkripsi / Secure Storage (`src/lib/security/secure-storage.ts`):**
   - Mengenkripsi seluruh token dan data sesi menggunakan AES-256-GCM sebelum disimpan di browser `localStorage`.
   - Mengaburkan nama kunci (*storage key obfuscation*) untuk melindungi data pengguna dari pembacaan oleh ekstensi peramban pihak ketiga.
5. **Manajemen Environment & Zero-Hardcoded Secrets (`src/lib/security/env.ts`):**
   - Memvalidasi variabel lingkungan saat runtime dan menggagalkan inisialisasi pada build produksi jika masih menggunakan nilai kredensial default/demo.

---

## 6. Dependensi & Kebijakan Infrastruktur

### Perubahan yang Dilakukan:
1. **Penguatan `.gitignore`:**
   - Memastikan seluruh variasi file rahasia (`.env*`, `.pem`, `*.key`, `*.keystore`, `*.jks`, `*.p12`) diabaikan secara ketat dari pelacakan Git, dengan pengecualian file aman `!.env.example`.
2. **Template Variabel Lingkungan (`.env.example`):**
   - Menyediakan panduan konfigurasi yang aman tanpa membocorkan kredensial riil.
3. **Kebijakan Keamanan (`SECURITY.md`):**
   - Menetapkan kanal pelaporan kerentanan [security@klambi.id](mailto:security@klambi.id), SLA penanganan insiden, cakupan program Bug Bounty, dan aturan pengujian etis.
