'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import RoleGate from '@/components/roles/RoleGate';
import IncomingOrders from '@/components/roles/IncomingOrders';

/** Customer's selling side: items they sold, money held by admin until the buyer receives them. */
export default function PenjualanPage() {
  return (
    <AppLayout title="Penjualan Saya" showBack backHref="/profil">
      <RoleGate allow="customer">{(me) => <IncomingOrders me={me} variant="customer" />}</RoleGate>
    </AppLayout>
  );
}
