'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { differentiators } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { RevealText } from '@/components/RevealText';

type Differentiator = (typeof differentiators)[number];

function Item({ item, index }: { item: Differentiator; index: number }) {
  return (
    /*
     * Each item rises on its own as it scrolls in (the column is taller than the
     * viewport, so a single list-level trigger would animate the lower items off-screen).
     * Items that enter together still stagger via the small index-based delay.
     * Only y and opacity move, and nothing is clipped, so the observer sees it fine;
     * MotionConfig reducedMotion="user" drops the y for users who ask for less motion.
     */
    <motion.li
      initial={{ opacity: 0, y: 40 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -12% 0px' }}
      transition={{ duration: 0.9, ease: ease.out, delay: (index % 3) * 0.08 }}
      className="group relative border-b py-8 md:py-10"
    >
      <div className="grid grid-cols-[auto_1fr_auto] items-baseline gap-x-5 md:gap-x-8">
        {/* Marker: an electric-blue tick that stretches into a dash on hover. */}
        <span
          aria-hidden
          className="block h-1.5 w-6 -translate-y-[0.5em] origin-left scale-x-[0.25] rounded-full bg-spark-blue motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out group-hover:scale-x-100"
        />
        <h3 className="font-display text-[clamp(1.75rem,2.6vw,2.25rem)] leading-[1.05] tracking-[-0.02em] text-bone">
          {item.title}
        </h3>
        <span aria-hidden className="tabular font-mono text-eyebrow text-bone/40">
          {String(index + 1).padStart(2, '0')}
        </span>
        <p className="col-start-2 mt-3 max-w-[65ch] text-base leading-relaxed text-bone-muted md:mt-4 md:text-lg">
          {item.body}
        </p>
      </div>

      {/* Hover rule: a thin brand-gradient line draws across over the hairline.
          Reduced motion: no draw (no transform), it simply fades in. */}
      <span
        aria-hidden
        className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-spark opacity-0 motion-safe:scale-x-0 motion-safe:opacity-100 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-expo-out motion-safe:group-hover:scale-x-100 motion-reduce:transition-opacity motion-reduce:group-hover:opacity-100"
      />
    </motion.li>
  );
}

export function WhyUs() {
  // Observe the section itself (never clipped); the heading words animate from this.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px -30% 0px' });

  return (
    // No overflow-hidden here: it would break the sticky left column.
    <section ref={sectionRef} id="why-us" aria-labelledby="why-us-title" className="relative py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      <div className="mx-auto grid w-full max-w-site gap-12 px-gutter lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-32 lg:col-span-5 lg:self-start">
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: ease.out }}
            className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60"
          >
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spark-blue" />
            Why SparkCurv
          </motion.p>

          <h2 id="why-us-title" className="font-display text-display-md text-bone">
            <RevealText text="What every engagement" play={inView} />{' '}
            <RevealText
              text="includes."
              play={inView}
              delay={0.24}
              wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
            />
          </h2>

          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.45 }}
            className="mt-6 max-w-[36ch] text-lg leading-relaxed text-bone-muted md:mt-8 md:text-xl"
          >
            No setup fees. No onboarding costs. No surprises.
          </motion.p>

          <motion.p
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.6 }}
            className="tabular mt-10 font-mono text-eyebrow uppercase text-bone/50"
          >
            {String(differentiators.length).padStart(2, '0')} commitments &middot; every plan
          </motion.p>
        </div>

        <ul className="border-t lg:col-span-7 lg:col-start-6">
          {differentiators.map((item, i) => (
            <Item key={item.title} item={item} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
