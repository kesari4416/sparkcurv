import type { Metadata } from 'next';
import { about } from '@/lib/pages';
import { site } from '@/lib/content';
import { CTAButton } from '@/components/CTAButton';
import { PageHero } from '@/sections/page/PageHero';
import { AboutStats, Story, VisionMission } from '@/sections/about/AboutSections';
import { Team } from '@/sections/about/Team';
import { FAQ } from '@/sections/FAQ';
import { CTASlab } from '@/sections/CTASlab';

const title = 'About Us | SparkCurv Technologies';
const description =
  'Learn about SparkCurv Technologies - a passionate IT company in Nagercoil with 15+ professionals delivering AI, cloud, app development, and digital marketing solutions.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: 'about SparkCurv, IT company India, technology partner, Nagercoil, software company',
  alternates: { canonical: '/about' },
  openGraph: { title, description, url: '/about', siteName: site.legalName, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function AboutPage() {
  return (
    <>
      <PageHero
        eyebrow={about.eyebrow}
        lead={about.lead}
        accent={about.accent}
        description={<p>{about.intro}</p>}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'About' }]}
        actions={<CTAButton />}
      >
        <AboutStats />
      </PageHero>
      <Story />
      <VisionMission />
      <Team />
      <FAQ items={about.faqs} />
      <CTASlab />
    </>
  );
}
