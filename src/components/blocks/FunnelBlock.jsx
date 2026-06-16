import { Card, SectionLabel } from '../ui/primitives';
import { funnelLevels, isNum, fmt } from '../../lib/calc';

export default function FunnelBlock({ data }) {
  const levels = funnelLevels(data);
  const base = data.totalLeads || 1;

  return (
    <section>
      <SectionLabel>Embudo de Conversión</SectionLabel>
      <Card>
        <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 28 }}>
          De lead captado a asistencia confirmada
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {levels.map((lvl, i) => {
            const prev = i > 0 ? levels[i - 1] : null;
            const widthPct = isNum(lvl.value) ? Math.max(4, (lvl.value / base) * 100) : 100;
            const stepPct =
              prev && isNum(prev.value) && isNum(lvl.value) && prev.value > 0
                ? (lvl.value / prev.value) * 100
                : null;

            return (
              <div
                key={lvl.key}
                style={{
                  display: 'grid',
                  gridTemplateColumns: '150px 1fr 60px 70px',
                  alignItems: 'center',
                  gap: 12,
                }}
                className="funnel-row"
              >
                <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-secondary)' }}>{lvl.label}</span>

                <div style={{ height: 38, background: 'rgba(0,0,0,0.03)', borderRadius: 6, overflow: 'hidden' }}>
                  <div
                    className="bar-grow"
                    style={{
                      width: `${widthPct}%`,
                      height: 38,
                      borderRadius: 6,
                      display: 'flex',
                      alignItems: 'center',
                      paddingLeft: 14,
                      gap: 8,
                      background: lvl.striped
                        ? 'repeating-linear-gradient(45deg, rgba(232,162,52,0.2), rgba(232,162,52,0.2) 6px, rgba(232,162,52,0.06) 6px, rgba(232,162,52,0.06) 12px)'
                        : lvl.color,
                      border: lvl.striped ? '1px dashed rgba(232,162,52,0.5)' : 'none',
                      animationDelay: `${i * 60}ms`,
                    }}
                  >
                    {isNum(lvl.value) ? (
                      <>
                        <span style={{ fontSize: 15, fontWeight: 700, color: '#fff' }}>{fmt(lvl.value)}</span>
                        <span style={{ fontSize: 11, fontWeight: 500, color: 'rgba(255,255,255,0.7)' }}>{lvl.label}</span>
                      </>
                    ) : (
                      <span style={{ fontSize: 12, fontWeight: 500, color: 'var(--orange)' }}>
                        Pendiente · dato semanal
                      </span>
                    )}
                  </div>
                </div>

                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textAlign: 'right' }}>
                  {isNum(lvl.value) ? fmt(lvl.value) : '—'}
                </span>

                <span style={{ fontSize: 11, color: 'var(--text-muted)', textAlign: 'right' }}>
                  {stepPct === null ? (i === 0 ? '100%' : '—') : (
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 3, justifyContent: 'flex-end' }}>
                      <svg width="8" height="8" viewBox="0 0 8 8" fill="none">
                        <path d="M4 6.5L1 2.5h6L4 6.5Z" fill="#9494A8" />
                      </svg>
                      {fmt(stepPct, 0)}%
                    </span>
                  )}
                </span>
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
