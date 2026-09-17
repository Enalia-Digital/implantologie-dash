import { useNavigate } from 'react-router-dom';

const CSS = `
.alert-banner {
  display: flex; align-items: center; gap: 12px;
  margin: 14px 32px 0;
  padding: 10px 14px 10px 16px;
  background: var(--card-bg);
  border: 1px solid rgba(255, 138, 76, 0.35);
  border-left: 3px solid var(--orange);
  border-radius: 10px;
  color: var(--text-primary);
  font-family: inherit;
  cursor: pointer;
  width: calc(100% - 64px);
  text-align: left;
  transition:
    background 160ms cubic-bezier(0.23,1,0.32,1),
    border-color 160ms cubic-bezier(0.23,1,0.32,1),
    transform 120ms ease-out;
}
.alert-banner:hover { background: var(--bg-hover); border-color: rgba(255,138,76,0.55); }
.alert-banner:active { transform: scale(0.995); }
.alert-banner-dot {
  width: 8px; height: 8px; border-radius: 999px; background: var(--orange);
  box-shadow: 0 0 0 3px rgba(255,138,76,0.18);
  flex-shrink: 0;
  animation: alertPulse 2s cubic-bezier(0.4,0,0.6,1) infinite;
}
@keyframes alertPulse {
  0%, 100% { box-shadow: 0 0 0 3px rgba(255,138,76,0.18); }
  50%      { box-shadow: 0 0 0 6px rgba(255,138,76,0.05); }
}
.alert-banner-text { flex: 1; font-size: 13px; color: var(--text-secondary); }
.alert-banner-text b { color: var(--text-primary); font-weight: 600; }
.alert-banner-cta {
  display: inline-flex; align-items: center; gap: 4px;
  font-size: 12px; font-weight: 500; color: var(--orange);
  padding: 4px 8px; border-radius: 6px;
  background: rgba(255, 138, 76, 0.1);
  transition: background 160ms ease, transform 120ms ease-out;
}
.alert-banner:hover .alert-banner-cta { background: rgba(255, 138, 76, 0.18); }
@media (prefers-reduced-motion: reduce) {
  .alert-banner-dot { animation: none; }
}
@media (max-width: 720px) {
  .alert-banner {
    margin: 12px max(env(safe-area-inset-left), 14px) 0 max(env(safe-area-inset-left), 14px);
    width: calc(100% - max(env(safe-area-inset-left), 14px) - max(env(safe-area-inset-right), 14px));
    padding: 12px 14px 12px 16px;
    min-height: 48px;
  }
  .alert-banner-text { font-size: 12px; }
}
`;

export default function AlertBanner({ count }) {
  const navigate = useNavigate();
  if (!count) return null;
  const label = count === 1 ? '1 cita sin confirmar' : `${count} citas sin confirmar`;
  return (
    <>
      <button
        type="button"
        onClick={() => navigate('/alertas')}
        className="alert-banner"
        aria-label={`${label}. Ir a alertas.`}
      >
        <span className="alert-banner-dot" aria-hidden="true" />
        <span className="alert-banner-text">
          Tienes <b>{label}</b>
        </span>
        <span className="alert-banner-cta">
          Ver
          <svg width="12" height="12" viewBox="0 0 12 12" fill="none" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round" aria-hidden="true">
            <path d="M4 2.5L7.5 6 4 9.5" />
          </svg>
        </span>
      </button>
      <style>{CSS}</style>
    </>
  );
}
