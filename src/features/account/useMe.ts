"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { isApiError, unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";
import type { Me } from "@/lib/api/types";
import { shouldCheckSession } from "@/lib/session-hint";

export function useMe() {
  return useQuery<Me | null>({
    queryKey: queryKeys.me,
    staleTime: 60_000,
    queryFn: async () => {
      if (!shouldCheckSession()) return null;
      try {
        return (await unwrap(api.GET("/api/v1/users/me"))).data;
      } catch (e) {
        if (isApiError(e) && e.status === 401) return null;
        throw e;
      }
    },
  });
}
