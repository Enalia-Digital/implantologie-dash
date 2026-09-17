import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { useClinic } from '../../context/ClinicContext';

// Reactivación en minimo: solo lo que aporta valor unico
// (lo demas ya vive en el bloque de KPIs superior). Estetica Apple: aire,
// tabular-nums, tipografia grande, un solo acento discreto.

export default function RetriesBlock({ data }) {
  const { period } = useClinic();

  const citasRescate = data?.citasRescate || 0;
  const leadsConReintento = data?.leadsConReintento || 0;
  const totalReintentos = data?.llamadasReintento || 0;

  // Si no hay nada, no ocupamos espacio.
  if (citasRescate === 0 && leadsConReintento === 0 && totalReintentos === 0) return null;

  return (
    <section>
      <SectionLabel>Reactivación</SectionLabel>
      <Card style={{ padding: 24, borderRadius: 20 }}>
        <div
          className="retries-mini"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1.4fr) minmax(0, 1fr) minmax(0, 1fr)',
            gap: 32,
            alignItems: 'baseline',
          }}
        >
          {/* Copy izquierda */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Rescate de leads viejos
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5,
            }}>
              Citas conseguidas de leads que entraron antes del periodo actual
            </div>
          </div>

          {/* Citas de rescate (metrica hero) */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              Citas de rescate
            </div>
            <div style={{
              fontSize: 32, fontWeight: 600, lineHeight: 1.05,
              color: 'var(--accent)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.015em',
            }}>
              <CountUpValue value={citasRescate} deps={[period]} />
            </div>
          </div>

          {/* Leads reactivados */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              Leads reactivados
            </div>
            <div style={{
              fontSize: 32, fontWeight: 600, lineHeight: 1.05,
              color: 'var(--blue)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.015em',
            }}>
              <CountUpValue value={leadsConReintento} deps={[period]} />
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        @media (max-width: 680px) {
          .retries-mini {
            grid-template-columns: 1fr 1fr !important;
            gap: 14px !important;
            align-items: start !important;
          }
          .retries-mini > :first-child {
            grid-column: 1 / -1;
          }
        }
      `}</style>
    </section>
  );
}
