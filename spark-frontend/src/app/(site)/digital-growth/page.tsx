import { families } from '@/lib/services';
import { ServiceView, serviceMetadata } from '@/sections/service/ServiceView';

const family = families.digitalGrowth;

export const metadata = serviceMetadata(family.overview);

export default function Page() {
  return <ServiceView family={family} page={family.overview} />;
}
