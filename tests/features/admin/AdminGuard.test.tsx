import { screen } from "@testing-library/react";
import { describe, expect, it } from "vitest";
import { AdminGuard } from "@/features/admin/AdminGuard";
import { json, mockFetch, renderWithQuery } from "../../utils";

const me = (role: string) => ({
  data: { id: 1, username: "a@b.c", fullName: "A", address: null, phone: null, accountType: null, avatar: null, role, cartItemCount: 0 },
});

describe("AdminGuard", () => {
  it("shows 403 to non-admins", async () => {
    mockFetch().mockResolvedValue(json(200, me("USER")));
    renderWithQuery(<AdminGuard>bí mật</AdminGuard>);
    expect(await screen.findByText("Bạn không có quyền truy cập trang quản trị.")).toBeInTheDocument();
    expect(screen.queryByText("bí mật")).not.toBeInTheDocument();
  });

  it("renders children for admins", async () => {
    mockFetch().mockResolvedValue(json(200, me("ADMIN")));
    renderWithQuery(<AdminGuard>bí mật</AdminGuard>);
    expect(await screen.findByText("bí mật")).toBeInTheDocument();
  });
});
