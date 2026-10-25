import { Fragment, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { Card, SectionLabel } from '../ui/primitives';
import { fmt, fmtPct } from '../../lib/calc';

const EASE = [0.23, 1, 0.32, 1];

function convColor(v) {
  if (v >= 20) return 'var(--green)';
  if (v >= 10) return 'var(--orange)';
  return 'var(--red)';
}

function estadoColor(e) {
  if (e === 'Agendado') return 'var(--green)';
  if (e === 'Contactado') return 'var(--accent)';
  if (e === 'Sin descolgar') return 'var(--orange)';
  return 'var(--text-muted)';
}

// Grupos por tratamiento. Mismos colores que el bloque de clínicas para que todo
// el panel hable el mismo idioma visual.
const GROUPS_DEF = [
  { key: 'estetica', label: 'Carillas', color: '#00C2B8' },
  { key: 'implantologia', label: 'Implantes', color: '#BF00FF' },
  { key: 'ortodoncia', label: 'Ortodoncia', color: '#FF7A00' },
];

// --- Podio: top 3 campañas por número de CITAS (desempate: conversión) ---
// Pendiente (próximo informe): poder ordenar también por ticket medio / valor €.
function PodiumCard({ row, place }) {
  const first = place === 1;
  const accent = first ? 'var(--accent)' : 'var(--text-secondary)';
  const medal = place === 1 ? '👑' : place === 2 ? '🥈' : '🥉';
  return (
    <motion.div
      initial={{ opacity: 0, y: 14 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4, ease: EASE, delay: 0.05 * place }}
      className="podium-card"
      data-first={first}
      style={{
        display: 'flex', flexDirection: 'column', alignItems: 'center', textAlign: 'center',
        flex: 1, minWidth: 0,
        padding: first ? '18px 14px 20px' : '14px 12px 16px',
        borderRadius: 18,
        background: first ? 'var(--accent-dim)' : 'var(--bg-card)',
        border: `1px solid ${first ? 'var(--accent-border)' : 'var(--border-hairline)'}`,
        boxShadow: first ? '0 8px 28px rgba(191,0,255,0.14)' : '0 1px 2px rgba(15,15,25,0.03)',
        alignSelf: 'stretch',
      }}
    >
      <div style={{ fontSize: first ? 26 : 20, lineHeight: 1, marginBottom: 6 }}>{medal}</div>
      <div style={{
        fontSize: 9, fontWeight: 700, letterSpacing: '0.1em', textTransform: 'uppercase',
        color: accent, marginBottom: first ? 10 : 8,
      }}>
        Top {place}
      </div>

      <div style={{
        fontSize: first ? 40 : 30, fontWeight: 600, lineHeight: 1, letterSpacing: '-0.02em',
        color: first ? 'var(--accent)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums',
      }}>
        {fmt(row.citas)}
      </div>
      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 3, marginBottom: 12 }}>
        citas
      </div>

      <div style={{
        fontSize: first ? 14 : 13, fontWeight: 600, color: 'var(--text-primary)',
        lineHeight: 1.25, overflow: 'hidden', textOverflow: 'ellipsis',
        display: '-webkit-box', WebkitLineClamp: 2, WebkitBoxOrient: 'vertical',
      }}>
        {row.anuncio}
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
        {row.campaña}
      </div>

      <div style={{
        marginTop: 12, paddingTop: 10, width: '100%',
        borderTop: '1px solid var(--border-hairline)',
        display: 'flex', justifyContent: 'center', flexWrap: 'wrap', gap: 10,
        fontSize: 11, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums',
      }}>
        <span>{fmt(row.leads)} leads</span>
        <span style={{ color: 'var(--border-subtle)' }}>·</span>
        <span style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(row.asistencias || 0)} asist.</span>
        <span style={{ color: 'var(--border-subtle)' }}>·</span>
        <span style={{ color: convColor(row.conv), fontWeight: 600 }}>{fmtPct(row.conv)}</span>
      </div>
    </motion.div>
  );
}

