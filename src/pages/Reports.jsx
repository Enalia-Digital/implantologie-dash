import { useMemo } from 'react';
import AppLayout from '../components/layout/AppLayout';
import ReportsPanel from '../components/ui/ReportsPanel';
import { useClinic } from '../context/ClinicContext';
import useAirtableData from '../hooks/useAirtableData';
import { clinicHeader } from '../data/mockData';

function buildByClinicForReport(data) {
  if (!data?.porClinica) return null;
  const NAME = {
    triana: 'Clínica Triana',
    losPalacios: 'Clínica Los Palacios',
    sanJose: 'Clínica San José',
  };
  return Object.entries(data.porClinica).map(([id, s]) => ({
    id,
    name: NAME[id] || id,
    data: {
      totalLeads: s.leads,
      leadsContactados: Math.round(s.leads * 0.92),
      citasAgendadas: s.citas,
      citasAsistidas: null,
      totalLlamadas: null,
      tiempoRespuestaSeg: null,
    },
  }));
}

export default function Reports() {
  const { activeClinic, period } = useClinic();
  const { data, loading } = useAirtableData(activeClinic, period);
  const isGeneral = activeClinic === 'general';
  const byClinic = useMemo(() => (isGeneral ? buildByClinicForReport(data) : null), [isGeneral, data]);

  return (
    <AppLayout>
      <div className="app-page" style={{ padding: 'clamp(14px, 3vw, 24px) clamp(14px, 3vw, 32px) 64px', maxWidth: 900 }}>
        <div style={{ marginBottom: 20 }}>
          <div style={{ fontSize: 22, fontWeight: 600, color: 'var(--text-primary)' }}>
            Reportes mensuales
          </div>
          <div style={{ fontSize: 13, color: 'var(--text-muted)', marginTop: 4 }}>
            {clinicHeader[activeClinic]} · Descarga o visualiza los reportes de cierre mensual.
          </div>
        </div>

        {loading && !data ? (
          <div style={{ padding: 40, textAlign: 'center', color: 'var(--text-muted)', fontSize: 13 }}>
            Cargando datos…
          </div>
        ) : (
          <ReportsPanel data={data} byClinic={byClinic} />
        )}
      </div>
    </AppLayout>
  );
}
