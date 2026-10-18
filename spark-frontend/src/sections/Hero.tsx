'use client';

import { motion } from 'framer-motion';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { hero } from '@/lib/content';
import { cn } from '@/lib/cn';
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

        <h1 id="hero-title" className="font-display text-display-xl text-bone">
          {hero.headline.map((line, i) => (
            <span key={line.text} className={cn('block', line.indent && 'pl-[0.55em] md:pl-[1.3em]')}>
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
            <div id="hero-cta" className="mt-8">
              <CTAButton size="lg" />
            </div>
          </motion.div>
        </div>
      </div>

      <StatusTicker />
    </section>
  );
}
