import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CancelOrderDialog } from "@/features/orders/CancelOrderDialog/CancelOrderDialog";
import { OrderDetail } from "@/features/orders/OrderDetail/OrderDetail";
import { OrderStatusBadge, PaymentStatusBadge } from "@/features/orders/OrderBadges/OrderBadges";
import { json, lastRequest, mockFetch, renderWithQuery } from "../utils";

vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));
import { toast } from "sonner";

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  vi.clearAllMocks();
});

describe("order badges", () => {
  it("labels order and payment status separately", () => {
    render(
      <>
        <OrderStatusBadge status="SHIPPING" />
        <PaymentStatusBadge status="PAYMENT_UNPAID" />
      </>,
    );
    expect(screen.getByText("Đang giao")).toBeInTheDocument();
    expect(screen.getByText("Chưa thanh toán")).toBeInTheDocument();
  });
});

describe("CancelOrderDialog", () => {
  it("asks for confirmation, then cancels", async () => {
    fetchMock.mockResolvedValue(json(200, { data: { id: 50, status: "CANCELLED", items: [] } }));
    renderWithQuery(<CancelOrderDialog orderId={50} />);
    await userEvent.click(screen.getByRole("button", { name: "Huỷ đơn" }));
    expect(fetchMock).not.toHaveBeenCalled();
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận huỷ" }));
    await waitFor(() => expect(toast.success).toHaveBeenCalledWith("Đã huỷ đơn hàng"));
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("POST");
    expect(new URL(request.url).pathname).toBe("/api/v1/orders/me/50/cancel");
  });

  it("explains a refused cancellation", async () => {
    fetchMock.mockResolvedValue(json(409, { error: { code: "INVALID_STATUS_TRANSITION", message: "x" } }));
    renderWithQuery(<CancelOrderDialog orderId={50} />);
    await userEvent.click(screen.getByRole("button", { name: "Huỷ đơn" }));
    await userEvent.click(screen.getByRole("button", { name: "Xác nhận huỷ" }));
    await waitFor(() =>
      expect(toast.error).toHaveBeenCalledWith("Không thể thực hiện thao tác ở trạng thái hiện tại của đơn hàng."),
    );
  });
});

describe("OrderDetail review actions", () => {
  it("shows one review action per item only for completed paid orders", async () => {
    fetchMock.mockResolvedValue(json(200, { data: {
      id: 50, status: "COMPLETED", paymentStatus: "PAYMENT_SUCCESS", paymentMethod: "COD", totalPrice: 2000,
      receiverName: "R", receiverPhone: "0900000000", receiverAddress: "Addr", createdAt: "2026-10-21T03:00:00.000Z",
      items: [{ productId: 1, orderDetailId: 31, name: "A", image: null, price: 1000, quantity: 1, allowedRequestTypes: ["WARRANTY", "TECHNICAL_SUPPORT"] }, { productId: 2, orderDetailId: 32, name: "B", image: null, price: 1000, quantity: 1, allowedRequestTypes: ["TECHNICAL_SUPPORT"] }],
    } }));
    renderWithQuery(<OrderDetail id={50} placed={false} />);
    expect(await screen.findAllByRole("button", { name: "Đánh giá sản phẩm" })).toHaveLength(2);
    expect(screen.getByRole("link", { name: "Yêu cầu bảo hành" })).toHaveAttribute("href", "/account/after-sales/new?type=WARRANTY&orderDetailId=31");
  });

  it.each([
    ["PAYMENT_SUCCESS", "PAID", "Đơn hàng đã thanh toán"],
    ["PAYMENT_UNPAID", "VERIFYING", "đang được đối soát"],
  ] as const)("hides customer cancellation for %s/%s", async (paymentStatus, blockedReason, message) => {
    fetchMock.mockResolvedValue(json(200, { data: {
      id: 50, status: "PENDING", paymentStatus, paymentMethod: "BANK_TRANSFER", paymentCancellationBlockedReason: blockedReason, totalPrice: 2000,
      receiverName: "R", receiverPhone: "0900000000", receiverAddress: "Addr", createdAt: "2026-10-21T03:00:00.000Z",
      items: [],
    } }));
    renderWithQuery(<OrderDetail id={50} placed={false} />);
    expect(await screen.findByText(new RegExp(message))).toBeInTheDocument();
    expect(screen.queryByRole("button", { name: "Huỷ đơn" })).not.toBeInTheDocument();
  });
});
