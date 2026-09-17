import { useMemo, useState, useCallback, useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useClinic } from '../context/ClinicContext';
import useAirtableData from '../hooks/useAirtableData';

const CLINIC_LABEL = {
  general: 'Todas',
  triana: 'Triana',
  los_palacios: 'Los Palacios',
  san_jose: 'San José',
  otras: 'Otras',
};
const CLINIC_ORDER = ['general', 'triana', 'los_palacios', 'san_jose'];

const EASE = 'cubic-bezier(0.23, 1, 0.32, 1)';

function fmtDateBold(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short', day: '2-digit', month: 'short', hour: '2-digit', minute: '2-digit',
    });
  } catch { return iso; }
}

function daysAgo(iso) {
  if (!iso) return null;
  const d = new Date(iso).getTime();
  if (!Number.isFinite(d)) return null;
  const diff = Math.floor((Date.now() - d) / 86400000);
  if (diff <= 0) return 'hoy';
  if (diff === 1) return 'hace 1 día';
  return `hace ${diff} días`;
}

function fmtPhone(p) {
  if (!p) return null;
  const digits = String(p).replace(/\D/g, '');
  if (digits.length < 9) return p;
  const tail = digits.slice(-9);
  return `+34 ${tail.slice(0, 3)} ${tail.slice(3, 6)} ${tail.slice(6)}`;
}

