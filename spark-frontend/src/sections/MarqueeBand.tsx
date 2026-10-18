'use client';

import { useRef } from 'react';
import {
  motion,
  useAnimationFrame,
  useInView,
  useMotionValue,
  useReducedMotion,
  useScroll,
  useSpring,
  useTransform,
  useVelocity,
} from 'framer-motion';
import { marqueeWords } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SparkGlyph } from '@/components/Wordmark';

/** Wraps v into [min, max): used to loop the marquee position forever. */
const wrap = (min: number, max: number, v: number) => {
  const range = max - min;
  return ((((v - min) % range) + range) % range) + min;
};

/**
 * One marquee row whose speed reacts to scrolling: scroll fast and it races,
 * scroll up and it flips direction. `baseVelocity` is in % of one copy per second.
 */
function VelocityRow({ words, baseVelocity, outline = false }: { words: string[]; baseVelocity: number; outline?: boolean }) {
  const rowRef = useRef<HTMLDivElement>(null);
  const inView = useInView(rowRef);
  const reduce = useReducedMotion();
  const baseX = useMotionValue(0);
  const { scrollY } = useScroll();
  const scrollVelocity = useVelocity(scrollY);
  const smoothVelocity = useSpring(scrollVelocity, { damping: 50, stiffness: 400 });
  const velocityFactor = useTransform(smoothVelocity, [0, 1000], [0, 4], { clamp: false });
  const direction = useRef(1);

  // The track holds two identical copies, so sliding between 0% and -50% loops seamlessly.
  const x = useTransform(baseX, (v) => `${wrap(-50, 0, v)}%`);

  useAnimationFrame((_, delta) => {
    if (reduce || !inView) return;
    if (velocityFactor.get() < 0) direction.current = -1;
    else if (velocityFactor.get() > 0) direction.current = 1;
    let move = direction.current * baseVelocity * (delta / 1000);
    move += move * Math.abs(velocityFactor.get());
    baseX.set(baseX.get() + move);
  });

  return (
    <div ref={rowRef} aria-hidden className="flex overflow-hidden whitespace-nowrap">
      <motion.div className="flex shrink-0" style={{ x }}>
        {[0, 1].map((copy) => (
          <div key={copy} className="flex shrink-0 items-center">
            {words.map((word) => (
              <span key={`${copy}-${word}`} className="flex items-center font-display text-display-lg">
                <span className={cn('px-[0.2em]', outline ? 'text-outline' : 'text-gradient animate-gradient-pan')}>{word}</span>
                <SparkGlyph className="mx-[0.25em] h-[0.32em] w-[0.32em]" />
              </span>
            ))}
          </div>
        ))}
      </motion.div>
    </div>
  );
}

export function MarqueeBand() {
  // The band starts as a thin slit; visibility is measured on the unclipped section.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.3 });

  return (
    <section ref={sectionRef} aria-labelledby="marquee-title" className="relative overflow-hidden py-10 md:py-16">
      <h2 id="marquee-title" className="sr-only">
        Technologies we work with
      </h2>
      <ul className="sr-only">
        {marqueeWords.map((w) => (
          <li key={w}>{w}</li>
        ))}
      </ul>

      {/* Clip-path reveal: the band opens from a thin slit as it scrolls into view. */}
      <motion.div
        initial={{ clipPath: 'inset(48% 0% 48% 0%)' }}
        animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: 1.3, ease: ease.inOut }}
        className="-mx-[5vw] w-[110vw] -rotate-[3deg] border-y bg-ink-800/70 py-6 md:py-10"
      >
        <VelocityRow words={marqueeWords} baseVelocity={-1.4} />
        <VelocityRow words={[...marqueeWords].reverse()} baseVelocity={1.1} outline />
      </motion.div>
    </section>
  );
}
