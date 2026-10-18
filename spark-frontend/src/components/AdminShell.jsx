'use client';

import { usePathname } from 'next/navigation';
import { AuthProvider, useAuth } from '@/context/AuthContext';
import { Navigate } from '@/lib/router';
import ErrorBoundary from './ErrorBoundary';
import { FirstLoadDone } from './FirstLoadDone';
import { ThemeMarker } from './ThemeMarker';

/** Session context for /admin. It lives only here, so public pages never call /api/auth/me. */
export default function AdminShell({ children }) {
  const pathname = usePathname();
  return (
    <div className="theme-legacy min-h-screen">
      <FirstLoadDone />
      <ThemeMarker theme="legacy" />
      <AuthProvider>
        <ErrorBoundary resetKey={pathname}>{children}</ErrorBoundary>
      </AuthProvider>
    </div>
  );
}

/** Shows a spinner while the session is checked, then the page or a redirect to login. */
export function ProtectedAdmin({ children }) {
  const { admin } = useAuth();
  if (admin === undefined) {
    return (
      <div className="flex min-h-screen items-center justify-center">
        <div className="h-8 w-8 animate-spin rounded-full border-4 border-[#02028B]/20 border-t-[#02028B]" />
      </div>
    );
  }
  if (!admin) return <Navigate to="/admin/login" replace />;
  return children;
}
