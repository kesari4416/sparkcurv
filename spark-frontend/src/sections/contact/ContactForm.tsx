'use client';

import { useId, useState } from 'react';
import { useRouter, useSearchParams } from 'next/navigation';
import { ChevronDown } from 'lucide-react';
// api.js is a plain JS module (allowJs); its exports are untyped.
import { api, errorMessage } from '@/lib/api';
import { cn } from '@/lib/cn';
import { Magnetic } from '@/components/Magnetic';

// Limits mirror the backend validation.
const MAX_WORDS = 200;
const MAX_DESCRIPTION_CHARS = 2000;
// Must stay valid under the HTML `v` regex flag: parens and hyphen are escaped inside the class.
const PHONE_PATTERN = '[0-9+\\s\\(\\)\\-]{7,20}';
const PHONE_TITLE = '7 to 20 characters: digits, spaces, +, -, ( and )';
// First MAX_WORDS words, keeping the visitor's own spacing.
const FIRST_WORDS = new RegExp(`^\\s*(?:\\S+\\s+){${MAX_WORDS - 1}}\\S+`);

export const SERVICE_OPTIONS = [
  'AI & ML Services',
  'Managed Cloud Services',
  'Application Development',
  'Digital Growth & Outsourcing',
  'CI/CD automation',
  'Database Management',
  '24/7 Monitoring Support',
  'Sitera (product demo)',
  'BuildNexa (product demo)',
];

/** ?product=… from a product page's "Book a demo" preselects the service. */
const PRODUCT_SERVICE: Record<string, string> = {
  sitera: 'Sitera (product demo)',
  buildnexa: 'BuildNexa (product demo)',
};

const countWords = (text: string) => text.trim().split(/\s+/).filter(Boolean).length;

const EMPTY = { name: '', email: '', mobile: '', whatsapp: '', services: '', description: '', company_website: '' };
type FormState = typeof EMPTY;
type Status = 'idle' | 'sending' | 'error';

const field =
  'peer w-full border-b border-bone/20 bg-transparent pb-3 pt-7 text-lg text-bone outline-none transition-colors duration-300 placeholder:text-transparent focus:border-spark-blue focus-visible:outline-none';
// Floats above the input once it has focus or a value (placeholder-shown trick).
const label =
  'pointer-events-none absolute left-0 top-7 origin-left font-sans text-lg text-bone-muted transition-all duration-300 ease-expo-out peer-focus:top-0 peer-focus:text-xs peer-focus:uppercase peer-focus:tracking-[0.16em] peer-focus:text-spark-blue peer-[:not(:placeholder-shown)]:top-0 peer-[:not(:placeholder-shown)]:text-xs peer-[:not(:placeholder-shown)]:uppercase peer-[:not(:placeholder-shown)]:tracking-[0.16em]';

/**
 * Full enquiry form: posts to POST /api/contact, then shows the thank-you page.
 * Reads ?product= from the URL, so the page renders it inside <Suspense>.
 */
