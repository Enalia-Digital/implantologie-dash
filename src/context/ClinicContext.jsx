import { createContext, useContext, useState, useCallback, useMemo } from 'react';
import { defaultConfig } from '../data/config';

const ClinicContext = createContext(null);

const CLINIC_KEY = 'enalia.activeClinic';
const PERIOD_KEY = 'enalia.period';
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
  { id: 'week', label: 'Esta semana' },
  { id: 'month', label: 'Este mes' },
  { id: 'last_month', label: 'Mes pasado' },
  { id: 'last_90', label: 'Últimos 90 días' },
];

export function ClinicProvider({ children }) {
  const [activeClinic, setActiveClinicState] = useState(() => readString(CLINIC_KEY, 'general'));
  const [period, setPeriodState] = useState(() => readString(PERIOD_KEY, 'month'));
  const [config, setConfigState] = useState(() => ({ ...defaultConfig, ...readJSON(CONFIG_KEY, {}) }));

  const setActiveClinic = useCallback((id) => {
    setActiveClinicState(id);
    try {
      localStorage.setItem(CLINIC_KEY, id);
    } catch {
      /* ignore */
    }
  }, []);

  const setPeriod = useCallback((id) => {
    setPeriodState(id);
    try {
      localStorage.setItem(PERIOD_KEY, id);
    } catch {
      /* ignore */
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
