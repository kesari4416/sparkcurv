'use client';

import Link from 'next/link';
import { motion } from 'framer-motion';
import { ArrowUpRight, Check } from 'lucide-react';
import { products, type Product } from '@/lib/products';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SectionIntro } from '@/components/SectionIntro';
import { ProductLogo } from './ProductLogo';
import { PhonePreview, ProductPreview } from './ProductPreview';

function Highlights({ items }: { items: string[] }) {
  return (
    <ul className="space-y-2.5">
      {items.map((h) => (
        <li key={h} className="flex items-start gap-3 text-base leading-snug text-bone/85">
          <Check aria-hidden strokeWidth={2} className="mt-0.5 h-4 w-4 shrink-0 text-spark-blue" />
          {h}
        </li>
      ))}
    </ul>
  );
}

function ExploreLink({ product }: { product: Product }) {
  return (
    <Link
      href={`/products/${product.slug}`}
      className="group relative inline-flex items-center gap-2 pb-1 text-base text-bone md:text-lg"
    >
      Explore {product.name}
      <ArrowUpRight aria-hidden strokeWidth={1.75} className="h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5" />
      <span
        aria-hidden
        className="absolute inset-x-0 bottom-0 h-px origin-right bg-spark motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out motion-safe:group-hover:origin-left motion-safe:group-hover:scale-x-100"
      />
    </Link>
  );
}

/** Home page: the two products side by side, each linking to its page. */
function Compact() {
  return (
    <ul className="grid gap-4 md:grid-cols-2 md:gap-5">
      {products.map((p, i) => (
        <motion.li
          key={p.slug}
          initial={{ opacity: 0, y: 40 }}
          whileInView={{ opacity: 1, y: 0 }}
          viewport={{ once: true, margin: '0px 0px -10% 0px' }}
          transition={{ duration: 0.9, ease: ease.out, delay: i * 0.1 }}
          className="glass relative isolate flex flex-col overflow-hidden rounded-3xl p-6 md:p-8"
        >
          {/* The product's own colour, as a soft glow in the corner. */}
          <span
            aria-hidden
            className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full opacity-40 blur-3xl"
            style={{ background: p.brand }}
          />
          <ProductLogo product={p} className="self-start" />
          <p className="mt-8 font-mono text-eyebrow uppercase text-bone/55">{p.category}</p>
          <h3 className="mt-3 font-display text-[clamp(1.6rem,2.4vw,2.25rem)] leading-tight tracking-[-0.02em] text-bone">{p.audience}.</h3>
          <p className="mt-4 max-w-[52ch] text-base leading-relaxed text-bone-muted md:text-lg">{p.summary}</p>
          <div className="mt-6 flex-1">
            <Highlights items={p.highlights.slice(0, 3)} />
          </div>
          <div className="mt-8">
            <ExploreLink product={p} />
          </div>
        </motion.li>
      ))}
    </ul>
  );
}

/** Products page: one wide row per product with its interface preview, sides alternating. */
function Full() {
  return (
    <div className="space-y-24 md:space-y-36">
      {products.map((p, i) => (
        <article key={p.slug} aria-labelledby={`product-${p.slug}`} className="grid items-center gap-12 lg:grid-cols-12 lg:gap-8">
          <motion.div
            initial={{ opacity: 0, y: 32 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: '0px 0px -15% 0px' }}
            transition={{ duration: 0.9, ease: ease.out }}
            className={cn('lg:col-span-5', i % 2 === 1 && 'lg:order-2 lg:col-start-8')}
          >
            <ProductLogo product={p} className="inline-grid" />
            <p className="mt-8 font-mono text-eyebrow uppercase text-bone/55">{p.category}</p>
            <h2 id={`product-${p.slug}`} className="mt-3 font-display text-[clamp(1.9rem,3.2vw,3rem)] leading-[1.05] tracking-[-0.02em] text-bone">
              {p.audience}.
            </h2>
            <p className="mt-5 max-w-[52ch] text-lg leading-relaxed text-bone-muted">{p.summary}</p>
            <div className="mt-8">
              <Highlights items={p.highlights} />
            </div>
            <div className="mt-10 flex flex-wrap items-center gap-x-8 gap-y-4">
              <ExploreLink product={p} />
              <a
                href={(p.links.site ?? p.links.signIn).href}
                target="_blank"
                rel="noopener noreferrer"
                className="text-base text-bone-muted underline decoration-bone/30 underline-offset-4 transition-colors hover:text-bone hover:decoration-spark-blue"
              >
                {(p.links.site ?? p.links.signIn).label}
              </a>
            </div>
          </motion.div>

          <motion.div
            initial={{ opacity: 0, y: 48, filter: 'blur(10px)' }}
            whileInView={{ opacity: 1, y: 0, filter: 'blur(0px)' }}
            viewport={{ once: true, margin: '0px 0px -10% 0px' }}
            transition={{ duration: 1.1, ease: ease.out, delay: 0.1 }}
            className={cn('relative lg:col-span-7', i % 2 === 1 ? 'lg:order-1 lg:col-start-1' : 'lg:col-start-6')}
          >
            <span
              aria-hidden
              className="absolute inset-x-[10%] -bottom-10 top-10 -z-10 rounded-full opacity-35 blur-3xl"
              style={{ background: p.brand }}
            />
            <ProductPreview product={p} className={p.slug === 'sitera' ? 'xl:mr-28' : undefined} />
            {p.slug === 'sitera' && <PhonePreview product={p} className="absolute -bottom-12 -right-4 hidden origin-bottom-right scale-[0.72] xl:block xl:-right-10" />}
          </motion.div>
        </article>
      ))}
    </div>
  );
}

/** "Our products": compact on the home page, full rows on /products. */
export function ProductsShowcase({ variant = 'compact' }: { variant?: 'compact' | 'full' }) {
  return (
    <section aria-labelledby={variant === 'compact' ? 'products-title' : undefined} className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        {variant === 'compact' ? (
          <>
            <SectionIntro
              id="products-title"
              eyebrow="Our products"
              lead="Software we"
              accent="build and run."
              body={<p>Two construction platforms, designed, built and run by our own team.</p>}
              aside={
                <Link href="/products" className="group inline-flex items-center gap-2 text-base text-bone md:text-lg">
                  <span className="text-bone-muted transition-colors group-hover:text-bone">Which one fits you?</span> Compare
                  <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                    →
                  </span>
                </Link>
              }
              className="mb-12 md:mb-16"
            />
            <Compact />
          </>
        ) : (
          <Full />
        )}
      </div>
    </section>
  );
}
