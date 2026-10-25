import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { CartSummary } from "@/features/cart/CartSummary/CartSummary";
import type { Cart } from "@/lib/api/types";
import { renderWithQuery } from "../utils";

const cart = {
  itemCount: 1,
  subtotal: 60_000_000,
  productDiscount: 1_000_000,
  totalAfterProductDiscount: 59_000_000,
  items: [],
} as Cart;

describe("CartSummary", () => {
  it("renders the explicit server pricing instead of cart defaults", () => {
    renderWithQuery(
      <CartSummary
        cart={cart}
        pricing={{ productDiscount: 3_000_000, couponDiscount: 2_000_000, total: 55_000_000 }}
      />,
    );

    expect(screen.getByText("Ưu đãi sản phẩm").parentElement).toHaveTextContent("3.000.000 ₫");
    expect(screen.getByText("Giảm giá mã ưu đãi").parentElement).toHaveTextContent("2.000.000 ₫");
    expect(screen.getByText("Tổng cộng").parentElement).toHaveTextContent("55.000.000 ₫");
  });
});