function Podium({ rows }) {
  // Orden: por citas; si empatan, el de mejor conversión.
  const ranked = [...rows].sort((a, b) => (b.citas - a.citas) || (b.conv - a.conv));
  const top = ranked.slice(0, 3);
  if (top.length === 0 || top[0].citas === 0) return null;

  // Colocación visual: 2º a la izquierda, 1º en el centro (más alto), 3º a la derecha.
  const left = top[1];
  const center = top[0];
  const right = top[2];

  return (
    <Card style={{ padding: 'clamp(16px, 3vw, 22px)', marginBottom: 14 }}>
      <div style={{ display: 'flex', alignItems: 'center', gap: 8, marginBottom: 4 }}>
        <span style={{ fontSize: 14 }}>🏆</span>
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>Podio de campañas</span>
      </div>
      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 16 }}>
        Las que más citas traen.
      </div>

      <div className="podium-row" style={{ display: 'flex', alignItems: 'flex-end', gap: 10 }}>
        {left && <PodiumCard row={left} place={2} />}
        <PodiumCard row={center} place={1} />
        {right && <PodiumCard row={right} place={3} />}
      </div>

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 14, lineHeight: 1.5 }}>
        * Ordenado por número de citas. Pendiente para el próximo informe: ordenar también por <b style={{ fontWeight: 600 }}>ticket medio</b> (valor € de cada tratamiento).
      </div>

      <style>{`
        @media (max-width: 560px) {
          .podium-row { flex-direction: column; align-items: stretch !important; }
          .podium-row .podium-card[data-first="true"] { order: -1; }
        }
      `}</style>
    </Card>
  );
}

// Tabla de campañas de un tratamiento. Entra entera (sin scroll lateral): layout
// fijo con columnas de ancho repartido y los textos largos hacen wrap.
function CampaignTable({ rows, bestKey, openKey, setOpenKey }) {
  const th = { fontSize: 10, fontWeight: 500, letterSpacing: '0.04em', textTransform: 'uppercase', color: 'var(--text-muted)', padding: '0 8px 10px', verticalAlign: 'bottom' };
  const td = { fontSize: 12, color: 'var(--text-secondary)', padding: '10px 8px', verticalAlign: 'top' };

  return (
    <table style={{ width: '100%', borderCollapse: 'collapse', tableLayout: 'fixed' }}>
      <colgroup>
        <col style={{ width: '21%' }} />
        <col style={{ width: '27%' }} />
        <col style={{ width: '9%' }} />
        <col style={{ width: '13%' }} />
        <col style={{ width: '9%' }} />
        <col style={{ width: '9%' }} />
        <col style={{ width: '12%' }} />
      </colgroup>
      <thead>
        <tr style={{ textAlign: 'left' }}>
          <th style={{ ...th, textAlign: 'left' }}>Campaña</th>
          <th style={{ ...th, textAlign: 'left' }}>Anuncio</th>
          <th style={{ ...th, textAlign: 'right' }}>Leads</th>
          <th style={{ ...th, textAlign: 'right' }}>Contact.</th>
          <th style={{ ...th, textAlign: 'right' }} title="Citas agendadas (agendamientos)">Citas</th>
          <th style={{ ...th, textAlign: 'right' }} title="Pacientes que de verdad acudieron a la cita">Asist.</th>
          <th style={{ ...th, textAlign: 'right' }} title="Citas agendadas sobre el total de leads">Agend.</th>
        </tr>
      </thead>
      <tbody>
        {rows.map((r) => {
          const rowKey = `${r.campaña}|||${r.anuncio}`;
          const open = openKey === rowKey;
          const detalles = r.detalles || [];
          return (
            <Fragment key={rowKey}>
              <tr
                className="row-hover"
                onClick={() => setOpenKey(open ? null : rowKey)}
                style={{ borderTop: '1px solid var(--border-hairline)', cursor: 'pointer' }}
              >
                <td style={{ ...td, color: 'var(--text-primary)', wordBreak: 'break-word' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'flex-start', gap: 7 }}>
                    <svg
                      width="10" height="10" viewBox="0 0 10 10" fill="none"
                      style={{ marginTop: 4, transform: open ? 'rotate(90deg)' : 'none', transition: 'transform var(--duration-fast) var(--ease-default)', flexShrink: 0 }}
                    >
                      <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.3" strokeLinecap="round" strokeLinejoin="round" />
                    </svg>
                    {r.campaña}
                  </span>
                </td>
                <td style={{ ...td, wordBreak: 'break-word' }}>
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, flexWrap: 'wrap' }}>
                    {r.anuncio}
                    {rowKey === bestKey && (
                      <span style={{ fontSize: 9, fontWeight: 600, letterSpacing: '0.04em', color: 'var(--accent)', background: 'rgba(191,0,255,0.12)', border: '1px solid var(--accent-border)', borderRadius: 4, padding: '2px 6px' }}>
                        MEJOR
                      </span>
                    )}
                  </span>
                </td>
                <td style={{ ...td, textAlign: 'right' }}>{fmt(r.leads)}</td>
                <td style={{ ...td, textAlign: 'right' }}>{fmt(r.contactados)}</td>
                <td style={{ ...td, textAlign: 'right', color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(r.citas)}</td>
                <td style={{ ...td, textAlign: 'right', color: (r.asistencias || 0) > 0 ? 'var(--green)' : 'var(--text-muted)', fontWeight: (r.asistencias || 0) > 0 ? 600 : 400 }}>{fmt(r.asistencias || 0)}</td>
                <td style={{ ...td, textAlign: 'right', color: convColor(r.conv), fontWeight: 600 }}>{fmtPct(r.conv)}</td>
              </tr>

              {open && detalles.length > 0 && (
                <tr>
                  <td colSpan={7} style={{ padding: '0 8px 14px 27px', background: 'var(--row-hover)' }}>
                    {detalles.map((d, j) => (
                      <div
                        key={j}
                        style={{
                          display: 'flex', alignItems: 'center', gap: 12, flexWrap: 'wrap',
                          padding: '8px 0', borderTop: '1px solid var(--border-hairline)',
                        }}
                      >
                        <span style={{ fontSize: 12, fontWeight: 600, color: 'var(--text-primary)', minWidth: 160 }}>{d.nombre}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 44 }}>{d.fecha}</span>
                        <span style={{ fontSize: 10, color: 'var(--text-muted)', minWidth: 84 }}>{d.clinica}</span>
                        <span style={{ fontSize: 10, fontWeight: 600, color: estadoColor(d.estado) }}>{d.estado}</span>
                      </div>
                    ))}
                  </td>
                </tr>
              )}
            </Fragment>
          );
        })}
      </tbody>
    </table>
  );
}

