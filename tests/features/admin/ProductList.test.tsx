import { screen } from "@testing-library/react";
import userEvent from "@testing-library/user-event";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { ProductList } from "@/features/admin/products/ProductList";
import { formatVnd } from "@/lib/format";
import { json, mockFetch, renderAdmin } from "../../utils";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const FILTERS = { factoryOptions: [{ name: "Dell", value: "DELL" }], targetOptions: [{ name: "Doanh nhân", value: "DOANH-NHAN" }] };
const product = (id: number, name: string, quantity: number) => ({
  id, name, price: 30000000, image: null, detailDesc: "d", shortDesc: "s", quantity, sold: 4, factory: "DELL", target: "DOANH-NHAN",
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
    return json(200, { data: [product(1, "Dell XPS", 3), product(2, "Dell Latitude", 0)], meta: { page: 1, pageSize: 10, total: 2, totalPages: 1 } });
  });
});

describe("ProductList", () => {
  it("lists products with price, stock state and factory label", async () => {
    renderAdmin(<ProductList />);
    expect(await screen.findByText("Dell XPS")).toBeInTheDocument();
    expect(screen.getAllByText(formatVnd(30000000))).toHaveLength(2);
    expect(screen.getByText("Hết hàng")).toBeInTheDocument();
    expect(await screen.findAllByText("Dell")).not.toHaveLength(0);
  });

  it("puts the search in the URL", async () => {
    renderAdmin(<ProductList />);
    await userEvent.type(screen.getByPlaceholderText("Tìm theo tên"), "xps{Enter}");
    expect(nav.push).toHaveBeenCalledWith("/admin/products?q=xps");
  });

  it("explains why a product in orders cannot be deleted", async () => {
    renderAdmin(<ProductList />);
    await screen.findByText("Dell XPS");
    await userEvent.click(screen.getAllByRole("button", { name: "Xoá" })[0]);
    await userEvent.click(await screen.findByRole("button", { name: "Xác nhận xoá" }));
    expect(
      await screen.findByText("Sản phẩm đã có trong đơn hàng nên không thể xoá. Hãy ẩn sản phẩm."),
    ).toBeInTheDocument();
  });
});
