import { Card, SectionLabel } from '../ui/primitives';
import { funnelLevels, isNum, fmt } from '../../lib/calc';
import FunnelChart from '../ui/FunnelChart';

export default function FunnelBlock({ data }) {
  const levels = funnelLevels(data);

  const chartData = levels.map((lvl) => ({
    label: lvl.label,
    value: isNum(lvl.value) ? lvl.value : 0,
    displayValue: isNum(lvl.value) ? fmt(lvl.value) : '—',
    color: lvl.color,
  }));

  return (
    <section>
      <SectionLabel>Embudo de Conversión</SectionLabel>
      <Card>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 24 }}>
          De lead captado a asistencia
        </div>

        <div style={{ marginBottom: 20 }}>
          <FunnelChart
            data={chartData}
            edges="straight"
            layers={3}
            gap={6}
            staggerDelay={0.14}
            showPercentage
            showValues
            showLabels
          />
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: `repeat(${levels.length - 1}, 1fr)`,
            gap: 12,
            paddingTop: 16,
            borderTop: '1px solid var(--border-hairline)',
          }}
          className="funnel-conversion-row"
        >
          {levels.slice(1).map((lvl, i) => {
            const prev = levels[i];
            const stepPct =
              isNum(prev.value) && isNum(lvl.value) && prev.value > 0
                ? (lvl.value / prev.value) * 100
                : null;

            return (
              <div key={lvl.key} style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 6, fontSize: 10, color: 'var(--text-muted)' }}>
                  <span>{prev.label}</span>
                  <svg width="10" height="10" viewBox="0 0 10 10" fill="none">
                    <path d="M2 5h6M6 2l3 3-3 3" stroke="var(--text-muted)" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round" />
                  </svg>
                  <span>{lvl.label}</span>
                </div>
                <span style={{
                  fontSize: 20, fontWeight: 700,
                  color: stepPct !== null ? (stepPct >= 60 ? 'var(--green)' : stepPct >= 30 ? 'var(--accent)' : 'var(--orange)') : 'var(--text-muted)',
                  fontVariantNumeric: 'tabular-nums',
                }}>
                  {stepPct !== null ? `${fmt(stepPct, 0)}%` : '—'}
                </span>
              </div>
            );
          })}
        </div>

        <div
          style={{
            marginTop: 16,
            paddingTop: 12,
            borderTop: '1px solid var(--border-hairline)',
            fontSize: 11,
            color: 'var(--text-muted)',
            lineHeight: 1.5,
          }}
        >
          Contamos como <b style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>contactados</b> solo
          a los leads que nos atienden cogiendo el teléfono. Se intenta cada lead un total de
          5 veces en menos de una semana.
        </div>
      </Card>
    </section>
  );
}
