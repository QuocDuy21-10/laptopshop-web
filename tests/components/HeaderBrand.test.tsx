import { render } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { Header } from "@/components/layout/Header/Header";

vi.mock("@/features/products/server", () => ({
  getFilterOptions: () => Promise.resolve({ targetOptions: [] }),
}));
vi.mock("@/components/layout/AccountMenu/AccountMenu", () => ({ AccountMenu: () => null }));
vi.mock("@/components/layout/CartLink/CartLink", () => ({ CartLink: () => null }));
vi.mock("@/components/layout/MobileMenu/MobileMenu", () => ({ MobileMenu: () => null }));
vi.mock("@/components/layout/SearchForm/SearchForm", () => ({ SearchForm: () => null }));
vi.mock("@/features/notifications/NotificationBell/NotificationBell", () => ({ NotificationBell: () => null }));
vi.mock("@/components/layout/WishlistLink/WishlistLink", () => ({ WishlistLink: () => null }));

describe("Header brand", () => {
  it("uses the horizontal logo with the compact brand mark as its responsive fallback", async () => {
    const { container } = render(await Header());
    const brand = container.querySelector('a[href="/"]');

    expect(brand).toHaveAttribute("aria-label", "LaptopShop - Trang chủ");
    expect(brand?.querySelector('img[src="/brand/logo-horizontal.svg"]')).toBeInTheDocument();
    expect(brand?.querySelector('img[src="/brand/icon.svg"]')).toBeInTheDocument();
  });
});
