import { useState } from 'react';
import { useClinic, PERIODS } from '../context/ClinicContext';
import { mockData, clinicHeader } from '../data/mockData';
import AppLayout from '../components/layout/AppLayout';
import KpiBlock from '../components/blocks/KpiBlock';
import FunnelBlock from '../components/blocks/FunnelBlock';
import GoalsBlock from '../components/blocks/GoalsBlock';
import EvolutionBlock from '../components/blocks/EvolutionBlock';
import ClinicDistributionBlock from '../components/blocks/ClinicDistributionBlock';
import BottleneckBlock from '../components/blocks/BottleneckBlock';
import ObjectionsBlock from '../components/blocks/ObjectionsBlock';
import CampaignsBlock from '../components/blocks/CampaignsBlock';
import LeadsBlock from '../components/blocks/LeadsBlock';
import BillingBlock from '../components/blocks/BillingBlock';
import HistoryBlock from '../components/blocks/HistoryBlock';

function Separator() {
  return <div style={{ height: 1, background: 'var(--border-hairline)', margin: '24px 0' }} />;
}

export default function Dashboard() {
  const { activeClinic, config, period } = useClinic();
  const [exporting, setExporting] = useState(false);

  const data = mockData[activeClinic];
  const isGeneral = activeClinic === 'general';
  const periodLabel = PERIODS.find((p) => p.id === period)?.label || '';

  const blocks = [
    { id: 'pdf-kpis', el: <KpiBlock data={data} deps={[activeClinic]} /> },
    { id: 'pdf-funnel', el: <FunnelBlock data={data} /> },
    { id: 'pdf-goals', el: <GoalsBlock data={data} /> },
    { id: 'b-evolution', el: <EvolutionBlock data={data} /> },
    isGeneral && { id: 'b-clinics', el: <ClinicDistributionBlock data={data} /> },
    { id: 'b-bottleneck', el: <BottleneckBlock data={data} /> },
    { id: 'b-objections', el: <ObjectionsBlock data={data} /> },
    { id: 'pdf-campaigns', el: <CampaignsBlock data={data} /> },
    !isGeneral && { id: 'b-leads', el: <LeadsBlock data={data} /> },
    { id: 'pdf-billing', el: <BillingBlock data={data} config={config} /> },
    { id: 'pdf-history', el: <HistoryBlock data={data} /> },
  ].filter(Boolean);

  const handleExport = async () => {
    if (exporting) return;
    setExporting(true);
    try {
      const { exportDashboardPdf } = await import('../lib/exportPdf');
      await exportDashboardPdf({
        clinicId: activeClinic,
        clinicName: clinicHeader[activeClinic],
        periodLabel,
        sectionIds: blocks.map((b) => b.id),
      });
    } catch (err) {
      console.error('Error al exportar PDF', err);
    } finally {
      setExporting(false);
    }
  };

  const exportBtn = (
    <button
      onClick={handleExport}
      disabled={exporting}
      style={{
        border: '1px solid rgba(191,0,255,0.25)', borderRadius: 6,
        padding: '6px 14px', fontSize: 12, fontWeight: 500,
        color: 'var(--accent)', background: 'transparent',
        transition: 'background 0.15s ease',
        opacity: exporting ? 0.5 : 1,
      }}
      onMouseEnter={(e) => { e.currentTarget.style.background = 'rgba(191,0,255,0.08)'; }}
      onMouseLeave={(e) => { e.currentTarget.style.background = 'transparent'; }}
    >
      {exporting ? 'Generando…' : 'Exportar PDF'}
    </button>
  );

  return (
    <AppLayout headerRight={exportBtn}>
      <div key={activeClinic} style={{ padding: '24px 32px 64px' }}>
        {blocks.map((b, i) => (
          <div key={b.id}>
            <div id={b.id} className="fade-in-up" style={{ animationDelay: `${i * 50}ms` }}>
              {b.el}
            </div>
            {i < blocks.length - 1 && <Separator />}
          </div>
        ))}
      </div>
      {exporting && <ExportOverlay />}
    </AppLayout>
  );
}

function ExportOverlay() {
  return (
    <div
      style={{
        position: 'fixed', inset: 0, zIndex: 100,
        background: 'rgba(9,9,14,0.85)', backdropFilter: 'blur(8px)',
        display: 'flex', alignItems: 'center', justifyContent: 'center',
      }}
    >
      <div
        style={{
          background: 'var(--bg-card)', border: '1px solid var(--border-subtle)',
          borderRadius: 10, padding: '28px 36px', textAlign: 'center', minWidth: 260,
        }}
      >
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>
          Generando informe…
        </div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div className="export-bar" style={{ height: 4, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
