import type { ReactNode } from 'react';

type AppLayoutProps = {
  children: ReactNode;
};

export function AppLayout({ children }: AppLayoutProps) {
  return <main className="min-h-screen bg-slate-50 text-slate-950">{children}</main>;
}

