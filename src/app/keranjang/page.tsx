'use client';

import React, { useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';

interface CartItem {
  id: string;
  storeName: string;
  category: string;
  title: string;
  condition: string;
  price: number;
  originalPrice: number;
  selected: boolean;
  emoji: string;
  imageUrl: string;
  isClothing: boolean;
  color: string;
  size?: string;
  brand?: string;
}

const initialItems: CartItem[] = [
  {
    id: 'cart-1',
    storeName: '@vintage_jkt (Denim House)',
    category: 'Jaket',
    title: "Jaket Denim Vintage Levi's 501 Original",
    condition: 'Sangat Baik',
    price: 245000,
    originalPrice: 450000,
    selected: true,
    emoji: '🧥',
    imageUrl: 'https://images.unsplash.com/photo-1576995853123-5a10305d93c0?w=600&auto=format&fit=crop&q=80',
    isClothing: true,
    color: '#1E3A8A',
    size: 'L',
    brand: "Levi's",
  },
  {
    id: 'cart-2',
    storeName: 'Kindfoam Official',
    category: 'Produk Perawatan',
    title: 'Kindfoam Eco-Deterjen Lembaran 30pcs',
    condition: 'Produk Eco',
    price: 45000,
    originalPrice: 65000,
    selected: true,
    emoji: '🧼',
    imageUrl: 'https://images.unsplash.com/photo-1583947215259-38e31be8751f?w=600&auto=format&fit=crop&q=80',
    isClothing: false,
    color: '#22C55E',
  },
  {
    id: 'cart-3',
    storeName: '@batik_solo_heritage',
    category: 'Kemeja',
    title: 'Kemeja Batik Tulis Parang Coklat-Krem',
    condition: 'Sangat Baik',
    price: 200000,
    originalPrice: 900000,
    selected: true,
    emoji: '👔',
    imageUrl: 'https://images.unsplash.com/photo-1607604276583-eef5d076aa5f?w=600&auto=format&fit=crop&q=80',
    isClothing: true,
    color: '#92400E',
    size: 'L',
    brand: 'Batik Keris',
  },
  {
    id: 'cart-4',
    storeName: 'ReworkLab ID',
    category: 'Kaos',
    title: 'Kaos Oversized Heavyweight Vintage Band Tee',
    condition: 'Baik',
    price: 85000,
    originalPrice: 200000,
    selected: false,
    emoji: '👕',
    imageUrl: 'https://images.unsplash.com/photo-1503342217505-b0a15ec3261c?w=600&auto=format&fit=crop&q=80',
    isClothing: true,
    color: '#1C1917',
    size: 'XL',
    brand: 'Unknown Pleasures',
  },
];

export default function KeranjangPage() {
  const router = useRouter();
  const [items, setItems] = useState<CartItem[]>(initialItems);

  const toggleSelect = (id: string) => {
    setItems((prev) =>
      prev.map((item) => (item.id === id ? { ...item, selected: !item.selected } : item))
    );
  };

  const toggleAll = () => {
    const allSelected = items.every((i) => i.selected);
    setItems((prev) => prev.map((item) => ({ ...item, selected: !allSelected })));
  };

  const removeItem = (id: string) => {
    setItems((prev) => prev.filter((item) => item.id !== id));
    toast.success('Item dihapus dari keranjang.');
  };

  const handleTryMannequin = (item: CartItem) => {
    // Save the item to localStorage so Styliss AI can read it
    const mannequinData = {
      id: item.id,
      title: item.title,
      emoji: item.emoji,
      category: item.category,
      color: item.color,
      size: item.size,
      brand: item.brand,
      condition: item.condition,
      price: item.price,
    };
    if (typeof window !== 'undefined') {
      localStorage.setItem('klambi_styliss_item', JSON.stringify(mannequinData));
      localStorage.setItem('klambi_styliss_source', 'keranjang');
    }
    toast.success(`Membuka Styliss AI untuk ${item.title}...`);
    router.push('/styliss-ai?source=keranjang');
  };

  const selectedItems = items.filter((i) => i.selected);
  const totalSubtotal = selectedItems.reduce((acc, curr) => acc + curr.price, 0);

  const handleCheckout = () => {
    if (selectedItems.length === 0) {
      toast.error('Pilih minimal 1 item untuk checkout');
      return;
    }
    router.push(`/pembayaran?total=${totalSubtotal}`);
  };

  return (
    <AppLayout title="Keranjang Saya" showBack backHref="/">
      <div className="max-w-2xl mx-auto space-y-4 pb-32 animate-fade-in">

        {/* Styliss AI Banner */}
        <div className="bg-gradient-to-r from-[#D1FAE5] to-[#A7F3D0] border border-emerald-200 rounded-2xl p-4 flex items-center gap-3">
          <div className="w-10 h-10 rounded-xl bg-emerald-600 flex items-center justify-center text-white text-lg flex-shrink-0">
            🧍
          </div>
          <div className="flex-1 min-w-0">
            <div className="text-xs font-extrabold text-emerald-900">Coba Dulu Sebelum Beli!</div>
            <div className="text-[10px] text-emerald-800 mt-0.5">Tekan tombol <strong>Coba di Manekin 3D</strong> di tiap item pakaian untuk visualisasi sebelum checkout.</div>
          </div>
        </div>

        {/* Select All Row */}
        <div className="bg-card rounded-2xl p-4 border border-border shadow-sm flex items-center justify-between">
          <label className="flex items-center gap-3 cursor-pointer select-none">
            <input
              type="checkbox"
              checked={items.length > 0 && items.every((i) => i.selected)}
              onChange={toggleAll}
              className="w-5 h-5 accent-[#10284D] rounded cursor-pointer"
            />
            <span className="text-xs font-bold text-foreground">
              Pilih Semua ({items.length} item)
            </span>
          </label>
          <span className="text-xs text-muted-foreground font-semibold">
            {selectedItems.length} Dipilih
          </span>
        </div>

        {/* Item List */}
        {items.length === 0 ? (
          <div className="bg-card rounded-2xl p-12 text-center space-y-3 border border-border shadow-sm">
            <Icon name="ShoppingBagIcon" size={48} className="mx-auto text-muted-foreground/40" />
            <h3 className="text-sm font-bold text-foreground">Keranjangmu Kosong</h3>
            <p className="text-xs text-muted-foreground">Temukan pakaian upcycle atau perawatan fashion pilihanmu!</p>
            <Link
              href="/trift-marketplace"
              className="inline-block bg-[#10284D] text-white px-5 py-2.5 rounded-xl text-xs font-bold shadow-sm hover:opacity-90"
            >
              Jelajahi Market
            </Link>
          </div>
        ) : (
          items.map((item) => (
            <div
              key={item.id}
              className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3 animate-slide-up"
            >
              {/* Store Header */}
              <div className="flex items-center justify-between border-b border-border pb-2.5">
                <div className="flex items-center gap-2">
                  <input
                    type="checkbox"
                    checked={item.selected}
                    onChange={() => toggleSelect(item.id)}
                    className="w-4 h-4 accent-[#10284D] rounded cursor-pointer"
                  />
                  <span className="text-xs font-extrabold text-[#10284D]">
                    {item.storeName}
                  </span>
                </div>
                <button
                  onClick={() => removeItem(item.id)}
                  className="text-muted-foreground hover:text-red-500 transition-colors"
                >
                  <Icon name="TrashIcon" size={16} />
                </button>
              </div>

              {/* Item Content */}
              <div className="flex items-start gap-3">
                {/* Real product photo thumbnail */}
                <div className="relative w-18 h-18 rounded-xl overflow-hidden flex-shrink-0 border border-border shadow-inner bg-slate-100">
                  <Image
                    src={item.imageUrl}
                    alt={item.title}
                    fill
                    unoptimized
                    className="object-cover"
                  />
                  <span className="absolute bottom-1 right-1 text-xs bg-black/50 text-white px-1 py-0.5 rounded backdrop-blur-xs">
                    {item.emoji}
                  </span>
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                    {item.category}{item.size ? ` • Size ${item.size}` : ''}
                  </span>
                  <h4 className="text-xs font-bold text-foreground leading-snug">{item.title}</h4>
                  {item.brand && (
                    <span className="text-[10px] text-muted-foreground">by {item.brand}</span>
                  )}
                  <span className="inline-block mt-1 bg-[#D1FAE5] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.condition}
                  </span>
                  <div className="flex items-baseline gap-2 mt-1.5">
                    <span className="text-xs font-extrabold text-[#E86D50]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      Rp {item.originalPrice.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] font-bold text-red-600 bg-red-50 px-1.5 py-0.5 rounded">
                      -{Math.round((1 - item.price / item.originalPrice) * 100)}%
                    </span>
                  </div>
                </div>
              </div>

              {/* Action Buttons */}
              <div className="flex items-center gap-2 pt-1 border-t border-border">
                {item.isClothing ? (
                  <button
                    onClick={() => handleTryMannequin(item)}
                    className="flex items-center gap-1.5 bg-gradient-to-r from-[#10284D] to-[#1A3A6B] text-white px-4 py-2 rounded-xl text-[11px] font-extrabold shadow-sm hover:shadow-md active:scale-95 transition-all"
                  >
                    <span>🧍</span>
                    <span>Coba di Manekin 3D</span>
                  </button>
                ) : (
                  <span className="text-[10px] text-muted-foreground italic px-2">
                    (Produk non-pakaian)
                  </span>
                )}
                <button
                  onClick={() => {
                    toast.info(`${item.title} disimpan ke wishlist`);
                  }}
                  className="flex items-center gap-1 px-3 py-2 rounded-xl text-[11px] font-semibold text-muted-foreground border border-border hover:border-[#10284D]/40 hover:text-[#10284D] transition-all"
                >
                  <Icon name="HeartIcon" size={12} />
                  Wishlist
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {/* Bottom Checkout Sticky Bar */}
      {items.length > 0 && (
        <div className="fixed bottom-16 left-0 right-0 z-40 bg-card border-t border-border p-4 shadow-modal">
          <div className="max-w-2xl mx-auto flex items-center justify-between gap-4">
            <div>
              <span className="text-[10px] text-muted-foreground font-semibold block">
                Total Subtotal ({selectedItems.length} item)
              </span>
              <span className="text-base font-extrabold text-[#E86D50]">
                Rp {totalSubtotal.toLocaleString('id-ID')}
              </span>
            </div>
            <button
              onClick={handleCheckout}
              className="bg-[#10284D] text-white px-6 py-3 rounded-2xl text-xs font-bold shadow-md hover:bg-[#152248] active:scale-95 transition-all"
            >
              Checkout ({selectedItems.length})
            </button>
          </div>
        </div>
      )}
    </AppLayout>
  );
}
