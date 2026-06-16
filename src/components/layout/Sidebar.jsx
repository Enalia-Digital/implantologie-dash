import { useLocation, useNavigate } from 'react-router-dom';
import { useClinic, PERIODS } from '../../context/ClinicContext';
import { clinics } from '../../data/mockData';

export default function Sidebar({ mobileOpen, onClose }) {
  const { activeClinic, setActiveClinic, period, setPeriod } = useClinic();
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.startsWith('/calendario') ? 'calendario' : 'dashboard';

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
      <div style={{ padding: '24px 16px 16px' }}>
        <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
          <img src="/logo-n-white.png" alt="" style={{ height: 26, display: 'block' }} />
          <span
            style={{
              fontSize: 16, fontWeight: 600, letterSpacing: '0.12em',
              color: '#F0F0F8', fontFamily: "'Inter', sans-serif",
            }}
          >
            ENALIA
          </span>
        </div>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginTop: 20 }} />
      </div>

      <div style={{ padding: '4px 8px 0' }}>
        <div
          style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--text-muted)',
            padding: '0 8px', marginBottom: 6,
          }}
        >
          Clínicas
        </div>
        {clinics.map((c) => {
          const active = c.id === activeClinic;
          return (
            <button
              key={c.id}
              onClick={() => { setActiveClinic(c.id); onClose?.(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '7px 10px', borderRadius: 6, border: 'none',
                background: active ? 'rgba(191,0,255,0.08)' : 'transparent',
                textAlign: 'left', transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                style={{
                  width: 3, height: 14, borderRadius: 2,
                  background: active ? 'var(--accent)' : 'transparent', flexShrink: 0,
                }}
              />
              <span
                style={{
                  fontSize: 12, fontWeight: active ? 500 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '12px 8px 0' }}>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 12 }} />
        {[
          { id: 'dashboard', label: 'Dashboard', path: '/dashboard' },
          { id: 'calendario', label: 'Calendario', path: '/calendario' },
        ].map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); onClose?.(); }}
              style={{
                display: 'flex', alignItems: 'center', gap: 10, width: '100%',
                padding: '7px 10px', borderRadius: 6, border: 'none',
                background: active ? 'rgba(255,255,255,0.04)' : 'transparent',
                textAlign: 'left', transition: 'background 0.12s ease',
              }}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'rgba(255,255,255,0.03)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span
                style={{
                  fontSize: 12, fontWeight: active ? 500 : 400,
                  color: active ? 'var(--text-primary)' : 'var(--text-muted)',
                }}
              >
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ padding: '16px 16px 0' }}>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 12 }} />
        <div
          style={{
            fontSize: 9, fontWeight: 600, letterSpacing: '0.10em',
            textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 6,
          }}
        >
          Periodo
        </div>
        <select
          value={period}
          onChange={(e) => setPeriod(e.target.value)}
          style={{
            width: '100%', background: 'var(--bg-elevated)',
            border: '1px solid var(--border-subtle)', borderRadius: 6,
            padding: '8px 12px', fontSize: 11, color: 'var(--text-secondary)',
            appearance: 'none', outline: 'none',
          }}
        >
          {PERIODS.map((p) => (
            <option key={p.id} value={p.id} style={{ background: 'var(--bg-elevated)' }}>
              {p.label}
            </option>
          ))}
        </select>
      </div>

      <div style={{ marginTop: 'auto', padding: '12px 16px' }}>
        <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 10 }} />
        <div style={{ fontSize: 10, color: 'var(--text-muted)', textAlign: 'center' }}>
          Enalia Digital
        </div>
      </div>
    </aside>
  );
}
