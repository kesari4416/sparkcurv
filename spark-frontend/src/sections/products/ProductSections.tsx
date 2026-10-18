'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Globe, Layers, MapPin, Smartphone, type LucideIcon } from 'lucide-react';
import type { Product } from '@/lib/products';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SectionIntro } from '@/components/SectionIntro';
import { Magnetic } from '@/components/Magnetic';

const rise = (i = 0) => ({
  initial: { opacity: 0, y: 32 },
  whileInView: { opacity: 1, y: 0 },
  viewport: { once: true, margin: '0px 0px -8% 0px' },
  transition: { duration: 0.8, ease: ease.out, delay: (i % 3) * 0.08 },
});

/**
 * The product's real workflows as chains of steps. The connecting line and the step
 * markers carry the product's own colour; notes sit under the steps that need them.
 * On narrow screens a chain stacks vertically.
 */
export function ProductFlows({ product }: { product: Product }) {
  return (
    <section aria-labelledby="flow-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="flow-title"
          eyebrow="How the work flows"
          lead={product.flows.length > 1 ? 'Every document,' : 'One flow,'}
          accent={product.flows.length > 1 ? 'connected.' : 'start to finish.'}
          className="mb-12 md:mb-16"
        />
        <div className="space-y-14 md:space-y-20">
          {product.flows.map((flow) => (
            <motion.div key={flow.title} {...rise()}>
              <h3 className="mb-6 font-mono text-eyebrow uppercase text-bone/60">{flow.title}</h3>
              {/* One column on phones; side by side from md, as many as fit. */}
              <ol className="relative grid grid-cols-1 gap-6 md:grid-cols-[repeat(auto-fit,minmax(9rem,1fr))] md:gap-4">
                {/* Connecting rail behind the markers (wide screens). */}
                <span aria-hidden className="absolute left-0 right-0 top-[0.6rem] hidden h-px md:block" style={{ background: `linear-gradient(90deg, ${product.brand}, ${product.brand}33)` }} />
                {flow.steps.map((step, i) => (
                  <li key={step.label} className="relative flex gap-4 md:block">
                    <span
                      aria-hidden
                      className="relative z-10 mt-0.5 grid h-5 w-5 shrink-0 place-items-center rounded-full ring-4 ring-ink md:mt-0"
                      style={{ background: product.brand }}
                    >
                      <span className="h-1.5 w-1.5 rounded-full" style={{ background: product.onBrand }} />
                    </span>
                    <div className="md:mt-5">
                      <p className="tabular font-mono text-[0.7rem] text-bone/40">{String(i + 1).padStart(2, '0')}</p>
                      <p className="mt-1 font-display text-[clamp(1.15rem,1.5vw,1.4rem)] leading-tight tracking-[-0.015em] text-bone">{step.label}</p>
                      {step.note && <p className="mt-2 max-w-[28ch] text-sm leading-relaxed text-bone-muted">{step.note}</p>}
                    </div>
                  </li>
                ))}
              </ol>
            </motion.div>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Modules, grouped, in columns split by hairlines (not cards). */
export function ProductModules({ product }: { product: Product }) {
  return (
    <section aria-labelledby="modules-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="modules-title"
          eyebrow="Modules"
          lead="What's"
          accent="inside."
          aside={<p className="tabular font-mono text-eyebrow uppercase text-bone/50">{String(product.modules.length).padStart(2, '0')} areas</p>}
          className="mb-12 md:mb-16"
        />
        <div className="grid border-t sm:grid-cols-2 lg:grid-cols-3">
          {product.modules.map((m, i) => (
            <motion.div
              key={m.title}
              {...rise(i)}
              className="border-b py-8 sm:pr-8 md:py-10 lg:[&:not(:nth-child(3n))]:border-r lg:[&:not(:nth-child(3n+1))]:pl-8"
            >
              <h3 className="flex items-center gap-3 font-display text-[clamp(1.3rem,1.8vw,1.6rem)] leading-tight tracking-[-0.015em] text-bone">
                <span aria-hidden className="h-2 w-2 shrink-0 rounded-full" style={{ background: product.brand }} />
                {m.title}
              </h3>
              <ul className="mt-5 space-y-3">
                {m.items.map((item) => (
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

/** Controls and integrations (BuildNexa): two lists of tags. */
export function ProductExtras({ product }: { product: Product }) {
  if (!product.extras) return null;
  return (
    <section aria-label="Controls and integrations" className="pb-24 md:pb-32">
      <div className="mx-auto grid max-w-site gap-12 px-gutter md:grid-cols-2 md:gap-8">
        {product.extras.map((group, gi) => (
          <motion.div key={group.title} {...rise(gi)}>
            <h3 className="font-mono text-eyebrow uppercase text-bone/60">{group.title}</h3>
            <ul className="mt-6 flex flex-wrap gap-2">
              {group.items.map((item) => (
                <li key={item} className="rounded-full border px-4 py-2 text-sm text-bone/85">
                  {item}
                </li>
              ))}
            </ul>
          </motion.div>
        ))}
      </div>
    </section>
  );
}

/** Roles as rows: name on the left, what they do on the right. */
export function ProductRoles({ product }: { product: Product }) {
  return (
    <section aria-labelledby="roles-title" className="py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      <div className="mx-auto grid max-w-site gap-12 px-gutter lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-44 lg:col-span-4 lg:self-start">
          <SectionIntro
            id="roles-title"
            eyebrow="Roles"
            lead="Everyone sees"
            accent="their part."
            body={<p>Access follows the job each person does.</p>}
          />
        </div>
        <div className="space-y-12 lg:col-span-8 lg:col-start-5">
          {product.roles.map((group) => (
            <div key={group.group ?? 'roles'}>
              {group.group && <h3 className="mb-4 font-mono text-eyebrow uppercase text-bone/60">{group.group}</h3>}
              <ul className="border-t">
                {group.items.map((r, i) => (
                  <motion.li key={r.name} {...rise(i)} className="grid gap-1 border-b py-5 sm:grid-cols-[14rem_1fr] sm:gap-6">
                    <span className="font-display text-lg tracking-[-0.01em] text-bone">{r.name}</span>
                    <span className="text-base leading-relaxed text-bone-muted">{r.does}</span>
                  </motion.li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}

const platformIcons: LucideIcon[] = [Globe, Smartphone, MapPin];
const platformIconsAlt: LucideIcon[] = [Globe, Layers, MapPin];

/** Platforms (and who it's built for, when the product lists segments). */
export function ProductPlatforms({ product }: { product: Product }) {
  const icons = product.slug === 'sitera' ? platformIcons : platformIconsAlt;
  return (
    <section aria-labelledby="platforms-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="platforms-title" eyebrow="Where it runs" lead="Built for" accent="how you work." dot="silver" className="mb-12 md:mb-16" />
        <ul className="grid border-t md:grid-cols-3">
          {product.platforms.map((pl, i) => {
            const Icon = icons[i] ?? Globe;
            return (
              <motion.li key={pl.name} {...rise(i)} className="border-b py-8 md:py-10 md:[&:not(:last-child)]:border-r md:[&:not(:first-child)]:pl-8 md:pr-8">
                <Icon aria-hidden strokeWidth={1.25} className="h-7 w-7 text-bone/60" />
                <h3 className="mt-6 font-display text-[clamp(1.3rem,1.8vw,1.6rem)] leading-tight tracking-[-0.015em] text-bone">{pl.name}</h3>
                <p className="mt-3 max-w-[36ch] text-base leading-relaxed text-bone-muted">{pl.detail}</p>
              </motion.li>
            );
          })}
        </ul>
        {product.builtFor && (
          <motion.div {...rise()} className="mt-14">
            <h3 className="font-mono text-eyebrow uppercase text-bone/60">Built for</h3>
            <ul className="mt-6 flex flex-wrap gap-2">
              {product.builtFor.map((b) => (
                <li key={b} className="rounded-full border px-4 py-2 text-sm text-bone/85">
                  {b}
                </li>
              ))}
            </ul>
          </motion.div>
        )}
      </div>
    </section>
  );
}

/** Closing band: book a demo (contact form with the product preselected) or sign in. */
export function ProductCTA({ product }: { product: Product }) {
  const external = [product.links.site, product.links.signIn].filter(Boolean) as { label: string; href: string }[];
  return (
    <section aria-labelledby="product-cta-title" className="pb-24 md:pb-32">
      <div className="mx-auto max-w-site px-gutter">
        <motion.div
          {...rise()}
          className="scheme-dark relative isolate overflow-hidden rounded-[2rem] bg-ink-800 px-6 py-16 md:px-16 md:py-24"
        >
          <span aria-hidden className="absolute -bottom-40 -right-20 -z-10 h-[28rem] w-[28rem] rounded-full opacity-45 blur-3xl" style={{ background: product.brand }} />
          <span aria-hidden className="absolute -left-24 -top-40 -z-10 h-[24rem] w-[24rem] rounded-full bg-spark-royal opacity-25 blur-3xl" />
          <h2 id="product-cta-title" className="max-w-[18ch] font-display text-display-md text-bone">
            See {product.name} <span className="text-gradient animate-gradient-pan pr-[0.06em] font-light">in action.</span>
          </h2>
          <p className="mt-6 max-w-[48ch] text-lg leading-relaxed text-bone-muted">
            We&apos;ll walk you through {product.name} with your own workflow in mind, then set it up for your team.
          </p>
          <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
            <Magnetic strength={0.25}>
              <Link
                href={`/contact?product=${product.slug}`}
                className="group inline-flex items-center gap-3 rounded-full bg-bone px-7 py-4 text-base font-medium text-ink transition-colors hover:bg-bone/85"
              >
                Book a {product.name} demo
                <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                  →
                </span>
              </Link>
            </Magnetic>
            {external.map((l) => (
              <a
                key={l.href}
                href={l.href}
                target="_blank"
                rel="noopener noreferrer"
                className={cn('group inline-flex items-center gap-1.5 text-base text-bone-muted transition-colors hover:text-bone')}
              >
                {l.label}
                <ArrowUpRight aria-hidden strokeWidth={1.75} className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
              </a>
            ))}
          </div>
        </motion.div>
      </div>
    </section>
  );
}
