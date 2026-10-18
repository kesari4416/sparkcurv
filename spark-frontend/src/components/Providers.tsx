'use client';

import { MotionConfig } from 'framer-motion';
import { SmoothScroll } from './SmoothScroll';

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    // reducedMotion="user": Framer skips transform/layout animations when the OS asks for less motion.
    <MotionConfig reducedMotion="user">
      <SmoothScroll>{children}</SmoothScroll>
    </MotionConfig>
  );
}
