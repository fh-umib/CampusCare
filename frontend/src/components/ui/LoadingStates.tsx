import type { CSSProperties, ReactNode } from 'react';

type SkeletonProps = {
  className?: string;
  style?: CSSProperties;
};

function LoadingStyles() {
  return (
    <style>{`
      @keyframes ccSkeletonShimmer {
        0% { background-position: 180% 0; }
        100% { background-position: -180% 0; }
      }
      @keyframes ccContentFade {
        from { opacity: 0; transform: translateY(7px); }
        to { opacity: 1; transform: translateY(0); }
      }
      .cc-skeleton {
        overflow: hidden;
        background: linear-gradient(100deg,#eaf1f7 24%,#f7fbff 42%,#eaf1f7 60%);
        background-size: 220% 100%;
        animation: ccSkeletonShimmer 1.65s ease-in-out infinite;
      }
      .cc-skeleton-shell {
        border: 1px solid #dfeaf3;
        border-radius: 18px;
        background: rgba(255,255,255,.88);
        box-shadow: 0 12px 30px rgba(15,23,42,.045);
      }
      .cc-loading-grid { display: grid; gap: .85rem; }
      .cc-loading-stats { grid-template-columns: repeat(4,minmax(0,1fr)); }
      .cc-loading-split { grid-template-columns: repeat(2,minmax(0,1fr)); }
      .cc-loading-workspace { grid-template-columns: minmax(0,1.2fr) minmax(280px,.8fr); }
      .cc-skeleton-line { height: 10px; border-radius: 999px; }
      .cc-skeleton-fade { animation: ccContentFade .35s ease both; }
      @media(max-width:900px) {
        .cc-loading-stats { grid-template-columns: repeat(2,minmax(0,1fr)); }
        .cc-loading-workspace { grid-template-columns: 1fr; }
      }
      @media(max-width:560px) {
        .cc-loading-stats,.cc-loading-split { grid-template-columns: 1fr; }
      }
      @media(prefers-reduced-motion:reduce) {
        .cc-skeleton { animation: none; background: #eaf1f7; }
        .cc-skeleton-fade { animation: none; }
      }
    `}</style>
  );
}

export function SkeletonBlock({ className = '', style }: SkeletonProps) {
  return <span aria-hidden="true" className={`cc-skeleton ${className}`} style={style} />;
}

export function SkeletonCard({ compact = false }: { compact?: boolean }) {
  return (
    <div className="cc-skeleton-shell" style={{ padding: compact ? '.8rem' : '1rem' }}>
      <SkeletonBlock style={{ width: 42, height: 42, borderRadius: 13, display: 'block' }} />
      <SkeletonBlock className="cc-skeleton-line" style={{ width: '45%', marginTop: '.8rem', display: 'block' }} />
      <SkeletonBlock style={{ width: '30%', height: 25, borderRadius: 8, marginTop: '.45rem', display: 'block' }} />
      <SkeletonBlock className="cc-skeleton-line" style={{ width: '72%', marginTop: '.55rem', display: 'block' }} />
    </div>
  );
}

export function SkeletonStatCard() {
  return <SkeletonCard compact />;
}

