'use client';

import { useSyncExternalStore } from 'react';
import { Moon, Sun } from 'lucide-react';
import { SCHEME_KEY, type Scheme } from '@/lib/theme';
import { schemeThemeColor } from '@/lib/tokens';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';

/* The scheme lives on <html data-scheme>, set before paint by the boot script (lib/theme.ts).
   Every toggle on the page subscribes to that attribute, so they all stay in sync. */
const read = (): Scheme => (document.documentElement.dataset.scheme === 'light' ? 'light' : 'dark');

function subscribe(onChange: () => void) {
  const mo = new MutationObserver(onChange);
  mo.observe(document.documentElement, { attributes: true, attributeFilter: ['data-scheme'] });
  return () => mo.disconnect();
}

function apply(next: Scheme) {
  const root = document.documentElement;
  if (next === 'light') root.dataset.scheme = 'light';
  else delete root.dataset.scheme;
  try {
    localStorage.setItem(SCHEME_KEY, next);
  } catch {
    // storage blocked: the choice lasts for this page view only
  }
  document.querySelector('meta[name="theme-color"]')?.setAttribute('content', schemeThemeColor[next]);
}

type ViewTransitionDoc = Document & { startViewTransition?: (cb: () => void) => { ready: Promise<void> } };

/**
 * Light/dark switch. Where the browser supports view transitions, the new scheme spreads
 * out from the button as a growing circle; otherwise (and with reduced motion) it swaps
 * instantly.
 */
export function ThemeToggle({ className }: { className?: string }) {
  // Server snapshot is "dark" (the default); React re-renders with the real value after
  // hydration, so a saved light choice never causes a hydration mismatch.
  const scheme = useSyncExternalStore(subscribe, read, () => 'dark' as Scheme);
  const next: Scheme = scheme === 'dark' ? 'light' : 'dark';

  const onClick = (e: React.MouseEvent<HTMLButtonElement>) => {
    const doc = document as ViewTransitionDoc;
    if (!doc.startViewTransition || prefersReducedMotion()) {
      apply(next);
      return;
    }
    const r = e.currentTarget.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    const radius = Math.hypot(Math.max(x, innerWidth - x), Math.max(y, innerHeight - y));
    doc.startViewTransition(() => apply(next)).ready.then(() => {
      document.documentElement.animate(
        { clipPath: [`circle(0px at ${x}px ${y}px)`, `circle(${radius}px at ${x}px ${y}px)`] },
        { duration: 700, easing: 'cubic-bezier(0.87, 0, 0.13, 1)', pseudoElement: '::view-transition-new(root)' },
      );
    });
  };

  return (
    <button
      type="button"
      onClick={onClick}
      aria-label={`Switch to ${next} theme`}
      title={`Switch to ${next} theme`}
      className={cn(
        'group relative grid place-items-center overflow-hidden rounded-full border text-bone/70 transition-colors duration-300 hover:border-bone/30 hover:text-bone',
        className,
      )}
    >
      {/* Both icons share the cell; the inactive one turns away and fades out. */}
      <Sun
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          'col-start-1 row-start-1 h-[18px] w-[18px] transition-[transform,opacity] duration-500 ease-expo-out',
          scheme === 'dark' ? 'rotate-0 scale-100 opacity-100' : '-rotate-90 scale-50 opacity-0',
        )}
      />
      <Moon
        aria-hidden
        strokeWidth={1.5}
        className={cn(
          'col-start-1 row-start-1 h-[17px] w-[17px] transition-[transform,opacity] duration-500 ease-expo-out',
          scheme === 'light' ? 'rotate-0 scale-100 opacity-100' : 'rotate-90 scale-50 opacity-0',
        )}
      />
    </button>
  );
}
