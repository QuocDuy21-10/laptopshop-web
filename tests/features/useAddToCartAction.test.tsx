import { renderHook, waitFor } from "@testing-library/react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import type { ReactNode } from "react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { toast } from "sonner";
import { useAddToCartAction } from "@/features/cart/useAddToCartAction";
import { json, mockFetch, urlOf } from "../utils";

const router = vi.hoisted(() => ({ push: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => router, usePathname: () => "/products/3" }));
vi.mock("sonner", () => ({ toast: { success: vi.fn(), error: vi.fn() } }));

const wrapper = ({ children }: { children: ReactNode }) => (
  <QueryClientProvider client={new QueryClient({ defaultOptions: { mutations: { retry: false } } })}>
    {children}
  </QueryClientProvider>
);

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  vi.clearAllMocks();
});

describe("useAddToCartAction", () => {
  it("sends anonymous users to login and back", async () => {
    fetchMock.mockResolvedValue(json(401, { error: { code: "UNAUTHENTICATED", message: "x" } }));
    const { result } = renderHook(() => useAddToCartAction(), { wrapper });
    await result.current.add(3, 1);
    expect(router.push).toHaveBeenCalledWith("/login?next=%2Fproducts%2F3");
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
