'use client';

import Image from 'next/image';
import { useRef } from 'react';
import { motion, useInView } from 'framer-motion';
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
    { label: 'Our vision', index: '01', text: about.vision },
    { label: 'Our mission', index: '02', text: about.mission },
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
                <h3>{item.label}</h3>
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

/** Team portraits: muted until hovered, name and role underneath. */
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
              className="group"
            >
              <div className="relative aspect-[4/5] overflow-hidden rounded-3xl bg-ink-800">
                <Image
                  src={m.image}
                  alt={m.name}
                  fill
                  sizes="(min-width: 1024px) 25vw, 50vw"
                  className="object-cover grayscale transition-[filter,transform] duration-700 ease-expo-out group-hover:scale-[1.04] group-hover:grayscale-0"
                />
                <div aria-hidden className="absolute inset-0 bg-gradient-to-t from-ink/70 via-transparent to-transparent" />
              </div>
              <h3 className="mt-5 font-display text-xl tracking-[-0.015em] text-bone md:text-2xl">{m.name}</h3>
              <p className="mt-1 text-sm text-bone-muted md:text-base">{m.role}</p>
            </motion.li>
          ))}
        </ul>
      </div>
    </section>
  );
}
