'use client';
import React, { useState } from 'react';
import { toast } from 'sonner';
import Modal from '@/components/ui/Modal';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import EscrowTracker, { EscrowStatus } from '@/components/ui/EscrowTracker';
import ParameterScoreBars from '@/app/components/ParameterScoreBars';
import { TriftListing } from '../data/triftListings';

interface TriftListingModalProps {
  listing: TriftListing;
  onClose: () => void;
}

type ModalView = 'detail' | 'purchase' | 'chat' | 'tracking';

// Mock parameter breakdown for each listing
const mockParams = [
  { id: 'modal-kebersihan', label: 'Kebersihan', score: 0, note: '' },
  { id: 'modal-kain', label: 'Keutuhan Kain', score: 0, note: '' },
  { id: 'modal-warna', label: 'Kualitas Warna', score: 0, note: '' },
  { id: 'modal-jahitan', label: 'Kerapian Jahitan', score: 0, note: '' },
];

function getParamsForScore(totalScore: number) {
  const variance = () => Math.round((Math.random() - 0.5) * 16);
  return mockParams.map((p) => ({
    ...p,
    score: Math.min(100, Math.max(20, totalScore + variance())),
  }));
}

const mockChatMessages = [
  { id: 'msg-001', sender: 'buyer', text: 'Halo, apakah baju ini masih tersedia?', time: '14:22' },
  { id: 'msg-002', sender: 'seller', text: 'Halo! Masih tersedia kak 😊', time: '14:25' },
  { id: 'msg-003', sender: 'buyer', text: 'Bisa nego kak?', time: '14:26' },
  { id: 'msg-004', sender: 'seller', text: 'Bisa nego sedikit, minimal Rp 55.000 ya kak', time: '14:28' },
];

