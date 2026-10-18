'use client';

import Link from 'next/link';
import { useId, useState } from 'react';
import { motion } from 'framer-motion';
import type { Product } from '@/lib/products';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

/*
 * BuildNexa's leakage calculator, with the copy, ranges, defaults and disclaimer of the one
 * on buildnexa.io (buildnexa-web/src/components/Compare.jsx, formula in src/effects/kit.js):
 *   leakage  = annual project value × leakage %
 *   recovery = leakage × share recoverable
 * It is an illustration from the visitor's own inputs, never a promise.
 */

const crore = (n: number) => `₹${n.toLocaleString('en-IN', { maximumFractionDigits: n < 10 ? 2 : 1 })} Cr`;

type SliderProps = {
  label: string;
  value: number;
  min: number;
  max: number;
  step: number;
  format: (n: number) => string;
  onChange: (n: number) => void;
  brand: string;
};

function Slider({ label, value, min, max, step, format, onChange, brand }: SliderProps) {
  const id = useId();
  const pct = ((value - min) / (max - min)) * 100;
  return (
    <div>
      <div className="flex items-baseline justify-between gap-4">
        <label htmlFor={id} className="text-base text-bone/85">
          {label}
        </label>
        <output htmlFor={id} className="tabular font-display text-xl text-bone">
          {format(value)}
        </output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        className="range-brand mt-4 w-full"
        style={{ '--fill': `${pct}%`, '--brand': brand } as React.CSSProperties}
      />
      <div className="mt-2 flex justify-between font-mono text-[0.65rem] uppercase tracking-[0.14em] text-bone/40">
        <span>{format(min)}</span>
        <span>{format(max)}</span>
      </div>
    </div>
  );
}

export function LeakageCalculator({ product }: { product: Product }) {
  const [value, setValue] = useState(100);
  const [leak, setLeak] = useState(3);
  const [recover, setRecover] = useState(40);
  const leakage = (value * leak) / 100;
  const recovery = (leakage * recover) / 100;

  return (
    <section aria-labelledby="leak-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="leak-title"
          eyebrow="Run the numbers"
          lead="What could leakage"
          accent="be costing you?"
          body={<p>Most growing contractors run on Excel, registers and WhatsApp — until margins quietly leak between the cracks.</p>}
          className="mb-12 md:mb-16"
        />
        <motion.div
          initial={{ opacity: 0, y: 28 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: ease.out }}
          className="grid gap-px overflow-hidden rounded-3xl border bg-hairline lg:grid-cols-12"
        >
          <div className="space-y-10 bg-ink p-6 md:p-10 lg:col-span-7">
            <Slider label="Annual project value" value={value} min={10} max={1000} step={10} format={(n) => `₹${n} Cr`} onChange={setValue} brand={product.brand} />
            <Slider
              label="Cost leakage (rework, idle stock, missed billing)"
              value={leak}
              min={1}
              max={8}
              step={0.5}
              format={(n) => `${n}%`}
              onChange={setLeak}
              brand={product.brand}
            />
            <Slider label="Share you could recover with live controls" value={recover} min={10} max={80} step={5} format={(n) => `${n}%`} onChange={setRecover} brand={product.brand} />
          </div>
          <div className="scheme-dark relative isolate flex flex-col justify-between gap-10 overflow-hidden bg-ink-800 p-6 md:p-10 lg:col-span-5">
            <span aria-hidden className="absolute -bottom-32 -right-24 -z-10 h-80 w-80 rounded-full opacity-40 blur-3xl" style={{ background: product.brand }} />
            <dl className="space-y-8" aria-live="polite">
              <div>
                <dt className="font-mono text-eyebrow uppercase text-bone/55">Estimated leakage a year</dt>
                <dd className="tabular mt-2 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.03em] text-bone">{crore(leakage)}</dd>
              </div>
              <div>
                <dt className="font-mono text-eyebrow uppercase text-bone/55">You could recover</dt>
                <dd className="tabular mt-2 font-display text-[clamp(2.5rem,5vw,4rem)] leading-none tracking-[-0.03em] text-bone">{crore(recovery)}</dd>
              </div>
            </dl>
            <div>
              <p className="text-sm leading-relaxed text-bone-muted">
                Illustrative estimate from your inputs — not a quote or guarantee. On thin construction margins, a few percent of leakage can erase a
                project&apos;s profit.
              </p>
              <Link href={`/contact?product=${product.slug}`} className="group mt-6 inline-flex items-center gap-2 text-base text-bone">
                Get a tailored estimate
                <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </div>
          </div>
        </motion.div>
      </div>
    </section>
  );
}
