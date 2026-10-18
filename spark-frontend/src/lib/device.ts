/** Client-only capability checks. Call them inside effects, never during render. */

export function prefersReducedMotion(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(prefers-reduced-motion: reduce)').matches;
}

export function hasFinePointer(): boolean {
  return typeof window !== 'undefined' && window.matchMedia('(hover: hover) and (pointer: fine)').matches;
}

export function canRenderWebGL(): boolean {
  try {
    const canvas = document.createElement('canvas');
    const gl = canvas.getContext('webgl2') ?? canvas.getContext('webgl');
    if (!gl) return false;
    // Release the probe context straight away; browsers cap live WebGL contexts.
    gl.getExtension('WEBGL_lose_context')?.loseContext();
    return true;
  } catch {
    return false;
  }
}

type NavigatorWithHints = Navigator & {
  deviceMemory?: number;
  connection?: { saveData?: boolean };
};

/**
 * Heuristic for "skip the WebGL hero": data-saver on, or a touch device with few
 * cores / little memory. Desktops and recent phones still get the 3D scene.
 */
export function isLowPower(): boolean {
  const nav = navigator as NavigatorWithHints;
  if (nav.connection?.saveData) return true;
  const cores = nav.hardwareConcurrency ?? 8;
  const memory = nav.deviceMemory ?? 8;
  const touch = window.matchMedia('(pointer: coarse)').matches;
  return cores <= 2 || memory <= 2 || (touch && (cores <= 4 || memory <= 4));
}
