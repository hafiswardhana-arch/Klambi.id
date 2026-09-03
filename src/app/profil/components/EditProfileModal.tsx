'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import { UserProfileData } from './ProfileHeader';

interface EditProfileModalProps {
  profile: UserProfileData;
  onClose: () => void;
  onSave: (updated: Partial<UserProfileData>) => void;
}

export default function EditProfileModal({
  profile,
  onClose,
  onSave,
}: EditProfileModalProps) {
  const [name, setName] = useState(profile.name);
  const [email, setEmail] = useState(profile.email);
  const [phone, setPhone] = useState(profile.phone);
  const [bio, setBio] = useState(profile.bio || '');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    const initials = name
      .split(' ')
      .filter(Boolean)
      .slice(0, 2)
      .map((w) => w[0].toUpperCase())
      .join('');

    onSave({
      name,
      email,
      phone,
      bio,
      avatarText: initials || 'RA',
    });
  };

  return (
    <div className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm flex items-center justify-center p-4">
      <div className="bg-card border border-border rounded-2xl max-w-md w-full p-6 shadow-xl animate-scale-in max-h-[90vh] overflow-y-auto">
        <div className="flex items-center justify-between pb-4 border-b border-border">
          <div className="flex items-center gap-2">
            <div className="w-8 h-8 rounded-xl bg-secondary flex items-center justify-center text-primary">
              <Icon name="PencilSquareIcon" size={18} />
            </div>
            <h3 className="text-base font-bold text-foreground">Edit Profil Pengguna</h3>
          </div>
          <button
            onClick={onClose}
            className="w-8 h-8 rounded-full bg-muted flex items-center justify-center text-muted-foreground hover:text-foreground"
            aria-label="Tutup"
          >
            <Icon name="XMarkIcon" size={18} />
          </button>
        </div>

        {/* Avatar change preview */}
        <div className="flex items-center justify-center my-4">
          <div className="relative group cursor-pointer">
            <div className="w-20 h-20 rounded-2xl gradient-green flex items-center justify-center text-white text-2xl font-bold border-2 border-white shadow-md">
              {profile.avatarText}
            </div>
            <div className="absolute inset-0 bg-black/40 rounded-2xl flex flex-col items-center justify-center text-white text-[10px] font-bold opacity-90 group-hover:opacity-100 transition-opacity">
              <Icon name="CameraIcon" size={20} className="mb-0.5" />
              Ganti Foto
            </div>
          </div>
        </div>

        <form onSubmit={handleSubmit} className="space-y-3.5">
          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Nama Lengkap
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Alamat Email (Akun)
            </label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Nomor WhatsApp / Telepon
            </label>
            <input
              type="tel"
              value={phone}
              onChange={(e) => setPhone(e.target.value)}
              required
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground focus:outline-none focus:ring-2 focus:ring-ring"
            />
          </div>

          <div>
            <label className="block text-xs font-bold text-foreground mb-1">
              Bio Singkat / Minat Fashion Sirkular
            </label>
            <textarea
              rows={2}
              value={bio}
              onChange={(e) => setBio(e.target.value)}
              placeholder="Contoh: Pecinta pakaian vintage, denim enthusiast & penggiat fashion berkelanjutan..."
              className="w-full bg-input border border-border rounded-xl px-3.5 py-2.5 text-xs text-foreground placeholder:text-muted-foreground focus:outline-none focus:ring-2 focus:ring-ring resize-none"
            />
          </div>

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
              Simpan Perubahan
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
