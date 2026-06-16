import { Card, SectionLabel } from '../ui/primitives';
import { fmt } from '../../lib/calc';

function barColor(i) {
  if (i === 0) return '#BF00FF';
  if (i === 1) return 'rgba(191,0,255,0.7)';
  if (i === 2) return '#4D8FE8';
  return '#9494A8';
}

export default function ObjectionsBlock({ data }) {
  const items = [...data.objeciones].sort((a, b) => b.count - a.count);
  const max = Math.max(...items.map((o) => o.count), 1);

  return (
    <section>
      <SectionLabel>Objeciones Detectadas</SectionLabel>
      <Card>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {items.map((o, i) => (
            <div key={o.label}>
              <div style={{ display: 'flex', justifyContent: 'space-between', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(o.count)}</span> · {fmt(o.pct)}%
                </span>
              </div>
              <div style={{ height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2 }}>
                <div
                  className="bar-grow"
                  style={{
                    width: `${(o.count / max) * 100}%`,
                    height: 4,
                    borderRadius: 2,
                    background: barColor(i),
                    animationDelay: `${i * 60}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
