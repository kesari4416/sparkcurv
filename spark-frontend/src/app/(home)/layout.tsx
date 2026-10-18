import { SiteFrame } from '@/components/SiteFrame';

/** The home page: the shared site shell plus the preloader intro. */
export default function HomeLayout({ children }: { children: React.ReactNode }) {
  return <SiteFrame preloader>{children}</SiteFrame>;
}
