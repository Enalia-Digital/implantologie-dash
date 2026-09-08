import { defaultConfig, fechaInicioEnalia, leadsPreviosIds } from '../data/config';

const CLINIC_MAP = {
  triana: 'triana',
  los_palacios: 'los_palacios',
  san_jose: 'san_jose',
  Triana: 'triana',
  'Los Palacios': 'los_palacios',
  'San José': 'san_jose',
  'San Jose': 'san_jose',
  'san josé': 'san_jose',
  'los palacios': 'los_palacios',
};

function leadDate(l) { return l.created_at || l._createdTime; }

function normalizeClinic(raw) {
  if (!raw) return null;
  const trimmed = String(raw).trim();
  return CLINIC_MAP[trimmed] || CLINIC_MAP[trimmed.toLowerCase()] || null;
}

function periodRange(period) {
  const now = new Date();
  const startOfDay = (d) => new Date(d.getFullYear(), d.getMonth(), d.getDate());

  switch (period) {
    case 'week': {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const start = startOfDay(new Date(now.getTime() - diff * 86400000));
      return { start, end: now };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth(), 1);
      return { start, end: now };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start, end };
    }
    case 'last_90': {
      const start = startOfDay(new Date(now.getTime() - 90 * 86400000));
      return { start, end: now };
    }
    case 'enalia': {
      const start = fechaInicioEnalia ? startOfDay(new Date(fechaInicioEnalia)) : new Date(0);
      return { start, end: now };
    }
    default:
      return { start: new Date(0), end: now };
  }
}

function inRange(dateStr, range) {
  if (!dateStr) return false;
  const d = new Date(dateStr);
  return d >= range.start && d <= range.end;
}

function dedup(arr, idField) {
  const seen = new Set();
  return arr.filter((r) => {
    const id = r[idField];
    if (!id || typeof id !== 'string' || id.length < 5) return false;
    const clean = id.trim();
    if (seen.has(clean)) return false;
    seen.add(clean);
    return true;
  });
}

