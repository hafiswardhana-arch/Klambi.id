import React from 'react';
import Icon from '@/components/ui/AppIcon';

export type EscrowStatus =
  | 'menunggu_pembayaran' |'dana_ditahan' |'diproses' |'selesai';

interface EscrowTrackerProps {
  status: EscrowStatus;
  className?: string;
}

const steps: { key: EscrowStatus; label: string; icon: string }[] = [
  { key: 'menunggu_pembayaran', label: 'Bayar', icon: 'CreditCardIcon' },
  { key: 'dana_ditahan', label: 'Ditahan', icon: 'LockClosedIcon' },
  { key: 'diproses', label: 'Diproses', icon: 'WrenchScrewdriverIcon' },
  { key: 'selesai', label: 'Selesai', icon: 'CheckCircleIcon' },
];

const statusOrder: Record<EscrowStatus, number> = {
  menunggu_pembayaran: 0,
  dana_ditahan: 1,
  diproses: 2,
  selesai: 3,
};

export default function EscrowTracker({ status, className = '' }: EscrowTrackerProps) {
  const currentIndex = statusOrder[status];

  return (
    <div className={`flex items-center gap-0 ${className}`}>
      {steps.map((step, i) => {
        const isDone = i < currentIndex;
        const isActive = i === currentIndex;
        const isPending = i > currentIndex;
        return (
          <React.Fragment key={`escrow-step-${step.key}`}>
            <div className="flex flex-col items-center gap-1">
              <div
                className={`w-8 h-8 rounded-full flex items-center justify-center transition-all ${
                  isDone
                    ? 'escrow-step-done'
                    : isActive
                    ? 'escrow-step-active animate-pulse-green' :'escrow-step-pending'
                }`}
              >
                <Icon
                  name={isDone ? 'CheckIcon' : (step.icon as Parameters<typeof Icon>[0]['name'])}
                  size={14}
                  variant={isDone || isActive ? 'solid' : 'outline'}
                />
              </div>
              <span
                className={`text-[10px] font-600 whitespace-nowrap ${
                  isDone
                    ? 'text-accent'
                    : isActive
                    ? 'text-primary' :'text-muted-foreground'
                }`}
              >
                {step.label}
              </span>
            </div>
            {i < steps.length - 1 && (
              <div
                className={`h-0.5 flex-1 mx-1 mb-4 rounded-full transition-all ${
                  i < currentIndex ? 'bg-accent' : 'bg-border'
                }`}
              />
            )}
          </React.Fragment>
        );
      })}
    </div>
  );
}