import Image from 'next/image';
import { Lock } from 'lucide-react';
import type { Product } from '@/lib/products';
import { cn } from '@/lib/cn';

/*
 * Coded interface previews. Both products are light-themed apps, so the previews use a
 * fixed light palette (not the site scheme) and read like a screen. They are built from
 * each app's real sidebar labels and one real workflow, with no invented figures, names or
 * results. Swap in real screenshots (taken with demo data) when they exist.
 */

const ui = {
  window: 'bg-white text-[#1F2430]',
  side: 'bg-[#F3F5F8]',
  line: 'border-[#E4E7EC]',
  muted: 'text-[#5B6474]',
};

function Chip({ product, children, active }: { product: Product; children: React.ReactNode; active?: boolean }) {
  return (
    <span
      className="inline-flex items-center rounded-full px-2.5 py-1 text-[0.7rem] font-medium leading-none"
      style={
        active
          ? { background: product.brand, color: product.onBrand }
          : { background: `${product.brand}1F`, color: '#1F2430' }
      }
    >
      {children}
    </span>
  );
}

/** Desktop app window: address bar, sidebar with the real menu, one real workflow. */
export function ProductPreview({ product, className }: { product: Product; className?: string }) {
  const { preview } = product;
  return (
    <figure
      className={cn('overflow-hidden rounded-2xl border shadow-[0_30px_80px_-30px_rgba(0,0,0,0.6)]', ui.window, className)}
      aria-label={`Interface preview of ${product.name}`}
    >
      <div className={cn('flex items-center gap-3 border-b px-4 py-3', ui.line, ui.side)}>
        <span aria-hidden className="flex gap-1.5">
          <span className="h-2.5 w-2.5 rounded-full bg-[#D5D9E0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D5D9E0]" />
          <span className="h-2.5 w-2.5 rounded-full bg-[#D5D9E0]" />
        </span>
        <span className={cn('flex min-w-0 flex-1 items-center gap-2 rounded-md bg-white px-3 py-1.5 text-xs', ui.muted)}>
          <Lock aria-hidden strokeWidth={2} className="h-3 w-3 shrink-0" />
          <span className="truncate">{preview.url}</span>
        </span>
      </div>

      {/* Phones show the main panel only; the menu column appears from sm up. */}
      <div className="grid grid-cols-1 sm:grid-cols-[minmax(0,13rem)_minmax(0,1fr)]">
        <nav aria-label={`${product.name} menu (preview)`} className={cn('hidden border-r px-3 py-4 sm:block', ui.line, ui.side)}>
          <div className="mb-4 flex items-center gap-2 px-2">
            <Image src={product.mark.src} alt="" width={product.mark.width} height={product.mark.height} unoptimized className="h-6 w-auto" />
            <span className="text-sm font-semibold">{product.name}</span>
          </div>
          <ul className="space-y-0.5">
            {preview.sidebar.map((item) => {
              const active = item === preview.active;
              return (
                <li
                  key={item}
                  className={cn('truncate rounded-md px-2 py-1.5 text-[0.78rem]', active ? 'font-semibold' : ui.muted)}
                  style={active ? { background: product.brand, color: product.onBrand } : undefined}
                >
                  {item}
                </li>
              );
            })}
          </ul>
        </nav>

        <div className="min-w-0 p-4 sm:p-6">
          <p className={cn('text-[0.7rem] uppercase tracking-[0.12em]', ui.muted)}>{preview.active}</p>
          <p className="mt-1 text-lg font-semibold tracking-tight">{preview.title}</p>
          <ol className={cn('mt-5 divide-y rounded-xl border', ui.line)}>
            {preview.rows.map((row, i) => (
              <li key={row.label} className={cn('flex items-center gap-3 px-4 py-3', ui.line)}>
                <span
                  aria-hidden
                  className="grid h-6 w-6 shrink-0 place-items-center rounded-full text-[0.7rem] font-semibold"
                  style={{ background: `${product.brand}24`, color: '#1F2430' }}
                >
                  {i + 1}
                </span>
                <span className="min-w-0 flex-1">
                  <span className="block truncate text-sm font-medium">{row.label}</span>
                  <span className={cn('block truncate text-xs', ui.muted)}>{row.meta}</span>
                </span>
                <Chip product={product}>{row.status}</Chip>
              </li>
            ))}
          </ol>
        </div>
      </div>
    </figure>
  );
}

/** Sitera's Android app: a phone frame with the app's field-ops actions and bottom tabs. */
export function PhonePreview({ product, className }: { product: Product; className?: string }) {
  const actions = ['Labour attendance', 'Labour payments', 'Material request', 'Progress update'];
  const statuses = ['Present', 'Half day', 'Absent', 'Leave'];
  const tabs = ['Dashboard', 'Projects', 'Field Ops', 'Inventory', 'Leads'];
  return (
    <figure
      aria-label={`${product.name} Android app preview`}
      className={cn('w-[15.5rem] rounded-[2.2rem] border-[6px] border-[#1C1F26] bg-[#1C1F26] shadow-[0_30px_70px_-25px_rgba(0,0,0,0.7)]', className)}
    >
      <div className={cn('flex h-[28rem] flex-col overflow-hidden rounded-[1.8rem]', ui.window)}>
        <div className={cn('flex items-center gap-2 border-b px-4 pb-3 pt-5', ui.line)}>
          <Image src={product.mark.src} alt="" width={product.mark.width} height={product.mark.height} unoptimized className="h-5 w-auto" />
          <span className="text-sm font-semibold">Field Ops</span>
        </div>
        <div className="flex-1 space-y-3 overflow-hidden p-4">
          <div className="flex flex-wrap gap-1.5">
            {statuses.map((s, i) => (
              <Chip key={s} product={product} active={i === 0}>
                {s}
              </Chip>
            ))}
          </div>
          <ul className={cn('divide-y rounded-xl border', ui.line)}>
            {actions.map((a) => (
              <li key={a} className={cn('px-3 py-2.5 text-[0.8rem] font-medium', ui.line)}>
                {a}
              </li>
            ))}
          </ul>
        </div>
        <ul className={cn('grid grid-cols-5 border-t px-1 py-2', ui.line, ui.side)}>
          {tabs.map((t) => (
            <li
              key={t}
              className={cn('truncate text-center text-[0.6rem]', t === 'Field Ops' ? 'font-semibold' : ui.muted)}
              style={t === 'Field Ops' ? { color: '#B45309' } : undefined}
            >
              {t}
            </li>
          ))}
        </ul>
      </div>
    </figure>
  );
}
