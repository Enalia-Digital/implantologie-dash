import { useClinic } from '../../context/ClinicContext';
import { clinicHeader } from '../../data/mockData';

export default function Header({ onMenu, right }) {
  const { activeClinic } = useClinic();

  return (
    <header
      style={{
        position: 'sticky', top: 0, zIndex: 40, height: 52,
        background: 'var(--header-bg)',
        backdropFilter: 'var(--header-blur)', WebkitBackdropFilter: 'var(--header-blur)',
        borderBottom: '1px solid var(--border-hairline)',
        padding: '0 32px',
        display: 'flex', alignItems: 'center', justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="menu-btn"
          onClick={onMenu}
          aria-label="Menú"
          style={{ display: 'none', background: 'transparent', border: 'none', padding: 4 }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="var(--text-muted)" strokeWidth="1.5">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          {clinicHeader[activeClinic]}
        </span>
      </div>
      {right}
    </header>
  );
}
