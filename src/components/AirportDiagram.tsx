import {
  memo,
  useCallback,
  useEffect,
  useMemo,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
  type WheelEvent as ReactWheelEvent,
} from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import {
  LFMN_BOUNDARY,
  LFMN_LINEARS,
  LFMN_PAVEMENT,
  LFMN_RUNWAYS,
  LFMN_VIEWBOX,
} from '@/data/lfmn';

interface AirportDiagramProps {
  /**
   * `compact` — homepage tile: animated runway draw-on, no interaction, lighter detail.
   * `interactive` — full view with pan/zoom, all linear features visible.
   */
  variant: 'compact' | 'interactive';
  className?: string;
  /** Show the LFMN label + caption overlay. */
  showCaption?: boolean;
}

const RUNWAY_LABELS = [
  // Endpoints (lon, lat) approximated for label placement.
  // Hardcoded from the LFMN apt.dat row 100 records — the data file doesn't carry labels.
  { id: '04R/22L' },
  { id: '04L/22R' },
];

/**
 * LFMN Nice Côte d'Azur — geometry parsed from X-Plane's apt.dat.
 *
 * Compact mode is read-only and animates the runway draw-on for the homepage tile.
 * Interactive mode supports pan (drag) and zoom (wheel / buttons), used on project + blog pages.
 */
