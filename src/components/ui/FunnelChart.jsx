import { motion, useSpring, useTransform } from 'motion/react';
import { useCallback, useEffect, useRef, useState } from 'react';
import { clsx } from 'clsx';
import { twMerge } from 'tailwind-merge';

function cn(...inputs) {
  return twMerge(clsx(inputs));
}

const fmtPct = (p) => `${Math.round(p)}%`;
const fmtVal = (v) => v.toLocaleString('es-ES');
const springConfig = { stiffness: 120, damping: 20, mass: 1 };
const hoverSpring = { stiffness: 300, damping: 24 };

function hSegmentPath(normStart, normEnd, segW, H, layerScale, straight = false) {
  const my = H / 2;
  const h0 = normStart * H * 0.44 * layerScale;
  const h1 = normEnd * H * 0.44 * layerScale;
  if (straight) {
    return `M 0 ${my - h0} L ${segW} ${my - h1} L ${segW} ${my + h1} L 0 ${my + h0} Z`;
  }
  const cx = segW * 0.55;
  return `M 0 ${my - h0} C ${cx} ${my - h0}, ${segW - cx} ${my - h1}, ${segW} ${my - h1} L ${segW} ${my + h1} C ${segW - cx} ${my + h1}, ${cx} ${my + h0}, 0 ${my + h0} Z`;
}

function HRing({ d, color, fill, opacity, hovered, ringIndex, totalRings }) {
  const extraScale = 1 + (ringIndex / Math.max(totalRings - 1, 1)) * 0.12;
  const ringSpring = { stiffness: 300 - ringIndex * 60, damping: 24 - ringIndex * 3 };
  const scaleY = useSpring(1, ringSpring);
  useEffect(() => { scaleY.set(hovered ? extraScale : 1); }, [hovered, scaleY, extraScale]);
  return <motion.path d={d} fill={fill ?? color} opacity={opacity} style={{ scaleY, transformOrigin: 'center center' }} />;
}

function HSegment({ index, normStart, normEnd, segW, fullH, color, layers, staggerDelay, hovered, dimmed, straight, gradientStops }) {
  const gradientId = `funnel-h-grad-${index}`;
  const growProgress = useSpring(0, springConfig);
  const entranceScaleX = useTransform(growProgress, [0, 1], [0, 1]);
  const entranceScaleY = useTransform(growProgress, [0, 1], [0, 1]);
  const dimOpacity = useSpring(1, hoverSpring);

  useEffect(() => { dimOpacity.set(dimmed ? 0.4 : 1); }, [dimmed, dimOpacity]);
  useEffect(() => {
    const timeout = setTimeout(() => growProgress.set(1), index * staggerDelay * 1000);
    return () => clearTimeout(timeout);
  }, [growProgress, index, staggerDelay]);

  const rings = Array.from({ length: layers }, (_, l) => {
    const scale = 1 - (l / layers) * 0.35;
    const opacity = 0.18 + (l / (layers - 1 || 1)) * 0.65;
    return { d: hSegmentPath(normStart, normEnd, segW, fullH, scale, straight), opacity };
  });

  return (
    <motion.div className="pointer-events-none relative shrink-0 overflow-visible" style={{ width: segW, height: fullH, zIndex: hovered ? 10 : 1, opacity: dimOpacity }}>
      <motion.div className="absolute inset-0 overflow-visible" style={{ scaleX: entranceScaleX, scaleY: entranceScaleY, transformOrigin: 'left center' }}>
        <svg aria-hidden="true" className="absolute inset-0 h-full w-full overflow-visible" preserveAspectRatio="none" viewBox={`0 0 ${segW} ${fullH}`}>
          <defs>
            {gradientStops && (
              <linearGradient id={gradientId} x1="0" x2="1" y1="0" y2="0">
                {gradientStops.map((stop) => (
                  <stop key={`${stop.offset}-${stop.color}`} offset={typeof stop.offset === 'number' ? `${stop.offset * 100}%` : stop.offset} stopColor={stop.color} />
                ))}
              </linearGradient>
            )}
          </defs>
          {rings.map((r, i) => {
            const isInnermost = i === rings.length - 1;
            const ringFill = isInnermost && gradientStops ? `url(#${gradientId})` : undefined;
            return <HRing color={color} d={r.d} fill={ringFill} hovered={hovered} key={`h-ring-${i}`} opacity={r.opacity} ringIndex={i} totalRings={layers} />;
          })}
        </svg>
      </motion.div>
    </motion.div>
  );
}

