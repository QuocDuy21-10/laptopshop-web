export const PRICE_RANGE_OPTIONS = [
  { value: "under-10m", name: "Dưới 10 triệu" },
  { value: "10-15m", name: "10 – 15 triệu" },
  { value: "15-20m", name: "15 – 20 triệu" },
  { value: "over-20m", name: "Trên 20 triệu" },
] as const;

export const SORT_OPTIONS = [
  { value: "", name: "Mặc định" },
  { value: "price_asc", name: "Giá tăng dần" },
  { value: "price_desc", name: "Giá giảm dần" },
] as const;

type Option = { readonly value: string; readonly name: string };

export const optionName = (options: readonly Option[], value?: string | null) =>
  options.find((o) => o.value === value)?.name ?? value ?? "";
