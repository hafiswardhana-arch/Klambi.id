import React from 'react';
import type { Metadata, Viewport } from 'next';
import { Plus_Jakarta_Sans } from 'next/font/google';
import { Toaster } from 'sonner';
import Script from 'next/script';
import '../styles/tailwind.css';

const plusJakartaSans = Plus_Jakarta_Sans({
  subsets: ['latin'],
  weight: ['400', '500', '600', '700', '800'],
  variable: '--font-plus-jakarta-sans',
  display: 'swap',
});

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
};

export const metadata: Metadata = {
  title: 'Klámbi.id — Analisis & Perawatan Pakaian Berbasis AI',
  description: 'Klámbi.id membantu kamu menganalisis kondisi pakaian dengan AI, lalu mengarahkan ke jasa perawatan atau marketplace daur ulang tekstil.',
  icons: {
    icon: [
      { url: '/favicon.png', type: 'image/png' },
      { url: '/assets/images/app_icon.png', type: 'image/png' },
    ],
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id" className={plusJakartaSans.variable}>
      <body className={plusJakartaSans.className}>
        {children}
        <Toaster
          position="bottom-center"
          toastOptions={{
            style: {
              background: 'var(--card)',
              color: 'var(--foreground)',
              border: '1px solid var(--border)',
              borderRadius: '12px',
              fontFamily: 'var(--font-sans)',
              fontSize: '14px',
            },
          }}
        />

        <Script
          strategy="afterInteractive"
          src="https://static.rocket.new/rocket-web.js?_cfg=https%3A%2F%2Fcareloop7626back.builtwithrocket.new&_be=https%3A%2F%2Fappanalytics.rocket.new&_v=0.1.20"
        />
        <Script strategy="afterInteractive" src="https://static.rocket.new/rocket-shot.js?v=0.0.2" />
      </body>
    </html>
  );
}