function TreatmentGroup({ group, open, onToggle, bestKey, openKey, setOpenKey }) {
  return (
    <Card style={{ padding: 0, overflow: 'hidden', marginBottom: 12 }}>
      <button
        type="button"
        onClick={onToggle}
        aria-expanded={open}
        className="row-hover"
        style={{
          width: '100%', display: 'flex', alignItems: 'center', gap: 12,
          padding: '16px 18px', background: 'transparent', border: 'none',
          cursor: 'pointer', textAlign: 'left',
        }}
      >
        <svg
          width="12" height="12" viewBox="0 0 10 10" fill="none"
          style={{ transform: open ? 'rotate(90deg)' : 'none', transition: 'transform 200ms var(--ease-default)', flexShrink: 0 }}
        >
          <path d="M3.5 1.5L7 5l-3.5 3.5" stroke="var(--text-muted)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round" />
        </svg>
        <span style={{ width: 10, height: 10, borderRadius: 3, background: group.color, flexShrink: 0 }} />
        <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>{group.label}</span>
        <span style={{ marginLeft: 'auto', display: 'inline-flex', alignItems: 'center', gap: 12, fontSize: 11, color: 'var(--text-secondary)', fontVariantNumeric: 'tabular-nums', flexWrap: 'wrap', justifyContent: 'flex-end' }}>
          <span><b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(group.leads)}</b> leads</span>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          <span><b style={{ color: 'var(--text-primary)', fontWeight: 600 }}>{fmt(group.citas)}</b> citas</span>
          <span style={{ color: 'var(--border-subtle)' }}>·</span>
          <span style={{ color: 'var(--green)', fontWeight: 600 }}>{fmt(group.asistencias)} asist.</span>
        </span>
      </button>

      <AnimatePresence initial={false}>
        {open && (
          <motion.div
            key="body"
            initial={{ height: 0, opacity: 0 }}
            animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }}
            transition={{ duration: 0.28, ease: EASE }}
            style={{ overflow: 'hidden' }}
          >
            <div style={{ padding: '0 14px 10px' }}>
              <CampaignTable rows={group.rows} bestKey={bestKey} openKey={openKey} setOpenKey={setOpenKey} />
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </Card>
  );
}

