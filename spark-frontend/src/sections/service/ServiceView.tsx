import type { Metadata } from 'next';
import Link from 'next/link';
import type { ServiceFamily, ServicePage } from '@/lib/services';
import { site } from '@/lib/content';
import { CTAButton } from '@/components/CTAButton';
import { PageHero, type Crumb } from '@/sections/page/PageHero';
import { FAQ } from '@/sections/FAQ';
import { CTASlab } from '@/sections/CTASlab';
import { Industries } from '@/sections/Industries';
import { SubNav } from './SubNav';
import { ServiceCards } from './ServiceCards';
import { OfferList } from './OfferList';
import { ToolGrid } from './ToolGrid';

/** "Cloud services" → lead "Cloud", accent "services." (one-word titles are all accent). */
function splitTitle(title: string) {
  const words = title.split(' ');
  return { lead: words.slice(0, -1).join(' '), accent: `${words[words.length - 1]}.` };
}

/** Page metadata for a service page, from its SEO copy. */
export function serviceMetadata(page: ServicePage): Metadata {
  return {
    title: { absolute: page.seo.title },
    description: page.seo.description,
    keywords: page.seo.keywords,
    alternates: { canonical: page.path },
    openGraph: {
      title: page.seo.title,
      description: page.seo.description,
      url: page.path,
      siteName: site.legalName,
      type: 'website',
      images: [page.image],
    },
    twitter: { card: 'summary_large_image' },
  };
}

/**
 * A service page: hero, the family's sub-navigation, sub-service cards (overviews only),
 * the capabilities, tools, industries (web development), FAQ and the contact slab.
 */
export function ServiceView({ family, page }: { family: ServiceFamily; page: ServicePage }) {
  const isOverview = page.slug === '';
  const hasChildren = family.children.length > 0;
  const position = family.children.findIndex((c) => c.slug === page.slug);

  const crumbs: Crumb[] = [{ label: 'Home', href: '/' }];
  if (isOverview) crumbs.push({ label: family.name });
  else crumbs.push({ label: family.name, href: family.path }, { label: page.name });

  const nav = hasChildren ? [{ name: 'Overview', path: family.path }, ...family.children.map((c) => ({ name: c.name, path: c.path }))] : [];

  return (
    <>
      <PageHero
        eyebrow={page.eyebrow}
        {...splitTitle(page.title)}
        description={<p>{page.description}</p>}
        crumbs={crumbs}
        image={page.image}
        imageLabel={
          position >= 0
            ? `${String(position + 1).padStart(2, '0')} / ${String(family.children.length).padStart(2, '0')} · ${family.name}`
            : family.name
        }
        actions={
          <>
            <CTAButton />
            {family.key === 'managed-cloud-service' && (
            <Link
              href="/pricing"
              className="group relative inline-flex items-center gap-2 pb-1 text-base text-bone-muted transition-colors hover:text-bone"
            >
              See managed cloud pricing
              <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                →
              </span>
            </Link>
            )}
          </>
        }
      />

      {hasChildren && <SubNav label={`${family.name} services`} items={nav} />}

      {isOverview && hasChildren && family.cardsHeading && <ServiceCards heading={family.cardsHeading} items={family.children} />}

      <OfferList features={page.features} />

      {page.tools && <ToolGrid tools={page.tools} />}

      {page.showIndustries && <Industries />}

      <FAQ items={page.faqs} />
      <CTASlab />
    </>
  );
}
