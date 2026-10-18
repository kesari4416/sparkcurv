# spark-frontend

Next.js 16 (App Router) + React 19 + TypeScript + Tailwind CSS 3.
How to install and run everything: see the [root README](../README.md).

```bash
yarn dev          # http://localhost:3000 (needs the backend on :8001)
yarn build        # production build (also type-checks)
yarn start        # serve the production build
yarn typecheck    # tsc --noEmit
yarn lint         # eslint (next/core-web-vitals + typescript)
```

## Structure

| Path | What |
|---|---|
| `src/app/(home)/` | Redesigned home page. `layout.tsx` = dark shell: Lenis, preloader, header (with the sticky CTA), footer, cursor, grain |
| `src/app/(site)/` | Pages still on the original design. Each route renders a component from `src/views/` |
| `src/app/admin/` | Admin panel (session context in `components/AdminShell.jsx`) |
| `src/sections/` | Home sections, top to bottom: `Preloader`, `Hero` (+ `hero/`), `MarqueeBand`, `FeatureBento`, `PinnedStory`, `Stats`, `Testimonials`, `CTASlab`, `Footer` |
| `src/components/` | Shared UI. New: `Cursor`, `Magnetic`, `RevealText`, `ScrambleText`, `SmoothScroll`, `Grain`, `AccentField`, `CTAButton`, `HomeHeader`, `DeferredChat`, `ThemeMarker`. Legacy: `Navigation`, `Footer`, `SEO`, `FAQSection`, `RichTextEditor` |
| `src/hooks/` | `useClock`, `useScramble`, `useRenderMode` (WebGL vs fallback), `useMediaQuery` |
| `src/lib/` | `tokens.ts` (design tokens), `content.ts` (copy), `store.ts` (Zustand UI state), `pointer.ts` (shared mouse position), `device.ts` (capability checks), `api.js`, `sanitize.js`, `router.jsx` (react-router shim for legacy views) |

New code is TypeScript. The legacy pages in `src/views/` are still JavaScript and are converted
when they are redesigned.

## Tweaking the theme

All brand values live in **`src/lib/tokens.ts`**:

- `palette`: ink (background), bone (text), spark blue/royal/silver (accents sampled from the logo), signal ok/error (status), hairline borders
- `sparkGradient`: the brand gradient, chrome → electric → royal (text, borders, preloader curtain)
- `ease` / `gsapEase` / `duration`: motion curves and timings

`tailwind.config.ts` turns them into classes (`bg-ink`, `text-bone-muted`, `bg-spark`,
`text-display-xl`, `ease-expo-out`, …), and the WebGL shader reads the same colours, so changing a
token updates CSS, motion and 3D together. Fonts (Clash Display for headlines, Satoshi for body, Geist Mono for labels; files and licence in `src/fonts`) are set in
`src/app/layout.tsx` via `next/font` (self-hosted, subset, preloaded).

The two themes are scoped in `src/app/globals.css`: `.theme-ink` (new) and `.theme-legacy`
(original pages), so neither leaks into the other.

## Where the motion lives

| Effect | File |
|---|---|
| Smooth scroll (Lenis) driven by GSAP's ticker, synced with ScrollTrigger | `components/SmoothScroll.tsx` |
| Preloader counter, logo mask, curtain wipe | `sections/Preloader.tsx` |
| 3D network hero (plain three.js, THREE.Timer), cursor attraction, parallax | `sections/hero/HeroCanvas.tsx` |
| Network shaders: nodes, links and data pulses | `sections/hero/shaders.ts` |
| WebGL vs CSS fallback (low-power, reduced motion, no WebGL) | `hooks/useRenderMode.ts`, `sections/hero/HeroVisual.tsx` |
| Word-by-word mask reveals | `components/RevealText.tsx` |
| Velocity-reactive marquee | `sections/MarqueeBand.tsx` |
| Pinned, scrubbed chapter story | `sections/PinnedStory.tsx` |
| Count-up stats | `sections/Stats.tsx` |
| Drag + momentum carousel | `sections/testimonials/useDragScroll.ts` |
| Particle burst on form submit | `sections/cta/particleBurst.ts` |
| Custom cursor, magnetic buttons, text scramble | `components/Cursor.tsx`, `components/Magnetic.tsx`, `hooks/useScramble.ts` |

**Reduced motion:** `MotionConfig reducedMotion="user"` covers Framer Motion; GSAP/rAF code checks
`prefersReducedMotion()` from `lib/device.ts`; `globals.css` stops CSS animations and hides the
preloader. **Low-power devices** get the CSS hero instead of WebGL, and the pinned story becomes a
plain stacked list on touch screens.

## Performance notes

- three.js loads in its own chunk (`next/dynamic`, no SSR), only on devices that render it, and
  only after the visitor's first interaction; the canvas stops rendering when the hero is off screen.
- Below-the-fold sections use `content-visibility: auto`; analytics loads when idle and the chat
  widget on first interaction (`components/DeferredChat.tsx`).
- Videos use `preload="none"` and posters, and only the visible one plays.
- Pointer-driven effects read one shared listener (`lib/pointer.ts`) inside rAF loops; mouse
  movement causes no React re-renders.
