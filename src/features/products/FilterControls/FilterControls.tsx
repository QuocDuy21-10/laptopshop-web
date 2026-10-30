"use client";

import type { FacetDefinition } from "@/lib/api/types";
import { Checkbox } from "@/components/ui/Checkbox/Checkbox";
import { formatFacetValue } from "../labels";
import type { ProductFilters } from "../search-params";
import { updateProductFacet } from "../filter-updates";
import { ExpandableRows, FilterGroup } from "./FilterGroup";
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
  if (key === "factory") return filters.factory;
  if (key === "target") return filters.target;
  if (key === "price") return filters.price;
  if (key === "cpuBrand") return filters.cpuBrand;
  if (key === "gpuBrand") return filters.gpuBrand;
  if (key === "gpuType") return filters.gpuType;
  if (key === "screenSize") return filters.screenSize;
  if (key === "resolutionTier") return filters.resolutionTier;
  if (key === "panelType") return filters.panelType;
  if (key === "ramGb") return filters.ramGb.map(String);
  if (key === "storageGb") return filters.storageGb.map(String);
  return [];
};

const scalarValue = (filters: ProductFilters, key: string): string | undefined => {
  if (key === "minRefreshHz") return filters.minRefreshHz?.toString();
  if (key === "minBatteryWh") return filters.minBatteryWh?.toString();
  if (key === "maxWeightGrams") return filters.maxWeightGrams?.toString();
  if (key === "minWarrantyMonths") return filters.minWarrantyMonths?.toString();
  if (key === "minRating") return filters.minRating?.toString();
  if (key === "inStock") return filters.inStock ? "true" : undefined;
  return undefined;
};

export function FilterControls({ definitions, counts, filters, onChange, idPrefix, busy, countsAvailable = true }: Props) {
  const update = (definition: FacetDefinition, value: string | undefined) => onChange(updateProductFacet(filters, definition, value));

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
            {definition.mode === "SINGLE_MIN" || definition.mode === "SINGLE_MAX" ? (
              <label className={styles.radioRow} htmlFor={`${idPrefix}-${definition.key}-all`}>
                <input
                  id={`${idPrefix}-${definition.key}-all`}
                  type="radio"
                  name={`${idPrefix}-${definition.key}`}
                  checked={scalarValue(filters, definition.key) === undefined}
                  onChange={() => update(definition, undefined)}
                />
                <span>Tất cả</span>
              </label>
            ) : null}
            <ExpandableRows rows={options.map((option) => {
              const count = countFor(option.value);
              const label = countsAvailable && count !== undefined ? `${option.name} (${count})` : option.name;
              const atLimit = definition.mode === "MULTI" && definition.maxSelections !== undefined && arrayValue(filters, definition.key).length >= definition.maxSelections;
              const disabled = (countsAvailable && count === 0 && !selected(option.value)) || (atLimit && !selected(option.value));
              const id = `${idPrefix}-${definition.key}-${option.value}`;
              if (definition.mode === "MULTI" || definition.mode === "BOOLEAN") {
                return {
                  selected: selected(option.value),
                  node: <Checkbox key={option.value} id={id} label={label} checked={selected(option.value)} disabled={disabled} onCheckedChange={() => update(definition, option.value)} />,
                };
              }
              return {
                selected: selected(option.value),
                node: (
                  <label key={option.value} className={styles.radioRow} htmlFor={id}>
                    <input id={id} type="radio" name={`${idPrefix}-${definition.key}`} checked={selected(option.value)} disabled={disabled} onChange={() => update(definition, option.value)} />
                    <span>{label}</span>
                  </label>
                ),
              };
            })} />
          </FilterGroup>
        );
      })}
    </div>
  );
}
