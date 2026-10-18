'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import type { Plan } from '@/lib/pages';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SectionIntro } from '@/components/SectionIntro';

function PlanCard({ plan, index }: { plan: Plan; index: number }) {
  const hi = !!plan.highlighted;
  return (
    <motion.li
      initial={{ opacity: 0, y: 48 }}
      whileInView={{ opacity: 1, y: 0 }}
      viewport={{ once: true, margin: '0px 0px -10% 0px' }}
      transition={{ duration: 0.9, ease: ease.out, delay: index * 0.08 }}
      // The highlighted plan gets a 1px animated brand-gradient border (the padding shows it).
      className={cn('relative rounded-3xl p-px', hi ? 'bg-spark bg-[length:200%_100%] animate-gradient-pan' : 'bg-hairline')}
    >
      <div className={cn('flex h-full flex-col rounded-[calc(1.5rem-1px)] p-6 md:p-8', hi ? 'bg-ink-800' : 'bg-ink')}>
        <div className="flex items-center justify-between gap-4">
          <h3 className="font-display text-2xl tracking-[-0.015em] text-bone">{plan.name}</h3>
          {hi && (
            <span className="rounded-full bg-bone px-3 py-1 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-ink">Most popular</span>
          )}
        </div>

        <p className="mt-8 flex items-baseline gap-1">
          {plan.price ? (
            <>
              <span className="font-display text-2xl text-bone-muted">$</span>
              <span className="tabular font-display text-[clamp(3rem,4.5vw,4rem)] leading-none tracking-[-0.03em] text-bone">{plan.price}</span>
            </>
          ) : (
            <span className="font-display text-[clamp(3rem,4.5vw,4rem)] leading-none tracking-[-0.03em] text-gradient animate-gradient-pan font-light">Custom</span>
          )}
        </p>
        <p className="mt-2 font-mono text-eyebrow uppercase text-bone/50">{plan.period}</p>

        <p className="mt-6 text-base leading-relaxed text-bone-muted">{plan.description}</p>

        <ul className="mt-8 flex-1 space-y-3 border-t pt-6">
          {plan.features.map((f) => (
            <li key={f} className="flex items-start gap-3 text-[0.95rem] leading-snug text-bone/85">
              <Check aria-hidden strokeWidth={2} className={cn('mt-0.5 h-4 w-4 shrink-0', hi ? 'text-spark-blue' : 'text-bone/50')} />
              {f}
            </li>
          ))}
        </ul>

        <Link
          href="/contact"
          aria-label={`${plan.cta}: ${plan.name} plan`}
          className={cn(
            'group mt-10 inline-flex items-center justify-between gap-3 rounded-full px-6 py-4 text-sm font-medium transition-colors duration-500',
            hi ? 'bg-bone text-ink hover:bg-bone/85' : 'border text-bone hover:border-bone/40 hover:bg-bone/5',
          )}
        >
          {plan.cta}
          <ArrowUpRight aria-hidden strokeWidth={1.75} className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
        </Link>
      </div>
    </motion.li>
  );
}

/** The four managed cloud plans. */
export function Plans({ plans }: { plans: Plan[] }) {
  return (
    <section aria-labelledby="plans-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="plans-title"
          eyebrow="Choose your plan"
          lead="Plans that scale"
          accent="with you."
          aside={<p className="font-mono text-eyebrow uppercase text-bone/50">USD · billed monthly · cloud costs separate</p>}
          className="mb-12 md:mb-16"
        />
        <ul className="grid gap-4 md:grid-cols-2 md:gap-5 xl:grid-cols-4">
          {plans.map((plan, i) => (
            <PlanCard key={plan.name} plan={plan} index={i} />
          ))}
        </ul>
      </div>
    </section>
  );
}
