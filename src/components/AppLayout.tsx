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
  /** Skip the shared top header (the page renders its own). */
  hideTopHeader?: boolean;
  /** Overrides the page background classes. */
  className?: string;
  /** Dims the bottom nav bar. */
  mutedNav?: boolean;
}

export default function AppLayout({
  children,
  title,
  showBack = false,
  backHref,
  headerRight,
  hideBottomNav = false,
  hideTopHeader = false,
  className = 'bg-background',
  mutedNav = false,
}: AppLayoutProps) {
  return (
    <div className={`min-h-screen flex flex-col ${className}`}>
      {!hideTopHeader && (
        <TopHeader
          title={title}
          showBack={showBack}
          backHref={backHref}
          headerRight={headerRight}
        />
      )}
      <main className={`flex-1 pb-24 animate-fade-in ${hideTopHeader ? 'pt-0' : 'pt-16'}`}>
        <div className="max-w-screen-2xl mx-auto w-full px-4 sm:px-6 lg:px-8 xl:px-10 2xl:px-16 py-4">
          {children}
        </div>
      </main>
      {!hideBottomNav && <BottomNav muted={mutedNav} />}
    </div>
  );
}
