import { render, screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CancelOrderDialog } from "@/features/orders/CancelOrderDialog/CancelOrderDialog";
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
