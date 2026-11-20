'use client';

import React, { useEffect, useMemo, useState } from 'react';
import AppLayout from '@/components/AppLayout';
import Icon from '@/components/ui/AppIcon';
import RoleGate from '@/components/roles/RoleGate';
import { rpShort } from '@/components/roles/DashboardParts';
import { fetchData } from '@/lib/supabase/client';
import { toAppRole, type AppRole } from '@/lib/supabase/useMe';
import { ROLE_THEME } from '@/lib/roles';
import type { UsersOverview } from '@/lib/admin-types';

type Filter = 'semua' | AppRole;
const FILTERS: { key: Filter; label: string }[] = [
  { key: 'semua', label: 'Semua' },
  { key: 'customer', label: 'Customer' },
  { key: 'mitra', label: 'Mitra' },
  { key: 'admin', label: 'Admin' },
];

function UsersList() {
  const [data, setData] = useState<UsersOverview | null>(null);
  const [failed, setFailed] = useState(false);
  const [filter, setFilter] = useState<Filter>('semua');
  const [q, setQ] = useState('');

  useEffect(() => {
    const p = new URLSearchParams(window.location.search).get('peran');
    if (p === 'customer' || p === 'mitra' || p === 'admin') setFilter(p);
    fetchData<UsersOverview>('/api/admin/users').then((d) => { setData(d); setFailed(!d); });
  }, []);

  const pick = (f: Filter) => {
    setFilter(f);
    const url = f === 'semua' ? '/admin/pengguna' : `/admin/pengguna?peran=${f}`;
    window.history.replaceState(null, '', url);
  };

  const rows = useMemo(() => {
    const text = q.trim().toLowerCase();
    return (data?.users ?? []).filter((u) =>
      (filter === 'semua' || toAppRole(u.role) === filter) &&
      (!text || u.name.toLowerCase().includes(text) || u.username.toLowerCase().includes(text) || (u.city ?? '').toLowerCase().includes(text)));
  }, [data, filter, q]);

  const count = (f: Filter) =>
    !data ? '' : f === 'semua' ? data.users.length : data.counts[f];

  return (
    <div className="space-y-3 pb-4">
      <label className="relative block">
        <span className="sr-only">Cari pengguna</span>
        <Icon name="MagnifyingGlassIcon" size={18} className="pointer-events-none absolute left-3.5 top-1/2 -translate-y-1/2 text-slate-400" aria-hidden="true" />
        <input
          type="search"
          value={q}
          onChange={(e) => setQ(e.target.value)}
          placeholder="Cari nama, username, atau kota"
          className="h-12 w-full rounded-2xl border border-slate-200 bg-white pl-10 pr-4 text-sm text-slate-900 shadow-card outline-none placeholder:text-slate-400 focus:ring-2 focus:ring-violet-300"
        />
      </label>

      <div role="tablist" aria-label="Filter peran" className="grid grid-cols-4 gap-1.5">
        {FILTERS.map((f) => {
          const on = filter === f.key;
          return (
            <button
              key={f.key}
              role="tab"
              aria-selected={on}
              onClick={() => pick(f.key)}
              className={`flex min-h-[44px] items-center justify-center gap-1 rounded-full px-1.5 text-xs font-semibold transition ${
                on ? 'bg-navy text-white' : 'bg-white text-slate-600 shadow-card hover:text-slate-900'
              }`}
            >
              {f.label}
              <span className={`rounded-full px-1.5 text-[0.625rem] tabular-nums ${on ? 'bg-white/20' : 'bg-slate-100'}`}>{count(f.key)}</span>
            </button>
          );
        })}
      </div>

      {!data && !failed && <div className="h-48 animate-pulse rounded-2xl bg-white/70" aria-busy="true" />}
      {failed && <p role="alert" className="rounded-2xl bg-white p-5 text-center text-sm text-slate-600 shadow-card">Data pengguna gagal dimuat.</p>}

      {data && (
        rows.length === 0 ? (
          <p className="rounded-2xl bg-white p-5 text-center text-xs text-slate-500 shadow-card">Tidak ada pengguna yang cocok.</p>
        ) : (
          <ul className="divide-y divide-slate-100 overflow-hidden rounded-2xl bg-white shadow-card">
            {rows.map((u) => {
              const r = toAppRole(u.role);
              const t = ROLE_THEME[r];
              return (
                <li key={u.id} className="flex items-start gap-3 p-3.5">
                  <span className={`flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-xl text-xl ${t.tile}`} aria-hidden="true">{u.avatar}</span>
                  <div className="min-w-0 flex-1">
                    <p className="flex items-center gap-1 truncate text-sm font-semibold text-slate-900">
                      {u.name}
                      {u.isVerified && <Icon name="CheckBadgeIcon" variant="solid" size={16} className="flex-shrink-0 text-sky-500" aria-label="Terverifikasi" />}
                    </p>
                    <p className="truncate text-[0.6875rem] text-slate-500">@{u.username}{u.city ? ` · ${u.city}` : ''}</p>
                    <div className="mt-1.5 flex flex-wrap items-center gap-1.5">
                      <span className={`rounded-full px-2 py-0.5 text-[0.625rem] font-bold ring-1 ${t.chip}`}>{t.label}</span>
                      {r === 'mitra' && <span className="text-[0.6875rem] text-slate-500">{u.mitraOrders} pesanan masuk · {rpShort(u.mitraRevenue)}</span>}
                      {r === 'customer' && <span className="text-[0.6875rem] text-slate-500">{u.buyerOrders} pesanan</span>}
                      {u.disputes > 0 && <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[0.625rem] font-semibold text-rose-700">{u.disputes} sengketa</span>}
                    </div>
                  </div>
                  {r !== 'admin' && (
                    <div className="flex-shrink-0 text-right">
                      <p className="text-[0.625rem] text-slate-400">Saldo</p>
                      <p className="text-xs font-bold text-slate-800 tabular-nums">{rpShort(u.balance)}</p>
                    </div>
                  )}
                </li>
              );
            })}
          </ul>
        )
      )}
    </div>
  );
}

export default function AdminUsersPage() {
  return (
    <AppLayout title="Kelola Pengguna">
      <RoleGate allow="admin">{() => <UsersList />}</RoleGate>
    </AppLayout>
  );
}