function AlertaCard({ item, onResolved, index }) {
  const [state, setState] = useState('idle');
  const [error, setError] = useState(null);
  const [outcome, setOutcome] = useState(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    const t = setTimeout(() => setMounted(true), index * 45);
    return () => clearTimeout(t);
  }, [index]);

  const send = useCallback(async (status) => {
    setState('saving');
    setError(null);
    setOutcome(status);
    try {
      const res = await fetch('/api/appointment-update', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          recordId: item.recordId,
          status,
          meta: {
            appointmentId: item.appointmentId,
            leadId: item.leadId,
            nombre: item.nombre,
            clinicKey: item.clinicKey,
            clinicRaw: item.clinicRaw,
            appointmentStart: item.appointmentStart,
            phone: item.phone,
          },
        }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) {
        throw new Error(json.error || `HTTP ${res.status}`);
      }
      // Si el webhook n8n fallo, avisamos pero seguimos: Airtable ya esta OK.
      if (json.webhook && json.webhook.ok === false) {
        console.warn('[alerta] webhook n8n fallo:', json.webhook.error);
      }
      setState('done');
      // Notifica a todas las instancias de useAirtableData (sidebar,
      // dashboard, esta pagina) para que refetch inmediatamente.
      try { window.dispatchEvent(new Event('airtable:refresh')); } catch {}
      setTimeout(() => onResolved?.(item.recordId), 320);
    } catch (e) {
      setState('error');
      setError(e.message);
    }
  }, [item, onResolved]);

  const busy = state === 'saving';
  const gone = state === 'done';

  return (
    <article
      data-mounted={mounted}
      data-gone={gone}
      style={{
        position: 'relative',
        background: 'var(--card-bg)',
        border: '1px solid var(--border-hairline)',
        borderRadius: 12,
        padding: '16px 18px 14px',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        opacity: mounted && !gone ? 1 : 0,
        transform: mounted && !gone ? 'translateY(0) scale(1)' : 'translateY(6px) scale(0.985)',
        filter: gone ? 'blur(2px)' : 'blur(0)',
        maxHeight: gone ? 0 : 400,
        overflow: 'hidden',
        transition: `opacity 220ms ${EASE}, transform 260ms ${EASE}, filter 200ms ease, max-height 320ms ${EASE}, padding 300ms ${EASE}`,
        willChange: 'transform, opacity',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', gap: 12 }}>
        <div style={{ minWidth: 0 }}>
          <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', lineHeight: 1.25 }}>
            {item.nombre}
          </div>
          <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
            {CLINIC_LABEL[item.clinicKey] || item.clinicRaw || 'Sin clínica'}
            {item.tratamiento ? <> · <span style={{ color: 'var(--text-secondary)' }}>{item.tratamiento}</span></> : null}
          </div>
        </div>
        <span
          style={{
            fontSize: 10, fontWeight: 500, letterSpacing: '0.03em',
            padding: '3px 8px', borderRadius: 999,
            background: 'rgba(255, 138, 76, 0.12)',
            color: 'var(--orange)',
            border: '1px solid rgba(255, 138, 76, 0.28)',
            whiteSpace: 'nowrap',
          }}
        >
          {daysAgo(item.appointmentStart)}
        </span>
      </div>

      <div style={{
        fontSize: 13, fontWeight: 700, color: 'var(--text-primary)',
        fontVariantNumeric: 'tabular-nums',
      }}>
        {fmtDateBold(item.appointmentStart)}
      </div>

      {item.phone && (
        <div style={{ fontSize: 11, color: 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
          {fmtPhone(item.phone)}
        </div>
      )}

      <div style={{
        fontSize: 11, color: 'var(--text-muted)', lineHeight: 1.45,
        padding: '8px 10px', borderRadius: 8,
        background: 'var(--bg-hover)',
        border: '1px dashed var(--border-hairline)',
      }}>
        No detectamos si acudió en el CRM. Puede ser que no se marcase o un error técnico.
      </div>

      <div style={{ display: 'flex', gap: 8, marginTop: 2 }}>
        <button
          type="button"
          disabled={busy}
          onClick={() => send('attended')}
          className="alert-btn alert-btn-yes"
          data-active={outcome === 'attended'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.5l3 3 6-7" />
          </svg>
          Sí acudió
        </button>
        <button
          type="button"
          disabled={busy}
          onClick={() => send('no_show')}
          className="alert-btn alert-btn-no"
          data-active={outcome === 'no_show'}
        >
          <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </svg>
          No acudió
        </button>
      </div>

      {state === 'error' && (
        <div style={{ fontSize: 11, color: 'var(--red)', marginTop: 2 }}>
          {error || 'Error al guardar. Reintenta.'}
        </div>
      )}
    </article>
  );
}

export default function Alertas() {
  const { activeClinic, period } = useClinic();
  const { data, loading, refresh } = useAirtableData(activeClinic, period);

  const [filter, setFilter] = useState(activeClinic);
  useEffect(() => { setFilter(activeClinic); }, [activeClinic]);

  const [dismissed, setDismissed] = useState(() => new Set());

  const pendientes = data?.citasPendientesConfirmar || [];
  const visible = useMemo(() => {
    return pendientes
      .filter((p) => !dismissed.has(p.recordId))
      .filter((p) => filter === 'general' || p.clinicKey === filter);
  }, [pendientes, dismissed, filter]);

  const countsByClinic = useMemo(() => {
    const c = { general: 0, triana: 0, los_palacios: 0, san_jose: 0, otras: 0 };
    pendientes.forEach((p) => {
      if (dismissed.has(p.recordId)) return;
      c.general += 1;
      c[p.clinicKey] = (c[p.clinicKey] || 0) + 1;
    });
    return c;
  }, [pendientes, dismissed]);

  const onResolved = useCallback((recordId) => {
    setDismissed((prev) => {
      const next = new Set(prev);
      next.add(recordId);
      return next;
    });
    // El evento 'airtable:refresh' disparado tras el POST ya recarga esta
    // instancia del hook (y las del sidebar/dashboard); no necesitamos otro
    // refresh aqui.
  }, []);

  return (
    <AppLayout>
      <div className="app-page" style={{ padding: 'clamp(14px, 3vw, 24px) clamp(14px, 3vw, 32px) 64px', maxWidth: 1100 }}>
        <header style={{ marginBottom: 18 }}>
          <div style={{ display: 'flex', alignItems: 'flex-start', justifyContent: 'space-between', gap: 16, flexWrap: 'wrap' }}>
            <div style={{ minWidth: 0 }}>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 12, flexWrap: 'wrap' }}>
                <h1 style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)', margin: 0 }}>
                  Alertas de asistencia
                </h1>
                <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                  {loading ? 'Cargando…' : `${visible.length} sin confirmar`}
                </span>
              </div>
              <p style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 6, maxWidth: 680, lineHeight: 1.55 }}>
                Ayuda para no perder citas: cruza la tabla de appointments y marca las que ya han
                pasado y aún no tienen respuesta. La verdad definitiva sigue estando en el CRM.
              </p>
            </div>
            <button
              type="button"
              onClick={() => {
                setDismissed(new Set());
                refresh?.();
              }}
              disabled={loading}
              aria-label="Refrescar alertas"
              title="Refrescar alertas"
              className="alert-refresh"
            >
              <svg width="14" height="14" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
                style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none', transformOrigin: 'center' }}>
                <path d="M13 7.5A5.5 5.5 0 1 1 11.5 3.7" />
                <path d="M13 2v3.5H9.5" />
              </svg>
              Refrescar
            </button>
          </div>
        </header>

        <div className="alert-chip-row" style={{ display: 'flex', gap: 8, flexWrap: 'wrap', marginBottom: 20 }}>
          {CLINIC_ORDER.map((cid) => {
            const active = filter === cid;
            const n = countsByClinic[cid] || 0;
            return (
              <button
                key={cid}
                type="button"
                onClick={() => setFilter(cid)}
                className="alert-chip"
                data-active={active}
              >
                <span>{CLINIC_LABEL[cid]}</span>
                <span className="alert-chip-count" data-active={active}>{n}</span>
              </button>
            );
          })}
        </div>

        {loading && visible.length === 0 && (
          <div style={{ fontSize: 13, color: 'var(--text-muted)', padding: '40px 0', textAlign: 'center' }}>
            Cargando alertas…
          </div>
        )}

        {!loading && visible.length === 0 && (
          <div style={{
            padding: '48px 24px', textAlign: 'center',
            border: '1px dashed var(--border-hairline)', borderRadius: 12,
            background: 'var(--card-bg)',
          }}>
            <div style={{ fontSize: 34, marginBottom: 8, lineHeight: 1 }}>✓</div>
            <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)' }}>
              Todo confirmado
            </div>
            <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 4 }}>
              No hay citas pendientes de confirmar en este filtro.
            </div>
          </div>
        )}

        <div className="alerts-grid" style={{
          display: 'grid',
          gridTemplateColumns: 'repeat(auto-fill, minmax(280px, 1fr))',
          gap: 14,
        }}>
          {visible.map((item, i) => (
            <AlertaCard key={item.recordId} item={item} index={i} onResolved={onResolved} />
          ))}
        </div>
      </div>

      <style>{`
        .alert-chip {
          display: inline-flex; align-items: center; gap: 8px;
          padding: 7px 12px 7px 14px;
          font-size: 12px; font-weight: 500;
          border-radius: 999px;
          border: 1px solid var(--border-hairline);
          background: var(--card-bg);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: inherit;
          transition: background 160ms cubic-bezier(0.23,1,0.32,1),
                      border-color 160ms cubic-bezier(0.23,1,0.32,1),
                      color 160ms cubic-bezier(0.23,1,0.32,1),
                      transform 140ms ease-out;
        }
        .alert-chip:hover { background: var(--bg-hover); }
        .alert-chip:active { transform: scale(0.97); }
        .alert-chip[data-active="true"] {
          background: var(--accent-dim);
          border-color: var(--accent-border);
          color: var(--text-primary);
        }
        .alert-chip-count {
          font-variant-numeric: tabular-nums;
          font-weight: 600;
          font-size: 11px;
          background: var(--bg-hover);
          color: var(--text-muted);
          padding: 1px 7px;
          border-radius: 999px;
          min-width: 20px; text-align: center;
        }
        .alert-chip-count[data-active="true"] {
          background: var(--accent);
          color: white;
        }
        .alert-btn {
          flex: 1;
          display: inline-flex; align-items: center; justify-content: center; gap: 6px;
          padding: 8px 12px;
          font-size: 12px; font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--border-hairline);
          background: var(--card-bg);
          color: var(--text-secondary);
          cursor: pointer;
          font-family: inherit;
          transition: background 160ms cubic-bezier(0.23,1,0.32,1),
                      border-color 160ms cubic-bezier(0.23,1,0.32,1),
                      color 140ms ease,
                      transform 120ms ease-out,
                      filter 200ms ease;
        }
        .alert-btn:hover:not(:disabled) { background: var(--bg-hover); }
        .alert-btn:active:not(:disabled) { transform: scale(0.97); }
        .alert-btn:disabled { cursor: default; opacity: 0.72; filter: blur(0.4px); }
        .alert-btn-yes:hover:not(:disabled) {
          border-color: rgba(52, 199, 138, 0.4);
          color: var(--green);
        }
        .alert-btn-no:hover:not(:disabled) {
          border-color: rgba(230, 92, 100, 0.4);
          color: var(--red);
        }
        .alert-btn[data-active="true"].alert-btn-yes {
          background: rgba(52, 199, 138, 0.12);
          border-color: rgba(52, 199, 138, 0.4);
          color: var(--green);
        }
        .alert-btn[data-active="true"].alert-btn-no {
          background: rgba(230, 92, 100, 0.12);
          border-color: rgba(230, 92, 100, 0.4);
          color: var(--red);
        }
        .alert-refresh {
          display: inline-flex; align-items: center; gap: 6px;
          padding: 7px 12px; font-size: 12px; font-weight: 500;
          border-radius: 8px;
          border: 1px solid var(--border-hairline);
          background: var(--card-bg);
          color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
          transition:
            background 160ms cubic-bezier(0.23,1,0.32,1),
            border-color 160ms cubic-bezier(0.23,1,0.32,1),
            color 140ms ease,
            transform 120ms ease-out;
        }
        .alert-refresh:hover:not(:disabled) {
          background: var(--bg-hover);
          color: var(--text-primary);
        }
        .alert-refresh:active:not(:disabled) { transform: scale(0.97); }
        .alert-refresh:disabled { cursor: wait; opacity: 0.65; }
        @media (prefers-reduced-motion: reduce) {
          .alert-chip, .alert-btn, .alert-refresh { transition-duration: 0.01ms !important; }
        }
      `}</style>
    </AppLayout>
  );
}
