'use client';

import { useId, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { BellRing, CheckCircle2, FileText, Mail, MessageCircle, MonitorSmartphone, BookOpen, Printer, UserRound, type LucideIcon } from 'lucide-react';
import type { Channel, Product, WalkStep } from '@/lib/products';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { cn } from '@/lib/cn';
import { SectionIntro } from '@/components/SectionIntro';

const channelIcon: Record<Channel, LucideIcon> = {
  email: Mail,
  whatsapp: MessageCircle,
  portal: MonitorSmartphone,
  pdf: Printer,
  ledger: BookOpen,
  alert: BellRing,
};
const channelLabel: Record<Channel, string> = {
  email: 'Email',
  whatsapp: 'WhatsApp',
  portal: 'In the app',
  pdf: 'PDF / print',
  ledger: 'Posted to the ledger',
  alert: 'Alert',
};

/** Roving-focus tabs: arrow keys move between tabs, Home/End jump to the ends. */
function useTabKeys(count: number, onSelect: (i: number) => void) {
  const refs = useRef<(HTMLButtonElement | null)[]>([]);
  const onKeyDown = (e: React.KeyboardEvent, i: number, vertical = false) => {
    const next = vertical ? 'ArrowDown' : 'ArrowRight';
    const prev = vertical ? 'ArrowUp' : 'ArrowLeft';
    let to = -1;
    if (e.key === next) to = (i + 1) % count;
    else if (e.key === prev) to = (i - 1 + count) % count;
    else if (e.key === 'Home') to = 0;
    else if (e.key === 'End') to = count - 1;
    if (to < 0) return;
    e.preventDefault();
    onSelect(to);
    refs.current[to]?.focus();
  };
  return { refs, onKeyDown };
}

/** A small document card for the selected step: what is created and the statuses it moves through. */
function StepDocument({ product, step }: { product: Product; step: WalkStep }) {
  return (
    <div className="scheme-dark rounded-2xl border bg-ink-800 p-5 md:p-6">
      <div className="flex items-start justify-between gap-4">
        <div className="flex items-center gap-3">
          <span className="grid h-10 w-10 place-items-center rounded-xl text-bone" style={{ background: `${product.brand}40` }}>
            <FileText aria-hidden strokeWidth={1.5} className="h-5 w-5" />
          </span>
          <div>
            <p className="text-base font-medium text-bone">{step.creates}</p>
            {step.number && <p className="tabular font-mono text-xs text-bone/50">{step.number}</p>}
          </div>
        </div>
      </div>
      {step.statuses && step.statuses.length > 0 && (
        <>
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/45">Moves through</p>
          <ol className="mt-3 flex flex-wrap items-center gap-1.5">
            {step.statuses.map((s, i) => (
              <li key={s} className="flex items-center gap-1.5">
                <span
                  className="rounded-full border px-2.5 py-1 text-xs"
                  style={i === step.statuses!.length - 1 ? { background: product.brand, color: product.onBrand, borderColor: 'transparent' } : undefined}
                >
                  {s}
                </span>
                {i < step.statuses!.length - 1 && <span aria-hidden className="text-bone/30">→</span>}
              </li>
            ))}
          </ol>
        </>
      )}
      {step.notify && step.notify.length > 0 && (
        <>
          <p className="mt-6 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/45">Reaches people by</p>
          <ul className="mt-3 flex flex-wrap gap-2">
            {step.notify.map((c) => {
              const Icon = channelIcon[c];
              return (
                <li key={c} className="inline-flex items-center gap-2 rounded-full bg-bone/5 px-3 py-1.5 text-xs text-bone/80">
                  <Icon aria-hidden strokeWidth={1.75} className="h-3.5 w-3.5" />
                  {channelLabel[c]}
                </li>
              );
            })}
          </ul>
        </>
      )}
    </div>
  );
}

/**
 * Interactive job walkthrough. Pick a chain (when the product has several), then a step;
 * the panel shows who does it, what it does, what it creates, the statuses, the approval
 * and how others hear about it.
 */
export function JobWalkthrough({ product }: { product: Product }) {
  const chains = product.walkthrough;
  const [chain, setChain] = useState(0);
  const [step, setStep] = useState(0);
  const uid = useId();
  const steps = chains[chain].steps;
  const current = steps[Math.min(step, steps.length - 1)];
  const chainTabs = useTabKeys(chains.length, (i) => {
    setChain(i);
    setStep(0);
  });
  const stepTabs = useTabKeys(steps.length, setStep);
  const panelRef = useRef<HTMLDivElement>(null);

  // On narrow screens the panel sits below the step list, so a tap brings it into view.
  const pickStep = (i: number) => {
    setStep(i);
    if (!window.matchMedia('(max-width: 1023px)').matches || !panelRef.current) return;
    const lenis = useUI.getState().lenis;
    if (lenis) lenis.scrollTo(panelRef.current, { offset: -110 });
    else panelRef.current.scrollIntoView({ behavior: 'smooth', block: 'start' });
  };

  return (
    <section aria-labelledby="walk-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro
          id="walk-title"
          eyebrow="Walk through a job"
          lead="Follow the work,"
          accent="step by step."
          body={<p>Pick a step to see who does it, what it creates and how everyone else finds out.</p>}
          className="mb-10 md:mb-14"
        />

        {chains.length > 1 && (
          <div role="tablist" aria-label="Workflows" className="mb-8 flex flex-wrap gap-2">
            {chains.map((c, i) => (
              <button
                key={c.title}
                ref={(el) => {
                  chainTabs.refs.current[i] = el;
                }}
                type="button"
                role="tab"
                aria-selected={chain === i}
                tabIndex={chain === i ? 0 : -1}
                onKeyDown={(e) => chainTabs.onKeyDown(e, i)}
                onClick={() => {
                  setChain(i);
                  setStep(0);
                }}
                className={cn(
                  'rounded-full border px-5 py-2.5 text-sm transition-colors duration-300',
                  chain === i ? 'border-bone bg-bone text-ink' : 'text-bone/70 hover:text-bone',
                )}
              >
                {c.title}
              </button>
            ))}
          </div>
        )}

        <div className="grid gap-8 lg:grid-cols-12 lg:gap-8">
          {/* Steps */}
          <div role="tablist" aria-orientation="vertical" aria-label={`${chains[chain].title} steps`} className="lg:col-span-4">
            <ol className="relative space-y-1">
              <span aria-hidden className="absolute bottom-4 left-[1.05rem] top-4 w-px" style={{ background: `${product.brand}55` }} />
              {steps.map((s, i) => {
                const active = i === step;
                return (
                  <li key={s.label}>
                    <button
                      ref={(el) => {
                        stepTabs.refs.current[i] = el;
                      }}
                      type="button"
                      role="tab"
                      id={`${uid}-tab-${i}`}
                      aria-selected={active}
                      aria-controls={`${uid}-panel`}
                      tabIndex={active ? 0 : -1}
                      onKeyDown={(e) => stepTabs.onKeyDown(e, i, true)}
                      onClick={() => pickStep(i)}
                      className={cn(
                        'relative flex w-full items-center gap-4 rounded-2xl px-2 py-3 text-left transition-colors duration-300',
                        active ? 'bg-bone/[0.06]' : 'hover:bg-bone/[0.03]',
                      )}
                    >
                      <span
                        className="relative z-10 grid h-[1.6rem] w-[1.6rem] shrink-0 place-items-center rounded-full font-mono text-[0.65rem] ring-4 ring-ink transition-colors duration-300"
                        style={active ? { background: product.brand, color: product.onBrand } : { background: 'rgb(var(--ink-700))', color: 'rgb(var(--bone) / 0.6)' }}
                      >
                        {i + 1}
                      </span>
                      <span className={cn('font-display text-lg leading-tight tracking-[-0.01em] transition-colors', active ? 'text-bone' : 'text-bone/60')}>{s.label}</span>
                    </button>
                  </li>
                );
              })}
            </ol>
          </div>

          {/* Detail */}
          <div ref={panelRef} id={`${uid}-panel`} role="tabpanel" aria-labelledby={`${uid}-tab-${step}`} className="lg:col-span-8">
            <AnimatePresence mode="wait">
              <motion.div
                key={`${chain}-${step}`}
                initial={{ opacity: 0, y: 14 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.35, ease: ease.out }}
                className="glass grid gap-8 rounded-3xl p-6 md:grid-cols-2 md:p-8"
              >
                <div>
                  <p className="font-mono text-eyebrow uppercase text-bone/50">
                    Step {step + 1} of {steps.length}
                  </p>
                  <h3 className="mt-3 font-display text-[clamp(1.6rem,2.4vw,2.2rem)] leading-tight tracking-[-0.02em] text-bone">{current.label}</h3>
                  <p className="mt-4 text-base leading-relaxed text-bone-muted md:text-lg">{current.what}</p>
                  <dl className="mt-6 space-y-4 border-t pt-6">
                    <div className="flex gap-3">
                      <UserRound aria-hidden strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-bone/50" />
                      <div>
                        <dt className="text-xs uppercase tracking-[0.14em] text-bone/45">Who</dt>
                        <dd className="mt-1 text-bone/90">{current.who}</dd>
                      </div>
                    </div>
                    {current.approval && (
                      <div className="flex gap-3">
                        <CheckCircle2 aria-hidden strokeWidth={1.5} className="mt-0.5 h-5 w-5 shrink-0 text-bone/50" />
                        <div>
                          <dt className="text-xs uppercase tracking-[0.14em] text-bone/45">Approval</dt>
                          <dd className="mt-1 text-bone/90">{current.approval}</dd>
                        </div>
                      </div>
                    )}
                  </dl>
                </div>
                <StepDocument product={product} step={current} />
              </motion.div>
            </AnimatePresence>
          </div>
        </div>
      </div>
    </section>
  );
}

/**
 * "A day in the role": one tab per role, showing the screens they use, what they do and
 * what they approve, and the problem it answers for them when the product states one.
 */
export function RoleDays({ product }: { product: Product }) {
  const [active, setActive] = useState(0);
  const uid = useId();
  const tabs = useTabKeys(product.days.length, setActive);
  const day = product.days[active];

  return (
    <section aria-labelledby="days-title" className="py-24 md:py-32">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="days-title" eyebrow="A day in the role" lead="Built around" accent="who does the work." className="mb-10 md:mb-14" />

        <div role="tablist" aria-label="Roles" className="scrollbar-hide -mx-1 mb-8 flex gap-2 overflow-x-auto px-1 pb-1">
          {product.days.map((d, i) => (
            <button
              key={d.role}
              ref={(el) => {
                tabs.refs.current[i] = el;
              }}
              type="button"
              role="tab"
              id={`${uid}-role-${i}`}
              aria-selected={active === i}
              aria-controls={`${uid}-role-panel`}
              tabIndex={active === i ? 0 : -1}
              onKeyDown={(e) => tabs.onKeyDown(e, i)}
              onClick={() => setActive(i)}
              className={cn(
                'shrink-0 rounded-full border px-5 py-2.5 text-sm transition-colors duration-300',
                active === i ? 'border-bone bg-bone text-ink' : 'text-bone/70 hover:text-bone',
              )}
            >
              {d.role}
            </button>
          ))}
        </div>

        <div id={`${uid}-role-panel`} role="tabpanel" aria-labelledby={`${uid}-role-${active}`}>
          <AnimatePresence mode="wait">
            <motion.div
              key={day.role}
              initial={{ opacity: 0, y: 14 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -10 }}
              transition={{ duration: 0.35, ease: ease.out }}
              className="grid gap-10 lg:grid-cols-12 lg:gap-8"
            >
              <div className="lg:col-span-5">
                {day.pain ? (
                  <blockquote className="font-display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.15] tracking-[-0.02em] text-bone">
                    <span aria-hidden className="mr-1 text-bone/35">
                      “
                    </span>
                    {day.pain}
                    <span aria-hidden className="text-bone/35">
                      ”
                    </span>
                  </blockquote>
                ) : (
                  <p className="font-display text-[clamp(1.5rem,2.4vw,2.2rem)] leading-[1.15] tracking-[-0.02em] text-bone">{day.summary}</p>
                )}
                {day.pain && day.summary && <p className="mt-6 max-w-[46ch] text-lg leading-relaxed text-bone-muted">{day.summary}</p>}
                <p className="mt-8 font-mono text-[0.65rem] uppercase tracking-[0.16em] text-bone/45">Works in</p>
                <ul className="mt-3 flex flex-wrap gap-2">
                  {day.uses.map((u) => (
                    <li key={u} className="rounded-full border px-3 py-1.5 text-sm text-bone/85">
                      {u}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="grid gap-8 sm:grid-cols-2 lg:col-span-7">
                <div>
                  <h3 className="font-mono text-eyebrow uppercase text-bone/55">Day to day</h3>
                  <ul className="mt-4 space-y-3 border-t pt-4">
                    {day.daily.map((t) => (
                      <li key={t} className="text-base leading-relaxed text-bone/85">
                        {t}
                      </li>
                    ))}
                  </ul>
                </div>
                {day.approves && day.approves.length > 0 && (
                  <div>
                    <h3 className="font-mono text-eyebrow uppercase text-bone/55">Approves</h3>
                    <ul className="mt-4 space-y-3 border-t pt-4">
                      {day.approves.map((t) => (
                        <li key={t} className="flex items-start gap-3 text-base leading-relaxed text-bone/85">
                          <CheckCircle2 aria-hidden strokeWidth={1.75} className="mt-1 h-4 w-4 shrink-0 text-bone/60" />
                          {t}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
              </div>
            </motion.div>
          </AnimatePresence>
        </div>

        {product.allRoles && (
          <p className="mt-14 max-w-[80ch] border-t pt-6 text-sm leading-relaxed text-bone-muted">
            <span className="text-bone/80">All roles: </span>
            {product.allRoles}
          </p>
        )}
      </div>
    </section>
  );
}
