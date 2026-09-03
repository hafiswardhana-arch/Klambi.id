'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { SavedAddress } from './AddressesSection';

interface AddressModalProps {
  addressToEdit?: SavedAddress | null;
  onClose: () => void;
  onSave: (address: SavedAddress) => void;
}

export default function AddressModal({
  addressToEdit,
  onClose,
  onSave,
}: AddressModalProps) {
  const [label, setLabel] = useState(addressToEdit?.label || 'Rumah');
  const [recipientName, setRecipientName] = useState(addressToEdit?.recipientName || 'Raditya Ardhani');
  const [phone, setPhone] = useState(addressToEdit?.phone || '+62 812-3456-7890');
  const [fullAddress, setFullAddress] = useState(addressToEdit?.fullAddress || '');
  const [city, setCity] = useState(addressToEdit?.city || 'Jakarta Selatan');
  const [postalCode, setPostalCode] = useState(addressToEdit?.postalCode || '12190');
  const [notes, setNotes] = useState(addressToEdit?.notes || '');
  const [isDefault, setIsDefault] = useState(addressToEdit?.isDefault || false);

  const presetLabels = ['Rumah', 'Kantor', 'Apartemen', 'Kost', 'Workshop'];

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullAddress.trim()) return;

    const newAddress: SavedAddress = {
      id: addressToEdit?.id || `addr-${Date.now()}`,
      label,
      recipientName,
      phone,
      fullAddress,
      city,
      postalCode,
      notes,
      isDefault: addressToEdit?.isDefault || isDefault,
    };

    onSave(newAddress);
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-3.5 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="MapPinIcon" size={18} />
            </div>
            <h3 className="text-base font-bold text-foreground">
              {addressToEdit ? 'Edit Alamat Penjemputan' : 'Tambah Alamat Baru'}
            </h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Tutup"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="mt-4 space-y-3">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1.5">
              Label Alamat
            </label>
            <div className="flex gap-1.5 flex-wrap">
              {presetLabels.map((p) => (
                <button
                  type="button"
                  key={p}
                  onClick={() => setLabel(p)}
                  className={`text-xs px-3 py-1 rounded-lg font-semibold border transition-all ${
                    label === p
                      ? 'bg-primary text-white border-primary'
                      : 'bg-input text-foreground border-border hover:border-accent'
                  }`}
                >
                  {p}
                </button>
              ))}
            </div>
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nama Penerima/Pengirim
              </label>
              <input
                type="text"
                value={recipientName}
                onChange={(e) => setRecipientName(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Nomor Telepon
              </label>
              <input
                type="tel"
                value={phone}
                onChange={(e) => setPhone(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Alamat Lengkap (Nama Jalan, No. Rumah, RT/RW, Kelurahan, Kecamatan)
            </label>
            <textarea
              rows={3}
              value={fullAddress}
              onChange={(e) => setFullAddress(e.target.value)}
              placeholder="Contoh: Jl. Senopati No. 42, RT 02 / RW 03, Selong..."
              required
              className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

          <div className="grid grid-cols-2 gap-2.5">
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kota / Kabupaten
              </label>
              <input
                type="text"
                value={city}
                onChange={(e) => setCity(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
            <div>
              <label className="block text-xs font-semibold text-foreground mb-1">
                Kode Pos
              </label>
              <input
                type="text"
                value={postalCode}
                onChange={(e) => setPostalCode(e.target.value)}
                required
                className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
              />
            </div>
          </div>

          <div>
            <label className="block text-xs font-semibold text-foreground mb-1">
              Catatan Patokan untuk Kurir Pick-up (Opsional)
            </label>
            <input
              type="text"
              value={notes}
              onChange={(e) => setNotes(e.target.value)}
              placeholder="Contoh: Pagar hitam samping minimarket, titip di satpam"
              className="w-full bg-input border border-border rounded-xl px-3 py-2 text-xs text-foreground focus:ring-2 focus:ring-ring"
            />
          </div>

          {!addressToEdit?.isDefault && (
            <label className="flex items-center gap-2 cursor-pointer pt-1">
              <input
                type="checkbox"
                checked={isDefault}
                onChange={(e) => setIsDefault(e.target.checked)}
                className="rounded border-border text-primary focus:ring-primary w-4 h-4"
              />
              <span className="text-xs text-foreground font-medium">
                Jadikan alamat utama untuk pick-up pakaian
              </span>
            </label>
          )}

          <div className="pt-2 flex gap-2">
            <button
              type="button"
              onClick={onClose}
              className="btn-secondary flex-1 py-2.5 text-xs font-semibold"
            >
              Batal
            </button>
            <button
              type="submit"
              className="btn-primary flex-1 py-2.5 text-xs font-semibold"
            >
              Simpan Alamat
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
