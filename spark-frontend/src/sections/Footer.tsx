'use client';

import Link from 'next/link';
import { useEffect, useRef, useSyncExternalStore } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
import { ArrowUp, ArrowUpRight, Facebook, Instagram, Linkedin, Twitter, Youtube, type LucideIcon } from 'lucide-react';
import { hero, nav, site, socials } from '@/lib/content';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { useClock } from '@/hooks/useClock';
import { ScrambleText } from '@/components/ScrambleText';
import { Magnetic } from '@/components/Magnetic';

/** Same order as hero.services. */
const serviceHrefs = ['/ai-ml', '/managed-cloud-service', '/application-development', '/digital-growth'];

const socialIcons: Record<(typeof socials)[number]['label'], LucideIcon> = {
  LinkedIn: Linkedin,
  Instagram,
  X: Twitter, // lucide has no X logo; the bird stands in
  Facebook,
  YouTube: Youtube,
};

const noSubscribe = () => () => {};

/**
 * Current year, read on the client only. A statically rendered page would otherwise
 * freeze the build year in the HTML, and reading the clock during hydration could
 * mismatch the server. The server snapshot is null; the year appears right after
 * hydration in a width-reserved slot.
 */
function useYear() {
  return useSyncExternalStore(noSubscribe, () => new Date().getFullYear(), () => null);
}

function scrollToTop(reduce: boolean) {
  const lenis = useUI.getState().lenis;
  if (lenis) lenis.scrollTo(0);
  else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
}

const eyebrow = 'font-mono text-eyebrow uppercase text-bone-muted';
const listLink = 'inline-block py-1 text-bone/80 transition-colors duration-300 hover:text-bone focus-visible:text-bone';

