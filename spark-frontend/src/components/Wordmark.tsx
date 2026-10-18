import { useId } from 'react';
import { cn } from '@/lib/cn';
import { palette } from '@/lib/tokens';

/** Four-point spark in the brand gradient. */
export function SparkGlyph({ className }: { className?: string }) {
  const id = useId();
  return (
    <svg viewBox="0 0 24 24" aria-hidden className={className}>
      <defs>
        <linearGradient id={id} x1="0" y1="0" x2="1" y2="1">
          <stop offset="0" stopColor={palette.spark.blue} />
          <stop offset="0.5" stopColor={palette.spark.royal} />
          <stop offset="1" stopColor={palette.spark.silver} />
        </linearGradient>
      </defs>
      <path
        fill={`url(#${id})`}
        d="M12 0c.6 5.9 2.7 8.9 9.6 10.8L24 12l-2.4 1.2C14.7 15.1 12.6 18.1 12 24c-.6-5.9-2.7-8.9-9.6-10.8L0 12l2.4-1.2C9.3 8.9 11.4 5.9 12 0Z"
      />
    </svg>
  );
}

export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2 font-display leading-none tracking-tight', className)}>
      <SparkGlyph className="h-[0.7em] w-[0.7em]" />
      SparkCurv
    </span>
  );
}
