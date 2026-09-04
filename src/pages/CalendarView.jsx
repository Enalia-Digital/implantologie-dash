import { useEffect } from 'react';
import AppLayout from '../components/layout/AppLayout';
import { useClinic } from '../context/ClinicContext';
import { clinicHeader } from '../data/mockData';

const CALENDAR_URLS = {
  general: null,
  triana: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FMadrid&showPrint=0&showCalendars=0&showTz=0&src=MGJkMDk5MmE4NWUwNTMwMjk5M2E4YjRmMmU3NjU2YzBiZGRmZWNhMmJiOGEzM2UyZWJlYmRhMGE0ZGQ4OTFlNEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%238e24aa',
  los_palacios: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FMadrid&showPrint=0&showTabs=0&showCalendars=0&showTz=0&src=N2MwNzc5NmE3MDJkYzU3OWUwNWVlNjYzNjdkMTRiZTVjNzUyYWExNjgzMjliNmU2ZmE3Zjg0MmVhMmQ3YWU4MEBncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%23d50000',
  san_jose: 'https://calendar.google.com/calendar/embed?height=600&wkst=1&ctz=Europe%2FMadrid&showPrint=0&showTz=0&showCalendars=0&src=MmI5YjJhNzAxZGU4Y2Q2ZDFmYWU4YzM0MTM2ZjMwODRmNzg4MzVhNzVhZTI1ZDYyMzg5ZWVlYzI5M2RiYTQ3M0Bncm91cC5jYWxlbmRhci5nb29nbGUuY29t&color=%234285f4',
};

export default function CalendarView() {
  const { activeClinic, setActiveClinic } = useClinic();

  useEffect(() => {
    if (activeClinic === 'general') {
      setActiveClinic('triana');
    }
  }, [activeClinic, setActiveClinic]);

  const url = CALENDAR_URLS[activeClinic];

  return (
    <AppLayout>
      <div style={{ padding: '24px 32px', height: 'calc(100vh - 52px)' }}>
        {url ? (
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
