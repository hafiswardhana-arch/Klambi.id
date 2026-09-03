'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface SavedAddress {
  id: string;
  label: string;
  recipientName: string;
  phone: string;
  fullAddress: string;
  city: string;
  postalCode: string;
  notes?: string;
  isDefault: boolean;
}

interface AddressesSectionProps {
  addresses: SavedAddress[];
  onOpenAddAddress: () => void;
  onEditAddress: (address: SavedAddress) => void;
  onDeleteAddress: (addressId: string) => void;
  onSetDefaultAddress: (addressId: string) => void;
}

export default function AddressesSection({
  addresses,
  onOpenAddAddress,
  onEditAddress,
  onDeleteAddress,
  onSetDefaultAddress,
}: AddressesSectionProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 shadow-sm space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
            <Icon name="MapPinIcon" size={18} />
          </div>
          <div>
            <h3 className="text-sm font-bold text-foreground">Daftar Alamat Penjemputan & Pengantaran</h3>
            <p className="text-[11px] text-muted-foreground">Dipakai kurir untuk pick-up pakaian permak & laundry</p>
          </div>
        </div>

        <button
          onClick={onOpenAddAddress}
          className="btn-secondary py-1.5 px-3 text-xs font-semibold flex items-center gap-1.5 rounded-xl"
        >
          <Icon name="PlusIcon" size={14} />
          Tambah Alamat
        </button>
      </div>

      <div className="space-y-3">
        {addresses.map((addr) => (
          <div
            key={addr.id}
            className={`border rounded-xl p-4 transition-all ${
              addr.isDefault
                ? 'border-primary bg-secondary/30'
                : 'border-border bg-card hover:border-accent'
            }`}
          >
            <div className="flex flex-col sm:flex-row sm:items-start justify-between gap-2">
              <div className="min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <span className="text-xs font-bold text-foreground">
                    {addr.label}
                  </span>
                  {addr.isDefault && (
                    <span className="text-[10px] font-extrabold text-primary bg-secondary px-2 py-0.5 rounded-md border border-accent/40">
                      Alamat Utama (Pick-up)
                    </span>
                  )}
                </div>
                <h4 className="text-xs font-semibold text-foreground mt-1">
                  {addr.recipientName} ({addr.phone})
                </h4>
                <p className="text-xs text-muted-foreground mt-0.5 leading-relaxed">
                  {addr.fullAddress}, {addr.city} {addr.postalCode}
                </p>
                {addr.notes && (
                  <p className="text-[11px] text-primary/80 font-medium mt-1">
                    Patokan: {addr.notes}
                  </p>
                )}
              </div>

              <div className="flex items-center gap-2 pt-2 sm:pt-0 border-t sm:border-t-0 border-border/60">
                {!addr.isDefault && (
                  <button
                    onClick={() => onSetDefaultAddress(addr.id)}
                    className="text-xs text-muted-foreground hover:text-primary font-medium hover:underline"
                  >
                    Jadikan Utama
                  </button>
                )}
                <button
                  onClick={() => onEditAddress(addr)}
                  className="p-1.5 rounded-lg bg-muted hover:bg-secondary text-foreground hover:text-primary transition-colors"
                  title="Edit Alamat"
                  aria-label="Edit Alamat"
                >
                  <Icon name="PencilSquareIcon" size={15} />
                </button>
                {addresses.length > 1 && !addr.isDefault && (
                  <button
                    onClick={() => onDeleteAddress(addr.id)}
                    className="p-1.5 rounded-lg bg-muted hover:bg-danger-bg text-muted-foreground hover:text-danger transition-colors"
                    title="Hapus Alamat"
                    aria-label="Hapus Alamat"
                  >
                    <Icon name="TrashIcon" size={15} />
                  </button>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
