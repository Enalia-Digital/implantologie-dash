import { useLocation, useNavigate } from 'react-router-dom';
import { useClinic, PERIODS } from '../../context/ClinicContext';
import { useTheme } from '../../context/ThemeContext';
import { clinics } from '../../data/mockData';
import usePWA from '../../hooks/usePWA';

const ICON = {
  dashboard: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="2" width="5.5" height="5.5" rx="1.2" />
      <rect x="10.5" y="2" width="5.5" height="3" rx="1.2" />
      <rect x="2" y="10.5" width="5.5" height="5.5" rx="1.2" />
      <rect x="10.5" y="8" width="5.5" height="8" rx="1.2" />
    </svg>
  ),
  calendario: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="2" y="3" width="14" height="13" rx="2" />
      <path d="M2 7h14" />
      <path d="M6 1v4M12 1v4" />
    </svg>
  ),
  calculadora: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <rect x="3" y="2" width="12" height="14" rx="2" />
      <path d="M6 5h6M6 9h2M10 9h2M6 12h2M10 12h2" />
    </svg>
  ),
  collapse: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M11 4L7 9l4 5" />
    </svg>
  ),
  expand: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M7 4l4 5-4 5" />
    </svg>
  ),
  sun: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <circle cx="9" cy="9" r="3.5" />
      <path d="M9 1.5v2M9 14.5v2M1.5 9h2M14.5 9h2M3.7 3.7l1.4 1.4M12.9 12.9l1.4 1.4M14.3 3.7l-1.4 1.4M5.1 12.9l-1.4 1.4" />
    </svg>
  ),
  moon: (
    <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
      <path d="M15.1 10.4A6.5 6.5 0 017.6 2.9a7 7 0 107.5 7.5z" />
    </svg>
  ),
  clinic: (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.2" strokeLinecap="round" strokeLinejoin="round">
      <rect x="1" y="3" width="12" height="10" rx="1.5" />
      <path d="M7 6v4M5 8h4" />
    </svg>
  ),
};

const NAV_ITEMS = [
  { id: 'dashboard', label: 'Dashboard', path: '/dashboard', icon: ICON.dashboard },
  { id: 'calendario', label: 'Calendario', path: '/calendario', icon: ICON.calendario },
  { id: 'calculadora', label: 'Calculadora', path: '/calculadora', icon: ICON.calculadora },
];

