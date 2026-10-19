'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { partners } from '@/lib/content';
import { ease } from '@/lib/tokens';

type Partner = (typeof partners)[number];

// Soft fade at both ends of the strip, so logos appear and leave gently.
const edgeFade = 'linear-gradient(90deg,transparent,#000_8%,#000_92%,transparent)';

/**
 * One partner tile. The logos come with white or transparent backgrounds, so they are
 * multiplied into the tile colour, which keeps them looking the same in both schemes. A logo
 * drawn on its own background colour gets a tile in that colour instead.
 */
function PartnerTile({ partner, decorative }: { partner: Partner; decorative: boolean }) {
  const ownTile = 'tile' in partner;
  return (
    <div
      className={`grid h-20 w-44 shrink-0 place-items-center rounded-2xl border md:h-24 md:w-52 ${ownTile ? 'px-2.5' : 'bg-[#F4F2ED] px-5'}`}
      style={ownTile ? { background: partner.tile } : undefined}
    >
      <Image
        src={partner.logo}
        alt={decorative ? '' : partner.name}
        width={400}
        height={88}
        sizes="208px"
        // A logo on its own coloured tile runs edge to edge (wide wordmarks stay legible).
        className={ownTile ? 'h-auto w-full object-contain' : 'max-h-9 w-auto object-contain mix-blend-multiply md:max-h-10'}
      />
    </div>
  );
}

/**
 * "We're working with": the partner logos roll past in an endless horizontal loop. The strip
 * holds two identical sets of tiles and moves one set's width (the `marquee` keyframe), so the
 * loop joins up with no jump. The second set is hidden from screen readers. Hovering pauses it.
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

        <div className="group min-w-0 overflow-hidden lg:col-span-9" style={{ maskImage: edgeFade, WebkitMaskImage: edgeFade }}>
          <motion.div
            initial={{ opacity: 0 }}
            animate={inView ? { opacity: 1 } : undefined}
            transition={{ duration: 0.8, ease: ease.out }}
            className="flex w-max animate-marquee group-hover:[animation-play-state:paused]"
          >
            {[false, true].map((decorative) => (
              <div key={decorative ? 'copy' : 'set'} aria-hidden={decorative || undefined} className="flex shrink-0 gap-3 pr-3">
                {partners.map((p) => (
                  <PartnerTile key={p.name} partner={p} decorative={decorative} />
                ))}
              </div>
            ))}
          </motion.div>
        </div>
      </div>
    </section>
  );
}
