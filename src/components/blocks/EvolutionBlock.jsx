import { useState } from 'react';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, SectionLabel } from '../ui/primitives';
import ChartTooltip from '../ui/ChartTooltip';

const SERIES = [
  { key: 'leads', name: 'Leads', color: '#BF00FF' },
  { key: 'contactados', name: 'Contactados', color: '#4D8FE8' },
  { key: 'citas', name: 'Citas', color: '#34C78A' },
];

export default function EvolutionBlock({ data }) {
  const [active, setActive] = useState({ leads: true, contactados: false, citas: true });

  return (
    <section>
      <SectionLabel>Evolución Temporal</SectionLabel>
      <Card>
        <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 18, flexWrap: 'wrap', gap: 10 }}>
          <span style={{ display: 'flex', flexDirection: 'column', gap: 2 }}>
            <span style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>Rendimiento diario</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
              Contactados = leads que cogieron el teléfono
            </span>
          </span>
          <div style={{ display: 'flex', gap: 6 }}>
            {SERIES.map((s) => {
              const on = active[s.key];
              return (
                <button
                  key={s.key}
                  onClick={() => setActive((a) => ({ ...a, [s.key]: !a[s.key] }))}
                  style={{
                    display: 'flex',
                    alignItems: 'center',
                    gap: 6,
                    padding: '4px 10px',
                    borderRadius: 6,
                    border: `1px solid ${on ? 'var(--border-medium)' : 'var(--border-hairline)'}`,
                    background: on ? 'var(--bg-hover)' : 'transparent',
                    fontSize: 11,
                    color: on ? 'var(--text-primary)' : 'var(--text-muted)',
                  }}
                >
                  <span style={{ width: 8, height: 8, borderRadius: '50%', background: on ? s.color : 'var(--text-muted)' }} />
                  {s.name}
                </button>
              );
            })}
          </div>
        </div>

        <div style={{ height: 220 }}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={data.evolucion} margin={{ top: 8, right: 8, left: 0, bottom: 0 }}>
              <defs>
                {SERIES.map((s) => (
                  <linearGradient key={s.key} id={`grad-${s.key}`} x1="0" y1="0" x2="0" y2="1">
                    <stop offset="0%" stopColor={s.color} stopOpacity={0.12} />
                    <stop offset="100%" stopColor={s.color} stopOpacity={0} />
                  </linearGradient>
                ))}
              </defs>
              <CartesianGrid strokeDasharray="1 4" stroke="var(--chart-grid)" vertical={false} />
              <XAxis dataKey="dia" axisLine={false} tickLine={false} tick={{ fill: 'var(--text-muted)', fontSize: 10 }} />
              <YAxis hide />
              <Tooltip content={<ChartTooltip />} cursor={{ stroke: 'var(--border-subtle)' }} />
              {SERIES.filter((s) => active[s.key]).map((s) => (
                <Area
                  key={s.key}
                  type="monotone"
                  dataKey={s.key}
                  name={s.name}
                  stroke={s.color}
                  strokeWidth={2}
                  fill={`url(#grad-${s.key})`}
                  dot={false}
                  activeDot={{ r: 3, fill: s.color }}
                />
              ))}
            </AreaChart>
          </ResponsiveContainer>
        </div>
      </Card>
    </section>
  );
}
