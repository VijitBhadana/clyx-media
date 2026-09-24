import { useQueryClient } from '@tanstack/react-query';
import { httpBatchLink } from '@trpc/client';
import { useState } from 'react';
import superjson from 'superjson';
import Admin from '@/pages/Admin';
import { API_URL, adminToken } from '@/lib/api';
import { trpc } from '@/lib/trpc';

// Only the admin panel talks tRPC, so the client (and superjson) is created here and loaded with the
// admin page instead of being part of every visitor's first download.
export default function AdminApp() {
  const queryClient = useQueryClient();
  const [trpcClient] = useState(() =>
    trpc.createClient({
      links: [
        httpBatchLink({
          url: `${API_URL}/api/trpc`,
          transformer: superjson,
          headers() {
            const token = adminToken.get();
            return token ? { Authorization: `Bearer ${token}` } : {};
          },
        }),
      ],
    }),
  );

  return (
    <trpc.Provider client={trpcClient} queryClient={queryClient}>
      <Admin />
    </trpc.Provider>
  );
}
