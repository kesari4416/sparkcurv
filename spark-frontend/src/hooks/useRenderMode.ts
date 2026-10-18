'use client';

import { useSyncExternalStore } from 'react';
import { canRenderWebGL, isLowPower, prefersReducedMotion } from '@/lib/device';

export type RenderMode = 'pending' | 'webgl' | 'static';

let cached: RenderMode | null = null;

function detect(): RenderMode {
  // Decided once per page load: WebGL probing is not free.
  if (cached === null) {
    cached = prefersReducedMotion() || isLowPower() || !canRenderWebGL() ? 'static' : 'webgl';
  }
  return cached;
}

const noopSubscribe = () => () => {};

/**
 * 'webgl' when the device can comfortably run the 3D hero, otherwise 'static'
 * (CSS fallback). 'pending' on the server and during hydration.
 */
export function useRenderMode(): RenderMode {
  return useSyncExternalStore(noopSubscribe, detect, () => 'pending');
}
