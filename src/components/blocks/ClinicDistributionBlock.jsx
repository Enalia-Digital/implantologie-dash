import { PieChart, Pie, Cell, ResponsiveContainer } from 'recharts';
import { Card, SectionLabel } from '../ui/primitives';
import { fmt, fmtPct, safeDiv } from '../../lib/calc';

const ROWS = [
  { key: 'triana', name: 'Triana', color: '#BF00FF' },
  { key: 'losPalacios', name: 'Los Palacios', color: 'rgba(191,0,255,0.5)' },
  { key: 'sanJose', name: 'San José', color: 'rgba(191,0,255,0.22)' },
];

export default function ClinicDistributionBlock({ data }) {
  const pc = data.porClinica;
  if (!pc) return null;

  const rows = ROWS.map((r) => {
    const leads = pc[r.key]?.leads ?? 0;
    const citas = pc[r.key]?.citas ?? 0;
    const conv = safeDiv(citas, leads);
    return { ...r, leads, citas, conv: conv === null ? null : conv * 100 };
  });

  const totalLeads = rows.reduce((s, r) => s + r.leads, 0);
  const totalCitas = rows.reduce((s, r) => s + r.citas, 0);
  const totalConv = safeDiv(totalCitas, totalLeads);

  const pieData = rows.map((r) => ({ name: r.name, value: r.leads, color: r.color }));

  return (
    <section>
      <SectionLabel>Distribución por Clínica</SectionLabel>
      <Card>
        <div className="clinic-dist-grid" style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))', gap: 24, alignItems: 'center' }}>
          {/* Tabla */}
          <div>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 12 }}>
              <thead>
                <tr style={{ textAlign: 'left' }}>
                  {['Clínica', 'Leads', 'Citas', 'Conversión'].map((h, i) => (
                    <th key={h} style={{ fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 0 10px', textAlign: i === 0 ? 'left' : 'right' }}>
                      {h}
                    </th>
                  ))}
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
                    <td style={{ textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmtPct(r.conv)}</td>
                  </tr>
                ))}
                <tr style={{ borderTop: '1px solid var(--border-hairline)' }}>
                  <td style={{ padding: '10px 0 0', fontWeight: 600, color: 'var(--text-primary)' }}>TOTAL</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(totalLeads)}</td>
                  <td style={{ padding: '10px 0 0', textAlign: 'right', fontWeight: 600, color: 'var(--text-primary)' }}>{fmt(totalCitas)}</td>
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
    </section>
  );
}
