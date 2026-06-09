type CampusCareLogoMarkProps = {
  size?: number;
  variant?: 'dark' | 'light';
};

export function CampusCareLogoMark({ size = 44, variant = 'dark' }: CampusCareLogoMarkProps) {
  const isDark = variant === 'dark';

  return (
    <span
      aria-hidden="true"
      className="inline-flex shrink-0 items-center justify-center"
      style={{
        width: size,
        height: size,
        borderRadius: Math.round(size * 0.32),
        background: isDark
          ? 'linear-gradient(145deg, rgba(255,255,255,.09), rgba(103,227,214,.08))'
          : 'linear-gradient(145deg, #071527, #0f2f46)',
        border: isDark ? '1px solid rgba(103,227,214,.2)' : '1px solid rgba(13,158,138,.18)',
        boxShadow: isDark ? 'inset 0 0 0 1px rgba(255,255,255,.04)' : '0 12px 28px rgba(11,29,53,.16)'
      }}
    >
      <svg fill="none" height={size * 0.68} viewBox="0 0 32 32" width={size * 0.68}>
        <path d="M4 10.5 16 5l12 5.5L16 16 4 10.5Z" fill="#67e3d6" />
        <path d="M8.5 13.2v5.1c0 2.4 3.4 4.7 7.5 4.7s7.5-2.3 7.5-4.7v-5.1L16 16.7l-7.5-3.5Z" fill="#0d9e8a" />
        <path d="M26.5 12v7" stroke="#67e3d6" strokeLinecap="round" strokeWidth="1.8" />
        <path
          d="M16 27.2s-5.2-2.8-5.2-6.2c0-1.7 1.2-2.9 2.8-2.9 1 0 1.9.5 2.4 1.3.5-.8 1.4-1.3 2.4-1.3 1.6 0 2.8 1.2 2.8 2.9 0 3.4-5.2 6.2-5.2 6.2Z"
          fill={isDark ? '#ffffff' : '#f8ffff'}
          stroke="#67e3d6"
          strokeWidth="1.1"
        />
      </svg>
    </span>
  );
}
