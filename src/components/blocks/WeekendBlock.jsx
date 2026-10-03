import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { useClinic } from '../../context/ClinicContext';
import { fmt } from '../../lib/calc';

// Experimento: llamada en fin de semana.
// Leads que aceptaron en el formulario ser llamados en finde → cuántos agendan
// → cuántos cerraron en la primera llamada (la de finde). Sirve para decidir
// si merece la pena mantener/ajustar la pregunta del formulario.
export default function WeekendBlock({ data }) {
  const { period } = useClinic();

  const aceptan = data?.finSemanaAceptan || 0;
  const agendados = data?.finSemanaAgendados || 0;
  const primera = data?.finSemanaPrimera || 0;

  // Si nadie ha aceptado aún, no mostramos el bloque.
  if (aceptan === 0) return null;

  const pctAgenda = aceptan > 0 ? (agendados / aceptan) * 100 : null;
  const pctPrimera = agendados > 0 ? (primera / agendados) * 100 : null;

  const Metric = ({ label, value, sub, color }) => (
    <div style={{ minWidth: 0 }}>
      <div style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6,
      }}>
        {label}
      </div>
      <div style={{
        fontSize: 32, fontWeight: 600, lineHeight: 1.05,
        color: color || 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums', letterSpacing: '-0.015em',
      }}>
        <CountUpValue value={value} deps={[period]} />
      </div>
      {sub && <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>{sub}</div>}
    </div>
  );

  return (
    <section>
      <SectionLabel>Llamada en fin de semana</SectionLabel>
      <Card style={{ padding: 24, borderRadius: 20 }}>
        <div
          className="retries-mini"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr) minmax(0, 1fr)',
            gap: 28, alignItems: 'baseline',
          }}
        >
          <div style={{ minWidth: 0 }}>
            <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>
              Experimento de fin de semana
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5 }}>
              Leads que aceptaron en el formulario que les llamemos en fin de semana. La primera
              llamada se hace en finde; el resto, en horario.
            </div>
          </div>

          <Metric label="Aceptan finde" value={aceptan} color="var(--accent)" />
          <Metric
            label="Agendan"
            value={agendados}
            color="var(--blue)"
            sub={pctAgenda !== null ? `${fmt(pctAgenda, 0)}% de los que aceptan` : null}
          />
          <Metric
            label="A la 1ª (finde)"
            value={primera}
            color="var(--green)"
            sub={pctPrimera !== null ? `${fmt(pctPrimera, 0)}% de los agendados` : null}
          />
        </div>
      </Card>

      <style>{`
        @media (max-width: 680px) {
          .retries-mini {
            grid-template-columns: 1fr 1fr !important;
            gap: 16px !important;
            align-items: start !important;
          }
          .retries-mini > :first-child { grid-column: 1 / -1; }
        }
      `}</style>
    </section>
  );
}
