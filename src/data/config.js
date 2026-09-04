// Tasas base de Dental Implantologie — EDITABLES desde el dashboard.
// Persistidas en localStorage; ver ClinicContext.

// Nombre del agente de voz, tal y como se le muestra al cliente.
export const nombreAgente = 'Mateo';

// ---------------------------------------------------------------------------
// COMPARATIVA DEL PRIMER MES
//
// Lead_id de los leads que ya habían entrado ANTES de activar al agente.
// Se copian tal cual vienen de Airtable, con el prefijo "l:".
// Lo que no esté en esta lista cuenta como lead gestionado por el agente.
//
// Cuando pase el primer mes y ya no haga falta la comparativa:
// deja la lista vacía y pon fechaInicioEnalia a null.
// ---------------------------------------------------------------------------
export const leadsPreviosIds = [
  'l:963804286747191',
  'l:2300117083856299',
  'l:1848035489517456',
  'l:1377076057848330',
  'l:1053591954091355',
  'l:1044671461527613',
  'l:27417065364638991',
  'l:1445707504148398',
  'l:1383246996566796',
  'l:1586351149550195',
  'l:1045028568320800',
  'l:2961610204209640',
];

// Respaldo por fecha, solo se usa si leadsPreviosIds está vacía.
export const fechaInicioEnalia = '2026-08-31';

export const defaultConfig = {
  baseAgendamiento: 25,
  baseAsistencia: 25,
  feePorAsistida: 20,
  ticketMedio: 600,
  costePorMinuto: 0.3,
  mantenimientoMensual: 300,
};
