import { fmt } from '../../lib/calc';

export default function ChartTooltip({ active, payload, label, formatter }) {
  if (!active || !payload || !payload.length) return null;
  return (
    <div
      style={{
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 6,
        padding: '8px 12px',
        fontSize: 11,
        boxShadow: '0 4px 12px rgba(0,0,0,0.12)',
      }}
    >
      {label != null && <div style={{ color: 'var(--text-secondary)', marginBottom: 6 }}>{label}</div>}
      {payload.map((p) => (
        <div key={p.dataKey} style={{ display: 'flex', alignItems: 'center', gap: 8, marginTop: 2 }}>
          <span style={{ width: 8, height: 8, borderRadius: 2, background: p.color || p.stroke || p.fill }} />
          <span style={{ color: 'var(--text-muted)' }}>{p.name}</span>
          <span style={{ color: 'var(--text-primary)', fontWeight: 600, marginLeft: 'auto' }}>
            {formatter ? formatter(p.value, p.dataKey) : fmt(p.value)}
          </span>
        </div>
      ))}
    </div>
  );
}
