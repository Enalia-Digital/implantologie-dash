import { useEffect, useRef } from 'react';

export default function SplashScreen({ onComplete }) {
  const ref = useRef(null);

  useEffect(() => {
    const el = ref.current;
    const exitTimer = setTimeout(() => el.classList.add('splash-exit'), 2400);
    const doneTimer = setTimeout(onComplete, 3100);
    return () => { clearTimeout(exitTimer); clearTimeout(doneTimer); };
  }, [onComplete]);

  return (
    <div ref={ref} className="splash-overlay">
      <div className="splash-glow-ring" />
      <div className="splash-collab">
        <div
          className="splash-logo-enter"
          style={{
            width: 56, height: 56,
            background: 'var(--accent)',
            WebkitMaskImage: 'url(/logo-n-white.png)',
            WebkitMaskSize: 'contain',
            WebkitMaskRepeat: 'no-repeat',
            WebkitMaskPosition: 'center',
            maskImage: 'url(/logo-n-white.png)',
            maskSize: 'contain',
            maskRepeat: 'no-repeat',
            maskPosition: 'center',
          }}
        />
        <span className="splash-x">×</span>
        <span className="splash-clinic">Dental Implantologie</span>
      </div>
    </div>
  );
}
