'use client';

import React from 'react';
import Link from 'next/link';
import Icon from '@/components/ui/AppIcon';
import { STATUS_LABEL, STATUS_TONE, type OrderStatus } from '@/components/escrow/FundFlow';

/** Number tile for role dashboards. Becomes a link when `href` is given. */
export function StatTile({
  icon, label, value, hint, tone, href,
}: { icon: string; label: string; value: React.ReactNode; hint?: string; tone: string; href?: string }) {
  const body = (
    <>
      <span className={`flex h-9 w-9 items-center justify-center rounded-xl ${tone}`}>
        <Icon name={icon} variant="solid" size={18} aria-hidden="true" />
      </span>
      <span className="mt-2 block text-lg font-extrabold leading-tight text-slate-900 tabular-nums">{value}</span>
      <span className="block text-xs font-medium text-slate-600">{label}</span>
      {hint && <span className="mt-0.5 block text-[0.6875rem] text-slate-400">{hint}</span>}
    </>
  );
  const cls = 'block rounded-2xl bg-white p-3.5 shadow-card';
  return href ? (
    <Link href={href} className={`${cls} transition hover:shadow-card-hover active:scale-[0.98] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy`}>{body}</Link>
  ) : (
    <div className={cls}>{body}</div>
  );
}

/** Square shortcut button (icon + label). */
export function QuickAction({ href, icon, label, tone }: { href: string; icon: string; label: string; tone: string }) {
  return (
    <Link
      href={href}
      className="flex min-h-[76px] flex-col items-center justify-center gap-1.5 rounded-2xl bg-white p-2 text-center shadow-card transition active:scale-95 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-navy"
    >
      <span className={`flex h-10 w-10 items-center justify-center rounded-xl ${tone}`}>
        <Icon name={icon} variant="solid" size={20} aria-hidden="true" />
      </span>
      <span className="text-[0.6875rem] font-semibold leading-tight text-slate-700">{label}</span>
    </Link>
  );
}

export function SectionTitle({ children, action }: { children: React.ReactNode; action?: { href: string; label: string } }) {
  return (
    <div className="flex items-center justify-between px-1">
      <h2 className="text-base font-bold text-slate-800">{children}</h2>
      {action && (
        <Link href={action.href} className="flex min-h-[44px] items-center gap-0.5 text-xs font-medium text-emerald-600 hover:text-emerald-700">
          {action.label}
          <Icon name="ChevronRightIcon" size={14} aria-hidden="true" />
        </Link>
      )}
    </div>
  );
}

/** Attention banner ("3 pesanan perlu dikirim"). */
export function ActionBanner({ href, icon, title, text, tone }: { href: string; icon: string; title: string; text: string; tone: 'amber' | 'rose' }) {
  const t = tone === 'rose'
    ? 'border-rose-200 bg-rose-50 text-rose-900 [&_.ic]:bg-rose-100 [&_.ic]:text-rose-700'
    : 'border-amber-200 bg-amber-50 text-amber-900 [&_.ic]:bg-amber-100 [&_.ic]:text-amber-700';
  return (
    <Link href={href} className={`flex min-h-[64px] items-center gap-3 rounded-2xl border p-3.5 transition active:scale-[0.99] ${t}`}>
      <span className="ic flex h-10 w-10 flex-shrink-0 items-center justify-center rounded-xl">
        <Icon name={icon} variant="solid" size={20} aria-hidden="true" />
      </span>
      <span className="min-w-0 flex-1">
        <span className="block text-sm font-bold">{title}</span>
        <span className="block text-xs opacity-80">{text}</span>
      </span>
      <Icon name="ChevronRightIcon" size={18} aria-hidden="true" />
    </Link>
  );
}

export const rp = (n: number) => `Rp ${Math.round(Number(n)).toLocaleString('id-ID')}`;
/** Compact rupiah for tight tiles: Rp 1,2 jt / Rp 450 rb. */
export const rpShort = (n: number) =>
  n >= 1_000_000 ? `Rp ${(n / 1_000_000).toLocaleString('id-ID', { maximumFractionDigits: 1 })} jt`
    : n >= 1_000 ? `Rp ${Math.round(n / 1_000).toLocaleString('id-ID')} rb` : rp(n);

/** One compact order row: title, who, status pill, amount. */
export function OrderRow({ title, sub, status, amount, href }: { title: string; sub: string; status: OrderStatus; amount: number; href?: string }) {
  const inner = (
    <>
      <div className="min-w-0 flex-1">
        <p className="truncate text-[0.8125rem] font-semibold text-slate-900">{title}</p>
        <p className="truncate text-[0.6875rem] text-slate-500">{sub}</p>
        <span className={`mt-1 inline-block rounded-full border px-2 py-0.5 text-[0.625rem] font-semibold ${STATUS_TONE[status]}`}>{STATUS_LABEL[status]}</span>
      </div>
      <p className="flex-shrink-0 text-[0.8125rem] font-bold text-slate-800 tabular-nums">{rp(amount)}</p>
    </>
  );
  const cls = 'flex items-center justify-between gap-3 p-3';
  return href ? <Link href={href} className={`${cls} hover:bg-slate-50`}>{inner}</Link> : <div className={cls}>{inner}</div>;
}
