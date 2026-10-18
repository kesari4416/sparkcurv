import { SiteFrame } from '@/components/SiteFrame';

/** Every public page except home: the shared site shell, without the preloader. */
export default function SiteLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame>{children}</SiteFrame>;
}
