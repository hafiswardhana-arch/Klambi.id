'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

interface EscrowInfoModalProps {
  onClose: () => void;
}

export default function EscrowInfoModal({ onClose }: EscrowInfoModalProps) {
  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-lg w-full p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="ShieldCheckIcon" size={18} />
            </div>
            <h3 className="text-base font-bold text-foreground">Sistem Escrow Klámbi.id</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Tutup"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <div className="mt-4 space-y-4 text-xs text-foreground">
          <div className="p-3.5 bg-info-bg rounded-xl border border-info/30">
            <h4 className="font-bold text-info mb-1">
              Apa itu Rekening Bersama (Escrow)?
            </h4>
            <p className="text-muted-foreground leading-relaxed">
              Escrow adalah sistem penampungan dana pihak ketiga yang aman. Saat Anda membeli barang Trift atau memesan layanan Permak & Perawatan, uang Anda disimpan secara aman oleh Klámbi dan <strong>TIDAK langsung ditransfer ke penjual/mitra</strong> sampai Anda menerima dan mengonfirmasi kondisi barang.
            </p>
          </div>

          <div className="space-y-2.5">
            <h4 className="font-bold text-foreground">Alur Kerja Perlindungan Transaksi:</h4>

            <div className="flex items-start gap-3 p-2.5 bg-muted/40 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                1
              </span>
              <div>
                <p className="font-bold text-foreground">Pembayaran Masuk ke Escrow</p>
                <p className="text-muted-foreground">Uang pembeli diamankan 100% di rekening penampungan resmi Klámbi.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 bg-muted/40 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                2
              </span>
              <div>
                <p className="font-bold text-foreground">Mitra / Penjual Mengirimkan Pakaian</p>
                <p className="text-muted-foreground">Proses permak/laundry diselesaikan atau baju dikirim via kurir ekspedisi.</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 bg-muted/40 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-primary text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                3
              </span>
              <div>
                <p className="font-bold text-foreground">Konfirmasi Penerimaan di Halaman Profil</p>
                <p className="text-muted-foreground">Setelah menerima barang, pembeli mengklik tombol "Konfirmasi Pesanan Diterima".</p>
              </div>
            </div>

            <div className="flex items-start gap-3 p-2.5 bg-muted/40 rounded-xl">
              <span className="w-6 h-6 rounded-full bg-accent text-white flex items-center justify-center font-bold text-xs flex-shrink-0">
                4
              </span>
              <div>
                <p className="font-bold text-foreground">Dana Cair Otomatis ke Saldo Penjual</p>
                <p className="text-muted-foreground">Penjual/mitra menerima saldo yang langsung bisa ditarik ke rekening bank / e-wallet.</p>
              </div>
            </div>
          </div>

          <div className="pt-2">
            <button
              onClick={onClose}
              className="btn-primary w-full py-2.5 text-xs font-semibold"
            >
              Saya Mengerti
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
