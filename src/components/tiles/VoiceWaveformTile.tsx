import { memo, useMemo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const BAR_COUNT = 40;

/**
 * Deterministic pseudo-random in [0, 1). Same input always returns the same
 * output, so the waveform is consistent across renders and SSR.
 */
function rng(seed: number) {
  const x = Math.sin(seed * 12.9898 + 78.233) * 43758.5453;
  return x - Math.floor(x);
}

interface Bar {
  i: number;
  /** Unique amplitude keyframes — each bar dances on its own schedule */
  keyframes: number[];
  /** Per-bar duration so bars don't lock-step */
  duration: number;
  /** Starting offset so they don't all begin at the same point */
  delay: number;
}

function VoiceWaveformTileImpl() {
  const reduced = useReducedMotion();

  const bars = useMemo<Bar[]>(() => {
    return Array.from({ length: BAR_COUNT }, (_, i) => {
      // Centre bars are biased louder (matches frequency-domain peaks
      // typical of speech in the mid range).
      const distFromCentre = Math.abs(i - BAR_COUNT / 2) / (BAR_COUNT / 2);
      const centreBias = 1 - 0.45 * distFromCentre;

      // 7 unique keyframes per bar, each in [0.05, 1.0], scaled by centre bias.
      const keyframes = Array.from({ length: 7 }, (_, k) => {
        const r = rng(i * 31 + k * 7);
        return Math.max(0.05, Math.min(1, r * centreBias));
      });

      // Cycle 0.9–2.4s — fast bars next to slow ones for chaos.
      const duration = 0.9 + rng(i * 17) * 1.5;
      const delay = rng(i * 53) * -duration; // negative delay = staggered start

      return { i, keyframes, duration, delay };
    });
  }, []);

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

      <div className="flex h-20 items-center justify-center gap-[3px] px-6">
        {bars.map((b) => (
          <motion.span
            key={b.i}
            aria-hidden="true"
            className="block w-[3px] rounded-full bg-primary/80"
            style={{
              transformOrigin: '50% 50%',
              // Render at full container height; scaleY drives the amplitude.
              height: '100%',
            }}
            animate={reduced ? { scaleY: 0.4 } : { scaleY: b.keyframes }}
            transition={
              reduced
                ? undefined
                : {
                    duration: b.duration,
                    ease: 'easeOut',
                    repeat: Infinity,
                    repeatType: 'mirror',
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
