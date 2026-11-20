// Dataset ficticio para el modo DEMO (branding Enalia Digital). Genera
// exactamente la misma estructura que `transformData` de src/lib/airtable.js,
// para que todos los bloques del dashboard (KPIs, funnel, evolucion,
// campanas con podio, comparativa Meta/Google, weekend, reactivacion,
// repesca, asistencias, callbacks, top calls, etc.) funcionen sin cambios.
//
// Cifras ancla pedidas por el equipo comercial:
//   - 300 leads en el periodo
//   - 271 leads contactados
//   - 60 % de agendamiento sobre leads => 180 citas nuevas
// El resto se calcula a partir de esas cifras y se mantiene coherente.
import { defaultConfig } from './config';
import { DEMO_CLINIC_ID, DEMO_CLINIC_NAME, DEMO_TARGETS } from './demoMode';

const NOMBRES = [
  'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez', 'Laura Fernández',
  'Javier Ruiz', 'Carmen Díaz', 'Miguel Torres', 'Isabel Moreno', 'Francisco Jiménez',
  'Lucía Romero', 'Antonio Navarro', 'Elena Domínguez', 'Alejandro Gil', 'Sofía Molina',
  'Pablo Serrano', 'Rosa Ortega', 'Daniel Rubio', 'Marta Delgado', 'Jorge Ramírez',
  'Andrés Pérez', 'Cristina Sanz', 'Ángel Vázquez', 'Patricia Núñez', 'Rodrigo Cabrera',
  'Beatriz Herrera', 'Álvaro Mendoza', 'Natalia Reyes', 'Sergio Aguilar', 'Verónica Peña',
];

const CAMPANAS = [
  { campaña: 'Implantes All-on-4',        anuncio: 'Sonrisa completa desde 4.900€', tratamiento: 'implantologia', plataforma: 'meta'   },
  { campaña: 'Implantes All-on-4',        anuncio: 'Implante + Corona 990€',        tratamiento: 'implantologia', plataforma: 'meta'   },
  { campaña: 'Estética Dental Premium',   anuncio: 'Carillas de porcelana',         tratamiento: 'estetica',      plataforma: 'meta'   },
  { campaña: 'Ortodoncia Invisible',      anuncio: 'Invisalign desde 65€/mes',      tratamiento: 'ortodoncia',    plataforma: 'meta'   },
  { campaña: 'Primera Consulta Gratis',   anuncio: 'Diagnóstico 3D sin coste',      tratamiento: 'implantologia', plataforma: 'meta'   },
  // Google Ads: campañas de búsqueda
  { campaña: 'Búsqueda · Implantes Dentales',   anuncio: 'Grupo: implantes +sevilla', tratamiento: 'implantologia', plataforma: 'google' },
  { campaña: 'Búsqueda · Ortodoncia Invisible', anuncio: 'Grupo: invisalign',         tratamiento: 'ortodoncia',    plataforma: 'google' },
  { campaña: 'Búsqueda · Clínica Dental',       anuncio: 'Grupo: marca + ubicación',  tratamiento: 'estetica',      plataforma: 'google' },
];

function periodDescriptor(period) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const end = new Date(now.getFullYear(), now.getMonth(), 0, 23, 59, 59);
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const fmt = (d) => `${d.getDate()} ${MES[d.getMonth()]}`;
  const LABELS = {
    week: 'Esta semana',
    month: 'Este mes',
    last_month: 'Mes pasado',
    last_90: 'Últimos 90 días',
    enalia: 'Histórico Enalia',
  };
  return {
    label: LABELS[period] || 'Mes pasado',
    rango: `${fmt(start)} — ${fmt(end)}`,
    start,
    end,
  };
}

