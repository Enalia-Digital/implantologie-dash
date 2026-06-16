export default function StatusBar() {
  return (
    <div
      style={{
        height: 28,
        background: 'var(--bg-surface)',
        borderBottom: '1px solid var(--border-hairline)',
        padding: '0 32px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
      }}
    >
      <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
        <span
          className="pulse-dot"
          style={{ width: 7, height: 7, borderRadius: '50%', background: 'var(--green)' }}
        />
        <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>
          Sincronización automática · 5 min
        </span>
      </div>
      <span style={{ fontSize: 10, color: 'var(--text-muted)' }}>Actualizado hace 2 min</span>
    </div>
  );
}
