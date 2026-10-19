import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { OrderStatusActions } from "@/features/admin/orders/OrderStatusActions";
import { NEXT_STATUS } from "@/features/admin/orders/transitions";
import type { AdminOrder } from "@/lib/api/types";
import { json, lastRequest, mockFetch, renderAdmin } from "../../utils";

const order = (status: AdminOrder["status"]): AdminOrder => ({
  id: 9, status, totalPrice: 100, paymentMethod: "COD", paymentStatus: "PAYMENT_UNPAID", receiverName: "B",
  receiverAddress: "HN", receiverPhone: "0900000000", createdAt: "2026-10-01T00:00:00Z", completedAt: null, items: [],
  user: { id: 2, username: "b@test.local", fullName: "B" },
});

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
});

describe("NEXT_STATUS", () => {
  it("mirrors the API transition map", () => {
    const targets = Object.fromEntries(Object.entries(NEXT_STATUS).map(([from, list]) => [from, list.map((a) => a.to)]));
    expect(targets).toEqual({
      PENDING: ["SHIPPING", "CANCELLED"],
      SHIPPING: ["COMPLETED", "CANCELLED"],
      COMPLETED: [],
      CANCELLED: [],
    });
  });
});

describe("OrderStatusActions", () => {
  it("offers ship and cancel for a pending order, and ships it", async () => {
    fetchMock.mockResolvedValue(json(200, { data: order("SHIPPING") }));
    renderAdmin(<OrderStatusActions order={order("PENDING")} />);
    expect(screen.getByRole("button", { name: "Huỷ đơn" })).toBeInTheDocument();
    await userEvent.click(screen.getByRole("button", { name: "Giao hàng" }));
    expect(await screen.findByText('Đã chuyển sang "Đang giao"')).toBeInTheDocument();
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("PATCH");
    expect(new URL(request.url).pathname).toBe("/api/v1/admin/orders/9/status");
    expect(await request.json()).toEqual({ status: "SHIPPING" });
  });

  it("asks before cancelling", async () => {
    fetchMock.mockResolvedValue(json(200, { data: order("CANCELLED") }));
    renderAdmin(<OrderStatusActions order={order("SHIPPING")} />);
    await userEvent.click(screen.getByRole("button", { name: "Huỷ đơn" }));
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.click(await screen.findByRole("button", { name: "Xác nhận huỷ" }));
    expect(await screen.findByText('Đã chuyển sang "Đã huỷ"')).toBeInTheDocument();
  });

  it("explains a refused transition", async () => {
    fetchMock.mockResolvedValue(json(409, { error: { code: "INVALID_STATUS_TRANSITION", message: "x" } }));
    renderAdmin(<OrderStatusActions order={order("PENDING")} />);
    await userEvent.click(screen.getByRole("button", { name: "Giao hàng" }));
    expect(
      await screen.findByText("Không thể thực hiện thao tác ở trạng thái hiện tại của đơn hàng."),
    ).toBeInTheDocument();
  });

  it("renders nothing for finished orders", () => {
    const { container } = renderAdmin(<OrderStatusActions order={order("COMPLETED")} />);
    expect(container.querySelectorAll("button")).toHaveLength(0);
  });
});
