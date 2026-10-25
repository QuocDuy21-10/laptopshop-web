import { QueryClientProvider } from "@tanstack/react-query";
import { screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutView } from "@/features/checkout/CheckoutView/CheckoutView";
import { renderWithQuery } from "../utils";

const router = vi.hoisted(() => ({ replace: vi.fn() }));
const state = vi.hoisted(() => ({
  cart: {
    data: {
      itemCount: 1,
      subtotal: 60_000_000,
      productDiscount: 0,
      totalAfterProductDiscount: 60_000_000,
      items: [
        {
          id: 1,
          quantity: 1,
          lineTotal: 60_000_000,
          product: { id: 7, name: "Laptop ưu đãi" },
        },
      ],
    },
    isError: false,
    isPending: false,
    error: null,
  },
  me: { data: { fullName: "Nguyễn A", phone: "0900000000", address: "1 Lê Lợi" }, isError: false, isPending: false, error: null },
  paymentMethods: { data: [{ code: "COD", enabled: true }] },
  quote: {
    data: {
      subtotal: 60_000_000,
      productDiscount: 3_000_000,
      couponEligibleSubtotal: 57_000_000,
      couponDiscount: 2_000_000,
      total: 55_000_000,
      lines: [{ productId: 7, netLineTotal: 55_000_000, promotionFallback: null }],
      coupon: null,
      calculatedAt: "2026-10-25T00:00:00.000Z",
      pricingFingerprint: "pricing-1",
    },
    isError: false,
    isPending: false,
    isFetching: false,
    error: null,
    refetch: vi.fn().mockResolvedValue({}),
  },
}));

vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("@/features/cart/hooks", () => ({ useCart: () => state.cart }));
vi.mock("@/features/account/useMe", () => ({ useMe: () => state.me }));
vi.mock("@/features/payments/hooks", () => ({ usePaymentMethods: () => state.paymentMethods }));
vi.mock("@/features/checkout/useCheckoutQuote", () => ({ useCheckoutQuote: () => state.quote }));

describe("CheckoutView", () => {
  beforeEach(() => {
    state.quote.data = {
      subtotal: 60_000_000,
      productDiscount: 3_000_000,
      couponEligibleSubtotal: 57_000_000,
      couponDiscount: 2_000_000,
      total: 55_000_000,
      lines: [{ productId: 7, netLineTotal: 55_000_000, promotionFallback: null }],
      coupon: null,
      calculatedAt: "2026-10-25T00:00:00.000Z",
      pricingFingerprint: "pricing-1",
    };
    state.quote.isError = false;
    state.quote.isPending = false;
    state.quote.isFetching = false;
  });

  it("renders quote line totals and final pricing instead of stale cart totals", () => {
    renderWithQuery(<CheckoutView />);

    expect(screen.getByText("Laptop ưu đãi × 1").parentElement).toHaveTextContent("55.000.000 ₫");
    expect(screen.getByText("Tổng cộng").parentElement).toHaveTextContent("55.000.000 ₫");
  });

  it("does not fall back to cart totals when the quote is unavailable or invalid", () => {
    state.quote.data = undefined as never;
    state.quote.isError = true;
    state.quote.error = new Error("quote unavailable") as never;
    renderWithQuery(<CheckoutView />);

    expect(screen.getByRole("status")).toHaveTextContent("Không thể cập nhật giá và ưu đãi");
    expect(screen.queryByText("60.000.000 ₫")).not.toBeInTheDocument();
    expect(screen.queryByText("Tổng cộng")).not.toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Xác nhận đặt hàng" })).toBeDisabled();
  });

  it("redirects an empty cart to the cart page but not a cart emptied by the order itself", () => {
    const items = state.cart.data.items;
    state.cart.data.items = [];
    const { unmount } = renderWithQuery(<CheckoutView />);
    expect(router.replace).toHaveBeenCalledWith("/cart");
    unmount();
    router.replace.mockClear();

    state.cart.data.items = items;
    const { rerender, client } = renderWithQuery(<CheckoutView />);
    state.cart.data = { ...state.cart.data, items: [] };
    rerender(<QueryClientProvider client={client}><CheckoutView /></QueryClientProvider>);
    expect(router.replace).not.toHaveBeenCalled();
    state.cart.data.items = items;
  });
});
