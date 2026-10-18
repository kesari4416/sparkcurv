'use client';

import { useLayoutEffect, useRef, useState, type FocusEvent } from 'react';
import { gsap } from 'gsap';
import { ScrollTrigger } from 'gsap/ScrollTrigger';
import { chapters } from '@/lib/content';
import { gsapEase } from '@/lib/tokens';
import { useUI } from '@/lib/store';
import { cn } from '@/lib/cn';
import { blobColors, moodFor } from './moods';
import { ChapterIndex, ChapterTitle, ExploreLink } from './parts';

gsap.registerPlugin(ScrollTrigger);

/*
 * Timeline units (arbitrary; the ScrollTrigger maps the whole timeline onto
 * chapters.length viewport heights of scrolling).
 *
 *   0 ─ HOLD ─┬─ T ─┬─ HOLD ─┬─ T ─┬─ HOLD ─┬─ T ─┬─ TAIL
 *   ch0 read  │ 0→1 │ ch1    │ 1→2 │ ch2    │ 2→3 │ ch3
 *            ch0   ch1                            ch3 (labels sit where a chapter is fully in)
 *
 * Every chapter label is a multiple of STEP, so the chapter dots on the progress track
 * can sit at even intervals and the fill reaches each dot exactly when its chapter lands.
 */
const HOLD = 0.5; // time a chapter stays still so it can be read
const T = 1; // length of one chapter-to-chapter transition
const TAIL = 0.5; // the last chapter stays pinned a moment before the page moves on
const STEP = HOLD + T;
const COUNT = chapters.length;
const LAST = (COUNT - 1) * STEP; // label of the last chapter
const TOTAL = LAST + TAIL;

/** Where the active chapter flips: halfway through each transition (as timeline progress). */
const SWITCH_AT = chapters.slice(1).map((_, k) => (k * STEP + HOLD + T / 2) / TOTAL);

/** Position of chapter i's dot along the progress track, in %. */
const dotPosition = (i: number) => (i / Math.max(COUNT - 1, 1)) * 100;