export function SkeletonChart({ rows = 5 }: { rows?: number }) {
  return (
    <div className="cc-skeleton-shell" style={{ minHeight: 230, padding: '1rem' }}>
      <SkeletonBlock className="cc-skeleton-line" style={{ width: '32%', display: 'block' }} />
      <SkeletonBlock className="cc-skeleton-line" style={{ width: '55%', marginTop: '.4rem', display: 'block' }} />
      <div style={{ display: 'grid', gap: '.72rem', marginTop: '1.2rem' }}>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index}>
            <SkeletonBlock className="cc-skeleton-line" style={{ width: `${38 + index * 8}%`, display: 'block' }} />
            <SkeletonBlock style={{ width: `${86 - index * 7}%`, height: 7, borderRadius: 999, marginTop: '.32rem', display: 'block' }} />
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonList({ rows = 4 }: { rows?: number }) {
  return (
    <div className="cc-skeleton-shell" style={{ padding: '.9rem' }}>
      <div style={{ display: 'grid', gap: '.65rem' }}>
        {Array.from({ length: rows }, (_, index) => (
          <div key={index} style={{ display: 'grid', gridTemplateColumns: '38px minmax(0,1fr)', gap: '.65rem', alignItems: 'center', padding: '.5rem 0', borderBottom: index === rows - 1 ? 0 : '1px solid #edf2f7' }}>
            <SkeletonBlock style={{ width: 38, height: 38, borderRadius: 12, display: 'block' }} />
            <div>
              <SkeletonBlock className="cc-skeleton-line" style={{ width: `${64 + (index % 2) * 15}%`, display: 'block' }} />
              <SkeletonBlock className="cc-skeleton-line" style={{ width: '42%', height: 8, marginTop: '.38rem', display: 'block' }} />
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonTable({ rows = 5, columns = 5 }: { rows?: number; columns?: number }) {
  return (
    <div className="cc-skeleton-shell" style={{ overflow: 'hidden', padding: '.8rem' }}>
      <div style={{ display: 'grid', gap: '.5rem' }}>
        {Array.from({ length: rows + 1 }, (_, row) => (
          <div key={row} style={{ display: 'grid', gridTemplateColumns: `repeat(${columns},minmax(65px,1fr))`, gap: '.55rem', padding: '.5rem', borderBottom: row === rows ? 0 : '1px solid #edf2f7' }}>
            {Array.from({ length: columns }, (_, column) => (
              <SkeletonBlock key={column} className="cc-skeleton-line" style={{ width: row === 0 ? '65%' : `${55 + ((row + column) % 3) * 15}%`, display: 'block' }} />
            ))}
          </div>
        ))}
      </div>
    </div>
  );
}

export function SkeletonHero() {
  return (
    <div className="cc-skeleton-shell" style={{ minHeight: 220, padding: '1.4rem', background: 'linear-gradient(135deg,#0b1d35,#0f3045)' }}>
      <SkeletonBlock style={{ width: 120, height: 24, borderRadius: 999, display: 'block', opacity: .32 }} />
      <SkeletonBlock style={{ width: '48%', height: 30, borderRadius: 10, marginTop: '1rem', display: 'block', opacity: .38 }} />
      <SkeletonBlock className="cc-skeleton-line" style={{ width: '67%', marginTop: '.7rem', display: 'block', opacity: .32 }} />
      <div style={{ display: 'flex', gap: '.6rem', marginTop: '1.2rem' }}>
        <SkeletonBlock style={{ width: 130, height: 42, borderRadius: 11, display: 'block', opacity: .4 }} />
        <SkeletonBlock style={{ width: 105, height: 42, borderRadius: 11, display: 'block', opacity: .3 }} />
      </div>
    </div>
  );
}

export function PageLoadingState({
  variant = 'analytics',
  label = 'Loading CampusCare content'
}: {
  variant?: 'dashboard' | 'analytics' | 'support' | 'profile';
  label?: string;
}) {
  const content: Record<'dashboard' | 'analytics' | 'support' | 'profile', ReactNode> = {
    dashboard: (
      <>
        <SkeletonHero />
        <div className="cc-loading-grid cc-loading-stats">
          {Array.from({ length: 4 }, (_, index) => <SkeletonStatCard key={index} />)}
        </div>
        <div className="cc-loading-grid cc-loading-split"><SkeletonChart /><SkeletonChart rows={4} /></div>
        <SkeletonList />
      </>
    ),
    analytics: (
      <>
        <div className="cc-loading-grid cc-loading-stats">
          {Array.from({ length: 4 }, (_, index) => <SkeletonStatCard key={index} />)}
        </div>
        <div className="cc-loading-grid cc-loading-split"><SkeletonChart /><SkeletonChart rows={4} /></div>
        <SkeletonList rows={5} />
      </>
    ),
    support: (
      <>
        <div className="cc-loading-grid cc-loading-stats">
          {Array.from({ length: 4 }, (_, index) => <SkeletonStatCard key={index} />)}
        </div>
        <div className="cc-loading-grid cc-loading-workspace"><SkeletonList rows={5} /><SkeletonChart rows={3} /></div>
      </>
    ),
    profile: (
      <>
        <SkeletonHero />
        <div className="cc-loading-grid cc-loading-split"><SkeletonCard /><SkeletonCard /></div>
        <SkeletonList rows={3} />
      </>
    )
  };

  return (
    <section aria-busy="true" aria-label={label} className="cc-loading-grid cc-skeleton-fade" role="status">
      <LoadingStyles />
      <span className="sr-only">{label}</span>
      {content[variant]}
    </section>
  );
}

export function ButtonSpinner() {
  return (
    <>
      <style>{`
        @keyframes ccButtonSpin { to { transform: rotate(360deg); } }
        .cc-button-spinner { width:14px; height:14px; flex:none; border:2px solid currentColor; border-right-color:transparent; border-radius:50%; animation:ccButtonSpin .7s linear infinite; }
        @media(prefers-reduced-motion:reduce) { .cc-button-spinner { animation-duration:1.5s; } }
      `}</style>
      <span aria-hidden="true" className="cc-button-spinner" />
    </>
  );
}
