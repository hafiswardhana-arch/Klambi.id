'use client';
import React, { useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

interface ProductRecommendation {
  id: string;
  title: string;
  price: number;
  originalPrice: number;
  discountPercent: number;
  condition: string;
  seller: string;
  city: string;
  rating: number;
  soldCount: number;
  imageBg: string;
  category: string;
}

const mockRecommendations: ProductRecommendation[] = [
  {
    id: 'rec-1',
    title: "Jaket Denim Levi's Type III Vintage 90s Original",
    price: 185000,
    originalPrice: 350000,
    discountPercent: 47,
    condition: 'Grade A (Sangat Mulus)',
    seller: 'DenimHouse_JKT',
    city: 'Jakarta Selatan',
    rating: 4.9,
    soldCount: 42,
    imageBg: 'from-blue-700 to-indigo-900',
    category: 'Thrift Preloved',
  },
  {
    id: 'rec-2',
    title: 'Upcycled Patchwork Kimono Haori Rework Denim',
    price: 120000,
    originalPrice: 200000,
    discountPercent: 40,
    condition: 'Karya Rework Baru',
    seller: 'SirkularArtisan',
    city: 'Bandung',
    rating: 5.0,
    soldCount: 19,
    imageBg: 'from-emerald-700 to-teal-900',
    category: 'Upcycle Tekstil',
  },
  {
    id: 'rec-3',
    title: 'Kemeja Flannel Oversize Uniqlo Preloved Earth Tone',
    price: 75000,
    originalPrice: 149000,
    discountPercent: 50,
    condition: 'Grade A (Bersih)',
    seller: 'CleanVintage_BDG',
    city: 'Bandung',
    rating: 4.8,
    soldCount: 68,
    imageBg: 'from-amber-700 to-stone-900',
    category: 'Thrift Preloved',
  },
  {
    id: 'rec-4',
    title: 'Celana Corduroy Earth Brown Straight Cut 90s',
    price: 145000,
    originalPrice: 299000,
    discountPercent: 51,
    condition: 'Grade A+ (Like New)',
    seller: 'RetroWardrobe',
    city: 'Surabaya',
    rating: 4.9,
    soldCount: 31,
    imageBg: 'from-yellow-800 to-stone-900',
    category: 'Thrift Preloved',
  },
];

export default function ProfileContent() {
  const router = useRouter();

  // User profile state
  const [userName, setUserName] = useState('Muhammad Hafiz Maulana');
  const [userAvatar, setUserAvatar] = useState('🧑‍🦱');
  const [userBio, setUserBio] = useState('Penggiat fashion sirkular & vintage denim collector.');
  const [userTier] = useState('Kontributor Gold 🥇');
  const [saldoKlambi, setSaldoKlambi] = useState(850000);
  const [poinEco, setPoinEco] = useState(2450);
  const [escrowHeld] = useState(320000);
  const [voucherCount, setVoucherCount] = useState(6);

  // Biometric state
  const [isBiometricBannerVisible, setIsBiometricBannerVisible] = useState(true);
  const [isBiometricActive, setIsBiometricActive] = useState(false);

  // Modal active states
  const [activeModal, setActiveModal] = useState<
    | null
    | 'settings'
    | 'tier_benefits'
    | 'dampak_detail'
    | 'edit_profile'
    | 'order_belum_bayar'
    | 'order_diproses_escrow'
    | 'order_dikirim'
    | 'order_penilaian'
    | 'tarik_saldo'
    | 'tukar_poin'
    | 'voucher_list'
    | 'garansi_escrow_info'
    | 'riwayat_scan'
    | 'favorit_saya'
    | 'referral_program'
    | 'bagi_voucher'
    | 'terakhir_dilihat'
    | 'pusat_bantuan'
    | 'customer_service'
    | 'product_detail'
  >(null);

  const [selectedProduct, setSelectedProduct] = useState<ProductRecommendation | null>(null);
  const [referralCopied, setReferralCopied] = useState(false);
  const [chatMessages, setChatMessages] = useState<Array<{ sender: 'ai' | 'user'; text: string; time: string }>>([
    {
      sender: 'ai',
      text: 'Halo Kak Hafiz! 👋 Saya Asisten Virtual Klambi.id. Ada yang bisa kami bantu terkait transaksi, escrow, atau verifikasi baju?',
      time: '12:00',
    },
  ]);
  const [chatInput, setChatInput] = useState('');

  // Wishlist state for interactive like
  const [wishlist, setWishlist] = useState<string[]>(['rec-1', 'rec-3']);

  const toggleWishlist = (id: string, e?: React.MouseEvent) => {
    e?.stopPropagation();
    if (wishlist.includes(id)) {
      setWishlist(wishlist.filter((x) => x !== id));
      toast.info('Dihapus dari Favorit');
    } else {
      setWishlist([...wishlist, id]);
      toast.success('Disimpan ke Favorit ❤️');
    }
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    const userMsg = chatInput.trim();
    const now = new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    setChatMessages((prev) => [...prev, { sender: 'user', text: userMsg, time: now }]);
    setChatInput('');

    setTimeout(() => {
      let reply = 'Terima kasih telah menghubungi kami. Tim Support Klambi.id siap mendampingi proses transaksi rekber escrow Anda.';
      if (userMsg.toLowerCase().includes('escrow') || userMsg.toLowerCase().includes('dana')) {
        reply = 'Dana pembayaran Anda tersimpan aman di Rekening Bersama Escrow Klambi.id dan baru diteruskan setelah barang tiba dan Anda konfirmasi sesuai!';
      } else if (userMsg.toLowerCase().includes('ongkir') || userMsg.toLowerCase().includes('kurir')) {
        reply = 'Untuk voucher gratis ongkir jemput kurir, Anda dapat mengklaimnya langsung di menu Transaksi Saya atau halaman Checkout.';
      }
      setChatMessages((prev) => [
        ...prev,
        {
          sender: 'ai',
          text: reply,
          time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }),
        },
      ]);
    }, 600);
  };

  const handleClaimVoucher = (code: string) => {
    setVoucherCount((c) => c + 1);
    toast.success(`Voucher "${code}" berhasil diklaim ke Dompet Saya! 🎉`);
  };

  return (
    <div className="space-y-4 pb-20 text-slate-800">
      {/* ========================================================================= */}
      {/* 1. HEADER PROFIL (Shopee Style with Dark Navy Accent & Quick Icons)      */}
      {/* ========================================================================= */}
      <div className="bg-gradient-to-br from-[#10284D] via-[#163766] to-[#0D1F3C] text-white p-5 rounded-2xl shadow-lg relative overflow-hidden">
        {/* Background decorative circles */}
        <div className="absolute -right-8 -top-8 w-32 h-32 bg-white/5 rounded-full blur-xl pointer-events-none" />
        <div className="absolute -left-8 -bottom-8 w-32 h-32 bg-emerald-500/10 rounded-full blur-xl pointer-events-none" />

        {/* Top bar quick action buttons */}
        <div className="flex items-center justify-between mb-4">
          <span className="text-xs font-semibold tracking-wider uppercase text-emerald-300 bg-emerald-950/60 px-2.5 py-0.5 rounded-full border border-emerald-500/30">
            Akun Terverifikasi 🛡️
          </span>
          <div className="flex items-center gap-1.5">
            <button
              onClick={() => setActiveModal('settings')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-sm"
              title="Pengaturan Akun"
            >
              <Icon name="Cog6ToothIcon" size={19} />
            </button>
            <button
              onClick={() => router.push('/keranjang')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-sm relative"
              title="Keranjang Belanja"
            >
              <Icon name="ShoppingCartIcon" size={19} />
              <span className="absolute -top-1 -right-1 w-4 h-4 bg-rose-500 text-[10px] font-bold rounded-full flex items-center justify-center text-white border border-[#10284D]">
                2
              </span>
            </button>
            <button
              onClick={() => setActiveModal('customer_service')}
              className="p-2 rounded-xl bg-white/10 hover:bg-white/20 active:scale-95 transition-all text-white backdrop-blur-sm relative"
              title="Pesan & Bantuan"
            >
              <Icon name="ChatBubbleLeftRightIcon" size={19} />
              <span className="absolute -top-1 -right-1 w-2.5 h-2.5 bg-emerald-400 rounded-full border-2 border-[#10284D]" />
            </button>
          </div>
        </div>

        {/* Avatar + Main Info */}
        <div className="flex items-center gap-4">
          <div className="relative group cursor-pointer" onClick={() => setActiveModal('edit_profile')}>
            <div className="w-16 h-16 rounded-full bg-gradient-to-tr from-amber-400 via-emerald-400 to-teal-200 p-0.5 shadow-md">
              <div className="w-full h-full bg-[#10284D] rounded-full flex items-center justify-center text-3xl select-none group-hover:scale-105 transition-transform">
                {userAvatar}
              </div>
            </div>
            <span className="absolute bottom-0 right-0 bg-emerald-500 text-white p-1 rounded-full text-[10px] shadow border-2 border-[#10284D]">
              <Icon name="PencilSquareIcon" size={12} />
            </span>
          </div>

          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2">
              <h2 className="text-lg font-bold text-white truncate">{userName}</h2>
            </div>
            <button
              onClick={() => setActiveModal('tier_benefits')}
              className="mt-1 inline-flex items-center gap-1.5 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-amber-500/20 text-amber-300 border border-amber-400/40 hover:bg-amber-500/30 transition-colors"
            >
              <span>{userTier}</span>
              <Icon name="ChevronRightIcon" size={12} />
            </button>
            <p className="text-xs text-slate-300 mt-1 flex items-center gap-1">
              <span className="font-semibold text-emerald-400">12 Selesai</span>
              <span>•</span>
              <span className="font-semibold text-sky-300">18 Discan</span>
            </p>
          </div>
        </div>

        {/* Edit profile shortcut button */}
        <button
          onClick={() => setActiveModal('edit_profile')}
          className="mt-4 w-full py-2 px-3 rounded-xl bg-white/10 hover:bg-white/15 active:scale-[0.99] transition-all text-xs font-medium text-slate-200 border border-white/10 flex items-center justify-center gap-1.5"
        >
          <Icon name="UserIcon" size={14} />
          Edit Profil & Informasi Sirkular
        </button>
      </div>

      {/* ========================================================================= */}
      {/* 2. BANNER KEANGGOTAAN VIP (Dampak Lingkungan & Hemat Finansial)            */}
      {/* ========================================================================= */}
      <div
        onClick={() => router.push('/dampak')}
        className="bg-gradient-to-r from-emerald-50 via-teal-50 to-emerald-100/70 border border-emerald-200/80 p-3.5 rounded-2xl flex items-center justify-between cursor-pointer hover:shadow-md transition-all group"
      >
        <div className="flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-xl shadow-sm group-hover:scale-110 transition-transform">
            🌱
          </div>
          <div>
            <div className="flex items-center gap-1.5">
              <span className="text-[11px] font-bold uppercase tracking-wide text-emerald-800 bg-emerald-200/60 px-2 py-0.5 rounded-md">
                Dampak Sirkular Anda
              </span>
            </div>
            <p className="text-xs font-semibold text-slate-800 mt-1 leading-snug">
              Sebagai <span className="text-emerald-700 font-bold">Kontributor Gold</span>, kamu hemat{' '}
              <span className="text-emerald-700 font-extrabold">Rp469.904</span> & selamatkan{' '}
              <span className="text-emerald-700 font-extrabold">12.5kg</span> tekstil!
            </p>
          </div>
        </div>
        <div className="w-8 h-8 rounded-full bg-emerald-600/10 text-emerald-700 flex items-center justify-center group-hover:translate-x-1 transition-transform shrink-0 ml-2">
          <Icon name="ChevronRightIcon" size={16} />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 3. BANNER KEAMANAN LOGIN BIOMETRIK                                       */}
      {/* ========================================================================= */}
      {isBiometricBannerVisible && (
        <div className="bg-gradient-to-r from-sky-50 to-indigo-50 border border-sky-200 p-3.5 rounded-2xl flex items-start justify-between gap-3 animate-fadeIn">
          <div className="flex items-start gap-3">
            <div className="w-9 h-9 rounded-xl bg-sky-600 text-white flex items-center justify-center text-lg shadow-sm shrink-0">
              {isBiometricActive ? '🛡️' : '👆'}
            </div>
            <div>
              <div className="flex items-center gap-1.5">
                <span className="text-xs font-bold text-sky-900">
                  {isBiometricActive ? 'Biometrik Aktif' : 'Keamanan Login Biometrik'}
                </span>
                <span className="text-[10px] bg-sky-200 text-sky-800 font-semibold px-1.5 py-0.5 rounded">
                  Escrow Safe
                </span>
              </div>
              <p className="text-xs text-sky-950 mt-0.5 leading-relaxed">
                {isBiometricActive
                  ? 'Fingerprint & Face ID aktif untuk verifikasi transaksi & rilis saldo escrow instan.'
                  : 'Aktifkan Fingerprint / Face ID untuk verifikasi rilis dana Escrow lebih cepat & aman.'}
              </p>
              {!isBiometricActive && (
                <div className="flex items-center gap-2 mt-2">
                  <button
                    onClick={() => {
                      setIsBiometricActive(true);
                      toast.success('Biometrik (Fingerprint & Face ID) berhasil diaktifkan! 🔒');
                    }}
                    className="px-3 py-1 bg-sky-700 hover:bg-sky-800 text-white rounded-lg text-xs font-semibold shadow-sm active:scale-95 transition-all"
                  >
                    Atur Sekarang
                  </button>
                  <button
                    onClick={() => setIsBiometricBannerVisible(false)}
                    className="px-2.5 py-1 text-sky-700 hover:bg-sky-100 rounded-lg text-xs font-medium transition-colors"
                  >
                    Nanti
                  </button>
                </div>
              )}
            </div>
          </div>
          <button
            onClick={() => setIsBiometricBannerVisible(false)}
            className="text-sky-400 hover:text-sky-700 p-1"
          >
            <Icon name="XMarkIcon" size={16} />
          </button>
        </div>
      )}

      {/* ========================================================================= */}
      {/* 4. TRANSAKSI SAYA (Shopee Style 4 Status + 2 Promosi Baris)               */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-800">Transaksi Saya</span>
          </div>
          <button
            onClick={() => setActiveModal('order_diproses_escrow')}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            Lihat Riwayat Pesanan
            <Icon name="ChevronRightIcon" size={14} />
          </button>
        </div>

        {/* 4 Status Cards */}
        <div className="grid grid-cols-4 gap-2 pt-1">
          {/* Belum Bayar */}
          <button
            onClick={() => setActiveModal('order_belum_bayar')}
            className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all relative group"
          >
            <div className="w-10 h-10 rounded-full bg-amber-50 text-amber-600 flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 transition-transform">
              <Icon name="WalletIcon" size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">Belum Bayar</span>
            <span className="absolute top-1 right-2.5 bg-rose-500 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
              1
            </span>
          </button>

          {/* Diproses Escrow */}
          <button
            onClick={() => setActiveModal('order_diproses_escrow')}
            className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all relative group"
          >
            <div className="w-10 h-10 rounded-full bg-emerald-50 text-emerald-600 flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 transition-transform">
              <Icon name="ShieldCheckIcon" size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">
              Diproses Escrow
            </span>
            <span className="absolute top-1 right-2.5 bg-emerald-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
              2
            </span>
          </button>

          {/* Dikirim / Dijemput */}
          <button
            onClick={() => setActiveModal('order_dikirim')}
            className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all relative group"
          >
            <div className="w-10 h-10 rounded-full bg-sky-50 text-sky-600 flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 transition-transform">
              <Icon name="TruckIcon" size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">
              Dikirim/Jemput
            </span>
            <span className="absolute top-1 right-2.5 bg-sky-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
              1
            </span>
          </button>

          {/* Beri Penilaian */}
          <button
            onClick={() => setActiveModal('order_penilaian')}
            className="flex flex-col items-center text-center p-2 rounded-xl hover:bg-slate-50 active:scale-95 transition-all relative group"
          >
            <div className="w-10 h-10 rounded-full bg-purple-50 text-purple-600 flex items-center justify-center text-xl mb-1.5 group-hover:scale-110 transition-transform">
              <Icon name="StarIcon" size={20} />
            </div>
            <span className="text-[11px] font-semibold text-slate-700 leading-tight">
              Beri Penilaian
            </span>
            <span className="absolute top-1 right-2.5 bg-purple-600 text-white text-[10px] font-bold w-4 h-4 rounded-full flex items-center justify-center shadow">
              3
            </span>
          </button>
        </div>

        {/* 2 Baris Promosi Sirkular */}
        <div className="pt-2 border-t border-slate-100 grid grid-cols-1 sm:grid-cols-2 gap-2">
          <div className="flex items-center justify-between p-2.5 bg-rose-50/70 border border-rose-100 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">🎟️</span>
              <div>
                <p className="text-xs font-bold text-rose-900">Voucher Diskon Sirkular 50%</p>
                <p className="text-[10px] text-rose-700">Khusus belanja Thrift & Permak</p>
              </div>
            </div>
            <button
              onClick={() => handleClaimVoucher('KLM-DISKON50')}
              className="px-2.5 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-all"
            >
              Klaim
            </button>
          </div>

          <div className="flex items-center justify-between p-2.5 bg-teal-50/70 border border-teal-100 rounded-xl">
            <div className="flex items-center gap-2">
              <span className="text-lg">🚚</span>
              <div>
                <p className="text-xs font-bold text-teal-900">Gratis Ongkir Pick-up</p>
                <p className="text-[10px] text-teal-700">Penjemputan baju kurir mitra</p>
              </div>
            </div>
            <button
              onClick={() => handleClaimVoucher('KLM-ONGKIRFREE')}
              className="px-2.5 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg text-[11px] font-bold shadow-xs active:scale-95 transition-all"
            >
              Pakai
            </button>
          </div>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 5. DOMPET SAYA (Shopee ShopeePay/Coins adapted to Klambi Escrow)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <div className="flex items-center gap-2">
            <span className="text-base font-bold text-slate-800">Dompet & Rekening Escrow</span>
          </div>
          <button
            onClick={() => setActiveModal('garansi_escrow_info')}
            className="text-xs font-medium text-emerald-600 hover:text-emerald-700 flex items-center gap-0.5"
          >
            Info Rekber Escrow
            <Icon name="InformationCircleIcon" size={14} />
          </button>
        </div>

        {/* 4 Financial Grid Items */}
        <div className="grid grid-cols-2 sm:grid-cols-4 gap-2.5">
          {/* Saldo Klambi */}
          <div
            onClick={() => setActiveModal('tarik_saldo')}
            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Saldo Klambi</span>
              <span className="text-emerald-600 text-sm">💰</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-slate-900">
                Rp {saldoKlambi.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-emerald-600 font-bold group-hover:underline">
                Tarik Dana ➔
              </span>
            </div>
          </div>

          {/* Poin Eco */}
          <div
            onClick={() => setActiveModal('tukar_poin')}
            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Poin Eco</span>
              <span className="text-amber-500 text-sm">🌿</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-slate-900">{poinEco.toLocaleString('id-ID')}</p>
              <span className="text-[10px] text-amber-600 font-bold group-hover:underline">
                Tukar Reward ➔
              </span>
            </div>
          </div>

          {/* Voucher Saya */}
          <div
            onClick={() => setActiveModal('voucher_list')}
            className="p-3 bg-slate-50 hover:bg-slate-100/80 rounded-xl border border-slate-200/60 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-slate-500">Voucher Saya</span>
              <span className="text-rose-500 text-sm">🎟️</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-slate-900">{voucherCount} Tersedia</p>
              <span className="text-[10px] text-rose-600 font-bold group-hover:underline">
                Lihat Voucher ➔
              </span>
            </div>
          </div>

          {/* Garansi Escrow */}
          <div
            onClick={() => setActiveModal('garansi_escrow_info')}
            className="p-3 bg-emerald-50/60 hover:bg-emerald-50 rounded-xl border border-emerald-200/60 cursor-pointer transition-all flex flex-col justify-between group"
          >
            <div className="flex items-center justify-between">
              <span className="text-xs font-medium text-emerald-800">Dana Escrow</span>
              <span className="text-emerald-700 text-sm">🔒</span>
            </div>
            <div className="mt-2">
              <p className="text-sm font-extrabold text-emerald-900">
                Rp {escrowHeld.toLocaleString('id-ID')}
              </p>
              <span className="text-[10px] text-emerald-700 font-bold group-hover:underline">
                Tertahan Aman ➔
              </span>
            </div>
          </div>
        </div>

        {/* Bank Partner Escrow Assurance Banner */}
        <div
          onClick={() => setActiveModal('garansi_escrow_info')}
          className="bg-slate-50 hover:bg-slate-100 border border-slate-200 rounded-xl p-2.5 flex items-center justify-between cursor-pointer transition-colors"
        >
          <div className="flex items-center gap-2">
            <span className="text-base">🛡️</span>
            <p className="text-[11px] text-slate-600">
              Rekening Bersama Escrow Klambi.id dilindungi Partner Bank Resmi (BCA, Mandiri, BRI, BNI).
            </p>
          </div>
          <Icon name="ChevronRightIcon" size={14} className="text-slate-400 shrink-0" />
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 6. AKTIVITAS SAYA (2-Column Grid of 6 Interactive Shortcuts)              */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-base font-bold text-slate-800">Aktivitas Saya</span>
          <span className="text-xs text-slate-400 font-medium">Fitur Ekosistem</span>
        </div>

        <div className="grid grid-cols-2 gap-2.5">
          {/* 1. Mulai Jual */}
          <button
            onClick={() => router.push('/jual')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-emerald-50/60 border border-slate-200/60 hover:border-emerald-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-emerald-100 text-emerald-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              🏷️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-emerald-800">Mulai Jual</p>
              <p className="text-[10px] text-slate-500">Trif satuan / Upcycle kiloan</p>
            </div>
          </button>

          {/* 2. Riwayat Scan AI */}
          <button
            onClick={() => setActiveModal('riwayat_scan')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-sky-50/60 border border-slate-200/60 hover:border-sky-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-sky-100 text-sky-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              📸
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-sky-800">Riwayat Scan AI</p>
              <p className="text-[10px] text-slate-500">18 Analisis Wearwise</p>
            </div>
          </button>

          {/* 3. Favorit Saya */}
          <button
            onClick={() => setActiveModal('favorit_saya')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-rose-50/60 border border-slate-200/60 hover:border-rose-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-rose-100 text-rose-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              ❤️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-rose-800">Favorit Saya</p>
              <p className="text-[10px] text-slate-500">{wishlist.length} Item tersimpan</p>
            </div>
          </button>

          {/* 4. Program Referral */}
          <button
            onClick={() => setActiveModal('referral_program')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-amber-50/60 border border-slate-200/60 hover:border-amber-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-amber-100 text-amber-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              👥
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-amber-800">Program Referral</p>
              <p className="text-[10px] text-slate-500">Bonus 100 Poin/teman</p>
            </div>
          </button>

          {/* 5. Bagi-Bagi Voucher */}
          <button
            onClick={() => setActiveModal('bagi_voucher')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-purple-50/60 border border-slate-200/60 hover:border-purple-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-purple-100 text-purple-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              🎁
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-purple-800">Bagi Voucher</p>
              <p className="text-[10px] text-slate-500">Kirim diskon ke teman</p>
            </div>
          </button>

          {/* 6. Terakhir Dilihat */}
          <button
            onClick={() => setActiveModal('terakhir_dilihat')}
            className="flex items-center gap-3 p-3 rounded-xl bg-slate-50 hover:bg-indigo-50/60 border border-slate-200/60 hover:border-indigo-200 active:scale-[0.98] transition-all text-left group"
          >
            <div className="w-10 h-10 rounded-xl bg-indigo-100 text-indigo-700 flex items-center justify-center text-lg shrink-0 group-hover:scale-110 transition-transform">
              👁️
            </div>
            <div>
              <p className="text-xs font-bold text-slate-800 group-hover:text-indigo-800">Terakhir Dilihat</p>
              <p className="text-[10px] text-slate-500">4 Produk sirkular</p>
            </div>
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 7. BANTUAN & LAYANAN (Pusat Bantuan FAQ + Customer Service Chat)          */}
      {/* ========================================================================= */}
      <div className="bg-white rounded-2xl p-4 shadow-sm border border-slate-100 space-y-3">
        <div className="flex items-center justify-between pb-2 border-b border-slate-100">
          <span className="text-base font-bold text-slate-800">Bantuan & Layanan</span>
          <span className="text-xs text-slate-400">Siap 24/7</span>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
          <button
            onClick={() => setActiveModal('pusat_bantuan')}
            className="flex items-center justify-between p-3 rounded-xl bg-slate-50 hover:bg-slate-100/80 border border-slate-200/70 active:scale-[0.99] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-slate-200 text-slate-700 flex items-center justify-center text-lg">
                ❓
              </div>
              <div>
                <p className="text-xs font-bold text-slate-800">Pusat Bantuan (FAQ)</p>
                <p className="text-[10px] text-slate-500">Panduan Escrow & Sirkular</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-slate-400" />
          </button>

          <button
            onClick={() => setActiveModal('customer_service')}
            className="flex items-center justify-between p-3 rounded-xl bg-emerald-50/70 hover:bg-emerald-50 border border-emerald-200/70 active:scale-[0.99] transition-all text-left"
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-emerald-600 text-white flex items-center justify-center text-lg shadow-sm">
                🎧
              </div>
              <div>
                <p className="text-xs font-bold text-emerald-900">Customer Service (Live Chat)</p>
                <p className="text-[10px] text-emerald-700">Respons instan AI & Agent</p>
              </div>
            </div>
            <span className="w-2.5 h-2.5 rounded-full bg-emerald-500 animate-pulse" />
          </button>
        </div>
      </div>

      {/* ========================================================================= */}
      {/* 8. KAMU MUNGKIN JUGA SUKA (Shopee Recommendations Adapted to Circular)    */}
      {/* ========================================================================= */}
      <div className="space-y-3 pt-2">
        <div className="flex items-center justify-between px-1">
          <div>
            <h3 className="text-base font-bold text-slate-800 flex items-center gap-1.5">
              <span>Kamu Mungkin Juga Suka</span>
              <span className="text-amber-500">✨</span>
            </h3>
            <p className="text-[11px] text-slate-500">
              Rekomendasi kurasi AI Wearwise berdasarkan gaya & riwayat scan Anda
            </p>
          </div>
          <button
            onClick={() => router.push('/cari-jasa')}
            className="text-xs font-semibold text-emerald-600 hover:text-emerald-700"
          >
            Lihat Semua
          </button>
        </div>

        {/* 2-Column Marketplace Product Grid */}
        <div className="grid grid-cols-2 gap-3">
          {mockRecommendations.map((product) => {
            const isFav = wishlist.includes(product.id);
            return (
              <div
                key={product.id}
                onClick={() => {
                  setSelectedProduct(product);
                  setActiveModal('product_detail');
                }}
                className="bg-white rounded-2xl overflow-hidden border border-slate-100 shadow-sm hover:shadow-md transition-all cursor-pointer flex flex-col justify-between group"
              >
                {/* Product Image Area with Category & Discount badge */}
                <div
                  className={`h-36 bg-gradient-to-br ${product.imageBg} relative p-2.5 flex flex-col justify-between text-white overflow-hidden`}
                >
                  <div className="flex items-start justify-between">
                    <span className="text-[10px] font-bold px-2 py-0.5 rounded-full bg-black/40 backdrop-blur-md border border-white/20">
                      {product.category}
                    </span>
                    <button
                      onClick={(e) => toggleWishlist(product.id, e)}
                      className={`p-1.5 rounded-full backdrop-blur-md transition-all ${
                        isFav
                          ? 'bg-rose-500 text-white'
                          : 'bg-black/30 text-white/80 hover:text-white'
                      }`}
                    >
                      <Icon name="HeartIcon" size={14} />
                    </button>
                  </div>

                  {/* Escrow protection tag */}
                  <div>
                    <span className="inline-flex items-center gap-1 text-[9px] font-semibold bg-emerald-500/90 text-white px-1.5 py-0.5 rounded backdrop-blur-sm">
                      🛡️ Escrow Protected
                    </span>
                  </div>
                </div>

                {/* Product Details */}
                <div className="p-3 flex-1 flex flex-col justify-between space-y-2">
                  <div>
                    <div className="flex items-center gap-1 text-[10px] text-emerald-700 font-semibold mb-1">
                      <span className="px-1.5 py-0.2 bg-emerald-50 border border-emerald-200 rounded">
                        {product.condition}
                      </span>
                    </div>
                    <h4 className="text-xs font-bold text-slate-800 line-clamp-2 leading-snug group-hover:text-emerald-700 transition-colors">
                      {product.title}
                    </h4>
                  </div>

                  <div>
                    {/* Prices */}
                    <div className="flex items-baseline gap-1.5 flex-wrap">
                      <span className="text-xs sm:text-sm font-extrabold text-rose-600">
                        Rp {product.price.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[10px] text-slate-400 line-through">
                        Rp {product.originalPrice.toLocaleString('id-ID')}
                      </span>
                      <span className="text-[9px] font-bold text-rose-500 bg-rose-50 px-1 rounded">
                        -{product.discountPercent}%
                      </span>
                    </div>

                    {/* Seller & Rating */}
                    <div className="flex items-center justify-between text-[10px] text-slate-500 pt-2 border-t border-slate-100 mt-2">
                      <span className="truncate max-w-[90px]">{product.city}</span>
                      <div className="flex items-center gap-0.5 text-amber-500 font-bold shrink-0">
                        <span>★</span>
                        <span>{product.rating}</span>
                        <span className="text-slate-400 font-normal">({product.soldCount})</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      </div>

      {/* ========================================================================= */}
      {/* ALL INTERACTIVE MODALS & DRAWERS                                          */}
      {/* ========================================================================= */}

      {/* Modal: Edit Profil */}
      {activeModal === 'edit_profile' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <h3 className="text-base font-bold text-slate-900">Edit Profil Pengguna</h3>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-3 text-xs">
              <div>
                <label className="font-semibold text-slate-700 block mb-1">Pilih Avatar:</label>
                <div className="flex gap-2 text-2xl">
                  {['🧑‍🦱', '👩‍🦰', '🧔', '🧕', '🧑‍🎨', '🌱'].map((emoji) => (
                    <button
                      key={emoji}
                      onClick={() => setUserAvatar(emoji)}
                      className={`p-2 rounded-xl border-2 transition-all ${
                        userAvatar === emoji ? 'border-emerald-500 bg-emerald-50' : 'border-slate-200'
                      }`}
                    >
                      {emoji}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Nama Lengkap:</label>
                <input
                  type="text"
                  value={userName}
                  onChange={(e) => setUserName(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div>
                <label className="font-semibold text-slate-700 block mb-1">Bio Sirkular:</label>
                <textarea
                  rows={2}
                  value={userBio}
                  onChange={(e) => setUserBio(e.target.value)}
                  className="w-full px-3 py-2 border rounded-xl focus:ring-2 focus:ring-emerald-500 text-slate-800"
                />
              </div>

              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 text-[11px] text-emerald-800">
                ✅ Identitas KTP & No. WhatsApp terverifikasi untuk perlindungan Rekening Escrow Klambi.id.
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  toast.success('Profil berhasil diperbarui!');
                  setActiveModal(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tier Benefits (Kontributor Gold) */}
      {activeModal === 'tier_benefits' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-2xl">🥇</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Keanggotaan Kontributor Gold</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold">Tingkat Sirkular Tertinggi</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <p className="font-semibold text-slate-800">Keuntungan Eksklusif Akun Gold Anda:</p>
              <div className="space-y-2">
                <div className="p-2.5 rounded-xl bg-amber-50 border border-amber-200 flex items-start gap-2.5">
                  <span className="text-amber-600 font-bold">⚡</span>
                  <div>
                    <p className="font-bold text-amber-900">Rilis Escrow Ekspres 12 Jam</p>
                    <p className="text-[10px] text-amber-800">Pencairan saldo hasil penjualan 2x lebih cepat setelah pesanan terverifikasi.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-emerald-50 border border-emerald-200 flex items-start gap-2.5">
                  <span className="text-emerald-600 font-bold">🚚</span>
                  <div>
                    <p className="font-bold text-emerald-900">Free Ongkir Pick-up 4x / Bulan</p>
                    <p className="text-[10px] text-emerald-800">Gratis penjemputan barang upcycle & servis permak langsung di depan pintu.</p>
                  </div>
                </div>

                <div className="p-2.5 rounded-xl bg-sky-50 border border-sky-200 flex items-start gap-2.5">
                  <span className="text-sky-600 font-bold">🤖</span>
                  <div>
                    <p className="font-bold text-sky-900">Wearwise AI Premium Unlimited</p>
                    <p className="text-[10px] text-sky-800">Scan dan analisis kondisi pakaian tak terbatas dengan akurasi 7 parameter.</p>
                  </div>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              Mengerti & Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Status Transaksi Belum Bayar */}
      {activeModal === 'order_belum_bayar' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💳</span>
                <h3 className="text-base font-bold text-slate-900">Pesanan Belum Bayar (1)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="p-3 bg-slate-50 border rounded-xl space-y-2 text-xs">
              <div className="flex justify-between text-[11px] text-slate-500 font-medium">
                <span>No. Pesanan: KLM-2026-0988</span>
                <span className="text-amber-600 font-bold">Batas 23:59:00</span>
              </div>
              <div className="flex items-center gap-3 pt-1">
                <div className="w-12 h-12 rounded-lg bg-indigo-900 text-white flex items-center justify-center font-bold text-xs">
                  Trif
                </div>
                <div className="flex-1">
                  <p className="font-bold text-slate-800">Vintage Oversized Bomber Jacket 90s</p>
                  <p className="text-emerald-700 font-extrabold text-sm">Rp 165.000</p>
                </div>
              </div>
              <p className="text-[11px] text-slate-600 bg-amber-50 p-2 rounded-lg border border-amber-200">
                🔒 Pembayaran akan diteruskan ke Rekening Bersama Escrow Klambi sampai jaket Anda terima.
              </p>
            </div>

            <div className="flex gap-2">
              <button
                onClick={() => router.push('/pembayaran')}
                className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Bayar Sekarang (BCA / GoPay / QRIS)
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Status Transaksi Diproses Escrow */}
      {activeModal === 'order_diproses_escrow' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🛡️</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Diproses Escrow (2)</h3>
                  <p className="text-[11px] text-emerald-600 font-semibold">Dana tertahan aman di Rekber</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto pr-1 text-xs">
              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 font-mono text-[11px]">#KLM-2026-0914</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    Dana Diamankan Escrow
                  </span>
                </div>
                <p className="font-bold text-slate-800">Jaket Denim Vintage Levi&apos;s 501</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Penjual: @vintage_jkt</span>
                  <span className="font-bold text-slate-900">Rp 245.000</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800">Tahap: Penjual mengemas barang</span>
                  <button
                    onClick={() => toast.info('Status escrow terverifikasi aman & aktif.')}
                    className="font-bold text-emerald-700 underline"
                  >
                    Detail Garansi
                  </button>
                </div>
              </div>

              <div className="p-3 bg-emerald-50/70 border border-emerald-200 rounded-xl space-y-2">
                <div className="flex justify-between font-medium">
                  <span className="text-slate-600 font-mono text-[11px]">#KLM-2026-0881</span>
                  <span className="text-emerald-700 font-bold bg-emerald-100 px-2 py-0.5 rounded text-[10px]">
                    Dana Diamankan Escrow
                  </span>
                </div>
                <p className="font-bold text-slate-800">Deep Clean & Textile Spa (2 Helai)</p>
                <div className="flex justify-between items-center text-xs">
                  <span className="text-slate-500">Mitra: CleanCare Workshop Kemang</span>
                  <span className="font-bold text-slate-900">Rp 75.000</span>
                </div>
                <div className="pt-2 border-t border-emerald-200 flex items-center justify-between text-[11px]">
                  <span className="text-emerald-800">Tahap: Treatment spa sedang berjalan</span>
                  <button
                    onClick={() => toast.info('Status escrow terverifikasi aman & aktif.')}
                    className="font-bold text-emerald-700 underline"
                  >
                    Detail Garansi
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Status Transaksi Dikirim / Jemput */}
      {activeModal === 'order_dikirim' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🚚</span>
                <h3 className="text-base font-bold text-slate-900">Dikirim / Dijemput (1)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="p-3 bg-sky-50/70 border border-sky-200 rounded-xl space-y-2.5 text-xs">
              <div className="flex justify-between text-[11px]">
                <span className="font-mono text-slate-600">No. Resi: JNT-992144180</span>
                <span className="text-sky-700 font-bold bg-sky-100 px-2 py-0.5 rounded">Dalam Perjalanan</span>
              </div>
              <p className="font-bold text-slate-800">Jaket Denim Vintage Levi&apos;s 501 Original</p>
              <div className="p-2 bg-white rounded-lg border border-sky-100 text-[11px] text-slate-600 space-y-1">
                <p>📍 <strong>08:30:</strong> Paket dibawa kurir (J&T Express Jakarta Selatan)</p>
                <p>📍 <strong>11:15:</strong> Menuju alamat penerima (Jl. Senopati No. 42)</p>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Konfirmasi diterima & rilis escrow dana ke penjual!');
                setActiveModal(null);
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
            >
              Konfirmasi Barang Diterima
            </button>
          </div>
        </div>
      )}

      {/* Modal: Status Transaksi Beri Penilaian */}
      {activeModal === 'order_penilaian' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⭐</span>
                <h3 className="text-base font-bold text-slate-900">Beri Penilaian (3 Selesai)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs">
              <div className="p-3 bg-slate-50 border rounded-xl space-y-2">
                <p className="font-bold text-slate-800">Potong Panjang Celana & Hemming Chainstitch</p>
                <p className="text-slate-500 text-[11px]">Taylor Studio Artisan Fatmawati</p>
                <div className="flex items-center justify-between pt-2 border-t">
                  <div className="flex text-amber-400 text-base">★★★★★</div>
                  <button
                    onClick={() => toast.success('Penilaian terkirim! +25 Poin Eco diberikan.')}
                    className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white font-bold rounded-lg text-xs"
                  >
                    Kirim Ulasan (+25 Poin)
                  </button>
                </div>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Tarik Saldo Klambi */}
      {activeModal === 'tarik_saldo' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">💰</span>
                <h3 className="text-base font-bold text-slate-900">Tarik Saldo Klambi</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200">
              <p className="text-xs text-emerald-800 font-medium">Saldo Tersedia untuk Ditarik:</p>
              <p className="text-xl font-extrabold text-emerald-900 mt-0.5">
                Rp {saldoKlambi.toLocaleString('id-ID')}
              </p>
            </div>

            <div className="space-y-2 text-xs">
              <label className="font-semibold text-slate-700 block">Pilih Rekening / E-Wallet Tujuan:</label>
              <div className="space-y-1.5">
                <div className="p-2.5 border rounded-xl flex items-center justify-between bg-slate-50">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-blue-600">BCA</span>
                    <span>8271-0982-1928 (Muhammad Hafiz)</span>
                  </div>
                  <input type="radio" defaultChecked name="bank_target" />
                </div>
                <div className="p-2.5 border rounded-xl flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <span className="font-bold text-emerald-600">GoPay</span>
                    <span>0812-3456-7890</span>
                  </div>
                  <input type="radio" name="bank_target" />
                </div>
              </div>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => setActiveModal(null)}
                className="flex-1 py-2 text-xs font-semibold text-slate-600 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                Batal
              </button>
              <button
                onClick={() => {
                  setSaldoKlambi(0);
                  toast.success('Permintaan penarikan Rp 850.000 ke BCA berhasil diproses!');
                  setActiveModal(null);
                }}
                className="flex-1 py-2 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Tarik Semua Saldo
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Tukar Poin Eco */}
      {activeModal === 'tukar_poin' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🌿</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Katalog Hadiah Poin Eco</h3>
                  <p className="text-[11px] text-amber-600 font-bold">{poinEco} Poin Tersedia</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs max-h-72 overflow-y-auto">
              <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Voucher Diskon Servis Rp 25.000</p>
                  <p className="text-[10px] text-slate-500">Biaya: 500 Poin Eco</p>
                </div>
                <button
                  onClick={() => {
                    if (poinEco >= 500) {
                      setPoinEco((p) => p - 500);
                      setVoucherCount((v) => v + 1);
                      toast.success('Voucher berhasil ditukar!');
                    }
                  }}
                  className="px-3 py-1 bg-amber-500 hover:bg-amber-600 text-white rounded-lg font-bold text-xs"
                >
                  Tukar
                </button>
              </div>

              <div className="p-3 bg-slate-50 border rounded-xl flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Pohon Donasi Mangrove Sirkular</p>
                  <p className="text-[10px] text-slate-500">Biaya: 1.000 Poin Eco (Tanam 1 Bibit)</p>
                </div>
                <button
                  onClick={() => {
                    if (poinEco >= 1000) {
                      setPoinEco((p) => p - 1000);
                      toast.success('1 Bibit Mangrove berhasil ditanam atas nama Anda! 🌱');
                    }
                  }}
                  className="px-3 py-1 bg-emerald-600 hover:bg-emerald-700 text-white rounded-lg font-bold text-xs"
                >
                  Tanam
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Voucher Saya */}
      {activeModal === 'voucher_list' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎟️</span>
                <h3 className="text-base font-bold text-slate-900">Voucher Saya ({voucherCount})</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 max-h-72 overflow-y-auto text-xs">
              <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-rose-200 text-rose-800 font-bold px-1.5 py-0.5 rounded">
                    Diskon 50%
                  </span>
                  <p className="font-bold text-rose-950 mt-1">Potongan Belanja Thrift & Permak</p>
                  <p className="text-[10px] text-rose-700">Min. Belanja Rp 50.000 • Berlaku s/d 30 Sep</p>
                </div>
                <button
                  onClick={() => router.push('/cari-jasa')}
                  className="px-3 py-1 bg-rose-600 hover:bg-rose-700 text-white rounded-lg font-bold"
                >
                  Pakai
                </button>
              </div>

              <div className="p-3 bg-teal-50 border border-teal-200 rounded-xl flex items-center justify-between">
                <div>
                  <span className="text-[10px] bg-teal-200 text-teal-800 font-bold px-1.5 py-0.5 rounded">
                    Gratis Ongkir
                  </span>
                  <p className="font-bold text-teal-950 mt-1">Pick-up Kurir Sirkular</p>
                  <p className="text-[10px] text-teal-700">Semua wilayah Jabodetabek • Berlaku s/d 30 Sep</p>
                </div>
                <button
                  onClick={() => router.push('/cari-jasa')}
                  className="px-3 py-1 bg-teal-600 hover:bg-teal-700 text-white rounded-lg font-bold"
                >
                  Pakai
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Info Garansi Escrow */}
      {activeModal === 'garansi_escrow_info' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🔒</span>
                <h3 className="text-base font-bold text-slate-900">Garansi Rekening Escrow Klambi</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2.5 text-xs text-slate-700">
              <p className="leading-relaxed">
                Klambi.id menggunakan sistem <strong>Rekening Bersama (Escrow 5 Tahap)</strong> untuk memastikan
                setiap transaksi jual beli thrift, upcycle, maupun reparasi pakaian 100% terlindungi:
              </p>
              <div className="p-3 bg-emerald-50 rounded-xl border border-emerald-200 space-y-2 text-[11px] text-emerald-950">
                <p>1️⃣ <strong>Pembeli Membayar:</strong> Dana masuk ke rekening penampungan resmi Klambi.id.</p>
                <p>2️⃣ <strong>Notifikasi Mitra:</strong> Penjual / penjahit mulai memproses pesanan.</p>
                <p>3️⃣ <strong>Pengiriman / Pick-up:</strong> Paket dikirim dengan nomor resi terverifikasi.</p>
                <p>4️⃣ <strong>Pemeriksaan 1x24 Jam:</strong> Pembeli memeriksa kondisi barang / hasil jahit.</p>
                <p>5️⃣ <strong>Pelepasan Dana Otomatis:</strong> Dana langsung dicairkan ke saldo penjual.</p>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      )}

      {/* Modal: Riwayat Scan AI Wearwise */}
      {activeModal === 'riwayat_scan' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">📸</span>
                <div>
                  <h3 className="text-base font-bold text-slate-900">Riwayat Scan AI Wearwise</h3>
                  <p className="text-[11px] text-slate-500">18 Analisis Tersimpan</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Jaket Denim Vintage (Sobek Saku)</p>
                  <p className="text-[10px] text-slate-500">Kondisi: 78% • Saran: Permak / Patch</p>
                </div>
                <button
                  onClick={() => router.push('/care-plan')}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Lihat Plan
                </button>
              </div>

              <div className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                <div>
                  <p className="font-bold text-slate-800">Kemeja Linen Putih (Noda Kopi)</p>
                  <p className="text-[10px] text-slate-500">Kondisi: 85% • Saran: Textile Spa Clean</p>
                </div>
                <button
                  onClick={() => router.push('/care-plan')}
                  className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                >
                  Lihat Plan
                </button>
              </div>
            </div>

            <button
              onClick={() => router.push('/wearwise-ai')}
              className="w-full py-2.5 text-xs font-semibold text-white bg-slate-900 hover:bg-slate-800 rounded-xl shadow"
            >
              + Scan Pakaian Baru (Wearwise Vision)
            </button>
          </div>
        </div>
      )}

      {/* Modal: Favorit Saya */}
      {activeModal === 'favorit_saya' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">❤️</span>
                <h3 className="text-base font-bold text-slate-900">Favorit Saya ({wishlist.length})</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              {mockRecommendations
                .filter((p) => wishlist.includes(p.id))
                .map((p) => (
                  <div key={p.id} className="p-3 bg-slate-50 rounded-xl border flex items-center justify-between">
                    <div>
                      <p className="font-bold text-slate-800 truncate max-w-[200px]">{p.title}</p>
                      <p className="text-emerald-700 font-extrabold">Rp {p.price.toLocaleString('id-ID')}</p>
                    </div>
                    <button
                      onClick={() => {
                        setSelectedProduct(p);
                        setActiveModal('product_detail');
                      }}
                      className="px-3 py-1 bg-emerald-600 text-white font-bold rounded-lg text-xs"
                    >
                      Beli
                    </button>
                  </div>
                ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Program Referral */}
      {activeModal === 'referral_program' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👥</span>
                <h3 className="text-base font-bold text-slate-900">Program Referral Sirkular</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p className="leading-relaxed">
                Undang teman bergabung ke gerakan ekonomi sirkular pakaian. Setiap teman yang melakukan scan pertama,
                kamu & temanmu sama-sama mendapat <strong>+100 Poin Eco</strong>!
              </p>

              <div className="p-3 bg-amber-50 rounded-xl border border-amber-200 flex items-center justify-between">
                <div>
                  <p className="text-[10px] text-amber-800 font-semibold">Kode Referral Anda:</p>
                  <p className="text-base font-mono font-extrabold text-amber-950">HAFIZ-ECO2026</p>
                </div>
                <button
                  onClick={() => {
                    navigator.clipboard?.writeText('HAFIZ-ECO2026');
                    setReferralCopied(true);
                    toast.success('Kode referral disalin ke clipboard!');
                    setTimeout(() => setReferralCopied(false), 2000);
                  }}
                  className="px-3 py-1.5 bg-amber-600 hover:bg-amber-700 text-white rounded-lg font-bold text-xs shadow-xs"
                >
                  {referralCopied ? 'Tersalin ✓' : 'Salin Kode'}
                </button>
              </div>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Bagi-Bagi Voucher */}
      {activeModal === 'bagi_voucher' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">🎁</span>
                <h3 className="text-base font-bold text-slate-900">Bagi-Bagi Voucher Teman</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="text-xs text-slate-700 space-y-3">
              <p className="leading-relaxed">
                Bagikan voucher potongan servis jahit/permak senilai <strong>Rp 15.000</strong> ke teman terdekatmu
                lewat WhatsApp atau media sosial.
              </p>
              <div className="p-3 bg-purple-50 rounded-xl border border-purple-200 text-purple-900 text-center font-semibold">
                Tautan Voucher: <br />
                <span className="text-purple-700 font-mono text-[11px]">https://klambi.id/v/hafiz-gift</span>
              </div>
            </div>

            <button
              onClick={() => {
                toast.success('Tautan voucher berhasil disalin!');
                setActiveModal(null);
              }}
              className="w-full py-2.5 text-xs font-semibold text-white bg-purple-600 hover:bg-purple-700 rounded-xl shadow"
            >
              Salin & Kirim ke WhatsApp
            </button>
          </div>
        </div>
      )}

      {/* Modal: Terakhir Dilihat */}
      {activeModal === 'terakhir_dilihat' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">👁️</span>
                <h3 className="text-base font-bold text-slate-900">Terakhir Dilihat (4 Item)</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs">
              {mockRecommendations.map((p) => (
                <div key={p.id} className="p-2.5 bg-slate-50 rounded-xl border flex items-center justify-between">
                  <div>
                    <p className="font-bold text-slate-800 truncate max-w-[200px]">{p.title}</p>
                    <p className="text-emerald-700 font-bold">Rp {p.price.toLocaleString('id-ID')}</p>
                  </div>
                  <button
                    onClick={() => {
                      setSelectedProduct(p);
                      setActiveModal('product_detail');
                    }}
                    className="px-2.5 py-1 bg-emerald-600 text-white rounded-lg text-xs font-bold"
                  >
                    Buka
                  </button>
                </div>
              ))}
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Pusat Bantuan FAQ */}
      {activeModal === 'pusat_bantuan' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">❓</span>
                <h3 className="text-base font-bold text-slate-900">Pusat Bantuan & FAQ</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2 max-h-72 overflow-y-auto text-xs text-slate-700">
              <details className="p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                <summary className="font-bold text-slate-800">Bagaimana cara kerja Rekber Escrow?</summary>
                <p className="mt-1.5 text-slate-600 text-[11px] leading-relaxed">
                  Uang Anda ditahan oleh Klambi.id dan baru dibayarkan ke penjual setelah barang Anda terima dan sesuai deskripsi.
                </p>
              </details>
              <details className="p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                <summary className="font-bold text-slate-800">Berapa berat minimal penjualan upcycle?</summary>
                <p className="mt-1.5 text-slate-600 text-[11px] leading-relaxed">
                  Penjualan limbah tekstil upcycle kiloan memiliki kuota minimal 5 kg agar efisien untuk penjemputan mitra daur ulang.
                </p>
              </details>
              <details className="p-2.5 bg-slate-50 rounded-xl border cursor-pointer">
                <summary className="font-bold text-slate-800">Bagaimana jika pakaian tidak sesuai kondisi scan?</summary>
                <p className="mt-1.5 text-slate-600 text-[11px] leading-relaxed">
                  Anda dapat mengajukan klaim garansi pengembalian dana 100% dalam waktu 1x24 jam sebelum dana escrow dilepaskan.
                </p>
              </details>
            </div>

            <button
              onClick={() => setActiveModal(null)}
              className="w-full py-2 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
            >
              Tutup
            </button>
          </div>
        </div>
      )}

      {/* Modal: Customer Service Live Chat */}
      {activeModal === 'customer_service' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full h-[520px] flex flex-col shadow-2xl overflow-hidden">
            {/* Header */}
            <div className="p-3.5 bg-[#10284D] text-white flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <div className="w-8 h-8 rounded-full bg-emerald-500 flex items-center justify-center text-sm font-bold text-white shadow">
                  🎧
                </div>
                <div>
                  <h4 className="text-xs font-bold">Klambi Support 24/7</h4>
                  <p className="text-[10px] text-emerald-300">Online • Siap Membantu</p>
                </div>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-white/70 hover:text-white">
                <Icon name="XMarkIcon" size={18} />
              </button>
            </div>

            {/* Chat Body */}
            <div className="flex-1 p-3 overflow-y-auto space-y-2.5 bg-slate-50 text-xs">
              {chatMessages.map((msg, idx) => (
                <div
                  key={idx}
                  className={`flex flex-col ${msg.sender === 'user' ? 'items-end' : 'items-start'}`}
                >
                  <div
                    className={`max-w-[80%] p-2.5 rounded-2xl ${
                      msg.sender === 'user'
                        ? 'bg-emerald-600 text-white rounded-br-none'
                        : 'bg-white text-slate-800 border border-slate-200 rounded-bl-none shadow-xs'
                    }`}
                  >
                    <p className="text-xs leading-relaxed">{msg.text}</p>
                  </div>
                  <span className="text-[9px] text-slate-400 mt-0.5 px-1">{msg.time}</span>
                </div>
              ))}
            </div>

            {/* Chat Input */}
            <div className="p-2.5 bg-white border-t flex items-center gap-2">
              <input
                type="text"
                value={chatInput}
                onChange={(e) => setChatInput(e.target.value)}
                onKeyDown={(e) => e.key === 'Enter' && handleSendChat()}
                placeholder="Tulis pertanyaan seputar escrow / order..."
                className="flex-1 px-3 py-2 text-xs border rounded-xl focus:outline-hidden focus:ring-1 focus:ring-emerald-500"
              />
              <button
                onClick={handleSendChat}
                className="p-2 bg-emerald-600 hover:bg-emerald-700 text-white rounded-xl active:scale-95 transition-all"
              >
                <Icon name="PaperAirplaneIcon" size={16} />
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Product Quick View & Escrow Checkout */}
      {activeModal === 'product_detail' && selectedProduct && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <span className="text-xs font-bold uppercase tracking-wider text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                {selectedProduct.category}
              </span>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className={`h-44 rounded-xl bg-gradient-to-br ${selectedProduct.imageBg} p-4 flex flex-col justify-between text-white shadow-inner`}>
              <div className="flex justify-between items-start">
                <span className="text-xs bg-black/40 px-2 py-0.5 rounded backdrop-blur-md">
                  Kondisi: {selectedProduct.condition}
                </span>
                <span className="text-xs bg-emerald-500 text-white px-2 py-0.5 rounded font-bold">
                  🛡️ Rekber Escrow
                </span>
              </div>
              <div>
                <p className="text-xs opacity-90">Penjual: {selectedProduct.seller} ({selectedProduct.city})</p>
                <h3 className="text-sm font-bold mt-0.5">{selectedProduct.title}</h3>
              </div>
            </div>

            <div className="space-y-2 text-xs">
              <div className="flex items-baseline justify-between">
                <div>
                  <span className="text-base font-extrabold text-rose-600">
                    Rp {selectedProduct.price.toLocaleString('id-ID')}
                  </span>
                  <span className="text-xs text-slate-400 line-through ml-2">
                    Rp {selectedProduct.originalPrice.toLocaleString('id-ID')}
                  </span>
                </div>
                <span className="text-xs font-bold text-emerald-700 bg-emerald-50 px-2 py-0.5 rounded">
                  Hemat Rp {(selectedProduct.originalPrice - selectedProduct.price).toLocaleString('id-ID')}
                </span>
              </div>
              <p className="text-slate-600 text-[11px] leading-relaxed">
                Pakaian telah lolos verifikasi parameter AI Wearwise dan dilindungi garansi pelepasan saldo rekening bersama Escrow Klambi.id.
              </p>
            </div>

            <div className="flex gap-2 pt-2">
              <button
                onClick={() => {
                  toast.success(`"${selectedProduct.title}" ditambahkan ke keranjang! 🛒`);
                  setActiveModal(null);
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-slate-700 bg-slate-100 hover:bg-slate-200 rounded-xl"
              >
                + Keranjang
              </button>
              <button
                onClick={() => {
                  setActiveModal(null);
                  router.push('/pembayaran');
                }}
                className="flex-1 py-2.5 text-xs font-semibold text-white bg-emerald-600 hover:bg-emerald-700 rounded-xl shadow"
              >
                Beli via Escrow
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Modal: Settings / Pengaturan Akun */}
      {activeModal === 'settings' && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-xs z-50 flex items-center justify-center p-4 animate-fadeIn">
          <div className="bg-white rounded-2xl max-w-md w-full p-5 space-y-4 shadow-2xl">
            <div className="flex items-center justify-between border-b pb-3">
              <div className="flex items-center gap-2">
                <span className="text-xl">⚙️</span>
                <h3 className="text-base font-bold text-slate-900">Pengaturan Akun</h3>
              </div>
              <button onClick={() => setActiveModal(null)} className="text-slate-400 hover:text-slate-700">
                <Icon name="XMarkIcon" size={20} />
              </button>
            </div>

            <div className="space-y-2 text-xs text-slate-700">
              <div
                onClick={() => {
                  setActiveModal('edit_profile');
                }}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border flex items-center justify-between cursor-pointer"
              >
                <span>Informasi Akun & Profil</span>
                <Icon name="ChevronRightIcon" size={14} className="text-slate-400" />
              </div>
              <div
                onClick={() => toast.info('Notifikasi push & email aktif.')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border flex items-center justify-between cursor-pointer"
              >
                <span>Preferensi Notifikasi Sirkular</span>
                <span className="text-emerald-600 font-semibold text-[10px]">Aktif</span>
              </div>
              <div
                onClick={() => toast.info('Kebijakan privasi & data terenkripsi.')}
                className="p-3 bg-slate-50 hover:bg-slate-100 rounded-xl border flex items-center justify-between cursor-pointer"
              >
                <span>Keamanan & Rekening Escrow</span>
                <Icon name="ChevronRightIcon" size={14} className="text-slate-400" />
              </div>
            </div>

            <button
              onClick={() => {
                toast.info('Keluar dari sesi.');
                setActiveModal(null);
              }}
              className="w-full py-2.5 text-xs font-semibold text-rose-600 bg-rose-50 hover:bg-rose-100 rounded-xl"
            >
              Keluar dari Akun
            </button>
          </div>
        </div>
      )}
    </div>
  );
}
