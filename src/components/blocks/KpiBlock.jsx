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
          fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
          textTransform: 'uppercase', color: 'var(--text-muted)',
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

  return (
    <section>
      <SectionLabel>Métricas Principales</SectionLabel>

      <div className="kpi-grid-main" style={{ marginBottom: 12 }}>
        <KpiCard
          label="Leads Contactados"
          sub={<Delta value={isNum(data.leadsDelta) ? data.leadsDelta : null} />}
        >
          <CountUpValue value={data.leadsContactados} deps={deps} />
        </KpiCard>
        <KpiCard label="Citas Agendadas" accent>
          <CountUpValue value={data.citasAgendadas} color="var(--accent)" deps={deps} />
        </KpiCard>
        <KpiCard
          label="Citas Asistidas"
          sub={
            !isNum(data.citasAsistidas)
              ? <span style={{ color: 'var(--orange)' }}>Pendiente</span>
              : null
          }
        >
          <CountUpValue value={data.citasAsistidas} deps={deps} />
        </KpiCard>
      </div>

      <div className="kpi-grid-detail">
        <KpiCard label="Total Llamadas">
          <CountUpValue value={data.totalLlamadas} deps={deps} />
        </KpiCard>
        <KpiCard label="Intentos / Lead">
          <CountUpValue value={intentos} decimals={1} deps={deps} />
        </KpiCard>
        <KpiCard label="Tasa Reunión">
          <CountUpValue
            value={tasaReunion}
            decimals={1}
            suffix="%"
            color={rateColor(tasaReunion)}
            deps={deps}
          />
        </KpiCard>
        <KpiCard label="Tiempo Contacto">
          <CountUpValue value={data.tiempoContactoMin} decimals={1} suffix=" min" deps={deps} />
        </KpiCard>
      </div>
    </section>
  );
}
