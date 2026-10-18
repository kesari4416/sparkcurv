import type { Metadata } from 'next';
import { SiteFrame } from '@/components/SiteFrame';
import { StatusScreen } from '@/sections/page/StatusScreen';

export const metadata: Metadata = {
  title: 'Page Not Found',
  description: 'The page you are looking for does not exist or has moved.',
  robots: { index: false, follow: false },
};

export default function NotFoundPage() {
  return (
    <SiteFrame>
      <StatusScreen
        code="Error 404"
        lead="Page"
        accent="not found."
        body="The page you are looking for does not exist or may have moved."
        primary={{ label: 'Back to home', href: '/' }}
        secondary={{ label: 'Contact us', href: '/contact' }}
      />
    </SiteFrame>
  );
}
