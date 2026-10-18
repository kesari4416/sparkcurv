'use client';

import dynamic from 'next/dynamic';
import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { useRenderMode } from '@/hooks/useRenderMode';
import { ease, palette } from '@/lib/tokens';
import { cn } from '@/lib/cn';

// three.js loads in its own chunk, only on devices that will render it, and only once
// the visitor interacts after the intro (see below).
const HeroCanvas = dynamic(() => import('./HeroCanvas'), { ssr: false });

const { blue, royal, silver } = palette.spark;

/**
 * Background of the hero. A CSS "dotted sphere" is always rendered: it is the fallback
 * for low-power / reduced-motion / no-WebGL devices and the placeholder until the 3D
 * network is ready, at which point the two crossfade. Everything is absolutely
 * positioned, so nothing shifts layout.
 */
export function HeroVisual({ play }: { play: boolean }) {
  const mode = useRenderMode();
  const [mountCanvas, setMountCanvas] = useState(false);
  const [canvasReady, setCanvasReady] = useState(false);

  // Start the WebGL work on the visitor's first interaction (or after 5 s), never during
  // the first paint or the intro. Until then the CSS sphere stands in, so nothing is
  // missing; desktop visitors move the mouse within moments anyway.
  useEffect(() => {
    if (mode !== 'webgl' || !play) return;
    const events = ['pointermove', 'pointerdown', 'scroll', 'keydown', 'touchstart'] as const;
    const start = () => {
      cleanup();
      setMountCanvas(true);
    };
    const timer = window.setTimeout(start, 5000);
    const cleanup = () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, start));
    };
    events.forEach((e) => window.addEventListener(e, start, { once: true, passive: true }));
    return cleanup;
  }, [mode, play]);

  return (
    <div aria-hidden className="absolute inset-0 -z-10">
      {/* .hero-visual: inverted into ink lines in the light scheme (globals.css). */}
      <motion.div
        className="hero-visual absolute inset-0"
        initial={{ opacity: 0, scale: 0.9 }}
        animate={play ? { opacity: 1, scale: 1 } : undefined}
        transition={{ duration: 1.6, ease: ease.out }}
      >
        <div
          className={cn(
            'absolute left-1/2 top-[30%] aspect-square w-[min(92vw,44rem)] -translate-x-1/2 -translate-y-1/2 rounded-full transition-opacity duration-1000 md:left-[70%] md:top-1/2',
            canvasReady ? 'opacity-0' : 'opacity-100',
          )}
        >
          {/* Glow behind the sphere */}
          <div
            className="absolute inset-[-20%] rounded-full"
            style={{ background: `radial-gradient(closest-side, ${royal}40, ${blue}14 55%, transparent 75%)` }}
          />
          {/* Dot lattice, masked to a sphere and shaded so the left edge reads as lit */}
          <div
            className="absolute inset-0 rounded-full"
            style={{
              backgroundImage: `radial-gradient(circle, ${silver} 1.1px, transparent 1.6px)`,
              backgroundSize: '18px 18px',
              WebkitMask: 'radial-gradient(circle at 38% 35%, #000 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.12) 68%, transparent 71%)',
              mask: 'radial-gradient(circle at 38% 35%, #000 0%, rgba(0,0,0,0.55) 45%, rgba(0,0,0,0.12) 68%, transparent 71%)',
            }}
          />
        </div>
      </motion.div>

      {mode === 'webgl' && mountCanvas && (
        <div className={cn('hero-visual absolute inset-0 transition-opacity duration-[1400ms]', canvasReady ? 'opacity-100' : 'opacity-0')}>
          <HeroCanvas play={play} onReady={() => setCanvasReady(true)} />
        </div>
      )}

      {/* Fade the bottom into the page so the text, ticker and next section sit on solid ink. */}
      <div className="absolute inset-x-0 bottom-0 h-1/2 bg-gradient-to-t from-ink via-ink/80 to-transparent md:h-2/5 md:via-ink/70" />
    </div>
  );
}
