'use client';

import Link from 'next/link';
import type { FocusEventHandler } from 'react';

/** Chapter title with the last word set light, in the brand gradient. */
export function ChapterTitle({ title }: { title: string }) {
  const words = title.split(' ');
  const last = words.pop();
  return (
    <>
      {words.length > 0 && `${words.join(' ')} `}
      <em className="text-gradient pr-[0.06em] font-light not-italic">{last}</em>
    </>
  );
}

/** "01 / 04" in mono. */
export function ChapterIndex({ index, total }: { index: string; total: number }) {
  return (
    <>
      <span className="tabular text-gradient">{index}</span>
      <span aria-hidden className="h-px w-8 bg-bone/30" />
      <span className="tabular text-bone/60">{String(total).padStart(2, '0')}</span>
    </>
  );
}

/**
 * Chapter call-to-action pill ("Book a consultation →"). Falls back to "Explore {title}"
 * when no label is given. pointer-events-auto because the pinned layout stacks chapters
 * on top of each other with pointer-events-none.
 */
export function ExploreLink({
  href,
  title,
  label,
  onFocus,
}: {
  href: string;
  title: string;
  label?: string;
  onFocus?: FocusEventHandler<HTMLAnchorElement>;
}) {
  return (
    <Link
      href={href}
      onFocus={onFocus}
      className="group pointer-events-auto mt-8 inline-flex items-center gap-3 rounded-full border border-bone/25 px-5 py-3 font-mono text-eyebrow uppercase text-bone transition-colors duration-500 ease-expo-out hover:border-bone hover:bg-bone hover:text-ink focus-visible:rounded-full md:mt-10"
    >
      {label ?? (
        <>
          Explore<span className="sr-only"> {title}</span>
        </>
      )}
      <span aria-hidden className="transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
        →
      </span>
    </Link>
  );
}
