'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';

export interface BuyerReview {
  id: string;
  buyerName: string;
  buyerAvatar: string;
  rating: number;
  comment: string;
  productName: string;
  date: string;
  isVerifiedPurchase: boolean;
}

const initialReviews: BuyerReview[] = [
  {
    id: 'rev-1',
    buyerName: 'Anindya Putri',
    buyerAvatar: 'AP',
    rating: 5,
    comment: 'Kemeja flanelnya masih wangi banget, kondisi persis seperti deskripsi AI di app. Pengiriman cepat dan aman!',
    productName: 'Kemeja Flanel Uniqlo Tartan Hijau',
    date: '19 Agu 2026',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-2',
    buyerName: 'Bima Satria',
    buyerAvatar: 'BS',
    rating: 5,
    comment: 'Celana denim original tanpa cacat. Seller sangat ramah dan jujur. Recommended seller Klámbi!',
    productName: 'Jeans Levi\'s 501 Straight Fit',
    date: '14 Agu 2026',
    isVerifiedPurchase: true,
  },
  {
    id: 'rev-3',
    buyerName: 'Clara Salsabila',
    buyerAvatar: 'CS',
    rating: 4,
    comment: 'Bahan jaket vintage-nya tebal dan bagus. Sedikit berdebu pas datang tapi setelah dicuci bersih sempurna.',
    productName: 'Vintage Bomber Jacket Green Army',
    date: '08 Agu 2026',
    isVerifiedPurchase: true,
  },
];

export default function SellerReputationSection() {
  const [reviews] = useState<BuyerReview[]>(initialReviews);

  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
            <Icon name="StarIcon" size={18} variant="solid" className="text-warning fill-warning" />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Reputasi & Ulasan Penjual Trift</h3>
            <p className="text-[11px] text-muted-foreground">Kepercayaan komunitas pembeli di pasar sirkular Klámbi</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <span className="inline-flex items-center gap-1 text-[11px] font-bold text-primary bg-secondary px-2.5 py-1 rounded-full border border-accent/30">
            <Icon name="CheckBadgeIcon" size={13} variant="solid" />
            Verified Trusted Seller
          </span>
        </div>
      </div>

      {/* Seller Scorecard */}
      <div className="p-4 bg-secondary/50 rounded-xl border border-border/80 grid grid-cols-2 sm:grid-cols-4 gap-3 text-center">
        <div className="p-2 bg-card rounded-lg border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Rating Penjual</span>
          <div className="flex items-center justify-center gap-1 mt-0.5">
            <span className="text-base font-extrabold text-foreground">4.9</span>
            <Icon name="StarIcon" size={14} variant="solid" className="text-warning fill-warning" />
          </div>
          <span className="text-[10px] text-muted-foreground">32 Ulasan Pembeli</span>
        </div>

        <div className="p-2 bg-card rounded-lg border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Tingkat Respon</span>
          <span className="text-base font-extrabold text-primary block mt-0.5">98%</span>
          <span className="text-[10px] text-muted-foreground">&lt; 15 Menit</span>
        </div>

        <div className="p-2 bg-card rounded-lg border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Barang Terjual</span>
          <span className="text-base font-extrabold text-foreground block mt-0.5">14 Helai</span>
          <span className="text-[10px] text-muted-foreground">100% Terkirim</span>
        </div>

        <div className="p-2 bg-card rounded-lg border border-border/60">
          <span className="text-[10px] text-muted-foreground block">Pembatalan</span>
          <span className="text-base font-extrabold text-accent block mt-0.5">0%</span>
          <span className="text-[10px] text-muted-foreground">Sangat Andal</span>
        </div>
      </div>

      {/* Reviews List */}
      <div className="space-y-3">
        <h4 className="text-xs font-bold text-foreground">
          Testimoni Pembeli Terverifikasi ({reviews.length})
        </h4>

        <div className="space-y-2.5">
          {reviews.map((rev) => (
            <div
              key={rev.id}
              className="p-3.5 bg-muted/40 rounded-xl border border-border/60 space-y-1.5"
            >
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-2">
                  <div className="w-6 h-6 rounded-full gradient-green flex items-center justify-center text-white text-[10px] font-bold">
                    {rev.buyerAvatar}
                  </div>
                  <div>
                    <span className="text-xs font-bold text-foreground">
                      {rev.buyerName}
                    </span>
                    {rev.isVerifiedPurchase && (
                      <span className="text-[10px] text-accent ml-1.5 font-medium">
                        ✓ Pembeli Terverifikasi
                      </span>
                    )}
                  </div>
                </div>

                <div className="flex items-center gap-0.5">
                  {[...Array(5)].map((_, i) => (
                    <Icon
                      key={i}
                      name="StarIcon"
                      size={12}
                      variant={i < rev.rating ? 'solid' : 'outline'}
                      className={i < rev.rating ? 'text-warning fill-warning' : 'text-muted-foreground'}
                    />
                  ))}
                  <span className="text-[10px] text-muted-foreground ml-1">{rev.date}</span>
                </div>
              </div>

              <p className="text-xs text-foreground leading-relaxed">
                "{rev.comment}"
              </p>

              <p className="text-[11px] text-primary/90 font-medium">
                🛍️ Produk: {rev.productName}
              </p>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
