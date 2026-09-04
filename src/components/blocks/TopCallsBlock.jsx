import { Card, SectionLabel } from '../ui/primitives';
import AudioPlayer from '../ui/AudioPlayer';

function Stars({ count, max = 5 }) {
  return (
    <span style={{ display: 'inline-flex', gap: 2, fontSize: 14 }}>
      {Array.from({ length: max }, (_, i) => (
        <span key={i} style={{ color: i < count ? '#F5A623' : 'var(--bar-bg)', lineHeight: 1 }}>★</span>
      ))}
    </span>
  );
}

export default function TopCallsBlock({ data }) {
  const calls = data.topCalls;
  if (!calls || calls.length === 0) return null;

  return (
    <section>
      <SectionLabel>Llamadas</SectionLabel>
      <Card>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 14 }}>
          Una muestra de las llamadas atendidas de este periodo.
        </div>
        <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
          {calls.map((call, i) => (
            <div
              key={i}
              className="row-hover"
              style={{
                display: 'grid',
                gridTemplateColumns: '1fr auto auto',
                gap: 16,
                alignItems: 'center',
                padding: '14px 4px',
                borderBottom: i < calls.length - 1 ? '1px solid var(--border-hairline)' : 'none',
              }}
            >
              <div style={{ minWidth: 0 }}>
                <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 4, flexWrap: 'wrap' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>{call.nombre}</span>
                  {call.agendado && (
                    <span
                      style={{
                        display: 'inline-flex', alignItems: 'center', gap: 4,
                        fontSize: 9, fontWeight: 700, letterSpacing: '0.04em',
                        textTransform: 'uppercase',
                        color: 'var(--green)',
                        background: 'rgba(31,168,102,0.12)',
                        border: '1px solid rgba(31,168,102,0.35)',
                        borderRadius: 4, padding: '2px 6px',
                      }}
                    >
                      <span style={{ width: 5, height: 5, borderRadius: 1, background: 'var(--green)' }} />
                      Agendado
                    </span>
                  )}
                  {call.calificacion ? <Stars count={call.calificacion} /> : null}
                </div>
                {call.resumen && (
                  <div style={{
                    fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.4,
                    overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap',
                  }}>
                    {call.resumen}
                  </div>
                )}
              </div>

              <div style={{ textAlign: 'right', flexShrink: 0 }}>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{call.fecha}</div>
              </div>

              {call.recordingUrl && call.recordingUrl !== '#' ? (
                <AudioPlayer src={call.recordingUrl} duration={call.duracion} />
              ) : (
                <span style={{ fontSize: 11, color: 'var(--text-muted)', fontStyle: 'italic' }}>
                  Sin grabación
                </span>
              )}
            </div>
          ))}
        </div>
      </Card>
    </section>
  );
}
