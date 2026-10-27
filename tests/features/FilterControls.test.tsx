import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { describe, expect, it, vi } from "vitest";
import { FilterControls } from "@/features/products/FilterControls/FilterControls";
import type { ProductFilters } from "@/features/products/search-params";

const definitions = [
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
});
