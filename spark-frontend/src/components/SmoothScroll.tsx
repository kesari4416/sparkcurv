'use client';

import { useEffect } from 'react';
import Lenis from 'lenis';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { useUI } from '@/lib/store';
import { prefersReducedMotion } from '@/lib/device';

gsap.registerPlugin(ScrollTrigger);

/**
 * Inertial scrolling with Lenis, driven by GSAP's ticker so Lenis and every
 * ScrollTrigger read the same scroll position on the same frame (no jitter on
 * pinned sections). Reduced-motion users keep native scrolling.
 */
export function SmoothScroll({ children }: { children: React.ReactNode }) {
  const setLenis = useUI((s) => s.setLenis);

  useEffect(() => {
    if (prefersReducedMotion()) return;

    const lenis = new Lenis({
      lerp: 0.1, // lower = floatier
      smoothWheel: true,
      anchors: true, // in-page #links scroll smoothly too
    });

    // Lenis owns the scroll position; tell ScrollTrigger whenever it changes.
    lenis.on('scroll', ScrollTrigger.update);

    // GSAP's ticker passes seconds; Lenis expects milliseconds.
    const tick = (time: number) => lenis.raf(time * 1000);
    gsap.ticker.add(tick);
    // Without this, GSAP "catches up" after a dropped frame and the page lurches.
    gsap.ticker.lagSmoothing(0);

    setLenis(lenis);
    return () => {
      gsap.ticker.remove(tick);
      lenis.destroy();
      setLenis(null);
    };
  }, [setLenis]);

  return <>{children}</>;
}
