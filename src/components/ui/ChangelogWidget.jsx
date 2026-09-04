import { useEffect, useRef, useState } from 'react';
import { AnimatePresence, motion, MotionConfig } from 'motion/react';
import { changelog } from '../../data/changelog';

const STORAGE_KEY = 'enalia.changelog.seenId';
const LAYOUT_ID = 'enalia-changelog-morph';

// Curvas de easing (Emil Kowalski / Apple HIG)
const EASE_OUT = [0.23, 1, 0.32, 1];
const EASE_IN_OUT = [0.77, 0, 0.175, 1];

// Spring principal para el morphing (Apple: suave, sin rebote artificial)
const SPRING_MORPH = { type: 'spring', stiffness: 240, damping: 26, mass: 0.9 };
const SPRING_QUICK = { type: 'spring', stiffness: 380, damping: 30, mass: 0.8 };

function SparkIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 16 16" fill="none">
      <path d="M8 1.5l1.5 4L13.5 7 9.5 8.5 8 12.5 6.5 8.5 2.5 7l4-1.5L8 1.5z" fill="currentColor" />
    </svg>
  );
}

function CloseIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round">
      <path d="M3 3l8 8M11 3l-8 8" />
    </svg>
  );
}

function Chip({ children, tone = 'accent' }) {
  const isAccent = tone === 'accent';
  return (
    <span
      style={{
        display: 'inline-flex', alignItems: 'center',
        fontSize: 9, fontWeight: 700, letterSpacing: '0.08em',
        textTransform: 'uppercase',
        color: isAccent ? 'var(--accent)' : 'var(--text-muted)',
        background: isAccent ? 'var(--accent-dim)' : 'var(--bg-hover)',
        border: `1px solid ${isAccent ? 'var(--accent-border)' : 'var(--border-hairline)'}`,
        borderRadius: 4, padding: '2px 6px',
      }}
    >
      {children}
    </span>
  );
}