function buildEvolucion(totalLeads, contactados, citas) {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const semanas = 4;
  const pesos = [0.18, 0.24, 0.28, 0.30];
  let cumL = 0, cumC = 0, cumCi = 0;
  const out = [];
  const MES = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic'];
  for (let i = 0; i < semanas; i++) {
    const wLeads = Math.round(totalLeads * pesos[i]);
    const wContact = Math.round(contactados * pesos[i]);
    const wCitas = Math.round(citas * pesos[i]);
    cumL += wLeads;
    cumC += wContact;
    cumCi += wCitas;
    const d = new Date(start.getFullYear(), start.getMonth(), 1 + i * 7);
    const dEnd = new Date(start.getFullYear(), start.getMonth(), Math.min(1 + (i + 1) * 7 - 1, 30));
    out.push({
      dia: `${d.getDate()} ${MES[d.getMonth()]}–${dEnd.getDate()} ${MES[dEnd.getMonth()]}`,
      leads: cumL,
      contactados: cumC,
      citas: cumCi,
    });
  }
  return out;
}

function buildSerieReintentos() {
  const now = new Date();
  const start = new Date(now.getFullYear(), now.getMonth() - 1, 1);
  const MES = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic'];
  const valores = [12, 18, 20, 24, 22, 28, 30, 26, 32, 24, 22, 21];
  return valores.map((v, i) => {
    const d = new Date(start.getFullYear(), start.getMonth(), 1 + Math.floor(i * (30 / 12)));
    return { label: `${d.getDate()} ${MES[d.getMonth()]}`, value: v };
  });
}

function buildAsistencias(nAsistidas, nNoShow) {
  const now = new Date();
  const base = new Date(now.getFullYear(), now.getMonth() - 1, 3, 9, 0, 0);
  const items = [];
  for (let i = 0; i < nAsistidas; i++) {
    const d = new Date(base.getTime() + i * 24 * 60 * 60 * 1000);
    items.push({
      recordId: `demo-att-${i}`,
      leadId: `l:demo-${i}`,
      nombre: NOMBRES[i % NOMBRES.length],
      clinicKey: DEMO_CLINIC_ID,
      clinicRaw: DEMO_CLINIC_NAME,
      appointmentStart: d.toISOString(),
      phone: `+34 XXX XXX ${String(100 + i * 7).slice(-3)}`,
      estado: 'attended',
    });
  }
  for (let i = 0; i < nNoShow; i++) {
    const d = new Date(base.getTime() + (nAsistidas + i) * 30 * 60 * 60 * 1000);
    items.push({
      recordId: `demo-ns-${i}`,
      leadId: `l:demo-ns-${i}`,
      nombre: NOMBRES[(nAsistidas + i) % NOMBRES.length],
      clinicKey: DEMO_CLINIC_ID,
      clinicRaw: DEMO_CLINIC_NAME,
      appointmentStart: d.toISOString(),
      phone: `+34 XXX XXX ${String(200 + i * 11).slice(-3)}`,
      estado: 'no_show',
    });
  }
  return items.sort((a, b) => new Date(b.appointmentStart) - new Date(a.appointmentStart));
}

