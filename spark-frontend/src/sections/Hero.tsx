'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { hero } from '@/lib/content';
import { RevealText } from '@/components/RevealText';
import { AccentField } from '@/components/AccentField';
import { CTAButton } from '@/components/CTAButton';
import { HeroVisual } from './hero/HeroVisual';
import { StatusTicker } from './hero/StatusTicker';

export function Hero() {
  const introDone = useUI((s) => s.introDone);
  const fadeUp = (delay: number) => ({
    initial: { opacity: 0, y: 24 },
    animate: introDone ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 1, ease: ease.out, delay },
  });
  // The intro copy only slides (no fade): text at opacity 0 doesn't
  // count as painted, which held back Largest Contentful Paint on phones (where this
  // paragraph is the largest element). It sits under the preloader until the intro ends.
  const riseUp = (delay: number) => ({
    initial: { y: 24 },
    animate: introDone ? { y: 0 } : undefined,
    transition: { duration: 1, ease: ease.out, delay },
  });

  return (
    <section id="top" aria-labelledby="hero-title" className="relative isolate flex min-h-[100svh] flex-col overflow-hidden">
      <AccentField className="-z-20" />
      <HeroVisual play={introDone} />

      <div className="relative mx-auto flex w-full max-w-site flex-1 flex-col justify-end px-gutter pb-28 pt-28 md:pb-32">
        <motion.p {...fadeUp(0.05)} className="mb-6 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60 md:mb-8">
          <span className="h-1.5 w-1.5 rounded-full bg-spark-blue" />
          {hero.eyebrow}
        </motion.p>

        {/* One flush-left block, sized so the longest line ("We engineer") takes about half
            the width on desktop and leaves the right side to the network sphere. */}
        <h1 id="hero-title" className="max-w-[11ch] font-display text-[clamp(3rem,8.4vw,9.5rem)] leading-[0.9] tracking-[-0.03em] text-bone">
          {hero.headline.map((line, i) => (
            <span key={line.text} className="block">
              <RevealText
                text={line.text}
                play={introDone}
                delay={0.08 + i * 0.14}
                wordClassName={line.accent ? 'text-gradient animate-gradient-pan pr-[0.06em] font-light' : undefined}
              />
            </span>
          ))}
        </h1>

        <div className="mt-10 grid gap-10 md:mt-14 md:grid-cols-12 md:items-end">
          <motion.div {...riseUp(0.75)} className="md:col-span-5">
            <p className="max-w-[40ch] text-base leading-relaxed text-bone md:text-lg md:text-bone-muted">{hero.intro}</p>
            {/* Once this scrolls out of view, a compact copy appears in the header (HomeHeader). */}
            <div className="mt-8 flex flex-wrap items-center gap-x-8 gap-y-5">
              <div id="hero-cta">
                <CTAButton size="lg" />
              </div>
              <Link
                href={hero.secondaryCta.href}
                className="group relative inline-flex items-center gap-2 pb-1 text-base text-bone/80 transition-colors hover:text-bone md:text-lg"
              >
                {hero.secondaryCta.label}
                <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                  →
                </span>
                <span
                  aria-hidden
                  className="absolute inset-x-0 bottom-0 h-px origin-right bg-spark motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out motion-safe:group-hover:origin-left motion-safe:group-hover:scale-x-100"
                />
              </Link>
            </div>
          </motion.div>
        </div>
      </div>

      <StatusTicker />
    </section>
  );
}
