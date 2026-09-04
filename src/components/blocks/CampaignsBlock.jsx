import { Fragment, useState } from 'react';
import { Card, SectionLabel } from '../ui/primitives';
import { fmt, fmtPct } from '../../lib/calc';

function convColor(v) {
  if (v >= 20) return 'var(--green)';
  if (v >= 10) return 'var(--orange)';
  return 'var(--red)';
}

function estadoColor(e) {
  if (e === 'Agendado') return 'var(--green)';
  if (e === 'Contactado') return 'var(--accent)';
  if (e === 'Sin descolgar') return 'var(--orange)';
  return 'var(--text-muted)';
}

export default function CampaignsBlock({ data }) {
  const [openKey, setOpenKey] = useState(null);
  const rows = data.campanas;
  if (!rows || rows.length === 0) return null;

  const bestIdx = rows.reduce((best, r, i, arr) => (r.citas > arr[best].citas ? i : best), 0);
  const maxConv = Math.max(...rows.map((r) => r.conv), 1);

  const th = { fontSize: 10, fontWeight: 500, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 12px 12px', whiteSpace: 'nowrap' };
  const td = { fontSize: 12, color: 'var(--text-secondary)', padding: '11px 12px' };

  return (
    <section>
      <SectionLabel>Rendimiento de Campañas</SectionLabel>
      <Card style={{ paddingBottom: 4, overflowX: 'auto' }}>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
          Pulsa una campaña para ver sus leads. <b style={{ fontWeight: 600 }}>Contactados</b> son los que cogieron el teléfono.
        </div>

        <table style={{ width: '100%', borderCollapse: 'collapse', minWidth: 640 }}>
          <thead>
            <tr style={{ textAlign: 'left' }}>
              <th style={{ ...th, textAlign: 'left' }}>Campaña</th>
              <th style={{ ...th, textAlign: 'left' }}>Anuncio</th>
              <th style={{ ...th, textAlign: 'right' }}>Leads</th>
              <th style={{ ...th, textAlign: 'right' }}>Contactados</th>
              <th style={{ ...th, textAlign: 'right' }}>Citas</th>
              <th style={{ ...th, textAlign: 'right' }} title="Citas agendadas sobre el total de leads de la campaña">Agendamiento</th>
            </tr>
          </thead>
          <tbody>
            {rows.map((r, i) => {
              const open = openKey === i;
              const detalles = r.detalles || [];
              return (
                <Fragment key={`${r.campaña}-${r.anuncio}`}>
                  <tr
                    className="row-hover"
                    onClick={() => setOpenKey(open ? null : i)}
                    style={{ borderTop: '1px solid var(--border-hairline)', cursor: 'pointer' }}
                  >
                    <td style={{ ...td, color: 'var(--text-primary)' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7 }}>
                        <svg
                          width="10" height="10" viewBox="0 0 10 10" fill="none"
                          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-default)', flexShrink: 0 }}
                        >
                          <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                        </svg>
                        {r.campaña}
                      </span>
                    </td>
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
                    <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(r.citas)}</td>
                    <td style={{ ...td, textAlign: 'right' }}>
                      <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, justifyContent: 'flex-end' }}>
                        <span style={{ width: 36, height: 4, background: 'var(--bar-bg)', borderRadius: 2, overflow: 'hidden' }}>
                          <span style={{ display: 'block', height: 4, width: `${(r.conv / maxConv) * 100}%`, background: convColor(r.conv), borderRadius: 2 }} />
                        </span>
                        <span style={{ color: convColor(r.conv), fontWeight: 600 }}>{fmtPct(r.conv)}</span>
                      </span>
                    </td>
                  </tr>

                  {open && detalles.length > 0 && (
                    <tr>
                      <td colSpan={6} style={{ padding: '0 12px 14px 31px', background: 'var(--row-hover)' }}>
                        {detalles.map((d, j) => (
                          <div
                            key={j}
                            style={{
                              display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                              padding: '8px 0', borderTop: '1px solid var(--border-hairline)',
                            }}
                          >
                            <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', minWidth: 190 }}>{d.nombre}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 44 }}>{d.fecha}</span>
                            <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 84 }}>{d.clinica}</span>
                            <span style={{ fontSize: 10, fontWeight: 600, color: estadoColor(d.estado) }}>{d.estado}</span>
                          </div>
                        ))}
                      </td>
                    </tr>
                  )}
                </Fragment>
              );
            })}
          </tbody>
        </table>
      </Card>
    </section>
  );
}
