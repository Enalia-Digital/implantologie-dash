import { useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, SectionLabel, CountUpValue } from '../ui/primitives';
import { fmt } from '../../lib/calc';
import { useClinic } from '../../context/ClinicContext';

const EASE_APPLE = [0.32, 0.72, 0, 1];

const CLINIC_LABEL = {
  triana: 'Triana',
  los_palacios: 'Los Palacios',
  san_jose: 'San José',
  otras: 'Otras',
};

function fmtDateShort(iso) {
  if (!iso) return '—';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      weekday: 'short', day: '2-digit', month: 'short',
    });
  } catch { return iso; }
}
function fmtDateTime(iso) {
  if (!iso) return '';
  try {
    const d = new Date(iso);
    return d.toLocaleDateString('es-ES', {
      hour: '2-digit', minute: '2-digit',
    });
  } catch { return ''; }
}

function Row({ item, index }) {
  const asistio = item.estado === 'attended';
  const color = asistio ? 'var(--green)' : 'var(--red)';
  const bg = asistio ? 'rgba(31, 168, 102, 0.10)' : 'rgba(224, 62, 84, 0.10)';
  const border = asistio ? 'rgba(31, 168, 102, 0.28)' : 'rgba(224, 62, 84, 0.28)';

  return (
    <motion.div
      initial={{ opacity: 0, y: 4 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.24, ease: EASE_APPLE, delay: index * 0.03 }}
      style={{
        display: 'grid',
        gridTemplateColumns: '28px minmax(0, 1fr) auto',
        alignItems: 'center',
        gap: 12,
        padding: '12px 14px',
        borderRadius: 12,
        background: 'var(--bg-hover)',
        border: '1px solid var(--border-hairline)',
      }}
      className="attendance-row"
    >
      {/* Badge de estado */}
      <div style={{
        width: 24, height: 24, borderRadius: 999,
        background: bg,
        border: `1px solid ${border}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        color,
      }}>
        {asistio ? (
          <svg width="12" height="12" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M2.5 7.5l3 3 6-7" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 14 14" fill="none" stroke="currentColor" strokeWidth="2.2" strokeLinecap="round" strokeLinejoin="round">
            <path d="M3.5 3.5l7 7M10.5 3.5l-7 7" />
          </svg>
        )}
      </div>

      {/* Nombre + clinica */}
      <div style={{ minWidth: 0 }}>
        <div style={{
          fontSize: 13, fontWeight: 600, color: 'var(--text-primary)',
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {item.nombre}
        </div>
        <div style={{
          fontSize: 11, color: 'var(--text-muted)', marginTop: 1,
          whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis',
        }}>
          {CLINIC_LABEL[item.clinicKey] || item.clinicRaw || 'Sin clínica'}
        </div>
      </div>

      {/* Fecha */}
      <div style={{ textAlign: 'right' }}>
        <div style={{
          fontSize: 12, fontWeight: 500, color,
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {fmtDateShort(item.appointmentStart)}
        </div>
        <div style={{
          fontSize: 10, color: 'var(--text-muted)',
          fontVariantNumeric: 'tabular-nums',
          whiteSpace: 'nowrap',
        }}>
          {fmtDateTime(item.appointmentStart)}
        </div>
      </div>
    </motion.div>
  );
}

export default function AttendanceBlock({ data }) {
  const { period } = useClinic();
  const [tab, setTab] = useState('all'); // all | attended | no_show

  const items = data?.asistenciasRecientes || [];
  const attended = items.filter((i) => i.estado === 'attended');
  const noShow = items.filter((i) => i.estado === 'no_show');

  const totalAsistidas = data?.citasAsistidas || 0;
  const totalNoShow = data?.citasNoShow || 0;
  const tasaAsistencia = (totalAsistidas + totalNoShow) > 0
    ? (totalAsistidas / (totalAsistidas + totalNoShow)) * 100
    : null;

  const filtered = tab === 'attended' ? attended : tab === 'no_show' ? noShow : items;

  if (items.length === 0 && totalAsistidas === 0 && totalNoShow === 0) {
    return null;
  }

  return (
    <section>
      <SectionLabel>Asistencia</SectionLabel>
      <Card style={{ padding: 24, borderRadius: 20 }}>
        {/* Header hero */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: 'minmax(0, 1.2fr) minmax(0, 1fr) minmax(0, 1fr)',
          gap: 20,
          alignItems: 'baseline',
          marginBottom: 20,
        }} className="attendance-hero">
          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 15, fontWeight: 600, color: 'var(--text-primary)',
              letterSpacing: '-0.01em',
            }}>
              Asistencia real
            </div>
            <div style={{
              fontSize: 12, color: 'var(--text-muted)', marginTop: 4, lineHeight: 1.5,
            }}>
              Citas confirmadas del CRM: quién ha acudido y quién no
            </div>
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              Asistieron
            </div>
            <div style={{
              fontSize: 32, fontWeight: 600, lineHeight: 1.05,
              color: 'var(--green)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.015em',
            }}>
              <CountUpValue value={totalAsistidas} deps={[period]} />
            </div>
            {tasaAsistencia !== null && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {fmt(tasaAsistencia, 0)}% de las confirmadas
              </div>
            )}
          </div>

          <div style={{ minWidth: 0 }}>
            <div style={{
              fontSize: 10, fontWeight: 500, letterSpacing: '0.10em',
              textTransform: 'uppercase', color: 'var(--text-muted)',
              marginBottom: 6,
            }}>
              No acudieron
            </div>
            <div style={{
              fontSize: 32, fontWeight: 600, lineHeight: 1.05,
              color: 'var(--red)',
              fontVariantNumeric: 'tabular-nums',
              letterSpacing: '-0.015em',
            }}>
              <CountUpValue value={totalNoShow} deps={[period]} />
            </div>
            {tasaAsistencia !== null && (
              <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
                {fmt(100 - tasaAsistencia, 0)}% ausencia
              </div>
            )}
          </div>
        </div>

        {/* Tabs de filtro */}
        {items.length > 0 && (
          <div style={{
            display: 'flex', gap: 6, marginBottom: 14,
            padding: 4,
            background: 'var(--bg-hover)',
            borderRadius: 10,
            width: 'fit-content',
          }} className="attendance-tabs">
            {[
              { id: 'all', label: `Todas (${items.length})` },
              { id: 'attended', label: `Asistieron (${attended.length})` },
              { id: 'no_show', label: `No acudieron (${noShow.length})` },
            ].map((t) => {
              const active = tab === t.id;
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  className="attendance-tab-btn"
                  data-active={active}
                >
                  {t.label}
                </button>
              );
            })}
          </div>
        )}

        {/* Lista */}
        {items.length === 0 && (
          <div style={{
            padding: '32px 20px', textAlign: 'center',
            border: '1px dashed var(--border-hairline)', borderRadius: 12,
          }}>
            <div style={{ fontSize: 13, color: 'var(--text-muted)' }}>
              Aún no hay asistencias confirmadas en este periodo
            </div>
            <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 4 }}>
              Se irán llenando desde Airtable a medida que se marquen
            </div>
          </div>
        )}

        <AnimatePresence mode="popLayout">
          <div style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {filtered.slice(0, 12).map((item, i) => (
              <Row key={item.recordId} item={item} index={i} />
            ))}
          </div>
        </AnimatePresence>

        {filtered.length > 12 && (
          <div style={{
            fontSize: 11, color: 'var(--text-muted)', marginTop: 10, textAlign: 'center',
          }}>
            + {filtered.length - 12} más
          </div>
        )}
      </Card>

      <style>{`
        .attendance-tab-btn {
          padding: 6px 12px;
          font-size: 12px; font-weight: 500;
          border-radius: 7px;
          border: none;
          background: transparent;
          color: var(--text-secondary);
          cursor: pointer; font-family: inherit;
          transition: background 160ms cubic-bezier(0.23,1,0.32,1),
                      color 160ms cubic-bezier(0.23,1,0.32,1);
        }
        .attendance-tab-btn:hover:not([data-active="true"]) {
          color: var(--text-primary);
        }
        .attendance-tab-btn[data-active="true"] {
          background: var(--bg-card);
          color: var(--text-primary);
          box-shadow: 0 1px 3px rgba(0,0,0,0.06);
        }
        @media (max-width: 680px) {
          .attendance-hero {
            grid-template-columns: 1fr !important;
            gap: 16px !important;
          }
          .attendance-tabs { width: 100% !important; }
          .attendance-tab-btn { flex: 1; text-align: center; }
        }
      `}</style>
    </section>
  );
}
