import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import AppLayout from '../components/layout/AppLayout';
import { SCHEDULES, CLINIC_ORDER, ESPECIALIDAD_ORDER, getEspecialidad } from '../data/calcomSchedules';

const EASE = [0.23, 1, 0.32, 1];
const WEEKDAYS = ['L', 'M', 'X', 'J', 'V', 'S', 'D'];
const MESES = ['enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio', 'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre'];

// --- helpers de fecha (local, sin UTC) ---
function iso(d) {
  const y = d.getFullYear();
  const m = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${y}-${m}-${day}`;
}
function sameMonth(a, b) { return a.getFullYear() === b.getFullYear() && a.getMonth() === b.getMonth(); }
// JS getDay: 0=Dom..6=Sáb. Lo pasamos a índice lunes-primero (0=L..6=D).
function mondayIndex(jsDay) { return (jsDay + 6) % 7; }

// Clasifica el estado de bloqueo de una fecha según sus overrides.
function estadoDe(overrides, date) {
  const o = overrides.find((x) => x.date === date);
  if (!o) return 'abierto';
  if (o.startTime === '00:00' && o.endTime === '00:00') return 'completo';
  if (o.startTime === '16:00') return 'manana';   // solo tarde abierta
  if (o.startTime === '10:00') return 'tarde';    // solo mañana abierta
  return 'abierto';
}

export default function PanelFechas() {
  const [clinicId, setClinicId] = useState(null);
  const [espId, setEspId] = useState(null);
  const [cursor, setCursor] = useState(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), 1); });
  const [overrides, setOverrides] = useState([]);
  const [selected, setSelected] = useState(null); // fecha iso del día pulsado
  const [saving, setSaving] = useState(false);
  const [toast, setToast] = useState(null);
  const toastTimer = useRef(null);

  const esp = clinicId && espId ? getEspecialidad(clinicId, espId) : null;

  const showToast = useCallback((msg) => {
    setToast(msg);
    clearTimeout(toastTimer.current);
    toastTimer.current = setTimeout(() => setToast(null), 2600);
  }, []);

  // Al elegir especialidad: cargamos el snapshot y luego intentamos el estado en vivo.
  useEffect(() => {
    if (!esp) return;
    setSelected(null);
    const snapshot = (esp.overridesIniciales || []).map((date) => ({ date, startTime: '00:00', endTime: '00:00' }));
    setOverrides(snapshot);
    let cancel = false;
    fetch(`/api/calcom-block?scheduleId=${esp.scheduleId}`)
      .then((r) => (r.ok ? r.json() : null))
      .then((j) => { if (!cancel && j && Array.isArray(j.overrides)) setOverrides(j.overrides); })
      .catch(() => {});
    return () => { cancel = true; };
  }, [esp]);

  const hoy = useMemo(() => { const d = new Date(); return new Date(d.getFullYear(), d.getMonth(), d.getDate()); }, []);

  const dias = useMemo(() => {
    const first = new Date(cursor.getFullYear(), cursor.getMonth(), 1);
    const start = mondayIndex(first.getDay());
    const total = new Date(cursor.getFullYear(), cursor.getMonth() + 1, 0).getDate();
    const cells = [];
    for (let i = 0; i < start; i++) cells.push(null);
    for (let d = 1; d <= total; d++) cells.push(new Date(cursor.getFullYear(), cursor.getMonth(), d));
    return cells;
  }, [cursor]);

  async function aplicar(date, mode, action) {
    if (!esp) return;
    setSelected(null);
    // Optimista
    const prev = overrides;
    let optimistic = overrides.filter((o) => o.date !== date);
    if (action === 'block') {
      const win = mode === 'morning' ? { s: '16:00', e: '20:00' } : mode === 'afternoon' ? { s: '10:00', e: '14:00' } : { s: '00:00', e: '00:00' };
      optimistic = [...optimistic, { date, startTime: win.s, endTime: win.e }];
    }
    setOverrides(optimistic);
    setSaving(true);
    try {
      const res = await fetch('/api/calcom-block', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ scheduleId: esp.scheduleId, date, mode, action }),
      });
      const json = await res.json().catch(() => ({}));
      if (!res.ok) throw new Error(json.error || 'Error');
      if (Array.isArray(json.overrides)) setOverrides(json.overrides);
      showToast(action === 'block' ? 'Fecha bloqueada' : 'Fecha desbloqueada');
    } catch (e) {
      setOverrides(prev); // revertir
      showToast('No se pudo guardar. Inténtalo de nuevo.');
    } finally {
      setSaving(false);
    }
  }

  // Lista de días bloqueados futuros, ordenados.
  const bloqueados = useMemo(() => {
    return overrides
      .map((o) => ({ ...o, estado: estadoDe(overrides, o.date) }))
      .filter((o) => o.estado !== 'abierto' && o.date >= iso(hoy))
      .sort((a, b) => a.date.localeCompare(b.date));
  }, [overrides, hoy]);

  return (
    <AppLayout>
      <div className="app-page" style={{ padding: 'clamp(16px, 3vw, 28px) clamp(14px, 3vw, 36px) 80px', maxWidth: 820, margin: '0 auto' }}>
        {/* Cabecera */}
        <header style={{ marginBottom: 26 }}>
          <h1 style={{ fontSize: 'clamp(22px, 4vw, 28px)', fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.02em', margin: 0 }}>
            Panel de fechas
          </h1>
          <p style={{ fontSize: 14, color: 'var(--text-muted)', marginTop: 8, lineHeight: 1.5, maxWidth: 520 }}>
            Marca los días que la clínica no atiende. El asistente dejará de ofrecer cita esos días.
          </p>
        </header>

        {/* Paso 1 — Clínica */}
        <Paso num={1} titulo="¿Qué clínica?">
          <div className="pf-grid3">
            {CLINIC_ORDER.map((cid) => (
              <ChoiceCard
                key={cid}
                active={clinicId === cid}
                title={SCHEDULES[cid].label}
                onClick={() => { setClinicId(cid); setEspId(null); }}
              />
            ))}
          </div>
        </Paso>

        {/* Paso 2 — Especialidad */}
        <AnimatePresence>
          {clinicId && (
            <motion.div
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <Paso num={2} titulo="¿Qué especialidad?">
                <div className="pf-grid3">
                  {ESPECIALIDAD_ORDER.map((eid) => {
                    const e = getEspecialidad(clinicId, eid);
                    if (!e) return null;
                    return (
                      <ChoiceCard
                        key={eid}
                        active={espId === eid}
                        title={e.label}
                        sub={e.sub}
                        onClick={() => setEspId(eid)}
                      />
                    );
                  })}
                </div>
              </Paso>
            </motion.div>
          )}
        </AnimatePresence>

        {/* Paso 3 — Calendario */}
        <AnimatePresence>
          {esp && (
            <motion.div
              key={`${clinicId}-${espId}`}
              initial={{ opacity: 0, y: 10 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -6 }}
              transition={{ duration: 0.34, ease: EASE }}
            >
              <Paso num={3} titulo="¿Qué días quieres bloquear?">
                <div style={{
                  background: 'var(--bg-card)', border: '1px solid var(--border-hairline)',
                  borderRadius: 18, padding: 'clamp(14px, 3vw, 22px)',
                  boxShadow: '0 1px 2px rgba(15,15,25,0.03)',
                }}>
                  {/* Navegación de mes */}
                  <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', marginBottom: 16 }}>
                    <MonthArrow dir="prev" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() - 1, 1))} />
                    <div style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', fontVariantNumeric: 'tabular-nums' }}>
                      {MESES[cursor.getMonth()]} {cursor.getFullYear()}
                    </div>
                    <MonthArrow dir="next" onClick={() => setCursor((c) => new Date(c.getFullYear(), c.getMonth() + 1, 1))} />
                  </div>

                  {/* Cabecera días */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6, marginBottom: 6 }}>
                    {WEEKDAYS.map((w, i) => (
                      <div key={i} style={{ textAlign: 'center', fontSize: 11, fontWeight: 600, color: 'var(--text-muted)', padding: '2px 0' }}>{w}</div>
                    ))}
                  </div>

                  {/* Rejilla */}
                  <div style={{ display: 'grid', gridTemplateColumns: 'repeat(7, 1fr)', gap: 6 }}>
                    {dias.map((d, i) => {
                      if (!d) return <div key={i} />;
                      const date = iso(d);
                      const esPasado = d < hoy;
                      const esLaborable = esp.workDays.includes(d.getDay());
                      const estado = estadoDe(overrides, date);
                      return (
                        <DayCell
                          key={date}
                          day={d.getDate()}
                          estado={estado}
                          disabled={esPasado || !esLaborable}
                          esPasado={esPasado}
                          esLaborable={esLaborable}
                          isToday={d.getTime() === hoy.getTime()}
                          onClick={() => setSelected(date)}
                        />
                      );
                    })}
                  </div>

                  {/* Leyenda mínima */}
                  <div style={{ display: 'flex', gap: 16, marginTop: 16, flexWrap: 'wrap' }}>
                    <Leyenda color="var(--red)" fill texto="Bloqueado" />
                    <Leyenda color="var(--accent)" texto="Media jornada" />
                    <Leyenda color="var(--text-muted)" dim texto="No se atiende" />
                  </div>
                </div>
              </Paso>

              {/* Días bloqueados */}
              {bloqueados.length > 0 && (
                <Paso num={null} titulo="Días bloqueados próximos">
                  <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
                    {bloqueados.map((o) => (
                      <BlockedRow key={o.date} o={o} onRemove={() => aplicar(o.date, 'full', 'unblock')} saving={saving} />
                    ))}
                  </div>
                </Paso>
              )}
            </motion.div>
          )}
        </AnimatePresence>
      </div>

      {/* Hoja de acción al pulsar un día */}
      <AnimatePresence>
        {selected && esp && (
          <ActionSheet
            date={selected}
            estado={estadoDe(overrides, selected)}
            parts={esp.parts}
            onClose={() => setSelected(null)}
            onAction={aplicar}
          />
        )}
      </AnimatePresence>

      {/* Toast */}
      <AnimatePresence>
        {toast && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: 20 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{
              position: 'fixed', bottom: 28, left: '50%', transform: 'translateX(-50%)',
              background: 'var(--text-primary)', color: 'var(--bg-card)',
              padding: '11px 18px', borderRadius: 12, fontSize: 13, fontWeight: 500,
              zIndex: 200, boxShadow: '0 12px 32px rgba(0,0,0,0.28)', whiteSpace: 'nowrap',
            }}
          >
            {toast}
          </motion.div>
        )}
      </AnimatePresence>

      <style>{`
        .pf-grid3 { display: grid; grid-template-columns: repeat(3, 1fr); gap: 10px; }
        @media (max-width: 560px) { .pf-grid3 { grid-template-columns: 1fr; } }
      `}</style>
    </AppLayout>
  );
}

function Paso({ num, titulo, children }) {
  return (
    <section style={{ marginTop: 26 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 12 }}>
        {num != null && (
          <span style={{
            width: 22, height: 22, borderRadius: '50%', flexShrink: 0,
            background: 'var(--accent-dim)', color: 'var(--accent)',
            border: '1px solid var(--accent-border)',
            display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
            fontSize: 11, fontWeight: 700,
          }}>{num}</span>
        )}
        <span style={{ fontSize: 15, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.01em' }}>{titulo}</span>
      </div>
      {children}
    </section>
  );
}

function ChoiceCard({ active, title, sub, onClick }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="pf-choice"
      data-active={active}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'flex-start', justifyContent: 'center',
        gap: 2, padding: '16px 18px', minHeight: 60,
        borderRadius: 14, cursor: 'pointer', fontFamily: 'inherit', textAlign: 'left',
        border: `1px solid ${active ? 'var(--accent-border)' : 'var(--border-hairline)'}`,
        background: active ? 'var(--accent-dim)' : 'var(--bg-card)',
        color: active ? 'var(--accent)' : 'var(--text-primary)',
        transition: 'background 180ms cubic-bezier(0.23,1,0.32,1), border-color 180ms cubic-bezier(0.23,1,0.32,1), transform 120ms ease-out',
      }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>{title}</span>
      {sub && <span style={{ fontSize: 12, color: active ? 'var(--accent)' : 'var(--text-muted)', opacity: active ? 0.85 : 1 }}>{sub}</span>}
    </button>
  );
}

function MonthArrow({ dir, onClick }) {
  return (
    <button
      type="button" onClick={onClick} aria-label={dir === 'prev' ? 'Mes anterior' : 'Mes siguiente'}
      style={{
        width: 34, height: 34, borderRadius: 10, border: '1px solid var(--border-hairline)',
        background: 'var(--bg-card)', color: 'var(--text-secondary)', cursor: 'pointer',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 160ms ease, color 160ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--bg-card)'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
    >
      <svg width="15" height="15" viewBox="0 0 15 15" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round"
        style={{ transform: dir === 'next' ? 'scaleX(-1)' : 'none' }}>
        <path d="M9 3.5L5 7.5l4 4" />
      </svg>
    </button>
  );
}

function DayCell({ day, estado, disabled, esPasado, esLaborable, isToday, onClick }) {
  const bloqueadoCompleto = estado === 'completo';
  const media = estado === 'manana' || estado === 'tarde';

  let bg = 'transparent';
  let color = 'var(--text-primary)';
  let border = '1px solid transparent';
  if (disabled) {
    color = 'var(--text-muted)';
  }
  if (bloqueadoCompleto) {
    bg = 'var(--red)';
    color = '#fff';
  } else if (media) {
    bg = 'var(--accent-dim)';
    color = 'var(--accent)';
    border = '1px solid var(--accent-border)';
  } else if (!disabled) {
    border = '1px solid var(--border-hairline)';
  }

  return (
    <button
      type="button"
      onClick={disabled ? undefined : onClick}
      disabled={disabled}
      className="pf-day"
      style={{
        aspectRatio: '1 / 1', width: '100%',
        borderRadius: 10, border,
        background: bg, color,
        cursor: disabled ? 'default' : 'pointer',
        fontFamily: 'inherit', fontSize: 13,
        fontWeight: bloqueadoCompleto || media ? 700 : 500,
        fontVariantNumeric: 'tabular-nums',
        opacity: esPasado ? 0.3 : (!esLaborable ? 0.28 : 1),
        position: 'relative',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        transition: 'background 160ms cubic-bezier(0.23,1,0.32,1), border-color 160ms ease, transform 110ms ease-out, opacity 160ms ease',
      }}
    >
      {day}
      {isToday && !bloqueadoCompleto && (
        <span style={{ position: 'absolute', bottom: 5, width: 4, height: 4, borderRadius: '50%', background: media ? 'var(--accent)' : 'var(--text-muted)' }} />
      )}
    </button>
  );
}

function Leyenda({ color, texto, fill, dim }) {
  return (
    <span style={{ display: 'inline-flex', alignItems: 'center', gap: 7, fontSize: 11, color: 'var(--text-muted)' }}>
      <span style={{
        width: 12, height: 12, borderRadius: 4,
        background: fill ? color : (dim ? 'transparent' : 'var(--accent-dim)'),
        border: `1px solid ${dim ? 'var(--border-subtle)' : color}`,
        opacity: dim ? 0.5 : 1,
      }} />
      {texto}
    </span>
  );
}

function fmtLargo(dateIso) {
  const [y, m, d] = dateIso.split('-').map(Number);
  const dt = new Date(y, m - 1, d);
  return dt.toLocaleDateString('es-ES', { weekday: 'long', day: 'numeric', month: 'long' });
}

function BlockedRow({ o, onRemove, saving }) {
  const etiqueta = o.estado === 'completo' ? 'Día completo' : o.estado === 'manana' ? 'Mañana bloqueada' : 'Tarde bloqueada';
  return (
    <div style={{
      display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: 12,
      padding: '12px 14px', borderRadius: 12,
      background: 'var(--bg-card)', border: '1px solid var(--border-hairline)',
    }}>
      <div style={{ minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize' }}>{fmtLargo(o.date)}</div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{etiqueta}</div>
      </div>
      <button
        type="button" onClick={onRemove} disabled={saving}
        style={{
          padding: '7px 13px', borderRadius: 9, fontSize: 12, fontWeight: 500, fontFamily: 'inherit',
          border: '1px solid var(--border-hairline)', background: 'transparent', color: 'var(--text-secondary)',
          cursor: saving ? 'wait' : 'pointer', whiteSpace: 'nowrap',
          transition: 'background 160ms ease, color 160ms ease, border-color 160ms ease',
        }}
        onMouseEnter={(e) => { if (!saving) { e.currentTarget.style.background = 'var(--accent-dim)'; e.currentTarget.style.color = 'var(--accent)'; e.currentTarget.style.borderColor = 'var(--accent-border)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; e.currentTarget.style.borderColor = 'var(--border-hairline)'; }}
      >
        Desbloquear
      </button>
    </div>
  );
}

function ActionSheet({ date, estado, parts, onClose, onAction }) {
  useEffect(() => {
    const onKey = (e) => { if (e.key === 'Escape') onClose(); };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
  }, [onClose]);

  const bloqueado = estado !== 'abierto';

  const Opcion = ({ label, hint, onClick, danger, primary }) => (
    <button
      type="button" onClick={onClick}
      style={{
        width: '100%', textAlign: 'left', padding: '15px 18px', borderRadius: 13,
        border: `1px solid ${primary ? 'var(--accent-border)' : 'var(--border-hairline)'}`,
        background: primary ? 'var(--accent-dim)' : 'var(--bg-card)',
        color: danger ? 'var(--red)' : primary ? 'var(--accent)' : 'var(--text-primary)',
        cursor: 'pointer', fontFamily: 'inherit',
        display: 'flex', flexDirection: 'column', gap: 2,
        transition: 'background 150ms ease, border-color 150ms ease',
      }}
      onMouseEnter={(e) => { if (!primary) e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { if (!primary) e.currentTarget.style.background = 'var(--bg-card)'; }}
    >
      <span style={{ fontSize: 15, fontWeight: 600 }}>{label}</span>
      {hint && <span style={{ fontSize: 12, color: 'var(--text-muted)' }}>{hint}</span>}
    </button>
  );

  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }} exit={{ opacity: 0 }}
      transition={{ duration: 0.2, ease: EASE }}
      onClick={onClose}
      style={{
        position: 'fixed', inset: 0, zIndex: 180, background: 'rgba(12,10,24,0.42)',
        backdropFilter: 'blur(6px)', WebkitBackdropFilter: 'blur(6px)',
        display: 'flex', alignItems: 'flex-end', justifyContent: 'center',
      }}
      className="pf-sheet-wrap"
    >
      <motion.div
        onClick={(e) => e.stopPropagation()}
        initial={{ y: 40, opacity: 0, scale: 0.98 }}
        animate={{ y: 0, opacity: 1, scale: 1 }}
        exit={{ y: 40, opacity: 0 }}
        transition={{ type: 'spring', stiffness: 320, damping: 30, mass: 0.8 }}
        style={{
          width: '100%', maxWidth: 440, margin: 14,
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 20, padding: 20,
          boxShadow: '0 24px 60px rgba(15,10,40,0.35)',
        }}
      >
        <div style={{ fontSize: 17, fontWeight: 600, color: 'var(--text-primary)', textTransform: 'capitalize', marginBottom: 2 }}>
          {fmtLargo(date)}
        </div>
        <div style={{ fontSize: 13, color: 'var(--text-muted)', marginBottom: 16 }}>
          {bloqueado ? 'Este día está bloqueado.' : '¿Qué quieres bloquear?'}
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 9 }}>
          {bloqueado ? (
            <Opcion label="Volver a abrir este día" hint="Se podrán agendar citas de nuevo" primary onClick={() => onAction(date, 'full', 'unblock')} />
          ) : (
            <>
              <Opcion label="Bloquear el día completo" hint="No se atiende en todo el día" primary onClick={() => onAction(date, 'full', 'block')} />
              {parts.manana && parts.tarde && (
                <>
                  <Opcion label="Solo la mañana" hint="Se mantiene la tarde" onClick={() => onAction(date, 'morning', 'block')} />
                  <Opcion label="Solo la tarde" hint="Se mantiene la mañana" onClick={() => onAction(date, 'afternoon', 'block')} />
                </>
              )}
            </>
          )}
          <button
            type="button" onClick={onClose}
            style={{
              width: '100%', padding: '13px', borderRadius: 13, marginTop: 2,
              border: 'none', background: 'transparent', color: 'var(--text-muted)',
              cursor: 'pointer', fontFamily: 'inherit', fontSize: 14, fontWeight: 500,
            }}
          >
            Cancelar
          </button>
        </div>
      </motion.div>

      <style>{`
        @media (min-width: 561px) {
          .pf-sheet-wrap { align-items: center !important; }
        }
      `}</style>
    </motion.div>
  );
}
