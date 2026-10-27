"use client";

import { useRouter } from "next/navigation";
import { useEffect, useOptimistic, useState, useTransition } from "react";
import type { FacetDefinition } from "@/lib/api/types";
import { FilterControls, type FacetCounts } from "../FilterControls/FilterControls";
import { toQueryString, type ProductFilters } from "../search-params";

export function DesktopFilters({ definitions, counts, filters, countsAvailable = true }: { definitions: readonly FacetDefinition[]; counts: FacetCounts; filters: ProductFilters; countsAvailable?: boolean }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [optimisticFilters, setOptimisticFilters] = useOptimistic(filters, (_current, next: ProductFilters) => next);
  const [pendingFilters, setPendingFilters] = useState<ProductFilters | null>(null);
  useEffect(() => {
    if (pendingFilters && toQueryString(pendingFilters) === toQueryString(filters)) {
      // URL commit is the external navigation acknowledgement for this optimistic transition.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setPendingFilters(null);
    }
  }, [filters, pendingFilters]);
  const effectiveFilters = pendingFilters ?? optimisticFilters;
  return (
    <FilterControls
      definitions={definitions}
      counts={counts}
      filters={effectiveFilters}
      countsAvailable={countsAvailable}
      busy={pending}
      idPrefix="desktop"
      onChange={(next) => {
        setPendingFilters(next);
        startTransition(() => {
          setOptimisticFilters(next);
          router.push(`/products${toQueryString(next)}`, { scroll: false });
        });
      }}
    />
  );
}
