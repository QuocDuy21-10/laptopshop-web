import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductList } from "@/features/admin/products/ProductList";
import { json, mockFetch, priceText, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const FILTERS = { factoryOptions: [{ name: "Dell", value: "DELL" }], targetOptions: [{ name: "Doanh nhân", value: "DOANH-NHAN" }] };
const product = (id: number, name: string, quantity: number) => ({
  id, name, price: 30000000, image: null, detailDesc: "d", shortDesc: "s", quantity, sold: 4, factory: "DELL", target: "DOANH-NHAN", isActive: true,
});

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  nav.search = "";
  nav.push.mockClear();
  fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) => {
    const request = input as Request;
    const { pathname } = new URL(request.url);
    if (pathname === "/api/v1/products/filters") return json(200, { data: FILTERS });
    if (request.method === "DELETE") return json(409, { error: { code: "PRODUCT_IN_USE", message: "x" } });
    if (request.method === "PATCH") return json(200, { data: product(1, "Dell XPS", 3) });
    return json(200, { data: [product(1, "Dell XPS", 3), product(2, "Dell Latitude", 0)], meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 } });
  });
});

describe("ProductList", () => {
  it("lists products with price, stock state and factory label", async () => {
    renderAdmin(<ProductList />);
    expect(await screen.findByText("Dell XPS")).toBeInTheDocument();
    expect(screen.getAllByText(priceText(30000000))).toHaveLength(2);
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(await screen.findAllByText("Dell")).not.toHaveLength(0);
  });

  it("names the pagination arrows for screen readers", async () => {
    renderAdmin(<ProductList />);
    expect(await screen.findByRole("button", { name: "Trang trước" })).toBeInTheDocument();
    expect(screen.getByRole("button", { name: "Trang sau" })).toBeInTheDocument();
  });

  it("puts the search in the URL", async () => {
    renderAdmin(<ProductList />);
    await userEvent.type(screen.getByPlaceholderText("Tìm theo tên"), "xps{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/admin/products?q=xps");
  });

  it("puts the visibility and low-stock filters in the URL", async () => {
    renderAdmin(<ProductList />);
    await userEvent.click(screen.getByText("Đã ẩn"));
    expect(nav.push).toHaveBeenCalledWith("/admin/products?isActive=false");
    await userEvent.click(screen.getByRole("checkbox", { name: "Sắp hết hàng" }));
    expect(nav.push).toHaveBeenCalledWith("/admin/products?stock=low");
  });

  it("sends the URL filters to the API", async () => {
    nav.search = "isActive=false&stock=low";
    renderAdmin(<ProductList />);
    await screen.findByText("Dell XPS");
    const url = fetchMock.mock.calls
      .map(([i]) => new URL((i as Request).url))
      .find((u) => u.pathname === "/api/v1/admin/products");
    expect(url?.searchParams.get("isActive")).toBe("false");
    expect(url?.searchParams.get("stock")).toBe("low");
  });

  it("hides a product from its switch", async () => {
    renderAdmin(<ProductList />);
    await userEvent.click(await screen.findByRole("switch", { name: "Đang bán: Dell XPS" }));
    const patch = fetchMock.mock.calls.map(([i]) => i as Request).find((r) => r.method === "PATCH");
    expect(new URL(patch!.url).pathname).toBe("/api/v1/admin/products/1");
    expect((await patch!.formData()).get("isActive")).toBe("false");
    expect(await screen.findByText("Đã ẩn sản phẩm")).toBeInTheDocument();
  });

  it("explains why a product in orders cannot be deleted", async () => {
    renderAdmin(<ProductList />);
    await screen.findByText("Dell XPS");
    await userEvent.click(screen.getAllByRole("button", { name: "Xoá" })[0]);
    await userEvent.click(await screen.findByRole("button", { name: "Xác nhận xoá" }));
    expect(
      await screen.findByText("Sản phẩm đã có lịch sử đơn hàng hoặc kho nên không thể xoá. Hãy ẩn sản phẩm."),
    ).toBeInTheDocument();
  });
});
