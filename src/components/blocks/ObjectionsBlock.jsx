import { useState } from 'react';
import { Card, SectionLabel } from '../ui/primitives';
import AudioPlayer from '../ui/AudioPlayer';
import { fmt } from '../../lib/calc';

function barColor(i) {
  if (i === 0) return '#BF00FF';
  if (i === 1) return 'rgba(191,0,255,0.7)';
  if (i === 2) return '#4D8FE8';
  return 'var(--text-muted)';
}

function Chevron({ open }) {
  return (
    <svg
      width="10" height="10" viewBox="0 0 10 10" fill="none"
      style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-default)', flexShrink: 0 }}
    >
      <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

function DetalleRow({ d }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'flex-start', gap: 12,
        padding: '10px 0', borderTop: '1px solid var(--border-hairline)',
      }}
    >
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, flexWrap: 'wrap', marginBottom: 3 }}>
          <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)' }}>{d.nombre}</span>
          <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{d.fecha}</span>
          {d.atendida === false && (
            <span style={{ fontSize: 9, color: 'var(--orange)', border: '1px solid rgba(208,138,31,0.35)', borderRadius: 4, padding: '1px 5px' }}>
              No descolgó
            </span>
          )}
        </div>
        <div style={{ fontSize: 11, color: 'var(--accent)', marginBottom: 3 }}>«{d.texto}»</div>
        {d.resumen && (
          <div style={{ fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45 }}>{d.resumen}</div>
        )}
      </div>
      {d.recordingUrl && (
        <AudioPlayer src={d.recordingUrl} duration={d.duracion} compact />
      )}
    </div>
  );
}

export default function ObjectionsBlock({ data }) {
  const [openKey, setOpenKey] = useState(null);
  const items = [...(data.objeciones || [])].sort((a, b) => b.count - a.count);
  if (items.length === 0) return null;

  const max = Math.max(...items.map((o) => o.count), 1);

  return (
    <section>
      <SectionLabel>Objeciones Detectadas</SectionLabel>
      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
          Pulsa una objeción para ver quién la dijo y escuchar la llamada.
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 4 }}>
          {items.map((o, i) => {
            const open = openKey === o.label;
            const detalles = o.detalles || [];
            return (
              <div key={o.label}>
                <button
                  onClick={() => setOpenKey(open ? null : o.label)}
                  style={{
                    width: '100%', border: 'none', background: 'transparent',
                    padding: '8px 4px', textAlign: 'left', borderRadius: 6,
                    transition: 'background var(--duration-instant) var(--ease-default)',
                  }}
                  onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--row-hover)'; }}
                  onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: 6, gap: 12 }}>
                    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, minWidth: 0 }}>
                      <Chevron open={open} />
                      <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{o.label}</span>
                    </span>
                    <span style={{ fontSize: 12, color: 'var(--text-muted)', whiteSpace: 'nowrap' }}>
                      <span style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(o.count)}</span> · {fmt(o.pct)}%
                    </span>
                  </div>
                  <div style={{ height: 4, background: 'var(--bar-bg)', borderRadius: 2, marginLeft: 17 }}>
                    <div
                      className="bar-grow"
                      style={{
                        width: `${(o.count / max) * 100}%`,
                        height: 4, borderRadius: 2,
                        background: barColor(i),
                        animationDelay: `${i * 60}ms`,
                      }}
                    />
                  </div>
                </button>

                {open && detalles.length > 0 && (
                  <div className="fade-in-up" style={{ marginLeft: 17, marginBottom: 8, opacity: 1 }}>
                    {detalles.map((d, j) => <DetalleRow key={j} d={d} />)}
                  </div>
                )}
              </div>
            );
          })}
        </div>
      </Card>
    </section>
  );
}
