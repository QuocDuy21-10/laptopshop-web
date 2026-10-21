"use client";

import type { FacetDefinition } from "@/lib/api/types";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { formatFacetValue } from "../labels";
import type { ProductFilters } from "../search-params";
import { FilterGroup } from "./FilterGroup";
import styles from "./FilterControls.module.scss";

export type FacetCount = { value: string; count: number };
export type FacetCounts = Partial<Record<string, FacetCount[]>>;

type Props = {
  definitions: readonly FacetDefinition[];
  counts: FacetCounts;
  filters: ProductFilters;
  onChange: (filters: ProductFilters) => void;
  idPrefix: string;
  busy?: boolean;
  countsAvailable?: boolean;
};

const arrayValue = (filters: ProductFilters, key: string): string[] => {
  const value = (filters as unknown as Record<string, unknown>)[key];
  return Array.isArray(value) ? value.map(String) : [];
};

const scalarValue = (filters: ProductFilters, key: string): string | undefined => {
  const value = (filters as unknown as Record<string, unknown>)[key];
  return value === undefined ? undefined : String(value);
};

export function FilterControls({ definitions, counts, filters, onChange, idPrefix, busy, countsAvailable = true }: Props) {
  const update = (key: string, value: string, mode: FacetDefinition["mode"]) => {
    const next = { ...filters } as ProductFilters & Record<string, unknown>;
    if (mode === "MULTI") {
      const current = arrayValue(filters, key);
      const values = current.includes(value) ? current.filter((item) => item !== value) : [...current, value];
      next[key] = key === "ramGb" || key === "storageGb" ? values.map(Number) : values;
    } else if (mode === "BOOLEAN") {
      next[key] = scalarValue(filters, key) === value ? undefined : value === "true";
    } else {
      next[key] = scalarValue(filters, key) === value ? undefined : Number(value);
    }
    next.page = 1;
    onChange(next);
  };

  return (
    <div className={styles.controls} aria-busy={busy || undefined}>
      {definitions.map((definition, index) => {
        const groupCounts = counts[definition.key] ?? [];
        const options = definition.options?.length
          ? definition.options
          : groupCounts.map((item) => ({ value: item.value, name: formatFacetValue(definition.key, item.value) }));
        const countFor = (value: string) => groupCounts.find((item) => item.value === value)?.count;
        const selected = (value: string) =>
          definition.mode === "MULTI" ? arrayValue(filters, definition.key).includes(value) : scalarValue(filters, definition.key) === value;
        return (
          <FilterGroup key={definition.key} title={definition.name} open={index < 5}>
            {options.map((option) => {
              const count = countFor(option.value);
              const label = countsAvailable && count !== undefined ? `${option.name} (${count})` : option.name;
              const disabled = countsAvailable && count === 0 && !selected(option.value);
              const id = `${idPrefix}-${definition.key}-${option.value}`;
              if (definition.mode === "MULTI" || definition.mode === "BOOLEAN") {
                return (
                  <Checkbox key={option.value} id={id} label={label} checked={selected(option.value)} disabled={disabled} onCheckedChange={() => update(definition.key, option.value, definition.mode)} />
                );
              }
              return (
                <label key={option.value} className={styles.radioRow} htmlFor={id}>
                  <input id={id} type="radio" name={`${idPrefix}-${definition.key}`} checked={selected(option.value)} disabled={disabled} onChange={() => update(definition.key, option.value, definition.mode)} />
                  <span>{label}</span>
                </label>
              );
            })}
          </FilterGroup>
        );
      })}
    </div>
  );
}
