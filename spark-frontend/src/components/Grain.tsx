/**
 * Film grain over the whole page: an SVG fractal-noise tile at ~4.5% opacity,
 * jittered with a stepped animation so it reads as moving grain rather than a
 * dirty screen. Pure CSS, no JS; the reduced-motion rule in globals.css freezes it,
 * and the light scheme inverts it into dark specks (.grain-layer).
 */
const noise =
  "url(\"data:image/svg+xml;utf8,<svg xmlns='http://www.w3.org/2000/svg' width='220' height='220'><filter id='n'><feTurbulence type='fractalNoise' baseFrequency='0.85' numOctaves='3' stitchTiles='stitch'/><feColorMatrix values='0 0 0 0 1  0 0 0 0 1  0 0 0 0 1  0 0 0 1 0'/></filter><rect width='100%' height='100%' filter='url(%23n)'/></svg>\")";

export function Grain() {
  return (
    <div aria-hidden className="grain-layer pointer-events-none fixed inset-0 z-grain overflow-hidden opacity-[0.045]">
      <div className="absolute -inset-[50%] animate-grain" style={{ backgroundImage: noise }} />
    </div>
  );
}