function ChangelogContent({ onClose }) {
  return (
    <div style={{ padding: '24px 24px 8px', position: 'relative' }}>
      <button
        onClick={onClose}
        aria-label="Cerrar"
        style={{
          position: 'absolute', top: 14, right: 14,
          width: 28, height: 28, borderRadius: 8,
          border: 'none', background: 'transparent',
          color: 'var(--text-muted)',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', transition: 'background 160ms ease, color 160ms ease',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--text-primary)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-muted)'; }}
      >
        <CloseIcon />
      </button>

      <motion.div
        initial={{ opacity: 0, y: 4 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.32, ease: EASE_OUT, delay: 0.02 }}
        style={{ marginBottom: 6 }}
      >
        <div style={{ fontSize: 10, fontWeight: 700, letterSpacing: '0.14em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 6 }}>
          Novedades del sistema
        </div>
        <div style={{ fontSize: 18, fontWeight: 700, color: 'var(--text-primary)', letterSpacing: '-0.01em', lineHeight: 1.25 }}>
          Lo que hemos mejorado
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
          Cada avance del panel se publica aquí. Lo más nuevo, arriba.
        </div>
      </motion.div>

      <div
        style={{
          overflowY: 'auto', margin: '18px -24px 0', padding: '4px 24px 20px',
          position: 'relative', maxHeight: 'min(58vh, 460px)',
        }}
      >
        <div
          aria-hidden
          style={{
            position: 'absolute', top: 14, bottom: 28, left: 34,
            width: 1, background: 'var(--border-hairline)',
          }}
        />

        {changelog.map((r, i) => (
          <motion.div
            key={r.id}
            initial={{ opacity: 0, x: -6 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ duration: 0.3, ease: EASE_OUT, delay: 0.14 + i * 0.06 }}
            style={{ position: 'relative', display: 'flex', gap: 14, padding: '10px 0 18px' }}
          >
            <div
              style={{
                position: 'relative', zIndex: 1, flexShrink: 0,
                width: 22, height: 22, borderRadius: '50%',
                background: 'var(--bg-card)',
                border: `1px solid ${i === 0 ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                marginTop: 2,
              }}
            >
              <span
                style={{
                  width: 8, height: 8, borderRadius: '50%',
                  background: i === 0 ? 'var(--accent)' : 'var(--border-medium)',
                }}
              />
            </div>

            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ display: 'flex', flexWrap: 'wrap', alignItems: 'center', gap: 8, marginBottom: 4 }}>
                <span style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)', letterSpacing: '-0.005em' }}>
                  {r.titulo}
                </span>
                {r.tag && <Chip>{r.tag}</Chip>}
              </div>
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>{r.fecha}</div>

              {r.sections?.map((section, si) => (
                <div key={si} style={{ marginBottom: si === r.sections.length - 1 ? 0 : 14 }}>
                  {section.semana && (
                    <div style={{
                      fontSize: 10, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
                      color: 'var(--text-muted)', marginBottom: 8,
                    }}>
                      {section.semana}
                    </div>
                  )}
                  <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                    {section.items.map((item, j) => (
                      <motion.li
                        key={j}
                        initial={{ opacity: 0, x: -4 }}
                        animate={{ opacity: 1, x: 0 }}
                        transition={{ duration: 0.24, ease: EASE_OUT, delay: 0.22 + i * 0.06 + j * 0.035 }}
                        style={{
                          fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55,
                          paddingLeft: 14, position: 'relative',
                        }}
                      >
                        <span
                          aria-hidden
                          style={{
                            position: 'absolute', left: 0, top: 8,
                            width: 4, height: 4, borderRadius: '50%',
                            background: 'var(--text-muted)',
                          }}
                        />
                        {item}
                      </motion.li>
                    ))}
                  </ul>
                </div>
              ))}

              {r.items && !r.sections && (
                <ul style={{ margin: 0, padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 7 }}>
                  {r.items.map((item, j) => (
                    <li key={j} style={{
                      fontSize: 12.5, color: 'var(--text-secondary)', lineHeight: 1.55,
                      paddingLeft: 14, position: 'relative',
                    }}>
                      <span aria-hidden style={{
                        position: 'absolute', left: 0, top: 8,
                        width: 4, height: 4, borderRadius: '50%',
                        background: 'var(--text-muted)',
                      }} />
                      {item}
                    </li>
                  ))}
                </ul>
              )}
            </div>
          </motion.div>
        ))}
      </div>
    </div>
  );
}

export default function ChangelogWidget({ visible, resetKey = 0 }) {
  const latestId = changelog[0]?.id;

  // phase: hidden | seed | pill | open
  const [phase, setPhase] = useState('hidden');
  const [contentVisible, setContentVisible] = useState(false);
  const [firstVisit, setFirstVisit] = useState(false);
  const autoOpenedRef = useRef(false);

  // Lee estado "visto" al montar
  useEffect(() => {
    if (!latestId) return;
    let stored = null;
    try { stored = localStorage.getItem(STORAGE_KEY); } catch { /* ignore */ }
    setFirstVisit(stored !== latestId);
  }, [latestId]);

  // Coreografía por fases
  useEffect(() => {
    if (!visible || !latestId) return undefined;
    setPhase('hidden');
    setContentVisible(false);

    const timers = [];
    const wait = (ms, fn) => { const t = setTimeout(fn, ms); timers.push(t); };

    if (firstVisit && !autoOpenedRef.current) {
      // FASE 1: nace la semilla en la esquina inferior derecha
      wait(1100, () => setPhase('seed'));
      // FASE 2 + 3: viaja al centro y se transforma en el modal
      wait(1950, () => {
        autoOpenedRef.current = true;
        setPhase('open');
        try { localStorage.setItem(STORAGE_KEY, latestId); } catch { /* ignore */ }
      });
      // El contenido entra un pelo después de que termine el morph
      wait(2550, () => setContentVisible(true));
    } else {
      // Visita ya vista: cae la píldora directamente
      wait(900, () => setPhase('pill'));
    }

    return () => timers.forEach(clearTimeout);
  }, [visible, latestId, resetKey, firstVisit]);

  // Cerrar con Escape
  useEffect(() => {
    if (phase !== 'open') return undefined;
    const onKey = (e) => {
      if (e.key === 'Escape') {
        setContentVisible(false);
        setTimeout(() => setPhase('pill'), 180);
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [phase]);

  const handleOpen = () => {
    setPhase('open');
    setContentVisible(false);
    setTimeout(() => setContentVisible(true), 380);
    try { localStorage.setItem(STORAGE_KEY, latestId); } catch { /* ignore */ }
  };

  const handleClose = () => {
    setContentVisible(false);
    setTimeout(() => setPhase('pill'), 180);
  };

  if (!latestId) return null;

  return (
    <MotionConfig reducedMotion="user">
      {/* Fondo desenfocado — separado del morph */}
      <AnimatePresence>
        {phase === 'open' && (
          <motion.div
            key="backdrop"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={{ duration: 0.22, ease: EASE_OUT }}
            onClick={handleClose}
            style={{
              position: 'fixed', inset: 0, zIndex: 90,
              background: 'rgba(12, 10, 24, 0.5)',
              backdropFilter: 'blur(8px)',
              WebkitBackdropFilter: 'blur(8px)',
            }}
          />
        )}
      </AnimatePresence>

      {/* Elemento que se transforma — mismo layoutId en cada fase */}
      <AnimatePresence>
        {phase === 'seed' && (
          <motion.div
            key="seed"
            layoutId={LAYOUT_ID}
            initial={{ scale: 0, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_QUICK}
            style={{
              position: 'fixed',
              right: 36, bottom: 36,
              width: 46, height: 46,
              borderRadius: 999,
              background: 'var(--accent)',
              boxShadow: '0 8px 32px -4px rgba(191, 0, 255, 0.4), 0 0 0 6px rgba(191, 0, 255, 0.08)',
              zIndex: 92,
              pointerEvents: 'none',
            }}
          />
        )}

        {phase === 'pill' && (
          <motion.button
            key="pill"
            layoutId={LAYOUT_ID}
            onClick={handleOpen}
            aria-label="Ver últimas novedades"
            initial={{ y: -140, opacity: 0 }}
            animate={{ y: 0, opacity: 1 }}
            exit={{ opacity: 0 }}
            transition={SPRING_MORPH}
            whileHover={{ y: -3, transition: { type: 'spring', stiffness: 400, damping: 22 } }}
            whileTap={{ scale: 0.97, transition: { duration: 0.1 } }}
            style={{
              position: 'fixed',
              right: 24, bottom: 24, zIndex: 92,
              display: 'inline-flex', alignItems: 'center', gap: 10,
              padding: '10px 16px 10px 12px',
              borderRadius: 999,
              border: '1px solid var(--border-subtle)',
              background: 'var(--bg-card)',
              boxShadow: '0 12px 30px -12px rgba(20, 20, 40, 0.24), 0 2px 6px -2px rgba(20, 20, 40, 0.08)',
              color: 'var(--text-primary)',
              fontFamily: 'inherit', cursor: 'pointer',
            }}
          >
            <span
              style={{
                width: 26, height: 26, borderRadius: '50%',
                display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
                color: 'var(--accent)', background: 'var(--accent-dim)',
                border: '1px solid var(--accent-border)',
              }}
            >
              <SparkIcon />
            </span>
            <span style={{ fontSize: 12, fontWeight: 600 }}>Novedades</span>
          </motion.button>
        )}

        {phase === 'open' && (
          <div
            key="open-wrapper"
            style={{
              position: 'fixed', inset: 0, zIndex: 93,
              display: 'flex', alignItems: 'center', justifyContent: 'center',
              padding: 20, pointerEvents: 'none',
            }}
          >
            <motion.div
              layoutId={LAYOUT_ID}
              role="dialog"
              aria-modal="true"
              aria-label="Novedades del panel"
              transition={SPRING_MORPH}
              style={{
                pointerEvents: 'all',
                width: '100%', maxWidth: 480,
                background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)',
                borderRadius: 20,
                boxShadow: '0 32px 80px -20px rgba(15, 10, 40, 0.42), 0 0 0 1px rgba(255,255,255,0.03)',
                overflow: 'hidden',
                position: 'relative',
                minHeight: 200,
              }}
              onClick={(e) => e.stopPropagation()}
            >
              <AnimatePresence>
                {contentVisible && (
                  <motion.div
                    key="content"
                    initial={{ opacity: 0 }}
                    animate={{ opacity: 1 }}
                    exit={{ opacity: 0 }}
                    transition={{ duration: 0.24, ease: EASE_OUT }}
                  >
                    <ChangelogContent onClose={handleClose} />
                  </motion.div>
                )}
              </AnimatePresence>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </MotionConfig>
  );
}
