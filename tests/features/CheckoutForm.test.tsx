import { act, screen, waitFor } from "@testing-library/react";
import { onlineManager, QueryClientProvider } from "@tanstack/react-query";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { CheckoutForm } from "@/features/checkout/CheckoutForm/CheckoutForm";
import { json, mockFetch, renderWithQuery, urlOf } from "../utils";

const router = vi.hoisted(() => ({ push: vi.fn(), replace: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));

const defaults = { receiverName: "Nguyễn A", receiverPhone: "0900000000", receiverAddress: "1 Lê Lợi, Q1" };
const order = { id: 50, status: "PENDING", totalPrice: 200, items: [] };
const checkoutProps = {
  pricingFingerprint: "pricing-1",
  pricingReady: true,
  onPricingConflict: vi.fn().mockResolvedValue(undefined),
};

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  vi.clearAllMocks();
  window.sessionStorage.clear();
  checkoutProps.onPricingConflict.mockReset();
  checkoutProps.onPricingConflict.mockResolvedValue(undefined);
});

const orderCalls = () => fetchMock.mock.calls.map(([i]) => i as Request).filter((r) => urlOf(r).endsWith("/api/v1/orders"));
const submit = () => userEvent.click(screen.getByRole("button", { name: "Xác nhận đặt hàng" }));

