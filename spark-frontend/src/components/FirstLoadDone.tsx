'use client';

import { useEffect } from 'react';
import { useUI } from '@/lib/store';

/**
 * For pages without a preloader: clears the "hard page load" marker, so navigating to the
 * home page afterwards doesn't replay the intro, and marks the intro as done so the header
 * and other intro-gated elements appear straight away.
 */
export function FirstLoadDone() {
  useEffect(() => {
    document.documentElement.classList.remove('sc-first-load');
    useUI.getState().finishIntro();
  }, []);
  return null;
}
