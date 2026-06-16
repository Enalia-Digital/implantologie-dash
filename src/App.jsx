import { Routes, Route, Navigate } from 'react-router-dom';
import { ClinicProvider } from './context/ClinicContext';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';

export default function App() {
  return (
    <ClinicProvider>
      <Routes>
        <Route path="/" element={<Navigate to="/dashboard" replace />} />
        <Route path="/dashboard" element={<Dashboard />} />
        <Route path="/calendario" element={<CalendarView />} />
        <Route path="*" element={<Navigate to="/dashboard" replace />} />
      </Routes>
    </ClinicProvider>
  );
}
