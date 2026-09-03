'use client';

import React, { useState } from 'react';
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
  },
  {
    id: 'cart-2',
    storeName: 'CleanCare Signature Kemang',
    category: 'Perawatan',
    title: 'Deep Clean & Anti-Odor Textile Spa (2 Helai)',
    condition: 'Jasa Spa',
    price: 75000,
    originalPrice: 100000,
    selected: true,
  },
  {
    id: 'cart-3',
    storeName: 'Taylor Studio Artisan',
    category: 'Permak',
    title: 'Potong Panjang Celana & Hemming Chainstitch',
    condition: 'Jasa Permak',
    price: 45000,
    originalPrice: 60000,
    selected: false,
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
      <div className="max-w-2xl mx-auto space-y-4 pb-20">
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
              className="bg-card rounded-2xl p-4 border border-border shadow-sm space-y-3"
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
                <div className="w-16 h-16 rounded-xl bg-secondary flex items-center justify-center text-primary flex-shrink-0">
                  <Icon name="ShirtIcon" size={28} />
                </div>
                <div className="flex-1 min-w-0">
                  <span className="text-[10px] text-muted-foreground font-semibold uppercase">
                    {item.category}
                  </span>
                  <h4 className="text-xs font-bold text-foreground truncate">{item.title}</h4>
                  <span className="inline-block mt-1 bg-[#D1FAE5] text-[#166534] text-[10px] font-bold px-2 py-0.5 rounded-md">
                    {item.condition}
                  </span>
                  <div className="flex items-baseline gap-2 mt-2">
                    <span className="text-xs font-extrabold text-[#E86D50]">
                      Rp {item.price.toLocaleString('id-ID')}
                    </span>
                    <span className="text-[10px] text-muted-foreground line-through">
                      Rp {item.originalPrice.toLocaleString('id-ID')}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}

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
                Lanjut ke Checkout ({selectedItems.length})
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
