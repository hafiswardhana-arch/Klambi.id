'use client';
import React, { useState } from 'react';
import Icon from '@/components/ui/AppIcon';
import DiagnosisCard from './DiagnosisCard';
import PermakTab from './PermakTab';
import DirawatTab from './DirawatTab';

type CareTab = 'permak' | 'dirawat';

export default function MenuPerawatanContent() {
  const [activeTab, setActiveTab] = useState<CareTab>('permak');

  return (
    <div className="space-y-4 animate-fade-in">
      {/* Garment Context Banner */}
      <div className="flex items-center gap-3 p-3 bg-secondary rounded-xl border border-accent/30">
        <div className="w-10 h-10 rounded-lg bg-muted border border-border flex items-center justify-center flex-shrink-0">
          <Icon name="ShirtIcon" size={20} className="text-muted-foreground" />
        </div>
        <div className="flex-1 min-w-0">
          <p className="text-sm font-700 text-foreground">Kemeja Lengan Panjang</p>
          <p className="text-xs text-muted-foreground">Skor 67 · Warna pudar & jahitan longgar</p>
        </div>
        <div className="text-right flex-shrink-0">
          <p className="text-xs font-600 text-accent">Skor 67</p>
          <p className="text-[10px] text-muted-foreground">Cukup Baik</p>
        </div>
      </div>

      {/* AI Diagnosis */}
      <DiagnosisCard />

      {/* Tab Switcher */}
      <div className="p-1 bg-muted rounded-xl flex gap-1">
        {([
          { key: 'permak' as CareTab, label: 'Dipermak', icon: 'ScissorsIcon', desc: 'Perbaiki jahitan & bentuk' },
          { key: 'dirawat' as CareTab, label: 'Dirawat', icon: 'SparklesIcon', desc: 'Cuci, recolor & perawatan' },
        ]).map((tab) => (
          <button
            key={`care-tab-${tab.key}`}
            onClick={() => setActiveTab(tab.key)}
            className={`flex-1 flex items-center justify-center gap-2 py-2.5 px-3 rounded-lg text-sm font-600 transition-all duration-200 ${
              activeTab === tab.key
                ? 'tab-active shadow-card'
                : 'tab-inactive hover:bg-secondary/50'
            }`}
            aria-pressed={activeTab === tab.key}
          >
            <Icon
              name={tab.icon as Parameters<typeof Icon>[0]['name']}
              size={16}
              className={activeTab === tab.key ? 'text-white' : 'text-muted-foreground'}
            />
            <span>{tab.label}</span>
          </button>
        ))}
      </div>

      {/* Tab Content */}
      <div className="animate-fade-in" key={`tab-content-${activeTab}`}>
        {activeTab === 'permak' ? <PermakTab /> : <DirawatTab />}
      </div>
    </div>
  );
}