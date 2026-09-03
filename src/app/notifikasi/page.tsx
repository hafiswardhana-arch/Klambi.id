'use client';

import React, { useState, useMemo } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

export interface NotificationItem {
  id: string;
  title: string;
  desc: string;
  time: string;
  timestamp: number;
  unread: boolean;
  type: 'order' | 'care' | 'ai' | 'promo' | 'impact';
  categoryLabel: string;
  targetHref: string;
  actionText: string;
  details: string;
  icon: string;
  orderNumber?: string;
  badgeColor?: string;
}

const initialNotifications: NotificationItem[] = [
  {
    id: 'notif-1',
    title: 'Pesanan Telah Tiba di Lokasi! 📦',
    desc: 'Jaket Denim Vintage Levi\'s 501 pesanan Anda telah tiba. Mohon konfirmasi penerimaan di menu Profil untuk menyelesaikan pencairan escrow aman.',
    time: '10 menit lalu',
    timestamp: Date.now() - 10 * 60 * 1000,
    unread: true,
    type: 'order',
    categoryLabel: 'Transaksi',
    targetHref: '/profil',
    actionText: 'Konfirmasi Pesanan',
    details: 'Nomor Resi: JNE-KLM-992148. Dana pembayaran Anda aman di dalam sistem Rekening Bersama (Escrow) Klámbi sampai barang Anda terima dengan puas.',
    icon: '📦',
    orderNumber: 'ORD-KLM-2026-0901',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'notif-2',
    title: 'Pengingat Perawatan Baju Mingguan 👕',
    desc: 'Kemeja Flannel Sage Green Anda sudah 3 minggu belum di-spa. Yuk jadwalkan Deep Clean berkala agar serat katun organik tetap lembut dan tahan lama!',
    time: '2 jam lalu',
    timestamp: Date.now() - 2 * 3600 * 1000,
    unread: true,
    type: 'care',
    categoryLabel: 'Perawatan',
    targetHref: '/menu-perawatan',
    actionText: 'Jadwalkan Perawatan',
    details: 'Rekomendasi Tindakan: Cuci dengan air dingin suhu maksimal 30°C dan gunakan 1 lembar Kindfoam eco-detergent tanpa pemutih optik klorin.',
    icon: '👕',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'notif-3',
    title: 'Hasil Diagnosis Wearwise AI Tersedia 🔍',
    desc: 'Scan Jaket Patchwork Denim telah selesai dianalisis. Skor kesehatan serat kain: 92/100 (Sangat Baik).',
    time: '5 jam lalu',
    timestamp: Date.now() - 5 * 3600 * 1000,
    unread: true,
    type: 'ai',
    categoryLabel: 'Wearwise AI',
    targetHref: '/rawat',
    actionText: 'Buka Hasil AI',
    details: 'Wearwise Vision AI mendeteksi serat kain 100% bebas dari jamur tekstil, jahitan sambungan patchwork sangat kokoh, dan elastisitas kain prima.',
    icon: '✨',
    badgeColor: 'bg-amber-100 text-amber-800',
  },
  {
    id: 'notif-4',
    title: 'Saldo Escrow Rp 185.000 Berhasil Dicairkan 💰',
    desc: 'Pembeli telah mengonfirmasi penerimaan Jaket Upcycle Anda. Saldo dompet Klámbi Anda telah bertambah dan siap ditarik.',
    time: 'Kemarin, 16:45',
    timestamp: Date.now() - 24 * 3600 * 1000,
    unread: false,
    type: 'order',
    categoryLabel: 'Transaksi',
    targetHref: '/profil',
    actionText: 'Lihat Dompet Escrow',
    details: 'Dana sebesar Rp 185.000 telah masuk ke saldo aktif dompet Anda. Anda dapat menariknya ke BCA, Mandiri, BRI, atau e-Wallet tanpa biaya admin.',
    icon: '💰',
    orderNumber: 'ESC-TRF-884120',
    badgeColor: 'bg-blue-100 text-blue-800',
  },
  {
    id: 'notif-5',
    title: 'Promo Trift & Upcycle Drop Minggu Ini ♻️',
    desc: 'Diskon 30% untuk produk upcycle artisan & koleksi vintage denim baru saja dirilis di Klámbi Trift Marketplace.',
    time: 'Kemarin, 10:20',
    timestamp: Date.now() - 30 * 3600 * 1000,
    unread: false,
    type: 'promo',
    categoryLabel: 'Promo',
    targetHref: '/trift-marketplace',
    actionText: 'Cek Koleksi Promo',
    details: 'Gunakan kode promo SIRKULAR30 saat checkout untuk mendapatkan potongan harga langsung 30% hingga maksimal Rp 50.000.',
    icon: '🎁',
    badgeColor: 'bg-rose-100 text-rose-800',
  },
  {
    id: 'notif-6',
    title: 'Jasa Permak Selesai Dikerjakan 🧵',
    desc: 'Mitra penjahit "Rumah Jahit Lestari" telah menyelesaikan permak celana chino Anda. Kurir sedang dalam perjalanan pengantaran.',
    time: '2 hari lalu',
    timestamp: Date.now() - 48 * 3600 * 1000,
    unread: false,
    type: 'care',
    categoryLabel: 'Perawatan',
    targetHref: '/menu-perawatan',
    actionText: 'Lacak Pengantaran',
    details: 'Perbaikan pinggang dan potong kelim celana chino telah tuntas dengan jahitan ganda berkualitas tinggi. Estimasi sampai di alamat: Sore ini.',
    icon: '🪡',
    orderNumber: 'SRV-JHT-552190',
    badgeColor: 'bg-emerald-100 text-emerald-800',
  },
  {
    id: 'notif-7',
    title: 'Pencapaian Baru: Eco Champion Level 3! 🏆',
    desc: 'Hebat! Anda telah menyelamatkan 12.5 kg limbah tekstil dan menghemat 2.450 Liter air bulan ini.',
    time: '3 hari lalu',
    timestamp: Date.now() - 72 * 3600 * 1000,
    unread: false,
    type: 'impact',
    categoryLabel: 'Dampak Sirkular',
    targetHref: '/dampak',
    actionText: 'Lihat Dampak Lingkungan',
    details: 'Kontribusi Anda menempatkan akun Anda di peringkat Top #8 Komunitas Sirkular Nasional Klámbi. Terus rawat & putar siklus pakaianmu!',
    icon: '🌍',
    badgeColor: 'bg-teal-100 text-teal-800',
  },
];

