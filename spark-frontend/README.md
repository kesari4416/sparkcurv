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
| `src/app/(home)/` | Home page. Its layout is the shared shell (`components/SiteFrame.tsx`) plus the preloader |
| `src/app/(site)/` | Every other public page: about, pricing, contact, blog, thank-you and the service pages, all on the same shell |
| `src/app/admin/` | Admin panel, still on the original light theme (session context in `components/AdminShell.jsx`, pages in `src/views/Admin*`) |
| `src/sections/` | Home sections (`Preloader`, `Hero` + `hero/`, `MarqueeBand`, `FeatureBento`, `PinnedStory`, `Stats`, `Industries`, `WhyUs`, `Testimonials`, `FAQ`, `CTASlab`, `Footer`) and inner-page sections: `page/` (hero, status screens), `service/` (service page template), `pricing/`, `about/`, `contact/`, `blog/` |
| `src/components/` | Shared UI: `SiteFrame`, `HomeHeader`, `SectionIntro`, `Magnetic`, `RevealText`, `ScrambleText`, `SmoothScroll`, `Grain`, `AccentField`, `CTAButton`, `DeferredChat`, `ThemeMarker`. Admin only: `AdminShell`, `ErrorBoundary`, `MarkdownEditor` (blog posts are written in Markdown; `lib/markdownPost.js` handles .md import, export and the template) |
| `src/hooks/` | `useClock`, `useScramble`, `useRenderMode` (WebGL vs fallback), `useMediaQuery` |
| `src/lib/` | `tokens.ts` (design tokens), `content.ts` (home copy), `services.ts` (every service page), `pages.ts` (about, pricing), `store.ts` (Zustand UI state), `pointer.ts`, `device.ts`, `theme.ts`, `api.js`, `sanitize.js`, `router.jsx` (react-router shim, used by the admin views only) |

**Change page copy:** service pages are generated from `src/lib/services.ts` (add a sub-page there
and its route, metadata and navigation follow); about and pricing copy is in `src/lib/pages.ts`.
Copy comes from the live sparkcurv.com pages. The admin views are still JavaScript.

## Tweaking the theme

All brand values live in **`src/lib/tokens.ts`**:

- `palette`: ink (background), bone (text), spark blue/royal/silver (accents sampled from the logo), signal ok/error (status), hairline borders
- `sparkGradient`: the brand gradient, chrome → electric → royal (text, borders, preloader curtain)
- `ease` / `gsapEase` / `duration`: motion curves and timings

`tailwind.config.ts` turns them into classes (`bg-ink`, `text-bone-muted`, `bg-spark`,
`text-display-xl`, `ease-expo-out`, …), and the WebGL shader reads the same colours, so changing a
token updates CSS, motion and 3D together. Fonts (Clash Display for headlines, Satoshi for body, Geist Mono for labels; files and licence in `src/fonts`) are set in
`src/app/layout.tsx` via `next/font` (self-hosted, subset, preloaded).

The two themes are scoped in `src/app/globals.css`: `.theme-ink` (every public page) and
`.theme-legacy` (the admin panel), so neither leaks into the other.

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
| Magnetic buttons, text scramble | `components/Magnetic.tsx`, `hooks/useScramble.ts` |
| Inner-page hero (headline reveal, picture wipe) | `sections/page/PageHero.tsx` |

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
