import { describe, expect, it } from "vitest";
import { parseFilters, toApiQuery, toFacetsApiQuery, toQueryString } from "@/features/products/search-params";

const options = {
  factoryOptions: [
    { name: "Asus", value: "ASUS" },
    { name: "Dell", value: "DELL" },
  ],
  targetOptions: [{ name: "Gaming", value: "GAMING" }],
};

describe("parseFilters", () => {
  it("keeps known values and drops the rest", () => {
    const f = parseFilters(
      { factory: "ASUS,NOKIA", target: ["GAMING"], price: "under-10m,cheap", sort: "price_desc", q: "  tuf ", page: "2" },
      options,
    );
    expect(f).toEqual({ factory: ["ASUS"], target: ["GAMING"], price: ["under-10m"], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], minRefreshHz: undefined, minBatteryWh: undefined, maxWeightGrams: undefined, minWarrantyMonths: undefined, inStock: undefined, sort: "price_desc", q: "tuf", page: 2 });
  });

  it("defaults sensibly", () => {
    expect(parseFilters({ page: "-3", sort: "rating" }, options)).toEqual({
      factory: [],
      target: [],
      price: [],
      cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [],
      minRefreshHz: undefined, minBatteryWh: undefined, maxWeightGrams: undefined, minWarrantyMonths: undefined, inStock: undefined,
      sort: undefined,
      q: undefined,
      page: 1,
    });
  });
});

describe("toQueryString", () => {
  it("serialises in a stable order and omits page 1", () => {
    expect(
      toQueryString({ factory: ["ASUS", "DELL"], target: [], price: ["over-20m"], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], sort: "price_asc", q: "mac book", page: 1 }),
    ).toBe("?factory=ASUS%2CDELL&price=over-20m&sort=price_asc&q=mac+book");
    expect(toQueryString({ factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], page: 3 })).toBe("?page=3");
    expect(toQueryString({ factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], page: 1 })).toBe("");
  });
});

describe("toApiQuery", () => {
  it("joins lists and sets the page size", () => {
    expect(toApiQuery({ factory: ["ASUS"], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], q: "tuf", page: 2 })).toEqual({
      page: 2,
      pageSize: 12,
      factory: "ASUS",
      q: "tuf",
    });
  });

  it("round-trips every advanced facet type and keeps canonical key order", () => {
    const f = parseFilters(
      {
        factory: "ASUS,ASUS",
        target: "GAMING",
        price: "under-10m",
        cpuBrand: "INTEL,AMD",
        gpuBrand: "NVIDIA",
        gpuType: "DEDICATED",
        ramGb: "24,24",
        storageGb: "1000",
        screenSize: "standard,large",
        resolutionTier: "FHD",
        panelType: "IPS",
        minRefreshHz: "144",
        minBatteryWh: "50",
        maxWeightGrams: "2000",
        minWarrantyMonths: "24",
        inStock: "true",
        sort: "price_asc",
        q: "  tuf ",
        page: "2",
      },
      { ...options, facetDefinitions: [] },
    );
    expect(f).toEqual({
      factory: ["ASUS"], target: ["GAMING"], price: ["under-10m"], cpuBrand: ["INTEL", "AMD"],
      gpuBrand: ["NVIDIA"], gpuType: ["DEDICATED"], ramGb: [24], storageGb: [1000],
      screenSize: ["standard", "large"], resolutionTier: ["FHD"], panelType: ["IPS"],
      minRefreshHz: 144, minBatteryWh: 50, maxWeightGrams: 2000, minWarrantyMonths: 24,
      inStock: true, sort: "price_asc", q: "tuf", page: 2,
    });
    expect(toQueryString(f)).toBe(
      "?factory=ASUS&target=GAMING&price=under-10m&cpuBrand=INTEL%2CAMD&gpuBrand=NVIDIA&gpuType=DEDICATED&ramGb=24&storageGb=1000&screenSize=standard%2Clarge&resolutionTier=FHD&panelType=IPS&minRefreshHz=144&minBatteryWh=50&maxWeightGrams=2000&minWarrantyMonths=24&inStock=true&sort=price_asc&q=tuf&page=2",
    );
    expect(toFacetsApiQuery(f)).toMatchObject({ ramGb: "24", storageGb: "1000", inStock: true, q: "tuf" });
  });
});