function buildCampanas(totalLeads, contactados, citas, asistencias) {
  // Split Meta/Google. Meta trae el grueso (82 %) y Google el resto.
  const metaShare = 0.82;
  const metaLeads = Math.round(totalLeads * metaShare);
  const metaContact = Math.round(contactados * metaShare);
  const metaCitas = Math.round(citas * metaShare);
  const metaAsist = Math.round(asistencias * metaShare);
  const googleLeads = totalLeads - metaLeads;
  const googleContact = contactados - metaContact;
  const googleCitas = citas - metaCitas;
  const googleAsist = asistencias - metaAsist;

  // Pesos de las 5 campañas de Meta y las 3 de Google.
  const pesosMeta   = [0.30, 0.24, 0.20, 0.16, 0.10];
  const pesosGoogle = [0.50, 0.30, 0.20];

  const build = (plat, totLeads, totContact, totCitas, totAsist, pesos, offset) => {
    const campsPlat = CAMPANAS.filter((c) => c.plataforma === plat);
    return campsPlat.map((c, i) => {
      const leads = Math.max(1, Math.round(totLeads * pesos[i]));
      const conta = Math.max(1, Math.min(leads, Math.round(totContact * pesos[i])));
      const cit   = Math.min(conta, Math.round(totCitas * pesos[i]));
      const asist = Math.min(cit, Math.round(totAsist * pesos[i]));
      const conv  = leads > 0 ? parseFloat(((cit / leads) * 100).toFixed(1)) : 0;
      const detalles = Array.from({ length: Math.min(10, leads) }, (_, j) => {
        const idx = (offset + i * 7 + j) % NOMBRES.length;
        const estado = j < cit / (leads / 10) ? 'Agendado'
          : j < conta / (leads / 10) ? 'Contactado'
          : 'Sin respuesta';
        return {
          nombre: NOMBRES[idx],
          fecha: `${(3 + j) % 28 + 1}/09`,
          clinica: DEMO_CLINIC_NAME,
          llamado: estado !== 'Sin respuesta',
          contactado: estado === 'Agendado' || estado === 'Contactado',
          agendado: estado === 'Agendado',
          estado,
        };
      });
      return {
        ...c,
        leads,
        contactados: conta,
        citas: cit,
        asistencias: asist,
        conv,
        llamados: Math.round(leads * 0.98),
        detalles,
      };
    });
  };

  const meta   = build('meta',   metaLeads,   metaContact,   metaCitas,   metaAsist,   pesosMeta,   0);
  const google = build('google', googleLeads, googleContact, googleCitas, googleAsist, pesosGoogle, 50);
  const rows = [...meta, ...google].sort((a, b) => b.citas - a.citas);
  return rows;
}

function buildComparativaPlataformas(rows, asistConfirmadasTotal) {
  // Agrupa cada plataforma y calcula tasa de agendamiento (citas/leads) y
  // tasa de asistencia (asisten / asistConfirmadas = asisten+ausentes).
  const by = { meta: { leads: 0, citas: 0, asistencias: 0 }, google: { leads: 0, citas: 0, asistencias: 0 } };
  rows.forEach((r) => {
    const k = r.plataforma === 'google' ? 'google' : 'meta';
    by[k].leads += r.leads;
    by[k].citas += r.citas;
    by[k].asistencias += r.asistencias;
  });
  const totalCitas = by.meta.citas + by.google.citas;
  return ['meta', 'google'].map((k) => {
    const b = by[k];
    const sharePlataforma = totalCitas > 0 ? b.citas / totalCitas : 0;
    const confirmadas = Math.round(asistConfirmadasTotal * sharePlataforma);
    return {
      key: k,
      leads: b.leads,
      citas: b.citas,
      asistencias: b.asistencias,
      tasaAgendamiento: b.leads > 0 ? parseFloat(((b.citas / b.leads) * 100).toFixed(1)) : null,
      tasaAsistencia: confirmadas > 0 ? parseFloat(((b.asistencias / confirmadas) * 100).toFixed(1)) : null,
    };
  });
}

function buildTopCalls() {
  return [
    { nombre: 'María García',  calificacion: 5, duracion: 312, fecha: '08/09', resumen: 'Paciente muy interesada en implantes All-on-4, se explica proceso y agenda cita', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Carlos López',  calificacion: 5, duracion: 247, fecha: '11/09', resumen: 'Consulta sobre financiación, acepta plan de 48 meses con seguro', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Ana Martínez',  calificacion: 5, duracion: 378, fecha: '15/09', resumen: 'Segunda opinión tras presupuesto en otra clínica más cara, satisfecha', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Pedro Sánchez', calificacion: 4, duracion: 198, fecha: '17/09', resumen: 'Interesado en carillas de porcelana, solicita información sobre promociones', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Javier Ruiz',   calificacion: 3, duracion: 156, fecha: '19/09', resumen: 'Duda sobre precio, quedan en volver a llamar tras hablar con su pareja', recordingUrl: '#', outcome: 'callback', agendado: false },
  ];
}

