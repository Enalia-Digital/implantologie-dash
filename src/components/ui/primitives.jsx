import { useCountUp } from '../../hooks/useCountUp';
import { fmt } from '../../lib/calc';

const C = {
  card: 'var(--bg-card)',
  elevated: 'var(--bg-elevated)',
  hairline: 'var(--border-hairline)',
  subtle: 'var(--border-subtle)',
  accent: 'var(--accent)',
  textPrimary: 'var(--text-primary)',
  textSecondary: 'var(--text-secondary)',
  textMuted: 'var(--text-muted)',
  green: 'var(--green)',
  red: 'var(--red)',
  orange: 'var(--orange)',
};

export function Card({ children, style, accent, accentColor, className = '', ...rest }) {
  return (
    <div
      className={className}
      style={{
        background: C.card,
        border: `1px solid ${C.subtle}`,
        borderLeft: accent ? `2px solid ${accentColor || C.accent}` : `1px solid ${C.subtle}`,
        borderRadius: 10,
        padding: 20,
        boxShadow: '0 1px 3px rgba(0,0,0,0.04)',
        transition: 'border-color 0.15s ease',
        ...style,
      }}
      onMouseEnter={(e) => {
        e.currentTarget.style.borderColor = 'var(--border-medium)';
        if (accent) e.currentTarget.style.borderLeftColor = accentColor || C.accent;
      }}
      onMouseLeave={(e) => {
        e.currentTarget.style.borderColor = C.subtle;
        if (accent) e.currentTarget.style.borderLeftColor = accentColor || C.accent;
      }}
      {...rest}
    >
      {children}
    </div>
  );
}

export function SectionLabel({ children, right }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 14 }}>
      <span
        style={{
          fontSize: 10,
          fontWeight: 600,
          letterSpacing: '0.12em',
          textTransform: 'uppercase',
          color: C.textMuted,
        }}
      >
        {children}
      </span>
      {right}
    </div>
  );
}

const STATUS_STYLES = {
  nuevo: { bg: 'rgba(85,85,106,0.18)', color: C.textSecondary, label: 'Nuevo' },
  contactado: { bg: 'rgba(77,143,232,0.14)', color: 'var(--blue)', label: 'Contactado' },
  cualificado: { bg: 'rgba(191,0,255,0.14)', color: C.accent, label: 'Cualificado' },
  agendado: { bg: 'rgba(52,199,138,0.14)', color: C.green, label: 'Agendado' },
  callback: { bg: 'rgba(232,162,52,0.14)', color: C.orange, label: 'Callback' },
};

export function StatusBadge({ status }) {
  const s = STATUS_STYLES[status] || STATUS_STYLES.nuevo;
  return (
    <span
      style={{
        display: 'inline-flex',
        alignItems: 'center',
        padding: '3px 9px',
        borderRadius: 6,
        background: s.bg,
        color: s.color,
        fontSize: 10,
        fontWeight: 600,
        letterSpacing: '0.04em',
        textTransform: 'uppercase',
      }}
    >
      {s.label}
    </span>
  );
}

export function Delta({ value, suffix = '%', positiveIsGood = true }) {
  if (value === null || value === undefined) return null;
  const up = value >= 0;
  const good = positiveIsGood ? up : !up;
  const color = good ? C.green : C.red;
  return (
    <span style={{ color, fontSize: 11, fontWeight: 600, display: 'inline-flex', alignItems: 'center', gap: 3 }}>
      <svg width="9" height="9" viewBox="0 0 10 10" fill="none" style={{ transform: up ? 'none' : 'scaleY(-1)' }}>
        <path d="M5 1.5L8 6H2L5 1.5Z" fill={color} />
      </svg>
      {up ? '+' : ''}
      {value}
      {suffix}
    </span>
  );
}

export function ScoreDots({ score = 0, max = 10 }) {
  const filled = Math.round((score / max) * 5);
  return (
    <span style={{ display: 'inline-flex', gap: 3, alignItems: 'center' }} title={`Score ${score}/${max}`}>
      {Array.from({ length: 5 }).map((_, i) => (
        <span
          key={i}
          style={{
            width: 5,
            height: 5,
            borderRadius: '50%',
            background: i < filled ? C.accent : 'rgba(0,0,0,0.10)',
          }}
        />
      ))}
    </span>
  );
}

export function SkeletonBox({ width = '100%', height = 16, radius = 6, style }) {
  return <div className="shimmer" style={{ width, height, borderRadius: radius, ...style }} />;
}

// Número grande con count-up; muestra "—" cuando el valor no es numérico.
export function CountUpValue({ value, decimals = 0, suffix = '', color, deps = [], style }) {
  const numeric = typeof value === 'number' && Number.isFinite(value);
  const v = useCountUp(numeric ? value : 0, 800, deps);
  return (
    <span style={{ color, ...style }}>
      {numeric ? `${fmt(v, decimals)}${suffix}` : '—'}
    </span>
  );
}

// Barra de progreso con marcador opcional de objetivo (base).
export function ProgressBar({ pct, markerPct, color = C.accent, height = 6, animate = true }) {
  const clamped = Math.max(0, Math.min(100, pct));
  return (
    <div style={{ position: 'relative', height, background: 'rgba(0,0,0,0.06)', borderRadius: height / 2 }}>
      <div
        className={animate ? 'bar-grow' : undefined}
        style={{
          width: `${clamped}%`,
          height: '100%',
          background: color,
          borderRadius: height / 2,
        }}
      />
      {typeof markerPct === 'number' && (
        <div
          style={{
            position: 'absolute',
            top: -3,
            bottom: -3,
            left: `${Math.max(0, Math.min(100, markerPct))}%`,
            width: 2,
            background: 'rgba(0,0,0,0.5)',
            borderRadius: 1,
          }}
        />
      )}
    </div>
  );
}
