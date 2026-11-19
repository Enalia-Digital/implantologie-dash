// Estructura real de cal.com (horarios por clínica y especialidad).
// Sacada del conector de cal.com. Los scheduleId son los que usa la API para
// añadir/quitar excepciones (días bloqueados). Horario mañana = 10:00–14:00,
// tarde = 16:00–20:00 en las 9 agendas principales, así que los bloqueos de
// "solo mañana" / "solo tarde" usan esas ventanas.
//
// overridesIniciales = snapshot de los días ya bloqueados en cal.com el día que
// se montó el panel. Sirve para que el calendario muestre los bloqueos desde el
// primer momento; en cuanto la API responde en vivo, se reemplazan por los reales.

export const MORNING = { startTime: '10:00', endTime: '14:00' };
export const AFTERNOON = { startTime: '16:00', endTime: '20:00' };

// Días laborables de cada agenda (0=Dom … 6=Sáb) → para saber qué días son
// "atendibles" y cuáles pintar apagados en el calendario.
const DOW = { Sunday: 0, Monday: 1, Tuesday: 2, Wednesday: 3, Thursday: 4, Friday: 5, Saturday: 6 };
function daysFrom(availability) {
  const set = new Set();
  availability.forEach((a) => a.days.forEach((d) => set.add(DOW[d])));
  return [...set].sort((x, y) => x - y);
}

// Franja mañana/tarde activa por día laborable (para decidir qué ofrecer).
function partsFrom(availability) {
  let manana = false;
  let tarde = false;
  availability.forEach((a) => {
    const start = parseInt(a.startTime.slice(0, 2), 10);
    if (start < 15) manana = true; else tarde = true;
  });
  return { manana, tarde };
}

const RAW = {
  triana: {
    label: 'Triana',
    especialidades: {
      implantologia: {
        label: 'Implantología',
        scheduleId: 1608059,
        availability: [
          { days: ['Monday', 'Thursday', 'Friday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Monday', 'Thursday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-10-15', '2026-10-16', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      estetica: {
        label: 'Estética',
        sub: 'carillas',
        scheduleId: 1610904,
        availability: [
          { days: ['Monday', 'Tuesday', 'Thursday', 'Friday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Monday', 'Tuesday', 'Thursday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-01', '2026-10-02', '2026-10-15', '2026-10-16', '2026-10-19', '2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      ortodoncia: {
        label: 'Ortodoncia',
        scheduleId: 1610903,
        availability: [
          { days: ['Wednesday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Wednesday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-01', '2026-10-02', '2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
    },
  },
  los_palacios: {
    label: 'Los Palacios',
    especialidades: {
      implantologia: {
        label: 'Implantología',
        scheduleId: 1610912,
        availability: [
          { days: ['Monday', 'Wednesday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Monday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      estetica: {
        label: 'Estética',
        sub: 'carillas',
        scheduleId: 1610928,
        availability: [
          { days: ['Monday', 'Wednesday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Monday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      ortodoncia: {
        label: 'Ortodoncia',
        scheduleId: 1610923,
        availability: [
          { days: ['Thursday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Thursday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
    },
  },
  san_jose: {
    label: 'San José',
    especialidades: {
      implantologia: {
        label: 'Implantología',
        scheduleId: 1610960,
        availability: [
          { days: ['Tuesday', 'Wednesday'], startTime: '16:00', endTime: '20:00' },
          { days: ['Wednesday', 'Thursday'], startTime: '10:00', endTime: '14:00' },
        ],
        overridesIniciales: ['2026-10-01', '2026-10-13', '2026-10-14', '2026-10-15', '2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      estetica: {
        label: 'Estética',
        sub: 'carillas',
        scheduleId: 1610972,
        availability: [
          { days: ['Tuesday', 'Wednesday', 'Thursday'], startTime: '16:00', endTime: '20:00' },
          { days: ['Wednesday', 'Thursday'], startTime: '10:00', endTime: '14:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
      ortodoncia: {
        label: 'Ortodoncia',
        scheduleId: 1610967,
        availability: [
          { days: ['Monday'], startTime: '10:00', endTime: '14:00' },
          { days: ['Monday'], startTime: '16:00', endTime: '20:00' },
        ],
        overridesIniciales: ['2026-10-12', '2026-11-02', '2026-12-07', '2026-12-08', '2026-12-25'],
      },
    },
  },
};

// Orden fijo de clínicas y especialidades para la UI.
export const CLINIC_ORDER = ['triana', 'los_palacios', 'san_jose'];
export const ESPECIALIDAD_ORDER = ['implantologia', 'estetica', 'ortodoncia'];

// Enriquecemos cada especialidad con días laborables y franjas derivadas.
export const SCHEDULES = (() => {
  const out = {};
  for (const [cid, clinic] of Object.entries(RAW)) {
    out[cid] = { label: clinic.label, especialidades: {} };
    for (const [eid, esp] of Object.entries(clinic.especialidades)) {
      out[cid].especialidades[eid] = {
        ...esp,
        workDays: daysFrom(esp.availability),
        parts: partsFrom(esp.availability),
      };
    }
  }
  return out;
})();

export function getEspecialidad(clinicId, espId) {
  return SCHEDULES[clinicId]?.especialidades?.[espId] || null;
}