function buildLeadsRecientes() {
  return NOMBRES.slice(0, 10).map((n, i) => ({
    nombre: n,
    telefono: `+34 XXX XXX ${String(140 + i * 33).slice(-3)}`,
    status: ['agendado','agendado','agendado','contactado','agendado','agendado','contactado','agendado','agendado','agendado'][i],
    score: null,
    anuncio: CAMPANAS[i % CAMPANAS.length].anuncio,
    cita: i < 8 ? `${20 - i}/09, ${9 + (i % 3)}:${i % 2 === 0 ? '00' : '30'}` : null,
    objection: [null, null, null, 'Precio', null, null, 'Miedo', null, null, null][i],
    summary: i < 8 ? 'Cita confirmada para valoración inicial' : null,
  }));
}

function buildCallbacks() {
  return [
    { nombre: 'Francisco Jiménez', telefono: '+34 XXX XXX 481', hora: '22/09, 10:00', motivo: 'Consultar con familia antes de decidir' },
    { nombre: 'Rosa Ortega',       telefono: '+34 XXX XXX 627', hora: '22/09, 14:30', motivo: 'Revisión de presupuesto y opciones' },
    { nombre: 'Daniel Rubio',      telefono: '+34 XXX XXX 754', hora: '23/09, 09:30', motivo: 'Financiación y fecha de inicio' },
    { nombre: 'Marta Delgado',     telefono: '+34 XXX XXX 819', hora: '23/09, 16:00', motivo: 'Información sobre implantes' },
    { nombre: 'Jorge Ramírez',     telefono: '+34 XXX XXX 265', hora: '24/09, 11:00', motivo: 'Pide llamar por la tarde' },
  ];
}

function buildObjeciones(base) {
  const raw = [
    { label: 'Precio',              share: 0.30 },
    { label: 'Miedo / Indecisión',  share: 0.22 },
    { label: 'Ya tiene dentista',   share: 0.18 },
    { label: 'Tiempo',              share: 0.14 },
    { label: 'Ubicación',           share: 0.09 },
    { label: 'Callback',            share: 0.07 },
  ];
  const total = Math.round(base * 0.35);
  const out = raw.map((o) => {
    const count = Math.max(1, Math.round(total * o.share));
    const detalles = Array.from({ length: Math.min(4, count) }, (_, j) => ({
      nombre: NOMBRES[(o.label.length + j * 3) % NOMBRES.length],
      fecha: `${(2 + j * 4) % 28 + 1}/09`,
      texto: o.label,
      resumen: null,
      recordingUrl: null,
      duracion: 120 + j * 45,
      atendida: true,
      outcome: 'not_interested',
    }));
    return { label: o.label, count, detalles };
  });
  const sum = out.reduce((s, o) => s + o.count, 0) || 1;
  return out.map((o) => ({ ...o, pct: Math.round((o.count / sum) * 100) }));
}

function buildHistorico() {
  return [
    { mes: 'Jun 25', leads: 218, citas: 105, asistidas:  62, coste: 605.4, eurPorCita: 5.77 },
    { mes: 'Jul 25', leads: 248, citas: 132, asistidas:  78, coste: 704.8, eurPorCita: 5.34 },
    { mes: 'Ago 25', leads: 272, citas: 156, asistidas:  92, coste: 792.5, eurPorCita: 5.08 },
    { mes: 'Sep 25', leads: 300, citas: 180, asistidas: 108, coste: 892.4, eurPorCita: 4.96 },
  ];
}