export default function TriftListingModal({ listing, onClose }: TriftListingModalProps) {
  const [view, setView] = useState<ModalView>('detail');
  const [escrowStatus, setEscrowStatus] = useState<EscrowStatus>('menunggu_pembayaran');
  const [isProcessing, setIsProcessing] = useState(false);
  const [chatInput, setChatInput] = useState('');
  const [chatMessages, setChatMessages] = useState(mockChatMessages);
  const [showParams, setShowParams] = useState(false);

  const params = getParamsForScore(listing.aiScore);
  const discount = Math.round(((listing.originalPrice - listing.price) / listing.originalPrice) * 100);

  const handlePurchase = () => {
    setIsProcessing(true);
    // BACKEND: POST /api/transactions — create trift purchase escrow
    setTimeout(() => {
      setIsProcessing(false);
      setEscrowStatus('dana_ditahan');
      setView('tracking');
      toast.success('Pembayaran berhasil! Dana ditahan escrow.');
    }, 2000);
  };

  const handleConfirmReceived = () => {
    setEscrowStatus('selesai');
    toast.success('Terima kasih! Dana dicairkan ke penjual.');
    setTimeout(onClose, 1500);
  };

  const handleSendChat = () => {
    if (!chatInput.trim()) return;
    setChatMessages((prev) => [
      ...prev,
      { id: `msg-${Date.now()}`, sender: 'buyer', text: chatInput.trim(), time: '14:30' },
    ]);
    setChatInput('');
    // BACKEND: POST /api/chat/:listingId/messages
  };

  const titleMap: Record<ModalView, string> = {
    detail: listing.title,
    purchase: 'Konfirmasi Pembelian',
    chat: `Chat dengan ${listing.seller.name}`,
    tracking: 'Status Pesanan',
  };

  return (
    <Modal isOpen onClose={onClose} title={titleMap[view]} size="lg">
      {view === 'detail' && (
        <div className="space-y-4 -mx-5 -mt-4">
          {/* Full Image */}
          <div className="relative w-full h-72 bg-muted">
            <AppImage
              src={listing.imageUrl}
              alt={listing.imageAlt}
              fill
              className="object-cover"
              priority
            />
            <div className="absolute top-3 left-3 flex gap-2">
              <div className={`flex items-center gap-1 px-2 py-1 rounded-full text-xs font-700 shadow-card ${
                listing.aiScore >= 80 ? 'bg-primary text-white' :
                listing.aiScore >= 60 ? 'bg-accent text-white': 'bg-warning text-white'
              }`}>
                <Icon name="SparklesIcon" size={12} variant="solid" className="text-white" />
                Skor AI {listing.aiScore}
              </div>
              {listing.isVerified && (
                <div className="flex items-center gap-1 px-2 py-1 rounded-full bg-card text-xs font-600 text-primary shadow-card">
                  <Icon name="ShieldCheckIcon" size={12} variant="solid" className="text-accent" />
                  Terverifikasi
                </div>
              )}
            </div>
            <div className="absolute top-3 right-3">
              <div className="bg-danger text-white text-xs font-700 px-2 py-1 rounded-full">
                -{discount}%
              </div>
            </div>
          </div>

          <div className="px-5 space-y-4">
            {/* Price & Info */}
            <div>
              <div className="flex items-start justify-between gap-3">
                <div>
                  <p className="text-xl font-800 text-primary font-tabular">
                    Rp {listing.price.toLocaleString('id-ID')}
                  </p>
                  <p className="text-sm text-muted-foreground line-through font-tabular">
                    Rp {listing.originalPrice.toLocaleString('id-ID')}
                  </p>
                </div>
                <Badge
                  variant={listing.aiScore >= 80 ? 'excellent' : listing.aiScore >= 60 ? 'good' : 'fair'}
                  size="md"
                >
                  {listing.conditionLabel}
                </Badge>
              </div>

              <div className="flex flex-wrap gap-2 mt-2">
                {[
                  { icon: 'TagIcon', text: listing.brand },
                  { icon: 'SwatchIcon', text: listing.color },
                  { icon: 'ArrowsPointingOutIcon', text: `Size ${listing.size}` },
                  { icon: 'FolderIcon', text: listing.category },
                ].map((attr) => (
                  <div
                    key={`attr-${attr.text}`}
                    className="flex items-center gap-1.5 bg-muted px-2.5 py-1 rounded-full"
                  >
                    <Icon name={attr.icon as Parameters<typeof Icon>[0]['name']} size={12} className="text-muted-foreground" />
                    <span className="text-xs text-foreground font-500">{attr.text}</span>
                  </div>
                ))}
              </div>
            </div>

            {/* AI Description */}
            <div className="p-3 bg-secondary rounded-xl border border-accent/30">
              <div className="flex items-center gap-2 mb-2">
                <Icon name="SparklesIcon" size={14} variant="solid" className="text-primary" />
                <p className="text-xs font-700 text-primary">Deskripsi Kondisi oleh AI</p>
              </div>
              <p className="text-xs text-muted-foreground leading-relaxed">{listing.aiDescription}</p>
            </div>

            {/* Parameter Scores */}
            <div className="card-elevated p-3">
              <button
                onClick={() => setShowParams(!showParams)}
                className="w-full flex items-center justify-between"
              >
                <p className="text-xs font-700 text-foreground">Detail Skor Parameter</p>
                <Icon name={showParams ? 'ChevronUpIcon' : 'ChevronDownIcon'} size={16} className="text-muted-foreground" />
              </button>
              {showParams && (
                <div className="mt-3 animate-fade-in">
                  <ParameterScoreBars parameters={params} showNotes={false} />
                </div>
              )}
            </div>

            {/* Seller */}
            <div className="flex items-center gap-3 p-3 bg-card border border-border rounded-xl">
              <div className="w-10 h-10 rounded-full gradient-green flex items-center justify-center flex-shrink-0">
                <span className="text-sm font-800 text-white">{listing.seller.avatar}</span>
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-sm font-700 text-foreground">{listing.seller.name}</p>
                <div className="flex items-center gap-2 mt-0.5">
                  <div className="flex items-center gap-1">
                    <Icon name="StarIcon" size={11} variant="solid" className="text-warning" />
                    <span className="text-xs font-600 text-foreground">{listing.seller.rating}</span>
                  </div>
                  <span className="text-xs text-muted-foreground">{listing.seller.totalSales} terjual</span>
                  <div className="flex items-center gap-1">
                    <Icon name="MapPinIcon" size={11} className="text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">{listing.seller.location}</span>
                  </div>
                </div>
              </div>
              <button
                onClick={() => setView('chat')}
                className="flex items-center gap-1.5 px-3 py-2 bg-secondary border border-accent/30 rounded-xl text-xs font-600 text-primary hover:bg-secondary/80 transition-colors"
              >
                <Icon name="ChatBubbleLeftEllipsisIcon" size={14} />
                Chat
              </button>
            </div>

            {/* Tags */}
            <div className="flex flex-wrap gap-1.5">
              {listing.tags.map((tag) => (
                <span
                  key={`tag-${listing.id}-${tag}`}
                  className="text-[11px] bg-muted text-muted-foreground px-2.5 py-1 rounded-full border border-border font-500"
                >
                  #{tag}
                </span>
              ))}
            </div>

            {/* Escrow Info */}
            <div className="flex items-start gap-2 p-3 bg-info-bg rounded-xl border border-info/30">
              <Icon name="ShieldCheckIcon" size={14} className="text-info flex-shrink-0 mt-0.5" />
              <p className="text-xs text-muted-foreground leading-relaxed">
                Pembayaran dilindungi escrow Klámbi.id. Dana hanya cair ke penjual setelah kamu konfirmasi barang diterima dan sesuai.
              </p>
            </div>

            {/* CTA */}
            <div className="flex gap-3 pb-2">
              <button
                onClick={() => setView('chat')}
                className="btn-secondary flex-1 flex items-center justify-center gap-2 py-3.5"
              >
                <Icon name="ChatBubbleLeftEllipsisIcon" size={18} className="text-primary" />
                Chat Penjual
              </button>
              <button
                onClick={() => setView('purchase')}
                className="btn-primary flex-1 flex items-center justify-center gap-2 py-3.5"
              >
                <Icon name="ShoppingBagIcon" size={18} className="text-white" />
                Beli Sekarang
              </button>
            </div>
          </div>
        </div>
      )}

      {view === 'purchase' && (
        <div className="space-y-4">
          {/* Item Summary */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <div className="w-14 h-16 rounded-xl overflow-hidden bg-muted flex-shrink-0 border border-border relative">
              <AppImage
                src={listing.imageUrl}
                alt={listing.imageAlt}
                fill
                className="object-cover"
              />
            </div>
            <div className="flex-1 min-w-0">
              <p className="text-sm font-700 text-foreground leading-snug">{listing.title}</p>
              <p className="text-xs text-muted-foreground">{listing.brand} · {listing.size}</p>
              <p className="text-sm font-800 text-primary font-tabular mt-1">
                Rp {listing.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Shipping */}
          <div>
            <p className="text-xs font-700 text-foreground mb-2">Pengiriman</p>
            <div className="space-y-2">
              {[
                { id: 'ship-jne', label: 'JNE Regular', est: '3–5 hari', price: 15000 },
                { id: 'ship-jnt', label: 'J&T Express', est: '2–4 hari', price: 18000 },
                { id: 'ship-sicepat', label: 'SiCepat BEST', est: '1–3 hari', price: 22000 },
              ].map((ship, i) => (
                <label
                  key={ship.id}
                  className={`flex items-center gap-3 p-3 rounded-xl border cursor-pointer transition-all ${
                    i === 0 ? 'border-primary bg-secondary' : 'border-border bg-card hover:border-accent'
                  }`}
                >
                  <input type="radio" name="shipping" defaultChecked={i === 0} className="accent-primary" />
                  <div className="flex-1">
                    <p className="text-sm font-600 text-foreground">{ship.label}</p>
                    <p className="text-xs text-muted-foreground">Estimasi {ship.est}</p>
                  </div>
                  <span className="text-sm font-700 text-foreground font-tabular">
                    Rp {ship.price.toLocaleString('id-ID')}
                  </span>
                </label>
              ))}
            </div>
          </div>

          {/* Price Breakdown */}
          <div className="bg-muted rounded-xl p-3 space-y-2">
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Harga Barang</span>
              <span className="font-600 text-foreground font-tabular">Rp {listing.price.toLocaleString('id-ID')}</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Ongkos Kirim</span>
              <span className="font-600 text-foreground font-tabular">Rp 15.000</span>
            </div>
            <div className="flex justify-between text-xs">
              <span className="text-muted-foreground">Biaya Layanan</span>
              <span className="font-600 text-foreground font-tabular">Rp 2.000</span>
            </div>
            <div className="border-t border-border pt-2 flex justify-between">
              <span className="text-sm font-700 text-foreground">Total</span>
              <span className="text-sm font-800 text-primary font-tabular">
                Rp {(listing.price + 15000 + 2000).toLocaleString('id-ID')}
              </span>
            </div>
          </div>

          {/* Payment Method */}
          <div>
            <p className="text-xs font-700 text-foreground mb-2">Metode Pembayaran</p>
            <div className="flex items-center gap-3 p-3 rounded-xl border border-primary bg-secondary">
              <Icon name="DevicePhoneMobileIcon" size={18} className="text-primary" />
              <div className="flex-1">
                <p className="text-sm font-600 text-foreground">GoPay</p>
                <p className="text-xs text-muted-foreground">Saldo: Rp 125.000</p>
              </div>
              <button className="text-xs text-primary font-600 hover:underline">Ganti</button>
            </div>
          </div>

          <button
            onClick={handlePurchase}
            disabled={isProcessing}
            className="btn-primary w-full py-4 flex items-center justify-center gap-2"
          >
            {isProcessing ? (
              <>
                <Icon name="ArrowPathIcon" size={18} className="text-white animate-spin" />
                Memproses Pembayaran...
              </>
            ) : (
              <>
                <Icon name="LockClosedIcon" size={18} className="text-white" />
                Bayar & Amankan dengan Escrow
              </>
            )}
          </button>

          <button
            onClick={() => setView('detail')}
            className="w-full text-center text-sm text-muted-foreground font-500 hover:text-foreground transition-colors py-1"
          >
            Kembali ke Detail
          </button>
        </div>
      )}

      {view === 'chat' && (
        <div className="flex flex-col h-[400px]">
          {/* Messages */}
          <div className="flex-1 overflow-y-auto space-y-3 pb-3">
            {chatMessages.map((msg) => (
              <div
                key={msg.id}
                className={`flex ${msg.sender === 'buyer' ? 'justify-end' : 'justify-start'}`}
              >
                <div
                  className={`max-w-[75%] px-3 py-2 rounded-2xl text-sm leading-relaxed ${
                    msg.sender === 'buyer' ?'bg-primary text-white rounded-br-sm' :'bg-muted text-foreground rounded-bl-sm'
                  }`}
                >
                  <p>{msg.text}</p>
                  <p className={`text-[10px] mt-1 ${msg.sender === 'buyer' ? 'text-white/60' : 'text-muted-foreground'}`}>
                    {msg.time}
                  </p>
                </div>
              </div>
            ))}
          </div>

          {/* Input */}
          <div className="border-t border-border pt-3 flex items-center gap-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => { if (e.key === 'Enter') handleSendChat(); }}
              placeholder="Ketik pesan..."
              className="flex-1 bg-input border border-border rounded-xl px-3 py-2.5 text-sm text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
            <button
              onClick={handleSendChat}
              className="w-10 h-10 rounded-xl bg-primary flex items-center justify-center flex-shrink-0 hover:bg-primary/90 transition-colors active:scale-95"
              aria-label="Kirim pesan"
            >
              <Icon name="PaperAirplaneIcon" size={18} variant="solid" className="text-white" />
            </button>
          </div>

          <button
            onClick={() => setView('detail')}
            className="mt-3 text-center text-xs text-muted-foreground font-500 hover:text-foreground transition-colors"
          >
            Kembali ke Detail
          </button>
        </div>
      )}

      {view === 'tracking' && (
        <div className="space-y-4">
          <EscrowTracker status={escrowStatus} />

          {/* Order Summary */}
          <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl">
            <div className="w-12 h-14 rounded-xl overflow-hidden bg-muted flex-shrink-0 relative border border-border">
              <AppImage src={listing.imageUrl} alt={listing.imageAlt} fill className="object-cover" />
            </div>
            <div className="flex-1">
              <p className="text-sm font-700 text-foreground leading-snug">{listing.title}</p>
              <p className="text-xs text-muted-foreground">dari {listing.seller.name}</p>
              <p className="text-sm font-800 text-primary font-tabular mt-0.5">
                Rp {listing.price.toLocaleString('id-ID')}
              </p>
            </div>
          </div>

          {/* Tracking Steps */}
          <div className="card-elevated p-4 space-y-3">
            <p className="text-xs font-700 text-foreground">Alur Pengiriman</p>
            {[
              { id: 'track-paid', label: 'Pembayaran dikonfirmasi', sub: 'Dana aman di escrow', done: true, time: 'Baru saja' },
              { id: 'track-packing', label: 'Penjual sedang packing', sub: 'Menunggu konfirmasi penjual', done: false, time: '–' },
              { id: 'track-shipped', label: 'Baju dikirim', sub: 'Nomor resi akan muncul di sini', done: false, time: '–' },
              { id: 'track-received', label: 'Barang diterima', sub: 'Konfirmasi untuk cairkan dana', done: false, time: '–' },
            ].map((t) => (
              <div key={t.id} className="flex items-start gap-3">
                <div className={`w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 ${
                  t.done ? 'bg-accent' : 'bg-muted'
                }`}>
                  {t.done ? (
                    <Icon name="CheckIcon" size={12} variant="solid" className="text-white" />
                  ) : (
                    <div className="w-2 h-2 rounded-full bg-muted-foreground/30" />
                  )}
                </div>
                <div className="flex-1">
                  <p className={`text-xs font-600 ${t.done ? 'text-foreground' : 'text-muted-foreground'}`}>
                    {t.label}
                  </p>
                  <p className="text-[11px] text-muted-foreground">{t.sub}</p>
                </div>
                <span className="text-[10px] text-muted-foreground flex-shrink-0">{t.time}</span>
              </div>
            ))}
          </div>

          {escrowStatus === 'dana_ditahan' && (
            <button
              onClick={handleConfirmReceived}
              className="btn-primary w-full py-3.5 flex items-center justify-center gap-2"
            >
              <Icon name="CheckCircleIcon" size={18} className="text-white" />
              Konfirmasi Barang Diterima & Sesuai
            </button>
          )}

          <p className="text-center text-[11px] text-muted-foreground">
            Masalah dengan pesanan?{' '}
            <button className="text-primary font-600 hover:underline">Hubungi Bantuan</button>
          </p>
        </div>
      )}
    </Modal>
  );
}