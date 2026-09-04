import { useEffect, useMemo, useState } from 'react';
import { motion, AnimatePresence } from 'motion/react';
import { useClinic } from '../../context/ClinicContext';
import { clinicHeader } from '../../data/mockData';

const MESES = [
  'enero', 'febrero', 'marzo', 'abril', 'mayo', 'junio',
  'julio', 'agosto', 'septiembre', 'octubre', 'noviembre', 'diciembre',
];

function capitalize(s) {
  return s.charAt(0).toUpperCase() + s.slice(1);
}

// Genera la lista de meses cerrados: [{ id: '2026-09', label: 'Septiembre 2026', size, isLatest }]
// El "último" es el mes anterior al actual (mes cerrado más reciente).
function buildReportsList(activeClinic) {
  const now = new Date();
  const list = [];
  for (let i = 1; i <= 6; i += 1) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const y = d.getFullYear();
    const m = d.getMonth();
    list.push({
      id: `${y}-${String(m + 1).padStart(2, '0')}`,
      label: `${capitalize(MESES[m])} ${y}`,
      year: y,
      month: m,
      size: '~180 KB',
      isLatest: i === 1,
      clinicId: activeClinic,
      filename: `enalia-${activeClinic}-${y}-${String(m + 1).padStart(2, '0')}.pdf`,
    });
  }
  return list;
}

