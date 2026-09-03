'use client';
import React from 'react';
import Icon from '@/components/ui/AppIcon';

export interface UserProfileData {
  name: string;
  email: string;
  phone: string;
  isEmailVerified: boolean;
  isPhoneVerified: boolean;
  isKtpVerified: boolean;
  avatarText: string;
  avatarUrl?: string;
  bio: string;
  memberTier: string;
  textileSavedKg: number;
  waterSavedLitres: number;
  co2SavedKg: number;
  points: number;
}

interface ProfileHeaderProps {
  profile: UserProfileData;
  onOpenEdit: () => void;
}

export default function ProfileHeader({
  profile,
  onOpenEdit,
}: ProfileHeaderProps) {
  return (
    <div className="bg-card border border-border rounded-2xl p-5 sm:p-6 shadow-sm relative overflow-hidden">
      {/* Decorative Gradient Background */}
      <div className="absolute top-0 right-0 w-56 h-56 bg-gradient-to-br from-primary/10 to-accent/20 rounded-full blur-3xl pointer-events-none -mr-12 -mt-12" />

      {/* Main Profile Info Row */}
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4 relative">
        <div className="flex items-start sm:items-center gap-4">
          {/* Avatar Container */}
          <div className="relative flex-shrink-0">
            <div className="w-18 h-18 sm:w-20 sm:h-20 rounded-2xl gradient-green flex items-center justify-center text-white text-2xl font-bold shadow-md border-2 border-white">
              {profile.avatarText}
            </div>
            <button
              onClick={onOpenEdit}
              className="absolute -bottom-1 -right-1 w-7 h-7 bg-card border border-border rounded-full flex items-center justify-center text-primary hover:bg-secondary transition-all shadow-xs"
              title="Ganti Foto / Edit Profil"
              aria-label="Edit Profil"
            >
              <Icon name="PencilSquareIcon" size={14} />
            </button>
          </div>

          {/* User Names & Verification Badges */}
          <div>
            <div className="flex items-center gap-2 flex-wrap">
              <h2 className="text-lg sm:text-xl font-extrabold text-foreground">
                {profile.name}
              </h2>
              <span className="inline-flex items-center gap-1 px-2.5 py-0.5 rounded-full text-xs font-semibold bg-secondary text-primary border border-accent/30">
                <Icon name="SparklesIcon" size={12} variant="solid" />
                {profile.memberTier}
              </span>
            </div>

            {/* Email & Phone with Verified Badges */}
            <div className="flex flex-col gap-1 mt-1">
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="EnvelopeIcon" size={13} className="text-primary" />
                  {profile.email}
                </span>
                {profile.isEmailVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent bg-secondary px-1.5 py-0.2 rounded-md">
                    <Icon name="CheckBadgeIcon" size={11} variant="solid" />
                    Terverifikasi
                  </span>
                )}
              </div>

              <div className="flex items-center gap-1.5 text-xs text-muted-foreground flex-wrap">
                <span className="flex items-center gap-1">
                  <Icon name="PhoneIcon" size={13} className="text-primary" />
                  {profile.phone}
                </span>
                {profile.isPhoneVerified && (
                  <span className="inline-flex items-center gap-0.5 text-[10px] font-bold text-accent bg-secondary px-1.5 py-0.2 rounded-md">
                    <Icon name="CheckBadgeIcon" size={11} variant="solid" />
                    Terverifikasi
                  </span>
                )}
              </div>
            </div>

            {/* Identity & Trust Mini Badges */}
            <div className="flex items-center gap-2 mt-2 flex-wrap">
              {profile.isKtpVerified && (
                <span className="inline-flex items-center gap-1 text-[11px] font-semibold text-primary bg-secondary/80 px-2 py-0.5 rounded-md border border-accent/30">
                  <Icon name="ShieldCheckIcon" size={13} className="text-primary" />
                  KTP Terverifikasi
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-[11px] font-medium text-muted-foreground bg-muted px-2 py-0.5 rounded-md">
                🌱 Anggota Sejak Jan 2026
              </span>
            </div>
          </div>
        </div>

        {/* Edit Profile CTA */}
        <button
          onClick={onOpenEdit}
          className="btn-secondary text-xs sm:text-sm py-2.5 px-4 flex items-center gap-1.5 w-full sm:w-auto justify-center font-semibold rounded-xl"
        >
          <Icon name="UserIcon" size={16} />
          Edit Profil
        </button>
      </div>

      {/* Gamification & Eco-Impact Banner */}
      <div className="mt-5 pt-4 border-t border-border">
        <div className="p-3 bg-secondary/60 rounded-xl border border-accent/20 flex flex-col sm:flex-row items-start sm:items-center justify-between gap-3">
          <div className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg gradient-green flex items-center justify-center text-white flex-shrink-0">
              <Icon name="GlobeAmericasIcon" size={18} />
            </div>
            <div>
              <p className="text-xs font-bold text-primary">
                Dampak Lingkungan Sirkular Kamu 🌿
              </p>
              <p className="text-[11px] text-muted-foreground">
                Kamu telah menyelamatkan <strong className="text-foreground">{profile.textileSavedKg} kg limbah tekstil</strong> & menghemat <strong className="text-foreground">{profile.waterSavedLitres.toLocaleString('id-ID')} Liter air</strong>!
              </p>
            </div>
          </div>

          <div className="flex items-center gap-3 w-full sm:w-auto justify-end text-xs">
            <div className="text-right">
              <span className="text-[10px] text-muted-foreground block">Klámbi Poin</span>
              <span className="font-extrabold text-primary text-sm">
                {profile.points.toLocaleString('id-ID')} pts
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
