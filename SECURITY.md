# Kebijakan Keamanan Klambi.id (Security Policy)

Klambi.id sangat memprioritaskan keamanan platform, integritas transaksi dana bersama (Escrow), dan privasi data pengguna. Dokumen ini menjelaskan kebijakan penanganan kerentanan keamanan, kepatuhan hukum, dan panduan pelaporan kerentanan secara bertanggung jawab (Responsible Vulnerability Disclosure).

---

## 1. Versi yang Didukung (Supported Versions)

Kami secara aktif memelihara dan memperbarui keamanan untuk versi berikut:

| Versi / Branch | Status Dukungan |
| :--- | :--- |
| `security-hardening` | ✅ Didukung Penuh (Branch Keamanan Aktif) |
| `main` (Latest) | ✅ Didukung Penuh |
| < 1.0.0 (Legacy) | ❌ Tidak Didukung |

---

## 2. Pelaporan Kerentanan (Reporting a Vulnerability)

Jika Anda menemukan celah keamanan (*vulnerability*) atau potensi kebocoran data di aplikasi web atau mobile Klambi.id, mohon **JANGAN** membuat *public issue* di GitHub. Laporkan secara privat melalui saluran berikut:

- **Email Khusus Tim Keamanan:** [security@klambi.id](mailto:security@klambi.id)
- **Subjek Email:** `[SECURITY DISCLOSURE] - <Komponen / Ringkasan Masalah>`
- **Waktu Tanggapan (SLA):**
  - Konfirmasi penerimaan laporan: **Maksimal 24 jam**
  - Penilaian awal tingkat keparahan (Triage): **Maksimal 48 jam**
  - Rilis perbaikan (Patch Release): **1 - 7 hari kerja** tergantung tingkat kritikalitas (CVSS v3).

### Informasi yang Diharapkan dalam Laporan
Agar kami dapat mereproduksi dan memvalidasi temuan dengan cepat, sertakan:
1. Deskripsi rinci mengenai jenis kerentanan (misal: IDOR, SQLi, XSS, Bypass Auth, Escrow Tampering).
2. Langkah-langkah reproduksi (Proof of Concept / PoC) yang jelas.
3. Lingkungan pengujian (Browser, OS, URL endpoint, header request).
4. Dampak potensial jika celah tersebut dieksploitasi.

---

## 3. Cakupan Program Bug Bounty & Aturan Pengujian (Rules of Engagement)

Kami menyambut baik bantuan dari para peneliti keamanan (*white hat security researchers*) dengan aturan:
- **Dilarang keras:**
  - Melakukan serangan Denial of Service (DoS/DDoS).
  - Mengakses, mengubah, menghapus, atau membocorkan data pengguna asli (*real user data*).
  - Melakukan uji coba manipulasi transaksi finansial pada gateway produksi. Gunakan lingkungan sandbox.
  - Melakukan rekayasa sosial (*social engineering*) atau *phishing* terhadap staf, mitra, atau pengguna Klambi.id.
- **Wajib:**
  - Menghormati privasi data dan hukum Republik Indonesia (UU ITE dan UU Perlindungan Data Pribadi No. 27 Tahun 2022).
  - Memberikan kami waktu yang cukup untuk merilis perbaikan sebelum mempublikasikan temuan ke publik (*Coordinated Disclosure*).

---

## 4. Standar Arsitektur Keamanan Klambi.id

Platform Klambi.id mengadopsi kontrol keamanan multi-lapis:
1. **Autentikasi & Akun:** Password hashing dengan PBKDF2/SHA-512 (600.000 iterasi) & dukungan Argon2id/Bcrypt, pembatasan laju (*rate limiting*) 5 kali per 15 menit, verifikasi 2FA OTP untuk penarikan dana dan login perangkat baru, serta JWT bersiklus pendek (15 menit) dengan mekanisme *revocation list*.
2. **Transaksi & Rekening Bersama (Escrow):** Kalkulasi harga 100% di server (*zero-trust client*), integrasi PCI-DSS Level 1 via Midtrans/Xendit tanpa menyimpan nomor kartu/CVV di server sendiri, kunci idempotensi (*anti double-charge*), mesin status (*state-machine*) validasi tahapan transaksi yang ketat, dan rantai audit log nir-ubah (*tamper-evident hash chaining*).
3. **Perlindungan Data Pengguna (UU PDP):** Enkripsi simetris AES-256-GCM saat data disimpan (*at rest*) untuk NIK KTP dan nomor rekening bank, penegakan koneksi aman HTTPS/TLS 1.2+, kontrol akses berbasis peran (RBAC) dengan validasi kepemilikan data, masking data sensitif pada log dan response, serta protokol penghapusan data (*Right to Erasure*).
4. **Keamanan API & Mobile:** Penolakan frame luar (Anti-Clickjacking CSP & X-Frame-Options), deteksi manipulasi root/jailbreak pada perangkat, penyimpanan lokal terenkripsi (*secure storage*), konfigurasi SSL Pinning, dan aturan obfuscation R8/ProGuard pada build Android APK.
