"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { useState } from "react";
import type { FacetDefinition } from "@/lib/api/types";
import { FilterControls, type FacetCounts } from "../FilterControls/FilterControls";
import { toQueryString, type ProductFilters } from "../search-params";

export function DesktopFilters({ definitions, counts, filters, countsAvailable = true }: { definitions: readonly FacetDefinition[]; counts: FacetCounts; filters: ProductFilters; countsAvailable?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useState<ProductFilters | null>(null);
  const effectiveFilters = optimisticFilters && toQueryString(optimisticFilters) !== toQueryString(filters) ? optimisticFilters : filters;
  return (
    <FilterControls
      definitions={definitions}
      counts={counts}
      filters={effectiveFilters}
      countsAvailable={countsAvailable}
      busy={pending}
      idPrefix="desktop"
      onChange={(next) => {
        setOptimisticFilters(next);
        startTransition(() => router.push(`/products${toQueryString(next)}`, { scroll: false }));
      }}
    />
  );
}
