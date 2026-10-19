'use client';

import Image from 'next/image';
import { useCallback, useEffect, useId, useRef, useState } from 'react';
import { AnimatePresence, motion, useReducedMotion } from 'framer-motion';
import { X } from 'lucide-react';
import { about, type TeamMember } from '@/lib/pages';
import { site } from '@/lib/content';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';

/**
 * Team cards: photo, name and role. Clicking a card opens that person's profile: photo,
 * name, role, LinkedIn link and a short summary. Esc, the close button or a click outside
 * closes it, and focus returns to the card that opened it.
 */
export function Team() {
  const dialogId = useId();
  const [activeIndex, setActiveIndex] = useState<number | null>(null);
  const triggers = useRef<(HTMLButtonElement | null)[]>([]);
  const active = activeIndex === null ? null : about.team[activeIndex];

  const close = useCallback(() => {
    if (activeIndex !== null) triggers.current[activeIndex]?.focus();
    setActiveIndex(null);
  }, [activeIndex]);

  // Stop the smooth-scroll loop while a profile is open, so the page behind it stays still.
  useEffect(() => {
    if (activeIndex === null) return;
    const lenis = useUI.getState().lenis;
    lenis?.stop();
    return () => lenis?.start();
  }, [activeIndex]);

  return (
    <>
      <section aria-labelledby="team-title" className="pb-24 md:pb-36 [content-visibility:auto] [contain-intrinsic-size:auto_900px]">
        <div className="mx-auto max-w-site px-gutter">
          <SectionIntro
            id="team-title"
            eyebrow="The people"
            lead="Meet the"
            accent="team."
            aside={
              <a
                href={`mailto:${site.email}?subject=${encodeURIComponent('Joining SparkCurv')}`}
                className="group relative inline-flex items-center gap-2 pb-1 text-base text-bone md:text-lg"
              >
                <span className="text-bone-muted transition-colors duration-300 group-hover:text-bone">{about.join.body}</span> Join us
                <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                  →
                </span>
              </a>
            }
            className="mb-12 md:mb-16"
          />
          {/* Centred wrap rather than a grid, so a short last row (three people) stays in the middle. */}
          <ul className="flex flex-wrap justify-center gap-4 md:gap-5">
            {about.team.map((m, i) => (
              <motion.li
                key={m.name}
                initial={{ opacity: 0, y: 40 }}
                whileInView={{ opacity: 1, y: 0 }}
                viewport={{ once: true, margin: '0px 0px -10% 0px' }}
                transition={{ duration: 0.9, ease: ease.out, delay: (i % 4) * 0.08 }}
                className="w-[calc(50%-0.5rem)] md:w-[calc(50%-0.625rem)] lg:w-[calc(25%-0.9375rem)]"
              >
                <button
                  ref={(el) => {
                    triggers.current[i] = el;
                  }}
                  type="button"
                  onClick={() => setActiveIndex(i)}
                  aria-haspopup="dialog"
                  aria-label={`View ${m.name}'s profile`}
                  className="scheme-dark group relative block w-full cursor-pointer rounded-3xl p-px text-left"
                >
                  {/* Frame: a hairline at rest, the brand gradient on hover. */}
                  <span aria-hidden className="absolute inset-0 rounded-3xl bg-hairline" />
                  <span
                    aria-hidden
                    className="absolute inset-0 animate-gradient-pan rounded-3xl bg-spark bg-[length:200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
                  />
                  <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(1.5rem-1px)] bg-ink-800">
                    <Image
                      src={m.image}
                      alt=""
                      fill
                      sizes="(min-width: 1024px) 25vw, 50vw"
                      className="object-cover transition-transform duration-[1400ms] ease-expo-out group-hover:scale-[1.06]"
                    />
                    {/* Legibility scrim for the caption. */}
                    <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                    {/* Brand tint rising from the bottom on hover. */}
                    <div
                      aria-hidden
                      className="absolute inset-0 translate-y-1/4 bg-gradient-to-t from-spark-royal/45 via-spark-blue/10 to-transparent opacity-0 transition-[opacity,transform] duration-700 ease-expo-out group-hover:translate-y-0 group-hover:opacity-100"
                    />
                    <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                      <span className="block font-display text-lg leading-tight tracking-[-0.015em] text-bone md:text-2xl">{m.name}</span>
                      <span className="mt-1 block text-xs leading-snug text-bone/75 md:text-sm">{m.role}</span>
                    </div>
                  </div>
                </button>
              </motion.li>
            ))}
          </ul>
        </div>
      </section>

      {/* Outside the section: its content-visibility containment would clip a fixed overlay. */}
      <AnimatePresence>{active && <TeamDialog key={active.name} id={dialogId} member={active} onClose={close} />}</AnimatePresence>
    </>
  );
}

