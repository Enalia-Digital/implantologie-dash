import { useEffect, useRef, useState } from 'react';

export function formatDuration(seconds) {
  const m = Math.floor(seconds / 60);
  const s = seconds % 60;
  return `${m}:${String(s).padStart(2, '0')}`;
}

// Reproductor inline: play/pausa, barra buscable y contador.
export default function AudioPlayer({ src, duration, compact = false }) {
  const audioRef = useRef(null);
  const [playing, setPlaying] = useState(false);
  const [progress, setProgress] = useState(0);
  const [current, setCurrent] = useState(0);

  useEffect(() => {
    const a = audioRef.current;
    if (!a) return undefined;
    const onTime = () => {
      setCurrent(a.currentTime);
      setProgress(a.duration ? (a.currentTime / a.duration) * 100 : 0);
    };
    const onEnd = () => { setPlaying(false); setProgress(0); setCurrent(0); };
    a.addEventListener('timeupdate', onTime);
    a.addEventListener('ended', onEnd);
    return () => {
      a.removeEventListener('timeupdate', onTime);
      a.removeEventListener('ended', onEnd);
    };
  }, []);

  const toggle = (e) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a) return;
    if (playing) { a.pause(); setPlaying(false); }
    else { a.play().then(() => setPlaying(true)).catch(() => setPlaying(false)); }
  };

  const seek = (e) => {
    e.stopPropagation();
    const a = audioRef.current;
    if (!a || !a.duration) return;
    const rect = e.currentTarget.getBoundingClientRect();
    a.currentTime = ((e.clientX - rect.left) / rect.width) * a.duration;
  };

  const size = compact ? 24 : 28;

  return (
    <div
      style={{
        display: 'inline-flex', alignItems: 'center', gap: 10,
        padding: compact ? '4px 10px 4px 4px' : '6px 12px 6px 6px',
        borderRadius: 100,
        background: 'var(--accent-dim)',
        border: '1px solid var(--accent-border)',
        minWidth: compact ? 160 : 200,
      }}
    >
      <audio ref={audioRef} src={src} preload="none" />
      <button
        onClick={toggle}
        aria-label={playing ? 'Pausar' : 'Reproducir'}
        style={{
          width: size, height: size, borderRadius: '50%',
          border: 'none', background: 'var(--accent)', color: '#fff',
          display: 'flex', alignItems: 'center', justifyContent: 'center',
          cursor: 'pointer', flexShrink: 0,
          transition: 'transform var(--duration-fast) var(--ease-spring)',
        }}
        onMouseEnter={(e) => { e.currentTarget.style.transform = 'scale(1.08)'; }}
        onMouseLeave={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
      >
        {playing ? (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <rect x="1.5" y="1" width="2.5" height="8" rx="0.5" />
            <rect x="6" y="1" width="2.5" height="8" rx="0.5" />
          </svg>
        ) : (
          <svg width="10" height="10" viewBox="0 0 10 10" fill="currentColor">
            <path d="M2 1v8l7-4-7-4z" />
          </svg>
        )}
      </button>
      <div
        onClick={seek}
        style={{
          flex: 1, height: 4, borderRadius: 2, background: 'rgba(191,0,255,0.15)',
          cursor: 'pointer', position: 'relative', minWidth: 70,
        }}
      >
        <div
          style={{
            position: 'absolute', top: 0, left: 0, height: '100%',
            width: `${progress}%`, background: 'var(--accent)', borderRadius: 2,
            transition: 'width 0.1s linear',
          }}
        />
      </div>
      <span
        style={{
          fontSize: 10, color: 'var(--accent)', fontVariantNumeric: 'tabular-nums',
          minWidth: 30, textAlign: 'right', fontWeight: 500,
        }}
      >
        {playing || current > 0 ? formatDuration(Math.round(current)) : formatDuration(duration || 0)}
      </span>
    </div>
  );
}
