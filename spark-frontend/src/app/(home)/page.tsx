import type { Metadata } from 'next';
import { site } from '@/lib/content';
import { Hero } from '@/sections/Hero';
import { MarqueeBand } from '@/sections/MarqueeBand';
import { FeatureBento } from '@/sections/FeatureBento';
import { PinnedStory } from '@/sections/PinnedStory';
import { Stats } from '@/sections/Stats';
import { Testimonials } from '@/sections/Testimonials';
import { CTASlab } from '@/sections/CTASlab';
import { Industries } from '@/sections/Industries';
import { WhyUs } from '@/sections/WhyUs';
import { FAQ } from '@/sections/FAQ';

export const metadata: Metadata = {
  title: { absolute: 'SparkCurv Technologies | We Engineer Digital Evolution' },
  description: site.description,
  alternates: { canonical: '/' },
  openGraph: {
    title: 'SparkCurv Technologies | We Engineer Digital Evolution',
    description: site.description,
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
