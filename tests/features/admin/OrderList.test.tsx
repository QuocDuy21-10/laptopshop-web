import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { OrderList } from "@/features/admin/orders/OrderList";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/orders",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const order = {
  id: 50, status: "PENDING", totalPrice: 100, paymentMethod: "COD", paymentStatus: "PAYMENT_UNPAID",
  receiverName: "Nguyễn An", receiverAddress: "HN", receiverPhone: "0900000000", createdAt: "2026-10-01T00:00:00Z",
  items: [], user: { id: 2, username: "b@test.local", fullName: "B" },
};

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.search = "";
  nav.push.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockResolvedValue(json(200, { data: [order], meta: { page: 1, pageSize: 10, total: 1, totalPages: 1 } }));
});

const ordersUrl = () =>
  fetchMock.mock.calls.map(([i]) => new URL((i as Request).url)).find((u) => u.pathname === "/api/v1/admin/orders");

describe("OrderList", () => {
  it("puts the search in the URL", async () => {
    renderAdmin(<OrderList />);
    await userEvent.type(screen.getByPlaceholderText("Mã đơn, tên hoặc SĐT người nhận"), "50{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/admin/orders?q=50");
  });

  it("sends the URL search and date range to the API", async () => {
    nav.search = "q=An&from=2026-10-01&to=2026-10-19";
    renderAdmin(<OrderList />);
    expect(await screen.findByText("#50")).toBeInTheDocument();
    const url = ordersUrl();
    expect(url?.searchParams.get("q")).toBe("An");
    expect(url?.searchParams.get("from")).toBe("2026-10-01");
    expect(url?.searchParams.get("to")).toBe("2026-10-19");
  });
});
