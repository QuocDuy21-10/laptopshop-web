import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { getCompareItems } from "@/features/compare/store";
import { ProductCard } from "@/features/products/ProductCard/ProductCard";
import type { Product } from "@/lib/api/types";
import { renderWithQuery } from "../utils";

vi.mock("next/navigation", () => ({ useRouter: () => ({ push: vi.fn() }), usePathname: () => "/products" }));

const product: Product = {
  id: 3,
  name: "Laptop Asus TUF Gaming",
  price: 17_490_000,
  image: "/images/product/a.png",
  detailDesc: "d",
  shortDesc: "Intel Core i5 11400H",
  quantity: 5,
  sold: 0,
  factory: "ASUS",
  target: "GAMING",
  isActive: true, cpu: null, gpu: null, ramGb: null, storageGb: null, screenSizeInch: null, screenResolution: null, refreshRateHz: null, batteryWh: null, weightGrams: null, warrantyMonths: null,
};

beforeEach(() => localStorage.clear());

describe("ProductCard", () => {
  it("adds the product to the compare list", async () => {
    renderWithQuery(<ProductCard product={product} />);
    const toggle = screen.getByRole("button", { name: "So sánh Laptop Asus TUF Gaming" });
    expect(toggle).toHaveAttribute("aria-pressed", "false");
    await userEvent.click(toggle);
    expect(toggle).toHaveAttribute("aria-pressed", "true");
    expect(getCompareItems()).toEqual([
      { id: 3, name: "Laptop Asus TUF Gaming", image: "/images/product/a.png" },
    ]);
  });

  it("shows the decisive information for an in-stock product", () => {
    renderWithQuery(<ProductCard product={product} factoryName="Asus" />);
    expect(screen.getByRole("link", { name: "Laptop Asus TUF Gaming" })).toHaveAttribute("href", "/products/3");
    expect(screen.getByText("17.490.000 ₫")).toBeInTheDocument();
    expect(screen.getByText("Còn hàng")).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Thêm Laptop Asus TUF Gaming vào giỏ" })).toBeEnabled();
    expect(screen.getByRole("img", { name: "Laptop Asus TUF Gaming" })).toBeInTheDocument();
  });

  it("marks sold-out products and disables the action", () => {
    renderWithQuery(<ProductCard product={{ ...product, quantity: 0 }} />);
    expect(screen.getAllByText("Hết hàng").length).toBeGreaterThan(0);
    expect(screen.getByRole("button", { name: "Thêm Laptop Asus TUF Gaming vào giỏ" })).toBeDisabled();
  });
});
