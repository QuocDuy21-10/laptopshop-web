import type { FilterOptions, ProductQuery } from "@/lib/api/types";
import { PRICE_RANGE_OPTIONS } from "./labels";

export type ProductSort = "price_asc" | "price_desc";
export type ProductFilters = {
  factory: string[];
  target: string[];
  price: string[];
  sort?: ProductSort;
  q?: string;
  page: number;
};

export const PAGE_SIZE = 12;

type Raw = Record<string, string | string[] | undefined>;

const list = (value: string | string[] | undefined, allowed: readonly string[]) =>
  (Array.isArray(value) ? value : value ? [value] : [])
    .flatMap((v) => v.split(","))
    .map((v) => v.trim())
    .filter((v) => allowed.includes(v));

// unknown values are dropped: the API answers 400 for them
export function parseFilters(raw: Raw, options: FilterOptions): ProductFilters {
  const sort = raw.sort === "price_asc" || raw.sort === "price_desc" ? raw.sort : undefined;
  const q = typeof raw.q === "string" && raw.q.trim() ? raw.q.trim().slice(0, 100) : undefined;
  const page = Math.trunc(Number(raw.page));
  return {
    factory: list(raw.factory, options.factoryOptions.map((o) => o.value)),
    target: list(raw.target, options.targetOptions.map((o) => o.value)),
    price: list(raw.price, PRICE_RANGE_OPTIONS.map((o) => o.value)),
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
    ...(f.sort ? { sort: f.sort } : {}),
    ...(f.q ? { q: f.q } : {}),
  };
}

export const activeFilterCount = (f: ProductFilters) => f.factory.length + f.target.length + f.price.length;
