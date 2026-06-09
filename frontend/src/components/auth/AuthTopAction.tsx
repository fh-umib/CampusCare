import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

type AuthActionIcon = 'role' | 'login' | 'home' | 'dashboard';

const iconPaths: Record<AuthActionIcon, ReactNode> = {
  role: (
    <>
      <path d="M7 7h11l-3-3M17 17H6l3 3" />
      <path d="m18 7-3 3M6 17l3-3" />
    </>
  ),
  login: (
    <>
      <path d="M10 5H5v14h5M14 8l4 4-4 4M18 12H9" />
    </>
  ),
  home: (
    <>
      <path d="m3.5 11 8.5-7 8.5 7" />
      <path d="M5.5 10v10h13V10M9.5 20v-6h5v6" />
    </>
  ),
  dashboard: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  )
};

export function AuthTopAction({
  to,
  icon,
  children,
  accent = false
}: {
  to: string;
  icon: AuthActionIcon;
  children: ReactNode;
  accent?: boolean;
}) {
  return (
    <Link className={`auth-top-action ${accent ? 'auth-top-action-accent' : ''}`} to={to}>
      <svg
        aria-hidden="true"
        width="18"
        height="18"
        viewBox="0 0 24 24"
        fill="none"
        stroke="currentColor"
        strokeWidth="1.7"
        strokeLinecap="round"
        strokeLinejoin="round"
      >
        {iconPaths[icon]}
      </svg>
      <span>{children}</span>
    </Link>
  );
}

export function AuthTopActionStyles() {
  return (
    <style>{`
      .auth-top-action {
        display: inline-flex;
        min-height: 42px;
        align-items: center;
        justify-content: center;
        gap: .5rem;
        border: 1px solid #d7e4ed;
        border-radius: 12px;
        padding: .55rem .85rem;
        background: rgba(255,255,255,.82);
        box-shadow: 0 8px 22px rgba(15,23,42,.055);
        color: #0b1d35;
        font-size: .78rem;
        font-weight: 750;
        text-decoration: none;
        transition: transform .18s ease, border-color .18s ease, box-shadow .18s ease, background .18s ease;
      }
      .auth-top-action:hover {
        transform: translateY(-2px);
        border-color: rgba(13,158,138,.35);
        background: #fff;
        box-shadow: 0 12px 26px rgba(15,23,42,.09);
      }
      .auth-top-action-accent {
        border-color: rgba(13,158,138,.24);
        background: rgba(13,158,138,.08);
        color: #087c6d;
      }
      @media (max-width: 640px) {
        .auth-top-action { flex: 1; }
      }
    `}</style>
  );
}
