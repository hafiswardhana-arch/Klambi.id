'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Icon from '@/components/ui/AppIcon';

import ProfileHeader, { UserProfileData } from './ProfileHeader';
import PendingConfirmationBanner from './PendingConfirmationBanner';
import WalletEscrowSection from './WalletEscrowSection';
import AddressesSection, { SavedAddress } from './AddressesSection';
import PaymentMethodsSection, { PaymentMethodItem } from './PaymentMethodsSection';
import SellerReputationSection from './SellerReputationSection';
import ClothingHistoryTab from './ClothingHistoryTab';
import TransactionHistoryTab, { TransactionRecord } from './TransactionHistoryTab';

import ConfirmOrderModal, { PendingOrder } from './ConfirmOrderModal';
import EditProfileModal from './EditProfileModal';
import AddressModal from './AddressModal';
import PaymentMethodModal from './PaymentMethodModal';
import WithdrawModal from './WithdrawModal';
import EscrowInfoModal from './EscrowInfoModal';

const initialProfileData: UserProfileData = {
  name: 'Raditya Ardhani',
  email: 'raditya.ardhani@gmail.com',
  phone: '+62 812-3456-7890',
  isEmailVerified: true,
  isPhoneVerified: true,
  isKtpVerified: true,
  avatarText: 'RA',
  bio: 'Pecinta fashion vintage, denim enthusiast & penggiat sirkular tekstil.',
  memberTier: 'Eco-Warrior Level 2',
  textileSavedKg: 18.4,
  waterSavedLitres: 41200,
  co2SavedKg: 62.5,
  points: 2450,
};

const initialAddresses: SavedAddress[] = [
  {
    id: 'addr-1',
    label: 'Rumah (Utama)',
    recipientName: 'Raditya Ardhani',
    phone: '+62 812-3456-7890',
    fullAddress: 'Jl. Senopati No. 42, RT 02 / RW 03, Kel. Selong, Kec. Kebayoran Baru',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    notes: 'Pagar hitam, samping mini market. Titip di pos satpam jika tidak ada orang.',
    isDefault: true,
  },
  {
    id: 'addr-2',
    label: 'Kantor SCBD',
    recipientName: 'Raditya Ardhani',
    phone: '+62 812-3456-7890',
    fullAddress: 'Treasury Tower Lt. 18, Kawasan SCBD, Jl. Jend. Sudirman Kav. 52-53',
    city: 'Jakarta Selatan',
    postalCode: '12190',
    notes: 'Lobby Tower A, hubungi sebelum antar',
    isDefault: false,
  },
  {
    id: 'addr-3',
    label: 'Workshop Studio',
    recipientName: 'Raditya / Studio Klambi',
    phone: '+62 812-9876-5432',
    fullAddress: 'Jl. Kemang Raya No. 12B, Bangka, Mampang Prapatan',
    city: 'Jakarta Selatan',
    postalCode: '12730',
    notes: 'Ruko lantai 2, samping galeri seni',
    isDefault: false,
  },
];

const initialPaymentMethods: PaymentMethodItem[] = [
  {
    id: 'pm-1',
    type: 'ewallet',
    name: 'GoPay',
    accountNumber: '0812-3456-7890',
    isPrimary: true,
    status: 'Terhubung',
  },
  {
    id: 'pm-2',
    type: 'bank',
    name: 'BCA Virtual Account',
    accountNumber: '8271-0982-1928',
    isPrimary: false,
    status: 'Aktif',
  },
  {
    id: 'pm-3',
    type: 'ewallet',
    name: 'ShopeePay',
    accountNumber: '0812-3456-7890',
    isPrimary: false,
    status: 'Terhubung',
  },
  {
    id: 'pm-4',
    type: 'card',
    name: 'Kartu Debit Mandiri Visa',
    accountNumber: '4111 •••• •••• 8821',
    isPrimary: false,
    status: 'Aktif',
  },
];

