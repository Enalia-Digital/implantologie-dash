import { Card, SectionLabel } from '../ui/primitives';
import { fmt } from '../../lib/calc';

/**
 * Distribución "¿en qué llamada se agendó el lead?".
 * Universo: leads con cita creada en el periodo.
 * Buckets: 1ª · 2ª · 3ª · 4ª · 5ª · +5. Contestadores y llamadas de 0:00 cuentan.
 */

const ORDER = ['1', '2', '3', '4', '5', '6+'];
const LABELS = {
  '1':  '1ª llamada',
  '2':  '2ª llamada',
  '3':  '3ª llamada',
  '4':  '4ª llamada',
  '5':  '5ª llamada',
  '6+': '+5 llamadas',
};

function barColor(i) {
  // Degradado: la 1ª (mejor) más saturada, va decayendo hacia neutro
  if (i === 0) return '#BF00FF';
  if (i === 1) return 'rgba(191,0,255,0.75)';
  if (i === 2) return 'rgba(191,0,255,0.55)';
  if (i === 3) return 'rgba(191,0,255,0.35)';
  if (i === 4) return 'rgba(191,0,255,0.22)';
  return 'var(--text-muted)';
}

export default function FirstCallBlock({ data }) {
  const agi = data?.agendamientoPorIntento;
  if (!agi || !agi.total) return null;

  const total = agi.total;
  const rows = ORDER.map((k) => ({
    key: k,
    label: LABELS[k],
    count: agi.buckets[k] || 0,
    pct: total > 0 ? ((agi.buckets[k] || 0) / total) * 100 : 0,
  }));
  const max = Math.max(...rows.map((r) => r.count), 1);

  // Métricas de cabecera: cuántos a la primera y en las 3 primeras
  const primera = agi.buckets['1'] || 0;
  const enTres = (agi.buckets['1'] || 0) + (agi.buckets['2'] || 0) + (agi.buckets['3'] || 0);
  const pctPrimera = total > 0 ? (primera / total) * 100 : 0;
  const pctTres    = total > 0 ? (enTres / total) * 100 : 0;

  return (
    <section>
      <SectionLabel>Agendamiento por Nº de Llamada</SectionLabel>
      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18, lineHeight: 1.5 }}>
          De los {fmt(total)} lead{total === 1 ? '' : 's'} agendado{total === 1 ? '' : 's'} en el periodo,
          {' '}esta es la llamada en la que se cerró la cita. Se cuentan todas las llamadas del sistema
          (contestadores y de 0:00 incluidos).
        </div>

        {/* Cabecera con dos KPIs breves */}
        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16, marginBottom: 20 }}>
          <StatMini
            label="A la primera"
            value={`${fmt(pctPrimera)}%`}
            sub={`${fmt(primera)} de ${fmt(total)}`}
            tone="accent"
          />
          <StatMini
            label="En las 3 primeras"
            value={`${fmt(pctTres)}%`}
            sub={`${fmt(enTres)} de ${fmt(total)}`}
            tone="muted"
          />
        </div>

        {/* Barras horizontales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {rows.map((r, i) => (
            <div key={r.key}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{r.label}</span>
                <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                  <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(r.count)}</span>
                  {' '}· {fmt(r.pct)}%
                </span>
              </div>
              <div style={{ height: 6, background: 'var(--bar-bg)', borderRadius: 3 }}>
                <div
                  className="bar-grow"
                  style={{
                    width: `${(r.count / max) * 100}%`,
                    height: 6, borderRadius: 3,
                    background: barColor(i),
                    animationDelay: `${i * 50}ms`,
                  }}
                />
              </div>
            </div>
          ))}
        </div>

        {agi.sinLlamada > 0 && (
          <div style={{ marginTop: 14, fontSize: 10, color: 'var(--text-muted)', fontStyle: 'italic' }}>
            {agi.sinLlamada} cita{agi.sinLlamada === 1 ? '' : 's'} sin llamada previa registrada
            {' '}se ha{agi.sinLlamada === 1 ? '' : 'n'} contado como “1ª llamada”.
          </div>
        )}
      </Card>
    </section>
  );
}

function StatMini({ label, value, sub, tone }) {
  const color = tone === 'accent' ? 'var(--accent)' : 'var(--text-primary)';
  return (
    <div style={{
      padding: '12px 14px',
      border: '1px solid var(--border-subtle)',
      borderRadius: 8,
      background: tone === 'accent' ? 'rgba(191,0,255,0.05)' : 'transparent',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 600, color, lineHeight: 1 }}>
        {value}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
        {sub}
      </div>
    </div>
  );
}