function ReceiptCard({ report, onDownload, onView, downloading }) {
  return (
    <motion.div
      layout
      initial={{ opacity: 0, y: 6 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
      style={{
        display: 'flex', alignItems: 'center', gap: 14,
        padding: '14px 16px',
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 10,
      }}
    >
      {/* Icono PDF */}
      <div style={{ position: 'relative', flexShrink: 0 }}>
        <svg width="38" height="46" viewBox="0 0 38 46" fill="none">
          <path d="M4 2h20l10 10v30a2 2 0 01-2 2H4a2 2 0 01-2-2V4a2 2 0 012-2z" fill="var(--bg-hover)" stroke="var(--border-subtle)" strokeWidth="1" />
          <path d="M24 2v10h10" stroke="var(--border-subtle)" strokeWidth="1" />
        </svg>
        <span style={{
          position: 'absolute', bottom: 6, left: -2,
          background: 'var(--red)', color: '#fff',
          fontSize: 9, fontWeight: 700, letterSpacing: '0.06em',
          padding: '2px 5px', borderRadius: 3,
        }}>
          PDF
        </span>
      </div>

      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 13, fontWeight: 600, color: 'var(--text-primary)' }}>
          {report.filename}
        </div>
        <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>
          {report.size}
        </div>
      </div>

      <div style={{ display: 'flex', gap: 8, flexShrink: 0 }}>
        <button
          onClick={() => onDownload(report)}
          disabled={downloading}
          style={{
            padding: '8px 14px',
            fontSize: 12, fontWeight: 500,
            color: 'var(--text-primary)',
            background: 'transparent',
            border: '1px solid var(--border-subtle)',
            borderRadius: 8,
            cursor: downloading ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background 150ms ease, border-color 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
        >
          {downloading ? 'Generando…' : 'Descargar'}
        </button>
        <button
          onClick={() => onView(report)}
          disabled={downloading}
          style={{
            padding: '8px 16px',
            fontSize: 12, fontWeight: 500,
            color: '#fff',
            background: 'var(--accent)',
            border: 'none',
            borderRadius: 8,
            cursor: downloading ? 'wait' : 'pointer',
            fontFamily: 'inherit',
            transition: 'background 150ms ease',
          }}
          onMouseEnter={(e) => { e.currentTarget.style.background = '#a600e0'; }}
          onMouseLeave={(e) => { e.currentTarget.style.background = 'var(--accent)'; }}
        >
          Ver
        </button>
      </div>
    </motion.div>
  );
}

function PreviousRow({ report, onDownload, onView, downloading }) {
  return (
    <div
      style={{
        display: 'flex', alignItems: 'center', gap: 12,
        padding: '10px 12px',
        borderTop: '1px solid var(--border-hairline)',
        transition: 'background 140ms ease',
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'var(--bg-hover)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      <div style={{
        width: 24, height: 24, borderRadius: 6,
        background: 'var(--accent-dim)',
        display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
        flexShrink: 0,
      }}>
        <svg width="10" height="12" viewBox="0 0 10 12" fill="none" stroke="var(--accent)" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round">
          <path d="M2 1h4l3 3v6a1 1 0 01-1 1H2a1 1 0 01-1-1V2a1 1 0 011-1z" />
        </svg>
      </div>
      <div style={{ flex: 1, minWidth: 0 }}>
        <div style={{ fontSize: 12, fontWeight: 500, color: 'var(--text-primary)' }}>{report.label}</div>
        <div style={{ fontSize: 10, color: 'var(--text-muted)' }}>{report.filename}</div>
      </div>
      <button
        onClick={() => onView(report)}
        disabled={downloading}
        aria-label="Ver"
        style={{
          padding: '6px 10px', fontSize: 11,
          color: 'var(--text-secondary)', background: 'transparent',
          border: '1px solid var(--border-subtle)', borderRadius: 6,
          cursor: downloading ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        Ver
      </button>
      <button
        onClick={() => onDownload(report)}
        disabled={downloading}
        aria-label="Descargar"
        style={{
          padding: '6px 10px', fontSize: 11,
          color: 'var(--accent)', background: 'transparent',
          border: '1px solid var(--accent-border)', borderRadius: 6,
          cursor: downloading ? 'wait' : 'pointer', fontFamily: 'inherit',
        }}
      >
        Descargar
      </button>
    </div>
  );
}

export default function ReportsPanel({ data, byClinic }) {
  const { activeClinic, config } = useClinic();
  const [expanded, setExpanded] = useState(false);
  const [downloading, setDownloading] = useState(false);

  const reports = useMemo(() => buildReportsList(activeClinic), [activeClinic]);
  const latest = reports[0];
  const previous = reports.slice(1);

  const runExport = async ({ report, download = true }) => {
    if (downloading) return null;
    setDownloading(true);
    try {
      const { buildReport } = await import('../../lib/exportPdf');
      const pdf = await buildReport({
        clinicId: report.clinicId,
        clinicName: clinicHeader[report.clinicId],
        periodLabel: report.label,
        data,
        config,
        byClinic,
        download,
        filename: report.filename,
      });
      return pdf;
    } catch (err) {
      console.error('Error generando PDF', err);
      return null;
    } finally {
      setDownloading(false);
    }
  };

  const handleDownload = (report) => runExport({ report, download: true });

  const handleView = async (report) => {
    const pdf = await runExport({ report, download: false });
    if (pdf) {
      const url = pdf.output('bloburl');
      window.open(url, '_blank', 'noopener,noreferrer');
    }
  };

  return (
    <section style={{ marginTop: 8 }}>
      <div style={{
        fontSize: 10, fontWeight: 500, letterSpacing: '0.06em',
        textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 12,
      }}>
        Reportes mensuales
      </div>

      <div style={{
        display: 'flex', flexDirection: 'column', gap: 12,
        padding: 20,
        background: 'var(--bg-card)',
        border: '1px solid var(--border-subtle)',
        borderRadius: 14,
      }}>
        <div>
          <div style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)' }}>
            Tu último reporte está disponible
          </div>
          <div style={{ fontSize: 12, color: 'var(--text-muted)', marginTop: 3 }}>
            Reporte del cierre de {latest.label} para {clinicHeader[activeClinic]}. Se genera automáticamente el último día de cada mes.
          </div>
        </div>

        <ReceiptCard
          report={latest}
          onDownload={handleDownload}
          onView={handleView}
          downloading={downloading}
        />

        {previous.length > 0 && (
          <>
            <button
              onClick={() => setExpanded((v) => !v)}
              style={{
                marginTop: 4, alignSelf: 'flex-start',
                display: 'inline-flex', alignItems: 'center', gap: 6,
                background: 'transparent', border: 'none', padding: '4px 6px',
                fontSize: 11, fontWeight: 500,
                color: 'var(--text-secondary)',
                cursor: 'pointer', fontFamily: 'inherit',
                borderRadius: 6,
              }}
            >
              <svg
                width="10" height="10" viewBox="0 0 10 10" fill="none"
                stroke="currentColor" strokeWidth="1.4" strokeLinecap="round" strokeLinejoin="round"
                style={{ transform: expanded ? 'rotate(90deg)' : 'none', transition: 'transform 200ms ease' }}
              >
                <path d="M3.5 1.5L7 5l-3.5 3.5" />
              </svg>
              {expanded ? 'Ocultar' : 'Ver reportes anteriores'} ({previous.length})
            </button>

            <AnimatePresence initial={false}>
              {expanded && (
                <motion.div
                  key="prev-list"
                  initial={{ height: 0, opacity: 0 }}
                  animate={{ height: 'auto', opacity: 1 }}
                  exit={{ height: 0, opacity: 0 }}
                  transition={{ duration: 0.28, ease: [0.23, 1, 0.32, 1] }}
                  style={{ overflow: 'hidden' }}
                >
                  <div style={{
                    border: '1px solid var(--border-hairline)',
                    borderRadius: 8, overflow: 'hidden',
                  }}>
                    {previous.map((r, i) => (
                      <div key={r.id} style={i === 0 ? { borderTop: 'none' } : undefined}>
                        <PreviousRow
                          report={r}
                          onDownload={handleDownload}
                          onView={handleView}
                          downloading={downloading}
                        />
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
      </div>
    </section>
  );
}
