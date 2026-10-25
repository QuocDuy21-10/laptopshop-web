import { act, screen, render } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { PaymentScreen } from "@/features/payments/PaymentScreen";
import { renderWithQuery } from "../../utils";

const usePaymentStatus = vi.hoisted(() => vi.fn());
vi.mock("@/features/payments/hooks", () => ({ usePaymentStatus }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const payment = (over: Record<string, unknown> = {}) => ({
  id: "pay-1",
  orderId: 50,
  provider: "fake",
  method: "BANK_TRANSFER",
  status: "PENDING",
  amount: 1000,
  currency: "VND",
  expiresAt: "2026-10-24T10:01:00.000Z",
  cancelAfter: "2026-10-24T10:03:00.000Z",
  paidAt: null,
  serverTime: "2026-10-24T10:00:00.000Z",
  instructions: {
    qrImageUrl: "https://vietqr.app/img?x=1",
    bankCode: "VCB",
    accountNumber: "0123456789",
    accountName: "LAPTOP SHOP",
    transferCode: "LSABC12345678",
  },
  ...over,
});

beforeEach(() => {
  vi.useFakeTimers();
  vi.setSystemTime(new Date("2026-10-24T10:00:00.000Z"));
  usePaymentStatus.mockReturnValue({ data: payment(), isPending: false, isError: false, refetch: vi.fn() });
});

describe("PaymentScreen", () => {
  it("keeps the server offset stable while the local countdown advances", () => {
    renderWithQuery(<PaymentScreen orderId={50} />);
    expect(screen.getByText("Thời gian còn lại: 01:00")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(2_000));
    expect(screen.getByText("Thời gian còn lại: 00:58")).toBeInTheDocument();
  });

  it("shows verification copy and no QR after the payment enters verifying", () => {
    usePaymentStatus.mockReturnValue({
      data: payment({ status: "VERIFYING", expiresAt: "2026-10-24T09:45:00.000Z", instructions: null }),
      isPending: false,
      isError: false,
      refetch: vi.fn(),
    });
    render(<PaymentScreen orderId={50} />);
    expect(screen.getByText("Đang xác minh thanh toán")).toBeInTheDocument();
    expect(screen.queryByRole("img", { name: /Mã QR/ })).not.toBeInTheDocument();
    expect(screen.getByText(/không thanh toán thêm lần nữa/)).toBeInTheDocument();
  });
});
