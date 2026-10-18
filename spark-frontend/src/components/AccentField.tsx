'use client';

import { useEffect, useRef } from 'react';
import { bindPointer, pointer } from '@/lib/pointer';
import { prefersReducedMotion } from '@/lib/device';
import { palette } from '@/lib/tokens';

/** '#RRGGBB' + alpha → rgba(), so the glows follow the palette tokens. */
const rgba = (hex: string, a: number) =>
  `rgba(${parseInt(hex.slice(1, 3), 16)}, ${parseInt(hex.slice(3, 5), 16)}, ${parseInt(hex.slice(5, 7), 16)}, ${a})`;
const { blue, royal, silver } = palette.spark;

// Each glow follows the pointer by a different amount, which gives the light some depth.
const GLOWS = [
  { color: rgba(royal, 0.3), size: '70vmax', follow: 0.35, base: [0.55, 0.4] },
  { color: rgba(blue, 0.18), size: '55vmax', follow: -0.2, base: [0.75, 0.6] },
  { color: rgba(silver, 0.07), size: '45vmax', follow: 0.12, base: [0.3, 0.75] },
] as const;

/**
 * Soft blue and chrome light that drifts toward the cursor.
 *
 * Performance: the glows are pre-rendered radial gradients that only ever move with
 * `transform`, which the compositor handles without repainting. (Animating gradient
 * positions through CSS variables repaints the whole hero every frame.) The loop sleeps
 * while the field is off screen and doesn't run at all under reduced motion.
 */
export function AccentField({ className = '' }: { className?: string }) {
  const rootRef = useRef<HTMLDivElement>(null);
  const glowRefs = useRef<Array<HTMLDivElement | null>>([]);

  useEffect(() => {
    const root = rootRef.current;
    if (!root || prefersReducedMotion()) return;
    bindPointer();

    // Eased pointer position in 0..1 viewport units.
    let px = 0.5;
    let py = 0.45;
    let raf = 0;
    let running = false;
    const start = performance.now();

    const loop = (now: number) => {
      const t = (now - start) / 1000;
      // Idle drift keeps it alive on touch screens; the pointer pulls it when present.
      const tx = pointer.active ? pointer.x / window.innerWidth : 0.5 + Math.sin(t * 0.3) * 0.18;
      const ty = pointer.active ? pointer.y / window.innerHeight : 0.45 + Math.cos(t * 0.25) * 0.12;
      px += (tx - px) * 0.04;
      py += (ty - py) * 0.04;
      const w = root.clientWidth;
      const h = root.clientHeight;
      GLOWS.forEach((g, i) => {
        const el = glowRefs.current[i];
        if (!el) return;
        const x = (g.base[0] + (px - 0.5) * g.follow * 2) * w;
        const y = (g.base[1] + (py - 0.5) * g.follow * 2) * h;
        el.style.transform = `translate3d(${x.toFixed(1)}px, ${y.toFixed(1)}px, 0) translate(-50%, -50%)`;
      });
      raf = requestAnimationFrame(loop);
    };

    const io = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting && !running) {
        running = true;
        raf = requestAnimationFrame(loop);
      } else if (!entry.isIntersecting && running) {
        running = false;
        cancelAnimationFrame(raf);
      }
    });
    io.observe(root);
    return () => {
      io.disconnect();
      cancelAnimationFrame(raf);
    };
  }, []);

  return (
    <div ref={rootRef} aria-hidden className={`pointer-events-none absolute inset-0 overflow-hidden ${className}`}>
      {GLOWS.map((g, i) => (
        <div
          key={i}
          ref={(el) => {
            glowRefs.current[i] = el;
          }}
          className="absolute left-0 top-0 rounded-full"
          style={{
            width: g.size,
            height: g.size,
            background: `radial-gradient(closest-side, ${g.color}, transparent)`,
            // Initial placement (also the reduced-motion position) before JS runs.
            transform: `translate3d(${g.base[0] * 100}vw, ${g.base[1] * 100}vh, 0) translate(-50%, -50%)`,
          }}
        />
      ))}
    </div>
  );
}
