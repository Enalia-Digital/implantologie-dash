import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { defaultConfig } from '../data/config';
import { IS_DEMO, DEMO_CLINIC_ID } from '../data/demoMode';

const ClinicContext = createContext(null);

const CLINIC_KEY = 'enalia.activeClinic';
const PERIOD_KEY = 'enalia.period.v2';
const CONFIG_KEY = 'enalia.config';

function readJSON(key, fallback) {
  try {
    const raw = localStorage.getItem(key);
    return raw ? JSON.parse(raw) : fallback;
  } catch {
    return fallback;
  }
}

function readString(key, fallback) {
  try {
    return localStorage.getItem(key) || fallback;
  } catch {
    return fallback;
  }
}

export const PERIODS = [
  { id: 'week', label: 'Esta semana', short: 'Semana' },
  { id: 'month', label: 'Este mes', short: 'Mes' },
  { id: 'last_month', label: 'Mes pasado', short: 'Mes pasado' },
  { id: 'last_90', label: 'Últimos 90 días', short: '90 días' },
  { id: 'enalia', label: 'Histórico Enalia', short: 'Enalia' },
];

const DEFAULT_CLINIC = IS_DEMO ? DEMO_CLINIC_ID : 'general';
const DEFAULT_PERIOD = IS_DEMO ? 'last_month' : 'last_90';

export function ClinicProvider({ children }) {
  // En modo demo forzamos siempre la clinica IOI Aurora y el mes pasado, sin
  // depender de lo que haya en localStorage (los assets del cliente son de un
  // solo mes, no queremos que se abra en semana o histórico vacío).
  const [activeClinic, setActiveClinicState] = useState(
    () => (IS_DEMO ? DEFAULT_CLINIC : readString(CLINIC_KEY, DEFAULT_CLINIC))
  );
  const [period, setPeriodState] = useState(
    () => (IS_DEMO ? DEFAULT_PERIOD : readString(PERIOD_KEY, DEFAULT_PERIOD))
  );
  const [config, setConfigState] = useState(() => ({ ...defaultConfig, ...readJSON(CONFIG_KEY, {}) }));

  const setActiveClinic = useCallback((id) => {
    if (IS_DEMO) return; // no dejamos cambiar clinica en demo
    setActiveClinicState(id);
    try {
      localStorage.setItem(CLINIC_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setPeriod = useCallback((id) => {
    setPeriodState(id);
    if (!IS_DEMO) {
      try {
        localStorage.setItem(PERIOD_KEY, id);
      } catch {
        /* ignore */
      }
    }
  }, []);

  const updateConfig = useCallback((patch) => {
    setConfigState((prev) => {
      const next = { ...prev, ...patch };
      try {
        localStorage.setItem(CONFIG_KEY, JSON.stringify(next));
      } catch {
        /* ignore */
      }
      return next;
    });
  }, []);

  const value = useMemo(
    () => ({ activeClinic, setActiveClinic, period, setPeriod, config, updateConfig }),
    [activeClinic, setActiveClinic, period, setPeriod, config, updateConfig]
  );

  return <ClinicContext.Provider value={value}>{children}</ClinicContext.Provider>;
}

export function useClinic() {
  const ctx = useContext(ClinicContext);
  if (!ctx) throw new Error('useClinic must be used within ClinicProvider');
  return ctx;
}
