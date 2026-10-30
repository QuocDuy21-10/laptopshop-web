import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterControls } from "@/features/products/FilterControls/FilterControls";
import type { ProductFilters } from "@/features/products/search-params";
import type { FacetDefinition } from "@/lib/api/types";

const definitions: FacetDefinition[] = [
  { key: "cpuBrand", name: "CPU", mode: "MULTI" as const, kind: "categorical" as const, options: [{ value: "INTEL", name: "Intel" }, { value: "AMD", name: "AMD" }] },
  { key: "ramGb", name: "RAM", mode: "MULTI" as const, kind: "exact" as const },
  { key: "minRefreshHz", name: "Tần số quét tối thiểu", mode: "SINGLE_MIN" as const, kind: "bucket" as const, options: [{ value: "144", name: "144 Hz" }] },
  { key: "minRating", name: "Đánh giá tối thiểu", mode: "SINGLE_MIN" as const, kind: "bucket" as const, options: [{ value: "4", name: "Từ 4 sao" }, { value: "3", name: "Từ 3 sao" }] },
];

const filters: ProductFilters = {
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], page: 1,
};

describe("FilterControls", () => {
  it("renders semantic groups and disables unselected zero-count options", () => {
    render(<FilterControls definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 0 }, { value: "AMD", count: 2 }], ramGb: [{ value: "24", count: 3 }] }} filters={filters} onChange={vi.fn()} idPrefix="desktop" />);
    expect(screen.getByRole("group", { name: "CPU" })).toBeInTheDocument();
    expect(screen.getByRole("group", { name: "RAM" })).toBeInTheDocument();
    expect(screen.getByRole("checkbox", { name: /Intel/ })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: /AMD \(2\)/ })).toBeEnabled();
    expect(screen.getByRole("checkbox", { name: /24 GB \(3\)/ })).toBeEnabled();
    expect(document.querySelectorAll("fieldset")).toHaveLength(4);
  });

  it("keeps selected zero-count options enabled and emits a next filter", async () => {
    const onChange = vi.fn();
    render(<FilterControls definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 0 }] }} filters={{ ...filters, cpuBrand: ["INTEL"] }} onChange={onChange} idPrefix="sheet" />);
    const checkbox = screen.getByRole("checkbox", { name: /Intel \(0\)/ });
    expect(checkbox).toBeEnabled();
    await userEvent.click(checkbox);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ cpuBrand: [] }));
  });

  it("renders scalar threshold controls with a unique prefix", () => {
    render(<FilterControls definitions={definitions} counts={{ minRefreshHz: [{ value: "144", count: 1 }] }} filters={filters} onChange={vi.fn()} idPrefix="sheet" />);
    expect(screen.getByRole("radio", { name: /144 Hz \(1\)/ })).toHaveAttribute("id", "sheet-minRefreshHz-144");
    expect(screen.getByRole("group", { name: "Tần số quét tối thiểu" })).toBeInTheDocument();
  });

  it("does not disable or claim counts while counts are unavailable", () => {
    render(<FilterControls definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 0 }] }} filters={filters} onChange={vi.fn()} idPrefix="desktop" countsAvailable={false} />);
    expect(screen.getByRole("checkbox", { name: "Intel" })).toBeEnabled();
    expect(screen.queryByText(/Intel \(0\)/)).not.toBeInTheDocument();
  });

  it("renders minimum rating as a single-select Vietnamese facet", async () => {
    const onChange = vi.fn();
    render(<FilterControls definitions={definitions} counts={{ minRating: [{ value: "4", count: 2 }, { value: "3", count: 3 }] }} filters={filters} onChange={onChange} idPrefix="desktop" />);
    expect(screen.getByRole("radio", { name: "Từ 4 sao (2)" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("radio", { name: "Từ 4 sao (2)" }));
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minRating: 4, page: 1 }));
  });

  it("renders Tất cả for thresholds and clears a selected threshold", async () => {
    const onChange = vi.fn();
    render(<FilterControls definitions={definitions} counts={{ minRefreshHz: [{ value: "144", count: 1 }] }} filters={{ ...filters, minRefreshHz: 144 }} onChange={onChange} idPrefix="sheet" />);
    const all = screen.getAllByRole("radio", { name: "Tất cả" })[0];
    expect(all).not.toBeChecked();
    await userEvent.click(all);
    expect(onChange).toHaveBeenCalledWith(expect.objectContaining({ minRefreshHz: undefined, page: 1 }));
  });

  it("disables unselected multi values once maxSelections is reached", async () => {
    const many = Array.from({ length: 10 }, (_, index) => ({ value: String(index + 1), name: String(index + 1) }));
    render(<FilterControls definitions={[{ key: "ramGb", name: "RAM", mode: "MULTI", kind: "exact", maxSelections: 10, options: [...many, { value: "11", name: "11" }] }]} counts={{}} filters={{ ...filters, ramGb: many.map((item) => Number(item.value)) }} onChange={vi.fn()} idPrefix="sheet" />);
    await userEvent.click(screen.getByRole("button", { name: /Xem thêm/ }));
    expect(screen.getByRole("checkbox", { name: "11" })).toBeDisabled();
    expect(screen.getByRole("checkbox", { name: "1" })).toBeEnabled();
  });

  it("folds long option lists behind Xem thêm but keeps selected options visible", async () => {
    const many: FacetDefinition[] = [{ key: "ramGb", name: "RAM", mode: "MULTI", kind: "exact", options: [4, 8, 12, 16, 24, 32, 64].map((v) => ({ value: String(v), name: `${v} GB` })) }];
    render(<FilterControls definitions={many} counts={{}} filters={{ ...filters, ramGb: [64] }} onChange={vi.fn()} idPrefix="desktop" />);
    expect(screen.getAllByRole("checkbox")).toHaveLength(6);
    expect(screen.getByRole("checkbox", { name: "64 GB" })).toBeChecked();
    await userEvent.click(screen.getByRole("button", { name: "Xem thêm 1" }));
    expect(screen.getAllByRole("checkbox")).toHaveLength(7);
    expect(screen.getByRole("button", { name: "Thu gọn" })).toBeInTheDocument();
  });
});
