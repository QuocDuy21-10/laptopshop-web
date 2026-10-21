"use client";

import { SlidersHorizontal } from "lucide-react";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import type { FilterOptions } from "@/lib/api/types";
import { FilterControls } from "../FilterControls/FilterControls";
import { toQueryString } from "../search-params";
import { useRouter } from "next/navigation";
import { activeFilterCount, type ProductFilters } from "../search-params";
import styles from "./FilterSheet.module.scss";

export function FilterSheet({ options, filters }: { options: FilterOptions; filters: ProductFilters }) {
  const router = useRouter();
  const count = activeFilterCount(filters);
  return (
    <div className={styles.wrap}>
      <Dialog
        variant="sheet"
        title="Bộ lọc"
        trigger={
          <Button variant="secondary" size="sm">
            <SlidersHorizontal size={18} aria-hidden="true" />
            Bộ lọc{count > 0 ? ` (${count})` : ""}
          </Button>
        }
      >
        <FilterControls
          definitions={options.facetDefinitions ?? []}
          counts={{}}
          countsAvailable={false}
          filters={filters}
          idPrefix="sheet"
          onChange={(next) => router.push(`/products${toQueryString(next)}`, { scroll: false })}
        />
      </Dialog>
    </div>
  );
}
