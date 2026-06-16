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

// Tasa llamada -> reunión = citasAgendadas / leadsContactados * 100
export function tasaLlamadaReunion(d) {
  const r = safeDiv(d.citasAgendadas, d.leadsContactados);
  return r === null ? null : r * 100;
}

// Intentos medios por lead.
export function intentosPorLead(d) {
  return safeDiv(d.totalLlamadas, d.totalLeads);
}

// Comisión por asistencias por encima de la base.
export function comision(d, config) {
  if (!isNum(d.citasAsistidas)) {
    return { asistidasBase: null, asistidasExtra: null, comision: null };
  }
  const asistidasBase = Math.round((d.citasAgendadas * config.baseAsistencia) / 100);
  const asistidasExtra = Math.max(0, d.citasAsistidas - asistidasBase);
  return {
    asistidasBase,
    asistidasExtra,
    comision: asistidasExtra * config.feePorAsistida,
  };
}

// Niveles del embudo de conversión.
export function funnelLevels(d) {
  return [
    { key: 'leads', label: 'Leads Captados', value: d.totalLeads, color: '#BF00FF' },
    { key: 'contactados', label: 'Contactados', value: d.leadsContactados, color: 'rgba(191,0,255,0.78)' },
    { key: 'cualificados', label: 'Cualificados', value: d.cualificados, color: '#7B5BF0' },
    { key: 'citas', label: 'Citas Agendadas', value: d.citasAgendadas, color: '#4D8FE8' },
    { key: 'confirmadas', label: 'Confirmadas', value: d.confirmadas, color: '#34C78A' },
    { key: 'asistencias', label: 'Asistencias', value: d.citasAsistidas, color: '#27AE84', striped: !isNum(d.citasAsistidas) },
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
  contactados: 'Reforzar la velocidad de primer contacto y reintentos. Muchos leads no llegan a ser contactados; ampliar la franja horaria de llamadas y los reintentos automáticos.',
  cualificados: 'Afinar el guion de cualificación. Se pierde volumen entre contacto y cualificación: revisar preguntas clave y filtros de intención.',
  citas: 'Mejorar el cierre hacia cita. Trabajar objeciones de precio con ofertas de financiación y reforzar la propuesta de valor en la llamada.',
  confirmadas: 'Implementar recordatorios y confirmaciones automáticas para reducir la caída entre cita agendada y confirmada.',
  asistencias: 'Reducir el no-show con confirmación 24h antes, recordatorio por SMS y gestión activa de reprogramaciones.',
};

export function recommendationFor(toKey) {
  return RECOMMENDATIONS[toKey] || 'Revisar el proceso en la etapa con mayor caída y reforzar el seguimiento.';
}