export function Footer() {
  const time = useClock(site.timeZone);
  const year = useYear();
  const reduce = !!useReducedMotion();

  return (
    <footer className="relative isolate overflow-hidden border-t bg-ink pt-24 md:pt-32">
      <div className="mx-auto max-w-site px-gutter">
        <p className="mb-16 max-w-[46ch] text-xl leading-snug text-bone-muted md:mb-20 md:text-2xl">{site.tagline}</p>
        <div className="grid gap-14 md:grid-cols-12 md:gap-x-8">
          {/* Contact */}
          <div className="md:col-span-12 lg:col-span-6">
            <h2 className={eyebrow}>Say hello</h2>
            <a
              href={`mailto:${site.email}`}
              className="mt-6 inline-block font-display text-[clamp(1.6rem,3.6vw,3.2rem)] [overflow-wrap:anywhere] leading-none tracking-tight text-bone transition-colors duration-300 hover:text-bone-muted"
            >
              <ScrambleText text={site.email} duration={550} />
            </a>
            <p className="mt-5">
              <a href={`tel:${site.phone.replace(/\s+/g, '')}`} className={`${listLink} font-mono text-sm tracking-wide`}>
                <ScrambleText text={site.phone} />
              </a>
            </p>
            <address className="mt-8 max-w-[34ch] not-italic leading-relaxed text-bone-muted">
              {site.address.map((line) => (
                <span key={line} className="block">
                  {line}
                </span>
              ))}
            </address>
          </div>

          {/* Navigation */}
          <nav aria-labelledby="footer-nav-title" className="md:col-span-4 lg:col-span-2 lg:col-start-7">
            <h2 id="footer-nav-title" className={eyebrow}>
              Navigate
            </h2>
            <ul className="mt-6 grid grid-cols-2 gap-x-6 md:grid-cols-1">
              {nav.map((item) => (
                <li key={item.href}>
                  <Link href={item.href} className={listLink}>
                    <ScrambleText text={item.label} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Services */}
          <nav aria-labelledby="footer-services-title" className="md:col-span-4 lg:col-span-2">
            <h2 id="footer-services-title" className={eyebrow}>
              Services
            </h2>
            <ul className="mt-6">
              {hero.services.map((service, i) => (
                <li key={service}>
                  <Link href={serviceHrefs[i] ?? '/'} className={listLink}>
                    <ScrambleText text={service} />
                  </Link>
                </li>
              ))}
            </ul>
          </nav>

          {/* Socials */}
          <div className="md:col-span-4 lg:col-span-2">
            <h2 className={eyebrow}>Follow</h2>
            <ul aria-label="Social media" className="mt-6 flex flex-wrap gap-3">
              {socials.map((s) => (
                <li key={s.label}>
                  <SocialButton label={s.label} href={s.href} />
                </li>
              ))}
            </ul>
          </div>
        </div>

        {/* Bottom line */}
        <div className="mt-20 flex flex-col gap-6 border-t pt-8 md:mt-28 md:flex-row md:items-center md:justify-between">
          <p className="font-mono text-[11px] uppercase tracking-[0.16em] text-bone-muted">
            ©{' '}
            <span className="tabular inline-block min-w-[4ch]" suppressHydrationWarning>
              {year ?? ''}
            </span>{' '}
            {site.legalName}. All rights reserved.
          </p>

          <p className={eyebrow}>
            Local time {site.timeZoneLabel}{' '}
            <time className="tabular inline-block min-w-[8ch] text-bone" dateTime={time || undefined} suppressHydrationWarning>
              {time || '--:--:--'}
            </time>
          </p>

          <Magnetic strength={0.4} className="self-start md:self-auto">
            <button
              type="button"
              onClick={() => scrollToTop(reduce)}
              className="glass group inline-flex items-center gap-3 rounded-full py-3 pl-5 pr-3 font-mono text-eyebrow uppercase text-bone transition-colors duration-300 hover:bg-bone/10"
            >
              <ScrambleText text="Back to top" />
              <span aria-hidden className="grid h-8 w-8 place-items-center overflow-hidden rounded-full bg-bone text-ink">
                {/* The arrow exits upward and a twin enters from below: reads as "lift off". */}
                <span className="relative block h-4 w-4">
                  <ArrowUp className="absolute inset-0 h-4 w-4 transition-transform duration-500 ease-expo-out group-hover:-translate-y-6" strokeWidth={1.75} />
                  <ArrowUp className="absolute inset-0 h-4 w-4 translate-y-6 transition-transform duration-500 ease-expo-out group-hover:translate-y-0" strokeWidth={1.75} />
                </span>
              </span>
            </button>
          </Magnetic>
        </div>

        <GiantWordmark reduce={reduce} />
      </div>
    </footer>
  );
}

/**
 * Round glass button whose brand icon morphs into an ArrowUpRight on hover/focus: the two
 * icons are stacked and crossfade while rotating/scaling past each other, and a gradient
 * disc grows behind them. CSS transitions only (transform/opacity).
 */
function SocialButton({ label, href }: { label: (typeof socials)[number]['label']; href: string }) {
  const Icon = socialIcons[label];
  const morph = 'absolute h-[18px] w-[18px] transition-[transform,opacity] duration-500 ease-expo-out';
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label={`${site.name} on ${label}`}
      className="glass group relative grid h-12 w-12 place-items-center overflow-hidden rounded-full text-bone"
    >
      <span
        aria-hidden
        className="absolute inset-0 scale-0 rounded-full bg-spark transition-transform duration-500 ease-expo-out group-hover:scale-100 group-focus-visible:scale-100"
      />
      <Icon
        aria-hidden
        strokeWidth={1.5}
        className={`${morph} group-hover:rotate-45 group-hover:scale-50 group-hover:opacity-0 group-focus-visible:rotate-45 group-focus-visible:scale-50 group-focus-visible:opacity-0`}
      />
      <ArrowUpRight
        aria-hidden
        strokeWidth={1.75}
        className={`${morph} -rotate-45 scale-50 text-ink opacity-0 group-hover:rotate-0 group-hover:scale-100 group-hover:opacity-100 group-focus-visible:rotate-0 group-focus-visible:scale-100 group-focus-visible:opacity-100`}
      />
    </a>
  );
}

/**
 * "SparkCurv" sized to span the container edge to edge. An outline copy is always there;
 * a gradient copy on top is wiped in left to right with clip-path when it scrolls into view.
 *
 * Sizing: `text-[21vw]` is the server/no-JS estimate. On the client we measure the
 * outline copy at that size and scale the font so its width equals the container's,
 * whatever the display font's real metrics. It re-fits on width changes and once web
 * fonts have loaded. The footer is far below the fold, so the correction causes no
 * visible shift.
 */
function GiantWordmark({ reduce }: { reduce: boolean }) {
  const boxRef = useRef<HTMLDivElement>(null);
  const measureRef = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    const box = boxRef.current;
    const measure = measureRef.current;
    if (!box || !measure) return;
    let lastWidth = -1;
    let alive = true;

    const fit = (force = false) => {
      const width = box.clientWidth;
      // Changing the font size changes the box height, which re-fires the observer:
      // only act on width changes so that doesn't loop.
      if (!force && width === lastWidth) return;
      lastWidth = width;
      box.style.fontSize = '';
      const base = parseFloat(getComputedStyle(box).fontSize);
      const natural = measure.getBoundingClientRect().width;
      // 0.995 leaves a hair of room for sub-pixel rounding.
      if (natural > 0 && base > 0) box.style.fontSize = `${((base * width) / natural) * 0.995}px`;
    };

    fit(true);
    document.fonts?.ready.then(() => alive && fit(true));
    const ro = new ResizeObserver(() => fit());
    ro.observe(box);
    return () => {
      alive = false;
      ro.disconnect();
    };
  }, []);

  const wordmarkInView = useInView(boxRef, { once: true, amount: 0.4 });

  return (
    <div
      ref={boxRef}
      aria-hidden
      className="relative mt-10 select-none whitespace-nowrap font-display text-[21vw] leading-[0.8] tracking-[-0.03em] md:mt-14"
    >
      {/* Vertical padding keeps the ascenders and the "p" descender inside the box, and so inside the clip, despite the tight 0.8 line height. */}
      <span ref={measureRef} className="text-outline inline-block pb-[0.18em] pt-[0.1em]">
        {site.name}
      </span>
      <motion.span
        className="text-gradient absolute left-0 top-0 inline-block animate-gradient-pan pb-[0.18em] pt-[0.1em]"
        // `initial` is the same on server and client (no hydration mismatch); reduced
        // motion just makes the wipe instant.
        initial={{ clipPath: 'inset(0% 100% 0% 0%)' }}
        // Triggered by the unclipped wrapper (boxRef): this span starts fully clipped, so
        // it would never itself count as "in view".
        animate={wordmarkInView ? { clipPath: 'inset(0% 0% 0% 0%)' } : undefined}
        transition={{ duration: reduce ? 0 : 1.6, ease: ease.inOut }}
      >
        {site.name}
      </motion.span>
    </div>
  );
}