const initialTransactions: TransactionRecord[] = [
  {
    id: 'tx-1',
    orderNumber: 'KLM-2026-0914',
    module: 'trift',
    moduleLabel: 'Trift Preloved',
    title: 'Jaket Denim Vintage Levi\'s 501 Original',
    partnerOrSeller: '@vintage_jkt (Denim House)',
    date: '22 Agu 2026',
    amount: 245000,
    status: 'waiting_confirmation',
    statusLabel: 'Menunggu Konfirmasi Diterima',
    courier: 'J&T Express Express',
    trackingNumber: 'JNT-992144180',
    escrowStatus: 'held',
  },
  {
    id: 'tx-2',
    orderNumber: 'KLM-2026-0881',
    module: 'perawatan',
    moduleLabel: 'Perawatan (Spa)',
    title: 'Deep Clean & Anti-Odor Textile Spa (2 Helai)',
    partnerOrSeller: 'CleanCare Signature Workshop Kemang',
    date: '20 Agu 2026',
    amount: 75000,
    status: 'waiting_confirmation',
    statusLabel: 'Menunggu Konfirmasi Diterima',
    courier: 'Kurir Internal Klámbi Pick-up',
    trackingNumber: 'KLM-PKP-0021',
    escrowStatus: 'held',
  },
  {
    id: 'tx-3',
    orderNumber: 'KLM-2026-0742',
    module: 'permak',
    moduleLabel: 'Permak & Jahit',
    title: 'Potong Panjang Celana & Hemming Chainstitch',
    partnerOrSeller: 'Taylor Studio Artisan Fatmawati',
    date: '14 Agu 2026',
    amount: 45000,
    status: 'completed',
    statusLabel: 'Selesai & Diterima',
    courier: 'Ambil di Tempat / Pick-up',
    trackingNumber: 'TAY-0082',
    escrowStatus: 'released',
  },
  {
    id: 'tx-4',
    orderNumber: 'KLM-2026-0618',
    module: 'upcycle',
    moduleLabel: 'Upcycle Tekstil',
    title: 'Tote Bag Rework Patchwork Katun Daur Ulang',
    partnerOrSeller: 'Sirkular Kreasi Studio',
    date: '02 Agu 2026',
    amount: 120000,
    status: 'completed',
    statusLabel: 'Selesai & Diterima',
    courier: 'SiCepat BEST',
    trackingNumber: 'SCP-8812903',
    escrowStatus: 'released',
  },
];

type MainTab = 'riwayat_baju' | 'riwayat_transaksi' | 'alamat_pembayaran' | 'reputasi_penjual' | 'pengaturan';

