import { Card, SectionLabel } from '../ui/primitives';

function isToday(hora) {
  return /hoy/i.test(hora);
}

function CallbackList({ title, items }) {
  return (
    <div>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.06em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12 }}>
        {title}
      </div>
      {items.length === 0 ? (
        <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>—</div>
      ) : (
        <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
          {items.map((c) => (
            <div key={c.nombre + c.hora} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12, paddingBottom: 10, borderBottom: '1px solid var(--border-hairline)' }}>
              <div>
                <div style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-primary)' }}>{c.nombre}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)' }}>{c.telefono}</div>
                <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{c.motivo}</div>
              </div>
              <div style={{ fontSize: 12, fontWeight: 600, color: 'var(--orange)', whiteSpace: 'nowrap' }}>{c.hora}</div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

export default function CallbacksBlock({ data }) {
  const hoy = data.callbacks.filter((c) => isToday(c.hora));
  const proximas = data.callbacks.filter((c) => !isToday(c.hora));

  return (
    <section>
      <SectionLabel>Callbacks Pendientes</SectionLabel>
      <Card>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))', gap: 28 }}>
          <CallbackList title="Hoy" items={hoy} />
          <CallbackList title="Próximas 24h" items={proximas} />
        </div>
      </Card>
    </section>
  );
}
