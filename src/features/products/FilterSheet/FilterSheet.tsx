"use client";

import { SlidersHorizontal } from "lucide-react";
import { useState } from "react";
import { Button } from "@/components/ui/Button/Button";
import { Dialog } from "@/components/ui/Dialog/Dialog";
import type { FilterOptions, ProductFacets } from "@/lib/api/types";
import { FilterControls } from "../FilterControls/FilterControls";
import { activeFilterCount, toQueryString, type ProductFilters } from "../search-params";
import { useRouter } from "next/navigation";
import { useProductFacetPreview } from "../useProductFacetPreview";
import styles from "./FilterSheet.module.scss";

const clearFacets = (filters: ProductFilters): ProductFilters => ({
  ...filters,
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], minRefreshHz: undefined, minBatteryWh: undefined,
  maxWeightGrams: undefined, minWarrantyMonths: undefined, inStock: undefined, page: 1,
});

export function FilterSheet({ options, filters, facets }: { options: FilterOptions; filters: ProductFilters; facets?: ProductFacets | null }) {
  const router = useRouter();
  const count = activeFilterCount(filters);
  const [open, setOpen] = useState(false);
  const [draft, setDraft] = useState(filters);
  const preview = useProductFacetPreview(draft, open, facets ?? undefined);
  const previewFresh = preview.isPreviewFresh && !preview.isFetching;
  const countsAvailable = previewFresh && !preview.isError && preview.data !== undefined;
  const apply = () => {
    router.push(`/products${toQueryString(draft)}`, { scroll: false });
    setOpen(false);
  };
  return (
    <div className={styles.wrap}>
      <Dialog
        open={open}
        onOpenChange={(next) => {
          setOpen(next);
          if (next) setDraft(filters);
        }}
        variant="sheet"
        title="Bộ lọc"
        trigger={
          <Button variant="secondary" size="sm">
            <SlidersHorizontal size={18} aria-hidden="true" />
            Bộ lọc{count > 0 ? ` (${count})` : ""}
          </Button>
        }
      >
        <FilterControls definitions={options.facetDefinitions ?? []} counts={preview.data?.groups ?? {}} countsAvailable={countsAvailable} filters={draft} idPrefix="sheet" onChange={setDraft} />
        {preview.isError && <p role="status" className={styles.error}>Không thể cập nhật số lượng. Bạn vẫn có thể áp dụng bộ lọc.</p>}
        <div className={styles.footer}>
          <Button variant="ghost" onClick={() => setDraft(clearFacets(draft))}>Đặt lại</Button>
          <Button variant="primary" disabled={previewFresh && !preview.isError && preview.data?.total === 0} onClick={apply}>
            {previewFresh && preview.data ? `Xem ${preview.data.total} sản phẩm` : "Áp dụng bộ lọc"}
          </Button>
        </div>
      </Dialog>
    </div>
  );
}
