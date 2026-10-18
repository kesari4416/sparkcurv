import { palette } from '@/lib/tokens';

const COLORS = [palette.spark.blue, palette.spark.royal, palette.spark.silver, palette.bone.DEFAULT];

/** Gravity in px/s². */
const GRAVITY = 1500;
/** Air drag coefficient: velocity is multiplied by e^(-DRAG·dt) each frame. */
const DRAG = 2.4;

type Particle = {
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  spin: number;
  /** Phase of the "flutter": scaling the y-axis by cos(phase) fakes a 3D tumble. */
  flutter: number;
  flutterSpeed: number;
  w: number;
  h: number;
  round: boolean;
  color: string;
  age: number;
  ttl: number;
};

const rand = (min: number, max: number) => min + Math.random() * (max - min);

/**
 * Confetti-ish burst on a <canvas> overlay.
 * The canvas is only given a backing store while particles are alive: after the last
 * one fades the rAF loop stops, the canvas is cleared and shrunk to 0×0 to free memory.
 * Calling fire() again during a burst just adds particles to the running loop.
 */
export function createParticleBurst(canvas: HTMLCanvasElement) {
  const ctx = canvas.getContext('2d');
  let particles: Particle[] = [];
  let raf = 0;
  let last = 0;
  let dpr = 1;

  const resize = () => {
    // Cap at 2: a 3x backing store costs a lot and looks no different for fast-moving specks.
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    const { width, height } = canvas.getBoundingClientRect();
    canvas.width = Math.round(width * dpr);
    canvas.height = Math.round(height * dpr);
  };

  const stop = () => {
    cancelAnimationFrame(raf);
    raf = 0;
    particles = [];
    ctx?.clearRect(0, 0, canvas.width, canvas.height);
    canvas.width = 0;
    canvas.height = 0;
  };

  const frame = (now: number) => {
    if (!ctx) return;
    // Seconds since the last frame, clamped so a hidden tab doesn't teleport particles.
    const dt = Math.min((now - last) / 1000, 1 / 30);
    last = now;
    const damping = Math.exp(-DRAG * dt);

    ctx.setTransform(1, 0, 0, 1, 0, 0);
    ctx.clearRect(0, 0, canvas.width, canvas.height);

    particles = particles.filter((p) => {
      p.age += dt;
      if (p.age >= p.ttl) return false;

      // Semi-implicit Euler: drag and gravity update velocity first, then position moves.
      p.vx *= damping;
      p.vy = p.vy * damping + GRAVITY * dt;
      p.x += p.vx * dt;
      p.y += p.vy * dt;
      p.rotation += p.spin * dt;
      p.flutter += p.flutterSpeed * dt;

      // Opaque for the first half of life, then an ease-in fade to zero.
      const t = p.age / p.ttl;
      const alpha = t < 0.5 ? 1 : 1 - ((t - 0.5) / 0.5) ** 2;

      // One setTransform per particle (scale by dpr, move, spin) instead of save/restore.
      const cos = Math.cos(p.rotation) * dpr;
      const sin = Math.sin(p.rotation) * dpr;
      ctx.setTransform(cos, sin, -sin, cos, p.x * dpr, p.y * dpr);
      ctx.globalAlpha = alpha;
      ctx.fillStyle = p.color;
      const h = p.h * Math.cos(p.flutter); // flips through zero: the "tumbling paper" look
      if (p.round) {
        ctx.beginPath();
        ctx.ellipse(0, 0, p.w / 2, Math.abs(h) / 2 + 0.01, 0, 0, Math.PI * 2);
        ctx.fill();
      } else {
        ctx.fillRect(-p.w / 2, -h / 2, p.w, h);
      }
      return true;
    });
    ctx.globalAlpha = 1;

    if (particles.length) raf = requestAnimationFrame(frame);
    else stop();
  };

  /** Burst `count` particles from (x, y), in CSS pixels relative to the canvas. */
  const fire = (x: number, y: number, count = 80) => {
    if (!ctx) return;
    if (!raf) resize();
    for (let i = 0; i < count; i++) {
      // Mostly upward fan (±105° around straight up) with a few stragglers sideways.
      const angle = -Math.PI / 2 + rand(-1, 1) * rand(0.35, 1) * (Math.PI * 0.58);
      const speed = rand(420, 1050);
      const round = Math.random() < 0.3;
      const size = rand(5, 10);
      particles.push({
        x: x + rand(-6, 6),
        y: y + rand(-4, 4),
        vx: Math.cos(angle) * speed,
        vy: Math.sin(angle) * speed,
        rotation: rand(0, Math.PI * 2),
        spin: rand(-12, 12),
        flutter: rand(0, Math.PI * 2),
        flutterSpeed: rand(6, 16),
        w: round ? size * 0.8 : size,
        h: round ? size * 0.8 : size * rand(0.4, 0.7),
        round,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        age: 0,
        ttl: rand(1.2, 1.6),
      });
    }
    if (!raf) {
      last = performance.now();
      raf = requestAnimationFrame(frame);
    }
  };

  return { fire, destroy: stop };
}
