'use client';

import { useRef } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, type Variants } from 'framer-motion';
import { AppWindow, ArrowUpRight, Code2, Container, Workflow, type LucideIcon } from 'lucide-react';
import { features } from '@/lib/content';
import { ease, palette } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { RevealText } from '@/components/RevealText';

type Feature = (typeof features)[number];
type Size = Feature['size'];

/*
 * Grid packing
 * ------------
 * Mobile: one column, DOM order.
 *
 * md (2 columns): xl spans both columns and two rows, tall spans two rows, everything
 * else is 1x1. In DOM order that fills 6 rows exactly:
 *   r1-2  [ xl  xl  ]
 *   r3    [ md  sm  ]
 *   r4    [ sm  tall]
 *   r5    [ md  tall]
 *   r6    [ sm  wide]
 *
 * lg (12 columns): xl 6x2, md 6x1, sm 3x1, tall 3x2, wide 9x1.
 * Area check: 12 + 2*6 + 3*3 + 6 + 9 = 48 = 12 columns x 4 rows, so no holes:
 *   r1  [ xl xl xl xl xl xl | md md md md md md ]
 *   r2  [ xl xl xl xl xl xl | sm sm sm | sm sm sm ]
 *   r3  [ tall tall tall | md md md md md md | sm sm sm ]
 *   r4  [ tall tall tall | wide wide wide wide wide wide wide wide wide ]
 * Auto-placement already lands every tile there in DOM order (so focus order matches
 * visual order); grid-flow-dense is a safety net if the content order changes.
 */
const spans: Record<Size, string> = {
  xl: 'md:col-span-2 md:row-span-2 lg:col-span-6 lg:row-span-2',
  md: 'lg:col-span-6',
  sm: 'lg:col-span-3',
  tall: 'md:row-span-2 lg:col-span-3 lg:row-span-2',
  wide: 'lg:col-span-9',
};

/** next/image `sizes` per tile size, matching the spans above (site max width is 1680px). */
const imageSizes: Record<Size, string> = {
  xl: '(min-width: 1024px) 50vw, 100vw',
  md: '(min-width: 768px) 50vw, 100vw',
  sm: '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw',
  tall: '(min-width: 1024px) 25vw, (min-width: 768px) 50vw, 100vw',
  wide: '(min-width: 1024px) 75vw, (min-width: 768px) 50vw, 100vw',
};

const icons: Record<'pipeline' | 'code' | 'browser' | 'container', LucideIcon> = {
  pipeline: Workflow,
  code: Code2,
  browser: AppWindow,
  container: Container,
};

const rgba = (hex: string, alpha: number) => {
  const n = parseInt(hex.slice(1), 16);
  return `rgba(${(n >> 16) & 255}, ${(n >> 8) & 255}, ${n & 255}, ${alpha})`;
};

/** Pointer-following brand sheen. --mx/--my are written straight to the tile's style on pointermove. */
const sheen = (strength: number) =>
  `radial-gradient(420px circle at var(--mx, 50%) var(--my, 50%), ${rgba(palette.spark.blue, 0.28 * strength)}, ${rgba(
    palette.spark.royal,
    0.16 * strength,
  )} 35%, ${rgba(palette.spark.silver, 0.08 * strength)} 55%, transparent 72%)`;

const sheenFill: React.CSSProperties = { backgroundImage: sheen(1) };
/** Same gradient, masked down to a 1px ring so the tile's border lights up under the pointer. */
const sheenBorder: React.CSSProperties = {
  backgroundImage: sheen(3),
  padding: 1,
  WebkitMask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  WebkitMaskComposite: 'xor',
  mask: 'linear-gradient(#000 0 0) content-box, linear-gradient(#000 0 0)',
  maskComposite: 'exclude',
};

const glow: React.CSSProperties = {
  backgroundImage: `radial-gradient(closest-side, ${rgba(palette.spark.silver, 0.16)}, ${rgba(palette.spark.royal, 0.07)} 45%, transparent)`,
};

