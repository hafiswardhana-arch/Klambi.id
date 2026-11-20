'use client';

import React from 'react';
import Link from 'next/link';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RoleGate from '@/components/roles/RoleGate';
import { rp } from '@/components/roles/DashboardParts';
import type { MeSummary } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';

const theme = ROLE_THEME.mitra;

/** The mitra's own service as customers see it on "Jasa & Perawatan". */
function MyService({ me }: { me: MeSummary }) {
  const svc = me.service;
  if (!svc) {
    return (
      <div className="flex flex-col items-center gap-3 rounded-2xl bg-white p-6 text-center shadow-card">
        <span className={`flex h-12 w-12 items-center justify-center rounded-2xl ${theme.tile}`}>
          <Icon name="WrenchScrewdriverIcon" variant="solid" size={24} aria-hidden="true" />
        </span>
        <p className="text-sm leading-relaxed text-slate-600">Akun mitra ini belum terhubung ke layanan. Hubungi admin Klámbi untuk mendaftarkan layanan laundry, penatu, atau permak milikmu.</p>
        <Link href="/chat" className="flex min-h-[44px] items-center justify-center rounded-xl bg-navy px-5 text-[0.8125rem] font-semibold text-white">Chat Admin</Link>
      </div>
    );
  }

  return (
    <div className="space-y-4 pb-4">
      <section className="space-y-3 rounded-2xl bg-white p-4 shadow-card" aria-label="Profil layanan">
        <div className="flex items-start justify-between gap-3">
          <div className="min-w-0">
            <span className={`inline-flex rounded-full px-2 py-0.5 text-[0.6875rem] font-bold ring-1 ${theme.chip}`}>{svc.categoryLabel}</span>
            <h1 className="mt-1.5 text-base font-bold text-slate-900">{svc.name}</h1>
            <p className="mt-0.5 flex items-start gap-1 text-xs text-slate-500">
              <Icon name="MapPinIcon" size={14} className="mt-0.5 flex-shrink-0" aria-hidden="true" />{svc.address}
            </p>
          </div>
          {svc.badge && <span className="flex-shrink-0 rounded-full bg-amber-50 px-2 py-0.5 text-[0.625rem] font-bold text-amber-800">{svc.badge}</span>}
        </div>
        <div className="grid grid-cols-3 gap-2 text-center">
          <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-sm font-bold text-slate-900">★ {svc.rating.toLocaleString('id-ID')}</p><p className="text-[0.625rem] text-slate-500">{svc.reviewsCount} ulasan</p></div>
          <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-sm font-bold text-slate-900">{rp(svc.estimatedPrice)}</p><p className="text-[0.625rem] text-slate-500">Mulai dari</p></div>
          <div className="rounded-xl bg-slate-50 p-2.5"><p className="text-sm font-bold text-slate-900">{svc.isVerified ? 'Ya' : 'Belum'}</p><p className="text-[0.625rem] text-slate-500">Terverifikasi</p></div>
        </div>
      </section>

      <section className="space-y-2" aria-label="Daftar layanan">
        <h2 className="px-1 text-base font-bold text-slate-800">Layanan yang Ditawarkan</h2>
        <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
          {svc.services.map((name) => (
            <li key={name} className="flex items-center gap-3 p-3.5 text-sm text-slate-800">
              <span className={`flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg ${theme.tile}`}>
                <Icon name="CheckIcon" size={16} aria-hidden="true" />
              </span>
              {name}
            </li>
          ))}
        </ul>
      </section>

      <dl className="space-y-2 rounded-2xl bg-white p-4 text-sm shadow-card">
        <div className="flex justify-between gap-3"><dt className="text-slate-500">Jam buka</dt><dd className="text-right font-medium">{svc.openHours}</dd></div>
        <div className="flex justify-between gap-3"><dt className="text-slate-500">Minimal pesanan</dt><dd className="text-right font-medium">{svc.minOrder}</dd></div>
      </dl>

      <Link href="/menu-perawatan" className="flex min-h-[48px] items-center justify-center gap-2 rounded-2xl border border-slate-200 bg-white text-sm font-semibold text-slate-700 hover:bg-slate-50">
        <Icon name="EyeIcon" size={18} aria-hidden="true" />
        Lihat seperti yang dilihat pelanggan
      </Link>
      <p className="px-1 text-center text-[0.6875rem] text-slate-500">Untuk mengubah harga atau daftar layanan, hubungi admin Klámbi.</p>
    </div>
  );
}

export default function MitraLayananPage() {
  return (
    <AppLayout title="Layanan Saya">
      <RoleGate allow="mitra">{(me) => <MyService me={me} />}</RoleGate>
    </AppLayout>
  );
}
