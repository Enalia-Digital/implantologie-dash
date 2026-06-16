import AppLayout from '../components/layout/AppLayout';
import { useClinic } from '../context/ClinicContext';
import { clinicHeader } from '../data/mockData';

const CALENDAR_URLS = {
  general: null,
  triana: '',
  los_palacios: '',
  san_jose: '',
};

export default function CalendarView() {
  const { activeClinic } = useClinic();
  const url = CALENDAR_URLS[activeClinic];
  const isGeneral = activeClinic === 'general';

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px', height: 'calc(100vh - 52px)' }}>
        {isGeneral ? (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div style={{ textAlign: 'center' }}>
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Selecciona una clínica para ver su calendario
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)' }}>
                Usa el selector de clínicas del sidebar
              </div>
            </div>
          </div>
        ) : url ? (
          <iframe
            src={url}
            style={{
              width: '100%', height: '100%', border: 'none', borderRadius: 10,
              background: 'var(--bg-card)',
            }}
            title={`Calendario ${clinicHeader[activeClinic]}`}
          />
        ) : (
          <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', height: '100%' }}>
            <div
              style={{
                textAlign: 'center', background: 'var(--bg-card)',
                border: '1px solid var(--border-subtle)', borderRadius: 10,
                padding: '40px 48px',
              }}
            >
              <div style={{ fontSize: 14, color: 'var(--text-secondary)', marginBottom: 8 }}>
                Calendario pendiente de configurar
              </div>
              <div style={{ fontSize: 12, color: 'var(--text-muted)', lineHeight: 1.5 }}>
                {clinicHeader[activeClinic]}
              </div>
            </div>
          </div>
        )}
      </div>
    </AppLayout>
  );
}