const tileVariants: Variants = {
  hidden: { opacity: 0, y: 48, filter: 'blur(12px)' },
  // filter is dropped once sharp: a lingering filter would make the tile a backdrop root
  // and stop the glass blur from sampling what is behind it.
  visible: (i: number) => ({
    opacity: 1,
    y: 0,
    filter: 'blur(0px)',
    transition: { duration: 1.1, ease: ease.out, delay: 0.12 + (i % 4) * 0.08 },
    transitionEnd: { filter: 'none' },
  }),
};

function Tile({ feature, index }: { feature: Feature; index: number }) {
  const linkRef = useRef<HTMLAnchorElement>(null);
  const hasImage = 'image' in feature;
  const Icon = 'icon' in feature ? icons[feature.icon] : null;
  const big = feature.size === 'xl';

  // Gradient hover: write the pointer position into CSS variables, no React state per move.
  const onPointerMove =
    feature.hover === 'gradient'
      ? (e: React.PointerEvent<HTMLAnchorElement>) => {
          const el = linkRef.current;
          if (!el) return;
          const r = el.getBoundingClientRect();
          el.style.setProperty('--mx', `${e.clientX - r.left}px`);
          el.style.setProperty('--my', `${e.clientY - r.top}px`);
        }
      : undefined;

  return (
    <motion.li
      variants={tileVariants}
      custom={index}
      initial="hidden"
      whileInView="visible"
      viewport={{ once: true, amount: 0.25 }}
      className={cn('flex flex-col md:min-h-0', big ? 'min-h-[26rem]' : 'min-h-[18rem]', spans[feature.size])}
    >
      <Link
        ref={linkRef}
        href={feature.href}
        onPointerMove={onPointerMove}
        className="glass group relative isolate flex flex-1 flex-col justify-between overflow-hidden rounded-3xl p-6 focus-visible:rounded-3xl md:p-8"
      >
        {hasImage && (
          <>
            {/* zoom: the image scales inside a fixed, positioned frame, so nothing around it moves. */}
            <div className="absolute inset-0 -z-10 transition-transform duration-[1400ms] ease-expo-out group-hover:scale-[1.08] group-focus-visible:scale-[1.08]">
              <Image src={feature.image} alt="" fill sizes={imageSizes[feature.size]} className="object-cover" />
            </div>
            {/* Legibility scrim for the text at the bottom. */}
            <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/70 to-ink/10" />
            {/* Overlay shift: a brand tint rises from the bottom corner on hover. */}
            <div
              aria-hidden
              className="absolute inset-0 -z-10 translate-y-1/4 bg-gradient-to-tr from-spark-blue/35 via-spark-royal/15 to-transparent opacity-0 transition-[opacity,transform] duration-700 ease-expo-out group-hover:translate-y-0 group-hover:opacity-100 group-focus-visible:translate-y-0 group-focus-visible:opacity-100"
            />
          </>
        )}

        {feature.hover === 'gradient' && (
          <>
            <div
              aria-hidden
              style={sheenFill}
              className="pointer-events-none absolute inset-0 -z-10 opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
            <div
              aria-hidden
              style={sheenBorder}
              className="pointer-events-none absolute -inset-px rounded-[inherit] opacity-0 transition-opacity duration-500 group-hover:opacity-100 group-focus-visible:opacity-100"
            />
          </>
        )}

        <div className="flex items-start justify-between gap-4">
          <span className="tabular font-mono text-eyebrow uppercase text-bone/50">
            {String(index + 1).padStart(2, '0')}
          </span>
          {/* Arrow: a bone disc scales in behind it and the arrow nudges up-right. */}
          <span
            aria-hidden
            className="relative grid h-11 w-11 shrink-0 place-items-center overflow-hidden rounded-full border bg-ink/40 text-bone transition-colors duration-500 group-hover:text-ink group-focus-visible:text-ink"
          >
            <span className="absolute inset-0 scale-0 rounded-full bg-bone transition-transform duration-500 ease-expo-out group-hover:scale-100 group-focus-visible:scale-100" />
            <ArrowUpRight
              className="relative h-5 w-5 transition-transform duration-500 ease-expo-out group-hover:-translate-y-0.5 group-hover:translate-x-0.5 group-focus-visible:-translate-y-0.5 group-focus-visible:translate-x-0.5"
              strokeWidth={1.5}
            />
          </span>
        </div>

        <div className="mt-10">
          {Icon && (
            <span
              aria-hidden
              className="mb-6 grid h-14 w-14 place-items-center rounded-2xl border bg-ink-800/60 text-bone"
            >
              <Icon
                strokeWidth={1.25}
                className={cn(
                  'h-7 w-7 transition-transform ease-expo-out',
                  feature.hover === 'spin'
                    ? 'duration-1000 group-hover:rotate-180 group-focus-visible:rotate-180'
                    : 'duration-500 group-hover:scale-110 group-focus-visible:scale-110',
                )}
              />
            </span>
          )}
          <h3 className={cn('font-display leading-none text-bone', big ? 'text-4xl md:text-6xl' : 'text-3xl md:text-[2.1rem]')}>
            {feature.title}
          </h3>
          <p className={cn('mt-3 leading-relaxed text-bone-muted', big ? 'max-w-[42ch] text-base md:text-lg' : 'max-w-[38ch] text-sm md:text-[0.95rem]')}>
            {feature.body}
          </p>
        </div>
      </Link>
    </motion.li>
  );
}

