import Image from 'next/image';
import type { Product } from '@/lib/products';
import { cn } from '@/lib/cn';

/**
 * A product's official logo on a white plate. Both logos are drawn for light backgrounds
 * (Sitera's brand rules forbid recolouring; BuildNexa's ships on white), so the plate keeps
 * them exactly as designed in the dark and light schemes alike.
 */
export function ProductLogo({ product, className, priority }: { product: Product; className?: string; priority?: boolean }) {
  const { logo } = product;
  const stacked = logo.height > logo.width * 0.5; // BuildNexa's lockup is stacked, Sitera's horizontal
  return (
    <div className={cn('grid place-items-center rounded-2xl border bg-white', stacked ? 'px-8 py-6' : 'px-8 py-7', className)}>
      <Image
        src={logo.src}
        alt={product.name}
        width={logo.width}
        height={logo.height}
        priority={priority}
        unoptimized
        className={cn('w-auto', stacked ? 'h-24 md:h-28' : 'h-10 md:h-12')}
      />
    </div>
  );
}
