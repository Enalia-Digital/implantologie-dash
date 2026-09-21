import { useClinic, PERIODS } from '../../context/ClinicContext';
import { clinicHeader } from '../../data/mockData';
import { describePeriod } from '../../lib/airtable';
import { IS_DEMO } from '../../data/demoMode';

export default function Header({ onMenu, right }) {
  const { activeClinic, period } = useClinic();
  const periodMeta = PERIODS.find((p) => p.id === period);
  const info = describePeriod(period);

  return (
    <header
      className="app-header"
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        minHeight: 52,
        background: 'var(--header-bg)',
        backdropFilter: 'var(--header-blur)',
        WebkitBackdropFilter: 'var(--header-blur)',
        borderBottom: '1px solid var(--border-hairline)',
        padding: '8px 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        gap: 12,
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, minWidth: 0, flex: 1 }}>
        <button
          className="menu-btn"
          onClick={onMenu}
          aria-label="Menú"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            padding: 4,
            color: 'var(--text-primary)',
            cursor: 'pointer',
          }}
        >
          <svg width="20" height="20" viewBox="0 0 20 20" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
            <path d="M3 5.5h14M3 10h14M3 14.5h14" />
          </svg>
        </button>
        <div style={{ display: 'flex', flexDirection: 'column', minWidth: 0, lineHeight: 1.2 }}>
          <span
            className="app-header-title"
            style={{
              fontSize: 14,
              fontWeight: 500,
              color: 'var(--text-primary)',
              whiteSpace: 'nowrap',
              overflow: 'hidden',
              textOverflow: 'ellipsis',
              display: 'inline-flex',
              alignItems: 'center',
              gap: 10,
            }}
          >
            {clinicHeader[activeClinic]}
            {IS_DEMO && (
              <span
                style={{
                  fontSize: 9,
                  fontWeight: 700,
                  letterSpacing: '0.14em',
                  padding: '3px 7px',
                  borderRadius: 6,
                  background: 'rgba(191,0,255,0.14)',
                  color: 'var(--accent)',
                  border: '1px solid var(--accent-border)',
                  textTransform: 'uppercase',
                  lineHeight: 1,
                }}
              >
                Demo
              </span>
            )}
          </span>
          {info.rango && (
            <span
              className="app-header-period"
              style={{
                fontSize: 11,
                color: 'var(--text-muted)',
                marginTop: 2,
                fontVariantNumeric: 'tabular-nums',
                whiteSpace: 'nowrap',
                overflow: 'hidden',
                textOverflow: 'ellipsis',
              }}
            >
              <span style={{ color: 'var(--text-secondary)', fontWeight: 500 }}>
                {periodMeta?.label || info.label}
              </span>
              <span aria-hidden="true"> · </span>
              {info.rango}
            </span>
          )}
        </div>
      </div>
      <div style={{ flexShrink: 0 }}>{right}</div>
    </header>
  );
}
