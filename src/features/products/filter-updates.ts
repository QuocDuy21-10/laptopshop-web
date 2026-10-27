import type { FacetDefinition } from "@/lib/api/types";
import type { ProductFilters } from "./search-params";

const toggleString = (values: string[], value: string) =>
  values.includes(value) ? values.filter((item) => item !== value) : [...values, value];

const toggleNumber = (values: number[], value: string) => {
  const numberValue = Number(value);
  return values.includes(numberValue)
    ? values.filter((item) => item !== numberValue)
    : [...values, numberValue];
};

export const updateProductFacet = (
  filters: ProductFilters,
  definition: FacetDefinition,
  value: string | undefined,
): ProductFilters => {
  const next = { ...filters, page: 1 };
  if (definition.mode === "MULTI" && value !== undefined) {
    if (definition.key === "ramGb") next.ramGb = toggleNumber(filters.ramGb, value);
    else if (definition.key === "storageGb") next.storageGb = toggleNumber(filters.storageGb, value);
    else if (definition.key === "factory") next.factory = toggleString(filters.factory, value);
    else if (definition.key === "target") next.target = toggleString(filters.target, value);
    else if (definition.key === "price") next.price = toggleString(filters.price, value);
    else if (definition.key === "cpuBrand") next.cpuBrand = toggleString(filters.cpuBrand, value);
    else if (definition.key === "gpuBrand") next.gpuBrand = toggleString(filters.gpuBrand, value);
    else if (definition.key === "gpuType") next.gpuType = toggleString(filters.gpuType, value);
    else if (definition.key === "screenSize") next.screenSize = toggleString(filters.screenSize, value);
    else if (definition.key === "resolutionTier") next.resolutionTier = toggleString(filters.resolutionTier, value);
    else if (definition.key === "panelType") next.panelType = toggleString(filters.panelType, value);
  } else if (definition.key === "inStock") {
    next.inStock = value === "true" && !filters.inStock ? true : undefined;
  } else if (definition.key === "minRefreshHz") next.minRefreshHz = value === undefined ? undefined : Number(value);
  else if (definition.key === "minBatteryWh") next.minBatteryWh = value === undefined ? undefined : Number(value);
  else if (definition.key === "maxWeightGrams") next.maxWeightGrams = value === undefined ? undefined : Number(value);
  else if (definition.key === "minWarrantyMonths") next.minWarrantyMonths = value === undefined ? undefined : Number(value);
  else if (definition.key === "minRating") next.minRating = value === undefined ? undefined : (Number(value) as 3 | 4);
  return next;
};

