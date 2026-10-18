'use client';

import { useEffect, useRef } from 'react';
import { useScramble } from '@/hooks/useScramble';
import { cn } from '@/lib/cn';

type ScrambleTextProps = {
  text: string;
  className?: string;
  /** Run time in ms (default 450). */
  duration?: number;
};

/**
 * Text that scrambles through random glyphs and resolves left to right when its link or
 * button is hovered with a mouse or focused from the keyboard.
 *
 * Layout never jitters: the real text stays in flow (it alone sizes the box) and the
 * scrambled string is painted on an absolutely positioned, overflow-hidden layer above
 * it, so wider glyphs such as "—" can't push neighbours around. That layer is
 * aria-hidden, so the accessible name is always the real text.
 */
export function ScrambleText({ text, className, duration }: ScrambleTextProps) {
  const rootRef = useRef<HTMLSpanElement>(null);
  const { textRef, overlayRef, play } = useScramble(text, { duration });

  useEffect(() => {
    const root = rootRef.current;
    if (!root) return;
    // Listen on the nearest link/button rather than this span: hovering its padding or
    // icon should scramble too, and keyboard focus lands on the link, not on the span.
    const target = root.closest<HTMLElement>('a, button, [data-scramble-trigger]') ?? root;

    const onEnter = (e: PointerEvent) => {
      if (e.pointerType === 'mouse' || e.pointerType === 'pen') play();
    };
    // Keyboard focus only: a tap on touch screens also focuses the link, but there the
    // page is usually navigating away, so don't scramble.
    const onFocus = (e: FocusEvent) => {
      try {
        if (e.target instanceof Element && e.target.matches(':focus-visible')) play();
      } catch {
        // Very old engines without :focus-visible support: skip the effect.
      }
    };

    target.addEventListener('pointerenter', onEnter);
    target.addEventListener('focusin', onFocus);
    return () => {
      target.removeEventListener('pointerenter', onEnter);
      target.removeEventListener('focusin', onFocus);
    };
  }, [play]);

  return (
    <span ref={rootRef} className={cn('relative inline-block', className)}>
      <span ref={textRef}>{text}</span>
      <span ref={overlayRef} aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden" />
    </span>
  );
}
