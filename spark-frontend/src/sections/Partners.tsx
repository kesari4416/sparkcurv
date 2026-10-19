'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { partners } from '@/lib/content';
import { ease } from '@/lib/tokens';

/**
 * "We're working with": the partner logos on identical light tiles. The logos come with
 * white or transparent backgrounds, so they are multiplied into the tile colour, which
 * makes all six sit the same way in both the dark and light schemes. A logo drawn on its
 * own background colour gets a tile in that colour instead.
 */
export function Partners() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -15% 0px' });

  return (
    <section ref={ref} aria-labelledby="partners-title" className="py-16 md:py-20">
      <div className="mx-auto grid max-w-site gap-8 px-gutter lg:grid-cols-12 lg:items-center lg:gap-8">
        <motion.div
          initial={{ opacity: 0, y: 16 }}
          animate={inView ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.8, ease: ease.out }}
          className="lg:col-span-3"
        >
          <p className="mb-3 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
            <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spark-silver" />
            Partners
          </p>
          <h2 id="partners-title" className="font-display text-[clamp(1.5rem,2.2vw,2rem)] leading-tight tracking-[-0.02em] text-bone">
            We&apos;re working with
          </h2>
        </motion.div>

        <ul className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:col-span-9 lg:grid-cols-6">
          {partners.map((p, i) => (
            <motion.li
              key={p.name}
              initial={{ opacity: 0, y: 20 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: ease.out, delay: 0.1 + i * 0.06 }}
              className={`grid h-20 place-items-center rounded-2xl border md:h-24 ${'tile' in p ? 'px-2.5' : 'bg-[#F4F2ED] px-5'}`}
              style={'tile' in p ? { background: p.tile } : undefined}
            >
              <Image
                src={p.logo}
                alt={p.name}
                width={400}
                height={88}
                sizes="(min-width: 1024px) 12vw, (min-width: 640px) 28vw, 42vw"
                // A logo on its own coloured tile runs edge to edge (wide wordmarks stay legible).
                className={'tile' in p ? 'h-auto w-full object-contain' : 'max-h-9 w-auto object-contain mix-blend-multiply md:max-h-10'}
              />
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
