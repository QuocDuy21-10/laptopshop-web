import { describe, expect, it } from "vitest";
import { updateProductFacet } from "@/features/products/filter-updates";
import type { ProductFilters } from "@/features/products/search-params";

const filters: ProductFilters = {
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], page: 4, q: "tuf", sort: "price_desc",
};

describe("typed filter updates", () => {
  it("adds and removes a multi-select string value while resetting page", () => {
    const definition = { key: "cpuBrand", name: "CPU", mode: "MULTI", kind: "categorical" } as const;
    expect(updateProductFacet(filters, definition, "INTEL")).toMatchObject({ cpuBrand: ["INTEL"], page: 1 });
    expect(updateProductFacet({ ...filters, cpuBrand: ["INTEL"] }, definition, "INTEL")).toMatchObject({ cpuBrand: [], page: 1 });
  });

  it("clears scalar values without changing keyword or sort", () => {
    const definition = { key: "minRefreshHz", name: "Hz", mode: "SINGLE_MIN", kind: "bucket" } as const;
    expect(updateProductFacet({ ...filters, minRefreshHz: 144 }, definition, undefined)).toMatchObject({
      minRefreshHz: undefined,
      q: "tuf",
      sort: "price_desc",
      page: 1,
    });
  });
});
