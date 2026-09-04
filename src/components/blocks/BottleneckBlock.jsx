import { Card, SectionLabel } from '../ui/primitives';
import { biggestDrop, recommendationFor, fmt } from '../../lib/calc';

export default function BottleneckBlock({ data }) {
  const drop = biggestDrop(data);
  if (!drop) return null;

  return (
    <section>
      <SectionLabel>Diagnóstico</SectionLabel>
      <Card accent accentColor="var(--orange)">
        <div style={{ display: 'grid', gridTemplateColumns: 'minmax(0,3fr) minmax(0,2fr)', gap: 28 }} className="bottleneck-grid">
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Mayor pérdida detectada
            </div>
            <div style={{ fontSize: 18, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 6 }}>
              {drop.from} → {drop.to}
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)' }}>
              {fmt(drop.lost)} leads no avanzan ({fmt(drop.dropPct, 0)}% de caída)
            </div>
          </div>
          <div>
            <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10 }}>
              Acción sugerida
            </div>
            <div style={{ fontSize: 13, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
              {recommendationFor(drop.toKey)}
            </div>
          </div>
        </div>
      </Card>
    </section>
  );
}
