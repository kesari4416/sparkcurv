'use client';

import { motion } from 'framer-motion';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';

type RevealTextProps = {
  text: string;
  /** Start the animation (e.g. once the preloader has lifted). */
  play: boolean;
  delay?: number;
  stagger?: number;
  className?: string;
  wordClassName?: string;
};

/**
 * Word-by-word mask reveal: each word sits in an overflow-hidden slot and rises
 * into place from below. The slot gets a little bottom padding (cancelled by a
 * negative margin) so descenders and italic overhangs are not clipped.
 */
export function RevealText({ text, play, delay = 0, stagger = 0.08, className, wordClassName }: RevealTextProps) {
  const words = text.split(' ');
  return (
    <span className={className}>
      {words.map((word, i) => (
        <span key={`${word}-${i}`}>
          <span className="-mb-[0.14em] inline-block overflow-hidden pb-[0.14em] pr-[0.06em] align-bottom">
            <motion.span
              className={cn('reveal-inner inline-block origin-bottom-left', wordClassName)}
              initial={{ y: '115%', rotate: 5 }}
              animate={play ? { y: '0%', rotate: 0 } : undefined}
              transition={{ duration: 1.15, ease: ease.out, delay: delay + i * stagger }}
            >
              {word}
            </motion.span>
          </span>
          {i < words.length - 1 && ' '}
        </span>
      ))}
    </span>
  );
}
