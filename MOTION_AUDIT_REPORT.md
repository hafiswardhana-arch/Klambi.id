# Laporan Audit Repositori & Rencana Motion Design — Klambi.id
**Dokumen:** Motion Design & Interactive Experience System Audit  
**Versi:** 1.0  
**Tanggal:** 6 November 2026  
**Status:** Disetujui untuk Implementasi  

---

## 1. Existing Technology Stack

Berdasarkan audit komprehensif terhadap repository Klambi.id:

| Komponen | Teknologi Aktual | Keterangan |
| :--- | :--- | :--- |
| **Framework Frontend** | Next.js 15.5.18 (App Router) | Modern React 19 architecture (`react@19.0.3`, `react-dom@19.0.3`) |
| **Bahasa Pemrograman**| TypeScript 5 | Tipe data kuat, zero compilation warning |
| **Styling Framework**  | Tailwind CSS 3.4.6 | `@tailwindcss/typography`, `@tailwindcss/forms`, `tailwindcss-animate` |
| **Component Icons**    | `@heroicons/react` 2.2.0 & `lucide-react` 1.7.0 | SVG icons teroptimasi |
| **Feedback & Toasts**  | `sonner` 1.7.4 | Toast notification engine modern & minimalis |
| **Data Visuals**       | `recharts` 2.15.2 | Visualisasi skor & chart sirkular |
| **Routing System**     | Next.js App Router (`src/app/*`) | Halaman client-side & server-side hybrid |
| **Linting & Code Style**| ESLint 9, Prettier 3.5.3 | Standar penulisan konsisten |
| **Backend Integration**| Next.js Edge Middleware & Server Utilities | Security modules (AES-256, RBAC, Idempotency, Escrow State Machine) |

---

## 2. Project Architecture & Directory Structure

```text
src/
├── app/
│   ├── layout.tsx                     # Root layout, fonts, toaster, viewport
│   ├── page.tsx                       # Dashboard / Home utama (Featured drops, impact metrics)
│   ├── login/page.tsx                 # Autentikasi, 2FA OTP, form validation
│   ├── wearwise-ai/page.tsx           # AI Vision & Scanner pakaian (Flagship interaction)
│   ├── keputusan/page.tsx             # Decision Hub (Care, Alter, Sell, Circulate)
│   ├── trift-marketplace/            # Marketplace kurasi pakaian thrift sirkular
│   ├── menu-perawatan/                # Layanan jasa permak, binatu & recolor
│   ├── styliss-ai/                    # Simulasi manekin 3D berbasis AI
│   ├── pembayaran/page.tsx            # Transaksi Escrow, Idempotency, Payment gateway
│   └── profil/                        # Manajemen profil, garansi escrow, voucher, review
├── components/
│   ├── AppLayout.tsx                  # Global wrapper (TopHeader, Main container, BottomNav)
│   ├── BottomNav.tsx                  # Floating navigation dock dengan active indicators
│   ├── TopHeader.tsx                  # Header atas konsisten
│   ├── motion/                        # [BARU] Reusable Motion Component Library
│   └── ui/                            # Atoms & Molecules (Badge, Modal, KlambiLogo, Icons)
├── lib/
│   ├── motion/                        # [BARU] Motion tokens, hooks, utils
│   └── security/                      # Lapisan keamanan data, enkripsi, audit logging
└── styles/
    ├── index.css
    └── tailwind.css                   # Global CSS, keyframes, motion utilities
```

---

## 3. Existing Animation Inventory & Gap Analysis

| Bagian | Implementasi Saat Ini | Peluang Peningkatan (Motion PRD) |
| :--- | :--- | :--- |
| **Motion Tokens** | Token dasar di `tailwind.config.js` | Standarisasi token `Fast (150ms)`, `Normal (250ms)`, `Moderate (350ms)`, `Slow (500ms)` dengan kurva natural easing. |
| **Reusable Components**| Belum ada folder khusus komponen animasi | Bangun folder `src/components/motion/` (`FadeIn`, `SlideUp`, `ScaleIn`, `StaggerContainer`, `RevealOnScroll`, `AnimatedButton`, `AnimatedCard`, dll). |
| **Dashboard (Home)** | Count-up timer sederhana & fade-in CSS | Staggered card entrance bertingkat, active category pill transition, skeleton shimmer saat memuat produk, micro-press pada CTA. |
| **AI Vision Scanner** | Scan line CSS dasar & modal 4 checklist | Flagship interaction: Object lock corner brackets, smooth laser line, progressive checklist state morphing, Signature Circular Infinity loop. |
| **Decision Layer** | Kartu grid statis dengan klik biasa | Interactive selection animation, active border glow, recommendation reveal with smooth expansion. |
| **Marketplace & Jasa**| Grid kartu produk standar | Staggered entrance saat scroll viewport, thumbnail hero transition, skeleton loading cards. |
| **Aksesibilitas** | Belum ada detector `prefers-reduced-motion` | Implementasi custom hook `useReducedMotion` dan fallback CSS `@media (prefers-reduced-motion: reduce)`. |

---

## 4. Technical Strategy & Principles

Sesuai **PRD Section 2 & Section 7.6**:
1. **Preserve Existing Code:** Tidak merusak atau menghapus fungsionalitas logika bisnis, kamera hardware, escrow security, maupun routing.
2. **Performance First:** 100% menggunakan properti CSS `transform` dan `opacity` (GPU composited) untuk menghindari layout reflow.
3. **No Heavy JS Bundle Bloat:** Memanfaatkan arsitektur React 19 + Next.js 15 tanpa menambahkan library pihak ketiga yang berpotensi menyebabkan ketidakcocokan versi React 19.
4. **Universal Accessibility:** Seluruh animasi otomatis dinonaktifkan atau digantikan dengan transisi instan bagi pengguna dengan preferensi `prefers-reduced-motion`.

---

## 5. Implementation Roadmap

- [x] **P0 — Phase 1:** Repository Audit & Codebase Discovery (Dokumen ini)
- [ ] **P0 — Phase 2:** Motion Design Tokens, Hooks (`useReducedMotion`), & Reusable Animation Components (`src/components/motion/*`)
- [ ] **P1 — Phase 3 & 4:** Dashboard & Global Micro-Interactions (`app/page.tsx`, `BottomNav.tsx`, `login/page.tsx`)
- [ ] **P1 — Phase 4:** Flagship AI Vision Scanner & Signature Circular Motion (`wearwise-ai/page.tsx`)
- [ ] **P1 — Phase 4:** Decision Layer & Recommendation Experience (`keputusan/page.tsx`, `DecisionButtonPair.tsx`)
- [ ] **P2 — Phase 4:** Marketplace, Payment, & Profile Motion Polish
- [ ] **P0 — Phase 6 & 7:** Testing, Accessibility Verification, Performance Check, Git Push to GitHub
