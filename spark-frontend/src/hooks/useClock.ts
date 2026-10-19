'use client';

import { useCallback, useSyncExternalStore } from 'react';

/*
 * One ticking clock per time zone, shared by every component that shows it. The time is
 * stored and only changes on the tick: useSyncExternalStore requires getSnapshot to return
 * the same value until the store changes, and reading the live clock instead returned two
 * different strings whenever a render straddled a second boundary (React warns, and a tick
 * could be skipped).
 */
type Clock = { value: string; listeners: Set<() => void>; timer: number; format: Intl.DateTimeFormat };
const clocks = new Map<string, Clock>();

function clockFor(timeZone: string): Clock {
  let clock = clocks.get(timeZone);
  if (!clock) {
    const format = new Intl.DateTimeFormat('en-GB', { timeZone, hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
    clock = { value: format.format(new Date()), listeners: new Set(), timer: 0, format };
    clocks.set(timeZone, clock);
  }
  return clock;
}

/**
 * Live HH:MM:SS for a time zone. Returns '' during server render and hydration,
 * so callers should reserve the width (e.g. min-w + tabular numbers) to avoid shift.
 */
export function useClock(timeZone: string) {
  const subscribe = useCallback(
    (onTick: () => void) => {
      const clock = clockFor(timeZone);
      clock.listeners.add(onTick);
      if (clock.listeners.size === 1) {
        clock.value = clock.format.format(new Date());
        clock.timer = window.setInterval(() => {
          clock.value = clock.format.format(new Date());
          clock.listeners.forEach((l) => l());
        }, 1000);
      }
      return () => {
        clock.listeners.delete(onTick);
        if (clock.listeners.size === 0) window.clearInterval(clock.timer);
      };
    },
    [timeZone],
  );
  return useSyncExternalStore(
    subscribe,
    () => clockFor(timeZone).value,
    () => '',
  );
}
