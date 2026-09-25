import { useState, useEffect } from 'react';
import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { isNum, fmt, fmtDuracion } from '../../lib/calc';
import { nombreAgente } from '../../data/config';
import { useClinic, PERIODS } from '../../context/ClinicContext';

const CLINIC_LABEL = {
  triana: 'Triana',
  los_palacios: 'Los Palacios',
  san_jose: 'San José',
  otras: 'Otras',
};

function fmtCitaCorto(iso) {
  if (!iso) return '—';
  try {
    return new Date(iso).toLocaleDateString('es-ES', {
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function AsistenciasModal({ items, onClose }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    const prev = document.body.style.overflow;
    document.body.style.overflow = 'hidden';
    return () => {
      document.removeEventListener('keydown', onKey);
      document.body.style.overflow = prev;
    };
  }, [onClose]);

  const sorted = [...items].sort((a, b) => {
    const ta = a.appointmentStart ? new Date(a.appointmentStart).getTime() : 0;
    const tb = b.appointmentStart ? new Date(b.appointmentStart).getTime() : 0;
    return tb - ta;
  });

  return (
    <div
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.55)',
        backdropFilter: 'blur(4px)', zIndex: 1000,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        padding: 20,
      }}
    >
      <div
        onClick={(e) => e.stopPropagation()}
        style={{
          background: 'var(--card-bg)', color: 'var(--text-primary)',
          border: '1px solid var(--border-hairline)', borderRadius: 16,
          padding: 24, maxWidth: 560, width: '100%',
          maxHeight: '80vh', overflowY: 'auto',
          boxShadow: '0 20px 60px rgba(0,0,0,0.4)',
        }}
      >
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 16, marginBottom: 16 }}>
          <div>
            <div style={{ fontSize: 18, fontWeight: 600 }}>Citas asistidas</div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              {sorted.length} {sorted.length === 1 ? 'cita confirmada' : 'citas confirmadas'} del periodo
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar"
            style={{
              background: 'transparent', border: '1px solid var(--border-hairline)',
              color: 'var(--text-secondary)', borderRadius: 8, width: 32, height: 32,
              cursor: 'pointer', fontSize: 16, lineHeight: 1,
            }}
          >
            ×
          </button>
        </div>

        {sorted.length === 0 ? (
          <div style={{ padding: '32px 0', textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Sin citas asistidas registradas en este periodo.
          </div>
        ) : (
          <ul style={{ listStyle: 'none', padding: 0, margin: 0, display: 'flex', flexDirection: 'column', gap: 8 }}>
            {sorted.map((a) => (
              <li
                key={a.recordId}
                style={{
                  padding: '12px 14px', borderRadius: 10,
                  background: 'var(--bg-hover)', border: '1px solid var(--border-hairline)',
                }}
              >
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', gap: 12 }}>
                  <div style={{ fontSize: 14, fontWeight: 600 }}>{a.nombre}</div>
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)',
                    fontVariantNumeric: 'tabular-nums', whiteSpace: 'nowrap',
                  }}>
                    {fmtCitaCorto(a.appointmentStart)}
                  </div>
                </div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                  {CLINIC_LABEL[a.clinicKey] || a.clinicRaw || 'Sin clínica'}
                </div>
              </li>
            ))}
          </ul>
        )}
      </div>
    </div>
  );
}

const PERIODO_LABEL = {
  week: 'esta semana',
  month: 'este mes',
  last_month: 'el mes pasado',
  last_90: 'en 90 días',
  enalia: 'desde el inicio',
};

function rateColor(v) {
  if (!isNum(v)) return 'var(--text-secondary)';
  if (v >= 30) return 'var(--green)';
  if (v >= 15) return 'var(--orange)';
  return 'var(--red)';
}

function respColor(v) {
  if (!isNum(v)) return 'var(--text-secondary)';
  if (v <= 60) return 'var(--green)';
  if (v <= 300) return 'var(--accent)';
  return 'var(--orange)';
}

