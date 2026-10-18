'use client';

import { motion } from 'framer-motion';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';
import { CTAButton } from '@/components/CTAButton';

/**
 * "What we offer": a sticky heading on the left and the numbered capabilities on the
 * right, two columns on wide screens. Each row rises in as it enters the viewport.
 */
export function OfferList({ features }: { features: string[] }) {
  const count = ['Zero', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven', 'Eight', 'Nine', 'Ten'][features.length] ?? features.length;
  return (
    // No overflow-hidden: it would break the sticky column.
    <section aria-labelledby="offer-title" className="relative py-24 md:py-32">
      <div className="mx-auto grid max-w-site gap-12 px-gutter lg:grid-cols-12 lg:gap-8">
        <div className="lg:sticky lg:top-44 lg:col-span-4 lg:self-start">
          <SectionIntro
            id="offer-title"
            eyebrow="What we offer"
            lead="Everything"
            accent="in scope."
            body={
              <>
                <p>
                  {count} capabilities. Take one, or the whole set.
                </p>
                <div className="mt-8">
                  <CTAButton />
                </div>
              </>
            }
          />
        </div>

        <ol className="grid border-t sm:grid-cols-2 sm:gap-x-8 lg:col-span-8 lg:col-start-5">
          {features.map((feature, i) => (
            <motion.li
              key={feature}
              initial={{ opacity: 0, y: 32 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -8% 0px' }}
              transition={{ duration: 0.8, ease: ease.out, delay: (i % 2) * 0.08 }}
              className="group relative flex items-baseline gap-5 border-b py-6 md:py-8"
            >
              <span aria-hidden className="tabular w-6 shrink-0 font-mono text-eyebrow text-bone/40 transition-colors duration-500 group-hover:text-spark-blue">
                {String(i + 1).padStart(2, '0')}
              </span>
              <span className="font-display text-[clamp(1.25rem,1.8vw,1.6rem)] leading-tight tracking-[-0.015em] text-bone">
                {feature}
              </span>
              <span
                aria-hidden
                className="pointer-events-none absolute inset-x-0 -bottom-px h-px origin-left bg-spark opacity-0 motion-safe:scale-x-0 motion-safe:opacity-100 motion-safe:transition-transform motion-safe:duration-700 motion-safe:ease-expo-out motion-safe:group-hover:scale-x-100"
              />
            </motion.li>
          ))}
        </ol>
      </div>
    </section>
  );
}
