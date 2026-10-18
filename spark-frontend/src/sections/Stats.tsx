'use client';

import { useEffect, useLayoutEffect, useRef } from 'react';
import { animate, motion, useInView } from 'framer-motion';
import { stats } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';

type Stat = (typeof stats)[number];

const COUNT_DURATION = 1.6;
const STAGGER = 0.12;

function StatItem({ stat, index, play }: { stat: Stat; index: number; play: boolean }) {
  const digitsRef = useRef<HTMLSpanElement>(null);

  // The server renders the final value (no-JS and crawlers see real numbers). Before the
  // first paint on the client we zero it, unless the user prefers reduced motion.
  useLayoutEffect(() => {
    if (digitsRef.current && !prefersReducedMotion()) digitsRef.current.textContent = '0';
  }, []);

  /*
   * Count-up: framer's animate() tweens a plain number from 0 to the target with the
   * shared ease-out curve, and each frame writes the rounded value straight into the
   * span's textContent. No React state, so no re-render per frame. The digits span has
   * a fixed width in `ch` (tabular figures are all 1ch wide), so the suffix never jitters
   * as the number gains digits.
   */
  useEffect(() => {
    const el = digitsRef.current;
    if (!play || !el) return;
    if (prefersReducedMotion()) {
      el.textContent = String(stat.value);
      return;
    }
    const controls = animate(0, stat.value, {
      duration: COUNT_DURATION,
      ease: ease.out,
      delay: 0.15 + index * STAGGER,
      onUpdate: (v) => {
        el.textContent = String(Math.round(v));
      },
    });
    return () => controls.stop();
  }, [play, stat.value, index]);

  return (
    <li
      className={cn(
        'relative px-4 py-10 md:px-8 md:py-14',
        // Hairlines: 2x2 on mobile (left rule on the right column, top rule on the second row),
        // one row of four on desktop (left rule on every stat after the first).
        index % 2 === 1 && 'border-l',
        index >= 2 && 'border-t lg:border-t-0',
        index === 2 && 'lg:border-l',
      )}
    >
      <span className="sr-only">
        {stat.value}
        {stat.suffix} {stat.label}
      </span>

      {/* Vertical scale-up: the figure rises out of a mask, stretched from the baseline. */}
      <span aria-hidden className="-mb-[0.08em] block overflow-hidden pb-[0.08em]">
        <motion.span
          initial={{ y: '60%', scaleY: 0.4, opacity: 0 }}
          animate={play ? { y: '0%', scaleY: 1, opacity: 1 } : undefined}
          transition={{ duration: 1.2, ease: ease.out, delay: index * STAGGER }}
          className="tabular block origin-bottom whitespace-nowrap font-display text-display-lg"
        >
          <span className="text-gradient animate-gradient-pan pr-[0.06em]">
            {/* innerHTML rather than a React text child: the count-up rewrites this node's
                textContent, so React must not own a text node inside it. */}
            <span
              ref={digitsRef}
              className="inline-block text-right"
              style={{ minWidth: `${String(stat.value).length}ch` }}
              dangerouslySetInnerHTML={{ __html: String(stat.value) }}
            />
            {stat.suffix}
          </span>
        </motion.span>
      </span>

      <motion.span
        aria-hidden
        initial={{ opacity: 0, y: 12 }}
        animate={play ? { opacity: 1, y: 0 } : undefined}
        transition={{ duration: 0.8, ease: ease.out, delay: 0.3 + index * STAGGER }}
        className="mt-4 block font-mono text-eyebrow uppercase text-bone-muted md:mt-6"
      >
        {stat.label}
      </motion.span>
    </li>
  );
}

export function Stats() {
  // Observe the (unclipped) section, not the band: the band starts fully clipped, and
  // Chromium counts an element's own clip-path when measuring visibility, so it would
  // never be reported as in view.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} aria-labelledby="stats-title" className="relative py-20 md:py-24 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      <div className="mx-auto w-full max-w-site px-gutter">
        <h2
          id="stats-title"
          className="mb-10 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60 md:mb-14"
        >
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spark-silver" />
          By the numbers
        </h2>

        {/* Section transition: the band wipes open from its horizontal centre line. */}
        <motion.div
          initial={{ clipPath: 'inset(50% 0% 50% 0%)' }}
          // clip-path is dropped once open so it never clips focus rings or later effects.
          animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } } : undefined}
          transition={{ duration: 1.1, ease: ease.inOut }}
          className="border-y"
        >
          <ul className="grid grid-cols-2 lg:grid-cols-4">
            {stats.map((stat, i) => (
              <StatItem key={stat.label} stat={stat} index={i} play={inView} />
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