function KpiCard({ label, children, sub, accent, onClick }) {
  const clickable = typeof onClick === 'function';
  return (
    <Card
      accent={accent}
      style={{
        padding: '20px 22px',
        cursor: clickable ? 'pointer' : 'default',
        transition: 'transform 140ms ease, border-color 140ms ease, background 140ms ease',
      }}
      onClick={clickable ? onClick : undefined}
      onKeyDown={clickable ? (e) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick(); } } : undefined}
      role={clickable ? 'button' : undefined}
      tabIndex={clickable ? 0 : undefined}
    >
      <div style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--text-muted)',
        display: 'flex', alignItems: 'center', gap: 6,
      }}>
        <span>{label}</span>
        {clickable && (
          <span style={{ fontSize: 10, color: 'var(--text-muted)', opacity: 0.7 }}>›</span>
        )}
      </div>
      <div style={{
        fontSize: 28, fontWeight: 600, marginTop: 10, lineHeight: 1.05,
        letterSpacing: '-0.015em',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {children}
      </div>
      {sub && <div style={{ fontSize: 11, marginTop: 6, lineHeight: 1.5 }}>{sub}</div>}
    </Card>
  );
}

export default function KpiBlock({ data, deps, vista = 'activacion' }) {
  const { period } = useClinic();
  const periodoTxt = PERIODO_LABEL[period] || '';
  const seg = data.segmentos;
  const [showAsistidas, setShowAsistidas] = useState(false);
  const asistenciasAttended = (data.asistenciasRecientes || []).filter((a) => a.estado === 'attended');

  // Universo consistente: los ratios "Agendamiento / Contactados" y
  // "Agendamiento / Leads" usan LEADS con cita nueva (no numero de citas)
  // para que numerador y denominador sean el mismo universo y el ratio
  // nunca supere el 100 %. Las citas de rescate se muestran aparte.
  const citasNuevas = data.citasNuevas != null ? data.citasNuevas : data.citasAgendadas;
  const citasRescate = data.citasRescate || 0;
  // Fallback: en periodos antiguos o mocks el backend puede no traer aun
  // leadsAgendadosNuevos; usamos citasNuevas capado al denominador.
  const leadsAgendadosNuevos = data.leadsAgendadosNuevos != null
    ? data.leadsAgendadosNuevos
    : Math.min(citasNuevas, data.leadsContactados || citasNuevas);
  const m = {
    totalLeads: data.totalLeads,
    leadsContactados: data.leadsContactados,
    citasAgendadas: data.citasAgendadas,
    citasNuevas,
    citasRescate,
    citasAsistidas: data.citasAsistidas,
    citasNoShow: data.citasNoShow,
    tasaNoShow: data.tasaNoShow,
    totalLlamadas: data.totalLlamadas,
    llamadasNuevas: data.llamadasNuevas != null ? data.llamadasNuevas : data.totalLlamadas,
    // "Intentos para agendar": cuantas llamadas de media hacen falta para
    // cerrar una cita. Usa TODAS las llamadas del periodo (incluye reintentos
    // y rescates, que tambien empujan al agendamiento) divididas entre leads
    // distintos con cita nueva del periodo.
    intentosPorLead: leadsAgendadosNuevos > 0
      ? data.totalLlamadas / leadsAgendadosNuevos
      : null,
    tasaAgendamiento: data.totalLeads > 0 ? (leadsAgendadosNuevos / data.totalLeads) * 100 : null,
    tasaReunion: data.leadsContactados > 0 ? (leadsAgendadosNuevos / data.leadsContactados) * 100 : null,
    tiempoRespuestaSeg: data.tiempoRespuestaSeg,
    valoracionMedia: data.valoracionMedia,
  };

  const esPrevios = vista === 'previos';
  const tabDeps = [...(deps || []), vista];

  return (
    <section>
      <SectionLabel>Métricas Principales</SectionLabel>

      {seg && seg.hayPrevios && esPrevios && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12, lineHeight: 1.5 }}>
          Base cerrada de {m.totalLeads} leads: no entran nuevos, pero los intentos y las citas
          se siguen actualizando en vivo mientras {nombreAgente} los trabaja.
        </div>
      )}

      <div className="kpi-grid-main" style={{ marginBottom: 12 }}>
        <KpiCard label="Leads">
          <CountUpValue value={m.totalLeads} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Leads Contactados" sub={<span style={{ color: 'var(--text-muted)' }}>cogieron el teléfono</span>}>
          <CountUpValue value={m.leadsContactados} deps={tabDeps} />
        </KpiCard>
        <KpiCard
          label="Citas Agendadas"
          accent
          sub={
            m.citasRescate > 0
              ? (
                <span style={{ color: 'var(--text-muted)' }}>
                  <b style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{m.citasNuevas}</b> nuevas
                  {' · '}
                  <b style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{m.citasRescate}</b> de rescate
                </span>
              )
              : null
          }
        >
          <CountUpValue value={m.citasAgendadas} color="var(--accent)" deps={tabDeps} />
        </KpiCard>
      </div>

      <div className="kpi-grid-detail">
        <KpiCard
          label="Citas Asistidas"
          onClick={asistenciasAttended.length > 0 ? () => setShowAsistidas(true) : undefined}
          sub={
            !m.citasAsistidas
              ? <span style={{ color: 'var(--text-muted)' }}>Se actualiza cada día</span>
              : <span style={{ color: 'var(--text-muted)' }}>Pulsa para ver el detalle</span>
          }
        >
          <CountUpValue value={m.citasAsistidas} color="var(--green)" deps={tabDeps} />
        </KpiCard>
        <KpiCard
          label="Ausencias"
          sub={
            isNum(m.tasaNoShow)
              ? <span style={{ color: 'var(--text-muted)' }}>{fmt(m.tasaNoShow, 1)}% de las confirmadas</span>
              : <span style={{ color: 'var(--text-muted)' }}>Sin datos aún</span>
          }
        >
          <CountUpValue value={m.citasNoShow} color={m.citasNoShow > 0 ? 'var(--red)' : 'var(--text-muted)'} deps={tabDeps} />
        </KpiCard>
        <KpiCard
          label="Llamadas a leads entrantes"
          sub={<span style={{ color: 'var(--text-muted)' }}>{periodoTxt}</span>}
        >
          <CountUpValue value={m.llamadasNuevas} deps={tabDeps} />
        </KpiCard>
        <KpiCard
          label="Intentos para agendar"
          sub={<span style={{ color: 'var(--text-muted)' }}>llamadas medias por cita conseguida</span>}
        >
          <CountUpValue value={m.intentosPorLead} decimals={1} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Agendamiento / Leads" sub={<span style={{ color: 'var(--text-muted)' }}>citas nuevas sobre leads del periodo</span>}>
          <CountUpValue value={m.tasaAgendamiento} decimals={1} suffix="%" color={rateColor(m.tasaAgendamiento)} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Agendamiento / Contactados" sub={<span style={{ color: 'var(--text-muted)' }}>de leads nuevos que cogen el teléfono</span>}>
          <CountUpValue value={m.tasaReunion} decimals={1} suffix="%" color={rateColor(m.tasaReunion)} deps={tabDeps} />
        </KpiCard>
        {!esPrevios && (
          <KpiCard label="Tiempo Respuesta" sub={<span style={{ color: 'var(--text-muted)' }}>desde lead → 1ª llamada</span>}>
            <CountUpValue value={m.tiempoRespuestaSeg} format={fmtDuracion} color={respColor(m.tiempoRespuestaSeg)} deps={tabDeps} />
          </KpiCard>
        )}
        <KpiCard label="Valoración Media">
          {isNum(m.valoracionMedia) ? (
            <div style={{ display: 'flex', alignItems: 'baseline', gap: 6 }}>
              <CountUpValue
                value={m.valoracionMedia}
                decimals={1}
                color={m.valoracionMedia >= 4 ? 'var(--green)' : m.valoracionMedia >= 3 ? 'var(--orange)' : 'var(--red)'}
                deps={tabDeps}
              />
              <span style={{ fontSize: 14, color: '#F5A623' }}>★</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>/5</span>
            </div>
          ) : (
            <span style={{ fontSize: 18, color: 'var(--text-muted)' }}>—</span>
          )}
        </KpiCard>
      </div>

      {showAsistidas && (
        <AsistenciasModal items={asistenciasAttended} onClose={() => setShowAsistidas(false)} />
      )}
    </section>
  );
}
