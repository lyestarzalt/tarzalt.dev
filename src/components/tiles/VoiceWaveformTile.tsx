import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BAR_COUNT = 40;

function VoiceWaveformTileImpl() {
  const reduced = useReducedMotion();
  const bars = useMemo(
    () =>
      Array.from({ length: BAR_COUNT }, (_, i) => ({
        i,
        h: 0.18 + 0.7 * Math.abs(Math.sin(i * 1.7)),
        delay: (i % 7) * 0.18,
      })),
    [],
  );

  return (
    <div className="absolute inset-0 flex flex-col justify-between">
      <div className="p-5">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          voice agent · listening
        </p>
        <p className="mt-0.5 font-heading text-xl font-normal text-foreground sm:text-2xl">
          AI Voice Agent
        </p>
      </div>

      <div className="flex h-20 items-end justify-center gap-[3px] px-6">
        {bars.map((b) => (
          <motion.span
            key={b.i}
            aria-hidden="true"
            className="block w-[3px] rounded-full bg-primary/80"
            style={{ transformOrigin: '50% 50%', height: `${b.h * 100}%` }}
            animate={reduced ? { scaleY: 0.5 } : { scaleY: [0.4, 1, 0.6, 1, 0.5] }}
            transition={
              reduced
                ? undefined
                : {
                    duration: 1.6,
                    ease: 'easeInOut',
                    repeat: Infinity,
                    delay: b.delay,
                  }
            }
          />
        ))}
      </div>

      <div className="flex items-center justify-between px-5 pb-5 font-mono text-[0.625rem] text-muted-foreground/60">
        <span>real-time supervisor dashboard</span>
        <span className="tabular-nums">1.4k calls</span>
      </div>
    </div>
  );
}

export const VoiceWaveformTile = memo(VoiceWaveformTileImpl);
