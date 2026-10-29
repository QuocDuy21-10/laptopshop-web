import type { FilterOption } from "@/lib/api/types";

const tokens = (value: string) =>
  value
    .normalize("NFD")
    .replace(/\p{M}/gu, "")
    .toLowerCase()
    .split(/[^a-z0-9]+/)
    .filter(Boolean);

// The API searches product names only, so "asus" misses most Asus laptops whose names omit the brand.
// When the query is exactly a brand (by value or any word of its label), the page offers the brand filter.
export function brandForQuery(q: string | undefined, brands: readonly FilterOption[]): FilterOption | undefined {
  const query = q ? tokens(q) : [];
  if (query.length !== 1 || query[0].length < 2) return undefined;
  return brands.find((brand) => [...tokens(brand.value), ...tokens(brand.name)].includes(query[0]));
}
