'use client';

import { useAuth } from '@/lib/providers/auth-provider';
import { useRouter } from 'next/navigation';
import { useEffect } from 'react';

interface ProtectedRouteProps {
  children: React.ReactNode;
  /**
   * Route to redirect to if user is not authenticated
   * @default '/login'
   */
  redirectTo?: string;
  /**
   * Loading component to show while checking auth status
   */
  loading?: React.ReactNode;
}

export function ProtectedRoute({
  children,
  redirectTo = '/login',
  loading = <div>Loading...</div>,
}: ProtectedRouteProps) {
  const { user, isLoading } = useAuth();
  const router = useRouter();

  useEffect(() => {
    if (!isLoading && !user) {
      router.push(redirectTo);
    }
  }, [user, isLoading, router, redirectTo]);

  if (isLoading) {
    return loading;
  }

  if (!user) {
    return null;
  }

  return <>{children}</>;
}
