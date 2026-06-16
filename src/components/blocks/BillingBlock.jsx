import { Card, SectionLabel } from '../ui/primitives';
import { comision, isNum, fmt, fmtEur } from '../../lib/calc';

function Metric({ label, value, accent }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: accent ? 'var(--accent)' : 'var(--text-primary)' }}>{value}</div>
    </div>
  );
}

export default function BillingBlock({ data, config, isAdmin }) {
  const com = comision(data, config);
  const mant = config.mantenimientoMensual;
  const comValue = isNum(com.comision) ? com.comision : 0;
  const costeLlamadas = isNum(data.costeLlamadas) ? data.costeLlamadas : 0;
  const total = mant + comValue + (isAdmin ? costeLlamadas : 0);

  const td = { fontSize: 12, padding: '11px 0', color: 'var(--text-secondary)' };

  return (
    <section>
      <SectionLabel>Facturación — Mayo 2026</SectionLabel>
      <Card style={{ border: '1px solid rgba(191,0,255,0.20)' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: 20, marginBottom: 20 }}>
          <Metric label="Citas Asistidas" value={isNum(data.citasAsistidas) ? fmt(data.citasAsistidas) : '—'} />
          <Metric label="Comisión" value={isNum(com.comision) ? fmtEur(com.comision) : '—'} />
          <Metric label="Mantenimiento" value={fmtEur(mant)} />
          <Metric label="Total" value={fmtEur(total)} accent />
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse' }}>
          <tbody>
            <tr style={{ borderTop: '1px solid var(--border-hairline)' }}>
              <td style={td}>Mantenimiento mensual</td>
              <td style={{ ...td, textAlign: 'right' }} />
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmtEur(mant)}</td>
            </tr>
            {isAdmin && (
              <tr style={{ borderTop: '1px solid var(--border-hairline)' }}>
                <td style={td}>Coste llamadas</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  {fmt(data.callMinutes)} min · {fmt(config.costePorMinuto, 2)} €/min
                </td>
                <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmtEur(data.costeLlamadas, 2)}</td>
              </tr>
            )}
            <tr style={{ borderTop: '1px solid var(--border-hairline)' }}>
              <td style={td}>Comisión por asistencia</td>
              <td style={{ ...td, textAlign: 'right' }}>
                {isNum(com.asistidasExtra) ? `${fmt(com.asistidasExtra)} citas · ${config.feePorAsistida} €` : 'Pendiente'}
              </td>
              <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>
                {isNum(com.comision) ? fmtEur(com.comision) : '—'}
              </td>
            </tr>
            <tr>
              <td style={{ fontSize: 13, fontWeight: 700, color: 'var(--accent)', padding: '12px 12px', background: 'rgba(191,0,255,0.06)' }}>TOTAL</td>
              <td style={{ background: 'rgba(191,0,255,0.06)' }} />
              <td style={{ fontSize: 15, fontWeight: 700, color: 'var(--accent)', textAlign: 'right', padding: '12px 12px', background: 'rgba(191,0,255,0.06)' }}>
                {fmtEur(total)}
              </td>
            </tr>
          </tbody>
        </table>

        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 14 }}>
          La comisión se calcula sobre las asistencias confirmadas en la reunión semanal.
        </div>
      </Card>
    </section>
  );
}
