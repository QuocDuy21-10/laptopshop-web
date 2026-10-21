"use client";

import { useEffect, useState } from "react";
import { useQuery, type UseQueryResult } from "@tanstack/react-query";
import { api } from "@/lib/api/client";
import { unwrap } from "@/lib/api/errors";
import type { ProductFacets } from "@/lib/api/types";
import { queryKeys } from "@/lib/api/query-keys";
import { toFacetsApiQuery, toQueryString, type ProductFilters } from "./search-params";

export function useProductFacetPreview(
  filters: ProductFilters,
  enabled: boolean,
  initialData?: ProductFacets,
): UseQueryResult<ProductFacets> & { isPreviewFresh: boolean } {
  const [debounced, setDebounced] = useState(filters);
  const [initialKey] = useState(() => toQueryString(filters));
  useEffect(() => {
    const timer = window.setTimeout(() => setDebounced(filters), 300);
    return () => window.clearTimeout(timer);
  }, [filters]);

  const query = toFacetsApiQuery(debounced);
  const seeded = toQueryString(debounced) === initialKey ? initialData : undefined;
  const result = useQuery({
    enabled,
    queryKey: queryKeys.productFacets(query),
    initialData: seeded,
    staleTime: 5_000,
    retry: false,
    queryFn: async ({ signal }) => (await unwrap(api.GET("/api/v1/products/facets", { params: { query }, signal }))).data,
  });
  return { ...result, isPreviewFresh: toQueryString(debounced) === toQueryString(filters) };
}
