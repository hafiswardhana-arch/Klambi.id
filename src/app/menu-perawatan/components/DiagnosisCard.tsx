import React from 'react';
import Icon from '@/components/ui/AppIcon';

const diagnosisItems = [
  {
    id: 'diag-warna',
    problem: 'Warna pudar di area lipatan',
    cause: 'Paparan deterjen berlebih & sering dijemur langsung di bawah sinar matahari',
    severity: 'medium' as const,
    icon: 'EyeDropperIcon',
  },
  {
    id: 'diag-jahitan',
    problem: 'Jahitan kancing mulai longgar',
    cause: 'Regangan berulang saat pemakaian, benang mulai usang',
    severity: 'high' as const,
    icon: 'ScissorsIcon',
  },
  {
    id: 'diag-noda',
    problem: 'Noda kecil di area kerah',
    cause: 'Residu keringat & minyak yang tidak hilang dengan cuci biasa',
    severity: 'low' as const,
    icon: 'ExclamationCircleIcon',
  },
];

const severityConfig = {
  high: { color: 'text-danger', bg: 'bg-danger-bg', border: 'border-danger/30', label: 'Prioritas' },
  medium: { color: 'text-warning', bg: 'bg-warning-bg', border: 'border-warning/30', label: 'Perhatian' },
  low: { color: 'text-info', bg: 'bg-info-bg', border: 'border-info/30', label: 'Ringan' },
};

export default function DiagnosisCard() {
  return (
    <div className="card-elevated p-4 space-y-3">
      <div className="flex items-center gap-2">
        <div className="w-7 h-7 rounded-lg bg-warning/20 flex items-center justify-center">
          <Icon name="MagnifyingGlassIcon" size={15} variant="solid" className="text-warning" />
        </div>
        <div>
          <p className="text-sm font-700 text-foreground">Diagnosis AI</p>
          <p className="text-[11px] text-muted-foreground">3 masalah terdeteksi</p>
        </div>
      </div>

      <div className="space-y-2">
        {diagnosisItems.map((item) => {
          const cfg = severityConfig[item.severity];
          return (
            <div
              key={item.id}
              className={`flex items-start gap-3 p-3 rounded-xl ${cfg.bg} border ${cfg.border}`}
            >
              <Icon
                name={item.icon as Parameters<typeof Icon>[0]['name']}
                size={16}
                className={`${cfg.color} flex-shrink-0 mt-0.5`}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center gap-2 flex-wrap">
                  <p className="text-xs font-700 text-foreground">{item.problem}</p>
                  <span className={`text-[10px] font-600 ${cfg.color} bg-white/50 px-1.5 py-0.5 rounded-full`}>
                    {cfg.label}
                  </span>
                </div>
                <p className="text-[11px] text-muted-foreground mt-0.5 leading-relaxed">{item.cause}</p>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}