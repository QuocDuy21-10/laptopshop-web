import { render, screen } from "@testing-library/react";
import type { ReactNode } from "react";
import { describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/api/types";

vi.mock("next/navigation", () => ({ useRouter: () => ({ refresh: vi.fn() }) }));
vi.mock("@/features/products/ProductCard/ProductCard", () => ({
  ProductCard: ({ product }: { product: CatalogProduct }) => <span>{product.name}</span>,
}));
vi.mock("@/features/wishlist/WishlistStatusProvider/WishlistStatusProvider", () => ({
  WishlistStatusProvider: ({ children }: { children: ReactNode }) => <>{children}</>,
}));
vi.mock("@/features/promotions/FlashSaleCountdown/FlashSaleCountdown", () => ({
  FlashSaleCountdown: (props: { endsAt: string; serverTime: string }) => (
    <span data-testid="countdown" data-ends={props.endsAt} data-server={props.serverTime} />
  ),
}));

const { FlashSaleSection } = await import("@/features/home/FlashSaleSection/FlashSaleSection");

const product = (id: number, endsAt: string | null) =>
  ({
    id,
    name: `Máy ${id}`,
    promotion: endsAt ? { id: 1, name: "FS", endsAt, kind: "FLASH_SALE", eligibility: "POTENTIAL" } : null,
  }) as unknown as CatalogProduct;

describe("FlashSaleSection", () => {
  it("renders nothing when there is no flash sale", () => {
    const { container } = render(<FlashSaleSection products={[]} renderedAt="2026-11-01T00:00:00.000Z" options={null} />);
    expect(container).toBeEmptyDOMElement();
  });

  it("lists the products and counts down to the earliest end", () => {
    render(
      <FlashSaleSection
        products={[product(1, "2026-11-03T00:00:00.000Z"), product(2, "2026-11-02T00:00:00.000Z"), product(3, null)]}
        renderedAt="2026-11-01T00:00:00.000Z"
        options={null}
      />,
    );
    expect(screen.getByRole("heading", { level: 2, name: "Flash Sale" })).toBeInTheDocument();
    expect(screen.getByText("Máy 1")).toBeInTheDocument();
    expect(screen.getByText("Máy 3")).toBeInTheDocument();
    const countdown = screen.getByTestId("countdown");
    expect(countdown).toHaveAttribute("data-ends", "2026-11-02T00:00:00.000Z");
    expect(countdown).toHaveAttribute("data-server", "2026-11-01T00:00:00.000Z");
    expect(screen.getByRole("link", { name: /Xem tất cả/ })).toHaveAttribute("href", "/products?flashSale=true");
  });
});
