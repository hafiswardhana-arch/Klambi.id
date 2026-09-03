import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProfileContent from '../profil/components/ProfileContent';

export default function ProfileAliasPage() {
  return (
    <AppLayout title="Profil Saya">
      <div className="max-w-2xl mx-auto">
        <ProfileContent />
      </div>
    </AppLayout>
  );
}
