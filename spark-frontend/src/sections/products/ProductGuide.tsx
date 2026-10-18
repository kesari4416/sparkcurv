'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowDownToLine, ArrowRight, ArrowUpFromLine, Check, Share2, type LucideIcon } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 28 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -8% 0px' },
  transition: { duration: 0.8, ease: ease.out, delay: (i % 3) * 0.08 },
});

/**
 * "Sound familiar?": the problem as the person feels it, and what the product does about it.
 * Problems come from the product's own material; see lib/products.ts.
 */
export function ProblemsSolved({ product }: { product: Product }) {
  return (
    <section aria-labelledby="problems-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="problems-title" eyebrow="Sound familiar?" lead="The problems" accent={`${product.name} fixes.`} className="mb-12 md:mb-16" />
        <ul className="border-t">
          {product.problems.map((p, i) => (
            <motion.li key={p.pain} {...rise(i)} className="grid gap-4 border-b py-8 md:grid-cols-12 md:gap-8 md:py-10">
              <div className="md:col-span-5">
                {p.who && <p className="font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/45">{p.who}</p>}
                <p className="mt-2 font-display text-[clamp(1.25rem,1.9vw,1.6rem)] leading-snug tracking-[-0.015em] text-bone/70">{p.pain}</p>
              </div>
              <ArrowRight aria-hidden strokeWidth={1.5} className="hidden h-6 w-6 self-center justify-self-center text-bone/40 md:col-span-1 md:block" />
              <p className="text-base leading-relaxed text-bone md:col-span-6 md:self-center md:text-lg">{p.answer}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}

/** Getting started: the real setup sequence, numbered because the order matters. */
export function GettingStarted({ product }: { product: Product }) {
  return (
    <section aria-labelledby="start-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="start-title"
          eyebrow="Getting started"
          lead={product.setupHeading.lead}
          accent={product.setupHeading.accent}
          dot="silver"
          className="mb-12 md:mb-16"
        />
        <ol className={`grid gap-px overflow-hidden rounded-3xl border bg-hairline md:grid-cols-2 ${product.setup.length % 3 === 0 ? 'lg:grid-cols-3' : 'lg:grid-cols-5'}`}>
          {product.setup.map((s, i) => (
            <motion.li key={s.title} {...rise(i)} className="flex flex-col bg-ink p-6 md:p-7">
              <span
                className="tabular grid h-9 w-9 place-items-center rounded-full font-mono text-xs"
                style={{ background: `${product.brand}24`, color: 'rgb(var(--bone))' }}
              >
                {i + 1}
              </span>
              <h3 className="mt-6 font-display text-xl leading-tight tracking-[-0.015em] text-bone">{s.title}</h3>
              <p className="mt-3 text-[0.95rem] leading-relaxed text-bone-muted">{s.detail}</p>
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}

const dataCols: { key: 'in' | 'out' | 'share'; title: string; Icon: LucideIcon }[] = [
  { key: 'in', title: 'Bring in', Icon: ArrowDownToLine },
  { key: 'out', title: 'Take out', Icon: ArrowUpFromLine },
  { key: 'share', title: 'Share and notify', Icon: Share2 },
];

/** Data in and out: imports, exports and the channels documents travel on. */
export function DataInOut({ product }: { product: Product }) {
  return (
    <section aria-labelledby="data-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="data-title"
          eyebrow="Your data"
          lead="Comes in easily."
          accent="Goes out cleanly."
          className="mb-12 md:mb-16"
        />
        <div className="grid border-t md:grid-cols-3">
          {dataCols.map(({ key, title, Icon }, ci) => (
            <motion.div key={key} {...rise(ci)} className="border-b py-8 md:py-10 md:[&:not(:last-child)]:border-r md:[&:not(:first-child)]:pl-8 md:pr-8">
              <h3 className="flex items-center gap-3 font-display text-xl tracking-[-0.015em] text-bone">
                <Icon aria-hidden strokeWidth={1.5} className="h-5 w-5 text-bone/60" />
                {title}
              </h3>
              <ul className="mt-5 space-y-3">
                {product.data[key].map((item) => (
                  <li key={item} className="text-base leading-relaxed text-bone-muted">
                    {item}
                  </li>
                ))}
              </ul>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** An honest fit check, pointing to the other product when that suits better. */
export function FitCheck({ product }: { product: Product }) {
  const other = products.find((p) => p.slug !== product.slug)!;
  return (
    <section aria-labelledby="fit-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="fit-title" eyebrow="Is it right for you?" lead={`${product.name} fits`} accent="when…" className="mb-12 md:mb-16" />
        <div className="grid gap-5 lg:grid-cols-12">
          <motion.ul {...rise()} className="glass space-y-4 rounded-3xl p-6 md:p-8 lg:col-span-7">
            {product.fit.yes.map((y) => (
              <li key={y} className="flex items-start gap-4 text-base leading-relaxed text-bone md:text-lg">
                <span className="mt-1 grid h-6 w-6 shrink-0 place-items-center rounded-full" style={{ background: product.brand, color: product.onBrand }}>
                  <Check aria-hidden strokeWidth={2.5} className="h-3.5 w-3.5" />
                </span>
                {y}
              </li>
            ))}
          </motion.ul>
          <motion.div {...rise(1)} className="flex flex-col rounded-3xl border p-6 md:p-8 lg:col-span-5">
            <h3 className="font-mono text-eyebrow uppercase text-bone/55">Look at {other.name} instead if</h3>
            <ul className="mt-5 flex-1 space-y-3">
              {product.fit.other.map((o) => (
                <li key={o} className="text-base leading-relaxed text-bone-muted">
                  {o}
                </li>
              ))}
            </ul>
            <Link href={`/products/${other.slug}`} className="group mt-8 inline-flex items-center gap-2 text-base text-bone">
              Explore {other.name}
              <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                →
              </span>
            </Link>
          </motion.div>
        </div>
      </div>
    </section>
  );
}
