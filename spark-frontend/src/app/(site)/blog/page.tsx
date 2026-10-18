import type { Metadata } from 'next';
import { Suspense } from 'react';
import { site } from '@/lib/content';
import { PageHero } from '@/sections/page/PageHero';
import { BlogIndex } from '@/sections/blog/BlogIndex';

const title = 'Technology Blog | AI, Cloud, Software Development & Digital Marketing | SparkCurv';
const description =
  'Read the latest insights from SparkCurv on AI, cloud computing, software development, web and mobile app development, digital marketing, DevOps, and emerging technology trends.';

export const metadata: Metadata = {
  title: { absolute: title },
  description,
  keywords: 'technology blog, AI blog, cloud computing blog, software development blog, SparkCurv blog',
  alternates: { canonical: '/blog' },
  openGraph: { title, description, url: '/blog', siteName: site.legalName, type: 'website' },
  twitter: { card: 'summary_large_image' },
};

export default function BlogPage() {
  return (
    <>
      <PageHero
        eyebrow="Our blog"
        lead="Latest"
        accent="insights."
        description={<p>Discover the latest trends, insights, and best practices in technology and digital transformation.</p>}
        crumbs={[{ label: 'Home', href: '/' }, { label: 'Blog' }]}
      />
      {/* BlogIndex reads ?tag= from the URL, which Next.js requires inside a Suspense boundary. */}
      <Suspense>
        <BlogIndex />
      </Suspense>
    </>
  );
}
