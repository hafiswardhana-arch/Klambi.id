'use client';
import React from 'react';
import AppImage from '@/components/ui/AppImage';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';
import { TriftListing } from '../data/triftListings';

interface TriftListingGridProps {
  listings: TriftListing[];
  onSelectListing: (listing: TriftListing) => void;
}

function getScoreBadgeVariant(score: number): 'excellent' | 'good' | 'fair' | 'poor' {
  if (score >= 80) return 'excellent';
  if (score >= 60) return 'good';
  if (score >= 40) return 'fair';
  return 'poor';
}

function getScoreBarColor(score: number): string {
  if (score >= 80) return 'bg-primary';
  if (score >= 60) return 'bg-accent';
  if (score >= 40) return 'bg-warning';
  return 'bg-danger';
}

export default function TriftListingGrid({ listings, onSelectListing }: TriftListingGridProps) {
  if (listings.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center py-20 gap-4">
        <div className="w-16 h-16 rounded-2xl bg-muted flex items-center justify-center">
          <Icon name="ShoppingBagIcon" size={32} className="text-muted-foreground/40" />
        </div>
        <div className="text-center">
          <p className="text-sm font-700 text-foreground">Tidak ada listing ditemukan</p>
          <p className="text-xs text-muted-foreground mt-1">
            Coba ubah filter atau kata kunci pencarianmu
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 lg:grid-cols-4 xl:grid-cols-5 2xl:grid-cols-6 gap-3">
      {listings.map((listing) => (
        <button
          key={`listing-${listing.id}`}
          onClick={() => onSelectListing(listing)}
          className="listing-card text-left group"
          aria-label={`Lihat detail ${listing.title}`}
        >
          {/* Image */}
          <div className="relative w-full aspect-[3/4] bg-muted overflow-hidden">
            <AppImage
              src={listing.imageUrl}
              alt={listing.imageAlt}
              fill
              className="object-cover transition-transform duration-300 group-hover:scale-105"
              sizes="(max-width: 640px) 50vw, (max-width: 768px) 33vw, (max-width: 1024px) 25vw, 20vw"
            />

            {/* AI Score Badge */}
            <div className="absolute top-2 left-2">
              <div className={`flex items-center gap-1 px-1.5 py-0.5 rounded-full text-[10px] font-700 ${
                listing.aiScore >= 80 ? 'bg-primary text-white' :
                listing.aiScore >= 60 ? 'bg-accent text-white' :
                listing.aiScore >= 40 ? 'bg-warning text-white' : 'bg-danger text-white'
              }`}>
                <Icon name="SparklesIcon" size={9} variant="solid" className="text-white" />
                {listing.aiScore}
              </div>
            </div>

            {/* Verified Badge */}
            {listing.isVerified && (
              <div className="absolute top-2 right-2">
                <div className="w-5 h-5 bg-accent rounded-full flex items-center justify-center">
                  <Icon name="CheckIcon" size={11} variant="solid" className="text-white" />
                </div>
              </div>
            )}

            {/* Quick Buy Overlay */}
            <div className="absolute inset-x-0 bottom-0 p-2 opacity-0 group-hover:opacity-100 transition-opacity duration-200">
              <div className="bg-primary text-white text-xs font-600 py-1.5 rounded-lg text-center">
                Lihat Detail
              </div>
            </div>
          </div>

          {/* Info */}
          <div className="p-2.5 space-y-1.5">
            <p className="text-xs font-700 text-foreground leading-tight line-clamp-2">{listing.title}</p>

            <div className="flex items-center gap-1">
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{listing.brand}</span>
              <span className="text-[10px] text-muted-foreground bg-muted px-1.5 py-0.5 rounded-full">{listing.size}</span>
            </div>

            {/* Score bar */}
            <div className="flex items-center gap-1.5">
              <div className="flex-1 h-1 bg-muted rounded-full overflow-hidden">
                <div
                  className={`h-full rounded-full ${getScoreBarColor(listing.aiScore)}`}
                  style={{ width: `${listing.aiScore}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-tabular">{listing.aiScore}</span>
            </div>

            <div className="flex items-end justify-between gap-1">
              <div>
                <p className="text-sm font-800 text-primary font-tabular leading-none">
                  Rp {(listing.price / 1000).toFixed(0)}rb
                </p>
                <p className="text-[10px] text-muted-foreground line-through font-tabular">
                  Rp {(listing.originalPrice / 1000).toFixed(0)}rb
                </p>
              </div>
              <div className="flex items-center gap-0.5">
                <Icon name="MapPinIcon" size={10} className="text-muted-foreground" />
                <span className="text-[10px] text-muted-foreground">{listing.seller.location}</span>
              </div>
            </div>
          </div>
        </button>
      ))}
    </div>
  );
}