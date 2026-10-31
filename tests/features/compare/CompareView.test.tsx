import { beforeEach, describe, expect, it, vi } from "vitest";
import { QueryClientProvider } from "@tanstack/react-query";
import { screen, waitFor, within } from "@testing-library/react";
import userEvent from "@testing-library/user-event";

import { json, lastRequest, mockFetch, priceText, renderWithQuery } from "../../utils";
import type { Product } from "@/lib/api/types";
import { getCompareItems, toggleCompare } from "@/features/compare/store";
import { CompareView } from "@/features/compare/CompareView/CompareView";

const nav = vi.hoisted(() => ({
  search: "",
  router: { replace: vi.fn(), push: vi.fn() },
}));
vi.mock("next/navigation", () => ({
  useRouter: () => nav.router,
  useSearchParams: () => new URLSearchParams(nav.search),
  usePathname: () => "/compare",
}));

const product = (id: number, over: Partial<Product> = {}): Product => ({
  id,
  name: `Laptop ${id}`,
  price: 20_000_000,
  image: null,
  detailDesc: null,
  shortDesc: null,
  quantity: 5,
  sold: 0,
  factory: "ASUS",
  target: "GAMING",
  isActive: true,
  cpu: null,
  gpu: null,
  ramGb: null,
  storageGb: null,
  screenSizeInch: null,
  screenResolution: null,
  refreshRateHz: null,
  batteryWh: null,
  weightGrams: null,
  warrantyMonths: null,
  ...over,
});
const add = (id: number) => toggleCompare({ id, name: `Laptop ${id}`, image: null });

let fetchMock: ReturnType<typeof mockFetch>;
beforeEach(() => {
  localStorage.clear();
  vi.clearAllMocks();
  nav.search = "";
  fetchMock = mockFetch();
});

describe("CompareView", () => {
  it("shows the products in the requested order and marks the best values", async () => {
    nav.search = "ids=7,1";
    fetchMock.mockResolvedValue(
      json(200, {
        data: [
          product(7, { price: 15_000_000, ramGb: 8 }),
          product(1, { price: 20_000_000, ramGb: 16 }),
        ],
      }),
    );
    renderWithQuery(<CompareView />);

    const headers = await screen.findAllByRole("columnheader");
    expect(headers.map((h) => within(h).getByRole("link").textContent)).toEqual([
      "Laptop 7",
      "Laptop 1",
    ]);
    expect(new URL(lastRequest(fetchMock).url).searchParams.get("ids")).toBe("7,1");

    const ram = within(screen.getByRole("rowheader", { name: "RAM" }).closest("tr")!);
    expect(within(ram.getAllByRole("cell")[1]).getByText("Tốt nhất")).toBeInTheDocument();
    expect(within(ram.getAllByRole("cell")[0]).queryByText("Tốt nhất")).not.toBeInTheDocument();

    const price = within(screen.getByRole("rowheader", { name: "Giá" }).closest("tr")!);
    expect(within(price.getAllByRole("cell")[0]).getByText("Tốt nhất")).toBeInTheDocument();
  });

  it("drops products that are no longer sold", async () => {
    [1, 3, 5].forEach(add);
    nav.search = "ids=1,3,5";
    fetchMock.mockResolvedValue(
      json(404, { error: { code: "NOT_FOUND", message: "x", details: { missingIds: [3] } } }),
    );
    renderWithQuery(<CompareView />);

    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith("/compare?ids=1,5"));
    expect(getCompareItems().map((i) => i.id)).toEqual([1, 5]);
  });

  it("compares the promotion price shoppers see, not the list price", async () => {
    nav.search = "ids=1,2";
    fetchMock.mockResolvedValue(
      json(200, {
        data: [
          { ...product(1, { price: 20_000_000 }), salePrice: 17_000_000 },
          { ...product(2, { price: 19_000_000 }), salePrice: 19_000_000 },
        ],
      }),
    );
    renderWithQuery(<CompareView />);

    const row = await screen.findByRole("rowheader", { name: "Giá" });
    const [first, second] = within(row.closest("tr")!).getAllByRole("cell");
    expect(first).toHaveTextContent(priceText(17_000_000));
    expect(first).toHaveTextContent(priceText(20_000_000));
    expect(within(first).getByText("Tốt nhất")).toBeInTheDocument();
    expect(within(second).queryByText("Tốt nhất")).not.toBeInTheDocument();
  });

  it("hides the dropped notice once the URL moves to another list", async () => {
    nav.search = "ids=1,3,5";
    fetchMock.mockResolvedValue(
      json(404, { error: { code: "NOT_FOUND", message: "x", details: { missingIds: [3] } } }),
    );
    const notice = "Một số sản phẩm không còn bán đã được bỏ khỏi danh sách so sánh.";
    const { client, rerender } = renderWithQuery(<CompareView />);
    const navigate = (search: string) => {
      nav.search = search;
      rerender(
        <QueryClientProvider client={client}>
          <CompareView />
        </QueryClientProvider>,
      );
    };
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith("/compare?ids=1,5"));

    fetchMock.mockResolvedValue(json(200, { data: [product(1), product(5)] }));
    navigate("ids=1,5");
    expect(await screen.findByText(notice)).toBeInTheDocument();

    fetchMock.mockResolvedValue(json(200, { data: [product(2), product(4)] }));
    navigate("ids=2,4");
    await screen.findByRole("link", { name: "Laptop 2" });
    expect(screen.queryByText(notice)).not.toBeInTheDocument();
  });

  it("shows an error for an invalid list", async () => {
    nav.search = "ids=1,abc";
    fetchMock.mockResolvedValue(json(400, { error: { code: "VALIDATION_ERROR", message: "x" } }));
    renderWithQuery(<CompareView />);
    expect(await screen.findByRole("alert")).toHaveTextContent(
      "Vui lòng kiểm tra lại thông tin đã nhập.",
    );
  });

  it("asks for at least two products", () => {
    nav.search = "ids=1";
    renderWithQuery(<CompareView />);
    expect(screen.getByText("Chọn ít nhất 2 sản phẩm để so sánh")).toBeInTheDocument();
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens the saved list when the URL has no ids", async () => {
    add(2);
    add(4);
    renderWithQuery(<CompareView />);
    await waitFor(() => expect(nav.router.replace).toHaveBeenCalledWith("/compare?ids=2,4"));
  });

  it("removes a column", async () => {
    nav.search = "ids=7,1,2";
    fetchMock.mockResolvedValue(json(200, { data: [product(7), product(1), product(2)] }));
    renderWithQuery(<CompareView />);
    await userEvent.click(await screen.findByRole("button", { name: "Bỏ Laptop 1 khỏi so sánh" }));
    expect(nav.router.replace).toHaveBeenCalledWith("/compare?ids=7,2");
  });
});