function SegmentLabel({ stage, pct, showValues, showPercentage, showLabels, formatPercentage, formatValue, index, staggerDelay }) {
  const display = stage.displayValue ?? formatValue(stage.value);

  return (
    <motion.div
      animate={{ opacity: 1 }}
      className="absolute inset-0 flex flex-col items-center"
      initial={{ opacity: 0 }}
      transition={{ delay: index * staggerDelay + 0.25, duration: 0.35, ease: 'easeOut' }}
    >
      <div className="flex h-[16%] items-end justify-center pb-1">
        {showValues && <span className="whitespace-nowrap font-semibold text-sm" style={{ color: 'var(--text-primary)' }}>{display}</span>}
      </div>
      <div className="flex flex-1 items-center justify-center">
        {showPercentage && (
          <span className="rounded-full px-3 py-1 font-bold text-xs shadow-sm" style={{ background: 'var(--text-primary)', color: 'var(--bg-card)' }}>
            {formatPercentage(pct)}
          </span>
        )}
      </div>
      <div className="flex h-[16%] items-start justify-center pt-1">
        {showLabels && <span className="whitespace-nowrap font-medium text-xs" style={{ color: 'var(--text-muted)' }}>{stage.label}</span>}
      </div>
    </motion.div>
  );
}

export function FunnelChart({
  data,
  color = 'var(--accent)',
  layers = 3,
  className,
  style,
  showPercentage = true,
  showValues = true,
  showLabels = true,
  formatPercentage = fmtPct,
  formatValue = fmtVal,
  staggerDelay = 0.12,
  gap = 4,
  edges = 'curved',
}) {
  const ref = useRef(null);
  const [sz, setSz] = useState({ w: 0, h: 0 });
  const [hoveredIndex, setHoveredIndex] = useState(null);

  const measure = useCallback(() => {
    if (!ref.current) return;
    const { width: w, height: h } = ref.current.getBoundingClientRect();
    if (w > 0 && h > 0) setSz({ w, h });
  }, []);

  useEffect(() => {
    measure();
    const ro = new ResizeObserver(measure);
    if (ref.current) ro.observe(ref.current);
    return () => ro.disconnect();
  }, [measure]);

  if (!data.length) return null;
  const max = data[0].value || 1;
  const n = data.length;
  const norms = data.map((d) => d.value / max);
  const { w: W, h: H } = sz;
  const totalGap = gap * (n - 1);
  const segW = (W - totalGap) / n;

  return (
    <div className={cn('relative w-full select-none overflow-visible', className)} ref={ref} style={{ aspectRatio: '2.2 / 1', ...style }}>
      {W > 0 && H > 0 && (
        <>
          <div className="absolute inset-0 flex flex-row overflow-visible" style={{ gap }}>
            {data.map((stage, i) => {
              const normStart = norms[i] ?? 0;
              const normEnd = norms[Math.min(i + 1, n - 1)] ?? 0;
              const segColor = stage.color ?? color;
              return (
                <HSegment
                  key={stage.label}
                  color={segColor}
                  dimmed={hoveredIndex !== null && hoveredIndex !== i}
                  fullH={H}
                  gradientStops={stage.gradient}
                  hovered={hoveredIndex === i}
                  index={i}
                  layers={layers}
                  normEnd={normEnd}
                  normStart={normStart}
                  segW={segW}
                  staggerDelay={staggerDelay}
                  straight={edges === 'straight'}
                />
              );
            })}
          </div>

          {data.map((stage, i) => {
            const pct = (stage.value / max) * 100;
            const posStyle = { left: (segW + gap) * i, width: segW, top: 0, height: H };
            const isDimmed = hoveredIndex !== null && hoveredIndex !== i;
            return (
              <motion.div
                key={`lbl-${stage.label}`}
                animate={{ opacity: isDimmed ? 0.4 : 1 }}
                className="absolute cursor-pointer"
                onMouseEnter={() => setHoveredIndex(i)}
                onMouseLeave={() => setHoveredIndex(null)}
                style={{ ...posStyle, zIndex: 20 }}
                transition={{ type: 'spring', stiffness: 300, damping: 24 }}
              >
                <SegmentLabel
                  stage={stage}
                  pct={pct}
                  showValues={showValues}
                  showPercentage={showPercentage}
                  showLabels={showLabels}
                  formatPercentage={formatPercentage}
                  formatValue={formatValue}
                  index={i}
                  staggerDelay={staggerDelay}
                />
              </motion.div>
            );
          })}
        </>
      )}
    </div>
  );
}

export default FunnelChart;
