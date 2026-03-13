'use client';

import { QueryClient, QueryClientProvider } from '@tanstack/react-query';
import { Toaster } from 'react-hot-toast';
import { useState } from 'react';

/**
 * Application Providers
 *
 * Wraps the app with TanStack Query and toast notifications.
 */

export function Providers({ children }: { children: React.ReactNode }) {
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 5 * 60 * 1000, // 5 minutes
            retry: 1,
          },
        },
      })
  );

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster
        position="bottom-right"
        toastOptions={{
          style: {
            borderRadius: "1rem",
            border: "1px solid color-mix(in oklab, var(--border) 82%, white 18%)",
            background: "color-mix(in oklab, var(--card) 94%, white 6%)",
            color: "var(--foreground)",
            boxShadow: "0 24px 60px -40px rgba(24, 20, 17, 0.45)",
            backdropFilter: "blur(18px)",
          },
          success: {
            iconTheme: {
              primary: "var(--primary)",
              secondary: "var(--primary-foreground)",
            },
          },
          error: {
            iconTheme: {
              primary: "var(--destructive)",
              secondary: "var(--primary-foreground)",
            },
          },
        }}
      />
    </QueryClientProvider>
  );
}
