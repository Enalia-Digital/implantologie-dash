import { useState } from 'react';
import { Card, SectionLabel, StatusBadge, ScoreDots } from '../ui/primitives';

function RecordingButton() {
  return (
    <button
      onClick={(e) => e.stopPropagation()}
      style={{ display: 'inline-flex', alignItems: 'center', gap: 6, background: 'transparent', border: '1px solid var(--border-subtle)', borderRadius: 6, padding: '5px 10px', fontSize: 11, color: 'var(--text-secondary)' }}
    >
      <svg width="10" height="10" viewBox="0 0 12 12" fill="none" stroke="var(--text-muted)" strokeWidth="1.2">
        <path d="M4 3l5 3-5 3V3Z" strokeLinejoin="round" />
      </svg>
      Grabación
    </button>
  );
}

export default function LeadsBlock({ data }) {
  const [open, setOpen] = useState(null);

  return (
    <section>
      <SectionLabel>Leads Recientes</SectionLabel>
      <Card style={{ padding: 0, overflow: 'hidden' }}>
        {data.leadsRecientes.map((lead, i) => {
          const expanded = open === i;
          const dest = lead.cita ? `Cita ${lead.cita}` : lead.status === 'callback' ? 'Callback pendiente' : '—';
          return (
            <div key={lead.nombre} style={{ borderTop: i === 0 ? 'none' : '1px solid var(--border-hairline)' }}>
              <div
                className="row-hover"
                onClick={() => setOpen(expanded ? null : i)}
                style={{ display: 'grid', gridTemplateColumns: 'minmax(140px,1.4fr) minmax(120px,1fr) minmax(140px,1.4fr) auto', alignItems: 'center', gap: 16, padding: '14px 20px', cursor: 'pointer' }}
              >
                <div>
                  <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{lead.nombre}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{lead.telefono}</div>
                </div>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
                  <StatusBadge status={lead.status} />
                  <ScoreDots score={lead.score} />
                </div>
                <div>
                  <div style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{lead.anuncio}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{dest}</div>
                </div>
                <RecordingButton />
              </div>
              {expanded && (
                <div className="fade-in-up" style={{ padding: '0 20px 16px', background: 'var(--bg-hover)' }}>
                  <div style={{ paddingTop: 12, fontSize: 12, color: 'var(--text-secondary)', lineHeight: 1.5 }}>
                    {lead.summary || 'Sin resumen de la llamada.'}
                  </div>
                  {lead.objection && (
                    <div style={{ marginTop: 8, fontSize: 11, color: 'var(--text-muted)' }}>
                      Objeción detectada: <span style={{ color: 'var(--orange)' }}>{lead.objection}</span>
                    </div>
                  )}
                </div>
              )}
            </div>
          );
        })}
      </Card>
    </section>
  );
}
