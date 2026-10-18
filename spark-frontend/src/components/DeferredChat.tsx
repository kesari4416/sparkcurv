'use client';

import { useEffect } from 'react';

const TAWK_SRC = 'https://embed.tawk.to/6a3bb6d4ad14dc1d441d096b/1jrsk4buo';
const FALLBACK_DELAY_MS = 6000;

/**
 * Loads the Tawk.to live chat on the visitor's first interaction (scroll, pointer, key,
 * touch) or after a few seconds, whichever comes first. The widget is ~120 kB of
 * third-party JavaScript; loading it with the page cost close to a second of main-thread
 * time on mobile, before anyone could possibly want to chat.
 */
export function DeferredChat() {
  useEffect(() => {
    const w = window as Window & { Tawk_API?: object; Tawk_LoadStart?: Date };
    if (document.querySelector(`script[src="${TAWK_SRC}"]`)) return;

    let done = false;
    const events = ['pointerdown', 'keydown', 'touchstart', 'scroll', 'mousemove'] as const;
    const load = () => {
      if (done) return;
      done = true;
      cleanup();
      w.Tawk_API = w.Tawk_API || {};
      w.Tawk_LoadStart = new Date();
      const s = document.createElement('script');
      s.async = true;
      s.src = TAWK_SRC;
      s.charset = 'UTF-8';
      s.setAttribute('crossorigin', '*');
      document.body.appendChild(s);
    };
    const timer = window.setTimeout(load, FALLBACK_DELAY_MS);
    const cleanup = () => {
      window.clearTimeout(timer);
      events.forEach((e) => window.removeEventListener(e, load));
    };
    events.forEach((e) => window.addEventListener(e, load, { once: true, passive: true }));
    return cleanup;
  }, []);

  return null;
}
