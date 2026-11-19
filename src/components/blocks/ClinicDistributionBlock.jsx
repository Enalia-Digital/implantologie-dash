import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, SectionLabel } from '../ui/primitives';
import { fmt, fmtPct, safeDiv } from '../../lib/calc';

// Colores reales y distintos por clínica (no una degradación de transparencia
// del morado). Separados en la rueda de color para distinguirlos de un vistazo:
// Triana morado de marca, Los Palacios naranja, San José turquesa.
const ROWS = [
  { key: 'triana', name: 'Triana', color: '#BF00FF' },
  { key: 'losPalacios', name: 'Los Palacios', color: '#FF7A00' },
  { key: 'sanJose', name: 'San José', color: '#00C2B8' },
];

const TRAT_COLOR = {
  implantologia: '#BF00FF',
  ortodoncia: '#FF7A00',
  estetica: '#00C2B8',
};

export default function ClinicDistributionBlock({ data }) {
  const pc = data.porClinica;
  if (!pc) return null;

  const rows = ROWS.map((r) => {
    const s = pc[r.key] || {};
    const leads = s.leads ?? 0;
    const citas = s.citas ?? 0;
    const asistencias = s.asistencias ?? 0;
    const ausencias = s.ausencias ?? 0;
    const tasaAsistencia = s.tasaAsistencia ?? null;
    const conv = safeDiv(citas, leads);
    return {
      ...r, leads, citas, asistencias, ausencias, tasaAsistencia,
      conv: conv === null ? null : conv * 100,
    };
  });

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalCitas = rows.reduce((s, r) => s + r.citas, 0);
  const totalAsist = rows.reduce((s, r) => s + r.asistencias, 0);
  const totalAusen = rows.reduce((s, r) => s + r.ausencias, 0);
  const totalConv = safeDiv(totalCitas, totalLeads);
  const totalConfirmadas = totalAsist + totalAusen;
  const totalTasaAsist = totalConfirmadas > 0
    ? parseFloat(((totalAsist / totalConfirmadas) * 100).toFixed(1))
    : null;

  const pieData = rows.map((r) => ({ name: r.name, value: r.leads, color: r.color }));

  // Tratamientos con más ausencias, ordenados de mayor a menor ausencia.
  const trats = (data.ausenciasPorTratamiento || [])
    .filter((t) => (t.confirmadas || 0) > 0)
    .sort((a, b) => b.ausencias - a.ausencias);
  const maxAusen = Math.max(1, ...trats.map((t) => t.ausencias));

  const th = {
    fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase',
    color: 'var(--text-muted)', padding: '0 0 10px', whiteSpace: 'nowrap',
  };

  return (
    <section>
      <SectionLabel>Distribución por Clínica</SectionLabel>
      <Card>
        <div className="clinic-dist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(300px, 1fr))', gap: 24, alignItems: 'center' }}>
          {/* Tabla */}
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12, minWidth: 360 }}>
              <thead>
                <tr>
                  <th style={{ ...th, textAlign: 'left' }}>Clínica</th>
                  <th style={{ ...th, textAlign: 'right' }}>Leads</th>
                  <th style={{ ...th, textAlign: 'right' }}>Citas</th>
                  <th style={{ ...th, textAlign: 'right' }} title="Pacientes que acudieron a la cita">Asist.</th>
                  <th style={{ ...th, textAlign: 'right' }} title="Pacientes que no acudieron (no-show)">Ausen.</th>
                  <th style={{ ...th, textAlign: 'right' }}>Conv.</th>
                </tr>
              </thead>
              <tbody>
                {rows.map((r) => (
                  <tr key={r.key} className="row-hover">
                    <td style={{ padding: '8px 0' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                        <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                        <span style={{ color: 'var(--text-primary)' }}>{r.name}</span>
                      </span>
                    </td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(r.leads)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-secondary)' }}>{fmt(r.citas)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--green)', fontWeight: 600 }}>{fmt(r.asistencias)}</td>
                    <td style={{ textAlign: 'right', color: r.ausencias > 0 ? 'var(--red)' : 'var(--text-muted)', fontWeight: r.ausencias > 0 ? 600 : 400 }}>{fmt(r.ausencias)}</td>
                    <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmtPct(r.conv)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--border-hairline)' }}>
                  <td style={{ padding: '10px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>TOTAL</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(totalLeads)}</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(totalCitas)}</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--green)' }}>{fmt(totalAsist)}</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: totalAusen > 0 ? 'var(--red)' : 'var(--text-muted)' }}>{fmt(totalAusen)}</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--accent)' }}>
                    {totalConv === null ? '—' : fmtPct(totalConv * 100)}
                  </td>
                </tr>
              </tbody>
            </table>
          </div>

          {/* Donut */}
          <div style={{ position: 'relative', height: 200 }}>
            <ResponsiveContainer width="100%" height="100%">
              <PieChart>
                <Pie data={pieData} dataKey="value" innerRadius={62} outerRadius={92} startAngle={90} endAngle={-270} paddingAngle={2} stroke="none">
                  {pieData.map((d) => (
                    <Cell key={d.name} fill={d.color} />
                  ))}
                </Pie>
              </PieChart>
            </ResponsiveContainer>
            <div style={{ position: 'absolute', inset: 0, display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center', pointerEvents: 'none' }}>
              <span style={{ fontSize: 24, fontWeight: 700, color: 'var(--text-primary)' }}>{fmt(totalLeads)}</span>
              <span style={{ fontSize: 11, color: 'var(--text-muted)' }}>leads</span>
            </div>
          </div>
        </div>
      </Card>

      {/* Tasa de asistencia por clínica */}
      <Card style={{ marginTop: 14 }}>
        <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
          Tasa de asistencia por clínica
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>
          De las citas ya pasadas, cuántas terminaron en asistencia. Base: citas confirmadas (asistió o faltó).
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          {rows.map((r) => {
            const confirmadas = r.asistencias + r.ausencias;
            const pct = r.tasaAsistencia;
            return (
              <div key={r.key}>
                <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-primary)' }}>
                    <span style={{ width: 8, height: 8, borderRadius: 2, background: r.color }} />
                    {r.name}
                  </span>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                    {pct === null ? (
                      <span style={{ color: 'var(--text-muted)' }}>Sin citas confirmadas</span>
                    ) : (
                      <>
                        <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmtPct(pct)}</b>
                        <span style={{ color: 'var(--text-muted)' }}> · {fmt(r.asistencias)} de {fmt(confirmadas)}</span>
                      </>
                    )}
                  </span>
                </div>
                <div style={{ height: 8, background: 'var(--bar-bg)', borderRadius: 4, overflow: 'hidden' }}>
                  <div style={{ height: 8, width: `${pct === null ? 0 : pct}%`, background: r.color, borderRadius: 4, transition: 'width 0.4s var(--ease-default)' }} />
                </div>
              </div>
            );
          })}
        </div>

        {totalTasaAsist !== null && (
          <div style={{ marginTop: 16, paddingTop: 14, borderTop: '1px solid var(--border-hairline)', display: 'flex', justifyContent: 'space-between', fontSize: 12 }}>
            <span style={{ color: 'var(--text-secondary)' }}>Media general</span>
            <span style={{ fontVariantNumeric: 'tabular-nums' }}>
              <b style={{ color: 'var(--accent)', fontWeight: 600 }}>{fmtPct(totalTasaAsist)}</b>
              <span style={{ color: 'var(--text-muted)' }}> · {fmt(totalAsist)} de {fmt(totalConfirmadas)}</span>
            </span>
          </div>
        )}
      </Card>

      {/* Ausencias por tratamiento */}
      {trats.length > 0 && (
        <Card style={{ marginTop: 14 }}>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', marginBottom: 4 }}>
            Ausencias por tratamiento
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 18 }}>
            A qué tratamiento se falta más. Base: citas ya pasadas con estado confirmado.
          </div>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            {trats.map((t, i) => {
              const color = TRAT_COLOR[t.key] || 'var(--accent)';
              const worst = i === 0 && t.ausencias > 0;
              return (
                <div key={t.key}>
                  <div style={{ display: 'flex', alignItems: 'baseline', justifyContent: 'space-between', marginBottom: 6 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 12, color: 'var(--text-primary)' }}>
                      <span style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
                      {t.label}
                      {worst && (
                        <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--red)', background: 'rgba(255,59,48,0.12)', borderRadius: 4, padding: '2px 6px' }}>
                          MÁS AUSENCIAS
                        </span>
                      )}
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums' }}>
                      <b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(t.ausencias)}</b>
                      <span style={{ color: 'var(--text-muted)' }}> ausencias · {fmtPct(t.tasaAusencia)} de {fmt(t.confirmadas)} citas</span>
                    </span>
                  </div>
                  <div style={{ height: 8, background: 'var(--bar-bg)', borderRadius: 4, overflow: 'hidden' }}>
                    <div style={{ height: 8, width: `${(t.ausencias / maxAusen) * 100}%`, background: color, borderRadius: 4, transition: 'width 0.4s var(--ease-default)' }} />
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      )}
    </section>
  );
}