export default function CampaignsBlock({ data }) {
  const [openKey, setOpenKey] = useState(null);
  const [openGroups, setOpenGroups] = useState(null);
  const rows = data.campanas;
  if (!rows || rows.length === 0) return null;

  // Campaña con más citas en todo el conjunto: lleva el badge "MEJOR".
  const bestRow = rows.reduce((best, r) => (r.citas > best.citas ? r : best), rows[0]);
  const bestKey = bestRow.citas > 0 ? `${bestRow.campaña}|||${bestRow.anuncio}` : null;

  // Agrupamos por tratamiento. Las filas ya vienen ordenadas por citas; dentro
  // de cada grupo se conserva ese orden. Los grupos se ordenan por más leads.
  const buckets = { estetica: [], implantologia: [], ortodoncia: [], otras: [] };
  rows.forEach((r) => {
    const k = buckets[r.tratamiento] ? r.tratamiento : 'otras';
    buckets[k].push(r);
  });
  const sumBy = (arr, f) => arr.reduce((s, r) => s + (f(r) || 0), 0);
  let groups = GROUPS_DEF
    .map((g) => ({
      ...g,
      rows: buckets[g.key],
      leads: sumBy(buckets[g.key], (r) => r.leads),
      citas: sumBy(buckets[g.key], (r) => r.citas),
      asistencias: sumBy(buckets[g.key], (r) => r.asistencias),
    }))
    .filter((g) => g.rows.length > 0);
  if (buckets.otras.length > 0) {
    groups.push({
      key: 'otras', label: 'Otras', color: 'var(--text-muted)', rows: buckets.otras,
      leads: sumBy(buckets.otras, (r) => r.leads),
      citas: sumBy(buckets.otras, (r) => r.citas),
      asistencias: sumBy(buckets.otras, (r) => r.asistencias),
    });
  }
  groups.sort((a, b) => b.leads - a.leads);

  // Por defecto abrimos el grupo con más leads; el resto cerrados. El usuario
  // puede abrir/cerrar cada uno y tener los tres abiertos a la vez.
  const defaultOpen = groups.length > 0 ? new Set([groups[0].key]) : new Set();
  const openSet = openGroups ?? defaultOpen;
  const toggleGroup = (k) => {
    const next = new Set(openSet);
    if (next.has(k)) next.delete(k); else next.add(k);
    setOpenGroups(next);
  };

  return (
    <section>
      <SectionLabel>Rendimiento de Campañas</SectionLabel>

      <Podium rows={rows} />

      <div style={{ fontSize: 11, color: 'var(--text-muted)', marginBottom: 12 }}>
        Pulsa un tratamiento para ver sus campañas, y una campaña para ver sus leads. <b style={{ fontWeight: 600 }}>Contact.</b> son los que cogieron el teléfono; <b style={{ fontWeight: 600 }}>Asist.</b> los que acudieron a la cita (por fecha de cita, por eso puede incluir leads que entraron otro mes).
      </div>

      {groups.map((g) => (
        <TreatmentGroup
          key={g.key}
          group={g}
          open={openSet.has(g.key)}
          onToggle={() => toggleGroup(g.key)}
          bestKey={bestKey}
          openKey={openKey}
          setOpenKey={setOpenKey}
        />
      ))}

      <div style={{ fontSize: 10, color: 'var(--text-muted)', marginTop: 6, lineHeight: 1.5 }}>
        * Ordenado por número de citas. La foto del anuncio no se puede mostrar aquí: no tenemos acceso al portafolio de anuncios de Meta.
      </div>
    </section>
  );
}
