import { screen, waitFor } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import type { CatalogProduct } from "@/lib/api/types";
import { json, mockFetch, renderWithQuery } from "../../utils";

vi.mock("@/features/products/ProductGrid/ProductGrid", () => ({
  ProductGrid: ({ products }: { products: CatalogProduct[] }) => (
    <ul>
      {products.map((p) => (
        <li key={p.id}>{p.name}</li>
      ))}
    </ul>
  ),
}));

const { BestsellerTabs } = await import("@/features/home/BestsellerTabs/BestsellerTabs");

const product = (id: number) => ({ id, name: `Máy ${id}` }) as unknown as CatalogProduct;
const tabs = [
  { value: "GAMING", name: "Gaming" },
  { value: "MONG_NHE", name: "Mỏng nhẹ" },
];

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async () =>
    json(200, { data: [product(9)], meta: { page: 1, pageSize: 8, total: 1, totalPages: 1 } }),
  );
});

const productCalls = () =>
  fetchMock.mock.calls.map(([i]) => new URL((i as Request).url)).filter((u) => u.pathname === "/api/v1/products");

describe("BestsellerTabs", () => {
  it("shows the server data for 'Tất cả' without calling the API", () => {
    renderWithQuery(<BestsellerTabs tabs={tabs} initialProducts={[product(1), product(2)]} options={null} />);
    expect(screen.getByRole("tab", { name: "Tất cả" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByText("Máy 1")).toBeInTheDocument();
    expect(productCalls()).toHaveLength(0);
    expect(screen.getByRole("link", { name: /Xem thêm/ })).toHaveAttribute("href", "/products?sort=sold_desc");
  });

  it("loads the best sellers of the selected need", async () => {
    renderWithQuery(<BestsellerTabs tabs={tabs} initialProducts={[product(1)]} options={null} />);
    await userEvent.click(screen.getByRole("tab", { name: "Gaming" }));
    expect(await screen.findByText("Máy 9")).toBeInTheDocument();
    const url = productCalls()[0];
    expect(url.searchParams.get("target")).toBe("GAMING");
    expect(url.searchParams.get("sort")).toBe("sold_desc");
    expect(url.searchParams.get("pageSize")).toBe("8");
    expect(screen.getByRole("link", { name: /Xem thêm/ })).toHaveAttribute(
      "href",
      "/products?sort=sold_desc&target=GAMING",
    );
  });

  it("moves between tabs with the arrow keys", async () => {
    renderWithQuery(<BestsellerTabs tabs={tabs} initialProducts={[product(1)]} options={null} />);
    screen.getByRole("tab", { name: "Tất cả" }).focus();
    await userEvent.keyboard("{ArrowRight}");
    expect(screen.getByRole("tab", { name: "Gaming" })).toHaveAttribute("aria-selected", "true");
    expect(screen.getByRole("tab", { name: "Gaming" })).toHaveFocus();
    await userEvent.keyboard("{ArrowLeft}{ArrowLeft}");
    expect(screen.getByRole("tab", { name: "Mỏng nhẹ" })).toHaveAttribute("aria-selected", "true");
  });

  it("fetches on the client and shows an error when the server load failed", async () => {
    fetchMock.mockImplementation(async () => json(500, { error: { code: "INTERNAL_ERROR", message: "x" } }));
    renderWithQuery(<BestsellerTabs tabs={tabs} initialProducts={null} options={null} />);
    expect(await screen.findByRole("alert")).toBeInTheDocument();
  });

  it("shows an empty state", async () => {
    renderWithQuery(<BestsellerTabs tabs={tabs} initialProducts={[]} options={null} />);
    await waitFor(() => expect(screen.getByText("Chưa có sản phẩm hiển thị")).toBeInTheDocument());
  });
});
