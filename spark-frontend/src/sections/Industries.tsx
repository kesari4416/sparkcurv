'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import Image from 'next/image';
import Link from 'next/link';
import { motion, useInView, useReducedMotion, useScroll } from 'framer-motion';
import { industries } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { RevealText } from '@/components/RevealText';
import { useDragScroll } from './testimonials/useDragScroll';

/** Every card leads to the same service page: industry work is delivered as web/app builds. */
const CARD_HREF = '/application-development/web-development';

/**
 * Same alignment trick as Testimonials: the track bleeds off the right edge while its first
 * card lines up with the header's gutter (and snap-start lands cards on that line).
 */
const GUTTER = 'clamp(1.25rem, 4vw, 3.5rem)';
const TRACK_INSET = `max(${GUTTER}, calc((100% - 1680px) / 2 + ${GUTTER}))`;

/** Card width: 78vw on phones, capped at 26rem (see the li classes below). */
const IMAGE_SIZES = '(min-width: 640px) 26rem, 78vw';

function Arrow({ dir }: { dir: 'prev' | 'next' }) {
  return (
    <svg aria-hidden viewBox="0 0 24 24" className={cn('h-4 w-4', dir === 'prev' && 'rotate-180')} fill="none">
      <path d="M4 12h15m0 0-6-6m6 6-6 6" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" />
    </svg>
  );
}