// Dedup con clave derivada, para tablas cuyo id primario viene vacío.
function dedupBy(arr, keyFn) {
  const seen = new Set();
  return arr.filter((r) => {
    const key = keyFn(r);
    if (!key) return true;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}

const DEMO_PHONES = new Set([
  '+34699115267', '+34619847854', '+34666938719',
  '+34695505252', '+34661450694', '+34637381497',
  '34699115267', '34619847854', '34666938719',
  '34695505252', '34661450694', '34637381497',
  '699115267', '619847854', '666938719',
  '695505252', '661450694', '637381497',
]);

function isDemoPhone(phone) {
  if (!phone) return false;
  const digits = String(phone).replace(/[\s\-().+]/g, '');
  return DEMO_PHONES.has(digits) || DEMO_PHONES.has('+' + digits) || DEMO_PHONES.has(digits.slice(-9));
}

const OBJECTION_MAP = [
  { category: 'Precio', patterns: ['precio', 'caro', 'coste', 'cost', 'dinero', 'presupuesto', 'financ', 'pagar', 'económic', 'barato', 'money'] },
  { category: 'No interesado', patterns: ['no interesa', 'no quiero', 'no necesit', 'no me interesa', 'not interested', 'sin interés'] },
  { category: 'Ya tiene dentista', patterns: ['dentista', 'ya tiene', 'ya tengo', 'otro doctor', 'ya voy', 'mi clínica'] },
  { category: 'Tiempo', patterns: ['tiempo', 'ocupad', 'agenda', 'horario', 'no puedo', 'busy', 'momento'] },
  { category: 'Ubicación', patterns: ['lejos', 'ubicación', 'ubicacion', 'distancia', 'zona', 'location', 'cerca'] },
  { category: 'Miedo / Indecisión', patterns: ['miedo', 'pensar', 'decidir', 'duda', 'segur', 'nervios', 'dolor', 'consultar'] },
  { category: 'No contesta', patterns: ['no contesta', 'voicemail', 'buzón', 'buzon', 'no answer', 'no responde', 'unreachable'] },
  { category: 'Callback', patterns: ['callback', 'llamar después', 'llamar despues', 'volver a llamar', 'call back', 'devolver'] },
  { category: 'Ya agendado', patterns: ['ya tiene cita', 'agendad', 'ya reserv', 'appointment'] },
  { category: 'Información', patterns: ['información', 'informacion', 'info', 'pregunta', 'saber más', 'detalles'] },
];

// Una llamada se considera ATENDIDA solo si el lead descolgó y hubo conversación real.
// Umbral: 15 s. Por debajo suele ser ring sin respuesta o colgar inmediato.
// duration_seconds = 0 significa que sonó pero nadie cogió el teléfono.
const MIN_CONTACT_SECONDS = 15;
function fueAtendida(call) {
  return Number(call.duration_seconds) >= MIN_CONTACT_SECONDS;
}

// Horario de llamadas del sistema (Europa/Madrid). Fuera de esta ventana no se
// puede llamar, así que el delta lead→llamada no mide reacción sino la espera
// hasta el arranque del horario. Excluimos esos leads del "Tiempo Respuesta".
const BUSINESS_HOUR_START = 9;
const BUSINESS_HOUR_END = 21;
const TZ_HOUR_FMT = new Intl.DateTimeFormat('en-GB', {
  timeZone: 'Europe/Madrid', hour: '2-digit', hour12: false,
});
function entryEnHorario(iso) {
  const t = new Date(iso).getTime();
  if (!Number.isFinite(t)) return false;
  const h = parseInt(TZ_HOUR_FMT.format(new Date(t)), 10);
  return h >= BUSINESS_HOUR_START && h < BUSINESS_HOUR_END;
}

function normalizeObjection(raw) {
  if (!raw || typeof raw !== 'string') return null;
  const lower = raw.toLowerCase().trim();
  if (!lower) return null;
  for (const { category, patterns } of OBJECTION_MAP) {
    if (patterns.some((p) => lower.includes(p))) return category;
  }
  return 'Otros';
}

function maskPhone(phone) {
  if (!phone) return '—';
  const digits = String(phone).replace(/\D/g, '');
  if (digits.length < 6) return phone;
  return `+34 XXX XXX ${digits.slice(-3)}`;
}

let _cache = null;
let _cacheTime = 0;
const CACHE_TTL = 30_000;

export async function fetchAirtableData(bustCache = false) {
  if (!bustCache && _cache && Date.now() - _cacheTime < CACHE_TTL) return _cache;

  const url = bustCache ? `/api/airtable?_t=${Date.now()}` : '/api/airtable';
  const res = await fetch(url);
  if (!res.ok) {
    const body = await res.text();
    throw new Error(`API error ${res.status}: ${body}`);
  }
  _cache = await res.json();
  _cacheTime = Date.now();
  return _cache;
}

export function invalidateCache() {
  _cache = null;
  _cacheTime = 0;
}

export function transformData(raw, clinicId, period, vista = 'activacion') {
  const range = periodRange(period);

  // Airtable arrastra filas totalmente vacías: sin lead_id no hay dato utilizable.
  const leads = (raw.leads || []).filter((l) => l.lead_id);

  // Cada fila de Airtable es un intento de llamada distinto, aunque comparta
  // started_at. Solo deduplicamos cuando hay call_id repetido.
  const calls = dedupBy(
    (raw.calls || []).filter(
      (c) =>
        c.lead_id &&
        !['call_outcome', 'last_objection', 'call outcome'].includes(c.call_id)
    ),
    (c) => c.call_id || c._recordId
  );

  const appointments = dedupBy(
    (raw.appointments || []).filter((a) => a.lead_id || a.appointment_id),
    (a) => a._recordId
  );

  const tasks = dedup(raw.call_tasks || [], 'task_id');

  const leadMap = new Map();
  leads.forEach((l) => {
    if (l.lead_id) leadMap.set(String(l.lead_id).trim(), l);
  });

  // Matching por lead_id: es la clave real del sistema (viene de Meta Ads).
  const resolveLead = (rec) => {
    const lid = rec.lead_id ? String(rec.lead_id).trim() : null;
    return lid ? leadMap.get(lid) || null : null;
  };

  const demoLeadIds = new Set();
  leads.forEach((l) => {
    if (l.lead_id && isDemoPhone(l.phone)) demoLeadIds.add(String(l.lead_id).trim());
  });

  // Un registro es demo si su propio teléfono lo es, o el del lead al que apunta.
  const isDemoRecord = (rec) => {
    if (isDemoPhone(rec.phone)) return true;
    const lead = resolveLead(rec);
    return lead ? isDemoPhone(lead.phone) : false;
  };

  const callLeadClinic = (call) => {
    const lead = resolveLead(call);
    return lead ? normalizeClinic(lead.preferred_clinic_id) : null;
  };

  const filterLeads = (clinicId === 'general'
    ? leads
    : leads.filter((l) => normalizeClinic(l.preferred_clinic_id) === clinicId)
  ).filter((l) => !isDemoPhone(l.phone));

  let periodLeads = filterLeads.filter((l) => inRange(leadDate(l), range));

  const allPeriodCalls = calls.filter((c) => {
    const date = c.started_at || c._createdTime;
    if (!inRange(date, range)) return false;
    if (clinicId === 'general') return true;
    return callLeadClinic(c) === clinicId;
  });

  let periodCalls = allPeriodCalls.filter((c) => !isDemoRecord(c));

  let periodAppts = appointments.filter((a) => {
    const lid = a.lead_id ? String(a.lead_id).trim() : null;
    if (lid && demoLeadIds.has(lid)) return false;
    if (isDemoPhone(a.phone)) return false;
    const dateField = a.created_at || a._createdTime;
    if (!inRange(dateField, range)) return false;
    if (clinicId === 'general') return true;
    const apptClinic = normalizeClinic(a.clinic_id);
    if (apptClinic) return apptClinic === clinicId;
    const lead = lid ? leadMap.get(lid) : null;
    return lead ? normalizeClinic(lead.preferred_clinic_id) === clinicId : false;
  });

  const periodTasks = tasks.filter((t) => {
    const lid = t.lead_id ? String(t.lead_id).trim() : null;
    if (lid && demoLeadIds.has(lid)) return false;
    if (isDemoPhone(t.phone)) return false;
    if (!inRange(t.callback_at || t.created_at || t._createdTime, range)) return false;
    if (clinicId === 'general') return true;
    const tClinic = normalizeClinic(t.clinic_id);
    if (tClinic) return tClinic === clinicId;
    const lead = lid ? leadMap.get(lid) : null;
    return lead ? normalizeClinic(lead.preferred_clinic_id) === clinicId : false;
  });

  // --- Vista: separar previos de activación antes de computar métricas ---
  const _previosSet = new Set((leadsPreviosIds || []).map((id) => String(id).trim()));
  const _usaLista = _previosSet.size > 0;
  const _corteInicio = fechaInicioEnalia ? new Date(fechaInicioEnalia).getTime() : 0;
  const esPrevio = (l) => (_usaLista
    ? _previosSet.has(String(l.lead_id).trim())
    : new Date(leadDate(l)).getTime() < _corteInicio);

  const leadsPrevios = periodLeads.filter(esPrevio);
  const leadsActivacion = periodLeads.filter((l) => !esPrevio(l));
  const hayPrevios = leadsPrevios.length > 0;

  if (hayPrevios) {
    const prevIds = new Set(leadsPrevios.map((l) => String(l.lead_id).trim()));
    if (vista === 'previos') {
      periodLeads = leadsPrevios;
      periodCalls = periodCalls.filter((c) => {
        const lid = c.lead_id ? String(c.lead_id).trim() : null;
        return lid && prevIds.has(lid);
      });
      periodAppts = periodAppts.filter((a) => {
        const lid = a.lead_id ? String(a.lead_id).trim() : null;
        return lid && prevIds.has(lid);
      });
    } else {
      periodLeads = leadsActivacion;
      periodCalls = periodCalls.filter((c) => {
        const lid = c.lead_id ? String(c.lead_id).trim() : null;
        if (!lid) return true;
        return !prevIds.has(lid);
      });
      periodAppts = periodAppts.filter((a) => {
        const lid = a.lead_id ? String(a.lead_id).trim() : null;
        return !lid || !prevIds.has(lid);
      });
    }
  }

  // Distinguimos intento de llamada (marcamos) de contacto real (descuelgan).
  const dialedLeadIds = new Set();
  const contactedLeadIds = new Set();
  periodCalls.forEach((c) => {
    if (!c.lead_id) return;
    const lid = String(c.lead_id).trim();
    dialedLeadIds.add(lid);
    if (fueAtendida(c)) contactedLeadIds.add(lid);
  });

  const totalLeads = periodLeads.length;
  const leadsContactados = periodLeads.filter((l) =>
    contactedLeadIds.has(String(l.lead_id).trim())
  ).length;
  const leadsLlamados = periodLeads.filter((l) =>
    dialedLeadIds.has(String(l.lead_id).trim())
  ).length;
  const totalLlamadas = periodCalls.length;
  const llamadasAtendidas = periodCalls.filter(fueAtendida).length;

  // Agendadas: conteo directo de la tabla appointments.
  // El set de lead_ids se mantiene para marcar status de leads en otras partes.
  const agendadaLeadIds = new Set();
  periodAppts.forEach((a) => {
    if (a.lead_id) agendadaLeadIds.add(String(a.lead_id).trim());
  });
  periodLeads.forEach((l) => {
    const st = l.status;
    if (st && typeof st === 'string' && /agendad|cita|appointment|scheduled/.test(st.toLowerCase())) {
      agendadaLeadIds.add(String(l.lead_id).trim());
    }
  });
  const citasAgendadas = periodAppts.length;

  // Asistidas: showed_up / attendance_status en appointments, o ha_acudido en el lead.
  const asistidaLeadIds = new Set();
  periodAppts.forEach((a) => {
    if (!a.lead_id) return;
    const showed = a.showed_up;
    const att = a.attendance_status;
    const st = a.appointment_status;
    const ok =
      showed === true || showed === 'true' || showed === 1 || showed === '1' ||
      (typeof att === 'string' && /show|attend|present|acud/.test(att.toLowerCase())) ||
      (typeof st === 'string' && /attend|show|present|acud/.test(st.toLowerCase()));
    if (ok) asistidaLeadIds.add(String(a.lead_id).trim());
  });
  periodLeads.forEach((l) => {
    if (l.ha_acudido === true) asistidaLeadIds.add(String(l.lead_id).trim());
  });
  const citasAsistidas = asistidaLeadIds.size;

  // Distribución "agendado en la N-ésima llamada".
  // Universo: primera cita del periodo por lead.
  // Para cada lead con cita, contamos las llamadas del sistema (todas, no demo,
  // contestadores y 0:00 incluidos) cuyo started_at es <= created_at de la cita
  // (con 1h de margen por desfases de reloj). Buckets: 1, 2, 3, 4, 5, "+5".
  const agendamientoPorIntentoBuckets = { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, '6+': 0 };
  const callsPorLead = new Map();
  calls.forEach((c) => {
    if (!c.lead_id) return;
    if (isDemoRecord(c)) return;
    const lid = String(c.lead_id).trim();
    const t = new Date(c.started_at || c._createdTime).getTime();
    if (!Number.isFinite(t)) return;
    if (!callsPorLead.has(lid)) callsPorLead.set(lid, []);
    callsPorLead.get(lid).push(t);
  });
  callsPorLead.forEach((arr) => arr.sort((a, b) => a - b));

  const primeraCitaPorLead = new Map();
  periodAppts.forEach((a) => {
    const lid = a.lead_id ? String(a.lead_id).trim() : null;
    if (!lid) return;
    const t = new Date(a.created_at || a._createdTime).getTime();
    if (!Number.isFinite(t)) return;
    const prev = primeraCitaPorLead.get(lid);
    if (prev === undefined || t < prev) primeraCitaPorLead.set(lid, t);
  });

  const HOUR_MS = 60 * 60 * 1000;
  let agendadosSinLlamada = 0;
  primeraCitaPorLead.forEach((tCita, lid) => {
    const llamadasDelLead = callsPorLead.get(lid) || [];
    const n = llamadasDelLead.filter((t) => t <= tCita + HOUR_MS).length;
    if (n === 0) {
      agendadosSinLlamada += 1;
      agendamientoPorIntentoBuckets[1] += 1;
      return;
    }
    const key = n >= 6 ? '6+' : String(n);
    agendamientoPorIntentoBuckets[key] += 1;
  });
  const agendamientoPorIntento = {
    buckets: agendamientoPorIntentoBuckets,
    total: primeraCitaPorLead.size,
    sinLlamada: agendadosSinLlamada,
  };

  const costSeconds = allPeriodCalls.reduce((s, c) => s + (Number(c.duration_seconds) || 0), 0);
  const callMinutes = parseFloat((costSeconds / 60).toFixed(1));
  const costeLlamadas = parseFloat(((costSeconds / 60) * defaultConfig.costePorMinuto).toFixed(2));
  const metricSeconds = periodCalls.reduce((s, c) => s + (Number(c.duration_seconds) || 0), 0);
  const tiempoContactoMin = totalLlamadas > 0
    ? parseFloat(((metricSeconds / 60) / totalLlamadas).toFixed(1))
    : 0;

  // Tiempo de respuesta: minutos desde que entra el lead hasta su primera llamada.
  // Se une por lead_id, la clave real del sistema.
  const firstCallByLead = new Map();
  periodCalls.forEach((c) => {
    const t = new Date(c.started_at || c._createdTime).getTime();
    if (!Number.isFinite(t)) return;
    const lid = String(c.lead_id).trim();
    const prev = firstCallByLead.get(lid);
    if (prev === undefined || t < prev) firstCallByLead.set(lid, t);
  });

  const MAX_RESPONSE_SEG = 24 * 60 * 60;
  const responseDeltas = [];
  if (vista !== 'previos') {
    periodLeads.forEach((l) => {
      if (!entryEnHorario(leadDate(l))) return;
      const leadT = new Date(leadDate(l)).getTime();
      const callT = firstCallByLead.get(String(l.lead_id).trim());
      if (!Number.isFinite(leadT) || callT === undefined) return;
      const deltaSeg = (callT - leadT) / 1000;
      if (deltaSeg >= 0 && deltaSeg <= MAX_RESPONSE_SEG) responseDeltas.push(deltaSeg);
    });
  }

  const tiempoRespuestaSeg = responseDeltas.length > 0
    ? (() => {
        const sorted = [...responseDeltas].sort((a, b) => a - b);
        const mid = Math.floor(sorted.length / 2);
        return Math.round(sorted.length % 2 ? sorted[mid] : (sorted[mid - 1] + sorted[mid]) / 2);
      })()
    : null;

  const prevRange = computePrevRange(period);
  const prevLeads = filterLeads.filter((l) => inRange(leadDate(l), prevRange));
  const leadsDelta = prevLeads.length > 0 && totalLeads > 0
    ? Math.round(((totalLeads - prevLeads.length) / prevLeads.length) * 100)
    : null;

  let porClinica = null;
  if (clinicId === 'general') {
    const clinicIds = ['triana', 'los_palacios', 'san_jose'];
    porClinica = {};
    const keyMap = { triana: 'triana', los_palacios: 'losPalacios', san_jose: 'sanJose' };
    clinicIds.forEach((cid) => {
      const clinicLeads = periodLeads.filter((l) => normalizeClinic(l.preferred_clinic_id) === cid);
      const cCitas = periodAppts.filter((a) => {
        const ac = normalizeClinic(a.clinic_id);
        if (ac) return ac === cid;
        const lid = a.lead_id ? String(a.lead_id).trim() : null;
        const lead = lid ? leadMap.get(lid) : null;
        return lead ? normalizeClinic(lead.preferred_clinic_id) === cid : false;
      }).length;
      porClinica[keyMap[cid]] = { leads: clinicLeads.length, citas: cCitas };
    });
  }

  const evolucion = buildEvolution(periodLeads, periodCalls, periodAppts, range, leadMap, agendadaLeadIds);

  // Objeciones: se agrupan por categoría pero se conserva el texto literal
  // que dijo cada persona, para poder desplegar el detalle.
  const objMap = {};
  const addObjecion = (textoCrudo, nombre, fecha, detalle) => {
    if (!textoCrudo || typeof textoCrudo !== 'string' || !textoCrudo.trim()) return;
    const texto = textoCrudo.trim();
    const label = normalizeObjection(texto) === 'Otros' ? texto : normalizeObjection(texto);
    if (!objMap[label]) objMap[label] = { label, count: 0, detalles: [] };
    objMap[label].count += 1;
    objMap[label].detalles.push({ nombre, fecha, texto, ...detalle });
  };

  periodCalls.forEach((c) => {
    const lead = resolveLead(c);
    addObjecion(c.main_objection, c.full_name || lead?.full_name || '—',
      c.started_at ? new Date(c.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' }) : '—',
      {
        resumen: c.summary || null,
        recordingUrl: c.recording_url || null,
        duracion: Number(c.duration_seconds) || 0,
        atendida: fueAtendida(c),
        outcome: c.call_outcome || null,
      });
  });
  periodLeads.forEach((l) => {
    addObjecion(l.main_objection, l.full_name || '—',
      new Date(leadDate(l)).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      { resumen: null, recordingUrl: null, duracion: 0, atendida: null, outcome: null });
  });

  const totalObj = Object.values(objMap).reduce((a, o) => a + o.count, 0) || 1;
  const objeciones = Object.values(objMap)
    .sort((a, b) => b.count - a.count)
    .map((o) => ({ ...o, pct: Math.round((o.count / totalObj) * 100) }));

  const campMap = {};
  periodLeads.forEach((l) => {
    const camp = l.campaign_name || 'Sin campaña';
    const ad = l.adset_name || 'Sin anuncio';
    const key = `${camp}|||${ad}`;
    if (!campMap[key]) campMap[key] = { campaña: camp, anuncio: ad, leads: 0, llamados: 0, contactados: 0, citas: 0, detalles: [] };
    const lid = String(l.lead_id).trim();
    const llamado = dialedLeadIds.has(lid);
    const contactado = contactedLeadIds.has(lid);
    const agendado = agendadaLeadIds.has(lid);
    campMap[key].leads++;
    if (llamado) campMap[key].llamados++;
    if (contactado) campMap[key].contactados++;
    if (agendado) campMap[key].citas++;
    campMap[key].detalles.push({
      nombre: l.full_name || '—',
      fecha: new Date(leadDate(l)).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' }),
      clinica: l.preferred_clinic_id || '—',
      llamado,
      contactado,
      agendado,
      estado: agendado ? 'Agendado' : contactado ? 'Contactado' : llamado ? 'Sin descolgar' : 'Sin llamar',
    });
  });
  const campanas = Object.values(campMap)
    .map((c) => ({ ...c, conv: c.leads > 0 ? parseFloat(((c.citas / c.leads) * 100).toFixed(1)) : 0 }))
    .sort((a, b) => b.citas - a.citas);

  const segmentos = { hayPrevios };

  const recentLeads = [...periodLeads]
    .sort((a, b) => new Date(leadDate(b)) - new Date(leadDate(a)))
    .slice(0, 10);
  const leadsRecientes = recentLeads.map((l) => {
    const lid = String(l.lead_id).trim();
    const hasCalls = contactedLeadIds.has(lid);
    const leadAppts = periodAppts.filter((a) => a.lead_id && String(a.lead_id).trim() === lid);
    const lastAppt = leadAppts.length > 0 ? leadAppts[leadAppts.length - 1] : null;
    const leadCalls = periodCalls.filter((c) => c.lead_id && String(c.lead_id).trim() === lid);
    const lastCall = leadCalls.length > 0 ? leadCalls[leadCalls.length - 1] : null;

    let status = 'nuevo';
    if (agendadaLeadIds.has(lid)) status = 'agendado';
    else if (l.callback_needed) status = 'callback';
    else if (hasCalls) status = 'contactado';

    const cita = lastAppt?.appointment_start
      ? new Date(lastAppt.appointment_start).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
      : null;

    return {
      nombre: l.full_name || '—',
      telefono: maskPhone(l.phone),
      status,
      score: null,
      anuncio: l.adset_name || l.campaign_name || '—',
      cita,
      objection: lastCall?.main_objection || l.main_objection || null,
      summary: lastCall?.summary || null,
    };
  });

  const callbacks = periodTasks
    .filter((t) => t.task_status !== 'completed' && t.task_status !== 'cancelled')
    .sort((a, b) => new Date(a.callback_at || 0) - new Date(b.callback_at || 0))
    .slice(0, 5)
    .map((t) => ({
      nombre: t.full_name || '—',
      telefono: maskPhone(t.phone),
      hora: t.callback_at
        ? new Date(t.callback_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit', hour: '2-digit', minute: '2-digit' })
        : '—',
      motivo: t.callback_reason || '—',
    }));

  // periodCalls ya viene sin llamadas demo (isDemoRecord).
  const rated = periodCalls.filter((c) => c.calificacion && Number(c.calificacion) > 0);
  const valoracionMedia = rated.length > 0
    ? parseFloat((rated.reduce((s, c) => s + Number(c.calificacion), 0) / rated.length).toFixed(1))
    : null;

  // Solo llamadas con algo que enseñar: grabación o resumen, y que se atendieran.
  const llamadasUtiles = periodCalls.filter(
    (c) => fueAtendida(c) && (c.recording_url || c.summary)
  );
  const esAgendada = (c) => agendadaLeadIds.has(String(c.lead_id).trim());

  // Se priorizan las de leads agendados, pero se reservan huecos para el resto
  // para que no parezca que solo enseñamos lo que salió bien.
  const MAX_LLAMADAS = 5;
  const MIN_NO_AGENDADAS = 2;
  const orden = (a, b) => {
    const r = (Number(b.calificacion) || 0) - (Number(a.calificacion) || 0);
    if (r !== 0) return r;
    return new Date(b.started_at || 0) - new Date(a.started_at || 0);
  };
  const conCita = llamadasUtiles.filter(esAgendada).sort(orden);
  const sinCita = llamadasUtiles.filter((c) => !esAgendada(c)).sort(orden);
  const huecoAgendadas = Math.max(0, MAX_LLAMADAS - Math.min(MIN_NO_AGENDADAS, sinCita.length));
  const seleccion = [
    ...conCita.slice(0, huecoAgendadas),
    ...sinCita.slice(0, MAX_LLAMADAS - Math.min(conCita.length, huecoAgendadas)),
  ].slice(0, MAX_LLAMADAS);

  const topCalls = seleccion
    .map((c) => {
      const lead = resolveLead(c);
      return {
        nombre: c.full_name || lead?.full_name || '—',
        calificacion: c.calificacion ? Number(c.calificacion) : null,
        duracion: Number(c.duration_seconds) || 0,
        fecha: c.started_at
          ? new Date(c.started_at).toLocaleDateString('es-ES', { day: '2-digit', month: '2-digit' })
          : '—',
        resumen: c.summary || null,
        recordingUrl: c.recording_url || null,
        outcome: c.call_outcome || null,
        agendado: esAgendada(c),
      };
    });

  const historico = buildHistorico(leads, calls, appointments, clinicId, leadMap, demoLeadIds);

  return {
    leadsContactados,
    totalLlamadas,
    totalLeads,
    citasAgendadas,
    citasAsistidas,
    tiempoContactoMin,
    tiempoRespuestaSeg,
    costeLlamadas,
    callMinutes,
    leadsDelta,
    porClinica,
    evolucion,
    objeciones,
    leadsLlamados,
    segmentos,
    llamadasAtendidas,
    campanas,
    leadsRecientes,
    callbacks,
    topCalls,
    valoracionMedia,
    historico,
    agendamientoPorIntento,
  };
}

function computePrevRange(period) {
  const now = new Date();
  switch (period) {
    case 'week': {
      const day = now.getDay();
      const diff = day === 0 ? 6 : day - 1;
      const thisStart = new Date(now.getFullYear(), now.getMonth(), now.getDate() - diff);
      const prevEnd = new Date(thisStart.getTime() - 1);
      const prevStart = new Date(thisStart.getTime() - 7 * 86400000);
      return { start: prevStart, end: prevEnd };
    }
    case 'month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
      const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
      return { start, end };
    }
    case 'last_month': {
      const start = new Date(now.getFullYear(), now.getMonth() - 2, 1);
      const end = new Date(now.getFullYear(), now.getMonth() - 1, 0, 23, 59, 59);
      return { start, end };
    }
    case 'last_90': {
      const end = new Date(now.getTime() - 90 * 86400000);
      const start = new Date(end.getTime() - 90 * 86400000);
      return { start, end };
    }
    case 'enalia':
      return { start: new Date(0), end: new Date(0) };
    default:
      return { start: new Date(0), end: new Date(0) };
  }
}

function buildEvolution(periodLeads, periodCalls, periodAppts, range, leadMap, agendadaLeadIds) {
  const days = Math.max(1, Math.ceil((range.end - range.start) / 86400000));
  const bucketCount = Math.min(days, 7);
  const bucketSize = days / bucketCount;

  const buckets = [];
  for (let i = 0; i < bucketCount; i++) {
    const bStart = new Date(range.start.getTime() + i * bucketSize * 86400000);
    const bEnd = new Date(range.start.getTime() + (i + 1) * bucketSize * 86400000);
    buckets.push({
      start: bStart,
      end: bEnd,
      dia: bStart.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      leads: 0,
      contactados: 0,
      citas: 0,
    });
  }

  // Mismo criterio que el resto del panel: contactado = descolgó el teléfono.
  const contactedIds = new Set();
  periodCalls.forEach((c) => {
    if (c.lead_id && fueAtendida(c)) contactedIds.add(String(c.lead_id).trim());
  });

  periodLeads.forEach((l) => {
    const d = new Date(leadDate(l));
    const idx = Math.min(Math.floor((d - range.start) / (bucketSize * 86400000)), bucketCount - 1);
    if (idx >= 0) {
      const lid = String(l.lead_id).trim();
      buckets[idx].leads++;
      if (contactedIds.has(lid)) buckets[idx].contactados++;
      if (agendadaLeadIds && agendadaLeadIds.has(lid)) buckets[idx].citas++;
    }
  });

  let cumLeads = 0, cumContactados = 0, cumCitas = 0;
  return buckets.map((b) => {
    cumLeads += b.leads;
    cumContactados += b.contactados;
    cumCitas += b.citas;
    return { dia: b.dia, leads: cumLeads, contactados: cumContactados, citas: cumCitas };
  });
}

function buildHistorico(allLeads, allCalls, allAppts, clinicId, leadMap, demoLeadIds) {
  const now = new Date();
  const months = [];
  for (let i = 3; i >= 0; i--) {
    const start = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const end = new Date(now.getFullYear(), now.getMonth() - i + 1, 0, 23, 59, 59);
    months.push({
      start,
      end,
      mes: start.toLocaleDateString('es-ES', { month: 'short', year: '2-digit' }).replace('.', ''),
    });
  }

  return months.map((m) => {
    const mLeads = allLeads.filter((l) => {
      if (isDemoPhone(l.phone)) return false;
      if (!inRange(leadDate(l), m)) return false;
      if (clinicId === 'general') return true;
      return normalizeClinic(l.preferred_clinic_id) === clinicId;
    });

    const callLeadClinic = (c) => {
      const lid = c.lead_id ? String(c.lead_id).trim() : null;
      const lead = lid ? leadMap.get(lid) : null;
      return lead ? normalizeClinic(lead.preferred_clinic_id) : null;
    };

    const mCallsAll = allCalls.filter((c) => {
      if (!inRange(c.started_at, m)) return false;
      if (clinicId === 'general') return true;
      return callLeadClinic(c) === clinicId;
    });

    const mAppts = allAppts.filter((a) => {
      const lid = a.lead_id ? String(a.lead_id).trim() : null;
      if (lid && demoLeadIds.has(lid)) return false;
      if (isDemoPhone(a.phone)) return false;
      const dateField = a.created_at || a._createdTime;
      if (!inRange(dateField, m)) return false;
      if (clinicId === 'general') return true;
      const ac = normalizeClinic(a.clinic_id);
      if (ac) return ac === clinicId;
      const lead = lid ? leadMap.get(lid) : null;
      return lead ? normalizeClinic(lead.preferred_clinic_id) === clinicId : false;
    });

    const leads = mLeads.length;
    const citas = mAppts.length;
    const asistidas = mAppts.filter((a) => {
      const showed = a.showed_up;
      return showed === true || showed === 'true' || showed === 1 || showed === '1' ||
        (a.attendance_status && typeof a.attendance_status === 'string' && a.attendance_status.toLowerCase().includes('show'));
    }).length || null;

    const secs = mCallsAll.reduce((s, c) => s + (Number(c.duration_seconds) || 0), 0);
    const coste = parseFloat(((secs / 60) * defaultConfig.costePorMinuto).toFixed(1));
    const eurPorCita = citas > 0 ? parseFloat((coste / citas).toFixed(2)) : null;

    return {
      mes: m.mes.charAt(0).toUpperCase() + m.mes.slice(1),
      leads,
      citas,
      asistidas,
      coste,
      eurPorCita,
    };
  });
}
