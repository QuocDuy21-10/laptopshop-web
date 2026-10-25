import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it } from "vitest";
import { CartLine } from "@/features/cart/CartLine/CartLine";
import type { CartItem } from "@/lib/api/types";
import { json, lastRequest, mockFetch, renderWithQuery } from "../utils";

const line: CartItem = {
  id: 7,
  quantity: 2,
  listLineTotal: 200,
  productDiscountAmount: 0,
  lineTotal: 200,
  promotionFallback: null,
  product: {
    id: 3,
    name: "Dell Inspiron 15",
    price: 100,
    image: null,
    detailDesc: null,
    shortDesc: null,
    quantity: 5,
    sold: 0,
    factory: "DELL",
    target: "GAMING",
    isActive: true, cpu: null, gpu: null, ramGb: null, storageGb: null, screenSizeInch: null, screenResolution: null, refreshRateHz: null, batteryWh: null, weightGrams: null, warrantyMonths: null,
  },
};
const cart = { items: [line], itemCount: 2, subtotal: 200 };

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
});

describe("CartLine", () => {
  it("updates the quantity through the API", async () => {
    fetchMock.mockResolvedValue(json(200, { data: cart }));
    renderWithQuery(<CartLine line={line} />);
    await userEvent.click(screen.getByRole("button", { name: "Tăng" }));
    await waitFor(() => expect(fetchMock).toHaveBeenCalled());
    const request = lastRequest(fetchMock);
    expect(request.method).toBe("PATCH");
    expect(new URL(request.url).pathname).toBe("/api/v1/cart/items/7");
    expect(await request.json()).toEqual({ quantity: 3 });
  });

  it("shows a stock error on the line", async () => {
    fetchMock.mockResolvedValue(json(409, { error: { code: "OUT_OF_STOCK", message: "x", details: { productId: 3 } } }));
    renderWithQuery(<CartLine line={line} />);
    await userEvent.click(screen.getByRole("button", { name: "Tăng" }));
    expect(await screen.findByText("Sản phẩm không đủ số lượng trong kho.")).toBeInTheDocument();
  });

  it("marks a product that is no longer sold and locks its quantity", () => {
    renderWithQuery(<CartLine line={{ ...line, product: { ...line.product, isActive: false } }} />);
    expect(screen.getByText("Ngừng kinh doanh")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Tăng" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Xoá Dell Inspiron 15 khỏi giỏ" })).toBeEnabled();
  });

  it("removes the line", async () => {
    fetchMock.mockResolvedValue(new Response(null, { status: 204 }));
    renderWithQuery(<CartLine line={line} />);
    await userEvent.click(screen.getByRole("button", { name: "Xoá Dell Inspiron 15 khỏi giỏ" }));
    await waitFor(() => expect(lastRequest(fetchMock).method).toBe("DELETE"));
  });
});
