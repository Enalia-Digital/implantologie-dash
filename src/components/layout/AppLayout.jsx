import { useState, useCallback } from 'react';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children, headerRight }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('enalia-sidebar') === 'collapsed'; } catch { return false; }
  });

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('enalia-sidebar', next ? 'collapsed' : 'expanded'); } catch {}
      return next;
    });
  }, []);

  const sidebarW = collapsed ? 64 : 240;

  return (
    <div style={{ display: 'flex', height: '100vh', overflow: 'hidden' }}>
      {mobileOpen && (
        <div
          onClick={() => setMobileOpen(false)}
          style={{ position: 'fixed', inset: 0, background: 'rgba(0,0,0,0.5)', zIndex: 49 }}
        />
      )}
      <Sidebar
        collapsed={collapsed}
        onToggleCollapse={toggleCollapse}
        mobileOpen={mobileOpen}
        onClose={() => setMobileOpen(false)}
      />
      <main
        className="main-content"
        style={{
          marginLeft: sidebarW,
          flex: 1,
          height: '100vh',
          overflowY: 'auto',
          transition: 'margin-left var(--duration-normal) var(--ease-default)',
        }}
      >
        <Header onMenu={() => setMobileOpen(true)} right={headerRight} />
        {children}
      </main>
    </div>
  );
}
