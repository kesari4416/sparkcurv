/**
 * Design tokens: the single source of truth for brand values.
 *
 * tailwind.config.ts turns these into utility classes, the WebGL shader in
 * sections/hero/shaders.ts reads the same colours, and Framer Motion / GSAP use
 * the same easing curves. Change a value here and every layer follows.
 */

export const palette = {
  ink: {
    DEFAULT: '#0A0A0B', // page background
    800: '#111114',
    700: '#17171C',
    600: '#202028',
  },
  bone: {
    DEFAULT: '#F2EFE8', // primary text, warm off-white
    muted: '#A7A49C', // secondary text (8:1 on ink)
    faint: '#5E5C57', // decorative only, not for body text
  },
  // Sampled from the SparkCurv logo: the electric/royal blue of "CURV" and the chrome
  // silver of "SPARK" and the swirl.
  spark: {
    blue: '#2467FF', // primary accent: dots, focus ring, active states (4.3:1 on ink)
    royal: '#0B3CFA', // the logo's core blue: glows, gradient depth (large type / decoration only)
    silver: '#C9CED6', // chrome highlight: gradient start, metallic accents
  },
  /** Status colours. Kept outside the brand palette on purpose: they carry meaning. */
  signal: {
    ok: '#3DDC97',
    error: '#FF7A7A',
  },
  hairline: 'rgba(255, 255, 255, 0.08)',
} as const;

/** Brand gradient (chrome → electric → royal, like the logo): text, borders, preloader curtain. */
export const sparkGradient = `linear-gradient(100deg, ${palette.spark.silver} 0%, ${palette.spark.blue} 52%, ${palette.spark.royal} 100%)`;

/**
 * Colour schemes for the light/dark toggle. Tailwind's ink/bone/hairline colours read CSS
 * variables, and these are their values: "ink" is always the surface and "bone" the text,
 * so `bg-ink text-bone` (and the inverted `bg-bone text-ink` buttons) flip together.
 * The brand blues stay the same in both. tailwind.config.ts writes these into :root
 * (dark, the default) and html[data-scheme='light'].
 */
const channels = (h: string) => [1, 3, 5].map((i) => parseInt(h.slice(i, i + 2), 16)).join(' ');

export const schemes = {
  dark: {
    ink: channels(palette.ink.DEFAULT),
    'ink-800': channels(palette.ink[800]),
    'ink-700': channels(palette.ink[700]),
    'ink-600': channels(palette.ink[600]),
    bone: channels(palette.bone.DEFAULT),
    'bone-muted': channels(palette.bone.muted),
    'bone-faint': channels(palette.bone.faint),
    hairline: 'rgba(255, 255, 255, 0.08)',
    glass: 'rgba(255, 255, 255, 0.03)',
    'spark-gradient': sparkGradient,
  },
  light: {
    ink: channels('#F4F2ED'), // warm paper
    'ink-800': channels('#ECE9E2'),
    'ink-700': channels('#E3DFD7'),
    'ink-600': channels('#D8D3CA'),
    bone: channels('#0E0E10'), // near-black text
    'bone-muted': channels('#55534E'), // 6.9:1 on paper
    'bone-faint': channels('#9A968E'), // decorative only
    hairline: 'rgba(14, 14, 16, 0.1)',
    glass: 'rgba(255, 255, 255, 0.55)',
    // Chrome is too pale on paper, so the gradient starts from a steel blue instead.
    'spark-gradient': `linear-gradient(100deg, #4B5A75 0%, ${palette.spark.blue} 52%, ${palette.spark.royal} 100%)`,
  },
} as const;

/** Page colour per scheme, for the browser UI (meta theme-color). */
export const schemeThemeColor = { dark: palette.ink.DEFAULT, light: '#F4F2ED' } as const;

/** Cubic-bezier curves shared by CSS, Framer Motion and GSAP. */
export const ease = {
  /** Fast start, long soft landing: the default for reveals. */
  out: [0.16, 1, 0.3, 1],
  /** Symmetric and dramatic: curtains and page-level wipes. */
  inOut: [0.87, 0, 0.13, 1],
} as const;

/** GSAP equivalents of the curves above. */
export const gsapEase = {
  out: 'expo.out',
  inOut: 'expo.inOut',
} as const;

/** Durations in seconds. */
export const duration = {
  fast: 0.35,
  base: 0.7,
  slow: 1.1,
  /** How long the preloader counter takes to reach 100 when assets are ready. */
  preloader: 1.1,
} as const;

export const cubicBezier = (curve: readonly number[]) => `cubic-bezier(${curve.join(', ')})`;
