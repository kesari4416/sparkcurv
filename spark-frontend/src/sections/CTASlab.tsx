'use client';

import { useEffect, useId, useRef, useState } from 'react';
import { motion, useInView, useReducedMotion } from 'framer-motion';
// api.js is a plain JS module (allowJs); its exports are untyped.
import { api, errorMessage } from '@/lib/api';
import { ctaSlab, site } from '@/lib/content';
import { ease, palette } from '@/lib/tokens';
import { prefersReducedMotion } from '@/lib/device';
import { cn } from '@/lib/cn';
import { RevealText } from '@/components/RevealText';
import { Magnetic } from '@/components/Magnetic';
import { createParticleBurst } from './cta/particleBurst';

type Status = 'idle' | 'sending' | 'success' | 'error';

export function CTASlab() {
  const sectionRef = useRef<HTMLElement>(null);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const buttonRef = useRef<HTMLButtonElement>(null);
  const burstRef = useRef<ReturnType<typeof createParticleBurst> | null>(null);
  // Fires as soon as the top of the slab is ~10% into the viewport. The slab is taller
  // than most screens, so waiting for a share of it to be visible started the reveal late.
  const inView = useInView(sectionRef, { once: true, margin: '0px 0px -10% 0px' });
  // Only used for transition timing: `initial` must match the server render (where this is null).
  const reduce = useReducedMotion();
  const [email, setEmail] = useState('');
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const ids = { email: useId(), status: useId(), honeypot: useId() };

  useEffect(() => {
    if (!canvasRef.current) return;
    const burst = createParticleBurst(canvasRef.current);
    burstRef.current = burst;
    return () => {
      burst.destroy();
      burstRef.current = null;
    };
  }, []);

  const celebrate = () => {
    const canvas = canvasRef.current;
    const button = buttonRef.current;
    if (!canvas || !button || prefersReducedMotion()) return;
    // Both rects are viewport-relative, so their difference is the button centre in canvas space.
    const c = canvas.getBoundingClientRect();
    const b = button.getBoundingClientRect();
    burstRef.current?.fire(b.left + b.width / 2 - c.left, b.top + b.height / 2 - c.top);
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    const companyWebsite = String(new FormData(e.currentTarget).get('company_website') ?? '');
    setStatus('sending');
    setMessage('Sending…');
    try {
      await api.post('/quick-enquiry', { email: email.trim(), company_website: companyWebsite });
      setStatus('success');
      setMessage(ctaSlab.success);
      setEmail('');
      celebrate();
    } catch (err) {
      setStatus('error');
      setMessage(errorMessage(err));
    }
  };

  const sending = status === 'sending';

  return (
    <section
      ref={sectionRef}
      id="contact"
      aria-labelledby="cta-title"
      className="relative overflow-hidden"
    >
      {/* Clip-path reveal: a circle grows out of the bottom edge until it covers the slab. */}
      <motion.div
        initial={{ clipPath: 'circle(0% at 50% 100%)' }}
        animate={inView ? { clipPath: 'circle(150% at 50% 100%)' } : undefined}
        transition={{ duration: reduce ? 0 : 0.9, ease: ease.out }}
        className="relative isolate bg-ink-800 py-28 md:py-44"
      >
        {/* Large soft glow: layered radials in the three brand hues. */}
        <div
          aria-hidden
          className="pointer-events-none absolute inset-0 -z-10"
          style={{
            background: [
              `radial-gradient(55% 60% at 50% 105%, ${palette.spark.royal}55, transparent 70%)`,
              `radial-gradient(40% 50% at 15% 80%, ${palette.spark.blue}33, transparent 70%)`,
              `radial-gradient(45% 55% at 88% 70%, ${palette.spark.silver}40, transparent 70%)`,
            ].join(', '),
          }}
        />

        <div className="mx-auto max-w-site px-gutter">
          <p className="mb-8 flex items-center gap-3 font-mono text-eyebrow uppercase text-bone/60 md:mb-10">
            <span className="h-1.5 w-1.5 animate-pulse-dot rounded-full bg-spark-blue" />
            {ctaSlab.eyebrow}
          </p>

          <h2 id="cta-title" className="font-display text-display-xl text-bone">
            {ctaSlab.headline.map((line, i) => (
              <span key={line} className={cn('block', i === 1 && 'pl-[0.4em] md:pl-[1.1em]')}>
                <RevealText
                  text={line}
                  play={inView}
                  // Wait for the circle to open far enough to see the words rise.
                  delay={0.15 + i * 0.12}
                  wordClassName={i === 1 ? 'text-gradient animate-gradient-pan pr-[0.06em] font-light' : undefined}
                />
              </span>
            ))}
          </h2>

          <div className="mt-14 grid gap-10 md:mt-20 md:grid-cols-12 md:items-start">
            <p className="max-w-[38ch] text-base leading-relaxed text-bone-muted md:col-span-5 md:text-lg">
              {ctaSlab.body}
            </p>

            <div className="md:col-span-7 md:col-start-6 lg:col-span-6 lg:col-start-7">
              <form onSubmit={onSubmit} aria-describedby={ids.status} className="relative">
                {/*
                  Animated gradient border: a conic gradient spins behind the form and the 1px
                  padding lets only its edge show; overflow-hidden + the radius crop it to a pill.
                  The square only needs a side >= the form's diagonal to cover it at every angle
                  (115% of the width does it for a wide, short pill). The centring transform lives
                  on the outer span so the CSS spin (compositor-run, frozen by the global
                  reduced-motion rule) can own the inner span's transform.
                */}
                <div className="relative overflow-hidden rounded-[1.75rem] p-px ring-spark-blue ring-offset-2 ring-offset-ink transition-shadow focus-within:ring-2 sm:rounded-full">
                  <span aria-hidden className="absolute inset-0 bg-hairline" />
                  <span aria-hidden className="absolute left-1/2 top-1/2 aspect-square w-[115%] -translate-x-1/2 -translate-y-1/2">
                    <span
                      className="block h-full w-full animate-[spin_6s_linear_infinite]"
                      style={{
                        background: `conic-gradient(from 0deg, transparent 0deg, ${palette.spark.blue} 50deg, ${palette.spark.royal} 110deg, ${palette.spark.silver} 170deg, transparent 230deg, transparent 360deg)`,
                      }}
                    />
                  </span>

                  <div className="relative flex flex-col gap-2 rounded-[calc(1.75rem-1px)] bg-ink/95 p-2 sm:flex-row sm:items-center sm:rounded-full sm:pl-7">
                    <label htmlFor={ids.email} className="sr-only">
                      Your email address
                    </label>
                    <input
                      id={ids.email}
                      type="email"
                      name="email"
                      required
                      autoComplete="email"
                      inputMode="email"
                      spellCheck={false}
                      placeholder="you@company.com"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value);
                        if (status === 'error') setStatus('idle');
                      }}
                      aria-invalid={status === 'error' || undefined}
                      aria-describedby={ids.status}
                      className="min-w-0 flex-1 bg-transparent px-5 py-3 text-base text-bone placeholder:text-bone-faint focus-visible:outline-none sm:px-0 md:text-lg"
                    />

                    <Magnetic strength={0.25} className="shrink-0">
                      <button
                        ref={buttonRef}
                        type="submit"
                        disabled={sending}
                        aria-busy={sending}
                        className="group relative grid w-full place-items-center overflow-hidden rounded-full bg-bone px-7 py-3.5 text-sm font-medium text-ink transition-[transform] duration-500 ease-expo-out active:scale-[0.97] disabled:cursor-wait sm:w-auto md:text-base"
                      >
                        {/* Gradient wash slides in on hover (transform only). */}
                        <span
                          aria-hidden
                          className="absolute inset-0 translate-y-full bg-spark transition-transform duration-500 ease-expo-out group-hover:translate-y-0"
                        />
                        {/* Label and spinner share one grid cell, so the button never changes size. */}
                        <span
                          className={cn(
                            'relative col-start-1 row-start-1 inline-flex items-center gap-2 transition-opacity duration-300',
                            sending && 'opacity-0',
                          )}
                        >
                          {ctaSlab.button}
                          <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:-rotate-45">
                            →
                          </span>
                        </span>
                        <span
                          aria-hidden
                          className={cn(
                            'relative col-start-1 row-start-1 h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink transition-opacity duration-300',
                            !sending && 'opacity-0',
                          )}
                        />
                      </button>
                    </Magnetic>
                  </div>
                </div>

                {/* Honeypot: off-screen, unfocusable, hidden from assistive tech. Humans leave it empty. */}
                <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
                  <label htmlFor={ids.honeypot}>Company website</label>
                  <input id={ids.honeypot} type="text" name="company_website" tabIndex={-1} autoComplete="off" defaultValue="" />
                </div>

                {/* Status line: space is always reserved so nothing shifts when a message appears. */}
                <p
                  id={ids.status}
                  role="status"
                  aria-live="polite"
                  className={cn(
                    'mt-4 min-h-[1.5rem] px-2 text-sm transition-colors sm:px-7',
                    status === 'error' ? 'text-signal-error' : status === 'success' ? 'text-bone' : 'text-bone-muted',
                  )}
                >
                  {status === 'success' && <span aria-hidden className="mr-2 inline-block h-1.5 w-1.5 translate-y-[-2px] rounded-full bg-spark-blue" />}
                  {status === 'idle' ? '' : message}
                </p>
              </form>

              <p className="mt-6 px-2 font-mono text-xs uppercase tracking-[0.16em] text-bone-muted sm:px-7">
                Or write to{' '}
                <a href={`mailto:${site.email}`} className="text-bone underline decoration-bone/30 underline-offset-4 transition-colors hover:decoration-spark-blue">
                  {site.email}
                </a>
              </p>
            </div>
          </div>
        </div>
      </motion.div>

      {/* Particle overlay for the success burst. Outside the clipped layer so nothing crops it. */}
      <canvas ref={canvasRef} aria-hidden className="pointer-events-none absolute inset-0 h-full w-full" />
    </section>
  );
}