function AirportDiagramImpl({ variant, className, showCaption = true }: AirportDiagramProps) {
  const reduced = useReducedMotion();
  const isInteractive = variant === 'interactive';
  const containerRef = useRef<HTMLDivElement>(null);
  const inView = useInView(containerRef, { once: true, amount: 0.2 });
  const baseVB = LFMN_VIEWBOX;

  // Load-in choreography. Plays once when the diagram scrolls into view.
  // Compact mode (homepage) loops a quieter version; interactive plays once and stays.
  const animate = inView && !reduced;

  const [vb, setVb] = useState(baseVB);
  const [isPanning, setIsPanning] = useState(false);
  const panRef = useRef<{ startX: number; startY: number; startVB: typeof baseVB } | null>(null);

  const resetView = useCallback(() => setVb(baseVB), [baseVB]);

  // Wheel zoom centred on the cursor.
  const onWheel = useCallback(
    (e: ReactWheelEvent<SVGSVGElement>) => {
      if (!isInteractive) return;
      e.preventDefault();
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const px = (e.clientX - rect.left) / rect.width;
      const py = (e.clientY - rect.top) / rect.height;
      const factor = Math.exp(-e.deltaY * 0.0015);
      setVb((prev) => {
        const newW = Math.max(prev.width * factor, baseVB.width * 0.05);
        const newH = Math.max(prev.height * factor, baseVB.height * 0.05);
        // Clamp zoom-out to original
        const clampedW = Math.min(newW, baseVB.width);
        const clampedH = Math.min(newH, baseVB.height);
        const cx = prev.x + prev.width * px;
        const cy = prev.y + prev.height * py;
        return {
          x: cx - clampedW * px,
          y: cy - clampedH * py,
          width: clampedW,
          height: clampedH,
        };
      });
    },
    [isInteractive, baseVB.width, baseVB.height],
  );

  const onPointerDown = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!isInteractive) return;
      e.currentTarget.setPointerCapture(e.pointerId);
      setIsPanning(true);
      panRef.current = { startX: e.clientX, startY: e.clientY, startVB: vb };
    },
    [isInteractive, vb],
  );

  const onPointerMove = useCallback(
    (e: ReactPointerEvent<SVGSVGElement>) => {
      if (!isPanning || !panRef.current) return;
      const svg = e.currentTarget;
      const rect = svg.getBoundingClientRect();
      const dx = ((e.clientX - panRef.current.startX) / rect.width) * panRef.current.startVB.width;
      const dy =
        ((e.clientY - panRef.current.startY) / rect.height) * panRef.current.startVB.height;
      setVb({
        ...panRef.current.startVB,
        x: panRef.current.startVB.x - dx,
        y: panRef.current.startVB.y - dy,
      });
    },
    [isPanning],
  );

  const onPointerUp = useCallback((e: ReactPointerEvent<SVGSVGElement>) => {
    e.currentTarget.releasePointerCapture(e.pointerId);
    setIsPanning(false);
    panRef.current = null;
  }, []);

  // Keyboard support for accessibility.
  useEffect(() => {
    if (!isInteractive) return;
    const el = containerRef.current;
    if (!el) return;
    const onKey = (e: KeyboardEvent) => {
      if (document.activeElement !== el) return;
      const step = vb.width * 0.05;
      if (e.key === 'ArrowLeft') setVb((p) => ({ ...p, x: p.x - step }));
      else if (e.key === 'ArrowRight') setVb((p) => ({ ...p, x: p.x + step }));
      else if (e.key === 'ArrowUp') setVb((p) => ({ ...p, y: p.y - step }));
      else if (e.key === 'ArrowDown') setVb((p) => ({ ...p, y: p.y + step }));
      else if (e.key === '+' || e.key === '=')
        setVb((p) => ({ ...p, width: p.width * 0.85, height: p.height * 0.85 }));
      else if (e.key === '-' || e.key === '_')
        setVb((p) => ({
          x: p.x,
          y: p.y,
          width: Math.min(p.width / 0.85, baseVB.width),
          height: Math.min(p.height / 0.85, baseVB.height),
        }));
      else if (e.key === '0' || e.key === 'r') setVb(baseVB);
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [isInteractive, vb, baseVB]);

  const viewBoxStr = `${vb.x} ${vb.y} ${vb.width} ${vb.height}`;
  const zoomPct = Math.round((baseVB.width / vb.width) * 100);

  // For compact mode, only show some linears (every Nth path) to keep render light.
  const linears = useMemo(() => {
    if (variant === 'compact') return LFMN_LINEARS.filter((_, i) => i % 3 === 0);
    return LFMN_LINEARS;
  }, [variant]);

  return (
    <div
      ref={containerRef}
      tabIndex={isInteractive ? 0 : -1}
      className={`relative size-full ${className ?? ''}`}
      role={isInteractive ? 'application' : undefined}
      aria-label={
        isInteractive
          ? 'Interactive LFMN airport diagram. Drag to pan, scroll to zoom.'
          : "LFMN Nice Côte d'Azur airport diagram"
      }
    >
      {/* Grid background */}
      <div
        aria-hidden="true"
        className="absolute inset-0 opacity-[0.05]"
        style={{
          backgroundImage:
            'linear-gradient(to right, currentColor 1px, transparent 1px), linear-gradient(to bottom, currentColor 1px, transparent 1px)',
          backgroundSize: '32px 32px',
        }}
      />

      <svg
        viewBox={viewBoxStr}
        preserveAspectRatio="xMidYMid meet"
        className={`absolute inset-0 size-full text-foreground ${
          isInteractive ? (isPanning ? 'cursor-grabbing' : 'cursor-grab') : ''
        }`}
        style={{ touchAction: isInteractive ? 'none' : 'auto' }}
        onWheel={isInteractive ? onWheel : undefined}
        onPointerDown={isInteractive ? onPointerDown : undefined}
        onPointerMove={isInteractive ? onPointerMove : undefined}
        onPointerUp={isInteractive ? onPointerUp : undefined}
        onPointerCancel={isInteractive ? onPointerUp : undefined}
      >
        {/* Boundary — draws first */}
        {LFMN_BOUNDARY.map((d, i) => (
          <motion.path
            key={`b-${i}`}
            d={d}
            fill="currentColor"
            stroke="currentColor"
            strokeWidth={4}
            vectorEffect="non-scaling-stroke"
            initial={animate ? { pathLength: 0, fillOpacity: 0, strokeOpacity: 0 } : false}
            animate={
              animate
                ? { pathLength: 1, fillOpacity: 0.04, strokeOpacity: 0.18 }
                : { fillOpacity: 0.04, strokeOpacity: 0.18 }
            }
            transition={animate ? { duration: 1.4, ease: 'easeInOut' } : undefined}
          />
        ))}

        {/* Pavement — fades in after boundary starts drawing */}
        <motion.g
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={animate ? { duration: 0.9, delay: 0.8, ease: 'easeOut' } : undefined}
        >
          {LFMN_PAVEMENT.map((d, i) => (
            <path
              key={`p-${i}`}
              d={d}
              fill="currentColor"
              fillOpacity={0.13}
              stroke="currentColor"
              strokeOpacity={0.22}
              strokeWidth={1}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.g>

        {/* Linear features (painted markings) — staggered fade in groups */}
        <motion.g
          initial={animate ? { opacity: 0 } : false}
          animate={{ opacity: 1 }}
          transition={animate ? { duration: 1.6, delay: 1.4, ease: 'easeOut' } : undefined}
        >
          {linears.map((d, i) => (
            <path
              key={`l-${i}`}
              d={d}
              fill="none"
              stroke="currentColor"
              strokeOpacity={0.32}
              strokeWidth={0.6}
              vectorEffect="non-scaling-stroke"
            />
          ))}
        </motion.g>

        {/* Runways — primary colour, the finale: draws last with a strong line, then fills */}
        <g className="text-primary">
          {LFMN_RUNWAYS.map((d, i) => (
            <motion.path
              key={`r-${i}`}
              d={d}
              fill="currentColor"
              stroke="currentColor"
              strokeWidth={4}
              vectorEffect="non-scaling-stroke"
              initial={animate ? { pathLength: 0, fillOpacity: 0, strokeOpacity: 0 } : false}
              animate={
                animate
                  ? { pathLength: 1, fillOpacity: 0.95, strokeOpacity: 1 }
                  : { fillOpacity: 0.95, strokeOpacity: 1 }
              }
              transition={
                animate
                  ? {
                      duration: 1.2,
                      delay: 2.6 + i * 0.25,
                      ease: 'easeInOut',
                    }
                  : undefined
              }
            />
          ))}
        </g>
      </svg>

      {/* Caption overlay */}
      {showCaption && (
        <div className="pointer-events-none absolute bottom-4 left-5 right-5 flex items-end justify-between">
          <div>
            <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground/70">
              LFMN · Nice Côte d&rsquo;Azur · {RUNWAY_LABELS.length} runways
            </p>
            {variant === 'compact' && (
              <p className="mt-0.5 font-heading text-xl font-normal text-foreground sm:text-2xl">
                X-Dispatch
              </p>
            )}
          </div>
          {variant === 'compact' && (
            <span className="hidden font-mono text-[0.625rem] tabular-nums text-muted-foreground/70 sm:inline">
              14k+ downloads
            </span>
          )}
        </div>
      )}

      {/* Zoom controls — interactive only */}
      {isInteractive && (
        <div className="pointer-events-auto absolute right-4 top-4 flex flex-col overflow-hidden rounded-lg border border-border bg-card/70 backdrop-blur-sm">
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVb((p) => ({ ...p, width: p.width * 0.8, height: p.height * 0.8 }));
            }}
            className="flex size-8 items-center justify-center text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:bg-accent"
            aria-label="Zoom in"
          >
            +
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              setVb((p) => ({
                x: p.x,
                y: p.y,
                width: Math.min(p.width / 0.8, baseVB.width),
                height: Math.min(p.height / 0.8, baseVB.height),
              }));
            }}
            className="flex size-8 items-center justify-center border-t border-border text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:bg-accent"
            aria-label="Zoom out"
          >
            −
          </button>
          <button
            type="button"
            onClick={(e) => {
              e.stopPropagation();
              resetView();
            }}
            className="flex size-8 items-center justify-center border-t border-border font-mono text-[0.625rem] text-foreground transition-colors hover:bg-accent focus-visible:outline-none focus-visible:bg-accent"
            aria-label="Reset view"
          >
            R
          </button>
        </div>
      )}

      {/* Zoom indicator */}
      {isInteractive && (
        <div className="pointer-events-none absolute left-4 top-4 rounded-md border border-border bg-card/70 px-2 py-1 font-mono text-[0.625rem] tabular-nums text-muted-foreground/70 backdrop-blur-sm">
          {zoomPct}%
        </div>
      )}

      {/* Hint */}
      {isInteractive && (
        <div className="pointer-events-none absolute bottom-4 right-4 hidden rounded-md border border-border bg-card/70 px-2.5 py-1 font-mono text-[0.625rem] text-muted-foreground/60 backdrop-blur-sm sm:block">
          drag · scroll to zoom · arrows + / − / r
        </div>
      )}
    </div>
  );
}

export const AirportDiagram = memo(AirportDiagramImpl);
