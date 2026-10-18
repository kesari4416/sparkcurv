'use client';

import Image from 'next/image';
import Link from 'next/link';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store';
import { ease, palette } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { RevealText } from '@/components/RevealText';

export type Crumb = { label: string; href?: string };

type PageHeroProps = {
  eyebrow: string;
  /** Heading: plain lead, then the accent in the brand gradient. */
  lead: string;
  accent: string;
  description?: React.ReactNode;
  crumbs: Crumb[];
  image?: string;
  /** Small label over the image, e.g. "02 / 06". */
  imageLabel?: string;
  /** Buttons or links under the description. */
  actions?: React.ReactNode;
  /** Anything else under the hero grid (stats, meta). */
  children?: React.ReactNode;
};

/**
 * Opener for every inner page: breadcrumb, a large two-part headline that rises in word by
 * word, the intro paragraph and, when there is one, a picture uncovered from the bottom.
 * A field of dots and the three brand glows sit behind it (CSS only).
 */
export function PageHero({ eyebrow, lead, accent, description, crumbs, image, imageLabel, actions, children }: PageHeroProps) {
  const play = useUI((s) => s.introDone);
  const words = (lead ? lead.split(' ').length : 0) + accent.split(' ').length;
  const after = 0.25 + words * 0.07; // when the headline has finished rising

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: play ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: ease.out, delay },
  });

  return (
    <section aria-labelledby="page-title" className="relative isolate overflow-hidden pb-16 pt-32 md:pb-24 md:pt-44">
      {/* Backdrop: dot field fading out downwards, plus the brand glows. */}
      <div aria-hidden className="pointer-events-none absolute inset-0 -z-10">
        <div
          className="absolute inset-0 opacity-50 [mask-image:radial-gradient(70%_60%_at_70%_20%,black,transparent)]"
          style={{ backgroundImage: 'radial-gradient(rgb(var(--bone) / 0.16) 1px, transparent 1px)', backgroundSize: '28px 28px' }}
        />
        <div
          className="absolute inset-0"
          style={{
            background: [
              `radial-gradient(40% 45% at 85% 10%, ${palette.spark.royal}40, transparent 70%)`,
              `radial-gradient(30% 35% at 60% 0%, ${palette.spark.blue}26, transparent 70%)`,
            ].join(', '),
          }}
        />
      </div>

      <div className="mx-auto max-w-site px-gutter">
        <motion.nav {...fade(0)} aria-label="Breadcrumb" className="mb-8 md:mb-12">
          <ol className="flex flex-wrap items-center gap-x-2 gap-y-1 font-mono text-eyebrow uppercase text-bone/50">
            {crumbs.map((c, i) => (
              <li key={c.label} className="flex items-center gap-2">
                {i > 0 && <span aria-hidden className="text-bone/30">/</span>}
                {c.href ? (
                  <Link href={c.href} className="transition-colors hover:text-bone">
                    {c.label}
                  </Link>
                ) : (
                  <span aria-current="page" className="text-bone/80">
                    {c.label}
                  </span>
                )}
              </li>
            ))}
          </ol>
        </motion.nav>

        <motion.p {...fade(0.1)} className="mb-6 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-spark-blue" />
          {eyebrow}
        </motion.p>

        <h1
          id="page-title"
          className="max-w-[16ch] font-display text-[clamp(2.4rem,7.2vw,7.5rem)] leading-[0.95] tracking-[-0.025em] text-bone [hyphens:auto] [overflow-wrap:break-word]"
        >
          {lead && <RevealText text={lead} play={play} delay={0.15} stagger={0.07} />}
          {lead && ' '}
          <RevealText
            text={accent}
            play={play}
            delay={0.15 + (lead ? lead.split(' ').length : 0) * 0.07}
            stagger={0.07}
            wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
          />
        </h1>

        <div className={cn('mt-12 grid gap-12 md:mt-16 lg:grid-cols-12 lg:gap-8', !image && 'lg:items-end')}>
          <div className={cn('flex flex-col gap-10', image ? 'lg:col-span-6' : 'lg:col-span-7')}>
            {description && (
              <motion.div {...fade(after)} className="max-w-[54ch] text-lg leading-relaxed text-bone-muted md:text-xl">
                {description}
              </motion.div>
            )}
            {actions && (
              <motion.div {...fade(after + 0.1)} className="flex flex-wrap items-center gap-x-8 gap-y-5">
                {actions}
              </motion.div>
            )}
          </div>

          {image && (
            <motion.figure
              initial={{ clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' }}
              animate={play ? { clipPath: 'inset(0% 0% 0% 0% round 1.5rem)' } : undefined}
              transition={{ duration: 1.4, ease: ease.inOut, delay: 0.3 }}
              className="scheme-dark relative aspect-[4/3] overflow-hidden rounded-3xl bg-ink-800 lg:col-span-5 lg:col-start-8"
            >
              <motion.div
                initial={{ scale: 1.25 }}
                animate={play ? { scale: 1 } : undefined}
                transition={{ duration: 1.8, ease: ease.out, delay: 0.3 }}
                className="absolute inset-0"
              >
                <Image src={image} alt="" fill priority sizes="(min-width: 1024px) 40vw, 100vw" className="object-cover" />
              </motion.div>
              {/* Tint towards the brand blue so stock photos sit in the palette. */}
              <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/80 via-ink/10 to-spark-royal/20 mix-blend-normal" />
              {imageLabel && (
                <figcaption className="absolute bottom-5 left-5 font-mono text-eyebrow uppercase text-bone/80">{imageLabel}</figcaption>
              )}
            </motion.figure>
          )}
        </div>

        {children}
      </div>
    </section>
  );
}
