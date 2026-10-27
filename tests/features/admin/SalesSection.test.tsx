import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { SalesSection } from "@/features/admin/dashboard/SalesSection";
import { json, mockFetch, priceText, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ search: "salesFrom=2026-10-01&salesTo=2026-10-02" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: vi.fn() }),
  usePathname: () => "/admin",
  useSearchParams: () => new URLSearchParams(nav.search),
}));
vi.mock("@/features/admin/dashboard/SalesChart", () => ({
  default: ({ data }: { data: unknown[] }) => <div data-testid="sales-chart">{data.length} ngày</div>,
}));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  fetchMock.mockResolvedValue(
    json(200, {
      data: {
        daily: [
          { date: "2026-10-01", revenue: 0, orders: 0 },
          { date: "2026-10-02", revenue: 1500000, orders: 2 },
        ],
        topProducts: [{ productId: 3, name: "Dell XPS", quantity: 2, revenue: 1500000 }],
        totals: { revenue: 1500000, orders: 2 },
      },
    }),
  );
});

describe("SalesSection", () => {
  it("asks for the URL range and shows totals, chart data and top products", async () => {
    renderAdmin(<SalesSection />);
    expect(await screen.findByText("Dell XPS")).toBeInTheDocument();
    expect(screen.getAllByText(priceText(1500000)).length).toBeGreaterThan(0);
    expect(await screen.findByTestId("sales-chart")).toHaveTextContent("2 ngày");
    const url = new URL((fetchMock.mock.calls[0][0] as Request).url);
    expect(url.pathname).toBe("/api/v1/admin/dashboard/sales");
    expect(url.searchParams.get("from")).toBe("2026-10-01");
    expect(url.searchParams.get("to")).toBe("2026-10-02");
  });
});
