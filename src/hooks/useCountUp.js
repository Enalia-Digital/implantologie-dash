import { useEffect, useRef, useState } from 'react';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

// Cuenta desde 0 hasta `target` en `duration` ms con ease-out.
// `deps` reinicia la animación (p. ej. al cambiar de clínica).
export function useCountUp(target, duration = 800, deps = []) {
  const numericTarget = typeof target === 'number' && Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(numericTarget);
  const frameRef = useRef(null);
  const fallbackRef = useRef(null);

  useEffect(() => {
    if (prefersReduced) {
      setValue(numericTarget);
      return undefined;
    }
    let start = null;
    const from = 0;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    setValue(0);

    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(from + (numericTarget - from) * ease(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);

    // Fallback si el navegador throttlea rAF (pestañas en background)
    fallbackRef.current = setTimeout(() => setValue(numericTarget), duration + 100);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(fallbackRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericTarget, duration, ...deps]);

  return value;
}