export default function NotifikasiPage() {
  const router = useRouter();
  const [notifications, setNotifications] = useState<NotificationItem[]>(initialNotifications);
  const [selectedFilter, setSelectedFilter] = useState<'all' | 'order' | 'care' | 'ai' | 'promo' | 'impact'>('all');
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedNotification, setSelectedNotification] = useState<NotificationItem | null>(null);
  const [showSettingsModal, setShowSettingsModal] = useState(false);

  // Notification Preferences State
  const [preferences, setPreferences] = useState({
    transaksi: true,
    perawatan: true,
    aiUpdates: true,
    promo: true,
    sound: true,
  });

  const unreadTotal = useMemo(
    () => notifications.filter((n) => n.unread).length,
    [notifications]
  );

  const filterTabs = [
    { id: 'all', label: 'Semua', count: notifications.length },
    { id: 'order', label: 'Transaksi', count: notifications.filter((n) => n.type === 'order').length },
    { id: 'care', label: 'Perawatan', count: notifications.filter((n) => n.type === 'care').length },
    { id: 'ai', label: 'Wearwise AI', count: notifications.filter((n) => n.type === 'ai').length },
    { id: 'promo', label: 'Promo', count: notifications.filter((n) => n.type === 'promo').length },
    { id: 'impact', label: 'Dampak', count: notifications.filter((n) => n.type === 'impact').length },
  ];

  const filteredNotifications = useMemo(() => {
    return notifications.filter((n) => {
      const matchFilter = selectedFilter === 'all' || n.type === selectedFilter;
      const matchSearch =
        searchQuery.trim() === '' ||
        n.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.desc.toLowerCase().includes(searchQuery.toLowerCase()) ||
        n.categoryLabel.toLowerCase().includes(searchQuery.toLowerCase());
      return matchFilter && matchSearch;
    });
  }, [notifications, selectedFilter, searchQuery]);

  const markAllAsRead = () => {
    setNotifications((prev) => prev.map((n) => ({ ...n, unread: false })));
    toast.success('Semua notifikasi ditandai sudah dibaca ✨');
  };

  const clearAllNotifications = () => {
    if (confirm('Apakah Anda yakin ingin menghapus semua notifikasi?')) {
      setNotifications([]);
      toast.info('Semua riwayat notifikasi telah dibersihkan');
    }
  };

  const handleNotificationClick = (item: NotificationItem) => {
    setNotifications((prev) =>
      prev.map((n) => (n.id === item.id ? { ...n, unread: false } : n))
    );
    setSelectedNotification(item);
  };

  const handleDeleteItem = (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    setNotifications((prev) => prev.filter((n) => n.id !== id));
    toast.info('Notifikasi dihapus');
  };

  const handleSimulateNewNotification = () => {
    const newNotif: NotificationItem = {
      id: `notif-${Date.now()}`,
      title: 'Pengingat Baru Masuk! 🔔',
      desc: 'Ada pembaruan status terkini pada ekosistem sirkular Klámbi Anda.',
      time: 'Baru saja',
      timestamp: Date.now(),
      unread: true,
      type: 'ai',
      categoryLabel: 'Wearwise AI',
      targetHref: '/rawat',
      actionText: 'Buka Sekarang',
      details: 'Wearwise AI mendeteksi rekomendasi baru untuk pakaian di lemari digital Anda.',
      icon: '✨',
      badgeColor: 'bg-amber-100 text-amber-800',
    };

    setNotifications((prev) => [newNotif, ...prev]);
    toast.success('Notifikasi baru berhasil disimulasikan! 🔔');
  };

  return (
    <AppLayout
      title="Pusat Notifikasi"
      showBack
      backHref="/"
      headerRight={
        <div className="flex items-center gap-1.5">
          {unreadTotal > 0 && (
            <button
              onClick={markAllAsRead}
              className="text-[11px] font-extrabold text-[#10284D] bg-secondary hover:bg-muted px-2.5 py-1.5 rounded-xl transition-all active:scale-95 shadow-xs"
              title="Tandai semua dibaca"
            >
              Tandai Dibaca
            </button>
          )}
          <button
            onClick={() => setShowSettingsModal(true)}
            className="flex items-center justify-center w-9 h-9 rounded-xl bg-muted hover:bg-secondary text-[#10284D] transition-colors active:scale-95 shadow-xs"
            aria-label="Pengaturan Notifikasi"
            title="Pengaturan Notifikasi"
          >
            <Icon name="Cog6ToothIcon" size={20} />
          </button>
        </div>
      }
    >
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* ========================================================================= */}
        {/* 1. HERO SUMMARY BANNER */}
        {/* ========================================================================= */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md relative overflow-hidden">
          <div className="absolute -right-6 -bottom-6 w-32 h-32 bg-white/10 rounded-full blur-xl pointer-events-none" />
          <div className="absolute right-14 top-2 w-16 h-16 bg-cyan-400/20 rounded-full blur-md pointer-events-none" />

          <div className="relative z-10 flex items-center justify-between">
            <div className="space-y-1 max-w-[280px] sm:max-w-md">
              <div className="flex items-center gap-2">
                <span className="bg-white/20 text-white text-[10px] font-extrabold px-2 py-0.5 rounded-full uppercase tracking-wider">
                  Klámbi Feed
                </span>
                {unreadTotal > 0 && (
                  <span className="bg-[#E86D50] text-white text-[10px] font-black px-2 py-0.5 rounded-full animate-pulse">
                    {unreadTotal} Baru
                  </span>
                )}
              </div>
              <h2 className="text-base sm:text-lg font-black tracking-tight">
                Pusat Notifikasi & Pengingat
              </h2>
              <p className="text-xs text-white/80 leading-relaxed">
                {unreadTotal > 0
                  ? `Ada ${unreadTotal} info penting seputar transaksi escrow, jadwal rawat, dan AI scan.`
                  : 'Semua notifikasi sudah dibaca. Anda tetap terdepan dalam merawat pakaian!'}
              </p>
            </div>

            <div className="w-12 h-12 rounded-2xl bg-white/15 backdrop-blur-xs flex items-center justify-center text-2xl shadow-inner flex-shrink-0">
              🔔
            </div>
          </div>

          {/* Quick Actions Strip */}
          <div className="relative z-10 pt-4 mt-3 border-t border-white/15 flex items-center justify-between text-xs">
            <button
              onClick={handleSimulateNewNotification}
              className="text-cyan-200 hover:text-white font-bold flex items-center gap-1 transition-colors text-[11px]"
            >
              <span>+ Simulasi Notif Baru</span>
            </button>

            {notifications.length > 0 && (
              <button
                onClick={clearAllNotifications}
                className="text-rose-200 hover:text-rose-100 font-bold transition-colors text-[11px]"
              >
                Bersihkan Semua
              </button>
            )}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 2. SEARCH BAR & CATEGORY PILLS */}
        {/* ========================================================================= */}
        <div className="space-y-2.5">
          {/* Search Input */}
          <div className="relative">
            <input
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              placeholder="Cari notifikasi (misal: Denim, Escrow, AI)..."
              className="w-full bg-card border border-border rounded-2xl pl-10 pr-4 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-[#10284D]/30 transition-all shadow-xs"
            />
            <div className="absolute left-3.5 top-3 text-muted-foreground pointer-events-none">
              <Icon name="MagnifyingGlassIcon" size={16} />
            </div>
            {searchQuery && (
              <button
                onClick={() => setSearchQuery('')}
                className="absolute right-3.5 top-2.5 text-xs text-muted-foreground hover:text-foreground font-bold"
              >
                ✕
              </button>
            )}
          </div>

          {/* Filter Tabs Horizontal Scroll */}
          <div className="flex gap-2 overflow-x-auto scrollbar-hide pb-1">
            {filterTabs.map((tab) => (
              <button
                key={tab.id}
                onClick={() => setSelectedFilter(tab.id as any)}
                className={`px-3.5 py-1.5 rounded-full text-xs font-bold whitespace-nowrap transition-all flex items-center gap-1.5 ${
                  selectedFilter === tab.id
                    ? 'bg-[#10284D] text-white shadow-xs'
                    : 'bg-card border border-border text-muted-foreground hover:border-[#10284D]/40'
                }`}
              >
                <span>{tab.label}</span>
                <span
                  className={`text-[10px] px-1.5 py-0.2 rounded-full font-extrabold ${
                    selectedFilter === tab.id
                      ? 'bg-white/20 text-white'
                      : 'bg-muted text-muted-foreground'
                  }`}
                >
                  {tab.count}
                </span>
              </button>
            ))}
          </div>
        </div>

        {/* ========================================================================= */}
        {/* 3. NOTIFICATION LIST */}
        {/* ========================================================================= */}
        {filteredNotifications.length === 0 ? (
          <div className="bg-card rounded-3xl p-10 border border-border text-center space-y-3 shadow-xs">
            <div className="w-14 h-14 rounded-2xl bg-muted mx-auto flex items-center justify-center text-3xl shadow-inner">
              📭
            </div>
            <h3 className="text-sm font-extrabold text-foreground">Tidak Ada Notifikasi</h3>
            <p className="text-xs text-muted-foreground max-w-xs mx-auto">
              {searchQuery
                ? `Tidak ditemukan notifikasi dengan kata kunci "${searchQuery}".`
                : 'Belum ada notifikasi pada kategori ini.'}
            </p>
            {searchQuery && (
              <button
                onClick={() => {
                  setSearchQuery('');
                  setSelectedFilter('all');
                }}
                className="text-xs font-bold text-[#10284D] bg-secondary px-4 py-2 rounded-xl hover:bg-muted transition-all"
              >
                Reset Pencarian
              </button>
            )}
          </div>
        ) : (
          <div className="bg-card rounded-3xl border border-border divide-y divide-border shadow-xs overflow-hidden">
            {filteredNotifications.map((n) => (
              <div
                key={n.id}
                onClick={() => handleNotificationClick(n)}
                className={`p-4 flex items-start gap-3.5 transition-colors cursor-pointer hover:bg-slate-50 relative group ${
                  n.unread ? 'bg-blue-50/40' : 'bg-transparent'
                }`}
              >
                {/* Unread indicator dot */}
                {n.unread && (
                  <span className="absolute top-4 right-4 w-2.5 h-2.5 rounded-full bg-[#E86D50] ring-4 ring-orange-100 animate-pulse" />
                )}

                {/* Icon Box */}
                <div
                  className={`w-11 h-11 rounded-2xl flex items-center justify-center flex-shrink-0 text-xl shadow-xs ${
                    n.type === 'order'
                      ? 'bg-blue-100 text-blue-700'
                      : n.type === 'care'
                      ? 'bg-emerald-100 text-emerald-700'
                      : n.type === 'ai'
                      ? 'bg-amber-100 text-amber-700'
                      : n.type === 'promo'
                      ? 'bg-rose-100 text-rose-700'
                      : 'bg-teal-100 text-teal-700'
                  }`}
                >
                  <span>{n.icon}</span>
                </div>

                {/* Content */}
                <div className="flex-1 min-w-0 pr-6 space-y-1">
                  <div className="flex items-center gap-2">
                    <span className={`text-[9px] font-extrabold px-1.5 py-0.5 rounded ${n.badgeColor || 'bg-secondary text-primary'}`}>
                      {n.categoryLabel}
                    </span>
                    <span className="text-[10px] text-muted-foreground">{n.time}</span>
                  </div>

                  <h4 className="text-xs sm:text-sm font-extrabold text-[#10284D] leading-snug">
                    {n.title}
                  </h4>

                  <p className="text-xs text-muted-foreground line-clamp-2 leading-relaxed">
                    {n.desc}
                  </p>

                  {/* Inline quick action buttons */}
                  <div className="pt-2 flex items-center justify-between">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        setNotifications((prev) =>
                          prev.map((item) => (item.id === n.id ? { ...item, unread: false } : item))
                        );
                        router.push(n.targetHref);
                      }}
                      className="text-[11px] font-extrabold text-[#10284D] hover:text-[#1E4D8C] bg-secondary hover:bg-muted px-3 py-1 rounded-xl transition-all flex items-center gap-1 active:scale-95"
                    >
                      <span>{n.actionText}</span>
                      <span>→</span>
                    </button>

                    <button
                      onClick={(e) => handleDeleteItem(n.id, e)}
                      className="opacity-0 group-hover:opacity-100 text-gray-400 hover:text-red-500 p-1 rounded-lg transition-opacity"
                      title="Hapus notifikasi"
                    >
                      <Icon name="TrashIcon" size={14} />
                    </button>
                  </div>
                </div>
              </div>
            ))}
          </div>
        )}

        {/* ========================================================================= */}
        {/* 4. NOTIFICATION DETAIL POP-UP MODAL */}
        {/* ========================================================================= */}
        {selectedNotification && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in shadow-2xl">
              {/* Modal Header */}
              <div className="flex items-start justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-3">
                  <div className="w-12 h-12 rounded-2xl bg-slate-100 flex items-center justify-center text-2xl shadow-inner">
                    {selectedNotification.icon}
                  </div>
                  <div>
                    <span className="text-[10px] bg-secondary text-primary font-bold px-2 py-0.5 rounded">
                      {selectedNotification.categoryLabel}
                    </span>
                    <h3 className="font-extrabold text-sm text-[#10284D] mt-1 leading-snug">
                      {selectedNotification.title}
                    </h3>
                  </div>
                </div>
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {/* Modal Content */}
              <div className="space-y-2.5 text-xs">
                <div className="text-gray-700 leading-relaxed bg-gray-50 p-3.5 rounded-2xl border border-gray-100">
                  <span className="text-[10px] text-gray-400 block mb-1">
                    Waktu: {selectedNotification.time}
                  </span>
                  <p>{selectedNotification.desc}</p>
                </div>

                {selectedNotification.details && (
                  <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 text-blue-950 text-[11px] space-y-1">
                    <strong className="block font-extrabold text-blue-900">Informasi Tambahan:</strong>
                    <p className="leading-relaxed">{selectedNotification.details}</p>
                    {selectedNotification.orderNumber && (
                      <div className="mt-2 pt-2 border-t border-blue-200/60 flex items-center justify-between text-[10px] font-mono font-bold text-blue-800">
                        <span>Kode Referensi:</span>
                        <span>{selectedNotification.orderNumber}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {/* Action Buttons */}
              <div className="grid grid-cols-2 gap-3 pt-2">
                <button
                  onClick={() => setSelectedNotification(null)}
                  className="border border-gray-300 text-gray-700 py-3 rounded-2xl text-xs font-bold hover:bg-gray-50 active:scale-95 transition-all"
                >
                  Tutup
                </button>

                <button
                  onClick={() => {
                    const href = selectedNotification.targetHref;
                    setSelectedNotification(null);
                    router.push(href);
                  }}
                  className="bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
                >
                  {selectedNotification.actionText || 'Buka Halaman →'}
                </button>
              </div>
            </div>
          </div>
        )}

        {/* ========================================================================= */}
        {/* 5. PREFERENCES / SETTINGS MODAL */}
        {/* ========================================================================= */}
        {showSettingsModal && (
          <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
            <div className="bg-white rounded-3xl p-6 w-full max-w-md text-gray-800 space-y-4 animate-scale-in shadow-2xl">
              <div className="flex items-center justify-between border-b border-gray-100 pb-3">
                <div className="flex items-center gap-2.5">
                  <div className="w-10 h-10 rounded-2xl bg-secondary flex items-center justify-center text-[#10284D]">
                    <Icon name="Cog6ToothIcon" size={20} />
                  </div>
                  <div>
                    <h3 className="font-extrabold text-sm text-[#10284D]">
                      Pengaturan Notifikasi
                    </h3>
                    <p className="text-[10px] text-gray-500">Kelola preferensi pesan & pengingat</p>
                  </div>
                </div>
                <button
                  onClick={() => setShowSettingsModal(false)}
                  className="text-gray-400 hover:text-gray-600 p-1"
                >
                  <Icon name="XMarkIcon" size={20} />
                </button>
              </div>

              {/* Toggles */}
              <div className="space-y-3 text-xs divide-y divide-gray-100">
                <div className="flex items-center justify-between pt-1">
                  <div>
                    <h4 className="font-bold text-gray-800">Update Transaksi & Escrow</h4>
                    <p className="text-[11px] text-gray-500">Notifikasi status order, pencairan saldo, dan resi</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.transaksi}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, transaksi: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#10284D] accent-[#10284D] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="font-bold text-gray-800">Pengingat Perawatan Pakaian</h4>
                    <p className="text-[11px] text-gray-500">Jadwal spa & laundry ramah serat berkala</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.perawatan}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, perawatan: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#10284D] accent-[#10284D] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="font-bold text-gray-800">Wearwise AI Scan Updates</h4>
                    <p className="text-[11px] text-gray-500">Hasil diagnosis kain, skor sirkular, dan tips AI</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.aiUpdates}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, aiUpdates: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#10284D] accent-[#10284D] cursor-pointer"
                  />
                </div>

                <div className="flex items-center justify-between pt-3">
                  <div>
                    <h4 className="font-bold text-gray-800">Promo & Diskon Sirkular</h4>
                    <p className="text-[11px] text-gray-500">Voucher hemat Kindfoam dan produk upcycle vintage</p>
                  </div>
                  <input
                    type="checkbox"
                    checked={preferences.promo}
                    onChange={(e) =>
                      setPreferences((p) => ({ ...p, promo: e.target.checked }))
                    }
                    className="w-4 h-4 rounded text-[#10284D] accent-[#10284D] cursor-pointer"
                  />
                </div>
              </div>

              <button
                onClick={() => {
                  setShowSettingsModal(false);
                  toast.success('Preferensi notifikasi berhasil disimpan');
                }}
                className="w-full bg-[#10284D] text-white py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all text-center"
              >
                Simpan Perubahan
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}

