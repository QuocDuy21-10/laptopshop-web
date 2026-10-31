import type { ReactNode } from "react";
import { toast } from "sonner";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { renderHook, screen, waitFor } from "@testing-library/react";

import { AuthPromptProvider } from "@/features/auth/AuthPrompt/AuthPromptProvider";
import { json, mockFetch, urlOf } from "../utils";
import { readPendingCartIntent } from "@/features/cart/intent";
import { useAddToCartAction } from "@/features/cart/useAddToCartAction";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    <AuthPromptProvider>{children}</AuthPromptProvider>
  </QueryClientProvider>
);

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  window.sessionStorage.clear();
  fetchMock = mockFetch();
  vi.clearAllMocks();
});

describe("useAddToCartAction", () => {
  it("asks anonymous users to sign in and keeps the intent", async () => {
    window.history.replaceState(null, "", "/products/3");
    fetchMock.mockResolvedValue(json(401, { error: { code: "UNAUTHENTICATED", message: "x" } }));
    const { result } = renderHook(() => useAddToCartAction(), { wrapper });
    await result.current.add(3, 1);
    expect(await screen.findByText("Đăng nhập để thêm vào giỏ hàng")).toBeInTheDocument();
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login?next=%2Fproducts%2F3");
    expect(readPendingCartIntent()).toMatchObject({ productId: 3, quantity: 1, goToCart: false });
  });

  it("keeps the query of the current page in the login link", async () => {
    window.history.replaceState(null, "", "/compare?ids=1,2");
    fetchMock.mockResolvedValue(json(401, { error: { code: "UNAUTHENTICATED", message: "x" } }));
    const { result } = renderHook(() => useAddToCartAction(), { wrapper });
    await result.current.add(1, 1);
    await screen.findByText("Đăng nhập để thêm vào giỏ hàng");
    expect(screen.getByRole("link", { name: "Đăng nhập" })).toHaveAttribute("href", "/login?next=%2Fcompare%3Fids%3D1%2C2");
  });

  it("toasts the stock error", async () => {
    fetchMock.mockImplementation(async (input) =>
      urlOf(input).endsWith("/cart/items") ? json(409, { error: { code: "OUT_OF_STOCK", message: "x" } }) : json(200),
    );
    const { result } = renderHook(() => useAddToCartAction(), { wrapper });
    await result.current.add(3, 9);
    expect(toast.error).toHaveBeenCalledWith("Sản phẩm không đủ số lượng trong kho.");
  });

  it("goes to the cart for 'Mua ngay'", async () => {
    fetchMock.mockResolvedValue(json(200, { data: { items: [], itemCount: 1, subtotal: 1 } }));
    const { result } = renderHook(() => useAddToCartAction(), { wrapper });
    await result.current.add(3, 1, { goToCart: true });
    await waitFor(() => expect(router.push).toHaveBeenCalledWith("/cart"));
  });
});
