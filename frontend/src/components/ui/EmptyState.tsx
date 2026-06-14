import type { ReactNode } from 'react';
import { Link } from 'react-router-dom';

export type EmptyStateIcon =
  | 'activity'
  | 'chart'
  | 'mood'
  | 'profile'
  | 'request'
  | 'search'
  | 'skill'
  | 'stress'
  | 'item';

type EmptyStateProps = {
  icon?: EmptyStateIcon;
  title: string;
  description: string;
  actionLabel?: string;
  actionTo?: string;
  actionHref?: string;
  actionOnClick?: () => void;
  compact?: boolean;
  variant?: 'default' | 'soft' | 'dark' | 'success' | 'warning';
  className?: string;
};

const iconPaths: Record<EmptyStateIcon, ReactNode> = {
  activity: (
    <>
      <rect x="3" y="3" width="7" height="7" rx="1.5" />
      <rect x="14" y="3" width="7" height="4" rx="1.5" />
      <rect x="14" y="11" width="7" height="10" rx="1.5" />
      <rect x="3" y="14" width="7" height="7" rx="1.5" />
    </>
  ),
  chart: (
    <>
      <path d="M4 20V10M10 20V4M16 20v-7M22 20H2" />
      <path d="m4 8 6-5 6 7 5-4" />
    </>
  ),
  mood: (
    <>
      <circle cx="12" cy="12" r="9" />
      <path d="M8.3 10h.1M15.6 10h.1M8 15c1.1 1.2 2.4 1.8 4 1.8s2.9-.6 4-1.8" />
    </>
  ),
  profile: (
    <>
      <circle cx="12" cy="8" r="3.5" />
      <path d="M5 21c.5-4.5 2.8-7 7-7s6.5 2.5 7 7" />
    </>
  ),
  request: (
    <>
      <path d="M4 5.5h16v11H9l-5 4v-15Z" />
      <path d="M8 10h8M8 13h5" />
    </>
  ),
  search: (
    <>
      <circle cx="10.5" cy="10.5" r="6.5" />
      <path d="m16 16 5 5M8 10.5h5" />
    </>
  ),
  skill: (
    <>
      <circle cx="6" cy="12" r="2.3" />
      <circle cx="18" cy="6" r="2.3" />
      <circle cx="18" cy="18" r="2.3" />
      <path d="m8.2 10.9 7.6-3.8M8.2 13.1l7.6 3.8" />
    </>
  ),
  stress: (
    <>
      <path d="M3 13h4l2-6 3.2 11 2.5-8 1.8 3H21" />
      <path d="M4 21h16" />
    </>
  ),
  item: (
    <>
      <path d="M12 22s7-6.3 7-12a7 7 0 1 0-14 0c0 5.7 7 12 7 12Z" />
      <circle cx="12" cy="10" r="2.4" />
    </>
  )
};

export function EmptyState({
  icon = 'activity',
  title,
  description,
  actionLabel,
  actionTo,
  actionHref,
  actionOnClick,
  compact = false,
  variant = 'default',
  className = ''
}: EmptyStateProps) {
  const action = actionLabel
    ? actionTo
      ? <Link className="cc-empty-action" to={actionTo}>{actionLabel}</Link>
      : actionHref
        ? <a className="cc-empty-action" href={actionHref}>{actionLabel}</a>
        : actionOnClick
          ? <button className="cc-empty-action" onClick={actionOnClick} type="button">{actionLabel}</button>
          : null
    : null;

  return (
    <div className={`cc-empty-state cc-empty-${variant} ${compact ? 'cc-empty-compact' : ''} ${className}`.trim()}>
      <style>{`
        .cc-empty-state {
          display:grid;
          justify-items:center;
          align-content:center;
          gap:.48rem;
          min-height:150px;
          padding:1.15rem;
          border:1px solid #dfeaf3;
          border-radius:16px;
          color:#64748b;
          background:
            radial-gradient(circle at 82% 10%,rgba(103,227,214,.12),transparent 32%),
            linear-gradient(145deg,rgba(255,255,255,.96),rgba(246,250,253,.92));
          box-shadow:0 10px 28px rgba(15,23,42,.045);
          text-align:center;
        }
        .cc-empty-compact { min-height:118px; padding:.9rem; border-radius:13px; }
        .cc-empty-icon {
          display:grid;
          width:44px;
          height:44px;
          place-items:center;
          border:1px solid rgba(13,158,138,.18);
          border-radius:14px;
          color:#0d9e8a;
          background:linear-gradient(145deg,rgba(13,158,138,.1),rgba(103,227,214,.14));
          box-shadow:inset 0 1px 0 rgba(255,255,255,.7);
        }
        .cc-empty-compact .cc-empty-icon { width:38px; height:38px; border-radius:12px; }
        .cc-empty-state h3 { margin:.2rem 0 0; color:#0b1d35; font-family:"Sora",sans-serif; font-size:.85rem; line-height:1.35; }
        .cc-empty-state p { max-width:370px; margin:0; color:#64748b; font-size:.7rem; line-height:1.55; }
        .cc-empty-action {
          display:inline-flex;
          min-height:36px;
          align-items:center;
          justify-content:center;
          margin-top:.3rem;
          border:1px solid #0d9e8a;
          border-radius:9px;
          padding:.45rem .75rem;
          color:#fff;
          background:#0d9e8a;
          box-shadow:0 8px 18px rgba(13,158,138,.16);
          font:inherit;
          font-size:.66rem;
          font-weight:800;
          text-decoration:none;
          cursor:pointer;
          transition:transform .18s ease,box-shadow .18s ease,background .18s ease;
        }
        .cc-empty-action:hover { transform:translateY(-1px); background:#0b8d7b; box-shadow:0 10px 22px rgba(13,158,138,.22); }
        .cc-empty-soft { border-style:dashed; box-shadow:none; background:rgba(248,251,253,.86); }
        .cc-empty-success { border-color:rgba(13,158,138,.24); background:linear-gradient(145deg,#f8fffd,#effaf7); }
        .cc-empty-warning { border-color:rgba(217,119,6,.2); background:linear-gradient(145deg,#fffdfa,#fff8ed); }
        .cc-empty-warning .cc-empty-icon { border-color:rgba(217,119,6,.18); color:#b45309; background:#fff7ed; }
        .cc-empty-dark { border-color:rgba(255,255,255,.1); color:rgba(255,255,255,.68); background:linear-gradient(135deg,#071527,#0b1d35); }
        .cc-empty-dark h3 { color:#fff; }
        .cc-empty-dark p { color:rgba(255,255,255,.64); }
        @media(max-width:560px) {
          .cc-empty-state { min-height:132px; padding:1rem; }
          .cc-empty-action { width:100%; }
        }
      `}</style>
      <span className="cc-empty-icon" aria-hidden="true">
        <svg width={compact ? 19 : 22} height={compact ? 19 : 22} viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.7" strokeLinecap="round" strokeLinejoin="round">
          {iconPaths[icon]}
        </svg>
      </span>
      <h3>{title}</h3>
      <p>{description}</p>
      {action}
    </div>
  );
}
