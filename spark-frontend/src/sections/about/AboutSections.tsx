'use client';

import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
import { Compass, Telescope } from 'lucide-react';
import { about } from '@/lib/pages';
import { site } from '@/lib/content';
import { useUI } from '@/lib/store';
import { ease } from '@/lib/tokens';
import { SectionIntro } from '@/components/SectionIntro';
import { RevealText } from '@/components/RevealText';

/** Hero figures: four big numbers over a hairline. */
export function AboutStats() {
  const play = useUI((s) => s.introDone);
  return (
    <dl className="mt-16 grid grid-cols-2 border-t md:mt-24 lg:grid-cols-4">
      {about.stats.map((s, i) => (
        <motion.div
          key={s.label}
          initial={{ opacity: 0, y: 24 }}
          animate={play ? { opacity: 1, y: 0 } : undefined}
          transition={{ duration: 0.9, ease: ease.out, delay: 0.6 + i * 0.08 }}
          className="flex flex-col-reverse gap-2 border-b py-6 pr-4 md:py-8 lg:border-b-0 lg:[&:not(:first-child)]:border-l lg:[&:not(:first-child)]:pl-8"
        >
          <dt className="font-mono text-eyebrow uppercase text-bone/50">{s.label}</dt>
          <dd className="tabular font-display text-[clamp(2.75rem,5vw,4.5rem)] leading-none tracking-[-0.03em] text-bone">{s.value}</dd>
        </motion.div>
      ))}
    </dl>
  );
}

/** The story: the first sentence as a large statement, the rest underneath. */
export function Story() {
  const ref = useRef<HTMLElement>(null);
  const inView = useInView(ref, { once: true, margin: '0px 0px -25% 0px' });
  const [lead, ...rest] = about.story;
  return (
    <section ref={ref} aria-labelledby="story-title" className="py-24 md:py-36">
      <div className="mx-auto grid max-w-site gap-10 px-gutter lg:grid-cols-12 lg:gap-8">
        <h2 id="story-title" className="flex items-center gap-3 self-start font-mono text-eyebrow uppercase text-bone/60 lg:col-span-3">
          <span aria-hidden className="h-1.5 w-1.5 rounded-full bg-spark-blue" />
          The SparkCurv story
        </h2>
        <div className="lg:col-span-9">
          <p className="font-display text-[clamp(1.9rem,4vw,3.75rem)] leading-[1.08] tracking-[-0.02em] text-bone">
            <RevealText text={lead} play={inView} stagger={0.025} />
          </p>
          <div className="mt-12 grid gap-6 md:mt-16 md:grid-cols-2 md:gap-8">
            {rest.map((p, i) => (
              <motion.p
                key={p}
                initial={{ opacity: 0, y: 20 }}
                animate={inView ? { opacity: 1, y: 0 } : undefined}
                transition={{ duration: 0.9, ease: ease.out, delay: 0.6 + i * 0.1 }}
                className="max-w-[46ch] text-lg leading-relaxed text-bone-muted"
              >
                {p}
              </motion.p>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

/** Vision and mission side by side, each in a tall glass panel. */
export function VisionMission() {
  const items = [
    { label: 'Our vision', index: '01', text: about.vision, Icon: Telescope },
    { label: 'Our mission', index: '02', text: about.mission, Icon: Compass },
  ];
  return (
    <section aria-labelledby="vm-title" className="pb-24 md:pb-36">
      <div className="mx-auto max-w-site px-gutter">
        <SectionIntro id="vm-title" eyebrow="What drives us" lead="Vision &" accent="mission." dot="silver" className="mb-12 md:mb-16" />
        <div className="grid gap-4 md:grid-cols-2 md:gap-5">
          {items.map((item, i) => (
            <motion.article
              key={item.label}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease: ease.out, delay: i * 0.1 }}
              className="glass relative isolate flex min-h-[26rem] flex-col justify-between overflow-hidden rounded-3xl p-6 md:p-10"
            >
              <span
                aria-hidden
                className="absolute -right-24 -top-24 -z-10 h-72 w-72 rounded-full opacity-60 blur-3xl"
                style={{ background: i === 0 ? 'rgba(36,103,255,0.35)' : 'rgba(201,206,214,0.18)' }}
              />
              <div className="flex items-center justify-between font-mono text-eyebrow uppercase text-bone/50">
                <h3 className="flex items-center gap-3">
                  <item.Icon aria-hidden strokeWidth={1.25} className="h-5 w-5 text-spark-blue" />
                  {item.label}
                </h3>
                <span aria-hidden className="tabular">{item.index}</span>
              </div>
              <p className="mt-12 text-[clamp(1.2rem,1.7vw,1.5rem)] leading-relaxed text-bone/90">{item.text}</p>
            </motion.article>
          ))}
        </div>
      </div>
    </section>
  );
}

/** Initials for a team card: "Ponish Jino" becomes "PJ". */
const initials = (name: string) =>
  name
    .split(/\s+/)
    .map((part) => part[0])
    .slice(0, 2)
    .join('')
    .toUpperCase();

/**
 * Team cards without photos: a monogram in a glass disc, with name and role on the card.
 * Hover (or focus within): the monogram eases up, a brand tint rises from the bottom and a
 * gradient hairline lights the frame, the same language as the home page tiles.
 */
export function Team() {
  return (
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
        <ul className="grid grid-cols-2 gap-4 md:gap-5 lg:grid-cols-4">
          {about.team.map((m, i) => (
            <motion.li
              key={m.name}
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: '0px 0px -10% 0px' }}
              transition={{ duration: 0.9, ease: ease.out, delay: (i % 4) * 0.08 }}
              className="scheme-dark group relative rounded-3xl p-px"
            >
              {/* Frame: a hairline at rest, the brand gradient on hover. */}
              <span aria-hidden className="absolute inset-0 rounded-3xl bg-hairline" />
              <span
                aria-hidden
                className="absolute inset-0 animate-gradient-pan rounded-3xl bg-spark bg-[length:200%_100%] opacity-0 transition-opacity duration-700 group-hover:opacity-100"
              />
              <div className="relative aspect-[4/5] overflow-hidden rounded-[calc(1.5rem-1px)] bg-ink-800">
                <div aria-hidden className="absolute inset-0 grid place-items-center">
                  <span className="glass grid h-24 w-24 place-items-center rounded-full transition-transform duration-[1400ms] ease-expo-out group-hover:scale-[1.06] md:h-32 md:w-32">
                    <span className="font-display text-3xl leading-none tracking-[-0.02em] text-gradient md:text-4xl">{initials(m.name)}</span>
                  </span>
                </div>
                {/* Legibility scrim for the caption. */}
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/90 via-ink/20 to-transparent" />
                {/* Brand tint rising from the bottom on hover. */}
                <div
                  aria-hidden
                  className="absolute inset-0 translate-y-1/4 bg-gradient-to-t from-spark-royal/45 via-spark-blue/10 to-transparent opacity-0 transition-[opacity,transform] duration-700 ease-expo-out group-hover:translate-y-0 group-hover:opacity-100"
                />
                <div className="absolute inset-x-0 bottom-0 p-4 md:p-6">
                  <h3 className="font-display text-lg leading-tight tracking-[-0.015em] text-bone md:text-2xl">{m.name}</h3>
                  <p className="mt-1 text-xs leading-snug text-bone/75 md:text-sm">{m.role}</p>
                </div>
              </div>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
