'use client';

import React from 'react';
import Icon from '@/components/ui/AppIcon';

export type OrderStatus =
  | 'pending_payment'
  | 'escrow_held'
  | 'shipped'
  | 'delivered'
  | 'completed'
  | 'disputed'
  | 'refunded'
  | 'cancelled';

export const STATUS_LABEL: Record<OrderStatus, string> = {
  pending_payment: 'Menunggu Pembayaran',
  escrow_held: 'Dana Ditahan Admin',
  shipped: 'Sedang Diproses / Dikirim',
  delivered: 'Tiba · Menunggu Konfirmasi',
  completed: 'Selesai · Dana Dicairkan',
  disputed: 'Sengketa · Ditinjau Admin',
  refunded: 'Dana Dikembalikan',
  cancelled: 'Dibatalkan',
};

export const STATUS_TONE: Record<OrderStatus, string> = {
  pending_payment: 'bg-amber-50 text-amber-800 border-amber-200',
  escrow_held: 'bg-blue-50 text-blue-800 border-blue-200',
  shipped: 'bg-blue-50 text-blue-800 border-blue-200',
  delivered: 'bg-emerald-50 text-emerald-800 border-emerald-200',
  completed: 'bg-emerald-100 text-emerald-900 border-emerald-300',
  disputed: 'bg-rose-50 text-rose-800 border-rose-200',
  refunded: 'bg-slate-100 text-slate-700 border-slate-200',
  cancelled: 'bg-slate-100 text-slate-500 border-slate-200',
};

/** 0 = at customer, 1 = held by Klámbi (admin), 2 = released to mitra */
export function moneyLocation(status: OrderStatus): 0 | 1 | 2 {
  if (status === 'completed') return 2;
  if (status === 'escrow_held' || status === 'shipped' || status === 'delivered' || status === 'disputed') return 1;
  return 0;
}

const NODES = [
  { label: 'Customer', sub: 'Pembayar', icon: 'UserIcon' },
  { label: 'Klámbi', sub: 'Penahan dana', icon: 'ShieldCheckIcon' },
  { label: 'Mitra', sub: 'Penerima', icon: 'BuildingStorefrontIcon' },
];

interface FundFlowProps {
  /** Order status → highlights where the money currently is. Omit for the static explainer. */
  status?: OrderStatus;
  className?: string;
  /** Neutral wording for mitra/admin screens (default wording speaks to the customer). */
  neutral?: boolean;
}

/**
 * Customer ──▶ Klámbi (admin holds) ──▶ Mitra
 * Shows where the money is right now, or (without `status`) explains the rule.
 */
export default function FundFlow({ status, className = '', neutral = false }: FundFlowProps) {
  const loc = status ? moneyLocation(status) : null;
  const back = status === 'refunded' || status === 'cancelled';

  return (
    <div className={className}>
      <ol className="flex items-start" aria-label="Alur dana: customer, Klámbi admin, mitra">
        {NODES.map((n, i) => {
          const hasMoney = loc === i && !back ? true : back && i === 0;
          const passed = loc !== null && loc > i;
          return (
            <React.Fragment key={n.label}>
              <li className="flex w-[4.5rem] flex-shrink-0 flex-col items-center text-center">
                <span
                  className={`relative flex h-11 w-11 items-center justify-center rounded-full border-2 transition-colors duration-300 ${
                    hasMoney
                      ? 'border-brand-yellow bg-navy text-white shadow-[0_0_0_4px_rgba(255,230,0,0.35)]'
                      : passed
                      ? 'border-success-green bg-success-green/10 text-success-green'
                      : 'border-slate-200 bg-white text-slate-400'
                  }`}
                >
                  <Icon name={n.icon} variant={hasMoney ? 'solid' : 'outline'} size={20} aria-hidden="true" />
                </span>
                <span className={`mt-1 text-[0.6875rem] font-semibold leading-tight ${hasMoney ? 'text-navy' : 'text-slate-600'}`}>
                  {n.label}
                </span>
                <span className="text-[0.625rem] leading-tight text-slate-500">{n.sub}</span>
                {hasMoney && (
                  <span className="mt-1 whitespace-nowrap rounded-full bg-brand-yellow px-1.5 py-0.5 text-[0.625rem] font-bold text-navy-deep">
                    Dana di sini
                  </span>
                )}
              </li>
              {i < NODES.length - 1 && (
                <li aria-hidden="true" className="mt-[1.3rem] h-0.5 flex-1 rounded-full bg-slate-200">
                  <span
                    className={`block h-full rounded-full transition-all duration-500 ${
                      loc !== null && loc > i ? 'w-full bg-success-green' : 'w-0'
                    }`}
                  />
                </li>
              )}
            </React.Fragment>
          );
        })}
      </ol>
      {status === undefined ? (
        <p className="mt-2 text-center text-[0.6875rem] leading-relaxed text-slate-600">
          {neutral
            ? <>Dana customer <b>ditahan admin Klámbi</b> dulu. Baru dicairkan ke mitra setelah customer menerima barang dan tidak ada masalah.</>
            : <>Uangmu <b>ditahan admin Klámbi</b> dulu. Baru dicairkan ke mitra setelah kamu menerima barang dan tidak ada masalah.</>}
        </p>
      ) : back ? (
        <p className="mt-2 text-center text-[0.6875rem] text-slate-600">
          {status === 'refunded' ? 'Dana dikembalikan penuh ke Saldo Klámbi customer.' : 'Pesanan dibatalkan sebelum pembayaran.'}
        </p>
      ) : null}
    </div>
  );
}
