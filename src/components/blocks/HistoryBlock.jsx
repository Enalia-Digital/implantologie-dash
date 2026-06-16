import { ComposedChart, Bar, Line, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer } from 'recharts';
import { Card, SectionLabel } from '../ui/primitives';
import ChartTooltip from '../ui/ChartTooltip';
import { isNum, fmt, fmtEur, fmtPct, safeDiv } from '../../lib/calc';

function leadCita(row) {
  const r = safeDiv(row.citas, row.leads);
  return r === null ? null : r * 100;
}

const ROWS = [
  { key: 'leads', label: 'Leads', get: (r) => r.leads, fmt: (v) => fmt(v), delta: 'num' },
  { key: 'citas', label: 'Citas', get: (r) => r.citas, fmt: (v) => fmt(v), delta: 'num' },
  { key: 'asistidas', label: 'Asistidas', get: (r) => r.asistidas, fmt: (v) => fmt(v), delta: 'num' },
  { key: 'tasa', label: 'Tasa lead → cita', get: (r) => leadCita(r), fmt: (v) => fmtPct(v), delta: 'pts' },
  { key: 'coste', label: 'Coste', get: (r) => r.coste, fmt: (v) => fmtEur(v, 2), delta: 'none' },
  { key: 'revenue', label: 'Revenue', get: (r) => r.revenue, fmt: (v) => fmtEur(v), delta: 'none' },
  { key: 'roi', label: 'ROI', get: (r) => r.roi, fmt: (v) => (isNum(v) ? `${fmt(v, 1)}×` : '—'), delta: 'none' },
];

function Cell({ row, hist, idx }) {
  const v = row.get(hist[idx]);
  const prev = idx > 0 ? row.get(hist[idx - 1]) : null;
  let delta = null;
  if (row.delta !== 'none' && isNum(v) && isNum(prev)) {
    const d = v - prev;
    if (Math.abs(d) > 0.05) {
      const txt = row.delta === 'pts' ? `${d >= 0 ? '+' : ''}${fmt(d, 1)} pts` : `${d >= 0 ? '+' : ''}${fmt(d, 0)}`;
      delta = { txt, up: d >= 0 };
    }
  }
  return (
    <td style={{ padding: '10px 14px', textAlign: 'right', whiteSpace: 'nowrap' }}>
      <div style={{ fontSize: 12, color: 'var(--text-primary)', fontWeight: 500 }}>{row.fmt(v)}</div>
      {delta && (
        <div style={{ fontSize: 10, fontWeight: 600, color: delta.up ? 'var(--green)' : 'var(--red)', marginTop: 2 }}>{delta.txt}</div>
      )}
    </td>
  );
}

export default function HistoryBlock({ data }) {
  const hist = data.historico;
  const lastIdx = hist.length - 1;

  return (
    <section>
      <SectionLabel>Histórico Mes a Mes</SectionLabel>
      <Card>
        <div style={{ overflowX: 'auto' }}>
          <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 520 }}>
            <thead>
              <tr>
                <th style={{ textAlign: 'left', padding: '0 14px 12px', fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)' }} />
                {hist.map((m, i) => (
                  <th
                    key={m.mes}
                    style={{
                      textAlign: 'right',
                      padding: '0 14px 12px',
                      fontSize: 11,
                      fontWeight: 600,
                      color: i === lastIdx ? 'var(--accent)' : 'var(--text-secondary)',
                      background: i === lastIdx ? 'rgba(191,0,255,0.04)' : 'transparent',
                    }}
                  >
                    {m.mes}
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {ROWS.map((row) => (
                <tr key={row.key} style={{ borderTop: '1px solid var(--border-hairline)' }}>
                  <td style={{ padding: '10px 14px', fontSize: 12, color: 'var(--text-secondary)', whiteSpace: 'nowrap' }}>{row.label}</td>
                  {hist.map((m, i) => (
                    <td key={m.mes} style={{ padding: 0, background: i === lastIdx ? 'rgba(191,0,255,0.04)' : 'transparent' }}>
                      <table style={{ width: '100%' }}>
                        <tbody>
                          <tr>
                            <Cell row={row} hist={hist} idx={i} />
                          </tr>
                        </tbody>
                      </table>
                    </td>
                  ))}
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div style={{ height: 200, marginTop: 24 }}>
          <ResponsiveContainer width="100%" height="100%">
            <ComposedChart data={hist} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <CartesianGrid strokeDasharray="1 4" stroke="rgba(255,255,255,0.04)" vertical={false} />
              <XAxis dataKey="mes" axisLine={false} tickLine={false} tick={{ fill: '#55556A', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip formatter={(v, key) => (key === 'roi' ? `${fmt(v, 1)}×` : fmt(v))} />} cursor={{ fill: 'rgba(255,255,255,0.03)' }} />
              <Legend wrapperStyle={{ fontSize: 11, color: 'var(--text-muted)' }} iconType="circle" iconSize={8} />
              <Bar dataKey="leads" name="Leads" fill="#BF00FF" radius={[3, 3, 0, 0]} barSize={14} />
              <Bar dataKey="citas" name="Citas" fill="#34C78A" radius={[3, 3, 0, 0]} barSize={14} />
              <Line type="monotone" dataKey="roi" name="ROI" stroke="#BF00FF" strokeWidth={2} dot={{ r: 3, fill: '#BF00FF' }} connectNulls={false} />
            </ComposedChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
