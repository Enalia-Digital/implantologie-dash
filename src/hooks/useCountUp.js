import { useEffect, useRef, useState } from 'react';

const prefersReduced =
  typeof window !== 'undefined' &&
  window.matchMedia &&
  window.matchMedia('(prefers-reduced-motion: reduce)').matches;

export function useCountUp(target, duration = 800, deps = []) {
  const numericTarget = typeof target === 'number' && Number.isFinite(target) ? target : 0;
  const [value, setValue] = useState(numericTarget);
  const frameRef = useRef(null);
  const fallbackRef = useRef(null);
  const prevTarget = useRef(numericTarget);

  useEffect(() => {
    if (prefersReduced) {
      setValue(numericTarget);
      prevTarget.current = numericTarget;
      return undefined;
    }

    const from = prevTarget.current;
    prevTarget.current = numericTarget;

    if (from === numericTarget) {
      setValue(numericTarget);
      return undefined;
    }

    let start = null;
    const ease = (t) => 1 - Math.pow(1 - t, 3);

    const step = (ts) => {
      if (start === null) start = ts;
      const progress = Math.min((ts - start) / duration, 1);
      setValue(from + (numericTarget - from) * ease(progress));
      if (progress < 1) {
        frameRef.current = requestAnimationFrame(step);
      }
    };
    frameRef.current = requestAnimationFrame(step);

    fallbackRef.current = setTimeout(() => setValue(numericTarget), duration + 100);

    return () => {
      cancelAnimationFrame(frameRef.current);
      clearTimeout(fallbackRef.current);
    };
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [numericTarget, duration, ...deps]);

  return value;
}
