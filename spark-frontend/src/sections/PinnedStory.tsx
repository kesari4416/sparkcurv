'use client';

import { useSyncExternalStore } from 'react';
import { hasFinePointer, prefersReducedMotion } from '@/lib/device';
import { StoryPinned } from './story/StoryPinned';
import { StoryStack } from './story/StoryStack';

/*
 * Section 5: pinned scroll story.
 *
 * Desktop (fine pointer, >= 768px, motion allowed): the section pins for one viewport
 * height per chapter while a scrubbed GSAP timeline wipes the chapters in and out and
 * morphs the background video and colour (story/StoryPinned.tsx).
 *
 * Everyone else gets a plain vertical stack of chapter cards with static posters
 * (story/StoryStack.tsx). The stack is also the server render, so most mobile
 * visitors never see a layout swap; desktop swaps to the pinned layout on hydration,
 * long before this far-down section is scrolled into view.
 */

const MEDIA = ['(prefers-reduced-motion: reduce)', '(hover: hover) and (pointer: fine)', '(min-width: 768px)'];

// matchMedia as an external store: re-evaluates when any of the queries flips
// (window resized below 768px, reduced motion toggled, mouse plugged into a tablet).
function subscribe(onChange: () => void) {
  const lists = MEDIA.map((query) => window.matchMedia(query));
  lists.forEach((list) => list.addEventListener('change', onChange));
  return () => lists.forEach((list) => list.removeEventListener('change', onChange));
}

const canPin = () => !prefersReducedMotion() && hasFinePointer() && window.matchMedia('(min-width: 768px)').matches;
const serverSnapshot = () => false;

export function PinnedStory() {
  const pinned = useSyncExternalStore(subscribe, canPin, serverSnapshot);

  return (
    <section aria-labelledby="story-title" className="relative bg-ink">
      {pinned ? <StoryPinned /> : <StoryStack />}
    </section>
  );
}
