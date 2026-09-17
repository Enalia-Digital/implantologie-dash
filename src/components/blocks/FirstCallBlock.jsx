import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { fmt } from '../../lib/calc';
import { useClinic } from '../../context/ClinicContext';

/**
 * "En qué llamada se cerró la cita".
 * Universo: leads con cita creada en el periodo.
 * Buckets: 1ª · 2ª · 3ª · 4ª · 5ª · +5.
 *
 * Estetica Apple: 1 metrica hero (% a la primera), mini bar chart con hover,
 * sin tabla larga, sin ruido. La info profunda esta al hover.
 */

const ORDER = ['1', '2', '3', '4', '5', '6+'];
const LABELS = {
  '1':  '1ª',
  '2':  '2ª',
  '3':  '3ª',
  '4':  '4ª',
  '5':  '5ª',
  '6+': '+5',
};
const LABEL_LONG = {
  '1':  '1ª llamada',
  '2':  '2ª llamada',
  '3':  '3ª llamada',
  '4':  '4ª llamada',
  '5':  '5ª llamada',
  '6+': 'más de 5 llamadas',
};

const SPRING = { type: 'spring', stiffness: 260, damping: 26, mass: 0.6 };
const EASE_APPLE = [0.32, 0.72, 0, 1];

function Bar({ row, index, hovered, setHovered, max, isPrimary }) {
  const h = max > 0 ? (row.count / max) * 100 : 0;
  const isHovered = hovered === index;
  const isAdj = hovered !== null && Math.abs(hovered - index) === 1;

  const bg = isHovered
    ? 'var(--accent)'
    : isAdj
      ? 'var(--accent-border)'
      : isPrimary
        ? 'var(--accent-dim)'
        : 'var(--border-medium)';

  return (
    <button
      type="button"
      aria-label={`${LABEL_LONG[row.key]}: ${row.count} citas · ${fmt(row.pct, 0)}%`}
      onMouseEnter={() => setHovered(index)}
      onFocus={() => setHovered(index)}
      className="first-bar"
      style={{
        flex: 1, minWidth: 0,
        display: 'flex', flexDirection: 'column',
        alignItems: 'center', gap: 6,
        background: 'transparent', border: 'none', padding: 0,
        cursor: 'default',
      }}
    >
      <div style={{ width: '100%', height: 72, display: 'flex', alignItems: 'flex-end' }}>
        <motion.div
          style={{ width: '100%', borderRadius: 4, minHeight: 3 }}
          initial={{ height: '0%', backgroundColor: 'var(--border-medium)' }}
          animate={{
            height: `${Math.max(h, 3)}%`,
            backgroundColor: bg,
          }}
          transition={{
            height: { ...SPRING, delay: index * 0.03 },
            backgroundColor: { duration: 0.22, ease: EASE_APPLE },
          }}
        />
      </div>
      <span style={{
        fontSize: 10,
        color: isHovered ? 'var(--text-primary)' : 'var(--text-muted)',
        fontWeight: isHovered ? 600 : 500,
        letterSpacing: '0.02em',
        transition: 'color 160ms ease',
      }}>
        {LABELS[row.key]}
      </span>
    </button>
  );
}