export function StoryPinned() {
  const stageRef = useRef<HTMLDivElement>(null);
  const triggerRef = useRef<ScrollTrigger | null>(null);
  const [active, setActive] = useState(0);

  useLayoutEffect(() => {
    const stage = stageRef.current;
    if (!stage) return;

    const all = <E extends Element = HTMLElement>(selector: string) => Array.from(stage.querySelectorAll<E>(selector));
    const frames = all('[data-story="frame"]');
    const videos = all<HTMLVideoElement>('[data-story="video"]');
    const indexes = all('[data-story="index"]');
    const titles = all('[data-story="title"]');
    const metas = all('[data-story="meta"]');
    const numerals = all('[data-story="numeral"]');
    const layers = all('[data-story="blob-layer"]');
    const blobs = all('[data-story="blob"]');

    let current = -1; // active chapter as last synced (-1 forces the first sync)
    let visible = false; // stage on (or near) screen

    // Only the active chapter's video plays. The next one starts buffering so it is
    // ready by the time its circle opens; the rest keep preload="none".
    const syncVideos = () => {
      videos.forEach((video, i) => {
        if (visible && i === current) {
          video.preload = 'auto';
          if (video.paused) video.play().catch(() => {}); // autoplay can be refused; the poster stays
        } else if (!video.paused) {
          video.pause();
        }
      });
      const next = videos[current + 1];
      if (visible && next) next.preload = 'auto';
    };

    const syncActive = (progress: number) => {
      const index = SWITCH_AT.filter((p) => progress >= p).length;
      if (index === current) return;
      current = index;
      setActive(index);
      syncVideos();
    };

    // Centre of chapter i's dot on whichever progress track is showing, relative to
    // the stage. The background circle for that chapter grows out of this point.
    const dotCenter = (i: number) => {
      const box = stage.getBoundingClientRect();
      const dot = all(`[data-story-dot="${i}"]`).find((d) => d.getClientRects().length > 0);
      if (!dot) return { x: box.width * 0.9, y: box.height / 2, w: box.width, h: box.height };
      const r = dot.getBoundingClientRect();
      return { x: r.left + r.width / 2 - box.left, y: r.top + r.height / 2 - box.top, w: box.width, h: box.height };
    };
    // Closed: radius 0. Open: radius reaches the farthest corner, so the frame is fully covered.
    const circle = (i: number, open: boolean) => {
      const { x, y, w, h } = dotCenter(i);
      const radius = open ? Math.ceil(Math.hypot(Math.max(x, w - x), Math.max(y, h - y))) + 2 : 0;
      return `circle(${radius}px at ${x}px ${y}px)`;
    };

    const ctx = gsap.context(() => {
      // Starting state. Chapter 0 is fully visible when the pin begins (no empty first
      // frame); its wipes start from an explicit inset so GSAP can interpolate them.
      gsap.set([indexes[0], metas[0]], { clipPath: 'inset(0% 0% 0% 0%)' });
      const mood0 = moodFor(0);
      layers.forEach((layer, k) => gsap.set(layer, { xPercent: mood0[k].x, yPercent: mood0[k].y }));
      blobs.forEach((blob, k) => gsap.set(blob, { scale: mood0[k].s, opacity: mood0[k].o }));

      const tl = gsap.timeline({ defaults: { ease: 'none' } });
      tl.addLabel('ch0', 0);

      for (let i = 1; i < COUNT; i++) {
        const prev = i - 1;
        const t = prev * STEP + HOLD; // this transition starts after chapter `prev` has been read

        // 1. Outgoing copy leaves first, upward. The title slides up out of its
        //    overflow mask; the index and body/link are wiped bottom-to-top with an
        //    inset clip-path. Accelerating eases so it clears the stage quickly.
        tl.to(titles[prev], { yPercent: -110, duration: 0.45, ease: 'power3.in' }, t)
          .to([indexes[prev], metas[prev]], { clipPath: 'inset(0% 0% 100% 0%)', duration: 0.4, ease: 'power2.in', stagger: 0.05 }, t)
          .to(numerals[prev], { yPercent: -100, duration: 0.5, ease: 'power2.in' }, t);

        // 2. Background: the next video is revealed by a circle that grows out of its
        //    dot on the progress track, so the indicator visibly "opens" the chapter.
        //    The incoming video settles from 1.35x to 1x while the outgoing one keeps
        //    pushing in: a zoom-through morph instead of a flat crossfade. Function
        //    values let invalidateOnRefresh re-measure the dot after a resize. These
        //    fromTo tweens render their "from" state immediately, which is what hides
        //    chapters 1..n at build time.
        tl.fromTo(
          frames[i],
          { clipPath: () => circle(i, false) },
          { clipPath: () => circle(i, true), duration: T, ease: gsapEase.inOut },
          t,
        )
          .fromTo(videos[i], { scale: 1.35 }, { scale: 1, duration: T, ease: 'power2.out' }, t)
          .to(videos[prev], { scale: 1.12, duration: T, ease: 'power1.in' }, t);

        // 3. Colour mood: the three colour fields drift to this chapter's arrangement
        //    over the whole transition. immediateRender: false, because each field is
        //    tweened once per transition and a later "from" must not overwrite the
        //    starting mood at build time.
        const from = moodFor(prev);
        const to = moodFor(i);
        layers.forEach((layer, k) => {
          tl.fromTo(
            layer,
            { xPercent: from[k].x, yPercent: from[k].y },
            { xPercent: to[k].x, yPercent: to[k].y, duration: T, ease: 'sine.inOut', immediateRender: false },
            t,
          );
        });
        blobs.forEach((blob, k) => {
          tl.fromTo(
            blob,
            { scale: from[k].s, opacity: from[k].o },
            { scale: to[k].s, opacity: to[k].o, duration: T, ease: 'sine.inOut', immediateRender: false },
            t,
          );
        });

        // 4. Incoming copy, once the old copy is mostly gone: the title rises into its
        //    mask, then index and body/link are wiped in bottom-to-top (same direction
        //    the old copy left in, so the motion reads as one continuous upward pass).
        //    Decelerating eases so it lands softly and is still by the label.
        tl.fromTo(titles[i], { yPercent: 110 }, { yPercent: 0, duration: 0.55, ease: 'power3.out' }, t + 0.4)
          .fromTo(
            [indexes[i], metas[i]],
            { clipPath: 'inset(100% 0% 0% 0%)' },
            { clipPath: 'inset(0% 0% 0% 0%)', duration: 0.5, ease: 'power3.out', stagger: 0.06 },
            t + 0.42,
          )
          .fromTo(numerals[i], { yPercent: 100 }, { yPercent: 0, duration: 0.6, ease: 'power3.out' }, t + 0.4);

        tl.addLabel(`ch${i}`, i * STEP);
      }

      // 5. Progress fill: linear across the whole story up to the last label, so it
      //    touches each dot exactly at that chapter's label.
      tl.fromTo('[data-story="fill-y"]', { scaleY: 0 }, { scaleY: 1, duration: LAST, ease: 'none' }, 0)
        .fromTo('[data-story="fill-x"]', { scaleX: 0 }, { scaleX: 1, duration: LAST, ease: 'none' }, 0);

      // 6. Tail: nothing changes, the last chapter just stays pinned for a beat.
      tl.to({}, { duration: TAIL }, LAST);

      triggerRef.current = ScrollTrigger.create({
        trigger: stage,
        animation: tl,
        pin: true,
        scrub: 0.8,
        start: 'top top',
        end: () => '+=' + COUNT * window.innerHeight,
        anticipatePin: 1,
        invalidateOnRefresh: true,
        onUpdate: (self) => syncActive(self.progress),
        onRefresh: (self) => syncActive(self.progress),
      });
    }, stage);

    // Play / pause with visibility (with a half-screen margin so the video is ready
    // before it is seen). The stage stays intersecting while it is pinned.
    const observer = new IntersectionObserver(
      ([entry]) => {
        visible = entry.isIntersecting;
        syncVideos();
      },
      { rootMargin: '50% 0px' },
    );
    observer.observe(stage);

    // The pin spacer changes the height of the page: re-measure every trigger once
    // this one exists, and again when the webfonts have loaded (they change line
    // heights above this section, and so where the pin starts).
    let alive = true;
    const raf = requestAnimationFrame(() => ScrollTrigger.refresh());
    document.fonts?.ready.then(() => {
      if (alive) ScrollTrigger.refresh();
    });

    return () => {
      alive = false;
      cancelAnimationFrame(raf);
      observer.disconnect();
      videos.forEach((video) => video.pause());
      triggerRef.current = null;
      // Kills the ScrollTrigger, removes the pin spacer and clears every inline style
      // GSAP wrote, so re-entering the page (or switching to the stacked layout) starts clean.
      ctx.revert();
    };
  }, []);

  /** Scroll so chapter i sits at its label (fully revealed). */
  const goTo = (i: number) => {
    const st = triggerRef.current;
    if (!st) return;
    const y = st.start + (st.end - st.start) * ((i * STEP) / TOTAL);
    const lenis = useUI.getState().lenis;
    if (lenis) lenis.scrollTo(y, { duration: 1.4 });
    else window.scrollTo({ top: y, behavior: 'smooth' });
  };

  // Keyboard users tabbing onto a hidden chapter's link: scroll that chapter into place.
  const onLinkFocus = (i: number) => (e: FocusEvent<HTMLAnchorElement>) => {
    if (e.currentTarget.matches(':focus-visible')) goTo(i);
  };

  return (
    // Plain wrapper: ScrollTrigger inserts its pin spacer inside it, so React only ever
    // adds or removes this element and never trips over the spacer.
    <div>
      <div ref={stageRef} className="relative isolate h-[100svh] overflow-hidden bg-ink">
        {/* ---------- Background: videos, colour mood, scrim ---------- */}
        <div aria-hidden className="absolute inset-0 -z-10">
          {chapters.map((chapter) => (
            // Later chapters stack on top; each is clipped to a circle until its transition.
            <div key={chapter.index} data-story="frame" className="absolute inset-0 overflow-hidden">
              <video
                data-story="video"
                src={chapter.video}
                poster={chapter.poster}
                muted
                playsInline
                loop
                preload="none"
                disablePictureInPicture
                disableRemotePlayback
                className="h-full w-full object-cover"
              />
            </div>
          ))}

          {blobColors.map((color) => (
            // The layer is moved in % of the stage; the blob inside is centred on the
            // layer's top-left corner and only scales and fades.
            <div key={color} data-story="blob-layer" className="absolute inset-0">
              <div
                data-story="blob"
                className="absolute left-0 top-0 -ml-[35vmax] -mt-[35vmax] h-[70vmax] w-[70vmax] rounded-full"
                style={{ backgroundImage: `radial-gradient(closest-side, ${color}, transparent)` }}
              />
            </div>
          ))}

          {/* Scrim: darkest behind the copy (bottom-left), lighter towards the video's right side. */}
          <div className="absolute inset-0 bg-gradient-to-r from-ink/90 via-ink/55 to-ink/20" />
          <div className="absolute inset-0 bg-gradient-to-t from-ink/85 via-transparent to-ink/60" />
        </div>

        {/* Big outlined chapter number, decorative (desktop only). */}
        <div
          aria-hidden
          className="pointer-events-none absolute bottom-[6vh] right-[12vw] hidden overflow-hidden font-display leading-[0.8] lg:grid"
        >
          {chapters.map((chapter) => (
            <span
              key={chapter.index}
              data-story="numeral"
              className="tabular text-outline text-[clamp(12rem,22vw,24rem)] [grid-area:1/1]"
            >
              {chapter.index}
            </span>
          ))}
        </div>

        {/* ---------- Copy ---------- */}
        <div className="relative mx-auto flex h-full max-w-site flex-col px-gutter pb-32 pt-24 md:pt-28 lg:pb-[12vh]">
          <h2 id="story-title" className="flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60">
            <span className="h-1.5 w-1.5 rounded-full bg-spark-royal" />
            How we work
          </h2>

          {/* All chapters stay in the DOM and in reading order; only the visuals are wiped. */}
          <ol className="mt-auto grid lg:max-w-[62%]">
            {chapters.map((chapter, i) => (
              <li key={chapter.index} className="pointer-events-none self-end [grid-area:1/1]">
                <p data-story="index" className="mb-5 flex items-center gap-3 font-mono text-eyebrow uppercase md:mb-7">
                  <ChapterIndex index={chapter.index} total={COUNT} />
                </p>
                <h3 className="font-display text-display-md text-bone xl:text-display-lg">
                  {/* Mask: padding (cancelled by the negative margin) keeps descenders and italics unclipped. */}
                  <span className="-mb-[0.14em] block overflow-hidden pb-[0.14em]">
                    <span data-story="title" className="block">
                      <ChapterTitle title={chapter.title} />
                    </span>
                  </span>
                </h3>
                <div data-story="meta" className="mt-6 md:mt-8">
                  <p className="max-w-[40ch] text-base leading-relaxed text-bone-muted md:text-lg">{chapter.body}</p>
                  <ExploreLink href={chapter.href} title={chapter.title} label={chapter.cta} onFocus={onLinkFocus(i)} />
                </div>
              </li>
            ))}
          </ol>
        </div>

        {/* ---------- Progress: vertical on large screens ---------- */}
        <nav aria-label="Story chapters" className="absolute right-gutter top-1/2 hidden h-[44vh] w-px -translate-y-1/2 lg:block">
          <div className="absolute inset-0 bg-bone/15" />
          <div
            data-story="fill-y"
            className="absolute inset-0 origin-top bg-gradient-to-b from-spark-blue via-spark-royal to-spark-silver"
          />
          <ol>
            {chapters.map((chapter, i) => (
              <li
                key={chapter.index}
                className="absolute left-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ top: `${dotPosition(i)}%` }}
              >
                <ProgressButton
                  index={chapter.index}
                  title={chapter.title}
                  dot={i}
                  active={active === i}
                  onClick={() => goTo(i)}
                  labelClassName="right-full mr-4"
                />
              </li>
            ))}
          </ol>
        </nav>

        {/* ---------- Progress: horizontal below lg ---------- */}
        <nav aria-label="Story chapters" className="absolute inset-x-gutter bottom-10 h-px lg:hidden">
          <div className="absolute inset-0 bg-bone/15" />
          <div
            data-story="fill-x"
            className="absolute inset-0 origin-left bg-gradient-to-r from-spark-blue via-spark-royal to-spark-silver"
          />
          <ol>
            {chapters.map((chapter, i) => (
              <li
                key={chapter.index}
                className="absolute top-1/2 -translate-x-1/2 -translate-y-1/2"
                style={{ left: `${dotPosition(i)}%` }}
              >
                <ProgressButton
                  index={chapter.index}
                  title={chapter.title}
                  dot={i}
                  active={active === i}
                  onClick={() => goTo(i)}
                  labelClassName="bottom-full mb-2"
                />
              </li>
            ))}
          </ol>
        </nav>
      </div>
    </div>
  );
}

/** One chapter marker on the progress track: a dot, with its number beside it. */
function ProgressButton({
  index,
  title,
  dot,
  active,
  onClick,
  labelClassName,
}: {
  index: string;
  title: string;
  dot: number;
  active: boolean;
  onClick: () => void;
  labelClassName: string;
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      aria-current={active ? 'step' : undefined}
      className="group relative flex h-8 w-8 items-center justify-center rounded-full focus-visible:rounded-full"
    >
      <span
        className={cn(
          'tabular absolute whitespace-nowrap font-mono text-eyebrow transition-colors duration-500',
          labelClassName,
          active ? 'text-bone' : 'text-bone/60 group-hover:text-bone/90',
        )}
      >
        {index}
        <span className="sr-only">: {title}</span>
      </span>
      <span
        data-story-dot={dot}
        className={cn(
          'h-2 w-2 rounded-full border transition-[background-color,border-color,transform] duration-500 ease-expo-out',
          active ? 'scale-150 border-spark-blue bg-spark-blue' : 'border-bone/40 bg-ink',
        )}
      />
    </button>
  );
}
