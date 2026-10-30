import { beforeEach, describe, expect, it } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { json, mockFetch, priceText, renderWithQuery, urlOf } from "../utils";
import { CartLink } from "@/components/layout/CartLink/CartLink";

const me = { id: 1, username: "a", fullName: "A", role: "USER", cartItemCount: 5 };
const line = (id: number) => ({
  id,
  quantity: 2,
  product: { id, name: `Laptop ${id}`, price: 20_000_000, salePrice: 18_000_000, image: null, isActive: true, quantity: 9 },
});
const cart = (n: number) => ({
  data: { items: Array.from({ length: n }, (_, i) => line(i + 1)), itemCount: n * 2, subtotal: n * 40_000_000, totalAfterProductDiscount: n * 36_000_000 },
});

function setup(items: number, desktop = true) {
  window.matchMedia = ((query: string) => ({ matches: desktop, media: query, addEventListener() {}, removeEventListener() {} })) as unknown as typeof window.matchMedia;
  const fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) =>
    urlOf(input).includes("/cart") ? json(200, cart(items)) : json(200, { data: me }),
  );
  renderWithQuery(<CartLink />);
  return fetchMock;
}

const trigger = () => screen.findByRole("link", { name: /Giỏ hàng, 5 sản phẩm/ });

describe("MiniCart", () => {
  beforeEach(() => {
    document.cookie = "logged_in=1; Path=/";
  });

  it("opens a preview of at most four lines with the total", async () => {
    setup(6);
    fireEvent.click(await trigger());

    expect(await screen.findByText("Laptop 4")).toBeInTheDocument();
    expect(screen.queryByText("Laptop 5")).not.toBeInTheDocument();
    expect(screen.getByText("và 2 sản phẩm khác")).toBeInTheDocument();
    expect(screen.getByText(priceText(6 * 36_000_000))).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Thanh toán" })).toHaveAttribute("href", "/checkout");
  });

  it("shows an empty state", async () => {
    setup(0);
    fireEvent.click(await trigger());
    expect(await screen.findByText("Giỏ hàng của bạn đang trống.")).toBeInTheDocument();
  });

  it("does not open on narrow screens, so the link navigates to /cart", async () => {
    const fetchMock = setup(2, false);
    fireEvent.click(await trigger());

    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    expect(screen.queryByText("Laptop 1")).not.toBeInTheDocument();
    expect(await trigger()).toHaveAttribute("href", "/cart");
  });
});
