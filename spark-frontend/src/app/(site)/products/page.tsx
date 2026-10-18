import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { CTAButton } from '@/components/CTAButton';
import { PageHero } from '@/sections/page/PageHero';
import { ProductsShowcase } from '@/sections/products/ProductsShowcase';
import { CompareProducts } from '@/sections/products/CompareProducts';
import { CTASlab } from '@/sections/CTASlab';

const title = 'Products | Sitera and BuildNexa | SparkCurv';
const description =
  'SparkCurv builds and runs two construction platforms: Sitera, project management for growing contractors, and BuildNexa, an ERP for large contractors and solar EPC.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  alternates: { canonical: '/products' },
  openGraph: { title, description, url: '/products', siteName: site.legalName, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function ProductsPage() {
  return (
    <>
      <PageHero
        eyebrow="Our products"
        lead="Software we"
        accent="build and run."
        description={
          <p>
            Two construction platforms from our own team: Sitera for growing contractors, and BuildNexa for large contractors,
            EPC companies and multi-company groups.
          </p>
        }
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Products' }]}
        actions={<CTAButton />}
      />
      <ProductsShowcase variant="full" />
      <CompareProducts />
      <CTASlab />
    </>
  );
}
