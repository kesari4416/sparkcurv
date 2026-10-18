import type { Metadata } from 'next';
import { pricing } from '@/lib/pages';
import { site } from '@/lib/content';
import { CTAButton } from '@/components/CTAButton';
import { PageHero } from '@/sections/page/PageHero';
import { Plans } from '@/sections/pricing/Plans';
import { Includes } from '@/sections/pricing/Includes';
import { FAQ } from '@/sections/FAQ';
import { CTASlab } from '@/sections/CTASlab';

const title = 'Managed Cloud Pricing | DevOps & Cloud Infrastructure Plans | SparkCurv';
const description =
  'Predictable pricing for SparkCurv Managed Cloud Services. Includes 24/7 monitoring, DevOps engineering, CI/CD automation, Kubernetes, and infrastructure management. Plans start from $349/month.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords:
    'managed cloud pricing, cloud services pricing, DevOps pricing, cloud infrastructure cost, AWS managed services pricing, Azure managed services pricing, Kubernetes management cost, CI/CD automation pricing',
  alternates: { canonical: '/pricing' },
  openGraph: { title, description, url: '/pricing', siteName: site.legalName, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function PricingPage() {
  return (
    <>
      <PageHero
        eyebrow={pricing.eyebrow}
        lead={pricing.lead}
        accent={pricing.accent}
        description={<p>{pricing.intro}</p>}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Managed Cloud', href: '/managed-cloud-service' }, { label: 'Pricing' }]}
        actions={
          <>
            <CTAButton />
            <p className="font-mono text-eyebrow uppercase text-bone/50">From $349 / month · month-to-month</p>
          </>
        }
      />
      <Plans plans={pricing.plans} />
      <Includes items={pricing.includes} />
      <FAQ items={pricing.faqs} />
      <CTASlab />
    </>
  );
}
