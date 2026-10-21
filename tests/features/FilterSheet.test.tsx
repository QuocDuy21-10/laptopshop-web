import { fireEvent, render, screen } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { FilterSheet } from "@/features/products/FilterSheet/FilterSheet";
import type { ProductFilters } from "@/features/products/search-params";

const router = vi.hoisted(() => ({ push: vi.fn() }));
const getFacets = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/lib/api/client", () => ({ api: { GET: getFacets } }));
vi.mock("@/components/ui/Dialog/Dialog", () => ({
  Dialog: ({ trigger, children, open, onOpenChange }: { trigger: React.ReactNode; children: React.ReactNode; open?: boolean; onOpenChange?: (open: boolean) => void }) => (
    <div>
      <div onClick={() => onOpenChange?.(!open)}>{trigger}</div>
      {open ? <button aria-label="Đóng" onClick={() => onOpenChange?.(false)}>Đóng</button> : null}
      {open ? children : null}
    </div>
  ),
}));

const options = {
  factoryOptions: [],
  targetOptions: [],
  facetDefinitions: [
    { key: "cpuBrand", name: "CPU", mode: "MULTI" as const, kind: "categorical" as const, options: [{ value: "INTEL", name: "Intel" }, { value: "AMD", name: "AMD" }] },
    { key: "minRating", name: "Đánh giá tối thiểu", mode: "SINGLE_MIN" as const, kind: "bucket" as const, options: [{ value: "4", name: "Từ 4 sao" }, { value: "3", name: "Từ 3 sao" }] },
  ],
};
const filters: ProductFilters = {
  factory: [], target: [], price: [], cpuBrand: [], gpuBrand: [], gpuType: [], ramGb: [], storageGb: [],
  screenSize: [], resolutionTier: [], panelType: [], page: 1,
};
const result = (total: number) => ({ data: { data: { total, groups: { cpuBrand: [{ value: "AMD", count: total }] } } }, error: undefined, response: new Response(null, { status: 200 }) });
const renderSheet = (initial?: ReturnType<typeof result>) => {
  if (initial) getFacets.mockResolvedValue(initial);
  const client = new QueryClient({ defaultOptions: { queries: { retry: false } } });
  return render(<QueryClientProvider client={client}><FilterSheet options={options} filters={filters} facets={initial?.data.data} /></QueryClientProvider>);
};

beforeEach(() => {
  vi.useFakeTimers();
  router.push.mockClear();
  getFacets.mockReset();
});

describe("FilterSheet", () => {
  it("keeps draft local, debounces preview and applies once", async () => {
    renderSheet(result(2));
    fireEvent.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /AMD/ }));
    expect(router.push).not.toHaveBeenCalled();
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    expect(getFacets).toHaveBeenCalledTimes(1);
    fireEvent.click(screen.getByRole("button", { name: /Xem 2 sản phẩm/ }));
    expect(router.push).toHaveBeenCalledTimes(1);
    expect(router.push.mock.calls[0][0]).toContain("cpuBrand=AMD");
  });

  it("discards draft on close and disables apply for a successful zero preview", async () => {
    renderSheet(result(0));
    fireEvent.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /AMD/ }));
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    expect(screen.getByRole("button", { name: /Xem 0 sản phẩm/ })).toBeDisabled();
    fireEvent.click(screen.getByRole("button", { name: "Đóng" }));
    fireEvent.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    expect(screen.getByRole("checkbox", { name: /AMD/ })).not.toBeChecked();
  });

  it("keeps Apply enabled when preview fails", async () => {
    renderSheet();
    getFacets.mockRejectedValue(new Error("preview failed"));
    fireEvent.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /AMD/ }));
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    expect(screen.getByText(/Không thể cập nhật số lượng/)).toBeInTheDocument();
    expect(screen.getByRole("button", { name: /Áp dụng/ })).toBeEnabled();
  });

  it("does not disable Apply from a superseded preview response", async () => {
    let resolveFirst!: (value: ReturnType<typeof result>) => void;
    const first = new Promise<ReturnType<typeof result>>((resolve) => { resolveFirst = resolve; });
    getFacets.mockReturnValueOnce(first).mockResolvedValue(result(3));
    renderSheet();
    fireEvent.click(screen.getByRole("button", { name: /Bộ lọc/ }));
    fireEvent.click(screen.getByRole("checkbox", { name: /AMD/ }));
    vi.advanceTimersByTime(300);
    await vi.runOnlyPendingTimersAsync();
    fireEvent.click(screen.getByRole("checkbox", { name: /AMD/ }));
    vi.advanceTimersByTime(300);
    await vi.runAllTimersAsync();
    resolveFirst(result(0));
    await vi.runAllTimersAsync();
    expect(screen.getByRole("button", { name: /Xem 3 sản phẩm/ })).toBeEnabled();
  });
});
