// Tasas base de Dental Implantologie — EDITABLES desde el dashboard.
// Persistidas en localStorage; ver ClinicContext.
export const defaultConfig = {
  baseAgendamiento: 22, // % de agendamiento base del cliente
  baseAsistencia: 55, // % de asistencia base del cliente
  feePorAsistida: 20, // € por cita asistida por encima de la base de asistencia
  ticketMedio: 600,
  costePorMinuto: 0.3,
  mantenimientoMensual: 500,
};
