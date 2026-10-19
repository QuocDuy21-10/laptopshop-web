import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { OrderDetail } from "@/features/admin/orders/OrderDetail";
import { json, mockFetch, renderAdmin } from "../../utils";

const order = (history: unknown[]) => ({
  id: 9, status: "SHIPPING", totalPrice: 100, paymentMethod: "COD", paymentStatus: "PAYMENT_UNPAID",
  receiverName: "B", receiverAddress: "HN", receiverPhone: "0900000000", createdAt: "2026-10-01T00:00:00Z",
  completedAt: null, items: [], user: { id: 2, username: "b@test.local", fullName: "B" }, history,
});

describe("OrderDetail history", () => {
  it("shows each transition with who made it", async () => {
    mockFetch().mockResolvedValue(
      json(200, {
        data: order([
          { fromStatus: null, toStatus: "PENDING", actor: { id: 2, name: "B" }, createdAt: "2026-10-01T00:00:00Z" },
          { fromStatus: "PENDING", toStatus: "SHIPPING", actor: { id: 1, name: "Admin" }, createdAt: "2026-10-01T02:00:00Z" },
        ]),
      }),
    );
    renderAdmin(<OrderDetail id={9} />);
    expect(await screen.findByText("Lịch sử trạng thái")).toBeInTheDocument();
    expect(screen.getByText(/Đặt hàng/)).toBeInTheDocument();
    expect(screen.getByText(/Admin/)).toBeInTheDocument();
  });

  it("explains orders created before history existed", async () => {
    mockFetch().mockResolvedValue(json(200, { data: order([]) }));
    renderAdmin(<OrderDetail id={9} />);
    expect(await screen.findByText("Đơn tạo trước khi bật lịch sử trạng thái.")).toBeInTheDocument();
  });
});
