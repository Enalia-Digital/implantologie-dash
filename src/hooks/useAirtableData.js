import { useState, useEffect, useCallback } from 'react';
import { fetchAirtableData, transformData, invalidateCache } from '../lib/airtable';

function buildEmptyData() {
  return {
    totalLeads: 0,
    leadsContactados: 0,
    totalLlamadas: 0,
    citasAgendadas: 0,
    citasAsistidas: null,
    tiempoContactoMin: 0,
    costeLlamadas: 0,
    callMinutes: 0,
    leadsDelta: null,
    valoracionMedia: null,
    porClinica: {
      triana: { leads: 0, citas: 0 },
      losPalacios: { leads: 0, citas: 0 },
      sanJose: { leads: 0, citas: 0 },
    },
    evolucion: [],
    objeciones: [],
    campanas: [],
    leadsRecientes: [],
    callbacks: [],
    topCalls: [],
    historico: [],
  };
}

function buildMockData() {
  const names = [
    'María García', 'Carlos López', 'Ana Martínez', 'Pedro Sánchez', 'Laura Fernández',
    'Javier Ruiz', 'Carmen Díaz', 'Miguel Torres', 'Isabel Moreno', 'Francisco Jiménez',
    'Lucía Romero', 'Antonio Navarro', 'Elena Domínguez', 'Alejandro Gil', 'Sofía Molina',
    'Pablo Serrano', 'Rosa Ortega', 'Daniel Rubio', 'Marta Delgado', 'Jorge Ramírez',
    'Andrés Pérez', 'Cristina Sanz', 'Ángel Vázquez', 'Patricia Núñez', 'Rodrigo Cabrera',
  ];
  const campaigns = [
    { campaña: 'Implantes Premium Sevilla', anuncio: 'Implante + Corona 990€' },
    { campaña: 'Implantes Premium Sevilla', anuncio: 'Sonrisa Completa All-on-4' },
    { campaña: 'Ortodoncia Invisible', anuncio: 'Invisalign desde 60€/mes' },
    { campaña: 'Blanqueamiento Dental', anuncio: 'Blanqueamiento LED 199€' },
    { campaña: 'Primera Consulta Gratis', anuncio: 'Diagnóstico 3D Gratuito' },
  ];

  // Reales: 370 leads, 63% agendamiento = 233 citas, 60% asistencias = 140
  const totalLeads = 370;
  const contactRate = 0.92;
  const agendamientoRate = 0.63;
  const asistenciaRate = 0.60;
  const intentosPorLead = 3.7;
  const minutosMedio = 3.2;

  const leadsContactados = Math.round(totalLeads * contactRate);
  const citasAgendadas = Math.round(totalLeads * agendamientoRate);
  const citasAsistidas = Math.round(citasAgendadas * asistenciaRate);
  const totalLlamadas = Math.round(totalLeads * intentosPorLead);
  const callMinutes = Math.round(totalLlamadas * minutosMedio);
  const costeLlamadas = parseFloat((callMinutes * 0.30).toFixed(2));

  const objeciones = [
    { label: 'Precio', count: 118, pct: 32 },
    { label: 'Miedo / Indecisión', count: 84, pct: 23 },
    { label: 'Ya tiene dentista', count: 66, pct: 18 },
    { label: 'Tiempo', count: 55, pct: 15 },
    { label: 'Ubicación', count: 33, pct: 9 },
    { label: 'Callback', count: 11, pct: 3 },
  ];

  const now = new Date();
  const daysInMonth = now.getDate();
  const evolucion = [];
  const buckets = 7;
  const bucketDays = Math.max(1, daysInMonth / buckets);
  let cumL = 0, cumC = 0, cumCi = 0;
  for (let i = 0; i < buckets; i++) {
    const d = new Date(now.getFullYear(), now.getMonth(), 1 + Math.round(i * bucketDays));
    const dayLeads = Math.round(totalLeads / buckets + (Math.random() - 0.5) * 12);
    const dayContactados = Math.round(dayLeads * contactRate);
    const dayCitas = Math.round(dayLeads * agendamientoRate);
    cumL += dayLeads;
    cumC += dayContactados;
    cumCi += dayCitas;
    evolucion.push({
      dia: d.toLocaleDateString('es-ES', { day: 'numeric', month: 'short' }),
      leads: cumL, contactados: cumC, citas: cumCi,
    });
  }

  const campanas = campaigns.map((c, i) => {
    const leads = [92, 84, 78, 68, 48][i];
    const contactados = Math.round(leads * contactRate);
    const citas = Math.round(leads * [0.67, 0.65, 0.62, 0.59, 0.65][i]);
    return { ...c, leads, contactados, citas, conv: parseFloat(((citas / leads) * 100).toFixed(1)) };
  });

  const topCalls = [
    { nombre: 'María García', calificacion: 5, duracion: 312, fecha: '22/07', resumen: 'Paciente muy interesada en implantes All-on-4, detalle sobre tratamiento, agenda cita', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Carlos López', calificacion: 5, duracion: 247, fecha: '21/07', resumen: 'Consulta sobre opciones de financiación, acepta plan de 48 meses con seguro', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Ana Martínez', calificacion: 5, duracion: 378, fecha: '21/07', resumen: 'Segunda opinión tras presupuesto en otra clínica más cara, muy satisfecha', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Pedro Sánchez', calificacion: 4, duracion: 198, fecha: '20/07', resumen: 'Interesado en blanqueamiento + carillas, solicita información sobre promociones', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Laura Fernández', calificacion: 5, duracion: 324, fecha: '19/07', resumen: 'Paciente con miedo al dentista, se explica sedación consciente, muy tranquilo', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Javier Ruiz', calificacion: null, duracion: 156, fecha: '19/07', resumen: 'Llamada completada pero no respondió al mensaje de WhatsApp de seguimiento', recordingUrl: '#', outcome: 'callback' },
    { nombre: 'Carmen Díaz', calificacion: 5, duracion: 267, fecha: '18/07', resumen: 'Muy interesada en ortodoncia invisible, agenda primera consulta para mañana', recordingUrl: '#', outcome: 'appointment_scheduled' },
    { nombre: 'Miguel Torres', calificacion: null, duracion: 124, fecha: '18/07', resumen: null, recordingUrl: '#', outcome: 'no_answer' },
  ];

  const leadsRecientes = names.slice(0, 12).map((n, i) => ({
    nombre: n,
    telefono: `+34 XXX XXX ${String(100 + i * 43).slice(-3)}`,
    status: ['agendado', 'agendado', 'contactado', 'agendado', 'callback', 'agendado', 'contactado', 'agendado', 'nuevo', 'agendado', 'contactado', 'agendado'][i],
    score: null,
    anuncio: campaigns[i % campaigns.length].anuncio,
    cita: i < 8 ? `${23 - Math.floor(i / 2)}/07, ${9 + (i % 2) * 2}:${i % 2 === 0 ? '00' : '30'}` : null,
    objection: [null, 'Precio', null, 'Miedo', null, null, 'Ya tiene dentista', null, null, 'Tiempo', null, null][i],
    summary: i < 8 ? 'Cita confirmada para valoración' : null,
  }));

  const callbacks = [
    { nombre: 'Francisco Jiménez', telefono: '+34 XXX XXX 481', hora: '24/07, 10:00', motivo: 'Consultar con familia antes de decidir' },
    { nombre: 'Rosa Ortega', telefono: '+34 XXX XXX 627', hora: '24/07, 14:30', motivo: 'Revisión de presupuesto y opciones' },
    { nombre: 'Daniel Rubio', telefono: '+34 XXX XXX 754', hora: '25/07, 09:30', motivo: 'Financiación y fecha de inicio' },
    { nombre: 'Marta Sánchez', telefono: '+34 XXX XXX 819', hora: '25/07, 16:00', motivo: 'Información sobre implantes' },
    { nombre: 'Jorge Martín', telefono: '+34 XXX XXX 265', hora: '26/07, 11:00', motivo: 'Pide llamar por la tarde' },
  ];

  const historico = [
    { mes: 'Abr 25', leads: 298, citas: 175, asistidas: 102, coste: 723.4, eurPorCita: 4.13 },
    { mes: 'May 25', leads: 315, citas: 191, asistidas: 111, coste: 781.5, eurPorCita: 4.09 },
    { mes: 'Jun 25', leads: 342, citas: 212, asistidas: 125, coste: 872.8, eurPorCita: 4.02 },
    { mes: 'Jul 25', leads: 370, citas: 233, asistidas: 140, coste: 1314.3, eurPorCita: 3.55 },
  ];

  return {
    totalLeads,
    leadsContactados,
    totalLlamadas,
    citasAgendadas,
    citasAsistidas,
    tiempoContactoMin: minutosMedio,
    costeLlamadas,
    callMinutes,
    leadsDelta: 28,
    valoracionMedia: 4.7,
    porClinica: {
      triana: { leads: 148, citas: 94 },
      losPalacios: { leads: 132, citas: 84 },
      sanJose: { leads: 90, citas: 55 },
    },
    evolucion,
    objeciones,
    campanas,
    leadsRecientes,
    callbacks,
    topCalls,
    historico,
  };
}

export default function useAirtableData(clinicId, period) {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const USE_MOCK = false;

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);
    if (USE_MOCK) {
      setData(buildMockData());
      setLoading(false);
      return;
    }
    if (opts.fresh) invalidateCache();
    try {
      const raw = await fetchAirtableData();
      const transformed = transformData(raw, clinicId, period);
      setData(transformed);
    } catch (err) {
      console.error('Airtable fetch failed:', err);
      setData(buildEmptyData());
    } finally {
      setLoading(false);
    }
  }, [clinicId, period]);

  useEffect(() => {
    load({ fresh: true });
  }, [load]);

  useEffect(() => {
    const onFocus = () => load({ fresh: true });
    const onVisible = () => {
      if (document.visibilityState === 'visible') load({ fresh: true });
    };
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
    };
  }, [load]);

  const refresh = useCallback(() => {
    load({ fresh: true });
  }, [load]);

  return { data, loading, error, refresh };
}
