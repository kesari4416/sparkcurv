'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import {
  Activity,
  ArrowUpRight,
  Box,
  Cloud,
  Database,
  GitBranch,
  Globe,
  Palette,
  Server,
  Smartphone,
  TrendingUp,
  Users,
  type LucideIcon,
} from 'lucide-react';
import type { ServiceIcon, ServicePage } from '@/lib/services';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SectionIntro } from '@/components/SectionIntro';

const icons: Record<ServiceIcon, LucideIcon> = {
  cloud: Cloud,
  pipeline: GitBranch,
  server: Server,
  container: Box,
  activity: Activity,
  database: Database,
  globe: Globe,
  phone: Smartphone,
  palette: Palette,
  trending: TrendingUp,
  users: Users,
};

/** Column layout by card count, so 2, 3 or 6 cards always fill complete rows. */
const grids: Record<number, string> = {
  2: 'md:grid-cols-2',
  3: 'md:grid-cols-3',
};

/** Family overview: one card per sub-service, each a link to its page. */
export function ServiceCards({ heading, items }: { heading: { lead: string; accent: string }; items: ServicePage[] }) {
  const large = items.length <= 3;
  return (
    <section aria-labelledby="services-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="services-title"
          eyebrow={`${String(items.length).padStart(2, '0')} services`}
          lead={heading.lead}
          accent={heading.accent}
          className="mb-12 md:mb-16"
        />

        <ul className={cn('grid gap-4 md:gap-5', grids[items.length] ?? 'md:grid-cols-2 lg:grid-cols-3')}>
          {items.map((item, i) => {
            const Icon = item.icon ? icons[item.icon] : ArrowUpRight;
            return (
              <motion.li
                key={item.path}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.9, ease: ease.out, delay: (i % 3) * 0.08 }}
              >
                <Link
                  href={item.path}
                  className={cn(
                    'glass group relative isolate flex h-full flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-8',
                    large ? 'min-h-[22rem]' : 'min-h-[17rem]',
                  )}
                >
                  {/* Hover glow rising from the bottom edge. */}
                  <span
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 -z-10 h-2/3 translate-y-full bg-[radial-gradient(70%_100%_at_50%_100%,rgba(11,60,250,0.35),transparent)] transition-transform duration-700 ease-expo-out group-hover:translate-y-0"
                  />
                  <div className="flex items-start justify-between">
                    <span className="grid h-12 w-12 place-items-center rounded-2xl border text-bone/80 transition-colors duration-500 group-hover:border-spark-blue group-hover:bg-spark-blue group-hover:text-bone">
                      <Icon aria-hidden strokeWidth={1.5} className="h-5 w-5" />
                    </span>
                    <span aria-hidden className="tabular font-mono text-eyebrow text-bone/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                  </div>

                  <div>
                    <h3 className={cn('font-display leading-[1.05] tracking-[-0.02em] text-bone', large ? 'text-[clamp(1.9rem,3vw,2.75rem)]' : 'text-[clamp(1.6rem,2.2vw,2rem)]')}>
                      {item.name}
                    </h3>
                    <p className="mt-3 max-w-[40ch] text-base leading-relaxed text-bone-muted">{item.summary}</p>
                    <span className="mt-6 inline-flex items-center gap-2 font-mono text-eyebrow uppercase text-bone/70 transition-colors group-hover:text-bone">
                      Explore
                      <ArrowUpRight aria-hidden strokeWidth={1.75} className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
                    </span>
                  </div>
                </Link>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
