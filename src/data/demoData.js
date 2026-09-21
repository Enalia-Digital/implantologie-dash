// Dataset ficticio para el modo DEMO (IOI Aurora). Genera exactamente la
// misma estructura que `transformData` de src/lib/airtable.js, para que todos
// los bloques del dashboard (KPIs, funnel, evolucion, campanas, historico,
// asistencias, callbacks, top calls, etc.) funcionen sin cambios.
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
  { campaña: 'Implantes All-on-4 Aurora', anuncio: 'Sonrisa completa desde 4.900€' },
  { campaña: 'Implantes All-on-4 Aurora', anuncio: 'Implante + Corona 990€' },
  { campaña: 'Estética Dental Premium',   anuncio: 'Carillas de porcelana Aurora' },
  { campaña: 'Ortodoncia Invisible',      anuncio: 'Invisalign desde 65€/mes' },
  { campaña: 'Primera Consulta Gratis',   anuncio: 'Diagnóstico 3D sin coste' },
];

function periodDescriptor(period) {
  // Ancla las etiquetas al mes anterior — el pitch comercial habla del "ultimo mes".
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

function buildCampanas(totalLeads, contactados, citas) {
  const pesosLeads = [0.30, 0.24, 0.20, 0.16, 0.10];
  const boostAgend = [1.10, 1.02, 0.95, 0.90, 1.05];
  const rows = CAMPANAS.map((c, i) => {
    const leads = Math.round(totalLeads * pesosLeads[i]);
    const conta = Math.round(contactados * pesosLeads[i]);
    const cit   = Math.min(conta, Math.round(citas * pesosLeads[i] * boostAgend[i]));
    const conv  = leads > 0 ? parseFloat(((cit / leads) * 100).toFixed(1)) : 0;
    const detalles = Array.from({ length: Math.min(10, leads) }, (_, j) => {
      const idx = (i * 7 + j) % NOMBRES.length;
      const estado = j < cit / (leads / 10) ? 'Agendado' : j < conta / (leads / 10) ? 'Contactado' : 'Sin llamar';
      return {
        nombre: NOMBRES[idx],
        fecha: `${(3 + j) % 28 + 1}/09`,
        clinica: DEMO_CLINIC_NAME,
        llamado: estado !== 'Sin llamar',
        contactado: estado === 'Agendado' || estado === 'Contactado',
        agendado: estado === 'Agendado',
        estado,
      };
    });
    return { ...c, leads, contactados: conta, citas: cit, conv, llamados: Math.round(leads * 0.98), detalles };
  }).sort((a, b) => b.citas - a.citas);
  return rows;
}

function buildTopCalls() {
  return [
    { nombre: 'María García',      calificacion: 5, duracion: 312, fecha: '08/09', resumen: 'Paciente muy interesada en implantes All-on-4, se explica proceso y agenda cita', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Carlos López',      calificacion: 5, duracion: 247, fecha: '11/09', resumen: 'Consulta sobre financiación, acepta plan de 48 meses con seguro', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Ana Martínez',      calificacion: 5, duracion: 378, fecha: '15/09', resumen: 'Segunda opinión tras presupuesto en otra clínica más cara, satisfecha', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Pedro Sánchez',     calificacion: 4, duracion: 198, fecha: '17/09', resumen: 'Interesado en carillas de porcelana, solicita información sobre promociones', recordingUrl: '#', outcome: 'appointment_scheduled', agendado: true },
    { nombre: 'Javier Ruiz',       calificacion: 3, duracion: 156, fecha: '19/09', resumen: 'Duda sobre precio, quedan en volver a llamar tras hablar con su pareja', recordingUrl: '#', outcome: 'callback', agendado: false },
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
  // Solo un tercio de los contactados terminan con una objecion registrada.
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
  // 4 meses hacia atras, cerrando en el mes pasado con las cifras ancla.
  return [
    { mes: 'Jun 25', leads: 218, citas: 105, asistidas:  62, coste: 605.4, eurPorCita: 5.77 },
    { mes: 'Jul 25', leads: 248, citas: 132, asistidas:  78, coste: 704.8, eurPorCita: 5.34 },
    { mes: 'Ago 25', leads: 272, citas: 156, asistidas:  92, coste: 792.5, eurPorCita: 5.08 },
    { mes: 'Sep 25', leads: 300, citas: 180, asistidas: 108, coste: 892.4, eurPorCita: 4.96 },
  ];
}

export function buildDemoData(period = 'last_month') {
  const totalLeads = DEMO_TARGETS.totalLeads;                             // 300
  const leadsContactados = DEMO_TARGETS.leadsContactados;                 // 271
  const tasaAgSobreLeads = DEMO_TARGETS.tasaAgendamientoSobreLeads;       // 0.60

  // 60 % de los leads del periodo terminan agendando cita nueva => 180.
  const leadsAgendadosNuevos = Math.round(totalLeads * tasaAgSobreLeads); // 180
  const citasNuevas = leadsAgendadosNuevos;                               // 180
  const citasRescate = 22;                                                // leads antiguos rescatados
  const citasAgendadas = citasNuevas + citasRescate;                      // 202

  // Asistencias: 60 % de asistencia sobre agendadas, 18 % de no-show.
  const citasAsistidas = Math.round(citasAgendadas * 0.60);               // 121
  const citasNoShow    = Math.round(citasAgendadas * 0.18);               // 36
  const confirmadas    = citasAsistidas + citasNoShow;
  const tasaNoShow = confirmadas > 0
    ? parseFloat(((citasNoShow / confirmadas) * 100).toFixed(1))
    : null;

  const intentosPorLeadNuevo = 3.4;
  const llamadasNuevas = Math.round(totalLeads * intentosPorLeadNuevo);   // 1020
  const llamadasReintento = 285;
  const totalLlamadas = llamadasNuevas + llamadasReintento;               // 1305
  const leadsConReintento = 118;
  const reintentosPorLead = parseFloat((llamadasReintento / leadsConReintento).toFixed(2));

  const tiempoContactoMin = 3.2;
  const callMinutes = parseFloat((totalLlamadas * tiempoContactoMin).toFixed(1));
  const costeLlamadas = parseFloat((callMinutes * defaultConfig.costePorMinuto).toFixed(2));
  const tiempoRespuestaSeg = 38;

  const evolucion = buildEvolucion(totalLeads, leadsContactados, citasNuevas);
  const asistenciasRecientes = buildAsistencias(Math.min(citasAsistidas, 12), Math.min(citasNoShow, 5));
  const campanas = buildCampanas(totalLeads, leadsContactados, citasNuevas);
  const objeciones = buildObjeciones(leadsContactados);
  const historico = buildHistorico();

  const agendamientoPorIntento = {
    buckets: { 1: 75, 2: 48, 3: 30, 4: 15, 5: 8, '6+': 4 },
    total: 180,
    sinLlamada: 0,
  };

  return {
    periodInfo: periodDescriptor(period),
    totalLeads,
    leadsContactados,
    totalLlamadas,
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
    intentosPorLeadNuevo,
    reintentosPorLead,
    serieReintentos: buildSerieReintentos(),
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
    leadsRecientes: buildLeadsRecientes(),
    callbacks: buildCallbacks(),
    topCalls: buildTopCalls(),
    valoracionMedia: 4.8,
    historico,
    agendamientoPorIntento,
  };
}
