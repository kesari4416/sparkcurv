'use client';

/**
 * react-router-dom compatibility layer on top of the Next.js App Router.
 *
 * The legacy pages in src/views were written for react-router. Instead of rewriting
 * each one during the Next.js migration, they import the same names from here.
 * New code should use next/link and next/navigation directly; delete this file once
 * every legacy view has been redesigned.
 */

import NextLink from 'next/link';
import { forwardRef, useEffect, useState } from 'react';
import {
  useParams as useNextParams,
  usePathname,
  useRouter,
  useSearchParams as useNextSearchParams,
} from 'next/navigation';

/** <Link to="/x"> → next/link. */
export const Link = forwardRef(function Link({ to, href, replace, state: _state, ...rest }, ref) {
  return <NextLink ref={ref} href={to ?? href} replace={replace} {...rest} />;
});

// react-router can pass `state` along with a navigation; Next.js has no equivalent, so it
// is parked in sessionStorage, keyed by the destination path, and read by useLocation.
const stateKey = (path) => `router-state:${path}`;

export function useNavigate() {
  const router = useRouter();
  return (to, options = {}) => {
    if (options.state !== undefined) {
      try {
        sessionStorage.setItem(stateKey(String(to).split('?')[0]), JSON.stringify(options.state));
      } catch {
        // storage unavailable: the state is simply lost
      }
    }
    if (options.replace) router.replace(to);
    else router.push(to);
  };
}

/** { pathname, state }. `state` is read after mount, so it is null on the first render. */
export function useLocation() {
  const pathname = usePathname();
  const [state, setState] = useState(null);
  useEffect(() => {
    try {
      const raw = sessionStorage.getItem(stateKey(pathname));
      if (raw !== null) {
        sessionStorage.removeItem(stateKey(pathname));
        // sessionStorage is browser-only, so it can only be read after mount (not during SSR).
        // eslint-disable-next-line react-hooks/set-state-in-effect
        setState(JSON.parse(raw));
      }
    } catch {
      // ignore
    }
  }, [pathname]);
  return { pathname, state };
}

export function useParams() {
  return useNextParams() ?? {};
}

/** [searchParams, setSearchParams], like react-router. Callers must be inside <Suspense>. */
export function useSearchParams() {
  const params = useNextSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const setParams = (next, options = {}) => {
    const query = new URLSearchParams(next).toString();
    const url = query ? `${pathname}?${query}` : pathname;
    if (options.replace) router.replace(url, { scroll: false });
    else router.push(url, { scroll: false });
  };
  return [params, setParams];
}

/** <Navigate to="/x" replace /> → client-side redirect after mount. */
export function Navigate({ to, replace }) {
  const router = useRouter();
  useEffect(() => {
    if (replace) router.replace(to);
    else router.push(to);
  }, [router, to, replace]);
  return null;
}
