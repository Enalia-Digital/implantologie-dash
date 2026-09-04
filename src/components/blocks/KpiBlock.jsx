import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { isNum, fmtDuracion } from '../../lib/calc';
import { nombreAgente } from '../../data/config';

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

function KpiCard({ label, children, sub, accent }) {
  return (
    <Card accent={accent} style={{ padding: '18px 20px' }}>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }}>
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, lineHeight: 1.1 }}>{children}</div>
      {sub && <div style={{ fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

export default function KpiBlock({ data, deps, vista = 'activacion' }) {
  const seg = data.segmentos;

  // Si no hay segmentación configurada, se muestran las métricas globales.
  const m = seg
    ? (vista === 'previos' ? seg.previos : seg.activacion)
    : {
        totalLeads: data.totalLeads,
        leadsContactados: data.leadsContactados,
        citasAgendadas: data.citasAgendadas,
        citasAsistidas: data.citasAsistidas,
        totalLlamadas: data.totalLlamadas,
        intentosPorLead: data.totalLeads > 0 ? data.totalLlamadas / data.totalLeads : null,
        tasaReunion: data.leadsContactados > 0 ? (data.citasAgendadas / data.leadsContactados) * 100 : null,
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
        <KpiCard label="Citas Agendadas" accent>
          <CountUpValue value={m.citasAgendadas} color="var(--accent)" deps={tabDeps} />
        </KpiCard>
      </div>

      <div className="kpi-grid-detail">
        <KpiCard
          label="Citas Asistidas"
          sub={!m.citasAsistidas ? <span style={{ color: 'var(--text-muted)' }}>Se actualiza cada día</span> : null}
        >
          <CountUpValue value={m.citasAsistidas} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Total Llamadas">
          <CountUpValue value={m.totalLlamadas} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Intentos / Lead">
          <CountUpValue value={m.intentosPorLead} decimals={1} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Agendamiento / Leads" sub={<span style={{ color: 'var(--text-muted)' }}>citas sobre todos los leads</span>}>
          <CountUpValue value={m.tasaAgendamiento} decimals={1} suffix="%" color={rateColor(m.tasaAgendamiento)} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Agendamiento / Contactados" sub={<span style={{ color: 'var(--text-muted)' }}>de los que cogen el teléfono</span>}>
          <CountUpValue value={m.tasaReunion} decimals={1} suffix="%" color={rateColor(m.tasaReunion)} deps={tabDeps} />
        </KpiCard>
        <KpiCard label="Tiempo Respuesta" sub={<span style={{ color: 'var(--text-muted)' }}>desde lead → 1ª llamada</span>}>
          <CountUpValue value={m.tiempoRespuestaSeg} format={fmtDuracion} color={respColor(m.tiempoRespuestaSeg)} deps={tabDeps} />
        </KpiCard>
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
    </section>
  );
}
