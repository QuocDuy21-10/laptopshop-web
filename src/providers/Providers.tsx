"use client";

import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { useRouter } from "next/navigation";
import { useEffect, useState, type ReactNode } from "react";
import { Toaster } from "sonner";
import { setSessionExpiredHandler } from "@/lib/api/client";
import { ApiError } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import { isGuardedPath } from "@/lib/guarded-routes";
import { loginHref } from "@/lib/safe-next";

export function Providers({ children }: { children: ReactNode }) {
  const router = useRouter();
  const [queryClient] = useState(
    () =>
      new QueryClient({
        defaultOptions: {
          queries: {
            staleTime: 30_000,
            refetchOnWindowFocus: false,
            retry: (count, err) => !(err instanceof ApiError && err.status < 500) && count < 2,
          },
        },
      }),
  );

  useEffect(() => {
    setSessionExpiredHandler(() => {
      queryClient.setQueryData(queryKeys.me, null);
      const { pathname, search } = window.location;
      if (isGuardedPath(pathname)) router.replace(loginHref(pathname + search));
    });
  }, [queryClient, router]);

  return (
    <QueryClientProvider client={queryClient}>
      {children}
      <Toaster position="top-right" closeButton />
    </QueryClientProvider>
  );
}