describe("CheckoutForm", () => {
  it("reuses the idempotency key after a network failure and rotates it after success", async () => {
    let attempt = 0;
    fetchMock.mockImplementation(async (input) => {
      if (!urlOf(input).endsWith("/api/v1/orders")) return json(200, { data: {} });
      attempt += 1;
      if (attempt === 1) throw new TypeError("Failed to fetch");
      return json(201, { data: order });
    });
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);

    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể kết nối máy chủ");
    await submit();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account/orders/50?placed=1"));
    await submit();
    await waitFor(() => expect(orderCalls()).toHaveLength(3));

    const [first, second, third] = orderCalls().map((r) => r.headers.get("Idempotency-Key"));
    expect(first).toBeTruthy();
    expect(second).toBe(first);
    expect(third).not.toBe(first);
  });

  it("recovers a persisted checkout attempt before submitting a new order", async () => {
    window.sessionStorage.setItem("laptopshop.checkout.idempotency-key", "recover-key");
    fetchMock.mockImplementation(async (input) => {
      if (urlOf(input).endsWith("/checkout-attempt")) return json(200, { data: { ...order, paymentMethod: "BANK_TRANSFER" } });
      return json(201, { data: order });
    });
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account/orders/50/payment"));
    expect(orderCalls()).toHaveLength(0);
  });

  it("links back to the cart when a product is no longer sold", async () => {
    fetchMock.mockResolvedValue(
      json(409, { error: { code: "PRODUCT_UNAVAILABLE", message: "x", details: { productId: 3 } } }),
    );
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
    await submit();
    expect(await screen.findByRole("alert")).toHaveTextContent("Sản phẩm đã ngừng kinh doanh.");
    expect(screen.getByRole("link", { name: "Quay lại giỏ hàng" })).toHaveAttribute("href", "/cart");
  });

  it("keeps entered values and links back to the cart when stock runs out", async () => {
    fetchMock.mockResolvedValue(json(409, { error: { code: "OUT_OF_STOCK", message: "x", details: { productId: 3 } } }));
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
    await submit();
    const alert = await screen.findByRole("alert");
    expect(alert).toHaveTextContent("Sản phẩm không đủ số lượng trong kho.");
    expect(screen.getByRole("link", { name: "Quay lại giỏ hàng" })).toHaveAttribute("href", "/cart");
    expect(screen.getByLabelText(/Địa chỉ nhận hàng/)).toHaveValue("1 Lê Lợi, Q1");
  });

  it("sends the cart page when the cart is already empty", async () => {
    fetchMock.mockResolvedValue(json(409, { error: { code: "CART_EMPTY", message: "x" } }));
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
    await submit();
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/cart"));
  });

  it("waits while offline and sends the order once the connection is back", async () => {
    fetchMock.mockResolvedValue(json(201, { data: order }));
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
    act(() => onlineManager.setOnline(false));
    try {
      await submit();
      expect(await screen.findByText(/Mất kết nối mạng/)).toBeInTheDocument();
      expect(orderCalls()).toHaveLength(0);
    } finally {
      act(() => onlineManager.setOnline(true));
    }
    await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account/orders/50?placed=1"));
    expect(orderCalls()).toHaveLength(1);
  });

  it("validates the phone number locally", async () => {
    renderWithQuery(<CheckoutForm defaults={{ ...defaults, receiverPhone: "12" }} {...checkoutProps} />);
    await submit();
    expect(await screen.findByText("Số điện thoại không hợp lệ")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it.each(["PROMOTION_CHANGED", "FLASH_SALE_QUOTA_EXCEEDED", "FLASH_SALE_USER_LIMIT"])(
    "retires the failed attempt and requires a new confirmation after %s",
    async (code) => {
      let attempt = 0;
      fetchMock.mockImplementation(async (input) => {
        if (!urlOf(input).endsWith("/api/v1/orders")) return json(200, { data: {} });
        attempt += 1;
        return attempt === 1
          ? json(409, { error: { code, message: "pricing changed" } })
          : json(201, { data: order });
      });
      const { rerender, client } = renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);
      const user = userEvent.setup();

      await user.clear(screen.getByLabelText(/Địa chỉ nhận hàng/));
      await user.type(screen.getByLabelText(/Địa chỉ nhận hàng/), "2 Nguyễn Huệ, Q1");
      await submit();

      expect(await screen.findByRole("alert")).toHaveTextContent("Giá hoặc suất ưu đãi đã thay đổi");
      expect(checkoutProps.onPricingConflict).toHaveBeenCalledTimes(1);
      expect(orderCalls()).toHaveLength(1);
      const firstKey = orderCalls()[0].headers.get("Idempotency-Key");

      rerender(
        <QueryClientProvider client={client}>
          <CheckoutForm defaults={defaults} {...checkoutProps} pricingFingerprint="pricing-2" />
        </QueryClientProvider>,
      );
      await submit();

      await waitFor(() => expect(router.replace).toHaveBeenCalledWith("/account/orders/50?placed=1"));
      const [first, second] = orderCalls();
      expect(second.headers.get("Idempotency-Key")).not.toBe(firstKey);
      expect(await second.json()).toMatchObject({
        receiverAddress: "2 Nguyễn Huệ, Q1",
        pricingFingerprint: "pricing-2",
      });
      expect(await first.json()).toMatchObject({ pricingFingerprint: "pricing-1" });
    },
  );

  it("blocks submission while a persisted unknown attempt is recovering", async () => {
    window.sessionStorage.setItem("laptopshop.checkout.idempotency-key", "recover-key");
    let completeRecovery: ((response: Response) => void) | undefined;
    fetchMock.mockImplementation(
      (input) =>
        new Promise<Response>((resolve) => {
          if (urlOf(input).endsWith("/checkout-attempt")) completeRecovery = resolve;
        }),
    );
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);

    expect(screen.getByRole("button", { name: "Xác nhận đặt hàng" })).toBeDisabled();
    completeRecovery?.(json(404, { error: { code: "CHECKOUT_ATTEMPT_NOT_FOUND", message: "missing" } }));

    await waitFor(() => expect(screen.getByRole("button", { name: "Xác nhận đặt hàng" })).toBeEnabled());
    expect(orderCalls()).toHaveLength(0);
  });

  it("keeps submission locked and offers recovery retry after a transient attempt lookup failure", async () => {
    window.sessionStorage.setItem("laptopshop.checkout.idempotency-key", "recover-key");
    fetchMock.mockRejectedValue(new TypeError("Failed to fetch"));
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} />);

    expect(await screen.findByRole("alert")).toHaveTextContent("Không thể xác minh trạng thái đơn hàng trước đó");
    expect(screen.getByRole("button", { name: "Xác nhận đặt hàng" })).toBeDisabled();
    expect(screen.getByRole("button", { name: "Thử lại" })).toBeEnabled();
    expect(orderCalls()).toHaveLength(0);
  });

  it("does not submit or quote without a pricing fingerprint", async () => {
    renderWithQuery(<CheckoutForm defaults={defaults} {...checkoutProps} pricingFingerprint="" pricingReady={false} />);

    expect(screen.getByRole("button", { name: "Xác nhận đặt hàng" })).toBeDisabled();
    expect(fetchMock).not.toHaveBeenCalled();
  });
});
