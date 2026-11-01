import type { ReactNode } from "react";
import { afterEach, describe, expect, it, vi } from "vitest";
import { act, render, screen } from "@testing-library/react";

import type { CatalogProduct } from "@/lib/api/types";

const { refresh } = vi.hoisted(() => ({ refresh: vi.fn() }));
vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh }) }));
vi.mock("@/features/products/ProductCard/ProductCard", () => ({
  ProductCard: ({ product }: { product: CatalogProduct }) => <span>{product.name}</span>,
}));
vi.mock("@/features/wishlist/WishlistStatusProvider/WishlistStatusProvider", () => ({
  WishlistStatusProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));

const { FlashSaleSection } = await import("@/features/home/FlashSaleSection/FlashSaleSection");
const product = (endsAt: string) =>
  ({
    id: 1,
    name: "Laptop",
    promotion: { kind: "FLASH_SALE", endsAt },
  }) as unknown as CatalogProduct;

afterEach(() => vi.useRealTimers());

describe("homepage flash sale lifecycle", () => {
  it("reanchors the clock and refreshes again when the next sale expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date("2026-11-01T00:00:00Z"));
    refresh.mockClear();
    const { rerender } = render(
      <FlashSaleSection
        products={[product("2026-11-01T00:00:05Z")]}
        renderedAt="2026-11-01T00:00:00Z"
        options={null}
      />,
    );
    expect(screen.getByText("Còn 00:00:05")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(6_000));
    expect(refresh).toHaveBeenCalledTimes(1);
    rerender(
      <FlashSaleSection
        products={[product("2026-11-01T00:00:20Z")]}
        renderedAt="2026-11-01T00:00:06Z"
        options={null}
      />,
    );
    expect(screen.getByText("Còn 00:00:14")).toBeInTheDocument();
    act(() => vi.advanceTimersByTime(14_000));
    expect(screen.getByText("Đã kết thúc")).toBeInTheDocument();
    expect(refresh).toHaveBeenCalledTimes(2);
    act(() => vi.advanceTimersByTime(5_000));
    expect(refresh).toHaveBeenCalledTimes(2);
  });
});
