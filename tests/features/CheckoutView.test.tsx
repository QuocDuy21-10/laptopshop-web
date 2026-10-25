import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
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
  it("renders quote line totals and final pricing instead of stale cart totals", () => {
    renderWithQuery(<CheckoutView />);

    expect(screen.getByText("Laptop ưu đãi × 1").parentElement).toHaveTextContent("55.000.000 ₫");
    expect(screen.getByText("Tổng cộng").parentElement).toHaveTextContent("55.000.000 ₫");
  });
});
