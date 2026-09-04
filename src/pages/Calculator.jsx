import { useState, useCallback } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { Card, SectionLabel } from '../components/ui/primitives';
import { fmtEur, fmt } from '../lib/calc';

const STORAGE_KEY = 'enalia-calculator';
const FIXED_MANTENIMIENTO = 300;
const FIXED_COSTE_MINUTO = 0.30;
const FIXED_COMISION = 20;
const BASE_RATE = 25;
const FIXED_MINUTOS_LLAMADA = 3;
const FIXED_INTENTOS_LEAD = 2.6;
const DEFAULT_TICKET_MEDIO = 600;

function loadSaved() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (raw) return JSON.parse(raw);
  } catch {}
  return null;
}

const DEFAULTS = {
  metaAds: 500,
  leads: 100,
  tasaCita: 65,
  tasaAgendamiento: 40,
  tasaAsistencia: 80,
  ticketMedio: DEFAULT_TICKET_MEDIO,
};

function Slider({ label, value, onChange, min, max, step = 1, unit = '', format }) {
  const pct = ((value - min) / (max - min)) * 100;
  const displayVal = format ? format(value) : `${fmt(value, step < 1 ? 1 : 0)}${unit}`;

  return (
    <div style={{ marginBottom: 24 }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 8 }}>
        <label style={{ fontSize: 13, fontWeight: 500, color: 'var(--text-secondary)' }}>{label}</label>
        <span style={{ fontSize: 18, fontWeight: 600, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{displayVal}</span>
      </div>
      <div style={{ position: 'relative', height: 6, borderRadius: 3, background: 'var(--bar-bg)' }}>
        <div style={{ position: 'absolute', top: 0, left: 0, height: '100%', width: `${pct}%`, borderRadius: 3, background: 'linear-gradient(90deg, var(--accent), var(--accent-bright))' }} />
      </div>
      <input
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{
          width: '100%', appearance: 'none', WebkitAppearance: 'none',
          height: 24, marginTop: -15, background: 'transparent',
          position: 'relative', zIndex: 1, cursor: 'pointer',
        }}
      />
      <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 10, color: 'var(--text-muted)', marginTop: -4 }}>
        <span>{min}{unit}</span>
        <span>{max}{unit}</span>
      </div>
    </div>
  );
}

function FixedParam({ label, value, note }) {
  return (
    <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', padding: '10px 0', borderBottom: '1px solid var(--border-hairline)' }}>
      <div>
        <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>{label}</span>
        {note && <span style={{ fontSize: 10, color: 'var(--text-muted)', marginLeft: 6 }}>{note}</span>}
      </div>
      <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{value}</span>
    </div>
  );
}

