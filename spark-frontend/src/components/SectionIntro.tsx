'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { RevealText } from './RevealText';

type SectionIntroProps = {
  /** id for the h2, so the section can use aria-labelledby. */
  id: string;
  eyebrow: string;
  /** Plain part of the heading, then the gradient accent (either may be empty). */
  lead: string;
  accent: string;
  /** Optional paragraph under the heading. */
  body?: React.ReactNode;
  /** Optional element on the right (a link, a count…), bottom-aligned with the heading. */
  aside?: React.ReactNode;
  dot?: 'blue' | 'silver';
  className?: string;
};

/**
 * The section opener used across the site: a mono eyebrow with a brand dot, then a
 * display heading whose words rise into place, the last part in the brand gradient.
 * It watches itself (never clipped), so the reveal fires reliably.
 */
export function SectionIntro({ id, eyebrow, lead, accent, body, aside, dot = 'blue', className }: SectionIntroProps) {
  const ref = useRef<HTMLDivElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -20% 0px' });
  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 16 },
    animate: inView ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.8, ease: ease.out, delay },
  });

  return (
    <div ref={ref} className={cn('grid gap-8 md:grid-cols-12 md:items-end', className)}>
      <div className={aside ? 'md:col-span-8' : 'md:col-span-12'}>
        <motion.p {...fade(0)} className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
          <span aria-hidden className={cn('h-1.5 w-1.5 rounded-full', dot === 'blue' ? 'bg-spark-blue' : 'bg-spark-silver')} />
          {eyebrow}
        </motion.p>
        <h2 id={id} className="font-display text-display-md text-bone">
          {lead && <RevealText text={lead} play={inView} />}
          {lead && accent && ' '}
          {accent && (
            <RevealText
              text={accent}
              play={inView}
              delay={lead ? 0.16 + lead.split(' ').length * 0.04 : 0}
              wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
            />
          )}
        </h2>
        {body && (
          <motion.div {...fade(0.35)} className="mt-6 max-w-[52ch] text-lg leading-relaxed text-bone-muted md:mt-8">
            {body}
          </motion.div>
        )}
      </div>
      {aside && (
        <motion.div {...fade(0.35)} className="md:col-span-4 md:text-right">
          {aside}
        </motion.div>
      )}
    </div>
  );
}
