// Helpers de cálculo y formato. Datos null → "—", nunca "0".

export const DASH = '—';

export function isNum(v) {
  return typeof v === 'number' && Number.isFinite(v);
}

// Redondea a `d` decimales devolviendo número.
export function round(v, d = 0) {
  const f = Math.pow(10, d);
  return Math.round(v * f) / f;
}

// Formatea número con coma decimal (es-ES). null → "—".
export function fmt(v, decimals = 0) {
  if (!isNum(v)) return DASH;
  return v.toLocaleString('es-ES', {
    minimumFractionDigits: decimals,
    maximumFractionDigits: decimals,
  });
}

// Formatea € con coma decimal. null → "—".
export function fmtEur(v, decimals = 0) {
  if (!isNum(v)) return DASH;
  return `${fmt(v, decimals)} €`;
}

// Formatea porcentaje. null → "—".
export function fmtPct(v, decimals = 1) {
  if (!isNum(v)) return DASH;
  return `${fmt(v, decimals)}%`;
}

// Formatea una duración en segundos: "45 s", "1 min 18 s", "12 min". null → "—".
export function fmtDuracion(seconds) {
  if (!isNum(seconds)) return DASH;
  const total = Math.round(seconds);
  if (total < 60) return `${total} s`;
  const m = Math.floor(total / 60);
  const s = total % 60;
  return s === 0 ? `${m} min` : `${m} min ${s} s`;
}

// División segura → null si no calculable.
export function safeDiv(a, b) {
  if (!isNum(a) || !isNum(b) || b === 0) return null;
  return a / b;
}

// Tasa de agendamiento Enalia = citasAgendadas / totalLeads * 100
export function tasaAgendamiento(d) {
  const r = safeDiv(d.citasAgendadas, d.totalLeads);
  return r === null ? null : r * 100;
}

// Tasa de asistencia Enalia = citasAsistidas / citasAgendadas * 100
export function tasaAsistencia(d) {
  const r = safeDiv(d.citasAsistidas, d.citasAgendadas);
  return r === null ? null : r * 100;
}

// Agendamiento sobre CONTACTADOS = citasAgendadas / leadsContactados * 100.
// Mide la eficacia de la conversación, sin penalizar a quien no descuelga.
export function tasaAgendamientoSobreContacto(d) {
  const r = safeDiv(d.citasAgendadas, d.leadsContactados);
  return r === null ? null : r * 100;
}

// Alias histórico.
export const tasaLlamadaReunion = tasaAgendamientoSobreContacto;

// Intentos medios por lead.
export function intentosPorLead(d) {
  return safeDiv(d.totalLlamadas, d.totalLeads);
}

// Comisión por asistencias por encima de la base.
export function comision(d, config) {
  if (!isNum(d.citasAsistidas)) {
    return { citasBase: null, citasExtra: null, comision: null };
  }
  const citasBase = Math.round((d.totalLeads * config.baseAgendamiento) / 100);
  const citasExtra = Math.max(0, d.citasAsistidas - citasBase);
  return {
    citasBase,
    citasExtra,
    comision: citasExtra * config.feePorAsistida,
  };
}

// Niveles del embudo de conversión.
export function funnelLevels(d) {
  return [
    { key: 'leads', label: 'Leads Entrantes', value: d.totalLeads, color: '#BF00FF' },
    { key: 'contactados', label: 'Contactados', value: d.leadsContactados, color: 'rgba(191,0,255,0.78)' },
    { key: 'citas', label: 'Agendados', value: d.citasAgendadas, color: '#4D8FE8' },
    { key: 'asistencias', label: 'Asistidos', value: d.citasAsistidas, color: '#27AE84', striped: !isNum(d.citasAsistidas) },
  ];
}

// Detecta la mayor caída entre niveles consecutivos del embudo.
export function biggestDrop(d) {
  const levels = funnelLevels(d).filter((l) => isNum(l.value));
  let worst = null;
  for (let i = 1; i < levels.length; i += 1) {
    const prev = levels[i - 1];
    const cur = levels[i];
    if (prev.value <= 0) continue;
    const lost = prev.value - cur.value;
    const dropPct = (lost / prev.value) * 100;
    if (!worst || dropPct > worst.dropPct) {
      worst = { from: prev.label, to: cur.label, lost, dropPct, toKey: cur.key };
    }
  }
  return worst;
}

const RECOMMENDATIONS = {
  contactados: 'Optimizar el ratio de respuesta. Muchos leads no descolgan la llamada automática; revisar franjas horarias de mayor respuesta y ajustar el número de reintentos en el flujo automatizado.',
  citas: 'Mejorar el cierre hacia cita. Trabajar objeciones de precio con ofertas de financiación y reforzar la propuesta de valor en la conversación automatizada.',
  asistencias: 'Reducir el no-show con confirmación 24h antes, recordatorio por WhatsApp/SMS y gestión activa de reprogramaciones.',
};

export function recommendationFor(toKey) {
  return RECOMMENDATIONS[toKey] || 'Revisar el proceso en la etapa con mayor caída y reforzar el seguimiento.';
}
