import { memo } from 'react';
import { motion, useReducedMotion } from 'framer-motion';

const RATES = [
  { pair: 'EUR / DZD', value: '270.42', delta: '+0.18' },
  { pair: 'USD / DZD', value: '249.91', delta: '-0.07' },
  { pair: 'GBP / DZD', value: '317.55', delta: '+0.22' },
  { pair: 'CAD / DZD', value: '184.06', delta: '+0.04' },
  { pair: 'CHF / DZD', value: '281.78', delta: '-0.11' },
  { pair: 'AED / DZD', value: '68.04', delta: '+0.01' },
] as const;

function Row() {
  return (
    <div className="flex shrink-0 items-center gap-7 px-3 font-mono text-sm">
      {RATES.map((r) => (
        <span key={r.pair} className="flex items-baseline gap-2 whitespace-nowrap">
          <span className="text-[0.6875rem] text-muted-foreground/60">{r.pair}</span>
          <span className="tabular-nums text-foreground">{r.value}</span>
          <span
            className={`tabular-nums text-[0.6875rem] ${
              r.delta.startsWith('+') ? 'text-primary' : 'text-muted-foreground/70'
            }`}
          >
            {r.delta}
          </span>
        </span>
      ))}
    </div>
  );
}

function DinarTickerTileImpl() {
  const reduced = useReducedMotion();
  return (
    <div className="absolute inset-0 flex flex-col justify-between">
      <div className="p-5">
        <p className="font-mono text-[0.625rem] uppercase tracking-[0.2em] text-muted-foreground/70">
          dinar échange · sample
        </p>
        <p className="mt-0.5 font-heading text-xl font-normal text-foreground sm:text-2xl">
          Dinar Échange
        </p>
      </div>

      <div className="relative overflow-hidden py-4">
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 left-0 z-10 w-12 bg-gradient-to-r from-card to-transparent"
        />
        <div
          aria-hidden="true"
          className="pointer-events-none absolute inset-y-0 right-0 z-10 w-12 bg-gradient-to-l from-card to-transparent"
        />
        <motion.div
          className="flex"
          animate={reduced ? undefined : { x: ['0%', '-50%'] }}
          transition={reduced ? undefined : { duration: 32, ease: 'linear', repeat: Infinity }}
        >
          <Row />
          <Row />
        </motion.div>
      </div>

      <div className="px-5 pb-5 font-mono text-[0.625rem] text-muted-foreground/60">
        parallel-market rates · v1.4.8
      </div>
    </div>
  );
}

export const DinarTickerTile = memo(DinarTickerTileImpl);
