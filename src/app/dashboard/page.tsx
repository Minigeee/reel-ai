'use client';

import { ProtectedRoute } from '@/components/auth/protected-route';

export default function DashboardPage() {
  return (
    <ProtectedRoute
      // Optional: custom loading component
      loading={<div>Loading dashboard...</div>}
      // Optional: custom redirect path
      redirectTo='/login'
    >
      <div>
        <h1>Dashboard</h1>
        {/* Your dashboard content */}
      </div>
    </ProtectedRoute>
  );
}
