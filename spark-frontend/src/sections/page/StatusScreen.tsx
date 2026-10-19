'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store';
import { ease, palette } from '@/lib/tokens';
import { RevealText } from '@/components/RevealText';
import { cn } from '@/lib/cn';

type Action = { label: string; href: string };

type StatusScreenProps = {
  code: string;
  lead: string;
  accent: string;
  body: string;
  primary: Action;
  secondary?: Action;
  /** Seconds before sending the visitor to `primary.href`; omit for no redirect. */
  redirectAfter?: number;
  /** Text and buttons on the left (default) or centred on the page. */
  align?: 'left' | 'center';
};

/** Full-height message screen for the thank-you and not-found pages. */
export function StatusScreen({ code, lead, accent, body, primary, secondary, redirectAfter, align = 'left' }: StatusScreenProps) {
  const centered = align === 'center';
  const play = useUI((s) => s.introDone);
  const router = useRouter();
  const [left, setLeft] = useState(redirectAfter ?? 0);

  useEffect(() => {
    if (!redirectAfter) return;
    const timer = window.setInterval(() => setLeft((s) => Math.max(s - 1, 0)), 1000);
    return () => window.clearInterval(timer);
  }, [redirectAfter]);

  useEffect(() => {
    if (redirectAfter && left === 0) router.push(primary.href);
  }, [left, redirectAfter, primary.href, router]);

  const fade = (delay: number) => ({
    initial: { opacity: 0, y: 20 },
    animate: play ? { opacity: 1, y: 0 } : undefined,
    transition: { duration: 0.9, ease: ease.out, delay },
  });

  return (
    <section aria-labelledby="status-title" className="relative isolate flex min-h-[100svh] items-center overflow-hidden py-32">
      <div
        aria-hidden
        className="pointer-events-none absolute inset-0 -z-10"
        style={{
          background: [
            `radial-gradient(45% 50% at 50% 110%, ${palette.spark.royal}55, transparent 70%)`,
            `radial-gradient(30% 35% at 15% 85%, ${palette.spark.blue}2e, transparent 70%)`,
            `radial-gradient(35% 40% at 85% 80%, ${palette.spark.silver}26, transparent 70%)`,
          ].join(', '),
        }}
      />
      <div className={cn('mx-auto w-full max-w-site px-gutter', centered && 'text-center')}>
        <motion.p {...fade(0)} className={cn('mb-8 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60', centered && 'justify-center')}>
          <span aria-hidden className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-spark-blue" />
          {code}
        </motion.p>
        <h1 id="status-title" className="font-display text-display-lg text-bone">
          <RevealText text={lead} play={play} delay={0.1} />{' '}
          <span className={cn('block', !centered && 'pl-[0.4em] md:pl-[1.1em]')}>
            <RevealText text={accent} play={play} delay={0.3} wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light" />
          </span>
        </h1>
        <motion.p
          {...fade(0.6)}
          className={cn('mt-10 max-w-[44ch] text-lg leading-relaxed text-bone-muted md:mt-14 md:text-xl', centered && 'mx-auto')}
        >
          {body}
        </motion.p>
        <motion.div {...fade(0.7)} className={cn('mt-10 flex flex-wrap items-center gap-x-8 gap-y-4', centered && 'justify-center')}>
          <Link href={primary.href} className="group inline-flex items-center gap-3 rounded-full bg-bone px-7 py-4 text-base font-medium text-ink transition-colors hover:bg-bone/85">
            {primary.label}
            <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
              →
            </span>
          </Link>
          {secondary && (
            <Link href={secondary.href} className="text-base text-bone-muted underline decoration-bone/30 underline-offset-4 transition-colors hover:text-bone hover:decoration-spark-blue">
              {secondary.label}
            </Link>
          )}
          {redirectAfter ? (
            <p aria-live="polite" className="tabular w-full font-mono text-eyebrow uppercase text-bone/50">
              Redirecting home in {left}s
            </p>
          ) : null}
        </motion.div>
      </div>
    </section>
  );
}
