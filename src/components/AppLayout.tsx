import React from 'react';
import BottomNav from './BottomNav';
import TopHeader from './TopHeader';

interface AppLayoutProps {
  children: React.ReactNode;
  title?: string;
  showBack?: boolean;
  backHref?: string;
  headerRight?: React.ReactNode;
  hideBottomNav?: boolean;
}

export default function AppLayout({
  children,
  title,
  showBack = false,
  backHref,
  headerRight,
  hideBottomNav = false,
}: AppLayoutProps) {
  return (
    <div className="min-h-screen flex flex-col bg-background">
      <TopHeader
        title={title}
        showBack={showBack}
        backHref={backHref}
        headerRight={headerRight}
      />
      <main className="flex-1 pb-20 pt-[64px]">
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-4">
          {children}
        </div>
      </main>
      {!hideBottomNav && <BottomNav />}
    </div>
  );
}