export function Industries() {
  // Observe the unclipped section: an element whose own clip-path starts (nearly) closed is
  // never reported as intersecting by Chromium, so the clipped track cannot trigger itself.
  const sectionRef = useRef<HTMLElement>(null);
  const inView = useInView(sectionRef, { once: true, amount: 0.2 });
  // Only used for transition timing: `initial` must match the server render (where this is null).
  const reduce = useReducedMotion();
  const { ref: trackRef, handlers, nearestIndex, scrollToIndex } = useDragScroll<HTMLUListElement>();
  const cardRefs = useRef<(HTMLAnchorElement | null)[]>([]);
  const [edges, setEdges] = useState({ atStart: true, atEnd: false });
  const [active, setActive] = useState(0);
  const { scrollXProgress } = useScroll({ container: trackRef });
  const count = industries.length;

  // Keep the prev/next disabled states and the counter in sync with the scroll position.
  // Batched to one rAF per frame, and state only changes when a value actually changes.
  useEffect(() => {
    const el = trackRef.current;
    if (!el) return;
    let raf = 0;
    const update = () => {
      raf = 0;
      const max = el.scrollWidth - el.clientWidth;
      const atStart = el.scrollLeft <= 2;
      const atEnd = el.scrollLeft >= max - 2;
      setEdges((prev) => (prev.atStart === atStart && prev.atEnd === atEnd ? prev : { atStart, atEnd }));
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
    <section
      ref={sectionRef}
      id="industries"
      aria-labelledby="industries-title"
      className="relative overflow-hidden py-20 md:py-28"
      // Skip rendering work while far off-screen; the intrinsic size keeps the scrollbar stable.
      style={{ contentVisibility: 'auto', containIntrinsicSize: 'auto 1000px' }}
    >
      <div className="mx-auto flex max-w-site flex-col gap-10 px-gutter md:flex-row md:items-end md:justify-between">
        <div>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.8, ease: ease.out }}
            className="mb-6 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60"
          >
            <span className="h-1.5 w-1.5 rounded-full bg-spark-royal" />
            Industries
          </motion.p>
          <h2 id="industries-title" className="max-w-[16ch] font-display text-display-md text-bone">
            <RevealText text="Built for" play={inView} />{' '}
            <RevealText
              text="every"
              play={inView}
              delay={0.16}
              wordClassName="text-gradient animate-gradient-pan pr-[0.06em] font-light"
            />{' '}
            <RevealText text="industry." play={inView} delay={0.24} />
          </h2>
          <motion.p
            initial={{ opacity: 0, y: 16 }}
            animate={inView ? { opacity: 1, y: 0 } : undefined}
            transition={{ duration: reduce ? 0 : 0.8, ease: ease.out, delay: reduce ? 0 : 0.35 }}
            className="mt-6 max-w-[40ch] text-base leading-relaxed text-bone-muted md:text-lg"
          >
            Domain-specific solutions across {count} sectors.
          </motion.p>
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
                  aria-label={dir === 'prev' ? 'Previous industry' : 'Next industry'}
                  className="grid h-12 w-12 place-items-center rounded-full border text-bone transition-[background-color,color,opacity] duration-500 ease-expo-out hover:bg-bone hover:text-ink disabled:pointer-events-none disabled:opacity-30"
                >
                  <Arrow dir={dir} />
                </button>
              );
            })}
          </div>
        </div>
      </div>

      {/*
       * Clip-path wipe: the track opens left to right, the way the carousel moves. Triggered by
       * the section's inView (see above). The clip is dropped once open so it can never crop
       * focus rings or interfere with the drag.
       */}
      <motion.div
        initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        animate={inView ? { clipPath: 'inset(0% 0% 0% 0%)', transitionEnd: { clipPath: 'none' } } : undefined}
        transition={{ duration: reduce ? 0 : 1.4, ease: ease.inOut }}
        className="mt-14 md:mt-20"
      >
        <ul
          ref={trackRef}
          {...handlers}
          onKeyDown={onKeyDown}
          aria-label="Industries we serve"
          className="scrollbar-hide flex cursor-grab snap-x snap-mandatory gap-4 overflow-x-auto overscroll-x-contain pb-2 active:cursor-grabbing md:gap-6"
          style={{ paddingInline: TRACK_INSET, scrollPaddingInline: TRACK_INSET }}
        >
          {industries.map((industry, i) => (
            <li key={industry.name} className="w-[78vw] max-w-[26rem] shrink-0 snap-start">
              {/* The li stays put (the drag hook measures it); the card inside rises into place. */}
              <motion.div
                initial={{ opacity: 0, y: 64 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={reduce ? { duration: 0 } : { duration: 1.1, ease: ease.out, delay: 0.4 + i * 0.08 }}
              >
                <Link
                  ref={(node: HTMLAnchorElement | null) => {
                    cardRefs.current[i] = node;
                  }}
                  href={CARD_HREF}
                  draggable={false}
                  /* Inset focus ring: the scroller would crop an outer one. */
                  className="group relative isolate block aspect-[4/5] overflow-hidden rounded-3xl bg-ink-800 focus-visible:outline-offset-[-2px]"
                >
                  {/* Zoom: the photo scales inside the fixed-aspect frame, so nothing around it moves. */}
                  <div className="absolute inset-0 -z-10 transition-transform duration-[1400ms] ease-expo-out group-hover:scale-[1.06] group-focus-visible:scale-[1.06]">
                    <Image
                      src={industry.image}
                      alt={industry.name}
                      fill
                      sizes={IMAGE_SIZES}
                      loading="lazy"
                      draggable={false}
                      className="object-cover"
                    />
                  </div>

                  {/* Legibility scrim: sits slightly low and lifts on hover (transform only). */}
                  <div
                    aria-hidden
                    className="absolute inset-x-0 bottom-0 -z-10 h-[75%] translate-y-[12%] bg-gradient-to-t from-ink via-ink/70 to-transparent transition-transform duration-700 ease-expo-out group-hover:translate-y-0 group-focus-visible:translate-y-0"
                  />

                  <span aria-hidden className="tabular absolute left-6 top-6 font-mono text-eyebrow uppercase text-bone/70 md:left-7 md:top-7">
                    {String(i + 1).padStart(2, '0')}
                  </span>

                  <div className="absolute inset-x-0 bottom-0 p-6 md:p-7">
                    <h3 className="font-display text-[2rem] leading-none text-bone">{industry.name}</h3>
                    <p className="mt-3 max-w-[32ch] text-sm leading-relaxed text-bone-muted md:text-[0.95rem]">{industry.body}</p>
                  </div>
                </Link>
              </motion.div>
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
