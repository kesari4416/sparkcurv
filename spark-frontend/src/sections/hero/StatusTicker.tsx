'use client';

import { commitments, site } from '@/lib/content';
import { useClock } from '@/hooks/useClock';
import { SparkGlyph } from '@/components/Wordmark';

/**
 * Strip at the bottom of the hero: SparkCurv's service commitments plus local time in
 * India. Scrolls as a CSS marquee (compositor-only) and pauses on hover; the reduced-motion
 * rule in globals.css stops it.
 */
export function StatusTicker() {
  const time = useClock(site.timeZone);
  const items = [...commitments, { label: `Local time ${site.timeZoneLabel}`, value: time || '--:--:--' }];

  // Each half of the track holds the list twice, so one half is always wider than the
  // screen; the track then slides by exactly -50% for a seamless loop.
  const half = (copy: number) => (
    <div aria-hidden={copy > 0} className="flex shrink-0 items-center">
      {[...items, ...items].map((item, i) => (
        <span key={`${copy}-${i}`} className="flex shrink-0 items-center gap-3 pr-10 font-mono text-[11px] uppercase tracking-[0.16em]">
          <span className="text-bone/60">{item.label}</span>
          <span className="tabular text-bone">{item.value}</span>
          <SparkGlyph className="ml-7 h-2.5 w-2.5 opacity-70" />
        </span>
      ))}
    </div>
  );

  return (
    <div className="glass absolute inset-x-0 bottom-0 z-10 border-x-0 border-b-0">
      <ul className="sr-only">
        {commitments.map((c) => (
          <li key={c.label}>
            {c.label}: {c.value}
          </li>
        ))}
      </ul>
      <div className="group flex overflow-hidden py-3.5">
        <div className="flex shrink-0 animate-marquee group-hover:[animation-play-state:paused]" suppressHydrationWarning>
          {half(0)}
          {half(1)}
        </div>
      </div>
    </div>
  );
}
