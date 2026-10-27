import { X } from "lucide-react";
import Link from "next/link";
import type { FilterOptions } from "@/lib/api/types";
import { formatFacetValue, optionName, PRICE_RANGE_OPTIONS } from "../labels";
import { activeFilterCount, toQueryString, type ProductFilters } from "../search-params";
import styles from "./ActiveFilterChips.module.scss";

export function ActiveFilterChips({ options, filters }: { options: FilterOptions; filters: ProductFilters }) {
  if (activeFilterCount(filters) === 0) return null;
  const chips = [
    ...filters.factory.map((v) => ({ key: "factory" as const, v, name: optionName(options.factoryOptions, v) })),
    ...filters.target.map((v) => ({ key: "target" as const, v, name: optionName(options.targetOptions, v) })),
    ...filters.price.map((v) => ({ key: "price" as const, v, name: optionName(PRICE_RANGE_OPTIONS, v) })),
    ...(["cpuBrand", "gpuBrand", "gpuType", "screenSize", "resolutionTier", "panelType"] as const).flatMap((key) =>
      (filters[key] as string[]).map((v) => ({ key, v, name: optionName(options.facetDefinitions?.find((d) => d.key === key)?.options ?? [], v) || formatFacetValue(key, v) })),
    ),
    ...filters.ramGb.map((v) => ({ key: "ramGb" as const, v: String(v), name: formatFacetValue("ramGb", String(v)) })),
    ...filters.storageGb.map((v) => ({ key: "storageGb" as const, v: String(v), name: formatFacetValue("storageGb", String(v)) })),
    ...(filters.minRefreshHz === undefined ? [] : [{ key: "minRefreshHz" as const, v: String(filters.minRefreshHz), name: formatFacetValue("minRefreshHz", String(filters.minRefreshHz)) }]),
    ...(filters.minBatteryWh === undefined ? [] : [{ key: "minBatteryWh" as const, v: String(filters.minBatteryWh), name: formatFacetValue("minBatteryWh", String(filters.minBatteryWh)) }]),
    ...(filters.maxWeightGrams === undefined ? [] : [{ key: "maxWeightGrams" as const, v: String(filters.maxWeightGrams), name: formatFacetValue("maxWeightGrams", String(filters.maxWeightGrams)) }]),
    ...(filters.minWarrantyMonths === undefined ? [] : [{ key: "minWarrantyMonths" as const, v: String(filters.minWarrantyMonths), name: formatFacetValue("minWarrantyMonths", String(filters.minWarrantyMonths)) }]),
    ...(filters.minRating === undefined ? [] : [{ key: "minRating" as const, v: String(filters.minRating), name: formatFacetValue("minRating", String(filters.minRating)) }]),
    ...(filters.inStock ? [{ key: "inStock" as const, v: "true", name: formatFacetValue("inStock", "true") }] : []),
  ];
  const without = (key: string, v: string) => {
    const value = (filters as unknown as Record<string, unknown>)[key];
    if (Array.isArray(value)) return `/products${toQueryString({ ...filters, [key]: value.filter((x) => String(x) !== v), page: 1 } as ProductFilters)}`;
    return `/products${toQueryString({ ...filters, [key]: undefined, page: 1 } as ProductFilters)}`;
  };

  return (
    <ul role="list" className={styles.chips} aria-label="Bộ lọc đang áp dụng">
      {chips.map((c) => (
        <li key={`${c.key}-${c.v}`}>
          <Link href={without(c.key, c.v)} className={styles.chip} aria-label={`Bỏ lọc ${c.name}`}>
            {c.name} <X size={14} aria-hidden="true" />
          </Link>
        </li>
      ))}
      <li>
        <Link href={`/products${toQueryString({ factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [], screenSize: [], resolutionTier: [], panelType: [], q: filters.q, sort: filters.sort, page: 1 })}`} className={styles.clear}>
          Xoá bộ lọc
        </Link>
      </li>
    </ul>
  );
}