export function FeatureBento() {
  const headerRef = useRef<HTMLDivElement>(null);
  const headerInView = useInView(headerRef, { once: true, amount: 0.6 });

  return (
    <section id="capabilities" aria-labelledby="capabilities-title" className="relative isolate overflow-hidden pb-24 pt-12 md:pb-28 md:pt-16 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      {/* Soft brand glow behind the grid so the glass tiles have something to blur. */}
      <div
        aria-hidden
        style={glow}
        className="pointer-events-none absolute left-1/2 top-1/2 -z-10 h-[70vmax] w-[70vmax] -translate-x-1/2 -translate-y-1/3 rounded-full"
      />

      <div className="mx-auto w-full max-w-site px-gutter">
        <div ref={headerRef} className="mb-12 grid gap-6 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={headerInView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: ease.out }}
              className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60"
            >
              <span className="h-1.5 w-1.5 rounded-full bg-spark-royal" />
              Capabilities
            </motion.p>
            <h2 id="capabilities-title" className="font-display text-display-md text-bone">
              <RevealText text="Everything it takes" play={headerInView} />{' '}
              <RevealText
                text="to ship."
                play={headerInView}
                delay={0.24}
                wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
              />
            </h2>
          </div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={headerInView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.35 }}
            className="tabular font-mono text-eyebrow uppercase text-bone/50 md:col-span-4 md:text-right"
          >
            {String(features.length).padStart(2, '0')} services &middot; one team
          </motion.p>
        </div>

        {/*
         * Section transition: the grid opens from an inset, rounded window to full bleed.
         * -m-2/p-2 leaves room for the focus ring; clip-path is removed once open so it
         * can never clip outlines or act as a backdrop root.
         */}
        <motion.div
          initial={{ clipPath: 'inset(10% 4% 10% 4% round 32px)' }}
          whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 0px)', transitionEnd: { clipPath: 'none' } }}
          viewport={{ once: true, amount: 0.1 }}
          transition={{ duration: 1.3, ease: ease.inOut }}
          className="-m-2 p-2"
        >
          <ul
            className="grid grid-flow-dense grid-cols-1 gap-3 md:auto-rows-[minmax(16rem,auto)] md:grid-cols-2 md:gap-4 lg:grid-cols-12 lg:auto-rows-[minmax(16.5rem,auto)]"
          >
            {features.map((feature, i) => (
              <Tile key={feature.href} feature={feature} index={i} />
            ))}
          </ul>
        </motion.div>
      </div>
    </section>
  );
}
