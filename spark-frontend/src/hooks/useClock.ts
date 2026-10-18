'use client';

import { useMemo, useSyncExternalStore } from 'react';

const subscribe = (onTick: () => void) => {
  const id = window.setInterval(onTick, 1000);
  return () => window.clearInterval(id);
};

/**
 * Live HH:MM:SS for a time zone. Returns '' during server render and hydration,
 * so callers should reserve the width (e.g. min-w + tabular numbers) to avoid shift.
 */
export function useClock(timeZone: string) {
  const format = useMemo(
    () =>
      new Intl.DateTimeFormat('en-GB', {
        timeZone,
        hour: '2-digit',
        minute: '2-digit',
        second: '2-digit',
        hour12: false,
      }),
    [timeZone],
  );
  return useSyncExternalStore(
    subscribe,
    () => format.format(new Date()),
    () => '',
  );
}
