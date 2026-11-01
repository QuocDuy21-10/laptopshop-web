import { beforeEach, describe, expect, it, vi } from "vitest";
import { render, screen } from "@testing-library/react";

import { CategoryNav } from "@/components/layout/CategoryNav/CategoryNav";

const nav = vi.hoisted(() => ({ pathname: "/", search: "" }));
vi.mock("next/navigation", () => ({
  usePathname: () => nav.pathname,
  useSearchParams: () => new URLSearchParams(nav.search),
}));

const targets = [
  { value: "GAMING", name: "Gaming" },
  { value: "SINHVIEN-VANPHONG", name: "Sinh viên - Văn phòng" },
];

const current = () => screen.queryAllByRole("link").filter((l) => l.getAttribute("aria-current") === "page");

describe("CategoryNav", () => {
  beforeEach(() => {
    nav.pathname = "/";
    nav.search = "";
  });

  it("marks nothing on pages outside the catalog", () => {
    render(<CategoryNav targets={targets} />);
    expect(current()).toHaveLength(0);
  });

  it("marks 'Tất cả laptop' on /products without a target", () => {
    nav.pathname = "/products";
    render(<CategoryNav targets={targets} />);
    expect(current().map((l) => l.textContent)).toEqual(["Tất cả laptop"]);
  });

  it("marks only the matching target", () => {
    nav.pathname = "/products";
    nav.search = "target=GAMING&page=2";
    render(<CategoryNav targets={targets} />);
    expect(current().map((l) => l.textContent)).toEqual(["Gaming"]);
  });

  it("marks the promotions link", () => {
    nav.pathname = "/promotions";
    render(<CategoryNav targets={targets} />);
    expect(current().map((l) => l.textContent)).toEqual(["Khuyến mãi"]);
  });

  it("links to warranties after promotions and marks the warranty page", () => {
    nav.pathname = "/account/warranties";
    render(<CategoryNav targets={targets} />);
    const warranty = screen.getByRole("link", { name: "Bảo hành" });
    expect(warranty).toHaveAttribute("href", "/account/warranties");
    expect(current()).toEqual([warranty]);
    expect(warranty.closest("li")?.previousElementSibling).toHaveTextContent("Khuyến mãi");
  });
});