function TeamDialog({ id, member, onClose }: { id: string; member: TeamMember; onClose: () => void }) {
  const reduce = !!useReducedMotion();
  const panelRef = useRef<HTMLDivElement>(null);
  const closeRef = useRef<HTMLButtonElement>(null);

  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
        return;
      }
      if (e.key !== 'Tab') return;
      // Two controls inside the dialog (the LinkedIn link and close), so Tab wraps between them.
      const controls = panelRef.current?.querySelectorAll<HTMLElement>('a[href], button');
      if (!controls?.length) return;
      const first = controls[0];
      const last = controls[controls.length - 1];
      if (e.shiftKey && document.activeElement === first) {
        e.preventDefault();
        last.focus();
      } else if (!e.shiftKey && document.activeElement === last) {
        e.preventDefault();
        first.focus();
      }
    };
    window.addEventListener('keydown', onKey);
    return () => window.removeEventListener('keydown', onKey);
  }, [onClose]);

  return (
    <motion.div
      className="fixed inset-0 z-[80] grid place-items-center overflow-y-auto bg-ink/75 p-4 backdrop-blur-sm md:p-8"
      initial={reduce ? false : { opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: reduce ? 0 : 0.35, ease: ease.out }}
      onMouseDown={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <motion.div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={`${id}-name`}
        data-lenis-prevent
        initial={reduce ? false : { opacity: 0, y: 24 }}
        animate={{ opacity: 1, y: 0 }}
        exit={{ opacity: 0, y: 12 }}
        transition={{ duration: reduce ? 0 : 0.6, ease: ease.out }}
        className="relative grid w-full max-w-3xl overflow-hidden rounded-3xl border bg-ink-800 md:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]"
      >
        <div className="relative aspect-[4/5] min-h-[18rem] md:aspect-auto">
          <Image src={member.image} alt="" fill sizes="(min-width: 768px) 40vw, 100vw" className="object-cover" />
        </div>
        <div className="flex flex-col justify-center p-6 md:p-10">
          <p className="font-mono text-eyebrow uppercase text-bone-muted">{site.name} team</p>
          <h3 id={`${id}-name`} className="mt-4 font-display text-3xl leading-tight tracking-[-0.02em] text-bone md:text-4xl">
            {member.name}
          </h3>
          <p className="mt-2 text-base text-bone-muted">{member.role}</p>
          <a
            href={member.linkedin}
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 block break-all font-bold text-bone underline decoration-bone/30 underline-offset-4 transition-colors duration-300 hover:decoration-bone"
          >
            {member.linkedin}
          </a>
          <p className="mt-6 leading-relaxed text-bone/80">{member.summary}</p>
        </div>
        <button
          ref={closeRef}
          type="button"
          onClick={onClose}
          aria-label="Close profile"
          className="absolute right-4 top-4 grid h-11 w-11 place-items-center rounded-full bg-ink/70 text-bone backdrop-blur-md transition-colors duration-300 hover:bg-bone/10"
        >
          <X aria-hidden className="h-5 w-5" strokeWidth={1.75} />
        </button>
      </motion.div>
    </motion.div>
  );
}
