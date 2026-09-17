import { useState, useCallback, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import Sidebar from './Sidebar';
import Header from './Header';

export default function AppLayout({ children, headerRight }) {
  const [mobileOpen, setMobileOpen] = useState(false);
  const [collapsed, setCollapsed] = useState(() => {
    try { return localStorage.getItem('enalia-sidebar') === 'collapsed'; } catch { return false; }
  });
  const [hovering, setHovering] = useState(false);
  const [isMobile, setIsMobile] = useState(() =>
    typeof window !== 'undefined' && window.matchMedia('(max-width: 767px)').matches
  );
  const location = useLocation();

  // Detect viewport class + reactive updates
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 767px)');
    const onChange = () => setIsMobile(mq.matches);
    mq.addEventListener?.('change', onChange);
    return () => mq.removeEventListener?.('change', onChange);
  }, []);

  // Auto-cerrar drawer al cambiar de ruta
  useEffect(() => { setMobileOpen(false); }, [location.pathname]);

  // Lock scroll del body cuando el drawer esta abierto
  useEffect(() => {
    if (mobileOpen) {
      const prev = document.body.style.overflow;
      document.body.style.overflow = 'hidden';
      return () => { document.body.style.overflow = prev; };
    }
  }, [mobileOpen]);

  // Cerrar con ESC
  useEffect(() => {
    if (!mobileOpen) return;
    const onKey = (e) => { if (e.key === 'Escape') setMobileOpen(false); };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [mobileOpen]);

  const toggleCollapse = useCallback(() => {
    setCollapsed((prev) => {
      const next = !prev;
      try { localStorage.setItem('enalia-sidebar', next ? 'collapsed' : 'expanded'); } catch {}
      return next;
    });
    setHovering(false);
  }, []);

  // --- Swipe-to-close gesture en el drawer (mobile) ------------------
  const dragRef = useRef(null);
  const startXRef = useRef(null);
  const currentXRef = useRef(0);
  const draggingRef = useRef(false);

  const onTouchStart = (e) => {
    if (!isMobile || !mobileOpen) return;
    const t = e.touches[0];
    startXRef.current = t.clientX;
    currentXRef.current = 0;
    draggingRef.current = true;
    if (dragRef.current) dragRef.current.style.transition = 'none';
  };
  const onTouchMove = (e) => {
    if (!draggingRef.current || startXRef.current === null) return;
    const t = e.touches[0];
    const dx = t.clientX - startXRef.current;
    // Solo arrastra a la izquierda (cerrar). Aplica friccion si va a derecha.
    const capped = dx < 0 ? dx : dx * 0.15;
    currentXRef.current = capped;
    if (dragRef.current) dragRef.current.style.transform = `translateX(${capped}px)`;
  };
  const onTouchEnd = () => {
    if (!draggingRef.current) return;
    draggingRef.current = false;
    if (dragRef.current) dragRef.current.style.transition = '';
    const dx = currentXRef.current;
    // Umbral: si arrastro >= 25% del ancho hacia izquierda, cerrar.
    const shouldClose = dx < -70;
    if (dragRef.current) dragRef.current.style.transform = '';
    if (shouldClose) setMobileOpen(false);
    startXRef.current = null;
    currentXRef.current = 0;
  };

  const persistedW = collapsed ? 64 : 240;
  const isPeek = collapsed && hovering;
  const visualCollapsed = collapsed && !hovering;

  return (
    <div style={{ display: 'flex', minHeight: '100dvh', overflow: 'hidden' }}>
      {/* Backdrop mobile */}
      <div
        className={`sidebar-backdrop${mobileOpen ? ' visible' : ''}`}
        onClick={() => setMobileOpen(false)}
        aria-hidden={!mobileOpen}
      />

      {/* Sidebar wrapper: en desktop controla hover-peek, en mobile es el drawer */}
      <div
        ref={dragRef}
        onMouseEnter={() => { if (!isMobile && collapsed) setHovering(true); }}
        onMouseLeave={() => { if (!isMobile && collapsed) setHovering(false); }}
        onTouchStart={onTouchStart}
        onTouchMove={onTouchMove}
        onTouchEnd={onTouchEnd}
        style={{
          position: 'fixed', left: 0, top: 0, height: '100dvh', zIndex: 60,
        }}
      >
        <Sidebar
          collapsed={isMobile ? false : visualCollapsed}
          onToggleCollapse={toggleCollapse}
          mobileOpen={mobileOpen}
          onClose={() => setMobileOpen(false)}
          isPeek={!isMobile && isPeek}
        />
      </div>

      <main
        className="main-content"
        style={{
          marginLeft: isMobile ? 0 : persistedW,
          flex: 1,
          minHeight: '100dvh',
          overflowY: 'auto',
          transition: 'margin-left var(--duration-normal) var(--ease-default)',
          WebkitOverflowScrolling: 'touch',
        }}
      >
        <Header onMenu={() => setMobileOpen(true)} right={headerRight} />
        {children}
      </main>
    </div>
  );
}
