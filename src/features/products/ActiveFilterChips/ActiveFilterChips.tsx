import { X } from "lucide-react";
import Link from "next/link";
import type { FilterOptions } from "@/lib/api/types";
import { optionName, PRICE_RANGE_OPTIONS } from "../labels";
import { activeFilterCount, toQueryString, type ProductFilters } from "../search-params";
import styles from "./ActiveFilterChips.module.scss";

export function ActiveFilterChips({ options, filters }: { options: FilterOptions; filters: ProductFilters }) {
  if (activeFilterCount(filters) === 0) return null;
  const chips = [
    ...filters.factory.map((v) => ({ key: "factory" as const, v, name: optionName(options.factoryOptions, v) })),
    ...filters.target.map((v) => ({ key: "target" as const, v, name: optionName(options.targetOptions, v) })),
    ...filters.price.map((v) => ({ key: "price" as const, v, name: optionName(PRICE_RANGE_OPTIONS, v) })),
  ];
  const without = (key: "factory" | "target" | "price", v: string) =>
    `/products${toQueryString({ ...filters, [key]: filters[key].filter((x) => x !== v), page: 1 })}`;

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
        <Link href={`/products${toQueryString({ factory: [], target: [], price: [], q: filters.q, sort: filters.sort, page: 1 })}`} className={styles.clear}>
          Xoá bộ lọc
        </Link>
      </li>
    </ul>
  );
}
