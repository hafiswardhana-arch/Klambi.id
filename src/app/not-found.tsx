'use client';

import React from 'react';
import { useRouter } from 'next/navigation';
import Icon from '@/components/ui/AppIcon';
import { FadeIn, ScaleIn } from '@/components/motion';

export default function NotFound() {
    const router = useRouter();

    const handleGoHome = () => {
        router?.push('/');
    };

    const handleGoBack = () => {
        if (typeof window !== 'undefined') {
            window.history?.back();
        }
    };

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background p-4 select-none">
            <FadeIn className="text-center max-w-md">
                <div className="flex justify-center mb-6">
                    <ScaleIn className="relative">
                        <h1 className="text-9xl font-black text-primary opacity-20">404</h1>
                    </ScaleIn>
                </div>

                <h2 className="text-2xl font-bold text-foreground mb-2">Halaman Tidak Ditemukan</h2>
                <p className="text-muted-foreground mb-8 text-sm">
                  Halaman yang Anda cari tidak ditemukan. Mari kembali ke beranda!
                </p>

                <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <button
                        onClick={handleGoBack}
                        className="inline-flex items-center justify-center gap-2 bg-primary text-primary-foreground px-6 py-3 rounded-2xl font-bold hover:bg-primary/90 active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="ArrowLeftIcon" size={16} />
                        Go Back
                    </button>

                    <button
                        onClick={handleGoHome}
                        className="inline-flex items-center justify-center gap-2 border border-border bg-card text-foreground px-6 py-3 rounded-2xl font-bold hover:bg-muted active:scale-95 transition-all shadow-sm"
                    >
                        <Icon name="HomeIcon" size={16} />
                        Back to Home
                    </button>
                </div>
            </FadeIn>
        </div>
    );
}