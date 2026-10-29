import { screen } from "@testing-library/react";
import { describe, expect, it, vi } from "vitest";
import { AdminShell } from "@/features/admin/AdminShell/AdminShell";
import { renderAdmin } from "../../utils";

vi.mock("antd", async () => {
  const actual = await vi.importActual<typeof import("antd")>("antd");
  return { ...actual, Grid: { useBreakpoint: () => ({ lg: true }) } };
});

vi.mock("next/navigation", () => ({
  usePathname: () => "/admin/notifications",
  useRouter: () => ({ replace: vi.fn(), refresh: vi.fn() }),
}));
vi.mock("@/features/account/useMe", () => ({ useMe: () => ({ data: { fullName: "Admin" } }) }));
vi.mock("@/features/auth/hooks", () => ({
  useLogout: () => ({ mutate: vi.fn(), isPending: false }),
}));

describe("AdminShell", () => {
  it("includes notification operations in admin navigation", () => {
    renderAdmin(
      <AdminShell>
        <main>Content</main>
      </AdminShell>,
    );
    expect(screen.getByText("Thông báo")).toBeInTheDocument();
  });

  it("uses the shared LaptopShop logo assets in the admin brand", () => {
    const { container } = renderAdmin(
      <AdminShell>
        <main>Content</main>
      </AdminShell>,
    );
    const brand = screen.getByRole("link", { name: "LaptopShop quản trị" });

    expect(brand.querySelector('img[src="/brand/logo-horizontal.svg"]')).toBeInTheDocument();
    expect(brand.querySelector('img[src="/brand/icon.svg"]')).toBeInTheDocument();
    expect(container.querySelectorAll('img[src^="/brand/"]')).toHaveLength(2);
  });
});
