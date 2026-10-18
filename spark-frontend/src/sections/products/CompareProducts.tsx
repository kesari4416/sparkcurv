'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { products } from '@/lib/products';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

/** Side-by-side facts, so a visitor can see which product fits. */
const rows: { label: string; values: [string, string] }[] = [
  { label: 'Built for', values: ['Growing contractors and construction firms', 'Large contractors, EPC companies and multi-company groups'] },
  { label: 'At its core', values: ['Lead to cash: leads, estimates, projects, site work and invoices', 'WBS and daily progress, procure-to-pay, stores and client RA billing'] },
  { label: 'Accounting', values: ['Income and expense ledger, invoices, balance sheet for any period', 'General ledger, GST and TDS, year-end, Tally-compatible export'] },
  { label: 'Outside your team', values: ['Client and vendor portals', 'Used by your own teams, with 7 organisation and 5 project roles'] },
  { label: 'Platforms', values: ['Web portal and Android app', 'Web app for desktop, tablet and phone'] },
];

export function CompareProducts() {
  const [a, b] = products;
  return (
    <section aria-labelledby="compare-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="compare-title" eyebrow="Compare" lead="Which one" accent="fits you?" className="mb-12 md:mb-16" />
        <motion.div
          initial={{ opacity: 0, y: 32 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: ease.out }}
          className="overflow-x-auto"
        >
          <table className="w-full min-w-[40rem] border-collapse text-left">
            <caption className="sr-only">Sitera and BuildNexa compared</caption>
            <thead>
              <tr className="border-b">
                <th scope="col" className="w-[22%] py-5 pr-6 font-mono text-eyebrow font-normal uppercase text-bone/50">
                  <span className="sr-only">Aspect</span>
                </th>
                {[a, b].map((p) => (
                  <th key={p.slug} scope="col" className="py-5 pr-6 align-bottom">
                    <span className="flex items-center gap-3 font-display text-2xl tracking-[-0.015em] text-bone">
                      <span aria-hidden className="h-2.5 w-2.5 rounded-full" style={{ background: p.brand }} />
                      {p.name}
                    </span>
                  </th>
                ))}
              </tr>
            </thead>
            <tbody>
              {rows.map((r) => (
                <tr key={r.label} className="border-b align-top">
                  <th scope="row" className="py-6 pr-6 font-mono text-eyebrow font-normal uppercase text-bone/60">
                    {r.label}
                  </th>
                  {r.values.map((v, i) => (
                    <td key={i} className="py-6 pr-6 text-base leading-relaxed text-bone/85">
                      {v}
                    </td>
                  ))}
                </tr>
              ))}
              <tr>
                <th scope="row" className="py-6 pr-6">
                  <span className="sr-only">Learn more</span>
                </th>
                {[a, b].map((p) => (
                  <td key={p.slug} className="py-6 pr-6">
                    <Link href={`/products/${p.slug}`} className="group inline-flex items-center gap-2 text-base text-bone">
                      Explore {p.name}
                      <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                        →
                      </span>
                    </Link>
                  </td>
                ))}
              </tr>
            </tbody>
          </table>
        </motion.div>
      </div>
    </section>
  );
}
