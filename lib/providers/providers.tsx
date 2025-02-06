import { PropsWithChildren } from 'react';
import { AuthProvider } from './auth-provider';
import { QueryClientProvider } from './query-client-provider';

export function Providers({ children }: PropsWithChildren) {
  return (
    <QueryClientProvider>
      <AuthProvider>{children}</AuthProvider>
    </QueryClientProvider>
  );
} 