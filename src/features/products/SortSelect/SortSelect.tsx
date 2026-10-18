"use client";

import { useRouter } from "next/navigation";
import { SORT_OPTIONS } from "../labels";
import { toQueryString, type ProductFilters, type ProductSort } from "../search-params";
import styles from "./SortSelect.module.scss";

export function SortSelect({ filters }: { filters: ProductFilters }) {
  const router = useRouter();
  return (
    <label className={styles.label}>
      <span>Sắp xếp</span>
      <select
        className={styles.select}
        value={filters.sort ?? ""}
        onChange={(e) => {
          const sort = (e.target.value || undefined) as ProductSort | undefined;
          router.push(`/products${toQueryString({ ...filters, sort, page: 1 })}`, { scroll: false });
        }}
      >
        {SORT_OPTIONS.map((o) => (
          <option key={o.value} value={o.value}>
            {o.name}
          </option>
        ))}
      </select>
    </label>
  );
}
