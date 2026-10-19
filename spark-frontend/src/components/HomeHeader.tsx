'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';
import { useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion, useScroll, useTransform } from 'framer-motion';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { nav, site, socials } from '@/lib/content';
import { cn } from '@/lib/cn';
import { Wordmark } from './Wordmark';
import { ScrambleText } from './ScrambleText';
import { CTAButton } from './CTAButton';
import { ThemeToggle } from './ThemeToggle';

/** Where the menu was opened from: the circle reveal grows out of the button's centre. */
type MenuState = { path: string; x: number; y: number; radius: number };

const FOCUSABLE = 'a[href], button:not([disabled]), [tabindex]:not([tabindex="-1"])';
// Full nav from Tailwind xl: with nine links (Products added), it doesn't fit below 1280px.
const DESKTOP = '(min-width: 1280px)'; // Tailwind xl

export function HomeHeader() {
  const introDone = useUI((s) => s.introDone);
  const pathname = usePathname();
  const reduce = useReducedMotion();
  const menuId = useId();
  const toggleRef = useRef<HTMLButtonElement>(null);
  const panelRef = useRef<HTMLDivElement>(null);
  const headerRef = useRef<HTMLElement>(null);

  // Publish the header's height as --header-h, so sticky bars below it (the service
  // sub-navigation) sit flush under it whatever the logo or breakpoint.
  useEffect(() => {
    const el = headerRef.current;
    if (!el) return;
    const root = document.documentElement;
    const ro = new ResizeObserver(() => root.style.setProperty('--header-h', `${Math.round(el.getBoundingClientRect().height)}px`));
    ro.observe(el);
    return () => ro.disconnect();
  }, []);

  // The menu remembers the path it was opened on and only counts as open while we are
  // still there, so a route change closes it without a state-syncing effect.
  const [menu, setMenu] = useState<MenuState | null>(null);
  const open = menu !== null && menu.path === pathname;
  const close = () => setMenu(null);

  // Readability scrim: fades in once content starts scrolling under the header.
  const { scrollY } = useScroll();
  const scrim = useTransform(scrollY, [0, 160], [0, 1]);

  const toggle = () => {
    if (open) return close();
    const button = toggleRef.current;
    if (!button) return;
    const r = button.getBoundingClientRect();
    const x = r.left + r.width / 2;
    const y = r.top + r.height / 2;
    // Radius that reaches the farthest viewport corner from the button.
    const radius = Math.hypot(Math.max(x, window.innerWidth - x), Math.max(y, window.innerHeight - y));
    setMenu({ path: pathname, x, y, radius });
  };

  // Wordmark on the home page scrolls back to the top instead of re-navigating.
  const onHome = (e: React.MouseEvent<HTMLAnchorElement>) => {
    if (pathname !== '/' || e.metaKey || e.ctrlKey || e.shiftKey || e.button !== 0) return;
    e.preventDefault();
    if (open) return close();
    const lenis = useUI.getState().lenis;
    if (lenis) lenis.scrollTo(0);
    else window.scrollTo({ top: 0, behavior: reduce ? 'auto' : 'smooth' });
  };

  // While open: lock scrolling, make the page inert, move focus in, trap Tab, close on
  // Escape or when the window grows to the desktop layout. Cleanup undoes all of it and
  // hands focus back to the Menu button.
  useEffect(() => {
    if (!open) return;
    const html = document.documentElement;
    const main = document.getElementById('main');
    const toggleEl = toggleRef.current;
    const prevOverflow = html.style.overflow;

    useUI.getState().lenis?.stop();
    html.style.overflow = 'hidden'; // fallback for native scrolling (reduced motion, no Lenis)
    if (main) main.inert = true;

    panelRef.current?.querySelector<HTMLElement>('a[href]')?.focus({ preventScroll: true });

    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        e.preventDefault();
        setMenu(null);
        return;
      }
      const panel = panelRef.current;
      if (e.key !== 'Tab' || !panel || !toggleEl) return;
      // Focus trap. The Menu/Close button lives in the header, which sits above the
      // panel, so the cycle is [toggle, ...panel focusables]: Tab from the last item
      // wraps to the toggle, Shift+Tab from the toggle wraps to the last item, and focus
      // that has somehow escaped is pulled back to the start.
      const items = [toggleEl, ...Array.from(panel.querySelectorAll<HTMLElement>(FOCUSABLE))];
      const first = items[0];
      const last = items[items.length - 1];
      const active = document.activeElement as HTMLElement | null;
      if (!active || !items.includes(active)) {
        e.preventDefault();
        first.focus();
      } else if (e.shiftKey && active === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && active === last) {
        e.preventDefault();
        first.focus();
      }
    };

    const mql = window.matchMedia(DESKTOP);
    const onResize = () => {
      if (mql.matches) setMenu(null);
    };

    document.addEventListener('keydown', onKey);
    mql.addEventListener('change', onResize);
    return () => {
      document.removeEventListener('keydown', onKey);
      mql.removeEventListener('change', onResize);
      html.style.overflow = prevOverflow;
      if (main) main.inert = false;
      useUI.getState().lenis?.start();
      if (toggleEl?.isConnected) toggleEl.focus({ preventScroll: true });
    };
  }, [open]);

  return (
    <>
      <motion.header
        ref={headerRef}
        initial={{ y: -24, opacity: 0 }}
        animate={introDone ? { y: 0, opacity: 1 } : undefined}
        transition={{ duration: 1, ease: ease.out, delay: 0.5 }}
        // Above the open menu panel (z-50) so the Close button and wordmark stay on top.
        className={cn('fixed inset-x-0 top-0', open ? 'z-[55]' : 'z-header')}
      >
        {/* Instead of mix-blend-difference (which also inverts the brand gradient and the
            focus ring), a frosted ink bar fades in once content scrolls under the header,
            so the nav never sits directly on top of section text. */}
        <div aria-hidden className={cn('pointer-events-none absolute inset-0 -z-10 transition-opacity duration-500', open && 'opacity-0')}>
          <motion.div style={{ opacity: scrim }} className="h-full border-b border-hairline bg-ink/75 backdrop-blur-xl" />
        </div>

        <div className="mx-auto flex max-w-site items-center justify-between gap-6 px-gutter py-5">
          <Link href="/" onClick={onHome} aria-label={`${site.name}, home`} className="shrink-0 text-2xl md:text-[1.7rem]">
            <Wordmark />
          </Link>

          <p className="hidden font-mono text-eyebrow uppercase text-bone/70 md:block xl:hidden">AI · Cloud · Product · Growth</p>

          <nav aria-label="Main" className="hidden xl:block">
            <ul className="flex items-center gap-6 2xl:gap-9">
              {nav.map((item) => {
                const current = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
                return (
                  <li key={item.href}>
                    <Link
                      href={item.href}
                      aria-current={current ? 'page' : undefined}
                      className={cn(
                        'group relative block whitespace-nowrap py-2 font-mono text-eyebrow uppercase transition-colors duration-300',
                        current ? 'text-bone' : 'text-bone/70 hover:text-bone focus-visible:text-bone',
                      )}
                    >
                      <ScrambleText text={item.label} />
                      {/* Underline draws in from the left on hover and leaves to the right. */}
                      <span
                        aria-hidden
                        className={cn(
                          'absolute inset-x-0 bottom-0 h-px origin-right bg-spark transition-transform duration-500 ease-expo-out group-hover:origin-left group-hover:scale-x-100 group-focus-visible:origin-left group-focus-visible:scale-x-100',
                          current ? 'scale-x-100' : 'scale-x-0',
                        )}
                      />
                    </Link>
                  </li>
                );
              })}
              <li>
                <ThemeToggle className="h-9 w-9" />
              </li>
            </ul>
          </nav>

          <div className="flex items-center gap-5">
            {/* Always visible from small tablets up; phones don't have room beside the Menu button. */}
            <div className="hidden sm:block">
              <CTAButton size="sm" />
            </div>

            <ThemeToggle className="glass h-11 w-11 xl:hidden" />

            <button
              ref={toggleRef}
              type="button"
              onClick={toggle}
              aria-expanded={open}
              aria-controls={menuId}
              className="glass inline-flex h-11 items-center gap-3 rounded-full pl-5 pr-4 font-mono text-eyebrow uppercase text-bone transition-colors duration-300 hover:bg-bone/10 xl:hidden"
            >
              <span className="inline-block min-w-[5ch] text-left">{open ? 'Close' : 'Menu'}</span>
              {/* Two bars that rotate into an X. */}
              <span aria-hidden className="relative block h-2.5 w-4">
                <span
                  className={cn(
                    'absolute left-0 top-0 h-px w-full bg-current transition-transform duration-500 ease-expo-out',
                    open && 'translate-y-[4.5px] rotate-45',
                  )}
                />
                <span
                  className={cn(
                    'absolute bottom-0 left-0 h-px w-full bg-current transition-transform duration-500 ease-expo-out',
                    open && '-translate-y-[4.5px] -rotate-45',
                  )}
                />
              </span>
            </button>
          </div>
        </div>
      </motion.header>

      <AnimatePresence>
        {open && menu && <MenuPanel key="menu" ref={panelRef} id={menuId} menu={menu} reduce={!!reduce} pathname={pathname} onNavigate={close} />}
      </AnimatePresence>
    </>
  );
}

