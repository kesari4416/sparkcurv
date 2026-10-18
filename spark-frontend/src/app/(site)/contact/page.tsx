import type { Metadata } from 'next';
import { site, socials } from '@/lib/content';
import { PageHero } from '@/sections/page/PageHero';
import { ContactForm } from '@/sections/contact/ContactForm';

const title = 'Contact SparkCurv | Get a Free IT Consultation & Project Quote';
const description =
  'Contact SparkCurv Technologies for web development, mobile app development, cloud services, AI solutions, and digital marketing services. Get a free consultation from our experts today.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords:
    'contact SparkCurv, IT consultation, software development company, hire developers, get project quote, web development company, mobile app development company, AI consulting, cloud services company, Nagercoil, Bangalore',
  alternates: { canonical: '/contact' },
  openGraph: { title, description, url: '/contact', siteName: site.legalName, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

const eyebrow = 'font-mono text-eyebrow uppercase text-bone/50';

export default function ContactPage() {
  return (
    <>
      <PageHero
        eyebrow="Get in touch"
        lead="Let's work"
        accent="together."
        description={<p>Have a project in mind? We&apos;d love to hear from you. Send us your enquiry and we&apos;ll respond as soon as possible.</p>}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Contact' }]}
      />

      <section aria-labelledby="enquiry-title" className="pb-24 md:pb-36">
        <div className="mx-auto grid max-w-site gap-16 px-gutter lg:grid-cols-12 lg:gap-8">
          {/* Details */}
          <aside className="flex flex-col gap-12 lg:col-span-4">
            <div>
              <h2 className={eyebrow}>Write or call</h2>
              <a href={`mailto:${site.email}`} className="mt-5 block font-display text-[clamp(1.6rem,2.6vw,2.25rem)] leading-tight tracking-tight text-bone transition-colors hover:text-bone-muted [overflow-wrap:anywhere]">
                {site.email}
              </a>
              <a href={`tel:${site.phone.replace(/\s+/g, '')}`} className="mt-3 inline-block font-mono text-sm tracking-wide text-bone/80 transition-colors hover:text-bone">
                {site.phone}
              </a>
            </div>

            <div>
              <h2 className={eyebrow}>Main branch · Nagercoil</h2>
              <address className="mt-5 not-italic leading-relaxed text-bone-muted">
                {site.address.map((line) => (
                  <span key={line} className="block">
                    {line}
                  </span>
                ))}
              </address>
              <p className="mt-4 text-bone-muted">{site.salesOffice}</p>
            </div>

            <div>
              <h2 className={eyebrow}>Follow</h2>
              <ul className="mt-5 flex flex-wrap gap-x-5 gap-y-2 font-mono text-eyebrow uppercase text-bone-muted">
                {socials.map((s) => (
                  <li key={s.label}>
                    <a href={s.href} target="_blank" rel="noopener noreferrer" aria-label={`${site.name} on ${s.label}`} className="inline-block py-1 transition-colors hover:text-bone">
                      {s.label} <span aria-hidden>↗</span>
                    </a>
                  </li>
                ))}
              </ul>
            </div>
          </aside>

          {/* Form */}
          <div className="glass rounded-3xl p-6 sm:p-8 md:p-12 lg:col-span-7 lg:col-start-6">
            <h2 id="enquiry-title" className="mb-10 font-display text-[clamp(1.75rem,3vw,2.5rem)] leading-tight tracking-[-0.02em] text-bone">
              Send an enquiry
            </h2>
            <ContactForm />
          </div>
        </div>
      </section>
    </>
  );
}
