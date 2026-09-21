import React, { useState, useMemo } from 'react';
import { useClinic } from '../context/ClinicContext';
import { clinicHeader } from '../data/mockData';
import useAirtableData from '../hooks/useAirtableData';
import AppLayout from '../components/layout/AppLayout';
import KpiBlock from '../components/blocks/KpiBlock';
import FirstCallBlock from '../components/blocks/FirstCallBlock';
import RetriesBlock from '../components/blocks/RetriesBlock';
import AttendanceBlock from '../components/blocks/AttendanceBlock';
import FunnelBlock from '../components/blocks/FunnelBlock';
import GoalsBlock from '../components/blocks/GoalsBlock';
import EvolutionBlock from '../components/blocks/EvolutionBlock';
import ClinicDistributionBlock from '../components/blocks/ClinicDistributionBlock';
import ObjectionsBlock from '../components/blocks/ObjectionsBlock';
import CampaignsBlock from '../components/blocks/CampaignsBlock';
import BillingBlock from '../components/blocks/BillingBlock';
import TopCallsBlock from '../components/blocks/TopCallsBlock';
import { IS_DEMO } from '../data/demoMode';
import SegmentTabs from '../components/ui/SegmentTabs';
import ChangelogWidget from '../components/ui/ChangelogWidget';
import ReportsPanel from '../components/ui/ReportsPanel';
import AlertBanner from '../components/ui/AlertBanner';

function Separator() {
  return <div style={{ height: 1, background: 'var(--border-hairline)', margin: '24px 0' }} />;
}

// Convierte data.porClinica (leads/citas) en el formato de métricas que espera el PDF.
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

export default function Dashboard() {
  const { activeClinic, config, period } = useClinic();
  const [vista, setVista] = useState('activacion');
  const [changelogResetKey, setChangelogResetKey] = useState(0);

  React.useEffect(() => {
    if (activeClinic === 'general') setChangelogResetKey((k) => k + 1);
  }, [activeClinic]);
  const { data, loading, error, refresh } = useAirtableData(activeClinic, period, vista);

  const isGeneral = activeClinic === 'general';
  const byClinic = useMemo(() => (isGeneral ? buildByClinicForReport(data) : null), [isGeneral, data]);

  const blocks = [
    { id: 'b-kpis', el: <KpiBlock data={data} vista={vista} deps={[activeClinic]} /> },
    { id: 'b-funnel', el: <FunnelBlock data={data} /> },
    { id: 'b-attendance', el: <AttendanceBlock data={data} /> },
    { id: 'b-evolution', el: <EvolutionBlock data={data} /> },
    { id: 'b-first-call', el: <FirstCallBlock data={data} /> },
    { id: 'b-retries', el: <RetriesBlock data={data} /> },
    { id: 'b-goals', el: <GoalsBlock data={data} /> },
    isGeneral && { id: 'b-clinics', el: <ClinicDistributionBlock data={data} /> },
    { id: 'b-objections', el: <ObjectionsBlock data={data} /> },
    { id: 'b-campaigns', el: <CampaignsBlock data={data} /> },
    { id: 'b-top-calls', el: <TopCallsBlock data={data} /> },
    !IS_DEMO && { id: 'b-billing', el: <BillingBlock data={data} config={config} /> },
  ].filter(Boolean);

  const headerRight = (
    <div style={{ display: 'flex', alignItems: 'center', gap: 10 }}>
      {data && !loading && (
        <span style={{ fontSize: 10, color: 'var(--green)', display: 'inline-flex', alignItems: 'center', gap: 4 }}>
          <span style={{ width: 6, height: 6, borderRadius: '50%', background: 'var(--green)' }} />
          Live
        </span>
      )}
      <button
        onClick={refresh}
        disabled={loading}
        aria-label="Actualizar datos"
        title="Actualizar datos"
        style={{
          width: 32, height: 32, borderRadius: 8,
          border: '1px solid var(--border-subtle)', padding: 0,
          color: 'var(--text-secondary)', background: 'transparent',
          transition: 'background 0.15s ease, color 0.15s ease',
          display: 'inline-flex', alignItems: 'center', justifyContent: 'center',
          cursor: loading ? 'wait' : 'pointer',
        }}
        onMouseEnter={(e) => { if (!loading) { e.currentTarget.style.background = 'var(--bg-hover)'; e.currentTarget.style.color = 'var(--accent)'; } }}
        onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; e.currentTarget.style.color = 'var(--text-secondary)'; }}
      >
        <svg
          width="15" height="15" viewBox="0 0 15 15" fill="none"
          stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round"
          style={{ animation: loading ? 'spin 0.9s linear infinite' : 'none', transformOrigin: 'center' }}
        >
          <path d="M13 7.5A5.5 5.5 0 1 1 11.5 3.7" />
          <path d="M13 2v3.5H9.5" />
        </svg>
      </button>
    </div>
  );

  return (
    <AppLayout headerRight={headerRight}>
      {loading && !data && <LoadingState />}
      {error && !data && <ErrorState message={error} onRetry={refresh} />}
      {data && (
        <AlertBanner count={data.citasPendientesConfirmar?.length || 0} />
      )}
      {data && data.segmentos && data.segmentos.hayPrevios && (
        <SegmentTabs vista={vista} onChange={setVista} />
      )}
      {data && (
        <div key={activeClinic} className="app-page" style={{ padding: 'clamp(14px, 3vw, 18px) clamp(14px, 3vw, 32px) 64px', opacity: loading ? 0.6 : 1, transition: 'opacity 0.2s' }}>
          {blocks.map((b, i) => (
            <div key={b.id}>
              <div id={b.id} className="fade-in-up" style={{ animationDelay: `${i * 25}ms` }}>
                {b.el}
              </div>
              {i < blocks.length - 1 && <Separator />}
            </div>
          ))}

          {!IS_DEMO && (
            <div style={{ marginTop: 32 }}>
              <ReportsPanel data={data} byClinic={byClinic} />
            </div>
          )}
        </div>
      )}
      <ChangelogWidget visible={!!data && !loading} resetKey={changelogResetKey} />
    </AppLayout>
  );
}

function ErrorState({ message, onRetry }) {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ textAlign: 'center', maxWidth: 360 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 8 }}>
          No se pudieron cargar los datos
        </div>
        <div style={{ fontSize: 12, color: 'var(--text-muted)', marginBottom: 20, lineHeight: 1.5 }}>
          {message}
        </div>
        <button
          onClick={onRetry}
          style={{
            border: '1px solid rgba(191,0,255,0.25)', borderRadius: 6,
            padding: '8px 20px', fontSize: 13, fontWeight: 500,
            color: 'var(--accent)', background: 'transparent',
          }}
        >
          Reintentar
        </button>
      </div>
    </div>
  );
}

function LoadingState() {
  return (
    <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', padding: '80px 0' }}>
      <div style={{ textAlign: 'center' }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-secondary)', marginBottom: 12 }}>
          Cargando datos…
        </div>
        <div style={{ width: 120, height: 4, background: 'var(--bar-bg)', borderRadius: 2, overflow: 'hidden' }}>
          <div className="export-bar" style={{ height: 4, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
