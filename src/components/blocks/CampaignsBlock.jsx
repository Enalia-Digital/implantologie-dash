import { Card, SectionLabel } from '../ui/primitives';
import { fmt, fmtPct } from '../../lib/calc';

function convColor(v) {
  if (v >= 20) return 'var(--green)';
  if (v >= 10) return 'var(--orange)';
  return 'var(--red)';
}

export default function CampaignsBlock({ data }) {
  const rows = data.campanas;
  const bestIdx = rows.reduce((best, r, i, arr) => (r.citas > arr[best].citas ? i : best), 0);
  const maxConv = Math.max(...rows.map((r) => r.conv), 1);

  const th = { fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 12px', whiteSpace: 'nowrap' };
  const td = { fontSize: 12, color: 'var(--text-secondary)', padding: '11px 12px' };

  return (
    <section>
      <SectionLabel>Rendimiento de Campañas</SectionLabel>
      <Card style={{ paddingBottom: 4, overflowX: 'auto' }}>
        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ ...th, textAlign: 'left' }}>Campaña</th>
              <th style={{ ...th, textAlign: 'left' }}>Anuncio</th>
              <th style={{ ...th, textAlign: 'right' }}>Leads</th>
              <th style={{ ...th, textAlign: 'right' }}>Contactados</th>
              <th style={{ ...th, textAlign: 'right' }}>Cualificados</th>
              <th style={{ ...th, textAlign: 'right' }}>Citas</th>
              <th style={{ ...th, textAlign: 'right' }}>Conversión</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => (
              <tr key={`${r.campaña}-${r.anuncio}`} className="row-hover" style={{ borderTop: '1px solid var(--border-hairline)' }}>
                <td style={{ ...td, color: 'var(--text-primary)' }}>{r.campaña}</td>
                <td style={td}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                    {r.anuncio}
                    {i === bestIdx && (
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--accent)', background: 'rgba(191,0,255,0.12)', border: '1px solid var(--accent-border)', borderRadius: 4, padding: '2px 6px' }}>
                        MEJOR
                      </span>
                    )}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>{fmt(r.leads)}</td>
                <td style={{ ...td, textAlign: 'right' }}>{fmt(r.contactados)}</td>
                <td style={{ ...td, textAlign: 'right' }}>{fmt(r.cualificados)}</td>
                <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(r.citas)}</td>
                <td style={{ ...td, textAlign: 'right' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                    <span style={{ width: 36, height: 4, background: 'rgba(0,0,0,0.06)', borderRadius: 2, overflow: 'hidden' }}>
                      <span style={{ display: 'block', height: 4, width: `${(r.conv / maxConv) * 100}%`, background: convColor(r.conv), borderRadius: 2 }} />
                    </span>
                    <span style={{ color: convColor(r.conv), fontWeight: 600 }}>{fmtPct(r.conv)}</span>
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
