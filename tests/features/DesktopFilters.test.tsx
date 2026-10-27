import { render, screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { DesktopFilters } from "@/features/products/DesktopFilters/DesktopFilters";
import { ActiveFilterChips } from "@/features/products/ActiveFilterChips/ActiveFilterChips";
import type { ProductFilters } from "@/features/products/search-params";
import type { FacetDefinition } from "@/lib/api/types";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const definitions: FacetDefinition[] = [
  { key: "cpuBrand", name: "CPU", mode: "MULTI" as const, kind: "categorical" as const, options: [{ value: "INTEL", name: "Intel" }, { value: "AMD", name: "AMD" }] },
  { key: "minRefreshHz", name: "Tần số quét tối thiểu", mode: "SINGLE_MIN" as const, kind: "bucket" as const, options: [{ value: "144", name: "144 Hz" }] },
  { key: "minRating", name: "Đánh giá tối thiểu", mode: "SINGLE_MIN" as const, kind: "bucket" as const, options: [{ value: "4", name: "Từ 4 sao" }, { value: "3", name: "Từ 3 sao" }] },
  { key: "inStock", name: "Tình trạng", mode: "BOOLEAN" as const, kind: "categorical" as const, options: [{ value: "true", name: "Còn hàng" }] },
];
const options = { factoryOptions: [], targetOptions: [], facetDefinitions: definitions };
const filters: ProductFilters = {
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], page: 3, q: "tuf", sort: "price_desc",
};

beforeEach(() => router.push.mockClear());

describe("DesktopFilters and active chips", () => {
  it("updates one group, preserves the rest and resets page", async () => {
    render(<DesktopFilters definitions={definitions} counts={{ cpuBrand: [{ value: "AMD", count: 2 }] }} filters={filters} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "AMD (2)" }));
    expect(router.push).toHaveBeenCalledWith("/products?cpuBrand=AMD&sort=price_desc&q=tuf", { scroll: false });
  });

  it("keeps rapid selections cumulative while navigation is pending", async () => {
    const user = userEvent.setup();
    render(<DesktopFilters definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 2 }, { value: "AMD", count: 2 }] }} filters={filters} />);
    await user.click(screen.getByRole("checkbox", { name: "Intel (2)" }));
    await user.click(screen.getByRole("checkbox", { name: "AMD (2)" }));
    expect(router.push).toHaveBeenLastCalledWith("/products?cpuBrand=INTEL%2CAMD&sort=price_desc&q=tuf", { scroll: false });
  });

  it("treats committed Back navigation props as authoritative", async () => {
    const view = render(<DesktopFilters definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 2 }] }} filters={filters} />);
    await userEvent.click(screen.getByRole("checkbox", { name: "Intel (2)" }));
    view.rerender(<DesktopFilters definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 2 }] }} filters={{ ...filters, cpuBrand: ["INTEL"], page: 1 }} />);
    view.rerender(<DesktopFilters definitions={definitions} counts={{ cpuBrand: [{ value: "INTEL", count: 2 }] }} filters={filters} />);
    expect(screen.getByRole("checkbox", { name: "Intel (2)" })).not.toBeChecked();
  });

  it("renders and removes advanced scalar and toggle chips", async () => {
    render(<ActiveFilterChips options={options} filters={{ ...filters, cpuBrand: ["INTEL"], minRefreshHz: 144, inStock: true, page: 1 }} />);
    expect(screen.getByText("Intel")).toBeInTheDocument();
    expect(screen.getByText("Từ 144 Hz")).toBeInTheDocument();
    expect(screen.getByText("Còn hàng")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bỏ lọc Intel" })).toHaveAttribute("href", expect.stringContaining("sort=price_desc"));
  });

  it("renders and removes the shared rating chip", () => {
    render(<ActiveFilterChips options={options} filters={{ ...filters, minRating: 4, page: 1 }} />);
    expect(screen.getByText("Từ 4 sao")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Bỏ lọc Từ 4 sao" })).toHaveAttribute("href", expect.not.stringContaining("minRating"));
  });
});