type MenuPanelProps = {
  id: string;
  menu: MenuState;
  reduce: boolean;
  pathname: string;
  onNavigate: () => void;
  ref: React.Ref<HTMLDivElement>;
};

/**
 * Full-screen mobile/tablet menu. It reveals as a circle growing out of the Menu button
 * (clip-path, so no layout or paint of the page underneath), then the links rise into
 * place one after another, followed by the socials and contact row.
 */
function MenuPanel({ id, menu, reduce, pathname, onNavigate, ref }: MenuPanelProps) {
  const at = `at ${menu.x}px ${menu.y}px`;
  const rise = (delay: number) => ({
    initial: reduce ? false : { y: '110%' },
    animate: { y: '0%' },
    transition: { duration: 0.9, ease: ease.out, delay },
  });

  return (
    <motion.div
      ref={ref}
      id={id}
      aria-label="Site menu"
      role="region"
      initial={reduce ? false : { clipPath: `circle(0px ${at})` }}
      animate={{ clipPath: `circle(${menu.radius}px ${at})` }}
      exit={reduce ? { opacity: 0 } : { clipPath: `circle(0px ${at})` }}
      transition={{ duration: reduce ? 0 : 0.85, ease: ease.inOut }}
      data-lenis-prevent
      className="fixed inset-0 z-50 flex flex-col overflow-y-auto overscroll-contain bg-ink-800 px-gutter pb-10 pt-28 xl:hidden"
    >
      <nav aria-label="Main">
        <ul>
          {nav.map((item, i) => {
            const current = pathname === item.href || (item.href !== '/' && pathname.startsWith(`${item.href}/`));
            return (
              <li key={item.href} className="-mb-[0.1em] overflow-hidden pb-[0.1em]">
                <motion.div {...rise(0.3 + i * 0.05)}>
                  <Link
                    href={item.href}
                    onClick={onNavigate}
                    aria-current={current ? 'page' : undefined}
                    className="group flex items-baseline gap-4 font-display text-[clamp(2.25rem,min(11vw,7.5svh),5.5rem)] leading-[1.02] tracking-tight"
                  >
                    <span aria-hidden className="tabular w-[2.5ch] font-mono text-eyebrow text-bone/60">
                      {String(i + 1).padStart(2, '0')}
                    </span>
                    <ScrambleText
                      text={item.label}
                      className={cn('transition-colors duration-300', current ? 'text-gradient' : 'text-bone group-hover:text-bone-muted')}
                    />
                  </Link>
                </motion.div>
              </li>
            );
          })}
        </ul>
      </nav>

      <motion.div
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8, ease: ease.out, delay: 0.3 + nav.length * 0.05 + 0.1 }}
        className="mt-auto grid gap-6 border-t pt-8 sm:grid-cols-2"
      >
        <ul aria-label="Social media" className="flex flex-wrap gap-x-5 gap-y-2 font-mono text-eyebrow uppercase text-bone-muted">
          {socials.map((s) => (
            <li key={s.label}>
              <a
                href={s.href}
                target="_blank"
                rel="noopener noreferrer"
                aria-label={`${site.name} on ${s.label}`}
                className="inline-block py-1 transition-colors hover:text-bone"
              >
                {s.label} <span aria-hidden>↗</span>
              </a>
            </li>
          ))}
        </ul>
        <div className="flex flex-col gap-2 sm:items-end">
          <a href={`mailto:${site.email}`} className="text-lg text-bone transition-colors hover:text-bone-muted">
            {site.email}
          </a>
        </div>
      </motion.div>
    </motion.div>
  );
}
