'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useRef } from 'react';
import { motion } from 'framer-motion';
import { cn } from '@/lib/cn';

type Item = { name: string; path: string };

/**
 * Sticky pill bar linking a service family's overview and sub-pages. The active pill's
 * bone background slides between items (shared layout animation), and on narrow screens
 * the bar scrolls sideways with the active item kept in view.
 */
export function SubNav({ label, items }: { label: string; items: Item[] }) {
  const pathname = usePathname();
  const listRef = useRef<HTMLUListElement>(null);

  // Centre the active pill by scrolling the bar itself. (scrollIntoView would also scroll the
  // page down to the bar, which sits below the fold on load.)
  useEffect(() => {
    const list = listRef.current;
    const active = list?.querySelector<HTMLElement>('[aria-current="page"]');
    if (!list || !active) return;
    const li = active.parentElement ?? active;
    list.scrollLeft = li.offsetLeft - (list.clientWidth - li.offsetWidth) / 2;
  }, [pathname]);

  return (
    // Sticks just under the header: 84px tall with the Menu button (below lg), 72px with the full nav.
    <nav aria-label={label} className="sticky top-[83px] z-30 border-b bg-ink/80 backdrop-blur-xl lg:top-[71px]">
      <div className="mx-auto max-w-site px-gutter">
        <ul ref={listRef} className="scrollbar-hide relative -mx-1 flex gap-1 overflow-x-auto py-3">
          {items.map((item) => {
            const active = pathname === item.path;
            return (
              <li key={item.path} className="shrink-0 px-1">
                <Link
                  href={item.path}
                  scroll={false}
                  aria-current={active ? 'page' : undefined}
                  className={cn(
                    'relative block rounded-full px-4 py-2 text-sm transition-colors duration-300',
                    active ? 'text-ink' : 'text-bone/70 hover:text-bone',
                  )}
                >
                  {active && (
                    <motion.span
                      layoutId={`subnav-${label}`}
                      aria-hidden
                      transition={{ type: 'spring', stiffness: 380, damping: 34 }}
                      className="absolute inset-0 -z-10 rounded-full bg-bone"
                    />
                  )}
                  <span className="relative">{item.name}</span>
                </Link>
              </li>
            );
          })}
        </ul>
      </div>
    </nav>
  );
}
