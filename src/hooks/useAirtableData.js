import { useState, useEffect, useCallback } from 'react';
import { fetchAirtableData, transformData, invalidateCache } from '../lib/airtable';
import { IS_DEMO } from '../data/demoMode';
import { buildDemoData } from '../data/demoData';

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

export default function useAirtableData(clinicId, period, vista = 'activacion') {
  const [data, setData] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);

  const load = useCallback(async (opts = {}) => {
    setLoading(true);
    setError(null);

    // Modo DEMO: no llamamos a Airtable, devolvemos el dataset ficticio de IOI
    // Aurora. Simulamos un pequeño delay para que el spinner y el fade-in se
    // vean bien durante la presentacion.
    if (IS_DEMO) {
      await new Promise((r) => setTimeout(r, 220));
      setData(buildDemoData(period));
      setLoading(false);
      return;
    }

    if (opts.fresh) invalidateCache();
    try {
      const raw = await fetchAirtableData(!!opts.fresh);
      const transformed = transformData(raw, clinicId, period, vista);
      setData(transformed);
    } catch (err) {
      console.error('Airtable fetch failed:', err);
      setData(buildEmptyData());
    } finally {
      setLoading(false);
    }
  }, [clinicId, period, vista]);

  useEffect(() => {
    load({ fresh: true });
  }, [load]);

  useEffect(() => {
    if (IS_DEMO) return undefined; // no re-fetching automatico en demo
    const onFocus = () => load({ fresh: true });
    const onVisible = () => {
      if (document.visibilityState === 'visible') load({ fresh: true });
    };
    const onExternalRefresh = () => load({ fresh: true });
    window.addEventListener('focus', onFocus);
    document.addEventListener('visibilitychange', onVisible);
    window.addEventListener('airtable:refresh', onExternalRefresh);
    return () => {
      window.removeEventListener('focus', onFocus);
      document.removeEventListener('visibilitychange', onVisible);
      window.removeEventListener('airtable:refresh', onExternalRefresh);
    };
  }, [load]);

  const refresh = useCallback(() => {
    load({ fresh: true });
  }, [load]);

  return { data, loading, error, refresh };
}
