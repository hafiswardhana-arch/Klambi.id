'use client';

import React from 'react';
import AppLayout from '@/components/AppLayout';
import RoleGate from '@/components/roles/RoleGate';
import IncomingOrders from '@/components/roles/IncomingOrders';

/** Service orders for a mitra (laundry, penatu, permak, …). */
export default function MitraPesananPage() {
  return (
    <AppLayout title="Pesanan Layanan">
      <RoleGate allow="mitra">{(me) => <IncomingOrders me={me} variant="mitra" />}</RoleGate>
    </AppLayout>
  );
}
