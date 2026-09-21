// Modo DEMO. Esta branch (claude/vigilant-dirac-bd2qlg) es EXCLUSIVAMENTE
// para el proyecto de Vercel "dashboard demo IOI - Enalia".
//
// El dashboard real de Enalia usa la branch `main`, donde IS_DEMO no existe
// (este archivo solo vive aqui). NO MERGEAR ESTA BRANCH A MAIN.
//
// Cuando IS_DEMO === true, el dashboard no toca Airtable y renderiza la
// clinica IOI Aurora con datos ficticios.
export const IS_DEMO = true;

// Cifras troncales del demo. El resto de metricas se derivan de aqui para que
// todo (funnel, KPIs, campanas, evolucion, historico) cuadre entre si.
export const DEMO_CLINIC_ID = 'ioi_aurora';
export const DEMO_CLINIC_NAME = 'IOI Aurora';
export const DEMO_CLINIC_HEADER = 'IOI Aurora · Clínica Dental';

export const DEMO_TARGETS = {
  totalLeads: 300,
  leadsContactados: 271,
  tasaAgendamientoSobreLeads: 0.60,
};
