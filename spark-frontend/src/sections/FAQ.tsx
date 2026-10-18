'use client';

import { useId, useRef, useState } from 'react';
import Link from 'next/link';
import { motion, useInView } from 'framer-motion';
import { faqs as homeFaqs } from '@/lib/content';
import type { Faq } from '@/lib/services';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { RevealText } from '@/components/RevealText';

/** FAQPage structured data. `<` is escaped so no answer text can close the script tag. */
function faqJson(items: Faq[]) {
  const schema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: items.map((f) => ({
      '@type': 'Question',
      name: f.q,
      acceptedAnswer: { '@type': 'Answer', text: f.a },
    })),
  };
  return JSON.stringify(schema).replace(/</g, '\\u003c');
}

/** Plus drawn from two bars; the whole mark turns 45deg into a cross when open. */
function PlusIcon({ open }: { open: boolean }) {
  return (
    <span
      aria-hidden
      className={cn(
        'relative grid h-10 w-10 shrink-0 place-items-center rounded-full border transition-colors duration-500 md:h-12 md:w-12',
        open ? 'border-spark-blue bg-spark-blue text-bone' : 'text-bone/70 group-hover:border-bone/30 group-hover:text-bone',
      )}
    >
      <span
        className={cn(
          'relative block h-3.5 w-3.5 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out',
          open && 'rotate-45',
        )}
      >
        <span className="absolute left-0 top-1/2 h-[1.5px] w-full -translate-y-1/2 rounded-full bg-current" />
        <span className="absolute left-1/2 top-0 h-full w-[1.5px] -translate-x-1/2 rounded-full bg-current" />
      </span>
    </span>
  );
}

/** Questions and answers in an accordion. Defaults to the company-level FAQ of the home page. */
export function FAQ({ items = homeFaqs }: { items?: readonly Faq[] }) {
  const faqs = items;
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px -25% 0px' });
  const [open, setOpen] = useState<number | null>(0);
  const baseId = useId();

  return (
    <section ref={sectionRef} id="faq" aria-labelledby="faq-title" className="relative py-24 md:py-32 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
      <script type="application/ld+json" dangerouslySetInnerHTML={{ __html: faqJson([...faqs]) }} />

      <div className="mx-auto w-full max-w-site px-gutter">
        <div className="mb-12 grid gap-8 md:mb-16 md:grid-cols-12 md:items-end">
          <div className="md:col-span-8">
            <motion.p
              initial={{ opacity: 0, y: 16 }}
              animate={inView ? { opacity: 1, y: 0 } : undefined}
              transition={{ duration: 0.8, ease: ease.out }}
              className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60"
            >
              <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spark-silver" />
              FAQ
            </motion.p>
            <h2 id="faq-title" className="font-display text-display-md text-bone">
              <RevealText text="Questions," play={inView} />{' '}
              <RevealText
                text="answered."
                play={inView}
                delay={0.16}
                wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
              />
            </h2>
          </div>

          <motion.div
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: 0.8, ease: ease.out, delay: 0.35 }}
            className="md:col-span-4 md:text-right"
          >
            <Link
              href="/contact"
              className="group relative inline-flex items-center gap-2 pb-1 text-base text-bone md:text-lg"
            >
              <span className="text-bone-muted transition-colors duration-300 group-hover:text-bone">
                Still have a question?
              </span>{' '}
              Talk to us
              <span
                aria-hidden
                className="inline-block motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out group-hover:translate-x-1"
              >
                →
              </span>
              <span
                aria-hidden
                className="absolute inset-x-0 bottom-0 h-px origin-right bg-spark motion-safe:scale-x-0 motion-safe:transition-transform motion-safe:duration-500 motion-safe:ease-expo-out motion-safe:group-hover:origin-left motion-safe:group-hover:scale-x-100"
              />
            </Link>
          </motion.div>
        </div>

        <ul className="border-t lg:ml-[calc(100%/12*2)]">
          {faqs.map((faq, i) => {
            const isOpen = open === i;
            const buttonId = `${baseId}-q${i}`;
            const panelId = `${baseId}-a${i}`;
            return (
              <motion.li
                key={faq.q}
                initial={{ opacity: 0, y: 24 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.8, ease: ease.out, delay: 0.3 + i * 0.07 }}
                className="border-b"
              >
                <h3>
                  <button
                    type="button"
                    id={buttonId}
                    aria-expanded={isOpen}
                    aria-controls={panelId}
                    onClick={() => setOpen(isOpen ? null : i)}
                    className="group grid w-full grid-cols-[auto_1fr_auto] items-center gap-x-5 py-6 text-left md:gap-x-8 md:py-8"
                  >
                    <span aria-hidden className="tabular w-6 font-mono text-eyebrow text-bone/40">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <span
                      className={cn(
                        'font-display text-[clamp(1.25rem,2.1vw,1.6rem)] leading-tight tracking-[-0.015em] transition-colors duration-300',
                        isOpen ? 'text-bone' : 'text-bone/80 group-hover:text-bone',
                      )}
                    >
                      {faq.q}
                    </span>
                    <PlusIcon open={isOpen} />
                  </button>
                </h3>

                {/*
                 * Height animation without measuring: a one-row grid whose track goes from
                 * 0fr to 1fr, with the content in an overflow-hidden child. Closed panels are
                 * inert, so their text is skipped by Tab and by screen readers.
                 */}
                <div
                  id={panelId}
                  role="region"
                  aria-labelledby={buttonId}
                  inert={!isOpen}
                  className={cn(
                    'grid motion-safe:transition-[grid-template-rows] motion-safe:duration-500 motion-safe:ease-expo-out',
                    isOpen ? 'grid-rows-[1fr]' : 'grid-rows-[0fr]',
                  )}
                >
                  <div className="min-h-0 overflow-hidden">
                    <p
                      className={cn(
                        'max-w-[72ch] pb-8 pl-[2.75rem] pr-[3.75rem] text-base leading-relaxed text-bone-muted transition-opacity duration-500 md:pb-10 md:pl-14 md:pr-20 md:text-lg',
                        isOpen ? 'opacity-100' : 'opacity-0',
                      )}
                    >
                      {faq.a}
                    </p>
                  </div>
                </div>
              </motion.li>
            );
          })}
        </ul>
      </div>
    </section>
  );
}
