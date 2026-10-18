'use client';

import Link from 'next/link';
import { ArrowRight } from 'lucide-react';
import { hero } from '@/lib/content';
import { Magnetic } from './Magnetic';

const SIZES = {
  sm: 'px-4 py-2 text-sm',
  md: 'px-6 py-3.5 text-sm md:px-7 md:py-4 md:text-base',
  lg: 'px-7 py-4 text-base md:px-8 md:py-5 md:text-lg',
} as const;

/** "Start a project" pill: magnetic, with a 1px animated gradient border. */
export function CTAButton({ size = 'md' }: { size?: keyof typeof SIZES }) {
  return (
    <Magnetic strength={0.4}>
      <Link href={hero.cta.href} className="group relative inline-flex items-center gap-3 rounded-full p-px">
        {/* The gradient sits behind; the body covers all but a 1px edge. */}
        <span aria-hidden className="absolute inset-0 animate-gradient-pan rounded-full bg-spark bg-[length:200%_100%]" />
        <span
          className={
            'relative inline-flex items-center gap-3 whitespace-nowrap rounded-full bg-ink/90 font-medium backdrop-blur-md transition-colors duration-500 ease-expo-out group-hover:bg-ink/60 ' +
            SIZES[size]
          }
        >
          {hero.cta.label}
          <ArrowRight
            aria-hidden
            strokeWidth={1.75}
            className="h-[1.1em] w-[1.1em] transition-transform duration-500 ease-expo-out group-hover:translate-x-1 group-hover:-rotate-45"
          />
        </span>
      </Link>
    </Magnetic>
  );
}
