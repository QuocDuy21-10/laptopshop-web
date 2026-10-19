import type { Product } from "@/lib/api/types";

export type SpecKey = keyof Pick<
  Product,
  | "cpu"
  | "gpu"
  | "ramGb"
  | "storageGb"
  | "screenSizeInch"
  | "screenResolution"
  | "refreshRateHz"
  | "batteryWh"
  | "weightGrams"
  | "warrantyMonths"
>;

export type SpecRow = {
  key: SpecKey;
  label: string;
  format: (v: string | number) => string;
  better?: "higher" | "lower";
};

const inch = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 1 });
const kg = new Intl.NumberFormat("vi-VN", { maximumFractionDigits: 3 });
const text = (v: string | number) => String(v);

export const SPEC_ROWS: SpecRow[] = [
  { key: "cpu", label: "CPU", format: text },
  { key: "gpu", label: "Card đồ hoạ", format: text },
  { key: "ramGb", label: "RAM", format: (v) => `${v} GB`, better: "higher" },
  {
    key: "storageGb",
    label: "Ổ cứng",
    format: (v) => (Number(v) % 1024 === 0 ? `${Number(v) / 1024} TB` : `${v} GB`),
    better: "higher",
  },
  { key: "screenSizeInch", label: "Màn hình", format: (v) => `${inch.format(Number(v))} inch` },
  { key: "screenResolution", label: "Độ phân giải", format: text },
  { key: "refreshRateHz", label: "Tần số quét", format: (v) => `${v} Hz`, better: "higher" },
  { key: "batteryWh", label: "Pin", format: (v) => `${v} Wh`, better: "higher" },
  {
    key: "weightGrams",
    label: "Trọng lượng",
    format: (v) => `${kg.format(Number(v) / 1000)} kg`,
    better: "lower",
  },
  { key: "warrantyMonths", label: "Bảo hành", format: (v) => `${v} tháng`, better: "higher" },
];

export const formatSpec = (row: SpecRow, value: string | number | null | undefined) =>
  value === null || value === undefined ? null : row.format(value);

// no winner when fewer than two values are known or all known values tie
export function bestIndexes(values: (number | null)[], better: "higher" | "lower"): Set<number> {
  const known = values.filter((v): v is number => v !== null);
  if (known.length < 2) return new Set();
  const target = better === "higher" ? Math.max(...known) : Math.min(...known);
  if (known.every((v) => v === target)) return new Set();
  return new Set(values.flatMap((v, i) => (v === target ? [i] : [])));
}
