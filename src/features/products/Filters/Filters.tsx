"use client";

import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import type { FilterOptions } from "@/lib/api/types";
import { PRICE_RANGE_OPTIONS } from "../labels";
import { toQueryString, type ProductFilters } from "../search-params";
import styles from "./Filters.module.scss";

type Key = "factory" | "target" | "price";

export function Filters({ options, filters, idPrefix = "f" }: { options: FilterOptions; filters: ProductFilters; idPrefix?: string }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const groups: Array<{ key: Key; title: string; options: ReadonlyArray<{ value: string; name: string }> }> = [
    { key: "factory", title: "Hãng sản xuất", options: options.factoryOptions },
    { key: "target", title: "Nhu cầu", options: options.targetOptions },
    { key: "price", title: "Khoảng giá", options: PRICE_RANGE_OPTIONS },
  ];

  const toggle = (key: Key, value: string) => {
    const current = filters[key];
    const next = current.includes(value) ? current.filter((v) => v !== value) : [...current, value];
    startTransition(() => {
      router.push(`/products${toQueryString({ ...filters, [key]: next, page: 1 })}`, { scroll: false });
    });
  };

  return (
    <div className={styles.filters} aria-busy={pending || undefined}>
      {groups.map((group) => (
        <fieldset key={group.key} className={styles.group}>
          <legend className={styles.legend}>{group.title}</legend>
          {group.options.map((o) => (
            <Checkbox
              key={o.value}
              id={`${idPrefix}-${group.key}-${o.value}`}
              label={o.name}
              checked={filters[group.key].includes(o.value)}
              onCheckedChange={() => toggle(group.key, o.value)}
            />
          ))}
        </fieldset>
      ))}
    </div>
  );
}