export default function FirstCallBlock({ data }) {
  const { period } = useClinic();
  const [hovered, setHovered] = useState(null);
  const agi = data?.agendamientoPorIntento;
  if (!agi || !agi.total) return null;

  const total = agi.total;
  const rows = useMemo(() => ORDER.map((k) => ({
    key: k,
    count: agi.buckets[k] || 0,
    pct: total > 0 ? ((agi.buckets[k] || 0) / total) * 100 : 0,
  })), [agi, total]);
  const max = Math.max(...rows.map((r) => r.count), 1);

  const primera = agi.buckets['1'] || 0;
  const pctPrimera = total > 0 ? (primera / total) * 100 : 0;

  const hoveredRow = hovered !== null && rows[hovered] ? rows[hovered] : null;

  return (
    <section>
      <SectionLabel>Agendamiento por llamada</SectionLabel>
      <Card style={{ padding: 24, borderRadius: 20 }}>
        <div
          className="firstcall-layout"
          style={{
            display: 'grid',
            gridTemplateColumns: 'minmax(0, 1fr) minmax(0, 1.6fr)',
            gap: 32,
            alignItems: 'center',
          }}
        >
          {/* Izquierda: metrica hero */}
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 8,
            }}>
              Cerrado a la 1ª
            </div>
            <div style={{
              display: 'flex', alignItems: 'baseline', gap: 8,
              lineHeight: 1,
            }}>
              <span className="firstcall-hero-value" style={{
                fontSize: 44, fontWeight: 600, color: 'var(--accent)',
                fontVariantNumeric: 'tabular-nums',
                letterSpacing: '-0.02em',
              }}>
                <CountUpValue value={pctPrimera} decimals={0} deps={[period]} />
                <span className="firstcall-hero-unit" style={{ fontSize: 22, fontWeight: 500, marginLeft: 2 }}>%</span>
              </span>
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', marginTop: 10,
              lineHeight: 1.5,
            }}>
              <b style={{ color: 'var(--text-secondary)', fontWeight: 600 }}>{primera}</b> de {total} citas cerradas en la primera llamada
            </div>
          </div>

          {/* Derecha: mini chart + tooltip */}
          <div
            onMouseLeave={() => setHovered(null)}
            style={{ position: 'relative', minWidth: 0, paddingTop: 44 }}
          >
            <AnimatePresence>
              {hoveredRow && (
                <motion.div
                  key="tt"
                  initial={{ opacity: 0, y: 4, scale: 0.96 }}
                  animate={{ opacity: 1, y: 0, scale: 1 }}
                  exit={{ opacity: 0, y: 4, scale: 0.96 }}
                  transition={{ duration: 0.18, ease: EASE_APPLE }}
                  style={{
                    position: 'absolute',
                    top: 0,
                    left: rows.length > 1
                      ? `calc(${(hovered / (rows.length - 1)) * 100}% - 0px)`
                      : '50%',
                    transform: 'translateX(-50%)',
                    pointerEvents: 'none',
                  }}
                >
                  <div style={{
                    position: 'relative',
                    display: 'inline-flex', alignItems: 'baseline', gap: 8,
                    padding: '7px 12px',
                    background: 'var(--text-primary)',
                    color: '#FFFFFF',
                    borderRadius: 10,
                    fontSize: 12, fontWeight: 600,
                    fontVariantNumeric: 'tabular-nums',
                    letterSpacing: '-0.01em',
                    whiteSpace: 'nowrap',
                    boxShadow: '0 8px 24px rgba(0,0,0,0.18)',
                  }}>
                    <span>{LABEL_LONG[hoveredRow.key]}</span>
                    <span style={{ opacity: 0.4 }}>·</span>
                    <span>{hoveredRow.count}</span>
                    <span style={{ opacity: 0.65, fontWeight: 500 }}>
                      ({fmt(hoveredRow.pct, 0)}%)
                    </span>
                    {/* puntita/callout apuntando a la barra */}
                    <span aria-hidden="true" style={{
                      position: 'absolute',
                      bottom: -4, left: '50%', transform: 'translateX(-50%) rotate(45deg)',
                      width: 8, height: 8,
                      background: 'var(--text-primary)',
                      borderRadius: 1,
                    }} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            <div style={{ display: 'flex', alignItems: 'flex-end', gap: 6 }}>
              {rows.map((r, i) => (
                <Bar
                  key={r.key}
                  row={r}
                  index={i}
                  hovered={hovered}
                  setHovered={setHovered}
                  max={max}
                  isPrimary={i === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </Card>

      <style>{`
        .first-bar:focus { outline: none; }
        .first-bar:focus-visible > div > div { outline: 2px solid var(--accent); outline-offset: 2px; }
        @media (max-width: 720px) {
          .firstcall-layout { grid-template-columns: 1fr !important; gap: 18px !important; }
          .firstcall-hero-value { font-size: 36px !important; }
          .firstcall-hero-unit { font-size: 18px !important; }
        }
      `}</style>
    </section>
  );
}
