'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';
import Badge from '@/components/ui/Badge';

export interface Provider {
  id: string;
  name: string;
  type: 'tailor' | 'binatu' | 'recolor';
  rating: number;
  reviewCount: number;
  distance: string;
  priceRange: string;
  services: string[];
  availability: 'available' | 'full';
  turnaround: string;
  avatar: string;
  location: string;
  matchScore: number;
}

interface ProviderCardProps {
  provider: Provider;
  onSelect: (provider: Provider) => void;
  selected?: boolean;
}

export default function ProviderCard({ provider, onSelect, selected = false }: ProviderCardProps) {
  return (
    <button
      onClick={() => onSelect(provider)}
      className={`provider-card w-full text-left p-4 transition-all duration-200 ${
        selected ? 'border-primary bg-secondary/30 shadow-provider' : ''
      }`}
      aria-pressed={selected}
      aria-label={`Pilih ${provider.name}`}
    >
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="w-12 h-12 rounded-xl overflow-hidden flex-shrink-0 bg-secondary flex items-center justify-center border border-border">
          <span className="text-lg font-800 text-primary">
            {provider.avatar}
          </span>
        </div>

        {/* Info */}
        <div className="flex-1 min-w-0">
          <div className="flex items-start justify-between gap-2">
            <div className="min-w-0">
              <p className="text-sm font-700 text-foreground truncate">{provider.name}</p>
              <p className="text-xs text-muted-foreground truncate">{provider.location}</p>
            </div>
            <Badge variant={provider.availability === 'available' ? 'available' : 'full'} size="sm">
              {provider.availability === 'available' ? 'Tersedia' : 'Penuh'}
            </Badge>
          </div>

          {/* Rating + Distance */}
          <div className="flex items-center gap-3 mt-1.5">
            <div className="flex items-center gap-1">
              <Icon name="StarIcon" size={12} variant="solid" className="text-warning" />
              <span className="text-xs font-600 text-foreground font-tabular">{provider.rating}</span>
              <span className="text-xs text-muted-foreground">({provider.reviewCount})</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="MapPinIcon" size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{provider.distance}</span>
            </div>
            <div className="flex items-center gap-1">
              <Icon name="ClockIcon" size={12} className="text-muted-foreground" />
              <span className="text-xs text-muted-foreground">{provider.turnaround}</span>
            </div>
          </div>

          {/* Services */}
          <div className="flex flex-wrap gap-1 mt-2">
            {provider.services.slice(0, 3).map((svc) => (
              <span
                key={`svc-${provider.id}-${svc}`}
                className="text-[10px] font-500 bg-muted text-muted-foreground px-2 py-0.5 rounded-full border border-border"
              >
                {svc}
              </span>
            ))}
          </div>

          {/* Price + Match */}
          <div className="flex items-center justify-between mt-2">
            <span className="text-sm font-700 text-primary font-tabular">{provider.priceRange}</span>
            <div className="flex items-center gap-1">
              <div className="w-16 h-1.5 bg-muted rounded-full overflow-hidden">
                <div
                  className="h-full bg-accent rounded-full"
                  style={{ width: `${provider.matchScore}%` }}
                />
              </div>
              <span className="text-[10px] text-muted-foreground font-600">{provider.matchScore}% cocok</span>
            </div>
          </div>
        </div>
      </div>

      {selected && (
        <div className="mt-3 pt-3 border-t border-border flex items-center justify-center gap-2 text-primary">
          <Icon name="CheckCircleIcon" size={16} variant="solid" />
          <span className="text-xs font-600">Dipilih</span>
        </div>
      )}
    </button>
  );
}