import { beforeEach, describe, expect, it, vi } from "vitest";
import { fireEvent, screen, waitFor } from "@testing-library/react";

import { json, mockFetch, renderWithQuery, urlOf } from "../utils";
import { addSearch } from "@/features/products/searchHistory";
import { SearchBox } from "@/components/layout/SearchBox/SearchBox";

const push = vi.hoisted(() => vi.fn());
vi.mock("next/navigation", () => ({ useRouter: () => ({ push }) }));

const product = (id: number) => ({ id, name: `Laptop ${id}`, price: 20_000_000, salePrice: null, image: null });

function setup() {
  const fetchMock = mockFetch();
  fetchMock.mockImplementation(async (input) =>
    urlOf(input).includes("/products") ? json(200, { data: [product(1), product(2)], meta: {} }) : json(200, {}),
  );
  renderWithQuery(<SearchBox />);
  return { fetchMock, input: screen.getByRole("combobox") };
}

describe("SearchBox", () => {
  beforeEach(() => {
    push.mockClear();
    window.localStorage.clear();
  });

  it("suggests products and a see-all row for the typed text", async () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "asus" } });

    expect(await screen.findByRole("option", { name: /Laptop 1/ })).toBeInTheDocument();
    expect(screen.getByRole("option", { name: /Xem tất cả kết quả cho "asus"/ })).toBeInTheDocument();
  });

  it("does not call the API for a single character", async () => {
    const { fetchMock, input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "a" } });

    await new Promise((r) => setTimeout(r, 400));
    expect(fetchMock).not.toHaveBeenCalled();
  });

  it("opens the highlighted product with the keyboard", async () => {
    const { input } = setup();
    fireEvent.focus(input);
    fireEvent.change(input, { target: { value: "asus" } });
    await screen.findByRole("option", { name: /Laptop 1/ });

    fireEvent.keyDown(input, { key: "ArrowDown" });
    fireEvent.submit(input.closest("form")!);

    expect(push).toHaveBeenCalledWith("/products/1");
  });

  it("submits the text as a search and remembers it", () => {
    const { input } = setup();
    fireEvent.change(input, { target: { value: "gaming rtx" } });
    fireEvent.submit(input.closest("form")!);

    expect(push).toHaveBeenCalledWith("/products?q=gaming%20rtx");
    expect(window.localStorage.getItem("recent-searches")).toContain("gaming rtx");
  });

  it("lists recent searches when empty and lets the user remove one", async () => {
    addSearch("dell");
    const { input } = setup();
    fireEvent.focus(input);

    expect(await screen.findByRole("option", { name: /dell/ })).toBeInTheDocument();
    fireEvent.click(screen.getByRole("button", { name: /Xóa "dell"/ }));
    await waitFor(() => expect(screen.queryByRole("option")).not.toBeInTheDocument());
  });

  it("focuses the field on Ctrl+K", () => {
    const { input } = setup();
    fireEvent.keyDown(window, { key: "k", ctrlKey: true });
    expect(input).toHaveFocus();
  });
});
