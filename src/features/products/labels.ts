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

export const FACET_LABELS: Record<string, string> = {
  cpuBrand: "CPU",
  gpuBrand: "Hãng GPU",
  gpuType: "Loại GPU",
  ramGb: "RAM",
  storageGb: "Ổ cứng",
  screenSize: "Kích thước màn hình",
  resolutionTier: "Độ phân giải",
  panelType: "Loại tấm nền",
  minRefreshHz: "Tần số quét tối thiểu",
  minBatteryWh: "Pin tối thiểu",
  maxWeightGrams: "Trọng lượng tối đa",
  minWarrantyMonths: "Bảo hành tối thiểu",
  inStock: "Tình trạng",
};

export const formatFacetValue = (key: string, value: string) => {
  if (key === "ramGb") return `${value} GB`;
  if (key === "storageGb") return `${Number(value) >= 1024 ? `${Number(value) / 1024} TB` : `${value} GB`}`;
  if (key === "minRefreshHz") return `Từ ${value} Hz`;
  if (key === "minBatteryWh") return `Từ ${value} Wh`;
  if (key === "maxWeightGrams") return `Tối đa ${Number(value) / 1000} kg`;
  if (key === "minWarrantyMonths") return `Từ ${value} tháng`;
  if (key === "inStock") return value === "true" ? "Còn hàng" : value;
  return value;
};

type Option = { readonly value: string; readonly name: string };

export const optionName = (options: readonly Option[], value?: string | null) =>
  options.find((o) => o.value === value)?.name ?? value ?? "";
