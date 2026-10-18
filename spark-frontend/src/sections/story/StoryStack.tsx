'use client';

import Image from 'next/image';
import { motion } from 'framer-motion';
import { chapters } from '@/lib/content';
import { ease } from '@/lib/tokens';
import { moodBackground } from './moods';
import { ChapterIndex, ChapterTitle, ExploreLink } from './parts';

/**
 * Non-pinned layout: touch devices, narrow screens and reduced-motion users (and the
 * server render, so most mobile visitors never see a layout swap).
 *
 * The chapters are a plain ordered list of full-bleed cards. Each card uses its poster
 * as a static background (no autoplaying video) and opens with a clip-path reveal,
 * like a frame widening, when it scrolls into view. Nothing moves or scales.
 */
export function StoryStack() {
  return (
    <div className="mx-auto max-w-site px-gutter py-24 md:py-32">
      <h2 id="story-title" className="flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
        <span className="h-1.5 w-1.5 rounded-full bg-spark-royal" />
        How we work
      </h2>

      <ol className="mt-10 flex flex-col gap-4 md:mt-14 md:gap-6">
        {chapters.map((chapter, i) => (
          <li key={chapter.index}>
            <motion.article
              initial={{ clipPath: 'inset(8% 6% 8% 6% round 32px)' }}
              whileInView={{ clipPath: 'inset(0% 0% 0% 0% round 24px)' }}
              viewport={{ once: true, amount: 0.3 }}
              transition={{ duration: 1.2, ease: ease.inOut }}
              className="relative isolate flex min-h-[78svh] flex-col justify-end overflow-hidden rounded-3xl p-6 md:min-h-[70svh] md:p-10"
            >
              <Image
                src={chapter.poster}
                alt=""
                fill
                sizes="(min-width: 1680px) 1680px, 100vw"
                className="-z-20 object-cover"
              />
              {/* The chapter's colour mood, frozen: the same palette the pinned version morphs through. */}
              <div aria-hidden className="absolute inset-0 -z-10" style={{ backgroundImage: moodBackground(i) }} />
              {/* Legibility scrim for the copy at the bottom. */}
              <div aria-hidden className="absolute inset-0 -z-10 bg-gradient-to-t from-ink via-ink/75 to-ink/20" />

              <p className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase">
                <ChapterIndex index={chapter.index} total={chapters.length} />
              </p>
              <h3 className="font-display text-display-md text-bone">
                <ChapterTitle title={chapter.title} />
              </h3>
              <p className="mt-5 max-w-[40ch] text-base leading-relaxed text-bone-muted md:text-lg">{chapter.body}</p>
              <div>
                <ExploreLink href={chapter.href} title={chapter.title} label={chapter.cta} />
              </div>
            </motion.article>
          </li>
        ))}
      </ol>
    </div>
  );
}
