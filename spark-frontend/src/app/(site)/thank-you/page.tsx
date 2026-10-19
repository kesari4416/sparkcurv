import type { Metadata } from 'next';
import { StatusScreen } from '@/sections/page/StatusScreen';

export const metadata: Metadata = {
  title: 'Thank You',
  description: 'Your enquiry has been sent successfully. Our team will get back to you shortly.',
  alternates: { canonical: '/thank-you' },
  robots: { index: false, follow: false },
};

export default function ThankYouPage() {
  return (
    <StatusScreen
      code="Enquiry sent"
      lead="Thank"
      accent="you."
      body="Your enquiry has been sent successfully. Our team will get back to you shortly."
      primary={{ label: 'Back to home', href: '/' }}
      secondary={{ label: 'Read the blog', href: '/blog' }}
      redirectAfter={10}
      align="center"
    />
  );
}
