import { Card, SectionLabel } from '../ui/primitives';
import { useClinic } from '../../context/ClinicContext';
import { tasaAgendamiento, tasaAsistencia, comision, isNum, fmt, fmtEur } from '../../lib/calc';

function GoalRow({ label, nota, base, actual }) {
  const maxVal = Math.max(base, isNum(actual) ? actual : 0) * 1.2 || 1;
  const basePct = (base / maxVal) * 100;
  const actualPct = isNum(actual) ? (actual / maxVal) * 100 : 0;
  const ok = isNum(actual) && actual >= base;

  return (
    <div>
      <div style={{ marginBottom: 14 }}>
        <div style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</div>
        {nota && <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 2 }}>{nota}</div>}
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12, marginBottom: 10 }}>
        <span style={{ fontSize: 11, color: 'var(--text-muted)', width: 80, flexShrink: 0 }}>Objetivo</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bar-bg)', borderRadius: 3 }}>
          <div style={{ width: `${basePct}%`, height: '100%', background: 'var(--border-medium)', borderRadius: 3 }} />
        </div>
        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-muted)', width: 48, textAlign: 'right' }}>
          {fmt(base)}%
        </span>
      </div>

      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <span style={{ fontSize: 11, color: 'var(--accent)', width: 80, flexShrink: 0 }}>Enalia</span>
        <div style={{ flex: 1, height: 6, background: 'var(--bar-bg)', borderRadius: 3 }}>
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

function BeforeAfterBlock({ tAgend, tAsist, config }) {
  const baseAgend = config.baseAgendamiento;
  const baseAsist = config.baseAsistencia;

  const nowAgend = isNum(tAgend) ? Math.round(tAgend) : null;
  const nowAsist = isNum(tAsist) ? Math.round(tAsist) : null;
  const asistenAhora = isNum(nowAgend) && isNum(nowAsist)
    ? Math.round((nowAgend * nowAsist) / 100)
    : null;

  const mesActual = new Date().toLocaleDateString('es-ES', { month: 'long' });

  return (
    <div
      style={{
        marginTop: 24,
        padding: 20,
        borderRadius: 12,
        background: 'linear-gradient(135deg, var(--accent-dim) 0%, rgba(191,0,255,0.02) 100%)',
        border: '1px solid var(--accent-border)',
      }}
    >
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 24 }} className="ba-grid">
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
            Antes
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            De cada 100 leads agendabas <b style={{ color: 'var(--text-primary)' }}>{baseAgend}</b> y asistían{' '}
            <b style={{ color: 'var(--text-primary)' }}>{Math.round((baseAgend * baseAsist) / 100)}</b>.
          </div>
        </div>
        <div>
          <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 8 }}>
            Ahora con Enalia
          </div>
          <div style={{ fontSize: 14, color: 'var(--text-secondary)', lineHeight: 1.55 }}>
            De cada 100 leads agendas{' '}
            <b style={{ color: 'var(--accent)' }}>{isNum(nowAgend) ? nowAgend : '—'}</b> y asisten{' '}
            <b style={{ color: 'var(--accent)' }}>{isNum(asistenAhora) ? asistenAhora : '—'}</b>
            <span style={{ display: 'block', marginTop: 6, fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
              Aún pendiente por confirmar a final de {mesActual}.
            </span>
          </div>
        </div>
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
          <GoalRow
            label="Tasa de Agendamiento"
            nota="Citas sobre el total de leads. Es la que fija la comisión."
            base={config.baseAgendamiento}
            actual={tAgend}
          />
          <GoalRow
            label="Tasa de Asistencia"
            nota="De los agendados, cuántos acuden."
            base={config.baseAsistencia}
            actual={tAsist}
          />
        </div>

        <BeforeAfterBlock tAgend={tAgend} tAsist={tAsist} config={config} />

        {isNum(com.comision) && (
          <div
            style={{
              borderTop: '1px solid var(--border-hairline)', marginTop: 20, paddingTop: 16,
              display: 'flex', alignItems: 'baseline', gap: 8, flexWrap: 'wrap',
            }}
          >
            <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>Comisión:</span>
            <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>
              {fmt(com.citasExtra)} citas extra · {config.feePorAsistida} €/cita
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
