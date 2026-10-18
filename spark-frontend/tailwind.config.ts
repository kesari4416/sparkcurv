import type { Config } from 'tailwindcss';
import typography from '@tailwindcss/typography';
import plugin from 'tailwindcss/plugin';
import { cubicBezier, ease, palette, schemes } from './src/lib/tokens';

/** A scheme colour (CSS variable holding "r g b") that still supports /opacity modifiers. */
const scheme = (name: string) => `rgb(var(--${name}) / <alpha-value>)`;

/** { ink: '10 10 11', … } → { '--ink': '10 10 11', … } */
const vars = (values: Record<string, string>) => Object.fromEntries(Object.entries(values).map(([k, v]) => [`--${k}`, v]));

/**
 * Tailwind theme.
 *  - New design: tokens from src/lib/tokens.ts (ink/bone/spark colours, display type,
 *    easing curves, z-index layers). Edit tokens.ts, not the values here.
 *  - Legacy pages: the shadcn colour variables and helpers they were built with.
 * Font families are CSS variables set by next/font in src/app/layout.tsx.
 */
const config = {
  content: ['./src/**/*.{js,jsx,ts,tsx}'],
  theme: {
    extend: {
      colors: {
        // New design. ink (surface) and bone (text) follow the light/dark scheme; see
        // `schemes` in tokens.ts. The brand blues and status colours are fixed.
        ink: { DEFAULT: scheme('ink'), 800: scheme('ink-800'), 700: scheme('ink-700'), 600: scheme('ink-600') },
        bone: { DEFAULT: scheme('bone'), muted: scheme('bone-muted'), faint: scheme('bone-faint') },
        spark: palette.spark,
        signal: palette.signal,
        hairline: 'var(--hairline)',
        // Legacy (shadcn variables defined in globals.css)
        background: 'hsl(var(--background))',
        foreground: 'hsl(var(--foreground))',
        card: { DEFAULT: 'hsl(var(--card))', foreground: 'hsl(var(--card-foreground))' },
        popover: { DEFAULT: 'hsl(var(--popover))', foreground: 'hsl(var(--popover-foreground))' },
        primary: { DEFAULT: 'hsl(var(--primary))', foreground: 'hsl(var(--primary-foreground))' },
        secondary: { DEFAULT: 'hsl(var(--secondary))', foreground: 'hsl(var(--secondary-foreground))' },
        muted: { DEFAULT: 'hsl(var(--muted))', foreground: 'hsl(var(--muted-foreground))' },
        accent: { DEFAULT: 'hsl(var(--accent))', foreground: 'hsl(var(--accent-foreground))' },
        destructive: { DEFAULT: 'hsl(var(--destructive))', foreground: 'hsl(var(--destructive-foreground))' },
        border: 'hsl(var(--border))',
        input: 'hsl(var(--input))',
        ring: 'hsl(var(--ring))',
      },
      fontFamily: {
        display: ['var(--font-display)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        sans: ['var(--font-sans)', 'ui-sans-serif', 'system-ui', 'sans-serif'],
        mono: ['var(--font-mono)', 'ui-monospace', 'SFMono-Regular', 'monospace'],
        // Legacy
        clash: ['var(--font-manrope)', 'sans-serif'],
        inter: ['var(--font-inter)', 'sans-serif'],
      },
      fontSize: {
        // Hero-scale type, capped so it never overflows on ultra-wide screens.
        'display-xl': ['clamp(3.5rem, 11vw, 12.5rem)', { lineHeight: '0.9', letterSpacing: '-0.025em' }],
        'display-lg': ['clamp(2.75rem, 7.5vw, 8.5rem)', { lineHeight: '0.92', letterSpacing: '-0.025em' }],
        'display-md': ['clamp(2.25rem, 5vw, 5rem)', { lineHeight: '0.98', letterSpacing: '-0.02em' }],
        eyebrow: ['0.72rem', { lineHeight: '1', letterSpacing: '0.2em' }],
      },
      spacing: {
        gutter: 'clamp(1.25rem, 4vw, 3.5rem)',
      },
      maxWidth: {
        site: '1680px',
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
      backgroundImage: {
        spark: 'var(--spark-gradient)',
      },
      transitionTimingFunction: {
        'expo-out': cubicBezier(ease.out),
        'expo-in-out': cubicBezier(ease.inOut),
      },
      zIndex: {
        header: '40',
        cta: '45',
        progress: '60',
        grain: '70',
        preloader: '100',
      },
      keyframes: {
        marquee: {
          from: { transform: 'translate3d(0, 0, 0)' },
          to: { transform: 'translate3d(-50%, 0, 0)' },
        },
        // Film-grain jitter: jumps between offsets so the noise never looks static.
        grain: {
          '0%, 100%': { transform: 'translate3d(0, 0, 0)' },
          '20%': { transform: 'translate3d(-4%, 3%, 0)' },
          '40%': { transform: 'translate3d(3%, -5%, 0)' },
          '60%': { transform: 'translate3d(-6%, -2%, 0)' },
          '80%': { transform: 'translate3d(5%, 4%, 0)' },
        },
        'gradient-pan': {
          '0%, 100%': { backgroundPosition: '0% 50%' },
          '50%': { backgroundPosition: '100% 50%' },
        },
        'pulse-dot': {
          '0%, 100%': { opacity: '1', transform: 'scale(1)' },
          '50%': { opacity: '0.35', transform: 'scale(0.8)' },
        },
        // Legacy
        blob: {
          '0%, 100%': { transform: 'translate(0px, 0px) scale(1)' },
          '33%': { transform: 'translate(30px, -50px) scale(1.1)' },
          '66%': { transform: 'translate(-20px, 20px) scale(0.9)' },
        },
      },
      animation: {
        marquee: 'marquee 60s linear infinite',
        grain: 'grain 0.8s steps(5) infinite',
        'gradient-pan': 'gradient-pan 8s ease-in-out infinite',
        'pulse-dot': 'pulse-dot 2s ease-in-out infinite',
        blob: 'blob 7s infinite',
      },
    },
  },
  plugins: [
    typography,
    // Scheme variables: dark by default, light when <html data-scheme="light"> (ThemeToggle).
    plugin(({ addBase }) => {
      addBase({
        ':root': vars(schemes.dark),
        "html[data-scheme='light']": vars(schemes.light),
        // Photo cards stay dark in both schemes: their imagery is dark and their light text
        // sits on an ink scrim. The class re-declares the dark values for that subtree.
        '.scheme-dark': vars(schemes.dark),
      });
    }),
    plugin(({ addUtilities }) => {
      addUtilities({
        '.animation-delay-2000': { 'animation-delay': '2s' },
        '.animation-delay-4000': { 'animation-delay': '4s' },
        '.scrollbar-hide': {
          '-ms-overflow-style': 'none',
          'scrollbar-width': 'none',
          '&::-webkit-scrollbar': { display: 'none' },
        },
      });
    }),
  ],
} satisfies Config;

export default config;