export function ContactForm() {
  const router = useRouter();
  const id = useId();
  const product = useSearchParams().get('product') ?? '';
  const [form, setForm] = useState<FormState>(() => ({ ...EMPTY, services: PRODUCT_SERVICE[product] ?? '' }));
  const [status, setStatus] = useState<Status>('idle');
  const [message, setMessage] = useState('');
  const [trimmed, setTrimmed] = useState(false);
  const words = countWords(form.description);

  const onChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>) => {
    const { name } = e.target;
    let { value } = e.target;
    if (name === 'description') {
      if (countWords(value) > MAX_WORDS) {
        // Trim to the first 200 words instead of silently rejecting the edit (e.g. a long paste).
        const match = value.match(FIRST_WORDS);
        if (match) value = match[0];
        setTrimmed(true);
      } else if (trimmed) {
        setTrimmed(false);
      }
    }
    if (status === 'error') setStatus('idle');
    setForm((prev) => ({ ...prev, [name]: value }));
  };

  const onSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (status === 'sending') return;
    if (words === 0) {
      setStatus('error');
      setMessage('Please tell us a little about your project.');
      return;
    }
    setStatus('sending');
    setMessage('Sending…');
    try {
      await api.post('/contact', form);
      router.push('/thank-you');
    } catch (err) {
      setStatus('error');
      setMessage(errorMessage(err, 'Failed to send enquiry. Please try again.'));
    }
  };

  const sending = status === 'sending';
  const ids = {
    name: `${id}-name`,
    email: `${id}-email`,
    mobile: `${id}-mobile`,
    whatsapp: `${id}-whatsapp`,
    services: `${id}-services`,
    description: `${id}-description`,
    count: `${id}-count`,
    status: `${id}-status`,
    honeypot: `${id}-hp`,
  };

  return (
    <form onSubmit={onSubmit} aria-describedby={ids.status} className="relative grid gap-x-8 gap-y-10 sm:grid-cols-2">
      <div className="relative">
        <input id={ids.name} name="name" type="text" required maxLength={120} autoComplete="name" placeholder="Name" value={form.name} onChange={onChange} className={field} />
        <label htmlFor={ids.name} className={label}>
          Name
        </label>
      </div>
      <div className="relative">
        <input id={ids.email} name="email" type="email" required maxLength={254} autoComplete="email" inputMode="email" spellCheck={false} placeholder="Email" value={form.email} onChange={onChange} className={field} />
        <label htmlFor={ids.email} className={label}>
          Email
        </label>
      </div>
      <div className="relative">
        <input id={ids.mobile} name="mobile" type="tel" required pattern={PHONE_PATTERN} title={PHONE_TITLE} maxLength={20} autoComplete="tel" placeholder="Mobile" value={form.mobile} onChange={onChange} className={field} />
        <label htmlFor={ids.mobile} className={label}>
          Mobile
        </label>
      </div>
      <div className="relative">
        <input id={ids.whatsapp} name="whatsapp" type="tel" required pattern={PHONE_PATTERN} title={PHONE_TITLE} maxLength={20} autoComplete="tel" placeholder="WhatsApp" value={form.whatsapp} onChange={onChange} className={field} />
        <label htmlFor={ids.whatsapp} className={label}>
          WhatsApp
        </label>
      </div>

      <div className="relative sm:col-span-2">
        <label htmlFor={ids.services} className="block font-sans text-xs uppercase tracking-[0.16em] text-bone-muted">
          Service you&apos;re interested in
        </label>
        <div className="relative">
          <select
            id={ids.services}
            name="services"
            required
            value={form.services}
            onChange={onChange}
            className={cn(field, 'cursor-pointer appearance-none pr-10 pt-3', !form.services && 'text-bone-muted')}
          >
            <option value="" disabled>
              Select a service
            </option>
            {SERVICE_OPTIONS.map((s) => (
              <option key={s} value={s} className="bg-ink-800 text-bone">
                {s}
              </option>
            ))}
          </select>
          <ChevronDown aria-hidden strokeWidth={1.5} className="pointer-events-none absolute right-0 top-1/2 h-5 w-5 -translate-y-1/2 text-bone-muted" />
        </div>
      </div>

      <div className="relative sm:col-span-2">
        <textarea
          id={ids.description}
          name="description"
          required
          rows={5}
          maxLength={MAX_DESCRIPTION_CHARS}
          placeholder="Project"
          aria-describedby={ids.count}
          value={form.description}
          onChange={onChange}
          className={cn(field, 'resize-none leading-relaxed')}
        />
        <label htmlFor={ids.description} className={label}>
          Tell us about your project
        </label>
        <p id={ids.count} aria-live="polite" className="mt-3 flex justify-between gap-4 font-mono text-xs uppercase tracking-[0.14em]">
          <span className={trimmed ? 'text-signal-error' : 'text-bone/40'}>
            {trimmed ? `Trimmed to the first ${MAX_WORDS} words` : words >= MAX_WORDS - 20 ? `${MAX_WORDS - words} words left` : 'Up to 200 words'}
          </span>
          <span className={cn('tabular', words >= MAX_WORDS ? 'text-signal-error' : 'text-bone/40')}>
            {words}/{MAX_WORDS}
          </span>
        </p>
      </div>

      {/* Honeypot: off-screen, unfocusable, hidden from assistive tech. The backend drops
          submissions that fill it. */}
      <div aria-hidden className="absolute -left-[9999px] top-auto h-px w-px overflow-hidden">
        <label htmlFor={ids.honeypot}>Company website</label>
        <input id={ids.honeypot} type="text" name="company_website" tabIndex={-1} autoComplete="off" value={form.company_website} onChange={onChange} />
      </div>

      <div className="flex flex-col gap-4 sm:col-span-2 sm:flex-row sm:items-center sm:justify-between">
        <p
          id={ids.status}
          role="status"
          aria-live="polite"
          className={cn('min-h-[1.5rem] text-sm', status === 'error' ? 'text-signal-error' : 'text-bone-muted')}
        >
          {status === 'idle' ? 'Free consultation. Detailed proposal within 24–48 hours.' : message}
        </p>
        <Magnetic strength={0.25} className="shrink-0">
          <button
            type="submit"
            disabled={sending}
            aria-busy={sending}
            className="group relative grid w-full place-items-center overflow-hidden rounded-full bg-bone px-8 py-4 text-base font-medium text-ink transition-transform duration-500 ease-expo-out active:scale-[0.97] disabled:cursor-wait sm:w-auto"
          >
            <span aria-hidden className="absolute inset-0 translate-y-full bg-spark transition-transform duration-500 ease-expo-out group-hover:translate-y-0" />
            <span className={cn('relative col-start-1 row-start-1 inline-flex items-center gap-2 transition-opacity', sending && 'opacity-0')}>
              Send enquiry
              <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:-rotate-45">
                →
              </span>
            </span>
            <span
              aria-hidden
              className={cn(
                'relative col-start-1 row-start-1 h-4 w-4 animate-spin rounded-full border-2 border-ink/25 border-t-ink transition-opacity',
                !sending && 'opacity-0',
              )}
            />
          </button>
        </Magnetic>
      </div>
    </form>
  );
}
