import { QueryClient } from '@tanstack/react-query';
import { ApiError } from '@/utils/errors';

export const queryClient = new QueryClient({
  defaultOptions: {
    queries: {
      staleTime: 30_000,
      refetchOnWindowFocus: false,
      retry: (failureCount, error) => {
        // Client errors (4xx) will not fix themselves, so never retry them.
        if (error instanceof ApiError && error.status && error.status < 500) return false;
        return failureCount < 1;
      },
    },
  },
});
