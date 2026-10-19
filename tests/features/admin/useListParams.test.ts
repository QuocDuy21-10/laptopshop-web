import { act, renderHook } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { useListParams } from "@/features/admin/useListParams";

const nav = vi.hoisted(() => ({ push: vi.fn(), search: "" }));
vi.mock("next/navigation", () => ({
  useRouter: () => ({ push: nav.push }),
  usePathname: () => "/admin/products",
  useSearchParams: () => new URLSearchParams(nav.search),
}));

beforeEach(() => nav.push.mockClear());

describe("useListParams", () => {
  it("reads the page, falling back to 1", () => {
    nav.search = "page=abc";
    expect(renderHook(() => useListParams()).result.current.page).toBe(1);
    nav.search = "page=3";
    expect(renderHook(() => useListParams()).result.current.page).toBe(3);
  });

  it("resets the page and drops empty values when a filter changes", () => {
    nav.search = "page=3&q=dell&factory=ASUS";
    const { result } = renderHook(() => useListParams());
    act(() => result.current.set({ q: "", factory: "DELL" }));
    expect(nav.push).toHaveBeenCalledWith("/admin/products?factory=DELL");
  });

  it("keeps filters when only the page changes", () => {
    nav.search = "q=dell";
    const { result } = renderHook(() => useListParams());
    act(() => result.current.set({ page: 2 }));
    expect(nav.push).toHaveBeenCalledWith("/admin/products?q=dell&page=2");
  });
});
