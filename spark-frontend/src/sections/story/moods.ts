import { palette } from '@/lib/tokens';

/**
 * Colour "moods" for the pinned story: one per chapter.
 *
 * The background tint is three soft colour fields (electric blue, royal blue, chrome silver). Each
 * chapter moves them to a new arrangement, so the gradient visibly shifts in hue and
 * position as the story advances. Moving whole layers with transforms and opacity
 * (instead of tweening gradient stops) keeps the morph off the paint path.
 */

/** Order matters: index k in every mood describes this colour. */
export const blobColors = [palette.spark.blue, palette.spark.royal, palette.spark.silver] as const;

/** x / y: centre of the colour field, in % of the stage. s: scale. o: opacity. */
export type Blob = { x: number; y: number; s: number; o: number };
export type Mood = readonly [Blob, Blob, Blob];

const moods: readonly Mood[] = [
  // 01 AI & ML: a warm ember low on the left, a cool rim top-right.
  [
    { x: 15, y: 85, s: 1.1, o: 0.55 },
    { x: 85, y: 15, s: 0.7, o: 0.25 },
    { x: 95, y: 95, s: 0.6, o: 0.15 },
  ],
  // 02 Managed cloud: chrome floods in from the right, everything cools down.
  [
    { x: 5, y: 105, s: 0.6, o: 0.15 },
    { x: 30, y: 5, s: 0.7, o: 0.25 },
    { x: 75, y: 55, s: 1.2, o: 0.55 },
  ],
  // 03 Application development: royal blue takes the centre, electric blue catches the top edge.
  [
    { x: 90, y: 15, s: 0.8, o: 0.3 },
    { x: 45, y: 70, s: 1.15, o: 0.5 },
    { x: 10, y: 20, s: 0.7, o: 0.25 },
  ],
  // 04 Digital growth: a glow from the bottom under a chrome sky.
  [
    { x: 60, y: 100, s: 1.25, o: 0.5 },
    { x: 20, y: 55, s: 0.8, o: 0.3 },
    { x: 85, y: 5, s: 0.9, o: 0.4 },
  ],
];

/** Mood for chapter i (wraps around if content.ts ever gains more chapters than moods). */
export const moodFor = (i: number): Mood => moods[i % moods.length];

/**
 * The same mood as a static CSS background (used by the stacked, non-pinned layout,
 * where nothing animates). One radial gradient per colour field.
 */
export const moodBackground = (i: number) =>
  moodFor(i)
    .map(
      (b, k) =>
        `radial-gradient(${b.s * 55}% ${b.s * 55}% at ${b.x}% ${b.y}%, color-mix(in srgb, ${blobColors[k]} ${Math.round(
          b.o * 100,
        )}%, transparent), transparent)`,
    )
    .join(', ');
