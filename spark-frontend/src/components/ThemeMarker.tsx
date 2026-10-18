'use client';

import { useEffect } from 'react';
import type { Theme } from '@/lib/theme';

/**
 * Keeps <html data-theme="…"> correct during client-side navigation between the new and
 * the legacy design. The first-paint value comes from `themeBootScript` (lib/theme.ts),
 * which the root layout renders once in <head>.
 */
export function ThemeMarker({ theme }: { theme: Theme }) {
  useEffect(() => {
    document.documentElement.dataset.theme = theme;
  }, [theme]);
  return null;
}
