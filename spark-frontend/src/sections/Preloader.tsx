'use client';

import { useEffect, useRef, useState } from 'react';
import { motion } from 'framer-motion';
import { useUI } from '@/lib/store';
import { duration, ease } from '@/lib/tokens';
import { prefersReducedMotion } from '@/lib/device';
import { site } from '@/lib/content';

type Phase = 'loading' | 'leaving' | 'gone';

const easeInOutCubic = (t: number) => (t < 0.5 ? 4 * t * t * t : 1 - Math.pow(-2 * t + 2, 3) / 2);

/**
 * Counter 0 → 100 with a logo mask reveal, then a two-layer curtain wipe.
 *
 * Timeline:
 *  1. The counter eases toward 100 over `duration.preloader`, but holds at 92 until
 *     fonts and the window `load` event are done (with a 4 s failsafe), so the hero
 *     never appears half-styled.
 *  2. The gradient wordmark is uncovered left to right in step with the counter.
 *  3. At 100 the ink layer wipes upward; the gradient layer behind it follows 0.12 s
 *     later, so a flash of brand colour crosses the screen.
 *  4. Partway through the wipe, `finishIntro()` lets the hero start revealing underneath.
 *
 * It is rendered on the server too, so the first paint is the preloader rather than a
 * flash of the page. Without JS (noscript style in layout) or with reduced motion
 * (CSS in globals.css) it is hidden immediately.
 */
export function Preloader() {
  const finishIntro = useUI((s) => s.finishIntro);
  const lenis = useUI((s) => s.lenis);
  const [phase, setPhase] = useState<Phase>('loading');
  const counterRef = useRef<HTMLSpanElement>(null);
  const maskRef = useRef<HTMLSpanElement>(null);

  // Lock scrolling while the overlay is up.
  useEffect(() => {
    const root = document.documentElement;
    if (phase === 'gone') {
      root.classList.remove('is-loading', 'sc-first-load');
      lenis?.start();
    } else {
      root.classList.add('is-loading');
      lenis?.stop();
    }
  }, [phase, lenis]);

  useEffect(() => {
    // Skip when the visitor arrived from another page of the site (client-side
    // navigation: the hard-load marker is already gone) or prefers reduced motion.
    // In both cases CSS already keeps the overlay hidden.
    const firstLoad = document.documentElement.classList.contains('sc-first-load');
    if (!firstLoad || prefersReducedMotion()) {
      finishIntro();
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPhase('gone');
      return;
    }

    let ready = false;
    const loaded = new Promise<void>((resolve) => {
      if (document.readyState === 'complete') resolve();
      else window.addEventListener('load', () => resolve(), { once: true });
    });
    Promise.all([document.fonts.ready, loaded]).then(() => {
      ready = true;
    });
    const failsafe = window.setTimeout(() => {
      ready = true;
    }, 4000);

    let raf = 0;
    let leaveTimer = 0;
    let introTimer = 0;
    const start = performance.now();
    const tick = (now: number) => {
      const t = Math.min((now - start) / (duration.preloader * 1000), 1);
      let progress = easeInOutCubic(t) * 100;
      if (!ready) progress = Math.min(progress, 92);
      const rounded = Math.round(progress);
      // Write straight to the DOM: no React re-render per frame.
      if (counterRef.current) counterRef.current.textContent = String(rounded).padStart(3, '0');
      // The clip box extends past the text box on every side (negative insets) so descenders
      // and the italic overhang aren't cut off, which would let the outline layer show through.
      if (maskRef.current) maskRef.current.style.clipPath = `inset(-25% ${100 - progress * 1.1}% -25% -10%)`;
      if (progress >= 100) {
        leaveTimer = window.setTimeout(() => setPhase('leaving'), 220);
        introTimer = window.setTimeout(finishIntro, 220 + 380);
        return;
      }
      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    return () => {
      cancelAnimationFrame(raf);
      window.clearTimeout(failsafe);
      window.clearTimeout(leaveTimer);
      window.clearTimeout(introTimer);
    };
  }, [finishIntro]);

  if (phase === 'gone') return null;
  const leaving = phase === 'leaving';
  const wipe = { clipPath: 'inset(0% 0% 100% 0%)' };

  return (
    <div className="preloader fixed inset-0 z-preloader" role="status" aria-live="polite">
      <span className="sr-only">{leaving ? `${site.name} loaded` : `Loading ${site.name}`}</span>

      {/* Back layer: brand gradient, leaves slightly after the ink layer. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 bg-spark"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={leaving ? wipe : undefined}
        transition={{ duration: 1, ease: ease.inOut, delay: 0.12 }}
        onAnimationComplete={() => leaving && setPhase('gone')}
      />

      {/* Front layer: ink with the wordmark and the counter. */}
      <motion.div
        aria-hidden
        className="absolute inset-0 flex flex-col justify-between bg-ink px-gutter py-6 md:py-8"
        initial={{ clipPath: 'inset(0% 0% 0% 0%)' }}
        animate={leaving ? wipe : undefined}
        transition={{ duration: 0.9, ease: ease.inOut }}
      >
        <div className="flex items-center justify-between font-mono text-eyebrow uppercase text-bone/50">
          <span>{site.legalName}</span>
          <span>Loading experience</span>
        </div>

        {/* Wordmark: a faint outline underneath, the gradient fill uncovered on top. */}
        <div className="relative self-center font-display text-display-lg leading-none">
          <span className="text-outline">SparkCurv</span>
          <span
            ref={maskRef}
            className="text-gradient absolute inset-0 animate-gradient-pan"
            style={{ clipPath: 'inset(-25% 100% -25% -10%)' }}
          >
            SparkCurv
          </span>
        </div>

        <div className="flex items-end justify-between">
          <span className="max-w-[22ch] font-mono text-eyebrow uppercase leading-relaxed text-bone/50">
            AI · Cloud · Product · Growth
          </span>
          <span className="tabular font-display text-[clamp(4rem,14vw,11rem)] leading-[0.8] text-bone">
            <span ref={counterRef}>000</span>
          </span>
        </div>
      </motion.div>
    </div>
  );
}
