'use client';

import React, { useState } from 'react';
import { useRouter } from 'next/navigation';
import { toast } from 'sonner';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import DecisionButtonPair from '@/components/ui/DecisionButtonPair';

export default function TrifSellPage() {
  const router = useRouter();

  // Auto-generated data from AI Scan (Section 5.5.1a)
  const [productTitle, setProductTitle] = useState('Jaket Patchwork Denim Vintage Artisan');
  const [category, setCategory] = useState('Outerwear / Jaket');
  const [price, setPrice] = useState(185000);
  const [description, setDescription] = useState(
    'Jaket denim vintage upcycle dengan teknik patchwork rapi. Skor serat kain 88/100 (Sangat Baik). Kondisi bersih tanpa noda, kancing logam orisinal lengkap, dan jahitan kelim kokoh. Siap pakai langsung dari lemari terawat.'
  );
  const [isPublished, setIsPublished] = useState(false);

  // Escrow Transaction Simulation Steps (Section 5.5.1a)
  const escrowSteps = [
    { num: 1, label: 'Pembeli Checkout', desc: 'Pembeli memesan produk Anda dari Marketplace' },
    { num: 2, label: 'Bayar via Escrow', desc: 'Dana ditahan aman oleh sistem Rekening Bersama Klámbi' },
    { num: 3, label: 'Penjual Packing & Kirim', desc: 'Anda mengemas barang dan mengirim via kurir pilihan' },
    { num: 4, label: 'Pembeli Terima & Cek', desc: 'Pembeli memverifikasi kesesuaian fisik pakaian' },
    { num: 5, label: 'Dana Cair ke Saldo', desc: 'Dana Rp 185.000 dilepas otomatis ke saldo dompet Anda' },
  ];

  const handlePublish = () => {
    setIsPublished(true);
    toast.success('Produk berhasil dipublikasikan ke Marketplace Trif! 🎉');
  };

  return (
    <AppLayout title="Jual Satuan (Trif Marketplace)" showBack backHref="/jual">
      <div className="max-w-2xl mx-auto space-y-4 pb-24 select-none">
        {/* Banner */}
        <div className="bg-gradient-to-r from-[#10284D] via-[#163768] to-[#1E4D8C] text-white rounded-3xl p-5 shadow-md space-y-1">
          <span className="bg-white/20 text-white text-[10px] font-black px-2.5 py-0.5 rounded-full uppercase tracking-wider">
            Alur 5.5.1a: Thrift Satuan
          </span>
          <h2 className="text-base sm:text-lg font-black tracking-tight">
            Listing Pakaian ke Marketplace Klámbi
          </h2>
          <p className="text-xs text-white/85">
            Deskripsi & estimasi harga dibuat otomatis oleh Wearwise AI berdasarkan hasil diagnosis.
          </p>
        </div>

        {/* Listing Form Card */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-4">
          <h3 className="text-xs font-black uppercase tracking-wider text-[#10284D] border-b border-border pb-2">
            📝 Detail Informasi Listing
          </h3>

          {/* Title */}
          <div className="space-y-1">
            <label className="text-xs font-bold text-foreground block">Judul Produk:</label>
            <input
              type="text"
              value={productTitle}
              onChange={(e) => setProductTitle(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl px-3 py-2.5 text-xs text-foreground font-semibold outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>

          {/* Price & Category */}
          <div className="grid grid-cols-2 gap-3">
            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground block">Harga Jual (Rekomendasi AI):</label>
              <div className="relative">
                <span className="absolute left-3 top-2.5 text-xs font-bold text-[#E86D50]">Rp</span>
                <input
                  type="number"
                  value={price}
                  onChange={(e) => setPrice(Number(e.target.value))}
                  className="w-full bg-muted border border-border rounded-xl pl-10 pr-3 py-2.5 text-xs text-[#E86D50] font-extrabold outline-none focus:ring-2 focus:ring-[#10284D]"
                />
              </div>
            </div>

            <div className="space-y-1">
              <label className="text-xs font-bold text-foreground block">Kategori:</label>
              <input
                type="text"
                value={category}
                disabled
                className="w-full bg-muted/60 border border-border rounded-xl px-3 py-2.5 text-xs text-muted-foreground outline-none"
              />
            </div>
          </div>

          {/* Auto Description */}
          <div className="space-y-1">
            <div className="flex items-center justify-between">
              <label className="text-xs font-bold text-foreground block">Deskripsi Hasil Scan AI:</label>
              <span className="text-[10px] text-emerald-700 font-bold bg-emerald-50 px-2 py-0.5 rounded">
                ✨ Auto-Generated
              </span>
            </div>
            <textarea
              rows={3}
              value={description}
              onChange={(e) => setDescription(e.target.value)}
              className="w-full bg-muted border border-border rounded-xl p-3 text-xs text-foreground leading-relaxed outline-none focus:ring-2 focus:ring-[#10284D]"
            />
          </div>

          {/* Chat Integration Hint */}
          <div className="bg-blue-50/70 p-3.5 rounded-2xl border border-blue-100 flex items-center justify-between text-xs text-blue-950">
            <div className="flex items-center gap-2.5">
              <span className="text-xl">💬</span>
              <div>
                <strong className="block">Fitur Chat In-App Aktif</strong>
                <span className="text-[11px] text-blue-900/80">
                  Calon pembeli dapat bernegosiasi & bertanya langsung lewat pesan.
                </span>
              </div>
            </div>
            <button
              onClick={() => router.push('/chat')}
              className="text-[10px] font-bold bg-white text-[#10284D] px-2.5 py-1.5 rounded-xl border border-blue-200 hover:bg-blue-50 shadow-xs"
            >
              Buka Chat
            </button>
          </div>
        </div>

        {/* Alur Transaksi Escrow (Section 5.5.1a 5 Steps) */}
        <div className="bg-card rounded-3xl p-5 border border-border shadow-sm space-y-3">
          <div className="flex items-center justify-between border-b border-border pb-2">
            <h4 className="text-xs font-black uppercase tracking-wider text-[#10284D] flex items-center gap-1.5">
              <Icon name="ShieldCheckIcon" size={16} className="text-emerald-600" />
              <span>Alur Transaksi Escrow Klámbi</span>
            </h4>
            <span className="text-[10px] font-bold text-emerald-800 bg-emerald-100 px-2 py-0.5 rounded-full">
              100% Aman
            </span>
          </div>

          <div className="space-y-2.5">
            {escrowSteps.map((step) => (
              <div key={step.num} className="flex items-start gap-3 text-xs">
                <div className="w-6 h-6 rounded-full bg-[#10284D] text-white flex items-center justify-center text-[10px] font-extrabold flex-shrink-0 mt-0.5 shadow-xs">
                  {step.num}
                </div>
                <div>
                  <h5 className="font-extrabold text-[#10284D]">{step.label}</h5>
                  <p className="text-[11px] text-muted-foreground">{step.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Actions */}
        {!isPublished ? (
          <div className="grid grid-cols-2 gap-3 pt-2">
            <button
              onClick={() => router.push('/jual')}
              className="border-2 border-[#10284D] text-[#10284D] py-3.5 rounded-2xl text-xs font-bold hover:bg-slate-50 transition-all text-center"
            >
              ← Batal / Kembali
            </button>
            <button
              onClick={handlePublish}
              className="bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-extrabold shadow-md hover:bg-[#163768] transition-all text-center"
            >
              🚀 Publikasikan ke Market
            </button>
          </div>
        ) : (
          <div className="space-y-3 pt-2">
            <div className="bg-emerald-50 border border-emerald-200 p-4 rounded-2xl text-center space-y-1">
              <span className="text-2xl">🎉</span>
              <h4 className="text-sm font-extrabold text-emerald-900">Produk Berhasil Ditayangkan!</h4>
              <p className="text-xs text-emerald-800">
                Pakaian Anda kini dapat dilihat oleh ribuan pembeli di Klámbi Trift Marketplace.
              </p>
            </div>
            <div className="grid grid-cols-2 gap-3">
              <button
                onClick={() => router.push('/trift-marketplace')}
                className="bg-[#10284D] text-white py-3.5 rounded-2xl text-xs font-bold text-center shadow-md"
              >
                Lihat di Marketplace →
              </button>
              <button
                onClick={() => router.push('/profil')}
                className="border border-[#10284D] text-[#10284D] py-3.5 rounded-2xl text-xs font-bold text-center"
              >
                Ke Profil Saya
              </button>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
