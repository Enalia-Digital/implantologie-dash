import { useState } from 'react';
import { Card, SectionLabel, ProgressBar } from '../ui/primitives';
import { useClinic } from '../../context/ClinicContext';
import { tasaAgendamiento, tasaAsistencia, comision, isNum, fmt, fmtEur } from '../../lib/calc';

function Comparativa({ title, base, enalia }) {
  const ok = isNum(enalia) && enalia >= base;
  const diff = isNum(enalia) ? enalia - base : null;
  // barra: relleno relativo a la base (cap visual a 150%)
  const fillPct = isNum(enalia) && base > 0 ? Math.min(100, (enalia / (base * 1.5)) * 100) : 0;
  const markerPct = Math.min(100, (base / (base * 1.5)) * 100); // = 66.7%

  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 14 }}>
        {title}
      </div>
      <div style={{ display: 'flex', gap: 32, marginBottom: 16 }}>
        <div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 4 }}>Dental Implantologie</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-secondary)' }}>{fmt(base)}%</div>
        </div>
        <div>
          <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 4 }}>Enalia</div>
          <div style={{ fontSize: 24, fontWeight: 700, color: !isNum(enalia) ? 'var(--text-muted)' : ok ? 'var(--green)' : 'var(--red)' }}>
            {isNum(enalia) ? `${fmt(enalia, 1)}%` : '—'}
          </div>
        </div>
      </div>

      <div style={{ position: 'relative', marginBottom: 22 }}>
        <ProgressBar pct={fillPct} markerPct={markerPct} color={ok ? 'var(--accent)' : 'var(--orange)'} />
        <span style={{ position: 'absolute', top: 10, left: `${markerPct}%`, transform: 'translateX(-50%)', fontSize: 9, color: 'var(--text-muted)' }}>
          objetivo
        </span>
      </div>

      {isNum(diff) && (
        <span
          style={{
            display: 'inline-flex',
            padding: '3px 9px',
            borderRadius: 6,
            fontSize: 11,
            fontWeight: 600,
            background: ok ? 'rgba(52,199,138,0.12)' : 'rgba(242,99,122,0.12)',
            color: ok ? 'var(--green)' : 'var(--red)',
          }}
        >
          {ok ? '+' : ''}
          {fmt(diff, 1)} pts {ok ? 'sobre objetivo' : 'bajo objetivo'}
        </span>
      )}
    </div>
  );
}

export default function GoalsBlock({ data }) {
  const { config, updateConfig } = useClinic();
  const [editing, setEditing] = useState(false);
  const [draft, setDraft] = useState({ baseAgendamiento: config.baseAgendamiento, baseAsistencia: config.baseAsistencia });

  const tAgend = tasaAgendamiento(data);
  const tAsist = tasaAsistencia(data);
  const com = comision(data, config);

  const save = () => {
    updateConfig({
      baseAgendamiento: Number(draft.baseAgendamiento) || 0,
      baseAsistencia: Number(draft.baseAsistencia) || 0,
    });
    setEditing(false);
  };

  const inputStyle = {
    width: 70,
    background: 'var(--bg-elevated)',
    border: '1px solid var(--border-subtle)',
    borderRadius: 6,
    padding: '6px 10px',
    fontSize: 13,
    color: 'var(--text-primary)',
    outline: 'none',
  };

  return (
    <section>
      <SectionLabel>Objetivos de Rendimiento</SectionLabel>
      <Card>
        <div style={{ display: 'flex', justifyContent: 'flex-end', marginBottom: 8 }}>
          {!editing ? (
            <button
              onClick={() => {
                setDraft({ baseAgendamiento: config.baseAgendamiento, baseAsistencia: config.baseAsistencia });
                setEditing(true);
              }}
              style={{ background: 'none', border: 'none', fontSize: 11, color: 'var(--text-muted)', textDecoration: 'underline' }}
            >
              Editar tasas base
            </button>
          ) : (
            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 16, flexWrap: 'wrap' }}>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                Tasa agendamiento base (%)
                <input type="number" value={draft.baseAgendamiento} onChange={(e) => setDraft((d) => ({ ...d, baseAgendamiento: e.target.value }))} style={inputStyle} />
              </label>
              <label style={{ fontSize: 10, color: 'var(--text-muted)', display: 'flex', flexDirection: 'column', gap: 4 }}>
                Tasa asistencia base (%)
                <input type="number" value={draft.baseAsistencia} onChange={(e) => setDraft((d) => ({ ...d, baseAsistencia: e.target.value }))} style={inputStyle} />
              </label>
              <button onClick={save} style={{ background: 'var(--accent)', border: 'none', borderRadius: 6, padding: '7px 14px', fontSize: 12, fontWeight: 600, color: '#fff' }}>
                Guardar
              </button>
              <button onClick={() => setEditing(false)} style={{ background: 'none', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '7px 12px', fontSize: 12, color: 'var(--text-muted)' }}>
                Cancelar
              </button>
            </div>
          )}
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(240px, 1fr))', gap: 32 }}>
          <Comparativa title="Tasa de Agendamiento" base={config.baseAgendamiento} enalia={tAgend} />
          <Comparativa title="Tasa de Asistencia" base={config.baseAsistencia} enalia={tAsist} />
        </div>

        {/* Panel comisión */}
        <div style={{ borderTop: '1px solid var(--border-hairline)', marginTop: 24, paddingTop: 20 }}>
          <div style={{ fontSize: 13, color: 'var(--text-secondary)', marginBottom: 12 }}>
            Cada cita asistida por encima de la tasa de asistencia base se factura a {config.feePorAsistida} €.
          </div>
          {isNum(com.comision) ? (
            <div>
              <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>
                {fmt(com.asistidasExtra)} citas asistidas por encima de la base
              </div>
              <div style={{ fontSize: 28, fontWeight: 700, color: 'var(--accent)', marginTop: 4 }}>= {fmtEur(com.comision)}</div>
            </div>
          ) : (
            <div style={{ fontSize: 14, color: 'var(--text-muted)' }}>Pendiente · dato de asistencias semanal</div>
          )}
        </div>
      </Card>
    </section>
  );
}
