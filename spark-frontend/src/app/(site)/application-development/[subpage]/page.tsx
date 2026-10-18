import { redirect } from 'next/navigation';
import { families, findChild } from '@/lib/services';
import { ServiceView, serviceMetadata } from '@/sections/service/ServiceView';

const family = families.appDev;

type Props = { params: Promise<{ subpage: string }> };

/** Every sub-page is rendered at build time. */
export function generateStaticParams() {
  return family.children.map((c) => ({ subpage: c.slug }));
}

export async function generateMetadata({ params }: Props) {
  const page = findChild(family, (await params).subpage);
  return page ? serviceMetadata(page) : {};
}

export default async function Page({ params }: Props) {
  const page = findChild(family, (await params).subpage);
  // Unknown sub-page: send the visitor to the section overview (as the old site did).
  if (!page) redirect(family.path);
  return <ServiceView family={family} page={page} />;
}
