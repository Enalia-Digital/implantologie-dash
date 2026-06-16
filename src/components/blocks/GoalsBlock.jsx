import { Card, SectionLabel } from '../ui/primitives';
import { useClinic } from '../../context/ClinicContext';
import { tasaAgendamiento, tasaAsistencia, comision, isNum, fmt, fmtEur } from '../../lib/calc';

function GoalRow({ label, base, actual }) {
  const maxVal = Math.max(base, isNum(actual) ? actual : 0) * 1.2 || 1;
  const basePct = (base / maxVal) * 100;
  const actualPct = isNum(actual) ? (actual / maxVal) * 100 : 0;
  const ok = isNum(actual) && actual >= base;

  return (
    <div>
      <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 14 }}>
        {label}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>Objetivo</span>
        <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3 }}>
          <div style={{ width: `${basePct}%`, height: '100%', background: 'rgba(0,0,0,0.12)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 48, textAlign: 'right' }}>
          {fmt(base)}%
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--accent)', width: 80, flexShrink: 0 }}>Enalia</span>
        <div style={{ flex: 1, height: 6, background: 'rgba(0,0,0,0.06)', borderRadius: 3 }}>
          <div
            className="bar-grow"
            style={{
              width: `${actualPct}%`, height: '100%',
              background: ok ? 'var(--green)' : 'var(--orange)', borderRadius: 3,
            }}
          />
        </div>
        <span
          style={{
            fontSize: 12, fontWeight: 600, width: 48, textAlign: 'right',
            color: isNum(actual) ? (ok ? 'var(--green)' : 'var(--orange)') : 'var(--text-muted)',
          }}
        >
          {isNum(actual) ? `${fmt(actual, 1)}%` : '—'}
        </span>
      </div>
    </div>
  );
}

export default function GoalsBlock({ data }) {
  const { config } = useClinic();
  const tAgend = tasaAgendamiento(data);
  const tAsist = tasaAsistencia(data);
  const com = comision(data, config);

  return (
    <section>
      <SectionLabel>Objetivos</SectionLabel>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))', gap: 32 }}>
          <GoalRow label="Tasa de Agendamiento" base={config.baseAgendamiento} actual={tAgend} />
          <GoalRow label="Tasa de Asistencia" base={config.baseAsistencia} actual={tAsist} />
        </div>

        {isNum(com.comision) && (
          <div
            style={{
              borderTop: '1px solid var(--border-hairline)', marginTop: 20, paddingTop: 16,
              display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comisión:</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {fmt(com.asistidasExtra)} citas extra · {config.feePorAsistida} €/cita
            </span>
            <span style={{ fontSize: 18, fontWeight: 700, color: 'var(--accent)' }}>
              {fmtEur(com.comision)}
            </span>
          </div>
        )}
      </Card>
    </section>
  );
}