export default function ProfileContent() {
  const [profile, setProfile] = useState<UserProfileData>(initialProfileData);
  const [addresses, setAddresses] = useState<SavedAddress[]>(initialAddresses);
  const [paymentMethods, setPaymentMethods] = useState<PaymentMethodItem[]>(initialPaymentMethods);
  const [transactions, setTransactions] = useState<TransactionRecord[]>(initialTransactions);
  const [withdrawableBalance, setWithdrawableBalance] = useState<number>(850000);
  const [escrowBalance, setEscrowBalance] = useState<number>(320000);

  const [activeTab, setActiveTab] = useState<MainTab>('riwayat_baju');

  // Modal States
  const [isEditProfileOpen, setIsEditProfileOpen] = useState(false);
  const [isAddressModalOpen, setIsAddressModalOpen] = useState(false);
  const [addressToEdit, setAddressToEdit] = useState<SavedAddress | null>(null);
  const [isPaymentModalOpen, setIsPaymentModalOpen] = useState(false);
  const [isWithdrawModalOpen, setIsWithdrawModalOpen] = useState(false);
  const [isEscrowInfoOpen, setIsEscrowInfoOpen] = useState(false);
  const [selectedOrderToConfirm, setSelectedOrderToConfirm] = useState<PendingOrder | null>(null);

  // Derived pending confirmation orders
  const pendingOrders: PendingOrder[] = transactions
    .filter((t) => t.status === 'waiting_confirmation')
    .map((t) => ({
      id: t.id,
      orderNumber: t.orderNumber,
      module: t.module,
      moduleLabel: t.moduleLabel,
      title: t.title,
      partnerOrSeller: t.partnerOrSeller,
      amount: t.amount,
      trackingNumber: t.trackingNumber,
      courier: t.courier,
    }));

  // Confirm order received handler
  const handleConfirmOrderReceived = (orderId: string, rating: number, review: string) => {
    const target = transactions.find((t) => t.id === orderId);
    if (!target) return;

    setTransactions((prev) =>
      prev.map((t) =>
        t.id === orderId
          ? {
              ...t,
              status: 'completed',
              statusLabel: 'Selesai & Diterima',
              escrowStatus: 'released',
            }
          : t
      )
    );

    setEscrowBalance((prev) => Math.max(0, prev - target.amount));
    setProfile((prev) => ({
      ...prev,
      points: prev.points + 50,
      textileSavedKg: +(prev.textileSavedKg + 0.8).toFixed(1),
    }));

    setSelectedOrderToConfirm(null);
    toast.success(
      `Pesanan #${target.orderNumber} berhasil dikonfirmasi! Dana escrow sebesar Rp ${target.amount.toLocaleString(
        'id-ID'
      )} telah diteruskan ke mitra (+50 Poin Ekologis).`
    );
  };

  // Address handlers
  const handleSaveAddress = (newAddr: SavedAddress) => {
    if (newAddr.isDefault) {
      setAddresses((prev) =>
        prev.map((a) => ({ ...a, isDefault: a.id === newAddr.id }))
      );
    }
    setAddresses((prev) => {
      const exists = prev.some((a) => a.id === newAddr.id);
      if (exists) {
        return prev.map((a) => (a.id === newAddr.id ? newAddr : a));
      }
      return [newAddr, ...prev];
    });
    setIsAddressModalOpen(false);
    setAddressToEdit(null);
    toast.success('Alamat berhasil disimpan!');
  };

  const handleDeleteAddress = (addrId: string) => {
    setAddresses((prev) => prev.filter((a) => a.id !== addrId));
    toast.success('Alamat berhasil dihapus.');
  };

  const handleSetDefaultAddress = (addrId: string) => {
    setAddresses((prev) =>
      prev.map((a) => ({ ...a, isDefault: a.id === addrId }))
    );
    toast.success('Alamat utama pick-up berhasil diubah.');
  };

  // Payment handlers
  const handleSavePaymentMethod = (newPm: PaymentMethodItem) => {
    if (newPm.isPrimary) {
      setPaymentMethods((prev) =>
        prev.map((p) => ({ ...p, isPrimary: p.id === newPm.id }))
      );
    }
    setPaymentMethods((prev) => [newPm, ...prev]);
    setIsPaymentModalOpen(false);
    toast.success(`Metode ${newPm.name} berhasil ditambahkan!`);
  };

  const handleDeletePaymentMethod = (id: string) => {
    setPaymentMethods((prev) => prev.filter((p) => p.id !== id));
    toast.success('Metode pembayaran dihapus.');
  };

  const handleSetPrimaryPayment = (id: string) => {
    setPaymentMethods((prev) =>
      prev.map((p) => ({ ...p, isPrimary: p.id === id }))
    );
    toast.success('Metode pembayaran utama diubah.');
  };

  // Withdrawal handler
  const handleWithdraw = (amount: number, destination: string) => {
    setWithdrawableBalance((prev) => Math.max(0, prev - amount));
    setIsWithdrawModalOpen(false);
    toast.success(
      `Penarikan dana Rp ${amount.toLocaleString('id-ID')} ke ${destination} sedang diproses!`
    );
  };

  return (
    <div className="space-y-5 pb-16">
      {/* 1. Header Profil & Eco Impact Gamification */}
      <ProfileHeader
        profile={profile}
        onOpenEdit={() => setIsEditProfileOpen(true)}
      />

      {/* 2. Banner Konfirmasi Pesanan Diterima (Fitur Penting yang diminta) */}
      <PendingConfirmationBanner
        pendingOrders={pendingOrders}
        onOpenConfirmModal={(order) => setSelectedOrderToConfirm(order)}
      />

      {/* 3. Saldo & Rekening Bersama Escrow */}
      <WalletEscrowSection
        withdrawableBalance={withdrawableBalance}
        escrowBalance={escrowBalance}
        escrowPendingCount={pendingOrders.length}
        onOpenWithdrawModal={() => setIsWithdrawModalOpen(true)}
        onOpenEscrowDetailModal={() => setIsEscrowInfoOpen(true)}
      />

      {/* 4. Tab Navigation (Clean Minimalist Design) */}
      <div className="flex border-b border-border gap-2 overflow-x-auto scrollbar-hide pb-0.5">
        <button
          onClick={() => setActiveTab('riwayat_baju')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'riwayat_baju'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="CameraIcon" size={16} />
          Riwayat Baju (Scan AI)
        </button>

        <button
          onClick={() => setActiveTab('riwayat_transaksi')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'riwayat_transaksi'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="ClockIcon" size={16} />
          Riwayat Transaksi ({transactions.length})
          {pendingOrders.length > 0 && (
            <span className="w-2 h-2 rounded-full bg-warning"></span>
          )}
        </button>

        <button
          onClick={() => setActiveTab('alamat_pembayaran')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'alamat_pembayaran'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="MapPinIcon" size={16} />
          Alamat & Pembayaran
        </button>

        <button
          onClick={() => setActiveTab('reputasi_penjual')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'reputasi_penjual'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="StarIcon" size={16} />
          Reputasi Penjual
        </button>

        <button
          onClick={() => setActiveTab('pengaturan')}
          className={`flex items-center gap-2 px-3.5 py-2.5 text-xs sm:text-sm font-semibold border-b-2 transition-all whitespace-nowrap ${
            activeTab === 'pengaturan'
              ? 'border-primary text-primary'
              : 'border-transparent text-muted-foreground hover:text-foreground'
          }`}
        >
          <Icon name="Cog6ToothIcon" size={16} />
          Pengaturan
        </button>
      </div>

      {/* Tab 1: Riwayat Baju (Scan AI) */}
      {activeTab === 'riwayat_baju' && <ClothingHistoryTab />}

      {/* Tab 2: Riwayat Transaksi */}
      {activeTab === 'riwayat_transaksi' && (
        <TransactionHistoryTab
          transactions={transactions}
          onOpenConfirmModal={(order) => setSelectedOrderToConfirm(order)}
        />
      )}

      {/* Tab 3: Alamat & Pembayaran */}
      {activeTab === 'alamat_pembayaran' && (
        <div className="space-y-5">
          <AddressesSection
            addresses={addresses}
            onOpenAddAddress={() => {
              setAddressToEdit(null);
              setIsAddressModalOpen(true);
            }}
            onEditAddress={(addr) => {
              setAddressToEdit(addr);
              setIsAddressModalOpen(true);
            }}
            onDeleteAddress={handleDeleteAddress}
            onSetDefaultAddress={handleSetDefaultAddress}
          />

          <PaymentMethodsSection
            paymentMethods={paymentMethods}
            onOpenAddPayment={() => setIsPaymentModalOpen(true)}
            onDeletePayment={handleDeletePaymentMethod}
            onSetPrimaryPayment={handleSetPrimaryPayment}
          />
        </div>
      )}

      {/* Tab 4: Reputasi Penjual & Review */}
      {activeTab === 'reputasi_penjual' && <SellerReputationSection />}

      {/* Tab 5: Pengaturan Akun & Keamanan */}
      {activeTab === 'pengaturan' && (
        <div className="bg-card border border-border rounded-2xl divide-y divide-border shadow-sm">
          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setIsEditProfileOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon name="UserIcon" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Edit Profil & Biodata</h4>
                <p className="text-[11px] text-muted-foreground">Ubah nama, nomor HP WhatsApp, dan foto</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
          </div>

          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => setIsEscrowInfoOpen(true)}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon name="ShieldCheckIcon" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Kebijakan Keamanan & Perlindungan Escrow</h4>
                <p className="text-[11px] text-muted-foreground">Pelajari garansi uang kembali & transparansi transaksi</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
          </div>

          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => toast.info('Preferensi notifikasi perawatan aktif')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon name="BellIcon" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Notifikasi & Pengingat Perawatan Baju</h4>
                <p className="text-[11px] text-muted-foreground">Pengingat berkala deep-clean pakaian kesayangan</p>
              </div>
            </div>
            <span className="text-xs font-bold text-primary">Aktif</span>
          </div>

          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-muted/40 transition-colors"
            onClick={() => toast.info('Pusat Bantuan: Hubungi cs@klambi.id atau WhatsApp Official Klámbi')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-secondary flex items-center justify-center text-primary">
                <Icon name="QuestionMarkCircleIcon" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-foreground">Pusat Bantuan & Edukasi Sirkular</h4>
                <p className="text-[11px] text-muted-foreground">Panduan cara merawat kain & FAQ platform</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-muted-foreground" />
          </div>

          <div
            className="p-4 flex items-center justify-between cursor-pointer hover:bg-danger-bg/40 transition-colors"
            onClick={() => toast.info('Sesi akun telah disimpan.')}
          >
            <div className="flex items-center gap-3">
              <div className="w-9 h-9 rounded-xl bg-danger-bg flex items-center justify-center text-danger">
                <Icon name="ArrowLeftOnRectangleIcon" size={18} />
              </div>
              <div>
                <h4 className="text-xs font-bold text-danger">Keluar Akun</h4>
                <p className="text-[11px] text-muted-foreground">Keluar dari sesi aplikasi di perangkat ini</p>
              </div>
            </div>
            <Icon name="ChevronRightIcon" size={16} className="text-danger" />
          </div>
        </div>
      )}

      {/* MODALS */}
      {selectedOrderToConfirm && (
        <ConfirmOrderModal
          order={selectedOrderToConfirm}
          onClose={() => setSelectedOrderToConfirm(null)}
          onConfirm={handleConfirmOrderReceived}
        />
      )}

      {isEditProfileOpen && (
        <EditProfileModal
          profile={profile}
          onClose={() => setIsEditProfileOpen(false)}
          onSave={(updated) => {
            setProfile((prev) => ({ ...prev, ...updated }));
            setIsEditProfileOpen(false);
            toast.success('Profil berhasil diperbarui!');
          }}
        />
      )}

      {isAddressModalOpen && (
        <AddressModal
          addressToEdit={addressToEdit}
          onClose={() => {
            setIsAddressModalOpen(false);
            setAddressToEdit(null);
          }}
          onSave={handleSaveAddress}
        />
      )}

      {isPaymentModalOpen && (
        <PaymentMethodModal
          onClose={() => setIsPaymentModalOpen(false)}
          onSave={handleSavePaymentMethod}
        />
      )}

      {isWithdrawModalOpen && (
        <WithdrawModal
          balance={withdrawableBalance}
          paymentMethods={paymentMethods}
          onClose={() => setIsWithdrawModalOpen(false)}
          onWithdraw={handleWithdraw}
        />
      )}

      {isEscrowInfoOpen && (
        <EscrowInfoModal onClose={() => setIsEscrowInfoOpen(false)} />
      )}
    </div>
  );
}
