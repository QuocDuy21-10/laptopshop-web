import type { FilterOptions, ProductFacetsQuery, ProductQuery } from "@/lib/api/types";
import { PRICE_RANGE_OPTIONS } from "./labels";

export type ProductSort = "price_asc" | "price_desc" | "rating_desc" | "sold_desc";
export type ProductFilters = {
  factory: string[];
  target: string[];
  price: string[];
  cpuBrand: string[];
  gpuBrand: string[];
  gpuType: string[];
  ramGb: number[];
  storageGb: number[];
  screenSize: string[];
  resolutionTier: string[];
  panelType: string[];
  minRefreshHz?: number;
  minBatteryWh?: number;
  maxWeightGrams?: number;
  minWarrantyMonths?: number;
  minRating?: 3 | 4;
  inStock?: boolean;
  flashSale?: boolean;
  sort?: ProductSort;
  q?: string;
  page: number;
};

export const PAGE_SIZE = 12;

const SORTS: readonly ProductSort[] = ["price_asc", "price_desc", "rating_desc", "sold_desc"];

export type Raw = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined, allowed: readonly string[], maxItems = 10) =>
  [...new Set((Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter((v) => allowed.includes(v)))].slice(0, maxItems);

const numericList = (value: string | string[] | undefined, min: number, max: number) =>
  [...new Set((Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => Number(v.trim()))
    .filter((v) => Number.isInteger(v) && v >= min && v <= max))].slice(0, 10);

const threshold = (value: string | string[] | undefined, allowed: readonly number[]) => {
  const rawValue = Array.isArray(value) ? undefined : value;
  const parsed = rawValue === undefined ? undefined : Number(rawValue);
  return parsed !== undefined && Number.isInteger(parsed) && allowed.includes(parsed) ? parsed : undefined;
};

const valuesFor = (options: FilterOptions, key: string, fallback: readonly string[]) =>
  options.facetDefinitions?.find((definition) => definition.key === key)?.options?.map((o) => o.value) ?? fallback;

const maxSelectionsFor = (options: FilterOptions, key: string) =>
  options.facetDefinitions?.find((definition) => definition.key === key)?.maxSelections ?? 10;

const CPU_BRANDS = ["INTEL", "AMD", "APPLE", "QUALCOMM"] as const;
const GPU_BRANDS = ["NVIDIA", "AMD", "INTEL", "APPLE", "QUALCOMM"] as const;
const GPU_TYPES = ["INTEGRATED", "DEDICATED"] as const;
const SCREEN_SIZES = ["compact", "standard", "large"] as const;
const RESOLUTION_TIERS = ["HD", "FHD", "QHD", "UHD"] as const;
const PANEL_TYPES = ["IPS", "OLED", "MINI_LED", "TN", "VA"] as const;
const REFRESH_RATE_MINIMUMS = [60, 90, 120, 144, 165, 240] as const;
const BATTERY_MINIMUMS = [40, 50, 60, 80] as const;
const WEIGHT_MAXIMUMS = [1200, 1500, 2000, 2500, 3000] as const;
const WARRANTY_MINIMUMS = [12, 24, 36] as const;

// unknown values are dropped: the API answers 400 for them
export function parseFilters(raw: Raw, options: FilterOptions): ProductFilters {
  const sort = SORTS.includes(raw.sort as ProductSort) ? (raw.sort as ProductSort) : undefined;
  const q = typeof raw.q === "string" && raw.q.trim() ? raw.q.trim().slice(0, 100) : undefined;
  const page = Math.trunc(Number(raw.page));
  return {
    factory: list(raw.factory, options.factoryOptions.map((o) => o.value)),
    target: list(raw.target, options.targetOptions.map((o) => o.value)),
    price: list(raw.price, PRICE_RANGE_OPTIONS.map((o) => o.value)),
    cpuBrand: list(raw.cpuBrand, valuesFor(options, "cpuBrand", CPU_BRANDS), maxSelectionsFor(options, "cpuBrand")),
    gpuBrand: list(raw.gpuBrand, valuesFor(options, "gpuBrand", GPU_BRANDS), maxSelectionsFor(options, "gpuBrand")),
    gpuType: list(raw.gpuType, valuesFor(options, "gpuType", GPU_TYPES), maxSelectionsFor(options, "gpuType")),
    ramGb: numericList(raw.ramGb, 1, 256),
    storageGb: numericList(raw.storageGb, 1, 16_384),
    screenSize: list(raw.screenSize, valuesFor(options, "screenSize", SCREEN_SIZES), maxSelectionsFor(options, "screenSize")),
    resolutionTier: list(raw.resolutionTier, valuesFor(options, "resolutionTier", RESOLUTION_TIERS), maxSelectionsFor(options, "resolutionTier")),
    panelType: list(raw.panelType, valuesFor(options, "panelType", PANEL_TYPES), maxSelectionsFor(options, "panelType")),
    minRefreshHz: threshold(raw.minRefreshHz, REFRESH_RATE_MINIMUMS),
    minBatteryWh: threshold(raw.minBatteryWh, BATTERY_MINIMUMS),
    maxWeightGrams: threshold(raw.maxWeightGrams, WEIGHT_MAXIMUMS),
    minWarrantyMonths: threshold(raw.minWarrantyMonths, WARRANTY_MINIMUMS),
    minRating: threshold(raw.minRating, [3, 4]) as 3 | 4 | undefined,
    inStock: raw.inStock === "true" ? true : undefined,
    flashSale: raw.flashSale === "true" ? true : undefined,
    sort,
    q,
    page: page > 0 ? page : 1,
  };
}

export function toQueryString(f: ProductFilters): string {
  const params = new URLSearchParams();
  if (f.factory.length) params.set("factory", f.factory.join(","));
  if (f.target.length) params.set("target", f.target.join(","));
  if (f.price.length) params.set("price", f.price.join(","));
  if (f.cpuBrand.length) params.set("cpuBrand", f.cpuBrand.join(","));
  if (f.gpuBrand.length) params.set("gpuBrand", f.gpuBrand.join(","));
  if (f.gpuType.length) params.set("gpuType", f.gpuType.join(","));
  if (f.ramGb.length) params.set("ramGb", f.ramGb.join(","));
  if (f.storageGb.length) params.set("storageGb", f.storageGb.join(","));
  if (f.screenSize.length) params.set("screenSize", f.screenSize.join(","));
  if (f.resolutionTier.length) params.set("resolutionTier", f.resolutionTier.join(","));
  if (f.panelType.length) params.set("panelType", f.panelType.join(","));
  if (f.minRefreshHz !== undefined) params.set("minRefreshHz", String(f.minRefreshHz));
  if (f.minBatteryWh !== undefined) params.set("minBatteryWh", String(f.minBatteryWh));
  if (f.maxWeightGrams !== undefined) params.set("maxWeightGrams", String(f.maxWeightGrams));
  if (f.minWarrantyMonths !== undefined) params.set("minWarrantyMonths", String(f.minWarrantyMonths));
  if (f.minRating !== undefined) params.set("minRating", String(f.minRating));
  if (f.inStock) params.set("inStock", "true");
  if (f.flashSale) params.set("flashSale", "true");
  if (f.sort) params.set("sort", f.sort);
  if (f.q) params.set("q", f.q);
  if (f.page > 1) params.set("page", String(f.page));
  const qs = params.toString();
  return qs ? `?${qs}` : "";
}

export function toApiQuery(f: ProductFilters): ProductQuery {
  return {
    page: f.page,
    pageSize: PAGE_SIZE,
    ...(f.factory.length ? { factory: f.factory.join(",") } : {}),
    ...(f.target.length ? { target: f.target.join(",") } : {}),
    ...(f.price.length ? { price: f.price.join(",") } : {}),
    ...(f.cpuBrand.length ? { cpuBrand: f.cpuBrand.join(",") } : {}),
    ...(f.gpuBrand.length ? { gpuBrand: f.gpuBrand.join(",") } : {}),
    ...(f.gpuType.length ? { gpuType: f.gpuType.join(",") } : {}),
    ...(f.ramGb.length ? { ramGb: f.ramGb.join(",") } : {}),
    ...(f.storageGb.length ? { storageGb: f.storageGb.join(",") } : {}),
    ...(f.screenSize.length ? { screenSize: f.screenSize.join(",") } : {}),
    ...(f.resolutionTier.length ? { resolutionTier: f.resolutionTier.join(",") } : {}),
    ...(f.panelType.length ? { panelType: f.panelType.join(",") } : {}),
    ...(f.minRefreshHz !== undefined ? { minRefreshHz: f.minRefreshHz } : {}),
    ...(f.minBatteryWh !== undefined ? { minBatteryWh: f.minBatteryWh } : {}),
    ...(f.maxWeightGrams !== undefined ? { maxWeightGrams: f.maxWeightGrams } : {}),
    ...(f.minWarrantyMonths !== undefined ? { minWarrantyMonths: f.minWarrantyMonths } : {}),
    ...(f.minRating !== undefined ? { minRating: f.minRating } : {}),
    ...(f.inStock ? { inStock: true } : {}),
    ...(f.flashSale ? { flashSale: true } : {}),
    ...(f.sort ? { sort: f.sort } : {}),
    ...(f.q ? { q: f.q } : {}),
  };
}

export function toFacetsApiQuery(f: ProductFilters): ProductFacetsQuery {
  const query = toApiQuery(f);
  const facets = { ...query };
  delete facets.page;
  delete facets.pageSize;
  delete facets.sort;
  delete facets.flashSale;
  return facets;
}

export const activeFilterCount = (f: ProductFilters) =>
  f.factory.length + f.target.length + f.price.length + f.cpuBrand.length + f.gpuBrand.length + f.gpuType.length +
  f.ramGb.length + f.storageGb.length + f.screenSize.length + f.resolutionTier.length + f.panelType.length +
  (f.minRefreshHz === undefined ? 0 : 1) + (f.minBatteryWh === undefined ? 0 : 1) +
  (f.maxWeightGrams === undefined ? 0 : 1) + (f.minWarrantyMonths === undefined ? 0 : 1) +
  (f.minRating === undefined ? 0 : 1) + (f.inStock ? 1 : 0) + (f.flashSale ? 1 : 0);

export const clearProductFacets = (filters: ProductFilters): ProductFilters => ({
  ...filters,
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], minRefreshHz: undefined, minBatteryWh: undefined,
  maxWeightGrams: undefined, minWarrantyMonths: undefined, minRating: undefined, inStock: undefined, flashSale: undefined, page: 1,
});
