import { useState } from 'react';
import { useClinic, PERIODS } from '../context/ClinicContext';
import { useAuth } from '../context/AuthContext';
import { mockData, clinicHeader } from '../data/mockData';
import Sidebar from '../components/layout/Sidebar';
import Header from '../components/layout/Header';
import StatusBar from '../components/layout/StatusBar';
import KpiBlock from '../components/blocks/KpiBlock';
import FunnelBlock from '../components/blocks/FunnelBlock';
import GoalsBlock from '../components/blocks/GoalsBlock';
import EvolutionBlock from '../components/blocks/EvolutionBlock';
import ClinicDistributionBlock from '../components/blocks/ClinicDistributionBlock';
import BottleneckBlock from '../components/blocks/BottleneckBlock';
import ObjectionsBlock from '../components/blocks/ObjectionsBlock';
import CampaignsBlock from '../components/blocks/CampaignsBlock';
import LeadsBlock from '../components/blocks/LeadsBlock';
import CallbacksBlock from '../components/blocks/CallbacksBlock';
import BillingBlock from '../components/blocks/BillingBlock';
import HistoryBlock from '../components/blocks/HistoryBlock';

function Separator() {
  return <div style={{ height: 1, background: 'var(--border-hairline)', margin: '28px 0' }} />;
}

export default function Dashboard() {
  const { activeClinic, config, period } = useClinic();
  const { isAdmin } = useAuth();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [exporting, setExporting] = useState(false);

  const data = mockData[activeClinic];
  const isGeneral = activeClinic === 'general';
  const periodLabel = PERIODS.find((p) => p.id === period)?.label || '';

  // Bloques en orden, con id para exportación PDF cuando aplica.
  const blocks = [
    { id: 'pdf-kpis', el: <KpiBlock data={data} deps={[activeClinic]} />, pdf: true },
    { id: 'pdf-funnel', el: <FunnelBlock data={data} />, pdf: true },
    { id: 'pdf-goals', el: <GoalsBlock data={data} />, pdf: true },
    { id: 'b-evolution', el: <EvolutionBlock data={data} /> },
    isGeneral && { id: 'b-clinics', el: <ClinicDistributionBlock data={data} /> },
    { id: 'b-bottleneck', el: <BottleneckBlock data={data} /> },
    { id: 'b-objections', el: <ObjectionsBlock data={data} /> },
    { id: 'pdf-campaigns', el: <CampaignsBlock data={data} />, pdf: true },
    !isGeneral && { id: 'b-leads', el: <LeadsBlock data={data} /> },
    { id: 'b-callbacks', el: <CallbacksBlock data={data} /> },
    { id: 'pdf-billing', el: <BillingBlock data={data} config={config} isAdmin={isAdmin} />, pdf: true },
    { id: 'pdf-history', el: <HistoryBlock data={data} />, pdf: true },
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
        sectionIds: blocks.filter((b) => b.pdf).map((b) => b.id),
      });
    } catch (err) {
      console.error('Error al exportar PDF', err);
      alert('No se pudo generar el informe. Inténtalo de nuevo.');
    } finally {
      setExporting(false);
    }
  };

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.6)', zIndex: 49 }}
          className="sidebar-backdrop"
        />
      )}
      <Sidebar mobileOpen={mobileOpen} onClose={() => setMobileOpen(false)} />

      <main className="main" style={{ marginLeft: 220, flex: 1, height: '100vh', overflowY: 'auto' }}>
        <Header onExport={handleExport} exporting={exporting} onMenu={() => setMobileOpen(true)} />
        <StatusBar />

        <div
          key={activeClinic}
          style={{
            padding: '28px 32px 64px',
            background:
              'radial-gradient(ellipse 800px 500px at 0% 0%, rgba(191,0,255,0.03), transparent 60%)',
          }}
        >
          {blocks.map((b, i) => (
            <div key={b.id}>
              <div id={b.id} className="fade-in-up" style={{ animationDelay: `${i * 60}ms` }}>
                {b.el}
              </div>
              {i < blocks.length - 1 && <Separator />}
            </div>
          ))}
        </div>
      </main>

      {exporting && <ExportOverlay />}
    </div>
  );
}

function ExportOverlay() {
  return (
    <div
      style={{
        position: 'fixed',
        inset: 0,
        zIndex: 100,
        background: 'rgba(9,9,14,0.85)',
        backdropFilter: 'blur(8px)',
        WebkitBackdropFilter: 'blur(8px)',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'center',
      }}
    >
      <div style={{ background: 'var(--bg-card)', border: '1px solid var(--border-subtle)', borderRadius: 10, padding: '28px 36px', textAlign: 'center', minWidth: 260 }}>
        <div style={{ fontSize: 14, fontWeight: 500, color: 'var(--text-primary)', marginBottom: 16 }}>Generando informe…</div>
        <div style={{ height: 4, background: 'rgba(255,255,255,0.06)', borderRadius: 2, overflow: 'hidden' }}>
          <div className="export-bar" style={{ height: 4, background: 'var(--accent)', borderRadius: 2 }} />
        </div>
      </div>
    </div>
  );
}
