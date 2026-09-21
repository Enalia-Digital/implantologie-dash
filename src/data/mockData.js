import { IS_DEMO, DEMO_CLINIC_ID, DEMO_CLINIC_NAME, DEMO_CLINIC_HEADER } from './demoMode';

const REAL_CLINICS = [
  { id: 'general', name: 'General', subtitle: 'Todas las clínicas' },
  { id: 'triana', name: 'Triana', subtitle: 'Sevilla · Triana' },
  { id: 'los_palacios', name: 'Los Palacios', subtitle: 'Los Palacios y Villafranca' },
  { id: 'san_jose', name: 'San José', subtitle: 'San José de la Rinconada' },
];

const REAL_CLINIC_HEADER = {
  general: 'Vista General · Todas las clínicas',
  triana: 'Dental Implantologie Triana',
  los_palacios: 'Dental Implantologie Los Palacios',
  san_jose: 'Dental Implantologie San José de la Rinconada',
};

const DEMO_CLINICS = [
  { id: DEMO_CLINIC_ID, name: DEMO_CLINIC_NAME, subtitle: 'Clínica dental — demo' },
];

const DEMO_CLINIC_HEADER_MAP = {
  [DEMO_CLINIC_ID]: DEMO_CLINIC_HEADER,
};

export const clinics = IS_DEMO ? DEMO_CLINICS : REAL_CLINICS;
export const clinicHeader = IS_DEMO ? DEMO_CLINIC_HEADER_MAP : REAL_CLINIC_HEADER;
