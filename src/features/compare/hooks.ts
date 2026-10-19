"use client";

import { useQuery } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import { queryKeys } from "@/lib/api/query-keys";

// malformed ids (NaN, 0) are sent as-is so the API answers with a 400
export function useCompareProducts(ids: number[]) {
  return useQuery({
    queryKey: queryKeys.compare(ids),
    queryFn: async () =>
      (
        await unwrap(
          api.GET("/api/v1/products/compare", { params: { query: { ids: ids.join(",") } } }),
        )
      ).data,
    enabled: ids.length >= 2,
    retry: false,
  });
}
