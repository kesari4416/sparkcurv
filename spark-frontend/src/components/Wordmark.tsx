import Image from 'next/image';
import { cn } from '@/lib/cn';

/*
 * The SparkCurv logo, rebuilt for dark backgrounds:
 *  - sparkcurv-mark.webp: the ring mark, from the transparent SPARKCURVEICON.png.
 *  - sparkcurv-wordmark.webp: "SPARKCURV Technologies®" lifted off the white background
 *    of sparkcurv-logo.png in the logo's own grey and blue.
 * Both are lossless and served as-is (unoptimized), so the lettering never picks up
 * compression artefacts.
 */
const MARK = { src: '/images/logo/sparkcurv-mark.webp', width: 125, height: 120 };
const WORDMARK = { src: '/images/logo/sparkcurv-wordmark.webp', width: 423, height: 84 };

/** The ring mark on its own (separators in the hero ticker and the marquee). */
export function SparkGlyph({ className }: { className?: string }) {
  return <Image src={MARK.src} width={MARK.width} height={MARK.height} alt="" aria-hidden unoptimized className={cn('object-contain', className)} />;
}

/** Full logo lockup: mark + lettering. Decorative; the enclosing link carries the name. */
export function Wordmark({ className }: { className?: string }) {
  return (
    <span className={cn('inline-flex items-center gap-2.5 md:gap-3', className)}>
      <Image src={MARK.src} width={MARK.width} height={MARK.height} alt="" priority unoptimized className="h-9 w-auto md:h-12" />
      <Image src={WORDMARK.src} width={WORDMARK.width} height={WORDMARK.height} alt="" priority unoptimized className="h-5 w-auto md:h-[30px]" />
    </span>
  );
}
