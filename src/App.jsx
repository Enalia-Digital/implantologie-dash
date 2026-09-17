import { useState, useCallback } from 'react';
import { Routes, Route, Navigate } from 'react-router-dom';
import { ClinicProvider } from './context/ClinicContext';
import { ThemeProvider } from './context/ThemeContext';
import SplashScreen from './components/SplashScreen';
import Dashboard from './pages/Dashboard';
import CalendarView from './pages/CalendarView';
import Calculator from './pages/Calculator';
import Reports from './pages/Reports';
import Alertas from './pages/Alertas';

export default function App() {
  const [splashDone, setSplashDone] = useState(false);
  const handleSplashComplete = useCallback(() => setSplashDone(true), []);

  return (
    <ThemeProvider>
      <ClinicProvider>
        {!splashDone && <SplashScreen onComplete={handleSplashComplete} />}
        <Routes>
          <Route path="/" element={<Navigate to="/dashboard" replace />} />
          <Route path="/dashboard" element={<Dashboard />} />
          <Route path="/calendario" element={<CalendarView />} />
          <Route path="/calculadora" element={<Calculator />} />
          <Route path="/reportes" element={<Reports />} />
          <Route path="/alertas" element={<Alertas />} />
          <Route path="*" element={<Navigate to="/dashboard" replace />} />
        </Routes>
      </ClinicProvider>
    </ThemeProvider>
  );
}
