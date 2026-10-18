'use client';

import { useCallback, useEffect, useRef } from 'react';
import { prefersReducedMotion } from '@/lib/device';

/** Characters the scramble cycles through before each letter settles. */
export const SCRAMBLE_GLYPHS = '!<>-_\\/[]{}—=+*^?#ABCXYZ';

/** How often an unresolved letter re-rolls, in ms. Slower than a frame so it reads as flicker, not blur. */
const TICK = 45;

type ScrambleOptions = {
  /** Total run time in ms, from first frame to the last letter settling. */
  duration?: number;
  glyphs?: string;
};

/**
 * Text scramble driven straight from requestAnimationFrame, with no React state, so
 * a run causes zero re-renders.
 *
 * Attach `textRef` to the real text and `overlayRef` to an aria-hidden layer stacked
 * on top of it (see components/ScrambleText). While a run is active the real text is
 * hidden with opacity (it stays in the accessibility tree and keeps the layout) and the
 * overlay shows the scrambled string; when the run ends the overlay is emptied.
 */
export function useScramble(text: string, { duration = 450, glyphs = SCRAMBLE_GLYPHS }: ScrambleOptions = {}) {
  const textRef = useRef<HTMLSpanElement>(null);
  const overlayRef = useRef<HTMLSpanElement>(null);
  const frame = useRef(0);

  const stop = useCallback(() => {
    cancelAnimationFrame(frame.current);
    frame.current = 0;
    if (overlayRef.current) overlayRef.current.textContent = '';
    if (textRef.current) textRef.current.style.opacity = '';
  }, []);

  const play = useCallback(() => {
    const overlay = overlayRef.current;
    const real = textRef.current;
    if (!overlay || !real || prefersReducedMotion()) return;
    cancelAnimationFrame(frame.current); // re-hovering mid-run restarts cleanly

    const chars = Array.from(text);
    const n = chars.length || 1;
    const randomGlyph = () => glyphs[Math.floor(Math.random() * glyphs.length)];

    // Timing: every letter starts scrambled. Letter i locks onto its real character at
    //   lockAt(i) = duration * (0.25 + 0.75 * (i + 1) / n)
    // so the first quarter of the run is pure noise, then a left-to-right sweep resolves
    // the word and the last letter lands exactly at `duration`. Spaces never scramble,
    // which keeps word breaks (and any line wrapping) where the real text has them.
    const lockAt = chars.map((_, i) => duration * (0.25 + 0.75 * ((i + 1) / n)));
    const current = chars.map(randomGlyph);
    let start = -1;
    let lastRoll = -Infinity;

    const step = (now: number) => {
      if (start < 0) {
        start = now;
        real.style.opacity = '0'; // hide the real text on the same frame the overlay gets content: no blank flash
      }
      const t = now - start;
      const roll = now - lastRoll >= TICK;
      if (roll) lastRoll = now;

      let out = '';
      for (let i = 0; i < chars.length; i++) {
        const ch = chars[i];
        if (t >= lockAt[i] || ch.trim() === '') {
          out += ch;
        } else {
          if (roll) current[i] = randomGlyph();
          out += current[i];
        }
      }
      overlay.textContent = out;

      if (t < duration) frame.current = requestAnimationFrame(step);
      else stop();
    };
    frame.current = requestAnimationFrame(step);
  }, [text, duration, glyphs, stop]);

  // Cancel on unmount, and when the text changes mid-run.
  useEffect(() => stop, [stop, text]);

  return { textRef, overlayRef, play, stop };
}
