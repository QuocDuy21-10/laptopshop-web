import { render, screen } from "@testing-library/react";
import { beforeEach, describe, expect, it, vi } from "vitest";
import { AccountNav } from "@/components/layout/AccountNav/AccountNav";

const nav = vi.hoisted(() => ({ pathname: "/account" }));
vi.mock("next/navigation", () => ({ usePathname: () => nav.pathname }));

beforeEach(() => {
  nav.pathname = "/account";
});

describe("AccountNav", () => {
  it("marks only the profile tab on /account", () => {
    render(<AccountNav />);
    expect(screen.getByRole("link", { name: "Hồ sơ" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Đơn hàng" })).not.toHaveAttribute("aria-current");
  });

  it("keeps a section tab active on its sub pages", () => {
    nav.pathname = "/account/orders/12/payment";
    render(<AccountNav />);
    expect(screen.getByRole("link", { name: "Đơn hàng" })).toHaveAttribute("aria-current", "page");
    expect(screen.getByRole("link", { name: "Hồ sơ" })).not.toHaveAttribute("aria-current");
  });
});
