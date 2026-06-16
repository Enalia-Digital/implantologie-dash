import { Card, SectionLabel, CountUpValue, Delta } from '../ui/primitives';
import { intentosPorLead, tasaLlamadaReunion, isNum } from '../../lib/calc';

function rateColor(v) {
  if (!isNum(v)) return 'var(--text-secondary)';
  if (v >= 30) return 'var(--green)';
  if (v >= 15) return 'var(--orange)';
  return 'var(--red)';
}

function KpiCard({ label, children, sub, accent }) {
  return (
    <Card accent={accent} style={{ padding: '18px 20px' }}>
      <div
        style={{
          fontSize: 10,
          fontWeight: 500,
          letterSpacing: '0.06em',
          textTransform: 'uppercase',
          color: 'var(--text-muted)',
        }}
      >
        {label}
      </div>
      <div style={{ fontSize: 26, fontWeight: 700, marginTop: 8, lineHeight: 1.1 }}>{children}</div>
      {sub && <div style={{ fontSize: 11, marginTop: 6 }}>{sub}</div>}
    </Card>
  );
}

export default function KpiBlock({ data, deps }) {
  const intentos = intentosPorLead(data);
  const tasaReunion = tasaLlamadaReunion(data);
  const tiempoColor = isNum(data.tiempoContactoMin) && data.tiempoContactoMin < 5 ? 'var(--green)' : 'var(--text-primary)';

  return (
    <section>
      <SectionLabel>Métricas Principales</SectionLabel>
      <div
        style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
          gap: 12,
        }}
      >
        <KpiCard
          label="Leads Contactados"
          sub={<Delta value={isNum(data.leadsDelta) ? data.leadsDelta : null} />}
        >
          <CountUpValue value={data.leadsContactados} deps={deps} />
        </KpiCard>

        <KpiCard label="Total Llamadas">
          <CountUpValue value={data.totalLlamadas} deps={deps} />
        </KpiCard>

        <KpiCard
          label="Intentos Medios / Lead"
          sub={<span style={{ color: 'var(--text-muted)' }}>llamadas por lead</span>}
        >
          <CountUpValue value={intentos} decimals={1} deps={deps} />
        </KpiCard>

        <KpiCard label="Tasa Llamada → Reunión">
          <CountUpValue value={tasaReunion} decimals={1} suffix="%" color={rateColor(tasaReunion)} deps={deps} />
        </KpiCard>

        <KpiCard label="Citas Agendadas" accent>
          <CountUpValue value={data.citasAgendadas} color="var(--accent)" deps={deps} />
        </KpiCard>

        <KpiCard
          label="Citas Asistidas"
          sub={<span style={{ color: 'var(--text-muted)' }}>dato semanal</span>}
        >
          <CountUpValue value={data.citasAsistidas} deps={deps} />
        </KpiCard>

        <KpiCard label="Tiempo Contacto">
          <CountUpValue value={data.tiempoContactoMin} decimals={1} suffix=" min" color={tiempoColor} deps={deps} />
        </KpiCard>
      </div>
    </section>
  );
}
