import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { Hero } from '@/sections/Hero';
import { MarqueeBand } from '@/sections/MarqueeBand';
import { Partners } from '@/sections/Partners';
import { FeatureBento } from '@/sections/FeatureBento';
import { PinnedStory } from '@/sections/PinnedStory';
import { Stats } from '@/sections/Stats';
import { Testimonials } from '@/sections/Testimonials';
import { CTASlab } from '@/sections/CTASlab';
import { Industries } from '@/sections/Industries';
import { WhyUs } from '@/sections/WhyUs';
import { FAQ } from '@/sections/FAQ';

// Title, description and keywords as on the live sparkcurv.com home page.
const title = 'SparkCurv Technologies | AI, Cloud, Web & App Development Company';
const description =
  'SparkCurv Technologies delivers AI & ML solutions, cloud services, web development, mobile apps, digital marketing, and IT outsourcing to help businesses scale faster with modern technology.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords:
    'software company, AI development, machine learning services, cloud computing, web development, mobile app development, digital marketing agency, IT outsourcing, SaaS development, India tech company',
  alternates: { canonical: '/' },
  openGraph: {
    title,
    description,
    url: '/',
    siteName: site.legalName,
    type: 'website',
    images: ['/images/logo/sparkcurv1.webp'],
  },
  twitter: { card: 'summary_large_image' },
};

export default function HomePage() {
  return (
    <>
      <Hero />
      <MarqueeBand />
      <Partners />
      <FeatureBento />
      <PinnedStory />
      <Stats />
      <Industries />
      <WhyUs />
      {/* Renders nothing until real client quotes are added in lib/content.ts. */}
      <Testimonials />
      <FAQ />
      <CTASlab />
    </>
  );
}
