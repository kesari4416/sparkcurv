import { ProtectedAdmin } from '@/components/AdminShell';
import AdminDashboard from '@/views/AdminDashboard';

export default function Page() {
  return (
    <ProtectedAdmin>
      <AdminDashboard />
    </ProtectedAdmin>
  );
}
