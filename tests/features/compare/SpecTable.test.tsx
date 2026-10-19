import { render, screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { SpecTable, SpecValue } from "@/features/compare/SpecTable/SpecTable";
import type { Product } from "@/lib/api/types";

const base: Product = {
  id: 1,
  name: "MacBook Air 13",
  price: 17_690_000,
  image: null,
  detailDesc: null,
  shortDesc: null,
  quantity: 3,
  sold: 0,
  factory: "APPLE",
  target: "MONG-NHE",
  isActive: true,
  cpu: null,
  gpu: null,
  ramGb: null,
  storageGb: null,
  screenSizeInch: null,
  screenResolution: null,
  refreshRateHz: null,
  batteryWh: null,
  weightGrams: null,
  warrantyMonths: null,
};

describe("SpecTable", () => {
  it("lists only the specs the product has", () => {
    render(<SpecTable product={{ ...base, cpu: "Apple M1", ramGb: 8, weightGrams: 1290 }} />);
    expect(screen.getByRole("heading", { name: "Thông số kỹ thuật" })).toBeInTheDocument();
    expect(screen.getAllByRole("row")).toHaveLength(3);
    expect(screen.getByRole("rowheader", { name: "RAM" })).toBeInTheDocument();
    expect(screen.getByRole("cell", { name: "1,29 kg" })).toBeInTheDocument();
    expect(screen.queryByRole("rowheader", { name: "Pin" })).not.toBeInTheDocument();
  });

  it("renders nothing without any spec", () => {
    const { container } = render(<SpecTable product={base} />);
    expect(container).toBeEmptyDOMElement();
  });
});

describe("SpecValue", () => {
  it("announces missing values", () => {
    render(<SpecValue value={null} />);
    expect(screen.getByText("Chưa có thông tin")).toBeInTheDocument();
  });
});
