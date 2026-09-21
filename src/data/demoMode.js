// Modo DEMO. Se activa desde el build de Vercel con `VITE_DEMO_MODE=true`.
// Cuando esta activo, el dashboard no toca Airtable y muestra la clinica IOI
// Aurora con datos ficticios, exclusivamente para reuniones y presentaciones.
// El dashboard real de Enalia queda intacto siempre que la variable no este
// declarada.
export const IS_DEMO = String(import.meta.env.VITE_DEMO_MODE || '').toLowerCase() === 'true';

// Cifras troncales del demo. El resto de metricas se derivan de aqui para que
// todo (funnel, KPIs, campanas, evolucion, historico) cuadre entre si.
export const DEMO_CLINIC_ID = 'ioi_aurora';
export const DEMO_CLINIC_NAME = 'IOI Aurora';
export const DEMO_CLINIC_HEADER = 'IOI Aurora · Clínica Dental';

export const DEMO_TARGETS = {
  totalLeads: 300,
  leadsContactados: 73,
  tasaAgendamientoSobreContactados: 0.62,
};
