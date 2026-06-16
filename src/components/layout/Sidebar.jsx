import { useClinic, PERIODS } from '../../context/ClinicContext';
import { useAuth } from '../../context/AuthContext';
import { clinics } from '../../data/mockData';

export default function Sidebar({ mobileOpen, onClose }) {
  const { activeClinic, setActiveClinic, period, setPeriod } = useClinic();
  const { user, logout } = useAuth();

  const initial = (user?.name || 'U').charAt(0).toUpperCase();
  const roleLabel = user?.role === 'admin' ? 'Administrador' : 'Cliente';

  return (
    <aside
      style={{
        width: 220,
        background: 'var(--bg-surface)',
        borderRight: '1px solid var(--border-hairline)',
        display: 'flex',
        flexDirection: 'column',
        height: '100vh',
        position: 'fixed',
        left: 0,
        top: 0,
        zIndex: 50,
        transform: mobileOpen ? 'translateX(0)' : undefined,
      }}
      className="sidebar"
    >
      {/* Top / logo */}
      <div style={{ padding: '24px 16px 16px' }}>
        <img src="/logo.png" alt="Enalia Digital" style={{ height: 28, display: 'block' }} />
        <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 10, lineHeight: 1.3 }}>
          Agente Cualificador de Llamadas
        </div>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginTop: 20 }} />
      </div>

      {/* Clínicas */}
      <div style={{ padding: '4px 8px 12px' }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            padding: '0 8px',
            marginBottom: 6,
          }}
        >
          Clínicas
        </div>
        {clinics.map((c) => {
          const active = c.id === activeClinic;
          return (
            <button
              key={c.id}
              onClick={() => {
                setActiveClinic(c.id);
                onClose?.();
              }}
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: 10,
                width: '100%',
                padding: '8px 10px',
                borderRadius: 6,
                border: 'none',
                background: active ? 'rgba(191,0,255,0.08)' : 'transparent',
                textAlign: 'left',
                transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => {
                if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)';
              }}
              onMouseLeave={(e) => {
                if (!active) e.currentTarget.style.background = 'transparent';
              }}
            >
              <span
                style={{
                  width: 3,
                  height: 16,
                  borderRadius: 2,
                  background: active ? 'var(--accent)' : 'transparent',
                  flexShrink: 0,
                }}
              />
              <span style={{ display: 'flex', flexDirection: 'column', gap: 1 }}>
                <span style={{ fontSize: 12, fontWeight: 500, color: active ? 'var(--text-primary)' : 'var(--text-muted)' }}>
                  {c.name}
                </span>
                {active && <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{c.subtitle}</span>}
              </span>
            </button>
          );
        })}
      </div>

      {/* Periodo */}
      <div style={{ padding: '8px 16px' }}>
        <div
          style={{
            fontSize: 9,
            fontWeight: 600,
            letterSpacing: '0.10em',
            textTransform: 'uppercase',
            color: 'var(--text-muted)',
            marginBottom: 6,
          }}
        >
          Periodo
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            width: '100%',
            background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)',
            borderRadius: 6,
            padding: '8px 12px',
            fontSize: 11,
            color: 'var(--text-secondary)',
            appearance: 'none',
            outline: 'none',
          }}
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      {/* Bottom / user */}
      <div style={{ marginTop: 'auto', padding: 16 }}>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 14 }} />
        <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
          <span
            style={{
              width: 28,
              height: 28,
              borderRadius: '50%',
              background: 'rgba(191,0,255,0.15)',
              border: '1px solid rgba(191,0,255,0.25)',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              fontSize: 11,
              fontWeight: 600,
              color: 'var(--accent)',
              flexShrink: 0,
            }}
          >
            {initial}
          </span>
          <span style={{ display: 'flex', flexDirection: 'column', lineHeight: 1.3, overflow: 'hidden' }}>
            <span style={{ fontSize: 11, fontWeight: 500, color: 'var(--text-secondary)' }}>{user?.name}</span>
            <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>{roleLabel}</span>
          </span>
        </div>
        <button
          onClick={logout}
          style={{
            width: '100%',
            background: 'transparent',
            border: '1px solid var(--border-hairline)',
            borderRadius: 6,
            padding: 7,
            fontSize: 11,
            fontWeight: 500,
            color: 'var(--text-muted)',
            transition: 'color 0.15s ease, border-color 0.15s ease',
          }}
          onMouseEnter={(e) => {
            e.currentTarget.style.color = 'var(--red)';
            e.currentTarget.style.borderColor = 'rgba(242,99,122,0.25)';
          }}
          onMouseLeave={(e) => {
            e.currentTarget.style.color = 'var(--text-muted)';
            e.currentTarget.style.borderColor = 'var(--border-hairline)';
          }}
        >
          Cerrar sesión
        </button>
      </div>
    </aside>
  );
}