export default function Sidebar({ collapsed, onToggleCollapse, mobileOpen, onClose }) {
  const { activeClinic, setActiveClinic, period, setPeriod } = useClinic();
  const { dark, toggle: toggleTheme } = useTheme();
  const { canInstall, install } = usePWA();
  const location = useLocation();
  const navigate = useNavigate();
  const currentView = location.pathname.replace('/', '') || 'dashboard';

  const w = collapsed ? 64 : 240;

  const btnStyle = (active) => ({
    display: 'flex', alignItems: 'center', gap: collapsed ? 0 : 10,
    justifyContent: collapsed ? 'center' : 'flex-start',
    width: '100%', padding: collapsed ? '10px 0' : '8px 12px',
    borderRadius: 8, border: 'none',
    background: active ? 'var(--sb-active)' : 'transparent',
    textAlign: 'left',
    color: active ? 'var(--sb-text)' : 'var(--sb-text-secondary)',
    transition: 'all var(--duration-fast) var(--ease-default)',
  });

  return (
    <aside
      className={`sidebar-panel${collapsed ? ' collapsed' : ''}${mobileOpen ? ' mobile-open' : ''}`}
      style={{
        width: w,
        background: 'var(--sb-bg)',
        display: 'flex', flexDirection: 'column',
        height: '100vh', position: 'fixed', left: 0, top: 0, zIndex: 50,
        borderRight: '1px solid var(--sb-border)',
        overflow: 'hidden',
      }}
    >
      {/* Logo */}
      <div style={{ padding: collapsed ? '20px 0' : '20px 16px', display: 'flex', alignItems: 'center', gap: 10, justifyContent: collapsed ? 'center' : 'flex-start' }}>
        <div style={{
          width: 28, height: 28, flexShrink: 0,
          background: 'var(--accent)',
          WebkitMaskImage: 'url(/logo-n-white.png)',
          WebkitMaskSize: 'contain',
          WebkitMaskRepeat: 'no-repeat',
          WebkitMaskPosition: 'center',
          maskImage: 'url(/logo-n-white.png)',
          maskSize: 'contain',
          maskRepeat: 'no-repeat',
          maskPosition: 'center',
        }} />
        <span className="nav-label" style={{ fontSize: 15, fontWeight: 600, letterSpacing: '0.12em', color: 'var(--sb-text)' }}>
          ENALIA
        </span>
      </div>

      <div style={{ height: 1, background: 'var(--sb-border)', margin: collapsed ? '0 8px' : '0 16px' }} />

      {/* Clinics */}
      <div style={{ padding: collapsed ? '12px 6px 0' : '12px 10px 0', flex: '0 0 auto' }}>
        <div className="sidebar-section-title" style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sb-text-muted)', padding: '0 8px', marginBottom: 6 }}>
          Clínicas
        </div>
        {clinics.map((c) => {
          const active = c.id === activeClinic;
          const disabled = currentView === 'calendario' && c.id === 'general';
          return (
            <button
              key={c.id}
              disabled={disabled}
              onClick={() => { if (disabled) return; setActiveClinic(c.id); onClose?.(); }}
              style={{ ...btnStyle(active), opacity: disabled ? 0.35 : 1, cursor: disabled ? 'not-allowed' : 'pointer' }}
              title={collapsed ? c.name : (disabled ? 'Selecciona una clínica específica' : undefined)}
              onMouseEnter={(e) => { if (!active && !disabled) e.currentTarget.style.background = 'var(--sb-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              {!collapsed && (
                <span style={{ width: 3, height: 14, borderRadius: 2, background: active ? 'var(--accent)' : 'transparent', flexShrink: 0 }} />
              )}
              {collapsed && (
                <span style={{ width: 8, height: 8, borderRadius: '50%', background: active ? 'var(--accent)' : 'var(--sb-text-muted)', flexShrink: 0 }} />
              )}
              <span className="nav-label" style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>
                {c.name}
              </span>
            </button>
          );
        })}
      </div>

      <div style={{ height: 1, background: 'var(--sb-border)', margin: collapsed ? '12px 8px' : '12px 16px' }} />

      {/* Navigation */}
      <div style={{ padding: collapsed ? '0 6px' : '0 10px', flex: '0 0 auto' }}>
        {NAV_ITEMS.map((item) => {
          const active = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => { navigate(item.path); onClose?.(); }}
              style={btnStyle(active)}
              title={collapsed ? item.label : undefined}
              onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sb-hover)'; }}
              onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'transparent'; }}
            >
              <span style={{ flexShrink: 0, display: 'flex' }}>{item.icon}</span>
              <span className="nav-label" style={{ fontSize: 13, fontWeight: active ? 500 : 400 }}>
                {item.label}
              </span>
            </button>
          );
        })}
      </div>

      {/* Period — segmented pills */}
      {!collapsed && (
        <div className="sidebar-period" style={{ padding: '16px 14px 0' }}>
          <div style={{ height: 1, background: 'var(--sb-border)', marginBottom: 12 }} />
          <div style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.12em', textTransform: 'uppercase', color: 'var(--sb-text-muted)', marginBottom: 8 }}>
            Periodo
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 6 }}>
            {PERIODS.map((p, i) => {
              const active = p.id === period;
              const isLast = i === PERIODS.length - 1;
              const isOddLast = isLast && PERIODS.length % 2 !== 0;
              return (
                <button
                  key={p.id}
                  onClick={() => setPeriod(p.id)}
                  style={{
                    padding: '7px 10px',
                    fontSize: 11, fontWeight: active ? 600 : 500,
                    color: active ? 'var(--sb-text)' : 'var(--sb-text-secondary)',
                    background: active ? 'var(--sb-active)' : 'var(--sb-bg-elevated)',
                    border: `1px solid ${active ? 'var(--accent-border)' : 'var(--sb-border)'}`,
                    borderRadius: 8,
                    cursor: 'pointer', fontFamily: 'inherit',
                    transition: 'background 160ms ease, border-color 160ms ease, color 160ms ease',
                    textAlign: 'center', whiteSpace: 'nowrap',
                    gridColumn: isOddLast ? '1 / -1' : undefined,
                  }}
                  onMouseEnter={(e) => { if (!active) e.currentTarget.style.background = 'var(--sb-hover)'; }}
                  onMouseLeave={(e) => { if (!active) e.currentTarget.style.background = 'var(--sb-bg-elevated)'; }}
                >
                  {p.short || p.label}
                </button>
              );
            })}
          </div>
        </div>
      )}

      {/* Bottom */}
      <div style={{ marginTop: 'auto', padding: collapsed ? '8px 6px 12px' : '8px 10px 16px' }}>
        <div style={{ height: 1, background: 'var(--sb-border)', marginBottom: 8, margin: collapsed ? '0 8px 8px' : '0 6px 8px' }} />

        {/* Collapse toggle */}
        <button
          onClick={onToggleCollapse}
          style={btnStyle(false)}
          title={collapsed ? 'Expandir' : 'Colapsar'}
          className="btn-hover"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sb-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}>{collapsed ? ICON.expand : ICON.collapse}</span>
          <span className="nav-label" style={{ fontSize: 12, color: 'var(--sb-text-muted)' }}>Colapsar</span>
        </button>

        {/* Dark mode toggle */}
        <button
          onClick={toggleTheme}
          style={btnStyle(false)}
          title={collapsed ? (dark ? 'Modo claro' : 'Modo oscuro') : undefined}
          className="btn-hover"
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--sb-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          <span style={{ flexShrink: 0, display: 'flex' }}>{dark ? ICON.sun : ICON.moon}</span>
          <span className="nav-label" style={{ fontSize: 12, color: 'var(--sb-text-muted)' }}>{dark ? 'Modo claro' : 'Modo oscuro'}</span>
        </button>

        {/* Install PWA */}
        {canInstall && (
          <button
            onClick={install}
            style={{
              ...btnStyle(false),
              background: 'var(--accent-dim)',
              border: '1px solid var(--accent-border)',
              marginTop: 4,
            }}
            title={collapsed ? 'Instalar app' : undefined}
            onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(191,0,255,0.15)'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent-dim)'; }}
          >
            <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
              <path d="M9 2v9M5 8l4 4 4-4" />
              <path d="M3 13v2h12v-2" />
            </svg>
            <span className="nav-label" style={{ fontSize: 12, color: 'var(--accent)', fontWeight: 500 }}>Instalar app</span>
          </button>
        )}

        {/* User */}
        <div style={{ display: 'flex', alignItems: 'center', gap: 8, padding: collapsed ? '8px 0' : '8px 12px', justifyContent: collapsed ? 'center' : 'flex-start', marginTop: 4 }}>
          <div style={{ width: 28, height: 28, borderRadius: 8, background: 'linear-gradient(135deg, #BF00FF, #8000AA)', display: 'flex', alignItems: 'center', justifyContent: 'center', fontSize: 11, fontWeight: 600, color: '#fff', flexShrink: 0 }}>
            ED
          </div>
          {!collapsed && (
            <div style={{ overflow: 'hidden' }}>
              <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--sb-text)', whiteSpace: 'nowrap' }}>Enalia Digital</div>
              <div style={{ fontSize: 10, color: 'var(--sb-text-muted)', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis', maxWidth: 140 }}>contacto@enaliadigital.com</div>
            </div>
          )}
        </div>
      </div>
    </aside>
  );
}
