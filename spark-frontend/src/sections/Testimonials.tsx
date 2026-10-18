'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion, useScroll } from 'framer-motion';
import { testimonials as allTestimonials } from '@/lib/content';

// Only approved quotes are shown. Placeholders (placeholder: true in content.ts) never ship;
// with none approved yet, the section renders nothing.
const testimonials = allTestimonials.filter((t) => !t.placeholder);
import { ease, palette } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { useDragScroll } from './testimonials/useDragScroll';

/**
 * The track bleeds off the right edge of the screen, but its first card lines up with the
 * header above it (which lives in a centred max-w-site container with gutter padding).
 * Padding % resolves against the section width, so this matches the header at any size.
 * The same value is used as scroll-padding so snap-start lands cards on that line.
 */
const GUTTER = 'clamp(1.25rem, 4vw, 3.5rem)';
const TRACK_INSET = `max(${GUTTER}, calc((100% - 1680px) / 2 + ${GUTTER}))`;

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('h-4 w-4', dir === 'prev' && 'rotate-180')} fill="none">
      <path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Testimonials() {
  if (testimonials.length === 0) return null;
  return <TestimonialsCarousel />;
}

function TestimonialsCarousel() {
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.25 });
  // Only used for transition timing: `initial` must match the server render (where this is null).
  const reduce = useReducedMotion();
  const { ref: trackRef, handlers, nearestIndex, scrollToIndex } = useDragScroll<HTMLUListElement>();
  const cardRefs = useRef<(HTMLElement | null)[]>([]);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const [active, setActive] = useState(0);
  const { scrollXProgress } = useScroll({ container: trackRef });
  const count = testimonials.length;

  // Keep the prev/next disabled states and the counter in sync with the scroll position.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      setEdges({ atStart: el.scrollLeft <= 2, atEnd: el.scrollLeft >= max - 2 });
      setActive(nearestIndex());
    };
    const schedule = () => {
      if (!raf) raf = requestAnimationFrame(update);
    };
    update();
    el.addEventListener('scroll', schedule, { passive: true });
    const ro = new ResizeObserver(schedule);
    ro.observe(el);
    return () => {
      el.removeEventListener('scroll', schedule);
      ro.disconnect();
      cancelAnimationFrame(raf);
    };
  }, [trackRef, nearestIndex]);

  const go = useCallback((delta: number) => scrollToIndex(nearestIndex() + delta), [nearestIndex, scrollToIndex]);

  // Arrow keys / Home / End move focus card to card; the track scrolls with it.
  const onKeyDown = (e: React.KeyboardEvent<HTMLUListElement>) => {
    const keys: Record<string, (i: number) => number> = {
      ArrowRight: (i) => i + 1,
      ArrowLeft: (i) => i - 1,
      Home: () => 0,
      End: () => count - 1,
    };
    const next = keys[e.key];
    if (!next) return;
    e.preventDefault();
    const focused = cardRefs.current.findIndex((c) => c === document.activeElement);
    const target = Math.max(0, Math.min(count - 1, next(focused >= 0 ? focused : nearestIndex())));
    cardRefs.current[target]?.focus({ preventScroll: true });
    scrollToIndex(target);
  };

  return (
    <section ref={sectionRef} aria-labelledby="testimonials-title" className="relative overflow-hidden py-20 md:py-28">
      {/* Clip-path reveal: the whole section wipes open left to right, the way the carousel moves. */}
      <motion.div
        initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: reduce ? 0 : 1.4, ease: ease.inOut }}
        className="relative isolate"
      >
        {/* Soft colour behind the track so the glass cards have something to frost. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-x-0 bottom-0 top-1/3 -z-10 opacity-60"
          style={{
            background: `radial-gradient(40% 60% at 20% 60%, ${palette.spark.silver}33, transparent 70%), radial-gradient(35% 55% at 75% 40%, ${palette.spark.blue}26, transparent 70%)`,
          }}
        />

        <div className="mx-auto flex max-w-site flex-col gap-10 px-gutter md:flex-row md:items-end md:justify-between">
          <div>
            <p className="mb-6 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
              <span className="h-1.5 w-1.5 rounded-full bg-spark-royal" />
              Testimonials
            </p>
            <h2 id="testimonials-title" className="max-w-[14ch] font-display text-display-md text-bone">
              In their <span className="text-gradient font-light">words.</span>
            </h2>
          </div>

          <div className="flex items-center gap-5">
            <p className="tabular font-mono text-xs uppercase tracking-[0.16em] text-bone-muted" aria-hidden>
              {String(active + 1).padStart(2, '0')} <span className="text-bone/60">/ {String(count).padStart(2, '0')}</span>
            </p>
            <div className="flex gap-2">
              {(['prev', 'next'] as const).map((dir) => {
                const disabled = dir === 'prev' ? edges.atStart : edges.atEnd;
                return (
                  <button
                    key={dir}
                    type="button"
                    onClick={() => go(dir === 'prev' ? -1 : 1)}
                    disabled={disabled}
                    aria-label={dir === 'prev' ? 'Previous testimonial' : 'Next testimonial'}
                    className="grid h-12 w-12 place-items-center rounded-full border text-bone transition-[background-color,color,opacity] duration-500 ease-expo-out hover:bg-bone hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                  >
                    <Arrow dir={dir} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>

        <ul
          ref={trackRef}
          {...handlers}
          onKeyDown={onKeyDown}
          aria-label="Client testimonials"
          className="scrollbar-hide mt-14 flex snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 md:mt-20 md:gap-6"
          style={{ paddingInline: TRACK_INSET, scrollPaddingInline: TRACK_INSET }}
        >
          {testimonials.map((t, i) => (
            <li key={i} className="w-[84vw] max-w-[38rem] shrink-0 snap-start sm:w-[62vw] lg:w-[40vw]">
              {/* Cards rise out of a clip mask one after another once the wipe is under way. */}
              <motion.figure
                ref={(node: HTMLElement | null) => {
                  cardRefs.current[i] = node;
                }}
                tabIndex={0}
                initial={{ y: 80, clipPath: 'inset(100% 0% 0% 0% round 1.5rem)' }}
                animate={inView ? { y: 0, clipPath: 'inset(0% 0% 0% 0% round 1.5rem)' } : undefined}
                transition={reduce ? { duration: 0 } : { duration: 1.1, ease: ease.out, delay: 0.45 + i * 0.1 }}
                /* Inset focus ring: the card's own clip-path and the scroller would crop an outer one. */
                className="glass flex h-full focus-visible:outline-offset-[-2px] min-h-[24rem] flex-col justify-between rounded-3xl p-7 md:min-h-[28rem] md:p-10"
              >
                <div>
                  <div className="flex items-start justify-between gap-4">
                    <span aria-hidden className="text-gradient -mb-8 block select-none font-display text-[7rem] leading-none md:text-[8.5rem]">
                      &ldquo;
                    </span>
                    {t.placeholder && (
                      <span className="mt-3 shrink-0 rounded-full border border-dashed border-spark-blue/70 bg-spark-blue/10 px-3 py-1.5 font-mono text-[0.65rem] uppercase tracking-[0.14em] text-spark-blue">
                        Sample — replace before launch
                      </span>
                    )}
                  </div>
                  <blockquote className="font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-[1.15] text-bone">
                    <p>{t.quote}</p>
                  </blockquote>
                </div>
                <figcaption className="mt-10 flex items-center gap-4 border-t pt-6 font-mono text-xs uppercase tracking-[0.16em]">
                  <span aria-hidden className="h-2 w-2 shrink-0 rounded-full bg-spark" />
                  <span>
                    <span className="block text-bone">{t.name}</span>
                    <span className="mt-1.5 block text-bone-muted">{t.role}</span>
                  </span>
                </figcaption>
              </motion.figure>
            </li>
          ))}
        </ul>

        {/* Scroll progress: a hairline that fills with the brand gradient (transform only). */}
        <div className="mx-auto mt-10 max-w-site px-gutter" aria-hidden>
          <div className="h-px w-full overflow-hidden bg-hairline">
            <motion.div className="h-full origin-left bg-spark" style={{ scaleX: scrollXProgress }} />
          </div>
        </div>
      </motion.div>
    </section>
  );
}
