import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { MovementList } from "@/features/admin/inventory/MovementList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "productId=1&reason=ORDER" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/inventory",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  fetchMock.mockResolvedValue(
    json(200, {
      data: [
        { id: 3, productId: 1, productName: "Dell XPS", delta: -2, reason: "ORDER", orderId: 50, actor: { id: 2, name: "B" }, note: null, createdAt: "2026-10-19T03:00:00Z" },
      ],
      meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 },
    }),
  );
});

describe("MovementList", () => {
  it("sends the URL filters and links the movement to its order", async () => {
    renderAdmin(<MovementList />);
    expect(await screen.findByText("Dell XPS")).toBeInTheDocument();
    expect(screen.getByText("-2")).toBeInTheDocument();
    expect(screen.getAllByText("Bán hàng").length).toBeGreaterThan(0);
    expect(screen.getByRole("link", { name: "#50" })).toHaveAttribute("href", "/admin/orders/50");
    const url = new URL((fetchMock.mock.calls[0][0] as Request).url);
    expect(url.searchParams.get("productId")).toBe("1");
    expect(url.searchParams.get("reason")).toBe("ORDER");
  });
});
