'use client';

import { motion } from 'framer-motion';
import { FileCode2, Headset, PiggyBank, RefreshCw, ShieldCheck, UserRound, type LucideIcon } from 'lucide-react';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

const icons: Record<string, LucideIcon> = {
  shield: ShieldCheck,
  headset: Headset,
  code: FileCode2,
  person: UserRound,
  savings: PiggyBank,
  refresh: RefreshCw,
};

type Item = { icon: string; title: string; body: string };

/** What every plan includes: a 3-column grid of commitments split by hairlines, each with its icon. */
export function Includes({ items }: { items: Item[] }) {
  return (
    <section aria-labelledby="includes-title" className="py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:auto_800px]">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="includes-title"
          eyebrow="Every plan includes"
          lead="Everything you need to"
          accent="stop worrying."
          dot="silver"
          className="mb-12 md:mb-16"
        />
        <ul className="grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {items.map((item, i) => {
            const Icon = icons[item.icon];
            return (
              <motion.li
                key={item.title}
                initial={{ opacity: 0, y: 32 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -8% 0px' }}
                transition={{ duration: 0.8, ease: ease.out, delay: (i % 3) * 0.08 }}
                className="group relative border-b py-8 sm:pr-8 md:py-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-8"
              >
                {Icon && (
                  <Icon
                    aria-hidden
                    strokeWidth={1.25}
                    className="h-7 w-7 text-bone/60 transition-colors duration-500 group-hover:text-spark-blue"
                  />
                )}
                <h3 className="mt-6 font-display text-[clamp(1.4rem,2vw,1.75rem)] leading-tight tracking-[-0.015em] text-bone">{item.title}</h3>
                <p className="mt-3 max-w-[38ch] text-base leading-relaxed text-bone-muted">{item.body}.</p>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
