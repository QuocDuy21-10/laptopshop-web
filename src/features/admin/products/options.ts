import type { FilterOption } from "@/lib/api/types";

export const toOptions = (opts?: FilterOption[]) => opts?.map((o) => ({ value: o.value, label: o.name }));

export const labelOf = (opts: FilterOption[] | undefined, value: string | null) =>
  opts?.find((o) => o.value === value)?.name ?? value ?? "—";