export function buildDemoData(period = 'last_month') {
  const totalLeads = DEMO_TARGETS.totalLeads;
  const leadsContactados = DEMO_TARGETS.leadsContactados;
  const tasaAgSobreLeads = DEMO_TARGETS.tasaAgendamientoSobreLeads;

  const leadsAgendadosNuevos = Math.round(totalLeads * tasaAgSobreLeads); // 180
  const citasNuevas = leadsAgendadosNuevos;                               // 180
  const citasRescate = 22;
  const citasAgendadas = citasNuevas + citasRescate;                      // 202

  const citasAsistidas = Math.round(citasAgendadas * 0.60);               // 121
  const citasNoShow    = Math.round(citasAgendadas * 0.18);               // 36
  const confirmadas    = citasAsistidas + citasNoShow;
  const tasaNoShow = confirmadas > 0
    ? parseFloat(((citasNoShow / confirmadas) * 100).toFixed(1))
    : null;

  // Intentos para agendar: llamadas a leads del periodo / leads con cita nueva.
  // Con 180 cierres y ~3.4 intentos medios por cita = ~612 llamadas a leads.
  const intentosParaAgendar = 3.4;
  const llamadasNuevas = Math.round(leadsAgendadosNuevos * intentosParaAgendar); // 612
  const llamadasReintento = 285;
  const totalLlamadas = llamadasNuevas + llamadasReintento;               // 897
  const totalLlamadasFacturables = totalLlamadas + 240; // webcalls y pruebas que SI cuentan en facturacion
  const leadsConReintento = 118;
  const reintentosPorLead = parseFloat((llamadasReintento / leadsConReintento).toFixed(2));

  const tiempoContactoMin = 3.2;
  const callMinutes = parseFloat((totalLlamadasFacturables * tiempoContactoMin).toFixed(1));
  const costeLlamadas = parseFloat((callMinutes * defaultConfig.costePorMinuto).toFixed(2));
  const tiempoRespuestaSeg = 37;

  const evolucion = buildEvolucion(totalLeads, leadsContactados, citasNuevas);
  const asistenciasRecientes = buildAsistencias(Math.min(citasAsistidas, 12), Math.min(citasNoShow, 5));
  const campanas = buildCampanas(totalLeads, leadsContactados, citasNuevas, citasAsistidas);
  const comparativaPlataformas = buildComparativaPlataformas(campanas, confirmadas);
  const objeciones = buildObjeciones(leadsContactados);
  const historico = buildHistorico();

  // Agendamiento por llamada: muy fuerte a la 1ª, con cola importante en
  // los intentos 6-10 (leads que descuelgan tras varios días de insistencia).
  // Total = 180 (= leadsAgendadosNuevos).
  const agendamientoPorIntento = {
    buckets: { 1: 90, 2: 22, 3: 14, 4: 8, 5: 6, 6: 8, 7: 7, 8: 7, 9: 6, 10: 6, '11+': 6 },
    total: 180,
    sinLlamada: 0,
  };

  // Experimento llamada en fin de semana: más gente agenda y muchos cierran
  // ya en la primera llamada del finde.
  const finSemanaAceptan = 58;
  const finSemanaAgendados = 44;
  const finSemanaPrimera = 32;

  // Repesca (desde octubre): citas recuperadas por callback.
  const repescaAgendados = 14;
  const repescaIntentosMedios = 2.3;

  return {
    periodInfo: periodDescriptor(period),
    totalLeads,
    leadsContactados,
    totalLlamadas,
    totalLlamadasFacturables,
    llamadasAtendidas: leadsContactados,
    llamadasNuevas,
    llamadasReintento,
    leadsConReintento,
    leadsLlamados: 292,
    citasAgendadas,
    citasNuevas,
    citasRescate,
    leadsAgendadosNuevos,
    citasAsistidas,
    citasNoShow,
    tasaNoShow,
    asistenciasRecientes,
    citasPendientesConfirmar: [],
    intentosPorLeadNuevo: intentosParaAgendar,
    reintentosPorLead,
    serieReintentos: buildSerieReintentos(),
    repescaAgendados,
    repescaIntentosMedios,
    repescaLlamadasTotales: Math.round(repescaAgendados * repescaIntentosMedios),
    finSemanaAceptan,
    finSemanaAgendados,
    finSemanaPrimera,
    tiempoContactoMin,
    tiempoRespuestaSeg,
    costeLlamadas,
    callMinutes,
    leadsDelta: 18,
    porClinica: null,
    evolucion,
    objeciones,
    segmentos: { hayPrevios: false },
    campanas,
    comparativaPlataformas,
    leadsRecientes: buildLeadsRecientes(),
    callbacks: buildCallbacks(),
    topCalls: buildTopCalls(),
    valoracionMedia: 4.8,
    historico,
    agendamientoPorIntento,
  };
}
