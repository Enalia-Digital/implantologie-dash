import { nombreAgente } from '../../data/config';

function Tab({ activo, onClick, titulo, sub }) {
  return (
    <button
      onClick={onClick}
      style={{
        flex: '1 1 260px',
        textAlign: 'left',
        padding: '12px 16px',
        borderRadius: 10,
        border: `1px solid ${activo ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
        background: activo ? 'var(--accent-dim)' : 'var(--bg-card)',
        transition: 'background var(--duration-fast) var(--ease-default), border-color var(--duration-fast) var(--ease-default)',
      }}
      onMouseEnter={(e) => { if (!activo) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { if (!activo) e.currentTarget.style.background = 'var(--bg-card)'; }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          style={{
            width: 8, height: 8, borderRadius: '50%', flexShrink: 0,
            background: activo ? 'var(--accent)' : 'var(--border-medium)',
          }}
        />
        <span style={{ fontSize: 13, fontWeight: 600, color: activo ? 'var(--accent)' : 'var(--text-secondary)' }}>
          {titulo}
        </span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 3, paddingLeft: 16 }}>{sub}</div>
    </button>
  );
}

// Selector de segmento. Se queda fijo bajo la cabecera al hacer scroll.
export default function SegmentTabs({ vista, onChange }) {
  return (
    <div
      style={{
        position: 'sticky',
        top: 52,
        zIndex: 30,
        background: 'var(--bg-root)',
        padding: '20px 32px 14px',
        borderBottom: '1px solid var(--border-hairline)',
      }}
    >
      <div
        style={{
          fontSize: 10, fontWeight: 600, letterSpacing: '0.1em',
          textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 10,
        }}
      >
        Qué quieres ver
      </div>
      <div style={{ display: 'flex', gap: 10, flexWrap: 'wrap' }}>
        <Tab
          activo={vista === 'activacion'}
          onClick={() => onChange('activacion')}
          titulo="Leads entrantes desde la activación"
          sub={`Los que ha gestionado ${nombreAgente} desde el minuto uno`}
        />
        <Tab
          activo={vista === 'previos'}
          onClick={() => onChange('previos')}
          titulo="Campaña de llamadas a leads anteriores"
          sub="Base cerrada que ya teníais antes de activarlo"
        />
      </div>
    </div>
  );
}
