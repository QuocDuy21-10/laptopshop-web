import { describe, expect, it, vi } from "vitest";
import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { renderWithQuery } from "../utils";
import HomePage from "@/app/(storefront)/page";
import { Header } from "@/components/layout/Header/Header";
import { MobileMenu } from "@/components/layout/MobileMenu/MobileMenu";

vi.mock("@/features/products/server", () => ({
  getFilterOptions: vi.fn().mockResolvedValue({ targetOptions: [{ name: "Gaming", value: "GAMING" }] }),
  listProducts: vi.fn().mockResolvedValue({ data: [], meta: { page: 1, pageSize: 8, total: 0, totalPages: 0 } }),
}));
vi.mock("@/features/store-info/server", () => ({ getStoreInfo: vi.fn().mockResolvedValue(null) }));
vi.mock("@/features/home/server", () => ({
  getHomeData: vi.fn().mockResolvedValue({
    banners: { hero: [], side: [] },
    options: null,
    targetImages: {},
    flashSale: [],
    bestsellers: [],
    reviews: null,
    storeInfo: null,
    renderedAt: "2026-11-01T00:00:00.000Z",
  }),
}));
vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn(), replace: vi.fn() }), usePathname: () => "/", useSearchParams: () => new URLSearchParams() }));

describe("advisor navigation", () => {
  it("shows the advisor link in desktop header", async () => {
    renderWithQuery(await Header());
    expect(screen.getByRole("link", { name: "Tư vấn chọn laptop" })).toHaveAttribute("href", "/advisor");
  });

  it("shows the advisor link in the mobile sheet and closes after navigation", async () => {
    renderWithQuery(<MobileMenu targets={[{ name: "Gaming", value: "GAMING" }]} />);
    await userEvent.click(screen.getByRole("button", { name: "Mở menu" }));
    const link = screen.getByRole("link", { name: "Tư vấn chọn laptop" });
    expect(link).toHaveAttribute("href", "/advisor");
    await userEvent.click(link);
    expect(screen.queryByRole("link", { name: "Tư vấn chọn laptop" })).not.toBeInTheDocument();
  });

  it("adds a homepage advisor CTA while keeping the product CTA", async () => {
    renderWithQuery(await HomePage());
    expect(screen.getByRole("link", { name: /Nhận gợi ý/ })).toHaveAttribute("href", "/advisor");
    expect(screen.getByRole("link", { name: "Xem tất cả laptop" })).toHaveAttribute("href", "/products");
  });
});
