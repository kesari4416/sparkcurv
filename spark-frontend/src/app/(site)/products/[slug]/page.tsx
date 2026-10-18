import Link from 'next/link';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { findProduct, products } from '@/lib/products';
import { site } from '@/lib/content';
import { PageHero } from '@/sections/page/PageHero';
import { ProductLogo } from '@/sections/products/ProductLogo';
import { PhonePreview, ProductPreview } from '@/sections/products/ProductPreview';
import { ProductCTA, ProductExtras, ProductModules, ProductPlatforms } from '@/sections/products/ProductSections';
import { JobWalkthrough, RoleDays } from '@/sections/products/ProductExplorer';
import { DataInOut, FitCheck, GettingStarted, ProblemsSolved } from '@/sections/products/ProductGuide';
import { LeakageCalculator } from '@/sections/products/LeakageCalculator';
import { FAQ } from '@/sections/FAQ';

type Props = { params: Promise<{ slug: string }> };

export function generateStaticParams() {
  return products.map((p) => ({ slug: p.slug }));
}

export const dynamicParams = false;

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const product = findProduct((await params).slug);
  if (!product) return {};
  const path = `/products/${product.slug}`;
  return {
    title: { absolute: product.seo.title },
    description: product.seo.description,
    alternates: { canonical: path },
    openGraph: { title: product.seo.title, description: product.seo.description, url: path, siteName: site.legalName, type: 'website', images: [product.logo.src] },
    twitter: { card: 'summary_large_image' },
  };
}

export default async function ProductPage({ params }: Props) {
  const product = findProduct((await params).slug);
  if (!product) notFound();

  return (
    <>
      <PageHero
        eyebrow={product.category}
        lead={product.hero.lead}
        accent={product.hero.accent}
        description={<p>{product.hero.description}</p>}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Products', href: '/products' }, { label: product.name }]}
        visual={
          <div className="flex flex-col gap-5">
            <ProductLogo product={product} priority />
            <p className="font-mono text-eyebrow uppercase leading-relaxed text-bone/60">{product.audience}</p>
          </div>
        }
        actions={
          <>
            <Link
              href={`/contact?product=${product.slug}`}
              className="group inline-flex items-center gap-3 rounded-full bg-bone px-7 py-4 text-base font-medium text-ink transition-colors hover:bg-bone/85"
            >
              Book a demo
              <span aria-hidden className="inline-block transition-transform duration-500 ease-expo-out group-hover:translate-x-1">
                →
              </span>
            </Link>
            <a
              href={(product.links.site ?? product.links.signIn).href}
              target="_blank"
              rel="noopener noreferrer"
              className="text-base text-bone-muted underline decoration-bone/30 underline-offset-4 transition-colors hover:text-bone hover:decoration-spark-blue"
            >
              {(product.links.site ?? product.links.signIn).label}
            </a>
          </>
        }
      >
        <div className="relative mt-16 md:mt-24">
          <span aria-hidden className="absolute inset-x-[15%] -bottom-12 top-16 -z-10 rounded-full opacity-30 blur-3xl" style={{ background: product.brand }} />
          <ProductPreview product={product} className={product.slug === 'sitera' ? 'lg:mr-64' : undefined} />
          {product.slug === 'sitera' && <PhonePreview product={product} className="absolute -bottom-8 right-0 hidden lg:block" />}
        </div>
      </PageHero>

      {/* Problem → how it works → who uses it → what's inside → getting started → fit → questions. */}
      <ProblemsSolved product={product} />
      <JobWalkthrough product={product} />
      <RoleDays product={product} />
      {product.calculator && <LeakageCalculator product={product} />}
      <ProductModules product={product} />
      <ProductExtras product={product} />
      <GettingStarted product={product} />
      <DataInOut product={product} />
      <ProductPlatforms product={product} />
      <FitCheck product={product} />
      <FAQ items={product.faqs} />
      <ProductCTA product={product} />
    </>
  );
}
