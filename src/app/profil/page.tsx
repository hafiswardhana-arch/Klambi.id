import React from 'react';
import AppLayout from '@/components/AppLayout';
import ProfileSwitch from './components/ProfileSwitch';

export default function ProfilPage() {
  return (
    <AppLayout title="Profil Saya">
      <div className="max-w-2xl mx-auto">
        <ProfileSwitch />
      </div>
    </AppLayout>
  );
}
