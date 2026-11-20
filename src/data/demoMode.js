// Modo DEMO. Esta branch (claude/vigilant-dirac-bd2qlg) es EXCLUSIVAMENTE
// para el proyecto de Vercel "dashboard demo Enalia".
//
// El dashboard real de Enalia usa la branch `main`, donde IS_DEMO no existe
// (este archivo solo vive aqui). NO MERGEAR ESTA BRANCH A MAIN.
//
// Cuando IS_DEMO === true, el dashboard no toca Airtable y renderiza una
// "clinica demo" con branding Enalia Digital y datos ficticios.
export const IS_DEMO = true;

// Branding Enalia Digital para el dashboard de demostraciones comerciales.
// Se muestra como clinica activa en sidebar, header y splash.
export const DEMO_CLINIC_ID = 'enalia_demo';
export const DEMO_CLINIC_NAME = 'Enalia Digital';
export const DEMO_CLINIC_HEADER = 'Enalia Digital';

export const DEMO_TARGETS = {
  totalLeads: 300,
  leadsContactados: 271,
  tasaAgendamientoSobreLeads: 0.60,
};
