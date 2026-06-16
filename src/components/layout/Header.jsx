import { useClinic } from '../../context/ClinicContext';
import { clinicHeader } from '../../data/mockData';

export default function Header({ onExport, exporting, onMenu }) {
  const { activeClinic } = useClinic();

  return (
    <header
      style={{
        position: 'sticky',
        top: 0,
        zIndex: 40,
        height: 52,
        background: 'rgba(9,9,14,0.90)',
        backdropFilter: 'blur(20px)',
        WebkitBackdropFilter: 'blur(20px)',
        borderBottom: '1px solid var(--border-hairline)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 12 }}>
        <button
          className="menu-btn"
          onClick={onMenu}
          aria-label="Menú"
          style={{
            display: 'none',
            background: 'transparent',
            border: 'none',
            padding: 4,
          }}
        >
          <svg width="18" height="18" viewBox="0 0 18 18" fill="none" stroke="#8A8A9E" strokeWidth="1.5">
            <path d="M2 4.5h14M2 9h14M2 13.5h14" strokeLinecap="round" />
          </svg>
        </button>
        <span style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
          {clinicHeader[activeClinic]}
        </span>
      </div>
      <button
        onClick={onExport}
        disabled={exporting}
        style={{
          border: '1px solid rgba(191,0,255,0.25)',
          borderRadius: 6,
          padding: '6px 14px',
          fontSize: 12,
          fontWeight: 500,
          color: 'var(--accent)',
          background: 'transparent',
          transition: 'background 0.15s ease',
          opacity: exporting ? 0.6 : 1,
        }}
        onMouseEnter={(e) => {
          e.currentTarget.style.background = 'rgba(191,0,255,0.08)';
        }}
        onMouseLeave={(e) => {
          e.currentTarget.style.background = 'transparent';
        }}
      >
        {exporting ? 'Generando…' : 'Exportar'}
      </button>
    </header>
  );
}