function ResultCard({ label, value, highlight }) {
  return (
    <div style={{
      padding: '20px 16px', borderRadius: 12,
      background: highlight ? 'linear-gradient(135deg, var(--accent-dim), rgba(191,0,255,0.04))' : 'var(--bg-card)',
      border: `1px solid ${highlight ? 'var(--accent-border)' : 'var(--border-subtle)'}`,
      textAlign: 'center',
    }}>
      <div style={{ fontSize: 10, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 8 }}>
        {label}
      </div>
      <div style={{ fontSize: 22, fontWeight: 700, color: highlight ? 'var(--accent)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>
        {value}
      </div>
    </div>
  );
}

export default function Calculator() {
  const saved = loadSaved();
  const [vals, setVals] = useState({ ...DEFAULTS, ...saved });

  const set = useCallback((key, v) => {
    setVals((prev) => ({ ...prev, [key]: v }));
  }, []);

  const contactados = Math.round(vals.leads * (vals.tasaCita / 100));
  const citasAgendadas = Math.round(contactados * (vals.tasaAgendamiento / 100));
  const asistencias = Math.round(citasAgendadas * (vals.tasaAsistencia / 100));

  const costeLlamadas = vals.leads * FIXED_INTENTOS_LEAD * FIXED_MINUTOS_LLAMADA * FIXED_COSTE_MINUTO;
  const baseCitas = Math.round(vals.leads * (BASE_RATE / 100));
  const extraCitas = Math.max(0, asistencias - baseCitas);
  const comisiones = extraCitas * FIXED_COMISION;
  const totalInversion = vals.metaAds + FIXED_MANTENIMIENTO + costeLlamadas + comisiones;
  const costePorAsistencia = asistencias > 0 ? totalInversion / asistencias : 0;

  const facturacion = asistencias * vals.ticketMedio;
  const facturacionBase = baseCitas * vals.ticketMedio;
  const roas = totalInversion > 0 ? facturacion / totalInversion : 0;
  const beneficio = facturacion - totalInversion;
  const uplift = facturacion - facturacionBase;

  const save = useCallback(() => {
    try { localStorage.setItem(STORAGE_KEY, JSON.stringify(vals)); } catch {}
  }, [vals]);

  const reset = useCallback(() => {
    setVals({ ...DEFAULTS });
    try { localStorage.removeItem(STORAGE_KEY); } catch {}
  }, []);

  return (
    <AppLayout
      headerRight={
        <div style={{ display: 'flex', gap: 8 }}>
          <button onClick={save} className="btn-hover" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 8, border: '1px solid var(--accent-border)', background: 'var(--accent-dim)', color: 'var(--accent)' }}>
            Guardar
          </button>
          <button onClick={reset} className="btn-hover" style={{ padding: '6px 14px', fontSize: 12, fontWeight: 500, borderRadius: 8, border: '1px solid var(--border-subtle)', background: 'transparent', color: 'var(--text-secondary)' }}>
            Resetear
          </button>
        </div>
      }
    >
      <div style={{ padding: '24px 32px 48px', maxWidth: 960, margin: '0 auto' }}>
        <SectionLabel>Calculadora de Inversión</SectionLabel>

        <div className="calc-grid" style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20 }}>
          <Card>
            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
              Parámetros
            </div>

            <Slider label="Meta Ads / mes" value={vals.metaAds} onChange={(v) => set('metaAds', v)} min={100} max={5000} step={50} format={(v) => fmtEur(v)} />
            <Slider label="Leads / mes" value={vals.leads} onChange={(v) => set('leads', v)} min={10} max={500} />
            <Slider label="Tasa de contacto" value={vals.tasaCita} onChange={(v) => set('tasaCita', v)} min={10} max={95} unit="%" />
            <Slider label="Tasa de agendamiento" value={vals.tasaAgendamiento} onChange={(v) => set('tasaAgendamiento', v)} min={5} max={80} unit="%" />
            <Slider label="Tasa de asistencia" value={vals.tasaAsistencia} onChange={(v) => set('tasaAsistencia', v)} min={30} max={100} unit="%" />
            <Slider label="Ticket medio" value={vals.ticketMedio} onChange={(v) => set('ticketMedio', v)} min={100} max={5000} step={50} format={(v) => fmtEur(v)} />

            <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginTop: 20, marginBottom: 8 }}>
              Parámetros fijos
            </div>
            <FixedParam label="Minutos por llamada" value={`${FIXED_MINUTOS_LLAMADA} min`} />
            <FixedParam label="Intentos medio por lead" value={FIXED_INTENTOS_LEAD} />
            <FixedParam label="Coste por minuto" value={fmtEur(FIXED_COSTE_MINUTO, 2)} />
            <FixedParam label="Mantenimiento mensual" value={fmtEur(FIXED_MANTENIMIENTO)} />
            <FixedParam label="Comisión por cita asistida" value={fmtEur(FIXED_COMISION)} note={`(>${BASE_RATE}% base)`} />
          </Card>

          <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
            <Card style={{ background: 'linear-gradient(135deg, var(--accent-dim), rgba(191,0,255,0.02))', borderColor: 'var(--accent-border)' }}>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--accent)', marginBottom: 16 }}>
                Retorno estimado
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 20, marginBottom: 16 }}>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>Facturación</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(facturacion)}</div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>{fmt(asistencias)} asistencias × {fmtEur(vals.ticketMedio)}</div>
                </div>
                <div>
                  <div style={{ fontSize: 10, fontWeight: 600, color: 'var(--text-muted)', textTransform: 'uppercase', letterSpacing: '0.06em', marginBottom: 4 }}>ROAS</div>
                  <div style={{ fontSize: 26, fontWeight: 700, color: roas >= 3 ? 'var(--green)' : roas >= 1.5 ? 'var(--accent)' : 'var(--orange)', fontVariantNumeric: 'tabular-nums' }}>
                    {fmt(roas, 1)}×
                  </div>
                  <div style={{ fontSize: 11, color: 'var(--text-muted)', marginTop: 2 }}>por cada € invertido</div>
                </div>
              </div>

              <div style={{ height: 1, background: 'var(--border-hairline)', marginBottom: 14 }} />

              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 6 }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Beneficio neto</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: beneficio >= 0 ? 'var(--green)' : 'var(--red)', fontVariantNumeric: 'tabular-nums' }}>
                  {beneficio >= 0 ? '+' : ''}{fmtEur(beneficio)}
                </span>
              </div>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>vs. sin Enalia (base {BASE_RATE}%)</span>
                <span style={{ fontSize: 14, fontWeight: 600, color: uplift > 0 ? 'var(--accent)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                  {uplift > 0 ? '+' : ''}{fmtEur(uplift)}
                </span>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 20 }}>
                Funnel estimado
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr 1fr', gap: 12, marginBottom: 16 }}>
                <ResultCard label="Contactados" value={fmt(contactados)} />
                <ResultCard label="Citas agendadas" value={fmt(citasAgendadas)} />
                <ResultCard label="Asistencias" value={fmt(asistencias)} />
              </div>

              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 12 }}>
                <ResultCard label="€ por Asistencia" value={fmtEur(costePorAsistencia, 2)} highlight />
                <ResultCard label="Inversión total" value={fmtEur(totalInversion)} highlight />
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                Comisión Enalia
              </div>
              <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Base clínica ({BASE_RATE}% de {fmt(vals.leads)} leads)</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(baseCitas)} citas</span>
                </div>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 12, color: 'var(--text-secondary)' }}>Citas asistidas (Enalia)</span>
                  <span style={{ fontSize: 14, fontWeight: 600, color: asistencias > baseCitas ? 'var(--green)' : 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmt(asistencias)} citas</span>
                </div>
                <div style={{ height: 1, background: 'var(--border-hairline)' }} />
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
                  <span style={{ fontSize: 13, fontWeight: 600, color: extraCitas > 0 ? 'var(--accent)' : 'var(--text-muted)' }}>
                    {extraCitas > 0 ? `+${fmt(extraCitas)} citas extra` : 'Base no superada'}
                  </span>
                  <span style={{ fontSize: 16, fontWeight: 700, color: extraCitas > 0 ? 'var(--accent)' : 'var(--text-muted)', fontVariantNumeric: 'tabular-nums' }}>
                    {extraCitas > 0 ? `${fmt(extraCitas)} × ${FIXED_COMISION}€ = ${fmtEur(comisiones)}` : '0 €'}
                  </span>
                </div>
              </div>
            </Card>

            <Card>
              <div style={{ fontSize: 11, fontWeight: 600, letterSpacing: '0.08em', textTransform: 'uppercase', color: 'var(--text-muted)', marginBottom: 16 }}>
                Desglose de inversión
              </div>
              {[
                { label: 'Meta Ads', val: vals.metaAds },
                { label: 'Mantenimiento', val: FIXED_MANTENIMIENTO },
                { label: `Llamadas (${vals.leads} × ${FIXED_INTENTOS_LEAD} × ${FIXED_MINUTOS_LLAMADA} min × ${fmtEur(FIXED_COSTE_MINUTO, 2)})`, val: costeLlamadas },
                { label: `Comisiones (${extraCitas > 0 ? `${extraCitas} extra × ${FIXED_COMISION}€` : 'base no superada'})`, val: comisiones },
              ].map((item) => {
                const pct = totalInversion > 0 ? (item.val / totalInversion) * 100 : 0;
                return (
                  <div key={item.label} style={{ marginBottom: 12 }}>
                    <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 12, marginBottom: 4 }}>
                      <span style={{ color: 'var(--text-secondary)' }}>{item.label}</span>
                      <span style={{ fontWeight: 500, color: 'var(--text-primary)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(item.val, 2)}</span>
                    </div>
                    <div style={{ height: 4, borderRadius: 2, background: 'var(--bar-bg)' }}>
                      <div className="bar-grow" style={{ height: '100%', borderRadius: 2, width: `${pct}%`, background: 'var(--accent)' }} />
                    </div>
                  </div>
                );
              })}
              <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13, fontWeight: 600, marginTop: 16, paddingTop: 12, borderTop: '1px solid var(--border-hairline)' }}>
                <span style={{ color: 'var(--text-primary)' }}>Total</span>
                <span style={{ color: 'var(--accent)', fontVariantNumeric: 'tabular-nums' }}>{fmtEur(totalInversion, 2)}</span>
              </div>
            </Card>
          </div>
        </div>
      </div>
    </AppLayout>
  );
}
